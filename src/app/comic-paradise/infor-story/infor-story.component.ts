import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../core/share/shared.module';
import { Menu, MenuModule } from 'primeng/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TreeModule } from 'primeng/tree';
import { AvatarModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { chapterService } from '../service/chapter.service';
import { storyService } from '../service/story.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { CommentService } from '../service/comment.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ReportService } from '../service/report.service';
import { RatingModule } from 'primeng/rating';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ResponseHandler } from '../../core/helpers/response-handler';
import { getUserIdFromToken, getUsernameFromToken } from '../../core/helpers/token-helper';

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
    RadioButtonModule,
    RatingModule,
    ProgressSpinnerModule
  ],

  templateUrl: './infor-story.component.html',
  styleUrl: './infor-story.component.scss'
})
export class InforStoryComponent {
  selectStoryType: any;
  markChapterNumber: any;
  filterStoryByCategoriesResults: any[] = [];
  comments: any[] = [];
  commentInput: any;
  commenReplytInput: any;
  currentComment: any;
  storyID: any;
  coverImageDisplay: any;
  title: any;
  author: any;
  categoriesSelect: any;
  description: any;
  chapters: any[] = [];
  showAllChapters: boolean = false;
  maxChaptersToShow: number = 12;
  likes: any;
  views: any;
  isLiked: boolean = false;
  isReportCommentForm: boolean = false;
  isReportStoryForm: boolean = false;

  currentUserId: any;
  currentUserName: any;
  favoriteStories: any[] = [];
  replyingCommentId: any;
  linkToMarkChapter: any;
  storyRating: number = 4;
  userRating: any;
  pageIndex = 1;
  pageSize = 2;
  loadingMoreComments = false;
  hasMoreComments = true;

  isLoadingComments = false;
  scrollTimeout: any = null;

  reportCommentReasons: string[] = [
    'Nội dung khiêu dâm',
    'Nội dung bạo lực hoặc phản cảm',
    'Nội dung lăng mạ hoặc kích động thù hận',
    'Nội dung quấy rối hoặc bắt nạt',
    'Hành động gây hại hoặc nguy hiểm',
    'Thông tin sai lệch',
    'Nội dung liên quan đến việc ngược đãi trẻ em',
    'Nội dung quảng bá chủ nghĩa khủng bố',
    'Nội dung gian lận/vi phạm hoặc gây hiểu lầm'
  ];

  reportStoryReasons: string[] = [
    'Truyện có nội dung khiêu dâm',
    'Truyện chứa nội dung bạo lực hoặc phản cảm',
    'Truyện có ngôn từ lăng mạ hoặc kích động thù hận',
    'Truyện có yếu tố quấy rối hoặc bắt nạt',
    'Truyện chứa hành vi gây hại hoặc nguy hiểm',
    'Truyện cung cấp thông tin sai lệch',
    'Truyện có nội dung liên quan đến ngược đãi trẻ em',
    'Truyện quảng bá chủ nghĩa khủng bố',
    'Truyện vi phạm bản quyền hoặc gian lận',
    'Truyện có nội dung gây hiểu lầm cho người đọc'
  ];

  selectedCommentReason: string = '';
  selectedStoryReason: string = '';
  totalComments: number = 0;
  commentReport: MenuItem[] = [
    {
      label: 'Báo cáo vi phạm',
      icon: 'pi pi-flag',
      command: () => {
        this.reportCommentForm();
      }
    }
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _chapterService: chapterService,
    private _storyService: storyService,
    private _commentService: CommentService,
    private _reportService: ReportService,
    private _responseHandle: ResponseHandler,
  ) { }

