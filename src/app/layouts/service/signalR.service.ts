import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private notificationSubject = new Subject<any>();
  private systemNotificationSubject = new Subject<any>();
  public notification$ = this.notificationSubject.asObservable();
  public systemNotification$ = this.systemNotificationSubject.asObservable();

  async startConnection(userId: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.url}/notificationHub`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveNotification', (notification: any) => {
      console.log("Received notification:", notification);
      this.notificationSubject.next(notification);
    });

    try {
      await this.hubConnection.start();
      try {
        await this.hubConnection.invoke('RegisterUser', userId);
      } catch (err) {
        return console.error('Error registering user:', err);
      }
    }
    catch (ex) {
      console.error('SignalR Connection Error:', ex);
      throw ex;
    }
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
