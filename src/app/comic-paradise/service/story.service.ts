import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class storyService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri =`${environment.apiUrl}/Story`;
  }

  getCurrentUpdateStories(days: number){
    var apiUrl = `${this.serviceUri}/Get-current-update-story?days=${days}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getStories() {
    var apiUrl = `${this.serviceUri}/Get-all-stories`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getStoryById(storyID:number){
    const apiUrl = `${this.serviceUri}/Get-story-by-id?storyID=${storyID}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  searchStories(title: string): Observable<any> {
    return this.http.get(`${this.serviceUri}/Search-stories?title=${title}`);
  }
}
