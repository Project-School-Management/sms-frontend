import {
  Component, inject, OnInit, ChangeDetectionStrategy, signal, computed,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';

type SessionTab = 'TOUS' | 'EN_COURS' | 'PLANIFIEE' | 'TERMINEE';

const STATUT_CFG: Record<string, { label: string; bg: string; color: string; icon: string; pulse?: boolean }> = {
  EN_COURS:  { label:'En direct',  bg:'rgba(22,163,74,0.12)',   color:'#16a34a', icon:'radio_button_checked', pulse:true },
  PLANIFIEE: { label:'Planifiée',  bg:'rgba(37,99,235,0.10)',   color:'var(--accent)', icon:'event'           },
  TERMINEE:  { label:'Terminée',   bg:'rgba(107,114,128,0.10)', color:'#6b7280', icon:'check_circle'         },
  ANNULEE:   { label:'Annulée',    bg:'rgba(239,68,68,0.10)',   color:'#dc2626', icon:'cancel'               },
};

@Component({
  selector:        'sms-sessions-virtuelles',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-5 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Sessions virtuelles</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Classes en ligne, révisions et webinaires pédagogiques
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <a routerLink="/learning"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">arrow_back</mat-icon>
        Tableau de bord
      </a>
      <a routerLink="/learning/sessions/creer"
         class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
         style="background:var(--accent)">
        <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
        Planifier une session
      </a>
    </div>
  </div>

  <!-- ── Session en direct (banner) ────────────────────────────────────────── -->
  @for (s of sessionsEnCours(); track s.publicId) {
    <div class="sms-card p-5 mb-5 border"
         style="background:rgba(22,163,74,0.06);border-color:rgba(22,163,74,0.30)">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="relative">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
               style="background:rgba(22,163,74,0.15)">
            <mat-icon style="color:#16a34a;font-size:24px;height:24px;width:24px">videocam</mat-icon>
          </div>
          <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
               style="background:#16a34a;animation:pulse 1.5s infinite"></div>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs px-2 py-0.5 rounded-full font-bold"
                  style="background:#16a34a;color:#fff">● EN DIRECT</span>
          </div>
          <h2 class="font-bold text-lg" style="color:var(--text-primary)">{{ s.titre }}</h2>
          <p class="text-sm" style="color:var(--text-secondary)">
            {{ s.enseignant }} · {{ s.coursLibelle }} · {{ s.dureeMinutes }} min · {{ s.nbInscrits }} participants
          </p>
        </div>
        @if (s.lienJoin) {
          <a [href]="s.lienJoin" target="_blank"
             class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white hover:opacity-80"
             style="background:#16a34a">
            <mat-icon style="font-size:18px;height:18px;width:18px">play_arrow</mat-icon>
            Rejoindre maintenant
          </a>
        }
      </div>
    </div>
  }

  <!-- ── KPIs ──────────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
    @for (kpi of kpis(); track kpi.label) {
      <div class="sms-card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             [style.background]="kpi.bg">
          <mat-icon [style.color]="kpi.color"
                    style="font-size:20px;height:20px;width:20px">{{ kpi.icon }}</mat-icon>
        </div>
        <div>
          <p class="text-2xl font-bold" [style.color]="kpi.color">{{ kpi.value }}</p>
          <p class="text-xs" style="color:var(--text-secondary)">{{ kpi.label }}</p>
        </div>
      </div>
    }
  </div>

  <!-- ── Onglets filtre ─────────────────────────────────────────────────────── -->
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
              [style.background]="activeTab()===tab.id ? 'var(--accent)' : 'var(--accent-light)'"
              [style.color]="activeTab()===tab.id ? '#fff' : 'var(--accent)'">
          {{ tab.count() }}
        </span>
      </button>
    }
  </div>

  <!-- ── Grille sessions ────────────────────────────────────────────────────── -->
  @if (store.loading()) {
    <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon> Chargement…
    </div>
  } @else {
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      @for (s of sessionsFiltrees(); track s.publicId) {
        <div class="sms-card p-5 flex flex-col gap-4"
             [style.border]="s.statut === 'EN_COURS' ? '1.5px solid rgba(22,163,74,0.40)' : '1px solid var(--border-color)'">

          <!-- Header -->
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 [style.background]="statutCfg(s.statut).bg">
              <mat-icon [style.color]="statutCfg(s.statut).color"
                        style="font-size:18px;height:18px;width:18px">
                {{ statutCfg(s.statut).icon }}
              </mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-sm leading-tight" style="color:var(--text-primary)">{{ s.titre }}</h3>
              <p class="text-xs mt-0.5" style="color:var(--text-secondary)">{{ s.coursLibelle }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-bold shrink-0"
                  [style.background]="statutCfg(s.statut).bg"
                  [style.color]="statutCfg(s.statut).color">
              {{ statutCfg(s.statut).label }}
            </span>
          </div>

          <!-- Infos -->
          <div class="flex flex-wrap gap-3 text-xs" style="color:var(--text-muted)">
            <span class="flex items-center gap-1">
              <mat-icon style="font-size:12px;height:12px;width:12px">person</mat-icon>
              {{ s.enseignant }}
            </span>
            <span class="flex items-center gap-1">
              <mat-icon style="font-size:12px;height:12px;width:12px">event</mat-icon>
              {{ s.date }}{{ s.heure ? ' · ' + s.heure : '' }}
            </span>
            <span class="flex items-center gap-1">
              <mat-icon style="font-size:12px;height:12px;width:12px">timer</mat-icon>
              {{ s.dureeMinutes }} min
            </span>
            <span class="flex items-center gap-1">
              <mat-icon style="font-size:12px;height:12px;width:12px">group</mat-icon>
              {{ s.nbInscrits }} inscrits
            </span>
          </div>

          <!-- CTA -->
          <div class="pt-2 border-t" style="border-color:var(--border-color)">
            @if (s.statut === 'EN_COURS' && s.lienJoin) {
              <a [href]="s.lienJoin" target="_blank"
                 class="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80"
                 style="background:#16a34a">
                <mat-icon style="font-size:16px;height:16px;width:16px">play_arrow</mat-icon>
                Rejoindre maintenant
              </a>
            } @else if (s.statut === 'PLANIFIEE' && s.lienJoin) {
              <button class="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                      style="background:var(--accent-light);color:var(--accent)">
                <mat-icon style="font-size:16px;height:16px;width:16px">notifications</mat-icon>
                Me rappeler
              </button>
            } @else if (s.statut === 'TERMINEE') {
              <button class="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                      style="background:var(--surface-2);color:var(--text-secondary)">
                <mat-icon style="font-size:16px;height:16px;width:16px">replay</mat-icon>
                Voir l'enregistrement
              </button>
            } @else {
              <div class="flex items-center justify-center py-1 text-xs" style="color:var(--text-muted)">
                <mat-icon style="font-size:12px;height:12px;width:12px;margin-right:4px">cancel</mat-icon>
                Session annulée
              </div>
            }
          </div>
        </div>
      }
    </div>

    @if (sessionsFiltrees().length === 0) {
      <div class="flex flex-col items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
        <mat-icon style="font-size:48px;height:48px;width:48px;opacity:0.3">videocam_off</mat-icon>
        <p class="font-semibold">Aucune session pour ce filtre</p>
      </div>
    }
  }

</div>
  `,
})
export class SessionsVirtuellesComponent implements OnInit {
  readonly store = inject(LearningStore);

  activeTab = signal<SessionTab>('TOUS');

  readonly tabs = [
    { id:'TOUS'      as SessionTab, label:'Toutes',    icon:'list',                   count: () => this.store.sessionsVirt().length        },
    { id:'EN_COURS'  as SessionTab, label:'En direct', icon:'radio_button_checked',   count: () => this.store.sessionsActives().length      },
    { id:'PLANIFIEE' as SessionTab, label:'Planifiées',icon:'event',                  count: () => this.store.sessionsPlan().length         },
    { id:'TERMINEE'  as SessionTab, label:'Terminées', icon:'check_circle',           count: () => this.sessionsTerminees()                 },
  ];

  ngOnInit() { this.store.loadSessionsVirt(); }

  sessionsEnCours = computed(() => this.store.sessionsVirt().filter(s => s.statut === 'EN_COURS'));
  sessionsTerminees() { return this.store.sessionsVirt().filter(s => s.statut === 'TERMINEE').length; }

  sessionsFiltrees = computed(() => {
    const tab = this.activeTab();
    const list = this.store.sessionsVirt();
    return tab === 'TOUS' ? list : list.filter(s => s.statut === tab);
  });

  kpis = computed(() => {
    const all = this.store.sessionsVirt();
    return [
      { label:'Total',       value: all.length,                                            icon:'videocam',              bg:'var(--accent-light)',      color:'var(--accent)' },
      { label:'En direct',   value: all.filter(s => s.statut === 'EN_COURS').length,       icon:'radio_button_checked',  bg:'rgba(22,163,74,0.10)',     color:'#16a34a'       },
      { label:'Planifiées',  value: all.filter(s => s.statut === 'PLANIFIEE').length,      icon:'event',                 bg:'rgba(245,158,11,0.10)',    color:'#d97706'       },
      { label:'Terminées',   value: all.filter(s => s.statut === 'TERMINEE').length,       icon:'check_circle',          bg:'rgba(107,114,128,0.10)',   color:'#6b7280'       },
    ];
  });

  statutCfg(s: string) { return STATUT_CFG[s] ?? STATUT_CFG['PLANIFIEE']; }
}
