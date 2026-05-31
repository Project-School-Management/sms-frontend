import { Routes } from '@angular/router';

/**
 * Users Feature Routes - Sprint 1
 * Admin panel for managing users and establishments
 */
export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lib/users.component').then((m) => m.UsersComponent),
  },
];
