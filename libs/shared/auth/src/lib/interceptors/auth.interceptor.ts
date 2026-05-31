import { inject }              from '@angular/core';
import { HttpInterceptorFn }   from '@angular/common/http';
import { from, switchMap }     from 'rxjs';
import { AuthService }         from '../services/auth.service';

/**
 * Injecte le Bearer token Keycloak dans toutes les requêtes HTTP sortantes.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return from(authService.getToken()).pipe(
    switchMap((token) => {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(cloned);
    }),
  );
};
