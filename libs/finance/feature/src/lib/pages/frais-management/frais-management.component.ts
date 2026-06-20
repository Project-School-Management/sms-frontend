import {
  Component, inject, OnInit, ChangeDetectionStrategy, signal, computed,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FinanceStore }  from '@sms/finance/data-access';
import { ReferenceStore } from '@sms/config-system/data-access';
import { ToastService }   from '@sms/shared/ui';
import { IFraisScolarite } from '@sms/shared/models';

type TypeFrais = 'INSCRIPTION' | 'SCOLARITE' | 'RESTAURATION' | 'TRANSPORT' | 'AUTRE';

const TYPE_CFG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  INSCRIPTION:  { label:'Inscription',  icon:'app_registration', color:'var(--accent)', bg:'var(--accent-light)' },
  SCOLARITE:    { label:'Scolarité',    icon:'school',           color:'#16a34a',        bg:'rgba(22,163,74,0.10)' },
  RESTAURATION: { label:'Restauration', icon:'restaurant',       color:'#f59e0b',        bg:'rgba(245,158,11,0.10)' },
  TRANSPORT:    { label:'Transport',    icon:'directions_bus',   color:'#8b5cf6',        bg:'rgba(139,92,246,0.10)' },
  AUTRE:        { label:'Autre',        icon:'more_horiz',       color:'#6b7280',        bg:'rgba(107,114,128,0.10)' },
};

interface FraisForm {
  publicId?:       string;
  libelle:         string;
  typeFrais:       TypeFrais;
  montant:         number;
  dateEcheance:    string;
}

const EMPTY_FORM = (): FraisForm => ({
  libelle:'', typeFrais:'SCOLARITE', montant:0, dateEcheance:'',
});

