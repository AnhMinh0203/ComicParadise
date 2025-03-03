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
      }
    ]
  }
];
