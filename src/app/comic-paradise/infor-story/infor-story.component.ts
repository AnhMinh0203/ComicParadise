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
import { CommentService } from '../service/comment.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SignalRService } from '../../layouts/service/signalR.service';
import { ReportService } from '../service/report.service';
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
    RadioButtonModule
  ],
  providers: [MessageService, ConfirmationService, SignalRService],
  templateUrl: './infor-story.component.html',
  styleUrl: './infor-story.component.scss'
})
export class InforStoryComponent {
  selectStoryType: any;
  markChapterNumber: any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _chapterService: chapterService,
    private _storyService: storyService,
    private messageService: MessageService,
    private _commentService: CommentService,
    private _reportService: ReportService,
    private confirmationService: ConfirmationService,
    private signalRService: SignalRService,
  ) { }

  comments: any[] = [];
  commentInput: any;
  commenReplytInput: any;
  currentComment:any;
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
  currentUserId = JSON.parse(localStorage.getItem('user') || '{}').userID;
  favoriteStories: any[] = [];
  replyingCommentId: any;
  linkToMarkChapter: any;
  reportReasons: string[] = [
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

  selectedReason: string = '';

  commentReport: MenuItem[] = [
    {
      label: 'Báo cáo vi phạm',
      icon: 'pi pi-flag',
      command: () => {
        this.reportViolation(); // gọi hàm xử lý báo cáo
      }
    }
  ];

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async params => {
      const id = params.get('storyID');
      if (id) {
        this.storyID = +id;
        this.getChaptersByStoryID(this.storyID);

        await this.getCommentsByStoryID(this.storyID);

        this.getStoryDetail(this.storyID);
        this.checkIsLikeStory();

        this.activatedRoute.queryParams.subscribe(queryParams => {
          const commentID = queryParams['commentID'];
          if (commentID) {
            // Đợi một chút để đảm bảo DOM đã render sau khi lấy bình luận
            setTimeout(() => {
              this.scrollToComment(commentID);
            }, 500); // Có thể điều chỉnh thời gian chờ nếu cần
          }
        });

        console.log("--- Chapter number ---")
        this.getMarkChapter();
      }

    });
  }

  checkIsLikeStory() {
    this._storyService.checkIsLikeStory(this.currentUserId, this.storyID).subscribe((res: any) => {
      this.isLiked = res.data;
    })
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
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').userID;
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
        // Tìm reaction của user hiện tại trong danh sách reactions
        const userReaction = comment.reactions.find((reaction: any) => reaction.userID === currentUserId);
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

  mapChildComments(childComments: any[]): any[] {
    return childComments.map((child: any) => {
      // Tìm reaction của user hiện tại trong danh sách reactions của comment con
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
    const comment = {
      StoryID: this.storyID,
      UserID: JSON.parse(localStorage.getItem('user') || '{}').userID,
      Content: this.commentInput,
      CreatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      Status: "Visible",
      Reply: this.replyingCommentId,
    };

    this._commentService.postComment(comment).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        var userName = JSON.parse(localStorage.getItem('user') || '{}').username
        const newComment = {
          userID: JSON.parse(localStorage.getItem('user') || '{}').userID,
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

  async getCommentsByStoryID(storyID: number) {
    return this._commentService.getCommentsByStoryID(storyID).subscribe((res: any) => {
      this.comments = res.data;
    });
  }

  replyComment(comment: any) {
    console.log(comment);
    const responseComment = {
      StoryID: this.storyID,
      UserID: JSON.parse(localStorage.getItem('user') || '{}').userID,
      Content: this.commenReplytInput,
      CreatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      Status: "Visible",
      Reply: comment.commentID,
    };

    this._commentService.postComment(responseComment).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        var userName = JSON.parse(localStorage.getItem('user') || '{}').username
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
        this.commentInput = "";
        this.messageService.add({ severity: "success", summary: "Thành công", detail: "Đăng bình luận thành công" });
      } else {
        this.messageService.add({ severity: "error", summary: "Lỗi", detail: "Có lỗi xảy ra, vui lòng thử lại" });
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
      UserId: JSON.parse(localStorage.getItem('user') || '{}').userID,
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
      UserId: JSON.parse(localStorage.getItem('user') || '{}').userID,
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


  onLikeStory() {
    this.isLiked = !this.isLiked;
    this._storyService.likeStory(this.currentUserId, this.storyID).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.messageService.add({
          severity: 'success',
          summary: 'Thông báo',
          detail: 'Thích truyện thành công'
        })
        if (this.isLiked) {
          this.likes += 1;

        }
        else {
          this.likes -= 1;
        }
      }
    })

    // const userId = JSON.parse(localStorage.getItem('user') || '{}').userID;
    // this.signalRService.followStory(userId, this.storyID);
  }

  reportViolation() {
    this.isReportCommentForm = true;
  }

  resetReportForm() {
    this.selectedReason = '';
  }

  scrollToComment(commentID: string): void {
    setTimeout(() => {
      // Tìm bình luận cha chứa bình luận con (nếu có)
      const parentComment = this.comments.find(comment =>
        comment.children?.some((child: any) => child.commentID == commentID)
      );

      // Nếu là bình luận con, mở rộng bình luận cha
      if (parentComment) {
        parentComment.expanded = true;
      }

      // Đợi DOM render (nếu cần mở rộng) và cuộn
      setTimeout(() => {
        const targetCommentElement = document.getElementById(`comment-${commentID}`);
        if (targetCommentElement) {
          targetCommentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCommentElement.classList.add('highlight-comment');
        } else {
          console.log(`Không tìm thấy bình luận với ID ${commentID}`);
        }
      }, parentComment ? 300 : 0); // Chỉ đợi nếu có bình luận cha cần mở rộng
    }, 500);
  }

  onReportComment(){
    const report = {
      CreatedBy: JSON.parse(localStorage.getItem('user') || '{}').userID,
      TargetType: "ReportComment",
      Reason: this.selectedReason,
      TargetID: this.currentComment.commentID,
    }

    this._reportService.createReport(report).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.messageService.add({ severity: "success", summary: "Thành công", detail: "Báo cáo thành công" });
        this.isReportCommentForm = false;
        this.selectedReason = '';
      } else {
        this.messageService.add({ severity: "error", summary: "Lỗi", detail: "Có lỗi xảy ra, vui lòng thử lại" });
      }
    } );
  }

  onReportStory(){

  }

  getMarkChapter(){
    this._chapterService.getMarkChapter( this.currentUserId,this.storyID).subscribe((res: any) => {
      console.log(res)
      if (res && res.isSuccess ) {
        if( res.data == null){
          this.linkToMarkChapter = null;
          this.markChapterNumber = 0;
        }
        this.linkToMarkChapter = res.data.link;
        this.markChapterNumber = res.data.chapterNumber;
      } else {
        this.messageService.add({ severity: "error", summary: "Lỗi", detail: "Có lỗi xảy ra, vui lòng thử lại" });
      }
    } );
  }

  goToMarkedChapter(){
    this.router.navigate([this.linkToMarkChapter]);
  }
}
