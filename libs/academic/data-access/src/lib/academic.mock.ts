import { INote, IBulletin, IPromotion, IFaculte, IDepartement, ISpecialite, IEvaluation, IEleveContext } from '@sms/shared/models';
import {
  MOCK_FACULTES as FACULTES_REF,
  MOCK_DEPARTEMENTS as DEPTS_REF,
  MOCK_SPECIALITES as SPECS_REF,
} from '@sms/config-system/data-access';

// ─── Structures — source unique : @sms/config-system/data-access ─────────────
export const MOCK_FACULTES: IFaculte[]    = FACULTES_REF.filter(f => f.active);
export const MOCK_DEPARTEMENTS: IDepartement[] = DEPTS_REF.filter(d => d.active);
export const MOCK_SPECIALITES: ISpecialite[]   = SPECS_REF.filter(s => s.active);

// ─── Promotions / Classes ────────────────────────────────────────────────────
export const MOCK_PROMOTIONS: IPromotion[] = [
  { publicId: 'cls-terminale-s1', code: 'TERM-S1',   libelle: 'Terminale S1', specialitePublicId: 'spe-001', anneeAcademiqueId: 1, effectif: 42 },
  { publicId: 'cls-premiere-d',   code: 'PREM-D',    libelle: 'Première D',   specialitePublicId: 'spe-001', anneeAcademiqueId: 1, effectif: 45 },
  { publicId: 'cls-seconde',      code: 'SECD-A',    libelle: 'Seconde A',    specialitePublicId: 'spe-001', anneeAcademiqueId: 1, effectif: 52 },
];

// ─── Élèves mock ─────────────────────────────────────────────────────────────
const ELEVES_TS1 = [
  { id: 'stu-ts1-01', nom: 'Mariame Koné',       matricule: 'LYCÉE-CI/2025/000001' },
  { id: 'stu-ts1-02', nom: 'Kofi Mensah',        matricule: 'LYCÉE-CI/2025/000002' },
  { id: 'stu-ts1-03', nom: 'Awa Diallo',         matricule: 'LYCÉE-CI/2025/000003' },
  { id: 'stu-ts1-04', nom: 'Ibrahima Bah',       matricule: 'LYCÉE-CI/2025/000004' },
  { id: 'stu-ts1-05', nom: 'Fatou Traoré',       matricule: 'LYCÉE-CI/2025/000005' },
  { id: 'stu-ts1-06', nom: 'Moussa Coulibaly',   matricule: 'LYCÉE-CI/2025/000006' },
  { id: 'stu-ts1-07', nom: 'Aïssata Camara',     matricule: 'LYCÉE-CI/2025/000007' },
  { id: 'stu-ts1-08', nom: 'Seydou Ouédraogo',   matricule: 'LYCÉE-CI/2025/000008' },
  { id: 'stu-ts1-09', nom: 'Aminata Sylla',      matricule: 'LYCÉE-CI/2025/000009' },
  { id: 'stu-ts1-10', nom: 'Kader Sanogo',       matricule: 'LYCÉE-CI/2025/000010' },
  { id: 'stu-ts1-11', nom: 'Rokhaya Ndiaye',     matricule: 'LYCÉE-CI/2025/000011' },
  { id: 'stu-ts1-12', nom: 'Bakary Kouyaté',     matricule: 'LYCÉE-CI/2025/000012' },
  { id: 'stu-ts1-13', nom: 'Djeneba Touré',      matricule: 'LYCÉE-CI/2025/000013' },
  { id: 'stu-ts1-14', nom: 'Oumar Diakité',      matricule: 'LYCÉE-CI/2025/000014' },
  { id: 'stu-ts1-15', nom: 'Ndeye Faye',         matricule: 'LYCÉE-CI/2025/000015' },
  { id: 'stu-ts1-16', nom: 'Lamine Keita',       matricule: 'LYCÉE-CI/2025/000016' },
  { id: 'stu-ts1-17', nom: 'Kadiatou Balde',     matricule: 'LYCÉE-CI/2025/000017' },
  { id: 'stu-ts1-18', nom: 'Adama Cissé',        matricule: 'LYCÉE-CI/2025/000018' },
  { id: 'stu-ts1-19', nom: 'Mariam Diarra',      matricule: 'LYCÉE-CI/2025/000019' },
  { id: 'stu-ts1-20', nom: 'Boua Gnango',        matricule: 'LYCÉE-CI/2025/000020' },
];

