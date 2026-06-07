import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardStore } from '@sms/dashboard/data-access';

@Component({
  selector: 'sms-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
      <p class="text-gray-500 mb-8">Vue d'ensemble de l'établissement</p>

      @if (store.loading()) {
        <div class="text-gray-500">Chargement...</div>
      }

      @if (store.summary(); as s) {
        <!-- KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p class="text-sm text-gray-500 mb-1">Étudiants</p>
            <p class="text-3xl font-bold text-gray-900">{{ s.totalEtudiants }}</p>
          </div>
          <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p class="text-sm text-gray-500 mb-1">Enseignants</p>
            <p class="text-3xl font-bold text-gray-900">{{ s.totalEnseignants }}</p>
          </div>
          <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p class="text-sm text-gray-500 mb-1">Taux de réussite</p>
            <p class="text-3xl font-bold text-green-600">{{ s.tauxReussite }}%</p>
          </div>
          <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p class="text-sm text-gray-500 mb-1">Recouvrement</p>
            <p class="text-3xl font-bold text-blue-600">{{ s.tauxRecouvrement }}%</p>
          </div>
          <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p class="text-sm text-gray-500 mb-1">Notifications non lues</p>
            <p class="text-3xl font-bold" [class]="s.nbNotifications > 0 ? 'text-orange-500' : 'text-gray-900'">
              {{ s.nbNotifications }}
            </p>
          </div>
          <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p class="text-sm text-gray-500 mb-1">Factures en retard</p>
            <p class="text-3xl font-bold text-red-500">{{ s.nbFacturesEnRetard }}</p>
          </div>
        </div>

        <!-- Quick Access -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Accès rapide</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            @for (item of quickLinks; track item.path) {
              <a [routerLink]="item.path"
                 class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors text-center">
                <span class="text-3xl">{{ item.icon }}</span>
                <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  readonly store = inject(DashboardStore);

  readonly quickLinks = [
    { path: '/students',      icon: '👥', label: 'Étudiants' },
    { path: '/academic',      icon: '📝', label: 'Notes' },
    { path: '/schedule',      icon: '📅', label: 'Emploi du temps' },
    { path: '/finance',       icon: '💳', label: 'Finances' },
    { path: '/learning',      icon: '📚', label: 'Cours' },
    { path: '/communication', icon: '💬', label: 'Messages' },
    { path: '/analytics',     icon: '📊', label: 'Analytics' },
    { path: '/admin',         icon: '⚙️',  label: 'Administration' },
  ];

  ngOnInit() {
    this.store.loadSummary();
  }
}
