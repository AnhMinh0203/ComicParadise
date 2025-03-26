import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private notificationSubject = new Subject<any>();
  public notification$ = this.notificationSubject.asObservable();

  startConnection(userId: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.url}/notificationHub`) // Thay bằng URL server thực tế
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveNotification', (message: any) => {
      this.notificationSubject.next(message);
    });

    return this.hubConnection.start()
      .then(() => console.log('SignalR Connection Started'))
      .catch(err => { throw err; });
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
