import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Quản lý hệ thống'
    },
    children: [
      {
        path: '',
        redirectTo: 'cards',
        pathMatch: 'full'
      },
      {
        path: 'tutorial',
        loadComponent: () => import('./tutorial/tutorial.component').then(m => m.TutorialComponent),
        data: {
          title: 'Hướng dẫn sử dụng'
        }
      },
      {
        path: 'footer',
        loadComponent: () => import('./footer/footer.component').then(m => m.FooterComponent),
        data: {
          title: 'Chân trang'
        }
      },
      {
        path: 'banner',
        loadComponent: () => import('./banner/banner.component').then(m => m.BannerComponent),
        data: {
          title: 'Banner'
        }
      },
    ]
  }
];


