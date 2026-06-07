import { IUser, IEtablissement, IAnneeAcademique } from '@sms/shared/models';
import { Role } from '@sms/shared/models';

export const MOCK_USERS: IUser[] = [
  { publicId: 'usr-001',     login: 'admin@sms.ci',          email: 'admin@sms.ci',          firstName: 'Moussa',      lastName: 'Konaté',     authorities: [Role.ADMIN],       etablissementId: 1, langKey: 'fr', twoFaEnabled: true,  activated: true,  createdDate: '2026-01-01' },
  { publicId: 'usr-dir-001', login: 'directeur@sms.ci',      email: 'directeur@sms.ci',      firstName: 'Boubacar',    lastName: 'Sow',        authorities: [Role.DIR],         etablissementId: 1, langKey: 'fr', twoFaEnabled: true,  activated: true,  createdDate: '2026-01-01' },
  { publicId: 'usr-ens-001', login: 'coulibaly@sms.ci',      email: 'coulibaly@sms.ci',      firstName: 'Oumar',       lastName: 'Coulibaly',  authorities: [Role.ENSEIGNANT],  etablissementId: 1, langKey: 'fr', twoFaEnabled: true,  activated: true,  createdDate: '2026-01-05' },
  { publicId: 'usr-ens-002', login: 'diallo.s@sms.ci',       email: 'diallo.s@sms.ci',       firstName: 'Seydou',      lastName: 'Diallo',     authorities: [Role.ENSEIGNANT],  etablissementId: 1, langKey: 'fr', twoFaEnabled: true,  activated: true,  createdDate: '2026-01-05' },
  { publicId: 'usr-ens-003', login: 'toure@sms.ci',          email: 'toure@sms.ci',          firstName: 'Kader',       lastName: 'Touré',      authorities: [Role.ENSEIGNANT],  etablissementId: 1, langKey: 'fr', twoFaEnabled: false, activated: true,  createdDate: '2026-01-05' },
  { publicId: 'usr-ens-004', login: 'ouedraogo@sms.ci',      email: 'ouedraogo@sms.ci',      firstName: 'Serge',       lastName: 'Ouedraogo',  authorities: [Role.ENSEIGNANT],  etablissementId: 1, langKey: 'fr', twoFaEnabled: false, activated: true,  createdDate: '2026-01-06' },
  { publicId: 'usr-ens-005', login: 'sylla@sms.ci',          email: 'sylla@sms.ci',          firstName: 'Mariama',     lastName: 'Sylla',      authorities: [Role.ENSEIGNANT],  etablissementId: 1, langKey: 'fr', twoFaEnabled: true,  activated: true,  createdDate: '2026-01-06' },
  { publicId: 'usr-ens-006', login: 'konate.a@sms.ci',       email: 'konate.a@sms.ci',       firstName: 'Aïcha',       lastName: 'Konaté',     authorities: [Role.ENSEIGNANT],  etablissementId: 1, langKey: 'fr', twoFaEnabled: false, activated: true,  createdDate: '2026-01-07' },
  { publicId: 'usr-ens-007', login: 'bamba@sms.ci',          email: 'bamba@sms.ci',          firstName: 'Ibrahim',     lastName: 'Bamba',      authorities: [Role.ENSEIGNANT],  etablissementId: 1, langKey: 'fr', twoFaEnabled: false, activated: true,  createdDate: '2026-01-07' },
  { publicId: 'usr-ens-008', login: 'traore.b@sms.ci',       email: 'traore.b@sms.ci',       firstName: 'Boubacar',    lastName: 'Traoré',     authorities: [Role.ENSEIGNANT],  etablissementId: 1, langKey: 'fr', twoFaEnabled: false, activated: false, createdDate: '2026-01-08' },
  { publicId: 'usr-ens-009', login: 'kabore@sms.ci',         email: 'kabore@sms.ci',         firstName: 'Fatou',       lastName: 'Kaboré',     authorities: [Role.ENSEIGNANT],  etablissementId: 1, langKey: 'fr', twoFaEnabled: true,  activated: true,  createdDate: '2026-01-08' },
  { publicId: 'usr-sec-001', login: 'secretariat@sms.ci',    email: 'secretariat@sms.ci',    firstName: 'Aissatou',    lastName: 'Bah',        authorities: [Role.SECRETARIAT], etablissementId: 1, langKey: 'fr', twoFaEnabled: false, activated: true,  createdDate: '2026-01-03' },
  { publicId: 'usr-sec-002', login: 'secretariat2@sms.ci',   email: 'secretariat2@sms.ci',   firstName: 'Ramata',      lastName: 'Camara',     authorities: [Role.SECRETARIAT], etablissementId: 1, langKey: 'fr', twoFaEnabled: false, activated: true,  createdDate: '2026-01-03' },
  { publicId: 'usr-cpt-001', login: 'comptable@sms.ci',      email: 'comptable@sms.ci',      firstName: 'Lamine',      lastName: 'Baldé',      authorities: [Role.COMPTABLE],   etablissementId: 1, langKey: 'fr', twoFaEnabled: true,  activated: true,  createdDate: '2026-01-04' },
  { publicId: 'usr-par-001', login: 'parent.diallo@sms.ci',  email: 'parent.diallo@sms.ci',  firstName: 'Mamadou',     lastName: 'Diallo',     authorities: [Role.PARENT],      etablissementId: 1, langKey: 'fr', twoFaEnabled: false, activated: true,  createdDate: '2026-02-01' },
];

export const MOCK_ETABLISSEMENTS: IEtablissement[] = [
  { publicId: 'etab-001', code: 'LYCÉE-CI', libelle: 'Institut Supérieur de Technologie d\'Abidjan', ville: 'Abidjan', pays: 'Côte d\'Ivoire' },
];

export const MOCK_ANNEES: IAnneeAcademique[] = [
  { publicId: 'annee-001', libelle: '2025-2026', dateDebut: '2025-10-01', dateFin: '2026-06-30', active: true },
  { publicId: 'annee-002', libelle: '2024-2025', dateDebut: '2024-10-01', dateFin: '2025-06-30', active: false },
  { publicId: 'annee-003', libelle: '2023-2024', dateDebut: '2023-10-01', dateFin: '2024-06-30', active: false },
];
