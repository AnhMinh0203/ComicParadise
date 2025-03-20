import { ChangeDetectorRef, Component } from '@angular/core';
import { SharedModule } from '../../core/share/shared.module';
import { ActivatedRoute } from '@angular/router';
import { chapterService } from '../service/chapter.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-chapter-detail',
  imports: [
    SharedModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './chapter-detail.component.html',
  styleUrl: './chapter-detail.component.scss'
})
export class ChapterDetailComponent {
  chapterContent: any;
  storyID: any;
  chapterNumber: any;

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
  }

  loadChapterContent(): void {
    this._chapterService.getChapterContent(this.storyID, this.chapterNumber)
      .subscribe(res => {
        this.chapterContent = res.data;
        this.cdr.detectChanges();
      });
  }
}
