import {
  ChangeDetectionStrategy, Component, computed, inject,
  OnDestroy, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';
import { IQuestion } from '@sms/shared/models';

type Phase = 'loading' | 'ready' | 'running' | 'submitted';

@Component({
  selector: 'sms-examen-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6 max-w-4xl mx-auto">

  <!-- Back -->
  <a routerLink="/learning/examens"
     class="inline-flex items-center gap-1 text-sm mb-5 hover:opacity-80"
     style="color: var(--accent)">
    <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
    Retour aux examens
  </a>

  <!-- Loading -->
  @if (phase() === 'loading') {
    <div class="flex items-center justify-center py-16 gap-2" style="color: var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon>
      Chargement de l'examen...
    </div>
  }

  @if (store.selectedExamen(); as exam) {

    <!-- ── PHASE : READY ── -->
    @if (phase() === 'ready') {
      <div class="sms-card p-8 flex flex-col items-center text-center gap-4">
        <div class="w-20 h-20 rounded-2xl flex items-center justify-center"
             style="background: var(--accent-light)">
          <mat-icon style="color: var(--accent); font-size: 40px; height: 40px; width: 40px">quiz</mat-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold mb-1" style="color: var(--text-primary)">{{ exam.titre }}</h1>
          <p class="text-sm" style="color: var(--text-secondary)">{{ exam.matiereLibelle }}</p>
        </div>
        <div class="flex flex-wrap gap-6 justify-center text-sm mt-2" style="color: var(--text-muted)">
          <span class="flex items-center gap-1">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">schedule</mat-icon>
            Durée : {{ exam.dureeMinutes }} min
          </span>
          <span class="flex items-center gap-1">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">help_outline</mat-icon>
            {{ exam.questions.length }} question(s)
          </span>
          <span class="flex items-center gap-1">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">star</mat-icon>
            {{ totalPoints() }} point(s) au total
          </span>
          @if (exam.salleLibelle) {
            <span class="flex items-center gap-1">
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">room</mat-icon>
              {{ exam.salleLibelle }}
            </span>
          }
        </div>
        <button (click)="startExam()"
                class="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-80"
                style="background: var(--accent)">
          <mat-icon>play_arrow</mat-icon>
          Démarrer l'examen
        </button>
      </div>
    }

    <!-- ── PHASE : RUNNING ── -->
    @if (phase() === 'running') {
      <div class="flex flex-col gap-4">

        <!-- Top bar: titre + timer + progression -->
        <div class="sms-card px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div class="flex-1 min-w-0">
            <p class="font-semibold truncate" style="color: var(--text-primary)">{{ exam.titre }}</p>
            <p class="text-xs" style="color: var(--text-muted)">
              Question {{ currentIndex() + 1 }} / {{ exam.questions.length }}
            </p>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
               [style.background]="timerWarning() ? 'rgba(239,68,68,0.10)' : 'var(--surface-2)'">
            <mat-icon style="font-size: 18px; height: 18px; width: 18px"
                      [style.color]="timerWarning() ? '#dc2626' : 'var(--text-secondary)'">timer</mat-icon>
            <span class="font-mono font-semibold text-sm"
                  [style.color]="timerWarning() ? '#dc2626' : 'var(--text-primary)'">
              {{ timerDisplay() }}
            </span>
          </div>
        </div>

        <!-- Question navigation pills -->
        <div class="flex flex-wrap gap-2">
          @for (q of exam.questions; track q.publicId; let i = $index) {
            <button (click)="goTo(i)"
                    class="w-9 h-9 rounded-lg text-xs font-semibold transition-all"
                    [style.background]="navBg(i)"
                    [style.color]="navColor(i)"
                    [style.border]="currentIndex() === i ? '2px solid var(--accent)' : '2px solid transparent'">
              {{ i + 1 }}
            </button>
          }
        </div>

        <!-- Question card -->
        @if (currentQuestion(); as q) {
          <div class="sms-card p-6">
            <div class="flex items-start gap-3 mb-5">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-semibold text-sm"
                   style="background: var(--accent-light); color: var(--accent)">
                {{ currentIndex() + 1 }}
              </div>
              <div class="flex-1">
                <p class="font-semibold leading-relaxed" style="color: var(--text-primary)">{{ q.enonce }}</p>
                <div class="flex items-center gap-3 mt-1 text-xs" style="color: var(--text-muted)">
                  <span class="px-1.5 py-0.5 rounded" style="background: var(--surface-2)">{{ typeLabel(q.type) }}</span>
                  <span>{{ q.points }} point(s)</span>
                </div>
              </div>
            </div>

            <!-- QCM / VRAI_FAUX options -->
            @if (q.type === 'QCM' || q.type === 'VRAI_FAUX') {
              <div class="flex flex-col gap-2">
                @for (opt of q.options ?? []; track opt) {
                  <label class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all"
                         [style.border-color]="isSelected(q, opt) ? 'var(--accent)' : 'var(--border-color)'"
                         [style.background]="isSelected(q, opt) ? 'var(--accent-light)' : 'var(--surface-2)'">
                    <input type="radio"
                           [name]="'q-' + q.publicId"
                           [value]="opt"
                           [checked]="isSelected(q, opt)"
                           (change)="selectOption(q, opt)"
                           class="accent-current">
                    <span class="text-sm" style="color: var(--text-primary)">{{ opt }}</span>
                  </label>
                }
              </div>
            }

            <!-- REPONSE_COURTE -->
            @if (q.type === 'REPONSE_COURTE') {
              <input type="text"
                     [value]="getShortAnswer(q)"
                     (input)="setShortAnswer(q, $any($event.target).value)"
                     placeholder="Votre réponse..."
                     class="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2"
                     style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
            }

            <!-- REPONSE_LONGUE -->
            @if (q.type === 'REPONSE_LONGUE') {
              <textarea rows="5"
                        [value]="getShortAnswer(q)"
                        (input)="setShortAnswer(q, $any($event.target).value)"
                        placeholder="Développez votre réponse..."
                        class="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 resize-none"
                        style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
              </textarea>
            }
          </div>
        }

        <!-- Navigation + submit -->
        <div class="flex items-center justify-between gap-3">
          <button (click)="prev()" [disabled]="currentIndex() === 0"
                  class="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-80 disabled:opacity-40"
                  style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
            Précédent
          </button>

          <span class="text-xs" style="color: var(--text-muted)">
            {{ answeredCount() }} / {{ exam.questions.length }} répondu(s)
          </span>

          @if (currentIndex() < exam.questions.length - 1) {
            <button (click)="next()"
                    class="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
                    style="background: var(--accent)">
              Suivant
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_forward</mat-icon>
            </button>
          } @else {
            <button (click)="submitExam()"
                    class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80"
                    style="background: #16a34a">
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">send</mat-icon>
              Soumettre
            </button>
          }
        </div>
      </div>
    }

    <!-- ── PHASE : SUBMITTED ── -->
    @if (phase() === 'submitted') {
      <div class="flex flex-col gap-6">
        <!-- Score summary -->
        <div class="sms-card p-8 flex flex-col items-center text-center gap-3">
          <div class="w-20 h-20 rounded-full flex items-center justify-center"
               [style.background]="scorePercent() >= 50 ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.15)'">
            <mat-icon style="font-size: 40px; height: 40px; width: 40px"
                      [style.color]="scorePercent() >= 50 ? '#16a34a' : '#dc2626'">
              {{ scorePercent() >= 50 ? 'emoji_events' : 'sentiment_dissatisfied' }}
            </mat-icon>
          </div>
          <h2 class="text-2xl font-bold" style="color: var(--text-primary)">
            {{ score() }} / {{ totalPoints() }} points
          </h2>
          <p class="text-lg font-semibold"
             [style.color]="scorePercent() >= 50 ? '#16a34a' : '#dc2626'">
            {{ scorePercent() }}% — {{ scorePercent() >= 50 ? 'Réussi !' : 'À améliorer' }}
          </p>
          <p class="text-sm" style="color: var(--text-secondary)">
            {{ correctCount() }} bonne(s) réponse(s) sur {{ exam.questions.length }} question(s)
          </p>
          <a routerLink="/learning/examens"
             class="mt-3 px-5 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
             style="background: var(--accent-light); color: var(--accent)">
            Retour aux examens
          </a>
        </div>

        <!-- Correction détaillée -->
        <div class="sms-card overflow-hidden">
          <div class="px-5 py-4 border-b font-semibold" style="border-color: var(--border-color); color: var(--text-primary)">
            Correction détaillée
          </div>
          <div class="divide-y" style="border-color: var(--border-color)">
            @for (q of exam.questions; track q.publicId; let i = $index) {
              <div class="px-5 py-4">
                <div class="flex items-start gap-3">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                       [style.background]="isCorrect(q) ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.15)'">
                    <mat-icon style="font-size: 16px; height: 16px; width: 16px"
                              [style.color]="isCorrect(q) ? '#16a34a' : '#dc2626'">
                      {{ isCorrect(q) ? 'check' : 'close' }}
                    </mat-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold mb-1" style="color: var(--text-primary)">
                      {{ i + 1 }}. {{ q.enonce }}
                    </p>
                    <p class="text-xs" style="color: var(--text-muted)">
                      Votre réponse :
                      <span [style.color]="isCorrect(q) ? '#16a34a' : '#dc2626'" class="font-medium">
                        {{ userAnswerDisplay(q) || '(sans réponse)' }}
                      </span>
                    </p>
                    @if (!isCorrect(q) && q.bonnesReponses.length) {
                      <p class="text-xs mt-0.5" style="color: #16a34a">
                        Bonne réponse : <span class="font-medium">{{ q.bonnesReponses.join(', ') }}</span>
                      </p>
                    }
                  </div>
                  <span class="text-xs font-semibold shrink-0"
                        [style.color]="isCorrect(q) ? '#16a34a' : '#dc2626'">
                    {{ isCorrect(q) ? '+' + q.points : '0' }} pt
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  }
</div>
  `,
})
export class ExamenDetailComponent implements OnInit, OnDestroy {
  readonly store = inject(LearningStore);
  private readonly route = inject(ActivatedRoute);

  readonly phase = signal<Phase>('loading');
  readonly currentIndex = signal(0);
  // answers: questionPublicId → selected options or free text
  private readonly answers = signal<Record<string, string[]>>({});
  readonly remainingSeconds = signal(0);
  private timerId: ReturnType<typeof setInterval> | null = null;

  // ── derived ──────────────────────────────────────────────────────────────

  readonly currentQuestion = computed<IQuestion | null>(() => {
    const exam = this.store.selectedExamen();
    if (!exam) return null;
    return exam.questions[this.currentIndex()] ?? null;
  });

  readonly totalPoints = computed(() =>
    (this.store.selectedExamen()?.questions ?? []).reduce((s, q) => s + q.points, 0)
  );

  readonly answeredCount = computed(() =>
    Object.values(this.answers()).filter(a => a.length > 0 && a[0] !== '').length
  );

  readonly timerWarning = computed(() => this.remainingSeconds() <= 60);

  readonly timerDisplay = computed(() => {
    const s = this.remainingSeconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  });

  // post-submit computed

  readonly score = computed(() => {
    const exam = this.store.selectedExamen();
    if (!exam) return 0;
    return exam.questions.reduce((total, q) => {
      return total + (this.isCorrect(q) ? q.points : 0);
    }, 0);
  });

  readonly correctCount = computed(() => {
    const exam = this.store.selectedExamen();
    if (!exam) return 0;
    return exam.questions.filter(q => this.isCorrect(q)).length;
  });

  readonly scorePercent = computed(() => {
    const tp = this.totalPoints();
    return tp > 0 ? Math.round((this.score() / tp) * 100) : 0;
  });

  // ── lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.selectExamen(id);
    // watch for exam to arrive then transition to ready
    const interval = setInterval(() => {
      if (this.store.selectedExamen() && !this.store.loading()) {
        this.phase.set('ready');
        clearInterval(interval);
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.store.clearSelectedExamen();
  }

  // ── exam flow ─────────────────────────────────────────────────────────────

  startExam(): void {
    const exam = this.store.selectedExamen()!;
    this.remainingSeconds.set(exam.dureeMinutes * 60);
    this.phase.set('running');
    this.timerId = setInterval(() => {
      this.remainingSeconds.update(s => {
        if (s <= 1) { this.submitExam(); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  submitExam(): void {
    this.clearTimer();
    this.phase.set('submitted');
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // ── navigation ────────────────────────────────────────────────────────────

  goTo(i: number): void { this.currentIndex.set(i); }
  next(): void { this.currentIndex.update(i => i + 1); }
  prev(): void { this.currentIndex.update(i => i - 1); }

  // ── answer management ─────────────────────────────────────────────────────

  isSelected(q: IQuestion, opt: string): boolean {
    return (this.answers()[q.publicId] ?? []).includes(opt);
  }

  selectOption(q: IQuestion, opt: string): void {
    this.answers.update(a => ({ ...a, [q.publicId]: [opt] }));
  }

  getShortAnswer(q: IQuestion): string {
    return (this.answers()[q.publicId] ?? [])[0] ?? '';
  }

  setShortAnswer(q: IQuestion, val: string): void {
    this.answers.update(a => ({ ...a, [q.publicId]: [val] }));
  }

  // ── correction ────────────────────────────────────────────────────────────

  isCorrect(q: IQuestion): boolean {
    if (!q.bonnesReponses.length) return false;
    const given = this.answers()[q.publicId] ?? [];
    return q.bonnesReponses.every(r => given.includes(r)) &&
           given.every(r => q.bonnesReponses.includes(r));
  }

  userAnswerDisplay(q: IQuestion): string {
    return (this.answers()[q.publicId] ?? []).join(', ');
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  navBg(i: number): string {
    const exam = this.store.selectedExamen();
    if (!exam) return 'var(--surface-2)';
    const q = exam.questions[i];
    const answered = ((this.answers()[q?.publicId] ?? [])[0] ?? '') !== '';
    if (i === this.currentIndex()) return 'var(--accent)';
    if (answered) return 'rgba(22,163,74,0.15)';
    return 'var(--surface-2)';
  }

  navColor(i: number): string {
    const exam = this.store.selectedExamen();
    if (!exam) return 'var(--text-secondary)';
    const q = exam.questions[i];
    const answered = ((this.answers()[q?.publicId] ?? [])[0] ?? '') !== '';
    if (i === this.currentIndex()) return '#fff';
    if (answered) return '#16a34a';
    return 'var(--text-secondary)';
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      QCM:            'Choix multiple',
      VRAI_FAUX:      'Vrai / Faux',
      REPONSE_COURTE: 'Réponse courte',
      REPONSE_LONGUE: 'Réponse longue',
    };
    return map[type] ?? type;
  }
}
