import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, forkJoin } from 'rxjs';
import { DashboardApiService, IDashboardSummary, IActiviteRecente, IEvolutionInscription, IAlerte } from './dashboard-api.service';

interface DashboardState {
  summary: IDashboardSummary | null;
  activites: IActiviteRecente[];
  evolution: IEvolutionInscription[];
  alertes: IAlerte[];
  loading: boolean;
  error: string | null;
}

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState<DashboardState>({ summary: null, activites: [], evolution: [], alertes: [], loading: false, error: null }),
  withMethods((store, api = inject(DashboardApiService)) => ({
    loadSummary: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => forkJoin({
        summary: api.getSummary(),
        activites: api.getActiviteRecente(),
        evolution: api.getEvolutionInscriptions(),
        alertes: api.getAlertes(),
      }).pipe(
        tap(({ summary, activites, evolution, alertes }) =>
          patchState(store, { summary, activites, evolution, alertes, loading: false })
        ),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
  }))
);
