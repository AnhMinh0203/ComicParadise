import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class chapterService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri = `${environment.apiUrl}/Chapter`;
  }

  getNextChapterNumber(storyID:number){
    var apiUrl = `${this.serviceUri}/Get-next-chapter-number?storyID=${storyID}`;
    return this.http.get(apiUrl);
  }

  getChapterContent(storyId: number, chapterNumber: number, userID: any): Observable<any> {
    var apiUrl = `${this.serviceUri}/Get-chapter-content?storyID=${storyId}&chapterNumber=${chapterNumber}&userID=${userID}`;
    return this.http.get(apiUrl);
  }

  getChaptersByStoryID(storyID:number){
    var apiUrl = `${this.serviceUri}/Get-chapters-by-storyID?storyID=${storyID}`;
    return this.http.get(apiUrl);
  }
}
