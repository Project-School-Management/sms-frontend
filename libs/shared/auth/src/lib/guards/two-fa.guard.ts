import { inject }         from '@angular/core';
import { CanActivateFn }  from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AuthStore }      from '../store/auth.store';

export const twoFaGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const keycloak  = inject(KeycloakService);

  if (authStore.is2FaCleared()) return true;

  await keycloak.login({ redirectUri: window.location.href });
  return false;
};
