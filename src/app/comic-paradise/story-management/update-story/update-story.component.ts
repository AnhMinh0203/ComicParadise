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


interface CommentNode {
  key: string;
  label: string; // Tên người dùng (ví dụ: "Abc")
  avatar: string; // Chuỗi cho avatar (ví dụ: "U")
  content: string; // Nội dung bình luận (ví dụ: "Truyện hay nha :>")
  time: string; // Thời gian (ví dụ: "3 giờ trước")
  children?: CommentNode[]; // Chỉ chứa các reply trực tiếp (không lồng sâu hơn)
}

@Component({
  selector: 'app-update-story',
  imports: [
    SharedModule,
    CardModule,
    FileUploadModule,

  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './update-story.component.html',
  styleUrl: './update-story.component.scss'
})
export class UpdateStoryComponent {
  storyID: number | null = null;
  chapterNumber: any;
  title: any;
  author: any;
  categories: any;
  categoriesSelect: any;
  description: any;
  publisher: any;
  coverImage: any;
  coverImageDisplay: any;
  chapterContent: any;

  editorInstance: any;

  isAddChapter: boolean = false;
  isAddNovel: boolean = false;
  isAddManga: boolean = false;
  isAddMangaPdf: boolean = false;
  isAddMangaImgs: boolean = false;

  typeStoryOptions: any[] = [{ label: 'Tiểu thuyết', value: 'Novel' }, { label: 'Truyện tranh', value: 'Manga' }];
  typeMangaOptions: any[] = [{ label: 'PDF', value: 'Pdf' }, { label: 'Ảnh', value: 'Imgs' }];
  selectStoryType: any;
  selectMangaType: any;

  comments: any[] = [];
  //
  index: any;
  showValue: any;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router,
    private _storyService: storyService,
    private _categoryService: categoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,

  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.storyID = +id;
        console.log('Story ID:', this.storyID);
        this.getStoryDetail(this.storyID);
      }
    });

    this.getCategories();
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

  getStoryDetail(storyID:number){
    this._storyService.getStoryById(storyID).subscribe((res: any) => {
      console.log(res);
      this.author = res.data.author;
      this.title = res.data.title;
      this.selectStoryType = res.data.type;

      this.categoriesSelect = this.categories.filter((category: any) =>
        res.data.categories.some((c: any) => c.categoryID === category.categoryID)
      );

      this.coverImageDisplay = res.data.coverImage;
      this.description = res.data.description;

      this.comments = res.data.comments.map((comment: any) => ({
        key: comment.commentID.toString(),
        label: comment.username || 'Người dùng',
        avatar: comment.username ? comment.username.charAt(0).toUpperCase() : 'U',
        content: comment.content,
        time: this.getTimeAgo(comment.createdAt),
        children: this.mapChildComments(comment.childComments)
      }));
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

  confirmAddNovel() {
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thêm chương mới thành công'
    });
    return;
  }

  closeNovelForm() {
    this.isAddChapter = false;
  }

  resetForm() {
    this.chapterNumber = '';
    this.title = '';
    this.chapterContent = '';
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

  }

  onUploadChildrenImg(event: any) {

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
  private getTimeAgo(createdAt: string): string {
    const now = new Date();
    const commentTime = new Date(createdAt);

    const diffInMs = now.getTime() - commentTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInMinutes / 1440);

    // Tính chính xác số tháng và năm
    let diffInMonths = (now.getFullYear() - commentTime.getFullYear()) * 12 + (now.getMonth() - commentTime.getMonth());
    const diffInYears = now.getFullYear() - commentTime.getFullYear();

    if (diffInMinutes < 60) {
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

  // Hàm chuyển đổi danh sách comments thành cấu trúc cây
  private mapChildComments(childComments: any[]): any[] {
    if (!childComments || childComments.length === 0) return [];
    return childComments.map((child: any) => ({
      key: child.commentID.toString(),
      label: child.username || 'Người dùng',
      avatar: child.username ? child.username.charAt(0).toUpperCase() : 'U',
      content: child.content,
      time: this.getTimeAgo(child.createdAt),
      children: this.mapChildComments(child.childComments || [])
    }));
  }
  toggleExpand(comment: any): void {
    comment.expanded = !comment.expanded;
  }
}
