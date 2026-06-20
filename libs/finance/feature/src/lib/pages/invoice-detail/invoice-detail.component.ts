import {
  Component, inject, OnInit, ChangeDetectionStrategy, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule }    from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FinanceStore, STUDENT_NAMES } from '@sms/finance/data-access';
import { PaymentDialogComponent } from '../../components/payment-dialog/payment-dialog.component';

const STATUT_CFG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  BROUILLON:           { label:'Brouillon',  bg:'rgba(107,114,128,0.10)', color:'#6b7280', icon:'draft'         },
  EMISE:               { label:'Émise',      bg:'rgba(37,99,235,0.10)',   color:'var(--accent)', icon:'send'    },
  PARTIELLEMENT_PAYEE: { label:'Partielle',  bg:'rgba(245,158,11,0.10)', color:'#d97706', icon:'hourglass_top' },
  PAYEE:               { label:'Payée',      bg:'rgba(22,163,74,0.10)',   color:'#16a34a', icon:'check_circle' },
  EN_RETARD:           { label:'En retard',  bg:'rgba(239,68,68,0.10)',   color:'#dc2626', icon:'warning'      },
  ANNULEE:             { label:'Annulée',    bg:'rgba(107,114,128,0.10)', color:'#6b7280', icon:'cancel'       },
};

