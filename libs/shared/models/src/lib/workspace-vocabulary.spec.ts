import { WorkspaceType } from './workspace.model';
import { getVocabulary, getFeatures, WORKSPACE_VOCABULARY } from './workspace-vocabulary';

describe('workspace-vocabulary', () => {
  it('couvre tous les types d’espace de l’enum', () => {
    for (const type of Object.values(WorkspaceType)) {
      expect(WORKSPACE_VOCABULARY[type]).toBeDefined();
    }
  });

  it('UNIVERSITY → Étudiant / Faculté-UE / Semestre / Relevé / Validation', () => {
    const v = getVocabulary(WorkspaceType.UNIVERSITY);
    expect(v.learner).toBe('Étudiant');
    expect(v.group).toBe('Faculté / UE');
    expect(v.period).toBe('Semestre');
    expect(v.reportCard).toBe('Relevé de notes');
    expect(v.progression).toBe('Validation');
  });

  it('FUNDAMENTAL → Élève / Classe / Trimestre / Bulletin / Passage', () => {
    const v = getVocabulary(WorkspaceType.FUNDAMENTAL);
    expect(v.learner).toBe('Élève');
    expect(v.group).toBe('Classe');
    expect(v.period).toBe('Trimestre');
    expect(v.progression).toBe('Passage');
  });

  it('périodes — Lycée/Collège = Trimestre, Université = Semestre (obs. v2)', () => {
    expect(getVocabulary(WorkspaceType.COLLEGE).period).toBe('Trimestre');
    expect(getVocabulary(WorkspaceType.LYCEUM).period).toBe('Trimestre');
    expect(getVocabulary(WorkspaceType.UNIVERSITY).period).toBe('Semestre');
  });

  it('features — crédits/validation actifs uniquement pour UNIVERSITY', () => {
    expect(getFeatures(WorkspaceType.UNIVERSITY).creditsEnabled).toBe(true);
    expect(getFeatures(WorkspaceType.UNIVERSITY).validationEnabled).toBe(true);
    expect(getFeatures(WorkspaceType.LYCEUM).creditsEnabled).toBe(false);
    expect(getFeatures(WorkspaceType.FUNDAMENTAL).validationEnabled).toBe(false);
  });

  it('null / inconnu → fallback sûr (jamais undefined)', () => {
    expect(getVocabulary(null).learner).toBeTruthy();
    expect(getVocabulary(undefined).learner).toBeTruthy();
    expect(getFeatures(null)).toBeDefined();
  });
});
