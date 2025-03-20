import { Component } from '@angular/core';
import { SharedModule } from '../../core/share/shared.module';
import { SidebarService } from '../service/sidebar.service';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuItem } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ThemeService } from '../../core/share/theme.service';
import { categoryService } from '../service/category.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  items: MenuItem[] = [];
  isDarkMode: boolean = false;

  constructor(
    private sidebarService: SidebarService,
    private themeService: ThemeService,
    private _categoryService: categoryService,
    private http: HttpClient,
    private router: Router,
  ) {
    this.sidebarService.sidebarState$.subscribe(state => {
      this.isSidebarOpen = state;
    });
  }

  ngOnInit() {
    this.getCategories();
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

  getCategories() {
    this._categoryService.getCategories().subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.items = res.data
        console.log(res.data)
      }
    })
  }

  navigateToContact() {
    this.router.navigate(['/about-us']);
  }
}
