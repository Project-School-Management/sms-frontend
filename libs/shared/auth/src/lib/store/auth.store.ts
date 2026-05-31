import { computed }                                from '@angular/core';
import { inject }                                  from '@angular/core';
import { signalStore, withState, withComputed,
         withMethods, patchState }                 from '@ngrx/signals';
import { rxMethod }                                from '@ngrx/signals/rxjs-interop';
import { tapResponse }                             from '@ngrx/operators';
import { pipe, switchMap, tap }                    from 'rxjs';

import { ICurrentUser }          from '@sms/shared/models';
import { Role, ROLES_REQUIRING_2FA } from '@sms/shared/models';
import { UserApiService }        from '../../services/user-api.service';

// ── State interface ───────────────────────────────────────────────────────────
interface AuthState {
  currentUser:     ICurrentUser | null;
  twoFaVerified:   boolean;
  loading:         boolean;
}

const initialState: AuthState = {
  currentUser:   null,
  twoFaVerified: false,
  loading:       false,
};

// ── Signal Store ──────────────────────────────────────────────────────────────
export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState<AuthState>(initialState),

  withComputed(({ currentUser, twoFaVerified }) => ({
    isAuthenticated: computed(() => currentUser() !== null),

    userRole: computed(() => currentUser()?.role ?? null),

    etablissementId: computed(() => currentUser()?.etablissementId ?? null),

    anneeAcademiqueId: computed(() => currentUser()?.anneeAcademiqueId ?? null),

    smsUserId: computed(() => currentUser()?.smsUserId ?? null),

    requires2Fa: computed(() => {
      const role = currentUser()?.role;
      return role ? ROLES_REQUIRING_2FA.includes(role) : false;
    }),

    /** true si l'utilisateur n'a pas besoin de 2FA OU si elle est vérifiée */
    is2FaCleared: computed(() => {
      const role     = currentUser()?.role;
      const needsIt  = role ? ROLES_REQUIRING_2FA.includes(role) : false;
      return !needsIt || twoFaVerified();
    }),
  })),

  withMethods((store, userApi = inject(UserApiService)) => ({

    /** Charge le profil utilisateur depuis user-service/api/v1/users/me */
    loadCurrentUser: rxMethod<void>(
      pipe(
        tap(()  => patchState(store, { loading: true })),
        switchMap(() =>
          userApi.getMyAccount().pipe(
            tapResponse({
              next:  (user) => patchState(store, { currentUser: user, loading: false }),
              error: ()     => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    setCurrentUser(user: ICurrentUser): void {
      patchState(store, { currentUser: user });
    },

    clearCurrentUser(): void {
      patchState(store, { currentUser: null, twoFaVerified: false });
    },

    setTwoFaVerified(verified: boolean): void {
      patchState(store, { twoFaVerified: verified });
    },
  })),
);
