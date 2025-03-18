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
    FooterComponent,
    MegaMenuModule,
    NavbarComponent
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

  constructor(
    private router: Router,

  ) { }


  responsiveOptions: any[] | undefined;
  isDarkMode = false;
  ngOnInit() {
    this.items = [
      {
        label: 'Loại truyện',

        items: [
          [
            {
              label: 'Living Room',
              items: [
                { label: 'Accessories' },
                { label: 'Armchair' },
                { label: 'Coffee Table' },
                { label: 'Couch' },
                { label: 'TV Stand' },
              ],
            },
          ],
          [
            {
              label: 'Kitchen',
              items: [{ label: 'Bar stool' }, { label: 'Chair' }, { label: 'Table' }],
            },
          ],
        ],
      },
    ];
  }

  test() {
    alert("abc")
    this.router.navigate(['/infor-story']);
  }
}
