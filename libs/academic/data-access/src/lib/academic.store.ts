import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import {
  INote, IBulletin, IPromotion, IEvaluation, IEleveContext,
} from '@sms/shared/models';
import { AcademicApiService } from './academic-api.service';

interface AcademicState {
  notes:             INote[];
  bulletins:         IBulletin[];
  promotions:        IPromotion[];
  evaluations:       IEvaluation[];
  elevesSaisie:      IEleveContext[];
  matieresSaisie:    { publicId: string; libelle: string; coeff: number; enseignant: string }[];
  selectedBulletin:  IBulletin | null;
  selectedEval:      IEvaluation | null;
  loading:           boolean;
  saving:            boolean;
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
    notes: [], bulletins: [], promotions: [], evaluations: [],
    elevesSaisie: [], matieresSaisie: [],
    selectedBulletin: null, selectedEval: null,
    loading: false, saving: false, error: null,
    selectedPromo: '', selectedClasseId: 'cls-terminale-s1',
    selectedPeriode: '', selectedMatiere: '', selectedTypeEval: '', searchQuery: '',
  }),

  withComputed(({ notes, bulletins, evaluations, selectedClasseId, selectedPromo,
                  selectedMatiere, selectedTypeEval, searchQuery }) => ({

    filteredBulletins: computed(() => {
      let list = bulletins();
      const cls = selectedClasseId() || selectedPromo();
      if (cls) list = list.filter(b => b.promotionPublicId === cls);
      return list;
    }),

    filteredNotes: computed(() => {
      let list = notes();
      if (selectedMatiere())  list = list.filter(n => n.matiereLibelle === selectedMatiere());
      if (selectedTypeEval()) list = list.filter(n => n.statut === selectedTypeEval());
      if (searchQuery())      list = list.filter(n =>
        (n.studentNom ?? '').toLowerCase().includes(searchQuery().toLowerCase()) ||
        n.studentPublicId.toLowerCase().includes(searchQuery().toLowerCase())
      );
      return list;
    }),

    filteredEvaluations: computed(() => {
      let list = evaluations();
      const cls = selectedClasseId();
      if (cls) list = list.filter(e => e.promotionPublicId === cls);
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
        ? +(valides.reduce((s, n) => s + (n.valeur ?? 0), 0) / valides.length).toFixed(2) : 0;
      const meilleureNote = valides.reduce((m, n) => Math.max(m, n.valeur ?? 0), 0);
      const plusFaible    = valides.reduce((m, n) => Math.min(m, n.valeur ?? 20), 20);
      const tauxReussite  = valides.length
        ? Math.round((valides.filter(n => (n.valeur ?? 0) >= 10).length / valides.length) * 100) : 0;
      return { nbEleves, nbEvals, moy, meilleureNote, plusFaible, absences, tauxReussite };
    }),

    topPerformers: computed(() =>
      [...bulletins()].sort((a, b) => b.moyenne - a.moyenne).slice(0, 5)
    ),

    enDifficulte: computed(() =>
      [...bulletins()].filter(b => b.moyenne < 10).sort((a, b) => a.moyenne - b.moyenne).slice(0, 5)
    ),

    matieresList: computed(() => [...new Set(notes().map(n => n.matiereLibelle))].sort()),
  })),

  withMethods((store, api = inject(AcademicApiService)) => ({

    // ── Bulletins ────────────────────────────────────────────────────────
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

    // ── Notes ─────────────────────────────────────────────────────────────
    loadNotes: rxMethod<{ studentPublicId?: string; evaluationPublicId?: string }>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(({ studentPublicId, evaluationPublicId }) => api.getNotes(studentPublicId, evaluationPublicId).pipe(
        tap(notes => patchState(store, { notes, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    updateNote: rxMethod<{ publicId: string; valeur: number | null; motif?: string }>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(({ publicId, valeur, motif }) => api.updateNote(publicId, { valeur, motif }).pipe(
        tap(updated => patchState(store, s => ({
          saving: false,
          notes:  s.notes.map(n => n.publicId === updated.publicId ? updated : n),
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── Promotions ────────────────────────────────────────────────────────
    loadPromotions: rxMethod<void>(pipe(
      switchMap(() => api.getPromotions().pipe(
        tap(p => patchState(store, { promotions: p })), catchError(() => EMPTY)
      ))
    )),

    // ── Évaluations ───────────────────────────────────────────────────────
    loadEvaluations: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(classeId => api.getEvaluations(classeId).pipe(
        tap(evaluations => patchState(store, { evaluations, loading: false })),
        catchError(() => { patchState(store, { loading: false }); return EMPTY; })
      ))
    )),
    createEvaluation: rxMethod<Partial<IEvaluation>>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(req => api.createEvaluation(req).pipe(
        tap(e => patchState(store, s => ({ evaluations: [e, ...s.evaluations], saving: false, selectedEval: e }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── Saisie ────────────────────────────────────────────────────────────
    loadElevesSaisie: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(classeId => api.getElevesByClasse(classeId).pipe(
        tap(eleves => patchState(store, { elevesSaisie: eleves, loading: false })),
        catchError(() => { patchState(store, { loading: false }); return EMPTY; })
      ))
    )),
    loadMatieresSaisie: rxMethod<string>(pipe(
      switchMap(classeId => api.getMatieresByClasse(classeId).pipe(
        tap(matieres => patchState(store, { matieresSaisie: matieres })),
        catchError(() => EMPTY)
      ))
    )),
    saveNotesBatch: rxMethod<{
      evaluationPublicId: string;
      entries: Array<{ studentPublicId: string; valeur: number | null; casParticulier?: string; appreciation?: string }>;
      statut: 'BROUILLON' | 'SAISIE';
    }>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(({ evaluationPublicId, entries, statut }) =>
        api.saveNotesBatch(evaluationPublicId, entries, statut).pipe(
          tap(notes => patchState(store, s => ({
            saving: false,
            notes:  [...s.notes.filter(n => n.evaluationPublicId !== evaluationPublicId), ...notes],
            evaluations: s.evaluations.map(e =>
              e.publicId === evaluationPublicId
                ? { ...e, nbSaisis: entries.length, statut: statut === 'SAISIE' ? 'SAISIE' as const : e.statut }
                : e
            ),
          }))),
          catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
        )
      )
    )),
    validateEvaluation: rxMethod<string>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(id => api.validateEvaluation(id).pipe(
        tap(updated => patchState(store, s => ({
          saving: false,
          selectedEval: updated,
          evaluations: s.evaluations.map(e => e.publicId === updated.publicId ? updated : e),
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),
    publishEvaluation: rxMethod<string>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(id => api.publishEvaluation(id).pipe(
        tap(updated => patchState(store, s => ({
          saving: false,
          selectedEval: updated,
          evaluations: s.evaluations.map(e => e.publicId === updated.publicId ? updated : e),
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── Évaluations CRUD ─────────────────────────────────────────────────────
    updateEvaluation: rxMethod<Partial<IEvaluation>>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(data => api.updateEvaluation(data).pipe(
        tap(updated => patchState(store, s => ({
          saving: false,
          evaluations: s.evaluations.map(e => e.publicId === updated.publicId ? updated : e),
          selectedEval: updated,
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),
    deleteEvaluation: rxMethod<string>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(id => api.deleteEvaluation(id).pipe(
        tap(() => patchState(store, s => ({
          saving: false,
          evaluations: s.evaluations.filter(e => e.publicId !== id),
          selectedEval: null,
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── Filters & UI ──────────────────────────────────────────────────────
    setSelectedEval:     (e: IEvaluation | null) => patchState(store, { selectedEval: e }),
    setSelectedPromo:    (id: string)  => patchState(store, { selectedPromo: id }),
    setSelectedClasseId: (id: string)  => patchState(store, { selectedClasseId: id }),
    setSelectedPeriode:  (p: string)   => patchState(store, { selectedPeriode: p }),
    setSelectedMatiere:  (m: string)   => patchState(store, { selectedMatiere: m }),
    setSelectedTypeEval: (t: string)   => patchState(store, { selectedTypeEval: t }),
    setSearchQuery:      (q: string)   => patchState(store, { searchQuery: q }),
    clearError:          ()            => patchState(store, { error: null }),
  }))
);
