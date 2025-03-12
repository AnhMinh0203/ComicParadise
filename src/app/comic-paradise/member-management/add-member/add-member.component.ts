import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Quill from 'quill';
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
import { DatePicker } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PasswordModule } from 'primeng/password';
import { memberService } from '../../service/member.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-add-member',
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
    RadioButtonModule,
    PasswordModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss'
})
export class AddMemberComponent {
  uploadedFiles: any[] = [];
  primaryImg: any;
  imageSrc: string = '';
  value: any;
  title = 'User';
  quill: any;
  delta: any;
  username: any;
  phone: any;
  address: any;

  searchText: string = '';
  rangeDates: any;
  isDropdownOpen = false;

  // ---
  typeAccount: any;
  email: any;
  password: any;
  comfirmPassword: any;
  primaryImgDisplay: any;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router,
    private _memberService: memberService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService

  ) { }

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

  navigateToMemberManagement() {
    this.router.navigate(['/member-management']);
  }

  addMember() {

    if ((this.password == null || this.password == '') || (this.comfirmPassword == null || this.comfirmPassword == '')) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Lỗi',
        detail: 'Mật khẩu không được để trống'
      });
      return;
    }
    if (this.password != this.comfirmPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Lỗi',
        detail: 'Mật khẩu không khớp'
      });
      return;

    } else {

      const formData = new FormData();
      formData.append("username", this.username);
      formData.append("phone", this.phone);
      formData.append("email", this.email);
      formData.append("passwordHash", this.password);
      formData.append("role", this.typeAccount);
      formData.append("status", "Active");
      if (this.primaryImg) {
        formData.append("avatar", this.primaryImg);
      }
      console.log(formData);

      this._memberService.addMember(formData).subscribe((res: any) => {
        if (res && res.isSuccess == true) {
          this.messageService.add({
            severity: 'success',
            summary: 'Thông báo',
            detail: 'Tạo tài khoản thành công'
          });
          return;

        }
        else {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: res.data
          });
          return;

        }
      });
    }
  }
}
