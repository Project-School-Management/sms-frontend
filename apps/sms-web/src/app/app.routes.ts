import { Routes } from '@angular/router';
import { authGuard } from '@sms/shared/auth';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const APP_ROUTES: Routes = [
  // ── Shell protégé avec layout ─────────────────────────────────────────────
  {
    path:        '',
    component:   MainLayoutComponent,
    canActivate: [authGuard],
    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Sprint 1
      {
        path:         'dashboard',
        loadChildren: () =>
          import('@sms/dashboard/feature').then((m) => m.DASHBOARD_ROUTES),
      },

      // Sprint 1 — Administration
      {
        path:         'admin',
        loadChildren: () =>
          import('@sms/users/feature').then((m) => m.USERS_ROUTES),
      },

      // Sprint 2
      {
        path:         'students',
        loadChildren: () =>
          import('@sms/students/feature').then((m) => m.STUDENTS_ROUTES),
      },

      // Sprint 3
      {
        path:         'academic',
        loadChildren: () =>
          import('@sms/academic/feature').then((m) => m.ACADEMIC_ROUTES),
      },

      // Sprint 4
      {
        path:         'schedule',
        loadChildren: () =>
          import('@sms/schedule/feature').then((m) => m.SCHEDULE_ROUTES),
      },

      // Sprint 5
      {
        path:         'communication',
        loadChildren: () =>
          import('@sms/communication/feature').then((m) => m.COMMUNICATION_ROUTES),
      },

      // Sprint 6
      {
        path:         'finance',
        loadChildren: () =>
          import('@sms/finance/feature').then((m) => m.FINANCE_ROUTES),
      },

      // Sprint 7
      {
        path:         'learning',
        loadChildren: () =>
          import('@sms/learning/feature').then((m) => m.LEARNING_ROUTES),
      },

      // Sprint 8
      {
        path:         'analytics',
        loadChildren: () =>
          import('@sms/analytics/feature').then((m) => m.ANALYTICS_ROUTES),
      },

      // Configuration Système & Référentiels
      {
        path:         'config',
        loadChildren: () =>
          import('@sms/config-system/feature').then((m) => m.CONFIG_SYSTEM_ROUTES),
      },

      { path: '**', redirectTo: 'dashboard' },
    ],
  },

  // ── Catch-all (non authentifié → guard redirige vers Keycloak) ────────────
  { path: '**', redirectTo: '' },
];
