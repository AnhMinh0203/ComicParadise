import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private notificationFormSubject = new Subject<void>();
  private updateMemberFormSubject = new Subject<void>();
  private favoriteStoriesFormSubject = new Subject<void>();
  private historyStoriesFormSubject = new Subject<void>();
  private logoutSubject = new Subject<void>();

  updateMemberForm$ = this.updateMemberFormSubject.asObservable();
  favoriteStoriesFormSubject$ = this.favoriteStoriesFormSubject.asObservable();
  historyStoriesFormSubject$ = this.historyStoriesFormSubject.asObservable();
  notificationFormSubject$ = this.notificationFormSubject.asObservable();
  logoutSubject$ = this.logoutSubject.asObservable();

  triggerUpdateMemberForm() {
    this.updateMemberFormSubject.next();
  }

  triggeFavoriteStoriesForm() {
    this.favoriteStoriesFormSubject.next();
  }

  triggeHistoryStoriesForm() {
    this.historyStoriesFormSubject.next();
  }

  triggeNotificationForm() {
    this.notificationFormSubject.next();
  }

  logout(){
    this.logoutSubject.next();
  }
}
