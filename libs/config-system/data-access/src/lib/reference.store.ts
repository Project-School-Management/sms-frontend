import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import {
  IEtablissement, ICycle, INiveau, IFiliere, ISpecialite,
  IDepartementRef, IFaculteRef, IClasseRef, IMatiereRef,
  IAnneeAcademiqueRef, IPeriodeRef, IBatimentRef, ISalleRef,
  ITypeFraisRef, ITypeBourseRef, IGradeRef, ITypeDocumentRef,
  ITypeEvaluationRef, IEspaceConfig, EspaceWorkspaceType,
} from './reference.types';
import { ReferenceApiService } from './reference-api.service';
import { MOCK_ANNEES } from './reference-data.mock';

// ── State ─────────────────────────────────────────────────────────────────────
interface ReferenceState {
  etablissement:   IEtablissement | null;
  espaces:         IEspaceConfig[];
  cycles:          ICycle[];
  niveaux:         INiveau[];
  filieres:        IFiliere[];
  facultes:        IFaculteRef[];
  departements:    IDepartementRef[];
  specialites:     ISpecialite[];
  classes:         IClasseRef[];
  matieres:        IMatiereRef[];
  annees:          IAnneeAcademiqueRef[];
  periodes:        IPeriodeRef[];
  batiments:       IBatimentRef[];
  salles:          ISalleRef[];
  typesFrais:      ITypeFraisRef[];
  typesBourses:    ITypeBourseRef[];
  grades:          IGradeRef[];
  typesDocuments:  ITypeDocumentRef[];
  typesEvaluation: ITypeEvaluationRef[];
  loaded:          boolean;
  loading:         boolean;
  saving:          boolean;
  error:           string | null;
}

const initialState: ReferenceState = {
  etablissement: null, espaces: [], cycles: [], niveaux: [], filieres: [],
  facultes: [], departements: [], specialites: [], classes: [],
  matieres: [], annees: [], periodes: [], batiments: [], salles: [],
  typesFrais: [], typesBourses: [], grades: [], typesDocuments: [],
  typesEvaluation: [], loaded: false, loading: false, saving: false, error: null,
};

