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
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { memberService } from '../service/member.service';
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
    PanelModule,
    DropdownModule,
    ConfirmDialog,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './statistical-report-management.component.html',
  styleUrls: ['./statistical-report-management.component.scss']
})
export class StatisticalReportManagementComponent {
  reportStoryData: any;
  reportStoryOption: any;

  reportMemberData: any;
  reportMemberOption: any;

  // ---
  customers!: any[];
  searchText!: string;
  stories: any[] = [];
  members: any[] = [];
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

  typeReports = [
    { name: 'Thống kê theo tháng', value: 'month' },
    { name: 'Thống kê theo quý', value: 'quarter' },
    { name: 'Thống kê theo năm', value: 'year' }
  ];

  selectedTypeReport = this.typeReports[0];

  // Member
  selectedRoles: any;
  roleOptions = [
    { label: 'Reader', value: 'Reader' },
    { label: 'Publisher', value: 'Publisher' }
  ];


  constructor(
    private router: Router,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private _reportService: reportService,
    private _storyService: storyService,
    private _memberService: memberService

  ) {

  }

  reloadStoriesReport() { }

  getSeverity(status: string): "success" | "danger" | "warn" | undefined {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return undefined;
    }
  }

  ngOnInit() {
    this.initial();




  }


  getReportStory() {
    this._reportService.getReportStory().subscribe((res: any) => {
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

  getTotalStories() {
    this._reportService.getTotalStories().subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.totalStories = res.data
      }
    })

  }
  getTotalMembers() {
    this._reportService.getTotalMembers().subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.totalMembers = res.data
      }
    })
  }
  getTotalCategories() {
    this._reportService.getTotalCategories().subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.totalCategories = res.data
      }
    })
  }

  initial() {
    this.getTotalStories();
    this.getTotalMembers();
    this.getTotalCategories();
    this.getReportStory();
    this.getReportMember();
    this.getChartStoryReport("month");
    this.getChartMemberReport("month");
  }

  onStoryReportTypeChange() {
    this.getChartStoryReport(this.selectedTypeReport.value);
  }

  getChartStoryReport(typeReport: string) {
    this._reportService.getChartReportStory(typeReport).subscribe(
      (res: any) => {
        if (res && res.isSuccess) {
          this.reportStoryData = {
            labels: res.data.map((item: any) => item.label),
            datasets: [
              {
                label: 'Số lượng truyện',
                data: res.data.map((item: any) => item.count),
                borderColor: '#42A5F5',
                backgroundColor: 'rgba(66, 165, 245, 0.6)',
                borderWidth: 2,
                fill: true,
              }
            ]
          };

          this.reportStoryOption = {
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: 'top'
              },
              tooltip: {
                enabled: true
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Số lượng truyện'
                },
                ticks: {
                  stepSize: 1,  // Chỉ hiển thị số nguyên
                  beginAtZero: true
                }
              }
            }
          };
        } else {
          console.error('Lấy dữ liệu thất bại:', res);
        }
      },
      (error) => {
        console.error('Lỗi gọi API:', error);
      }
    );
  }



  // Member


  exportMemberReportExcel() {
    this._reportService.exportMemberReportExcel().subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);

      // Tạo link ẩn để tải file
      const a = document.createElement('a');
      a.href = url;
      a.download = `ReportMember-${new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Giải phóng bộ nhớ
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error("Lỗi khi tải file Excel", error);
    });
  }

  getReportMember() {
    this._memberService.getAllMembers().subscribe((res: any) => {
      this.members = res;

    });
  }
  onMemberReportTypeChange() {
    this.getChartMemberReport(this.selectedTypeReport.value);
  }

  getChartMemberReport(typeReport: string) {
    this._reportService.getChartReportMember(typeReport).subscribe(
      (res: any) => {
        if (res && res.isSuccess) {
          this.reportMemberData = {
            labels: res.data.map((item: any) => item.label),
            datasets: [
              {
                label: 'Số lượng thành viên',
                data: res.data.map((item: any) => item.count),
                borderColor: '#42A5F5',
                backgroundColor: 'rgba(66, 165, 245, 0.6)',
                borderWidth: 2,
                fill: true,
              }
            ]
          };

          this.reportMemberOption = {
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: 'top'
              },
              tooltip: {
                enabled: true
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Số lượng thành viên'
                },
                ticks: {
                  stepSize: 1,  // Chỉ hiển thị số nguyên
                  beginAtZero: true
                }
              }
            }
          };
        } else {
          console.error('Lấy dữ liệu thất bại:', res);
        }
      },
      (error) => {
        console.error('Lỗi gọi API:', error);
      }
    );
  }
}
