import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri =`${environment.apiUrl}/Chatbot`;
  }

  sendMessage(request: any): Observable<any> {
    const apiUrl = `${this.serviceUri}/Process-user-question`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(apiUrl, request, { headers }).pipe(
      catchError((error: any) => {
        console.error('Lỗi khi gọi chatbot:', error);
        return throwError(() => error);
      })
    );
  }
}
