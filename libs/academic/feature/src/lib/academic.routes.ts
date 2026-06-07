import { Routes } from '@angular/router';

export const ACADEMIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/grades-list/grades-list.component').then(m => m.GradesListComponent),
  },
  {
    path: 'bulletins',
    loadComponent: () => import('./pages/bulletins-list/bulletins-list.component').then(m => m.BulletinsListComponent),
  },
  {
    path: 'bulletins/:publicId',
    loadComponent: () => import('./pages/bulletin-detail/bulletin-detail.component').then(m => m.BulletinDetailComponent),
  },
];
