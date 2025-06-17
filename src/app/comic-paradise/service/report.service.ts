import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ReportService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri = `${environment.apiUrl}/Report`;
  }

  createReport(report: any) {
    var apiUrl = `${this.serviceUri}/Create-report`;
    return this.http.post(apiUrl, report)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }
}
