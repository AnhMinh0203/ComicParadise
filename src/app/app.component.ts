import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { FormsModule } from '@angular/forms';
import Quill from 'quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [FormsModule, EditorModule, ButtonModule],
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
