import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ICurrentUser, IEspaceAffectation, Role, WorkspaceType } from '@sms/shared/models';

/**
 * Mock réaliste des affectations multi-espaces (docs/architecture/tenancy-model.md §3-6).
 *
 * Le realm Keycloak actuel n'émet pas encore la claim `espaces[]` (backend à faire,
 * §10 du document de référence) : ce service simule ce que le endpoint
 * `GET /api/v1/utilisateurs/me` renverra une fois le backend aligné (voir
 * docs/api-contracts/01-user-service.md). Dès que la claim JWT existe, il suffira
 * de remplacer l'appel à ce service par la lecture de `ICurrentUser.espaces`.
 *
 * Scénarios démonstratifs (alignés sur le §6.1 du document de tenancy) :
 * - ELEVE / PARENT / SECRETARIAT / COMPTABLE : une seule affectation → pas de switcher.
 * - ENSEIGNANT : deux espaces (Lycée + Université) → écran de sélection.
 * - ADMIN : administre plusieurs espaces du même tenant → écran de sélection.
 * - SUPER_ADMIN : transverse, aucun espace → pas de switcher (vue plateforme).
 */
@Injectable({ providedIn: 'root' })
export class EspaceApiService {

  private readonly TENANT_ID    = 'complexe-horizon';
  private readonly TENANT_LABEL = 'Complexe Horizon';

  private readonly ESPACE_LYCEE: IEspaceAffectation = {
    workspaceId: 'esp-lycee-01', workspaceType: WorkspaceType.LYCEUM,
    label: 'Lycée', groupPath: '/complexe-horizon/lycee',
    tenantId: this.TENANT_ID, tenantLabel: this.TENANT_LABEL,
  };

  private readonly ESPACE_UNIVERSITE: IEspaceAffectation = {
    workspaceId: 'esp-universite-01', workspaceType: WorkspaceType.UNIVERSITY,
    label: 'Université', groupPath: '/complexe-horizon/universite',
    tenantId: this.TENANT_ID, tenantLabel: this.TENANT_LABEL,
  };

  private readonly ESPACE_FONDAMENTAL: IEspaceAffectation = {
    workspaceId: 'esp-fondamental-01', workspaceType: WorkspaceType.FUNDAMENTAL,
    label: 'École Fondamentale', groupPath: '/complexe-horizon/fondamental',
    tenantId: this.TENANT_ID, tenantLabel: this.TENANT_LABEL,
  };

  /**
   * GET /api/v1/utilisateurs/me/espaces (mock — cible réelle documentée dans
   * docs/api-contracts/01-user-service.md). Dérive une liste d'affectations
   * réaliste à partir du rôle de l'utilisateur courant.
   */
  getEspaces(user: ICurrentUser): Observable<IEspaceAffectation[]> {
    // Si le claim JWT espaces[] est déjà présent (backend aligné), on le respecte.
    if (user.espaces && user.espaces.length > 0) {
      return of(user.espaces).pipe(delay(150));
    }

    let espaces: IEspaceAffectation[];
    switch (user.role) {
      case Role.SUPER_ADMIN:
        espaces = []; // transverse — aucun espace, pas de switcher
        break;
      case Role.ADMIN:
        espaces = [this.ESPACE_FONDAMENTAL, this.ESPACE_LYCEE, this.ESPACE_UNIVERSITE];
        break;
      case Role.ENSEIGNANT:
        espaces = [this.ESPACE_LYCEE, this.ESPACE_UNIVERSITE];
        break;
      default:
        espaces = [this.ESPACE_LYCEE]; // SECRETARIAT, COMPTABLE, ELEVE, PARENT, DIR…
    }
    return of(espaces).pipe(delay(150));
  }
}
