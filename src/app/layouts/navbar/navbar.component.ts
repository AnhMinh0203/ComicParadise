import { ChangeDetectorRef, Component } from '@angular/core';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SharedModule } from '../../core/share/shared.module';
import { ThemeService } from '../../core/share/theme.service';
import { MegaMenuModule } from 'primeng/megamenu';
import { ConfirmationService, MegaMenuItem, MenuItem, MessageService } from 'primeng/api';
import { SidebarService } from '../service/sidebar.service';
import { categoryService } from '../service/category.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { Menu } from 'primeng/menu';
import { storyService } from '../../comic-paradise/service/story.service';
import { RouterModule } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { SignalRService } from '../service/signalR.service';
import { notificationService } from '../service/notification.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { Password, PasswordModule } from 'primeng/password';
import { memberService } from '../service/member.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ListboxModule } from 'primeng/listbox';
import { SharedService } from '../service/share.service';

@Component({
  selector: 'app-navbar',
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
    ListboxModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './navbar.component.html',
  animations: [
    trigger('togglePassword', [
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('300ms ease-in-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({ opacity: 0, height: '0px' }))
      ])
    ])
  ],
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isDarkMode: boolean = false;
  categoryItems: MegaMenuItem[] | undefined;
  visibleNotify: any;
  searchKey: any;
  searchStories: any;
  userID: any;
  userInitial: string = '';

  // Actions personal
  visibleUpdateForm: boolean = false;
  visibleReadingHistoryForm: boolean = false;
  primaryImg: any;
  primaryImgDisplay: any;
  inforMember: any = {};
  isChangePassword: boolean = false;
  newPassword: any;
  comfirmPassword: any;
  oldPassword: any;
  historyStories: any[] = [];
  selectedHistoryFilter: string = 'all';
  visibleInterestingForm: any;
  favoriteStories: any[] = [];
  notifications: any[] = [];

  notifyItems: MenuItem[] = [
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
  userMenuItems: MenuItem[] = [
    { label: 'Hồ sơ', icon: 'pi pi-user', command: () => this.showFormUpdateMemberInfor() },
    { label: 'Yêu thích', icon: 'pi pi-heart', command: () => this.showFormFavoriteStories() },
    { label: 'Lịch sử', icon: 'pi pi-history', command: async () => await this.showFormHistoryStories() },
    { label: 'Đăng xuất', icon: 'pi pi-sign-out', command: () => this.logout() }
  ]

  constructor(
    private themeService: ThemeService,
    private sidebarService: SidebarService,
    private _categoryService: categoryService,
    private _storyService: storyService,
    private _notificationService: notificationService,
    private _sharedService: SharedService,
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private signalRService: SignalRService,
    private _memberService: memberService,
    private cdr: ChangeDetectorRef
  ) { }

  logout() {
    localStorage.removeItem('user');
    this.userID = null;
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userID = user.userID;
    this.userInitial = this.getUserInitial(user.username || '');
    this.getCategories();
    this.loadNotifications();
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

    this._sharedService.logoutSubject$.subscribe(()=>{
      this.logout();
    })
  }

  initializeSignalR() {
    if (this.userID) {
      this.signalRService.startConnection(this.userID.toString()).then(() => {
        console.log('SignalR Connected');
        this.signalRService.notification$.subscribe((notification: any) => {
          console.log('Navbar received notification:', notification);
          // Kiểm tra trùng lặp trước khi thêm
          if (!this.notifications.some(n => n.id === notification.id)) {
            this.notifications.unshift(notification); // Thêm vào đầu danh sách
            this.cdr.detectChanges(); // Cập nhật giao diện
          }
        });
      }).catch(err => console.error('SignalR Connection Error:', err));
    }
  }

  loadNotifications() {
    if (this.userID) {
      this._notificationService.getNotifications(this.userID).subscribe({
        next: (res: any) => {
          if (res && res.isSuccess) {
            this.notifications = res.data;
            this.cdr.detectChanges(); // Đảm bảo giao diện cập nhật
          }
        },
        error: (err) => console.error('Error loading notifications:', err)
      });
    }
  }

  getUnreadNotificationsCount(): string {
    const unreadCount = this.notifications.filter(noti => !noti.isRead).length;
    return unreadCount > 0 ? unreadCount.toString() : '';
  }

  getUserInitial(username: string): string {
    return username ? username.charAt(0).toUpperCase() : 'U'; // Mặc định là 'U' nếu không có tên
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

  getCategories() {
    this._categoryService.getCategories().subscribe((res: any) => {
      if (res && res.isSuccess === true) {
        const itemsPerColumn = 2; // Số danh mục mỗi cột
        const columns = [];
        for (let i = 0; i < res.data.length; i += itemsPerColumn) {
          columns.push(res.data.slice(i, i + itemsPerColumn));
        }
        this.categoryItems = [
          {
            label: 'Thể loại',
            items: columns
          }
        ];
      }
    });
  }

  navigateToContact() {
    this.router.navigate(['/about-us']);
  }

  showDialogNotify() {
    this.visibleNotify = true;
  }

  searchStory() {
    this._storyService.searchStories(this.searchKey).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.searchStories = res.data;
        this._storyService.setSearchStories(res.data);
      }
    })
    this.router.navigate(['']);
  }

  onSearchKeyChange() {
    if (!this.searchKey.trim()) {
      this.searchStories = []; // Reset local data
      this._storyService.setSearchStories([]);
    }
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

  onUpload(event: any) {
    const file = event.files[0];
    const maxSizeKB = 1000;
    if (file.size / 1024 > maxSizeKB) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Kích thước ảnh không được lớn hơn 1MB'
      });
      return;
    }

    const reader = new FileReader();
    this.primaryImg = file;
    reader.onload = (e: any) => {
      this.primaryImgDisplay = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onChangePassword() {
    this.isChangePassword = !this.isChangePassword;
    if (!this.isChangePassword) {
      this.newPassword = '';
      this.comfirmPassword = '';
    }
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
      this.messageService.add({ severity: 'warn', summary: 'Lỗi', detail: 'Mật khẩu không khớp' });
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
        this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: res.data });
      }
      else {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: res.data });
      }
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

  async getReadingHistoriesByRange(filter: string) {
    this.selectedHistoryFilter = filter;
    const res: any = await lastValueFrom(this._memberService.getReadingHistoriesByRange(this.userID, filter));
    console.log('Kết quả API:', res);

    if (res && res.isSuccess) {
      this.historyStories = res.data;
      this.cdr.detectChanges();  // Cập nhật giao diện ngay lập tức
    } else {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: res.data });
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

  onLikeStory(storyID: any) {
    this._storyService.likeStory(this.userID, storyID).subscribe();
  }
}
