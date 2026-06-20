import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import {
  ILibraryResource, ILibraryCategory, ILoan, ILibraryStats,
  IReservation, IStudentLite,
} from '@sms/shared/models';
import { LibraryApiService } from './library-api.service';

interface LibraryState {
  resources:        ILibraryResource[];
  categories:       ILibraryCategory[];
  loans:            ILoan[];
  reservations:     IReservation[];
  students:         IStudentLite[];
  stats:            ILibraryStats | null;
  selectedResource: ILibraryResource | null;
  selectedLoan:     ILoan | null;
  lastReservation:  IReservation | null;
  loading:          boolean;
  saving:           boolean;
  error:            string | null;
  filterCategorie:  string;
  filterType:       string;
  filterNiveau:     string;
  filterStatut:     string;
  searchQuery:      string;
}

export const LibraryStore = signalStore(
  { providedIn: 'root' },
  withState<LibraryState>({
    resources: [], categories: [], loans: [], reservations: [], students: [], stats: null,
    selectedResource: null, selectedLoan: null, lastReservation: null,
    loading: false, saving: false, error: null,
    filterCategorie: '', filterType: '', filterNiveau: '', filterStatut: '', searchQuery: '',
  }),

  withComputed(({ resources, loans, filterCategorie, filterType, filterNiveau, filterStatut, searchQuery }) => ({

    filteredResources: computed(() => {
      let list = resources();
      if (filterCategorie()) list = list.filter(r => r.categorieId === filterCategorie());
      if (filterType())      list = list.filter(r => r.type === filterType());
      if (filterNiveau())    list = list.filter(r => r.niveaux.includes(filterNiveau() as any));
      if (filterStatut())    list = list.filter(r => r.statut === filterStatut());
      if (searchQuery()) {
        const q = searchQuery().toLowerCase();
        list = list.filter(r =>
          r.titre.toLowerCase().includes(q) ||
          r.auteur.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return list;
    }),

    activeLoans: computed(() => loans().filter(l => l.statut === 'EN_COURS' || l.statut === 'EN_RETARD')),
    overdueLoans: computed(() => loans().filter(l => l.statut === 'EN_RETARD')),

    loansByStatus: computed(() => ({
      enCours:  loans().filter(l => l.statut === 'EN_COURS').length,
      enRetard: loans().filter(l => l.statut === 'EN_RETARD').length,
      retournes: loans().filter(l => l.statut === 'RETOURNE').length,
    })),
  })),

  withMethods((store, api = inject(LibraryApiService)) => ({

    loadCategories: rxMethod<void>(pipe(
      switchMap(() => api.getCategories().pipe(
        tap(categories => patchState(store, { categories })),
        catchError(() => EMPTY)
      ))
    )),

    loadResources: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getResources().pipe(
        tap(resources => patchState(store, { resources, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    loadResource: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(id => api.getResource(id).pipe(
        tap(r => patchState(store, { selectedResource: r, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    loadLoans: rxMethod<string | undefined>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(studentId => api.getLoans(studentId).pipe(
        tap(loans => patchState(store, { loans, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    loadStats: rxMethod<void>(pipe(
      switchMap(() => api.getStats().pipe(
        tap(stats => patchState(store, { stats })),
        catchError(() => EMPTY)
      ))
    )),

    loadStudents: rxMethod<void>(pipe(
      switchMap(() => api.getStudents().pipe(
        tap(students => patchState(store, { students })),
        catchError(() => EMPTY)
      ))
    )),

    loadLoan: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(id => api.getLoan(id).pipe(
        tap(loan => patchState(store, { selectedLoan: loan, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    loadReservations: rxMethod<string | undefined>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(studentId => api.getReservations(studentId).pipe(
        tap(reservations => patchState(store, { reservations, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),

    borrowResource: rxMethod<{ ressourcePublicId: string; studentPublicId: string; studentNom: string; dureeJours?: number }>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(({ ressourcePublicId, studentPublicId, studentNom, dureeJours }) =>
        api.borrowResource(ressourcePublicId, studentPublicId, studentNom, dureeJours).pipe(
          tap(loan => patchState(store, s => ({
            saving: false,
            loans: [loan, ...s.loans],
            resources: s.resources.map(r =>
              r.publicId === ressourcePublicId
                ? { ...r, nbDisponibles: r.nbDisponibles - 1, statut: r.nbDisponibles - 1 === 0 ? 'EMPRUNTE' as const : r.statut }
                : r
            ),
          }))),
          catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
        )
      )
    )),

    returnResource: rxMethod<string>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(loanId => api.returnResource(loanId).pipe(
        tap(updated => patchState(store, s => ({
          saving: false,
          loans: s.loans.map(l => l.publicId === updated.publicId ? updated : l),
          resources: s.resources.map(r =>
            r.publicId === updated.ressourcePublicId
              ? { ...r, nbDisponibles: r.nbDisponibles + 1, statut: 'DISPONIBLE' as const }
              : r
          ),
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    renewLoan: rxMethod<string>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(loanId => api.renewLoan(loanId).pipe(
        tap(updated => patchState(store, s => ({
          saving: false,
          loans: s.loans.map(l => l.publicId === updated.publicId ? updated : l),
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── Réservations ──────────────────────────────────────────────────────────
    reserveResource: rxMethod<{ ressourcePublicId: string; studentPublicId: string; studentNom: string }>(pipe(
      tap(() => patchState(store, { saving: true, lastReservation: null })),
      switchMap(({ ressourcePublicId, studentPublicId, studentNom }) =>
        api.reserveResource(ressourcePublicId, studentPublicId, studentNom).pipe(
          tap(resa => patchState(store, s => ({
            saving: false,
            lastReservation: resa,
            reservations: [resa, ...s.reservations],
            resources: s.resources.map(r =>
              r.publicId === ressourcePublicId && r.statut === 'DISPONIBLE'
                ? { ...r, statut: 'RESERVE' as const }
                : r
            ),
          }))),
          catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
        )
      )
    )),

    cancelReservation: rxMethod<string>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(id => api.cancelReservation(id).pipe(
        tap(updated => patchState(store, s => ({
          saving: false,
          reservations: s.reservations.map(r => r.publicId === updated.publicId ? updated : r),
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── CRUD ressource ────────────────────────────────────────────────────────
    createResource: rxMethod<Partial<ILibraryResource>>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(payload => api.createResource(payload).pipe(
        tap(created => patchState(store, s => ({
          saving: false,
          resources: [created, ...s.resources],
          selectedResource: created,
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    updateResource: rxMethod<{ publicId: string; payload: Partial<ILibraryResource> }>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(({ publicId, payload }) => api.updateResource(publicId, payload).pipe(
        tap(updated => patchState(store, s => ({
          saving: false,
          resources: s.resources.map(r => r.publicId === updated.publicId ? updated : r),
          selectedResource: updated,
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    setFilterCategorie: (id: string)    => patchState(store, { filterCategorie: id }),
    setFilterType:      (t: string)     => patchState(store, { filterType: t }),
    setFilterNiveau:    (n: string)     => patchState(store, { filterNiveau: n }),
    setFilterStatut:    (s: string)     => patchState(store, { filterStatut: s }),
    setSearchQuery:     (q: string)     => patchState(store, { searchQuery: q }),
    setSelectedResource:(r: ILibraryResource | null) => patchState(store, { selectedResource: r }),
    clearFilters: () => patchState(store, { filterCategorie: '', filterType: '', filterNiveau: '', filterStatut: '', searchQuery: '' }),
    clearLastReservation: () => patchState(store, { lastReservation: null }),
    clearError:   () => patchState(store, { error: null }),
  }))
);
