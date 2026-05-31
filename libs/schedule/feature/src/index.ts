import { Routes } from '@angular/router';

/**
 * Schedule Feature Routes - Sprint 4
 * Class schedules, timetables, room assignments
 */
export const SCHEDULE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lib/schedule.component').then((m) => m.ScheduleComponent),
  },
];
