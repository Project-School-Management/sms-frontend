import { ChangeDetectionStrategy, Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ScheduleStore } from '@sms/schedule/data-access';

const JOURS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];
const JOURS_LABELS: Record<string, string> = {
  LUNDI: 'Lundi', MARDI: 'Mardi', MERCREDI: 'Mercredi', JEUDI: 'Jeudi', VENDREDI: 'Vendredi',
};

const MATIERE_COLORS: Record<string, { bg: string; color: string }> = {
  'Algorithmique':        { bg: '#dbeafe', color: '#2563eb' },
  'Base de données':      { bg: '#dcfce7', color: '#16a34a' },
  'Réseaux':              { bg: '#fef3c7', color: '#d97706' },
  'Mathématiques':        { bg: '#ede9fe', color: '#7c3aed' },
  'Français':             { bg: '#fce7f3', color: '#db2777' },
  'Anglais':              { bg: '#e0f2fe', color: '#0891b2' },
  'Physique-Chimie':      { bg: '#fff7ed', color: '#ea580c' },
  'SVT':                  { bg: '#ecfdf5', color: '#059669' },
  'Histoire-Géo':         { bg: '#fdf4ff', color: '#a21caf' },
  'Systèmes d\'exploitation': { bg: '#f0fdf4', color: '#15803d' },
};

