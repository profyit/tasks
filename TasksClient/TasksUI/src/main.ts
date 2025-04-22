import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core'; // <-- Import Date Adapter provider

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes'; // Import routes
import { authInterceptor } from './app/core/interceptors/auth.interceptor'; // Import interceptor

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes), // Setup routing
    provideHttpClient(withInterceptors([authInterceptor])), // Setup HttpClient with interceptor(s)
    provideAnimations(), // Setup animations for Angular Material
    provideNativeDateAdapter() // <-- Add provider for MatDatepicker
  ]
}).catch(err => console.error(err));
