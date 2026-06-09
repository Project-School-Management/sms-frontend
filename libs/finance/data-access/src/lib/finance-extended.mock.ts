// ══════════════════════════════════════════════════════════════════════════════
// Finance — Mock Data étendu
// Échéanciers, Remboursements, Réductions, Rapports
// ══════════════════════════════════════════════════════════════════════════════

// ── Noms étudiants (source unique) ───────────────────────────────────────────
export const STUDENT_NAMES_MAP: Record<number, string> = {
  1:'Awa Diallo',2:'Kofi Mensah',3:'Fatou Traoré',4:'Moussa Coulibaly',
  5:'Aminata Koné',6:'Ibrahima Bah',7:'Mariam Sanogo',8:'Seydou Ouedraogo',
  9:'Kadiatou Camara',10:'Ousmane Diakité',11:'Rokhaya Ndiaye',12:'Bakary Kouyaté',
  13:'Bintou Keita',14:'Aliou Barry',15:'Ndeye Faye',16:'Lamine Sow',
  17:'Aïssatou Baldé',18:'Mamadou Sall',19:'Oumou Dramé',20:'Cheikh Mbaye',
};

export const STUDENT_CLASSES_MAP: Record<number, string> = {
  1:'Terminale S1',2:'Terminale S1',3:'Terminale A1',4:'Terminale A1',
  5:'Première D',6:'Première D',7:'Terminale S1',8:'Seconde A',
  9:'Terminale A1',10:'Terminale S1',11:'Première D',12:'Terminale A1',
  13:'Seconde A',14:'Seconde A',15:'3ème B',16:'3ème B',
  17:'Première D',18:'Terminale S1',19:'Terminale A1',20:'3ème B',
};

// ── Échéanciers ───────────────────────────────────────────────────────────────
export interface IEcheancier {
  publicId:    string;
  facturePublicId: string;
  factureNumero:   string;
  studentId:   number;
  studentNom:  string;
  montantTotal: number;
  versements: {
    numero: number;
    montantDu: number;
    dateEcheance: string;
    datePaiement?: string;
    statut: 'EN_ATTENTE' | 'PAYE' | 'EN_RETARD';
  }[];
  statut: 'EN_COURS' | 'SOLDE' | 'EN_RETARD';
  createdDate: string;
}

export const MOCK_ECHEANCIERS: IEcheancier[] = [
  {
    publicId:'ech-001', facturePublicId:'fac-0001', factureNumero:'FAC-2025-0001',
    studentId:1, studentNom:'Awa Diallo', montantTotal:750000,
    versements:[
      { numero:1, montantDu:250000, dateEcheance:'2026-01-31', datePaiement:'2026-01-28', statut:'PAYE' },
      { numero:2, montantDu:250000, dateEcheance:'2026-02-28', datePaiement:'2026-02-25', statut:'PAYE' },
      { numero:3, montantDu:250000, dateEcheance:'2026-03-31', statut:'EN_ATTENTE' },
    ],
    statut:'EN_COURS', createdDate:'2026-01-15',
  },
  {
    publicId:'ech-002', facturePublicId:'fac-0006', factureNumero:'FAC-2025-0006',
    studentId:6, studentNom:'Ibrahima Bah', montantTotal:750000,
    versements:[
      { numero:1, montantDu:250000, dateEcheance:'2026-02-01', datePaiement:'2026-02-01', statut:'PAYE' },
      { numero:2, montantDu:250000, dateEcheance:'2026-03-01', statut:'EN_RETARD' },
      { numero:3, montantDu:250000, dateEcheance:'2026-04-01', statut:'EN_ATTENTE' },
    ],
    statut:'EN_RETARD', createdDate:'2026-02-01',
  },
  {
    publicId:'ech-003', facturePublicId:'fac-0012', factureNumero:'FAC-2025-0012',
    studentId:12, studentNom:'Bakary Kouyaté', montantTotal:750000,
    versements:[
      { numero:1, montantDu:375000, dateEcheance:'2026-02-01', datePaiement:'2026-02-01', statut:'PAYE' },
      { numero:2, montantDu:375000, dateEcheance:'2026-04-30', statut:'EN_ATTENTE' },
    ],
    statut:'EN_COURS', createdDate:'2026-02-01',
  },
  {
    publicId:'ech-004', facturePublicId:'fac-0016', factureNumero:'FAC-2025-0016',
    studentId:16, studentNom:'Lamine Sow', montantTotal:750000,
    versements:[
      { numero:1, montantDu:250000, dateEcheance:'2026-02-05', datePaiement:'2026-02-05', statut:'PAYE' },
      { numero:2, montantDu:250000, dateEcheance:'2026-03-05', datePaiement:'2026-03-04', statut:'PAYE' },
      { numero:3, montantDu:250000, dateEcheance:'2026-04-05', statut:'EN_ATTENTE' },
    ],
    statut:'EN_COURS', createdDate:'2026-02-05',
  },
];

