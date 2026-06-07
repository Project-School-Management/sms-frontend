import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { DashboardApiService, IDashboardSummary } from './dashboard-api.service';

interface DashboardState { summary: IDashboardSummary | null; loading: boolean; error: string | null; }

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState<DashboardState>({ summary: null, loading: false, error: null }),
  withMethods((store, api = inject(DashboardApiService)) => ({
    loadSummary: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getSummary().pipe(
        tap(summary => patchState(store, { summary, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
  }))
);
