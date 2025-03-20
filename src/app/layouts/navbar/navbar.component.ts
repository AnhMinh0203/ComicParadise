import { Component } from '@angular/core';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SharedModule } from '../../core/share/shared.module';
import { ThemeService } from '../../core/share/theme.service';
import { MegaMenuModule } from 'primeng/megamenu';
import { MegaMenuItem } from 'primeng/api';
import { SidebarService } from '../service/sidebar.service';

@Component({
  selector: 'app-navbar',
  imports: [
    SharedModule,
    ToggleSwitchModule,
    MegaMenuModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isDarkMode: boolean = false;
  items: MegaMenuItem[] | undefined;

  constructor(
    private themeService: ThemeService,
    private sidebarService: SidebarService
  ) {}

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Thể loại',
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
              label: 'Bedroom',
              items: [
                { label: 'Bed' },
                { label: 'Chaise lounge' },
                { label: 'Cupboard' },
                { label: 'Dresser' },
                { label: 'Wardrobe' },
              ],
            },
          ],

        ],
      }

    ];
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

}
