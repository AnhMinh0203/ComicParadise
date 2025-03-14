import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./category-management.component').then(m => m.CategoryManagementComponent),
    data: {
      title: 'Quản lý chuyên mục'
    },
    children: [
      // Thêm route con ở đây
      {
        path: 'add-category',
        loadComponent: () => import('./add-category/add-blog.component').then(m => m.CategoryBlogComponent),
        data: {
          title: 'Thêm category'
        }
      }
    ]
  }
];

