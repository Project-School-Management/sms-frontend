// ── Enumerations ──────────────────────────────────────────────────────────────
export type StatutNote =
  | 'BROUILLON'   // Saisie en cours, non soumise
  | 'SAISIE'      // Soumise par l'enseignant
  | 'VALIDEE'     // Validée par le responsable pédagogique
  | 'MODIFIEE'    // Modifiée après saisie initiale (historique conservé)
  | 'PUBLIE'      // Publiée → visible par les étudiants
  | 'ANNULEE';    // Annulée logiquement (jamais supprimée)

export type TypeEvaluation = 'DEVOIR' | 'EXAMEN' | 'TP' | 'ORAL' | 'PROJET' | 'RATTRAPAGE';
export type Periode        = 'T1' | 'T2' | 'T3' | 'S1' | 'S2' | 'ANNUEL';
export type CasParticulier = 'ABS' | 'EXC' | 'DISP'; // Absent, Excusé, Dispensé
export type StatutBulletin = 'EN_ATTENTE' | 'GENERE' | 'PUBLIE';
export type StatutEvaluation = 'BROUILLON' | 'SAISIE' | 'VALIDEE' | 'PUBLIE';

// ── Structures académiques ────────────────────────────────────────────────────
export interface IMatiere {
  publicId:    string;
  code:        string;
  libelle:     string;
  coefficient: number;
  uePublicId:  string;
}

export interface IUE {
  publicId:          string;
  code:              string;
  libelle:           string;
  credits:           number;
  promotionPublicId: string;
  matieres:          IMatiere[];
}

// ── Évaluation (contexte d'une session de saisie) ─────────────────────────────
export interface IEvaluation {
  publicId:          string;
  titre:             string;
  type:              TypeEvaluation;
  periode:           Periode;
  matierePublicId:   string;
  matiereLibelle:    string;
  coefficient:       number;
  promotionPublicId: string;
  promotionLibelle:  string;
  enseignantPublicId: string;
  enseignantNom:     string;
  anneeAcademique:   string;
  dateEvaluation:    string;
  dateLimit?:        string;
  statut:            StatutEvaluation;
  nbEleves:          number;
  nbSaisis:          number;
  createdDate:       string;
}

// ── Historique d'une note (audit des modifications) ───────────────────────────
export interface IHistoriqueNote {
  id:            string;
  notePublicId:  string;
  ancienneValeur: number | null | string;
  nouvelleValeur: number | null | string;
  auteur:        string;
  date:          string;
  motif?:        string;
}

// ── Note ──────────────────────────────────────────────────────────────────────
export interface INote {
  publicId:           string;
  studentPublicId:    string;
  matierePublicId:    string;
  matiereLibelle:     string;
  evaluationPublicId?: string;
  valeur:             number | null;
  casParticulier?:    CasParticulier;  // ABS / EXC / DISP
  absent:             boolean;         // rétro-compat — true si casParticulier === 'ABS'
  appreciation?:      string;
  statut:             StatutNote;
  createdDate:        string;
  updatedDate?:       string;
  coefficient?:       number;
  enseignantNom?:     string;
  studentNom?:        string;
  studentGenre?:      'M' | 'F';
  studentMatricule?:  string;
  historique?:        IHistoriqueNote[];
}

// ── Bulletin ──────────────────────────────────────────────────────────────────
export type MentionBulletin = 'Très Bien' | 'Bien' | 'Assez Bien' | 'Passable' | 'Insuffisant';

export interface IBulletin {
  publicId:          string;
  studentPublicId:   string;
  studentNom:        string;
  promotionPublicId: string;
  promotionLibelle:  string;
  semestre:          number;
  anneeAcademiqueId: number;
  moyenne:           number;
  rang:              number;
  statut:            StatutBulletin;
  pdfUrl?:           string;
  createdDate:       string;
  notes:             INote[];
  mention?:          MentionBulletin;
}

// ── Structures organisationnelles ─────────────────────────────────────────────
export interface IPromotion {
  publicId:            string;
  libelle:             string;
  code:                string;
  specialitePublicId:  string;
  anneeAcademiqueId:   number;
  effectif:            number;
}

export interface IFaculte {
  publicId: string;
  code:     string;
  libelle:  string;
}

export interface IDepartement {
  publicId:        string;
  code:            string;
  libelle:         string;
  facultePublicId: string;
}

export interface ISpecialite {
  publicId:             string;
  code:                 string;
  libelle:              string;
  departementPublicId:  string;
}

// ── Élève pour la saisie (résumé) ─────────────────────────────────────────────
export interface IEleveContext {
  publicId:   string;
  nom:        string;
  matricule:  string;
  genre:      'M' | 'F';
  statut:     string;
}
