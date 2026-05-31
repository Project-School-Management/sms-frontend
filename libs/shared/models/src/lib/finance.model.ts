// ── Finance domain models ─────────────────────────────────────────────────────

export type TypeFrais =
  | 'INSCRIPTION' | 'SCOLARITE' | 'EXAMEN' | 'BIBLIOTHEQUE'
  | 'TRANSPORT' | 'RESTAURATION' | 'UNIFORME' | 'AUTRE';

export type StatutFacture =
  | 'BROUILLON' | 'EMISE' | 'PARTIELLEMENT_PAYEE' | 'PAYEE' | 'EN_RETARD' | 'ANNULEE';

export type StatutPaiement =
  | 'EN_ATTENTE' | 'INITIE' | 'CONFIRME' | 'ECHOUE' | 'REMBOURSE';

export type OperateurMobileMoney =
  | 'WAVE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'MOOV_MONEY' | 'VIREMENT_BANCAIRE' | 'ESPECES';

export type TypeBourse =
  | 'BOURSE' | 'FRATRIE' | 'FIDELITE' | 'PROMO' | 'MERITE' | 'SOCIALE';

export interface IEcheancier {
  publicId: string;
  numero:   number;
  montantDu:     number;
  dateEcheance:  string;
  datePaiement?: string;
  estPaye:       boolean;
}

export interface IFacture {
  publicId:          string;
  numero:            string;
  studentId:         number;
  anneeAcademiqueId: number;
  montantTotal:      number;
  montantPaye:       number;
  solde:             number;
  statut:            StatutFacture;
  dateEcheance?:     string;
  createdDate:       string;
  echeancier:        IEcheancier[];
}

export interface IPaiement {
  publicId:          string;
  facturePublicId:   string;
  montant:           number;
  operateur:         OperateurMobileMoney;
  telephone:         string;
  referenceExterne?: string;
  statut:            StatutPaiement;
  createdDate:       string;
}

export interface IBourse {
  publicId:          string;
  studentId:         number;
  typeBourse:        TypeBourse;
  montantDeduction?: number;
  pourcentage?:      number;
  anneeAcademiqueId: number;
  valideJusquAu?:    string;
  motif?:            string;
  createdDate:       string;
}

export interface IFraisScolarite {
  publicId:          string;
  promotionId?:      number;
  anneeAcademiqueId: number;
  libelle:           string;
  typeFrais:         TypeFrais;
  montant:           number;
  dateEcheance?:     string;
  createdDate:       string;
}

// ── Request payloads ──────────────────────────────────────────────────────────
export interface IInitierPaiementRequest {
  facturePublicId: string;
  montant:         number;
  operateur:       OperateurMobileMoney;
  telephone:       string;
  idempotencyKey:  string;
}

export interface IBourseRequest {
  studentId:         number;
  typeBourse:        TypeBourse;
  montantDeduction?: number;
  pourcentage?:      number;
  anneeAcademiqueId: number;
  valideJusquAu?:    string;
  motif?:            string;
}

export interface IFraisScolariteRequest {
  promotionId?:      number;
  anneeAcademiqueId: number;
  libelle:           string;
  typeFrais:         TypeFrais;
  montant:           number;
  dateEcheance?:     string;
}

// ── Dashboard stats ───────────────────────────────────────────────────────────
export interface IFinanceDashboard {
  totalFacture:       number;
  totalPercu:         number;
  totalImpaye:        number;
  nbFacturesEnRetard: number;
  tauxRecouvrement:   number;
}
