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
    path: 'bourses',
    loadComponent: () =>
      import('./pages/bourse-list/bourse-list.component')
        .then(m => m.BourseListComponent),
    title: 'Bourses',
  },
];