@Component({
  selector:        'sms-invoice-detail',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule, MatDialogModule],
  template: `
<div class="p-6 max-w-3xl mx-auto" id="facture-print">

  <!-- ── Navigation ────────────────────────────────────────────────────────── -->
  <div class="flex items-center gap-3 mb-6 print:hidden">
    <a routerLink="/finance/invoices"
       class="flex items-center gap-1.5 text-sm font-semibold hover:opacity-80"
       style="color:var(--text-secondary)">
      <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
      Factures
    </a>
    <mat-icon style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">chevron_right</mat-icon>
    <span class="text-sm font-semibold" style="color:var(--text-primary)">
      {{ store.selectedFacture()?.numero ?? '…' }}
    </span>
  </div>

  @if (store.loading()) {
    <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement…
    </div>
  } @else {
    @if (store.selectedFacture(); as f) {

    <!-- ── En-tête facture ──────────────────────────────────────────────────── -->
    <div class="sms-card p-6 mb-5">
      <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
        <!-- Logo + titre -->
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
               style="background:var(--accent)">
            <mat-icon style="color:#fff;font-size:26px;height:26px;width:26px">receipt_long</mat-icon>
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-wide mb-1" style="color:var(--text-muted)">Facture</p>
            <p class="text-2xl font-black font-mono" style="color:var(--text-primary)">{{ f.numero }}</p>
            <p class="text-xs mt-0.5" style="color:var(--text-muted)">
              Créée le {{ f.createdDate | date:'dd MMMM yyyy' }}
            </p>
          </div>
        </div>
        <!-- Statut + actions -->
        <div class="flex flex-col items-end gap-3">
          <span class="flex items-center gap-2 px-3 py-1.5 rounded-full font-bold"
                [style.background]="statutCfg(f.statut).bg"
                [style.color]="statutCfg(f.statut).color">
            <mat-icon style="font-size:16px;height:16px;width:16px">{{ statutCfg(f.statut).icon }}</mat-icon>
            {{ statutCfg(f.statut).label }}
          </span>
          <div class="flex items-center gap-2 print:hidden">
            <button (click)="printFacture()"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80"
                    style="background:var(--surface-2);color:var(--text-secondary);border:1px solid var(--border-color)">
              <mat-icon style="font-size:14px;height:14px;width:14px">print</mat-icon>
              Imprimer
            </button>
            @if (f.statut !== 'PAYEE' && f.statut !== 'ANNULEE') {
              <button (click)="openPaymentDialog()"
                      class="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white hover:opacity-80"
                      style="background:#16a34a">
                <mat-icon style="font-size:14px;height:14px;width:14px">payment</mat-icon>
                Payer maintenant
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Infos facture / étudiant -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Étudiant -->
        <div>
          <p class="text-xs font-bold uppercase tracking-wide mb-3" style="color:var(--text-muted)">Étudiant</p>
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                 style="background:linear-gradient(135deg,var(--accent),#3b82f6)">
              {{ studentInitials(f.studentId) }}
            </div>
            <div>
              <p class="font-bold" style="color:var(--text-primary)">{{ studentName(f.studentId) }}</p>
              <p class="text-xs" style="color:var(--text-muted)">Étudiant ID : {{ f.studentId }}</p>
            </div>
          </div>
        </div>
        <!-- Détails facture -->
        <div>
          <p class="text-xs font-bold uppercase tracking-wide mb-3" style="color:var(--text-muted)">Détails</p>
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-sm">
              <span style="color:var(--text-secondary)">Année académique</span>
              <span class="font-semibold" style="color:var(--text-primary)">2025-2026</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span style="color:var(--text-secondary)">Date d'échéance</span>
              <span class="font-semibold"
                    [style.color]="isOverdue(f) ? '#dc2626' : 'var(--text-primary)'">
                {{ f.dateEcheance | date:'dd/MM/yyyy' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Récapitulatif financier ─────────────────────────────────────────── -->
    <div class="grid grid-cols-3 gap-4 mb-5">
      <div class="sms-card p-4 text-center">
        <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Montant total</p>
        <p class="text-2xl font-black" style="color:var(--text-primary)">{{ fmt(f.montantTotal) }}</p>
      </div>
      <div class="sms-card p-4 text-center">
        <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Montant payé</p>
        <p class="text-2xl font-black" style="color:#16a34a">{{ fmt(f.montantPaye) }}</p>
      </div>
      <div class="sms-card p-4 text-center"
           [style.border-color]="f.solde > 0 ? 'rgba(220,38,38,0.30)' : 'rgba(22,163,74,0.30)'">
        <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Solde restant</p>
        <p class="text-2xl font-black"
           [style.color]="f.solde > 0 ? '#dc2626' : '#16a34a'">
          {{ fmt(f.solde) }}
        </p>
      </div>
    </div>

    <!-- ── Barre de progression paiement ──────────────────────────────────── -->
    <div class="sms-card p-4 mb-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold" style="color:var(--text-secondary)">Progression du paiement</span>
        <span class="text-sm font-bold" style="color:var(--text-primary)">{{ progressPct(f) }}%</span>
      </div>
      <div class="rounded-full h-3" style="background:var(--border-color)">
        <div class="h-3 rounded-full transition-all"
             [style.background]="f.solde === 0 ? '#16a34a' : progressPct(f) >= 50 ? 'var(--accent)' : '#f59e0b'"
             [style.width]="progressPct(f) + '%'"></div>
      </div>
      <div class="flex justify-between text-xs mt-1.5" style="color:var(--text-muted)">
        <span>0</span>
        <span>{{ fmt(f.montantTotal) }}</span>
      </div>
    </div>

    <!-- ── Échéancier ─────────────────────────────────────────────────────── -->
    @if (f.echeancier.length > 0) {
      <div class="sms-card overflow-hidden mb-5">
        <div class="px-5 py-4 border-b" style="border-color:var(--border-color)">
          <h3 class="font-semibold" style="color:var(--text-primary)">Échéancier</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead style="background:var(--surface-2)">
              <tr>
                @for (h of ['#','Montant dû','Date échéance','Statut']; track h) {
                  <th class="text-left px-5 py-3 font-bold text-xs uppercase tracking-wide" style="color:var(--text-secondary)">{{ h }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (e of f.echeancier; track e.numero) {
                <tr class="border-t" style="border-color:var(--border-color)">
                  <td class="px-5 py-3 font-mono font-bold" style="color:var(--accent)">{{ e.numero }}</td>
                  <td class="px-5 py-3 font-semibold" style="color:var(--text-primary)">{{ fmt(e.montantDu) }}</td>
                  <td class="px-5 py-3 text-xs" style="color:var(--text-secondary)">
                    {{ e.dateEcheance | date:'dd/MM/yyyy' }}
                  </td>
                  <td class="px-5 py-3">
                    <span class="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                          [style.background]="e.estPaye ? 'rgba(22,163,74,0.10)' : 'rgba(245,158,11,0.10)'"
                          [style.color]="e.estPaye ? '#16a34a' : '#d97706'">
                      <mat-icon style="font-size:11px;height:11px;width:11px">
                        {{ e.estPaye ? 'check_circle' : 'hourglass_top' }}
                      </mat-icon>
                      {{ e.estPaye ? 'Payé' : 'En attente' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <!-- ── Zone impression (footer) ───────────────────────────────────────── -->
    <div class="flex items-center justify-between pt-4 print:hidden">
      <a routerLink="/finance/invoices"
         class="flex items-center gap-2 text-sm font-semibold hover:opacity-80"
         style="color:var(--text-secondary)">
        <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        Retour aux factures
      </a>
      <div class="flex items-center gap-2">
        <button (click)="printFacture()"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary);border:1px solid var(--border-color)">
          <mat-icon style="font-size:16px;height:16px;width:16px">print</mat-icon>
          Imprimer la facture
        </button>
        @if (f.statut !== 'PAYEE' && f.statut !== 'ANNULEE') {
          <button (click)="openPaymentDialog()"
                  class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80"
                  style="background:#16a34a">
            <mat-icon style="font-size:18px;height:18px;width:18px">payment</mat-icon>
            Payer maintenant — {{ fmt(f.solde) }}
          </button>
        }
      </div>
    </div>

    } @else if (!store.loading()) {
      <div class="flex flex-col items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
        <mat-icon style="font-size:48px;height:48px;width:48px;opacity:0.3">receipt_long</mat-icon>
        <p class="font-semibold">Facture introuvable</p>
        <a routerLink="/finance/invoices" class="text-sm font-semibold hover:opacity-80"
           style="color:var(--accent)">← Retour aux factures</a>
      </div>
    }
  }

</div>
  `,
})
export class InvoiceDetailComponent implements OnInit {
  protected readonly store  = inject(FinanceStore);
  private readonly route    = inject(ActivatedRoute);
  private readonly dialog   = inject(MatDialog);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.selectFacture(id);
  }

  printFacture(): void { window.print(); }

  studentName(id: number): string { return STUDENT_NAMES[id] ?? `Étudiant #${id}`; }
  studentInitials(id: number): string {
    const n = this.studentName(id).split(' ');
    return (n[0]?.[0] ?? '') + (n[1]?.[0] ?? '');
  }
  fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits:0 }).format(n) + ' XOF';
  }
  isOverdue(f: { statut: string }): boolean { return f.statut === 'EN_RETARD'; }
  progressPct(f: { montantTotal: number; montantPaye: number }): number {
    return f.montantTotal ? Math.round((f.montantPaye / f.montantTotal) * 100) : 0;
  }
  statutCfg(s: string) { return STATUT_CFG[s] ?? STATUT_CFG['EMISE']; }

  openPaymentDialog(): void {
    const f = this.store.selectedFacture();
    if (!f) return;
    this.dialog.open(PaymentDialogComponent, {
      width: '480px',
      data:  { facture: f, studentName: this.studentName(f.studentId) },
      panelClass: 'sms-dialog',
    });
  }
}
