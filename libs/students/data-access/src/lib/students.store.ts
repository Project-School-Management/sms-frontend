import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { IStudent, IInscription, IAuditEntry, IDocument, StudentStatut } from '@sms/shared/models';
import { StudentsApiService } from './students-api.service';
import { ToastService } from '@sms/shared/ui';

interface StudentsState {
  students:         IStudent[];
  selectedStudent:  IStudent | null;
  historique:       IInscription[];
  audit:            IAuditEntry[];
  documents:        IDocument[];
  loading:          boolean;
  saving:           boolean;
  error:            string | null;
  totalCount:       number;
  currentPage:      number;
  searchQuery:      string;
  statutFilter:     string;
}

export const StudentsStore = signalStore(
  { providedIn: 'root' },
  withState<StudentsState>({
    students: [], selectedStudent: null,
    historique: [], audit: [], documents: [],
    loading: false, saving: false, error: null,
    totalCount: 0, currentPage: 0, searchQuery: '', statutFilter: '',
  }),

  withComputed(({ students, statutFilter, searchQuery }) => ({
    filteredStudents: computed(() => {
      let list = students();
      if (statutFilter()) list = list.filter(s => s.statut === statutFilter());
      if (searchQuery()) {
        const q = searchQuery().toLowerCase();
        list = list.filter(s =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.matricule.toLowerCase().includes(q) ||
          (s.email ?? '').toLowerCase().includes(q)
        );
      }
      return list;
    }),
    actifsCount:           computed(() => students().filter(s => s.statut === 'ACTIF').length),
    inactifsCount:         computed(() => students().filter(s => ['INACTIF', 'SUSPENDU', 'ABANDONNE'].includes(s.statut)).length),
    annulationsCount:      computed(() => students().filter(s => s.statut === 'INSCRIPTION_ANNULEE').length),
    preInscritsCount:      computed(() => students().filter(s => ['PRE_INSCRIT', 'INSCRIT', 'INSCRIPTION_VALIDEE'].includes(s.statut)).length),
  })),

  withMethods((store, api = inject(StudentsApiService), toast = inject(ToastService)) => ({

    // ── Load list ──────────────────────────────────────────────────────────
    loadStudents: rxMethod<{ page?: number }>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(({ page = 0 }) => api.getStudents(page).pipe(
        tap(students => patchState(store, { students, totalCount: api.getTotalCount(), currentPage: page, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── Load single student ────────────────────────────────────────────────
    loadStudent: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true, error: null, historique: [], audit: [], documents: [] })),
      switchMap(id => api.getStudent(id).pipe(
        tap(student => patchState(store, { selectedStudent: student, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── Load history ───────────────────────────────────────────────────────
    loadHistorique: rxMethod<string>(pipe(
      switchMap(id => api.getHistorique(id).pipe(
        tap(historique => patchState(store, { historique })),
        catchError(() => EMPTY)
      ))
    )),

    // ── Load audit ─────────────────────────────────────────────────────────
    loadAudit: rxMethod<string>(pipe(
      switchMap(id => api.getAudit(id).pipe(
        tap(audit => patchState(store, { audit })),
        catchError(() => EMPTY)
      ))
    )),

    // ── Load documents ─────────────────────────────────────────────────────
    loadDocuments: rxMethod<string>(pipe(
      switchMap(id => api.getDocuments(id).pipe(
        tap(documents => patchState(store, { documents })),
        catchError(() => EMPTY)
      ))
    )),

    // ── Create ─────────────────────────────────────────────────────────────
    createStudent: rxMethod<Partial<IStudent>>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(req => api.createStudent(req).pipe(
        tap(student => {
          patchState(store, s => ({ students: [...s.students, student], saving: false }));
          toast.success(`Élève ${student.firstName} ${student.lastName} inscrit avec succès.`);
        }),
        catchError((e: Error) => {
          patchState(store, { saving: false, error: e.message });
          toast.error(`Erreur lors de l'inscription : ${e.message}`);
          return EMPTY;
        })
      ))
    )),

    // ── Update ─────────────────────────────────────────────────────────────
    updateStudent: rxMethod<{ publicId: string; data: Partial<IStudent> }>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(({ publicId, data }) => api.updateStudent(publicId, data).pipe(
        tap(updated => {
          patchState(store, s => ({
            saving: false,
            selectedStudent: updated,
            students: s.students.map(st => st.publicId === updated.publicId ? updated : st),
          }));
          toast.success('Fiche élève mise à jour avec succès.');
        }),
        catchError((e: Error) => {
          patchState(store, { saving: false, error: e.message });
          toast.error(`Erreur lors de la mise à jour : ${e.message}`);
          return EMPTY;
        })
      ))
    )),

    // ── Cancel inscription ─────────────────────────────────────────────────
    cancelInscription: rxMethod<{ publicId: string; motif: string }>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(({ publicId, motif }) => api.cancelInscription(publicId, motif).pipe(
        tap(updated => {
          patchState(store, s => ({
            saving: false,
            selectedStudent: updated,
            students: s.students.map(st => st.publicId === updated.publicId ? updated : st),
          }));
          toast.warning("Inscription annulée. L'élève n'est plus scolarisé.");
        }),
        catchError((e: Error) => {
          patchState(store, { saving: false, error: e.message });
          toast.error(`Erreur lors de l'annulation : ${e.message}`);
          return EMPTY;
        })
      ))
    )),

    // ── Reactivate inscription ─────────────────────────────────────────────
    reactiverInscription: rxMethod<string>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(publicId => api.reactiverInscription(publicId).pipe(
        tap(updated => {
          patchState(store, s => ({
            saving: false,
            selectedStudent: updated,
            students: s.students.map(st => st.publicId === updated.publicId ? updated : st),
          }));
          toast.success('Inscription réactivée avec succès.');
        }),
        catchError((e: Error) => {
          patchState(store, { saving: false, error: e.message });
          toast.error(`Erreur lors de la réactivation : ${e.message}`);
          return EMPTY;
        })
      ))
    )),

    // ── Change statut ──────────────────────────────────────────────────────
    changeStatut: rxMethod<{ publicId: string; statut: StudentStatut; motif?: string }>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(({ publicId, statut, motif }) => api.changeStatut(publicId, statut, motif).pipe(
        tap(updated => {
          patchState(store, s => ({
            saving: false,
            selectedStudent: updated,
            students: s.students.map(st => st.publicId === updated.publicId ? updated : st),
          }));
          toast.success(`Statut mis à jour : ${statut}.`);
        }),
        catchError((e: Error) => {
          patchState(store, { saving: false, error: e.message });
          toast.error(`Erreur lors du changement de statut : ${e.message}`);
          return EMPTY;
        })
      ))
    )),

    // ── Filters ────────────────────────────────────────────────────────────
    setSearchQuery:  (q: string)  => patchState(store, { searchQuery: q }),
    setStatutFilter: (f: string)  => patchState(store, { statutFilter: f }),
    selectStudent:   (s: IStudent | null) => patchState(store, { selectedStudent: s }),
    clearError:      ()           => patchState(store, { error: null }),
    clearSelected:   ()           => patchState(store, { selectedStudent: null, historique: [], audit: [], documents: [] }),
  }))
);
