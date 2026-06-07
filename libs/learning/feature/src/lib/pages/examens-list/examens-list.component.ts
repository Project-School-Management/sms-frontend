import { ChangeDetectionStrategy, Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';

@Component({
  selector: 'sms-examens-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Examens en ligne</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Gestion des examens et évaluations numériques</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/learning" class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--accent)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
            Cours
          </a>
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style="background: var(--accent)">
            <mat-icon style="font-size: 18px; height: 18px; width: 18px">add</mat-icon>
            Créer un examen
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
            <mat-icon style="color: var(--accent)">quiz</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.examens().length }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Total examens</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(217,119,6,0.1)">
            <mat-icon style="color: #d97706">upcoming</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ aVenirCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">À venir</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
            <mat-icon style="color: #16a34a">done_all</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ terminesCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Terminés</p>
          </div>
        </div>
      </div>

      @if (store.loading()) {
        <div class="flex items-center justify-center py-16" style="color: var(--text-secondary)">
          <mat-icon class="animate-spin">refresh</mat-icon>&nbsp;Chargement...
        </div>
      } @else {
        <div class="flex flex-col gap-4">
          @for (exam of store.examens(); track exam.publicId) {
            <div class="sms-card p-5">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-4 flex-1">
                  <!-- Icon -->
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                       [style.background]="statutColor(exam).bg">
                    <mat-icon [style.color]="statutColor(exam).color">
                      {{ (exam as any).statut === 'TERMINE' ? 'task_alt' : (exam as any).statut === 'EN_COURS' ? 'play_circle' : 'quiz' }}
                    </mat-icon>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="font-semibold" style="color: var(--text-primary)">{{ exam.titre }}</h3>
                      <span class="px-2 py-0.5 rounded-full text-xs font-semibold" [ngStyle]="statutColor(exam)">
                        {{ (exam as any).statut ?? 'A_VENIR' }}
                      </span>
                    </div>
                    <p class="text-sm" style="color: var(--text-secondary)">{{ exam.matiereLibelle }}</p>
                    <div class="flex flex-wrap items-center gap-4 mt-2 text-xs" style="color: var(--text-muted)">
                      <span class="flex items-center gap-1">
                        <mat-icon style="font-size: 14px; height: 14px; width: 14px">schedule</mat-icon>
                        {{ exam.dureeMinutes }} minutes
                      </span>
                      <span class="flex items-center gap-1">
                        <mat-icon style="font-size: 14px; height: 14px; width: 14px">help_outline</mat-icon>
                        {{ exam.questions.length }} question(s)
                      </span>
                      <span class="flex items-center gap-1">
                        <mat-icon style="font-size: 14px; height: 14px; width: 14px">calendar_today</mat-icon>
                        {{ exam.dateDebut | date:'dd/MM/yyyy HH:mm' }}
                      </span>
                      @if ((exam as any).salleLibelle) {
                        <span class="flex items-center gap-1">
                          <mat-icon style="font-size: 14px; height: 14px; width: 14px">room</mat-icon>
                          {{ (exam as any).salleLibelle }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
                <!-- Actions -->
                <div class="flex flex-col gap-2 shrink-0">
                  @if ((exam as any).statut !== 'TERMINE') {
                    <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-80 transition-opacity"
                      style="background: var(--accent)">
                      <mat-icon style="font-size: 16px; height: 16px; width: 16px">play_arrow</mat-icon>
                      Démarrer
                    </button>
                  }
                  <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border hover:opacity-80 transition-opacity"
                    style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
                    <mat-icon style="font-size: 16px; height: 16px; width: 16px">edit</mat-icon>
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="flex flex-col items-center justify-center py-16 gap-3">
              <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">quiz</mat-icon>
              <p style="color: var(--text-secondary)">Aucun examen disponible</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ExamensListComponent implements OnInit {
  readonly store = inject(LearningStore);

  readonly aVenirCount  = computed(() => this.store.examens().filter(e => (e as any).statut === 'A_VENIR').length);
  readonly terminesCount = computed(() => this.store.examens().filter(e => (e as any).statut === 'TERMINE').length);

  ngOnInit() {
    this.store.loadExamens();
  }

  statutColor(exam: any): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      A_VENIR:  { background: '#fef3c7', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
      EN_COURS: { background: 'var(--accent-light)', color: 'var(--accent)', bg: 'var(--accent-light)' },
      TERMINE:  { background: '#dcfce7', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
    };
    return map[exam.statut ?? 'A_VENIR'] ?? { background: '#f3f4f6', color: '#6b7280', bg: '#f3f4f6' };
  }
}
