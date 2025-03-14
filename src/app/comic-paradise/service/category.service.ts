import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class categoryService {
  serviceUri: any;
  constructor(private http: HttpClient) {
    this.serviceUri =`${environment.apiUrl}/Category`;
  }

  getCategories() {
    var apiUrl = `${this.serviceUri}/Get-all-categories`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  searchCategories(searchKey: string) {
    var apiUrl = `${this.serviceUri}/Search-categories?categoryName=${searchKey}`;
    return this.http.get(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  addCategory(category: any) {
    var apiUrl = `${this.serviceUri}/Add-category`;
    return this.http.post(apiUrl, category)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  updateCategory(category: any) {
    var apiUrl = `${this.serviceUri}/Update-category`;
    return this.http.post(apiUrl, category)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }

  deleteCategory(categoryID: number) {
    var apiUrl = `${this.serviceUri}/Delete-category?categoryID=${categoryID}`;
    return this.http.delete(apiUrl)
      .pipe(
        catchError((error: any) => {
          throw error;
        })
      );
  }
}
