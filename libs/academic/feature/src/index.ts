import { Routes } from '@angular/router';

/**
 * Academic Feature Routes - Sprint 3
 * Academic management (classes, grades, transcripts)
 */
export const ACADEMIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lib/academic.component').then((m) => m.AcademicComponent),
  },
];
