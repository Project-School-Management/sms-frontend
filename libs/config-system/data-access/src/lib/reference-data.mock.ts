// ══════════════════════════════════════════════════════════════════════════════
// @sms/config-system — Mock Reference Data
// Données de référence complètes pour la plateforme SMS
// Remplacement de TOUTES les données codées en dur dans les modules
// ══════════════════════════════════════════════════════════════════════════════
import {
  IEtablissement, ICycle, INiveau, IFiliere, ISpecialite,
  IDepartementRef, IFaculteRef, IClasseRef, IMatiereRef,
  IAnneeAcademiqueRef, IPeriodeRef, IBatimentRef, ISalleRef,
  ITypeFraisRef, ITypeBourseRef, IGradeRef, ITypeDocumentRef,
  ITypeEvaluationRef, IConfigSnapshot,
} from './reference.types';

// ─── Établissement ────────────────────────────────────────────────────────────
export const MOCK_ETABLISSEMENT: IEtablissement = {
  publicId:  'etab-001',
  code:      'LYCÉE-CI',
  libelle:   'Lycée International de Côte d\'Ivoire',
  type:      'LYCEE',
  adresse:   'Cocody, Angré',
  ville:     'Abidjan',
  pays:      'Côte d\'Ivoire',
  telephone: '+225 27 22 XX XX XX',
  email:     'contact@lycee-ci.edu',
  active:    true,
};

// ─── Cycles ───────────────────────────────────────────────────────────────────
export const MOCK_CYCLES: ICycle[] = [
  { publicId: 'cyc-001', code: 'PRIM',    libelle: 'Primaire',                  ordre: 1, active: true },
  { publicId: 'cyc-002', code: 'COLL',    libelle: 'Collège',                   ordre: 2, active: true },
  { publicId: 'cyc-003', code: 'LYC',     libelle: 'Lycée',                     ordre: 3, active: true },
  { publicId: 'cyc-004', code: 'UNIV',    libelle: 'Université',                ordre: 4, active: true },
  { publicId: 'cyc-005', code: 'FORM',    libelle: 'Formation Professionnelle',  ordre: 5, active: false },
];

// ─── Niveaux ──────────────────────────────────────────────────────────────────
export const MOCK_NIVEAUX: INiveau[] = [
  // Primaire
  { publicId: 'niv-001', code: 'CI',     libelle: 'CI',        cyclePublicId: 'cyc-001', cycleLibelle: 'Primaire',    ordre: 1,  active: false },
  { publicId: 'niv-002', code: 'CP',     libelle: 'CP',        cyclePublicId: 'cyc-001', cycleLibelle: 'Primaire',    ordre: 2,  active: false },
  { publicId: 'niv-003', code: 'CE1',    libelle: 'CE1',       cyclePublicId: 'cyc-001', cycleLibelle: 'Primaire',    ordre: 3,  active: false },
  { publicId: 'niv-004', code: 'CE2',    libelle: 'CE2',       cyclePublicId: 'cyc-001', cycleLibelle: 'Primaire',    ordre: 4,  active: false },
  { publicId: 'niv-005', code: 'CM1',    libelle: 'CM1',       cyclePublicId: 'cyc-001', cycleLibelle: 'Primaire',    ordre: 5,  active: false },
  { publicId: 'niv-006', code: 'CM2',    libelle: 'CM2',       cyclePublicId: 'cyc-001', cycleLibelle: 'Primaire',    ordre: 6,  active: false },
  // Collège
  { publicId: 'niv-007', code: '6EME',   libelle: '6ème',      cyclePublicId: 'cyc-002', cycleLibelle: 'Collège',     ordre: 7,  active: true  },
  { publicId: 'niv-008', code: '5EME',   libelle: '5ème',      cyclePublicId: 'cyc-002', cycleLibelle: 'Collège',     ordre: 8,  active: true  },
  { publicId: 'niv-009', code: '4EME',   libelle: '4ème',      cyclePublicId: 'cyc-002', cycleLibelle: 'Collège',     ordre: 9,  active: true  },
  { publicId: 'niv-010', code: '3EME',   libelle: '3ème',      cyclePublicId: 'cyc-002', cycleLibelle: 'Collège',     ordre: 10, active: true  },
  // Lycée
  { publicId: 'niv-011', code: 'SECD',   libelle: 'Seconde',   cyclePublicId: 'cyc-003', cycleLibelle: 'Lycée',       ordre: 11, active: true  },
  { publicId: 'niv-012', code: 'PREM',   libelle: 'Première',  cyclePublicId: 'cyc-003', cycleLibelle: 'Lycée',       ordre: 12, active: true  },
  { publicId: 'niv-013', code: 'TERM',   libelle: 'Terminale', cyclePublicId: 'cyc-003', cycleLibelle: 'Lycée',       ordre: 13, active: true  },
  // Université
  { publicId: 'niv-014', code: 'L1',     libelle: 'Licence 1', cyclePublicId: 'cyc-004', cycleLibelle: 'Université',  ordre: 14, active: true  },
  { publicId: 'niv-015', code: 'L2',     libelle: 'Licence 2', cyclePublicId: 'cyc-004', cycleLibelle: 'Université',  ordre: 15, active: true  },
  { publicId: 'niv-016', code: 'L3',     libelle: 'Licence 3', cyclePublicId: 'cyc-004', cycleLibelle: 'Université',  ordre: 16, active: true  },
  { publicId: 'niv-017', code: 'M1',     libelle: 'Master 1',  cyclePublicId: 'cyc-004', cycleLibelle: 'Université',  ordre: 17, active: true  },
  { publicId: 'niv-018', code: 'M2',     libelle: 'Master 2',  cyclePublicId: 'cyc-004', cycleLibelle: 'Université',  ordre: 18, active: true  },
  { publicId: 'niv-019', code: 'DOC',    libelle: 'Doctorat',  cyclePublicId: 'cyc-004', cycleLibelle: 'Université',  ordre: 19, active: true  },
];

