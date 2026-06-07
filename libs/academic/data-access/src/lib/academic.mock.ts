import { INote, IBulletin, IPromotion, IFaculte, IDepartement, ISpecialite } from '@sms/shared/models';

export const MOCK_FACULTES: IFaculte[] = [
  { publicId: 'fac-001', code: 'FSEI', libelle: 'Faculté des Sciences et de l\'Ingénierie' },
  { publicId: 'fac-002', code: 'FGSS', libelle: 'Faculté de Gestion et Sciences Sociales' },
];

export const MOCK_DEPARTEMENTS: IDepartement[] = [
  { publicId: 'dep-001', code: 'INFO', libelle: 'Informatique', facultePublicId: 'fac-001' },
  { publicId: 'dep-002', code: 'MATH', libelle: 'Mathématiques', facultePublicId: 'fac-001' },
  { publicId: 'dep-003', code: 'GEST', libelle: 'Gestion', facultePublicId: 'fac-002' },
];

export const MOCK_SPECIALITES: ISpecialite[] = [
  { publicId: 'spe-001', code: 'GL', libelle: 'Génie Logiciel', departementPublicId: 'dep-001' },
  { publicId: 'spe-002', code: 'RI', libelle: 'Réseaux & Infra', departementPublicId: 'dep-001' },
  { publicId: 'spe-003', code: 'COMPTA', libelle: 'Comptabilité', departementPublicId: 'dep-003' },
];

export const MOCK_PROMOTIONS: IPromotion[] = [
  { publicId: 'promo-001', code: 'L3-GL-2025', libelle: 'Licence 3 GL 2025', specialitePublicId: 'spe-001', anneeAcademiqueId: 1, effectif: 32 },
  { publicId: 'promo-002', code: 'L2-GL-2025', libelle: 'Licence 2 GL 2025', specialitePublicId: 'spe-001', anneeAcademiqueId: 1, effectif: 28 },
  { publicId: 'promo-003', code: 'M1-RI-2025', libelle: 'Master 1 RI 2025', specialitePublicId: 'spe-002', anneeAcademiqueId: 1, effectif: 18 },
];

export const MOCK_NOTES: INote[] = [
  { publicId: 'note-001', studentPublicId: 'stu-001', matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique', valeur: 14.5, absent: false, statut: 'VALIDEE', createdDate: '2026-01-15' },
  { publicId: 'note-002', studentPublicId: 'stu-001', matierePublicId: 'mat-002', matiereLibelle: 'Base de données', valeur: 16.0, absent: false, statut: 'VALIDEE', createdDate: '2026-01-20' },
  { publicId: 'note-003', studentPublicId: 'stu-001', matierePublicId: 'mat-003', matiereLibelle: 'Réseaux', valeur: 12.0, absent: false, statut: 'VALIDEE', createdDate: '2026-01-22' },
  { publicId: 'note-004', studentPublicId: 'stu-002', matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique', valeur: 10.0, absent: false, statut: 'VALIDEE', createdDate: '2026-01-15' },
  { publicId: 'note-005', studentPublicId: 'stu-002', matierePublicId: 'mat-002', matiereLibelle: 'Base de données', valeur: null, absent: true, statut: 'SAISIE', createdDate: '2026-01-20' },
  { publicId: 'note-006', studentPublicId: 'stu-003', matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique', valeur: 18.0, absent: false, statut: 'VALIDEE', createdDate: '2026-01-15' },
];

export const MOCK_BULLETINS: IBulletin[] = [
  {
    publicId: 'bul-001', studentPublicId: 'stu-001', studentNom: 'Awa DIALLO',
    promotionPublicId: 'promo-001', promotionLibelle: 'Licence 3 GL 2025',
    semestre: 1, anneeAcademiqueId: 1, moyenne: 14.17, rang: 3,
    statut: 'PUBLIE', createdDate: '2026-02-01',
    notes: MOCK_NOTES.filter(n => n.studentPublicId === 'stu-001'),
  },
  {
    publicId: 'bul-002', studentPublicId: 'stu-002', studentNom: 'Kofi MENSAH',
    promotionPublicId: 'promo-001', promotionLibelle: 'Licence 3 GL 2025',
    semestre: 1, anneeAcademiqueId: 1, moyenne: 10.0, rang: 18,
    statut: 'GENERE', createdDate: '2026-02-01',
    notes: MOCK_NOTES.filter(n => n.studentPublicId === 'stu-002'),
  },
  {
    publicId: 'bul-003', studentPublicId: 'stu-003', studentNom: 'Fatou TRAORÉ',
    promotionPublicId: 'promo-001', promotionLibelle: 'Licence 3 GL 2025',
    semestre: 1, anneeAcademiqueId: 1, moyenne: 18.0, rang: 1,
    statut: 'PUBLIE', createdDate: '2026-02-01',
    notes: MOCK_NOTES.filter(n => n.studentPublicId === 'stu-003'),
  },
];
