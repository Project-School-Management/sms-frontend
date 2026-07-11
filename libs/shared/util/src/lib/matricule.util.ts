import { WorkspaceType } from '@sms/shared/models';

/**
 * Générateur de matricule adaptatif (docs/architecture/tenancy-model.md §7,
 * story 2-5 — backend "fait/review"). Format à 5 segments :
 *
 *   CC-TT-YYYY-EEEEE-HHHHHHHH
 *   ML-LY-2026-CSH-A3F8E92B
 *
 * - CC       : code pays ISO 3166-1 alpha-2 (Mali = ML)
 * - TT       : type d'espace dérivé du workspace_type
 * - YYYY     : année civile d'inscription
 * - EEEEE    : code établissement (3-5 alphanum)
 * - HHHHHHHH : 8 hex majuscules (hash non séquentiel, généré ici de façon
 *              déterministe à partir du publicId pour des mocks stables)
 */

/** Correspondance workspace_type → segment TT (extensible). */
const WORKSPACE_TYPE_SEGMENT: Record<WorkspaceType, string> = {
  [WorkspaceType.FUNDAMENTAL]: 'FN',
  [WorkspaceType.COLLEGE]:     'CL',
  [WorkspaceType.LYCEUM]:      'LY',
  [WorkspaceType.UNIVERSITY]:  'UN',
};

/** Hash court déterministe (8 hex majuscules) — suffisant pour un mock stable. */
function shortHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}

/**
 * Construit un matricule au format normalisé à partir de ses composantes.
 * @param countryCode   Code pays ISO 3166-1 alpha-2 (ex. `ML`)
 * @param workspaceType Type d'espace (dérive automatiquement le segment TT)
 * @param anneeInscription Année civile d'inscription
 * @param etablissementCode Code établissement (3-5 alphanum, ex. `CSH`)
 * @param seed          Valeur stable servant à dériver le hash (ex. publicId élève)
 */
export function generateMatricule(
  countryCode: string,
  workspaceType: WorkspaceType,
  anneeInscription: number,
  etablissementCode: string,
  seed: string,
): string {
  const tt = WORKSPACE_TYPE_SEGMENT[workspaceType] ?? 'LY';
  return `${countryCode.toUpperCase()}-${tt}-${anneeInscription}-${etablissementCode.toUpperCase()}-${shortHash(seed)}`;
}

/** Résout le type d'espace à partir du libellé de cycle (mock — voir reference-data.mock.ts). */
export function workspaceTypeFromCycleLibelle(cycleLibelle: string): WorkspaceType {
  if (cycleLibelle.startsWith('Fondamental')) return WorkspaceType.FUNDAMENTAL;
  if (cycleLibelle === 'Lycée')               return WorkspaceType.LYCEUM;
  if (cycleLibelle === 'Université')          return WorkspaceType.UNIVERSITY;
  return WorkspaceType.LYCEUM;
}

/** Résout le type d'espace à partir du libellé de NIVEAU (ex. `niveauLibelle` d'un élève). */
export function workspaceTypeFromNiveauLibelle(niveauLibelle: string): WorkspaceType {
  if (/Fondamentale/i.test(niveauLibelle)) return WorkspaceType.FUNDAMENTAL;
  if (/Licence|Master|Doctorat/i.test(niveauLibelle)) return WorkspaceType.UNIVERSITY;
  return WorkspaceType.LYCEUM; // 10ème/11ème/Terminale Année, ou fallback sûr
}
