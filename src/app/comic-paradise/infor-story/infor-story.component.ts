import { Component } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, TreeNode } from 'primeng/api';
import { SharedModule } from '../../core/share/shared.module';
import { Menu, MenuModule } from 'primeng/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TreeModule } from 'primeng/tree';
import { AvatarModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { chapterService } from '../service/chapter.service';
import { storyService } from '../service/story.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Component({
  selector: 'app-infor-story',
  imports: [
    SharedModule,
    Menu,
    MenuModule,
    ButtonModule,
    TagModule,
    CardModule,
    TreeModule,
    AvatarModule,
    CommonModule,
  ],
  providers: [MessageService, ConfirmationService,],
  templateUrl: './infor-story.component.html',
  styleUrl: './infor-story.component.scss'
})
export class InforStoryComponent {
  selectStoryType: any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _chapterService: chapterService,
    private _storyService: storyService
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
  chapters: any[] = [];
  showAllChapters: any;
  maxChaptersToShow: any;

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async params => {
      const id = params.get('storyID');
      if (id) {
        this.storyID = +id;
        this.getChaptersByStoryID(this.storyID);
        // await this.getCommentsByStoryID(this.storyID);
        this.getStoryDetail(this.storyID);
      }

    });
  }

  getChaptersByStoryID(storyID: any) {
    return this._chapterService.getChaptersByStoryID(storyID).subscribe((res: any) => {
      this.chapters = res.data;
      console.log(res.data)
    });
  }


  navigateToChapterContent(storyID: number, chapterNumber: number) {
    console.log('Navigating to:', storyID, chapterNumber);
    this.router.navigate(['/chapter-content', storyID, chapterNumber]);
  }

  toggleChapterView() {
    this.showAllChapters = !this.showAllChapters;
  }
  getTimeAgo(createdAt: string): string {
    const now = new Date();
    const commentTime = new Date(createdAt);

    const diffInMs = now.getTime() - commentTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInMinutes / 1440);

    // Tính chính xác số tháng và năm
    let diffInMonths = (now.getFullYear() - commentTime.getFullYear()) * 12 + (now.getMonth() - commentTime.getMonth());
    const diffInYears = now.getFullYear() - commentTime.getFullYear();

    if (diffInMinutes < 1) {
      return 'Vừa xong';
    }
    else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else if (diffInDays < 30) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} tuần trước`;
    } else if (diffInDays < 365) {
      return `${diffInMonths} tháng trước`;
    } else {
      return `${diffInYears} năm trước`;
    }
  }

  async getStoryDetail(storyID: number) {
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').userId;
    const res: any = await firstValueFrom(this._storyService.getStoryById(storyID));

    this._storyService.getStoryById(storyID).subscribe((res: any) => {
      console.log(res);
      this.author = res.data.author;
      this.title = res.data.title;
      this.selectStoryType = res.data.type;
      this.categoriesSelect = res.data.categories;
      this.coverImageDisplay = res.data.coverImage;
      this.description = res.data.description;

      // this.comments = this.comments.map((comment: any) => {
      //   // Tìm reaction của user hiện tại trong danh sách reactions
      //   const userReaction = comment.reactions.find((reaction: any) => reaction.userID === currentUserId);
      //   return {
      //     commentID: comment.commentID.toString(),
      //     label: comment.username || 'Người dùng',
      //     avatar: comment.username ? comment.username.charAt(0).toUpperCase() : 'U',
      //     content: comment.content,
      //     time: this.getTimeAgo(comment.createdAt),
      //     status: comment.status,
      //     likes: comment.likes,
      //     disLikes: comment.disLikes,
      //     children: this.mapChildComments(comment.childComments),
      //     reactions: comment.reactions,
      //     isLiked: userReaction ? userReaction.isLike : false,
      //     isDisliked: userReaction ? !userReaction.isLike : false, // Nếu userReaction tồn tại nhưng `isLike` là false -> là dislike
      //   };
      // });
    });
  }

  mapChildComments(childComments: any[]): any[] {
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').userId;
    return childComments.map((child: any) => {
      // Tìm reaction của user hiện tại trong danh sách reactions của comment con
      const userReaction = child.reactions.find((reaction: any) => reaction.userID === currentUserId);

      return {
        commentID: child.commentID.toString(),
        label: child.username || 'Người dùng',
        avatar: child.username ? child.username.charAt(0).toUpperCase() : 'U',
        content: child.content,
        time: this.getTimeAgo(child.createdAt),
        status: child.status,
        likes: child.likes,
        disLikes: child.disLikes,
        reactions: child.reactions,
        isLiked: userReaction ? userReaction.isLike : false,
        isDisliked: userReaction ? !userReaction.isLike : false,
        children: this.mapChildComments(child.childComments || []),
      };
    });
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
