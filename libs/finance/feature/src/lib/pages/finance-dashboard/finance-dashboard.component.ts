import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FinanceStore } from '@sms/finance/data-access';

@Component({
  selector: 'sms-finance-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Finance & Paiements</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Suivi du recouvrement des frais de scolarité</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/finance/invoices"
             class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
             style="background: var(--accent)">
            <mat-icon style="font-size: 18px; height: 18px; width: 18px">list</mat-icon>
            Voir les factures
          </a>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Total perçu -->
        <div class="sms-card p-5">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
              <mat-icon style="color: #16a34a">account_balance_wallet</mat-icon>
            </div>
            <div>
              <p class="text-xs font-medium mb-1" style="color: var(--text-secondary)">Total perçu</p>
              <p class="text-xl font-bold" style="color: #16a34a">{{ formatXOF(store.totalPercu()) }}</p>
            </div>
          </div>
          <div class="mt-3">
            <div class="flex items-center justify-between text-xs mb-1" style="color: var(--text-secondary)">
              <span>Recouvrement</span>
              <span class="font-semibold" style="color: #16a34a">{{ store.tauxRecouvrement() }}%</span>
            </div>
            <div class="w-full rounded-full h-2" style="background: var(--border-color)">
              <div class="h-2 rounded-full" style="background: #16a34a" [style.width.%]="store.tauxRecouvrement()"></div>
            </div>
          </div>
        </div>

        <!-- Impayés -->
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: rgba(239,68,68,0.1)">
            <mat-icon style="color: #dc2626">money_off</mat-icon>
          </div>
          <div>
            <p class="text-xs font-medium mb-1" style="color: var(--text-secondary)">Impayés</p>
            <p class="text-xl font-bold" style="color: #dc2626">{{ formatXOF(store.totalImpaye()) }}</p>
            <p class="text-xs mt-0.5" style="color: var(--text-muted)">À recouvrir</p>
          </div>
        </div>

        <!-- En retard -->
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: rgba(217,119,6,0.1)">
            <mat-icon style="color: #d97706">schedule</mat-icon>
          </div>
          <div>
            <p class="text-xs font-medium mb-1" style="color: var(--text-secondary)">En retard</p>
            <p class="text-xl font-bold" style="color: #d97706">{{ store.facturesEnRetard().length }}</p>
            <p class="text-xs mt-0.5" style="color: var(--text-muted)">Factures échues</p>
          </div>
        </div>

        <!-- Taux recouvrement -->
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
            <mat-icon style="color: var(--accent)">trending_up</mat-icon>
          </div>
          <div>
            <p class="text-xs font-medium mb-1" style="color: var(--text-secondary)">Taux recouvrement</p>
            <p class="text-xl font-bold" style="color: var(--accent)">{{ store.tauxRecouvrement() }}%</p>
            <p class="text-xs mt-0.5" style="color: var(--text-muted)">Objectif : 90%</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Factures en retard -->
        <div class="lg:col-span-2 sms-card overflow-hidden">
          <div class="px-5 py-4 border-b flex items-center justify-between" style="border-color: var(--border-color)">
            <h3 class="font-semibold" style="color: var(--text-primary)">Top 5 factures en retard</h3>
            <a routerLink="/finance/invoices" class="text-xs font-medium hover:underline" style="color: var(--accent)">
              Voir tout →
            </a>
          </div>
          <div class="divide-y" style="border-color: var(--border-color)">
            @for (f of store.facturesEnRetard().slice(0, 5); track f.publicId) {
              <div class="px-5 py-3 flex items-center gap-4">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background: rgba(239,68,68,0.1)">
                  <mat-icon style="color: #dc2626; font-size: 16px; height: 16px; width: 16px">warning</mat-icon>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold" style="color: var(--text-primary)">{{ f.numero }}</p>
                  <p class="text-xs" style="color: var(--text-secondary)">Échéance : {{ f.dateEcheance | date:'dd/MM/yyyy' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold" style="color: #dc2626">{{ formatXOF(f.solde) }}</p>
                  <span class="px-1.5 py-0.5 rounded text-xs font-semibold" style="background: #fee2e2; color: #dc2626">EN RETARD</span>
                </div>
              </div>
            } @empty {
              <div class="px-5 py-8 text-center" style="color: var(--text-secondary)">
                Aucune facture en retard
              </div>
            }
          </div>
        </div>

        <!-- Répartition + Actions rapides -->
        <div class="flex flex-col gap-4">
          <!-- Actions rapides -->
          <div class="sms-card p-5">
            <h3 class="font-semibold mb-3" style="color: var(--text-primary)">Actions rapides</h3>
            <div class="flex flex-col gap-2">
              <a routerLink="/finance/invoices"
                 class="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all hover:opacity-80"
                 style="border-color: var(--border-color); background: var(--surface-2)">
                <mat-icon style="color: var(--accent)">list_alt</mat-icon>
                <span class="text-sm font-medium" style="color: var(--text-primary)">Toutes les factures</span>
              </a>
              <a routerLink="/finance/bourses"
                 class="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all hover:opacity-80"
                 style="border-color: var(--border-color); background: var(--surface-2)">
                <mat-icon style="color: #16a34a">school</mat-icon>
                <span class="text-sm font-medium" style="color: var(--text-primary)">Gérer les bourses</span>
              </a>
              <a routerLink="/finance/frais"
                 class="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all hover:opacity-80"
                 style="border-color: var(--border-color); background: var(--surface-2)">
                <mat-icon style="color: #d97706">payments</mat-icon>
                <span class="text-sm font-medium" style="color: var(--text-primary)">Frais de scolarité</span>
              </a>
            </div>
          </div>

          <!-- Répartition par statut -->
          <div class="sms-card p-5">
            <h3 class="font-semibold mb-3" style="color: var(--text-primary)">Répartition statuts</h3>
            <div class="flex flex-col gap-2.5">
              @for (item of statutRepartition(); track item.statut) {
                <div>
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="px-1.5 py-0.5 rounded text-xs font-semibold" [ngStyle]="item.style">{{ item.statut }}</span>
                    <span style="color: var(--text-secondary)">{{ item.count }} ({{ item.pct }}%)</span>
                  </div>
                  <div class="w-full rounded-full h-1.5" style="background: var(--border-color)">
                    <div class="h-1.5 rounded-full" [style.width.%]="item.pct" [style.background]="item.barColor"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FinanceDashboardComponent implements OnInit {
  protected readonly store = inject(FinanceStore);

  ngOnInit() {
    this.store.loadFactures(0);
  }

  formatXOF(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 0 }).format(amount) + ' XOF';
  }

  statutRepartition() {
    const factures = this.store.factures();
    const total = factures.length || 1;
    const counts: Record<string, number> = {};
    factures.forEach(f => { counts[f.statut] = (counts[f.statut] ?? 0) + 1; });
    const styles: Record<string, { style: Record<string, string>; barColor: string }> = {
      PAYEE:              { style: { background: '#dcfce7', color: '#16a34a' }, barColor: '#16a34a' },
      PARTIELLEMENT_PAYEE:{ style: { background: '#fef3c7', color: '#d97706' }, barColor: '#d97706' },
      EN_RETARD:          { style: { background: '#fee2e2', color: '#dc2626' }, barColor: '#dc2626' },
      EMISE:              { style: { background: '#dbeafe', color: '#2563eb' }, barColor: '#2563eb' },
      ANNULEE:            { style: { background: '#f3f4f6', color: '#6b7280' }, barColor: '#9ca3af' },
    };
    return Object.entries(counts).map(([statut, count]) => ({
      statut,
      count,
      pct: Math.round((count / total) * 100),
      style: styles[statut]?.style ?? { background: '#f3f4f6', color: '#6b7280' },
      barColor: styles[statut]?.barColor ?? '#9ca3af',
    }));
  }
}
