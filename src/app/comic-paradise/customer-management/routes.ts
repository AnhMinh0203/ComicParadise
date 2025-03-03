import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./customer-management.component').then(m => m.CustomerManagementComponent),
    data: {
      title: 'Quản lý thành viên'
    },
    children: [
      // Thêm route con ở đây
      {
        path: 'add-customer',
        loadComponent: () => import('./add-customer/add-customer.component').then(m => m.AddCustomerComponent),
        data: {
          title: 'Thêm khách hàng'
        }
      }
    ]
  }
];

