import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterModule, Router } from '@angular/router';
import { AuthenService } from '../services/authen.service';
import { Toast } from 'primeng/toast';
import { getRoleFromToken } from '../../helpers/token-helper';
import { ResponseHandler } from '../../helpers/response-handler';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RouterModule,
    Toast,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: any;
  role: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _authenService: AuthenService,
    private _responseHandler: ResponseHandler

  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      passwordHash: ['', [Validators.required]],
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    const model = {
      identifier: this.loginForm.value.identifier,
      passwordHash: this.loginForm.value.passwordHash
    };

    this._authenService.login(model).subscribe((res: any) => {
      if (res && res.status === 200) {
        localStorage.setItem('accessToken', res.data.accessToken);
        this.role = getRoleFromToken();

        if (this.role !== 'Admin' && this.role !== 'Publisher') {
          this._responseHandler.showWarning('Tài khoản không có quyền truy cập vào hệ thống');
          return;
        }

        this._responseHandler.showwSuccess('Đăng nhập thành công');
        this.router.navigate(['/dashboard']);
      }
      else {
        this._responseHandler.showError(res.message);
      }
    });
  }
}
