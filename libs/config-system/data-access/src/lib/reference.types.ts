// ══════════════════════════════════════════════════════════════════════════════
// @sms/config-system — Reference Types
// Source de vérité pour TOUS les référentiels de la plateforme
// Contrat d'API identique au futur microservice reference-service
// ══════════════════════════════════════════════════════════════════════════════

// ── Établissement ─────────────────────────────────────────────────────────────
export type TypeEtablissement =
  | 'PRIMAIRE' | 'COLLEGE' | 'LYCEE' | 'UNIVERSITE'
  | 'FORMATION_PRO' | 'ECOLE_SPECIALISEE' | 'CENTRE_FORMATION';

export interface IEtablissement {
  publicId:    string;
  code:        string;
  libelle:     string;
  type:        TypeEtablissement;
  adresse?:    string;
  ville?:      string;
  pays?:       string;
  telephone?:  string;
  email?:      string;
  logoUrl?:    string;
  active:      boolean;
}

// ── Cycles ────────────────────────────────────────────────────────────────────
export interface ICycle {
  publicId: string;
  code:     string;
  libelle:  string;
  ordre:    number;
  active:   boolean;
}

// ── Niveaux ───────────────────────────────────────────────────────────────────
export interface INiveau {
  publicId:       string;
  code:           string;
  libelle:        string;
  cyclePublicId:  string;
  cycleLibelle:   string;
  ordre:          number;
  active:         boolean;
}

// ── Filières ──────────────────────────────────────────────────────────────────
export interface IFiliere {
  publicId:       string;
  code:           string;
  libelle:        string;
  cyclePublicId?: string;
  description?:   string;
  active:         boolean;
}

// ── Spécialités ───────────────────────────────────────────────────────────────
export interface ISpecialite {
  publicId:            string;
  code:                string;
  libelle:             string;
  departementPublicId: string;
  description?:        string;
  active:              boolean;
}

// ── Départements ──────────────────────────────────────────────────────────────
export interface IDepartementRef {
  publicId:        string;
  code:            string;
  libelle:         string;
  facultePublicId: string;
  chefPublicId?:   string;
  active:          boolean;
}

// ── Facultés ──────────────────────────────────────────────────────────────────
export interface IFaculteRef {
  publicId:  string;
  code:      string;
  libelle:   string;
  doyenNom?: string;
  active:    boolean;
}

// ── Classes / Promotions ──────────────────────────────────────────────────────
export interface IClasseRef {
  publicId:              string;
  code:                  string;
  libelle:               string;
  niveauPublicId:        string;
  niveauLibelle:         string;
  cyclePublicId:         string;
  cycleLibelle:          string;
  filierePublicId?:      string;
  filiereLibelle?:       string;
  specialitePublicId?:   string;
  specialiteLibelle?:    string;
  capacite:              number;
  effectif:              number;
  anneeAcademiquePublicId: string;
  professeurPrincipal?:  string;
  sallePrincipale?:      string;
  active:                boolean;
}

// ── Matières ──────────────────────────────────────────────────────────────────
export type TypeMatiere = 'OBLIGATOIRE' | 'OPTIONNELLE' | 'UE' | 'EC' | 'MODULE';

export interface IMatiereRef {
  publicId:         string;
  code:             string;
  libelle:          string;
  type:             TypeMatiere;
  coefficient:      number;
  heuresHebdo:      number;
  heuresTotal?:     number;
  credits?:         number;  // ECTS pour l'université
  niveauxPublicIds: string[];
  active:           boolean;
  couleur?:         string;  // pour le planning
}

// ── Années académiques ────────────────────────────────────────────────────────
export interface IAnneeAcademiqueRef {
  publicId:   string;
  libelle:    string;
  dateDebut:  string;
  dateFin:    string;
  active:     boolean;
  description?: string;
}

// ── Périodes (semestres/trimestres) ───────────────────────────────────────────
export type TypePeriode = 'SEMESTRE' | 'TRIMESTRE' | 'SESSION' | 'ANNUEL';

export interface IPeriodeRef {
  publicId:              string;
  libelle:               string;
  type:                  TypePeriode;
  ordre:                 number;
  dateDebut:             string;
  dateFin:               string;
  anneeAcademiquePublicId: string;
  active:                boolean;
}

// ── Bâtiments ─────────────────────────────────────────────────────────────────
export interface IBatimentRef {
  publicId:  string;
  code:      string;
  libelle:   string;
  nbEtages?: number;
  campus?:   string;
  active:    boolean;
}

// ── Salles ────────────────────────────────────────────────────────────────────
export type TypeSalle =
  | 'TD' | 'AMPHI' | 'LABO' | 'TP' | 'INFORMATIQUE'
  | 'BUREAU' | 'SALLE_REUNION' | 'BIBLIOTHEQUE' | 'GYMNASE';

