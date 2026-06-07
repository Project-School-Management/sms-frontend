import { computed, inject }        from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod }                from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { ICurrentUser }            from '@sms/shared/models';
import { Role, ROLES_REQUIRING_2FA } from '@sms/shared/models';
import { UserApiService }          from '../services/user-api.service';

interface AuthState { currentUser: ICurrentUser | null; twoFaVerified: boolean; loading: boolean; }

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({ currentUser: null, twoFaVerified: false, loading: false }),
  withComputed(({ currentUser, twoFaVerified }) => ({
    isAuthenticated:   computed(() => currentUser() !== null),
    userRole:          computed(() => currentUser()?.role ?? null),
    etablissementId:   computed(() => currentUser()?.etablissementId ?? null),
    anneeAcademiqueId: computed(() => currentUser()?.anneeAcademiqueId ?? null),
    smsUserId:         computed(() => currentUser()?.smsUserId ?? null),
    requires2Fa:       computed(() => { const r = currentUser()?.role; return r ? ROLES_REQUIRING_2FA.includes(r) : false; }),
    is2FaCleared:      computed(() => { const r = currentUser()?.role; const n = r ? ROLES_REQUIRING_2FA.includes(r) : false; return !n || twoFaVerified(); }),
  })),
  withMethods((store, userApi = inject(UserApiService)) => ({
    loadCurrentUser: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => userApi.getMyAccount().pipe(
        tap(user => patchState(store, { currentUser: user, loading: false })),
        catchError(() => { patchState(store, { loading: false }); return EMPTY; })
      ))
    )),
    setCurrentUser:    (user: ICurrentUser) => patchState(store, { currentUser: user }),
    clearCurrentUser:  () => patchState(store, { currentUser: null, twoFaVerified: false }),
    setTwoFaVerified:  (v: boolean) => patchState(store, { twoFaVerified: v }),
  }))
);