// ─── Filières ─────────────────────────────────────────────────────────────────
export const MOCK_FILIERES: IFiliere[] = [
  { publicId: 'fil-001', code: 'SCI',    libelle: 'Scientifique',          cyclePublicId: 'cyc-003', active: true  },
  { publicId: 'fil-002', code: 'LITT',   libelle: 'Littéraire',            cyclePublicId: 'cyc-003', active: true  },
  { publicId: 'fil-003', code: 'ECO',    libelle: 'Économique',            cyclePublicId: 'cyc-003', active: true  },
  { publicId: 'fil-004', code: 'TECH',   libelle: 'Technologique',         cyclePublicId: 'cyc-003', active: false },
  { publicId: 'fil-005', code: 'GEN',    libelle: 'Générale',              cyclePublicId: 'cyc-002', active: true  },
  { publicId: 'fil-006', code: 'GL',     libelle: 'Génie Logiciel',        cyclePublicId: 'cyc-004', active: true  },
  { publicId: 'fil-007', code: 'RI',     libelle: 'Réseaux & Infra',       cyclePublicId: 'cyc-004', active: true  },
  { publicId: 'fil-008', code: 'GC',     libelle: 'Génie Civil',           cyclePublicId: 'cyc-004', active: true  },
  { publicId: 'fil-009', code: 'GEST',   libelle: 'Gestion',               cyclePublicId: 'cyc-004', active: true  },
  { publicId: 'fil-010', code: 'COMPTA', libelle: 'Comptabilité',          cyclePublicId: 'cyc-004', active: true  },
];

// ─── Facultés ─────────────────────────────────────────────────────────────────
export const MOCK_FACULTES: IFaculteRef[] = [
  { publicId: 'fac-001', code: 'FSEI',  libelle: "Faculté des Sciences et de l'Ingénierie", active: true },
  { publicId: 'fac-002', code: 'FGSS',  libelle: 'Faculté de Gestion et Sciences Sociales',  active: true },
  { publicId: 'fac-003', code: 'FDSP',  libelle: 'Faculté de Droit et Sciences Politiques',  active: false },
];

// ─── Départements ─────────────────────────────────────────────────────────────
export const MOCK_DEPARTEMENTS: IDepartementRef[] = [
  { publicId: 'dep-001', code: 'INFO',   libelle: 'Informatique',      facultePublicId: 'fac-001', active: true  },
  { publicId: 'dep-002', code: 'MATH',   libelle: 'Mathématiques',     facultePublicId: 'fac-001', active: true  },
  { publicId: 'dep-003', code: 'ELECT',  libelle: 'Électronique',      facultePublicId: 'fac-001', active: true  },
  { publicId: 'dep-004', code: 'GEST',   libelle: 'Gestion',           facultePublicId: 'fac-002', active: true  },
  { publicId: 'dep-005', code: 'COMPTA', libelle: 'Comptabilité',      facultePublicId: 'fac-002', active: true  },
  { publicId: 'dep-006', code: 'MARK',   libelle: 'Marketing',         facultePublicId: 'fac-002', active: false },
];

