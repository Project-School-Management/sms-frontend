import { Role } from './role.enum';

/**
 * Utilisateur courant issu du token JWT Keycloak.
 * Claims personnalisés : etablissementId, anneeAcademiqueId, smsUserId
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

  /** Niveau ACR du token (2 = OTP vérifié) */
  acr?: string;
}
