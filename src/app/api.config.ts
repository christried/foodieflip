import { InjectionToken } from '@angular/core';

/**
 * Injection token for the backend API base URL.
 * Provided at the browser level from environment.apiBaseUrl.
 * Overridden at the SSR level from process.env.API_BASE_URL (set as Heroku config var).
 */
export const API_BASE_URL = new InjectionToken<string>('api.base.url');
