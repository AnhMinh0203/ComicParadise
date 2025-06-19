import { Component, ViewChildren, QueryList, ElementRef, ChangeDetectorRef } from '@angular/core';
import { chapterService } from '../../service/chapter.service';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../core/share/shared.module';
import { ConfirmationService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Observable, tap } from 'rxjs';
import { getUserIdFromToken } from '../../../core/helpers/token-helper';
import { ResponseHandler } from '../../../core/helpers/response-handler';

@Component({
  selector: 'app-chapter-management',
  imports: [
    SharedModule,
    PanelModule,
    ScrollPanelModule
  ],
  providers: [ConfirmationService],
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
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private _responseHandler: ResponseHandler
  ) { }

  ngOnInit(): void {
    this.currentUserId = getUserIdFromToken();

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
      this._responseHandler.showWarning('Số trang không hợp lệ');
      return;
    }
    const index = this.pageNumber - 1;
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
          this._responseHandler.showWarning('Số trang không hợp lệ');
          return;
        }

        this._chapterService.deleteChapterPage(this.storyID, this.chapterNumber, this.deletePageNumber).subscribe(res => {
          if (res && res.isSuccess == true) {
            this._responseHandler.showwSuccess('Xóa trang thành công');
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
        this._responseHandler.showwSuccess('Thay thế trang thành công');
        this.loadChapterContentWhenReplace().subscribe(() => {
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
      chapterPage: this.pageNumberAdd || null,
      file: this.newPageAdd
    };
    this._chapterService.addChapterPage(model).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this._responseHandler.showwSuccess('Thêm trang thành công');
        this.loadChapterContent();
        this.pageNumberAdd = null;
        this.newPageAdd = null;
      }
    });
  }

}
