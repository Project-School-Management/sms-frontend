import {
  Component, inject, OnInit, ChangeDetectionStrategy, computed, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { IFacture, StatutFacture } from '@sms/shared/models';
import { FinanceStore, STUDENT_NAMES } from '@sms/finance/data-access';
import { ReferenceStore } from '@sms/config-system/data-access';
import { ToastService, SkeletonTableComponent, EmptyStateComponent } from '@sms/shared/ui';
import { PaymentDialogComponent } from '../../components/payment-dialog/payment-dialog.component';

// ── Config statuts ────────────────────────────────────────────────────────────
const STATUT_CFG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  BROUILLON:           { label:'Brouillon',  bg:'rgba(107,114,128,0.10)', color:'#6b7280', icon:'draft'         },
  EMISE:               { label:'Émise',      bg:'rgba(37,99,235,0.10)',   color:'var(--accent)', icon:'send'   },
  PARTIELLEMENT_PAYEE: { label:'Partielle',  bg:'rgba(245,158,11,0.10)', color:'#d97706', icon:'hourglass_top' },
  PAYEE:               { label:'Payée',      bg:'rgba(22,163,74,0.10)',   color:'#16a34a', icon:'check_circle' },
  EN_RETARD:           { label:'En retard',  bg:'rgba(239,68,68,0.10)',   color:'#dc2626', icon:'warning'      },
  ANNULEE:             { label:'Annulée',    bg:'rgba(107,114,128,0.10)', color:'#6b7280', icon:'cancel'       },
};

interface FactureForm {
  studentId:      number;
  montantTotal:   number;
  dateEcheance:   string;
  fraisPublicId:  string;
}

const EMPTY_FORM = (): FactureForm => ({
  studentId: 0, montantTotal: 0,
  dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  fraisPublicId: '',
});

const STUDENTS = Object.entries(STUDENT_NAMES).map(([id, nom]) => ({ id: +id, nom }));

