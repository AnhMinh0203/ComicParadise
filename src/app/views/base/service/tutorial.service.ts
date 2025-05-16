import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class tutorialService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri =`${environment.apiUrl}/Tutorial`;
  }

  addTutorial(tutorial: any) {
    var apiUrl = `${this.serviceUri}/Add-tutorial`;
    return this.http.post(apiUrl, tutorial)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getTutorialTitles(){
    var apiUrl = `${this.serviceUri}/Get-tutorial-titles`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  getContentByTitle(title: string) {
    const apiUrl = `${this.serviceUri}/Get-content-by-title?title=${title}`;
    return this.http.post(apiUrl, { title }) // gửi theo dạng object
    .pipe(
      catchError((error: any) => {
        throw error;
      })
    );
  }

  getAllTutorials() {
    const apiUrl = `${this.serviceUri}/Get-all-tutorials`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  updateTutorial(mdodel: any) {
    const apiUrl = `${this.serviceUri}/Update-tutorial`;
    return this.http.post(apiUrl, mdodel) // gửi theo dạng object
    .pipe(
      catchError((error: any) => {
        throw error;
      })
    );
  }

  deleteTutorial(tutorialID: number) {
    const apiUrl = `${this.serviceUri}/Delete-tutorial?tutorialID=${tutorialID}`;
    return this.http.delete(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }
}
