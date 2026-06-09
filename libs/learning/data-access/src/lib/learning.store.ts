import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import {
  ICours, IExamen, IDevoir, IExamSession,
  IQuestionBanque, IResultatExamen, ICertificat, ISessionVirtuelle,
} from '@sms/shared/models';
import { LearningApiService } from './learning-api.service';

interface LearningState {
  cours:            ICours[];
  selectedCours:    ICours | null;
  examens:          IExamen[];
  selectedExamen:   IExamen | null;
  devoirs:          IDevoir[];
  selectedDevoir:   IDevoir | null;
  resultats:        IResultatExamen[];
  sessions:         IExamSession[];
  sessionsVirt:     ISessionVirtuelle[];
  certificats:      ICertificat[];
  questionsBank:    IQuestionBanque[];
  loading:          boolean;
  saving:           boolean;
  error:            string | null;
}

export const LearningStore = signalStore(
  { providedIn: 'root' },
  withState<LearningState>({
    cours: [], selectedCours: null,
    examens: [], selectedExamen: null,
    devoirs: [], selectedDevoir: null,
    resultats: [],
    sessions: [],
    sessionsVirt: [],
    certificats: [],
    questionsBank: [],
    loading: false, saving: false, error: null,
  }),
  withComputed(({ cours, examens, devoirs, resultats, certificats, questionsBank, sessionsVirt }) => ({
    coursPublies:   computed(() => cours().filter(c => c.statut === 'PUBLIE')),
    nbCours:        computed(() => cours().length),

    examensAVenir:  computed(() => examens().filter(e => e.statut === 'A_VENIR')),
    examensEnCours: computed(() => examens().filter(e => e.statut === 'EN_COURS')),
    examensTermines:computed(() => examens().filter(e => e.statut === 'TERMINE')),

    devoirsOuverts: computed(() => devoirs().filter(d => d.statut === 'OUVERT')),
    devoirsFermes:  computed(() => devoirs().filter(d => d.statut === 'FERME')),
    devoirsCorr:    computed(() => devoirs().filter(d => d.statut === 'CORRIGE')),

    sessionsActives: computed(() => sessionsVirt().filter(s => s.statut === 'EN_COURS')),
    sessionsPlan:    computed(() => sessionsVirt().filter(s => s.statut === 'PLANIFIEE')),

    moyenneGlobale: computed(() => {
      const r = resultats();
      if (!r.length) return 0;
      return Math.round((r.reduce((s, x) => s + (x.score / x.scoreMax) * 20, 0) / r.length) * 10) / 10;
    }),
    tauxReussite: computed(() => {
      const r = resultats();
      if (!r.length) return 0;
      return Math.round((r.filter(x => x.score / x.scoreMax >= 0.5).length / r.length) * 100);
    }),
    nbCertificats: computed(() => certificats().length),
    nbQuestions:   computed(() => questionsBank().length),
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

    loadDevoirs: rxMethod<{ coursPublicId?: string }>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(({ coursPublicId }) => api.getDevoirs(coursPublicId).pipe(
        tap(devoirs => patchState(store, { devoirs, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    selectDevoir: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(id => api.getDevoir(id).pipe(
        tap(d => patchState(store, { selectedDevoir: d, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    loadResultats: rxMethod<{ examenPublicId?: string }>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(({ examenPublicId }) => api.getResultats(examenPublicId).pipe(
        tap(resultats => patchState(store, { resultats, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    loadSessionsVirt: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getSessionsVirt().pipe(
        tap(sessionsVirt => patchState(store, { sessionsVirt, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    loadCertificats: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getCertificats().pipe(
        tap(certificats => patchState(store, { certificats, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    loadQuestionsBank: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getQuestionsBank().pipe(
        tap(questionsBank => patchState(store, { questionsBank, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    deleteExamen: rxMethod<string>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(publicId => api.deleteExamen(publicId).pipe(
        tap(() => patchState(store, s => ({ examens: s.examens.filter(e => e.publicId !== publicId), saving: false }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    deleteDevoir: rxMethod<string>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(publicId => api.deleteDevoir(publicId).pipe(
        tap(() => patchState(store, s => ({ devoirs: s.devoirs.filter(d => d.publicId !== publicId), saving: false }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    clearError:          () => patchState(store, { error: null }),
    clearSelectedExamen: () => patchState(store, { selectedExamen: null }),
    clearSelectedDevoir: () => patchState(store, { selectedDevoir: null }),
  }))
);
