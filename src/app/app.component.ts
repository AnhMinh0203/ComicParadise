import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { FormsModule } from '@angular/forms';
import Quill from 'quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./layouts/navbar/navbar.component";
import { FooterComponent } from "./layouts/footer/footer.component";
import { SidebarComponent } from "./layouts/sidebar/sidebar.component";
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    EditorModule,
    ButtonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    SidebarComponent,
    ToastModule
  ],
  providers: [],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None  // Tắt encapsulation

})
export class AppComponent {
  title = 'User';
  quill: any;
  delta: any;
  isLogin: boolean = false;
  isRegister: boolean = false;
  isResetPassword: boolean = false;
  // Biến lưu trữ nội dung HTML an toàn
  contentHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer, private router: Router) {
    this.router.events.subscribe(() => {
      this.isLogin = this.router.url.includes('/login');
      this.isRegister = this.router.url.includes('/register');
      this.isResetPassword = this.router.url.includes('/reset-password');
    });
  }


}
