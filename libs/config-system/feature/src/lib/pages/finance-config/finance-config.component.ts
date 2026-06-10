import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReferenceStore, ITypeFraisRef } from '@sms/config-system/data-access';
import { ToastService } from '@sms/shared/ui';

type CategorieFrais = 'INSCRIPTION' | 'SCOLARITE' | 'CANTINE' | 'TRANSPORT' | 'AUTRE';

interface FraisForm {
  publicId?:       string;
  code:            string;
  libelle:         string;
  categorie:       CategorieFrais;
  montant:         number;
  obligatoire:     boolean;
  niveauPublicId:  string;
  description:     string;
}

const EMPTY_FRAIS: FraisForm = {
  code:'', libelle:'', categorie:'SCOLARITE', montant:0,
  obligatoire:true, niveauPublicId:'', description:'',
};

const CAT_CFG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  INSCRIPTION: { label:'Inscription',  icon:'app_registration', color:'var(--accent)', bg:'var(--accent-light)' },
  SCOLARITE:   { label:'Scolarité',    icon:'school',           color:'#10b981',        bg:'rgba(16,185,129,0.10)' },
  CANTINE:     { label:'Cantine',      icon:'restaurant',       color:'#f59e0b',        bg:'rgba(245,158,11,0.10)' },
  TRANSPORT:   { label:'Transport',    icon:'directions_bus',   color:'#8b5cf6',        bg:'rgba(139,92,246,0.10)' },
  AUTRE:       { label:'Autre',        icon:'more_horiz',       color:'#6b7280',        bg:'rgba(107,114,128,0.10)' },
};

