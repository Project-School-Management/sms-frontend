import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import {
  DashboardApiService, IDashboardData,
  IKpiCard, IEvolutionPoint, IFinanceSegment,
  IActivity, IAlert, IPromotionStat, IAgendaEvent, IQuickStat,
} from './dashboard-api.service';

interface DashboardState {
  data:    IDashboardData | null;
  loading: boolean;
  error:   string | null;
}

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState<DashboardState>({ data: null, loading: false, error: null }),

  withComputed(({ data }) => ({
    kpis:            computed((): IKpiCard[]         => data()?.kpis            ?? []),
    evolution:       computed((): IEvolutionPoint[]  => data()?.evolution       ?? []),
    financeSegments: computed((): IFinanceSegment[]  => data()?.financeSegments ?? []),
    activities:      computed((): IActivity[]        => data()?.activities      ?? []),
    alerts:          computed((): IAlert[]           => data()?.alerts          ?? []),
    promotionStats:  computed((): IPromotionStat[]   => data()?.promotionStats  ?? []),
    agenda:          computed((): IAgendaEvent[]     => data()?.agenda          ?? []),
    quickStats:      computed((): IQuickStat[]       => data()?.quickStats      ?? []),
    totalBudget:     computed((): number             => data()?.totalBudget     ?? 0),
    totalBudgetDisplay: computed((): string          => data()?.totalBudgetDisplay ?? ''),
    systemHealth:    computed((): number             => data()?.systemHealth    ?? 0),

    // Derived metrics
    evolutionMax:    computed(() => Math.max(...(data()?.evolution ?? []).map(e => e.value), 1)),
    donutGradient:   computed((): string => {
      const segs = data()?.financeSegments ?? [];
      if (!segs.length) return 'conic-gradient(#e2e8f0 0% 100%)';
      let cum = 0;
      const parts = segs.map(s => {
        const start = cum; cum += s.pct;
        return `${s.color} ${start}% ${cum}%`;
      });
      return `conic-gradient(${parts.join(', ')})`;
    }),
  })),

  withMethods((store, api = inject(DashboardApiService)) => ({
    loadDashboard: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() => api.getData().pipe(
        tap(data => patchState(store, { data, loading: false })),
        catchError((e: Error) => {
          patchState(store, { loading: false, error: e.message });
          return EMPTY;
        }),
      )),
    )),

    /** @deprecated use loadDashboard */
    loadSummary: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() => api.getData().pipe(
        tap(data => patchState(store, { data, loading: false })),
        catchError((e: Error) => {
          patchState(store, { loading: false, error: e.message });
          return EMPTY;
        }),
      )),
    )),
  })),
);
