import { WorkspaceType, IWorkspaceVocabulary, IWorkspaceFeatures } from './workspace.model';

/**
 * Dictionnaire de vocabulaire + fonctionnalités par type d'espace.
 *
 * SOURCE UNIQUE de l'adaptation contextuelle : pour ajouter un nouveau type
 * d'espace (INSTITUTE, ACADEMY…), il suffit d'ajouter une entrée ici —
 * aucun composant ne contient de condition sur le type d'espace.
 */
export const WORKSPACE_VOCABULARY: Record<WorkspaceType, IWorkspaceVocabulary> = {
  [WorkspaceType.FUNDAMENTAL]: {
    learner: 'Élève', learnerPlural: 'Élèves', group: 'Classe',
    period: 'Trimestre', reportCard: 'Bulletin', progression: 'Passage',
  },
  [WorkspaceType.COLLEGE]: {
    learner: 'Élève', learnerPlural: 'Élèves', group: 'Classe',
    period: 'Trimestre', reportCard: 'Bulletin', progression: 'Passage',
  },
  [WorkspaceType.LYCEUM]: {
    learner: 'Élève', learnerPlural: 'Élèves', group: 'Classe',
    period: 'Trimestre', reportCard: 'Bulletin', progression: 'Passage',
  },
  [WorkspaceType.UNIVERSITY]: {
    learner: 'Étudiant', learnerPlural: 'Étudiants', group: 'Faculté / UE',
    period: 'Semestre', reportCard: 'Relevé de notes', progression: 'Validation',
  },
};

/** Fonctionnalités activées par type d'espace (masquage contextuel). */
export const WORKSPACE_FEATURES: Record<WorkspaceType, IWorkspaceFeatures> = {
  [WorkspaceType.FUNDAMENTAL]: { creditsEnabled: false, validationEnabled: false },
  [WorkspaceType.COLLEGE]:     { creditsEnabled: false, validationEnabled: false },
  [WorkspaceType.LYCEUM]:      { creditsEnabled: false, validationEnabled: false },
  [WorkspaceType.UNIVERSITY]:  { creditsEnabled: true,  validationEnabled: true  },
};

/** Vocabulaire par défaut quand le type d'espace est inconnu (fallback scolaire neutre). */
export const DEFAULT_VOCABULARY: IWorkspaceVocabulary = WORKSPACE_VOCABULARY[WorkspaceType.LYCEUM];
export const DEFAULT_FEATURES: IWorkspaceFeatures = WORKSPACE_FEATURES[WorkspaceType.LYCEUM];

/** Résout le vocabulaire d'un type d'espace (fallback sûr si null/inconnu). */
export function getVocabulary(type: WorkspaceType | null | undefined): IWorkspaceVocabulary {
  return type ? WORKSPACE_VOCABULARY[type] ?? DEFAULT_VOCABULARY : DEFAULT_VOCABULARY;
}

/** Résout les fonctionnalités d'un type d'espace (fallback sûr si null/inconnu). */
export function getFeatures(type: WorkspaceType | null | undefined): IWorkspaceFeatures {
  return type ? WORKSPACE_FEATURES[type] ?? DEFAULT_FEATURES : DEFAULT_FEATURES;
}
