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
import Quill from 'quill';

import { FileUploadModule } from 'primeng/fileupload';

import { ImageModule } from 'primeng/image';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SelectModule } from 'primeng/select';
// ---
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

interface customer {
  id: string;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  quantity: number;
  inventoryStatus: string;
  rating: number;
}

@Component({
  selector: 'app-customer-management',
  imports: [
    CardModule,
    ButtonModule,
    TableModule,
    RatingModule,
    PrimeUIButtonModule,
    TagModule,
    PaginatorModule,
    FormModule,
    RouterOutlet,
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
    ButtonModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './customer-management.component.html',
  styleUrl: './customer-management.component.scss'
})
export class CustomerManagementComponent {
  first: number = 0;
  rows: number = 10;
  isAddcustomerPage: boolean = false;
  visible: boolean = false;
  value: any;

  uploadedFiles: any[] = [];
  primaryImg: any;
  imageSrc: string = '';
  title = 'User';
  quill: any;
  delta: any;
  contentHtml: SafeHtml = '';
  editorInstance:any;

  values = [
    {
      Id: 'DH12345',
      name: 'Nguyễn Văn A',
      phone: '0869819316',
      status: '15/10/2024',
      verified: true
    },
    {
      Id: 'DH12346',
      name: 'Nguyễn Văn B',
      phone: '0869819316',
      status: '15/10/2024',
      verified: false
    }
  ];

  orders = [
    {
      id: 'SP123',
      name: 'Chả cá',
      unit: '500g/1 hộp',
      amount: 5,
      price: 10000
    },
    {
      id: 'DH12346',
      name: 'Chả mực',
      unit: '500g/1 hộp',
      amount: 2,
      price: 20000
    }
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.router.events.subscribe(() => {
      this.isAddcustomerPage = this.router.url.includes('/customer-management/add-customer');
    });
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
    ['clean']  // remove formatting button
  ];

  ngAfterViewChecked() {
    if (this.visible) {
      setTimeout(() => {
        if (!this.editorInstance) { // Đảm bảo không khởi tạo nhiều lần
          this.initializeQuill();
        }
      }, 100); // Đợi một khoảng thời gian để DOM cập nhật
    }
  }

  initializeQuill() {
    const quillContainer = document.getElementById('editorcustomerManagement');
    if (quillContainer) {
      this.editorInstance = new Quill(quillContainer, {
        theme: 'snow',
        placeholder: 'Nhập mô tả truyện...',
      });
    }
  }

  showContent() {
    // Lấy nội dung HTML từ Quill editor và sanitize
    this.contentHtml = this.sanitizer.bypassSecurityTrustHtml(this.quill.root.innerHTML);
    console.log(this.contentHtml);
  }



  showDialog() {
    this.visible = true;
  }
  navigateToAddcustomer() {
    this.router.navigate(['/customer-management/add-customer']);
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;  // Đảm bảo giá trị không bị undefined
    this.rows = event.rows ?? 10;   // Đảm bảo giá trị không bị undefined
  }
  customer: customer = {
    id: '1000',
    code: 'f230fh0g3',
    name: 'Bamboo Watch',
    description: 'customer Description',
    image: 'bamboo-watch.jpg',
    price: 65,
    category: 'Accessories',
    quantity: 24,
    inventoryStatus: 'INSTOCK',
    rating: 5
  };
  customers!: customer[];

  ngOnInit() {
    this.customers = [this.customer]; // Thêm truyện vào danh sách để hiển thị
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
        return undefined; // Trả về undefined để tránh lỗi
    }
  }

  onUpload(event: any) {
    const file = event.files[0]; // Get the uploaded file

    // Create a URL for the uploaded image file
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.primaryImg = e.target.result; // Set the image source to the uploaded file's data URL
      console.log('Image Source:', this.primaryImg); // Check the image source in the console
    };
    reader.readAsDataURL(file); // Convert the file to a data URL for image preview
  }
  confirm_delete(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Xác nhận xóa truyện ',
      header: 'Cảnh báo',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Hủy bỏ',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Đồng ý',
        severity: 'danger',
      },

      accept: () => {
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted' });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      },
    });
  }
}
