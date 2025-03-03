import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./statistical-report-management.component').then(m => m.StatisticalReportManagementComponent),
    data: {
      title: 'Báo cáo thống kê'
    }
  }
];

