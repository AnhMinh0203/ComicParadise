import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./blog-management.component').then(m => m.BlogManagementComponent),
    data: {
      title: 'Quản lý chuyên mục'
    },
    children: [
      // Thêm route con ở đây
      {
        path: 'add-blog',
        loadComponent: () => import('./add-blog/add-blog.component').then(m => m.AddBlogComponent),
        data: {
          title: 'Thêm Blog'
        }
      }
    ]
  }
];

