import { Routes } from '@angular/router';

/**
 * Students Feature Routes - Sprint 2
 * Student management and enrollment
 */
export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lib/students.component').then((m) => m.StudentsComponent),
  },
];
