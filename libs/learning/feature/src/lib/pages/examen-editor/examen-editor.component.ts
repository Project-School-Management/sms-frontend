import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { MatIconModule }  from '@angular/material/icon';
import { LearningStore }  from '@sms/learning/data-access';
import { ReferenceStore } from '@sms/config-system/data-access';
import { ToastService }   from '@sms/shared/ui';
import { TypeQuestion, IQuestion } from '@sms/shared/models';

// ── Config types de questions ─────────────────────────────────────────────────
const TYPE_Q_CFG: Record<string, { label: string; icon: string; color: string; bg: string; desc: string }> = {
  QCM:            { label:'QCM',             icon:'radio_button_checked', color:'#6366f1', bg:'rgba(99,102,241,0.10)',  desc:'Choix multiple avec 1 ou plusieurs bonnes réponses' },
  VRAI_FAUX:      { label:'Vrai / Faux',     icon:'check_box',            color:'#10b981', bg:'rgba(16,185,129,0.10)', desc:'Affirmation à évaluer comme vraie ou fausse'        },
  REPONSE_COURTE: { label:'Réponse courte',  icon:'short_text',           color:'#f59e0b', bg:'rgba(245,158,11,0.10)', desc:'Réponse textuelle courte, corrigée automatiquement' },
  REPONSE_LONGUE: { label:'Réponse longue',  icon:'subject',              color:'#8b5cf6', bg:'rgba(139,92,246,0.10)', desc:'Développement ou dissertation, correction manuelle' },
};

interface QuestionDraft {
  id:             string;
  type:           TypeQuestion;
  enonce:         string;
  options:        string[];
  bonnesReponses: string[];
  points:         number;
  collapsed:      boolean;
}

function mkQuestion(type: TypeQuestion): QuestionDraft {
  const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  const base = { id, type, enonce: '', bonnesReponses: [], points: 2, collapsed: false };
  if (type === 'QCM')        return { ...base, options: ['', '', '', ''] };
  if (type === 'VRAI_FAUX')  return { ...base, options: ['Vrai', 'Faux'], bonnesReponses: ['Vrai'] };
  return { ...base, options: [] };
}