// ─── Matières Terminale S1 ───────────────────────────────────────────────────
const MATIERES_TS1 = [
  { publicId: 'mat-maths', libelle: 'Mathématiques',   coeff: 5, enseignant: 'M. Kaboré Aristide',  moyenneClasse: 11.4 },
  { publicId: 'mat-phys',  libelle: 'Physique-Chimie', coeff: 4, enseignant: 'Mme Traoré Aïssata',  moyenneClasse: 10.8 },
  { publicId: 'mat-svt',   libelle: 'SVT',             coeff: 3, enseignant: 'M. Ouédraogo Luc',    moyenneClasse: 12.1 },
  { publicId: 'mat-fr',    libelle: 'Français',        coeff: 3, enseignant: 'Mme Coulibaly Fatou', moyenneClasse: 12.5 },
  { publicId: 'mat-ang',   libelle: 'Anglais',         coeff: 2, enseignant: 'M. Diallo Seydou',    moyenneClasse: 13.2 },
  { publicId: 'mat-hist',  libelle: 'Histoire-Géo',    coeff: 2, enseignant: 'Mme Sanogo Mariam',   moyenneClasse: 11.9 },
  { publicId: 'mat-philo', libelle: 'Philosophie',     coeff: 2, enseignant: 'M. Bamba Isidore',    moyenneClasse: 10.6 },
  { publicId: 'mat-eps',   libelle: 'EPS',             coeff: 1, enseignant: 'M. Koné Jean-Pierre', moyenneClasse: 14.0 },
];

// ─── Fonction de génération de notes ─────────────────────────────────────────
function genNotes(
  studentId: string,
  classeId: string,
  notesByMatiere: Record<string, number | null>,
  prefix: string,
): INote[] {
  const result: INote[] = [];
  let idx = 1;
  for (const mat of MATIERES_TS1) {
    const valeur = notesByMatiere[mat.publicId] ?? null;
    const absent = valeur === null;
    const appr = absent ? undefined : valeur >= 16 ? 'Excellent travail, continuez ainsi !' :
      valeur >= 14 ? 'Bon travail, quelques progrès à faire.' :
      valeur >= 10 ? 'Résultats acceptables, des efforts sont nécessaires.' :
      'Des difficultés persistantes, un soutien est recommandé.';
    result.push({
      publicId:        `note-${prefix}-${String(idx).padStart(3, '0')}`,
      studentPublicId: studentId,
      matierePublicId: mat.publicId,
      matiereLibelle:  mat.libelle,
      valeur:          valeur,
      coefficient:     mat.coeff,
      absent:          absent,
      appreciation:    appr,
      statut:          absent ? 'SAISIE' : 'VALIDEE',
      enseignantNom:   mat.enseignant,
      createdDate:     `2026-01-${String(15 + idx).padStart(2, '0')}`,
    });
    idx++;
  }
  return result;
}

