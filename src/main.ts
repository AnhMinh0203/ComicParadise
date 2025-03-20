import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

import { LoginComponent } from './app/core/authen/login/login.component';


import { provideHttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  ...appConfig, // giữ lại các cấu hình đã có trong appConfig
  providers: [
    ...appConfig.providers, // kết hợp providers đã có
    provideHttpClient(),
    importProvidersFrom(RouterModule.forRoot(routes)) // thêm router vào providers
  ]
})
.catch((err) => console.error(err));
