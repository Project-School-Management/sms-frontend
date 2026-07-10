import { inject }              from '@angular/core';
import { HttpInterceptorFn }   from '@angular/common/http';
import { from, switchMap }     from 'rxjs';
import { AuthService }         from '../services/auth.service';
import { AuthStore }           from '../store/auth.store';
import { EspaceStore }         from '../store/espace.store';

/**
 * Injecte le Bearer token Keycloak + le contexte multi-tenant/multi-espaces
 * (headers `X-Tenant-Id`, `X-Workspace-Id`, `X-Workspace-Type`) dans toutes
 * les requêtes HTTP sortantes. La Gateway valide ces headers côté serveur
 * (docs/architecture/tenancy-model.md §6.2 — validation à faire côté backend).
 *
 * `X-Workspace-Id`/`X-Workspace-Type` reflètent l'espace **choisi** par
 * l'utilisateur (EspaceStore, switcher) plutôt que le seul claim JWT initial —
 * indispensable dès qu'un utilisateur a plusieurs affectations.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authStore   = inject(AuthStore);
  const espaceStore = inject(EspaceStore);

  return from(authService.getToken()).pipe(
    switchMap((token) => {
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

      const tenantId      = authStore.tenantId();
      const currentEspace = espaceStore.currentEspace();
      const workspaceId   = currentEspace?.workspaceId   ?? authStore.workspaceId();
      const workspaceType = currentEspace?.workspaceType ?? authStore.workspaceType();

      if (tenantId)      headers['X-Tenant-Id']      = tenantId;
      if (workspaceId)   headers['X-Workspace-Id']   = workspaceId;
      if (workspaceType) headers['X-Workspace-Type'] = workspaceType;

      return next(req.clone({ setHeaders: headers }));
    }),
  );
};
