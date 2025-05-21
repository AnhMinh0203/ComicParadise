import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject, switchMap, catchError, filter, take, finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/Authen`;

  private isRefreshing = false;
  private refreshToken$ = new BehaviorSubject<string | null>(null);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    const authReq = token ? this.addToken(req, token) : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken || refreshToken.trim() === '') {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshToken$.next(null);

      return this.http.post<any>(`${this.apiUrl}/Refresh-token`, { refreshToken }).pipe(
        switchMap(res => {
          const { token: newToken, refreshToken: newRefreshToken } = res || {};
          if (newToken && newRefreshToken) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            this.refreshToken$.next(newToken);
            return next.handle(this.addToken(req, newToken));
          }
          this.logout();
          return throwError(() => new Error('Invalid refresh response'));
        }),
        catchError(() => {
          this.logout();
          return throwError(() => new Error('Refresh failed'));
        }),
        finalize(() => this.isRefreshing = false)
      );
    } else {
      return this.refreshToken$.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(newToken => next.handle(this.addToken(req, newToken!)))
      );
    }
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  private logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