// ── Remboursements ────────────────────────────────────────────────────────────
export type StatutRemboursement = 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'EFFECTUE';

export interface IRemboursement {
  publicId:       string;
  paiementPublicId: string;
  factureNumero:  string;
  studentId:      number;
  studentNom:     string;
  montant:        number;
  motif:          string;
  demandePar:     string;
  dateDemande:    string;
  dateValidation?: string;
  statut:         StatutRemboursement;
  modePaiement?:  string;
  commentaire?:   string;
}

export const MOCK_REMBOURSEMENTS: IRemboursement[] = [
  {
    publicId:'rem-001', paiementPublicId:'pay-003', factureNumero:'FAC-2025-0003',
    studentId:3, studentNom:'Fatou Traoré', montant:750000,
    motif:'Retrait de l\'établissement en cours d\'année — accord du directeur',
    demandePar:'Parent Traoré Boubacar', dateDemande:'2026-03-05',
    dateValidation:'2026-03-08', statut:'VALIDE', modePaiement:'Virement bancaire',
    commentaire:'Remboursement pro-rata pour le trimestre 3 non consommé',
  },
  {
    publicId:'rem-002', paiementPublicId:'pay-002', factureNumero:'FAC-2025-0001',
    studentId:1, studentNom:'Awa Diallo', montant:50000,
    motif:'Double paiement des frais d\'inscription',
    demandePar:'Awa Diallo', dateDemande:'2026-02-20',
    statut:'EN_ATTENTE', commentaire:'En attente de vérification comptable',
  },
  {
    publicId:'rem-003', paiementPublicId:'pay-001', factureNumero:'FAC-2025-0008',
    studentId:8, studentNom:'Seydou Ouedraogo', montant:200000,
    motif:'Trop-perçu sur frais de cantine — changement de formule',
    demandePar:'Dir. Comptabilité', dateDemande:'2026-02-15',
    dateValidation:'2026-02-18', statut:'EFFECTUE', modePaiement:'Espèces',
  },
  {
    publicId:'rem-004', paiementPublicId:'pay-003', factureNumero:'FAC-2025-0015',
    studentId:15, studentNom:'Ndeye Faye', montant:600000,
    motif:'Inscription annulée avant le début de l\'année scolaire',
    demandePar:'Faye Cheikh (parent)', dateDemande:'2026-01-25',
    dateValidation:'2026-01-28', statut:'REJETE',
    commentaire:'Délai de rétractation de 14 jours dépassé selon le règlement intérieur',
  },
];

// ── Réductions ────────────────────────────────────────────────────────────────
export type TypeReduction = 'FRATRIE' | 'FIDELITE' | 'PROMO' | 'AIDE_SOCIALE' | 'EXCELLENCE' | 'AUTRE';
export type StatutReduction = 'ACTIVE' | 'SUSPENDUE' | 'EXPIREE';

export interface IReduction {
  publicId:    string;
  studentId:   number;
  studentNom:  string;
  type:        TypeReduction;
  libelle:     string;
  pourcentage?: number;
  montantFixe?: number;
  motif:       string;
  validePar:   string;
  dateDebut:   string;
  dateFin?:    string;
  statut:      StatutReduction;
  montantEconomise: number;
}

