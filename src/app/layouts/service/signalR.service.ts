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

  // Đăng ký theo dõi truyện
  // async followStory(userId: string, storyId: number): Promise<void> {
  //   try {
  //     await this.hubConnection.invoke('FollowStory', userId, storyId);
  //     console.log(`User ${userId} followed story ${storyId}`);
  //   } catch (err) {
  //     console.error('Error following story:', err);
  //   }
  // }

  // Hủy theo dõi truyện
  // async unfollowStory(userId: string, storyId: number): Promise<void> {
  //   try {
  //     await this.hubConnection.invoke('UnfollowStory', userId, storyId);
  //     console.log(`User ${userId} unfollowed story ${storyId}`);
  //   } catch (err) {
  //     console.error('Error unfollowing story:', err);
  //   }
  // }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
