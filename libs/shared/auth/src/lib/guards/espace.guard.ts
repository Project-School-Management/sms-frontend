import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EspaceStore } from '../store/espace.store';

/**
 * Redirige vers l'écran de sélection d'espace tant que l'utilisateur a
 * plusieurs affectations et n'en a choisi aucune (docs/architecture/tenancy-model.md §6).
 * Laisse passer si une seule affectation (auto-sélectionnée par EspaceStore)
 * ou si aucune (ex. Super-Admin transverse).
 */
export const espaceGuard: CanActivateFn = () => {
  const espaceStore = inject(EspaceStore);
  const router      = inject(Router);

  if (espaceStore.needsSelection()) {
    return router.createUrlTree(['/select-espace']);
  }
  return true;
};
