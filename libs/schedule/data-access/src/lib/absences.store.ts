import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { IAbsence, IAbsenceRecap, ISaisirAbsencesRequest } from '@sms/shared/models';
import { AbsencesApiService } from './absences-api.service';
import { ToastService } from '@sms/shared/ui';

interface AbsencesState {
  absences:      IAbsence[];
  recap:         IAbsenceRecap | null;
  loading:       boolean;
  saving:        boolean;
  error:         string | null;
  classeFilter:  string;
  statutFilter:  string;
  searchQuery:   string;
}

export const AbsencesStore = signalStore(
  { providedIn: 'root' },
  withState<AbsencesState>({
    absences: [], recap: null,
    loading: false, saving: false, error: null,
    classeFilter: '', statutFilter: '', searchQuery: '',
  }),

  withComputed(({ absences, classeFilter, statutFilter, searchQuery }) => ({
    filteredAbsences: computed(() => {
      let list = absences();
      if (classeFilter()) list = list.filter(a => a.classePublicId === classeFilter());
      if (statutFilter()) list = list.filter(a => a.statut === statutFilter());
      if (searchQuery()) {
        const q = searchQuery().toLowerCase();
        list = list.filter(a =>
          a.eleveNom.toLowerCase().includes(q) ||
          a.eleveMatricule.toLowerCase().includes(q) ||
          a.matiereLibelle.toLowerCase().includes(q)
        );
      }
      return list;
    }),
    totalCount:         computed(() => absences().length),
    justifieesCount:    computed(() => absences().filter(a => a.statut === 'JUSTIFIEE').length),
    nonJustifieesCount: computed(() => absences().filter(a => a.statut === 'NON_JUSTIFIEE').length),
    tauxJustification:  computed(() => {
      const total = absences().length;
      return total === 0 ? 0 : Math.round((absences().filter(a => a.statut === 'JUSTIFIEE').length / total) * 100);
    }),
  })),

  withMethods((store, api = inject(AbsencesApiService), toast = inject(ToastService)) => ({

    loadAbsences: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() => api.getAbsences().pipe(
        tap(absences => patchState(store, { absences, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    loadRecapEleve: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true, error: null, recap: null })),
      switchMap(elevePublicId => api.getRecapByEleve(elevePublicId).pipe(
        tap(recap => patchState(store, { recap, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    saisirAbsences: rxMethod<{
      request: ISaisirAbsencesRequest;
      meta: Parameters<AbsencesApiService['saisirAbsences']>[1];
    }>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(({ request, meta }) => api.saisirAbsences(request, meta).pipe(
        tap(created => {
          patchState(store, s => ({ absences: [...created, ...s.absences], saving: false }));
          toast.success(`${created.length} absence(s) enregistrée(s). Les parents seront notifiés.`);
        }),
        catchError((e: Error) => {
          patchState(store, { saving: false, error: e.message });
          toast.error(`Erreur lors de la saisie : ${e.message}`);
          return EMPTY;
        })
      ))
    )),

    justifierAbsence: rxMethod<{ publicId: string; motif: string; agent: { publicId: string; nom: string } }>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(({ publicId, motif, agent }) => api.justifierAbsence(publicId, motif, agent).pipe(
        tap(updated => {
          patchState(store, s => ({
            saving: false,
            absences: s.absences.map(a => a.publicId === updated.publicId ? updated : a),
          }));
          toast.success('Absence justifiée avec succès.');
        }),
        catchError((e: Error) => {
          patchState(store, { saving: false, error: e.message });
          toast.error(`Erreur lors de la justification : ${e.message}`);
          return EMPTY;
        })
      ))
    )),

    setClasseFilter: (c: string) => patchState(store, { classeFilter: c }),
    setStatutFilter: (s: string) => patchState(store, { statutFilter: s }),
    setSearchQuery:  (q: string) => patchState(store, { searchQuery: q }),
    clearError:      () => patchState(store, { error: null }),
  }))
);
