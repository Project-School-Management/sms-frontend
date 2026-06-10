import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReferenceStore, IAnneeAcademiqueRef, IPeriodeRef } from '@sms/config-system/data-access';
import { ToastService } from '@sms/shared/ui';

interface AnneeForm {
  publicId?:    string;
  libelle:      string;
  dateDebut:    string;
  dateFin:      string;
  description:  string;
  active:       boolean;
}

interface PeriodeForm {
  publicId?:               string;
  libelle:                 string;
  type:                    'SEMESTRE' | 'TRIMESTRE' | 'SESSION' | 'ANNUEL';
  ordre:                   number;
  dateDebut:               string;
  dateFin:                 string;
  anneeAcademiquePublicId: string;
  active:                  boolean;
}

const EMPTY_ANNEE: AnneeForm = {
  libelle:'', dateDebut:'', dateFin:'', description:'', active:false,
};
const EMPTY_PERIODE: PeriodeForm = {
  libelle:'', type:'SEMESTRE', ordre:1, dateDebut:'', dateFin:'',
  anneeAcademiquePublicId:'', active:false,
};

@Component({
  selector:        'sms-calendar-config',
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
      <mat-icon style="font-size:18px;height:18px;width:18px">arrow_back</mat-icon>
    </a>
    <div class="flex-1">
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Calendrier académique</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">Années académiques · Trimestres · Semestres · Sessions</p>
    </div>
    <div class="flex items-center gap-2">
      <button (click)="openPeriodeDialog()"
              class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
              style="background:var(--surface-2);color:var(--text-secondary);border:1px solid var(--border-color)">
        <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
        Nouvelle période
      </button>
      <button (click)="openAnneeDialog()"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
        Nouvelle année
      </button>
    </div>
  </div>

  <!-- ── Années académiques ─────────────────────────────────────────────────── -->
  <div class="sms-card overflow-hidden mb-6">
    <div class="px-5 py-4 border-b flex items-center justify-between" style="border-color:var(--border-color)">
      <h3 class="font-semibold" style="color:var(--text-primary)">Années académiques</h3>
      <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--surface-2);color:var(--text-muted)">
        {{ refStore.annees().length }} année(s)
      </span>
    </div>
    <div class="divide-y" style="border-color:var(--border-color)">
      @for (a of refStore.annees(); track a.publicId) {
        <div class="px-5 py-4 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               [style.background]="a.active ? 'rgba(22,163,74,0.12)' : 'var(--surface-2)'">
            <mat-icon [style.color]="a.active ? '#16a34a' : 'var(--text-muted)'"
                      style="font-size:20px;height:20px;width:20px">
              {{ a.active ? 'event_available' : 'calendar_today' }}
            </mat-icon>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <h3 class="font-bold" style="color:var(--text-primary)">{{ a.libelle }}</h3>
              @if (a.active) {
                <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                      style="background:rgba(22,163,74,0.12);color:#16a34a">● En cours</span>
              }
            </div>
            <p class="text-xs" style="color:var(--text-secondary)">
              {{ a.dateDebut | date:'dd/MM/yyyy' }} → {{ a.dateFin | date:'dd/MM/yyyy' }}
            </p>
            @if (a.description) {
              <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ a.description }}</p>
            }
          </div>
          <!-- Périodes chips -->
          <div class="flex gap-2 flex-wrap max-w-xs">
            @for (p of periodesForAnnee(a.publicId); track p.publicId) {
              <span class="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
                    [style.background]="p.active ? 'rgba(8,145,178,0.10)' : 'var(--surface-2)'"
                    [style.color]="p.active ? '#0891b2' : 'var(--text-muted)'">
                <mat-icon style="font-size:10px;height:10px;width:10px">schedule</mat-icon>
                {{ p.libelle }}
              </span>
            }
          </div>
          <!-- Actions -->
          <div class="flex gap-1 shrink-0">
            <button (click)="editAnnee(a)"
                    class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                    style="background:var(--accent-light);color:var(--accent)" title="Modifier">
              <mat-icon style="font-size:14px;height:14px;width:14px">edit</mat-icon>
            </button>
            @if (!a.active) {
              <button (click)="activerAnnee(a)"
                      class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                      style="background:rgba(22,163,74,0.10);color:#16a34a" title="Activer">
                <mat-icon style="font-size:14px;height:14px;width:14px">check_circle</mat-icon>
              </button>
            }
          </div>
        </div>
      }
    </div>
  </div>

  <!-- ── Timeline des périodes ──────────────────────────────────────────────── -->
  <div class="sms-card overflow-hidden">
    <div class="px-5 py-4 border-b flex items-center justify-between" style="border-color:var(--border-color)">
      <h3 class="font-semibold" style="color:var(--text-primary)">Périodes de l'année en cours</h3>
    </div>
    <div class="divide-y" style="border-color:var(--border-color)">
      @for (p of periodesAnneeActive(); track p.publicId) {
        <div class="px-5 py-4 flex items-center gap-4">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               [style.background]="p.type === 'TRIMESTRE' ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)'">
            <span class="text-xs font-black"
                  [style.color]="p.type === 'TRIMESTRE' ? '#d97706' : 'var(--accent)'">{{ p.ordre }}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-0.5">
              <p class="font-semibold" style="color:var(--text-primary)">{{ p.libelle }}</p>
              <span class="text-xs px-2 py-0.5 rounded font-medium"
                    [style.background]="p.type === 'TRIMESTRE' ? 'rgba(245,158,11,0.10)' : 'rgba(99,102,241,0.10)'"
                    [style.color]="p.type === 'TRIMESTRE' ? '#d97706' : 'var(--accent)'">{{ p.type }}</span>
              @if (p.active) {
                <span class="text-xs px-2 py-0.5 rounded-full font-bold"
                      style="background:rgba(22,163,74,0.10);color:#16a34a">● En cours</span>
              }
            </div>
            <p class="text-xs" style="color:var(--text-secondary)">
              {{ p.dateDebut | date:'dd MMM yyyy' }} → {{ p.dateFin | date:'dd MMM yyyy' }}
            </p>
          </div>
          <button (click)="editPeriode(p)"
                  class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 shrink-0"
                  style="background:var(--accent-light);color:var(--accent)">
            <mat-icon style="font-size:14px;height:14px;width:14px">edit</mat-icon>
          </button>
        </div>
      } @empty {
        <div class="px-5 py-8 text-center text-sm" style="color:var(--text-muted)">
          Aucune période configurée pour l'année en cours
        </div>
      }
    </div>
  </div>

