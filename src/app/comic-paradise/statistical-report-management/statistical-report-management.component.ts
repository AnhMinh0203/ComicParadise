import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';

import { TabsModule } from 'primeng/tabs';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

import { ButtonModule, CardModule, FormModule } from '@coreui/angular';
import { CardModule as PrimeUiCardModule } from 'primeng/card';
import { ButtonModule as PrimeUIButtonModule } from 'primeng/button';
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
  selector: 'app-statistical-report-management',
  imports: [
    ChartModule,
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
  templateUrl: './statistical-report-management.component.html',
  styleUrls: ['./statistical-report-management.component.scss']
})
export class StatisticalReportManagementComponent {
  data: any;
  options: any;

  basicData: any;
  basicOptions: any;

  dataForOrder: any;
  optionForOrder: any;
  ngOnInit() {
    // Data for report all (Chồng lên nhau)
    this.data = {
      labels: ['January', 'February', 'March', 'April', 'May'],  // Các tháng
      datasets: [
        {
          label: 'Sales',
          data: [65, 59, 80, 81, 56],  // Dữ liệu cho Sales
          borderColor: '#42A5F5',  // Màu đường viền
          backgroundColor: 'rgba(66, 165, 245, 0.6)',  // Màu nền
          borderWidth: 2,  // Độ dày của đường viền
          fill: true  // Màu nền phía dưới
        },
        {
          label: 'Revenue',
          data: [28, 48, 40, 19, 86],  // Dữ liệu cho Revenue
          borderColor: '#66BB6A',  // Màu đường viền
          backgroundColor: 'rgba(102, 187, 106, 0.6)',  // Màu nền
          borderWidth: 2,
          fill: true
        },
        {
          label: 'Profit',
          data: [18, 48, 77, 9, 100],  // Dữ liệu cho Profit
          borderColor: '#FF7043',  // Màu đường viền
          backgroundColor: 'rgba(255, 112, 67, 0.6)',  // Màu nền
          borderWidth: 2,
          fill: true
        }
      ]
    };

    this.options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',  // Đặt vị trí của legend
        },
      },
      scales: {
        y: {
          beginAtZero: true,  // Đảm bảo trục Y bắt đầu từ 0
          stacked: true,  // Chồng các cột lại với nhau
        },
        x: {
          stacked: true,  // Chồng các cột lại với nhau
        }
      }
    };

    // Data for report user (Giữ nguyên dữ liệu)
    this.basicData = {
      labels: ['January', 'February', 'March', 'April', 'May'],
      datasets: [
        {
          label: 'Sales',
          data: [65, 59, 80, 81, 56],
          borderColor: '#42A5F5',  // Màu đường viền
          backgroundColor: 'rgba(66, 165, 245, 0.6)',  // Màu nền
          borderWidth: 2,  // Đặt độ dày cho đường viền
          fill: true  // Nếu muốn nền bên dưới đường
        },
        {
          label: 'Revenue',
          data: [28, 48, 40, 19, 86],
          borderColor: '#66BB6A',  // Màu đường viền
          backgroundColor: 'rgba(102, 187, 106, 0.6)',  // Màu nền
          borderWidth: 2,  // Đặt độ dày cho đường viền
          fill: true  // Nếu muốn nền bên dưới đường
        }
      ]
    };

    // Cấu hình cho chart (Giữ nguyên cấu hình cho báo cáo người dùng)
    this.basicOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          stacked: false,  // Không chồng các cột lại với nhau
        },
        x: {
          stacked: false,  // Không chồng các cột lại với nhau
        }
      }
    };

    this.dataForOrder = {
      labels: ['January', 'February', 'March', 'April', 'May'],  // Các tháng
      datasets: [
        {
          label: 'Orders',  // Dữ liệu cho Orders
          data: [65, 59, 80, 81, 56],  // Dữ liệu cho Orders
          borderColor: '#FF7043',  // Màu đường viền
          backgroundColor: 'rgba(255, 112, 67, 0.2)',  // Màu nền phía dưới đường
          borderWidth: 2,  // Độ dày của đường viền
          fill: true,  // Tô màu nền dưới đường,
          tension: 0.4
        }
      ]
    };

    // Các tùy chọn cho biểu đồ
    this.optionForOrder = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'  // Đặt vị trí của legend
        }
      },
      scales: {
        y: {
          beginAtZero: true  // Đảm bảo trục Y bắt đầu từ 0
        }
      }
    };
  }
}
