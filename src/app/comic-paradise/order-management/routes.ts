import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./order-management.component').then(m => m.OrderManagementComponent),
    data: {
      title: 'Quản lý đơn hàng'
    }
  }
];

