import { Routes } from '@angular/router';
import { LoginComponent } from './core/authen/login/login.component';
import { HomeComponent } from './comic-paradise/home/home.component';
import { InforStoryComponent } from './comic-paradise/infor-story/infor-story.component';
import { ChapterDetailComponent } from './comic-paradise/chapter-detail/chapter-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'infor-story/:storyID', component: InforStoryComponent },
  { path: 'chapter-content/:storyID/:chapterNumber', component: ChapterDetailComponent },
  { path: '**', redirectTo: '' },
];