// ─── Spécialités ──────────────────────────────────────────────────────────────
export const MOCK_SPECIALITES: ISpecialite[] = [
  { publicId: 'spe-001', code: 'GL',     libelle: 'Génie Logiciel',    departementPublicId: 'dep-001', active: true  },
  { publicId: 'spe-002', code: 'RI',     libelle: 'Réseaux & Infra',   departementPublicId: 'dep-001', active: true  },
  { publicId: 'spe-003', code: 'IA',     libelle: 'Intelligence Artif',departementPublicId: 'dep-001', active: true  },
  { publicId: 'spe-004', code: 'COMPTA', libelle: 'Comptabilité',      departementPublicId: 'dep-005', active: true  },
  { publicId: 'spe-005', code: 'FINANCE',libelle: 'Finance',           departementPublicId: 'dep-004', active: true  },
];

// ─── Années académiques ───────────────────────────────────────────────────────
export const MOCK_ANNEES: IAnneeAcademiqueRef[] = [
  { publicId: 'ann-001', libelle: '2025-2026', dateDebut: '2025-09-01', dateFin: '2026-07-31', active: true,  description: 'Année académique en cours' },
  { publicId: 'ann-002', libelle: '2024-2025', dateDebut: '2024-09-01', dateFin: '2025-07-31', active: false, description: 'Année précédente' },
  { publicId: 'ann-003', libelle: '2023-2024', dateDebut: '2023-09-01', dateFin: '2024-07-31', active: false, description: '' },
];

// ─── Périodes (trimestres pour le lycée) ──────────────────────────────────────
export const MOCK_PERIODES: IPeriodeRef[] = [
  { publicId: 'per-001', libelle: '1er Trimestre', type: 'TRIMESTRE', ordre: 1, dateDebut: '2025-09-01', dateFin: '2025-12-20', anneeAcademiquePublicId: 'ann-001', active: true  },
  { publicId: 'per-002', libelle: '2ème Trimestre',type: 'TRIMESTRE', ordre: 2, dateDebut: '2026-01-05', dateFin: '2026-03-28', anneeAcademiquePublicId: 'ann-001', active: true  },
  { publicId: 'per-003', libelle: '3ème Trimestre',type: 'TRIMESTRE', ordre: 3, dateDebut: '2026-04-05', dateFin: '2026-07-05', anneeAcademiquePublicId: 'ann-001', active: false },
  { publicId: 'per-004', libelle: '1er Semestre',  type: 'SEMESTRE',  ordre: 1, dateDebut: '2025-09-01', dateFin: '2026-01-31', anneeAcademiquePublicId: 'ann-001', active: true  },
  { publicId: 'per-005', libelle: '2ème Semestre', type: 'SEMESTRE',  ordre: 2, dateDebut: '2026-02-01', dateFin: '2026-07-31', anneeAcademiquePublicId: 'ann-001', active: false },
];

