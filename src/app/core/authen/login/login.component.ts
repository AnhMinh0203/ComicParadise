import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterModule, Router } from '@angular/router';
import { Toast } from 'primeng/toast';
import { AuthenService } from '../service/authen.service';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { SharedModule } from '../../share/shared.module';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RouterModule,
    CheckboxModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: any;
  isForgotPassword: boolean = false;
  test: any
  email: string = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _authenService: AuthenService,
    private messageService: MessageService

  ) { }

  ngOnInit() {
    // Khởi tạo form khi component được khởi tạo
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],  // Email hoặc số điện thoại
      passwordHash: ['', [Validators.required]],
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;  // Dừng lại nếu form không hợp lệ
    }

    const model = {
      identifier: this.loginForm.value.identifier,
      passwordHash: this.loginForm.value.passwordHash
    };

    this._authenService.login(model).subscribe((res: any) => {
      if (res && res.status === 200) {

        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user)); // user có thể là object, nên vẫn giữ JSON.stringify
        localStorage.setItem('refreshToken', res.refreshToken);

        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Đăng nhập thành công!' });
        setTimeout(() => {
          this.router.navigate(['/home']);

        }, 1000);
      }
      else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
      }
    });
  }

  onForgotPassword() {
    this.isForgotPassword = !this.isForgotPassword;
  }

  // onRegister() {
  //   console.log('Chuyển hướng đến trang đăng ký');
  // }

  loginWith(provider: string) {
    console.log(`Đăng nhập với ${provider}`);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  requestPasswordReset() {
    const email = encodeURIComponent(this.email); // Mã hóa email để sử dụng trong URL
    this._authenService.requestPasswordReset(email).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.data });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
      }
    });
  }
}
