import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Quill from 'quill';
import { ButtonModule, CardModule,FormModule } from '@coreui/angular';
import { ButtonModule as PrimeUIButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { Router } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';


@Component({
  selector: 'app-add-customer',
  imports: [
    ButtonModule,
    CardModule,
    FormModule,
    PrimeUIButtonModule,
    FileUploadModule,
    HttpClientModule,
    CommonModule,
    ImageModule,
    FormsModule,
    InputTextModule,
    EditorModule,
    SelectModule,
    DatePicker

  ],
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss'
})
export class AddCustomerComponent {
  uploadedFiles: any[] = [];
  primaryImg: any;
  imageSrc: string = '';
  value: any;
  title = 'User';
  quill: any;
  delta: any;
  username:any;
  phone: any;
  address: any;

  searchText: string = '';
  rangeDates: any;
  isDropdownOpen = false;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router

  ) {}

  // Phương thức xử lý upload file
  onUpload(event: any) {
    const file = event.files[0]; // Get the uploaded file

    // Create a URL for the uploaded image file
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.primaryImg = e.target.result; // Set the image source to the uploaded file's data URL
      console.log('Image Source:', this.primaryImg); // Check the image source in the console
    };
    reader.readAsDataURL(file); // Convert the file to a data URL for image preview
  }

  navigateToCustomerManagement() {
    this.router.navigate(['/customer-management']);
  }
}
