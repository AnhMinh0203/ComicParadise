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
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { reportService } from '../service/report.service';

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
  providers: [ConfirmationService, MessageService],
  templateUrl: './statistical-report-management.component.html',
  styleUrls: ['./statistical-report-management.component.scss']
})
export class StatisticalReportManagementComponent {
  basicData: any;
  basicOptions: any;

  // ---
  customers!: any[];
  searchText!: string;
  stories: any[] = [];
  constructor(
    private router: Router,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private _reportService: reportService

  ) {

  }

  reloadStoriesReport() { }
  searchStory() { }

  ngOnInit() {
    this.getReportStory();
    // this.basicData = {
    //   labels: ['January', 'February', 'March', 'April', 'May'],
    //   datasets: [
    //     {
    //       label: 'Sales',
    //       data: [65, 59, 80, 81, 56],
    //       borderColor: '#42A5F5',  // Màu đường viền
    //       backgroundColor: 'rgba(66, 165, 245, 0.6)',  // Màu nền
    //       borderWidth: 2,  // Đặt độ dày cho đường viền
    //       fill: true  // Nếu muốn nền bên dưới đường
    //     },
    //     {
    //       label: 'Revenue',
    //       data: [28, 48, 40, 19, 86],
    //       borderColor: '#66BB6A',  // Màu đường viền
    //       backgroundColor: 'rgba(102, 187, 106, 0.6)',  // Màu nền
    //       borderWidth: 2,  // Đặt độ dày cho đường viền
    //       fill: true  // Nếu muốn nền bên dưới đường
    //     }
    //   ]
    // };

    // // Cấu hình cho chart (Giữ nguyên cấu hình cho báo cáo người dùng)
    // this.basicOptions = {
    //   responsive: true,
    //   plugins: {
    //     legend: {
    //       position: 'top'
    //     }
    //   },
    //   scales: {
    //     y: {
    //       stacked: false,  // Không chồng các cột lại với nhau
    //     },
    //     x: {
    //       stacked: false,  // Không chồng các cột lại với nhau
    //     }
    //   }
    // };
  }

  getReportStory() {
    this._reportService.getReportStory().subscribe((res: any) => {
      console.log(res);
      this.stories = res.data;
    });
  }
  exportExcel(){

  }
}
