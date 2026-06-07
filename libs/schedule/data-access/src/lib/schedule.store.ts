import { inject, computed, signal } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { ISalle, ITimeSlot, ISeance } from '@sms/shared/models';
import { ScheduleApiService } from './schedule-api.service';

export interface IConflit {
  type: 'ENSEIGNANT' | 'SALLE';
  description: string;
  slot1PublicId: string;
  slot2PublicId: string;
  jour: string;
  heure: string;
}

interface ScheduleState {
  salles:            ISalle[];
  timeSlots:         ITimeSlot[];
  seances:           ISeance[];
  loading:           boolean;
  error:             string | null;
  jourFilter:        string;
  selectedClasseId:  string;
  selectedView:      'semaine' | 'jour' | 'liste' | 'enseignant' | 'salle';
  selectedJour:      string;
  currentWeekOffset: number;
}

export const ScheduleStore = signalStore(
  { providedIn: 'root' },
  withState<ScheduleState>({
    salles:            [],
    timeSlots:         [],
    seances:           [],
    loading:           false,
    error:             null,
    jourFilter:        '',
    selectedClasseId:  'cls-terminale-s1',
    selectedView:      'semaine',
    selectedJour:      'LUNDI',
    currentWeekOffset: 0,
  }),
  withComputed(({ timeSlots, seances, jourFilter, selectedClasseId }) => ({
    filteredSlots: computed(() => {
      let slots = timeSlots();
      if (selectedClasseId()) slots = slots.filter(t => t.promotionPublicId === selectedClasseId());
      if (jourFilter())       slots = slots.filter(t => t.jour === jourFilter());
      return slots;
    }),
    slotsForClasse: computed(() =>
      selectedClasseId()
        ? timeSlots().filter(t => t.promotionPublicId === selectedClasseId())
        : timeSlots()
    ),
    annuleesCount:  computed(() => seances().filter(s => s.statut === 'ANNULEE').length),
    joursAvecCours: computed(() => [...new Set(timeSlots().map(t => t.jour))]),

    kpiStats: computed(() => {
      const slots = selectedClasseId()
        ? timeSlots().filter(t => t.promotionPublicId === selectedClasseId())
        : timeSlots();
      const nbCours       = slots.length;
      const heures        = slots.length; // 1 créneau = 1h
      const salles        = new Set(slots.map(s => s.sallePublicId)).size;
      const enseignants   = new Set(slots.map(s => s.enseignantPublicId)).size;
      const totalDispos   = 6 * 9; // 6 jours x 9 créneaux max
      const tauxOccupation = Math.round((nbCours / totalDispos) * 100);
      return { nbCours, heures, salles, enseignants, tauxOccupation };
    }),

    conflits: computed((): IConflit[] => {
      const slots = timeSlots();
      const result: IConflit[] = [];
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const a = slots[i];
          const b = slots[j];
          if (a.jour !== b.jour) continue;
          const overlap = a.heureDebut === b.heureDebut ||
            (a.heureDebut < b.heureFin && a.heureFin > b.heureDebut);
          if (!overlap) continue;
          if (a.enseignantPublicId === b.enseignantPublicId) {
            result.push({
              type: 'ENSEIGNANT',
              description: `${a.enseignantNom} est planifié(e) dans deux classes simultanément`,
              slot1PublicId: a.publicId,
              slot2PublicId: b.publicId,
              jour: a.jour,
              heure: a.heureDebut,
            });
          }
          if (a.sallePublicId === b.sallePublicId && a.salleLibelle !== 'Terrain') {
            result.push({
              type: 'SALLE',
              description: `Salle ${a.salleLibelle} utilisée par deux classes simultanément`,
              slot1PublicId: a.publicId,
              slot2PublicId: b.publicId,
              jour: a.jour,
              heure: a.heureDebut,
            });
          }
        }
      }
      return result;
    }),
  })),
  withMethods((store, api = inject(ScheduleApiService)) => ({
    loadTimeSlots: rxMethod<{ promotionPublicId?: string }>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(({ promotionPublicId }) => api.getTimeSlots(promotionPublicId).pipe(
        tap(timeSlots => patchState(store, { timeSlots, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadSeances: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getSeances().pipe(
        tap(seances => patchState(store, { seances, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadSalles: rxMethod<void>(pipe(
      switchMap(() => api.getSalles().pipe(tap(salles => patchState(store, { salles })), catchError(() => EMPTY)))
    )),
    setJourFilter:        (jour: string)         => patchState(store, { jourFilter: jour }),
    setSelectedClasseId:  (id: string)           => patchState(store, { selectedClasseId: id }),
    setSelectedView:      (view: ScheduleState['selectedView']) => patchState(store, { selectedView: view }),
    setSelectedJour:      (jour: string)         => patchState(store, { selectedJour: jour }),
    setCurrentWeekOffset: (offset: number)       => patchState(store, { currentWeekOffset: offset }),
    clearError:           () => patchState(store, { error: null }),
  }))
);
