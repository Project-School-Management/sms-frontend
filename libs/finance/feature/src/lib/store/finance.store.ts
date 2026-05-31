import { computed, inject }                    from '@angular/core';
import { signalStore, withState, withComputed,
         withMethods, patchState }             from '@ngrx/signals';
import { rxMethod }                            from '@ngrx/signals/rxjs-interop';
import { tapResponse }                         from '@ngrx/operators';
import { pipe, switchMap, tap, EMPTY, catchError } from 'rxjs';

import {
  IFacture, IPaiement, IBourse, IFraisScolarite,
  IInitierPaiementRequest, StatutFacture
} from '@sms/shared/models';
import { FinanceApiService } from '../data-access/finance-api.service';

// ── State ─────────────────────────────────────────────────────────────────────
interface FinanceState {
  factures:         IFacture[];
  selectedFacture:  IFacture | null;
  paiements:        IPaiement[];
  bourses:          IBourse[];
  frais:            IFraisScolarite[];
  loading:          boolean;
  saving:           boolean;
  error:            string | null;
  totalCount:       number;
  currentPage:      number;
}

const initialState: FinanceState = {
  factures:        [],
  selectedFacture: null,
  paiements:       [],
  bourses:         [],
  frais:           [],
  loading:         false,
  saving:          false,
  error:           null,
  totalCount:      0,
  currentPage:     0,
};

// ── Store ─────────────────────────────────────────────────────────────────────
export const FinanceStore = signalStore(
  { providedIn: 'root' },

  withState<FinanceState>(initialState),

  withComputed(({ factures, totalCount, currentPage }) => ({

    facturesEnRetard: computed(() =>
      factures().filter((f: IFacture) => f.statut === 'EN_RETARD')),

    facturesPayees: computed(() =>
      factures().filter((f: IFacture) => f.statut === 'PAYEE')),

    facturesImpayees: computed(() =>
      factures().filter((f: IFacture) =>
        (['EMISE', 'EN_RETARD', 'PARTIELLEMENT_PAYEE'] as StatutFacture[]).includes(f.statut))),

    totalImpaye: computed(() =>
      factures().reduce((sum: number, f: IFacture) => sum + (f.solde ?? 0), 0)),

    totalPercu: computed(() =>
      factures().reduce((sum: number, f: IFacture) => sum + (f.montantPaye ?? 0), 0)),

    tauxRecouvrement: computed(() => {
      const total = factures().reduce((s: number, f: IFacture) => s + f.montantTotal, 0);
      const paye  = factures().reduce((s: number, f: IFacture) => s + f.montantPaye, 0);
      return total > 0 ? Math.round((paye / total) * 100) : 0;
    }),

    hasMore: computed(() => {
      const page = currentPage();
      const count = totalCount();
      return (page + 1) * 20 < count;
    }),
  })),

  withMethods((store, api = inject(FinanceApiService)) => ({

    loadFactures: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((page) =>
          api.getFactures(page).pipe(
            tapResponse({
              next: (factures) => patchState(store, { factures, loading: false }),
              error: (err: Error) => patchState(store, {
                loading: false, error: err.message
              }),
            }),
          ),
        ),
      ),
    ),

    loadFacturesByStudent: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((studentId) =>
          api.getFacturesByStudent(studentId).pipe(
            tapResponse({
              next: (factures) => patchState(store, { factures, loading: false }),
              error: (err: Error) => patchState(store, {
                loading: false, error: err.message
              }),
            }),
          ),
        ),
      ),
    ),

    selectFacture: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((publicId) =>
          api.getFacture(publicId).pipe(
            tapResponse({
              next: (facture) => patchState(store, { selectedFacture: facture, loading: false }),
              error: (err: Error) => patchState(store, {
                loading: false, error: err.message
              }),
            }),
          ),
        ),
      ),
    ),

    initierPaiement: rxMethod<IInitierPaiementRequest>(
      pipe(
        tap(() => patchState(store, { saving: true, error: null })),
        switchMap((req) =>
          api.initierPaiement(req).pipe(
            tapResponse({
              next: (paiement) => {
                patchState(store, {
                  paiements: [...store.paiements(), paiement],
                  saving: false,
                });
              },
              error: (err: Error) => patchState(store, {
                saving: false, error: err.message
              }),
            }),
          ),
        ),
      ),
    ),

    loadBourses: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((anneeId) =>
          api.getBourses(anneeId).pipe(
            tapResponse({
              next: (bourses) => patchState(store, { bourses, loading: false }),
              error: (err: Error) => patchState(store, {
                loading: false, error: err.message
              }),
            }),
          ),
        ),
      ),
    ),

    loadFrais: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((anneeId) =>
          api.getFrais(anneeId).pipe(
            tapResponse({
              next: (frais) => patchState(store, { frais, loading: false }),
              error: (err: Error) => patchState(store, {
                loading: false, error: err.message
              }),
            }),
          ),
        ),
      ),
    ),

    clearError(): void {
      patchState(store, { error: null });
    },

    clearSelectedFacture(): void {
      patchState(store, { selectedFacture: null });
    },
  })),
);
