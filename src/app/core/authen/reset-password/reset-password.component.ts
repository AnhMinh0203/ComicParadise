import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../share/shared.module';
import { AuthenService } from '../service/authen.service';
import { ResponseHandler } from '../../helpers/response-handler';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    SharedModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  resetForm!: FormGroup;
  token: string = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _authenService: AuthenService,
    private _responseHandle: ResponseHandler
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });


    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      const msg = this.resetForm.errors?.['mismatch']
        ? 'Mật khẩu không khớp!'
        : 'Vui lòng điền đầy đủ thông tin';
      return this._responseHandle.showWarning(msg);
    }

    const resetPayload = {
      rawToken: this.token,
      newPassword: this.resetForm.value.newPassword
    };

    this._authenService.resetPassword(resetPayload).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this._responseHandle.showwSuccess(res.message);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      }
      else {
        this._responseHandle.showError(res.message);
      }
    });
  }
}
