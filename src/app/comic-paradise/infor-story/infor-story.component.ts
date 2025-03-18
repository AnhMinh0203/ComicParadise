import { Component } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, TreeNode } from 'primeng/api';
import { SharedModule } from '../../core/share/shared.module';
import { Menu, MenuModule } from 'primeng/menu';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-infor-story',
  imports: [
    SharedModule,
    Menu,
    MenuModule
  ],
  providers: [MessageService, ConfirmationService,],
  templateUrl: './infor-story.component.html',
  styleUrl: './infor-story.component.scss'
})
export class InforStoryComponent {
  constructor(
    private http: HttpClient,
    private router: Router,

  ) { }

  comments: any;
  commentInput: any;

  storyID: any;
  commentSelections: MenuItem[] | undefined;
  coverImageDisplay: any;
  title: any;
  author: any;
  categoriesSelect: any;
  description: any;
  chapters: any;
  showAllChapters: any;
  maxChaptersToShow: any;




  navigateToChapterContent(arg0: any, arg1: any) {
  }
  toggleChapterView() {
    throw new Error('Method not implemented.');
  }
  getTimeAgo(arg0: any) {
    throw new Error('Method not implemented.');
  }
  postComment() {
    throw new Error('Method not implemented.');
  }

  replyComment(_t67: any) {
    throw new Error('Method not implemented.');
  }
  setCurrentComment(_t67: any) {
    throw new Error('Method not implemented.');
  }
  onDislike(_t119: any) {
    throw new Error('Method not implemented.');
  }
  toggleExpand(_t67: any) {
    throw new Error('Method not implemented.');
  }
  toggleReply(_t67: any) {
    throw new Error('Method not implemented.');
  }
  onLike(_t67: any) {
    throw new Error('Method not implemented.');
  }
}
