import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./member-management.component').then(m => m.MemberManagementComponent),
    data: {
      title: 'Quản lý thành viên'
    },
    children: [
      // Thêm route con ở đây
      {
        path: 'add-member',
        loadComponent: () => import('./add-member/add-member.component').then(m => m.AddMemberComponent),
        data: {
          title: 'Thêm khách hàng'
        }
      }
    ]
  }
];