// ─── Classes (référentiel centralisé, remplace CLASSES_MAP & MOCK_CLASSES) ────
export const MOCK_CLASSES: IClasseRef[] = [
  // ─ Collège ─────────────────────────────────────────────────────────────────
  {
    publicId: 'cls-3eme-b', code: '3EME-B', libelle: '3ème B',
    niveauPublicId: 'niv-010', niveauLibelle: '3ème',
    cyclePublicId: 'cyc-002',  cycleLibelle:  'Collège',
    filierePublicId: 'fil-005',filiereLibelle:'Générale',
    capacite: 50, effectif: 35, anneeAcademiquePublicId: 'ann-001',
    professeurPrincipal: 'M. Bah Ibrahim', sallePrincipale: 'D05', active: true,
  },
  // ─ Lycée ────────────────────────────────────────────────────────────────────
  {
    publicId: 'cls-seconde-a', code: 'SECD-A', libelle: 'Seconde A',
    niveauPublicId: 'niv-011', niveauLibelle: 'Seconde',
    cyclePublicId: 'cyc-003',  cycleLibelle:  'Lycée',
    filierePublicId: 'fil-003',filiereLibelle:'Générale',
    capacite: 52, effectif: 52, anneeAcademiquePublicId: 'ann-001',
    professeurPrincipal: 'Mme Koné Mariame', sallePrincipale: 'A101', active: true,
  },
  {
    publicId: 'cls-premiere-d', code: 'PREM-D', libelle: 'Première D',
    niveauPublicId: 'niv-012', niveauLibelle: 'Première',
    cyclePublicId: 'cyc-003',  cycleLibelle:  'Lycée',
    filierePublicId: 'fil-001',filiereLibelle:'Scientifique',
    capacite: 48, effectif: 45, anneeAcademiquePublicId: 'ann-001',
    professeurPrincipal: 'M. Touré Kader', sallePrincipale: 'C201', active: true,
  },
  {
    publicId: 'cls-terminale-s1', code: 'TERM-S1', libelle: 'Terminale S1',
    niveauPublicId: 'niv-013', niveauLibelle: 'Terminale',
    cyclePublicId: 'cyc-003',  cycleLibelle:  'Lycée',
    filierePublicId: 'fil-001',filiereLibelle:'Scientifique',
    capacite: 45, effectif: 42, anneeAcademiquePublicId: 'ann-001',
    professeurPrincipal: 'Mme Coulibaly Fatou', sallePrincipale: 'B12', active: true,
  },
  {
    publicId: 'cls-terminale-a1', code: 'TERM-A1', libelle: 'Terminale A1',
    niveauPublicId: 'niv-013', niveauLibelle: 'Terminale',
    cyclePublicId: 'cyc-003',  cycleLibelle:  'Lycée',
    filierePublicId: 'fil-002',filiereLibelle:'Littéraire',
    capacite: 40, effectif: 38, anneeAcademiquePublicId: 'ann-001',
    professeurPrincipal: 'M. Diallo Seydou', sallePrincipale: 'A102', active: true,
  },
  // ─ Université ───────────────────────────────────────────────────────────────
  {
    publicId: 'cls-l3-gl', code: 'L3-GL-2025', libelle: 'Licence 3 GL 2025',
    niveauPublicId: 'niv-016', niveauLibelle: 'Licence 3',
    cyclePublicId: 'cyc-004',  cycleLibelle:  'Université',
    filierePublicId: 'fil-006',filiereLibelle:'Génie Logiciel',
    specialitePublicId: 'spe-001', specialiteLibelle: 'Génie Logiciel',
    capacite: 35, effectif: 32, anneeAcademiquePublicId: 'ann-001',
    active: true,
  },
  {
    publicId: 'cls-l2-gl', code: 'L2-GL-2025', libelle: 'Licence 2 GL 2025',
    niveauPublicId: 'niv-015', niveauLibelle: 'Licence 2',
    cyclePublicId: 'cyc-004',  cycleLibelle:  'Université',
    filierePublicId: 'fil-006',filiereLibelle:'Génie Logiciel',
    specialitePublicId: 'spe-001', specialiteLibelle: 'Génie Logiciel',
    capacite: 35, effectif: 28, anneeAcademiquePublicId: 'ann-001',
    active: true,
  },
  {
    publicId: 'cls-m1-ri', code: 'M1-RI-2025', libelle: 'Master 1 RI 2025',
    niveauPublicId: 'niv-017', niveauLibelle: 'Master 1',
    cyclePublicId: 'cyc-004',  cycleLibelle:  'Université',
    filierePublicId: 'fil-007',filiereLibelle:'Réseaux & Infra',
    specialitePublicId: 'spe-002', specialiteLibelle: 'Réseaux & Infra',
    capacite: 20, effectif: 18, anneeAcademiquePublicId: 'ann-001',
    active: true,
  },
  {
    publicId: 'cls-l1-gl', code: 'L1-GL-2025', libelle: 'Licence 1 GL 2025',
    niveauPublicId: 'niv-014', niveauLibelle: 'Licence 1',
    cyclePublicId: 'cyc-004',  cycleLibelle:  'Université',
    filierePublicId: 'fil-006',filiereLibelle:'Génie Logiciel',
    capacite: 50, effectif: 45, anneeAcademiquePublicId: 'ann-001',
    active: true,
  },
  {
    publicId: 'cls-m2-ri', code: 'M2-RI-2025', libelle: 'Master 2 RI 2025',
    niveauPublicId: 'niv-018', niveauLibelle: 'Master 2',
    cyclePublicId: 'cyc-004',  cycleLibelle:  'Université',
    filierePublicId: 'fil-007',filiereLibelle:'Réseaux & Infra',
    capacite: 15, effectif: 12, anneeAcademiquePublicId: 'ann-001',
    active: true,
  },
];

