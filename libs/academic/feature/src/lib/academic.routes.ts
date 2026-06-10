import { Routes } from '@angular/router';

export const ACADEMIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/grades-list/grades-list.component').then(m => m.GradesListComponent),
    title: 'Notes & Évaluations',
  },
  {
    path: 'saisie',
    loadComponent: () => import('./pages/saisie-notes/saisie-notes.component').then(m => m.SaisieNotesComponent),
    title: 'Saisie des notes',
  },
  {
    path: 'evaluations',
    loadComponent: () => import('./pages/evaluations-list/evaluations-list.component').then(m => m.EvaluationsListComponent),
    title: 'Gestion des évaluations',
  },
  {
    path: 'classes',
    loadComponent: () => import('./pages/classes-management/classes-management.component').then(m => m.ClassesManagementComponent),
    title: 'Gestion des classes',
  },
  {
    path: 'bulletins',
    loadComponent: () => import('./pages/bulletins-list/bulletins-list.component').then(m => m.BulletinsListComponent),
    title: 'Bulletins scolaires',
  },
  {
    path: 'bulletins/:publicId',
    loadComponent: () => import('./pages/bulletin-detail/bulletin-detail.component').then(m => m.BulletinDetailComponent),
    title: 'Détail bulletin',
  },
];
