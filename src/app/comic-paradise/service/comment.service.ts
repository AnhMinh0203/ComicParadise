import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class commentService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri = `${environment.apiUrl}/Comment`;
  }

  postComment(comment: any) {
    var apiUrl = `${this.serviceUri}/Post-comment`;
    return this.http.post(apiUrl, comment)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  updateReaction(reaction: any) {
    var apiUrl = `${this.serviceUri}/Update-reaction`;
    return this.http.post(apiUrl, reaction)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  updateStatusComment(commentStatus: any) {
    var apiUrl = `${this.serviceUri}/Update-status-comment`;
    return this.http.post(apiUrl, commentStatus)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  deleteComment(commentID: number) {
    var apiUrl = `${this.serviceUri}/Delete-comment?commentID=${commentID}`;
    return this.http.delete(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getCommentsByStoryID(storyID:number){
    var apiUrl = `${this.serviceUri}/Get-comments-by-storyID?storyID=${storyID}`;
    return this.http.get(apiUrl);
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

  // updateStatus (status: string, commentID: number){
  //   const apiUrl = `${this.serviceUri}/Update-status?status=${status}&commentID=${commentID}`;
  //   return this.http.post(apiUrl,null)
  //     .pipe(
  //       catchError((error: any) => {
  //         throw error;
  //       })
  //     );
  // }

  // getcommentById(commentID:number){
  //   const apiUrl = `${this.serviceUri}/Get-Comment-by-id?commentID=${commentID}`;
  //   return this.http.get(apiUrl)
  //     .pipe(
  //       catchError((error: any) => {
  //         throw error;
  //       })
  //     );
  // }
}
