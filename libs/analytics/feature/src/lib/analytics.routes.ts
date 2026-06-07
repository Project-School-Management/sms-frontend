import { Routes } from '@angular/router';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/kpi-dashboard/kpi-dashboard.component').then(m => m.KpiDashboardComponent),
  },
  {
    path: 'rapports',
    loadComponent: () => import('./pages/rapports/rapports.component').then(m => m.RapportsComponent),
  },
];
