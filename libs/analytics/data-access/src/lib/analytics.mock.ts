import { IKpiOverview, IKpiAcademique, IKpiFinancier, IRapport } from '@sms/shared/models';

export const MOCK_KPI_OVERVIEW: IKpiOverview = {
  totalEtudiants:      847,
  totalEnseignants:    54,
  tauxReussite:        78,
  tauxRecouvrement:    82,
  nbFacturesEnRetard:  23,
  totalEncaisse:       318_600_000,
  totalImpaye:         69_900_000,
};

export interface IEvolutionMensuelle {
  mois: string;
  inscriptions: number;
  paiements: number;
  tauxReussite: number;
}

export const MOCK_EVOLUTION_MENSUELLE: IEvolutionMensuelle[] = [
  { mois: 'Janvier',  inscriptions: 102, paiements: 42_350_000, tauxReussite: 0 },
  { mois: 'Février',  inscriptions: 215, paiements: 78_200_000, tauxReussite: 0 },
  { mois: 'Mars',     inscriptions: 389, paiements: 91_500_000, tauxReussite: 0 },
  { mois: 'Avril',    inscriptions: 612, paiements: 56_800_000, tauxReussite: 0 },
  { mois: 'Mai',      inscriptions: 780, paiements: 37_250_000, tauxReussite: 72 },
  { mois: 'Juin',     inscriptions: 847, paiements: 12_500_000, tauxReussite: 78 },
];

export const MOCK_KPI_ACADEMIQUE: IKpiAcademique[] = [
  {
    promotionLibelle: 'Licence 3 GL 2025', effectif: 32, tauxReussite: 84.4, moyenneGenerale: 12.8,
    distribution: [
      { note: '0-5', count: 1 }, { note: '5-10', count: 4 },
      { note: '10-12', count: 8 }, { note: '12-14', count: 12 },
      { note: '14-16', count: 5 }, { note: '16-20', count: 2 },
    ],
  },
  {
    promotionLibelle: 'Licence 2 GL 2025', effectif: 28, tauxReussite: 71.4, moyenneGenerale: 11.3,
    distribution: [
      { note: '0-5', count: 3 }, { note: '5-10', count: 5 },
      { note: '10-12', count: 10 }, { note: '12-14', count: 7 },
      { note: '14-16', count: 2 }, { note: '16-20', count: 1 },
    ],
  },
  {
    promotionLibelle: 'Master 1 RI 2025', effectif: 18, tauxReussite: 88.9, moyenneGenerale: 13.6,
    distribution: [
      { note: '0-5', count: 0 }, { note: '5-10', count: 2 },
      { note: '10-12', count: 4 }, { note: '12-14', count: 6 },
      { note: '14-16', count: 4 }, { note: '16-20', count: 2 },
    ],
  },
  {
    promotionLibelle: 'Licence 1 GL 2025', effectif: 45, tauxReussite: 66.7, moyenneGenerale: 10.5,
    distribution: [
      { note: '0-5', count: 5 }, { note: '5-10', count: 10 },
      { note: '10-12', count: 15 }, { note: '12-14', count: 10 },
      { note: '14-16', count: 4 }, { note: '16-20', count: 1 },
    ],
  },
  {
    promotionLibelle: 'Master 2 RI 2025', effectif: 12, tauxReussite: 100, moyenneGenerale: 14.8,
    distribution: [
      { note: '0-5', count: 0 }, { note: '5-10', count: 0 },
      { note: '10-12', count: 1 }, { note: '12-14', count: 3 },
      { note: '14-16', count: 5 }, { note: '16-20', count: 3 },
    ],
  },
];

export const MOCK_KPI_FINANCIER: IKpiFinancier = {
  periode: '2026-01',
  totalFacture: 388_500_000,
  totalEncaisse: 318_600_000,
  totalImpaye: 69_900_000,
  tauxRecouvrement: 82,
  parOperateur: [
    { operateur: 'WAVE', montant: 148_000_000 },
    { operateur: 'ORANGE_MONEY', montant: 95_500_000 },
    { operateur: 'MTN_MOMO', montant: 52_250_000 },
    { operateur: 'MOOV_MONEY', montant: 22_850_000 },
  ],
};

export const MOCK_RAPPORTS: IRapport[] = [
  { publicId: 'rpt-001', type: 'BULLETIN_PROMOTION', format: 'PDF', statut: 'TERMINE', createdAt: '2026-02-01', downloadUrl: '/mock/rapport1.pdf' },
  { publicId: 'rpt-002', type: 'RAPPORT_FINANCIER', format: 'EXCEL', statut: 'TERMINE', createdAt: '2026-01-31', downloadUrl: '/mock/rapport2.xlsx' },
  { publicId: 'rpt-003', type: 'EFFECTIFS', format: 'PDF', statut: 'EN_COURS', createdAt: '2026-06-03' },
  { publicId: 'rpt-004', type: 'RECOUVREMENT', format: 'EXCEL', statut: 'TERMINE', createdAt: '2026-05-31', downloadUrl: '/mock/rapport4.xlsx' },
  { publicId: 'rpt-005', type: 'NOTES_PROMOTION', format: 'PDF', statut: 'TERMINE', createdAt: '2026-05-15', downloadUrl: '/mock/rapport5.pdf' },
  { publicId: 'rpt-006', type: 'ABSENCES', format: 'PDF', statut: 'ERREUR', createdAt: '2026-06-01' },
  { publicId: 'rpt-007', type: 'EMPLOI_DU_TEMPS', format: 'PDF', statut: 'TERMINE', createdAt: '2026-04-30', downloadUrl: '/mock/rapport7.pdf' },
  { publicId: 'rpt-008', type: 'STATISTIQUES_GLOBALES', format: 'EXCEL', statut: 'EN_COURS', createdAt: '2026-06-07' },
];
