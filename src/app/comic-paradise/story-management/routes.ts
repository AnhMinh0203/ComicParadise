// story-management/routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./story-management.component').then(m => m.StoryManagementComponent),
    data: {
      title: 'Quản lý truyện'
    },
    children: [
      {
        path: 'add-story',
        loadComponent: () => import('./add-story/add-story.component').then(m => m.AddstoryComponent),
        data: {
          title: 'Thêm truyện'
        }
      },
      {
        path: 'infor-story',
        loadComponent: () => import('./infor-story/infor-story.component').then(m => m.InforStoryComponent),
        data: {
          title: 'Xem nội dung'
        }
      },
      {
        path: 'update-story',
        loadComponent: () => import('./update-story/update-story.component').then(m => m.UpdateStoryComponent),
        data: {
          title: 'Cập nhật truyện'
        }
      }
    ]
  }
];