// ─── Notes par élève (matière → note) ────────────────────────────────────────
const NOTES_PAR_ELEVE: Record<string, Record<string, number | null>> = {
  'stu-ts1-01': { 'mat-maths': 17.5, 'mat-phys': 16.0, 'mat-svt': 15.5, 'mat-fr': 14.0, 'mat-ang': 18.0, 'mat-hist': 13.5, 'mat-philo': 14.0, 'mat-eps': 16.0 },
  'stu-ts1-02': { 'mat-maths': 9.5,  'mat-phys': 8.0,  'mat-svt': 11.0, 'mat-fr': 10.5, 'mat-ang': 12.0, 'mat-hist': 9.0,  'mat-philo': 7.5,  'mat-eps': 13.0 },
  'stu-ts1-03': { 'mat-maths': 14.5, 'mat-phys': 13.0, 'mat-svt': 15.0, 'mat-fr': 16.0, 'mat-ang': 15.5, 'mat-hist': 14.0, 'mat-philo': 13.0, 'mat-eps': 15.0 },
  'stu-ts1-04': { 'mat-maths': 19.0, 'mat-phys': 18.5, 'mat-svt': 17.0, 'mat-fr': 15.0, 'mat-ang': 16.0, 'mat-hist': 14.5, 'mat-philo': 15.0, 'mat-eps': 17.0 },
  'stu-ts1-05': { 'mat-maths': 7.0,  'mat-phys': 5.5,  'mat-svt': 8.0,  'mat-fr': 9.0,  'mat-ang': 10.0, 'mat-hist': 7.5,  'mat-philo': 6.0,  'mat-eps': 12.0 },
  'stu-ts1-06': { 'mat-maths': 12.0, 'mat-phys': 11.5, 'mat-svt': 13.0, 'mat-fr': 12.5, 'mat-ang': 11.0, 'mat-hist': 12.0, 'mat-philo': 10.5, 'mat-eps': 14.0 },
  'stu-ts1-07': { 'mat-maths': 15.0, 'mat-phys': 14.5, 'mat-svt': 16.0, 'mat-fr': 13.5, 'mat-ang': 17.0, 'mat-hist': 15.5, 'mat-philo': 14.0, 'mat-eps': 16.0 },
  'stu-ts1-08': { 'mat-maths': 10.5, 'mat-phys': 9.0,  'mat-svt': 11.5, 'mat-fr': 11.0, 'mat-ang': 13.0, 'mat-hist': 10.0, 'mat-philo': 9.5,  'mat-eps': 13.5 },
  'stu-ts1-09': { 'mat-maths': 13.0, 'mat-phys': 12.5, 'mat-svt': null, 'mat-fr': 14.0, 'mat-ang': 15.0, 'mat-hist': 12.0, 'mat-philo': 11.5, 'mat-eps': 15.0 },
  'stu-ts1-10': { 'mat-maths': 6.0,  'mat-phys': 7.0,  'mat-svt': 8.5,  'mat-fr': 7.5,  'mat-ang': 9.0,  'mat-hist': 6.5,  'mat-philo': 5.5,  'mat-eps': 11.0 },
  'stu-ts1-11': { 'mat-maths': 18.0, 'mat-phys': 17.5, 'mat-svt': 19.0, 'mat-fr': 16.5, 'mat-ang': 19.5, 'mat-hist': 17.0, 'mat-philo': 16.0, 'mat-eps': 18.0 },
  'stu-ts1-12': { 'mat-maths': 11.0, 'mat-phys': 10.5, 'mat-svt': 12.0, 'mat-fr': 11.5, 'mat-ang': null, 'mat-hist': 11.0, 'mat-philo': 10.0, 'mat-eps': 13.0 },
  'stu-ts1-13': { 'mat-maths': 16.0, 'mat-phys': 15.5, 'mat-svt': 14.5, 'mat-fr': 17.0, 'mat-ang': 16.5, 'mat-hist': 15.0, 'mat-philo': 14.5, 'mat-eps': 17.0 },
  'stu-ts1-14': { 'mat-maths': 8.5,  'mat-phys': 9.5,  'mat-svt': 10.0, 'mat-fr': 8.0,  'mat-ang': 11.5, 'mat-hist': 8.5,  'mat-philo': 7.0,  'mat-eps': 12.0 },
  'stu-ts1-15': { 'mat-maths': 14.0, 'mat-phys': 13.5, 'mat-svt': 15.0, 'mat-fr': 15.5, 'mat-ang': 14.5, 'mat-hist': 13.0, 'mat-philo': 12.5, 'mat-eps': 15.5 },
  'stu-ts1-16': { 'mat-maths': 12.5, 'mat-phys': 11.0, 'mat-svt': 13.5, 'mat-fr': 12.0, 'mat-ang': 13.5, 'mat-hist': 11.5, 'mat-philo': 11.0, 'mat-eps': 14.5 },
  'stu-ts1-17': { 'mat-maths': 4.5,  'mat-phys': 5.0,  'mat-svt': 6.5,  'mat-fr': 7.0,  'mat-ang': 8.0,  'mat-hist': 5.5,  'mat-philo': 4.0,  'mat-eps': 10.0 },
  'stu-ts1-18': { 'mat-maths': 13.5, 'mat-phys': 14.0, 'mat-svt': 12.5, 'mat-fr': 13.0, 'mat-ang': 14.0, 'mat-hist': 13.5, 'mat-philo': 12.0, 'mat-eps': 15.0 },
  'stu-ts1-19': { 'mat-maths': 16.5, 'mat-phys': 15.0, 'mat-svt': 17.5, 'mat-fr': 16.0, 'mat-ang': 17.5, 'mat-hist': 16.0, 'mat-philo': 15.5, 'mat-eps': 18.0 },
  'stu-ts1-20': { 'mat-maths': 10.0, 'mat-phys': 11.0, 'mat-svt': 9.5,  'mat-fr': 10.5, 'mat-ang': 12.0, 'mat-hist': 10.5, 'mat-philo': 9.0,  'mat-eps': 13.0 },
};

