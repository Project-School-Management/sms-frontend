import { inject }            from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthStore }         from '../store/auth.store';

/**
 * Ajoute les headers multi-tenant sur toutes les requêtes :
 *   X-Etablissement-Id : Long
 *   X-Annee-Academique-Id : Long
 *
 * Requis par tous les microservices SMS pour l'isolation tenant (ADR-021).
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);

  const etablissementId   = authStore.etablissementId();
  const anneeAcademiqueId = authStore.anneeAcademiqueId();

  if (!etablissementId) return next(req);

  const cloned = req.clone({
    setHeaders: {
      'X-Etablissement-Id':      String(etablissementId),
      'X-Annee-Academique-Id':   String(anneeAcademiqueId ?? ''),
    },
  });

  return next(cloned);
};
