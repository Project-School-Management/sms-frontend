import { Routes } from '@angular/router';

export const LEARNING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/evaluation-dashboard/evaluation-dashboard.component').then(m => m.EvaluationDashboardComponent),
    title: 'Évaluations en ligne',
  },
  {
    path: 'cours',
    loadComponent: () => import('./pages/cours-list/cours-list.component').then(m => m.CoursListComponent),
    title: 'Cours & E-learning',
  },
  {
    path: 'cours/creer',
    loadComponent: () => import('./pages/cours-editor/cours-editor.component').then(m => m.CoursEditorComponent),
    title: 'Créer un cours',
  },
  {
    path: 'cours/:publicId',
    loadComponent: () => import('./pages/cours-detail/cours-detail.component').then(m => m.CoursDetailComponent),
    title: 'Détail cours',
  },
  {
    path: 'examens',
    loadComponent: () => import('./pages/examens-list/examens-list.component').then(m => m.ExamensListComponent),
    title: 'Examens & Quiz',
  },
  {
    path: 'examens/creer',
    loadComponent: () => import('./pages/examen-editor/examen-editor.component').then(m => m.ExamenEditorComponent),
    title: 'Créer un examen',
  },
  {
    path: 'examens/:publicId',
    loadComponent: () => import('./pages/examen-detail/examen-detail.component').then(m => m.ExamenDetailComponent),
    title: 'Passer l\'examen',
  },
  {
    path: 'devoirs',
    loadComponent: () => import('./pages/devoirs-list/devoirs-list.component').then(m => m.DevoirsListComponent),
    title: 'Devoirs & Travaux',
  },
  {
    path: 'devoirs/creer',
    loadComponent: () => import('./pages/devoir-editor/devoir-editor.component').then(m => m.DevoirEditorComponent),
    title: 'Nouveau devoir',
  },
  {
    path: 'devoirs/:publicId/edit',
    loadComponent: () => import('./pages/devoir-editor/devoir-editor.component').then(m => m.DevoirEditorComponent),
    title: 'Modifier le devoir',
  },
  {
    path: 'devoirs/:publicId',
    loadComponent: () => import('./pages/devoir-detail/devoir-detail.component').then(m => m.DevoirDetailComponent),
    title: 'Détail devoir',
  },
  {
    path: 'sessions',
    loadComponent: () => import('./pages/sessions-virtuelles/sessions-virtuelles.component').then(m => m.SessionsVirtuellesComponent),
    title: 'Sessions virtuelles',
  },
  {
    path: 'sessions/creer',
    loadComponent: () => import('./pages/session-virtuelle-editor/session-virtuelle-editor.component').then(m => m.SessionVirtuelleEditorComponent),
    title: 'Planifier une session',
  },
  {
    path: 'certificats',
    loadComponent: () => import('./pages/certificats/certificats.component').then(m => m.CertificatsComponent),
    title: 'Certificats',
  },
];