export const MOCK_REDUCTIONS: IReduction[] = [
  {
    publicId:'red-001', studentId:5, studentNom:'Aminata Koné',
    type:'EXCELLENCE', libelle:'Bourse excellence scolaire',
    pourcentage:15, motif:'1ère de classe — résultats exceptionnels',
    validePar:'Dir. Pédagogique', dateDebut:'2025-09-01', statut:'ACTIVE',
    montantEconomise:112500,
  },
  {
    publicId:'red-002', studentId:1, studentNom:'Awa Diallo',
    type:'FRATRIE', libelle:'Réduction fratrie (3 enfants)',
    pourcentage:10, motif:'3ème enfant inscrit dans l\'établissement',
    validePar:'Admin Koné Aïcha', dateDebut:'2025-09-01', statut:'ACTIVE',
    montantEconomise:75000,
  },
  {
    publicId:'red-003', studentId:7, studentNom:'Mariam Sanogo',
    type:'AIDE_SOCIALE', libelle:'Aide sociale dossier validé',
    montantFixe:100000, motif:'Dossier social approuvé par le comité',
    validePar:'Dir. Admin.', dateDebut:'2025-09-01', statut:'ACTIVE',
    montantEconomise:100000,
  },
  {
    publicId:'red-004', studentId:3, studentNom:'Fatou Traoré',
    type:'FIDELITE', libelle:'Fidélité 4 ans',
    pourcentage:5, motif:'4ème année consécutive dans l\'établissement',
    validePar:'Directeur', dateDebut:'2025-09-01', dateFin:'2026-07-31', statut:'ACTIVE',
    montantEconomise:37500,
  },
  {
    publicId:'red-005', studentId:10, studentNom:'Ousmane Diakité',
    type:'PROMO', libelle:'Réduction campagne inscription anticipée',
    pourcentage:8, motif:'Inscription avant le 30 juin 2025',
    validePar:'Admin Koné Aïcha', dateDebut:'2025-07-01', dateFin:'2026-07-31', statut:'ACTIVE',
    montantEconomise:60000,
  },
  {
    publicId:'red-006', studentId:15, studentNom:'Ndeye Faye',
    type:'AIDE_SOCIALE', libelle:'Aide partielle COVID',
    pourcentage:20, motif:'Situation familiale difficile post-COVID',
    validePar:'Dir. Admin.', dateDebut:'2024-09-01', dateFin:'2025-07-31', statut:'EXPIREE',
    montantEconomise:120000,
  },
];

// ── Données rapport financier ─────────────────────────────────────────────────
export const MOCK_RAPPORT_MENSUEL = [
  { mois:'Sep 2025', facture:12_500_000, encaisse:11_200_000, impaye:1_300_000, taux:89.6 },
  { mois:'Oct 2025', facture:8_300_000,  encaisse:7_800_000,  impaye:500_000,   taux:93.9 },
  { mois:'Nov 2025', facture:6_100_000,  encaisse:5_400_000,  impaye:700_000,   taux:88.5 },
  { mois:'Déc 2025', facture:4_200_000,  encaisse:3_900_000,  impaye:300_000,   taux:92.8 },
  { mois:'Jan 2026', facture:9_800_000,  encaisse:8_100_000,  impaye:1_700_000, taux:82.6 },
  { mois:'Fév 2026', facture:7_400_000,  encaisse:6_200_000,  impaye:1_200_000, taux:83.7 },
  { mois:'Mar 2026', facture:5_600_000,  encaisse:4_800_000,  impaye:800_000,   taux:85.7 },
];

export const MOCK_RAPPORT_CLASSE = [
  { classe:'Terminale S1', effectif:42, facture:31_500_000, encaisse:27_300_000, taux:86.6 },
  { classe:'Terminale A1', effectif:38, facture:28_500_000, encaisse:25_100_000, taux:88.0 },
  { classe:'Première D',   effectif:45, facture:31_500_000, encaisse:26_200_000, taux:83.1 },
  { classe:'Seconde A',    effectif:52, facture:33_800_000, encaisse:29_600_000, taux:87.5 },
  { classe:'3ème B',       effectif:35, facture:21_000_000, encaisse:18_400_000, taux:87.6 },
];

export const MOCK_RAPPORT_MODE_PAIEMENT = [
  { mode:'Mobile Money (Wave)',   montant:45_200_000, nb:312, pct:42 },
  { mode:'Mobile Money (Orange)', montant:28_100_000, nb:198, pct:26 },
  { mode:'Espèces',               montant:18_600_000, nb:245, pct:17 },
  { mode:'Virement bancaire',     montant:11_300_000, nb:67,  pct:10 },
  { mode:'Mobile Money (MTN)',    montant:4_800_000,  nb:42,  pct:5  },
];

