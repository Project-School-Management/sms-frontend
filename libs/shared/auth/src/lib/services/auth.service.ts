import { Injectable, inject } from '@angular/core';
import { KeycloakService }    from 'keycloak-angular';

import { ICurrentUser }  from '@sms/shared/models';
import { Role }          from '@sms/shared/models';
import { WorkspaceType } from '@sms/shared/models';
import { AuthStore }     from '../store/auth.store';
import { EspaceStore }   from '../store/espace.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // optional: true → null en mode dev (skipKeycloak), instance réelle en prod
  private readonly keycloak    = inject(KeycloakService, { optional: true });
  private readonly authStore   = inject(AuthStore);
  private readonly espaceStore = inject(EspaceStore);

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
      tenantId:          tokenParsed['tenant_id']         ?? null,
      workspaceId:       tokenParsed['workspace_id']      ?? null,
      workspaceType:     this.extractWorkspaceType(tokenParsed),
      acr:               tokenParsed['acr'],
    };

    this.authStore.setCurrentUser(user);
    this.authStore.setTwoFaVerified(tokenParsed['acr'] === '2');
  }

  /** Vrai si une session Keycloak est active (toujours vrai en mode dev sans Keycloak). */
  async isLoggedIn(): Promise<boolean> {
    if (!this.keycloak) return true;
    try {
      return await this.keycloak.isLoggedIn();
    } catch {
      return false;
    }
  }

  /**
   * Déclenche la connexion Keycloak (Authorization Code + PKCE S256).
   * @param redirectUri URL de retour après authentification (défaut : page courante).
   */
  async login(redirectUri: string = window.location.origin): Promise<void> {
    if (!this.keycloak) return; // mode dev : pas de Keycloak, accès libre
    await this.keycloak.login({ redirectUri });
  }

  /**
   * Déconnexion : purge l'état local puis termine la session Keycloak
   * (redirection vers la racine de l'app — post_logout_redirect_uri du client sms-web).
   * En mode dev (sans Keycloak), recharge simplement la racine pour repartir propre.
   */
  async logout(): Promise<void> {
    this.authStore.clearCurrentUser();
    this.espaceStore.clear();
    const redirectUri = window.location.origin;
    if (this.keycloak) {
      await this.keycloak.logout(redirectUri);
      return;
    }
    window.location.assign(redirectUri);
  }

  /** Ouvre la console de gestion de compte Keycloak (mot de passe, 2FA, sessions). */
  async manageAccount(): Promise<void> {
    if (!this.keycloak) return;
    await this.keycloak.getKeycloakInstance().accountManagement();
  }

  // ── private ────────────────────────────────────────────────────────────────
  private extractRole(tokenParsed: Record<string, unknown>): Role {
    // Le realm émet les rôles avec le préfixe ROLE_ (ex: ROLE_ADMIN).
    // On le retire pour matcher l'enum Role côté front (ex: ADMIN).
    const realmRoles = ((tokenParsed['realm_access'] as { roles?: string[] })?.roles ?? [])
      .map((r) => (r.startsWith('ROLE_') ? r.slice('ROLE_'.length) : r));

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

  /** Mappe le claim `workspace_type` vers l'enum (null si absent/inconnu). */
  private extractWorkspaceType(tokenParsed: Record<string, unknown>): WorkspaceType | null {
    const raw = tokenParsed['workspace_type'];
    if (typeof raw !== 'string') return null;
    return (Object.values(WorkspaceType) as string[]).includes(raw)
      ? (raw as WorkspaceType)
      : null;
  }
}
