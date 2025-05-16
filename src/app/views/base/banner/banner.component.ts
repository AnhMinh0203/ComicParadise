import { Component } from '@angular/core';
import { SharedModule } from '../../../core/share/shared.module';
import { bannerContentService } from '../service/banner.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CarouselModule } from 'primeng/carousel';
import { SpeedDialModule } from 'primeng/speeddial';

@Component({
  selector: 'app-banner',
  imports: [
    SharedModule,
    CarouselModule,
    SpeedDialModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  bannerImages: any[] = [];
  actions: MenuItem[] | null = null;
  constructor(
    private bannerContentService: bannerContentService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.getBanners();

    this.actions = [
      {
        icon: 'pi pi-pencil',
        command: (banner) => {
          this.onEditBanner(banner);
        }
      },
      {
        icon: 'pi pi-trash',
        command: (banner) => {
          this.onDeleteBanner(banner);
        }
      },

    ];
  }
  getBanners() {
    this.bannerContentService.getBanners().subscribe(
      (response: any) => {
        this.bannerImages = response.data;
        console.log('Banner images:', this.bannerImages);
      },
      (error: any) => {
        console.error('Error fetching banner images:', error);
      }
    );
  }



  onToggleActive(banner: any) {

  }

  setCurrentBanner(banner: any) {}
  onEditBanner(banner: any) {}
  onDeleteBanner(banner: any) {}

  openDialog(){

  }
}