// ─── Matières ─────────────────────────────────────────────────────────────────
export const MOCK_MATIERES: IMatiereRef[] = [
  // Transversales (collège + lycée)
  { publicId: 'mat-maths', code: 'MATHS', libelle: 'Mathématiques',   type: 'OBLIGATOIRE', coefficient: 5, heuresHebdo: 5, niveauxPublicIds: ['niv-007','niv-008','niv-009','niv-010','niv-011','niv-012','niv-013'], active: true  },
  { publicId: 'mat-fr',    code: 'FR',    libelle: 'Français',         type: 'OBLIGATOIRE', coefficient: 4, heuresHebdo: 4, niveauxPublicIds: ['niv-007','niv-008','niv-009','niv-010','niv-011','niv-012','niv-013'], active: true  },
  { publicId: 'mat-ang',   code: 'ANG',   libelle: 'Anglais',          type: 'OBLIGATOIRE', coefficient: 3, heuresHebdo: 3, niveauxPublicIds: ['niv-007','niv-008','niv-009','niv-010','niv-011','niv-012','niv-013'], active: true  },
  { publicId: 'mat-hist',  code: 'HIST',  libelle: 'Histoire-Géo',     type: 'OBLIGATOIRE', coefficient: 3, heuresHebdo: 3, niveauxPublicIds: ['niv-007','niv-008','niv-009','niv-010','niv-011','niv-012','niv-013'], active: true  },
  // Lycée scientifique
  { publicId: 'mat-phys',  code: 'PHYS',  libelle: 'Physique-Chimie',  type: 'OBLIGATOIRE', coefficient: 4, heuresHebdo: 4, niveauxPublicIds: ['niv-011','niv-012','niv-013'], active: true  },
  { publicId: 'mat-svt',   code: 'SVT',   libelle: 'SVT',              type: 'OBLIGATOIRE', coefficient: 3, heuresHebdo: 3, niveauxPublicIds: ['niv-011','niv-012','niv-013'], active: true  },
  { publicId: 'mat-philo', code: 'PHILO', libelle: 'Philosophie',      type: 'OBLIGATOIRE', coefficient: 2, heuresHebdo: 2, niveauxPublicIds: ['niv-012','niv-013'], active: true  },
  // Université — informatique
  { publicId: 'mat-algo',  code: 'ALGO',  libelle: 'Algorithmique',    type: 'OBLIGATOIRE', coefficient: 4, heuresHebdo: 6, credits: 4, niveauxPublicIds: ['niv-014','niv-015','niv-016'], active: true  },
  { publicId: 'mat-bdd',   code: 'BDD',   libelle: 'Base de données',  type: 'OBLIGATOIRE', coefficient: 4, heuresHebdo: 6, credits: 4, niveauxPublicIds: ['niv-015','niv-016'], active: true  },
  { publicId: 'mat-reseau',code: 'RESEAU',libelle: 'Réseaux',          type: 'OBLIGATOIRE', coefficient: 3, heuresHebdo: 4, credits: 3, niveauxPublicIds: ['niv-015','niv-016','niv-017'], active: true  },
  { publicId: 'mat-secu',  code: 'SECU',  libelle: 'Sécurité Inf.',   type: 'OBLIGATOIRE', coefficient: 4, heuresHebdo: 4, credits: 4, niveauxPublicIds: ['niv-017','niv-018'], active: true  },
  { publicId: 'mat-ia',    code: 'IA',    libelle: 'Intelligence Artif.',type:'OBLIGATOIRE', coefficient: 5, heuresHebdo: 6, credits: 5, niveauxPublicIds: ['niv-017','niv-018'], active: true  },
  { publicId: 'mat-cloud', code: 'CLOUD', libelle: 'Cloud & DevOps',   type: 'OBLIGATOIRE', coefficient: 4, heuresHebdo: 4, credits: 4, niveauxPublicIds: ['niv-018'], active: true  },
  { publicId: 'mat-prog',  code: 'PROG',  libelle: 'Programmation',    type: 'OBLIGATOIRE', coefficient: 4, heuresHebdo: 6, credits: 4, niveauxPublicIds: ['niv-014','niv-015'], active: true  },
];

// ─── Bâtiments ────────────────────────────────────────────────────────────────
export const MOCK_BATIMENTS: IBatimentRef[] = [
  { publicId: 'bat-001', code: 'BAT-A',  libelle: 'Bâtiment A',             nbEtages: 3, campus: 'Principal', active: true  },
  { publicId: 'bat-002', code: 'BAT-B',  libelle: 'Bâtiment B',             nbEtages: 2, campus: 'Principal', active: true  },
  { publicId: 'bat-003', code: 'BAT-C',  libelle: 'Bâtiment C',             nbEtages: 2, campus: 'Principal', active: true  },
  { publicId: 'bat-004', code: 'BAT-D',  libelle: 'Bâtiment D',             nbEtages: 1, campus: 'Principal', active: true  },
  { publicId: 'bat-005', code: 'BAT-E',  libelle: 'Bâtiment E',             nbEtages: 2, campus: 'Principal', active: true  },
  { publicId: 'bat-006', code: 'AMPHI',  libelle: 'Bloc Amphithéâtres',     nbEtages: 1, campus: 'Principal', active: true  },
  { publicId: 'bat-007', code: 'LABO',   libelle: 'Bloc Laboratoires',      nbEtages: 1, campus: 'Principal', active: true  },
  { publicId: 'bat-008', code: 'TP-INF', libelle: 'Bloc TP Informatique',   nbEtages: 1, campus: 'Principal', active: true  },
];

