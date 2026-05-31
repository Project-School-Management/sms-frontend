import { Routes } from '@angular/router';

/**
 * Analytics Feature Routes - Sprint 8
 * Dashboards, reports, data visualization
 */
export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lib/analytics.component').then((m) => m.AnalyticsComponent),
  },
];
