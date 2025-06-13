import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class storyService {
  private searchStoriesSubject = new BehaviorSubject<any[]>([]);
  private filterStoryByConditionsSubject = new BehaviorSubject<any[]>([]);
  private filterStoryByCategoriesSubject = new BehaviorSubject<any[]>([]);

  searchStories$ = this.searchStoriesSubject.asObservable();
  filterStoryByConditions$ = this.filterStoryByConditionsSubject.asObservable();
  filterStoryByCategories$ = this.filterStoryByCategoriesSubject.asObservable();

  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri = `${environment.apiUrl}/Story`;
  }

  getCurrentUpdateStories(days: number, pageIndex: number , pageSize: number ) {
    var apiUrl = `${this.serviceUri}/Get-current-update-story?days=${days}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getTopStories(topType: any, pageIndex: number, pageSize: number) {
    var apiUrl = `${this.serviceUri}/Get-top-story?topType=${topType}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getAdvanceStories(userID: any , pageIndex: number, pageSize: number) {
    var apiUrl = `${this.serviceUri}/Get-advance-story?userID=${userID}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
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

  filterStoryByConditions(conditions: any): Observable<any> {
    const apiUrl = `${this.serviceUri}/Filter-story-by-conditions`;
    return this.http.post(apiUrl, conditions)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  filterStoryByCategories(categories: any): Observable<any> {
    const apiUrl = `${this.serviceUri}/Filter-story-by-categories`;
    return this.http.post(apiUrl, categories)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  filterStoryByCategoryName(categoryName: any) {
    const apiUrl = `${this.serviceUri}/Filter-story-by-category-name?categoryName=${categoryName}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  setSearchStories(stories: any[]) {
    this.searchStoriesSubject.next(stories);
  }

  setFilterStoryByConditions(stories: any[]) {
    this.filterStoryByConditionsSubject.next(stories);
  }

  setFilterStoryByCategories(stories: any[]) {
    this.filterStoryByCategoriesSubject.next(stories);
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

  ratingStory(model:any){
    const apiUrl = `${this.serviceUri}/Rating-story`;
    return this.http.post(apiUrl, model)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getUserRating( storyID: any ,userID: any) {
    const apiUrl = `${this.serviceUri}/Get-user-rating?storyID=${storyID}&userID=${userID}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getStoryRating(storyID: any) {
    const apiUrl = `${this.serviceUri}/Get-story-rating?storyID=${storyID}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getNovelStories(pageIndex: number, pageSize: number) {
    const apiUrl = `${this.serviceUri}/Get-novel-stories?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }
}
