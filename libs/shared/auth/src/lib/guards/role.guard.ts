import { inject }         from '@angular/core';
import { CanActivateFn }  from '@angular/router';
import { Router }         from '@angular/router';

import { Role }      from '@sms/shared/models';
import { AuthStore } from '../store/auth.store';

/**
 * Vérifie que l'utilisateur possède l'un des rôles autorisés.
 * Redirige vers /dashboard si le rôle est insuffisant.
 *
 * Usage :
 *   canActivate: [authGuard, roleGuard([Role.ADMIN, Role.DIR])]
 */
export const roleGuard = (allowedRoles: Role[]): CanActivateFn => () => {
  const authStore = inject(AuthStore);
  const router    = inject(Router);

  const role = authStore.userRole();

  if (role && allowedRoles.includes(role)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
