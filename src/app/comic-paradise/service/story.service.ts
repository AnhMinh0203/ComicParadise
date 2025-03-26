import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class storyService {
  private searchStoriesSubject = new BehaviorSubject<any[]>([]);
  searchStories$ = this.searchStoriesSubject.asObservable();


  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri = `${environment.apiUrl}/Story`;
  }

  getCurrentUpdateStories(days: number) {
    var apiUrl = `${this.serviceUri}/Get-current-update-story?days=${days}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getTopStories(topType: any) {
    var apiUrl = `${this.serviceUri}/Get-top-story?topType=${topType}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getAdvanceStories(userID: any) {
    var apiUrl = `${this.serviceUri}/Get-advance-story?userID=${userID}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  // getStories() {
  //   var apiUrl = `${this.serviceUri}/Get-all-stories`;
  //   return this.http.get(apiUrl)
  //     .pipe(
  //       catchError((error: any) => {
  //         throw error;
  //       })
  //     );
  // }

  getStoryById(storyID: number) {
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
  setSearchStories(stories: any[]) {
    this.searchStoriesSubject.next(stories);
  }

  likeStory(userID: any, storyID: any) {
    const apiUrl = `${this.serviceUri}/Like-story?userID=${userID}&storyID=${storyID}`;
    return this.http.post(apiUrl, null)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  likeStories(model:any) {
    const apiUrl = `${this.serviceUri}/Like-stories`;
    return this.http.post(apiUrl, model)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  checkIsLikeStory(userID: any, storyID: any) {
    const apiUrl = `${this.serviceUri}/Check-is-liked?userID=${userID}&storyID=${storyID}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getFavoriteStories(userID: number) {
    const apiUrl = `${this.serviceUri}/Get-favorite-stories?userID=${userID}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }
}
