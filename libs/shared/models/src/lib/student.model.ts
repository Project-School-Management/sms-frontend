/**
 * Modèle élève (utilisé cross-feature : students, academic, finance)
 */
export interface IStudent {
  publicId:         string;   // UUID
  matricule:        string;
  firstName:        string;
  lastName:         string;
  dateNaissance:    string;   // ISO-8601
  genre:            'M' | 'F';
  email?:           string;
  phone?:           string;
  photoUrl?:        string;
  etablissementId:  number;
  anneeAcademiqueId: number;
  classePublicId?:  string;
  statut:           StudentStatut;
}

export type StudentStatut =
  | 'ACTIF'
  | 'INACTIF'
  | 'DIPLOME'
  | 'EXCLUS'
  | 'TRANSFERE';
