import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, timer } from 'rxjs';
import { IKpiOverview, IKpiAcademique, IKpiFinancier, IRapport, TypeRapport, FormatRapport, StatutRapport } from '@sms/shared/models';
import { AnalyticsApiService } from './analytics-api.service';

interface AnalyticsState {
  kpiOverview: IKpiOverview | null; kpiAcademique: IKpiAcademique[];
  kpiFinancier: IKpiFinancier | null; rapports: IRapport[];
  loading: boolean; error: string | null;
}

export const AnalyticsStore = signalStore(
  { providedIn: 'root' },
  withState<AnalyticsState>({ kpiOverview: null, kpiAcademique: [], kpiFinancier: null, rapports: [], loading: false, error: null }),
  withMethods((store, api = inject(AnalyticsApiService)) => ({
    loadKpiOverview: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getKpiOverview().pipe(
        tap(kpiOverview => patchState(store, { kpiOverview, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadKpiAcademique: rxMethod<void>(pipe(
      switchMap(() => api.getKpiAcademique().pipe(tap(kpiAcademique => patchState(store, { kpiAcademique })), catchError(() => EMPTY)))
    )),
    loadKpiFinancier: rxMethod<void>(pipe(
      switchMap(() => api.getKpiFinancier().pipe(tap(kpiFinancier => patchState(store, { kpiFinancier })), catchError(() => EMPTY)))
    )),
    loadRapports: rxMethod<void>(pipe(
      switchMap(() => api.getRapports().pipe(tap(rapports => patchState(store, { rapports })), catchError(() => EMPTY)))
    )),
    generateRapport(type: string, format: string): void {
      const rapportId = `rpt-${Date.now()}`;
      const newRapport: IRapport = {
        publicId: rapportId,
        type: type as TypeRapport,
        format: format as FormatRapport,
        statut: 'EN_COURS' as StatutRapport,
        createdAt: new Date().toISOString().split('T')[0],
      };
      patchState(store, s => ({ rapports: [newRapport, ...s.rapports] }));
      api.generateRapport(type, format).pipe(
        switchMap(() => timer(3000)),
        tap(() => patchState(store, s => ({
          rapports: s.rapports.map(r =>
            r.publicId === rapportId
              ? { ...r, statut: 'TERMINE' as StatutRapport, downloadUrl: '/mock/rapport-generated.pdf' }
              : r
          ),
        }))),
        catchError(() => EMPTY),
      ).subscribe();
    },
    clearError: () => patchState(store, { error: null }),
  }))
);
