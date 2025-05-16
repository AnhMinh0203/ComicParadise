import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class footerContentService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri =`${environment.apiUrl}/FooterContent`;
  }

  getFooterContents(){
    var apiUrl = `${this.serviceUri}/Get-footer-contents`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  updateFooterStatus(model: any) {
    var apiUrl = `${this.serviceUri}/Update-status-footer?footerContentID=${model.footerContentID}`;
    return this.http.post(apiUrl,model)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  addFooterContent(model: any) {
    var apiUrl = `${this.serviceUri}/Add-footer-content`;
    return this.http.post(apiUrl,model)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  updateFooterContent(model: any) {
    var apiUrl = `${this.serviceUri}/Update-footer-content`;
    return this.http.post(apiUrl,model)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  deleteFooterContent(footerContentID: any) {
    var apiUrl = `${this.serviceUri}/Delete-footer-content?footerContentID=${footerContentID}`;
    return this.http.delete(apiUrl,{})
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

}
