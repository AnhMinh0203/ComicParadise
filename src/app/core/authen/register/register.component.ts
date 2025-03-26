import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterModule, Router } from '@angular/router';
import { Toast } from 'primeng/toast';
import { AuthenService } from '../service/authen.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { SharedModule } from '../../share/shared.module';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
@Component({
  selector: 'app-register',
  standalone: true,  // Standalone component
  imports: [
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RouterModule,
    CheckboxModule,
    RadioButtonModule,
    FormsModule,
    ToggleSwitchModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isPublisher!: string;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _authenService: AuthenService,
    private messageService: MessageService

  ) {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required]],
      passwordHash: ['', [Validators.required]],
      passwordHashConfirm: ['', [Validators.required]], // Thêm xác nhận mật khẩu
      role: [false] // Thêm isPublisher vào form
    });
  }

  ngOnInit() {

  }

  onRegister() {
    const model = {
      username: this.registerForm.value.userName,
      phone: this.registerForm.value.phone,
      email: this.registerForm.value.email,
      passwordHash: this.registerForm.value.passwordHash,
      role: this.registerForm.value.role ? "Publisher" : "Reader"
    }
    this._authenService.register(model).subscribe((res: any) => {
      if (res && res.isSuccess) {

        this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: 'Đăng ký thành công' });
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);

      }
    })
  }

  onForgotPassword() {
    console.log('Chuyển hướng đến trang quên mật khẩu');
  }
  registerWith(provider: string) {
    console.log(`Đăng nhập với ${provider}`);
  }

  navigateToLogin(){
    this.router.navigate(['/login']);
  }
}
