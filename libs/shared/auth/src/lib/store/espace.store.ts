import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { IEspaceAffectation, ICurrentUser } from '@sms/shared/models';
import { EspaceApiService } from '../services/espace-api.service';

const ESPACE_STORAGE_KEY = 'sms-espace-courant';

interface EspaceState {
  espaces:          IEspaceAffectation[];
  currentEspaceId:  string | null;
  loading:          boolean;
  /** Vrai une fois {@link loadEspaces} résolu — évite un flash du switcher avant chargement. */
  loaded:           boolean;
}

/**
 * Store de l'espace pédagogique courant (docs/architecture/tenancy-model.md §6).
 *
 * Distinct de `AuthStore` (axe Tenant) : ce store porte l'axe Espace — la liste
 * des affectations de l'utilisateur et son choix courant, persisté en session
 * (localStorage) pour survivre à un rafraîchissement de page.
 */
export const EspaceStore = signalStore(
  { providedIn: 'root' },
  withState<EspaceState>({
    espaces: [], currentEspaceId: null, loading: false, loaded: false,
  }),

  withComputed(({ espaces, currentEspaceId, loaded }) => ({
    currentEspace: computed<IEspaceAffectation | null>(() =>
      espaces().find(e => e.workspaceId === currentEspaceId()) ?? null
    ),
    /** Plusieurs affectations et aucune encore choisie → le switcher doit s'afficher. */
    needsSelection: computed(() =>
      loaded() && espaces().length > 1 && !currentEspaceId()
    ),
    hasMultipleEspaces: computed(() => espaces().length > 1),
  })),

  withMethods((store, api = inject(EspaceApiService)) => ({

    /**
     * Charge les affectations de l'utilisateur courant et restaure, si possible,
     * le dernier espace choisi (localStorage) — sinon auto-sélectionne s'il n'y
     * en a qu'un seul.
     */
    async loadEspaces(user: ICurrentUser): Promise<void> {
      patchState(store, { loading: true });
      const espaces = await new Promise<IEspaceAffectation[]>(resolve => {
        api.getEspaces(user).subscribe(resolve);
      });

      const saved = readSavedEspaceId();
      const savedStillValid = saved && espaces.some(e => e.workspaceId === saved);
      const autoSelected = espaces.length === 1 ? espaces[0].workspaceId : null;

      patchState(store, {
        espaces,
        currentEspaceId: savedStillValid ? saved : autoSelected,
        loading: false,
        loaded: true,
      });
    },

    /** Sélectionne un espace (depuis le switcher, ou le menu « Changer d'espace »). */
    selectEspace(workspaceId: string): void {
      patchState(store, { currentEspaceId: workspaceId });
      saveEspaceId(workspaceId);
    },

    /** Réinitialise le choix — force le retour au switcher (ex. lors d'un logout). */
    clear(): void {
      patchState(store, { espaces: [], currentEspaceId: null, loading: false, loaded: false });
      clearSavedEspaceId();
    },
  }))
);

// ── localStorage helpers ──────────────────────────────────────────────────────
function readSavedEspaceId(): string | null {
  try { return localStorage.getItem(ESPACE_STORAGE_KEY); } catch { return null; }
}
function saveEspaceId(id: string): void {
  try { localStorage.setItem(ESPACE_STORAGE_KEY, id); } catch { /* storage unavailable */ }
}
function clearSavedEspaceId(): void {
  try { localStorage.removeItem(ESPACE_STORAGE_KEY); } catch { /* storage unavailable */ }
}
