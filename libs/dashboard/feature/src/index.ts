import { Routes } from '@angular/router';

/**
 * Dashboard Feature Routes - Sprint 1
 * This will be populated with the dashboard component and its routes
 */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lib/dashboard.component').then((m) => m.DashboardComponent),
  },
];

