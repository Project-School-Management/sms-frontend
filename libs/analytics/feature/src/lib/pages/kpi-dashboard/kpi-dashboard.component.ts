import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsStore } from '@sms/analytics/data-access';

@Component({
  selector: 'sms-kpi-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Analytics & KPIs</h1>
        <a routerLink="/analytics/rapports"
           class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Rapports
        </a>
      </div>

      @if (store.loading()) {
        <div class="text-gray-500">Chargement...</div>
      }

      @if (store.kpiOverview(); as kpi) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <p class="text-sm text-gray-500">Étudiants</p>
            <p class="text-3xl font-bold text-gray-900">{{ kpi.totalEtudiants }}</p>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <p class="text-sm text-gray-500">Enseignants</p>
            <p class="text-3xl font-bold text-gray-900">{{ kpi.totalEnseignants }}</p>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <p class="text-sm text-gray-500">Taux de réussite</p>
            <p class="text-3xl font-bold text-green-600">{{ kpi.tauxReussite }}%</p>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <p class="text-sm text-gray-500">Recouvrement</p>
            <p class="text-3xl font-bold text-blue-600">{{ kpi.tauxRecouvrement }}%</p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="bg-green-50 rounded-lg p-4 border border-green-100">
            <p class="text-sm text-green-700">Total encaissé</p>
            <p class="text-xl font-bold text-green-700">{{ kpi.totalEncaisse | number }} XOF</p>
          </div>
          <div class="bg-red-50 rounded-lg p-4 border border-red-100">
            <p class="text-sm text-red-700">Total impayé</p>
            <p class="text-xl font-bold text-red-700">{{ kpi.totalImpaye | number }} XOF</p>
          </div>
          <div class="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <p class="text-sm text-orange-700">Factures en retard</p>
            <p class="text-xl font-bold text-orange-700">{{ kpi.nbFacturesEnRetard }}</p>
          </div>
        </div>
      }

      @if (store.kpiAcademique().length > 0) {
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Résultats par promotion</h2>
          <div class="space-y-4">
            @for (promo of store.kpiAcademique(); track promo.promotionLibelle) {
              <div class="border border-gray-100 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <p class="font-medium text-gray-900">{{ promo.promotionLibelle }}</p>
                  <div class="flex items-center gap-4 text-sm">
                    <span class="text-gray-500">{{ promo.effectif }} étudiants</span>
                    <span class="font-medium text-blue-600">Moy : {{ promo.moyenneGenerale }}/20</span>
                    <span [class]="promo.tauxReussite >= 75 ? 'text-green-600' : 'text-yellow-600'" class="font-bold">
                      {{ promo.tauxReussite }}% réussite
                    </span>
                  </div>
                </div>
                <div class="flex gap-1 h-3 rounded overflow-hidden bg-gray-100">
                  @for (d of promo.distribution; track d.note) {
                    <div [style.flex]="d.count" class="bg-blue-400" [title]="d.note + ': ' + d.count"></div>
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

  ngOnInit() {
    this.store.loadKpiOverview();
    this.store.loadKpiAcademique();
  }
}
