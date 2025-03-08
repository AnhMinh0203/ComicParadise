import { Component, OnInit } from '@angular/core';
import { chapterService } from '../../service/chapter.service';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../core/share/shared.module';

@Component({
  selector: 'app-chapter-management',
  imports: [
    SharedModule
  ],
  templateUrl: './chapter-management.component.html',
  styleUrl: './chapter-management.component.scss'
})
export class ChapterManagementComponent {
  chapterContent: any;
  storyID: any;
  chapterNumber: any;

  constructor(
    private route: ActivatedRoute,
    private _chapterService: chapterService
  ) { }

  ngOnInit(): void {
    this.storyID = +this.route.snapshot.paramMap.get('storyID')!;
    this.chapterNumber = +this.route.snapshot.paramMap.get('chapterNumber')!;
    this.loadChapterContent();
  }

  loadChapterContent(): void {
    // alert(this.storyID)
    // alert(this.chapterNumber)
    this._chapterService.getChapterContent(this.storyID, this.chapterNumber)
      .subscribe(res => {
        console.log(res);
        this.chapterContent = res.data;
      });
  }
}
