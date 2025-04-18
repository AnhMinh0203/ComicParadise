import { Component } from '@angular/core';
import { CardModule } from '@coreui/angular';
import { SharedModule } from '../../core/share/shared.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { reportService } from '../service/report.service';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-report-management',
  imports: [
    CardModule,
    SharedModule,
    TabViewModule,
    RouterModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './report-management.component.html',
  styleUrl: './report-management.component.scss'
})
export class ReportManagementComponent {
  reportComments: any[] = [];
  reportStories: any[] = [];



  constructor(
    private _reportService: reportService
  ) {


  }

  ngOnInit() {
    this.onTabChange({ index: 0 });
  }

  exportExcel() {
    alert("Xuất báo cáo thành công!");
  }

  onTabChange(event: any) {
    const tabIndex = event.index; // Lấy index của tab được chọn
    if (tabIndex == 0) {
      this.loadReportStory();
    } else if (tabIndex == 1) {
      this.loadReportComment();
    }
  }
  loadReportComment() {
    this._reportService.getReport("ReportComment").subscribe((res: any) => {
      this.reportComments = res.data;
    }, (error: any) => {
      console.error(error);
    });
  }
  loadReportStory() {
    this._reportService.getReport("ReportStory").subscribe((res: any) => {
      this.reportStories = res.data;

    }, (error: any) => {
      console.error(error);
    });
  }
}
