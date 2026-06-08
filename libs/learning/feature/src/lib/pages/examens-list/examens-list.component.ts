import { ChangeDetectionStrategy, Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';
import { IExamen, StatutExamen } from '@sms/shared/models';
import { SkeletonTableComponent, EmptyStateComponent } from '@sms/shared/ui';

// ── Statut config ─────────────────────────────────────────────────────────────
const STATUT_CONFIG: Record<StatutExamen, { bg: string; color: string; icon: string; label: string }> = {
  A_VENIR:  { bg: 'rgba(217,119,6,0.10)',   color: '#d97706', icon: 'upcoming',     label: 'À venir'  },
  EN_COURS: { bg: 'rgba(99,102,241,0.10)',   color: '#6366f1', icon: 'play_circle',  label: 'En cours' },
  TERMINE:  { bg: 'rgba(22,163,74,0.10)',    color: '#16a34a', icon: 'task_alt',     label: 'Terminé'  },
};

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector:        'sms-examens-list',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule, SkeletonTableComponent, EmptyStateComponent],
  template: `
<div class="p-6">

  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Examens en ligne</h1>
      <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Gestion des examens et évaluations numériques</p>
    </div>
    <div class="flex items-center gap-2">
      <a routerLink="/learning"
         class="flex items-center gap-1 text-sm hover:opacity-80"
         style="color: var(--accent)">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
        Cours
      </a>
      <button class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
              style="background: var(--accent)">
        <mat-icon style="font-size: 18px; height: 18px; width: 18px">add</mat-icon>
        Créer un examen
      </button>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(99,102,241,0.10)">
        <mat-icon style="color: var(--accent)">quiz</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.examens().length }}</p>
        <p class="text-sm" style="color: var(--text-secondary)">Total examens</p>
      </div>
    </div>
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(217,119,6,0.10)">
        <mat-icon style="color: #d97706">upcoming</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ aVenirCount() }}</p>
        <p class="text-sm" style="color: var(--text-secondary)">À venir</p>
      </div>
    </div>
    <div class="sms-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.10)">
        <mat-icon style="color: #16a34a">done_all</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ terminesCount() }}</p>
        <p class="text-sm" style="color: var(--text-secondary)">Terminés</p>
      </div>
    </div>
  </div>

  <!-- List -->
  @if (store.loading()) {
    <sms-skeleton-table />
  } @else {
    <div class="flex flex-col gap-4">
      @for (exam of store.examens(); track exam.publicId) {
        <div class="sms-card p-5">
          <div class="flex items-start justify-between gap-4">

            <!-- Left: icon + info -->
            <div class="flex items-start gap-4 flex-1 min-w-0">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                   [style.background]="cfg(exam.statut).bg">
                <mat-icon [style.color]="cfg(exam.statut).color" style="font-size: 22px; height: 22px; width: 22px">
                  {{ cfg(exam.statut).icon }}
                </mat-icon>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 class="font-semibold" style="color: var(--text-primary)">{{ exam.titre }}</h3>
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [style.background]="cfg(exam.statut).bg"
                        [style.color]="cfg(exam.statut).color">
                    {{ cfg(exam.statut).label }}
                  </span>
                </div>
                <p class="text-sm" style="color: var(--text-secondary)">{{ exam.matiereLibelle }}</p>
                @if (exam.niveauLibelle) {
                  <p class="text-xs mt-0.5" style="color: var(--text-muted)">{{ exam.niveauLibelle }}</p>
                }

                <div class="flex flex-wrap items-center gap-4 mt-2 text-xs" style="color: var(--text-muted)">
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size: 14px; height: 14px; width: 14px">schedule</mat-icon>
                    {{ exam.dureeMinutes }} min
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size: 14px; height: 14px; width: 14px">help_outline</mat-icon>
                    {{ exam.questions.length }} question{{ exam.questions.length > 1 ? 's' : '' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size: 14px; height: 14px; width: 14px">calendar_today</mat-icon>
                    {{ exam.dateDebut | date:'dd/MM/yyyy HH:mm' }}
                  </span>
                  @if (exam.salleLibelle) {
                    <span class="flex items-center gap-1">
                      <mat-icon style="font-size: 14px; height: 14px; width: 14px">room</mat-icon>
                      {{ exam.salleLibelle }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Right: actions -->
            <div class="flex flex-col gap-2 flex-shrink-0">
              @if (exam.statut !== 'TERMINE') {
                <a [routerLink]="['/learning/examens', exam.publicId]"
                   class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
                   style="background: var(--accent)">
                  <mat-icon style="font-size: 16px; height: 16px; width: 16px">play_arrow</mat-icon>
                  Démarrer
                </a>
              } @else {
                <a [routerLink]="['/learning/examens', exam.publicId]"
                   class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                   style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
                  <mat-icon style="font-size: 16px; height: 16px; width: 16px">visibility</mat-icon>
                  Voir
                </a>
              }
              <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                      style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
                <mat-icon style="font-size: 16px; height: 16px; width: 16px">edit</mat-icon>
                Modifier
              </button>
            </div>
          </div>
        </div>
      } @empty {
        <sms-empty-state type="exams" actionLabel="Créer un examen" />
      }
    </div>
  }

</div>
  `,
})
export class ExamensListComponent implements OnInit {
  protected readonly store = inject(LearningStore);

  protected readonly aVenirCount   = computed(() => this.store.examens().filter(e => e.statut === 'A_VENIR').length);
  protected readonly terminesCount = computed(() => this.store.examens().filter(e => e.statut === 'TERMINE').length);

  protected cfg(statut: StatutExamen) { return STATUT_CONFIG[statut] ?? STATUT_CONFIG['A_VENIR']; }

  ngOnInit(): void { this.store.loadExamens(); }
}
