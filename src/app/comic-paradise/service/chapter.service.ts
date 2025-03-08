import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class chapterService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri = `${environment.apiUrl}/Chapter`;
  }

  getChapterContent(storyId: number, chapterNumber: number): Observable<any> {
    var apiUrl = `${this.serviceUri}/Get-chapter-content?storyID=${storyId}&chapterID=${chapterNumber}`;
    return this.http.get(apiUrl);
  }

  // updateStatus(status: string, storyID: number) {
  //   const apiUrl = `${this.serviceUri}/Update-status?status=${status}&storyID=${storyID}`;
  //   return this.http.post(apiUrl, null);
  // }
}