@Component({
  selector:        'sms-frais-management',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Gestion des frais</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Frais de scolarité opérationnels · Année académique 2025-2026
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <a routerLink="/finance/invoices"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">receipt_long</mat-icon>
        Factures
      </a>
      <a routerLink="/config/finance"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">settings</mat-icon>
        Référentiels
      </a>
      <button (click)="openCreateDialog()"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
        Ajouter des frais
      </button>
    </div>
  </div>

  <!-- ── KPIs par type ─────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
    @for (t of typeStats(); track t.type) {
      <div class="sms-card p-4 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
           (click)="typeFilter = typeFilter === t.type ? '' : t.type"
           [style.border-color]="typeFilter === t.type ? typeCfg(t.type).color : 'var(--border-color)'"
           [style.border-width]="typeFilter === t.type ? '2px' : '1px'">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
             [style.background]="typeCfg(t.type).bg">
          <mat-icon [style.color]="typeCfg(t.type).color"
                    style="font-size:17px;height:17px;width:17px">{{ typeCfg(t.type).icon }}</mat-icon>
        </div>
        <div>
          <p class="text-xl font-bold" style="color:var(--text-primary)">{{ t.count }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">{{ typeCfg(t.type).label }}</p>
        </div>
      </div>
    }
  </div>

  <!-- ── Table frais ───────────────────────────────────────────────────────── -->
  @if (store.loading()) {
    <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement…
    </div>
  } @else {
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-3 border-b flex items-center gap-3" style="border-color:var(--border-color)">
        <h3 class="font-semibold flex-1" style="color:var(--text-primary)">
          Frais configurés
          <span class="ml-1.5 text-xs font-normal px-1.5 py-0.5 rounded-full"
                style="background:var(--surface-2);color:var(--text-muted)">
            {{ fraisFiltres().length }} ligne(s)
          </span>
        </h3>
        <div class="relative">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style="font-size:15px;height:15px;width:15px;color:var(--text-muted)">search</mat-icon>
          <input type="text" [(ngModel)]="searchQuery"
                 placeholder="Rechercher…"
                 class="pl-8 pr-3 py-1.5 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary);width:180px">
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              @for (h of tableHeaders; track h) {
                <th class="text-left px-5 py-3 font-bold text-xs uppercase tracking-wide" style="color:var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (f of fraisFiltres(); track f.publicId) {
              <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
                <td class="px-5 py-3">
                  <span class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold w-fit"
                        [style.background]="typeCfg(f.typeFrais).bg"
                        [style.color]="typeCfg(f.typeFrais).color">
                    <mat-icon style="font-size:11px;height:11px;width:11px">{{ typeCfg(f.typeFrais).icon }}</mat-icon>
                    {{ typeCfg(f.typeFrais).label }}
                  </span>
                </td>
                <td class="px-5 py-3 font-semibold" style="color:var(--text-primary)">{{ f.libelle }}</td>
                <td class="px-5 py-3 font-bold" style="color:var(--accent)">{{ fmt(f.montant) }}</td>
                <td class="px-5 py-3 text-xs"
                    [style.color]="f.dateEcheance ? 'var(--text-secondary)' : 'var(--text-muted)'">
                  {{ f.dateEcheance ? (f.dateEcheance | date:'dd/MM/yyyy') : 'Sans échéance' }}
                </td>
                <td class="px-5 py-3">
                  <div class="flex items-center gap-1">
                    <button (click)="editFrais(f)"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            style="background:var(--accent-light);color:var(--accent)">
                      <mat-icon style="font-size:13px;height:13px;width:13px">edit</mat-icon>
                    </button>
                    <button (click)="confirmDelete(f)"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            style="background:rgba(239,68,68,0.10);color:#dc2626">
                      <mat-icon style="font-size:13px;height:13px;width:13px">delete</mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-5 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <mat-icon style="font-size:48px;height:48px;width:48px;opacity:0.3">receipt</mat-icon>
                  <p class="font-semibold" style="color:var(--text-secondary)">Aucun frais configuré</p>
                </div>
              </td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3 border-t flex items-center justify-between text-xs"
           style="border-color:var(--border-color);background:var(--surface-2)">
        <span style="color:var(--text-muted)">Total référentiel :</span>
        <span class="font-bold" style="color:var(--accent)">
          {{ fmt(totalMontant()) }}
        </span>
      </div>
    </div>
  }

</div>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- SLIDE-OVER : FRAIS                                                          -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
@if (showDialog()) {
  <div class="fixed inset-0 z-50 flex" style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="closeDialog()">
    <div class="ml-auto w-full max-w-md h-full flex flex-col shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color:var(--border-color)">
        <h2 class="font-bold text-lg" style="color:var(--text-primary)">
          {{ fraisForm.publicId ? 'Modifier les frais' : 'Ajouter des frais' }}
        </h2>
        <button (click)="closeDialog()"
                class="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style="background:var(--surface-2);color:var(--text-secondary)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        <!-- Type frais — sélecteur visuel -->
        <div class="flex flex-col gap-2">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Type de frais *</label>
          <div class="grid grid-cols-3 gap-2">
            @for (t of typeOptions; track t) {
              <button (click)="fraisForm.typeFrais = t"
                      class="flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all"
                      [style.background]="fraisForm.typeFrais === t ? typeCfg(t).bg : 'var(--surface-2)'"
                      [style.border-color]="fraisForm.typeFrais === t ? typeCfg(t).color : 'var(--border-color)'"
                      [style.color]="fraisForm.typeFrais === t ? typeCfg(t).color : 'var(--text-secondary)'">
                <mat-icon style="font-size:18px;height:18px;width:18px">{{ typeCfg(t).icon }}</mat-icon>
                {{ typeCfg(t).label }}
              </button>
            }
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Libellé *</label>
          <input [(ngModel)]="fraisForm.libelle" placeholder="ex : Frais de scolarité S2"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Montant (XOF) *</label>
          <input type="number" [(ngModel)]="fraisForm.montant" min="0" step="1000"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          @if (fraisForm.montant > 0) {
            <p class="text-sm font-bold" style="color:var(--accent)">{{ fmt(fraisForm.montant) }}</p>
          }
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date d'échéance (optionnel)</label>
          <input type="date" [(ngModel)]="fraisForm.dateEcheance"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

      </div>
      <div class="px-6 py-4 border-t flex items-center justify-end gap-3" style="border-color:var(--border-color)">
        <button (click)="closeDialog()"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
        <button (click)="saveFrais()"
                [disabled]="store.saving()"
                class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                style="background:var(--accent)">
          <mat-icon style="font-size:16px;height:16px;width:16px">save</mat-icon>
          {{ fraisForm.publicId ? 'Enregistrer' : 'Créer' }}
        </button>
      </div>
    </div>
  </div>
}

<!-- ── Dialog confirmation suppression ─────────────────────────────────────── -->
@if (deleteTarget()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
       style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="deleteTarget.set(null)">
    <div class="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
           style="background:rgba(239,68,68,0.10)">
        <mat-icon style="color:#dc2626;font-size:24px;height:24px;width:24px">delete_forever</mat-icon>
      </div>
      <div class="text-center">
        <h3 class="font-bold text-lg" style="color:var(--text-primary)">Supprimer ces frais ?</h3>
        <p class="text-sm mt-1" style="color:var(--text-secondary)">
          <strong>{{ deleteTarget()?.libelle }}</strong> — {{ fmt(deleteTarget()?.montant ?? 0) }}
        </p>
      </div>
      <div class="flex gap-3">
        <button (click)="deleteTarget.set(null)"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
        <button (click)="doDelete()"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-80"
                style="background:#dc2626">Supprimer</button>
      </div>
    </div>
  </div>
}
  `,
})
export class FraisManagementComponent implements OnInit {
  readonly store    = inject(FinanceStore);
  readonly refStore = inject(ReferenceStore);
  readonly toast    = inject(ToastService);

  readonly tableHeaders = ['Type', 'Libellé', 'Montant', "Date d'échéance", 'Actions'];

  searchQuery  = '';
  typeFilter   = '';
  showDialog   = signal(false);
  deleteTarget = signal<IFraisScolarite | null>(null);
  fraisForm: FraisForm = EMPTY_FORM();

  readonly typeOptions: TypeFrais[] = ['INSCRIPTION','SCOLARITE','RESTAURATION','TRANSPORT','AUTRE'];

  readonly typeStats = computed(() =>
    this.typeOptions.map(type => ({
      type,
      count: this.store.frais().filter(f => f.typeFrais === type).length,
    })).filter(t => t.count > 0)
  );

  readonly fraisFiltres = computed(() => {
    let list = this.store.frais();
    if (this.typeFilter) list = list.filter(f => f.typeFrais === this.typeFilter);
    if (this.searchQuery) list = list.filter(f =>
      f.libelle.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    return list;
  });

  readonly totalMontant = computed(() =>
    this.store.frais().reduce((s, f) => s + f.montant, 0)
  );

  ngOnInit(): void {
    this.store.loadFrais(1);
    if (!this.refStore.loaded()) this.refStore.loadAll();
  }

  openCreateDialog(): void {
    this.fraisForm = EMPTY_FORM();
    this.showDialog.set(true);
  }

  editFrais(f: IFraisScolarite): void {
    this.fraisForm = {
      publicId:     f.publicId,
      libelle:      f.libelle,
      typeFrais:    f.typeFrais as TypeFrais,
      montant:      f.montant,
      dateEcheance: f.dateEcheance ?? '',
    };
    this.showDialog.set(true);
  }

  saveFrais(): void {
    if (!this.fraisForm.libelle || !this.fraisForm.montant) {
      this.toast.error('Libellé et montant sont obligatoires');
      return;
    }
    this.store.createFrais({
      anneeAcademiqueId: 1,
      libelle:           this.fraisForm.libelle,
      typeFrais:         this.fraisForm.typeFrais,
      montant:           this.fraisForm.montant,
      ...(this.fraisForm.dateEcheance ? { dateEcheance: this.fraisForm.dateEcheance } : {}),
    });
    this.closeDialog();
  }

  confirmDelete(f: IFraisScolarite): void { this.deleteTarget.set(f); }
  doDelete(): void {
    const f = this.deleteTarget();
    if (f) {
      this.store.deleteFrais(f.publicId);
      this.toast.success(`${f.libelle} supprimé`);
    }
    this.deleteTarget.set(null);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.fraisForm = EMPTY_FORM();
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits:0 }).format(n) + ' XOF';
  }

  typeCfg(t: string) { return TYPE_CFG[t] ?? TYPE_CFG['AUTRE']; }
}
