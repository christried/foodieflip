import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth.service';

function _resolveAdminAccess(authService: AuthService, router: Router): boolean | UrlTree {
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
    return _resolveAdminAccess(authService, router);
  }

  return authService.waitForBootstrapCompletion().pipe(
    map(() => _resolveAdminAccess(authService, router)),
  );
};
