import { HttpClient, HttpClientModule } from '@angular/common/http';
import Quill from 'quill';
import { Component } from '@angular/core';
import { ButtonModule, CardModule, FormModule } from '@coreui/angular';
import { ButtonModule as PrimeUIButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
    TextareaModule

  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './add-story.component.html',
  styleUrls: ['./add-story.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddstoryComponent {
  title: any;
  author: any;
  categories: any;
  categoriesSelect: any;
  description: any;
  publisher: any;
  coverImage: any;
  coverImageDisplay: any;


  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router,
    private _storyService: storyService,
    private _categoryService: categoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,

  ) { }

  typeOptions: any[] = [ { label: 'Truyện tranh', value: 'Manga' }, { label: 'Tiểu thuyết', value: 'Novel' }];
  selectType: any;

  ngOnInit() {
    this.getCategories();
    this.selectType = this.typeOptions[0].value;

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
    const publishID = JSON.parse(localStorage.getItem('user') || '{}').userID;

    formData.append("Title", this.title);
    formData.append("Author", this.author);
    formData.append("PublisherID", publishID);
    formData.append("Type", this.selectType);
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
}
