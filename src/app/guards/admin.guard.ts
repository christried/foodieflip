import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';

function resolveAdminAccess(authService: AuthService, router: Router): boolean | UrlTree {
  const user = authService.user();

  if (!user) {
    return router.parseUrl('/');
  }

  if (authService.needsUsername()) {
    return router.parseUrl('/user');
  }

  return user.role === 'ADMIN' ? true : router.parseUrl('/user');
}

export const adminGuard: CanActivateFn = (): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return resolveAdminAccess(authService, router);
  }

  return authService.bootstrapSession().pipe(
    map(() => resolveAdminAccess(authService, router)),
    catchError(() => of(router.parseUrl('/'))),
  );
};
