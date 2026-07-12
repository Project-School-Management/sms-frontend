import { Routes } from '@angular/router';

export const CONFIG_SYSTEM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/config-dashboard/config-dashboard.component')
        .then(m => m.ConfigDashboardComponent),
    title: 'Configuration système',
  },
  {
    path: 'etablissement',
    loadComponent: () =>
      import('./pages/etablissement-config/etablissement-config.component')
        .then(m => m.EtablissementConfigComponent),
    title: "Identité de l'établissement",
  },
  {
    path: 'espaces',
    loadComponent: () =>
      import('./pages/espaces-config/espaces-config.component')
        .then(m => m.EspacesConfigComponent),
    title: 'Espaces',
  },
  {
    path: 'academic',
    loadComponent: () =>
      import('./pages/academic-config/academic-config.component')
        .then(m => m.AcademicConfigComponent),
    title: 'Référentiels académiques',
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./pages/rooms-config/rooms-config.component')
        .then(m => m.RoomsConfigComponent),
    title: 'Salles & bâtiments',
  },
  {
    path: 'finance',
    loadComponent: () =>
      import('./pages/finance-config/finance-config.component')
        .then(m => m.FinanceConfigComponent),
    title: 'Référentiels financiers',
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./pages/calendar-config/calendar-config.component')
        .then(m => m.CalendarConfigComponent),
    title: 'Calendrier académique',
  },
];
