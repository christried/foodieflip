import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from './api.config';

export const authCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = inject(API_BASE_URL);

  if (!request.url.startsWith(apiBaseUrl) || request.withCredentials) {
    return next(request);
  }

  return next(
    request.clone({
      withCredentials: true,
    }),
  );
};