// ─── Salles (remplace MOCK_SALLES dans schedule.mock.ts) ─────────────────────
export const MOCK_SALLES: ISalleRef[] = [
  { publicId: 'sal-001', code: 'A101',     libelle: 'Salle A101',          type: 'TD',          capacite: 55,  batimentPublicId: 'bat-001', batimentLibelle: 'Bâtiment A', etage: 1, active: true  },
  { publicId: 'sal-002', code: 'A102',     libelle: 'Salle A102',          type: 'TD',          capacite: 40,  batimentPublicId: 'bat-001', batimentLibelle: 'Bâtiment A', etage: 1, active: true  },
  { publicId: 'sal-003', code: 'B12',      libelle: 'Salle B12',           type: 'TD',          capacite: 45,  batimentPublicId: 'bat-002', batimentLibelle: 'Bâtiment B', etage: 1, active: true  },
  { publicId: 'sal-004', code: 'C201',     libelle: 'Salle C201',          type: 'TD',          capacite: 50,  batimentPublicId: 'bat-003', batimentLibelle: 'Bâtiment C', etage: 2, active: true  },
  { publicId: 'sal-005', code: 'D05',      libelle: 'Salle D05',           type: 'TD',          capacite: 40,  batimentPublicId: 'bat-004', batimentLibelle: 'Bâtiment D', etage: 0, active: true  },
  { publicId: 'sal-006', code: 'E10',      libelle: 'Salle E10',           type: 'TD',          capacite: 35,  batimentPublicId: 'bat-005', batimentLibelle: 'Bâtiment E', etage: 1, active: true  },
  { publicId: 'sal-007', code: 'AMPHI-1',  libelle: 'Amphithéâtre 1',      type: 'AMPHI',       capacite: 200, batimentPublicId: 'bat-006', batimentLibelle: 'Bloc Amphithéâtres', active: true },
  { publicId: 'sal-008', code: 'AMPHI-2',  libelle: 'Amphithéâtre 2',      type: 'AMPHI',       capacite: 150, batimentPublicId: 'bat-006', batimentLibelle: 'Bloc Amphithéâtres', active: true },
  { publicId: 'sal-009', code: 'LABO-PHY', libelle: 'Labo Physique-Chimie',type: 'LABO',        capacite: 30,  batimentPublicId: 'bat-007', batimentLibelle: 'Bloc Laboratoires',  active: true },
  { publicId: 'sal-010', code: 'LABO-SVT', libelle: 'Labo SVT',            type: 'LABO',        capacite: 30,  batimentPublicId: 'bat-007', batimentLibelle: 'Bloc Laboratoires',  active: true },
  { publicId: 'sal-011', code: 'TP-INFO-1',libelle: 'Salle TP Info 1',     type: 'INFORMATIQUE',capacite: 25,  batimentPublicId: 'bat-008', batimentLibelle: 'Bloc TP Informatique', active: true },
  { publicId: 'sal-012', code: 'TP-INFO-2',libelle: 'Salle TP Info 2',     type: 'INFORMATIQUE',capacite: 25,  batimentPublicId: 'bat-008', batimentLibelle: 'Bloc TP Informatique', active: true },
];

// ─── Types de frais (remplace FRAIS_INSCRIPTION / FRAIS_SCOLARITE) ─────────────
export const MOCK_TYPES_FRAIS: ITypeFraisRef[] = [
  { publicId: 'frais-001', code: 'INSCRIP',    libelle: 'Frais d\'inscription',  categorie: 'INSCRIPTION', montant: 50_000,  obligatoire: true,  active: true  },
  { publicId: 'frais-002', code: 'SCOL-TERM',  libelle: 'Scolarité Terminale',   categorie: 'SCOLARITE',   montant: 750_000, obligatoire: true,  cyclePublicId: 'cyc-003', niveauPublicId: 'niv-013', active: true },
  { publicId: 'frais-003', code: 'SCOL-PREM',  libelle: 'Scolarité Première',    categorie: 'SCOLARITE',   montant: 700_000, obligatoire: true,  cyclePublicId: 'cyc-003', niveauPublicId: 'niv-012', active: true },
  { publicId: 'frais-004', code: 'SCOL-SECD',  libelle: 'Scolarité Seconde',     categorie: 'SCOLARITE',   montant: 650_000, obligatoire: true,  cyclePublicId: 'cyc-003', niveauPublicId: 'niv-011', active: true },
  { publicId: 'frais-005', code: 'SCOL-3EME',  libelle: 'Scolarité 3ème',        categorie: 'SCOLARITE',   montant: 600_000, obligatoire: true,  cyclePublicId: 'cyc-002', niveauPublicId: 'niv-010', active: true },
  { publicId: 'frais-006', code: 'SCOL-4EME',  libelle: 'Scolarité 4ème',        categorie: 'SCOLARITE',   montant: 580_000, obligatoire: true,  cyclePublicId: 'cyc-002', niveauPublicId: 'niv-009', active: true },
  { publicId: 'frais-007', code: 'SCOL-L3',    libelle: 'Scolarité Licence 3',   categorie: 'SCOLARITE',   montant: 900_000, obligatoire: true,  cyclePublicId: 'cyc-004', niveauPublicId: 'niv-016', active: true },
  { publicId: 'frais-008', code: 'SCOL-M2',    libelle: 'Scolarité Master 2',    categorie: 'SCOLARITE',   montant: 1_200_000, obligatoire: true, cyclePublicId: 'cyc-004', niveauPublicId: 'niv-018', active: true },
  { publicId: 'frais-009', code: 'CANTINE',    libelle: 'Frais de cantine',      categorie: 'CANTINE',     montant: 75_000,  obligatoire: false, active: true  },
  { publicId: 'frais-010', code: 'TRANSPORT',  libelle: 'Frais de transport',    categorie: 'TRANSPORT',   montant: 60_000,  obligatoire: false, active: true  },
];

