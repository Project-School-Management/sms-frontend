import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsStore } from '@sms/analytics/data-access';

@Component({
  selector: 'sms-kpi-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Analytics & KPIs</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Indicateurs de performance — Année 2025-2026</p>
        </div>
        <a routerLink="/analytics/rapports"
           class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style="background: var(--accent)">
          <mat-icon style="font-size: 18px; height: 18px; width: 18px">description</mat-icon>
          Rapports
        </a>
      </div>

      @if (store.loading()) {
        <div class="flex items-center justify-center py-16" style="color: var(--text-secondary)">
          <mat-icon class="animate-spin">refresh</mat-icon>&nbsp;Chargement...
        </div>
      }

      @if (store.kpiOverview(); as kpi) {
        <!-- Overview KPIs -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div class="sms-card p-5 flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
              <mat-icon style="color: var(--accent)">school</mat-icon>
            </div>
            <div>
              <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ kpi.totalEtudiants | number }}</p>
              <p class="text-sm" style="color: var(--text-secondary)">Étudiants</p>
            </div>
          </div>
          <div class="sms-card p-5 flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(8,145,178,0.1)">
              <mat-icon style="color: #0891b2">person</mat-icon>
            </div>
            <div>
              <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ kpi.totalEnseignants }}</p>
              <p class="text-sm" style="color: var(--text-secondary)">Enseignants</p>
            </div>
          </div>
          <div class="sms-card p-5 flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
              <mat-icon style="color: #16a34a">trending_up</mat-icon>
            </div>
            <div>
              <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ kpi.tauxReussite }}%</p>
              <p class="text-sm" style="color: var(--text-secondary)">Taux réussite</p>
            </div>
          </div>
          <div class="sms-card p-5 flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(168,85,247,0.1)">
              <mat-icon style="color: #7c3aed">payments</mat-icon>
            </div>
            <div>
              <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ kpi.tauxRecouvrement }}%</p>
              <p class="text-sm" style="color: var(--text-secondary)">Recouvrement</p>
            </div>
          </div>
        </div>

        <!-- Finance KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="sms-card p-5">
            <div class="flex items-start gap-4 mb-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
                <mat-icon style="color: #16a34a">account_balance_wallet</mat-icon>
              </div>
              <div>
                <p class="text-xs" style="color: var(--text-secondary)">Total encaissé</p>
                <p class="text-lg font-bold" style="color: #16a34a">{{ formatXOF(kpi.totalEncaisse) }}</p>
              </div>
            </div>
            <div class="w-full rounded-full h-2" style="background: var(--border-color)">
              <div class="h-2 rounded-full" style="background: #16a34a; width: 82%"></div>
            </div>
            <p class="text-xs mt-1" style="color: var(--text-muted)">82% de l'objectif annuel</p>
          </div>
          <div class="sms-card p-5 flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(239,68,68,0.1)">
              <mat-icon style="color: #dc2626">money_off</mat-icon>
            </div>
            <div>
              <p class="text-xs" style="color: var(--text-secondary)">Total impayé</p>
              <p class="text-lg font-bold" style="color: #dc2626">{{ formatXOF(kpi.totalImpaye) }}</p>
            </div>
          </div>
          <div class="sms-card p-5 flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(217,119,6,0.1)">
              <mat-icon style="color: #d97706">warning</mat-icon>
            </div>
            <div>
              <p class="text-xs" style="color: var(--text-secondary)">Factures en retard</p>
              <p class="text-lg font-bold" style="color: #d97706">{{ kpi.nbFacturesEnRetard }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Résultats par promotion -->
      @if (store.kpiAcademique().length > 0) {
        <div class="sms-card overflow-hidden">
          <div class="px-5 py-4 border-b" style="border-color: var(--border-color)">
            <h3 class="font-semibold" style="color: var(--text-primary)">Résultats par promotion</h3>
          </div>
          <div class="p-5 flex flex-col gap-5">
            @for (promo of store.kpiAcademique(); track promo.promotionLibelle) {
              <div class="p-4 rounded-xl border" style="border-color: var(--border-color); background: var(--surface-2)">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p class="font-semibold" style="color: var(--text-primary)">{{ promo.promotionLibelle }}</p>
                    <p class="text-xs" style="color: var(--text-secondary)">{{ promo.effectif }} étudiants</p>
                  </div>
                  <div class="flex items-center gap-4 text-sm">
                    <div class="text-center">
                      <p class="font-bold" style="color: var(--text-primary)">{{ promo.moyenneGenerale }}/20</p>
                      <p class="text-xs" style="color: var(--text-secondary)">Moyenne</p>
                    </div>
                    <div class="text-center">
                      <p class="font-bold" [style.color]="promo.tauxReussite >= 75 ? '#16a34a' : promo.tauxReussite >= 60 ? '#d97706' : '#dc2626'">
                        {{ promo.tauxReussite }}%
                      </p>
                      <p class="text-xs" style="color: var(--text-secondary)">Réussite</p>
                    </div>
                  </div>
                </div>
                <!-- Barre de progression taux réussite -->
                <div class="mb-2">
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span style="color: var(--text-muted)">Taux de réussite</span>
                    <span style="color: var(--text-secondary)">{{ promo.tauxReussite }}%</span>
                  </div>
                  <div class="w-full rounded-full h-2" style="background: var(--border-color)">
                    <div class="h-2 rounded-full transition-all"
                         [style.width.%]="promo.tauxReussite"
                         [style.background]="promo.tauxReussite >= 75 ? '#16a34a' : promo.tauxReussite >= 60 ? '#d97706' : '#dc2626'">
                    </div>
                  </div>
                </div>
                <!-- Distribution des notes mini chart -->
                <div class="flex items-end gap-0.5 h-8 mt-2">
                  @for (d of promo.distribution; track d.note) {
                    <div class="flex-1 flex flex-col items-center gap-0.5">
                      <div class="w-full rounded-t"
                           style="background: var(--accent); opacity: 0.7"
                           [style.height.px]="Math.max(4, (d.count / maxCount(promo)) * 32)"
                           [title]="d.note + ': ' + d.count + ' étudiants'">
                      </div>
                    </div>
                  }
                </div>
                <div class="flex gap-0.5 mt-0.5">
                  @for (d of promo.distribution; track d.note) {
                    <div class="flex-1 text-center">
                      <span class="text-xs" style="color: var(--text-muted)">{{ d.note }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class KpiDashboardComponent implements OnInit {
  readonly store = inject(AnalyticsStore);
  readonly Math = Math;

  ngOnInit() {
    this.store.loadKpiOverview();
    this.store.loadKpiAcademique();
  }

  formatXOF(amount: number): string {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + ' M XOF';
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' XOF';
  }

  maxCount(promo: any): number {
    return Math.max(...promo.distribution.map((d: any) => d.count), 1);
  }
}
