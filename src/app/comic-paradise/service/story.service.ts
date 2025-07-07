import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class storyService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri = `${environment.apiUrl}/Story`;
  }

  addStory(formData: FormData): Observable<HttpEvent<any>> {
    const apiUrl = `${this.serviceUri}/Add-story`;
    const req = new HttpRequest('POST', apiUrl, formData, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }

  getMyStories(userID: any) {
    var apiUrl = `${this.serviceUri}/Get-all-stories?userID=${userID}`;
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

  getPendingStories(storyStatus: any) {
    var apiUrl = `${this.serviceUri}/Get-all-stories?storyStatus=${storyStatus}`;
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

  updateStory(model: any){
    const apiUrl = `${this.serviceUri}/Update-story`;
    return this.http.post(apiUrl, model)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  deleteStory(storyID: number): Observable<any> {
    return this.http.delete(`${this.serviceUri}/Delete-story?storyID=${storyID}`);
  }

  searchStories(title: string): Observable<any> {
    return this.http.get(`${this.serviceUri}/Search-stories?title=${title}`);
  }
}
