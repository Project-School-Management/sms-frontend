import { WorkspaceType } from './workspace.model';

/**
 * Données d'une carte d'établissement (élève/étudiant), format ISO/IEC 7810 ID-1.
 * Le libellé apprenant (Élève/Étudiant) est dérivé de {@link WorkspaceType}.
 */
export interface IStudentCard {
  matricule:       string;
  nom:             string;
  prenom:          string;
  photoUrl?:       string | null;
  etablissementNom:string;
  workspaceType:   WorkspaceType | null;
  /** Classe (scolaire) ou promotion/filière (université) — libellé déjà résolu. */
  groupeLibelle?:  string | null;
  anneeAcademique?:string | null;
  dateEmission?:   string | null;
}
