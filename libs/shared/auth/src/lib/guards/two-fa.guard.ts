import { inject }         from '@angular/core';
import { CanActivateFn }  from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

import { AuthStore } from '../store/auth.store';

/**
 * Impose ACR=2 (OTP Keycloak) pour les routes sensibles.
 * Utilisé sur /academic/** (ADR : 2FA obligatoire pour ADMIN, DIR, COMPTABLE, ENSEIGNANT).
 *
 * Si le token n'a pas ACR=2, relance le flow Keycloak avec acr_values=2.
 */
export const twoFaGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const keycloak  = inject(KeycloakService);

  if (authStore.is2FaCleared()) {
    return true;
  }

  // Force le step-up Keycloak avec ACR level 2 (OTP TOTP/HOTP configuré)
  await keycloak.login({
    acr: {
      values:    { 2: 'CONFIGURED_OTP' },
      essential: true,
    } as Record<string, unknown>,
    redirectUri: window.location.href,
  });

  return false;
};
