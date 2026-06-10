import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/users-list/users-list.component').then(m => m.UsersListComponent),
    title: 'Utilisateurs',
  },
  {
    path: 'annees',
    loadComponent: () => import('./pages/annees/annees.component').then(m => m.AnneesComponent),
    title: 'Années académiques',
  },
  {
    path: 'rbac',
    loadComponent: () => import('./pages/rbac/rbac.component').then(m => m.RbacComponent),
    title: 'Rôles & Permissions',
  },
];
