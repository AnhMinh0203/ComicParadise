import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private notificationFormSubject = new Subject<void>();
  private updateMemberFormSubject = new Subject<void>();
  private favoriteStoriesFormSubject = new Subject<void>();
  private historyStoriesFormSubject = new Subject<void>();
  private logoutSubject = new Subject<void>();
  private unreadCountSource = new BehaviorSubject<number>(0);
  private loadNotifications = new Subject<void>();
  private openCategoryDialogSubject = new Subject<void>();
  private openFilterDialogSubject = new Subject<void>();

  updateMemberForm$ = this.updateMemberFormSubject.asObservable();
  favoriteStoriesFormSubject$ = this.favoriteStoriesFormSubject.asObservable();
  historyStoriesFormSubject$ = this.historyStoriesFormSubject.asObservable();
  notificationFormSubject$ = this.notificationFormSubject.asObservable();
  logoutSubject$ = this.logoutSubject.asObservable();
  unreadCount$ = this.unreadCountSource.asObservable();
  loadNotifications$ = this.loadNotifications.asObservable();
  openCategoryDialog$ = this.openCategoryDialogSubject.asObservable();
  openFilterDialogSubject$ = this.openFilterDialogSubject.asObservable();

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

  updateUnreadCount(count: number) {
    this.unreadCountSource.next(count);
  }

  loadNotificationsEvent (){
    this.loadNotifications.next();
  }

  openCategoryDialog() {
    this.openCategoryDialogSubject.next();
  }

  openFilterDialog() {
    this.openFilterDialogSubject.next();
  }
}