// ─── Génération toutes les notes ──────────────────────────────────────────────
export const MOCK_NOTES: INote[] = ELEVES_TS1.flatMap((eleve, i) =>
  genNotes(eleve.id, 'cls-terminale-s1', NOTES_PAR_ELEVE[eleve.id], `ts1-${String(i + 1).padStart(2, '0')}`)
);

// ─── Calcul moyenne pondérée ──────────────────────────────────────────────────
function calcMoyenne(studentId: string): number {
  const notes = MOCK_NOTES.filter(n => n.studentPublicId === studentId && !n.absent && n.valeur !== null);
  const totalCoeff = notes.reduce((s, n) => s + (n.coefficient ?? 1), 0);
  const totalPts   = notes.reduce((s, n) => s + (n.valeur ?? 0) * (n.coefficient ?? 1), 0);
  return totalCoeff > 0 ? Math.round((totalPts / totalCoeff) * 100) / 100 : 0;
}

function getMention(m: number): 'Très Bien' | 'Bien' | 'Assez Bien' | 'Passable' | 'Insuffisant' {
  if (m >= 16) return 'Très Bien';
  if (m >= 14) return 'Bien';
  if (m >= 12) return 'Assez Bien';
  if (m >= 10) return 'Passable';
  return 'Insuffisant';
}

// Calcule les moyennes et rangs
const moyennesEleves = ELEVES_TS1
  .map(e => ({ ...e, moyenne: calcMoyenne(e.id) }))
  .sort((a, b) => b.moyenne - a.moyenne);

const appreciationsPP: Record<number, string> = {
  1:  'Élève remarquable, dotée d\'une grande rigueur intellectuelle. Continuez sur cette voie.',
  2:  'Des résultats insuffisants. Un travail personnel approfondi est indispensable.',
  3:  'Des progrès notables cet semestre. Persévérez pour viser encore plus haut.',
  4:  'Excellence académique confirmée. L\'élève est un modèle pour ses camarades.',
  5:  'Des difficultés persistantes en plusieurs matières. Un suivi est nécessaire.',
  6:  'Résultats satisfaisants. L\'élève peut encore progresser avec plus d\'investissement.',
  7:  'Élève sérieuse et assidue, les résultats sont à la hauteur des efforts fournis.',
  8:  'Des bases fragiles dans les matières scientifiques. Un soutien est recommandé.',
  9:  'Bon semestre dans l\'ensemble malgré une absence. L\'élève doit maintenir ce niveau.',
  10: 'Résultats très insuffisants. Une remise en question du travail personnel s\'impose.',
  11: 'Brillante élève, première de classe au mérite de tous les éloges.',
  12: 'Semestre moyen, pénalisé par des absences. La régularité est essentielle.',
  13: 'Très bons résultats, l\'élève s\'illustre particulièrement en français et langues.',
  14: 'Des lacunes importantes en mathématiques et sciences. Un effort ciblé est attendu.',
  15: 'Bon travail d\'ensemble. Quelques efforts supplémentaires permettraient d\'atteindre l\'excellence.',
  16: 'Résultats corrects. L\'élève progresse à son rythme.',
  17: 'Résultats très préoccupants. Une orientation différente pourrait être envisagée.',
  18: 'Bonne régularité dans le travail. Des résultats honorables qui peuvent encore s\'améliorer.',
  19: 'Excellents résultats ! L\'élève se distingue par sa constance et sa rigueur.',
  20: 'Résultats moyens, l\'élève doit s\'investir davantage pour réussir son baccalauréat.',
};

