import { Component, OnInit } from '@angular/core';
import { MegaMenuItem, MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { CarouselModule } from 'primeng/carousel';

import { TabsModule } from 'primeng/tabs';
import { SharedModule } from '../../core/share/shared.module';
import { FooterComponent } from "../../layouts/footer/footer.component";
import { MegaMenuModule } from 'primeng/megamenu';
import { NavbarComponent } from "../../layouts/navbar/navbar.component";
import { Router } from '@angular/router';
import { storyService } from '../service/story.service';
import { SkeletonModule } from 'primeng/skeleton';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  imports: [
    SharedModule,
    InputTextModule,
    CarouselModule,
    TabsModule,
    MegaMenuModule,
    SkeletonModule
  ]
})
export class HomeComponent {

  items: MegaMenuItem[] | undefined;
  images: string[] = [
    '../../../assets/images/slide1.jpg',
    '../../../assets/images/slide2.jpg',
    '../../../assets/images/slide3.jpg',
    '../../../assets/images/slide4.jpg',
  ];
  // Skeleton
  imageLoaded: boolean[] = [];
  isLoadingStories = true;
  // ---
  isInforStoryPage: boolean = false;
  currentUpdateStories: any;
  topStories: any[] = [];
  searchStories: any[] = [];
  advanceStories: any[] = [];
  selectedTab: string = "0";
  topType: string = "month";
  displayLimit: number = 4;
  currentUserId: any;

  isSearch: boolean = false;

  constructor(
    private router: Router,
    private _storyService: storyService
  ) { }


  responsiveOptions: any[] | undefined;
  isDarkMode = false;

  ngOnInit() {
    this.imageLoaded = this.images.map(() => false);

    // Subscribe để lắng nghe dữ liệu searchStories từ service
    this._storyService.searchStories$.subscribe((stories: any[]) => {
      this.searchStories = stories;
      this.isSearch = stories.length > 0; // Cập nhật trạng thái tìm kiếm

    });
    this.currentUserId = JSON.parse(localStorage.getItem('user') || '{}').userID;
    this.getCurrentUpdateStories()
    this.getTopStories();
    this.getAdvanceStories();
  }

  navigateToInforStory(storyID: number) {
    this.router.navigate(['/infor-story', storyID]);
  }


  getCurrentUpdateStories() {
    this._storyService.getCurrentUpdateStories(7).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.currentUpdateStories = res.data
        console.log(res.data)
      }
    })
  }

  onTabChange(event: any) {
    const mapping = ["month", "week", "day"];
    this.topType = mapping[event] || "month";
    this.getTopStories();
  }


  getTopStories() {
    this._storyService.getTopStories(this.topType).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.topStories = res.data;

      }
    })
  }

  getAdvanceStories() {
    // Fix tạm userID

    setTimeout(() => {
      this._storyService.getAdvanceStories(1).subscribe((res: any) => {
        if (res && res.isSuccess) {
          this.advanceStories = res.data;
        }
      })
      this.isLoadingStories = false;
    }, 3000); // giả lập 1.5s delay


  }


  showMore() {
    this.displayLimit += 4; // Tăng giới hạn lên 4
    if (this.displayLimit > this.topStories.length) {
      this.displayLimit = this.topStories.length; // Không vượt quá tổng số truyện
    }
  }

  showLess() {
    this.displayLimit = 4; // Quay lại 4 truyện
  }


}
