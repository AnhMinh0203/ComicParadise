import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class notificationService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri =`${environment.apiUrl}/Notification`;
  }

  getNotifications(userID: any) {
    var apiUrl = `${this.serviceUri}/Get-notifications?userID=${userID}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  turnOffNotifications(notificationID: any) {
    var apiUrl = `${this.serviceUri}/Turn-off-notifications?notificationID=${notificationID}`;
    return this.http.post(apiUrl,notificationID)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  updateIsReadStatus(isReadNotifications: any) {
    var apiUrl = `${this.serviceUri}/Update-is-read-status`;
    return this.http.post(apiUrl,isReadNotifications)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }
}
