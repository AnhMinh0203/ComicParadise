import { Component } from '@angular/core';
import { SharedModule } from '../../core/share/shared.module';
import { SidebarService } from '../service/sidebar.service';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuItem } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ThemeService } from '../../core/share/theme.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    SharedModule,
    MegaMenuModule,
    AccordionModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  isSidebarOpen: boolean = false;
  visibleCategories: boolean = false;
  activeCategoryIndex: number | null = null;

  items: MenuItem[] = [
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
  ];
  isDarkMode: boolean = false;

  constructor(
    private sidebarService: SidebarService,
    private themeService: ThemeService
  ) {
    this.sidebarService.sidebarState$.subscribe(state => {
      this.isSidebarOpen = state;
    });
  }

  ngOnInit() {

  }
  closeSidebar() {
    this.sidebarService.toggleSidebar();
  }

  showCategories() {
    this.visibleCategories = true;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

}
