import { Component } from '@angular/core';
import { SharedModule } from '../../core/share/shared.module';
import { SidebarService } from '../service/sidebar.service';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuItem } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ThemeService } from '../../core/share/theme.service';
import { categoryService } from '../service/category.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { storyService } from '../../comic-paradise/service/story.service';
import { SharedService } from '../service/share.service';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
  selector: 'app-sidebar',
  imports: [
    SharedModule,
    MegaMenuModule,
    AccordionModule,
    OverlayBadgeModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  isSidebarOpen: boolean = false;
  visibleCategories: boolean = false;
  activeCategoryIndex: number | null = null;

  categoryItems: MenuItem[] = [];
  notifyItems: MenuItem[] | undefined;
  isDarkMode: boolean = false;
  visibleNotify: any;
  searchStories: any;
  userID: any;
  unreadNotification: any;

  constructor(
    private sidebarService: SidebarService,
    private themeService: ThemeService,
    private _categoryService: categoryService,
    private _storyService: storyService,
    private _sharedService: SharedService,
    private http: HttpClient,
    private router: Router,
  ) {
    this.sidebarService.sidebarState$.subscribe(state => {
      this.isSidebarOpen = state;
    });
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userID = user.userID;
    this.getCategories();


    this.loadNotification();
    this._sharedService.unreadCount$.subscribe(count => {
      this.unreadNotification = count;
    });
    this.notifyItems = [
      {
        label: 'Options',
        items: [
          {
            label: 'Refresh',
            icon: 'pi pi-refresh'
          },
          {
            label: 'Export',
            icon: 'pi pi-upload'
          }
        ]
      }
    ];
  }

  resetHome() {
    this.searchStories = [];
    this._storyService.setSearchStories([]);
    this.router.navigate(['']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  navigateToRegister() {
    this.router.navigate(['/register']);

  }

  closeSidebar() {
    this.sidebarService.toggleSidebar();
  }

  showCategories() {
    this.visibleCategories = true;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

  getCategories() {
    this._categoryService.getCategories().subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.categoryItems = res.data
        console.log(res.data)
      }
    })
  }

  navigateToContact() {
    this.router.navigate(['/about-us']);
  }

  logout(){
    this._sharedService.logout();
  }

  openMemberForm() {
    this._sharedService.triggerUpdateMemberForm();
  }

  openFavoriteStoriesForm() {
    this._sharedService.triggeFavoriteStoriesForm();
  }

  openHistoryStoriesForm(){
    this._sharedService.triggeHistoryStoriesForm();
  }

  openNotificationForm(){
    this._sharedService.triggeNotificationForm();
  }
  loadNotification(){
    this._sharedService.loadNotificationsEvent();
  }
}