// ─── Types de bourses ─────────────────────────────────────────────────────────
export const MOCK_TYPES_BOURSES: ITypeBourseRef[] = [
  { publicId: 'brs-001', code: 'MERITE',    libelle: 'Bourse mérite',          montantMax: 300_000, conditions: 'Moyenne ≥ 15/20',          active: true  },
  { publicId: 'brs-002', code: 'SOCIALE',   libelle: 'Bourse sociale',         montantMax: 400_000, conditions: 'Dossier social validé',    active: true  },
  { publicId: 'brs-003', code: 'ETAT',      libelle: "Bourse d'État",          montantMax: 600_000, conditions: 'Arrêté ministériel',       active: true  },
  { publicId: 'brs-004', code: 'PARTIELLE', libelle: 'Aide partielle',         montantMax: 200_000, conditions: 'Décision administrative', active: true  },
  { publicId: 'brs-005', code: 'EXCELLENCE',libelle: 'Bourse excellence',      montantMax: 750_000, conditions: 'Major de promotion',       active: false },
];

// ─── Grades RH ────────────────────────────────────────────────────────────────
export const MOCK_GRADES: IGradeRef[] = [
  { publicId: 'grd-001', code: 'ENS-TIT',  libelle: 'Enseignant titulaire',      categorie: 'ENSEIGNANT', niveauRequis: 'Licence', active: true  },
  { publicId: 'grd-002', code: 'ENS-CERT', libelle: 'Enseignant certifié',       categorie: 'ENSEIGNANT', niveauRequis: 'Master',  active: true  },
  { publicId: 'grd-003', code: 'ENS-AGR',  libelle: 'Enseignant agrégé',         categorie: 'ENSEIGNANT', niveauRequis: 'Master',  active: true  },
  { publicId: 'grd-004', code: 'ENS-CONT', libelle: 'Enseignant contractuel',    categorie: 'ENSEIGNANT', active: true  },
  { publicId: 'grd-005', code: 'ENS-VAC',  libelle: 'Enseignant vacataire',      categorie: 'ENSEIGNANT', active: true  },
  { publicId: 'grd-006', code: 'ADM-SEC',  libelle: 'Secrétaire de direction',   categorie: 'ADMIN',      active: true  },
  { publicId: 'grd-007', code: 'ADM-COMPT',libelle: 'Comptable',                 categorie: 'ADMIN',      active: true  },
  { publicId: 'grd-008', code: 'TECH-INF', libelle: 'Technicien informatique',   categorie: 'TECHNIQUE',  active: true  },
  { publicId: 'grd-009', code: 'DIR',      libelle: 'Directeur',                 categorie: 'DIRECTION',  active: true  },
  { publicId: 'grd-010', code: 'DIR-PEDAGL',libelle:'Directeur pédagogique',     categorie: 'DIRECTION',  active: true  },
];

// ─── Types de documents ───────────────────────────────────────────────────────
export const MOCK_TYPES_DOCUMENTS: ITypeDocumentRef[] = [
  { publicId: 'doc-001', code: 'EXT-NAISS',   libelle: 'Extrait de naissance',        obligatoire: true,  active: true  },
  { publicId: 'doc-002', code: 'PHOTO-ID',    libelle: "Photo d'identité (x4)",       obligatoire: true,  active: true  },
  { publicId: 'doc-003', code: 'CERT-SCOL',   libelle: 'Certificat de scolarité',     obligatoire: true,  active: true  },
  { publicId: 'doc-004', code: 'CARNET-SCOL', libelle: 'Carnets scolaires (x2)',      obligatoire: false, active: true  },
  { publicId: 'doc-005', code: 'ATT-TRANSF',  libelle: 'Attestation de transfert',    obligatoire: false, active: true  },
  { publicId: 'doc-006', code: 'RES-BREVET',  libelle: 'Résultats du brevet / Bac',   obligatoire: false, active: true  },
  { publicId: 'doc-007', code: 'ACTE-NAISS',  libelle: 'Acte de naissance certifié',  obligatoire: false, active: true  },
  { publicId: 'doc-008', code: 'MED-CERT',    libelle: 'Certificat médical',           obligatoire: false, active: false },
  { publicId: 'doc-009', code: 'CNI-PARENT',  libelle: "CNI du parent/tuteur",         obligatoire: false, active: true  },
];

