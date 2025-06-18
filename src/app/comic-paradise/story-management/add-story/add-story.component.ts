import { HttpClientModule } from '@angular/common/http';
import Quill from 'quill';
import { Component, ViewChild } from '@angular/core';
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

import { ConfirmationService, MessageService } from 'primeng/api';
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
import { jwtDecode } from 'jwt-decode';
import { CardModule as PrimeCardModule } from 'primeng/card';
import { chapterService } from 'src/app/comic-paradise/service/chapter.service';
import { ResponseHandler } from 'src/app/core/helpers/response-handler';
import { getUserIdFromToken } from 'src/app/core/helpers/token-helper';
interface ChapterFormData {
  chapterNumber: number;
  title: string;
  storyType: string;
  content?: string;
  createdBy: number;
  imageFiles: File[];
}


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
    PrimeCardModule
  ],
  providers: [MessageService, ConfirmationService],
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
  isAddChapter: boolean = false;
  isAddNovel: boolean = false;
  isAddManga: boolean = false;
  chapterNumber: any;
  chapterName: any;
  selectedContentImages: File[] = [];
  chapters: any[] = [];

  constructor(
    private router: Router,
    private _storyService: storyService,
    private _categoryService: categoryService,
    private messageService: MessageService,
    private _chapterService: chapterService,
    private _responseHandler: ResponseHandler
  ) { }

  typeOptions: any[] = [{ label: 'Truyện tranh', value: 'Manga' }, { label: 'Tiểu thuyết', value: 'Novel' }];
  selectType: any;

  ngOnInit() {
    this.getCategories();
    this.selectType = this.typeOptions[0].value;
    this.userID = getUserIdFromToken();
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
      // console.log(res);
      if (res && res.isSuccess == true) {
        this.categories = res.data;
      }
    });
  }

  onUploadCoverImage(event: any) {
    const file = event.files[0];
    const maxSizeKB = 1000;
    console.log(file.size);
    if (file.size / 1024 > maxSizeKB) { // 1mb
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Kích thước ảnh không được lớn hơn 1MB'
      });
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

  showWarning(message: string) {
    this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: message });
  }

  // addStory() {
  //   if (!this.title || this.title.trim() === "") {
  //     this.showWarning("Tên truyện không được để trống!");
  //     return;
  //   }
  //   if (!this.author || this.author.trim() === "") {
  //     this.showWarning("Tên tác giả không được để trống!");
  //     return;
  //   }
  //   if (!this.selectType) {
  //     this.showWarning("Vui lòng chọn danh mục!");
  //     return;
  //   }
  //   if (!this.coverImage) {
  //     this.showWarning("Vui lòng chọn ảnh bìa cho truyện!");
  //     return;
  //   }

  //   const formData = new FormData();
  //   const publishID = this.userID;

  //   formData.append("Title", this.title);
  //   formData.append("Author", this.author);
  //   formData.append("PublisherID", publishID);
  //   formData.append("Type", this.selectType);
  //   // formData.append("CategoryIDs", this.categoriesSelect.map((c:any) => c.categoryID));

  //   this.categoriesSelect.forEach((c: any) => {
  //     formData.append("CategoryIDs", c.categoryID);
  //   });

  //   formData.append("Description", this.description);

  //   // Gửi ảnh chính (primary image)
  //   if (this.coverImage) {
  //     formData.append("CoverImage", this.coverImage);
  //   }

  //   //  Gửi request xuống BE
  //   this._storyService.addStory(formData).subscribe((res: any) => {
  //     if (res && res.isSuccess == true) {
  //       this.messageService.add({ severity: "success", summary: "Success", detail: res.data });
  //     } else {
  //       this.messageService.add({ severity: "error", summary: "Error", detail: res.data });
  //     }
  //   });
  // }

  addStory() {
    if (!this.title || this.title.trim() === "") {
      this.showWarning("Tên truyện không được để trống!");
      return;
    }
    if (!this.author || this.author.trim() === "") {
      this.showWarning("Tên tác giả không được để trống!");
      return;
    }
    if (!this.selectType) {
      this.showWarning("Vui lòng chọn danh mục!");
      return;
    }
    if (!this.coverImage) {
      this.showWarning("Vui lòng chọn ảnh bìa cho truyện!");
      return;
    }

    const formData = new FormData();
    const publishID = this.userID;

    formData.append("Title", this.title);
    formData.append("Author", this.author);
    formData.append("PublisherID", publishID);
    formData.append("Type", this.selectType);

    this.categoriesSelect.forEach((c: any) => {
      formData.append("CategoryIDs", c.categoryID);
    });

    formData.append("Description", this.description);
    formData.append("CoverImage", this.coverImage);

    console.log("this chapters:", this.chapters);
    if (this.chapters && this.chapters.length > 0) {
      this.chapters.forEach((chapter, index) => {
        formData.append(`Chapters[${index}].ChapterNumber`, chapter.ChapterNumber.toString());
        formData.append(`Chapters[${index}].Title`, chapter.ChapterName);
        formData.append(`Chapters[${index}].StoryType`, chapter.StoryType);
        formData.append(`Chapters[${index}].CreatedBy`, chapter.CreatedBy.toString());

        if (chapter.Content) {
          formData.append(`Chapters[${index}].Content`, chapter.content);
        }

        chapter.ImageFiles.forEach((file: File) => {
          formData.append(`Chapters[${index}].ImageFiles`, file);
        });
      });
    }

    this._storyService.addStory(formData).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.messageService.add({ severity: "success", summary: "Success", detail: res.data });
      } else {
        this.messageService.add({ severity: "error", summary: "Error", detail: res.data });
      }
    });
  }



  addChapterForm() {
    this.isAddChapter = true;
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

  closeNovelForm() {
    this.isAddChapter = false;
  }

  async postChapterToList() {
    if (!this.chapterNumber) {
      this.showWarning("Vui lòng nhập số chương!");
      return;
    }

    if (this.selectType === "Manga" && (!this.selectedContentImages || this.selectedContentImages.length === 0)) {
      this.showWarning("Truyện tranh cần có ít nhất một ảnh!");
      return;
    }

    if (this.selectType === "Novel") {
      const content = this.editorInstance?.root?.innerHTML?.trim();
      if (!content || content === "<p><br></p>") {
        this.showWarning("Nội dung chương không được để trống!");
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
