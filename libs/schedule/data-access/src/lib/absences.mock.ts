import { IAbsence } from '@sms/shared/models';

// ─── Roster élèves par classe (démo — en prod : GET user-service par classe) ──
export interface IEleveRoster { publicId: string; nom: string; matricule: string; }

export const MOCK_CLASSE_ROSTER: Record<string, IEleveRoster[]> = {
  'cls-terminale-s1': [
    { publicId: 'stu-001', nom: 'Awa Diallo',        matricule: 'LYCÉE-CI/2025/000001' },
    { publicId: 'stu-002', nom: 'Kofi Mensah',       matricule: 'LYCÉE-CI/2025/000002' },
    { publicId: 'stu-101', nom: 'Ibrahim Sawadogo',  matricule: 'LYCÉE-CI/2025/000101' },
    { publicId: 'stu-102', nom: 'Nadège Yao',        matricule: 'LYCÉE-CI/2025/000102' },
    { publicId: 'stu-103', nom: 'Sékou Bamba',       matricule: 'LYCÉE-CI/2025/000103' },
  ],
  'cls-terminale-a1': [
    { publicId: 'stu-003', nom: 'Fatou Traoré',      matricule: 'LYCÉE-CI/2025/000003' },
    { publicId: 'stu-004', nom: 'Moussa Coulibaly',  matricule: 'LYCÉE-CI/2025/000004' },
    { publicId: 'stu-104', nom: 'Grâce Kouassi',     matricule: 'LYCÉE-CI/2025/000104' },
    { publicId: 'stu-105', nom: 'Ousmane Barry',     matricule: 'LYCÉE-CI/2025/000105' },
  ],
  'cls-premiere-d': [
    { publicId: 'stu-005', nom: 'Aminata Koné',      matricule: 'LYCÉE-CI/2025/000005' },
    { publicId: 'stu-106', nom: 'Yannick Zongo',     matricule: 'LYCÉE-CI/2025/000106' },
    { publicId: 'stu-107', nom: 'Mariama Cissé',     matricule: 'LYCÉE-CI/2025/000107' },
  ],
};

// ─── Absences mock — cohérent avec les élèves (students.mock) et matières (EDT) ──
// Enseignant secrétariat de démo pour les justifications déjà traitées
const SECRETAIRE_ID  = 'usr-secretariat-01';
const SECRETAIRE_NOM = 'Mme Ouattara Salimata';

export const MOCK_ABSENCES: IAbsence[] = [
  // ── Awa Diallo (Terminale S1) — 3 absences dont 1 justifiée ──
  {
    publicId: 'abs-001',
    elevePublicId: 'stu-001', eleveNom: 'Awa Diallo', eleveMatricule: 'LYCÉE-CI/2025/000001',
    matierePublicId: 'mat-maths', matiereLibelle: 'Mathématiques',
    classePublicId: 'cls-terminale-s1', classeLibelle: 'Terminale S1',
    enseignantPublicId: 'ens-001', enseignantNom: 'M. Kaboré Aristide',
    heureAbsence: '2026-01-12T07:30:00Z', statut: 'JUSTIFIEE',
    motifJustification: 'Certificat médical fourni', dateJustification: '2026-01-13T09:15:00Z',
    justifieParPublicId: SECRETAIRE_ID, justifieParNom: SECRETAIRE_NOM,
  },
  {
    publicId: 'abs-002',
    elevePublicId: 'stu-001', eleveNom: 'Awa Diallo', eleveMatricule: 'LYCÉE-CI/2025/000001',
    matierePublicId: 'mat-phys', matiereLibelle: 'Physique-Chimie',
    classePublicId: 'cls-terminale-s1', classeLibelle: 'Terminale S1',
    enseignantPublicId: 'ens-002', enseignantNom: 'Mme Traoré Aïssata',
    heureAbsence: '2026-01-14T08:30:00Z', statut: 'NON_JUSTIFIEE',
  },
  {
    publicId: 'abs-003',
    elevePublicId: 'stu-001', eleveNom: 'Awa Diallo', eleveMatricule: 'LYCÉE-CI/2025/000001',
    matierePublicId: 'mat-maths', matiereLibelle: 'Mathématiques',
    classePublicId: 'cls-terminale-s1', classeLibelle: 'Terminale S1',
    enseignantPublicId: 'ens-001', enseignantNom: 'M. Kaboré Aristide',
    heureAbsence: '2026-01-19T07:30:00Z', statut: 'NON_JUSTIFIEE',
  },

  // ── Kofi Mensah (Terminale S1) — 1 absence non justifiée ──
  {
    publicId: 'abs-004',
    elevePublicId: 'stu-002', eleveNom: 'Kofi Mensah', eleveMatricule: 'LYCÉE-CI/2025/000002',
    matierePublicId: 'mat-fr', matiereLibelle: 'Français',
    classePublicId: 'cls-terminale-s1', classeLibelle: 'Terminale S1',
    enseignantPublicId: 'ens-004', enseignantNom: 'Mme Coulibaly Fatou',
    heureAbsence: '2026-01-15T10:30:00Z', statut: 'NON_JUSTIFIEE',
  },

  // ── Fatou Traoré (Terminale A1) — 2 absences justifiées ──
  {
    publicId: 'abs-005',
    elevePublicId: 'stu-003', eleveNom: 'Fatou Traoré', eleveMatricule: 'LYCÉE-CI/2025/000003',
    matierePublicId: 'mat-ang', matiereLibelle: 'Anglais',
    classePublicId: 'cls-terminale-a1', classeLibelle: 'Terminale A1',
    enseignantPublicId: 'ens-005', enseignantNom: 'M. Diallo Seydou',
    heureAbsence: '2026-01-13T14:00:00Z', statut: 'JUSTIFIEE',
    motifJustification: 'Convocation administrative', dateJustification: '2026-01-14T08:00:00Z',
    justifieParPublicId: SECRETAIRE_ID, justifieParNom: SECRETAIRE_NOM,
  },
  {
    publicId: 'abs-006',
    elevePublicId: 'stu-003', eleveNom: 'Fatou Traoré', eleveMatricule: 'LYCÉE-CI/2025/000003',
    matierePublicId: 'mat-hist', matiereLibelle: 'Histoire-Géo',
    classePublicId: 'cls-terminale-a1', classeLibelle: 'Terminale A1',
    enseignantPublicId: 'ens-006', enseignantNom: 'Mme Sanogo Mariam',
    heureAbsence: '2026-01-16T08:30:00Z', statut: 'JUSTIFIEE',
    motifJustification: 'Rendez-vous médical', dateJustification: '2026-01-16T15:30:00Z',
    justifieParPublicId: SECRETAIRE_ID, justifieParNom: SECRETAIRE_NOM,
  },

  // ── Moussa Coulibaly (Terminale A1) — 1 absence non justifiée récente ──
  {
    publicId: 'abs-007',
    elevePublicId: 'stu-004', eleveNom: 'Moussa Coulibaly', eleveMatricule: 'LYCÉE-CI/2025/000004',
    matierePublicId: 'mat-philo', matiereLibelle: 'Philosophie',
    classePublicId: 'cls-terminale-a1', classeLibelle: 'Terminale A1',
    enseignantPublicId: 'ens-007', enseignantNom: 'M. Bamba Isidore',
    heureAbsence: '2026-01-20T10:30:00Z', statut: 'NON_JUSTIFIEE',
  },
];
