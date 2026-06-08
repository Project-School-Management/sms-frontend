import { Routes } from '@angular/router';

export const LEARNING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cours-list/cours-list.component').then(m => m.CoursListComponent),
    title: 'Cours & E-learning',
  },
  {
    path: 'examens',
    loadComponent: () => import('./pages/examens-list/examens-list.component').then(m => m.ExamensListComponent),
    title: 'Examens',
  },
  {
    path: 'examens/:publicId',
    loadComponent: () => import('./pages/examen-detail/examen-detail.component').then(m => m.ExamenDetailComponent),
    title: 'Détail examen',
  },
  {
    path: ':publicId',
    loadComponent: () => import('./pages/cours-detail/cours-detail.component').then(m => m.CoursDetailComponent),
    title: 'Détail cours',
  },
];