</div>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- SLIDE-OVER : ANNÉE ACADÉMIQUE                                               -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
@if (showAnneeDialog()) {
  <div class="fixed inset-0 z-50 flex" style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="closeDialogs()">
    <div class="ml-auto w-full max-w-md h-full flex flex-col shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color:var(--border-color)">
        <h2 class="font-bold text-lg" style="color:var(--text-primary)">
          {{ anneeForm.publicId ? 'Modifier l\'année' : 'Nouvelle année académique' }}
        </h2>
        <button (click)="closeDialogs()"
                class="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style="background:var(--surface-2);color:var(--text-secondary)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Libellé *</label>
          <input [(ngModel)]="anneeForm.libelle" placeholder="ex : 2026-2027"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date de début *</label>
            <input type="date" [(ngModel)]="anneeForm.dateDebut"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date de fin *</label>
            <input type="date" [(ngModel)]="anneeForm.dateFin"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Description</label>
          <textarea [(ngModel)]="anneeForm.description" rows="3"
                    placeholder="Notes sur cette année académique…"
                    class="px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                    style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </textarea>
        </div>

        <div class="flex items-center gap-3 p-3 rounded-xl"
             style="background:var(--surface-2);border:1px solid var(--border-color)">
          <input type="checkbox" [(ngModel)]="anneeForm.active" id="activeAnnee" class="rounded w-4 h-4">
          <label for="activeAnnee" class="text-sm font-semibold cursor-pointer" style="color:var(--text-primary)">
            Année académique en cours
          </label>
        </div>

      </div>
      <div class="px-6 py-4 border-t flex items-center justify-end gap-3" style="border-color:var(--border-color)">
        <button (click)="closeDialogs()"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
        <button (click)="saveAnnee()"
                class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80"
                style="background:var(--accent)">
          <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
          {{ anneeForm.publicId ? 'Enregistrer' : 'Créer' }}
        </button>
      </div>
    </div>
  </div>
}

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- SLIDE-OVER : PÉRIODE                                                        -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
@if (showPeriodeDialog()) {
  <div class="fixed inset-0 z-50 flex" style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="closeDialogs()">
    <div class="ml-auto w-full max-w-md h-full flex flex-col shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color:var(--border-color)">
        <h2 class="font-bold text-lg" style="color:var(--text-primary)">
          {{ periodeForm.publicId ? 'Modifier la période' : 'Nouvelle période' }}
        </h2>
        <button (click)="closeDialogs()"
                class="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style="background:var(--surface-2);color:var(--text-secondary)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Libellé *</label>
          <input [(ngModel)]="periodeForm.libelle" placeholder="ex : Semestre 1"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Type</label>
            <select [(ngModel)]="periodeForm.type"
                    class="px-3 py-2 rounded-xl border text-sm outline-none"
                    style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
              @for (t of typePeriodeOptions; track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Ordre</label>
            <input type="number" [(ngModel)]="periodeForm.ordre" min="1" max="4"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Année académique *</label>
          <select [(ngModel)]="periodeForm.anneeAcademiquePublicId"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Sélectionner —</option>
            @for (a of refStore.annees(); track a.publicId) {
              <option [value]="a.publicId">{{ a.libelle }}{{ a.active ? ' ★' : '' }}</option>
            }
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date début</label>
            <input type="date" [(ngModel)]="periodeForm.dateDebut"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date fin</label>
            <input type="date" [(ngModel)]="periodeForm.dateFin"
                   class="px-3 py-2 rounded-xl border text-sm outline-none"
                   style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          </div>
        </div>

        <div class="flex items-center gap-3 p-3 rounded-xl"
             style="background:var(--surface-2);border:1px solid var(--border-color)">
          <input type="checkbox" [(ngModel)]="periodeForm.active" id="activePeriode" class="rounded w-4 h-4">
          <label for="activePeriode" class="text-sm font-semibold cursor-pointer" style="color:var(--text-primary)">
            Période en cours
          </label>
        </div>

      </div>
      <div class="px-6 py-4 border-t flex items-center justify-end gap-3" style="border-color:var(--border-color)">
        <button (click)="closeDialogs()"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
        <button (click)="savePeriode()"
                class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80"
                style="background:var(--accent)">
          <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
          {{ periodeForm.publicId ? 'Enregistrer' : 'Créer' }}
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class CalendarConfigComponent implements OnInit {
  readonly refStore = inject(ReferenceStore);
  readonly toast    = inject(ToastService);

  readonly showAnneeDialog   = signal(false);
  readonly showPeriodeDialog = signal(false);
  anneeForm:   AnneeForm   = { ...EMPTY_ANNEE };
  periodeForm: PeriodeForm = { ...EMPTY_PERIODE };

  readonly typePeriodeOptions = ['SEMESTRE','TRIMESTRE','SESSION','ANNUEL'] as const;

  ngOnInit(): void { if (!this.refStore.loaded()) this.refStore.loadAll(); }

  periodesForAnnee(anneeId: string): IPeriodeRef[] {
    return this.refStore.periodes().filter(p => p.anneeAcademiquePublicId === anneeId);
  }

  periodesAnneeActive(): IPeriodeRef[] {
    const active = this.refStore.anneeActive();
    return active ? this.periodesForAnnee(active.publicId) : this.refStore.periodes();
  }

  // ── Années ───────────────────────────────────────────────────────────────
  openAnneeDialog(): void {
    this.anneeForm = { ...EMPTY_ANNEE };
    this.showAnneeDialog.set(true);
  }

  editAnnee(a: IAnneeAcademiqueRef): void {
    this.anneeForm = {
      publicId:    a.publicId,
      libelle:     a.libelle,
      dateDebut:   a.dateDebut,
      dateFin:     a.dateFin,
      description: a.description ?? '',
      active:      a.active,
    };
    this.showAnneeDialog.set(true);
  }

  activerAnnee(a: IAnneeAcademiqueRef): void {
    this.toast.info(`${a.libelle} sera activée — simulation mock`);
  }

  saveAnnee(): void {
    if (!this.anneeForm.libelle || !this.anneeForm.dateDebut || !this.anneeForm.dateFin) {
      this.toast.error('Libellé et dates sont obligatoires');
      return;
    }
    this.toast.success(this.anneeForm.publicId ? 'Année mise à jour' : 'Année académique créée');
    this.closeDialogs();
  }

  // ── Périodes ─────────────────────────────────────────────────────────────
  openPeriodeDialog(): void {
    this.periodeForm = { ...EMPTY_PERIODE };
    const active = this.refStore.anneeActive();
    if (active) this.periodeForm.anneeAcademiquePublicId = active.publicId;
    this.showPeriodeDialog.set(true);
  }

  editPeriode(p: IPeriodeRef): void {
    this.periodeForm = {
      publicId:               p.publicId,
      libelle:                p.libelle,
      type:                   p.type as PeriodeForm['type'],
      ordre:                  p.ordre,
      dateDebut:              p.dateDebut,
      dateFin:                p.dateFin,
      anneeAcademiquePublicId:p.anneeAcademiquePublicId,
      active:                 p.active,
    };
    this.showPeriodeDialog.set(true);
  }

  savePeriode(): void {
    if (!this.periodeForm.libelle) {
      this.toast.error('Le libellé est obligatoire');
      return;
    }
    this.toast.success(this.periodeForm.publicId ? 'Période mise à jour' : 'Période créée');
    this.closeDialogs();
  }

  closeDialogs(): void {
    this.showAnneeDialog.set(false);
    this.showPeriodeDialog.set(false);
  }
}
