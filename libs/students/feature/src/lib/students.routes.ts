import { Routes } from '@angular/router';

export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/student-list/student-list.component').then(m => m.StudentListComponent),
  },
  {
    path: ':publicId',
    loadComponent: () => import('./pages/student-detail/student-detail.component').then(m => m.StudentDetailComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/student-form/student-form.component').then(m => m.StudentFormComponent),
  },
];
