import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { ISalle, ITimeSlot, ISeance } from '@sms/shared/models';
import { ScheduleApiService } from './schedule-api.service';

interface ScheduleState {
  salles: ISalle[]; timeSlots: ITimeSlot[]; seances: ISeance[];
  loading: boolean; error: string | null; jourFilter: string;
}

export const ScheduleStore = signalStore(
  { providedIn: 'root' },
  withState<ScheduleState>({ salles: [], timeSlots: [], seances: [], loading: false, error: null, jourFilter: '' }),
  withComputed(({ timeSlots, seances, jourFilter }) => ({
    filteredSlots:  computed(() => jourFilter() ? timeSlots().filter(t => t.jour === jourFilter()) : timeSlots()),
    annuleesCount:  computed(() => seances().filter(s => s.statut === 'ANNULEE').length),
    joursAvecCours: computed(() => [...new Set(timeSlots().map(t => t.jour))]),
  })),
  withMethods((store, api = inject(ScheduleApiService)) => ({
    loadTimeSlots: rxMethod<{ promotionPublicId?: string }>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(({ promotionPublicId }) => api.getTimeSlots(promotionPublicId).pipe(
        tap(timeSlots => patchState(store, { timeSlots, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadSeances: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getSeances().pipe(
        tap(seances => patchState(store, { seances, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadSalles: rxMethod<void>(pipe(
      switchMap(() => api.getSalles().pipe(tap(salles => patchState(store, { salles })), catchError(() => EMPTY)))
    )),
    setJourFilter: (jour: string) => patchState(store, { jourFilter: jour }),
    clearError:    () => patchState(store, { error: null }),
  }))
);
