import { NgModule, Component, AfterViewInit, ChangeDetectorRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG modules
import { ButtonModule as PrimeUIButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule, Table } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { HttpClient } from '@angular/common/http';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

// ---




// ---

// CoreUI modules
import { ButtonModule as CoreUIButtonModule } from '@coreui/angular';
import { CardModule } from '@coreui/angular';
import { FormModule } from '@coreui/angular';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { TreeModule } from 'primeng/tree';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    PrimeUIButtonModule,
    FileUploadModule,
    ImageModule,
    InputTextModule,
    EditorModule,
    SelectModule,
    InputNumberModule,
    TableModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    DatePickerModule,
    SelectButtonModule,
    MultiSelectModule,
    TextareaModule,
    CoreUIButtonModule,
    CardModule,
    FormModule,
    AvatarModule,
    TagModule,
    TreeModule,
    InputGroupAddonModule,
    InputGroupModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    PrimeUIButtonModule,
    FileUploadModule,
    ImageModule,
    InputTextModule,
    EditorModule,
    SelectModule,
    InputNumberModule,
    TableModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    DatePickerModule,
    SelectButtonModule,
    MultiSelectModule,
    TextareaModule,
    CoreUIButtonModule,
    CardModule,
    FormModule,
    AvatarModule,
    TagModule,
    TreeModule,
    InputGroupAddonModule,
    InputGroupModule
  ],
})
export class SharedModule { }
