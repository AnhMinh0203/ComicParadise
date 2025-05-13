import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { SharedModule } from '../../core/share/shared.module';
import { ActivatedRoute } from '@angular/router';
import { chapterService } from '../service/chapter.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { SpeedDialModule } from 'primeng/speeddial';

@Component({
  selector: 'app-chapter-detail',
  imports: [
    SharedModule,
    DropdownModule,
    SpeedDialModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './chapter-detail.component.html',
  styleUrl: './chapter-detail.component.scss'
})
export class ChapterDetailComponent {
  chapterContent: any;
  storyID: any;
  chapterNumber: any;
  currentUserId = JSON.parse(localStorage.getItem('user') || '{}').userID;
  chapterList: any[] = []; // lấy từ server
  selectedChapter: any;

  hasPreviousChapter = true; // xử lý logic theo vị trí chương
  hasNextChapter = true;
  showTopNavigator = false;
  private lastScrollTop = 0;
  // chapterActions: MenuItem[] = [];
  isBookmarked: any; // trạng thái đánh dấu chương


  constructor(
    private route: ActivatedRoute,
    private _chapterService: chapterService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.storyID = +this.route.snapshot.paramMap.get('storyID')!;
    this.chapterNumber = +this.route.snapshot.paramMap.get('chapterNumber')!;
    this.loadChapterContent();
    if(this.currentUserId) {
      this.checkBookmarkStatus();
    }
    this.mockChapterList();

    // this.chapterActions = [
    //   {
    //     icon: this.isBookmarked ? 'pi pi-bookmark-fill' : 'pi pi-bookmark',
    //     command: () => {
    //       this.markChapterNumber();
    //     }
    //   },
    //   {
    //     icon: 'pi pi-refresh',
    //     command: () => {
    //       this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
    //     }
    //   },
    // ];
  }

  get chapterActions(): MenuItem[] {
    return [
      {
        icon: this.isBookmarked ? 'pi pi-bookmark-fill' : 'pi pi-bookmark',
        command: () => {
          this.markChapterNumber();
        }
      },
      {
        icon: 'pi pi-refresh',
        command: () => {
          this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
        }
      },
    ];
  }


  loadChapterContent(): void {
    const userID = this.currentUserId != null ? this.currentUserId : undefined;

    this._chapterService.getChapterContent(this.storyID, this.chapterNumber, userID)
      .subscribe(res => {
        this.chapterContent = res.data;
        console.log("Chapter content: ", this.chapterContent);
        this.cdr.detectChanges();
      });
  }


  goToPreviousChapter() {
    // Gọi hàm để load chương trước
  }

  goToNextChapter() {
    // Gọi hàm để load chương tiếp theo
  }

  onChapterSelect(chapter: any) {
    // Điều hướng hoặc load chương tương ứng
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop < this.lastScrollTop) {
      // Scroll lên
      this.showTopNavigator = true;
    } else {
      // Scroll xuống
      this.showTopNavigator = false;
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  mockChapterList() {
    this.chapterList = [
      { title: 'Chương 1: Khởi đầu', number: 1 },
      { title: 'Chương 2: Gặp gỡ định mệnh', number: 2 },
      { title: 'Chương 3: Bí mật được hé lộ', number: 3 },
      { title: 'Chương 4: Đối đầu kẻ thù', number: 4 },
      { title: 'Chương 5: Sự thật cay đắng', number: 5 }
    ];

    // chọn chương hiện tại nếu muốn
    this.selectedChapter = this.chapterList[0];
  }

  markChapterNumber() {
    if (this.currentUserId == null) {
      this.messageService.add({ severity: 'warn', summary: 'Thông báo', detail: 'Vui lòng đăng nhập' });
      return;
    }

    const model = {
      StoryID: this.storyID,
      ChapterNumber: this.chapterNumber,
      UserID: this.currentUserId,
    }

    this._chapterService.markChapter(model).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.isBookmarked = !this.isBookmarked;
        this.messageService.add({ severity: 'success', summary: "Thông báo" , detail: res.data });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Thất bại', detail:  res.data });
      }
    });
  }

  checkBookmarkStatus() {
    const model = {
      StoryID: this.storyID,
      ChapterNumber: this.chapterNumber,
      UserID: this.currentUserId,
    }
    this._chapterService.isChapterBookmarked(model).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.isBookmarked = res.data;
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Thông báo', detail: res.data });
      }
    });
  }
}
