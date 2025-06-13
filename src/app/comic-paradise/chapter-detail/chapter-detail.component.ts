import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { SharedModule } from '../../core/share/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { chapterService } from '../service/chapter.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { SpeedDialModule } from 'primeng/speeddial';
import { jwtDecode } from 'jwt-decode';

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
  currentUserId: any;
  chapterList: any[] = []; // lấy từ server
  selectedChapter: any;

  hasPreviousChapter = true; // xử lý logic theo vị trí chương
  hasNextChapter = true;
  showTopNavigator = false;
  private lastScrollTop = 0;
  // chapterActions: MenuItem[] = [];
  isBookmarked: any; // trạng thái đánh dấu chương

  // Text to speech
  speechSynthesis: SpeechSynthesis = window.speechSynthesis;
  utterance: SpeechSynthesisUtterance | null = null;
  voices: SpeechSynthesisVoice[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _chapterService: chapterService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {


    this.activatedRoute.paramMap.subscribe(params => {
      this.storyID = +params.get('storyID')!;
      this.chapterNumber = +params.get('chapterNumber')!;
      this.loadChapterList();
      this.loadChapterContent();

      const token = localStorage.getItem('accessToken');;
      if (!token) {
        return;
      }
      const decoded: any = jwtDecode(token);
      this.currentUserId = decoded.userID;

      if (this.currentUserId) {
        this.checkBookmarkStatus();
      }
    });

    // Text to speech
    window.speechSynthesis.onvoiceschanged = () => {
      // Đảm bảo voices đã load xong
      this.voices = window.speechSynthesis.getVoices();
    };
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
          this.loadChapterContent(true);
        }
      },
      {
        icon: 'pi pi-arrow-left',
        command: () => {
          this.router.navigate(['/infor-story', this.storyID]);
        }
      },
      {
        icon: 'pi pi-home',
        command: () => {
          this.router.navigate(['/home']);
        }
      },
    ];
  }


  loadChapterContent(showToast: boolean = false): void {
    const userID = this.currentUserId != null ? this.currentUserId : undefined;

    this._chapterService.getChapterContent(this.storyID, this.chapterNumber, userID)
      .subscribe(res => {
        this.chapterContent = res.data;
        if (showToast) {
          this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: 'Chương đã được tải lại' });
        }
        this.cdr.detectChanges();
      }, err => {
        if (showToast) {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải lại chương' });
        }
      });
  }



  goToPreviousChapter() {
    this.router.navigate(['/chapter-content', this.storyID, this.chapterNumber - 1]);
  }

  goToNextChapter() {
    this.router.navigate(['/chapter-content', this.storyID, this.chapterNumber + 1]);
  }

  onChapterSelect(chapter: any) {
    this.router.navigate(['/chapter-content', this.storyID, chapter.number]);
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

  // mockChapterList() {
  //   this.chapterList = [
  //     { title: 'Chương 1: Khởi đầu', number: 1 },
  //     { title: 'Chương 2: Gặp gỡ định mệnh', number: 2 },
  //     { title: 'Chương 3: Bí mật được hé lộ', number: 3 },
  //     { title: 'Chương 4: Đối đầu kẻ thù', number: 4 },
  //     { title: 'Chương 5: Sự thật cay đắng', number: 5 }
  //   ];

  //   // chọn chương hiện tại nếu muốn
  //   this.selectedChapter = this.chapterList[0];
  // }

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
        this.messageService.add({ severity: 'success', summary: "Thông báo", detail: res.data });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: res.data });
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

  loadChapterList(): void {
    this._chapterService.getChapterList(this.storyID).subscribe((res: any) => {
      this.chapterList = res.data.map((number: any) => ({
        title: `Chương ${number}`,
        number: number
      }));

      this.selectedChapter = this.chapterList.find(c => c.number === this.chapterNumber);
      this.checkHasPrevNext();
      this.cdr.detectChanges();
    }, (err) => {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách chương' });
    });
  }

  checkHasPrevNext() {
    const chapterNumbers = this.chapterList.map(c => c.number);
    this.hasPreviousChapter = chapterNumbers.includes(this.chapterNumber - 1);
    this.hasNextChapter = chapterNumbers.includes(this.chapterNumber + 1);
  }

  // --- Text to speech ---
  readAloud() {
    if (this.chapterContent && this.chapterContent.storyType === 'Novel') {
      const rawText = this.stripHtmlTags(this.chapterContent.content);
      const voices = window.speechSynthesis.getVoices();
      console.log("--- voices");
      console.log(this.voices);
      console.log("--- voices");

      // Tìm voice tiếng Việt
      const vietnameseVoice = this.voices.find(voice =>
        voice.lang === 'vi-VN' || voice.name.toLowerCase().includes('vietnam')
      );

      this.utterance = new SpeechSynthesisUtterance(rawText);
      this.utterance.lang = 'vi-VN';
      this.utterance.voice = vietnameseVoice || null;
      this.utterance.rate = 1;
      this.utterance.pitch = 1;

      window.speechSynthesis.speak(this.utterance);
    }
  }


  // Hàm dừng đọc
  stopReading() {
    this.speechSynthesis.cancel();
  }

  // Hàm loại bỏ thẻ HTML để lấy text sạch
  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
}

