import { Component } from '@angular/core';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SharedModule } from '../../core/share/shared.module';
import { ThemeService } from '../../core/share/theme.service';


@Component({
  selector: 'app-navbar',
  imports: [
    SharedModule,
    ToggleSwitchModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isDarkMode: boolean = false;

  constructor(private themeService: ThemeService) {

  }
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }
}
