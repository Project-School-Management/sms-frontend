export type StatutRapport = 'EN_COURS' | 'TERMINE' | 'ERREUR';
export type TypeRapport =
  | 'BULLETIN_PROMOTION'
  | 'RELEVE_NOTES'
  | 'RAPPORT_FINANCIER'
  | 'EFFECTIFS'
  | 'STATISTIQUES_GLOBALES'
  | 'RESULTATS_EXAMENS'
  | 'PRESENCES'
  | 'RAPPORT_SCOLARITE'
  | 'RECOUVREMENT'
  | 'NOTES_PROMOTION'
  | 'ABSENCES'
  | 'EMPLOI_DU_TEMPS';
export type FormatRapport = 'PDF' | 'EXCEL';

export interface IKpiOverview {
  totalEtudiants:      number;
  totalEnseignants:    number;
  tauxReussite:        number;
  tauxRecouvrement:    number;
  nbFacturesEnRetard:  number;
  totalEncaisse:       number;
  totalImpaye:         number;
}

export interface IKpiAcademique {
  promotionLibelle:    string;
  effectif:            number;
  tauxReussite:        number;
  moyenneGenerale:     number;
  distribution:        { note: string; count: number }[];
}

export interface IKpiFinancier {
  periode:             string;
  totalFacture:        number;
  totalEncaisse:       number;
  totalImpaye:         number;
  tauxRecouvrement:    number;
  parOperateur:        { operateur: string; montant: number }[];
}

export interface IRapport {
  publicId:    string;
  type:        TypeRapport;
  format:      FormatRapport;
  statut:      StatutRapport;
  createdAt:   string;
  downloadUrl?: string;
}
