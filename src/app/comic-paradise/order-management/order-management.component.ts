import { Component, ViewChild } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

import { ButtonModule, CardModule, FormModule } from '@coreui/angular';
import { CardModule as PrimeUiCardModule} from 'primeng/card';
import { ButtonModule as PrimeUIButtonModule} from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

import { DatePicker } from 'primeng/datepicker';

import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';



import { Table } from 'primeng/table';


import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';

import { PanelModule } from 'primeng/panel';
@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [
    CardModule,
    PrimeUiCardModule,
    PrimeUIButtonModule,
    FormModule,
    TabsModule,
    InputGroupModule,
    InputGroupAddonModule,
    FormsModule,
    SelectModule,
    ButtonModule,
    DatePicker,
    CommonModule,
    TableModule,
    TagModule,
    FormsModule,
    MultiSelectModule,
    InputIconModule,
    IconFieldModule,
    TooltipModule,
    DialogModule,
    PanelModule
  ],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.scss'
})
export class OrderManagementComponent {
  @ViewChild('dt2') dt2!: Table;  // Thêm `!` để khẳng định không null sau khi View init

  search(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    if (this.dt2) {  // Kiểm tra tránh lỗi null
      this.dt2.filterGlobal(inputValue, 'contains');
    }
  }

  value: any;
  visible: boolean = false;
  values = [
    {
      Id: 'DH12345',
      name: 'Nguyễn Văn A',
      phone: '0869819316',
      status: '15/10/2024',
      verified: true
    },
    {
      Id: 'DH12346',
      name: 'Nguyễn Văn A',
      phone: '0869819316',
      status: '15/10/2024',
      verified: false
    }
  ];

  orders = [
    {
      id: 'SP123',
      name: 'Chả cá',
      unit: '500g/1 hộp',
      amount: 5,
      price: 10000
    },
    {
      id: 'DH12346',
      name: 'Chả mực',
      unit: '500g/1 hộp',
      amount: 2,
      price: 20000
    }
  ];


  price_1 = 10000;
  price_2 = 20000;

  searchText: string = '';
  rangeDates: any;
  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  getSeverity(status: string) {
    switch (status) {
      case 'unqualified':
        return 'danger';

      case 'qualified':
        return 'success';

      case 'new':
        return 'info';

      case 'negotiation':
        return 'warn';

      case 'renewal':
        return 'secondary'; // Thay vì `null`, trả về giá trị hợp lệ
      default:
        return 'contrast'; // Giá trị mặc định nếu không khớp với bất kỳ case nào
    }
  }

  showDialog() {
    this.visible = true;
  }

}
