import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
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

  getAllMembers() {
    var apiUrl = `${this.serviceUri}/Get-all-members`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  addMember(member: any) {
    var apiUrl = `${this.serviceUri}/Add-member`;
    return this.http.post(apiUrl, member)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  exportExcel() {
    var apiUrl = `${this.serviceUri}/Export-excel-member`;
    return this.http.get(apiUrl, { responseType: 'blob' });
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

  deleteMember(memberID: any) {
    var apiUrl = `${this.serviceUri}/Delete-member?userID=${memberID}`;
    return this.http.delete(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }
}
