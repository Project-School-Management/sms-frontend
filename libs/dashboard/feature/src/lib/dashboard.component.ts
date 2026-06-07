import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DashboardStore } from '@sms/dashboard/data-access';

@Component({
  selector: 'sms-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Tableau de bord</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Vue d'ensemble de l'établissement — Année 2025-2026</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background: #dcfce7; color: #16a34a">
            Année active
          </span>
          <span class="text-sm font-medium" style="color: var(--text-secondary)">07 Juin 2026</span>
        </div>
      </div>

      @if (store.loading()) {
        <div class="flex items-center justify-center py-16" style="color: var(--text-secondary)">
          <mat-icon class="animate-spin">refresh</mat-icon>&nbsp;Chargement...
        </div>
      }

      @if (store.summary(); as s) {
        <!-- KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div class="sms-card p-4 flex flex-col gap-2">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
              <mat-icon style="color: var(--accent)">school</mat-icon>
            </div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ s.totalEtudiants | number }}</p>
            <p class="text-xs" style="color: var(--text-secondary)">Étudiants</p>
          </div>
          <div class="sms-card p-4 flex flex-col gap-2">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: rgba(34,197,94,0.12)">
              <mat-icon style="color: #16a34a">person</mat-icon>
            </div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ s.totalEnseignants }}</p>
            <p class="text-xs" style="color: var(--text-secondary)">Enseignants</p>
          </div>
          <div class="sms-card p-4 flex flex-col gap-2">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: rgba(59,130,246,0.12)">
              <mat-icon style="color: #2563eb">trending_up</mat-icon>
            </div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ s.tauxReussite }}%</p>
            <p class="text-xs" style="color: var(--text-secondary)">Taux réussite</p>
          </div>
          <div class="sms-card p-4 flex flex-col gap-2">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: rgba(168,85,247,0.12)">
              <mat-icon style="color: #7c3aed">payments</mat-icon>
            </div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ s.tauxRecouvrement }}%</p>
            <p class="text-xs" style="color: var(--text-secondary)">Recouvrement</p>
          </div>
          <div class="sms-card p-4 flex flex-col gap-2">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: rgba(245,158,11,0.12)">
              <mat-icon style="color: #d97706">notifications</mat-icon>
            </div>
            <p class="text-2xl font-bold" [style.color]="s.nbNotifications > 0 ? '#d97706' : 'var(--text-primary)'">{{ s.nbNotifications }}</p>
            <p class="text-xs" style="color: var(--text-secondary)">Notifications</p>
          </div>
          <div class="sms-card p-4 flex flex-col gap-2">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: rgba(239,68,68,0.12)">
              <mat-icon style="color: #dc2626">warning</mat-icon>
            </div>
            <p class="text-2xl font-bold" style="color: #dc2626">{{ s.nbFacturesEnRetard }}</p>
            <p class="text-xs" style="color: var(--text-secondary)">Factures retard</p>
          </div>
        </div>

        <!-- Main layout 2 cols -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left column — 2/3 -->
          <div class="lg:col-span-2 flex flex-col gap-6">
            <!-- Activité récente -->
            <div class="sms-card overflow-hidden">
              <div class="px-5 py-4 border-b flex items-center justify-between" style="border-color: var(--border-color)">
                <h3 class="font-semibold" style="color: var(--text-primary)">Activité récente</h3>
                <span class="text-xs px-2 py-0.5 rounded-full" style="background: var(--surface-2); color: var(--text-secondary)">
                  Aujourd'hui
                </span>
              </div>
              <div class="divide-y" style="border-color: var(--border-color)">
                @for (act of store.activites(); track act.id) {
                  <div class="px-5 py-3 flex items-start gap-3 hover:opacity-80 transition-opacity">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" [style.background]="act.iconColor + '20'">
                      <mat-icon [style.color]="act.iconColor" style="font-size: 16px; height: 16px; width: 16px">{{ act.icon }}</mat-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium" style="color: var(--text-primary)">{{ act.texte }}</p>
                      <p class="text-xs mt-0.5 truncate" style="color: var(--text-secondary)">{{ act.description }}</p>
                    </div>
                    <p class="text-xs shrink-0" style="color: var(--text-muted)">{{ act.timestamp | date:'HH:mm' }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Accès rapide -->
            <div class="sms-card p-5">
              <h3 class="font-semibold mb-4" style="color: var(--text-primary)">Accès rapide</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                @for (item of quickLinks; track item.path) {
                  <a [routerLink]="item.path"
                     class="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:opacity-80"
                     style="border-color: var(--border-color); background: var(--surface-2)">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center" [style.background]="item.color + '18'">
                      <mat-icon [style.color]="item.color">{{ item.icon }}</mat-icon>
                    </div>
                    <span class="text-xs font-medium text-center leading-tight" style="color: var(--text-primary)">{{ item.label }}</span>
                  </a>
                }
              </div>
            </div>
          </div>

          <!-- Right column — 1/3 — Alertes -->
          <div class="flex flex-col gap-4">
            <div class="sms-card overflow-hidden">
              <div class="px-5 py-4 border-b" style="border-color: var(--border-color)">
                <h3 class="font-semibold" style="color: var(--text-primary)">Alertes</h3>
              </div>
              <div class="p-4 flex flex-col gap-3">
                @for (alerte of store.alertes(); track alerte.id) {
                  <div class="p-3 rounded-xl border"
                       [style.border-color]="alerte.niveau === 'URGENT' ? '#fca5a5' : alerte.niveau === 'AVERTISSEMENT' ? '#fcd34d' : '#93c5fd'"
                       [style.background]="alerte.niveau === 'URGENT' ? '#fef2f2' : alerte.niveau === 'AVERTISSEMENT' ? '#fffbeb' : '#eff6ff'">
                    <div class="flex items-start gap-2">
                      <mat-icon style="font-size: 16px; height: 16px; width: 16px; margin-top: 2px"
                                [style.color]="alerte.niveau === 'URGENT' ? '#dc2626' : alerte.niveau === 'AVERTISSEMENT' ? '#d97706' : '#2563eb'">
                        {{ alerte.niveau === 'URGENT' ? 'error' : alerte.niveau === 'AVERTISSEMENT' ? 'warning' : 'info' }}
                      </mat-icon>
                      <div class="flex-1">
                        <p class="text-sm font-semibold"
                           [style.color]="alerte.niveau === 'URGENT' ? '#dc2626' : alerte.niveau === 'AVERTISSEMENT' ? '#d97706' : '#2563eb'">
                          {{ alerte.titre }}
                        </p>
                        <p class="text-xs mt-0.5" style="color: var(--text-secondary)">{{ alerte.description }}</p>
                        @if (alerte.actionUrl) {
                          <a [routerLink]="alerte.actionUrl" class="text-xs font-medium mt-1 inline-block hover:underline"
                             [style.color]="alerte.niveau === 'URGENT' ? '#dc2626' : '#d97706'">
                            {{ alerte.actionLabel }} →
                          </a>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Évolution inscriptions -->
            <div class="sms-card p-5">
              <h3 class="font-semibold mb-4" style="color: var(--text-primary)">Inscriptions 2026</h3>
              <div class="flex items-end gap-1 h-24">
                @for (ev of store.evolution(); track ev.mois) {
                  <div class="flex-1 flex flex-col items-center gap-1">
                    <div class="w-full rounded-t-sm" style="background: var(--accent)"
                         [style.height.%]="(ev.count / 847) * 100" [style.min-height.px]="4"></div>
                    <span class="text-xs" style="color: var(--text-muted)">{{ ev.mois }}</span>
                  </div>
                }
              </div>
              <p class="text-xs mt-3 text-right" style="color: var(--text-secondary)">
                Total : <strong style="color: var(--text-primary)">847 étudiants</strong>
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  readonly store = inject(DashboardStore);

  readonly quickLinks = [
    { path: '/students',      icon: 'people',        label: 'Étudiants',      color: '#6366f1' },
    { path: '/academic',      icon: 'grading',       label: 'Notes',          color: '#2563eb' },
    { path: '/schedule',      icon: 'calendar_month',label: 'Emploi du temps',color: '#0891b2' },
    { path: '/finance',       icon: 'account_balance',label: 'Finances',      color: '#16a34a' },
    { path: '/learning',      icon: 'menu_book',     label: 'Cours',          color: '#7c3aed' },
    { path: '/communication', icon: 'chat',          label: 'Messages',       color: '#d97706' },
    { path: '/analytics',     icon: 'bar_chart',     label: 'Analytics',      color: '#dc2626' },
    { path: '/admin',         icon: 'settings',      label: 'Administration', color: '#475569' },
  ];

  ngOnInit() {
    this.store.loadSummary();
  }
}
