import { ChangeDetectionStrategy, Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ScheduleStore } from '@sms/schedule/data-access';

const JOURS_LABELS: Record<string, string> = {
  LUNDI: 'Lundi', MARDI: 'Mardi', MERCREDI: 'Mercredi',
  JEUDI: 'Jeudi', VENDREDI: 'Vendredi', SAMEDI: 'Samedi',
};

@Component({
  selector: 'sms-seances-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
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

  <!-- Filtres -->
  <div class="sms-card p-4 mb-4">
    <div class="flex flex-wrap gap-3 items-end">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Jour</label>
        <select [(ngModel)]="jourFilter"
                class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option value="">Tous les jours</option>
          @for (j of jours; track j) { <option [value]="j">{{ joursLabels[j] }}</option> }
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Statut</label>
        <select [(ngModel)]="statutFilter"
                class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option value="">Tous les statuts</option>
          <option value="PLANIFIEE">Planifiée</option>
          <option value="EFFECTUEE">Effectuée</option>
          <option value="ANNULEE">Annulée</option>
          <option value="REPORTEE">Reportée</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Enseignant</label>
        <select [(ngModel)]="enseignantFilter"
                class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option value="">Tous les enseignants</option>
          @for (e of enseignants(); track e) { <option [value]="e">{{ e }}</option> }
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Salle</label>
        <select [(ngModel)]="salleFilter"
                class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option value="">Toutes les salles</option>
          @for (s of salles(); track s) { <option [value]="s">{{ s }}</option> }
        </select>
      </div>
      @if (hasFilters()) {
        <button (click)="clearFilters()"
                class="flex items-center gap-1 px-3 py-2 rounded-lg text-sm hover:opacity-80"
                style="border: 1px solid var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
          <mat-icon style="font-size: 14px; height: 14px; width: 14px">close</mat-icon>
          Réinitialiser
        </button>
      }
    </div>
    <!-- Chips filtres actifs -->
    @if (hasFilters()) {
      <div class="flex flex-wrap gap-2 mt-3">
        @if (jourFilter) {
          <span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style="background: var(--accent-light); color: var(--accent)">
            <mat-icon style="font-size: 12px; height: 12px; width: 12px">calendar_today</mat-icon>
            {{ joursLabels[jourFilter] }}
          </span>
        }
        @if (statutFilter) {
          <span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style="background: var(--accent-light); color: var(--accent)">
            <mat-icon style="font-size: 12px; height: 12px; width: 12px">info</mat-icon>
            {{ statutFilter }}
          </span>
        }
        @if (enseignantFilter) {
          <span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style="background: var(--accent-light); color: var(--accent)">
            <mat-icon style="font-size: 12px; height: 12px; width: 12px">person</mat-icon>
            {{ enseignantFilter }}
          </span>
        }
        @if (salleFilter) {
          <span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style="background: var(--accent-light); color: var(--accent)">
            <mat-icon style="font-size: 12px; height: 12px; width: 12px">room</mat-icon>
            {{ salleFilter }}
          </span>
        }
      </div>
    }
  </div>

  <!-- Table -->
  <div class="sms-card overflow-hidden">
    <div class="px-5 py-4 border-b flex items-center justify-between" style="border-color: var(--border-color)">
      <h3 class="font-semibold" style="color: var(--text-primary)">
        Liste des séances
        <span class="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style="background: var(--surface-2); color: var(--text-muted)">
          {{ filteredSeances().length }} résultat(s)
        </span>
      </h3>
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
          @for (seance of filteredSeances(); track seance.publicId) {
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
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <mat-icon style="font-size: 12px; height: 12px; width: 12px; color: #6366f1">room</mat-icon>
                  <span class="text-xs font-semibold" style="color: #6366f1; background: rgba(99,102,241,0.1); padding: 1px 5px; border-radius: 4px">
                    {{ seance.slot?.salleLibelle ?? '—' }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs font-mono" style="color: var(--text-secondary)">
                {{ seance.slot?.heureDebut ?? '' }} – {{ seance.slot?.heureFin ?? '' }}
              </td>
              <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">
                {{ seance.date | date:'dd/MM/yyyy' }}
                <span class="ml-1 text-xs" style="color: var(--text-muted)">{{ joursLabels[seance.slot?.jour ?? ''] ?? '' }}</span>
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
          } @empty {
            <tr>
              <td colspan="7">
                <div class="flex flex-col items-center justify-center py-12 gap-3">
                  <mat-icon style="font-size: 40px; height: 40px; width: 40px; color: var(--text-muted)">event_busy</mat-icon>
                  <p style="color: var(--text-secondary)">Aucune séance trouvée</p>
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

  readonly jours       = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
  readonly joursLabels = JOURS_LABELS;

  jourFilter       = '';
  statutFilter     = '';
  enseignantFilter = '';
  salleFilter      = '';

  readonly effectueesCount = computed(() => this.store.seances().filter(s => s.statut === 'EFFECTUEE').length);
  readonly planifieesCount = computed(() => this.store.seances().filter(s => s.statut === 'PLANIFIEE').length);

  readonly seancesEnriched = computed(() =>
    this.store.seances().map(seance => ({
      ...seance,
      slot: this.store.timeSlots().find(ts => ts.publicId === seance.timeSlotPublicId),
    }))
  );

  readonly enseignants = computed(() =>
    [...new Set(this.seancesEnriched()
      .map(s => s.slot?.enseignantNom)
      .filter((n): n is string => !!n)
    )]
  );

  readonly salles = computed(() =>
    [...new Set(this.seancesEnriched()
      .map(s => s.slot?.salleLibelle)
      .filter((n): n is string => !!n)
    )]
  );

  filteredSeances = computed(() => {
    let list = this.seancesEnriched();
    if (this.jourFilter)       list = list.filter(s => s.slot?.jour === this.jourFilter);
    if (this.statutFilter)     list = list.filter(s => s.statut === this.statutFilter);
    if (this.enseignantFilter) list = list.filter(s => s.slot?.enseignantNom === this.enseignantFilter);
    if (this.salleFilter)      list = list.filter(s => s.slot?.salleLibelle === this.salleFilter);
    return list;
  });

  hasFilters() { return !!(this.jourFilter || this.statutFilter || this.enseignantFilter || this.salleFilter); }

  clearFilters() {
    this.jourFilter = '';
    this.statutFilter = '';
    this.enseignantFilter = '';
    this.salleFilter = '';
  }

  ngOnInit() {
    this.store.loadSeances();
    this.store.loadTimeSlots({});
  }

  statutStyle(statut: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      PLANIFIEE: { background: '#dbeafe', color: '#2563eb' },
      EFFECTUEE: { background: '#dcfce7', color: '#16a34a' },
      ANNULEE:   { background: '#fee2e2', color: '#dc2626' },
      REPORTEE:  { background: '#fef3c7', color: '#d97706' },
    };
    return map[statut] ?? { background: '#f3f4f6', color: '#6b7280' };
  }
}