  ngOnInit() {
    window.addEventListener('scroll', this.onWindowScroll, true);
    this.handleRouteParams();
    this.handleQueryParams();
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onWindowScroll, true);
  }

  private handleRouteParams() {
    this.activatedRoute.paramMap.subscribe(async params => {
      const id = params.get('storyID');
      if (!id) return;

      this.storyID = +id;
      await this.loadStoryInfo(this.storyID);
      this.loadUserInfo();
    });
  }

  private handleQueryParams() {
    this.activatedRoute.queryParams.subscribe(params => {
      const commentID = params['commentID'];
      if (commentID) {
        setTimeout(() => this.scrollToComment(commentID), 500);
      }
    });
  }


  private async loadStoryInfo(storyID: number) {
    this.getChaptersByStoryID(storyID);
    await this.getCommentsByStoryID(storyID);
    this.getStoryDetail(storyID);
    this.getStoryRating(storyID);
  }

  private loadUserInfo() {
    this.currentUserId = getUserIdFromToken();
    this.currentUserName = getUsernameFromToken();

    if (this.currentUserId) {
      this.checkIsLikeStory();
      this.getMarkChapter();
      this.getUserRating(this.storyID, this.currentUserId);
    }
  }

  checkIsLikeStory() {
    this._storyService.checkIsLikeStory(this.currentUserId, this.storyID).subscribe((res: any) => {
      this.isLiked = res.data;
    })
  }

  getChaptersByStoryID(storyID: any) {
    return this._chapterService.getChaptersByStoryID(storyID).subscribe((res: any) => {
      this.chapters = res.data;
    });
  }

  navigateToChapterContent(storyID: number, chapterNumber: number) {
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
    const res: any = await firstValueFrom(this._storyService.getStoryById(storyID));

    this._storyService.getStoryById(storyID).subscribe((res: any) => {
      this.author = res.data.author;
      this.title = res.data.title;
      this.selectStoryType = res.data.type;
      this.categoriesSelect = res.data.categories;
      this.coverImageDisplay = res.data.coverImage;
      this.description = res.data.description;
      this.views = res.data.views;
      this.likes = res.data.likes;

      this.comments = this.comments.map((comment: any) => {
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
          isDisliked: userReaction ? !userReaction.isLike : false,
        };
      });
    });
  }

  mapChildComments(childComments: any[]): any[] {
    return childComments.map((child: any) => {
      const userReaction = child.reactions.find((reaction: any) => reaction.userID === this.currentUserId);

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
    if (!this.currentUserId) {
      this._responseHandle.showWarning("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!this.commentInput) {
      this._responseHandle.showWarning("Vui lòng nhập nội dung bình luận");
      return;
    }

    const comment = {
      StoryID: this.storyID,
      UserID: this.currentUserId,
      Content: this.commentInput,
      CreatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      Status: "Visible",
      Reply: this.replyingCommentId,
    };

    this._commentService.postComment(comment).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        const newComment = {
          userID: this.currentUserId,
          commentID: res.data.commentID,
          label: this.currentUserName,
          avatar: this.currentUserName ? this.currentUserName.charAt(0).toUpperCase() : 'U',
          content: res.data.content,
          time: this.getTimeAgo(res.data.createdAt),
        };

        this.comments.unshift(newComment);
        this.commentInput = "";
        this._responseHandle.showwSuccess("Đăng bình luận thành công");
      } else {
        this._responseHandle.showError("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  async getCommentsByStoryID(storyID: number) {
    return this._commentService.getCommentsByStoryID(storyID, this.pageIndex, this.pageSize).subscribe((res: any) => {
      this.comments = res.data;
      this.totalComments = this.countTotalComments(this.comments);
    });
  }

  replyComment(comment: any) {
    if (!this.currentUserId) {
      this._responseHandle.showWarning("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!this.commenReplytInput) {
      this._responseHandle.showWarning("Vui lòng nhập nội dung phản hồi");
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
        const newResComment = {
          commentID: res.data.commentID,
          label: this.currentUserName,
          avatar: this.currentUserName ? this.currentUserName.charAt(0).toUpperCase() : 'U',
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

        comment.children.push(newResComment);
        this.toggleReply(comment);
        this.commenReplytInput = "";
        this._responseHandle.showwSuccess("Đăng bình luận thành công");
      } else {
        this._responseHandle.showError("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  setCurrentComment(comment: any) {
    this.currentComment = comment;
  }

  toggleExpand(comment: any): void {
    comment.expanded = !comment.expanded;
  }
  toggleReply(comment: any) {
    comment.isReplying = !comment.isReplying;
  }

  onLike(comment: any) {
    if (!this.currentUserId) {
      this._responseHandle.showWarning("Vui lòng đăng nhập");
      return;
    }
    if (comment.isLiked) {
      comment.likes = (comment.likes || 0) - 1;
    } else {
      comment.likes = (comment.likes || 0) + 1;
      if (comment.isDisliked) {
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
        this._responseHandle.showError("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  onDislike(comment: any) {
    if (!this.currentUserId) {
      this._responseHandle.showWarning("Vui lòng đăng nhập");
      return;
    }

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
        this._responseHandle.showwSuccess("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  onLikeStory() {
    if (!this.currentUserId) {
      this._responseHandle.showWarning("Vui lòng đăng nhập để thích truyện");
      return;
    }

    this.isLiked = !this.isLiked;
    this._storyService.likeStory(this.currentUserId, this.storyID).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this._responseHandle.showwSuccess("Thích truyện thành công");

        if (this.isLiked) {
          this.likes += 1;
        }
        else {
          this.likes -= 1;
        }
      }
    })
  }

  reportCommentForm() {
    this.isReportCommentForm = true;
  }

  reportStoryForm() {
    this.isReportStoryForm = true;
  }

  resetReportForm() {
    this.selectedCommentReason = '';
    this.selectedStoryReason = '';
  }

  scrollToComment(commentID: string): void {
    setTimeout(() => {
      const parentComment = this.comments.find(comment =>
        comment.children?.some((child: any) => child.commentID == commentID)
      );

      if (parentComment) {
        parentComment.expanded = true;
      }

      setTimeout(() => {
        const targetCommentElement = document.getElementById(`comment-${commentID}`);
        if (targetCommentElement) {
          targetCommentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCommentElement.classList.add('highlight-comment');
        } else {
          console.log(`Không tìm thấy bình luận với ID ${commentID}`);
        }
      }, parentComment ? 300 : 0);
    }, 500);
  }

  onReportComment() {
    const report = {
      CreatedBy: this.currentUserId,
      TargetType: "ReportComment",
      Reason: this.selectedCommentReason,
      TargetID: this.currentComment.commentID,
    }

    this._reportService.createReport(report).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this._responseHandle.showwSuccess("Báo cáo thành công");
        this.isReportCommentForm = false;
        this.selectedCommentReason = '';
      } else {
        this._responseHandle.showError("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  onReportStory() {
    const report = {
      CreatedBy: this.currentUserId,
      TargetType: "ReportStory",
      Reason: this.selectedStoryReason,
      TargetID: this.storyID,
    }

    this._reportService.createReport(report).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this._responseHandle.showwSuccess("Báo cáo thành công");
        this.isReportStoryForm = false;
        this.selectedStoryReason = '';
      } else {
        this._responseHandle.showError("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  getMarkChapter() {
    this._chapterService.getMarkChapter(this.currentUserId, this.storyID).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.linkToMarkChapter = res.data.link;
        this.markChapterNumber = res.data.chapterNumber;
      } else {
        this._responseHandle.showError("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  goToMarkedChapter() {
    this.router.navigate([this.linkToMarkChapter]);
  }

  ratingStory() {
    if (!this.currentUserId) {
      this._responseHandle.showWarning("Vui lòng đăng nhập để đánh giá");
      return;
    }

    const model = {
      StoryID: this.storyID,
      UserID: this.currentUserId,
      RatingValue: this.userRating
    }

    this._storyService.ratingStory(model).subscribe((res: any) => {
      if (res && res.isSuccess && res.data) {
        this._responseHandle.showwSuccess("Đánh giá thành công");
      } else {
        this._responseHandle.showError("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  getUserRating(storyID: number, userID: number) {
    this._storyService.getUserRating(storyID, userID).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.userRating = res.data;
      } else {
        this._responseHandle.showError("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  getStoryRating(storyID: number) {
    this._storyService.getStoryRating(storyID).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.storyRating = res.data;
      } else {
        this._responseHandle.showError("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  countTotalComments(comments: any[]): number {
    let total = comments.length;
    for (const comment of comments) {
      if (comment.childComments && comment.childComments.length > 0) {
        total += this.countTotalComments(comment.childComments);
      }
    }
    return total;
  }

  navigateToHomeWithCategory(categoryName: string) {
    this.router.navigate(['/home'], { queryParams: { category: categoryName } });
  }

  async loadMoreComments() {
    if (this.isLoadingComments || !this.hasMoreComments) return;
    this.isLoadingComments = true;
    setTimeout(async () => {
      try {
        const res: any = await firstValueFrom(
          this._commentService.getCommentsByStoryID(this.storyID, this.pageIndex + 1, this.pageSize)
        );

        const data = res.data || [];

        if (data.length < this.pageSize) {
          this.hasMoreComments = false;
        }

        const newComments = data.map((comment: any) => {
          const userReaction = comment.reactions.find((r: any) => r.userID === this.currentUserId);

          return {
            commentID: comment.commentID.toString(),
            label: comment.username || 'Người dùng',
            avatar: comment.username ? comment.username.charAt(0).toUpperCase() : 'U',
            content: comment.content,
            time: this.getTimeAgo(comment.createdAt),
            status: comment.status,
            likes: comment.likes,
            disLikes: comment.disLikes,
            children: this.mapChildComments(comment.childComments || []),
            reactions: comment.reactions,
            isLiked: userReaction ? userReaction.isLike : false,
            isDisliked: userReaction ? !userReaction.isLike : false,
            expanded: true
          };
        });

        this.comments.push(...newComments);
        this.pageIndex++;

      } catch (err) {
        console.error("Load comments failed:", err);
      } finally {
        this.isLoadingComments = false;
      }
    }, 300);
  }

  onWindowScroll = (): void => {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

    this.scrollTimeout = setTimeout(() => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      if (scrollPosition >= pageHeight - 100 && !this.isLoadingComments && this.hasMoreComments) {
        this.loadMoreComments();
      }
    }, 200);
  };
}
