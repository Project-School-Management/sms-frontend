import { Routes } from '@angular/router';
import { authGuard } from '@sms/shared/auth';

// ── Lazy-loaded feature routes ──────────────────────────────────────────────
// Chaque lib feature exporte ses *_ROUTES
// Ajoutés au fur et à mesure des sprints :
//   Sprint 1 → USERS_ROUTES + DASHBOARD_ROUTES
//   Sprint 2 → STUDENTS_ROUTES
//   Sprint 3 → ACADEMIC_ROUTES
//   Sprint 4 → SCHEDULE_ROUTES
//   Sprint 5 → COMMUNICATION_ROUTES
//   Sprint 6 → FINANCE_ROUTES
//   Sprint 7 → LEARNING_ROUTES
//   Sprint 8 → ANALYTICS_ROUTES

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // ── Dashboard (Sprint 1) ───────────────────────────────────────────────────
  {
    path:        'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@sms/dashboard/feature').then((m) => m.DASHBOARD_ROUTES),
  },

  // ── Admin — Users / Établissements (Sprint 1) ─────────────────────────────
  {
    path:        'admin',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@sms/users/feature').then((m) => m.USERS_ROUTES),
  },

  // ── Students (Sprint 2) ───────────────────────────────────────────────────
  {
    path:        'students',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@sms/students/feature').then((m) => m.STUDENTS_ROUTES),
  },

  // ── Academic (Sprint 3) ───────────────────────────────────────────────────
  {
    path:        'academic',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@sms/academic/feature').then((m) => m.ACADEMIC_ROUTES),
  },

  // ── Schedule (Sprint 4) ───────────────────────────────────────────────────
  {
    path:        'schedule',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@sms/schedule/feature').then((m) => m.SCHEDULE_ROUTES),
  },

  // ── Communication (Sprint 5) ──────────────────────────────────────────────
  {
    path:        'communication',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@sms/communication/feature').then((m) => m.COMMUNICATION_ROUTES),
  },

  // ── Finance (Sprint 6) ────────────────────────────────────────────────────
  {
    path:        'finance',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@sms/finance/feature').then((m) => m.FINANCE_ROUTES),
  },

  // ── Learning (Sprint 7) ───────────────────────────────────────────────────
  {
    path:        'learning',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@sms/learning/feature').then((m) => m.LEARNING_ROUTES),
  },

  // ── Analytics (Sprint 8) ──────────────────────────────────────────────────
  {
    path:        'analytics',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@sms/analytics/feature').then((m) => m.ANALYTICS_ROUTES),
  },

  // ── Catch-all ─────────────────────────────────────────────────────────────
  {
    path:      '**',
    redirectTo: 'dashboard',
  },
];
