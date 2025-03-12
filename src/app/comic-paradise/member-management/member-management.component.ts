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
import { memberService } from '../service/member.service';
import { SpeedDialModule } from 'primeng/speeddial';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-member-management',
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
    ButtonModule,
    SpeedDialModule,
    DropdownModule,
    MultiSelectModule,
    PasswordModule,
    RadioButtonModule,
    ToggleSwitchModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './member-management.component.html',
  styleUrl: './member-management.component.scss'
})
export class MemberManagementComponent {
  first: number = 0;
  rows: number = 10;
  isAddMemberPage: boolean = false;
  visibleUpdateForm: boolean = false;
  value: any;

  uploadedFiles: any[] = [];
  primaryImg: any;
  imageSrc: string = '';
  title = 'User';
  delta: any;
  contentHtml: SafeHtml = '';
  editorInstance: any;

  // ---
  members!: any[];
  actions: MenuItem[] | null = null;

  typeAccount: any;
  email: any;
  password: any;
  phone: any;
  username: any;
  comfirmPassword: any;
  primaryImgDisplay: any;
  createdDate:any;
  isComment:any;
  isLock:any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private _memberService: memberService
  ) {
    this.router.events.subscribe(() => {
      this.isAddMemberPage = this.router.url.includes('/member-management/add-member');
    });
  }

  selectedRoles: any;
  selectedMember: any;

  roleOptions = [
    { label: 'Reader', value: 'Reader' },
    { label: 'Publisher', value: 'Publisher' }
  ];



  ngOnInit() {
    this.getAllMembers();
    this.actions = [
      {
        icon: 'pi pi-pencil',
        command: () => {
          this.showFormUpdateMemberInfor();
        }
      },
      {
        icon: 'pi pi-history',
        command: () => {
          this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
        }
      },
      {
        icon: 'pi pi-trash',
        command: () => {
          this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
        }
      }
    ];
  }

  getAllMembers() {
    this._memberService.getAllMembers().subscribe((res: any) => {
      this.members = res;

    });
  }

  exportExcel() {
    this._memberService.exportExcel().subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);

      // Tạo link ẩn để tải file
      const a = document.createElement('a');
      a.href = url;
      a.download = `Users-${new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Giải phóng bộ nhớ
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error("Lỗi khi tải file Excel", error);
    });
  }

  setCurrentMember(member: any) {
    this.selectedMember = member;
  }

  showFormUpdateMemberInfor () {
    this.visibleUpdateForm = true;
  }

  updateMember() {
    alert("Cập nhật thông tin thành công");
  }

  onUpload(event: any) {
    const file = event.files[0];
    const maxSizeKB = 1000;
    if (file.size / 1024 > maxSizeKB) { // 1mb
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Kích thước ảnh không được lớn hơn 1MB'
      });
      return;
    }

    const reader = new FileReader();
    this.primaryImg = file;
    reader.onload = (e: any) => {
      this.primaryImgDisplay = e.target.result;
    };
    reader.readAsDataURL(file);
  }





  // ----
  showDialog() {
    this.visibleUpdateForm = true;
  }
  navigateToAddMember() {
    this.router.navigate(['/member-management/add-member']);
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
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
  // ----
}
