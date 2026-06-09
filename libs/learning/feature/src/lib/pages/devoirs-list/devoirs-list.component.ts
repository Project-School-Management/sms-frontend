import {
  Component, inject, OnInit, ChangeDetectionStrategy, signal, computed,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';
import { IDevoir }       from '@sms/shared/models';

type DevoirTab = 'TOUS' | 'OUVERT' | 'FERME' | 'CORRIGE';

const STATUT_CFG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  OUVERT:  { label:'Ouvert',   bg:'rgba(22,163,74,0.10)',   color:'#16a34a', icon:'lock_open'    },
  FERME:   { label:'Fermé',    bg:'rgba(239,68,68,0.10)',   color:'#dc2626', icon:'lock'         },
  CORRIGE: { label:'Corrigé',  bg:'rgba(99,102,241,0.10)',  color:'#6366f1', icon:'check_circle' },
};

@Component({
  selector:        'sms-devoirs-list',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-5 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Devoirs & Travaux</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Suivi des devoirs, TP et projets · {{ store.devoirs().length }} au total
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <a routerLink="/learning"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        Tableau de bord
      </a>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
        Nouveau devoir
      </button>
    </div>
  </div>

  <!-- ── KPIs ──────────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:var(--accent-light)">
        <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">assignment</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.devoirs().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Total</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(22,163,74,0.10)">
        <mat-icon style="color:#16a34a;font-size:20px;height:20px;width:20px">lock_open</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.devoirsOuverts().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Ouverts</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(239,68,68,0.10)">
        <mat-icon style="color:#dc2626;font-size:20px;height:20px;width:20px">lock</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.devoirsFermes().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Fermés</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(99,102,241,0.10)">
        <mat-icon style="color:#6366f1;font-size:20px;height:20px;width:20px">check_circle</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.devoirsCorr().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Corrigés</p>
      </div>
    </div>
  </div>

  <!-- ── Onglets ────────────────────────────────────────────────────────────── -->
  <div class="flex gap-1 mb-5 p-1 rounded-2xl"
       style="background:var(--surface-2);border:1px solid var(--border-color)">
    @for (tab of tabs; track tab.id) {
      <button (click)="activeTab.set(tab.id)"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center"
              [style.background]="activeTab()===tab.id ? 'var(--surface-1)' : 'transparent'"
              [style.color]="activeTab()===tab.id ? 'var(--text-primary)' : 'var(--text-secondary)'"
              [style.box-shadow]="activeTab()===tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'">
        <mat-icon style="font-size:16px;height:16px;width:16px">{{ tab.icon }}</mat-icon>
        {{ tab.label }}
        <span class="px-1.5 py-0.5 rounded-full text-xs font-bold"
              [style.background]="activeTab()===tab.id ? 'var(--accent)' : 'rgba(37,99,235,0.10)'"
              [style.color]="activeTab()===tab.id ? '#fff' : 'var(--accent)'">
          {{ tab.count() }}
        </span>
      </button>
    }
  </div>

  <!-- ── Liste devoirs ──────────────────────────────────────────────────────── -->
  @if (store.loading()) {
    <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement…
    </div>
  } @else {
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      @for (d of devoirsFiltres(); track d.publicId) {
        <div class="sms-card p-5 flex flex-col gap-4 border-t-4"
             [style.border-top-color]="statutCfg(d.statut).color">
          <!-- Header -->
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 [style.background]="statutCfg(d.statut).bg">
              <mat-icon [style.color]="statutCfg(d.statut).color"
                        style="font-size:18px;height:18px;width:18px">
                {{ statutCfg(d.statut).icon }}
              </mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-sm leading-tight" style="color:var(--text-primary)">{{ d.titre }}</h3>
              <p class="text-xs mt-0.5" style="color:var(--text-secondary)">{{ d.coursLibelle }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-bold shrink-0"
                  [style.background]="statutCfg(d.statut).bg"
                  [style.color]="statutCfg(d.statut).color">
              {{ statutCfg(d.statut).label }}
            </span>
          </div>

          <!-- Description -->
          <p class="text-xs line-clamp-2" style="color:var(--text-secondary)">{{ d.description }}</p>

          <!-- Progress soumissions -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-semibold" style="color:var(--text-secondary)">Soumissions</span>
              <span class="text-xs font-bold" style="color:var(--text-primary)">
                {{ d.nbSoumissions }} / {{ d.nbEtudiants }}
              </span>
            </div>
            <div class="rounded-full h-2" style="background:var(--surface-2)">
              <div class="h-2 rounded-full transition-all"
                   [style.background]="progressColor(d)"
                   [style.width]="progressPct(d) + '%'"></div>
            </div>
            <p class="text-xs mt-1 text-right" style="color:var(--text-muted)">{{ progressPct(d) }}%</p>
          </div>

          <!-- Méta-données -->
          <div class="flex flex-wrap gap-3 text-xs" style="color:var(--text-muted)">
            <span class="flex items-center gap-1">
              <mat-icon style="font-size:12px;height:12px;width:12px">grade</mat-icon>
              {{ d.bareme }} pts
            </span>
            <span class="flex items-center gap-1">
              <mat-icon style="font-size:12px;height:12px;width:12px">event</mat-icon>
              Limite : {{ d.dateLimite }}
            </span>
            @if (d.pieceJointe) {
              <span class="flex items-center gap-1">
                <mat-icon style="font-size:12px;height:12px;width:12px">attach_file</mat-icon>
                {{ d.pieceJointe }}
              </span>
            }
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-2 border-t" style="border-color:var(--border-color)">
            <a [routerLink]="['/learning/devoirs', d.publicId]"
               class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white hover:opacity-80 flex-1 justify-center"
               style="background:var(--accent)">
              <mat-icon style="font-size:14px;height:14px;width:14px">visibility</mat-icon>
              Voir les soumissions
            </a>
            @if (d.statut === 'OUVERT') {
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80"
                      style="background:rgba(239,68,68,0.10);color:#dc2626">
                <mat-icon style="font-size:14px;height:14px;width:14px">lock</mat-icon>
                Clôturer
              </button>
            }
          </div>
        </div>
      }
    </div>

    @if (devoirsFiltres().length === 0) {
      <div class="flex flex-col items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
        <mat-icon style="font-size:48px;height:48px;width:48px;opacity:0.3">assignment_turned_in</mat-icon>
        <p class="font-semibold">Aucun devoir pour ce filtre</p>
      </div>
    }
  }

</div>
  `,
})
export class DevoirsListComponent implements OnInit {
  readonly store = inject(LearningStore);

  activeTab = signal<DevoirTab>('TOUS');

  readonly tabs = [
    { id: 'TOUS'    as DevoirTab, label:'Tous',     icon:'list',          count: () => this.store.devoirs().length              },
    { id: 'OUVERT'  as DevoirTab, label:'Ouverts',  icon:'lock_open',     count: () => this.store.devoirsOuverts().length       },
    { id: 'FERME'   as DevoirTab, label:'Fermés',   icon:'lock',          count: () => this.store.devoirsFermes().length        },
    { id: 'CORRIGE' as DevoirTab, label:'Corrigés', icon:'check_circle',  count: () => this.store.devoirsCorr().length          },
  ];

  ngOnInit() { this.store.loadDevoirs({}); }

  devoirsFiltres = computed(() => {
    const tab = this.activeTab();
    const list = this.store.devoirs();
    return tab === 'TOUS' ? list : list.filter(d => d.statut === tab);
  });

  progressPct(d: IDevoir) { return d.nbEtudiants ? Math.round((d.nbSoumissions / d.nbEtudiants) * 100) : 0; }
  progressColor(d: IDevoir) {
    const p = this.progressPct(d);
    return p >= 75 ? '#16a34a' : p >= 40 ? 'var(--accent)' : '#f59e0b';
  }

  statutCfg(s: string) { return STATUT_CFG[s] ?? STATUT_CFG['OUVERT']; }
}
