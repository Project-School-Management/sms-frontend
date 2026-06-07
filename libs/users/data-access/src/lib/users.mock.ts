import { IUser, IEtablissement, IAnneeAcademique } from '@sms/shared/models';
import { Role } from '@sms/shared/models';

export const MOCK_USERS: IUser[] = [
  { publicId: 'usr-001', login: 'admin@sms.ci', email: 'admin@sms.ci', firstName: 'Moussa', lastName: 'Admin', authorities: [Role.ADMIN], etablissementId: 1, langKey: 'fr', twoFaEnabled: true, activated: true, createdDate: '2026-01-01' },
  { publicId: 'usr-ens-001', login: 'coulibaly@sms.ci', email: 'coulibaly@sms.ci', firstName: 'Oumar', lastName: 'Coulibaly', authorities: [Role.ENSEIGNANT], etablissementId: 1, langKey: 'fr', twoFaEnabled: true, activated: true, createdDate: '2026-01-05' },
  { publicId: 'usr-ens-002', login: 'diallo.s@sms.ci', email: 'diallo.s@sms.ci', firstName: 'Seydou', lastName: 'Diallo', authorities: [Role.ENSEIGNANT], etablissementId: 1, langKey: 'fr', twoFaEnabled: true, activated: true, createdDate: '2026-01-05' },
  { publicId: 'usr-ens-003', login: 'toure@sms.ci', email: 'toure@sms.ci', firstName: 'Kader', lastName: 'Touré', authorities: [Role.ENSEIGNANT], etablissementId: 1, langKey: 'fr', twoFaEnabled: false, activated: true, createdDate: '2026-01-05' },
  { publicId: 'usr-sec-001', login: 'secretariat@sms.ci', email: 'secretariat@sms.ci', firstName: 'Aissatou', lastName: 'Bah', authorities: [Role.SECRETARIAT], etablissementId: 1, langKey: 'fr', twoFaEnabled: false, activated: true, createdDate: '2026-01-03' },
  { publicId: 'usr-dir-001', login: 'directeur@sms.ci', email: 'directeur@sms.ci', firstName: 'Boubacar', lastName: 'Directeur', authorities: [Role.DIR], etablissementId: 1, langKey: 'fr', twoFaEnabled: true, activated: true, createdDate: '2026-01-01' },
];

export const MOCK_ETABLISSEMENTS: IEtablissement[] = [
  { publicId: 'etab-001', code: 'LYCÉE-CI', libelle: 'Institut Supérieur de Technologie', ville: 'Abidjan', pays: 'Côte d\'Ivoire' },
];

export const MOCK_ANNEES: IAnneeAcademique[] = [
  { publicId: 'annee-001', libelle: '2025-2026', dateDebut: '2025-10-01', dateFin: '2026-06-30', active: true },
  { publicId: 'annee-002', libelle: '2024-2025', dateDebut: '2024-10-01', dateFin: '2025-06-30', active: false },
];
