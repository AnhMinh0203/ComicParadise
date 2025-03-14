import { Component, AfterViewInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { ButtonModule, CardModule, FormModule } from '@coreui/angular';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { RatingModule } from 'primeng/rating';
import { ButtonModule as PrimeUIButtonModule } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { DialogModule } from 'primeng/dialog';
import { HttpClient, HttpClientModule } from '@angular/common/http';


import { FileUploadModule } from 'primeng/fileupload';

import { ImageModule } from 'primeng/image';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SelectModule } from 'primeng/select';
// ---
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { categoryService } from '../service/category.service';
import { SpeedDialModule } from 'primeng/speeddial';

import { SharedModule } from '../../core/share/shared.module';

@Component({
  selector: 'app-category-management',
  imports: [
    SharedModule,
    CardModule,
    ButtonModule,
    TableModule,
    RatingModule,
    PrimeUIButtonModule,
    TagModule,
    PaginatorModule,
    FormModule,
    CommonModule,
    DialogModule,
    SelectModule,
    EditorModule,
    FileUploadModule,
    ImageModule,
    FormsModule,
    InputTextModule,
    HttpClientModule,
    ConfirmDialog,
    ToastModule,
    ButtonModule,
    SpeedDialModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CategoryManagementComponent {
  categories: any[] = [];
  isVisibleAddOrUpdate: boolean = false;
  searchText: any;
  actions: MenuItem[] | null = null;
  isEdit: boolean = false;
  categorySelected: any = {};
  categoryName: any;
  categoryDesc: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private _categoryService: categoryService

  ) {

  }

  ngOnInit() {
    this.getCategories();
    this.actions = [
      {
        icon: 'pi pi-pencil',
        command: () => {
          this.showUpdateCategoryInfor();
        }
      },
      {
        icon: 'pi pi-trash',
        command: (event: any) => {
          this.deleteCategory(event);
        }
      }
    ];
  }

  getSeverity(status: string): "success" | "danger" | "warn" | undefined {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return undefined;
    }
  }

  getCategories() {
    this._categoryService.getCategories().subscribe((res: any) => {
      this.categories = res.data;
    });
  }

  searchCategory() {
    this._categoryService.searchCategories(this.searchText).subscribe((res: any) => {
      this.categories = res.data;
    });
  }

  reloadCategories() {
    this._categoryService.searchCategories('').subscribe((res: any) => {
      this.categories = res.data;
    });
  }

  setCurrentCategory(category: any) {
    this.categorySelected = category;
    console.log(this.categorySelected);
  }
  showUpdateCategoryInfor() {
    this.isVisibleAddOrUpdate = true;
    this.isEdit = true;
  }

  showAddCategoryInfor() {
    this.isVisibleAddOrUpdate = true;
    this.isEdit = false;
  }

  deleteCategory(event: any) {
    this.confirmationService.confirm({
      target: event.originalEvent.target,
      message: 'Xác nhận xóa chuyên mục này ?',
      header: 'Cảnh báo',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Hủy',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Xác nhận',
        severity: 'danger',
      },
      accept: () => {
        this._categoryService.deleteCategory(this.categorySelected.categoryID).subscribe((res: any) => {
          if (res && res.isSuccess == true) {
            this.getCategories();
            this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: res.data });
          }
          else {
            this.messageService.add({ severity: 'warn', summary: 'Thông báo', detail: res.data });
          }
        });
      }

    });
  }

  addCategory() {
    console.log(this.categoryName);
    console.log(this.categoryDesc);
    if (!this.categoryName?.trim() || !this.categoryDesc?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Thông báo', detail: 'Vui lòng nhập đầy đủ thông tin' });
      return;
    }

    const newCategory = {
      categoryName: this.categoryName,
      description: this.categoryDesc
    }
    this._categoryService.addCategory(newCategory).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: res.data });
        this.getCategories();

        this.categoryName = '';
        this.categoryDesc = '';
      }
    });
    this.isVisibleAddOrUpdate = false;
  }
  updateCategory() {
    this._categoryService.updateCategory(this.categorySelected).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: res.data });
        this.getCategories();
      }
    });
    this.isVisibleAddOrUpdate = false;
  }

  Test(){
    alert("123");
  }

}
