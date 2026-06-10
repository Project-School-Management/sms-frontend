import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule }    from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule }     from '@angular/forms';
import { MatIconModule }   from '@angular/material/icon';
import { LearningStore }   from '@sms/learning/data-access';
import { ReferenceStore }  from '@sms/config-system/data-access';
import { ToastService }    from '@sms/shared/ui';
import { IChapitre, IRessource, StatutCours, TypeRessource } from '@sms/shared/models';

// ── Types locaux ──────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;

interface RessourceDraft {
  id:     string;
  titre:  string;
  type:   TypeRessource;
  url:    string;
  vue:    boolean;
}

interface ChapitreDraft {
  id:        string;
  titre:     string;
  ordre:     number;
  ressources: RessourceDraft[];
  expanded:   boolean;
}

const TYPE_RESSOURCE_CFG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  PDF:      { label:'PDF',          icon:'picture_as_pdf',  color:'#ef4444', bg:'rgba(239,68,68,0.10)'   },
  VIDEO:    { label:'Vidéo',        icon:'play_circle',     color:'#6366f1', bg:'rgba(99,102,241,0.10)'  },
  LIEN:     { label:'Lien web',     icon:'link',            color:'#ec4899', bg:'rgba(236,72,153,0.10)'  },
  IMAGE:    { label:'Image',        icon:'image',           color:'#10b981', bg:'rgba(16,185,129,0.10)'  },
  AUDIO:    { label:'Audio',        icon:'headphones',      color:'#8b5cf6', bg:'rgba(139,92,246,0.10)'  },
  ZIP:      { label:'Archive ZIP',  icon:'folder_zip',      color:'#d97706', bg:'rgba(217,119,6,0.10)'   },
  EXERCICE: { label:'Exercice',     icon:'assignment',      color:'var(--accent)', bg:'var(--accent-light)' },
};

