import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
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

  addStory(model: any) {
    var apiUrl = `${this.serviceUri}/Add-story`;
    return this.http.post(apiUrl, model)
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

  updateStatus (status: string, storyID: number){
    const apiUrl = `${this.serviceUri}/Update-status?status=${status}&storyID=${storyID}`;
    return this.http.post(apiUrl,null)
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
}