@Component({
  selector:        'sms-invoice-list',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, FormsModule, MatIconModule, MatDialogModule,
    SkeletonTableComponent, EmptyStateComponent,
  ],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Factures</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Gestion des factures et paiements étudiants
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <a routerLink="/finance"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        Tableau de bord
      </a>
      <a routerLink="/finance/frais"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">receipt</mat-icon>
        Gérer les frais
      </a>
      <button (click)="showNewDialog.set(true)"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
        Nouvelle facture
      </button>
    </div>
  </div>

  <!-- ── KPI Cards ─────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
    @for (kpi of kpis(); track kpi.label) {
      <div class="sms-card p-4 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
           (click)="filtreStatut = kpi.statut === filtreStatut ? '' : kpi.statut">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             [style.background]="kpi.bg">
          <mat-icon [style.color]="kpi.color"
                    style="font-size:18px;height:18px;width:18px">{{ kpi.icon }}</mat-icon>
        </div>
        <div>
          <p class="text-xl font-bold" style="color:var(--text-primary)">{{ kpi.count }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">{{ kpi.label }}</p>
        </div>
      </div>
    }
  </div>

  <!-- ── Filtres ────────────────────────────────────────────────────────────── -->
  <div class="flex flex-wrap items-center gap-3 mb-4">
    <div class="relative flex-1 min-w-40">
      <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style="font-size:16px;height:16px;width:16px;color:var(--text-muted)">search</mat-icon>
      <input type="text" [(ngModel)]="searchQuery"
             placeholder="Numéro de facture, étudiant…"
             class="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none"
             style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
    </div>
    <select [(ngModel)]="filtreStatut"
            class="px-3 py-2 rounded-xl border text-sm"
            style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
      <option value="">Tous les statuts</option>
      @for (s of statutOptions; track s.value) {
        <option [value]="s.value">{{ s.label }}</option>
      }
    </select>
  </div>

  <!-- ── Table ──────────────────────────────────────────────────────────────── -->
  <div class="sms-card overflow-hidden">
    <div class="px-5 py-3 border-b flex items-center justify-between"
         style="border-color:var(--border-color)">
      <h3 class="font-semibold text-sm" style="color:var(--text-primary)">
        {{ facturesFiltrees().length }} facture(s)
        @if (filtreStatut) {
          <span class="ml-1 text-xs font-normal" style="color:var(--text-muted)">· filtrées par {{ statutCfg(filtreStatut).label }}</span>
        }
      </h3>
    </div>

    @if (store.loading()) {
      <sms-skeleton-table />
    } @else if (facturesFiltrees().length === 0) {
      <div class="flex flex-col items-center justify-center py-16 gap-3">
        <mat-icon style="font-size:48px;height:48px;width:48px;opacity:0.3;color:var(--text-muted)">receipt_long</mat-icon>
        <p class="font-semibold" style="color:var(--text-secondary)">Aucune facture trouvée</p>
        <button (click)="showNewDialog.set(true)"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
                style="background:var(--accent)">
          <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
          Créer une facture
        </button>
      </div>
    } @else {
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="background:var(--surface-2)">
            <tr>
              @for (h of ['Numéro','Étudiant','Montant total','Payé','Solde restant','Statut','Échéance','']; track h) {
                <th class="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide" style="color:var(--text-secondary)">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (f of facturesFiltrees(); track f.publicId) {
              <tr class="border-t hover:opacity-90 transition-opacity" style="border-color:var(--border-color)">
                <td class="px-4 py-3">
                  <a [routerLink]="['/finance/invoices', f.publicId]"
                     class="font-mono text-xs font-bold hover:underline"
                     style="color:var(--accent)">{{ f.numero }}</a>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                         style="background:linear-gradient(135deg,var(--accent),#3b82f6)">
                      {{ studentName(f.studentId).charAt(0) }}
                    </div>
                    <span class="text-sm" style="color:var(--text-primary)">{{ studentName(f.studentId) }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 font-semibold" style="color:var(--text-primary)">{{ fmt(f.montantTotal) }}</td>
                <td class="px-4 py-3 font-semibold" style="color:#16a34a">{{ fmt(f.montantPaye) }}</td>
                <td class="px-4 py-3 font-bold"
                    [style.color]="f.solde > 0 ? '#dc2626' : '#16a34a'">
                  {{ fmt(f.solde) }}
                </td>
                <td class="px-4 py-3">
                  <span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit"
                        [style.background]="statutCfg(f.statut).bg"
                        [style.color]="statutCfg(f.statut).color">
                    <mat-icon style="font-size:11px;height:11px;width:11px">{{ statutCfg(f.statut).icon }}</mat-icon>
                    {{ statutCfg(f.statut).label }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs"
                    [style.color]="isOverdue(f) ? '#dc2626' : 'var(--text-secondary)'">
                  {{ f.dateEcheance | date:'dd/MM/yyyy' }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <a [routerLink]="['/finance/invoices', f.publicId]"
                       class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                       style="background:var(--accent-light);color:var(--accent)" title="Voir la facture">
                      <mat-icon style="font-size:13px;height:13px;width:13px">visibility</mat-icon>
                    </a>
                    @if (f.statut !== 'PAYEE' && f.statut !== 'ANNULEE') {
                      <button (click)="openPaymentDialog(f)"
                              class="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold hover:opacity-80"
                              style="background:rgba(22,163,74,0.10);color:#16a34a">
                        <mat-icon style="font-size:13px;height:13px;width:13px">payment</mat-icon>
                        Payer
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3 border-t flex items-center justify-between text-xs"
           style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-muted)">
        <span>Total facturé : <strong style="color:var(--text-primary)">{{ fmt(totalFacture()) }}</strong></span>
        <span>Total encaissé : <strong style="color:#16a34a">{{ fmt(store.totalPercu()) }}</strong></span>
        <span>Solde : <strong style="color:#dc2626">{{ fmt(store.totalImpaye()) }}</strong></span>
      </div>
    }
  </div>

</div>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- SLIDE-OVER : NOUVELLE FACTURE                                               -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
@if (showNewDialog()) {
  <div class="fixed inset-0 z-50 flex" style="background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)"
       (click)="closeNewDialog()">
    <div class="ml-auto w-full max-w-lg h-full flex flex-col shadow-2xl"
         style="background:var(--surface-1)" (click)="$event.stopPropagation()">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color:var(--border-color)">
        <div>
          <h2 class="font-bold text-lg" style="color:var(--text-primary)">Nouvelle facture</h2>
          <p class="text-xs mt-0.5" style="color:var(--text-secondary)">Créer une facture pour un étudiant</p>
        </div>
        <button (click)="closeNewDialog()"
                class="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style="background:var(--surface-2);color:var(--text-secondary)">
          <mat-icon style="font-size:18px;height:18px;width:18px">close</mat-icon>
        </button>
      </div>

      <!-- Corps -->
      <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        <!-- Étudiant -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Étudiant *</label>
          <select [(ngModel)]="form.studentId"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option [value]="0">— Sélectionner un étudiant —</option>
            @for (s of students; track s.id) {
              <option [value]="s.id">{{ s.nom }}</option>
            }
          </select>
        </div>

        <!-- Type de frais -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Type de frais</label>
          <select [(ngModel)]="form.fraisPublicId" (change)="onFraisChange()"
                  class="px-3 py-2 rounded-xl border text-sm outline-none"
                  style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
            <option value="">— Saisie manuelle —</option>
            @for (f of refStore.typesFrais(); track f.publicId) {
              <option [value]="f.publicId">{{ f.libelle }} — {{ fmt(f.montant) }}</option>
            }
          </select>
        </div>

        <!-- Montant -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">
            Montant (XOF) *
            @if (form.fraisPublicId) {
              <span class="font-normal ml-1" style="color:var(--text-muted)">— pré-rempli depuis le référentiel</span>
            }
          </label>
          <input type="number" [(ngModel)]="form.montantTotal" min="0" step="1000"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
          @if (form.montantTotal > 0) {
            <p class="text-sm font-bold" style="color:var(--accent)">
              {{ fmt(form.montantTotal) }}
            </p>
          }
        </div>

        <!-- Date d'échéance -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">Date d'échéance *</label>
          <input type="date" [(ngModel)]="form.dateEcheance"
                 class="px-3 py-2 rounded-xl border text-sm outline-none"
                 style="border-color:var(--border-color);background:var(--surface-2);color:var(--text-primary)">
        </div>

        <!-- Récapitulatif -->
        @if (form.studentId && form.montantTotal > 0) {
          <div class="p-4 rounded-xl" style="background:var(--accent-light);border:1px solid rgba(37,99,235,0.20)">
            <p class="text-xs font-bold mb-2" style="color:var(--accent)">Récapitulatif</p>
            <div class="flex flex-col gap-1 text-sm">
              <div class="flex justify-between">
                <span style="color:var(--text-secondary)">Étudiant</span>
                <strong style="color:var(--text-primary)">{{ studentName(form.studentId) }}</strong>
              </div>
              <div class="flex justify-between">
                <span style="color:var(--text-secondary)">Montant</span>
                <strong style="color:var(--accent)">{{ fmt(form.montantTotal) }}</strong>
              </div>
              <div class="flex justify-between">
                <span style="color:var(--text-secondary)">Échéance</span>
                <strong style="color:var(--text-primary)">{{ form.dateEcheance | date:'dd/MM/yyyy' }}</strong>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t flex items-center justify-end gap-3" style="border-color:var(--border-color)">
        <button (click)="closeNewDialog()"
                class="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">Annuler</button>
        <button (click)="createFacture()"
                [disabled]="store.saving() || !form.studentId || !form.montantTotal"
                class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                style="background:var(--accent)">
          @if (store.saving()) {
            <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
          } @else {
            <mat-icon style="font-size:16px;height:16px;width:16px">receipt_long</mat-icon>
          }
          Créer la facture
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class InvoiceListComponent implements OnInit {
  protected readonly store     = inject(FinanceStore);
  protected readonly refStore  = inject(ReferenceStore);
  private readonly dialog      = inject(MatDialog);
  private readonly toast       = inject(ToastService);

  // ── State ─────────────────────────────────────────────────────────────────
  filtreStatut = '';
  searchQuery  = '';
  showNewDialog = signal(false);
  form: FactureForm = EMPTY_FORM();
  readonly students = STUDENTS;

  // ── Options ───────────────────────────────────────────────────────────────
  readonly statutOptions = [
    { value:'EMISE', label:'Émise' }, { value:'PARTIELLEMENT_PAYEE', label:'Partielle' },
    { value:'PAYEE', label:'Payée' }, { value:'EN_RETARD', label:'En retard' },
    { value:'ANNULEE', label:'Annulée' },
  ];

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly kpis = computed(() => [
    { label:'Total',     count: this.store.factures().length, statut:'', bg:'var(--accent-light)', color:'var(--accent)', icon:'receipt_long' },
    { label:'Payées',    count: this.store.factures().filter(f=>f.statut==='PAYEE').length, statut:'PAYEE', bg:'rgba(22,163,74,0.10)', color:'#16a34a', icon:'check_circle' },
    { label:'Partielles',count: this.store.factures().filter(f=>f.statut==='PARTIELLEMENT_PAYEE').length, statut:'PARTIELLEMENT_PAYEE', bg:'rgba(245,158,11,0.10)', color:'#d97706', icon:'hourglass_top' },
    { label:'En retard', count: this.store.facturesEnRetard().length, statut:'EN_RETARD', bg:'rgba(239,68,68,0.10)', color:'#dc2626', icon:'warning' },
    { label:'Émises',    count: this.store.factures().filter(f=>f.statut==='EMISE').length, statut:'EMISE', bg:'rgba(37,99,235,0.10)', color:'var(--accent)', icon:'send' },
  ]);

  readonly facturesFiltrees = computed(() => {
    let list = this.store.factures();
    if (this.filtreStatut) list = list.filter(f => f.statut === this.filtreStatut);
    if (this.searchQuery)  list = list.filter(f =>
      f.numero.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      this.studentName(f.studentId).toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    return list;
  });

  readonly totalFacture = computed(() =>
    this.store.factures().reduce((s, f) => s + f.montantTotal, 0)
  );

  ngOnInit() {
    this.store.loadFactures(0);
    if (!this.refStore.loaded()) this.refStore.loadAll();
  }

  // ── Nouvelle facture ──────────────────────────────────────────────────────
  onFraisChange(): void {
    const frais = this.refStore.typesFrais().find(f => f.publicId === this.form.fraisPublicId);
    if (frais) this.form.montantTotal = frais.montant;
  }

  createFacture(): void {
    if (!this.form.studentId || !this.form.montantTotal) return;
    this.store.createFacture({
      studentId:         this.form.studentId,
      anneeAcademiqueId: 1,
      montantTotal:      this.form.montantTotal,
      dateEcheance:      this.form.dateEcheance,
    });
    this.closeNewDialog();
  }

  closeNewDialog(): void {
    this.showNewDialog.set(false);
    this.form = EMPTY_FORM();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  studentName(id: number): string { return STUDENT_NAMES[id] ?? `Étudiant #${id}`; }
  fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits:0 }).format(n) + ' XOF';
  }
  isOverdue(f: IFacture): boolean {
    return f.statut === 'EN_RETARD';
  }
  statutCfg(s: string) { return STATUT_CFG[s] ?? STATUT_CFG['EMISE']; }

  openPaymentDialog(facture: IFacture): void {
    this.dialog.open(PaymentDialogComponent, {
      width: '480px',
      data:  { facture, studentName: this.studentName(facture.studentId) },
      panelClass: 'sms-dialog',
    });
  }
}
