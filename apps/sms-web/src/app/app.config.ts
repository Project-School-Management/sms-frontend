import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions }   from '@angular/router';
import { provideHttpClient, withInterceptors }                             from '@angular/common/http';
import { provideAnimationsAsync }                                          from '@angular/platform-browser/animations/async';
import { provideServiceWorker }                                            from '@angular/service-worker';
import { KeycloakService }                                                 from 'keycloak-angular';

import { APP_ROUTES }       from './app.routes';
import { tenantInterceptor } from '@sms/shared/auth';
import { errorInterceptor }  from '@sms/shared/auth';
import { authInterceptor }   from '@sms/shared/auth';
import { AuthService }       from '@sms/shared/auth';
import { AuthStore }         from '@sms/shared/auth';
import { EspaceStore }       from '@sms/shared/auth';
import { environment }       from '../environments/environment';

// ── Keycloak initializer ──────────────────────────────────────────────────────
function initKeycloak(
  keycloak: KeycloakService,
  authService: AuthService,
  authStore: InstanceType<typeof AuthStore>,
  espaceStore: InstanceType<typeof EspaceStore>,
) {
  return async (): Promise<void> => {
    const authenticated = await keycloak.init({
      config: {
        url:      environment.keycloakUrl,
        realm:    environment.keycloakRealm,
        clientId: environment.keycloakClient,
      },
      initOptions: {
        onLoad:                      'check-sso',
        silentCheckSsoRedirectUri:   window.location.origin + '/assets/silent-check-sso.html',
        pkceMethod:                  'S256',
        checkLoginIframe:            false,
      },
    });

    if (authenticated) {
      authService.loadUserProfile();
      const user = authStore.currentUser();
      // Charge les affectations multi-espaces (mock — docs/architecture/tenancy-model.md §6)
      if (user) await espaceStore.loadEspaces(user);
    }
  };
}

// ── Providers communs (toujours chargés) ──────────────────────────────────────
const commonProviders = [
  provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(
    APP_ROUTES,
    withComponentInputBinding(),
    withViewTransitions(),
  ),
  provideAnimationsAsync(),
  provideServiceWorker('ngsw-worker.js', {
    enabled: false,
    registrationStrategy: 'registerWhenStable:30000',
  }),
];

// ── App config ───────────────────────────────────────────────────────────────
export const appConfig: ApplicationConfig = {
  providers: environment.skipKeycloak
    // ── MODE DEV : pas de Keycloak, pas d'intercepteur Bearer ────────────────
    ? [
        ...commonProviders,
        provideHttpClient(withInterceptors([tenantInterceptor, errorInterceptor])),
      ]
    // ── MODE PROD : Keycloak + bearer interceptor ─────────────────────────────
    : [
        ...commonProviders,
        provideHttpClient(withInterceptors([authInterceptor, tenantInterceptor, errorInterceptor])),
        KeycloakService,
        {
          provide:    APP_INITIALIZER,
          useFactory: initKeycloak,
          deps:       [KeycloakService, AuthService, AuthStore, EspaceStore],
          multi:      true,
        },
      ],
};
