import { Injectable, inject } from '@angular/core';
import { KeycloakService }    from 'keycloak-angular';

import { ICurrentUser }  from '@sms/shared/models';
import { Role }          from '@sms/shared/models';
import { AuthStore }     from '../store/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // optional: true → null en mode dev (skipKeycloak), instance réelle en prod
  private readonly keycloak  = inject(KeycloakService, { optional: true });
  private readonly authStore = inject(AuthStore);

  /** Met à jour le token (30s de marge) et retourne le Bearer */
  async getToken(): Promise<string> {
    if (!this.keycloak) return '';
    await this.keycloak.updateToken(30);
    return this.keycloak.getKeycloakInstance().token!;
  }

  /** Parse le token JWT et alimente le AuthStore */
  loadUserProfile(): void {
    if (!this.keycloak) return;
    const kc          = this.keycloak.getKeycloakInstance();
    const tokenParsed = kc.tokenParsed;

    if (!tokenParsed) return;

    const user: ICurrentUser = {
      sub:               tokenParsed['sub']               ?? '',
      email:             tokenParsed['email']             ?? '',
      firstName:         tokenParsed['given_name']        ?? '',
      lastName:          tokenParsed['family_name']       ?? '',
      role:              this.extractRole(tokenParsed),
      etablissementId:   tokenParsed['etablissementId']   ?? 0,
      anneeAcademiqueId: tokenParsed['anneeAcademiqueId'] ?? 0,
      smsUserId:         tokenParsed['smsUserId']         ?? 0,
      acr:               tokenParsed['acr'],
    };

    this.authStore.setCurrentUser(user);
    this.authStore.setTwoFaVerified(tokenParsed['acr'] === '2');
  }

  async logout(): Promise<void> {
    this.authStore.clearCurrentUser();
    if (this.keycloak) {
      await this.keycloak.logout(window.location.origin);
    }
  }

  // ── private ────────────────────────────────────────────────────────────────
  private extractRole(tokenParsed: Record<string, unknown>): Role {
    const realmRoles =
      (tokenParsed['realm_access'] as { roles?: string[] })?.roles ?? [];

    const roleOrder: Role[] = [
      Role.SUPER_ADMIN,
      Role.ADMIN,
      Role.DIR,
      Role.SECRETARIAT,
      Role.COMPTABLE,
      Role.ENSEIGNANT,
      Role.ELEVE,
      Role.PARENT,
      Role.PARTENAIRE,
    ];

    return roleOrder.find((r) => realmRoles.includes(r)) ?? Role.ELEVE;
  }
}