@Component({
  selector: 'sms-schedule-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Emploi du temps</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Semaine du 02 au 06 Juin 2026</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:opacity-80"
            style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">chevron_left</mat-icon>
            Semaine préc.
          </button>
          <button class="px-3 py-1.5 rounded-lg border text-sm font-medium"
            style="border-color: var(--accent); color: var(--accent); background: var(--accent-light)">
            Aujourd'hui
          </button>
          <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:opacity-80"
            style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            Semaine suiv.
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">chevron_right</mat-icon>
          </button>
          <a routerLink="/schedule/seances" class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border hover:opacity-80"
            style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">list</mat-icon>
            Séances
          </a>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="flex items-center gap-2 mb-4 flex-wrap">
        <span class="text-xs font-medium" style="color: var(--text-secondary)">Filtrer par jour :</span>
        <button (click)="store.setJourFilter('')"
          class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          [style.background]="store.jourFilter() === '' ? 'var(--accent)' : 'var(--surface-2)'"
          [style.color]="store.jourFilter() === '' ? '#fff' : 'var(--text-secondary)'"
          [style.border]="'1px solid ' + (store.jourFilter() === '' ? 'var(--accent)' : 'var(--border-color)')">
          Tous
        </button>
        @for (jour of jours; track jour) {
          <button (click)="store.setJourFilter(jour)"
            class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            [style.background]="store.jourFilter() === jour ? 'var(--accent)' : 'var(--surface-2)'"
            [style.color]="store.jourFilter() === jour ? '#fff' : 'var(--text-secondary)'"
            [style.border]="'1px solid ' + (store.jourFilter() === jour ? 'var(--accent)' : 'var(--border-color)')">
            {{ joursLabels[jour] }}
          </button>
        }
      </div>

      @if (store.loading()) {
        <div class="flex items-center justify-center py-16" style="color: var(--text-secondary)">
          <mat-icon class="animate-spin">refresh</mat-icon>&nbsp;Chargement...
        </div>
      } @else {
        @if (store.jourFilter()) {
          <!-- List view for single day -->
          <div class="flex flex-col gap-3">
            @for (slot of store.filteredSlots(); track slot.publicId) {
              <div class="sms-card p-4 flex items-center gap-4">
                <div class="w-24 text-center shrink-0">
                  <p class="text-xs font-bold uppercase" style="color: var(--accent)">{{ slot.jour }}</p>
                  <p class="text-sm font-bold mt-0.5" style="color: var(--text-primary)">{{ slot.heureDebut }}</p>
                  <p class="text-xs" style="color: var(--text-muted)">{{ slot.heureFin }}</p>
                </div>
                <div class="w-1 self-stretch rounded-full" [style.background]="matiereColor(slot.matiereLibelle).color"></div>
                <div class="flex-1">
                  <p class="font-semibold" style="color: var(--text-primary)">{{ slot.matiereLibelle }}</p>
                  <p class="text-xs mt-0.5" style="color: var(--text-secondary)">{{ slot.promotionLibelle }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium" style="color: var(--text-primary)">{{ slot.salleLibelle }}</p>
                  <p class="text-xs" style="color: var(--text-secondary)">{{ slot.enseignantNom }}</p>
                </div>
              </div>
            } @empty {
              <div class="flex flex-col items-center justify-center py-16 gap-3">
                <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">calendar_today</mat-icon>
                <p style="color: var(--text-secondary)">Aucun créneau pour ce jour</p>
              </div>
            }
          </div>
        } @else {
          <!-- Weekly grid view -->
          <div class="sms-card overflow-hidden">
            <!-- Days header -->
            <div class="grid border-b" [style.grid-template-columns]="'64px repeat(5, 1fr)'" style="border-color: var(--border-color)">
              <div class="px-2 py-3" style="background: var(--surface-2)"></div>
              @for (jour of jours; track jour) {
                <div class="px-3 py-3 text-center border-l" style="background: var(--surface-2); border-color: var(--border-color)">
                  <p class="text-xs font-semibold" style="color: var(--text-primary)">{{ joursLabels[jour] }}</p>
                </div>
              }
            </div>
            <!-- Time slots rows -->
            @for (heure of heures; track heure) {
              <div class="grid border-b" [style.grid-template-columns]="'64px repeat(5, 1fr)'" style="border-color: var(--border-color)">
                <div class="px-2 py-3 text-xs text-right border-r" style="color: var(--text-muted); border-color: var(--border-color)">
                  {{ heure }}
                </div>
                @for (jour of jours; track jour) {
                  <div class="border-l min-h-[60px] p-1 relative" style="border-color: var(--border-color)">
                    @for (slot of slotsFor(jour, heure); track slot.publicId) {
                      <div class="p-1.5 rounded text-xs mb-1"
                           [style.background]="matiereColor(slot.matiereLibelle).bg"
                           [style.color]="matiereColor(slot.matiereLibelle).color">
                        <p class="font-semibold truncate">{{ slot.matiereLibelle }}</p>
                        <p class="truncate opacity-80">{{ slot.salleLibelle }}</p>
                        <p class="truncate opacity-70">{{ slot.enseignantNom }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Legend -->
          <div class="mt-4 sms-card p-4">
            <p class="text-xs font-semibold mb-2" style="color: var(--text-secondary)">LÉGENDE</p>
            <div class="flex flex-wrap gap-2">
              @for (entry of legendeEntries(); track entry.matiere) {
                <div class="flex items-center gap-1.5 px-2 py-1 rounded"
                     [style.background]="entry.bg" [style.color]="entry.color">
                  <div class="w-2 h-2 rounded-full" [style.background]="entry.color"></div>
                  <span class="text-xs font-medium">{{ entry.matiere }}</span>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class ScheduleViewComponent implements OnInit {
  readonly store = inject(ScheduleStore);
  readonly jours = JOURS;
  readonly joursLabels = JOURS_LABELS;
  readonly heures = ['08:00', '10:00', '12:00', '14:00', '16:00'];

  ngOnInit() {
    this.store.loadTimeSlots({});
  }

  slotsFor(jour: string, heure: string) {
    return this.store.timeSlots().filter(s => s.jour === jour && s.heureDebut === heure);
  }

  matiereColor(matiere: string): { bg: string; color: string } {
    return MATIERE_COLORS[matiere] ?? { bg: 'var(--accent-light)', color: 'var(--accent)' };
  }

  legendeEntries() {
    const matieres = [...new Set(this.store.timeSlots().map(s => s.matiereLibelle))];
    return matieres.map(m => ({ matiere: m, ...this.matiereColor(m) }));
  }
}
