import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class chapterService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri = `${environment.apiUrl}/Chapter`;
  }

  getNextChapterNumber(storyID: number) {
    var apiUrl = `${this.serviceUri}/Get-next-chapter-number?storyID=${storyID}`;
    return this.http.get(apiUrl);
  }

  getChapterContent(storyId: number, chapterNumber: number, userID?: any): Observable<any> {
    let apiUrl = `${this.serviceUri}/Get-chapter-content?storyID=${storyId}&chapterNumber=${chapterNumber}`;
    if (userID != null) {
      apiUrl += `&userID=${userID}`;
    }
    return this.http.get(apiUrl);
  }


  getChaptersByStoryID(storyID: number) {
    var apiUrl = `${this.serviceUri}/Get-chapters-by-storyID?storyID=${storyID}`;
    return this.http.get(apiUrl);
  }

  markChapter(model: any) {
    var apiUrl = `${this.serviceUri}/Mark-chapter`;
    return this.http.post(apiUrl, model)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  isChapterBookmarked(model: any) {
    var apiUrl = `${this.serviceUri}/Is-bookmarked`;
    return this.http.post(apiUrl, model)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getMarkChapter(userID: any, storyID: any) {
    var apiUrl = `${this.serviceUri}/Get-mark-chapter?userID=${userID}&storyID=${storyID}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getChapterList(storyID: number) {
    var apiUrl = `${this.serviceUri}/Get-chapter-list?storyID=${storyID}`;
    return this.http.get<number[]>(apiUrl).pipe(
      catchError((error: any) => {
        console.error('Error in getChapterList: ', error);
        throw error;
      })
    );
  }
}
