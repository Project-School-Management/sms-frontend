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
  { publicId: 'promo-004', code: 'L1-GL-2025', libelle: 'Licence 1 GL 2025', specialitePublicId: 'spe-001', anneeAcademiqueId: 1, effectif: 45 },
  { publicId: 'promo-005', code: 'M2-RI-2025', libelle: 'Master 2 RI 2025', specialitePublicId: 'spe-002', anneeAcademiqueId: 1, effectif: 12 },
];

export const MOCK_NOTES: INote[] = [
  // stu-001 Awa Diallo
  { publicId: 'note-001', studentPublicId: 'stu-001', matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique', valeur: 14.5, coefficient: 3, absent: false, statut: 'VALIDEE', enseignantNom: 'Coulibaly Oumar', createdDate: '2026-01-15' },
  { publicId: 'note-002', studentPublicId: 'stu-001', matierePublicId: 'mat-002', matiereLibelle: 'Base de données', valeur: 16.0, coefficient: 3, absent: false, statut: 'VALIDEE', enseignantNom: 'Diallo Seydou', createdDate: '2026-01-20' },
  { publicId: 'note-003', studentPublicId: 'stu-001', matierePublicId: 'mat-003', matiereLibelle: 'Réseaux', valeur: 12.0, coefficient: 2, absent: false, statut: 'VALIDEE', enseignantNom: 'Touré Kader', createdDate: '2026-01-22' },
  { publicId: 'note-004', studentPublicId: 'stu-001', matierePublicId: 'mat-007', matiereLibelle: 'Physique-Chimie', valeur: 11.5, coefficient: 2, absent: false, statut: 'VALIDEE', enseignantNom: 'Bamba Ibrahim', createdDate: '2026-01-25' },
  { publicId: 'note-005', studentPublicId: 'stu-001', matierePublicId: 'mat-008', matiereLibelle: 'Anglais', valeur: 17.0, coefficient: 2, absent: false, statut: 'VALIDEE', enseignantNom: 'Konaté Aïcha', createdDate: '2026-01-28' },
  // stu-002 Kofi Mensah
  { publicId: 'note-006', studentPublicId: 'stu-002', matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique', valeur: 10.0, coefficient: 3, absent: false, statut: 'VALIDEE', enseignantNom: 'Coulibaly Oumar', createdDate: '2026-01-15' },
  { publicId: 'note-007', studentPublicId: 'stu-002', matierePublicId: 'mat-002', matiereLibelle: 'Base de données', valeur: null, coefficient: 3, absent: true, statut: 'SAISIE', enseignantNom: 'Diallo Seydou', createdDate: '2026-01-20' },
  { publicId: 'note-008', studentPublicId: 'stu-002', matierePublicId: 'mat-005', matiereLibelle: 'Mathématiques', valeur: 8.0, coefficient: 3, absent: false, statut: 'VALIDEE', enseignantNom: 'Ouedraogo Serge', createdDate: '2026-01-23' },
  // stu-003 Fatou Traoré
  { publicId: 'note-009', studentPublicId: 'stu-003', matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique', valeur: 18.0, coefficient: 3, absent: false, statut: 'VALIDEE', enseignantNom: 'Coulibaly Oumar', createdDate: '2026-01-15' },
  { publicId: 'note-010', studentPublicId: 'stu-003', matierePublicId: 'mat-002', matiereLibelle: 'Base de données', valeur: 19.0, coefficient: 3, absent: false, statut: 'VALIDEE', enseignantNom: 'Diallo Seydou', createdDate: '2026-01-20' },
  { publicId: 'note-011', studentPublicId: 'stu-003', matierePublicId: 'mat-006', matiereLibelle: 'Français', valeur: 15.5, coefficient: 2, absent: false, statut: 'VALIDEE', enseignantNom: 'Sylla Mariama', createdDate: '2026-01-26' },
  // stu-004 Moussa Coulibaly
  { publicId: 'note-012', studentPublicId: 'stu-004', matierePublicId: 'mat-005', matiereLibelle: 'Mathématiques', valeur: 9.5, coefficient: 3, absent: false, statut: 'VALIDEE', enseignantNom: 'Ouedraogo Serge', createdDate: '2026-01-23' },
  { publicId: 'note-013', studentPublicId: 'stu-004', matierePublicId: 'mat-004', matiereLibelle: 'Histoire-Géo', valeur: 13.0, coefficient: 2, absent: false, statut: 'SAISIE', enseignantNom: 'Kaboré Fatou', createdDate: '2026-01-24' },
  // stu-005 Aminata Koné
  { publicId: 'note-014', studentPublicId: 'stu-005', matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique', valeur: 16.5, coefficient: 3, absent: false, statut: 'VALIDEE', enseignantNom: 'Coulibaly Oumar', createdDate: '2026-01-15' },
  { publicId: 'note-015', studentPublicId: 'stu-005', matierePublicId: 'mat-008', matiereLibelle: 'Anglais', valeur: 18.5, coefficient: 2, absent: false, statut: 'VALIDEE', enseignantNom: 'Konaté Aïcha', createdDate: '2026-01-28' },
  // stu-006 Ibrahima Bah
  { publicId: 'note-016', studentPublicId: 'stu-006', matierePublicId: 'mat-003', matiereLibelle: 'Réseaux', valeur: 11.0, coefficient: 2, absent: false, statut: 'VALIDEE', enseignantNom: 'Touré Kader', createdDate: '2026-01-22' },
  { publicId: 'note-017', studentPublicId: 'stu-006', matierePublicId: 'mat-009', matiereLibelle: 'SVT', valeur: 14.0, coefficient: 2, absent: false, statut: 'VALIDEE', enseignantNom: 'Traoré Boubacar', createdDate: '2026-01-29' },
  // stu-007 Mariam Sanogo
  { publicId: 'note-018', studentPublicId: 'stu-007', matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique', valeur: 7.5, coefficient: 3, absent: false, statut: 'VALIDEE', enseignantNom: 'Coulibaly Oumar', createdDate: '2026-01-15' },
  { publicId: 'note-019', studentPublicId: 'stu-007', matierePublicId: 'mat-005', matiereLibelle: 'Mathématiques', valeur: 6.0, coefficient: 3, absent: false, statut: 'SAISIE', enseignantNom: 'Ouedraogo Serge', createdDate: '2026-01-23' },
  // stu-008 Seydou Ouedraogo
  { publicId: 'note-020', studentPublicId: 'stu-008', matierePublicId: 'mat-002', matiereLibelle: 'Base de données', valeur: 15.0, coefficient: 3, absent: false, statut: 'VALIDEE', enseignantNom: 'Diallo Seydou', createdDate: '2026-01-20' },
  // stu-009 Kadiatou Camara
  { publicId: 'note-021', studentPublicId: 'stu-009', matierePublicId: 'mat-006', matiereLibelle: 'Français', valeur: 13.5, coefficient: 2, absent: false, statut: 'VALIDEE', enseignantNom: 'Sylla Mariama', createdDate: '2026-01-26' },
  // stu-010 Ousmane Diakité
  { publicId: 'note-022', studentPublicId: 'stu-010', matierePublicId: 'mat-001', matiereLibelle: 'Algorithmique', valeur: 12.5, coefficient: 3, absent: false, statut: 'VALIDEE', enseignantNom: 'Coulibaly Oumar', createdDate: '2026-01-15' },
  { publicId: 'note-023', studentPublicId: 'stu-010', matierePublicId: 'mat-007', matiereLibelle: 'Physique-Chimie', valeur: 10.5, coefficient: 2, absent: false, statut: 'VALIDEE', enseignantNom: 'Bamba Ibrahim', createdDate: '2026-01-25' },
  // stu-011 Rokhaya Ndiaye
  { publicId: 'note-024', studentPublicId: 'stu-011', matierePublicId: 'mat-008', matiereLibelle: 'Anglais', valeur: 19.5, coefficient: 2, absent: false, statut: 'VALIDEE', enseignantNom: 'Konaté Aïcha', createdDate: '2026-01-28' },
  // stu-012 Bakary Kouyaté
  { publicId: 'note-025', studentPublicId: 'stu-012', matierePublicId: 'mat-004', matiereLibelle: 'Histoire-Géo', valeur: null, coefficient: 2, absent: true, statut: 'SAISIE', enseignantNom: 'Kaboré Fatou', createdDate: '2026-01-24' },
];

export const MOCK_BULLETINS: IBulletin[] = [
  { publicId: 'bul-001', studentPublicId: 'stu-001', studentNom: 'Awa DIALLO', promotionPublicId: 'promo-001', promotionLibelle: 'Licence 3 GL 2025', semestre: 1, anneeAcademiqueId: 1, moyenne: 14.2, rang: 4, mention: 'Assez Bien', statut: 'PUBLIE', createdDate: '2026-02-01', notes: [] },
  { publicId: 'bul-002', studentPublicId: 'stu-002', studentNom: 'Kofi MENSAH', promotionPublicId: 'promo-001', promotionLibelle: 'Licence 3 GL 2025', semestre: 1, anneeAcademiqueId: 1, moyenne: 10.0, rang: 18, mention: 'Passable', statut: 'GENERE', createdDate: '2026-02-01', notes: [] },
  { publicId: 'bul-003', studentPublicId: 'stu-003', studentNom: 'Fatou TRAORÉ', promotionPublicId: 'promo-001', promotionLibelle: 'Licence 3 GL 2025', semestre: 1, anneeAcademiqueId: 1, moyenne: 18.0, rang: 1, mention: 'Très Bien', statut: 'PUBLIE', createdDate: '2026-02-01', notes: [] },
  { publicId: 'bul-004', studentPublicId: 'stu-005', studentNom: 'Aminata KONÉ', promotionPublicId: 'promo-003', promotionLibelle: 'Master 1 RI 2025', semestre: 1, anneeAcademiqueId: 1, moyenne: 17.2, rang: 2, mention: 'Très Bien', statut: 'PUBLIE', createdDate: '2026-02-05', notes: [] },
  { publicId: 'bul-005', studentPublicId: 'stu-006', studentNom: 'Ibrahima BAH', promotionPublicId: 'promo-003', promotionLibelle: 'Master 1 RI 2025', semestre: 1, anneeAcademiqueId: 1, moyenne: 12.5, rang: 8, mention: 'Bien', statut: 'PUBLIE', createdDate: '2026-02-05', notes: [] },
  { publicId: 'bul-006', studentPublicId: 'stu-007', studentNom: 'Mariam SANOGO', promotionPublicId: 'promo-001', promotionLibelle: 'Licence 3 GL 2025', semestre: 1, anneeAcademiqueId: 1, moyenne: 7.0, rang: 30, mention: 'Insuffisant', statut: 'GENERE', createdDate: '2026-02-01', notes: [] },
  { publicId: 'bul-007', studentPublicId: 'stu-009', studentNom: 'Kadiatou CAMARA', promotionPublicId: 'promo-002', promotionLibelle: 'Licence 2 GL 2025', semestre: 1, anneeAcademiqueId: 1, moyenne: 13.5, rang: 7, mention: 'Bien', statut: 'PUBLIE', createdDate: '2026-02-03', notes: [] },
  { publicId: 'bul-008', studentPublicId: 'stu-010', studentNom: 'Ousmane DIAKITÉ', promotionPublicId: 'promo-001', promotionLibelle: 'Licence 3 GL 2025', semestre: 1, anneeAcademiqueId: 1, moyenne: 11.8, rang: 14, mention: 'Passable', statut: 'PUBLIE', createdDate: '2026-02-01', notes: [] },
  { publicId: 'bul-009', studentPublicId: 'stu-011', studentNom: 'Rokhaya NDIAYE', promotionPublicId: 'promo-003', promotionLibelle: 'Master 1 RI 2025', semestre: 1, anneeAcademiqueId: 1, moyenne: 16.0, rang: 3, mention: 'Très Bien', statut: 'PUBLIE', createdDate: '2026-02-05', notes: [] },
  { publicId: 'bul-010', studentPublicId: 'stu-015', studentNom: 'Ndeye FAYE', promotionPublicId: 'promo-005', promotionLibelle: 'Master 2 RI 2025', semestre: 1, anneeAcademiqueId: 1, moyenne: 15.3, rang: 2, mention: 'Bien', statut: 'PUBLIE', createdDate: '2026-02-08', notes: [] },
];