// ─── Types d'évaluation ───────────────────────────────────────────────────────
export const MOCK_TYPES_EVALUATION: ITypeEvaluationRef[] = [
  { publicId: 'eval-001', code: 'DEVOIR',   libelle: 'Devoir surveillé',     coefficient: 1, dureeMin: 60,  active: true  },
  { publicId: 'eval-002', code: 'COMPO',    libelle: 'Composition',          coefficient: 2, dureeMin: 120, active: true  },
  { publicId: 'eval-003', code: 'EXAMEN',   libelle: 'Examen final',         coefficient: 3, dureeMin: 180, active: true  },
  { publicId: 'eval-004', code: 'TP',       libelle: 'Travaux pratiques',    coefficient: 1, active: true  },
  { publicId: 'eval-005', code: 'PROJET',   libelle: 'Projet de groupe',     coefficient: 2, active: true  },
  { publicId: 'eval-006', code: 'ORAL',     libelle: 'Examen oral',          coefficient: 1, dureeMin: 30,  active: true  },
  { publicId: 'eval-007', code: 'CONTROLE', libelle: 'Contrôle continu',     coefficient: 1, active: true  },
  { publicId: 'eval-008', code: 'RATTRAPAGE',libelle: 'Rattrapage',          coefficient: 1, active: true  },
];

// ─── Snapshot complet de configuration ───────────────────────────────────────
export const MOCK_CONFIG_SNAPSHOT: IConfigSnapshot = {
  etablissement:   MOCK_ETABLISSEMENT,
  cycles:          MOCK_CYCLES,
  niveaux:         MOCK_NIVEAUX,
  filieres:        MOCK_FILIERES,
  facultes:        MOCK_FACULTES,
  departements:    MOCK_DEPARTEMENTS,
  specialites:     MOCK_SPECIALITES,
  classes:         MOCK_CLASSES,
  matieres:        MOCK_MATIERES,
  annees:          MOCK_ANNEES,
  periodes:        MOCK_PERIODES,
  batiments:       MOCK_BATIMENTS,
  salles:          MOCK_SALLES,
  typesFrais:      MOCK_TYPES_FRAIS,
  typesBourses:    MOCK_TYPES_BOURSES,
  grades:          MOCK_GRADES,
  typesDocuments:  MOCK_TYPES_DOCUMENTS,
  typesEvaluation: MOCK_TYPES_EVALUATION,
};

// ─── Helpers utilitaires ──────────────────────────────────────────────────────

/** Calcule les frais de scolarité pour un niveau donné */
export function getFraisScolariteByNiveau(niveauPublicId: string): number {
  return MOCK_TYPES_FRAIS.find(f =>
    f.categorie === 'SCOLARITE' && f.niveauPublicId === niveauPublicId
  )?.montant ?? 650_000;
}

/** Calcule les frais de scolarité par libellé de niveau (rétro-compat) */
export function getFraisScolariteByNiveauLibelle(niveauLibelle: string): number {
  const fraisMap: Record<string, number> = {
    'Terminale': 750_000, 'Première': 700_000, 'Seconde': 650_000,
    '3ème': 600_000, '4ème': 580_000,
    'Licence 3': 900_000, 'Master 2': 1_200_000,
  };
  return fraisMap[niveauLibelle] ?? 650_000;
}

/** Obtient les classes en format select option */
export function getClassesAsOptions(): { id: string; libelle: string; niveau: string; filiere: string; capacite: number }[] {
  return MOCK_CLASSES.filter(c => c.active).map(c => ({
    id:       c.publicId,
    libelle:  c.libelle,
    niveau:   c.niveauLibelle,
    filiere:  c.filiereLibelle ?? '',
    capacite: c.capacite,
  }));
}

/** CLASSES_MAP de rétro-compatibilité — à utiliser dans les anciens modules en attendant la migration complète */
export const CLASSES_MAP_REF: Record<string, { libelle: string; niveau: string; filiere: string }> =
  Object.fromEntries(
    MOCK_CLASSES.map(c => [c.publicId, { libelle: c.libelle, niveau: c.niveauLibelle, filiere: c.filiereLibelle ?? '' }])
  );
