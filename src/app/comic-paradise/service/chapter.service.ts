import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
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

  getChapterContent(storyId: number, chapterNumber: number, currentUserId: any): Observable<any> {
    var apiUrl = `${this.serviceUri}/Get-chapter-content?storyID=${storyId}&chapterNumber=${chapterNumber}&userID=${currentUserId}`;
    return this.http.get(apiUrl);
  }

  getChaptersByStoryID(storyID: number) {
    var apiUrl = `${this.serviceUri}/Get-chapters-by-storyID?storyID=${storyID}`;
    return this.http.get(apiUrl);
  }

  postChapter(chapter: any): Observable<any> {
    const apiUrl = `${this.serviceUri}/Post-chapter`;
    const formData = new FormData();

    formData.append('StoryID', chapter.StoryID.toString());
    formData.append('ChapterNumber', chapter.ChapterNumber.toString());
    formData.append('Title', chapter.Title);
    formData.append('StoryType', chapter.StoryType);
    formData.append('CreatedBy', chapter.CreatedBy.toString());

    if (chapter.StoryType === 'Manga' && chapter.ImageFiles?.length > 0) {
      chapter.ImageFiles.forEach((file: File) => {
        formData.append('ImageFiles', file);
      });
    }

  if (chapter.StoryType === 'Novel') {
    formData.append('Content', chapter.Content);
  }

    return this.http.post(apiUrl, formData);
  }


  getChapterPageByPageNumber(storyID: number, chapterID: number, pageNumber: number): Observable<any> {
    var apiUrl = `${this.serviceUri}/Get-chapter-page-by-page-number?storyID==${storyID}&chapterID=${chapterID}&pageNumber=${pageNumber}`;
    return this.http.get(apiUrl);
  }

  deleteChapterPage(storyId: number, chapterNumber: number, pageNumber: number): Observable<any> {
    return this.http.delete(`${this.serviceUri}/Delete-chapter-page?storyID=${storyId}&chapterNumber=${chapterNumber}&chapterPage=${pageNumber}`);
  }

  replaceChapterPage(model: any): Observable<any> {
    const formData = new FormData();
    formData.append('storyID', model.storyID);
    formData.append('chapterNumber', model.chapterNumber);
    formData.append('chapterPage', model.chapterPage);
    formData.append('newPage', model.file);
    return this.http.post(`${this.serviceUri}/Replace-chapter-page?storyID=${model.storyId}&chapterNumber=${model.chapterNumber}&chapterPage=${model.pageNumber}`, formData);
  }

  addChapterPage(model: any): Observable<any> {
    const formData = new FormData();
    formData.append('storyID', model.storyID);
    formData.append('chapterNumber', model.chapterNumber);
    if (model.chapterPage) formData.append('chapterPage', model.chapterPage);
    formData.append('newPage', model.file);
    return this.http.post(`${this.serviceUri}/Add-chapter-page?storyID=${model.storyId}&chapterNumber=${model.chapterNumber}`, formData);
  }
}
