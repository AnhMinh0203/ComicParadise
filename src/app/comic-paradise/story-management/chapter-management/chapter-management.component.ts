import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { chapterService } from '../../service/chapter.service';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../core/share/shared.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';

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

  constructor(
    private route: ActivatedRoute,
    private _chapterService: chapterService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.storyID = +this.route.snapshot.paramMap.get('storyID')!;
    this.chapterNumber = +this.route.snapshot.paramMap.get('chapterNumber')!;
    this.loadChapterContent();
  }

  loadChapterContent(): void {
    this._chapterService.getChapterContent(this.storyID, this.chapterNumber)
      .subscribe(res => {
        console.log(res);
        this.chapterContent = res.data;
      });
  }
  scrollToPage(): void {
    if (!this.pageNumber || this.pageNumber < 1 || this.pageNumber > this.pageImages.length) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Số trang không hợp lệ'
      });
      return;
    }

    const index = this.pageNumber - 1; // Chỉ số mảng bắt đầu từ 0
    const element = this.pageImages.toArray()[index].nativeElement;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

}
