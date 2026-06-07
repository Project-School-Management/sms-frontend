export type StatutNote = 'SAISIE' | 'VALIDEE' | 'MODIFIEE';
export type TypeEvaluation = 'DEVOIR' | 'EXAMEN' | 'TP' | 'ORAL' | 'PROJET';
export type StatutBulletin = 'EN_ATTENTE' | 'GENERE' | 'PUBLIE';

export interface IMatiere {
  publicId:    string;
  code:        string;
  libelle:     string;
  coefficient: number;
  uePublicId:  string;
}

export interface IUE {
  publicId:         string;
  code:             string;
  libelle:          string;
  credits:          number;
  promotionPublicId: string;
  matieres:         IMatiere[];
}

export interface INote {
  publicId:         string;
  studentPublicId:  string;
  matierePublicId:  string;
  matiereLibelle:   string;
  valeur:           number | null;
  absent:           boolean;
  appreciation?:    string;
  statut:           StatutNote;
  evaluationPublicId?: string;
  createdDate:      string;
  coefficient?:     number;
  enseignantNom?:   string;
  studentNom?:      string;
}

export type MentionBulletin = 'Très Bien' | 'Bien' | 'Assez Bien' | 'Passable' | 'Insuffisant';

export interface IBulletin {
  publicId:         string;
  studentPublicId:  string;
  studentNom:       string;
  promotionPublicId: string;
  promotionLibelle: string;
  semestre:         number;
  anneeAcademiqueId: number;
  moyenne:          number;
  rang:             number;
  statut:           StatutBulletin;
  pdfUrl?:          string;
  createdDate:      string;
  notes:            INote[];
  mention?:         MentionBulletin;
}

export interface IPromotion {
  publicId:            string;
  libelle:             string;
  code:                string;
  specialitePublicId:  string;
  anneeAcademiqueId:   number;
  effectif:            number;
}

export interface IFaculte {
  publicId:  string;
  code:      string;
  libelle:   string;
}

export interface IDepartement {
  publicId:      string;
  code:          string;
  libelle:       string;
  facultePublicId: string;
}

export interface ISpecialite {
  publicId:           string;
  code:               string;
  libelle:            string;
  departementPublicId: string;
}
