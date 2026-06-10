import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/finance-dashboard/finance-dashboard.component')
        .then(m => m.FinanceDashboardComponent),
    title: 'Finance — Tableau de bord',
  },
  {
    path: 'invoices',
    loadComponent: () =>
      import('./pages/invoice-list/invoice-list.component')
        .then(m => m.InvoiceListComponent),
    title: 'Factures',
  },
  {
    path: 'invoices/:publicId',
    loadComponent: () =>
      import('./pages/invoice-detail/invoice-detail.component')
        .then(m => m.InvoiceDetailComponent),
    title: 'Détail facture',
  },
  {
    path: 'paiements',
    loadComponent: () =>
      import('./pages/paiements-list/paiements-list.component')
        .then(m => m.PaiementsListComponent),
    title: 'Paiements',
  },
  {
    path: 'encaissement/:publicId',
    loadComponent: () =>
      import('./pages/encaissement/encaissement.component')
        .then(m => m.EncaissementComponent),
    title: 'Encaissement',
  },
  {
    path: 'bourses',
    loadComponent: () =>
      import('./pages/bourse-list/bourse-list.component')
        .then(m => m.BourseListComponent),
    title: 'Bourses',
  },
  {
    path: 'reductions',
    loadComponent: () =>
      import('./pages/reductions-list/reductions-list.component')
        .then(m => m.ReductionsListComponent),
    title: 'Réductions & Remises',
  },
  {
    path: 'echeanciers',
    loadComponent: () =>
      import('./pages/echeanciers/echeanciers.component')
        .then(m => m.EcheanciesComponent),
    title: 'Échéanciers',
  },
  {
    path: 'remboursements',
    loadComponent: () =>
      import('./pages/remboursements/remboursements.component')
        .then(m => m.RemboursementsComponent),
    title: 'Remboursements',
  },
  {
    path: 'frais',
    loadComponent: () =>
      import('./pages/frais-management/frais-management.component')
        .then(m => m.FraisManagementComponent),
    title: 'Gestion des frais',
  },
  {
    path: 'rapports',
    loadComponent: () =>
      import('./pages/rapports-finance/rapports-finance.component')
        .then(m => m.RapportsFinanceComponent),
    title: 'Rapports financiers',
  },
];
