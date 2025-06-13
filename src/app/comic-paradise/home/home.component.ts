import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MegaMenuItem, MenuItem, MessageService } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { CarouselModule } from 'primeng/carousel';

import { TabsModule } from 'primeng/tabs';
import { SharedModule } from '../../core/share/shared.module';
import { FooterComponent } from "../../layouts/footer/footer.component";
import { MegaMenuModule } from 'primeng/megamenu';
import { Router } from '@angular/router';
import { storyService } from '../service/story.service';
import { SkeletonModule } from 'primeng/skeleton';
import { ChatbotComponent } from "../../layouts/chatbot/chatbot.component";
import { ActivatedRoute } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

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
    SkeletonModule,
    ChatbotComponent
  ],
  providers: [ConfirmationService, MessageService],
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
  currentUpdateStories: any[] = [];

  topStoriesDay: any[] = [];
  topStoriesWeek: any[] = [];
  topStoriesMonth: any[] = [];

  searchStories: any[] = [];
  filterStoryByConditions: any[] = [];
  filterStoryByCategories: any[] = [];
  advanceStories: any[] = [];
  novelStories: any;
  selectedTab: string = "0";
  topType: string = "month";
  displayLimit: number = 4;
  currentUserId: any;

  isSearch: boolean = false;
  isFilterByConditions: boolean = false;
  isFilterByCategories: boolean = false;
  filterStoryByCategoriesResults: any;

  pageIndexNovelStory: number = 1;
  pageSizeNovelStory: number = 5;

  pageIndexCurrentUpdateStory: number = 1;
  pageSizeCurrentUpdateStory: number = 5;

  pageIndexAdvanceStory: number = 1;
  pageSizeAdvanceStory: number = 5;

  pageIndexDay = 1;
  pageIndexWeek = 1;
  pageIndexMonth = 1;

  pageSizeTopStory: number = 4;

  hasMoreCurrentUpdateStories = true;
  hasMoreAdvanceStories = true;

  // For top stories
  hasMoreDay = true;
  hasMoreWeek = true;
  hasMoreMonth = true;

  displayLimitMonth = 4;
  displayLimitWeek = 4;
  displayLimitDay = 4;



  constructor(
    private router: Router,
    private _storyService: storyService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) { }


  responsiveOptions: any[] | undefined;
  isDarkMode = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const categoryName = params['category'];
      if (categoryName) {
        this.getStoriesByCategoryName(categoryName);
      }
    });

    this.imageLoaded = this.images.map(() => false);

    // Subscribe để lắng nghe dữ liệu searchStories từ service
    this._storyService.searchStories$.subscribe((stories: any[]) => {
      this.searchStories = stories;
      this.isSearch = stories.length > 0;
    });

    this._storyService.filterStoryByConditions$.subscribe((stories: any[]) => {
      this.filterStoryByConditions = stories;
      this.isFilterByConditions = stories.length > 0;

      if (!this.isFilterByConditions) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Thông báo',
          detail: 'Không có truyện nào phù hợp với bộ lọc của bạn!'
        });
      }
    });

    this._storyService.filterStoryByCategories$.subscribe((stories: any[]) => {
      this.filterStoryByCategories = stories;
      this.isFilterByCategories = stories.length > 0;

      if (!this.isFilterByCategories) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Thông báo',
          detail: 'Không có truyện nào phù hợp với bộ lọc của bạn!'
        });
      }
    });

    this.getCurrentUpdateStories()
    this.onTabChange(this.selectedTab);
    this.getAdvanceStories();
    this.getNovelStories();

    const token = localStorage.getItem('accessToken');;
    if (!token) {
      return;
    }
    const decoded: any = jwtDecode(token);
    this.currentUserId = decoded.userID;
  }

  navigateToInforStory(storyID: number) {
    this.router.navigate(['/infor-story', storyID]);
  }

  getCurrentUpdateStories() {
    this._storyService.getCurrentUpdateStories(7, this.pageIndexCurrentUpdateStory, this.pageSizeCurrentUpdateStory).subscribe((res: any) => {
      if (res && res.isSuccess) {
        const newItems = res.data.items;
        this.currentUpdateStories = [...this.currentUpdateStories, ...newItems];
        if (newItems.length < this.pageSizeCurrentUpdateStory) {
          this.hasMoreCurrentUpdateStories = false;
        }
      }
    });
  }

  loadMoreCurrentUpdateStories() {
    this.pageIndexCurrentUpdateStory++;
    this.getCurrentUpdateStories();
  }

  getTopStories(type: string, pageIndex: number) {
    setTimeout(() => {
      this._storyService.getTopStories(type, pageIndex, this.pageSizeTopStory).subscribe((res: any) => {
        if (res && res.isSuccess) {
          const newItems = res.data.items;

          if (type === 'day') {
            this.topStoriesDay = [...this.topStoriesDay, ...newItems];
            this.hasMoreDay = newItems.length === this.pageSizeTopStory;
            this.pageIndexDay++;
          } else if (type === 'week') {
            this.topStoriesWeek = [...this.topStoriesWeek, ...newItems];
            this.hasMoreWeek = newItems.length === this.pageSizeTopStory;
            this.pageIndexWeek++;
          } else {
            this.topStoriesMonth = [...this.topStoriesMonth, ...newItems];
            this.hasMoreMonth = newItems.length === this.pageSizeTopStory;
            this.pageIndexMonth++;
          }
        }
      })
    }, 1000);
  }

  onTabChange(tabIndex: any) {
    this.selectedTab = tabIndex.toString();
    if (tabIndex === '0' && this.topStoriesMonth.length === 0) {
      this.getTopStories('month', this.pageIndexMonth);
    } else if (tabIndex === '1' && this.topStoriesWeek.length === 0) {
      this.getTopStories('week', this.pageIndexWeek);
    } else if (tabIndex === '2' && this.topStoriesDay.length === 0) {
      this.getTopStories('day', this.pageIndexDay);
    }
  }

  showMoreTopStories(type: string) {
    switch (type) {
      case 'month':
        this.displayLimitMonth += 4;
        if (this.displayLimitMonth > this.topStoriesMonth.length) {
          this.displayLimitMonth = this.topStoriesMonth.length;
        }
        break;
      case 'week':
        this.displayLimitWeek += 4;
        if (this.displayLimitWeek > this.topStoriesWeek.length) {
          this.displayLimitWeek = this.topStoriesWeek.length;
        }
        break;
      case 'day':
        this.displayLimitDay += 4;
        if (this.displayLimitDay > this.topStoriesDay.length) {
          this.displayLimitDay = this.topStoriesDay.length;
        }
        break;
    }
  }

  showLessTopStories(type: string) {
    switch (type) {
      case 'month':
        this.displayLimitMonth = 4;
        break;
      case 'week':
        this.displayLimitWeek = 4;
        break;
      case 'day':
        this.displayLimitDay = 4;
        break;
    }
  }


  getAdvanceStories() {
    setTimeout(() => {
      this._storyService.getAdvanceStories(1, this.pageIndexAdvanceStory, this.pageSizeAdvanceStory).subscribe((res: any) => {
        if (res && res.isSuccess) {
          const newItems = res.data.items;
          this.advanceStories = [...this.advanceStories, ...newItems];
          if (newItems.length < this.pageSizeAdvanceStory) {
            this.hasMoreAdvanceStories = false;
          }
        }
      })
      this.isLoadingStories = false;
    }, 1000);
  }
  loadMoreAdvanceStories() {
    this.pageIndexAdvanceStory++;
    this.getAdvanceStories();
  }

  getNovelStories() {
    this._storyService.getNovelStories(this.pageIndexNovelStory, this.pageSizeNovelStory).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.novelStories = res.data;
      }
    })
    this.isLoadingStories = false;
  }

  getStoriesByCategoryName(categoryName: any) {
    this._storyService.filterStoryByCategoryName(categoryName).subscribe((res: any) => {
      this.filterStoryByCategoriesResults = res.data;
      this._storyService.setFilterStoryByCategories(res.data);
    });
  }

}
