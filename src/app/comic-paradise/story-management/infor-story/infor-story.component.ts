import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { TreeModule } from 'primeng/tree';
import { ConfirmationService, MenuItem, MessageService, TreeNode } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { commentService } from '../../service/comment.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { storyService } from '../../service/story.service';
import { categoryService } from '../../service/category.service';
import { chapterService } from '../../service/chapter.service';
import { Menu, MenuModule } from 'primeng/menu';
import { SharedModule } from '../../../core/share/shared.module';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-infor-story',
  imports: [
    SharedModule,
    ButtonModule,
    TagModule,
    CardModule,
    PanelModule,
    TreeModule,
    AvatarModule,
    OverlayBadgeModule,
    CommonModule,
    MenuModule,
    Menu
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './infor-story.component.html',
  styleUrl: './infor-story.component.scss'
})
export class InforStoryComponent {
  comments: any[] = [];
  commentInput: any;
  commentSelections: MenuItem[] | undefined;
  storyID: any | null = null;
  chapters: any[] = [];
  author: any;
  title: any;
  selectStoryType: any;
  categoriesSelect: any;
  categories: any[] = [];
  coverImageDisplay: any;
  description: any;
  selectedComment: any;
  replyingCommentId: any;
  showAllChapters: boolean = false;
  maxChaptersToShow: number = 12;
  commenReplytInput: any;
currentUserId: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private _storyService: storyService,
    private _categoryService: categoryService,
    private _commentService: commentService,
    private _chapterService: chapterService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,

  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (id) {
        this.storyID = +id;
        await this.getChaptersByStoryID(this.storyID);
        await this.getCommentsByStoryID(this.storyID);
        this.getStoryDetail(this.storyID);

        const commentID = this.activatedRoute.snapshot.queryParamMap.get('commentID');
        if (commentID) {
          setTimeout(() => {
            this.scrollToComment(commentID);
          }, 300);
        }
      }
      this.commentSelections = [
        { label: 'Ẩn / Bỏ ẩn', icon: 'pi pi-delete-left', command: () => this.onUpdateStatusComment(this.selectedComment) },
        { label: 'Khóa bình luận', icon: 'pi pi-pen-to-square', command: () => this.onLockComment(this.selectedComment) },
        { label: 'Xóa', icon: 'pi pi-trash', command: () => this.onDeleteComment(this.selectedComment) }
      ];
    });
            const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    const decoded: any = jwtDecode(token);
    this.currentUserId = decoded.userID;
  }

  scrollToComment(commentID: string) {
    const commentElement = document.getElementById(`comment-${commentID}`);
    if (commentElement) {
      commentElement.classList.add('highlight-comment');
      commentElement.scrollIntoView({ behavior: 'smooth' });

      // setTimeout(() => {
      //   commentElement.classList.remove('highlight-comment');
      // }, 3000);
    }
  }

  async getChaptersByStoryID(storyID: number) {
    return this._chapterService.getChaptersByStoryID(storyID).subscribe((res: any) => {
      this.chapters = res.data;
    });
  }

  async getCommentsByStoryID(storyID: number) {
    return this._commentService.getCommentsByStoryID(storyID).subscribe((res: any) => {
      this.comments = res.data;
    });
  }

  async getStoryDetail(storyID: number) {

    const res: any = await firstValueFrom(this._storyService.getStoryById(storyID));

    this._storyService.getStoryById(storyID).subscribe((res: any) => {
      console.log(res);
      this.author = res.data.author;
      this.title = res.data.title;
      this.selectStoryType = res.data.type;
      this.categoriesSelect = res.data.categories;
      this.coverImageDisplay = res.data.coverImage;
      this.description = res.data.description;

      this.comments = this.comments.map((comment: any) => {
        // Tìm reaction của user hiện tại trong danh sách reactions
        const userReaction = comment.reactions.find((reaction: any) => reaction.userID === this.currentUserId);
        return {
          commentID: comment.commentID.toString(),
          label: comment.username || 'Người dùng',
          avatar: comment.username ? comment.username.charAt(0).toUpperCase() : 'U',
          content: comment.content,
          time: this.getTimeAgo(comment.createdAt),
          status: comment.status,
          likes: comment.likes,
          disLikes: comment.disLikes,
          children: this.mapChildComments(comment.childComments),
          reactions: comment.reactions,
          isLiked: userReaction ? userReaction.isLike : false,
          isDisliked: userReaction ? !userReaction.isLike : false, // Nếu userReaction tồn tại nhưng `isLike` là false -> là dislike
        };
      });
    });
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

  mapChildComments(childComments: any[]): any[] {
    const currentUserId = this.currentUserId;
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

  // --- Comment ---//
  postComment() {
    const comment = {
      StoryID: this.storyID,
      UserID: this.currentUserId,
      Content: this.commentInput,
      CreatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      Status: "Visible",
      Reply: this.replyingCommentId,
    };

    console.log(comment);

    this._commentService.postComment(comment).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        var userName = JSON.parse(localStorage.getItem('user') || '{}').username
        const newComment = {
          userID: this.currentUserId,
          commentID: res.data.commentID,
          label: userName,
          avatar: userName ? userName.charAt(0).toUpperCase() : 'U',
          content: res.data.content,
          time: this.getTimeAgo(res.data.createdAt),
        };

        this.comments.unshift(newComment);
        this.commentInput = "";
        this.messageService.add({ severity: "success", summary: "Thành công", detail: "Đăng bình luận thành công" });
      } else {
        this.messageService.add({ severity: "error", summary: "Lỗi", detail: "Có lỗi xảy ra, vui lòng thử lại" });
      }
    });
  }

  onLike(comment: any) {
    console.log(comment);
    if (comment.isLiked) {
      // Hủy like
      comment.likes = (comment.likes || 0) - 1;
    } else {
      // Thêm like
      comment.likes = (comment.likes || 0) + 1;
      if (comment.isDisliked) {
        // Nếu trước đó đã dislike thì giảm dislike
        comment.disLikes = (comment.disLikes || 0) - 1;
      }
    }

    comment.isLiked = !comment.isLiked;
    if (comment.isLiked) {
      comment.isDisliked = false;
    }
    const reaction = {
      CommentId: comment.commentID,
      UserId: this.currentUserId,
      IsLike: true,
      createdAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
    };
    this._commentService.updateReaction(reaction).subscribe((res: any) => {
      if (res && res.isSuccess == true) {

      } else {
        this.messageService.add({ severity: "error", summary: "Lỗi", detail: "Có lỗi xảy ra, vui lòng thử lại" });
      }
    });
  }

  onDislike(comment: any) {
    if (comment.isDisliked) {
      comment.disLikes = (comment.disLikes || 0) - 1;
    } else {
      comment.disLikes = (comment.disLikes || 0) + 1;
      if (comment.isLiked) {
        comment.likes = (comment.likes || 0) - 1;
      }
    }

    comment.isDisliked = !comment.isDisliked;
    if (comment.isDisliked) {
      comment.isLiked = false;
    }
    const reaction = {
      CommentId: comment.commentID,
      UserId: this.currentUserId,
      IsLike: false,
      createdAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
    };
    this._commentService.updateReaction(reaction).subscribe((res: any) => {
      if (res && res.isSuccess == true) {

      } else {
        this.messageService.add({ severity: "error", summary: "Lỗi", detail: "Có lỗi xảy ra, vui lòng thử lại" });
      }
    });
  }


  toggleReply(comment: any) {
    comment.isReplying = !comment.isReplying;
  }

  replyComment(comment: any) {
    if (!this.commenReplytInput) {
      this.messageService.add({ severity: "warn", summary: "Thông báo", detail: "Vui lòng nhập nội dung phản hồi" });
      return;
    }
    const responseComment = {
      StoryID: this.storyID,
      UserID: this.currentUserId,
      Content: this.commenReplytInput,
      CreatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      Status: "Visible",
      Reply: comment.commentID,
    };

    this._commentService.postComment(responseComment).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        var userName = JSON.parse(localStorage.getItem('user') || '{}').fullName
        const newResComment = {
          commentID: res.data.commentID,
          label: userName,
          avatar: userName ? userName.charAt(0).toUpperCase() : 'U',
          content: res.data.content,
          time: this.getTimeAgo(res.data.createdAt),
          likes: 0,
          disLikes: 0,
          isLiked: false,
          isDisliked: false
        };
        if (!comment.children) {
          comment.children = [];
        }

        // Thêm newResComment vào children của comment cha
        comment.children.push(newResComment);
        this.toggleReply(comment);
        this.commenReplytInput = "";
        this.messageService.add({ severity: "success", summary: "Thành công", detail: "Đăng bình luận thành công" });
      } else {
        this.messageService.add({ severity: "error", summary: "Lỗi", detail: "Có lỗi xảy ra, vui lòng thử lại" });
      }
    });
  }

  setCurrentComment(comment: any) {
    this.selectedComment = comment;
  }

  onUpdateStatusComment(comment: any) {
    const newStatus = comment.status === "Visible" ? "Hidden" : "Visible";
    const statusCommentRequest = {
      commentID: comment.commentID,
      status: newStatus
    }
    this._commentService.updateStatusComment(statusCommentRequest).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        comment.status = newStatus;
        this.messageService.add({
          severity: "success",
          summary: "Thành công",
          detail: `Bình luận đã được ${newStatus === "Visible" ? "hiển thị" : "ẩn"} thành công.`
        });
      } else {
        this.messageService.add({ severity: "error", summary: "Lỗi", detail: "Có lỗi xảy ra, vui lòng thử lại" });
      }
    });
  }

  onLockComment(comment: any) {

  }
  onDeleteComment(comment: any) {
    this._commentService.deleteComment(comment.commentID).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.comments = this.comments.filter(c => c.commentID !== comment.commentID);

        this.messageService.add({
          severity: "success",
          summary: "Thành công",
          detail: `Xóa bình luận thành công`
        });
      } else {
        this.messageService.add({ severity: "error", summary: "Lỗi", detail: "Có lỗi xảy ra, vui lòng thử lại" });
      }
    });
  }
  toggleExpand(comment: any): void {
    comment.expanded = !comment.expanded;
  }

  // Navigate to chapter content
  navigateToChapterContent(storyID: number, chapterNumber: number) {
    console.log('Navigating to:', storyID, chapterNumber);
    this.router.navigate(['/story-management/chapter-content', storyID, chapterNumber]);
  }

  toggleChapterView() {
    this.showAllChapters = !this.showAllChapters;
  }
}
