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
import { ResponseHandler } from '../../helpers/response-handler';
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
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _authenService: AuthenService,
    private messageService: MessageService,
    private _responseHandle: ResponseHandler,

  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      passwordHash: ['', [Validators.required]],
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Thông báo', detail: 'Vui lòng điền đủ thông tin!' });
      return;
    }

    const model = {
      identifier: this.loginForm.value.identifier,
      passwordHash: this.loginForm.value.passwordHash
    };

    this._authenService.login(model).subscribe((res: any) => {
      if (res && res.status === 200) {

        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));

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

  loginWithGoogle() {
    // window.location.href = `${this._authenService.apiUrl}/google-login`;
    alert('Chức năng đang cập nhật');
  }

  loginWithFacebook() {
    alert('Chức năng đang cập nhật');
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  requestPasswordReset() {
    const email = encodeURIComponent(this.email); // Mã hóa email để sử dụng trong URL
    this._authenService.requestPasswordReset(email).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this._responseHandle.showwSuccess(res.message);
      } else {
        this._responseHandle.showError(res.message);
      }
    });
  }
}