export interface ISalleRef {
  publicId:         string;
  code:             string;
  libelle:          string;
  type:             TypeSalle;
  capacite:         number;
  batimentPublicId?: string;
  batimentLibelle?:  string;
  etage?:           number;
  equipements?:     string[];
  active:           boolean;
}

// ── Types de frais ────────────────────────────────────────────────────────────
export type TypeFraisCategorie = 'INSCRIPTION' | 'SCOLARITE' | 'CANTINE' | 'TRANSPORT' | 'AUTRE';

export interface ITypeFraisRef {
  publicId:         string;
  code:             string;
  libelle:          string;
  categorie:        TypeFraisCategorie;
  montant:          number;
  obligatoire:      boolean;
  niveauPublicId?:  string;
  cyclePublicId?:   string;
  description?:     string;
  active:           boolean;
}

// ── Types de bourses ──────────────────────────────────────────────────────────
export interface ITypeBourseRef {
  publicId:    string;
  code:        string;
  libelle:     string;
  montantMax?: number;
  conditions?: string;
  active:      boolean;
}

// ── Grades / Fonctions RH ─────────────────────────────────────────────────────
export type CategoriePersonnel = 'ENSEIGNANT' | 'ADMIN' | 'TECHNIQUE' | 'DIRECTION' | 'SUPPORT';

export interface IGradeRef {
  publicId:          string;
  code:              string;
  libelle:           string;
  categorie:         CategoriePersonnel;
  niveauRequis?:     string;
  salaireBase?:      number;
  active:            boolean;
}

// ── Types de documents ────────────────────────────────────────────────────────
export interface ITypeDocumentRef {
  publicId:     string;
  code:         string;
  libelle:      string;
  obligatoire:  boolean;
  description?: string;
  active:       boolean;
}

// ── Types d'évaluation ────────────────────────────────────────────────────────
export interface ITypeEvaluationRef {
  publicId:    string;
  code:        string;
  libelle:     string;
  coefficient: number;
  dureeMin?:   number;
  active:      boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// Contrat API Reference Service
// (identique au futur microservice reference-service)
// ══════════════════════════════════════════════════════════════════════════════
export interface IReferenceServiceContract {
  // Établissement
  getEtablissement():           Promise<IEtablissement>;

  // Structure pédagogique
  getCycles():                  Promise<ICycle[]>;
  getNiveaux(cycleId?: string): Promise<INiveau[]>;
  getFilieres(cycleId?: string):Promise<IFiliere[]>;
  getSpecialites(deptId?: string):Promise<ISpecialite[]>;
  getDepartements(facId?: string):Promise<IDepartementRef[]>;
  getFacultes():                Promise<IFaculteRef[]>;

  // Classes
  getClasses(params?: { niveauId?: string; anneeId?: string; cycleId?: string }): Promise<IClasseRef[]>;

  // Pédagogie
  getMatieres(niveauId?: string):    Promise<IMatiereRef[]>;
  getTypesEvaluation():              Promise<ITypeEvaluationRef[]>;

  // Calendrier
  getAnneesAcademiques():            Promise<IAnneeAcademiqueRef[]>;
  getAnneeActive():                  Promise<IAnneeAcademiqueRef | null>;
  getPeriodes(anneeId?: string):     Promise<IPeriodeRef[]>;

  // Logistique
  getBatiments():                    Promise<IBatimentRef[]>;
  getSalles(batId?: string):         Promise<ISalleRef[]>;
  getSallesByType(type: TypeSalle):  Promise<ISalleRef[]>;

  // Finance
  getTypesFrais(cycleId?: string):   Promise<ITypeFraisRef[]>;
  getTypesBourses():                 Promise<ITypeBourseRef[]>;

  // RH
  getGrades(categorie?: CategoriePersonnel): Promise<IGradeRef[]>;

  // Documents
  getTypesDocuments():               Promise<ITypeDocumentRef[]>;
}

// ── Snapshot de configuration d'établissement ─────────────────────────────────
export interface IConfigSnapshot {
  etablissement:    IEtablissement;
  cycles:           ICycle[];
  niveaux:          INiveau[];
  filieres:         IFiliere[];
  facultes:         IFaculteRef[];
  departements:     IDepartementRef[];
  specialites:      ISpecialite[];
  classes:          IClasseRef[];
  matieres:         IMatiereRef[];
  annees:           IAnneeAcademiqueRef[];
  periodes:         IPeriodeRef[];
  batiments:        IBatimentRef[];
  salles:           ISalleRef[];
  typesFrais:       ITypeFraisRef[];
  typesBourses:     ITypeBourseRef[];
  grades:           IGradeRef[];
  typesDocuments:   ITypeDocumentRef[];
  typesEvaluation:  ITypeEvaluationRef[];
}
