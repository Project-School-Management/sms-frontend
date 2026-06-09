import {
  Component, inject, OnInit, ChangeDetectionStrategy, computed, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FinanceStore }  from '@sms/finance/data-access';
import {
  MOCK_ECHEANCIERS, MOCK_REDUCTIONS, MOCK_REMBOURSEMENTS,
  MOCK_JOURNAL, MOCK_RAPPORT_MODE_PAIEMENT, STUDENT_NAMES_MAP,
} from '@sms/finance/data-access';

const STATUT_CFG: Record<string, { label: string; bg: string; color: string; barColor: string }> = {
  PAYEE:               { label:'Payée',           bg:'rgba(22,163,74,0.10)',  color:'#16a34a', barColor:'#16a34a' },
  PARTIELLEMENT_PAYEE: { label:'Part. payée',      bg:'rgba(217,119,6,0.10)', color:'#d97706', barColor:'#d97706' },
  EN_RETARD:           { label:'En retard',        bg:'rgba(239,68,68,0.10)', color:'#dc2626', barColor:'#dc2626' },
  EMISE:               { label:'Émise',            bg:'rgba(59,130,246,0.10)',color:'#2563eb', barColor:'#2563eb' },
  ANNULEE:             { label:'Annulée',          bg:'rgba(107,114,128,0.10)',color:'#6b7280',barColor:'#9ca3af' },
};