@Component({
  selector:        'sms-examen-editor',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6 max-w-5xl mx-auto">

  <!-- ── Navigation ────────────────────────────────────────────────────────── -->
  <div class="flex items-center gap-3 mb-6">
    <a routerLink="/learning/examens"
       class="flex items-center gap-1.5 text-sm font-semibold hover:opacity-80"
       style="color:var(--text-secondary)">
      <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
      Examens
    </a>
    <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">chevron_right</mat-icon>
    <span class="text-sm font-semibold" style="color:var(--text-primary)">Créer un examen</span>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">

    <!-- ── Colonne gauche : paramètres ──────────────────────────────────────── -->
    <div class="xl:col-span-1 flex flex-col gap-5">

      <!-- Paramètres généraux -->
      <div class="sms-card p-5 flex flex-col gap-4">
        <h2 class="font-bold" style="color:var(--text-primary)">Paramètres</h2>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Titre *</label>
          <input [(ngModel)]="titre" placeholder="ex : Examen final — Algorithmique S1"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Matière</label>
          <select [(ngModel)]="matierePublicId"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Sélectionner —</option>
            @for (m of refStore.matieres(); track m.publicId) {
              <option [value]="m.publicId">{{ m.libelle }}</option>
            }
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Niveau / Classe</label>
          <select [(ngModel)]="niveauLibelle"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Tous niveaux —</option>
            @for (n of refStore.niveaux(); track n.publicId) {
              <option [value]="n.libelle">{{ n.libelle }}</option>
            }
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Durée (minutes)</label>
          <input type="number" [(ngModel)]="dureeMinutes" min="5" step="5"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date début</label>
            <input type="datetime-local" [(ngModel)]="dateDebut"
                   class="px-3 py-2 rounded-xl border text-xs outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date fin</label>
            <input type="datetime-local" [(ngModel)]="dateFin"
                   class="px-3 py-2 rounded-xl border text-xs outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>
      </div>

      <!-- Stats live -->
      <div class="sms-card p-5">
        <h3 class="font-bold mb-4" style="color:var(--text-primary)">Aperçu</h3>
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between text-sm">
            <span style="color:var(--text-secondary)">Questions</span>
            <span class="font-bold" style="color:var(--text-primary)">{{ questions().length }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span style="color:var(--text-secondary)">Total points</span>
            <span class="font-bold text-lg" style="color:var(--accent)">{{ totalPoints() }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span style="color:var(--text-secondary)">Durée</span>
            <span class="font-semibold" style="color:var(--text-primary)">{{ dureeMinutes }} min</span>
          </div>
          <div class="border-t pt-3 flex flex-col gap-1.5" style="border-color:var(--border-color)">
            @for (t of questionsByType(); track t.type) {
              <div class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-1.5"
                      [style.color]="typeCfg(t.type).color">
                  <mat-icon style="font-size:12px;height:12px;width:12px">{{ typeCfg(t.type).icon }}</mat-icon>
                  {{ typeCfg(t.type).label }}
                </span>
                <span class="font-bold" style="color:var(--text-secondary)">{{ t.count }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Action -->
      <button (click)="saveExamen()"
              [disabled]="store.saving() || !titre.trim() || questions().length === 0"
              class="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white hover:opacity-80 disabled:opacity-40"
              style="background:var(--accent)">
        @if (store.saving()) {
          <mat-icon class="animate-spin" style="font-size:18px;height:18px;width:18px">refresh</mat-icon>
        } @else {
          <mat-icon style="font-size:18px;height:18px;width:18px">publish</mat-icon>
        }
        Créer l'examen
      </button>
    </div>

    <!-- ── Colonne droite : questions ──────────────────────────────────────── -->
    <div class="xl:col-span-2 flex flex-col gap-4">

      <!-- Barre ajout type de question -->
      <div class="sms-card p-4">
        <p class="text-xs font-bold uppercase tracking-wide mb-3" style="color:var(--text-muted)">
          Ajouter une question
        </p>
        <div class="grid grid-cols-2 gap-2">
          @for (t of typeOptions; track t.key) {
            <button (click)="addQuestion(t.key)"
                    class="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold hover:opacity-80 transition-all text-left"
                    [style.background]="typeCfg(t.key).bg"
                    [style.border-color]="typeCfg(t.key).color + '40'"
                    [style.color]="typeCfg(t.key).color">
              <mat-icon style="font-size:18px;height:18px;width:18px">{{ typeCfg(t.key).icon }}</mat-icon>
              <div>
                <p>{{ typeCfg(t.key).label }}</p>
                <p class="font-normal text-xs opacity-70">{{ typeCfg(t.key).desc }}</p>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Liste des questions -->
      @if (questions().length === 0) {
        <div class="sms-card p-12 flex flex-col items-center gap-3 text-center">
          <mat-icon style="font-size:52px;height:52px;width:52px;opacity:0.2">quiz</mat-icon>
          <p class="font-semibold" style="color:var(--text-secondary)">Aucune question</p>
          <p class="text-sm" style="color:var(--text-muted)">
            Utilisez les boutons ci-dessus pour ajouter des questions à votre examen
          </p>
        </div>
      }

      @for (q of questions(); track q.id; let i = $index) {
        <div class="sms-card overflow-hidden border-l-4"
             [style.border-left-color]="typeCfg(q.type).color">

          <!-- Header question -->
          <div class="flex items-center gap-3 px-5 py-3.5 border-b"
               style="border-color:var(--border-color)"
               (click)="toggleQuestion(q.id)">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                 [style.background]="typeCfg(q.type).color">{{ i + 1 }}</div>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                  [style.background]="typeCfg(q.type).bg"
                  [style.color]="typeCfg(q.type).color">
              {{ typeCfg(q.type).label }}
            </span>
            <p class="flex-1 text-sm truncate" style="color:var(--text-primary)">
              {{ q.enonce || '(Énoncé vide)' }}
            </p>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                    style="background:var(--accent-light);color:var(--accent)">
                {{ q.points }} pt(s)
              </span>
              <button (click)="removeQuestion(q.id); $event.stopPropagation()"
                      class="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80"
                      style="background:rgba(239,68,68,0.10);color:#dc2626">
                <mat-icon style="font-size:13px;height:13px;width:13px">delete</mat-icon>
              </button>
              <mat-icon style="font-size:18px;height:18px;width:18px;color:var(--text-muted)"
                        [style.transform]="q.collapsed ? 'none' : 'rotate(180deg)'">expand_more</mat-icon>
            </div>
          </div>

          <!-- Corps de la question -->
          @if (!q.collapsed) {
            <div class="px-5 py-4 flex flex-col gap-4">

              <!-- Énoncé -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold" style="color:var(--text-secondary)">Énoncé *</label>
                <textarea [(ngModel)]="q.enonce" rows="3"
                          placeholder="Rédigez l'énoncé de la question…"
                          class="px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                          style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </textarea>
              </div>

              <!-- ─── QCM ─── -->
              @if (q.type === 'QCM') {
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold" style="color:var(--text-secondary)">
                    Options (cocher la/les bonne(s) réponse(s))
                  </label>
                  @for (opt of q.options; track $index; let oi = $index) {
                    <div class="flex items-center gap-2">
                      <input type="checkbox"
                             [checked]="q.bonnesReponses.includes(opt)"
                             (change)="toggleBonneReponse(q, opt)"
                             class="w-4 h-4 rounded">
                      <input [(ngModel)]="q.options[oi]"
                             [placeholder]="'Option ' + (oi + 1)"
                             class="flex-1 px-3 py-1.5 rounded-xl border text-sm outline-none"
                             [style.background]="q.bonnesReponses.includes(opt) ? 'rgba(22,163,74,0.08)' : 'var(--surface-2)'"
                             [style.border-color]="q.bonnesReponses.includes(opt) ? 'rgba(22,163,74,0.40)' : 'var(--border-color)'"
                             [style.color]="q.bonnesReponses.includes(opt) ? '#16a34a' : 'var(--text-primary)'"
                             (blur)="syncBonneReponse(q, oi)">
                      @if (q.options.length > 2) {
                        <button (click)="removeOption(q, oi)"
                                class="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-70"
                                style="color:var(--text-muted)">
                          <mat-icon style="font-size:13px;height:13px;width:13px">close</mat-icon>
                        </button>
                      }
                    </div>
                  }
                  <button (click)="addOption(q)"
                          class="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 self-start"
                          style="color:var(--accent)">
                    <mat-icon style="font-size:14px;height:14px;width:14px">add</mat-icon>
                    Ajouter une option
                  </button>
                </div>
              }

              <!-- ─── VRAI / FAUX ─── -->
              @if (q.type === 'VRAI_FAUX') {
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold" style="color:var(--text-secondary)">Réponse correcte</label>
                  <div class="flex gap-3">
                    @for (opt of ['Vrai', 'Faux']; track opt) {
                      <button (click)="q.bonnesReponses = [opt]"
                              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all"
                              [style.background]="q.bonnesReponses[0] === opt ? (opt === 'Vrai' ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.12)') : 'var(--surface-2)'"
                              [style.border-color]="q.bonnesReponses[0] === opt ? (opt === 'Vrai' ? '#16a34a' : '#dc2626') : 'var(--border-color)'"
                              [style.color]="q.bonnesReponses[0] === opt ? (opt === 'Vrai' ? '#16a34a' : '#dc2626') : 'var(--text-secondary)'">
                        <mat-icon style="font-size:18px;height:18px;width:18px">
                          {{ opt === 'Vrai' ? 'check_circle' : 'cancel' }}
                        </mat-icon>
                        {{ opt }}
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- ─── RÉPONSE COURTE ─── -->
              @if (q.type === 'REPONSE_COURTE') {
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold" style="color:var(--text-secondary)">
                    Réponse attendue (correction automatique si identique)
                  </label>
                  <input [(ngModel)]="q.bonnesReponses[0]"
                         placeholder="ex : O(n log n)"
                         class="px-3 py-2 rounded-xl border text-sm outline-none"
                         style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                </div>
              }

              <!-- ─── RÉPONSE LONGUE ─── -->
              @if (q.type === 'REPONSE_LONGUE') {
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold" style="color:var(--text-secondary)">
                    Critères de correction (rubrique — pour le correcteur)
                  </label>
                  <textarea [(ngModel)]="q.bonnesReponses[0]" rows="3"
                            placeholder="ex : Citer les 3 composantes de l'ACID, expliquer chaque propriété avec un exemple…"
                            class="px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                            style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
                  </textarea>
                  <p class="text-xs" style="color:var(--text-muted)">
                    Ces critères seront visibles par le correcteur lors de la notation manuelle
                  </p>
                </div>
              }

              <!-- Points -->
              <div class="flex items-center gap-3 pt-2 border-t" style="border-color:var(--border-color)">
                <label class="text-xs font-semibold" style="color:var(--text-secondary)">Points :</label>
                <input type="number" [(ngModel)]="q.points" min="0.5" step="0.5"
                       class="w-20 px-3 py-1.5 rounded-xl border text-sm outline-none text-center font-bold"
                       style="border-color:var(--border-color);background:var(--surface-2);color:var(--accent)">
                <span class="text-xs" style="color:var(--text-muted)">point(s)</span>
              </div>

            </div>
          }
        </div>
      }

    </div>
  </div>

</div>
  `,
})
export class ExamenEditorComponent implements OnInit {
  readonly store    = inject(LearningStore);
  readonly refStore = inject(ReferenceStore);
  readonly toast    = inject(ToastService);
  readonly router   = inject(Router);

  // ── Paramètres examen ─────────────────────────────────────────────────────
  titre         = '';
  matierePublicId = '';
  niveauLibelle = '';
  dureeMinutes  = 60;
  dateDebut     = '';
  dateFin       = '';

  // ── Questions ─────────────────────────────────────────────────────────────
  private _questions = signal<QuestionDraft[]>([]);
  readonly questions  = this._questions.asReadonly();

  readonly totalPoints = computed(() =>
    this._questions().reduce((s, q) => s + q.points, 0)
  );

  readonly questionsByType = computed(() => {
    const map = new Map<string, number>();
    for (const q of this._questions()) map.set(q.type, (map.get(q.type) ?? 0) + 1);
    return [...map.entries()].map(([type, count]) => ({ type, count }));
  });

  readonly matiereLibelle = computed(() =>
    this.refStore.matieres().find(m => m.publicId === this.matierePublicId)?.libelle ?? ''
  );

  readonly typeOptions = Object.entries(TYPE_Q_CFG).map(([key, v]) => ({
    key: key as TypeQuestion, ...v,
  }));

  ngOnInit(): void {
    if (!this.refStore.loaded()) this.refStore.loadAll();
  }

  // ── Gestion questions ────────────────────────────────────────────────────
  addQuestion(type: TypeQuestion): void {
    this._questions.update(list => [...list, mkQuestion(type)]);
  }

  removeQuestion(id: string): void {
    this._questions.update(list => list.filter(q => q.id !== id));
  }

  toggleQuestion(id: string): void {
    this._questions.update(list =>
      list.map(q => q.id === id ? { ...q, collapsed: !q.collapsed } : q)
    );
  }

  // ── QCM options ───────────────────────────────────────────────────────────
  addOption(q: QuestionDraft): void {
    q.options.push('');
  }
  removeOption(q: QuestionDraft, idx: number): void {
    const opt = q.options[idx];
    q.options.splice(idx, 1);
    q.bonnesReponses = q.bonnesReponses.filter(r => r !== opt);
  }
  toggleBonneReponse(q: QuestionDraft, opt: string): void {
    if (q.bonnesReponses.includes(opt)) {
      q.bonnesReponses = q.bonnesReponses.filter(r => r !== opt);
    } else {
      q.bonnesReponses = [...q.bonnesReponses, opt];
    }
  }
  syncBonneReponse(q: QuestionDraft, idx: number): void {
    // Sync bonne réponse si l'option editée était cochée
    this._questions.update(list => [...list]); // force signal update
  }

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  saveExamen(): void {
    if (!this.titre.trim()) {
      this.toast.error('Le titre est obligatoire');
      return;
    }
    if (this._questions().length === 0) {
      this.toast.error('Ajoutez au moins une question');
      return;
    }

    const questions: IQuestion[] = this._questions().map(q => ({
      publicId:       q.id,
      enonce:         q.enonce,
      type:           q.type,
      options:        q.options.length > 0 ? q.options.filter(o => o.trim()) : undefined,
      bonnesReponses: q.bonnesReponses,
      points:         q.points,
    }));

    this.store.createExamen({
      titre:           this.titre,
      matierePublicId: this.matierePublicId,
      matiereLibelle:  this.matiereLibelle(),
      niveauLibelle:   this.niveauLibelle || undefined,
      dureeMinutes:    this.dureeMinutes,
      dateDebut:       this.dateDebut || new Date().toISOString().split('T')[0],
      dateFin:         this.dateFin   || new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
      questions,
    });

    this.toast.success(`Examen "${this.titre}" créé — ${questions.length} question(s) · ${this.totalPoints()} points`);
    this.router.navigate(['/learning/examens']);
  }

  typeCfg(t: string) { return TYPE_Q_CFG[t] ?? TYPE_Q_CFG['QCM']; }
}
