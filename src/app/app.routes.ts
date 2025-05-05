import { Routes } from '@angular/router';
import { LoginComponent } from './core/authen/login/login.component';
import { HomeComponent } from './comic-paradise/home/home.component';
import { InforStoryComponent } from './comic-paradise/infor-story/infor-story.component';
import { ChapterDetailComponent } from './comic-paradise/chapter-detail/chapter-detail.component';
import { AboutUsComponent } from './comic-paradise/about-us/about-us.component';
import { RegisterComponent } from './core/authen/register/register.component';
import { ResetPasswordComponent } from './core/authen/reset-password/reset-password.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'infor-story/:storyID', component: InforStoryComponent },
  { path: 'chapter-content/:storyID/:chapterNumber', component: ChapterDetailComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '**', redirectTo: 'home' },
];
