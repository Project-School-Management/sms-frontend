import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { INote, IBulletin, IPromotion } from '@sms/shared/models';
import { AcademicApiService } from './academic-api.service';

interface AcademicState {
  notes:             INote[];
  bulletins:         IBulletin[];
  promotions:        IPromotion[];
  selectedBulletin:  IBulletin | null;
  loading:           boolean;
  error:             string | null;
  selectedPromo:     string;
  selectedClasseId:  string;
  selectedPeriode:   string;
  selectedMatiere:   string;
  selectedTypeEval:  string;
  searchQuery:       string;
}

export const AcademicStore = signalStore(
  { providedIn: 'root' },
  withState<AcademicState>({
    notes:             [],
    bulletins:         [],
    promotions:        [],
    selectedBulletin:  null,
    loading:           false,
    error:             null,
    selectedPromo:     '',
    selectedClasseId:  'cls-terminale-s1',
    selectedPeriode:   '',
    selectedMatiere:   '',
    selectedTypeEval:  '',
    searchQuery:       '',
  }),
  withComputed(({ notes, bulletins, selectedPromo, selectedMatiere, selectedTypeEval, searchQuery, selectedClasseId }) => ({

    filteredBulletins: computed(() => {
      let list = bulletins();
      if (selectedClasseId()) list = list.filter(b => b.promotionPublicId === selectedClasseId());
      else if (selectedPromo()) list = list.filter(b => b.promotionPublicId === selectedPromo());
      return list;
    }),

    filteredNotes: computed(() => {
      let list = notes();
      if (selectedMatiere())  list = list.filter(n => n.matiereLibelle === selectedMatiere());
      if (selectedTypeEval()) list = list.filter(n => n.statut === selectedTypeEval());
      if (searchQuery())      list = list.filter(n =>
        n.studentNom?.toLowerCase().includes(searchQuery().toLowerCase()) ||
        n.studentPublicId.toLowerCase().includes(searchQuery().toLowerCase())
      );
      return list;
    }),

    nbPublies: computed(() => bulletins().filter(b => b.statut === 'PUBLIE').length),

    moyenneGlobale: computed(() => {
      const list = bulletins();
      if (!list.length) return 0;
      return +(list.reduce((s, b) => s + b.moyenne, 0) / list.length).toFixed(2);
    }),

    classeStats: computed(() => {
      const classeNotes = notes();
      const valides     = classeNotes.filter(n => !n.absent && n.valeur !== null);
      const absences    = classeNotes.filter(n => n.absent).length;
      const nbEleves    = new Set(classeNotes.map(n => n.studentPublicId)).size;
      const nbEvals     = classeNotes.length;
      const moy         = valides.length
        ? +(valides.reduce((s, n) => s + (n.valeur ?? 0), 0) / valides.length).toFixed(2)
        : 0;
      const meilleureNote = valides.reduce((m, n) => Math.max(m, n.valeur ?? 0), 0);
      const plusFaible    = valides.reduce((m, n) => Math.min(m, n.valeur ?? 20), 20);
      const tauxReussite  = valides.length
        ? Math.round((valides.filter(n => (n.valeur ?? 0) >= 10).length / valides.length) * 100)
        : 0;
      return { nbEleves, nbEvals, moy, meilleureNote, plusFaible, absences, tauxReussite };
    }),

    topPerformers: computed(() => {
      const buls = [...bulletins()];
      return buls.sort((a, b) => b.moyenne - a.moyenne).slice(0, 5);
    }),

    enDifficulte: computed(() => {
      const buls = [...bulletins()];
      return buls.filter(b => b.moyenne < 10).sort((a, b) => a.moyenne - b.moyenne).slice(0, 5);
    }),

    matieresList: computed(() =>
      [...new Set(notes().map(n => n.matiereLibelle))].sort()
    ),
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
    setSelectedPromo:    (id: string)  => patchState(store, { selectedPromo: id }),
    setSelectedClasseId: (id: string)  => patchState(store, { selectedClasseId: id }),
    setSelectedPeriode:  (p: string)   => patchState(store, { selectedPeriode: p }),
    setSelectedMatiere:  (m: string)   => patchState(store, { selectedMatiere: m }),
    setSelectedTypeEval: (t: string)   => patchState(store, { selectedTypeEval: t }),
    setSearchQuery:      (q: string)   => patchState(store, { searchQuery: q }),
    clearError:          () => patchState(store, { error: null }),
  }))
);
