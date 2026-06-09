import {
  ChangeDetectionStrategy, Component, inject, signal, computed,
  OnInit, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { DashboardStore }   from '@sms/dashboard/data-access';
import { AuthStore }        from '@sms/shared/auth';

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS_FR   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

const QUICK_ACTIONS = [
  { path: '/students/new',           icon: 'person_add',     label: 'Nouvel élève',   color: '#6366f1', colorBg: 'rgba(99,102,241,0.10)'  },
  { path: '/finance/invoices',       icon: 'receipt_long',   label: 'Factures',       color: '#10b981', colorBg: 'rgba(16,185,129,0.10)'  },
  { path: '/academic',               icon: 'grade',          label: 'Notes',          color: '#8b5cf6', colorBg: 'rgba(139,92,246,0.10)'  },
  { path: '/communication',          icon: 'chat_bubble',    label: 'Messages',       color: '#06b6d4', colorBg: 'rgba(6,182,212,0.10)'   },
  { path: '/schedule',               icon: 'calendar_month', label: 'Planning',       color: '#f59e0b', colorBg: 'rgba(245,158,11,0.10)'  },
  { path: '/analytics',              icon: 'bar_chart',      label: 'Rapports',       color: '#ef4444', colorBg: 'rgba(239,68,68,0.10)'   },
];

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector:        'sms-dashboard',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="min-h-full pb-8" style="background: var(--content-bg)">

  <!-- ╔══════════════════════════════════════════════════════════╗ -->
  <!-- ║  HEADER — Welcome + Date + Actions                      ║ -->
  <!-- ╚══════════════════════════════════════════════════════════╝ -->
  <div class="px-6 pt-6 pb-5">
    <div class="flex flex-wrap items-start justify-between gap-4">

      <!-- Left: greeting -->
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
             style="background: var(--accent-light)">
          <mat-icon style="color: var(--accent); font-size: 22px; height: 22px; width: 22px">
            {{ greetingIcon() }}
          </mat-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold leading-tight" style="color: var(--text-primary)">
            {{ greeting() }}, {{ firstName() }} 👋
          </h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">
            {{ dateStr() }} · {{ timeStr() }}
            &nbsp;·&nbsp;
            <span class="inline-flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full inline-block" style="background: #10b981"></span>

            </span>
          </p>
        </div>
      </div>

      <!-- Right: header CTA buttons -->
      <div class="flex items-center gap-2">
        <a routerLink="/communication"
           class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
           style="background: var(--surface-1); border: 1px solid var(--border-color); color: var(--text-primary)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px; color: #06b6d4">chat_bubble</mat-icon>
          Messages
          <span class="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                style="background: #ef4444; color: white">7</span>
        </a>
        <a routerLink="/students/new"
           class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
           style="background: var(--accent)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">person_add</mat-icon>
          Nouvel élève
        </a>
      </div>
    </div>
  </div>

  <!-- ╔══════════════════════════════════════════════════════════╗ -->
  <!-- ║  KPI CARDS — 4 metrics with sparklines                  ║ -->
  <!-- ╚══════════════════════════════════════════════════════════╝ -->
  <div class="px-6 mb-6">
    @if (store.loading()) {
      <!-- Skeleton -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @for (_ of [1,2,3,4]; track $index) {
          <div class="rounded-xl p-5 animate-pulse" style="background: var(--surface-1); border: 1px solid var(--border-color)">
            <div class="flex justify-between mb-4">
              <div class="w-10 h-10 rounded-xl" style="background: var(--surface-2)"></div>
              <div class="w-16 h-6 rounded-full" style="background: var(--surface-2)"></div>
            </div>
            <div class="w-20 h-8 rounded mb-2" style="background: var(--surface-2)"></div>
            <div class="w-32 h-3 rounded mb-4" style="background: var(--surface-2)"></div>
            <div class="flex items-end gap-px h-8">
              @for (_ of [1,2,3,4,5,6,7,8,9,10,11,12]; track $index) {
                <div class="flex-1 rounded-sm" style="height: 60%; background: var(--surface-2)"></div>
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @for (kpi of store.kpis(); track kpi.id) {
          <div class="rounded-xl p-5 transition-shadow hover:shadow-md cursor-default"
               style="background: var(--surface-1); border: 1px solid var(--border-color)">

            <!-- Top row: icon + trend badge -->
            <div class="flex items-start justify-between mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   [style.background]="kpi.colorBg">
                <mat-icon [style.color]="kpi.color" style="font-size: 20px; height: 20px; width: 20px">
                  {{ kpi.icon }}
                </mat-icon>
              </div>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                    [style.background]="kpi.trendPositive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'"
                    [style.color]="kpi.trendPositive ? '#10b981' : '#ef4444'">
                <mat-icon style="font-size: 12px; height: 12px; width: 12px">
                  {{ kpi.trendPositive ? 'trending_up' : 'trending_down' }}
                </mat-icon>
                {{ kpi.changeStr }}
              </span>
            </div>

            <!-- Value -->
            <p class="text-3xl font-extrabold leading-none mb-1"
               style="color: var(--text-primary)">{{ kpi.valueDisplay }}</p>
            <p class="text-sm font-medium mb-3"
               style="color: var(--text-secondary)">{{ kpi.label }}</p>

            <!-- Sparkline mini chart -->
            <div class="flex items-end gap-px" style="height: 32px">
              @for (v of kpi.sparkline; track $index) {
                <div class="flex-1 rounded-t-sm"
                     [style.height.%]="v"
                     [style.background]="kpi.color"
                     [style.opacity]="0.25 + ($index / kpi.sparkline.length) * 0.75">
                </div>
              }
            </div>

            <!-- Comparison -->
            <p class="text-xs mt-2" style="color: var(--text-muted)">
              vs {{ kpi.prevDisplay }} le mois dernier
            </p>
          </div>
        }
      </div>
    }
  </div>

  <!-- ╔══════════════════════════════════════════════════════════╗ -->
  <!-- ║  QUICK STATS — 4 secondary metrics                      ║ -->
  <!-- ╚══════════════════════════════════════════════════════════╝ -->
  <div class="px-6 mb-6">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      @for (stat of store.quickStats(); track stat.label) {
        <div class="rounded-xl px-4 py-3 flex items-center gap-3 transition-opacity hover:opacity-80"
             style="background: var(--surface-1); border: 1px solid var(--border-color)">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
               [style.background]="stat.colorBg">
            <mat-icon [style.color]="stat.color" style="font-size: 17px; height: 17px; width: 17px">
              {{ stat.icon }}
            </mat-icon>
          </div>
          <div>
            <p class="text-lg font-bold leading-none" style="color: var(--text-primary)">{{ stat.value }}</p>
            <p class="text-xs mt-0.5" style="color: var(--text-secondary)">{{ stat.label }}</p>
          </div>
        </div>
      }
    </div>
  </div>

  <!-- ╔══════════════════════════════════════════════════════════╗ -->
  <!-- ║  CHARTS ROW — Bar chart + Finance donut                 ║ -->
  <!-- ╚══════════════════════════════════════════════════════════╝ -->
  <div class="px-6 mb-6 grid grid-cols-1 xl:grid-cols-5 gap-4">

    <!-- ── Bar chart: Enrollment evolution (3/5) ───────────────── -->
    <div class="xl:col-span-3 rounded-xl p-5"
         style="background: var(--surface-1); border: 1px solid var(--border-color)">

      <div class="flex items-start justify-between mb-6">
        <div>
          <h3 class="font-semibold" style="color: var(--text-primary)">Évolution des inscriptions</h3>
          <p class="text-xs mt-0.5" style="color: var(--text-secondary)">6 derniers mois · Année académique 2025–2026</p>
        </div>
        <div class="flex gap-1 p-1 rounded-lg" style="background: var(--surface-2)">
          <button class="px-3 py-1 rounded-md text-xs font-semibold text-white" style="background: var(--accent)">6 mois</button>
          <button class="px-3 py-1 rounded-md text-xs font-medium" style="color: var(--text-secondary)">1 an</button>
        </div>
      </div>

      <!-- Y-axis labels + bars -->
      <div class="flex gap-4">
        <!-- Y axis -->
        <div class="flex flex-col justify-between text-right pb-6" style="min-width: 36px">
          @for (label of yAxisLabels(); track $index) {
            <span class="text-xs" style="color: var(--text-muted)">{{ label }}</span>
          }
        </div>

        <!-- Chart area -->
        <div class="flex-1">
          <!-- Grid lines -->
          <div class="relative" style="height: 140px">
            @for (_ of [0,1,2,3,4]; track $index) {
              <div class="absolute left-0 right-0 border-dashed"
                   style="border-top: 1px solid var(--border-color)"
                   [style.top.%]="$index * 25"></div>
            }

            <!-- Bars -->
            <div class="absolute inset-0 flex items-end gap-2">
              @for (point of store.evolution(); track point.month) {
                <div class="flex-1 flex flex-col items-center gap-1 group">
                  <!-- Value label on hover -->
                  <div class="relative w-full">
                    <div class="w-full rounded-t-md transition-all duration-300 group-hover:opacity-80 cursor-pointer"
                         [style.height]="getBarPx(point.value) + 'px'"
                         style="background: linear-gradient(to top, #6366f1, #a5b4fc); min-height: 6px">
                    </div>
                    <!-- Tooltip -->
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block
                                px-2 py-1 rounded text-xs font-bold text-white z-10"
                         style="background: var(--accent); white-space: nowrap">
                      {{ point.value }}
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- X axis labels -->
          <div class="flex gap-2 mt-2">
            @for (point of store.evolution(); track point.month) {
              <div class="flex-1 text-center">
                <span class="text-xs font-medium" style="color: var(--text-secondary)">{{ point.month }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Summary row -->
      <div class="flex items-center justify-between mt-4 pt-4"
           style="border-top: 1px solid var(--border-color)">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded" style="background: #6366f1"></div>
          <span class="text-xs" style="color: var(--text-secondary)">Inscriptions mensuelles</span>
        </div>
        <div class="flex items-center gap-1 text-xs font-semibold" style="color: #10b981">
          <mat-icon style="font-size: 14px; height: 14px; width: 14px">trending_up</mat-icon>
          +17.6% depuis janvier
        </div>
      </div>
    </div>

    <!-- ── Donut chart: Finance distribution (2/5) ─────────────── -->
    <div class="xl:col-span-2 rounded-xl p-5 flex flex-col"
         style="background: var(--surface-1); border: 1px solid var(--border-color)">

      <div class="mb-4">
        <h3 class="font-semibold" style="color: var(--text-primary)">Répartition financière</h3>
        <p class="text-xs mt-0.5" style="color: var(--text-secondary)">Budget total · {{ store.totalBudgetDisplay() }}</p>
      </div>

      <!-- Donut -->
      <div class="relative mx-auto mb-5" style="width: 144px; height: 144px">
        <div class="w-full h-full rounded-full"
             [style.background]="store.donutGradient()">
        </div>
        <!-- Inner circle -->
        <div class="absolute rounded-full flex flex-col items-center justify-center"
             style="inset: 20px; background: var(--surface-1)">
          <p class="text-xl font-extrabold leading-none" style="color: var(--text-primary)">82%</p>
          <p class="text-xs mt-0.5" style="color: var(--text-secondary)">recouvré</p>
        </div>
      </div>

      <!-- Legend -->
      <div class="space-y-2.5 flex-1">
        @for (seg of store.financeSegments(); track seg.label) {
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                   [style.background]="seg.color"></div>
              <span class="text-sm" style="color: var(--text-secondary)">{{ seg.label }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs" style="color: var(--text-muted)">{{ seg.display }} XOF</span>
              <span class="text-sm font-semibold tabular-nums" style="color: var(--text-primary)">{{ seg.pct }}%</span>
            </div>
          </div>
        }
      </div>

      <!-- CTA -->
      <a routerLink="/finance"
         class="mt-4 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
         style="background: rgba(16,185,129,0.10); color: #10b981">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">open_in_new</mat-icon>
        Détail financier
      </a>
    </div>
  </div>

  <!-- ╔══════════════════════════════════════════════════════════╗ -->
  <!-- ║  ACTIVITY + ALERTS + QUICK ACTIONS                      ║ -->
  <!-- ╚══════════════════════════════════════════════════════════╝ -->
  <div class="px-6 mb-6 grid grid-cols-1 lg:grid-cols-5 gap-4">

    <!-- ── Activity timeline (3/5) ─────────────────────────────── -->
    <div class="lg:col-span-3 rounded-xl p-5"
         style="background: var(--surface-1); border: 1px solid var(--border-color)">

      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="font-semibold" style="color: var(--text-primary)">Activité récente</h3>
          <p class="text-xs mt-0.5" style="color: var(--text-secondary)">Dernières opérations sur la plateforme</p>
        </div>
        <button class="text-xs font-semibold transition-opacity hover:opacity-70"
                style="color: var(--accent)">Voir tout →</button>
      </div>

      <!-- Timeline -->
      <div class="relative">
        <!-- Vertical line -->
        <div class="absolute left-[15px] top-2 bottom-2 w-px"
             style="background: var(--border-color)"></div>

        <div class="space-y-4">
          @for (act of store.activities(); track act.id) {
            <div class="flex items-start gap-3">
              <!-- Icon dot -->
              <div class="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                   [style.background]="act.colorBg"
                   [style.border]="'1.5px solid ' + act.color">
                <mat-icon [style.color]="act.color" style="font-size: 15px; height: 15px; width: 15px">
                  {{ act.icon }}
                </mat-icon>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0 pt-0.5">
                <p class="text-sm font-medium" style="color: var(--text-primary)">{{ act.text }}</p>
                <p class="text-xs mt-0.5" style="color: var(--text-secondary)">{{ act.subtext }}</p>
                <p class="text-xs mt-1" style="color: var(--text-muted)">{{ act.time }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- ── Right panel: Alerts + Quick Actions (2/5) ───────────── -->
    <div class="lg:col-span-2 flex flex-col gap-4">

      <!-- Alerts -->
      <div class="rounded-xl p-5"
           style="background: var(--surface-1); border: 1px solid var(--border-color)">
        <div class="flex items-center gap-2 mb-4">
          <mat-icon style="color: #ef4444; font-size: 18px; height: 18px; width: 18px">
            notifications_active
          </mat-icon>
          <h3 class="font-semibold" style="color: var(--text-primary)">Alertes prioritaires</h3>
          <span class="ml-auto px-2 py-0.5 rounded-full text-xs font-bold"
                style="background: rgba(239,68,68,0.12); color: #ef4444">
            {{ store.alerts().length }}
          </span>
        </div>

        <div class="space-y-3">
          @for (alert of store.alerts(); track alert.id) {
            <a [routerLink]="alert.route"
               class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-opacity hover:opacity-80"
               [style.background]="alert.bg">
              <mat-icon [style.color]="alert.iconColor"
                        style="font-size: 17px; height: 17px; width: 17px; flex-shrink: 0; margin-top: 1px">
                {{ alert.icon }}
              </mat-icon>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold" [style.color]="alert.textColor">{{ alert.title }}</p>
                <p class="text-xs mt-0.5" style="color: var(--text-secondary)">{{ alert.desc }}</p>
              </div>
              <span class="text-xs font-extrabold px-2 py-1 rounded-full flex-shrink-0 tabular-nums"
                    [style.color]="alert.textColor"
                    [style.background]="alert.badgeBg">
                {{ alert.count }}
              </span>
            </a>
          }
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="rounded-xl p-5 flex-1"
           style="background: var(--surface-1); border: 1px solid var(--border-color)">
        <h3 class="font-semibold mb-4" style="color: var(--text-primary)">Actions rapides</h3>
        <div class="grid grid-cols-3 gap-2">
          @for (action of quickActions; track action.path) {
            <a [routerLink]="action.path"
               class="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:shadow-sm cursor-pointer"
               style="border: 1px solid var(--border-color); background: var(--surface-2)">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                   [style.background]="action.colorBg">
                <mat-icon [style.color]="action.color" style="font-size: 19px; height: 19px; width: 19px">
                  {{ action.icon }}
                </mat-icon>
              </div>
              <span class="text-xs font-medium text-center leading-tight"
                    style="color: var(--text-primary)">{{ action.label }}</span>
            </a>
          }
        </div>
      </div>
    </div>
  </div>

  <!-- ╔══════════════════════════════════════════════════════════╗ -->
  <!-- ║  BOTTOM ROW — Promotion stats + Agenda                  ║ -->
  <!-- ╚══════════════════════════════════════════════════════════╝ -->
  <div class="px-6 grid grid-cols-1 lg:grid-cols-5 gap-4">

    <!-- ── Promotion success rates (3/5) ───────────────────────── -->
    <div class="lg:col-span-3 rounded-xl p-5"
         style="background: var(--surface-1); border: 1px solid var(--border-color)">

      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="font-semibold" style="color: var(--text-primary)">Taux de réussite par promotion</h3>
          <p class="text-xs mt-0.5" style="color: var(--text-secondary)">Semestre 1 · 2025–2026</p>
        </div>
        <a routerLink="/analytics"
           class="text-xs font-semibold transition-opacity hover:opacity-70"
           style="color: var(--accent)">Analytiques →</a>
      </div>

      <div class="space-y-4">
        @for (promo of store.promotionStats(); track promo.libelle) {
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm truncate flex-1 mr-4" style="color: var(--text-primary)">
                {{ promo.libelle }}
              </span>
              <div class="flex items-center gap-3 flex-shrink-0">
                <span class="text-xs" style="color: var(--text-muted)">{{ promo.effectif }} élèves</span>
                <span class="text-xs" style="color: var(--text-secondary)">moy. {{ promo.moyenne }}/20</span>
                <span class="text-sm font-extrabold tabular-nums"
                      [style.color]="getSuccessColor(promo.tauxReussite)">
                  {{ promo.tauxReussite }}%
                </span>
              </div>
            </div>
            <!-- Progress bar -->
            <div class="h-2 rounded-full overflow-hidden" style="background: var(--surface-2)">
              <div class="h-full rounded-full transition-all duration-700"
                   [style.width.%]="promo.tauxReussite"
                   [style.background]="getSuccessColor(promo.tauxReussite)">
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Summary -->
      <div class="flex items-center gap-6 mt-5 pt-4" style="border-top: 1px solid var(--border-color)">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full" style="background: #10b981"></div>
          <span class="text-xs" style="color: var(--text-secondary)">≥ 80% Excellent</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full" style="background: #f59e0b"></div>
          <span class="text-xs" style="color: var(--text-secondary)">50–79% Acceptable</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full" style="background: #ef4444"></div>
          <span class="text-xs" style="color: var(--text-secondary)">< 50% Critique</span>
        </div>
      </div>
    </div>

    <!-- ── Weekly agenda (2/5) ──────────────────────────────────── -->
    <div class="lg:col-span-2 rounded-xl p-5"
         style="background: var(--surface-1); border: 1px solid var(--border-color)">

      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="font-semibold" style="color: var(--text-primary)">Agenda de la semaine</h3>
          <p class="text-xs mt-0.5" style="color: var(--text-secondary)">9 – 13 juin 2026</p>
        </div>
        <a routerLink="/schedule"
           class="text-xs font-semibold transition-opacity hover:opacity-70"
           style="color: var(--accent)">Planning →</a>
      </div>

      <div class="space-y-3">
        @for (event of store.agenda(); track event.id) {
          <div class="flex items-center gap-3 p-2.5 rounded-lg transition-opacity hover:opacity-80 cursor-pointer"
               style="background: var(--surface-2)">
            <!-- Day badge -->
            <div class="flex flex-col items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                 [style.background]="event.color + '1a'"
                 [style.border]="'1.5px solid ' + event.color + '40'">
              <span class="text-[9px] font-bold leading-none" [style.color]="event.color">
                {{ event.dayLabel }}
              </span>
              <span class="text-base font-extrabold leading-none mt-0.5" style="color: var(--text-primary)">
                {{ event.day }}
              </span>
            </div>

            <!-- Event info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate" style="color: var(--text-primary)">{{ event.title }}</p>
              <p class="text-xs mt-0.5" style="color: var(--text-secondary)">{{ event.time }}</p>
            </div>

            <!-- Color dot -->
            <div class="w-2 h-2 rounded-full flex-shrink-0"
                 [style.background]="event.color"></div>
          </div>
        }
      </div>
    </div>
  </div>

</div>

  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  protected readonly store       = inject(DashboardStore);
  protected readonly authStore   = inject(AuthStore);
  protected readonly quickActions = QUICK_ACTIONS;

  // ── Live clock ────────────────────────────────────────────────
  protected readonly now  = signal(new Date());
  private _clock: ReturnType<typeof setInterval> | null = null;

  // ── Computed ──────────────────────────────────────────────────
  protected readonly greeting = computed(() => {
    const h = this.now().getHours();
    if (h < 5)  return 'Bonne nuit';
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonne soirée';
  });

  protected readonly greetingIcon = computed(() => {
    const h = this.now().getHours();
    if (h < 5)  return 'bedtime';
    if (h < 12) return 'wb_sunny';
    if (h < 18) return 'wb_cloudy';
    return 'nights_stay';
  });

  protected readonly firstName = computed(() => {
    const u = this.authStore.currentUser();
    return u?.firstName ?? 'Administrateur';
  });

  protected readonly dateStr = computed(() => {
    const d = this.now();
    return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
  });

  protected readonly timeStr = computed(() => {
    const d = this.now();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  protected readonly yAxisLabels = computed(() => {
    const max = this.store.evolutionMax();
    const step = Math.ceil(max / 4 / 50) * 50;
    return [max, max - step, max - 2 * step, max - 3 * step, 0]
      .map(v => v > 0 ? v.toString() : '0');
  });

  // ── Helpers ───────────────────────────────────────────────────
  protected getBarPx(value: number): number {
    const max = this.store.evolutionMax();
    return Math.round((value / max) * 128); // 128px chart height
  }

  protected getSuccessColor(rate: number): string {
    if (rate >= 80) return '#10b981';
    if (rate >= 50) return '#f59e0b';
    return '#ef4444';
  }

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadDashboard();
    this._clock = setInterval(() => this.now.set(new Date()), 60_000);
  }

  ngOnDestroy(): void {
    if (this._clock) clearInterval(this._clock);
  }
}
