export type StatutCours   = 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
export type StatutExamen  = 'A_VENIR' | 'EN_COURS' | 'TERMINE';
export type TypeQuestion  = 'QCM' | 'VRAI_FAUX' | 'REPONSE_COURTE' | 'REPONSE_LONGUE';
export type StatutSession = 'EN_COURS' | 'SOUMIS' | 'EXPIRE' | 'CORRIGE';
export type TypeRessource = 'PDF' | 'VIDEO' | 'LIEN' | 'IMAGE' | 'ZIP' | 'AUDIO' | 'EXERCICE';

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
  dureeHeures?:      number;
  niveauLibelle?:    string;
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
  statut:            StatutExamen;
  sallePublicId?:    string;
  salleLibelle?:     string;
  niveauLibelle?:    string;
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

// ── Nouveaux types LMS ────────────────────────────────────────────────────────

export interface ICategorie {
  publicId:     string;
  libelle:      string;
  icon:         string;
  couleur:      string;
  nbCours:      number;
  description?: string;
}

export type StatutDevoir = 'OUVERT' | 'FERME' | 'CORRIGE';

export interface IDevoir {
  publicId:      string;
  titre:         string;
  coursPublicId: string;
  coursLibelle:  string;
  description:   string;
  dateDebut:     string;
  dateLimite:    string;
  bareme:        number;
  statut:        StatutDevoir;
  nbSoumissions: number;
  nbEtudiants:   number;
  pieceJointe?:  string;
}

export type TypeRessourcePedago = 'PDF' | 'VIDEO' | 'IMAGE' | 'AUDIO' | 'PRESENTATION' | 'DOCUMENT' | 'ZIP' | 'LIEN';

export interface IRessourcePedago {
  publicId:          string;
  titre:             string;
  type:              TypeRessourcePedago;
  taille?:           string;
  url:               string;
  coursPublicId?:    string;
  coursLibelle?:     string;
  uploadDate:        string;
  nbTelechargements: number;
  tags:              string[];
}

export interface IDiscussion {
  publicId:       string;
  titre:          string;
  auteur:         string;
  initiales:      string;
  couleurAvatar:  string;
  date:           string;
  nbReponses:     number;
  resolu:         boolean;
  coursLibelle?:  string;
  preview:        string;
}

export type PrioriteAnnonce = 'HAUTE' | 'NORMALE' | 'FAIBLE';

export interface IAnnonce {
  publicId:       string;
  titre:          string;
  contenu:        string;
  auteur:         string;
  date:           string;
  priorite:       PrioriteAnnonce;
  lu:             boolean;
  coursLibelle?:  string;
}

export type StatutParticipant = 'ACTIF' | 'INACTIF' | 'COMPLETE';

export interface IParticipant {
  publicId:         string;
  nom:              string;
  email:            string;
  classe:           string;
  progression:      number;
  derniereActivite: string;
  statut:           StatutParticipant;
  nbLeconTerminees: number;
  nbLeconTotal:     number;
  initiales:        string;
}

export type StatutSessionVirtuelle = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface ISessionVirtuelle {
  publicId:     string;
  titre:        string;
  coursLibelle: string;
  enseignant:   string;
  date:         string;
  heure:        string;
  dureeMinutes: number;
  statut:       StatutSessionVirtuelle;
  nbInscrits:   number;
  lienJoin?:    string;
}

export type TypeEvenement = 'COURS' | 'DEVOIR' | 'EXAMEN' | 'SESSION';

export interface IEvenementPedago {
  publicId:      string;
  titre:         string;
  type:          TypeEvenement;
  date:          string;
  heure?:        string;
  couleur:       string;
  coursLibelle?: string;
  urgent?:       boolean;
}

export interface ICertificat {
  publicId:      string;
  coursPublicId: string;
  coursLibelle:  string;
  etudiantNom:   string;
  dateEmission:  string;
  score:         number;
  mention:       string;
}

export type DifficulteQuestion = 'FACILE' | 'MOYEN' | 'DIFFICILE';

export interface IQuestionBanque {
  publicId:       string;
  enonce:         string;
  type:           TypeQuestion;
  options?:       string[];
  bonnesReponses: string[];
  points:         number;
  matiere:        string;
  difficulte:     DifficulteQuestion;
  tags:           string[];
  utiliseesDans:  number;
}

export interface IResultatExamen {
  publicId:       string;
  examenPublicId: string;
  examenLibelle:  string;
  etudiantNom:    string;
  etudiantClasse: string;
  score:          number;
  scoreMax:       number;
  rang:           number;
  dureeMinutes:   number;
  date:           string;
  mention:        string;
}
