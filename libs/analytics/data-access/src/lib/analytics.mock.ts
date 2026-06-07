import { IKpiOverview, IKpiAcademique, IKpiFinancier, IRapport } from '@sms/shared/models';

export const MOCK_KPI_OVERVIEW: IKpiOverview = {
  totalEtudiants:      248,
  totalEnseignants:    32,
  tauxReussite:        78.4,
  tauxRecouvrement:    62.1,
  nbFacturesEnRetard:  18,
  totalEncaisse:       48_750_000,
  totalImpaye:         29_700_000,
};

export const MOCK_KPI_ACADEMIQUE: IKpiAcademique[] = [
  {
    promotionLibelle: 'Licence 3 GL 2025', effectif: 32, tauxReussite: 84.4, moyenneGenerale: 12.8,
    distribution: [
      { note: '0-5', count: 2 }, { note: '5-10', count: 3 },
      { note: '10-12', count: 8 }, { note: '12-14', count: 12 },
      { note: '14-16', count: 5 }, { note: '16-20', count: 2 },
    ],
  },
  {
    promotionLibelle: 'Licence 2 GL 2025', effectif: 28, tauxReussite: 71.4, moyenneGenerale: 11.3,
    distribution: [
      { note: '0-5', count: 4 }, { note: '5-10', count: 4 },
      { note: '10-12', count: 10 }, { note: '12-14', count: 7 },
      { note: '14-16', count: 2 }, { note: '16-20', count: 1 },
    ],
  },
];

export const MOCK_KPI_FINANCIER: IKpiFinancier = {
  periode: '2026-01',
  totalFacture: 78_450_000,
  totalEncaisse: 48_750_000,
  totalImpaye: 29_700_000,
  tauxRecouvrement: 62.1,
  parOperateur: [
    { operateur: 'WAVE', montant: 24_000_000 },
    { operateur: 'ORANGE_MONEY', montant: 15_500_000 },
    { operateur: 'MTN_MOMO', montant: 6_250_000 },
    { operateur: 'MOOV_MONEY', montant: 3_000_000 },
  ],
};

export const MOCK_RAPPORTS: IRapport[] = [
  { publicId: 'rpt-001', type: 'BULLETIN_PROMOTION', format: 'PDF', statut: 'TERMINE', createdAt: '2026-02-01', downloadUrl: '/mock/rapport1.pdf' },
  { publicId: 'rpt-002', type: 'RAPPORT_FINANCIER', format: 'EXCEL', statut: 'TERMINE', createdAt: '2026-01-31', downloadUrl: '/mock/rapport2.xlsx' },
  { publicId: 'rpt-003', type: 'EFFECTIFS', format: 'PDF', statut: 'EN_COURS', createdAt: '2026-06-03' },
];