@Component({
  selector:        'sms-cours-editor',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6 max-w-4xl mx-auto">

  <!-- ── Navigation ────────────────────────────────────────────────────────── -->
  <div class="flex items-center gap-3 mb-6">
    <a routerLink="/learning/cours"
       class="flex items-center gap-1.5 text-sm font-semibold hover:opacity-80"
       style="color:var(--text-secondary)">
      <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
      Cours
    </a>
    <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">chevron_right</mat-icon>
    <span class="text-sm font-semibold" style="color:var(--text-primary)">
      {{ editMode() ? 'Modifier le cours' : 'Créer un cours' }}
    </span>
  </div>

  <!-- ── Indicateur d'étapes ────────────────────────────────────────────────── -->
  <div class="flex items-center gap-0 mb-8">
    @for (s of steps; track s.num) {
      <div class="flex items-center" [class.flex-1]="!$last">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all"
               [style.background]="currentStep() >= s.num ? 'var(--accent)' : 'var(--surface-2)'"
               [style.color]="currentStep() >= s.num ? '#fff' : 'var(--text-muted)'"
               [style.border]="currentStep() === s.num ? '2px solid rgba(37,99,235,0.4)' : 'none'">
            @if (currentStep() > s.num) {
              <mat-icon style="font-size:16px;height:16px;width:16px">check</mat-icon>
            } @else {
              {{ s.num }}
            }
          </div>
          <div class="hidden md:block">
            <p class="text-xs font-bold" [style.color]="currentStep() >= s.num ? 'var(--text-primary)' : 'var(--text-muted)'">
              {{ s.label }}
            </p>
            <p class="text-xs" style="color:var(--text-muted)">{{ s.desc }}</p>
          </div>
        </div>
        @if (!$last) {
          <div class="flex-1 h-0.5 mx-3 rounded-full"
               [style.background]="currentStep() > s.num ? 'var(--accent)' : 'var(--border-color)'"></div>
        }
      </div>
    }
  </div>

  <!-- ████████ ÉTAPE 1 : INFORMATIONS GÉNÉRALES ████████ -->
  @if (currentStep() === 1) {
    <div class="sms-card p-6 flex flex-col gap-5">
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Informations générales</h2>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold" style="color:var(--text-secondary)">Titre du cours *</label>
        <input [(ngModel)]="titre" placeholder="ex : Introduction à l'Algorithmique avec Python"
               class="px-4 py-3 rounded-xl border text-sm outline-none"
               style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary);font-size:15px">
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold" style="color:var(--text-secondary)">Description *</label>
        <textarea [(ngModel)]="description" rows="4"
                  placeholder="Décrivez le contenu et les objectifs pédagogiques de ce cours…"
                  class="px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Matière *</label>
          <select [(ngModel)]="matierePublicId"
                  class="px-4 py-3 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Sélectionner une matière —</option>
            @for (m of refStore.matieres(); track m.publicId) {
              <option [value]="m.publicId">{{ m.libelle }}</option>
            }
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Niveau</label>
          <select [(ngModel)]="niveauLibelle"
                  class="px-4 py-3 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Tous niveaux —</option>
            @for (n of refStore.niveaux(); track n.publicId) {
              <option [value]="n.libelle">{{ n.libelle }}</option>
            }
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Enseignant responsable</label>
          <input [(ngModel)]="enseignantNom" placeholder="ex : Prof. Kaboré Aristide"
                 class="px-4 py-3 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Durée estimée (heures)</label>
          <input type="number" [(ngModel)]="dureeHeures" min="1"
                 class="px-4 py-3 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>
      </div>
    </div>
  }

  <!-- ████████ ÉTAPE 2 : CHAPITRES & RESSOURCES ████████ -->
  @if (currentStep() === 2) {
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-bold text-lg" style="color:var(--text-primary)">Structure du cours</h2>
          <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
            {{ chapitres().length }} chapitre(s) · {{ totalRessources() }} ressource(s)
          </p>
        </div>
        <button (click)="addChapitre()"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
                style="background:var(--accent)">
          <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
          Ajouter un chapitre
        </button>
      </div>

      @for (ch of chapitres(); track ch.id; let i = $index) {
        <div class="sms-card overflow-hidden">
          <!-- Header chapitre -->
          <div class="flex items-center gap-3 px-5 py-4 cursor-pointer border-b"
               style="border-color:var(--border-color)"
               (click)="toggleChapitre(ch.id)">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                 style="background:var(--accent)">{{ i + 1 }}</div>
            <input [(ngModel)]="ch.titre"
                   (click)="$event.stopPropagation()"
                   placeholder="Titre du chapitre…"
                   class="flex-1 bg-transparent text-sm font-semibold outline-none"
                   style="color:var(--text-primary)">
            <div class="flex items-center gap-1">
              <span class="text-xs" style="color:var(--text-muted)">
                {{ ch.ressources.length }} ressource(s)
              </span>
              <mat-icon style="font-size:18px;height:18px;width:18px;color:var(--text-muted);transition:transform 200ms"
                        [style.transform]="ch.expanded ? 'rotate(180deg)' : 'none'">
                expand_more
              </mat-icon>
              <button (click)="removeChapitre(ch.id); $event.stopPropagation()"
                      class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 ml-1"
                      style="background:rgba(239,68,68,0.10);color:#dc2626">
                <mat-icon style="font-size:14px;height:14px;width:14px">delete</mat-icon>
              </button>
            </div>
          </div>

          <!-- Ressources du chapitre -->
          @if (ch.expanded) {
            <div class="px-5 py-4">
              @if (ch.ressources.length > 0) {
                <div class="flex flex-col gap-3 mb-4">
                  @for (r of ch.ressources; track r.id) {
                    <div class="flex items-center gap-3 p-3 rounded-xl"
                         style="background:var(--surface-2);border:1px solid var(--border-color)">
                      <!-- Type selector -->
                      <select [(ngModel)]="r.type"
                              class="px-2 py-1.5 rounded-lg border text-xs font-semibold"
                              style="border-color:var(--border-color);background:var(--surface-1);color:var(--text-primary)">
                        @for (t of ressourceTypes; track t.key) {
                          <option [value]="t.key">{{ t.label }}</option>
                        }
                      </select>
                      <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                           [style.background]="resCfg(r.type).bg">
                        <mat-icon [style.color]="resCfg(r.type).color"
                                  style="font-size:14px;height:14px;width:14px">{{ resCfg(r.type).icon }}</mat-icon>
                      </div>
                      <input [(ngModel)]="r.titre" placeholder="Titre de la ressource"
                             class="flex-1 bg-transparent text-xs outline-none"
                             style="color:var(--text-primary)">
                      <input [(ngModel)]="r.url" placeholder="URL / chemin"
                             class="w-40 bg-transparent text-xs outline-none"
                             style="color:var(--text-muted)">
                      <button (click)="removeRessource(ch.id, r.id)"
                              class="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80 shrink-0"
                              style="color:#dc2626">
                        <mat-icon style="font-size:14px;height:14px;width:14px">close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }
              <button (click)="addRessource(ch.id)"
                      class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:opacity-80"
                      style="background:var(--accent-light);color:var(--accent)">
                <mat-icon style="font-size:15px;height:15px;width:15px">add</mat-icon>
                Ajouter une ressource
              </button>
            </div>
          }
        </div>
      }

      @if (chapitres().length === 0) {
        <div class="sms-card p-12 flex flex-col items-center gap-4">
          <mat-icon style="font-size:56px;height:56px;width:56px;opacity:0.25;color:var(--accent)">menu_book</mat-icon>
          <p class="font-semibold" style="color:var(--text-secondary)">Aucun chapitre pour l'instant</p>
          <button (click)="addChapitre()"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
                  style="background:var(--accent)">
            <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
            Créer le premier chapitre
          </button>
        </div>
      }
    </div>
  }

  <!-- ████████ ÉTAPE 3 : RÉSUMÉ & PUBLICATION ████████ -->
  @if (currentStep() === 3) {
    <div class="flex flex-col gap-5">
      <!-- Récap -->
      <div class="sms-card p-6">
        <h2 class="font-bold text-lg mb-5" style="color:var(--text-primary)">Récapitulatif du cours</h2>
        <div class="flex flex-col gap-4">
          <div class="flex items-start gap-4 pb-4 border-b" style="border-color:var(--border-color)">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                 style="background:var(--accent)">
              <mat-icon style="color:#fff;font-size:24px;height:24px;width:24px">menu_book</mat-icon>
            </div>
            <div>
              <h3 class="font-bold text-lg" style="color:var(--text-primary)">{{ titre || '(Sans titre)' }}</h3>
              <p class="text-sm mt-1" style="color:var(--text-secondary)">{{ description }}</p>
              <div class="flex flex-wrap gap-3 mt-2 text-xs" style="color:var(--text-muted)">
                @if (matiereLibelle()) {
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:12px;height:12px;width:12px">book</mat-icon>
                    {{ matiereLibelle() }}
                  </span>
                }
                @if (niveauLibelle) {
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:12px;height:12px;width:12px">school</mat-icon>
                    {{ niveauLibelle }}
                  </span>
                }
                @if (dureeHeures) {
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:12px;height:12px;width:12px">schedule</mat-icon>
                    {{ dureeHeures }}h
                  </span>
                }
                @if (enseignantNom) {
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:12px;height:12px;width:12px">person</mat-icon>
                    {{ enseignantNom }}
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- Structure -->
          <div>
            <p class="text-xs font-bold uppercase tracking-wide mb-3" style="color:var(--text-muted)">
              Structure — {{ chapitres().length }} chapitre(s) · {{ totalRessources() }} ressource(s)
            </p>
            <div class="flex flex-col gap-2">
              @for (ch of chapitres(); track ch.id; let i = $index) {
                <div class="flex items-center gap-3 p-3 rounded-xl" style="background:var(--surface-2)">
                  <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style="background:var(--accent)">{{ i + 1 }}</span>
                  <span class="text-sm flex-1" style="color:var(--text-primary)">
                    {{ ch.titre || '(Chapitre sans titre)' }}
                  </span>
                  <span class="text-xs" style="color:var(--text-muted)">
                    {{ ch.ressources.length }} ressource(s)
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Choix statut publication -->
      <div class="sms-card p-5">
        <p class="text-xs font-bold uppercase tracking-wide mb-4" style="color:var(--text-muted)">Statut de publication</p>
        <div class="grid grid-cols-2 gap-3">
          <button (click)="statutCible = 'BROUILLON'"
                  class="flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-semibold transition-all"
                  [style.background]="statutCible === 'BROUILLON' ? 'rgba(107,114,128,0.12)' : 'var(--surface-2)'"
                  [style.border-color]="statutCible === 'BROUILLON' ? '#6b7280' : 'var(--border-color)'"
                  [style.color]="statutCible === 'BROUILLON' ? '#6b7280' : 'var(--text-secondary)'">
            <mat-icon style="font-size:28px;height:28px;width:28px">draft</mat-icon>
            <span>Sauvegarder en brouillon</span>
            <p class="text-xs text-center font-normal" style="color:var(--text-muted)">
              Cours non visible, modifiable à tout moment
            </p>
          </button>
          <button (click)="statutCible = 'PUBLIE'"
                  class="flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-semibold transition-all"
                  [style.background]="statutCible === 'PUBLIE' ? 'rgba(22,163,74,0.10)' : 'var(--surface-2)'"
                  [style.border-color]="statutCible === 'PUBLIE' ? '#16a34a' : 'var(--border-color)'"
                  [style.color]="statutCible === 'PUBLIE' ? '#16a34a' : 'var(--text-secondary)'">
            <mat-icon style="font-size:28px;height:28px;width:28px">public</mat-icon>
            <span>Publier maintenant</span>
            <p class="text-xs text-center font-normal" style="color:var(--text-muted)">
              Visible par les étudiants inscrits
            </p>
          </button>
        </div>
      </div>
    </div>
  }

  <!-- ── Navigation étapes ──────────────────────────────────────────────────── -->
  <div class="flex items-center justify-between mt-6">
    <button (click)="prevStep()"
            [disabled]="currentStep() === 1"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80 disabled:opacity-30"
            style="background:var(--surface-2);color:var(--text-secondary)">
      <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
      Précédent
    </button>

    <div class="flex items-center gap-2">
      @for (s of steps; track s.num) {
        <div class="w-2.5 h-2.5 rounded-full transition-all"
             [style.background]="currentStep() === s.num ? 'var(--accent)' : 'var(--border-color)'"
             [style.width]="currentStep() === s.num ? '20px' : '10px'"></div>
      }
    </div>

    @if (currentStep() < 3) {
      <button (click)="nextStep()"
              [disabled]="!canGoNext()"
              class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80 disabled:opacity-40"
              style="background:var(--accent)">
        Suivant
        <mat-icon style="font-size:16px;height:16px;width:16px">arrow_forward</mat-icon>
      </button>
    } @else {
      <button (click)="saveCours()"
              [disabled]="store.saving()"
              class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
              [style.background]="statutCible === 'PUBLIE' ? '#16a34a' : 'var(--accent)'">
        @if (store.saving()) {
          <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
        } @else {
          <mat-icon style="font-size:16px;height:16px;width:16px">
            {{ statutCible === 'PUBLIE' ? 'public' : 'save' }}
          </mat-icon>
        }
        {{ statutCible === 'PUBLIE' ? 'Publier le cours' : 'Enregistrer le brouillon' }}
      </button>
    }
  </div>

</div>
  `,
})
export class CoursEditorComponent implements OnInit {
  readonly store    = inject(LearningStore);
  readonly refStore = inject(ReferenceStore);
  readonly toast    = inject(ToastService);
  readonly router   = inject(Router);
  readonly route    = inject(ActivatedRoute);

  // ── État étapes ───────────────────────────────────────────────────────────
  currentStep = signal<Step>(1);
  editMode    = signal(false);

  readonly steps = [
    { num: 1, label:'Informations', desc:'Titre et paramètres' },
    { num: 2, label:'Structure',    desc:'Chapitres et ressources' },
    { num: 3, label:'Publication',  desc:'Révision et publication' },
  ];

  // ── Formulaire ────────────────────────────────────────────────────────────
  titre         = '';
  description   = '';
  matierePublicId = '';
  niveauLibelle = '';
  enseignantNom = '';
  dureeHeures: number | null = null;
  statutCible: StatutCours = 'BROUILLON';

  // ── Chapitres dynamiques ─────────────────────────────────────────────────
  private _chapitres = signal<ChapitreDraft[]>([]);
  readonly chapitres = this._chapitres.asReadonly();

  readonly totalRessources = computed(() =>
    this._chapitres().reduce((s, c) => s + c.ressources.length, 0)
  );

  readonly matiereLibelle = computed(() =>
    this.refStore.matieres().find(m => m.publicId === this.matierePublicId)?.libelle ?? ''
  );

  readonly ressourceTypes = Object.entries(TYPE_RESSOURCE_CFG).map(([key, v]) => ({
    key: key as TypeRessource, label: v.label,
  }));

  ngOnInit(): void {
    if (!this.refStore.loaded()) this.refStore.loadAll();
    // Pré-remplir un premier chapitre vide
    this.addChapitre();
  }

  // ── Navigation étapes ────────────────────────────────────────────────────
  nextStep(): void {
    if (this.canGoNext() && this.currentStep() < 3) {
      this.currentStep.update(s => (s + 1) as Step);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) this.currentStep.update(s => (s - 1) as Step);
  }

  canGoNext(): boolean {
    if (this.currentStep() === 1) return !!this.titre.trim() && !!this.description.trim();
    return true;
  }

  // ── Gestion chapitres ────────────────────────────────────────────────────
  addChapitre(): void {
    this._chapitres.update(list => [
      ...list,
      {
        id:         `ch-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
        titre:      '',
        ordre:      list.length + 1,
        ressources: [],
        expanded:   true,
      },
    ]);
  }

  removeChapitre(id: string): void {
    this._chapitres.update(list => list.filter(c => c.id !== id));
  }

  toggleChapitre(id: string): void {
    this._chapitres.update(list =>
      list.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c)
    );
  }

  // ── Gestion ressources ────────────────────────────────────────────────────
  addRessource(chapId: string): void {
    this._chapitres.update(list => list.map(c =>
      c.id !== chapId ? c : {
        ...c,
        ressources: [
          ...c.ressources,
          { id:`res-${Date.now()}`, titre:'', type:'PDF' as TypeRessource, url:'', vue:false },
        ],
      }
    ));
  }

  removeRessource(chapId: string, resId: string): void {
    this._chapitres.update(list => list.map(c =>
      c.id !== chapId ? c : { ...c, ressources: c.ressources.filter(r => r.id !== resId) }
    ));
  }

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  saveCours(): void {
    if (!this.titre.trim()) {
      this.toast.error('Le titre est obligatoire');
      this.currentStep.set(1);
      return;
    }

    const chapitres: IChapitre[] = this._chapitres().map((c, i) => ({
      publicId:   c.id,
      titre:      c.titre || `Chapitre ${i + 1}`,
      ordre:      i + 1,
      ressources: c.ressources.map(r => ({
        publicId: r.id,
        titre:    r.titre || 'Ressource',
        type:     r.type,
        url:      r.url,
        vue:      false,
      } as IRessource)),
    }));

    this.store.createCours({
      titre:            this.titre,
      description:      this.description,
      matierePublicId:  this.matierePublicId,
      matiereLibelle:   this.matiereLibelle(),
      niveauLibelle:    this.niveauLibelle || undefined,
      enseignantNom:    this.enseignantNom,
      dureeHeures:      this.dureeHeures ?? undefined,
      statut:           this.statutCible,
      chapitres,
      promotionPublicId: '',
    });

    this.toast.success(
      this.statutCible === 'PUBLIE' ? 'Cours publié avec succès !' : 'Cours enregistré en brouillon'
    );
    this.router.navigate(['/learning/cours']);
  }

  resCfg(t: string) { return TYPE_RESSOURCE_CFG[t] ?? TYPE_RESSOURCE_CFG['PDF']; }
}
