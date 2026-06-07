import { IStudent } from '@sms/shared/models';

export const MOCK_STUDENTS: IStudent[] = [
  {
    publicId: 'stu-001', matricule: 'LYCÉE-CI/2025/000001',
    firstName: 'Awa', lastName: 'Diallo',
    dateNaissance: '2007-03-15', genre: 'F',
    email: 'awa.diallo@email.com', phone: '+2250712345678',
    etablissementId: 1, anneeAcademiqueId: 1,
    statut: 'ACTIF', classePublicId: 'promo-001',
  },
  {
    publicId: 'stu-002', matricule: 'LYCÉE-CI/2025/000002',
    firstName: 'Kofi', lastName: 'Mensah',
    dateNaissance: '2006-07-22', genre: 'M',
    email: 'kofi.mensah@email.com', phone: '+2250756789012',
    etablissementId: 1, anneeAcademiqueId: 1,
    statut: 'ACTIF', classePublicId: 'promo-001',
  },
  {
    publicId: 'stu-003', matricule: 'LYCÉE-CI/2025/000003',
    firstName: 'Fatou', lastName: 'Traoré',
    dateNaissance: '2007-11-08', genre: 'F',
    email: 'fatou.traore@email.com', phone: '+2250798765432',
    etablissementId: 1, anneeAcademiqueId: 1,
    statut: 'ACTIF', classePublicId: 'promo-002',
  },
  {
    publicId: 'stu-004', matricule: 'LYCÉE-CI/2025/000004',
    firstName: 'Moussa', lastName: 'Coulibaly',
    dateNaissance: '2006-02-14', genre: 'M',
    email: 'moussa.coulibaly@email.com',
    etablissementId: 1, anneeAcademiqueId: 1,
    statut: 'INACTIF', classePublicId: 'promo-002',
  },
  {
    publicId: 'stu-005', matricule: 'LYCÉE-CI/2025/000005',
    firstName: 'Aminata', lastName: 'Koné',
    dateNaissance: '2007-09-30', genre: 'F',
    email: 'aminata.kone@email.com', phone: '+2250712111222',
    etablissementId: 1, anneeAcademiqueId: 1,
    statut: 'ACTIF', classePublicId: 'promo-003',
  },
  {
    publicId: 'stu-006', matricule: 'LYCÉE-CI/2025/000006',
    firstName: 'Ibrahima', lastName: 'Bah',
    dateNaissance: '2006-05-19', genre: 'M',
    email: 'ibrahima.bah@email.com',
    etablissementId: 1, anneeAcademiqueId: 1,
    statut: 'ACTIF', classePublicId: 'promo-003',
  },
];
