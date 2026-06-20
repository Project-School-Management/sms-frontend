export type TypeRessourceBiblio = 'LIVRE' | 'PDF' | 'VIDEO' | 'AUDIO' | 'LIEN' | 'PERIODIQUE';
export type StatutRessource     = 'DISPONIBLE' | 'EMPRUNTE' | 'RESERVE' | 'INDISPONIBLE';
export type StatutEmprunt       = 'EN_COURS' | 'RETOURNE' | 'EN_RETARD' | 'PERDU';
export type NiveauScolaire      = 'PRIMAIRE' | 'COLLEGE' | 'LYCEE' | 'SUPERIEUR' | 'TOUS';

export interface ILibraryResource {
  publicId:        string;
  titre:           string;
  auteur:          string;
  description:     string;
  type:            TypeRessourceBiblio;
  statut:          StatutRessource;
  categorie:       string;
  categorieId:     string;
  isbn?:           string;
  editeur?:        string;
  anneePublication?: number;
  niveaux:         NiveauScolaire[];
  tags:            string[];
  urlCouverture?:  string;
  urlFichier?:     string;
  nombrePages?:    number;
  langue:          string;
  nbExemplaires:   number;
  nbDisponibles:   number;
  nbTelechargements: number;
  dateAjout:       string;
  notesMoyenne?:   number;
  nbAvis:          number;
  // ── Disponibilité physique & numérique ──
  disponibleEnLigne: boolean;          // version électronique consultable/téléchargeable
  formatNumerique?:  string;           // ex: 'PDF · 12 Mo', 'EPUB', 'MP4 · 1h20'
  emplacement?:      string;           // localisation physique, ex: 'Rayon B3'
  cote?:             string;           // cote bibliothéconomique, ex: '510.DUP'
  section?:          string;           // ex: 'Section Sciences'
}

export interface ILibraryCategory {
  publicId:    string;
  libelle:     string;
  icon:        string;
  couleur:     string;
  nbRessources: number;
}

export interface ILoan {
  publicId:          string;
  ressourcePublicId: string;
  ressourceTitre:    string;
  ressourceAuteur:   string;
  urlCouverture?:    string;
  type:              TypeRessourceBiblio;
  studentPublicId:   string;
  studentNom:        string;
  dateEmprunt:       string;
  dateRetourPrevue:  string;
  dateRetourEffective?: string;
  statut:            StatutEmprunt;
  nbRenouvellements: number;
}

export interface ILibraryStats {
  totalRessources:    number;
  empruntsEnCours:    number;
  empruntsEnRetard:   number;
  ressourcesPopulaires: ILibraryResource[];
  recentlyAdded:      ILibraryResource[];
}

export type StatutReservation = 'EN_ATTENTE' | 'DISPONIBLE' | 'ANNULEE' | 'HONOREE';

export interface IReservation {
  publicId:               string;
  ressourcePublicId:      string;
  ressourceTitre:         string;
  ressourceAuteur:        string;
  urlCouverture?:         string;
  studentPublicId:        string;
  studentNom:             string;
  dateReservation:        string;
  rangFile:               number;            // position dans la file d'attente
  dateDisponibilitePrevue?: string;
  statut:                 StatutReservation;
}

/** Élève allégé pour les sélecteurs de la bibliothèque. */
export interface IStudentLite {
  publicId: string;
  nom:      string;
  classe:   string;
  matricule: string;
}
