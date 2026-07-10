import { inject }         from '@angular/core';
import { CanActivateFn }  from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AuthStore }      from '../store/auth.store';

export const twoFaGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  // En dev (skipKeycloak=true), KeycloakService n'est pas fourni → optional = null
  const keycloak  = inject(KeycloakService, { optional: true });

  if (authStore.is2FaCleared()) return true;

  // Mode dev sans Keycloak : laisse passer pour visualiser l'UI
  if (!keycloak) return true;

  await keycloak.login({ redirectUri: window.location.href });
  return false;
};
