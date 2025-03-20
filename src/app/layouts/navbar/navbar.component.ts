import { Component } from '@angular/core';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SharedModule } from '../../core/share/shared.module';
import { ThemeService } from '../../core/share/theme.service';
import { MegaMenuModule } from 'primeng/megamenu';
import { MegaMenuItem } from 'primeng/api';
import { SidebarService } from '../service/sidebar.service';
import { categoryService } from '../service/category.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-navbar',
  imports: [
    SharedModule,
    ToggleSwitchModule,
    MegaMenuModule,
    DialogModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isDarkMode: boolean = false;
  items: MegaMenuItem[] | undefined;
  visibleNotify: any;

  constructor(
    private themeService: ThemeService,
    private sidebarService: SidebarService,
    private _categoryService: categoryService,
    private http: HttpClient,
    private router: Router,
  ) { }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  ngOnInit() {
    this.getCategories();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

  getCategories() {
    this._categoryService.getCategories().subscribe((res: any) => {
      if (res && res.isSuccess === true) {
        const itemsPerColumn = 2; // Số danh mục mỗi cột
        const columns = [];
        for (let i = 0; i < res.data.length; i += itemsPerColumn) {
          columns.push(res.data.slice(i, i + itemsPerColumn));
        }
        this.items = [
          {
            label: 'Thể loại',
            items: columns
          }
        ];
      }
    });
  }

  navigateToContact() {
    this.router.navigate(['/about-us']);
  }

  showDialogNotify() {
    this.visibleNotify = true;
  }

}