// ── Store ─────────────────────────────────────────────────────────────────────
export const ReferenceStore = signalStore(
  { providedIn: 'root' },
  withState<ReferenceState>(initialState),

  withComputed(({
    classes, niveaux, cycles, matieres, salles,
    typesFrais, annees, batiments, espaces,
  }) => ({
    // ── Espaces (docs/architecture/tenancy-model.md §2-3) ───────────────────
    espacesActifs:      computed(() => espaces().filter(e => e.active)),
    /** Types d'espace pas encore déclarés pour ce tenant — pour le formulaire d'ajout. */
    workspaceTypesDisponibles: computed((): EspaceWorkspaceType[] => {
      const tous: EspaceWorkspaceType[] = ['FUNDAMENTAL', 'COLLEGE', 'LYCEUM', 'UNIVERSITY'];
      const declares = new Set(espaces().map(e => e.workspaceType));
      return tous.filter(t => !declares.has(t));
    }),
    // ── Classes par cycle ────────────────────────────────────────────────────
    classesByLycee:  computed(() => classes().filter(c => c.cyclePublicId === 'cyc-003')),
    classesByUniv:   computed(() => classes().filter(c => c.cyclePublicId === 'cyc-004')),
    classesByCollege:computed(() => classes().filter(c => c.cyclePublicId === 'cyc-002')),

    // ── Classe active (année en cours) ───────────────────────────────────────
    classesActives:  computed(() => {
      const anneeActive = annees().find(a => a.active);
      return anneeActive
        ? classes().filter(c => c.anneeAcademiquePublicId === anneeActive.publicId)
        : classes();
    }),

    // ── Niveaux par cycle ────────────────────────────────────────────────────
    niveauxLycee:   computed(() => niveaux().filter(n => n.cyclePublicId === 'cyc-003')),
    niveauxUniv:    computed(() => niveaux().filter(n => n.cyclePublicId === 'cyc-004')),
    niveauxCollege: computed(() => niveaux().filter(n => n.cyclePublicId === 'cyc-002')),

    // ── Année active ─────────────────────────────────────────────────────────
    anneeActive:    computed(() => annees().find(a => a.active) ?? null),
    anneeActiveLib: computed(() => annees().find(a => a.active)?.libelle ?? '—'),

    // ── Salles par type ──────────────────────────────────────────────────────
    sallesAmphi:    computed(() => salles().filter(s => s.type === 'AMPHI')),
    sallesLabo:     computed(() => salles().filter(s => s.type === 'LABO')),
    sallesTP:       computed(() => salles().filter(s => s.type === 'INFORMATIQUE')),
    sallesTD:       computed(() => salles().filter(s => s.type === 'TD')),

    // ── KPI stats (source unique pour les dashboards) ─────────────────────────
    totalClasses:   computed(() => classes().length),
    totalEffectif:  computed(() => classes().reduce((s, c) => s + (c.effectif ?? 0), 0)),
    totalCapacite:  computed(() => classes().reduce((s, c) => s + (c.capacite ?? 0), 0)),
    tauxRemplissage:computed(() => {
      const cap = classes().reduce((s, c) => s + (c.capacite ?? 0), 0);
      const eff = classes().reduce((s, c) => s + (c.effectif ?? 0), 0);
      return cap > 0 ? Math.round((eff / cap) * 100) : 0;
    }),

    // ── Frais par défaut (inscription fixe) ──────────────────────────────────
    fraisInscriptionMontant: computed(() =>
      typesFrais().find(f => f.categorie === 'INSCRIPTION')?.montant ?? 50_000
    ),

    // ── Helper : options select pour les classes ──────────────────────────────
    classesOptions: computed(() =>
      classes().map(c => ({
        id:       c.publicId,
        libelle:  c.libelle,
        niveau:   c.niveauLibelle,
        filiere:  c.filiereLibelle ?? '',
        capacite: c.capacite,
        cycleId:  c.cyclePublicId,
      }))
    ),

    // ── Helper : CLASSES_MAP de rétro-compat ─────────────────────────────────
    classesMap: computed(() =>
      Object.fromEntries(
        classes().map(c => [c.publicId, { libelle: c.libelle, niveau: c.niveauLibelle, filiere: c.filiereLibelle ?? '' }])
      ) as Record<string, { libelle: string; niveau: string; filiere: string }>
    ),
  })),

  withMethods((store, api = inject(ReferenceApiService)) => ({

    // ── Chargement complet (bootstrap app) ───────────────────────────────────
    loadAll: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() => api.getConfigSnapshot().pipe(
        tap(snap => patchState(store, {
          etablissement:   snap.etablissement,
          cycles:          snap.cycles,
          niveaux:         snap.niveaux,
          filieres:        snap.filieres,
          facultes:        snap.facultes,
          departements:    snap.departements,
          specialites:     snap.specialites,
          classes:         snap.classes,
          matieres:        snap.matieres,
          annees:          snap.annees,
          periodes:        snap.periodes,
          batiments:       snap.batiments,
          salles:          snap.salles,
          typesFrais:      snap.typesFrais,
          typesBourses:    snap.typesBourses,
          grades:          snap.grades,
          typesDocuments:  snap.typesDocuments,
          typesEvaluation: snap.typesEvaluation,
          loaded:          true,
          loading:         false,
        })),
        catchError((e: Error) => {
          patchState(store, { loading: false, error: e.message });
          return EMPTY;
        })
      ))
    )),

    // ── Chargements ciblés ────────────────────────────────────────────────────
    loadClasses:     rxMethod<{ cycleId?: string; niveauId?: string }>(pipe(
      switchMap(p => api.getClasses(p).pipe(
        tap(classes => patchState(store, { classes })),
        catchError(() => EMPTY)
      ))
    )),
    loadSalles:      rxMethod<void>(pipe(
      switchMap(() => api.getSalles().pipe(
        tap(salles => patchState(store, { salles })),
        catchError(() => EMPTY)
      ))
    )),
    loadMatieres:    rxMethod<string | undefined>(pipe(
      switchMap(id => api.getMatieres(id).pipe(
        tap(matieres => patchState(store, { matieres })),
        catchError(() => EMPTY)
      ))
    )),
    loadTypesFrais:  rxMethod<void>(pipe(
      switchMap(() => api.getTypesFrais().pipe(
        tap(typesFrais => patchState(store, { typesFrais })),
        catchError(() => EMPTY)
      ))
    )),
    loadTypesDocuments: rxMethod<void>(pipe(
      switchMap(() => api.getTypesDocuments().pipe(
        tap(typesDocuments => patchState(store, { typesDocuments })),
        catchError(() => EMPTY)
      ))
    )),

    // ── Queries utilitaires ───────────────────────────────────────────────────
    getClasseById(publicId: string) {
      return store.classes().find(c => c.publicId === publicId) ?? null;
    },
    getNiveauById(publicId: string) {
      return store.niveaux().find(n => n.publicId === publicId) ?? null;
    },
    getMatieresByNiveau(niveauPublicId: string) {
      return store.matieres().filter(m => m.niveauxPublicIds.includes(niveauPublicId));
    },
    getSallesByCapacite(minCap: number) {
      return store.salles().filter(s => s.capacite >= minCap);
    },
    getFraisScolariteByNiveau(niveauPublicId: string): number {
      return store.typesFrais().find(
        f => f.categorie === 'SCOLARITE' && f.niveauPublicId === niveauPublicId
      )?.montant ?? 650_000;
    },
    getFraisScolariteByNiveauLibelle(niveauLibelle: string): number {
      return store.typesFrais().find(f =>
        f.categorie === 'SCOLARITE' &&
        store.niveaux().find(n => n.publicId === f.niveauPublicId)?.libelle === niveauLibelle
      )?.montant ?? 650_000;
    },

    // ── CRUD Classe ───────────────────────────────────────────────────────────
    saveClasse: rxMethod<Partial<IClasseRef>>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(data => api.upsertClasse(data).pipe(
        tap(saved => patchState(store, s => ({
          classes: s.classes.some(c => c.publicId === saved.publicId)
            ? s.classes.map(c => c.publicId === saved.publicId ? saved : c)
            : [...s.classes, saved],
          saving: false,
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── CRUD Matière ──────────────────────────────────────────────────────────
    saveMatiere: rxMethod<Partial<IMatiereRef>>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(data => api.upsertMatiere(data).pipe(
        tap(saved => patchState(store, s => ({
          matieres: s.matieres.some(m => m.publicId === saved.publicId)
            ? s.matieres.map(m => m.publicId === saved.publicId ? saved : m)
            : [...s.matieres, saved],
          saving: false,
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── CRUD Salle ────────────────────────────────────────────────────────────
    saveSalle: rxMethod<Partial<ISalleRef>>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(data => api.upsertSalle(data).pipe(
        tap(saved => patchState(store, s => ({
          salles: s.salles.some(x => x.publicId === saved.publicId)
            ? s.salles.map(x => x.publicId === saved.publicId ? saved : x)
            : [...s.salles, saved],
          saving: false,
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── CRUD Type Frais ───────────────────────────────────────────────────────
    saveTypeFrais: rxMethod<Partial<ITypeFraisRef>>(pipe(
      tap(() => patchState(store, { saving: true })),
      switchMap(data => api.upsertTypeFrais(data).pipe(
        tap(saved => patchState(store, s => ({
          typesFrais: s.typesFrais.some(f => f.publicId === saved.publicId)
            ? s.typesFrais.map(f => f.publicId === saved.publicId ? saved : f)
            : [...s.typesFrais, saved],
          saving: false,
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── Toggle actif/inactif ─────────────────────────────────────────────────
    toggleClasse: rxMethod<{ publicId: string; active: boolean }>(pipe(
      switchMap(({ publicId, active }) => api.toggleActive('classes', publicId, active).pipe(
        tap(() => patchState(store, s => ({
          classes: s.classes.map(c => c.publicId === publicId ? { ...c, active } : c),
        }))),
        catchError(() => EMPTY)
      ))
    )),

    toggleSalle: rxMethod<{ publicId: string; active: boolean }>(pipe(
      switchMap(({ publicId, active }) => api.toggleActive('salles', publicId, active).pipe(
        tap(() => patchState(store, s => ({
          salles: s.salles.map(x => x.publicId === publicId ? { ...x, active } : x),
        }))),
        catchError(() => EMPTY)
      ))
    )),

    toggleMatiere: rxMethod<{ publicId: string; active: boolean }>(pipe(
      switchMap(({ publicId, active }) => api.toggleActive('matieres', publicId, active).pipe(
        tap(() => patchState(store, s => ({
          matieres: s.matieres.map(m => m.publicId === publicId ? { ...m, active } : m),
        }))),
        catchError(() => EMPTY)
      ))
    )),

    // ── Établissement (story 3-1 — identité) ─────────────────────────────────
    saveEtablissement: rxMethod<Partial<IEtablissement>>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(data => api.updateEtablissement(data).pipe(
        tap(saved => patchState(store, { etablissement: saved, saving: false })),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    uploadLogo: rxMethod<File>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(file => api.uploadLogo(file).pipe(
        tap(({ logoUrlSignee }) => patchState(store, s => ({
          saving: false,
          etablissement: s.etablissement ? { ...s.etablissement, logoUrl: logoUrlSignee } : s.etablissement,
        }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    // ── Espaces (docs/architecture/tenancy-model.md §2-3, §5, §13.3) ────────
    loadEspaces: rxMethod<void>(pipe(
      switchMap(() => api.getEspaces().pipe(
        tap(espaces => patchState(store, { espaces })),
        catchError(() => EMPTY)
      ))
    )),

    createEspace: rxMethod<{ workspaceType: EspaceWorkspaceType; label: string }>(pipe(
      tap(() => patchState(store, { saving: true, error: null })),
      switchMap(({ workspaceType, label }) => api.createEspace(workspaceType, label).pipe(
        tap(created => patchState(store, s => ({ espaces: [...s.espaces, created], saving: false }))),
        catchError((e: Error) => { patchState(store, { saving: false, error: e.message }); return EMPTY; })
      ))
    )),

    toggleEspace: rxMethod<{ publicId: string; active: boolean }>(pipe(
      switchMap(({ publicId, active }) => api.toggleEspace(publicId, active).pipe(
        tap(() => patchState(store, s => ({
          espaces: s.espaces.map(e => e.publicId === publicId ? { ...e, active } : e),
        }))),
        catchError(() => EMPTY)
      ))
    )),

    clearError: () => patchState(store, { error: null }),
  }))
);
