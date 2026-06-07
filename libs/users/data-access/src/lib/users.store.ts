import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { IUser, IAnneeAcademique } from '@sms/shared/models';
import { UsersApiService } from './users-api.service';

interface UsersState {
  users: IUser[]; annees: IAnneeAcademique[];
  loading: boolean; error: string | null; roleFilter: string;
}

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState<UsersState>({ users: [], annees: [], loading: false, error: null, roleFilter: '' }),
  withComputed(({ users, roleFilter }) => ({
    filteredUsers: computed(() => roleFilter() ? users().filter(u => u.authorities.includes(roleFilter() as any)) : users()),
    activeCount:   computed(() => users().filter(u => u.activated).length),
  })),
  withMethods((store, api = inject(UsersApiService)) => ({
    loadUsers: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getUsers().pipe(
        tap(users => patchState(store, { users, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadAnnees: rxMethod<void>(pipe(
      switchMap(() => api.getAnnees().pipe(tap(annees => patchState(store, { annees })), catchError(() => EMPTY)))
    )),
    setRoleFilter: (r: string) => patchState(store, { roleFilter: r }),
    clearError:    () => patchState(store, { error: null }),
  }))
);
