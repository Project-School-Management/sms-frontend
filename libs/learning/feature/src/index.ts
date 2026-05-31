import { Routes } from '@angular/router';

/**
 * Learning Feature Routes - Sprint 7
 * Online courses, LMS, content management
 */
export const LEARNING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lib/learning.component').then((m) => m.LearningComponent),
  },
];
