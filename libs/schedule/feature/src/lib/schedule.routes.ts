import { Routes } from '@angular/router';

export const SCHEDULE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/schedule-view/schedule-view.component').then(m => m.ScheduleViewComponent),
  },
  {
    path: 'seances',
    loadComponent: () => import('./pages/seances-list/seances-list.component').then(m => m.SeancesListComponent),
  },
  {
    path: 'salles',
    loadComponent: () => import('./pages/salles-list/salles-list.component').then(m => m.SallesListComponent),
  },
  {
    path: 'absences',
    loadComponent: () => import('./pages/absences-list/absences-list.component').then(m => m.AbsencesListComponent),
  },
  {
    path: 'absences/saisie',
    loadComponent: () => import('./pages/saisie-absences/saisie-absences.component').then(m => m.SaisieAbsencesComponent),
  },
];