// ─── Bulletins complets ───────────────────────────────────────────────────────
export const MOCK_BULLETINS: IBulletin[] = moyennesEleves.map((eleve, idx) => {
  const rang     = idx + 1;
  const moyenne  = eleve.moyenne;
  const mention  = getMention(moyenne);
  const notes    = MOCK_NOTES.filter(n => n.studentPublicId === eleve.id);
  const decision = moyenne >= 10 ? 'Admis(e)' : moyenne >= 8 ? 'Redouble' : 'Exclus(e)';

  return {
    publicId:          `bul-ts1-${String(idx + 1).padStart(3, '0')}`,
    studentPublicId:   eleve.id,
    studentNom:        eleve.nom.toUpperCase().replace(/(\w+)\s(\w+)/, '$2 $1'),
    promotionPublicId: 'cls-terminale-s1',
    promotionLibelle:  'Terminale S1',
    semestre:          1,
    anneeAcademiqueId: 1,
    moyenne,
    rang,
    mention,
    statut:            rang <= 5 || rang > 15 ? 'PUBLIE' : 'GENERE',
    createdDate:       '2026-02-01',
    notes,
    pdfUrl:            undefined,
    decision,
    effectif:          42,
    appreciationPP:    appreciationsPP[idx + 1] ?? 'Résultats en cours d\'évaluation.',
  } as IBulletin & { decision: string; effectif: number; appreciationPP: string };
});

// ─── Matières par classe (référentiel) ────────────────────────────────────────
export const MATIERES_BY_CLASSE: Record<string, { publicId: string; libelle: string; coeff: number; enseignant: string }[]> = {
  'cls-terminale-s1': [
    { publicId: 'mat-maths', libelle: 'Mathématiques',   coeff: 5, enseignant: 'M. Kaboré Aristide'  },
    { publicId: 'mat-phys',  libelle: 'Physique-Chimie', coeff: 4, enseignant: 'Mme Traoré Aïssata'  },
    { publicId: 'mat-svt',   libelle: 'SVT',             coeff: 3, enseignant: 'M. Ouédraogo Luc'    },
    { publicId: 'mat-fr',    libelle: 'Français',        coeff: 3, enseignant: 'Mme Coulibaly Fatou' },
    { publicId: 'mat-ang',   libelle: 'Anglais',         coeff: 2, enseignant: 'M. Diallo Seydou'    },
    { publicId: 'mat-hist',  libelle: 'Histoire-Géo',    coeff: 2, enseignant: 'Mme Sanogo Mariam'   },
    { publicId: 'mat-philo', libelle: 'Philosophie',     coeff: 2, enseignant: 'M. Bamba Isidore'    },
    { publicId: 'mat-eps',   libelle: 'EPS',             coeff: 1, enseignant: 'M. Koné Jean-Pierre' },
  ],
  'cls-premiere-d': [
    { publicId: 'mat-maths-p', libelle: 'Mathématiques',   coeff: 5, enseignant: 'M. Kaboré Aristide'  },
    { publicId: 'mat-phys-p',  libelle: 'Physique-Chimie', coeff: 4, enseignant: 'Mme Traoré Aïssata'  },
    { publicId: 'mat-svt-p',   libelle: 'SVT',             coeff: 3, enseignant: 'M. Ouédraogo Luc'    },
    { publicId: 'mat-fr-p',    libelle: 'Français',        coeff: 3, enseignant: 'Mme Coulibaly Fatou' },
    { publicId: 'mat-ang-p',   libelle: 'Anglais',         coeff: 2, enseignant: 'M. Diallo Seydou'    },
    { publicId: 'mat-info-p',  libelle: 'Informatique',    coeff: 2, enseignant: 'M. Bamba Isidore'    },
  ],
  'cls-seconde': [
    { publicId: 'mat-maths-s', libelle: 'Mathématiques',   coeff: 4, enseignant: 'M. Kaboré Aristide'  },
    { publicId: 'mat-phys-s',  libelle: 'Physique-Chimie', coeff: 3, enseignant: 'Mme Traoré Aïssata'  },
    { publicId: 'mat-svt-s',   libelle: 'SVT',             coeff: 2, enseignant: 'M. Ouédraogo Luc'    },
    { publicId: 'mat-fr-s',    libelle: 'Français',        coeff: 3, enseignant: 'Mme Coulibaly Fatou' },
    { publicId: 'mat-ang-s',   libelle: 'Anglais',         coeff: 2, enseignant: 'M. Diallo Seydou'    },
    { publicId: 'mat-hist-s',  libelle: 'Histoire-Géo',    coeff: 2, enseignant: 'Mme Sanogo Mariam'   },
  ],
};

