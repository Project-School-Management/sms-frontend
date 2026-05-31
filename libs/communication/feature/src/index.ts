import { Routes } from '@angular/router';

/**
 * Communication Feature Routes - Sprint 5
 * Messaging, notifications, announcements
 */
export const COMMUNICATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lib/communication.component').then((m) => m.CommunicationComponent),
  },
];
