import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../../share/shared.module';
import { AuthenService } from '../service/authen.service';

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
  providers: [MessageService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  resetForm!: FormGroup;
  token: string = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private _authenService: AuthenService,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      console.log('Token:', this.token); // Kiểm tra trong console
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
      if (this.resetForm.errors?.['mismatch']) {
        this.messageService.add({ severity: 'warn', summary: 'Lỗi', detail: 'Mật khẩu không khớp!' });
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Thông báo', detail: 'Vui lòng điền đầy đủ thông tin!' });
      }
      return;
    }

    const resetPayload = {
      rawToken: this.token,
      newPassword: this.resetForm.value.newPassword
    };

    this._authenService.resetPassword(resetPayload).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: res.data});
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      }
      else {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Đặt lại mật khẩu thất bại!' });
      }

    });
  }
}