@Component({
  selector:        'sms-finance-config',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-center gap-3 mb-6">
    <a routerLink="/config"
       class="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70"
       style="background:var(--surface-2);color:var(--text-secondary)">
      <mat-icon style="font-size:18px;height:18px;width:16px">arrow_back</mat-icon>
    </a>
    <div class="flex-1">
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Référentiels financiers</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">Types de frais · Bourses · Réductions</p>
    </div>
    <button (click)="showFraisDialog.set(true)"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
            style="background:var(--accent)">
      <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
      Nouveau type de frais
    </button>
  </div>

  <!-- ── KPIs ──────────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
    @for (cat of categoriesStats(); track cat.key) {
      <div class="sms-card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             [style.background]="catCfg(cat.key).bg">
          <mat-icon [style.color]="catCfg(cat.key).color"
                    style="font-size:18px;height:18px;width:18px">{{ catCfg(cat.key).icon }}</mat-icon>
        </div>
        <div>
          <p class="text-xl font-bold" style="color:var(--text-primary)">{{ cat.count }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">{{ catCfg(cat.key).label }}</p>
        </div>
      </div>
    }
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <!-- ── Types de frais (CRUD) ────────────────────────────────────────────── -->
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b flex items-center gap-3" style="border-color:var(--border-color)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center"
             style="background:rgba(22,163,74,0.12)">
          <mat-icon style="color:#16a34a;font-size:18px;height:18px;width:18px">receipt_long</mat-icon>
        </div>
        <h3 class="font-semibold flex-1" style="color:var(--text-primary)">
          Types de frais
          <span class="ml-1.5 text-xs font-normal px-1.5 py-0.5 rounded-full"
                style="background:var(--surface-2);color:var(--text-muted)">
            {{ refStore.typesFrais().length }}
          </span>
        </h3>
      </div>
      <div class="divide-y" style="border-color:var(--border-color)">
        @for (f of refStore.typesFrais(); track f.publicId) {
          <div class="px-5 py-3.5 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                 [style.background]="catCfg(f.categorie).bg">
              <mat-icon [style.color]="catCfg(f.categorie).color"
                        style="font-size:14px;height:14px;width:14px">{{ catCfg(f.categorie).icon }}</mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate" style="color:var(--text-primary)">{{ f.libelle }}</p>
              <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                <span class="text-xs px-1.5 py-0.5 rounded font-medium"
                      [style.background]="catCfg(f.categorie).bg"
                      [style.color]="catCfg(f.categorie).color">{{ catCfg(f.categorie).label }}</span>
                @if (f.obligatoire) {
                  <span class="text-xs" style="color:#d97706">Obligatoire</span>
                }
                @if (f.niveauPublicId) {
                  <span class="text-xs" style="color:var(--text-muted)">
                    · {{ niveauLibelle(f.niveauPublicId) }}
                  </span>
                }
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold" style="color:var(--accent)">
                {{ f.montant | number:'1.0-0' }} XOF
              </p>
              <span class="text-xs px-1.5 py-0.5 rounded-full"
                    [style.background]="f.active ? 'rgba(22,163,74,0.10)' : 'rgba(107,114,128,0.10)'"
                    [style.color]="f.active ? '#16a34a' : '#6b7280'">
                {{ f.active ? 'Actif' : 'Inactif' }}
              </span>
            </div>
            <div class="flex gap-1 shrink-0">
              <button (click)="editFrais(f)"
                      class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                      style="background:var(--accent-light);color:var(--accent)">
                <mat-icon style="font-size:13px;height:13px;width:13px">edit</mat-icon>
              </button>
            </div>
          </div>
        }
      </div>
      <div class="px-5 py-3 border-t flex items-center justify-between"
           style="border-color:var(--border-color);background:var(--surface-2)">
        <span class="text-xs font-semibold" style="color:var(--text-secondary)">Frais inscription fixe</span>
        <span class="text-sm font-black" style="color:var(--accent)">
          {{ refStore.fraisInscriptionMontant() | number:'1.0-0' }} XOF
        </span>
      </div>
    </div>

    <!-- ── Types de bourses (lecture seule pour l'instant) ──────────────────── -->
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b flex items-center gap-3" style="border-color:var(--border-color)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center"
             style="background:rgba(99,102,241,0.12)">
          <mat-icon style="color:var(--accent);font-size:18px;height:18px;width:18px">card_giftcard</mat-icon>
        </div>
        <h3 class="font-semibold flex-1" style="color:var(--text-primary)">Types de bourses</h3>
        <span class="text-xs px-2 py-1 rounded-lg" style="background:var(--surface-2);color:var(--text-muted)">
          {{ refStore.typesBourses().length }} types
        </span>
      </div>
      <div class="divide-y" style="border-color:var(--border-color)">
        @for (b of refStore.typesBourses(); track b.publicId) {
          <div class="px-5 py-4 flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ b.libelle }}</p>
                <span class="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      [style.background]="b.active ? 'rgba(22,163,74,0.10)' : 'rgba(107,114,128,0.10)'"
                      [style.color]="b.active ? '#16a34a' : '#6b7280'">
                  {{ b.active ? 'Actif' : 'Inactif' }}
                </span>
              </div>
              @if (b.conditions) {
                <p class="text-xs" style="color:var(--text-muted)">{{ b.conditions }}</p>
              }
            </div>
            @if (b.montantMax) {
              <div class="shrink-0 text-right">
                <p class="text-sm font-bold" style="color:#16a34a">
                  max {{ b.montantMax | number:'1.0-0' }} XOF
                </p>
              </div>
            }
          </div>
        }
      </div>
    </div>

  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- SLIDE-OVER : DIALOG TYPE DE FRAIS                                          -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
@if (showFraisDialog()) {
  <div class="fixed inset-0 z-50 flex" style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="closeDialog()">
    <div class="ml-auto w-full max-w-md h-full flex flex-col shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color:var(--border-color)">
        <div>
          <h2 class="font-bold text-lg" style="color:var(--text-primary)">
            {{ fraisForm.publicId ? 'Modifier le type de frais' : 'Nouveau type de frais' }}
          </h2>
        </div>
        <button (click)="closeDialog()"
                class="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style="background:var(--surface-2);color:var(--text-secondary)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Code *</label>
            <input [(ngModel)]="fraisForm.code" placeholder="ex : SCOL-L3"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Libellé *</label>
            <input [(ngModel)]="fraisForm.libelle" placeholder="ex : Frais de scolarité L3"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Catégorie</label>
          <div class="grid grid-cols-3 gap-2">
            @for (cat of categoriesOptions; track cat) {
              <button (click)="fraisForm.categorie = cat"
                      class="flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all"
                      [style.background]="fraisForm.categorie === cat ? catCfg(cat).bg : 'var(--surface-2)'"
                      [style.border-color]="fraisForm.categorie === cat ? catCfg(cat).color : 'var(--border-color)'"
                      [style.color]="fraisForm.categorie === cat ? catCfg(cat).color : 'var(--text-secondary)'">
                <mat-icon style="font-size:16px;height:16px;width:16px">{{ catCfg(cat).icon }}</mat-icon>
                {{ catCfg(cat).label }}
              </button>
            }
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Montant (XOF) *</label>
          <input type="number" [(ngModel)]="fraisForm.montant" min="0" step="5000"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Niveau concerné (optionnel)</label>
          <select [(ngModel)]="fraisForm.niveauPublicId"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Tous les niveaux —</option>
            @for (n of refStore.niveaux(); track n.publicId) {
              <option [value]="n.publicId">{{ n.libelle }}</option>
            }
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Description</label>
          <textarea [(ngModel)]="fraisForm.description" rows="3"
                    placeholder="Description ou conditions d'application…"
                    class="px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                    style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </textarea>
        </div>

        <div class="flex items-center gap-3 p-3 rounded-xl"
             style="background:var(--surface-2);border:1px solid var(--border-color)">
          <input type="checkbox" [(ngModel)]="fraisForm.obligatoire" id="obligatoire" class="rounded w-4 h-4">
          <label for="obligatoire" class="text-sm font-semibold cursor-pointer" style="color:var(--text-primary)">
            Frais obligatoire
          </label>
          <span class="text-xs ml-auto" style="color:var(--text-muted)">
            Sera automatiquement ajouté lors de l'inscription
          </span>
        </div>

      </div>
      <div class="px-6 py-4 border-t flex items-center justify-end gap-3" style="border-color:var(--border-color)">
        <button (click)="closeDialog()"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
        <button (click)="saveFrais()"
                [disabled]="refStore.saving()"
                class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                style="background:var(--accent)">
          <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
          {{ fraisForm.publicId ? 'Enregistrer' : 'Créer' }}
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class FinanceConfigComponent implements OnInit {
  readonly refStore = inject(ReferenceStore);
  readonly toast    = inject(ToastService);

  readonly showFraisDialog = signal(false);
  fraisForm: FraisForm = { ...EMPTY_FRAIS };

  readonly categoriesOptions: CategorieFrais[] = ['INSCRIPTION','SCOLARITE','CANTINE','TRANSPORT','AUTRE'];

  readonly categoriesStats = () =>
    this.categoriesOptions.map(key => ({
      key,
      count: this.refStore.typesFrais().filter(f => f.categorie === key).length,
    })).filter(c => c.count > 0);

  ngOnInit(): void { if (!this.refStore.loaded()) this.refStore.loadAll(); }

  niveauLibelle(id: string): string {
    return this.refStore.niveaux().find(n => n.publicId === id)?.libelle ?? id;
  }

  editFrais(f: ITypeFraisRef): void {
    this.fraisForm = {
      publicId:       f.publicId,
      code:           f.code,
      libelle:        f.libelle,
      categorie:      f.categorie as CategorieFrais,
      montant:        f.montant,
      obligatoire:    f.obligatoire,
      niveauPublicId: f.niveauPublicId ?? '',
      description:    f.description ?? '',
    };
    this.showFraisDialog.set(true);
  }

  saveFrais(): void {
    if (!this.fraisForm.code || !this.fraisForm.libelle) {
      this.toast.error('Code et libellé sont obligatoires');
      return;
    }
    this.refStore.saveTypeFrais({
      ...this.fraisForm,
      niveauPublicId: this.fraisForm.niveauPublicId || undefined,
      active: true,
    } as Partial<ITypeFraisRef>);
    this.toast.success(this.fraisForm.publicId ? 'Type de frais mis à jour' : 'Type de frais créé');
    this.closeDialog();
  }

  closeDialog(): void {
    this.showFraisDialog.set(false);
    this.fraisForm = { ...EMPTY_FRAIS };
  }

  catCfg(cat: string) {
    return CAT_CFG[cat] ?? CAT_CFG['AUTRE'];
  }
}
