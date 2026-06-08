import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { ICours, IExamen } from '@sms/shared/models';
import { LearningApiService } from './learning-api.service';

interface LearningState {
  cours: ICours[]; selectedCours: ICours | null;
  examens: IExamen[]; selectedExamen: IExamen | null;
  loading: boolean; error: string | null;
}

export const LearningStore = signalStore(
  { providedIn: 'root' },
  withState<LearningState>({ cours: [], selectedCours: null, examens: [], selectedExamen: null, loading: false, error: null }),
  withComputed(({ cours }) => ({
    coursPublies: computed(() => cours().filter(c => c.statut === 'PUBLIE')),
    nbCours:      computed(() => cours().length),
  })),
  withMethods((store, api = inject(LearningApiService)) => ({
    loadCours: rxMethod<{ promotionPublicId?: string }>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(({ promotionPublicId }) => api.getCours(promotionPublicId).pipe(
        tap(cours => patchState(store, { cours, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadCour: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(id => api.getCour(id).pipe(
        tap(c => patchState(store, { selectedCours: c, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadExamens: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getExamens().pipe(
        tap(examens => patchState(store, { examens, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    selectExamen: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(id => api.getExamen(id).pipe(
        tap(e => patchState(store, { selectedExamen: e, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    clearError:           () => patchState(store, { error: null }),
    clearSelectedExamen:  () => patchState(store, { selectedExamen: null }),
  }))
);
