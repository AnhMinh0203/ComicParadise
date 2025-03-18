import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterModule, Router } from '@angular/router';
import { Toast } from 'primeng/toast';
import { AuthenService } from '../service/authen.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,  // Standalone component
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RouterModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: any;
  test:any
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
        localStorage.setItem('user', JSON.stringify(res.user));

        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Login successfully !' });
        this.router.navigate(['/dashboard']);
      }
      else {
        this.messageService.add({  severity: 'error', summary: 'Error', detail: res.message });
      }
    });
  }

  onForgotPassword() {
    console.log('Chuyển hướng đến trang quên mật khẩu');
  }

  onRegister() {
    console.log('Chuyển hướng đến trang đăng ký');
  }

  loginWith(provider: string) {
    console.log(`Đăng nhập với ${provider}`);
  }
}
