import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { INote, IBulletin, IPromotion } from '@sms/shared/models';
import { AcademicApiService } from './academic-api.service';

interface AcademicState {
  notes: INote[]; bulletins: IBulletin[]; promotions: IPromotion[];
  selectedBulletin: IBulletin | null; loading: boolean; error: string | null; selectedPromo: string;
}

export const AcademicStore = signalStore(
  { providedIn: 'root' },
  withState<AcademicState>({ notes: [], bulletins: [], promotions: [], selectedBulletin: null, loading: false, error: null, selectedPromo: '' }),
  withComputed(({ bulletins, selectedPromo }) => ({
    filteredBulletins: computed(() => selectedPromo() ? bulletins().filter(b => b.promotionPublicId === selectedPromo()) : bulletins()),
    nbPublies:         computed(() => bulletins().filter(b => b.statut === 'PUBLIE').length),
    moyenneGlobale:    computed(() => {
      const list = bulletins(); if (!list.length) return 0;
      return +(list.reduce((s, b) => s + b.moyenne, 0) / list.length).toFixed(2);
    }),
  })),
  withMethods((store, api = inject(AcademicApiService)) => ({
    loadBulletins: rxMethod<{ studentPublicId?: string }>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(({ studentPublicId }) => api.getBulletins(studentPublicId).pipe(
        tap(bulletins => patchState(store, { bulletins, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadBulletin: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(id => api.getBulletin(id).pipe(
        tap(b => patchState(store, { selectedBulletin: b, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadNotes: rxMethod<{ studentPublicId?: string }>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(({ studentPublicId }) => api.getNotes(studentPublicId).pipe(
        tap(notes => patchState(store, { notes, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadPromotions: rxMethod<void>(pipe(
      switchMap(() => api.getPromotions().pipe(tap(p => patchState(store, { promotions: p })), catchError(() => EMPTY)))
    )),
    setSelectedPromo: (id: string) => patchState(store, { selectedPromo: id }),
    clearError:       () => patchState(store, { error: null }),
  }))
);