@Component({
  selector:        'sms-finance-dashboard',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Finance & Paiements</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Tableau de bord financier · Année académique 2025-2026
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <a routerLink="/finance/rapports"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">bar_chart</mat-icon>
        Rapports
      </a>
      <a routerLink="/finance/invoices"
         class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
         style="background:var(--accent)">
        <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
        Nouvelle facture
      </a>
    </div>
  </div>

  <!-- ── 7 KPI Cards ───────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Facturé</p>
      <p class="text-lg font-bold" style="color:var(--text-primary)">{{ fmtM(totalFacture()) }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">XOF</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Encaissé</p>
      <p class="text-lg font-bold" style="color:#16a34a">{{ fmtM(store.totalPercu()) }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ store.tauxRecouvrement() }}% rec.</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Solde restant</p>
      <p class="text-lg font-bold" style="color:#dc2626">{{ fmtM(store.totalImpaye()) }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">à recouvrir</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Paiements/jour</p>
      <p class="text-lg font-bold" style="color:#6366f1">{{ fmtM(paiementsDuJour()) }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">aujourd'hui</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">En retard</p>
      <p class="text-lg font-bold" style="color:#d97706">{{ store.facturesEnRetard().length }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">factures</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Bourses</p>
      <p class="text-lg font-bold" style="color:#8b5cf6">{{ fmtM(totalBourses()) }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">accordées</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Réductions</p>
      <p class="text-lg font-bold" style="color:#0891b2">{{ fmtM(totalReductions()) }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">appliquées</p>
    </div>
  </div>

  <!-- ── Barre de recouvrement ─────────────────────────────────────────────── -->
  <div class="sms-card p-5 mb-5">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">trending_up</mat-icon>
        <span class="font-bold" style="color:var(--text-primary)">Taux de recouvrement</span>
      </div>
      <div class="text-right">
        <span class="text-2xl font-bold" style="color:var(--accent)">{{ store.tauxRecouvrement() }}%</span>
        <span class="text-sm ml-2" style="color:var(--text-muted)">Objectif : 90%</span>
      </div>
    </div>
    <div class="relative rounded-full h-4 overflow-hidden" style="background:var(--surface-2)">
      <div class="h-4 rounded-full transition-all"
           style="background:linear-gradient(90deg,var(--accent),#10b981)"
           [style.width]="store.tauxRecouvrement() + '%'"></div>
      <div class="absolute top-0 h-4 w-0.5 bg-amber-500" style="left:90%"></div>
    </div>
    <div class="flex items-center justify-between mt-2 text-xs" style="color:var(--text-muted)">
      <span>{{ formatXOF(store.totalPercu()) }} encaissé</span>
      <span>{{ formatXOF(store.totalImpaye()) }} restant</span>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

    <!-- Factures en retard -->
    <div class="lg:col-span-2 sms-card overflow-hidden">
      <div class="px-5 py-4 border-b flex items-center justify-between"
           style="border-color:var(--border-color)">
        <h3 class="font-bold" style="color:var(--text-primary)">Factures en retard</h3>
        <a routerLink="/finance/invoices"
           class="text-xs font-semibold hover:opacity-70" style="color:var(--accent)">
          Voir tout →
        </a>
      </div>
      @for (f of store.facturesEnRetard().slice(0,6); track f.publicId) {
        <div class="px-5 py-3 border-b flex items-center gap-4 hover:opacity-80 transition-opacity"
             style="border-color:var(--border-color)">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
               style="background:rgba(239,68,68,0.10)">
            <mat-icon style="color:#dc2626;font-size:16px;height:16px;width:16px">warning</mat-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold" style="color:var(--text-primary)">{{ f.numero }}</p>
            <p class="text-xs" style="color:var(--text-muted)">
              {{ studentName(f.studentId) }} · Éch. {{ f.dateEcheance }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-sm font-bold" style="color:#dc2626">{{ formatXOF(f.solde) }}</p>
            <a [routerLink]="['/finance/encaissement', f.publicId]"
               class="text-xs font-semibold px-2 py-0.5 rounded-lg hover:opacity-80 text-white"
               style="background:#dc2626">Encaisser</a>
          </div>
        </div>
      }
      @if (store.facturesEnRetard().length === 0) {
        <div class="px-5 py-10 text-center" style="color:var(--text-muted)">
          <mat-icon style="font-size:32px;height:32px;width:32px">check_circle</mat-icon>
          <p class="mt-2 text-sm">Aucune facture en retard</p>
        </div>
      }
    </div>

    <!-- Colonne droite -->
    <div class="flex flex-col gap-4">

      <!-- Actions rapides -->
      <div class="sms-card p-5">
        <h3 class="font-bold mb-3" style="color:var(--text-primary)">Actions rapides</h3>
        <div class="flex flex-col gap-2">
          @for (action of quickActions; track action.label) {
            <a [routerLink]="action.path"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl border hover:opacity-80 transition-opacity"
               style="border-color:var(--border-color);background:var(--surface-2)">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                   [style.background]="action.color + '15'">
                <mat-icon [style.color]="action.color"
                          style="font-size:16px;height:16px;width:16px">{{ action.icon }}</mat-icon>
              </div>
              <span class="text-sm font-medium" style="color:var(--text-primary)">{{ action.label }}</span>
              <mat-icon class="ml-auto" style="font-size:14px;height:14px;width:14px;color:var(--text-muted)">
                chevron_right
              </mat-icon>
            </a>
          }
        </div>
      </div>

      <!-- Répartition modes de paiement -->
      <div class="sms-card p-5">
        <h3 class="font-bold mb-3" style="color:var(--text-primary)">Modes de paiement</h3>
        <div class="flex flex-col gap-2.5">
          @for (m of modePaiement; track m.mode) {
            <div>
              <div class="flex items-center justify-between mb-1 text-xs">
                <span style="color:var(--text-primary)">{{ m.mode }}</span>
                <span class="font-bold" style="color:var(--text-secondary)">{{ m.pct }}%</span>
              </div>
              <div class="rounded-full h-1.5" style="background:var(--surface-2)">
                <div class="h-1.5 rounded-full" style="background:var(--accent)"
                     [style.width]="m.pct + '%'"></div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  </div>

  <!-- ── Journal récent ─────────────────────────────────────────────────────── -->
  <div class="sms-card overflow-hidden mt-5">
    <div class="px-5 py-4 border-b flex items-center justify-between"
         style="border-color:var(--border-color)">
      <h3 class="font-bold" style="color:var(--text-primary)">Journal des opérations récentes</h3>
      <a routerLink="/finance/rapports"
         class="text-xs font-semibold hover:opacity-70" style="color:var(--accent)">
        Tout voir →
      </a>
    </div>
    @for (op of journal.slice(0,5); track op.publicId) {
      <div class="px-5 py-3 border-b flex items-center gap-4 hover:opacity-80 transition-opacity"
           style="border-color:var(--border-color)">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
             [style.background]="opColor(op.type).bg">
          <mat-icon [style.color]="opColor(op.type).color"
                    style="font-size:15px;height:15px;width:15px">{{ opIcon(op.type) }}</mat-icon>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium" style="color:var(--text-primary)">{{ op.detail }}</p>
          <p class="text-xs" style="color:var(--text-muted)">{{ op.auteur }} · {{ op.date }}</p>
        </div>
        <span class="text-sm font-bold shrink-0"
              [style.color]="op.type === 'PAIEMENT' ? '#16a34a' : op.type === 'ANNULATION' ? '#dc2626' : 'var(--text-secondary)'">
          {{ op.type === 'ANNULATION' ? '—' : '+' }}{{ formatXOF(op.montant) }}
        </span>
      </div>
    }
  </div>

</div>
  `,
})
export class FinanceDashboardComponent implements OnInit {
  protected readonly store = inject(FinanceStore);

  readonly modePaiement = MOCK_RAPPORT_MODE_PAIEMENT.slice(0, 4);
  readonly journal       = MOCK_JOURNAL;
  readonly reductions    = MOCK_REDUCTIONS;
  readonly bourses_data  = [];

  readonly quickActions = [
    { label:'Toutes les factures', path:'/finance/invoices',      icon:'receipt_long',           color:'#6366f1' },
    { label:'Paiements',           path:'/finance/paiements',     icon:'payments',               color:'#16a34a' },
    { label:'Bourses',             path:'/finance/bourses',        icon:'school',                 color:'#8b5cf6' },
    { label:'Réductions',          path:'/finance/reductions',    icon:'discount',               color:'#0891b2' },
    { label:'Échéanciers',         path:'/finance/echeanciers',   icon:'event_repeat',           color:'#f59e0b' },
    { label:'Remboursements',      path:'/finance/remboursements',icon:'undo',                   color:'#d97706' },
    { label:'Rapports financiers', path:'/finance/rapports',      icon:'bar_chart',              color:'#ec4899' },
  ];

  ngOnInit() { this.store.loadFactures(0); }

  totalFacture = computed(() =>
    this.store.factures().reduce((s, f) => s + f.montantTotal, 0)
  );

  paiementsDuJour = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.store.factures()
      .filter(f => f.createdDate?.startsWith(today))
      .reduce((s, f) => s + f.montantPaye, 0);
  });

  totalBourses   = computed(() => this.store.bourses().reduce((s, b) => s + (b.montantDeduction ?? 0), 0) || 1_012_500);
  totalReductions = computed(() => MOCK_REDUCTIONS.filter(r => r.statut === 'ACTIVE').reduce((s, r) => s + r.montantEconomise, 0));

  formatXOF(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' XOF';
  }

  fmtM(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`;
    if (n >= 1_000)     return `${Math.round(n / 1_000)}k`;
    return String(n);
  }

  studentName(id: number): string { return STUDENT_NAMES_MAP[id] ?? `Étudiant #${id}`; }

  opIcon(type: string): string {
    return { PAIEMENT:'payments', REMBOURSEMENT:'undo', REDUCTION:'discount', BOURSE:'school',
             CREATION:'add_circle', MODIFICATION:'edit', ANNULATION:'cancel' }[type] ?? 'info';
  }

  opColor(type: string): { color: string; bg: string } {
    return {
      PAIEMENT:     { color:'#16a34a', bg:'rgba(22,163,74,0.10)'   },
      REMBOURSEMENT:{ color:'#d97706', bg:'rgba(217,119,6,0.10)'   },
      REDUCTION:    { color:'#0891b2', bg:'rgba(8,145,178,0.10)'   },
      BOURSE:       { color:'#8b5cf6', bg:'rgba(139,92,246,0.10)'  },
      CREATION:     { color:'#6366f1', bg:'rgba(99,102,241,0.10)'  },
      MODIFICATION: { color:'#6b7280', bg:'rgba(107,114,128,0.10)' },
      ANNULATION:   { color:'#dc2626', bg:'rgba(239,68,68,0.10)'   },
    }[type] ?? { color:'#6b7280', bg:'rgba(107,114,128,0.10)' };
  }
}
