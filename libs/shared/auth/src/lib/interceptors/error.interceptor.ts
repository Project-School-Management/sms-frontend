import { inject }             from '@angular/core';
import { HttpInterceptorFn,
         HttpErrorResponse }  from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar }        from '@angular/material/snack-bar';

import { IProblem }    from '@sms/shared/models';
import { AuthService } from '../services/auth.service';

/**
 * Gestion centralisée des erreurs HTTP :
 *   401 → logout (token expiré)
 *   403 → toast avec IProblem.detail
 *   422 → toast "Conflit : {detail}"
 *   5xx → toast "Erreur serveur"
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const snackBar    = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const problem = err.error as IProblem | undefined;

      switch (err.status) {
        case 401:
          authService.logout();
          break;

        case 403:
          snackBar.open(
            problem?.detail ?? 'Accès refusé.',
            'Fermer',
            { duration: 5000, panelClass: ['snack-error'] },
          );
          break;

        case 422:
          snackBar.open(
            `Conflit : ${problem?.detail ?? 'Données invalides.'}`,
            'Fermer',
            { duration: 6000, panelClass: ['snack-warn'] },
          );
          break;

        default:
          if (err.status >= 500) {
            snackBar.open(
              'Erreur serveur. Veuillez réessayer.',
              'Fermer',
              { duration: 5000, panelClass: ['snack-error'] },
            );
          }
      }

      return throwError(() => err);
    }),
  );
};
