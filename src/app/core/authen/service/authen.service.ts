import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthenService {
  private apiUrl = `${environment.apiUrl}/Authen`;
  constructor(private http: HttpClient) { }

  login(model: any) {
    return this.http.post(`${this.apiUrl}/Login`, model)
    .pipe(
      catchError((error: any) => {
        throw error;
      })
    );
  }
}
