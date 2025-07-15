import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
bootstrapApplication(AppComponent, {
  ...appConfig, 
  providers: [
    ...appConfig.providers, 
    provideHttpClient(),
    importProvidersFrom(RouterModule.forRoot(routes)),
    MessageService
  ]
})
  .catch((err) => console.error(err));
