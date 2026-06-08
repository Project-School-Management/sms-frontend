import { computed, inject }          from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod }                  from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { IFacture, IPaiement, IBourse, IFraisScolarite, IInitierPaiementRequest, StatutFacture } from '@sms/shared/models';
import { FinanceApiService }         from './finance-api.service';
import { ToastService }              from '@sms/shared/ui';

interface FinanceState {
  factures: IFacture[]; selectedFacture: IFacture | null;
  paiements: IPaiement[]; bourses: IBourse[]; frais: IFraisScolarite[];
  loading: boolean; saving: boolean; error: string | null; totalCount: number; currentPage: number;
}

export const FinanceStore = signalStore(
  { providedIn: 'root' },
  withState<FinanceState>({
    factures: [], selectedFacture: null, paiements: [], bourses: [], frais: [],
    loading: false, saving: false, error: null, totalCount: 0, currentPage: 0,
  }),
  withComputed(({ factures, totalCount, currentPage }) => ({
    facturesEnRetard:  computed(() => factures().filter((f: IFacture) => f.statut === 'EN_RETARD')),
    facturesPayees:    computed(() => factures().filter((f: IFacture) => f.statut === 'PAYEE')),
    facturesImpayees:  computed(() => factures().filter((f: IFacture) => (['EMISE', 'EN_RETARD', 'PARTIELLEMENT_PAYEE'] as StatutFacture[]).includes(f.statut))),
    totalImpaye:       computed(() => factures().reduce((s: number, f: IFacture) => s + (f.solde ?? 0), 0)),
    totalPercu:        computed(() => factures().reduce((s: number, f: IFacture) => s + (f.montantPaye ?? 0), 0)),
    tauxRecouvrement:  computed(() => {
      const total = factures().reduce((s: number, f: IFacture) => s + f.montantTotal, 0);
      const paye  = factures().reduce((s: number, f: IFacture) => s + f.montantPaye, 0);
      return total > 0 ? Math.round((paye / total) * 100) : 0;
    }),
    hasMore: computed(() => (currentPage() + 1) * 20 < totalCount()),
  })),
  withMethods((store, api = inject(FinanceApiService), toast = inject(ToastService)) => ({
    loadFactures: rxMethod<number>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(page => api.getFactures(page).pipe(
        tap(factures => patchState(store, { factures, loading: false, totalCount: api.getTotalCount() })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadFacturesByStudent: rxMethod<number>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(studentId => api.getFacturesByStudent(studentId).pipe(
        tap(factures => patchState(store, { factures, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    selectFacture: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(publicId => api.getFacture(publicId).pipe(
        tap(facture => patchState(store, { selectedFacture: facture, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    initierPaiement: rxMethod<IInitierPaiementRequest>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(req => api.initierPaiement(req).pipe(
        tap(p => {
          patchState(store, s => ({
            paiements: [...s.paiements, p],
            saving: false,
            factures: s.factures.map(f => f.publicId === req.facturePublicId
              ? { ...f, montantPaye: (f.montantPaye ?? 0) + req.montant,
                  solde: Math.max(0, (f.solde ?? f.montantTotal) - req.montant),
                  statut: ((f.solde ?? f.montantTotal) - req.montant <= 0 ? 'PAYEE' : 'PARTIELLEMENT_PAYEE') as IFacture['statut'] }
              : f),
          }));
          toast.success(`Paiement de ${new Intl.NumberFormat('fr-FR').format(req.montant)} XOF initié via ${req.operateur}.`);
        }),
        catchError((e: Error) => {
          patchState(store, { saving: false, error: e.message });
          toast.error(`Erreur lors du paiement : ${e.message}`);
          return EMPTY;
        })
      ))
    )),
    loadBourses: rxMethod<number>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(anneeId => api.getBourses(anneeId).pipe(
        tap(bourses => patchState(store, { bourses, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadFrais: rxMethod<number>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(anneeId => api.getFrais(anneeId).pipe(
        tap(frais => patchState(store, { frais, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    clearError:            () => patchState(store, { error: null }),
    clearSelectedFacture:  () => patchState(store, { selectedFacture: null }),
  }))
);