// ── Journal des opérations (audit financier) ─────────────────────────────────
export interface IOperationFinance {
  publicId:  string;
  type:      'PAIEMENT' | 'REMBOURSEMENT' | 'REDUCTION' | 'BOURSE' | 'CREATION' | 'MODIFICATION' | 'ANNULATION';
  reference: string;
  studentNom: string;
  montant:   number;
  auteur:    string;
  date:      string;
  detail:    string;
}

export const MOCK_JOURNAL: IOperationFinance[] = [
  { publicId:'op-001', type:'PAIEMENT',     reference:'PAY-2026-001', studentNom:'Awa Diallo',     montant:250000, auteur:'Admin Koné', date:'2026-06-09 14:32', detail:'Paiement 2ème versement FAC-2025-0001 via Wave' },
  { publicId:'op-002', type:'BOURSE',       reference:'BRS-2026-003', studentNom:'Aminata Koné',   montant:112500, auteur:'Dir. Pédag.', date:'2026-06-09 10:15', detail:'Bourse excellence scolaire accordée — 15%' },
  { publicId:'op-003', type:'REDUCTION',    reference:'RED-2026-002', studentNom:'Awa Diallo',     montant:75000,  auteur:'Admin Koné', date:'2026-06-08 16:00', detail:'Réduction fratrie appliquée — 10%' },
  { publicId:'op-004', type:'REMBOURSEMENT',reference:'REM-2026-001', studentNom:'Fatou Traoré',   montant:750000, auteur:'Dir. Admin', date:'2026-06-08 11:20', detail:'Remboursement pro-rata retrait établissement' },
  { publicId:'op-005', type:'PAIEMENT',     reference:'PAY-2026-002', studentNom:'Kofi Mensah',    montant:750000, auteur:'Caissier',  date:'2026-06-07 09:00', detail:'Paiement complet FAC-2025-0003 en espèces' },
  { publicId:'op-006', type:'CREATION',     reference:'FAC-2026-021', studentNom:'Nouvel étudiant',montant:800000, auteur:'Admin Koné', date:'2026-06-06 14:00', detail:'Création facture inscription 2026-2027' },
  { publicId:'op-007', type:'ANNULATION',   reference:'FAC-2025-0015',studentNom:'Ndeye Faye',     montant:600000, auteur:'Dir. Admin', date:'2026-06-05 15:30', detail:'Annulation — inscription annulée' },
];

// ── Reçus ─────────────────────────────────────────────────────────────────────
export interface IRecu {
  publicId:       string;
  numero:         string;
  paiementPublicId: string;
  factureNumero:  string;
  studentId:      number;
  studentNom:     string;
  studentClasse:  string;
  montant:        number;
  operateur:      string;
  reference:      string;
  caissier:       string;
  date:           string;
  typeFrequence:  string;
}

export const MOCK_RECUS: IRecu[] = [
  { publicId:'rec-001', numero:'REC-2026-0001', paiementPublicId:'pay-001', factureNumero:'FAC-2025-0001', studentId:1, studentNom:'Awa Diallo', studentClasse:'Terminale S1', montant:250000, operateur:'Wave', reference:'WAVE-2026-001', caissier:'Admin Koné Aïcha', date:'2026-01-28 10:30', typeFrequence:'1er versement' },
  { publicId:'rec-002', numero:'REC-2026-0002', paiementPublicId:'pay-002', factureNumero:'FAC-2025-0001', studentId:1, studentNom:'Awa Diallo', studentClasse:'Terminale S1', montant:250000, operateur:'Orange Money', reference:'OM-2026-002', caissier:'Admin Koné Aïcha', date:'2026-02-25 14:15', typeFrequence:'2ème versement' },
  { publicId:'rec-003', numero:'REC-2026-0003', paiementPublicId:'pay-003', factureNumero:'FAC-2025-0003', studentId:3, studentNom:'Fatou Traoré', studentClasse:'Terminale A1', montant:750000, operateur:'MTN MoMo', reference:'MTN-2026-003', caissier:'Caissier Bamba', date:'2026-01-20 09:45', typeFrequence:'Paiement intégral' },
];
