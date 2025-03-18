import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.darkMode.asObservable();

  constructor() {
    // Check user's preferred color scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.setDarkMode(prefersDark.matches);

    // Listen for changes in system theme
    prefersDark.addEventListener('change', (e) => {
      this.setDarkMode(e.matches);
    });
  }

  setDarkMode(isDark: boolean) {
    this.darkMode.next(isDark);
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
