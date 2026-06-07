import { Routes } from '@angular/router';

export const COMMUNICATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./communication-layout.component').then(m => m.CommunicationLayoutComponent),
    children: [
      { path: '', redirectTo: 'inbox', pathMatch: 'full' },
      {
        path: 'inbox',
        loadComponent: () =>
          import('./pages/inbox/inbox.component').then(m => m.InboxComponent),
      },
      {
        path: 'inbox/:id',
        loadComponent: () =>
          import('./pages/message-detail/message-detail.component').then(m => m.MessageDetailComponent),
      },
      {
        path: 'sent',
        loadComponent: () =>
          import('./pages/sent/sent.component').then(m => m.SentComponent),
      },
      {
        path: 'drafts',
        loadComponent: () =>
          import('./pages/drafts/drafts.component').then(m => m.DraftsComponent),
      },
      {
        path: 'compose',
        loadComponent: () =>
          import('./pages/compose/compose.component').then(m => m.ComposeComponent),
      },
      {
        path: 'broadcast',
        loadComponent: () =>
          import('./pages/broadcast/broadcast-list.component').then(m => m.BroadcastListComponent),
      },
      {
        path: 'broadcast/new',
        loadComponent: () =>
          import('./pages/broadcast/broadcast-compose.component').then(m => m.BroadcastComposeComponent),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
      },
    ],
  },
];
