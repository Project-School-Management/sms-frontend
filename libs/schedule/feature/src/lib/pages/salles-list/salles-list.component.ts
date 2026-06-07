import { ChangeDetectionStrategy, Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ScheduleStore } from '@sms/schedule/data-access';

@Component({
  selector: 'sms-salles-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
    <div>
      <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Gestion des salles</h1>
      <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Disponibilité et taux d'occupation en temps réel</p>
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
        <mat-icon style="color: var(--accent)">meeting_room</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.salles().length }}</p>
        <p class="text-sm" style="color: var(--text-secondary)">Total salles</p>
      </div>
    </div>
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
        <mat-icon style="color: #16a34a">check_circle</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ disponiblesCount() }}</p>
        <p class="text-sm" style="color: var(--text-secondary)">Disponibles</p>
      </div>
    </div>
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(239,68,68,0.1)">
        <mat-icon style="color: #dc2626">do_not_disturb</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ occupeesCount() }}</p>
        <p class="text-sm" style="color: var(--text-secondary)">Occupées</p>
      </div>
    </div>
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(99,102,241,0.1)">
        <mat-icon style="color: #6366f1">analytics</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ moyenneTaux() }}%</p>
        <p class="text-sm" style="color: var(--text-secondary)">Taux moy. occupation</p>
      </div>
    </div>
  </div>

  <!-- Filtre type -->
  <div class="flex gap-2 mb-4 flex-wrap">
    @for (type of types; track type) {
      <button (click)="typeFilter = type"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [style.background]="typeFilter === type ? 'var(--accent)' : 'var(--surface-2)'"
              [style.color]="typeFilter === type ? '#fff' : 'var(--text-secondary)'"
              [style.border]="'1px solid ' + (typeFilter === type ? 'var(--accent)' : 'var(--border-color)')">
        {{ type === '' ? 'Tous' : type }}
      </button>
    }
  </div>

  <!-- Grid salles -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
    @for (salle of sallesFiltrees(); track salle.publicId) {
      <div class="sms-card p-5 flex flex-col gap-3">
        <!-- En-tête salle -->
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl font-bold" style="color: var(--text-primary)">{{ salle.code }}</span>
              <span class="px-2 py-0.5 rounded text-xs font-semibold" [ngStyle]="typeStyle(salle.type)">{{ salle.type }}</span>
            </div>
            <p class="text-xs" style="color: var(--text-secondary)">{{ salle.libelle }}</p>
          </div>
          <span class="shrink-0 px-2 py-1 rounded-full text-xs font-semibold"
                [style.background]="estOccupee(salle.publicId) ? '#fee2e2' : '#dcfce7'"
                [style.color]="estOccupee(salle.publicId) ? '#dc2626' : '#16a34a'">
            {{ estOccupee(salle.publicId) ? 'Occupée' : 'Disponible' }}
          </span>
        </div>

        <!-- Capacité -->
        <div class="flex items-center gap-2 text-xs" style="color: var(--text-muted)">
          <mat-icon style="font-size: 14px; height: 14px; width: 14px">people</mat-icon>
          {{ salle.capacite }} places
        </div>

        <!-- Taux d'occupation -->
        <div>
          <div class="flex items-center justify-between text-xs mb-1">
            <span style="color: var(--text-secondary)">Taux d'occupation</span>
            <span class="font-semibold" style="color: var(--text-primary)">{{ tauxOccupation(salle.publicId) }}%</span>
          </div>
          <div class="w-full rounded-full h-2" style="background: var(--surface-2)">
            <div class="h-2 rounded-full transition-all"
                 [style.width]="tauxOccupation(salle.publicId) + '%'"
                 [style.background]="tauxColor(tauxOccupation(salle.publicId))">
            </div>
          </div>
        </div>

        <!-- Cours actuel si occupée -->
        @if (estOccupee(salle.publicId)) {
          <div class="p-2 rounded-lg text-xs" style="background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15)">
            <p class="font-semibold" style="color: #dc2626">Cours en cours</p>
            <p style="color: var(--text-secondary)">{{ coursCourant(salle.publicId) }}</p>
          </div>
        }

        <!-- Prochains cours -->
        <div>
          <p class="text-xs font-medium mb-1.5" style="color: var(--text-secondary)">Prochains créneaux</p>
          <div class="flex flex-col gap-1">
            @for (c of prochainsCreneaux(salle.publicId); track c.publicId) {
              <div class="flex items-center justify-between text-xs p-1.5 rounded" style="background: var(--surface-2)">
                <span style="color: var(--text-secondary)">{{ c.jour.slice(0, 3) }} {{ c.heureDebut }}</span>
                <span class="font-medium truncate max-w-[100px]" style="color: var(--text-primary)">{{ c.matiereLibelle }}</span>
              </div>
            }
            @if (prochainsCreneaux(salle.publicId).length === 0) {
              <p class="text-xs" style="color: var(--text-muted)">Aucun cours planifié</p>
            }
          </div>
        </div>
      </div>
    }
  </div>
</div>
  `,
})
export class SallesListComponent implements OnInit {
  readonly store = inject(ScheduleStore);

  readonly types = ['', 'AMPHI', 'TD', 'TP', 'LABO'];
  typeFilter = '';

  ngOnInit() {
    this.store.loadSalles();
    this.store.loadTimeSlots({});
  }

  sallesFiltrees = computed(() => {
    if (!this.typeFilter) return this.store.salles();
    return this.store.salles().filter(s => s.type === this.typeFilter);
  });

  // Simulation : salles occupées en ce moment (lundi 07:30-08:30 pour la demo)
  estOccupee(sallePublicId: string): boolean {
    const slots = this.store.timeSlots();
    return slots.some(s => s.sallePublicId === sallePublicId && s.jour === 'LUNDI' && s.heureDebut === '07:30');
  }

  coursCourant(sallePublicId: string): string {
    const slot = this.store.timeSlots().find(s =>
      s.sallePublicId === sallePublicId && s.jour === 'LUNDI' && s.heureDebut === '07:30'
    );
    return slot ? `${slot.matiereLibelle} — ${slot.enseignantNom}` : '';
  }

  tauxOccupation(sallePublicId: string): number {
    const total = this.store.timeSlots().filter(s => s.sallePublicId === sallePublicId).length;
    return Math.min(Math.round((total / 30) * 100), 100);
  }

  prochainsCreneaux(sallePublicId: string) {
    return this.store.timeSlots()
      .filter(s => s.sallePublicId === sallePublicId)
      .slice(0, 3);
  }

  disponiblesCount = computed(() =>
    this.store.salles().filter(s => !this.estOccupee(s.publicId)).length
  );

  occupeesCount = computed(() =>
    this.store.salles().filter(s => this.estOccupee(s.publicId)).length
  );

  moyenneTaux = computed(() => {
    const salles = this.store.salles();
    if (!salles.length) return 0;
    return Math.round(salles.reduce((acc, s) => acc + this.tauxOccupation(s.publicId), 0) / salles.length);
  });

  tauxColor(taux: number): string {
    if (taux >= 80) return '#ef4444';
    if (taux >= 50) return '#f59e0b';
    return '#10b981';
  }

  typeStyle(type: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      AMPHI: { background: '#ede9fe', color: '#7c3aed' },
      TD:    { background: '#dbeafe', color: '#2563eb' },
      TP:    { background: '#fef3c7', color: '#d97706' },
      LABO:  { background: '#dcfce7', color: '#16a34a' },
    };
    return map[type] ?? { background: '#f3f4f6', color: '#6b7280' };
  }
}
