import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../core/share/shared.module';
import { storyService } from '../../service/story.service';
import { categoryService } from '../../service/category.service';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import Quill from 'quill';
import { ActivatedRoute } from '@angular/router';
import { commentService } from '../../service/comment.service';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { chapterService } from '../../service/chapter.service';


@Component({
  selector: 'app-update-story',
  imports: [
    SharedModule,
    CardModule,
    FileUploadModule,
    MenuModule,
    Menu
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './update-story.component.html',
  styleUrl: './update-story.component.scss'
})
export class UpdateStoryComponent {
  storyID: any | null = null;
  chapterNumber: any;
  chapterName:any;
  title: any;
  author: any;
  categories: any;
  categoriesSelect: any;
  description: any;
  publisher: any;
  chapters:any;
  coverImage: any;
  coverImageDisplay: any;
  chapterContentUpload: any;
  editorInstance: any;

  isAddChapter: boolean = false;
  isAddNovel: boolean = false;
  isAddManga: boolean = false;
  isAddMangaPdf: boolean = false;
  isAddMangaImgs: boolean = false;

  typeStoryOptions: any[] = [{ label: 'Tiểu thuyết', value: 'Novel' }, { label: 'Truyện tranh', value: 'Manga' }];
  typeMangaOptions: any[] = [{ label: 'PDF', value: 'PDF' }, { label: 'Ảnh', value: 'Images' }];
  selectStoryType: any;
  selectMangaType: any;
  selectedComment: any;

  comments: any[] = [];
  commentInput: any;
  replyingCommentId: number | null = null;

  hoverLike: boolean = false;
  hoverDislike: boolean = false;
  commentSelections: MenuItem[] | undefined;
  selectedContentImages:File[] = [];

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
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
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.storyID = +id;
        this.getChaptersByStoryID(this.storyID);
        this.getCommentsByStoryID(this.storyID);
        this.getStoryDetail(this.storyID);
      }
    });
    this.getNextChapterNumber();
    this.getCategories();
    this.commentSelections = [
      { label: 'Ẩn / Bỏ ẩn', icon: 'pi pi-delete-left', command: () => this.onUpdateStatusComment(this.selectedComment) },
      { label: 'Khóa bình luận', icon: 'pi pi-pen-to-square', command: () => this.onLockComment(this.selectedComment) },
      { label: 'Xóa', icon: 'pi pi-trash', command: () => this.onDeleteComment(this.selectedComment) }
    ];
  }

  toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean']
  ];

  initializeQuill() {
    const quillContainer = document.getElementById('contentNovelStory');
    if (quillContainer) {
      this.editorInstance = new Quill(quillContainer, {
        theme: 'snow',
        placeholder: 'Nhập nội dung truyện...',
        modules: {
          toolbar: this.toolbarOptions
        }
      });
    }
  }

  getChaptersByStoryID(storyID: number) {
    return this._chapterService.getChaptersByStoryID(storyID).subscribe((res:any)=>{
      this.chapters = res.data;
    });
  }

  getCommentsByStoryID(storyID: number) {
    return this._commentService.getCommentsByStoryID(storyID).subscribe((res:any)=>{
      this.comments = res.data;
    });
  }

  async getStoryDetail(storyID: number) {
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').userId;
    this._storyService.getStoryById(storyID).subscribe((res: any) => {
      console.log(res);
      this.author = res.data.author;
      this.title = res.data.title;
      this.selectStoryType = res.data.type;

      this.categoriesSelect = (this.categories || []).filter((category: any) =>
        res.data.categories?.some((c: any) => c.categoryID === category.categoryID)
      );


      this.coverImageDisplay = res.data.coverImage;
      this.description = res.data.description;

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

  addChapterForm() {
    this.isAddChapter = true;
    if (this.selectStoryType === "Novel") {
      this.isAddNovel = !this.isAddNovel;

      if (this.isAddNovel) {
        // Đợi DOM cập nhật trước khi khởi tạo Quill
        setTimeout(() => {
          this.initializeQuill();
        }, 0);
      }
    }

    else {

      this.isAddManga = true;
      this.selectMangaType = this.typeMangaOptions[1].value
      this.isAddMangaPdf
    }
  }

  closeNovelForm() {
    this.isAddChapter = false;
  }

  resetForm() {
    this.chapterNumber = '';
    this.title = '';
    this.chapterContentUpload = '';
    if (this.editorInstance) {
      this.editorInstance.setText(''); // Xóa nội dung trong Quill Editor
    }
  }

  getCategories() {
    this._categoryService.getCategories().subscribe((res: any) => {
      // console.log(res);
      if (res && res.isSuccess == true) {
        this.categories = res.data;
      }
    });
  }

  onUploadCoverImage(event: any) {
    const fileCoverImg = event.files[0];
    const maxSizeKB = 1000;
    console.log(fileCoverImg.size);
    if (fileCoverImg.size / 1024 > maxSizeKB) { // 1mb
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Kích thước ảnh không được lớn hơn 1MB'
      });
      return;
    }

    const reader = new FileReader();
    this.coverImage = fileCoverImg;
    reader.onload = (e: any) => {
      this.coverImageDisplay = e.target.result;
    };
    reader.readAsDataURL(fileCoverImg);
  }


  onRemoveChildrenImg(event: any) {
    this.selectedContentImages = this.selectedContentImages.filter(img => img !== event.file);
  }

  onUploadChildrenImg(event: any) {
    this.selectedContentImages = [...event.files];
  }

  navigateTostoryManagement() {
    this.router.navigate(['/story-management']);
  }

  showWarning(message: string) {
    this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: message });
  }

  updateStory() {
    if (!this.title || this.title.trim() === "") {
      this.showWarning("Tên truyện không được để trống!");
      return;
    }
    if (!this.author || this.author.trim() === "") {
      this.showWarning("Tên tác giả không được để trống!");
      return;
    }
    if (!this.selectStoryType) {
      this.showWarning("Vui lòng chọn danh mục!");
      return;
    }
    if (!this.coverImage) {
      this.showWarning("Vui lòng chọn ảnh bìa cho truyện!");
      return;
    }

    const formData = new FormData();
    const publishID = JSON.parse(localStorage.getItem('user') || '{}').userId;

    formData.append("Title", this.title);
    formData.append("Author", this.author);
    formData.append("PublisherID", publishID);
    formData.append("Type", this.selectStoryType);
    // formData.append("CategoryIDs", this.categoriesSelect.map((c:any) => c.categoryID));

    this.categoriesSelect.forEach((c: any) => {
      formData.append("CategoryIDs", c.categoryID);
    });

    formData.append("Description", this.description);

    // Gửi ảnh chính (primary image)
    if (this.coverImage) {
      formData.append("CoverImage", this.coverImage);
    }

    //  Gửi request xuống BE
    this._storyService.addStory(formData).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.messageService.add({ severity: "success", summary: "Success", detail: res.data });
      } else {
        this.messageService.add({ severity: "error", summary: "Error", detail: res.data });
      }
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
        likes: child.likes,           // Số lượt like
        disLikes: child.disLikes,    // Số lượt dislike
        reactions: child.reactions,  // Danh sách reactions
        isLiked: userReaction ? userReaction.isLike : false,        // User đã like chưa
        isDisliked: userReaction ? !userReaction.isLike : false,    // User đã dislike chưa
        children: this.mapChildComments(child.childComments || []), // Đệ quy cho comment con cấp sâu hơn
      };
    });
  }

  toggleExpand(comment: any): void {
    comment.expanded = !comment.expanded;
  }

  // --- Comment ---//
  postComment() {
    const comment = {
      StoryID: this.storyID,
      UserID: JSON.parse(localStorage.getItem('user') || '{}').userId,
      Content: this.commentInput,
      CreatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      Status: "Visible",
      Reply: this.replyingCommentId,
    };

    this._commentService.postComment(comment).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        var userName = JSON.parse(localStorage.getItem('user') || '{}').fullName
        const newComment = {
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
      comment.isDisliked = false; // Không cho phép like & dislike cùng lúc
    }
    const reaction = {
      CommentId: comment.commentID,
      UserId: JSON.parse(localStorage.getItem('user') || '{}').userId,
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
      comment.isLiked = false; // Không cho phép like & dislike cùng lúc
    }
    const reaction = {
      CommentId: comment.commentID,
      UserId: JSON.parse(localStorage.getItem('user') || '{}').userId,
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
    console.log(comment);
    const responseComment = {
      StoryID: this.storyID,
      UserID: JSON.parse(localStorage.getItem('user') || '{}').userId,
      Content: this.commentInput,
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
        this.commentInput = "";
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

  // Navigate to chapter content
  navigateToChapterContent(storyID:number,chapterNumber:number) {
    console.log('Navigating to:', storyID, chapterNumber);
    this.router.navigate(['/story-management/chapter-content',storyID,chapterNumber]);
  }

  getNextChapterNumber(): Promise<number> {
    return new Promise((resolve, reject) => {
      this._chapterService.getNextChapterNumber(this.storyID).subscribe(
        (res: any) => {
          if (res && res.isSuccess === true) {
            this.chapterNumber = res.data;
            resolve(this.chapterNumber); // Trả về số chương tiếp theo
          } else {
            reject('Không thể lấy số chương tiếp theo');
          }
        },
        (error) => reject(error) // Xử lý lỗi API
      );
    });
  }


  async postChapter(){
    const chapter = {
      StoryID: this.storyID,
      ChapterNumber: this.chapterNumber,
      Title: this.title,
      ChapterType: this.selectMangaType,
      ImageFiles: this.selectedContentImages
    };

    this._chapterService.postChapter(chapter).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.messageService.add({ severity: "success", summary: "Success", detail: res.data });
      } else {
        this.messageService.add({ severity: "error", summary: "Error", detail: res.data });
      }
    });
  }
}
