import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class reportService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri =`${environment.apiUrl}/StatisticalReport`;
  }

  getReportStory() {
    var apiUrl = `${this.serviceUri}/Get-report-story`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  searchReportStory(title: string) {
    var apiUrl = `${this.serviceUri}/Search-report-story?title=${title}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  exportStoryReportExcel() {
    var apiUrl = `${this.serviceUri}/Export-report-story-excel`;
    return this.http.get(apiUrl, { responseType: 'blob' });
  }

  exportMemberReportExcel() {
    var apiUrl = `${this.serviceUri}/Export-report-member-excel`;
    return this.http.get(apiUrl, { responseType: 'blob' });
  }

  getTotalStories(){
    var apiUrl = `${this.serviceUri}/Get-total-stories`;
    return this.http.get(apiUrl);
  }
  getTotalMembers(){
    var apiUrl = `${this.serviceUri}/Get-total-members`;
    return this.http.get(apiUrl);
  }
  getTotalCategories(){
    var apiUrl = `${this.serviceUri}/Get-total-categories`;
    return this.http.get(apiUrl);
  }

  getChartReportStory (typeReport:string){
    var apiUrl = `${this.serviceUri}/Get-chart-story-report?type=${typeReport}`;
    return this.http.get(apiUrl);
  }

  getChartReportMember (typeReport:string){
    var apiUrl = `${this.serviceUri}/Get-chart-member-report?type=${typeReport}`;
    return this.http.get(apiUrl);
  }
}
