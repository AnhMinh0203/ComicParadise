import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { FormsModule } from '@angular/forms';
import Quill from 'quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./layouts/navbar/navbar.component";
import { FooterComponent } from "./layouts/footer/footer.component";
import { SidebarComponent } from "./layouts/sidebar/sidebar.component";
@Component({
  selector: 'app-root',
  imports: [FormsModule, EditorModule, ButtonModule, RouterOutlet, NavbarComponent, FooterComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None  // Tắt encapsulation

})
export class AppComponent {
  title = 'User';
  quill: any;
  delta: any;

  // Biến lưu trữ nội dung HTML an toàn
  contentHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}


}
