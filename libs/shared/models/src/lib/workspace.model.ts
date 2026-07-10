/**
 * Contexte « Espace métier » (workspace) issu du JWT Keycloak.
 *
 * Le type d'espace pilote TOUTE l'adaptation contextuelle de l'UI
 * (vocabulaire, périodes, statuts, fonctionnalités) — aucun `if` codé en dur
 * dans les composants : on dérive tout de {@link WorkspaceType}.
 *
 * Claims source : `workspace_type`, `workspace_id`, `tenant_id`.
 */
export enum WorkspaceType {
  FUNDAMENTAL = 'FUNDAMENTAL',
  COLLEGE     = 'COLLEGE',
  LYCEUM      = 'LYCEUM',
  UNIVERSITY  = 'UNIVERSITY',
}

/**
 * Vocabulaire affiché, dérivé du type d'espace.
 * (Élève/Étudiant, Classe/Faculté, Trimestre/Semestre, Bulletin/Relevé, Passage/Validation…)
 */
export interface IWorkspaceVocabulary {
  /** « Élève » | « Étudiant » */
  learner:      string;
  learnerPlural:string;
  /** « Classe » | « Faculté / UE » */
  group:        string;
  /** « Trimestre » | « Semestre » */
  period:       string;
  /** « Bulletin » | « Relevé de notes » */
  reportCard:   string;
  /** « Passage » | « Validation » */
  progression:  string;
}

/**
 * Drapeaux de fonctionnalités contextuels (masquage automatique — obs. 9).
 * Orthogonal au RBAC : c'est un second filtre cumulatif au rôle.
 */
export interface IWorkspaceFeatures {
  /** UE / crédits ECTS (universitaire uniquement par défaut) */
  creditsEnabled:    boolean;
  /** Sessions / jury de validation */
  validationEnabled: boolean;
}

/** Contexte d'espace complet consommé par le frontend. */
export interface IWorkspaceContext {
  tenantId:      string | null;
  workspaceId:   string | null;
  workspaceType: WorkspaceType | null;
  vocabulary:    IWorkspaceVocabulary;
  features:      IWorkspaceFeatures;
}
