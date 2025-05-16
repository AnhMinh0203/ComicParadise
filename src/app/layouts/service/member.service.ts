import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class memberService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri = `${environment.apiUrl}/Member`;
  }

  updateMember(member: any) {
    var apiUrl = `${this.serviceUri}/Update-member`;
    return this.http.post(apiUrl, member)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getReadingHistories(memberID: any) {
    var apiUrl = `${this.serviceUri}/Get-reading-histories?userID=${memberID}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getReadingHistoriesByRange(memberID: any, range: any) {
    var apiUrl = `${this.serviceUri}/Get-reading-histories-by-range?userID=${memberID}&range=${range}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getMemberById(memberID: any) {
    var apiUrl = `${this.serviceUri}/Get-member-by-id?userID=${memberID}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  deleteReadingHistory(userID: any, storyID: any) {
    let apiUrl = `${this.serviceUri}/Delete-reading-history?userID=${userID}`;
    if (storyID !== null && storyID !== undefined) {
      apiUrl += `&storyID=${storyID}`;
    }

    return this.http.delete(apiUrl).pipe(
      catchError((error: any) => {
        throw error;
      })
    );
  }
}
