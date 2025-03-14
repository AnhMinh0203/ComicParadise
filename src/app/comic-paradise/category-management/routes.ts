import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./category-management.component').then(m => m.CategoryManagementComponent),
    data: {
      title: 'Quản lý chuyên mục'
    }
  }
];

