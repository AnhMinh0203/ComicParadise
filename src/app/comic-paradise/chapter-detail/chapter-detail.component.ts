import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { SharedModule } from '../../core/share/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { chapterService } from '../service/chapter.service';
import { MenuItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { SpeedDialModule } from 'primeng/speeddial';
import { jwtDecode } from 'jwt-decode';
import { ResponseHandler } from '../../core/helpers/response-handler';
import { getUserIdFromToken } from '../../core/helpers/token-helper';
@Component({
  selector: 'app-chapter-detail',
  imports: [
    SharedModule,
    DropdownModule,
    SpeedDialModule,

  ],
  templateUrl: './chapter-detail.component.html',
  styleUrl: './chapter-detail.component.scss'
})
export class ChapterDetailComponent {
  chapterContent: any;
  storyID: any;
  chapterNumber: any;
  currentUserId: any;
  chapterList: any[] = [];
  selectedChapter: any;
  hasPreviousChapter = true;
  hasNextChapter = true;
  showTopNavigator = false;
  lastScrollTop = 0;
  isBookmarked: any;

  speechSynthesis: SpeechSynthesis = window.speechSynthesis;
  utterance: SpeechSynthesisUtterance | null = null;
  voices: SpeechSynthesisVoice[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _chapterService: chapterService,
    private responseHandler: ResponseHandler,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.storyID = +params.get('storyID')!;
      this.chapterNumber = +params.get('chapterNumber')!;
      this.loadChapterList();
      this.loadChapterContent();
      this.currentUserId = getUserIdFromToken();

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
          this.responseHandler.showwSuccess('Chương đã được tải lại');
        }
        this.cdr.detectChanges();
      }, err => {
        if (showToast) {
          this.responseHandler.showError('Không thể tải chương này');
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

  markChapterNumber() {
    if (this.currentUserId == null) {
      this.responseHandler.showWarning('Vui lòng đăng nhập');
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
        this.responseHandler.showwSuccess(res.data);
      } else {
        this.responseHandler.showError(res.data);
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
        this.responseHandler.showWarning(res.data);
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
      this.responseHandler.showError('Không thể tải danh sách chương');
    });
  }

  checkHasPrevNext() {
    const chapterNumbers = this.chapterList.map(c => c.number);
    this.hasPreviousChapter = chapterNumbers.includes(this.chapterNumber - 1);
    this.hasNextChapter = chapterNumbers.includes(this.chapterNumber + 1);
  }

  readAloud() {
    if (this.chapterContent && this.chapterContent.storyType === 'Novel') {
      const rawText = this.stripHtmlTags(this.chapterContent.content);
      const voices = window.speechSynthesis.getVoices();
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

