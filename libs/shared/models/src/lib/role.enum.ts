/**
 * Rôles Keycloak SMS (9 rôles — playbook §3)
 * Correspondent aux realm roles du realm "sms"
 */
export enum Role {
  SUPER_ADMIN  = 'SUPER_ADMIN',
  ADMIN        = 'ADMIN',
  DIR          = 'DIR',
  SECRETARIAT  = 'SECRETARIAT',
  COMPTABLE    = 'COMPTABLE',
  ENSEIGNANT   = 'ENSEIGNANT',
  ELEVE        = 'ELEVE',
  PARENT       = 'PARENT',
  PARTENAIRE   = 'PARTENAIRE',
}

/** Rôles nécessitant une 2FA (ACR=2 Keycloak) */
export const ROLES_REQUIRING_2FA: Role[] = [
  Role.ADMIN,
  Role.DIR,
  Role.COMPTABLE,
  Role.ENSEIGNANT,
];
