// /// <reference types="@angular/localize" />

// import { bootstrapApplication } from '@angular/platform-browser';

// import { AppComponent } from './app/app.component';
// import { appConfig } from './app/app.config';

// bootstrapApplication(AppComponent, appConfig)
//   .catch(err => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  ...appConfig, // giữ lại các cấu hình đã có trong appConfig
  providers: [
    ...appConfig.providers, // kết hợp providers đã có
    provideHttpClient(),
    importProvidersFrom(RouterModule.forRoot(routes)) // thêm router vào providers
  ]
})
.catch((err) => console.error(err));
