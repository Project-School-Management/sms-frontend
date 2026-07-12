// ══════════════════════════════════════════════════════════════════════════════
// Public API — @sms/config-system/data-access
// ══════════════════════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  TypeEtablissement, IEtablissement,
  ICycle, INiveau, IFiliere, ISpecialite,
  IDepartementRef, IFaculteRef,
  IClasseRef, IMatiereRef, TypeMatiere,
  IAnneeAcademiqueRef, IPeriodeRef, TypePeriode,
  IBatimentRef, ISalleRef, TypeSalle,
  ITypeFraisRef, TypeFraisCategorie,
  ITypeBourseRef, IGradeRef, CategoriePersonnel,
  ITypeDocumentRef, ITypeEvaluationRef,
  IConfigSnapshot, IReferenceServiceContract,
  IEspaceConfig, EspaceWorkspaceType,
} from './lib/reference.types';

// ── Mock Data (accès direct aux constantes si nécessaire) ────────────────────
export {
  MOCK_ETABLISSEMENT, MOCK_CYCLES, MOCK_NIVEAUX, MOCK_FILIERES,
  MOCK_SPECIALITES, MOCK_DEPARTEMENTS, MOCK_FACULTES, MOCK_CLASSES,
  MOCK_MATIERES, MOCK_ANNEES, MOCK_PERIODES, MOCK_BATIMENTS, MOCK_SALLES,
  MOCK_TYPES_FRAIS, MOCK_TYPES_BOURSES, MOCK_GRADES,
  MOCK_TYPES_DOCUMENTS, MOCK_TYPES_EVALUATION, MOCK_CONFIG_SNAPSHOT,
  MOCK_ESPACES,
  // Helpers
  getFraisScolariteByNiveau,
  getFraisScolariteByNiveauLibelle,
  getClassesAsOptions,
  CLASSES_MAP_REF,
} from './lib/reference-data.mock';

// ── Service API ───────────────────────────────────────────────────────────────
export { ReferenceApiService } from './lib/reference-api.service';

// ── Signal Store ──────────────────────────────────────────────────────────────
export { ReferenceStore } from './lib/reference.store';
