import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private _connectionId: string = '';

  public startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.url}/upload-hub`)
      .withAutomaticReconnect()
      .build();

    return this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connected');
        this.hubConnection.invoke('GetConnectionId').then((id: string) => {
          this._connectionId = id;
          console.log('connectionId: ', id);
        });
      })
      .catch(err => console.error('SignalR connection error: ', err));
  }

  public get connectionId(): string {
    return this._connectionId;
  }

  public onUploadProgress(callback: (data: any) => void): void {
    this.hubConnection.on('ReceiveUploadProgress', callback);
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => {
        console.log('SignalR disconnected');
      });
    }
  }
}
