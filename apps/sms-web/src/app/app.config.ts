import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions }   from '@angular/router';
import { provideHttpClient, withInterceptors }                             from '@angular/common/http';
import { provideAnimationsAsync }                                          from '@angular/platform-browser/animations/async';
import { provideServiceWorker }                                            from '@angular/service-worker';
import { KeycloakService }                                                 from 'keycloak-angular';

import { APP_ROUTES }       from './app.routes';
import { authInterceptor }   from '@sms/shared/auth';
import { tenantInterceptor } from '@sms/shared/auth';
import { errorInterceptor }  from '@sms/shared/auth';
import { AuthService }       from '@sms/shared/auth';

// ── Keycloak initializer ──────────────────────────────────────────────────────
function initKeycloak(keycloak: KeycloakService, authService: AuthService) {
  return async (): Promise<void> => {
    const authenticated = await keycloak.init({
      config: {
        url:      'http://localhost:8180',
        realm:    'sms',
        clientId: 'sms-frontend',
      },
      initOptions: {
        onLoad:             'login-required',
        flow:               'standard',
        pkceMethod:         'S256',
        checkLoginIframe:   false,
      },
    });

    if (authenticated) {
      authService.loadUserProfile();
    }
  };
}

// ── App config ───────────────────────────────────────────────────────────────
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router
    provideRouter(
      APP_ROUTES,
      withComponentInputBinding(),
      withViewTransitions(),
    ),

    // HTTP + interceptors
    // NOTE : pas de provideStore — Signal Stores only (@ngrx/signals)
    provideHttpClient(
      withInterceptors([authInterceptor, tenantInterceptor, errorInterceptor]),
    ),

    // Animations (Material)
    provideAnimationsAsync(),

    // Service Worker (Sprint 10)
    provideServiceWorker('ngsw-worker.js', {
      enabled: false, // activé en production config
      registrationStrategy: 'registerWhenStable:30000',
    }),

    // Keycloak
    KeycloakService,
    {
      provide:    APP_INITIALIZER,
      useFactory: initKeycloak,
      deps:       [KeycloakService, AuthService],
      multi:      true,
    },
  ],
};
