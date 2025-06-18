import { Component, OnInit, ViewChildren, QueryList, ElementRef, ChangeDetectorRef } from '@angular/core';
import { chapterService } from '../../service/chapter.service';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../core/share/shared.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-chapter-management',
  imports: [
    SharedModule,
    PanelModule,
    ScrollPanelModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './chapter-management.component.html',
  styleUrl: './chapter-management.component.scss'
})
export class ChapterManagementComponent {
  @ViewChildren('pageImage') pageImages!: QueryList<ElementRef>;

  chapterContent: any;
  storyID: any;
  chapterNumber: any;
  pageNumber: any;
  pageNumberReplace: any;
  pageNumberAdd: any;
  newPageReplace: any;
  newPageAdd: any;
  deletePageNumber: any;
  currentUserId: any;

  constructor(
    private route: ActivatedRoute,
    private _chapterService: chapterService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
        const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    const decoded: any = jwtDecode(token);
    this.currentUserId = decoded.userID;

    this.storyID = +this.route.snapshot.paramMap.get('storyID')!;
    this.chapterNumber = +this.route.snapshot.paramMap.get('chapterNumber')!;
    this.loadChapterContent();
  }

  loadChapterContent(): void {
    this._chapterService.getChapterContent(this.storyID, this.chapterNumber, this.currentUserId)
      .subscribe(res => {
        this.chapterContent = res.data;
        console.log(this.chapterContent);
        this.cdr.detectChanges();
      });
  }
  scrollToPage() {
    if (!this.pageNumber || this.pageNumber < 1 || this.pageNumber > this.pageImages.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Lỗi',
        detail: 'Số trang không hợp lệ'
      });
      return;
    }

    const index = this.pageNumber - 1; // Chỉ số mảng bắt đầu từ 0
    const element = this.pageImages.toArray()[index].nativeElement;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  deletePage(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Xác nhận xóa trang này?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Hủy',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Xác nhận',
        severity: 'danger',
      },

      accept: () => {
        if (!this.deletePageNumber || this.deletePageNumber < 1 || this.deletePageNumber > this.pageImages.length) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Lỗi',
            detail: 'Số trang không hợp lệ'
          });
          return;
        }

        this._chapterService.deleteChapterPage(this.storyID, this.chapterNumber, this.deletePageNumber).subscribe(res => {
          if (res && res.isSuccess == true) {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Xóa trang thành công'
            });
            this.loadChapterContent();
          }
          this.chapterContent = res.data;
        });
      }
    });
  }
  onFileToReplaceSelected(event: any) {
    this.newPageReplace = event.files[0];
  }

  replaceChapterPage(event: any) {
    const model = {
      storyID: this.storyID,
      chapterNumber: this.chapterNumber,
      chapterPage: this.pageNumberReplace,
      file: this.newPageReplace
    };
    this._chapterService.replaceChapterPage(model).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Thay thế trang thành công'
        });
        this.loadChapterContentWhenReplace().subscribe(() => {
          // Thêm timestamp để phá cache
          const index = this.pageNumberReplace - 1;
          this.chapterContent.imageUrls[index] = `${this.chapterContent.imageUrls[index]}?t=${Date.now()}`;
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadChapterContentWhenReplace(): Observable<any> {
    return this._chapterService.getChapterContent(this.storyID, this.chapterNumber, this.currentUserId)
      .pipe(
        tap(res => {
          this.chapterContent = res.data;
          this.cdr.detectChanges();
        })
      );
  }

  onFileToAddSelected(event: any) {
    this.newPageAdd = event.files[0];
  }

  addChapterPage(event: any) {
    const model = {
      storyID: this.storyID,
      chapterNumber: this.chapterNumber,
      chapterPage: this.pageNumberAdd || null, // Null nếu không chỉ định vị trí
      file: this.newPageAdd
    };
    this._chapterService.addChapterPage(model).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Thêm trang mới thành công'
        });
        this.loadChapterContent();
        this.pageNumberAdd = null;
        this.newPageAdd = null;
      }
    });
  }

}
