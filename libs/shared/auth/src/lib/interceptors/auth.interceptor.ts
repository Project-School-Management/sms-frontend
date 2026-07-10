import { inject }              from '@angular/core';
import { HttpInterceptorFn }   from '@angular/common/http';
import { from, switchMap }     from 'rxjs';
import { AuthService }         from '../services/auth.service';
import { AuthStore }           from '../store/auth.store';

/**
 * Injecte le Bearer token Keycloak + le contexte multi-tenant/multi-espaces
 * (headers `X-Tenant-Id`, `X-Workspace-Id`, `X-Workspace-Type`) dans toutes
 * les requêtes HTTP sortantes. La Gateway valide ces headers côté serveur.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authStore   = inject(AuthStore);

  return from(authService.getToken()).pipe(
    switchMap((token) => {
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

      const tenantId      = authStore.tenantId();
      const workspaceId   = authStore.workspaceId();
      const workspaceType = authStore.workspaceType();
      if (tenantId)      headers['X-Tenant-Id']      = tenantId;
      if (workspaceId)   headers['X-Workspace-Id']   = workspaceId;
      if (workspaceType) headers['X-Workspace-Type'] = workspaceType;

      return next(req.clone({ setHeaders: headers }));
    }),
  );
};
