export type StatutCours = 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
export type TypeQuestion = 'QCM' | 'VRAI_FAUX' | 'REPONSE_COURTE' | 'REPONSE_LONGUE';
export type StatutSession = 'EN_COURS' | 'SOUMIS' | 'EXPIRE' | 'CORRIGE';
export type TypeRessource = 'PDF' | 'VIDEO' | 'LIEN' | 'IMAGE';

export interface IRessource {
  publicId:  string;
  titre:     string;
  type:      TypeRessource;
  url:       string;
  vue:       boolean;
}

export interface IChapitre {
  publicId:   string;
  titre:      string;
  ordre:      number;
  ressources: IRessource[];
}

export interface ICours {
  publicId:          string;
  titre:             string;
  description:       string;
  matierePublicId:   string;
  matiereLibelle:    string;
  promotionPublicId: string;
  enseignantPublicId: string;
  enseignantNom:     string;
  statut:            StatutCours;
  chapitres:         IChapitre[];
  progression:       number;
  createdDate:       string;
}

export interface IQuestion {
  publicId:       string;
  enonce:         string;
  type:           TypeQuestion;
  options?:       string[];
  bonnesReponses: string[];
  points:         number;
}

export interface IExamen {
  publicId:          string;
  titre:             string;
  matierePublicId:   string;
  matiereLibelle:    string;
  dureeMinutes:      number;
  dateDebut:         string;
  dateFin:           string;
  questions:         IQuestion[];
}

export interface IExamSession {
  publicId:     string;
  examenPublicId: string;
  studentPublicId: string;
  statut:       StatutSession;
  score?:       number;
  scoreMax:     number;
  debutAt:      string;
  finAt?:       string;
}