// ─── Évaluations existantes ───────────────────────────────────────────────────
export const MOCK_EVALUATIONS: IEvaluation[] = [
  {
    publicId: 'eval-001', titre: 'Devoir Surveillé N°1 — Maths T1',
    type: 'DEVOIR', periode: 'T1',
    matierePublicId: 'mat-maths', matiereLibelle: 'Mathématiques', coefficient: 5,
    promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1',
    enseignantPublicId: 'usr-ens-004', enseignantNom: 'M. Kaboré Aristide',
    anneeAcademique: '2025-2026', dateEvaluation: '2025-11-10',
    statut: 'PUBLIE', nbEleves: 20, nbSaisis: 20, createdDate: '2025-11-15',
  },
  {
    publicId: 'eval-002', titre: 'Examen Semestre 1 — Physique-Chimie',
    type: 'EXAMEN', periode: 'S1',
    matierePublicId: 'mat-phys', matiereLibelle: 'Physique-Chimie', coefficient: 4,
    promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1',
    enseignantPublicId: 'usr-ens-002', enseignantNom: 'Mme Traoré Aïssata',
    anneeAcademique: '2025-2026', dateEvaluation: '2026-01-15',
    statut: 'VALIDEE', nbEleves: 20, nbSaisis: 20, createdDate: '2026-01-20',
  },
  {
    publicId: 'eval-003', titre: 'TP Biologie — SVT T2',
    type: 'TP', periode: 'T2',
    matierePublicId: 'mat-svt', matiereLibelle: 'SVT', coefficient: 3,
    promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1',
    enseignantPublicId: 'usr-ens-003', enseignantNom: 'M. Ouédraogo Luc',
    anneeAcademique: '2025-2026', dateEvaluation: '2026-02-20',
    statut: 'SAISIE', nbEleves: 20, nbSaisis: 18, createdDate: '2026-02-25',
  },
  {
    publicId: 'eval-004', titre: 'Devoir Surveillé N°2 — Français T2',
    type: 'DEVOIR', periode: 'T2',
    matierePublicId: 'mat-fr', matiereLibelle: 'Français', coefficient: 3,
    promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1',
    enseignantPublicId: 'usr-ens-005', enseignantNom: 'Mme Coulibaly Fatou',
    anneeAcademique: '2025-2026', dateEvaluation: '2026-03-10',
    statut: 'BROUILLON', nbEleves: 20, nbSaisis: 0, createdDate: '2026-03-12',
  },
  {
    publicId: 'eval-005', titre: 'Oral Anglais — T1',
    type: 'ORAL', periode: 'T1',
    matierePublicId: 'mat-ang', matiereLibelle: 'Anglais', coefficient: 2,
    promotionPublicId: 'cls-terminale-s1', promotionLibelle: 'Terminale S1',
    enseignantPublicId: 'usr-ens-002', enseignantNom: 'M. Diallo Seydou',
    anneeAcademique: '2025-2026', dateEvaluation: '2025-12-05',
    statut: 'PUBLIE', nbEleves: 20, nbSaisis: 20, createdDate: '2025-12-10',
  },
];

