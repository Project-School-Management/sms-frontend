import { inject }         from '@angular/core';
import { CanActivateFn }  from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

/**
 * Vérifie que l'utilisateur est connecté — redirige vers Keycloak sinon.
 * En mode dev (KeycloakService non fourni) : laisse passer sans auth.
 * Utiliser sur toutes les routes protégées.
 */
export const authGuard: CanActivateFn = async (_, state) => {
  // En dev (skipKeycloak=true), KeycloakService n'est pas fourni → optional = null
  const keycloak = inject(KeycloakService, { optional: true });

  // Mode dev sans Keycloak : accès libre pour visualiser l'UI
  if (!keycloak) return true;

  let isLoggedIn = false;
  try {
    isLoggedIn = await keycloak.isLoggedIn();
  } catch {
    return true;
  }

  if (!isLoggedIn) {
    await keycloak.login({ redirectUri: window.location.origin + state.url });
    return false;
  }

  return true;
};
