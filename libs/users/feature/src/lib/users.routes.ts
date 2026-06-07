import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/users-list/users-list.component').then(m => m.UsersListComponent),
  },
  {
    path: 'annees',
    loadComponent: () => import('./pages/annees/annees.component').then(m => m.AnneesComponent),
  },
];
