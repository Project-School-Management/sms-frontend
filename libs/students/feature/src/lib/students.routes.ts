import { Routes } from '@angular/router';

export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/student-list/student-list.component').then(m => m.StudentListComponent),
    title: 'Élèves',
  },
  {
    // ⚠️ 'new' must come before ':publicId'
    path: 'new',
    loadComponent: () =>
      import('./pages/student-form/student-form.component').then(m => m.StudentFormComponent),
    title: 'Nouvelle inscription',
    data: { mode: 'create' },
  },
  {
    path: ':publicId',
    loadComponent: () =>
      import('./pages/student-detail/student-detail.component').then(m => m.StudentDetailComponent),
    title: 'Fiche étudiant',
  },
  {
    path: ':publicId/edit',
    loadComponent: () =>
      import('./pages/student-form/student-form.component').then(m => m.StudentFormComponent),
    title: 'Modifier l\'étudiant',
    data: { mode: 'edit' },
  },
];
