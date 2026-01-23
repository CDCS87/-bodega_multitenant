import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // 1. Importar esto
import { provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor'; // 2. Importar tu Interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular(),
    provideRouter(routes),
    
    // 3. ¡AQUÍ ESTÁ LA MAGIA!
    // Activamos HttpClient Y le conectamos el Interceptor
    provideHttpClient(
      withInterceptors([AuthInterceptor]) 
    ),
  ],
};

