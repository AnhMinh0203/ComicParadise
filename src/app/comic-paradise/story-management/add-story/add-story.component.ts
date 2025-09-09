import { HttpClientModule, HttpEventType } from '@angular/common/http';
import Quill from 'quill';
import { Component, NgZone, ViewChild } from '@angular/core';
import { ButtonModule, CardModule, FormModule } from '@coreui/angular';
import { ButtonModule as PrimeUIButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { ViewEncapsulation } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { storyService } from '../../service/story.service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { categoryService } from '../../service/category.service';
import { CardModule as PrimeCardModule } from 'primeng/card';
import { ResponseHandler } from '../../../core/helpers/response-handler';
import { getUserIdFromToken } from '../../../core/helpers/token-helper';
import { ProgressBarModule } from 'primeng/progressbar';
import { SharedModule } from '../../../core/share/shared.module';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { SignalRService } from '../../service/signalr.service';
import { ToggleSwitch } from 'primeng/toggleswitch';
@Component({
  selector: 'app-add-story',
  imports: [
    ButtonModule,
    CardModule,
    FormModule,
    PrimeUIButtonModule,
    FileUploadModule,
    HttpClientModule,
    CommonModule,
    ImageModule,
    FormsModule,
    InputTextModule,
    EditorModule,
    SelectModule,
    Toast,
    InputNumberModule,
    TableModule,
    ConfirmDialogModule,
    ConfirmDialog,
    ToastModule,
    DialogModule,
    DatePickerModule,
    SelectButtonModule,
    MultiSelectModule,
    TextareaModule,
    PrimeCardModule,
    ProgressBarModule,
    SharedModule,
    ToggleSwitch
  ],
  providers: [ConfirmationService],
  templateUrl: './add-story.component.html',
  styleUrls: ['./add-story.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AddstoryComponent {
  @ViewChild('uploader') uploader: any;
  title: any;
  author: any;
  categories: any;
  categoriesSelect: any;
  description: any;
  publisher: any;
  coverImage: any;
  coverImageDisplay: any;
  userID: any;
  editorInstance: any;
  isAddNovel: boolean = false;
  isAddManga: boolean = false;
  chapterNumber: any;
  chapterName: any;
  selectedContentImages: File[] = [];
  chapters: any[] = [];

  maxSizeInBytes: number = 3_221_225_472; // 3GB
  totalUploadedSize: number = 0;
  value: number = 0;
  interval: any;
  loadingPercent: number = 0;
  isUploading: boolean = false;
  showCustomToast: boolean = false;
  uploadMessage: string = 'Khởi động upload...';
  isStepMode: boolean = false;
  storyID: any | null = null;

  constructor(
    private router: Router,
    private _storyService: storyService,
    private _categoryService: categoryService,
    private _responseHandler: ResponseHandler,
    private _signalRService: SignalRService,
  ) { }

  typeOptions: any[] = [{ label: 'Truyện tranh', value: 'Manga' }, { label: 'Tiểu thuyết', value: 'Novel' }];
  selectType: any;

  ngOnInit() {
    this._signalRService.startConnection().then(() => { });
    this.getCategories();
    this.selectType = this.typeOptions[0].value;
    this.userID = getUserIdFromToken();
    this.addChapterForm();
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

  getCategories() {
    this._categoryService.getCategories().subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.categories = res.data;
      }
    });
  }

  onUploadCoverImage(event: any) {
    const file = event.files[0];
    const maxSizeKB = 8000;

    if (file.size / 1024 > maxSizeKB) {
      this._responseHandler.showWarning('Kích thước ảnh không được lớn hơn 8MB');
      return;
    }

    const reader = new FileReader();
    this.coverImage = file;
    reader.onload = (e: any) => {
      this.coverImageDisplay = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  navigateTostoryManagement() {
    this.router.navigate(['/story-management']);
  }

  startCustomToast(message: string) {
    this.uploadMessage = message;
    this.showCustomToast = true;
  }

  updateCustomToast(message: string) {
    this.uploadMessage = message;
  }

  hideCustomToast() {
    this.showCustomToast = false;
  }

  addStory() {
    if (!this.title?.trim()) {
      this._responseHandler.showWarning("Tên truyện không được để trống!");
      return;
    }
    if (!this.author?.trim()) {
      this._responseHandler.showWarning("Tên tác giả không được để trống!");
      return;
    }
    if (!this.selectType) {
      this._responseHandler.showWarning("Vui lòng chọn danh mục!");
      return;
    }
    if (!this.coverImage) {
      this._responseHandler.showWarning("Vui lòng chọn ảnh bìa cho truyện!");
      return;
    }

    const formData = new FormData();
    const publishID = this.userID;
    const connectionId = this._signalRService.connectionId;

    formData.append("SignalRConnectionId", connectionId);
    formData.append("Title", this.title);
    formData.append("Author", this.author);
    formData.append("PublisherID", publishID);
    formData.append("Type", this.selectType);
    formData.append("Description", this.description);
    formData.append("CoverImage", this.coverImage);

    this.categoriesSelect.forEach((c: any) => {
      formData.append("CategoryIDs", c.categoryID);
    });

    if (this.chapters?.length) {
      this.chapters.forEach((chapter, index) => {
        formData.append(`Chapters[${index}].ChapterNumber`, chapter.ChapterNumber.toString());
        formData.append(`Chapters[${index}].Title`, chapter.ChapterName);
        formData.append(`Chapters[${index}].StoryType`, chapter.StoryType);
        formData.append(`Chapters[${index}].CreatedBy`, chapter.CreatedBy.toString());

        if (chapter.Content) {
          formData.append(`Chapters[${index}].Content`, chapter.content);
        }

        chapter.ImageFiles?.forEach((file: File) => {
          formData.append(`Chapters[${index}].ImageFiles`, file);
        });
      });
    }

    this.startCustomToast('Đang khởi tạo upload...');
    this._signalRService.onUploadProgress((data) => {
      this.updateCustomToast(data.message);
    });

    this._storyService.addStory(formData).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const percent = Math.round((event.loaded / event.total) * 100);
          this.updateCustomToast(`Đã upload tới server: ${percent}%`);
        } else if (event.type === HttpEventType.Response) {
          this.hideCustomToast();
          if (event.body?.isSuccess) {
            (window as any).uploadDone = true; // flag to indicate upload completion
            this._responseHandler.showwSuccess(event.body.data || 'Đăng truyện thành công!');
          } else {
            this._responseHandler.showError(event.body?.data || 'Tải truyện thất bại!');
          }
        }
      },
      error: () => {
        this.hideCustomToast();
        this._responseHandler.showError('Có lỗi xảy ra khi tải truyện.');
      }
    });
    this.clearStoryForm();
    this.clearChapterForm();
  }

  uploadStoryInfo() {
    if (!this.title?.trim()) {
      this._responseHandler.showWarning("Tên truyện không được để trống!");
      return;
    }
    if (!this.author?.trim()) {
      this._responseHandler.showWarning("Tên tác giả không được để trống!");
      return;
    }
    if (!this.selectType) {
      this._responseHandler.showWarning("Vui lòng chọn danh mục!");
      return;
    }
    if (!this.coverImage) {
      this._responseHandler.showWarning("Vui lòng chọn ảnh bìa cho truyện!");
      return;
    }

    const formData = new FormData();
    const publishID = this.userID;

    formData.append("Title", this.title);
    formData.append("Author", this.author);
    formData.append("PublisherID", publishID);
    formData.append("Type", this.selectType);
    formData.append("Description", this.description || "");
    formData.append("CoverImage", this.coverImage);
    this.categoriesSelect.forEach((c: any) => {
      formData.append("CategoryIDs", c.categoryID.toString());
    });

    this._storyService.addStoryByStepMode(formData).subscribe(event => {
      if (event.type === HttpEventType.Response) {
        this.storyID = event.body.data;
        this._responseHandler.showwSuccess('Tải thông tin truyện thành công!');
      }
    });
  }

  addStoryByStepMode() {
    const formData = new FormData();
    const connectionId = this._signalRService.connectionId;
    if (!this.storyID) {
      this._responseHandler.showWarning("Vui lòng tải thông tin truyện trước khi thêm chương!");
      return;
    }
    formData.append("StoryID", this.storyID.toString());
    formData.append("SignalRConnectionId", connectionId);
    if (this.chapters?.length) {
      this.chapters.forEach((chapter, index) => {
        formData.append(`Chapters[${index}].ChapterNumber`, chapter.ChapterNumber.toString());
        formData.append(`Chapters[${index}].Title`, chapter.ChapterName);
        formData.append(`Chapters[${index}].StoryType`, chapter.StoryType || 'manga');
        formData.append(`Chapters[${index}].CreatedBy`, chapter.CreatedBy.toString());

        if (chapter.Content) {
          formData.append(`Chapters[${index}].Content`, chapter.Content);
        }

        if (chapter.ImageFiles?.length) {
          chapter.ImageFiles.forEach((file: File) => {
            formData.append(`Chapters[${index}].ImageFiles`, file);
          });
        }
      });
      this.startCustomToast('Đang khởi tạo upload...');
      this._signalRService.onUploadProgress((data) => {
        this.updateCustomToast(data.message);
      });

      this._storyService.addStoryByStepMode(formData).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const percent = Math.round((event.loaded / event.total) * 100);
            this.updateCustomToast(`Đã upload tới server: ${percent}%`);
          } else if (event.type === HttpEventType.Response) {
            this.hideCustomToast();

            if (event.body?.isSuccess) {
              (window as any).uploadDone = true;
              this._responseHandler.showwSuccess('Tải chương truyện thành công!');
            } else {
              this._responseHandler.showError(event.body?.message || 'Tải truyện thất bại!');
            }
          }
        },
        error: () => {
          this.hideCustomToast();
          this._responseHandler.showError('Có lỗi xảy ra khi tải truyện.');
        }
      });
      this.clearChapterForm();
    }
    else {
      this._responseHandler.showWarning("Vui lòng thêm ít nhất một chương trước khi tải!");
    }
  }

  clearStoryForm() {
    this.title = null;
    this.author = null;
    this.description = null;
    this.publisher = null;

    this.categoriesSelect = [];
    this.coverImage = null;
    this.coverImageDisplay = null;

    this.selectType = this.typeOptions?.[0]?.value ?? null;
    this.isStepMode = false;
  }

  clearChapterForm() {
    this.chapterNumber = null;
    this.chapterName = null;
    this.selectedContentImages = [];
    this.uploader.clear();
    this.editorInstance?.setText('');
    this.chapters = [];
  }

  addChapterForm() {
    if (this.selectType === "Novel") {
      this.isAddManga = false;
      this.isAddNovel = !this.isAddNovel;

      if (this.isAddNovel) {
        setTimeout(() => {
          this.initializeQuill();
        }, 100);
      }
    }

    else {
      this.isAddNovel = false;
      this.isAddManga = true;
    }
  }

  onUploadChildrenImg(event: any) {
    this.selectedContentImages = [...event.files];
  }

  onRemoveChildrenImg(event: any) {
    this.selectedContentImages = this.selectedContentImages.filter(img => img !== event.file);
  }

  async postChapterToList() {
    if (!this.chapterNumber) {
      this._responseHandler.showWarning("Vui lòng nhập số chương!");
      return;
    }

    if (this.selectType === "Manga") {
      if (!this.selectedContentImages || this.selectedContentImages.length === 0) {
        this._responseHandler.showWarning("Truyện tranh cần có ít nhất một ảnh!");
        return;
      }
      const newChapterSize = this.selectedContentImages.reduce((acc, file) => acc + file.size, 0);
      const projectedSize = this.totalUploadedSize + newChapterSize;
      if (projectedSize > this.maxSizeInBytes) {
        this._responseHandler.showError("Tổng dung lượng chương vượt quá giới hạn 3GB!");
        return;
      }
      this.totalUploadedSize = projectedSize;
      this.value = Math.round((this.totalUploadedSize / this.maxSizeInBytes) * 100);
    }

    if (this.selectType === "Novel") {
      const content = this.editorInstance?.root?.innerHTML?.trim();
      if (!content || content === "<p><br></p>") {
        this._responseHandler.showWarning("Nội dung chương không được để trống!");
        return;
      }
    }

    const chapter = {
      ChapterNumber: this.chapterNumber,
      Title: this.chapterName,
      StoryType: this.selectType,
      ImageFiles: this.selectedContentImages,
      Content: this.editorInstance?.root?.innerHTML || "",
      CreatedBy: this.userID,
      CreatedAt: new Date().toISOString()
    };

    this.chapters.push(chapter);
    this.selectedContentImages = [];
    this.chapterNumber = null;
    this.chapterName = null;
    this.uploader.clear();
  }

  navigateToChapterContent(storyID: number, chapterNumber: number) {
    console.log('Navigating to:', storyID, chapterNumber);
    this.router.navigate(['/story-management/chapter-content', storyID, chapterNumber]);
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
}
