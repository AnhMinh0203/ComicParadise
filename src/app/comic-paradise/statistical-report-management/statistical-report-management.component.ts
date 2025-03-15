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
import { storyService } from '../service/story.service';
import { initial } from 'lodash-es';

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
  author: any;
  title: any;
  selectStoryType: any;
  categoriesSelect: any;
  coverImageDisplay: any;
  description: any;
  isDisplayStoryInfor: boolean = false;
  keySearch: string = "";

  totalStories: any;
  totalMembers: any;
  totalCategories: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private _reportService: reportService,
    private _storyService: storyService

  ) {

  }

  reloadStoriesReport() { }

  ngOnInit() {
    this.initial();
    this.getReportStory();
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
  }

  getReportStory() {
    this._reportService.getReportStory().subscribe((res: any) => {
      console.log(res);
      this.stories = res.data;
    });
  }

  async getStoryDetail(storyID: number) {
    this.isDisplayStoryInfor = true;
    this._storyService.getStoryById(storyID).subscribe((res: any) => {
      console.log(res);
      this.author = res.data.author;
      this.title = res.data.title;
      this.selectStoryType = res.data.type;
      this.categoriesSelect = res.data.categories;
      this.coverImageDisplay = res.data.coverImage;
      this.description = res.data.description;
    });
  }

  exportStoryReportExcel() {
    this._reportService.exportStoryReportExcel().subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);

      // Tạo link ẩn để tải file
      const a = document.createElement('a');
      a.href = url;
      a.download = `ReportStory-${new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Giải phóng bộ nhớ
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error("Lỗi khi tải file Excel", error);
    });
  }

  searchStory() {
    this._reportService.searchReportStory(this.keySearch).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.stories = res.data;
        console.log("ahihi")
      }
      else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Thông báo',
          detail: 'Truyện không tồn tại'
        });
      }
    });
  }

  getTotalStories(){
    console.log("----")
    this._reportService.getTotalStories().subscribe((res:any)=>{
      if(res && res.isSuccess == true){
        console.log("----")
        this.totalStories = res.data
        console.log(res.data)
      }
    })

  }
  getTotalMembers(){
    this._reportService.getTotalMembers().subscribe((res:any)=>{
      if(res && res.isSuccess == true){
        this.totalMembers = res.data
      }
    })
  }
  getTotalCategories(){
    this._reportService.getTotalCategories().subscribe((res:any)=>{
      if(res && res.isSuccess == true){
        this.totalCategories = res.data
      }
    })
  }

  initial(){
    this.getTotalStories();
    this.getTotalMembers();
    this.getTotalCategories();
  }
}
