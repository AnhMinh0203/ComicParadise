import { APP_INITIALIZER, ChangeDetectorRef, Component } from '@angular/core';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SharedModule } from '../../core/share/shared.module';
import { ThemeService } from '../../core/share/theme.service';
import { MegaMenuModule } from 'primeng/megamenu';
import { ConfirmationService, MegaMenuItem, MenuItem } from 'primeng/api';
import { SidebarService } from '../service/sidebar.service';
import { categoryService } from '../service/category.service';
import { HttpClient } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { Menu } from 'primeng/menu';
import { storyService } from '../../comic-paradise/service/story.service';
import { RouterModule } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { SignalRService } from '../service/signalR.service';
import { notificationService } from '../service/notification.service';
import { filter, lastValueFrom, Subscription } from 'rxjs';
import { Password, PasswordModule } from 'primeng/password';
import { memberService } from '../service/member.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ListboxModule } from 'primeng/listbox';
import { SharedService } from '../service/share.service';
import { DropdownModule } from 'primeng/dropdown';
import { AuthenService } from '../../core/authen/service/authen.service';
import { jwtDecode } from 'jwt-decode';
import { ResponseHandler } from '../../core/helpers/response-handler';
import { getAvatarFromToken, getUserIdFromToken, getUsernameFromToken } from '../../core/helpers/token-helper';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    SharedModule,
    ToggleSwitchModule,
    MegaMenuModule,
    DialogModule,
    Menu,
    RouterModule,
    OverlayBadgeModule,
    BadgeModule,
    PasswordModule,
    RadioButtonModule,
    ListboxModule,
    DropdownModule,

  ],
  providers: [ConfirmationService, SignalRService,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isDarkMode: boolean = false;
  categoryItems: any;
  visibleNotify: any;
  searchKey: any;
  searchStoryResults: any;
  filterStoryByConditionsResults: any;
  filterStoryByCategoriesResults: any;
  userID: any;
  userInitial: string = '';
  userAvatarUrl?: string;

  // Actions personal
  visibleUpdateForm: boolean = false;
  visibleReadingHistoryForm: boolean = false;
  primaryImg: any;
  primaryImgDisplay: any;
  inforMember: any = {};
  newPassword: any;
  comfirmPassword: any;
  oldPassword: any;
  historyStories: any[] = [];
  selectedHistoryFilter: string = 'all';
  visibleInterestingForm: any;
  visibleChangePasswordForm: any;
  favoriteStories: any[] = [];
  newNotifications: any[] = [];
  oldNotifications: any[] = [];
  unreadNotification: any;
  systemNotifications: any[] = [];
  isSearchMobile: boolean = false;
  currentNotify: any;
  receivedMessage: any;
  notifyItems: MenuItem[] = [
    {
      label: 'Hành động',
      items: [
        {
          label: 'Ẩn thông báo', icon: 'pi pi-eye-slash', command: () => this.turnOffNotification(this.currentNotify)
        },
      ]
    }
  ];
  userMenuItems: MenuItem[] = [
    { label: 'Hồ sơ', icon: 'pi pi-user', command: () => this.showFormUpdateMemberInfor() },
    { label: 'Yêu thích', icon: 'pi pi-heart', command: () => this.showFormFavoriteStories() },
    { label: 'Lịch sử', icon: 'pi pi-history', command: async () => await this.showFormHistoryStories() },
    { label: 'Đổi mật khẩu', icon: 'pi pi-lock', command: async () => await this.showFormChangePassword() },
    { label: 'Đăng xuất', icon: 'pi pi-sign-out', command: () => this.logout() }
  ]

  statusOptionsFilter = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang cập nhật', value: 'updating' },
    { label: 'Hoàn thành', value: 'completed' }
  ];
  selectedStatusFilter = 'all';


  hubHelloMessage?: string;
  progressPercentage?: number;
  progressMessage?: string;
  processing?: boolean;

  // Filter
  isMangaFilter: any;
  visibleFilter: any;
  isNovelFilter: any;
  isHighestViews: any;
  isHighestRates: any;
  minChapters: any;
  maxChapters: any;

  private signalRSubscription!: Subscription;
  private systemSignalRSubscription!: Subscription;

  displayCategoryDialog = false;
  categoryColumns: any[][] = [];
  isChapterDetail: boolean = false;

  constructor(
    private themeService: ThemeService,
    private sidebarService: SidebarService,
    private _categoryService: categoryService,
    private _storyService: storyService,
    private _notificationService: notificationService,
    private _sharedService: SharedService,
    private _authenService: AuthenService,
    private http: HttpClient,
    private router: Router,
    private signalRService: SignalRService,
    private _memberService: memberService,
    private _responseHandle: ResponseHandler,
    private cdr: ChangeDetectorRef
  ) {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isChapterDetail = (event as NavigationEnd).urlAfterRedirects.includes('/chapter-content');
    });
  }

  logout() {
    localStorage.removeItem('accessToken');
    this.userID = null;
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  ngOnInit() {
    this.userID = getUserIdFromToken();
    this.userInitial = getUsernameFromToken() || '';
    this.userAvatarUrl = getAvatarFromToken() ?? undefined;
    this.initializeSignalR();

    this._sharedService.notificationFormSubject$.subscribe(() => {
      this.showDialogNotify();
    });

    this._sharedService.updateMemberForm$.subscribe(() => {
      this.showFormUpdateMemberInfor();
    });

    this._sharedService.favoriteStoriesFormSubject$.subscribe(() => {
      this.showFormFavoriteStories();
    });

    this._sharedService.historyStoriesFormSubject$.subscribe(() => {
      this.showFormHistoryStories();
    });

    this._sharedService.logoutSubject$.subscribe(() => {
      this.logout();
    })

    this._sharedService.unreadCount$.subscribe(count => {
      this.unreadNotification = count;
    });

    this._sharedService.loadNotifications$.subscribe(() => {
      this.loadNotifications();
    })

    this._sharedService.openCategoryDialog$.subscribe(() => {
      this.showDialogCategory();
    });

    this._sharedService.openFilterDialogSubject$.subscribe(() => {
      this.showDialogFilter();
    });

    this.loadNotifications();
  }

  ngOnDestroy() {
    if (this.signalRSubscription) {
      this.signalRSubscription.unsubscribe();
    }
    if (this.systemSignalRSubscription) {
      this.systemSignalRSubscription.unsubscribe();
    }
    this.signalRService.stopConnection();
  }

  updateUnreadCount() {
    const unreadCount = this.newNotifications.filter(noti => !noti.isRead).length;
    this.unreadNotification = unreadCount > 0 ? unreadCount.toString() : '';
  }

  initializeSignalR() {
    if (this.userID) {
      this.signalRService.startConnection(this.userID.toString()).then(() => {
        console.log('SignalR Connected');
        // Subscription cho thông báo cá nhân
        this.signalRSubscription = this.signalRService.notification$.subscribe((notification) => {
          this.newNotifications.unshift(notification);
          this.updateUnreadCount();
          this.cdr.detectChanges();
        });
      }).catch(err => console.error('SignalR Connection Error:', err));
    }
  }

  loadNotifications() {
    if (this.userID) {
      this._notificationService.getNotifications(this.userID).subscribe({
        next: (res: any) => {
          if (res && res.isSuccess) {
            this.newNotifications = res.data.newNotifications;
            this.oldNotifications = res.data.oldNotifications;
            this.unreadNotification = res.data.totalNewNotify;
            this.cdr.detectChanges();
            this.updateIsReadStatus();
          }
        },
        error: (err) => console.error('Error loading notifications:', err)
      });
    }
  }


  getUserInitial(username: string): string {
    return username ? username.charAt(0).toUpperCase() : 'U';
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

  getCategories() {
    this._categoryService.getCategories().subscribe((res: any) => {
      if (res?.isSuccess) {
        this.categoryItems = res.data;
      }
    });
  }

  navigateToContact() {
    this.router.navigate(['/about-us']);
  }

  showDialogNotify() {

    this.unreadNotification = 0;
    this.cdr.detectChanges();
    this.loadNotifications();
    this.visibleNotify = true;
  }

  showDialogCategory() {
    this.getCategories();
    this.displayCategoryDialog = true;
  }

  showDialogFilter() {
    this.visibleFilter = true;
  }

  searchStory() {
    this._storyService.searchStories(this.searchKey).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.searchStoryResults = res.data;
        this._storyService.setSearchStories(res.data);
      }
    })
    this.router.navigate(['']);
  }

  filterStoryByConditions() {
    const filterConditions = {
      IsManga: this.isMangaFilter,
      IsNovel: this.isNovelFilter,
      CompletionStatus: this.selectedStatusFilter,
      HighestViews: this.isHighestViews,
      HighestRates: this.isHighestRates,
      MinChapters: this.minChapters,
      MaxChapters: this.maxChapters,
    };
    this._storyService.filterStoryByConditions(filterConditions).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.filterStoryByConditionsResults = res.data;
        this._storyService.setFilterStoryByConditions(res.data);
      }
    });
  }

  filterStoryByCategories() {
    const selectedCategoryIds = this.categoryItems
      .filter((category: any) => category.selected)
      .map((category: any) => category.categoryID);

    this._storyService.filterStoryByCategories(selectedCategoryIds).subscribe((res: any) => {
      this.filterStoryByCategoriesResults = res.data;
      this._storyService.setFilterStoryByCategories(res.data);
    });
  }

  onSearchKeyChange() {
    if (!this.searchKey.trim()) {
      this.searchStoryResults = []; // Reset local data
      this._storyService.setSearchStories([]);
    }
  }

  resetHome() {
    this.searchStoryResults = [];
    this._storyService.setSearchStories([]);
    this.router.navigate(['']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);

  }

  onUpload(event: any) {
    const file = event.files[0];
    const maxSizeKB = 1000;

    if (file.size / 1024 > maxSizeKB) {
      this._responseHandle.showWarning(`Kích thước ảnh không được lớn hơn 1MB`);
      return;
    }

    const reader = new FileReader();
    this.primaryImg = file;
    reader.onload = (e: any) => {
      this.primaryImgDisplay = e.target.result;
    };
    reader.readAsDataURL(file);
  }


  updateMember() {
    const formData = new FormData();
    formData.append("userID", this.inforMember.userID);
    formData.append("username", this.inforMember.username);
    formData.append("phone", this.inforMember.phone);
    formData.append("email", this.inforMember.email);
    formData.append("role", this.inforMember.role);
    formData.append("status", "Active");

    this.userInitial = this.getUserInitial(this.inforMember.username || '');
    if (this.newPassword && this.newPassword != this.comfirmPassword) {
      this._responseHandle.showWarning('Mật khẩu không khớp');
      return;
    }
    else {
      formData.append("password", this.newPassword);
    }

    if (this.primaryImg) {
      formData.append("avatar", this.primaryImg);
    }

    this._memberService.updateMember(formData).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this._responseHandle.showwSuccess(res.data);
      }
      else {
        this._responseHandle.showError(res.data);
      }
    });
  }

  changePassword() {
    if (!this.oldPassword || !this.newPassword || !this.comfirmPassword) {
      this._responseHandle.showWarning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (this.newPassword !== this.comfirmPassword) {
      this._responseHandle.showWarning('Mật khẩu không khớp');
      return;
    }
    const formData = new FormData();
    formData.append("userID", this.userID);
    formData.append("oldPassword", this.oldPassword);
    formData.append("newPassword", this.newPassword);
    const changePasswordData = {
      userID: this.userID,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };

    this._authenService.changePassword(changePasswordData).subscribe({
      next: (res: any) => this._responseHandle.handleResponse(res),
      error: () => this._responseHandle.showError('Lỗi hệ thống, vui lòng thử lại sau.')
    });

  }

  showFormUpdateMemberInfor() {
    this._memberService.getMemberById(this.userID).subscribe((res: any) => {
      this.inforMember = res.data;
      this.primaryImgDisplay = this.inforMember.avatar;
    })

    this.visibleUpdateForm = true;
  }

  async showFormHistoryStories() {
    await this.getReadingHistoriesByRange("all");
    this.visibleReadingHistoryForm = true;
  }

  async showFormChangePassword() {
    this.visibleChangePasswordForm = true;
  }

  async getReadingHistoriesByRange(filter: string) {
    this.selectedHistoryFilter = filter;
    const res: any = await lastValueFrom(this._memberService.getReadingHistoriesByRange(this.userID, filter));

    if (res && res.isSuccess) {
      this.historyStories = res.data;
      this.cdr.detectChanges();  // Cập nhật giao diện ngay lập tức
    } else {
      this._responseHandle.showError(res.data);
    }
  }

  getTimeAgo(createdAt: string): string {
    const now = new Date();
    const commentTime = new Date(createdAt);

    const diffInMs = now.getTime() - commentTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInMinutes / 1440);

    // Tính chính xác số tháng và năm
    let diffInMonths = (now.getFullYear() - commentTime.getFullYear()) * 12 + (now.getMonth() - commentTime.getMonth());
    const diffInYears = now.getFullYear() - commentTime.getFullYear();

    if (diffInMinutes < 1) {
      return 'Vừa xong';
    }
    else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else if (diffInDays < 30) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} tuần trước`;
    } else if (diffInDays < 365) {
      return `${diffInMonths} tháng trước`;
    } else {
      return `${diffInYears} năm trước`;
    }
  }

  async showFormFavoriteStories() {
    this.getFavoriteStories();
    this.visibleInterestingForm = true;

  }

  getFavoriteStories() {
    this._storyService.getFavoriteStories(this.userID).subscribe((res: any) => {
      this.favoriteStories = res.data;
    })
  }

  navigateToInforStory(storyID: any) {
    this.router.navigate(['/infor-story', storyID]);
    this.visibleInterestingForm = false;
    this.visibleReadingHistoryForm = false;
  }

  toggleFavorite(story: any, event: Event) {
    event.stopPropagation(); // Ngăn chặn sự kiện click lan sang parent div
    story.isLiked = !story.isLiked;
    this.onLikeStory(story.storyID)
  }

  toggleDeleteHistory(story: any, event: Event) {
    event.stopPropagation(); // Ngăn chặn sự kiện click lan sang parent div
    if (story != null) {
      this.onDeleteHistory(story.storyID)
    }
    else {
      this.onDeleteHistory(null)
    }
  }

  onLikeStory(storyID?: any) {
    this._storyService.likeStory(this.userID, storyID).subscribe();
  }

  onDeleteHistory(storyID?: any) {
    this._memberService.deleteReadingHistory(this.userID, storyID).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this._responseHandle.showwSuccess(res.data);
        this.getReadingHistoriesByRange(this.selectedHistoryFilter);
      }
      else {
        this._responseHandle.showError(res.data);
      }
    })
  }

  toggleSearchMobile() {
    this.isSearchMobile = !this.isSearchMobile;
  }

  setCurrentNotify(noti: any) {
    this.currentNotify = noti;
  }

  turnOffNotification(currentNotify: any) {
    this._notificationService.turnOffNotifications(currentNotify.notificationID).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this._responseHandle.showwSuccess(res.data);
        this.newNotifications = this.newNotifications.filter(noti => noti.notificationID !== currentNotify.notificationID);
        this.oldNotifications = this.oldNotifications.filter(noti => noti.notificationID !== currentNotify.notificationID);
      }
    })
  }

  updateIsReadStatus() {
    const notificationIds = this.newNotifications.map(noti => noti.notificationID);
    this._notificationService.updateIsReadStatus(notificationIds).subscribe((res: any) => {
      this.unreadNotification = 0;
      this.cdr.detectChanges();
    })
  }
}
