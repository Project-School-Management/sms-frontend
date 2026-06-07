import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { IStudent } from '@sms/shared/models';
import { StudentsApiService } from './students-api.service';

interface StudentsState {
  students: IStudent[]; selectedStudent: IStudent | null;
  loading: boolean; saving: boolean; error: string | null;
  totalCount: number; currentPage: number; searchQuery: string; statutFilter: string;
}

export const StudentsStore = signalStore(
  { providedIn: 'root' },
  withState<StudentsState>({
    students: [], selectedStudent: null, loading: false, saving: false,
    error: null, totalCount: 0, currentPage: 0, searchQuery: '', statutFilter: '',
  }),
  withComputed(({ students, statutFilter, searchQuery }) => ({
    filteredStudents: computed(() => {
      let list = students();
      if (statutFilter()) list = list.filter(s => s.statut === statutFilter());
      if (searchQuery()) {
        const q = searchQuery().toLowerCase();
        list = list.filter(s => s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.matricule.toLowerCase().includes(q));
      }
      return list;
    }),
    actifsCount:   computed(() => students().filter(s => s.statut === 'ACTIF').length),
    inactifsCount: computed(() => students().filter(s => s.statut === 'INACTIF').length),
  })),
  withMethods((store, api = inject(StudentsApiService)) => ({
    loadStudents: rxMethod<{ page?: number }>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(({ page = 0 }) => api.getStudents(page).pipe(
        tap(students => patchState(store, { students, totalCount: api.getTotalCount(), currentPage: page, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadStudent: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(id => api.getStudent(id).pipe(
        tap(student => patchState(store, { selectedStudent: student, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    createStudent: rxMethod<Partial<IStudent>>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(req => api.createStudent(req).pipe(
        tap(student => patchState(store, s => ({ students: [...s.students, student], saving: false }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),
    setSearchQuery:  (q: string) => patchState(store, { searchQuery: q }),
    setStatutFilter: (f: string) => patchState(store, { statutFilter: f }),
    selectStudent:   (s: IStudent | null) => patchState(store, { selectedStudent: s }),
    clearError:      () => patchState(store, { error: null }),
  }))
);
