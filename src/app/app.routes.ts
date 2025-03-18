import { Routes } from '@angular/router';
import { LoginComponent } from './core/authen/login/login.component';
import { HomeComponent } from './comic-paradise/home/home.component';
import { InforStoryComponent } from './comic-paradise/infor-story/infor-story.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' },
  { path: 'infor-story', component: InforStoryComponent }
];
