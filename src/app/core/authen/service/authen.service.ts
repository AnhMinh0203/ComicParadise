import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthenService {
  apiUrl = `${environment.apiUrl}/Authen`;
  constructor(private http: HttpClient) { }

  login(model: any) {
    return this.http.post(`${this.apiUrl}/Login`, model)
    .pipe(
      catchError((error: any) => {
        throw error;
      })
    );
  }

  register(model:any){
    return this.http.post(`${this.apiUrl}/Register`, model)
    .pipe(
      catchError((error: any) => {
        throw error;
      })
    );
  }

  requestPasswordReset(email:any){
    return this.http.post(`${this.apiUrl}/Request-password-reset?email=${email}`, null)
    .pipe(
      catchError((error: any) => {
        throw error;
      })
    );
  }

  resetPassword(model:any){
    return this.http.post(`${this.apiUrl}/Reset-password?rawToken=${model.rawToken}&newPassword=${model.newPassword}`, null)
    .pipe(
      catchError((error: any) => {
        throw error;
      })
    );
  }

  changePassword(model:any){
    return this.http.post(`${this.apiUrl}/Change-password`, model)
    .pipe(
      catchError((error: any) => {
        throw error;
      })
    );
  }
}
