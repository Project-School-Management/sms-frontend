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
