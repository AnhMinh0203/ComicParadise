import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class bannerContentService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri =`${environment.apiUrl}/Banner`;
  }

  addBanner(model: any) {
    var apiUrl = `${this.serviceUri}/Add-banner`;
    return this.http.post(apiUrl,model)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getBanners(){
    var apiUrl = `${this.serviceUri}/Get-banners`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }
}
