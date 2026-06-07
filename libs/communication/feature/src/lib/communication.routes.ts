import { Routes } from '@angular/router';

export const COMMUNICATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/inbox/inbox.component').then(m => m.InboxComponent),
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
  },
];
