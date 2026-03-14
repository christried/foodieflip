import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_BASE_URL } from './api.config';
import { environment } from '../environments/environment';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // On Heroku, set API_BASE_URL as a config var to override without rebuilding.
    // Falls back to environment.apiBaseUrl (build-time value from environment.prod.ts).
    { provide: API_BASE_URL, useValue: process.env['API_BASE_URL'] || environment.apiBaseUrl },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
