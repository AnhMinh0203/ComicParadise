import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./report-management.component').then(m => m.ReportManagementComponent),
    data: {
      title: 'Quản lý báo cáo'
    }
  }
];

