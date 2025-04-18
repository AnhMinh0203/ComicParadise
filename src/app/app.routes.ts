import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { LoginComponent } from './core/authen/login/login.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',  // Cấu hình route login
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Trang chủ'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'story-management',
        loadChildren: () => import('./comic-paradise/story-management/routes').then((m) => m.routes)
      },
      {
        path: 'member-management',
        loadChildren: () => import('./comic-paradise/member-management/routes').then((m) => m.routes)
      },
      {
        path: 'category-management',
        loadChildren: () => import('./comic-paradise/category-management/routes').then((m) => m.routes)
      },
      {
        path: 'report-management',
        loadChildren: () => import('./comic-paradise/report-management/routes').then((m) => m.routes)
      },
      {
        path: 'statistical-report-management',
        loadChildren: () => import('./comic-paradise/statistical-report-management/routes').then((m) => m.routes)
      },
      {
        path: 'base',
        loadChildren: () => import('./views/base/routes').then((m) => m.routes)
      },


    ]
  },

  { path: '**', redirectTo: 'dashboard' }

];
