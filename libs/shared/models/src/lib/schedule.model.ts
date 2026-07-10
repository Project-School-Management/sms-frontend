export type JourSemaine = 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI';
export type TypeSalle = 'AMPHI' | 'TD' | 'TP' | 'LABO';
export type StatutSeance = 'PLANIFIEE' | 'EFFECTUEE' | 'ANNULEE' | 'REPORTEE';

export interface ISalle {
  publicId:   string;
  code:       string;
  libelle:    string;
  capacite:   number;
  type:       TypeSalle;
  equipements?: string[];
}

export interface ITimeSlot {
  publicId:          string;
  jour:              JourSemaine;
  heureDebut:        string;
  heureFin:          string;
  matierePublicId:   string;
  matiereLibelle:    string;
  promotionPublicId: string;
  promotionLibelle:  string;
  sallePublicId:     string;
  salleLibelle:      string;
  enseignantPublicId: string;
  enseignantNom:     string;
}

export interface ISeance {
  publicId:        string;
  timeSlotPublicId: string;
  date:            string;
  statut:          StatutSeance;
  motifAnnulation?: string;
  notes?:          string;
}

// ─── Absences (story 4-2 — saisie et suivi des absences) ─────────────────────
export type StatutAbsence = 'NON_JUSTIFIEE' | 'JUSTIFIEE';

/** Reflète AbsenceResponse (academic-service). Les libellés élève/matière/classe
 *  sont ajoutés côté mock pour l'affichage — le backend ne renvoie que les UUID. */
export interface IAbsence {
  publicId:              string;
  elevePublicId:         string;
  eleveNom:              string;   // enrichi côté frontend (résolu depuis user-service)
  eleveMatricule:        string;   // idem
  matierePublicId:       string;
  matiereLibelle:        string;   // idem (administration-service)
  classePublicId:        string;
  classeLibelle:         string;
  enseignantPublicId:    string;
  enseignantNom:         string;
  heureAbsence:          string;   // Instant ISO
  statut:                StatutAbsence;
  motifJustification?:   string;
  dateJustification?:    string;
  justifieParPublicId?:  string;
  justifieParNom?:       string;
}

/** Reflète AbsenceParMatiereResponse. */
export interface IAbsenceParMatiere {
  matierePublicId: string;
  matiereLibelle:  string;
  total:           number;
  justifiees:      number;
  nonJustifiees:   number;
}

/** Reflète RecapAbsencesResponse (GET /api/v1/absences?elevePublicId=...). */
export interface IAbsenceRecap {
  elevePublicId:        string;
  eleveNom:             string;
  totalAbsences:        number;
  absencesJustifiees:   number;
  absencesNonJustifiees: number;
  absencesParMatiere:   IAbsenceParMatiere[];
  detail:               IAbsence[];
}

/** Reflète SaisirAbsencesRequest. */
export interface ISaisirAbsencesRequest {
  matierePublicId:         string;
  classePublicId:          string;
  elevePublicIds:          string[];
  heureAbsence:            string;
  anneeAcademiquePublicId: string;
}
