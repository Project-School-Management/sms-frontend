import { Routes } from '@angular/router';

export const LEARNING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cours-list/cours-list.component').then(m => m.CoursListComponent),
  },
  {
    path: ':publicId',
    loadComponent: () => import('./pages/cours-detail/cours-detail.component').then(m => m.CoursDetailComponent),
  },
  {
    path: 'examens',
    loadComponent: () => import('./pages/examens-list/examens-list.component').then(m => m.ExamensListComponent),
  },
];
