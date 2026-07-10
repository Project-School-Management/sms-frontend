import { Role } from './role.enum';
import { WorkspaceType } from './workspace.model';

/**
 * Utilisateur courant issu du token JWT Keycloak.
 * Claims personnalisés : etablissementId, anneeAcademiqueId, smsUserId,
 * tenant_id, workspace_id, workspace_type (architecture multi-espaces).
 */
export interface ICurrentUser {
  /** Keycloak sub (UUID) */
  sub:                string;
  email:              string;
  firstName:          string;
  lastName:           string;
  role:               Role;

  /** Custom JWT claim — Long */
  etablissementId:    number;
  /** Custom JWT claim — Long */
  anneeAcademiqueId:  number;
  /** Custom JWT claim — Long (user-service internal id) */
  smsUserId:          number;

  /** Claim `tenant_id` (UUID établissement) — null pour le Super-Admin transverse */
  tenantId?:          string | null;
  /** Claim `workspace_id` (UUID espace actif) — null si non rattaché à un espace */
  workspaceId?:       string | null;
  /** Claim `workspace_type` — pilote l'adaptation contextuelle de l'UI */
  workspaceType?:     WorkspaceType | null;

  /** Niveau ACR du token (2 = OTP vérifié) */
  acr?: string;
}
