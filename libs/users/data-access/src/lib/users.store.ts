import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { IUser, IAnneeAcademique } from '@sms/shared/models';
import { UsersApiService } from './users-api.service';

interface UsersState {
  users:       IUser[];
  annees:      IAnneeAcademique[];
  loading:     boolean;
  saving:      boolean;
  error:       string | null;
  roleFilter:  string;
}

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState<UsersState>({
    users: [], annees: [], loading: false, saving: false, error: null, roleFilter: '',
  }),

  withComputed(({ users, roleFilter, annees }) => ({
    filteredUsers: computed(() =>
      roleFilter() ? users().filter(u => u.authorities.includes(roleFilter() as any)) : users()
    ),
    activeCount:  computed(() => users().filter(u => u.activated).length),
    activeAnnee:  computed(() => annees().find(a => a.active) ?? null),
    anneesCloturees: computed(() =>
      annees().filter(a => !a.active && new Date(a.dateFin) < new Date())
    ),
    anneesAVenir: computed(() =>
      annees().filter(a => !a.active && new Date(a.dateDebut) > new Date())
    ),
  })),

  withMethods((store, api = inject(UsersApiService)) => ({

    // ── Users ────────────────────────────────────────────────────────────
    loadUsers: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getUsers().pipe(
        tap(users => patchState(store, { users, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    createUser: rxMethod<Partial<IUser>>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(req => api.createUser(req).pipe(
        tap(user => patchState(store, s => ({ users: [...s.users, user], saving: false }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),
    toggleActivation: rxMethod<string>(pipe(
      switchMap(id => api.toggleActivation(id).pipe(
        tap(u => patchState(store, s => ({ users: s.users.map(x => x.publicId === u.publicId ? u : x) }))),
        catchError(() => EMPTY)
      ))
    )),

    // ── Annees ───────────────────────────────────────────────────────────
    loadAnnees: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getAnnees().pipe(
        tap(annees => patchState(store, { annees, loading: false })),
        catchError(() => { patchState(store, { loading: false }); return EMPTY; })
      ))
    )),
    createAnnee: rxMethod<Partial<IAnneeAcademique>>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(req => api.createAnnee(req).pipe(
        tap(annee => patchState(store, s => ({
          annees:  [...s.annees, annee].sort((a, b) => b.libelle.localeCompare(a.libelle)),
          saving:  false,
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),
    updateAnnee: rxMethod<{ publicId: string; data: Partial<IAnneeAcademique> }>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(({ publicId, data }) => api.updateAnnee(publicId, data).pipe(
        tap(updated => patchState(store, s => ({
          annees: s.annees.map(a => a.publicId === updated.publicId ? updated : a),
          saving: false,
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),
    activerAnnee: rxMethod<string>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(publicId => api.activerAnnee(publicId).pipe(
        tap(annees => patchState(store, { annees, saving: false })),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── Misc ─────────────────────────────────────────────────────────────
    setRoleFilter: (r: string) => patchState(store, { roleFilter: r }),
    clearError:    ()          => patchState(store, { error: null }),
  }))
);
