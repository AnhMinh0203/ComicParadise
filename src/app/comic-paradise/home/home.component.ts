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
  // ---
  isInforStoryPage: boolean = false;
  currentUpdateStories: any;



  constructor(
    private router: Router,
    private _storyServce: storyService
  ) { }


  responsiveOptions: any[] | undefined;
  isDarkMode = false;

  ngOnInit() {
    this.getCurrentUpdateStories()


    // this.items = [
    //   {
    //     label: 'Loại truyện',

    //     items: [
    //       [
    //         {
    //           label: 'Living Room',
    //           items: [
    //             { label: 'Accessories' },
    //             { label: 'Armchair' },
    //             { label: 'Coffee Table' },
    //             { label: 'Couch' },
    //             { label: 'TV Stand' },
    //           ],
    //         },
    //       ],
    //       [
    //         {
    //           label: 'Kitchen',
    //           items: [{ label: 'Bar stool' }, { label: 'Chair' }, { label: 'Table' }],
    //         },
    //       ],
    //     ],
    //   },
    // ];
  }

  navigateToInforStory(storyID: number) {
    this.router.navigate(['/infor-story', storyID]);
  }


  getCurrentUpdateStories(){
    this._storyServce.getCurrentUpdateStories(7).subscribe((res:any)=>{
      if(res && res.isSuccess){
        this.currentUpdateStories = res.data
        console.log(res.data)
      }
    })
  }
}