// ─── Élèves par classe (pour la saisie) ─────────────────────────────────────
export const ELEVES_BY_CLASSE: Record<string, IEleveContext[]> = {
  'cls-terminale-s1': ELEVES_TS1.map((e, i) => ({
    publicId:  e.id,
    nom:       e.nom,
    matricule: e.matricule,
    genre:     (i % 3 === 0 ? 'M' : 'F') as 'M' | 'F',
    statut:    'ACTIF',
  })),
  'cls-premiere-d': [
    { publicId: 'stu-pd-01', nom: 'Amadou Baldé',       matricule: 'LYCÉE-CI/2025/000031', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-pd-02', nom: 'Bineta Sow',         matricule: 'LYCÉE-CI/2025/000032', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-pd-03', nom: 'Cheikh Gueye',       matricule: 'LYCÉE-CI/2025/000033', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-pd-04', nom: 'Djeneba Coulibaly',  matricule: 'LYCÉE-CI/2025/000034', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-pd-05', nom: 'Elhadji Ndiaye',     matricule: 'LYCÉE-CI/2025/000035', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-pd-06', nom: 'Fatouma Cissé',      matricule: 'LYCÉE-CI/2025/000036', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-pd-07', nom: 'Gnangon Kouassi',    matricule: 'LYCÉE-CI/2025/000037', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-pd-08', nom: 'Halimatou Barry',    matricule: 'LYCÉE-CI/2025/000038', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-pd-09', nom: 'Ibou Badji',         matricule: 'LYCÉE-CI/2025/000039', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-pd-10', nom: 'Jaha Diallo',        matricule: 'LYCÉE-CI/2025/000040', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-pd-11', nom: 'Karim Ouédraogo',    matricule: 'LYCÉE-CI/2025/000041', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-pd-12', nom: 'Lamine Traoré',      matricule: 'LYCÉE-CI/2025/000042', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-pd-13', nom: 'Maïmouna Touré',     matricule: 'LYCÉE-CI/2025/000043', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-pd-14', nom: 'Nana Konaté',        matricule: 'LYCÉE-CI/2025/000044', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-pd-15', nom: 'Oumar Sangaré',      matricule: 'LYCÉE-CI/2025/000045', genre: 'M', statut: 'ACTIF' },
  ],
  'cls-seconde': [
    { publicId: 'stu-sec-01', nom: 'Aïcha Kouyaté',    matricule: 'LYCÉE-CI/2025/000046', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-sec-02', nom: 'Bienvenu Gnon',    matricule: 'LYCÉE-CI/2025/000047', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-sec-03', nom: 'Clémentine Bah',   matricule: 'LYCÉE-CI/2025/000048', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-sec-04', nom: 'Daouda Fall',      matricule: 'LYCÉE-CI/2025/000049', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-sec-05', nom: 'Estelle Kouadio',  matricule: 'LYCÉE-CI/2025/000050', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-sec-06', nom: 'Fousseyni Mané',   matricule: 'LYCÉE-CI/2025/000051', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-sec-07', nom: 'Gnougbile Camara', matricule: 'LYCÉE-CI/2025/000052', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-sec-08', nom: 'Habibatou Diallo', matricule: 'LYCÉE-CI/2025/000053', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-sec-09', nom: 'Ibrahim Coulibaly',matricule: 'LYCÉE-CI/2025/000054', genre: 'M', statut: 'ACTIF' },
    { publicId: 'stu-sec-10', nom: 'Jaqueline Toure',  matricule: 'LYCÉE-CI/2025/000055', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-sec-11', nom: 'Kadi Sylla',       matricule: 'LYCÉE-CI/2025/000056', genre: 'F', statut: 'ACTIF' },
    { publicId: 'stu-sec-12', nom: 'Lansana Kourouma', matricule: 'LYCÉE-CI/2025/000057', genre: 'M', statut: 'ACTIF' },
  ],
};
