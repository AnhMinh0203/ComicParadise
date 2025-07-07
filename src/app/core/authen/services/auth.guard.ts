import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { getAccessToken } from '../../../core/helpers/token-helper';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = getAccessToken();

    if (!token) {
      return this.redirectToLogin();
    }

    try {
      const { exp } = jwtDecode<any>(token);
      if (!exp || Date.now() >= exp * 1000) {
        return this.redirectToLogin();
      }
      return true;

    } catch (error) {
      console.warn('Token decode failed:', error);
      return this.redirectToLogin();
    }
  }

  private redirectToLogin(): boolean {
    this.router.navigate(['/login']);
    return false;
  }
}
