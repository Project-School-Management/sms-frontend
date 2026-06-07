import { ChangeDetectionStrategy, Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ScheduleStore } from '@sms/schedule/data-access';

@Component({
  selector: 'sms-seances-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Séances de cours</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Historique et planning des séances</p>
        </div>
        <a routerLink="/schedule" class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--accent)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
          Emploi du temps
        </a>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
            <mat-icon style="color: var(--accent)">event</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.seances().length }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Total séances</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
            <mat-icon style="color: #16a34a">check_circle</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ effectueesCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Effectuées</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(37,99,235,0.1)">
            <mat-icon style="color: #2563eb">schedule</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ planifieesCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Planifiées</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(239,68,68,0.1)">
            <mat-icon style="color: #dc2626">cancel</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.annuleesCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Annulées</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 border-b flex items-center justify-between" style="border-color: var(--border-color)">
          <h3 class="font-semibold" style="color: var(--text-primary)">Liste des séances</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style="background: var(--surface-2)">
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Matière</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Classe</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Enseignant</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Salle</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Horaire</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Date</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Statut</th>
              </tr>
            </thead>
            <tbody>
              @for (seance of seancesEnriched(); track seance.publicId) {
                <tr class="border-t hover:opacity-80 transition-opacity" style="border-color: var(--border-color)">
                  <td class="px-4 py-3 font-medium" style="color: var(--text-primary)">
                    {{ seance.slot?.matiereLibelle ?? '—' }}
                  </td>
                  <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">
                    {{ seance.slot?.promotionLibelle ?? '—' }}
                  </td>
                  <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">
                    {{ seance.slot?.enseignantNom ?? '—' }}
                  </td>
                  <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">
                    {{ seance.slot?.salleLibelle ?? '—' }}
                  </td>
                  <td class="px-4 py-3 text-xs font-mono" style="color: var(--text-secondary)">
                    {{ seance.slot?.heureDebut ?? '' }} – {{ seance.slot?.heureFin ?? '' }}
                  </td>
                  <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">
                    {{ seance.date | date:'dd/MM/yyyy' }}
                    <span class="ml-1 text-xs" style="color: var(--text-muted)">{{ seance.slot?.jour }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div>
                      <span class="px-2 py-0.5 rounded-full text-xs font-semibold" [ngStyle]="statutStyle(seance.statut)">
                        {{ seance.statut }}
                      </span>
                      @if (seance.motifAnnulation) {
                        <p class="text-xs mt-0.5" style="color: var(--text-muted)">{{ seance.motifAnnulation }}</p>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class SeancesListComponent implements OnInit {
  readonly store = inject(ScheduleStore);

  readonly effectueesCount  = computed(() => this.store.seances().filter(s => s.statut === 'EFFECTUEE').length);
  readonly planifieesCount  = computed(() => this.store.seances().filter(s => s.statut === 'PLANIFIEE').length);

  readonly seancesEnriched = computed(() =>
    this.store.seances().map(seance => ({
      ...seance,
      slot: this.store.timeSlots().find(ts => ts.publicId === seance.timeSlotPublicId),
    }))
  );

  ngOnInit() {
    this.store.loadSeances();
    this.store.loadTimeSlots({});
  }

  statutStyle(statut: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      PLANIFIEE:  { background: '#dbeafe', color: '#2563eb' },
      EFFECTUEE:  { background: '#dcfce7', color: '#16a34a' },
      ANNULEE:    { background: '#fee2e2', color: '#dc2626' },
      REPORTEE:   { background: '#fef3c7', color: '#d97706' },
    };
    return map[statut] ?? { background: '#f3f4f6', color: '#6b7280' };
  }
}
