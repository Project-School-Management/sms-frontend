import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';
import { SkeletonCardComponent, EmptyStateComponent } from '@sms/shared/ui';

@Component({
  selector: 'sms-cours-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, SkeletonCardComponent, EmptyStateComponent],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Cours & E-learning</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Catalogue de cours et ressources pédagogiques</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/learning/examens"
             class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border hover:opacity-80"
             style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">quiz</mat-icon>
            Examens
          </a>
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style="background: var(--accent)">
            <mat-icon style="font-size: 18px; height: 18px; width: 18px">add</mat-icon>
            Nouveau cours
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
            <mat-icon style="color: var(--accent)">menu_book</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.nbCours() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Total cours</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
            <mat-icon style="color: #16a34a">publish</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.coursPublies().length }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Publiés</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(107,114,128,0.1)">
            <mat-icon style="color: #6b7280">drafts</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ brouillonsCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Brouillons</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(8,145,178,0.1)">
            <mat-icon style="color: #0891b2">quiz</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.examens().length }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Examens</p>
          </div>
        </div>
      </div>

      <!-- Filter -->
      <div class="flex items-center gap-3 mb-4">
        <span class="text-xs font-medium" style="color: var(--text-secondary)">Filtrer :</span>
        @for (f of matiereFilters; track f) {
          <button (click)="matiereFilter.set(f)"
            class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            [style.background]="matiereFilter() === f ? 'var(--accent)' : 'var(--surface-2)'"
            [style.color]="matiereFilter() === f ? '#fff' : 'var(--text-secondary)'"
            [style.border]="'1px solid ' + (matiereFilter() === f ? 'var(--accent)' : 'var(--border-color)')">
            {{ f || 'Tous' }}
          </button>
        }
      </div>

      @if (store.loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (_ of [1,2,3,4,5,6]; track $_) { <sms-skeleton-card /> }
        </div>
      } @else {
        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (cours of filteredCours(); track cours.publicId) {
            <div class="sms-card flex flex-col overflow-hidden hover:opacity-90 transition-opacity">
              <!-- Header card -->
              <div class="px-5 py-4 border-b" style="border-color: var(--border-color)">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <span class="px-2 py-0.5 rounded text-xs font-medium" [ngStyle]="statutStyle(cours.statut)">
                      {{ cours.statut }}
                    </span>
                    <h3 class="font-semibold mt-1.5 truncate" style="color: var(--text-primary)">{{ cours.titre }}</h3>
                  </div>
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background: var(--accent-light)">
                    <mat-icon style="color: var(--accent)">menu_book</mat-icon>
                  </div>
                </div>
              </div>
              <!-- Body card -->
              <div class="p-5 flex-1">
                <p class="text-sm leading-relaxed" style="color: var(--text-secondary)">{{ cours.description }}</p>
                <div class="mt-3 flex flex-wrap gap-3 text-xs" style="color: var(--text-muted)">
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size: 14px; height: 14px; width: 14px">category</mat-icon>
                    {{ cours.matiereLibelle }}
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size: 14px; height: 14px; width: 14px">person</mat-icon>
                    {{ cours.enseignantNom }}
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size: 14px; height: 14px; width: 14px">schedule</mat-icon>
                    {{ cours.dureeHeures ?? '?' }}h
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size: 14px; height: 14px; width: 14px">layers</mat-icon>
                    {{ cours.chapitres.length }} chapitre(s)
                  </span>
                </div>
              </div>
              <!-- Footer card -->
              <div class="px-5 py-3 border-t flex items-center justify-between" style="border-color: var(--border-color)">
                <div class="flex-1 mr-3">
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span style="color: var(--text-muted)">Progression</span>
                    <span style="color: var(--text-secondary)">{{ cours.progression }}%</span>
                  </div>
                  <div class="w-full rounded-full h-1.5" style="background: var(--border-color)">
                    <div class="h-1.5 rounded-full" style="background: var(--accent)" [style.width.%]="cours.progression"></div>
                  </div>
                </div>
                <a [routerLink]="['/learning', cours.publicId]"
                   class="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                   style="background: var(--accent-light); color: var(--accent)">
                  Accéder →
                </a>
              </div>
            </div>
          } @empty {
            <div class="col-span-3">
              <sms-empty-state
                [type]="matiereFilter() ? 'search' : 'courses'"
                [actionLabel]="matiereFilter() ? 'Réinitialiser le filtre' : undefined"
                (action)="matiereFilter.set('')">
              </sms-empty-state>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CoursListComponent implements OnInit {
  readonly store = inject(LearningStore);
  readonly matiereFilter = signal('');

  readonly matiereFilters = ['', 'Algorithmique', 'Base de données', 'Réseaux', 'Mathématiques', 'Sécurité'];

  readonly brouillonsCount = computed(() => this.store.cours().filter(c => c.statut === 'BROUILLON').length);

  readonly filteredCours = computed(() => {
    const f = this.matiereFilter();
    return f ? this.store.cours().filter(c => c.matiereLibelle === f) : this.store.cours();
  });

  ngOnInit() {
    this.store.loadCours({});
    this.store.loadExamens();
  }

  statutStyle(statut: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      PUBLIE:   { background: '#dcfce7', color: '#16a34a' },
      BROUILLON:{ background: '#f3f4f6', color: '#6b7280' },
      ARCHIVE:  { background: '#fee2e2', color: '#dc2626' },
    };
    return map[statut] ?? { background: '#f3f4f6', color: '#6b7280' };
  }
}
