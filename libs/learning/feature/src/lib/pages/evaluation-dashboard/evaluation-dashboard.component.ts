import {
  Component, inject, OnInit, ChangeDetectionStrategy, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';
import {
  MOCK_EVENEMENTS, MOCK_SESSIONS_VIRTUELLES, MOCK_RESULTATS,
  MOCK_ANNONCES, MOCK_DEVOIRS,
} from '@sms/learning/data-access';

const STATUT_SESSION_CFG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  PLANIFIEE:  { label:'Planifiée',  bg:'rgba(99,102,241,0.10)',  color:'#6366f1', icon:'event'                },
  EN_COURS:   { label:'En direct', bg:'rgba(22,163,74,0.12)',   color:'#16a34a', icon:'radio_button_checked' },
  TERMINEE:   { label:'Terminée',  bg:'rgba(107,114,128,0.10)', color:'#6b7280', icon:'check_circle'         },
  ANNULEE:    { label:'Annulée',   bg:'rgba(239,68,68,0.10)',   color:'#dc2626', icon:'cancel'               },
};

const EV_COLOR: Record<string, string> = {
  COURS:   '#6366f1',
  DEVOIR:  '#f59e0b',
  EXAMEN:  '#ef4444',
  SESSION: '#d97706',
};

const EV_ICON: Record<string, string> = {
  COURS:   'menu_book',
  DEVOIR:  'assignment',
  EXAMEN:  'quiz',
  SESSION: 'videocam',
};

@Component({
  selector:        'sms-evaluation-dashboard',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Évaluations en ligne</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Tableau de bord pédagogique · Année académique 2025-2026
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <a routerLink="/learning/sessions"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">videocam</mat-icon>
        Sessions
      </a>
      <a routerLink="/learning/examens"
         class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
         style="background:var(--accent)">
        <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
        Nouvel examen
      </a>
    </div>
  </div>

  <!-- ── KPI Cards ─────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Cours publiés</p>
      <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.nbCours() }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ store.coursPublies().length }} actifs</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Examens</p>
      <p class="text-2xl font-bold" style="color:var(--accent)">{{ store.examens().length }}</p>
      <p class="text-xs mt-0.5" style="color:#16a34a">{{ store.examensEnCours().length }} en cours</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Devoirs</p>
      <p class="text-2xl font-bold" style="color:#f59e0b">{{ store.devoirs().length }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ store.devoirsOuverts().length }} ouverts</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Taux réussite</p>
      <p class="text-2xl font-bold" style="color:#16a34a">{{ store.tauxReussite() }}%</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">moy. {{ store.moyenneGlobale() }}/20</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Sessions live</p>
      <p class="text-2xl font-bold" style="color:#d97706">{{ nbSessionsPlan() }}</p>
      <p class="text-xs mt-0.5" style="color:#16a34a">{{ nbSessionsEnCours() }} en direct</p>
    </div>
    <div class="sms-card p-4">
      <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Certificats</p>
      <p class="text-2xl font-bold" style="color:#8b5cf6">{{ store.nbCertificats() }}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">émis cette année</p>
    </div>
  </div>

  <!-- ── Grille principale ─────────────────────────────────────────────────── -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

    <!-- Colonne gauche (2/3) -->
    <div class="lg:col-span-2 flex flex-col gap-5">

      <!-- Devoirs récents -->
      <div class="sms-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold" style="color:var(--text-primary)">Devoirs en cours</h2>
          <a routerLink="/learning/devoirs"
             class="text-xs font-semibold hover:opacity-80" style="color:var(--accent)">
            Voir tous →
          </a>
        </div>
        <div class="flex flex-col gap-3">
          @for (d of devoirsActifs(); track d.publicId) {
            <a [routerLink]="['/learning/devoirs', d.publicId]"
               class="flex items-center gap-4 p-3 rounded-xl transition-all hover:opacity-80"
               style="background:var(--surface-2)">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   style="background:rgba(245,158,11,0.12)">
                <mat-icon style="color:#f59e0b;font-size:18px;height:18px;width:18px">assignment</mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm truncate" style="color:var(--text-primary)">{{ d.titre }}</p>
                <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ d.coursLibelle }}</p>
                <div class="flex items-center gap-3 mt-1.5">
                  <div class="flex-1 rounded-full h-1.5" style="background:var(--border-color)">
                    <div class="h-1.5 rounded-full"
                         [style.background]="progressColor(d.nbSoumissions, d.nbEtudiants)"
                         [style.width]="progressPct(d.nbSoumissions, d.nbEtudiants) + '%'"></div>
                  </div>
                  <span class="text-xs font-bold" style="color:var(--text-secondary)">
                    {{ d.nbSoumissions }}/{{ d.nbEtudiants }}
                  </span>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs font-bold" style="color:#ef4444">{{ d.dateLimite }}</p>
                <p class="text-xs" style="color:var(--text-muted)">limite</p>
              </div>
            </a>
          }
        </div>
      </div>

      <!-- Résultats récents -->
      <div class="sms-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold" style="color:var(--text-primary)">Résultats récents</h2>
          <a routerLink="/learning/examens"
             class="text-xs font-semibold hover:opacity-80" style="color:var(--accent)">
            Voir tout →
          </a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style="border-bottom:1px solid var(--border-color)">
                <th class="text-left pb-2 text-xs font-bold uppercase tracking-wide" style="color:var(--text-muted)">Étudiant</th>
                <th class="text-left pb-2 text-xs font-bold uppercase tracking-wide" style="color:var(--text-muted)">Examen</th>
                <th class="text-left pb-2 text-xs font-bold uppercase tracking-wide" style="color:var(--text-muted)">Score</th>
                <th class="text-left pb-2 text-xs font-bold uppercase tracking-wide" style="color:var(--text-muted)">Mention</th>
              </tr>
            </thead>
            <tbody>
              @for (r of topResultats(); track r.publicId) {
                <tr style="border-top:1px solid var(--border-color)">
                  <td class="py-2.5">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                           style="background:linear-gradient(135deg,var(--accent),#3b82f6)">
                        {{ r.etudiantNom.charAt(0) }}
                      </div>
                      <span class="font-medium text-xs" style="color:var(--text-primary)">{{ r.etudiantNom }}</span>
                    </div>
                  </td>
                  <td class="py-2.5 text-xs" style="color:var(--text-secondary)">{{ r.examenLibelle }}</td>
                  <td class="py-2.5">
                    <span class="font-bold text-sm"
                          [style.color]="r.score >= 14 ? '#16a34a' : r.score >= 10 ? 'var(--accent)' : '#ef4444'">
                      {{ r.score }}/{{ r.scoreMax }}
                    </span>
                  </td>
                  <td class="py-2.5">
                    <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                          [style.background]="mentionBg(r.score, r.scoreMax)"
                          [style.color]="mentionColor(r.score, r.scoreMax)">
                      {{ r.mention }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sessions virtuelles prochaines -->
      <div class="sms-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold" style="color:var(--text-primary)">Sessions virtuelles</h2>
          <a routerLink="/learning/sessions"
             class="text-xs font-semibold hover:opacity-80" style="color:var(--accent)">
            Voir toutes →
          </a>
        </div>
        <div class="flex flex-col gap-3">
          @for (s of sessionsProchaines(); track s.publicId) {
            <div class="flex items-center gap-4 p-3 rounded-xl"
                 style="background:var(--surface-2)">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   [style.background]="sessionCfg(s.statut).bg">
                <mat-icon [style.color]="sessionCfg(s.statut).color"
                          style="font-size:18px;height:18px;width:18px">
                  {{ sessionCfg(s.statut).icon }}
                </mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm truncate" style="color:var(--text-primary)">{{ s.titre }}</p>
                <p class="text-xs mt-0.5" style="color:var(--text-muted)">
                  {{ s.enseignant }} · {{ s.date }} {{ s.heure }}
                </p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                @if (s.statut === 'EN_COURS' && s.lienJoin) {
                  <a [href]="s.lienJoin" target="_blank"
                     class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:opacity-80"
                     style="background:#16a34a">
                    <mat-icon style="font-size:13px;height:13px;width:13px">play_arrow</mat-icon>
                    Rejoindre
                  </a>
                } @else {
                  <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                        [style.background]="sessionCfg(s.statut).bg"
                        [style.color]="sessionCfg(s.statut).color">
                    {{ sessionCfg(s.statut).label }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>

    </div>

    <!-- Colonne droite (1/3) -->
    <div class="flex flex-col gap-5">

      <!-- Annonces -->
      <div class="sms-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold" style="color:var(--text-primary)">Annonces</h2>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                style="background:rgba(239,68,68,0.10);color:#dc2626">
            {{ nonLues() }} non lues
          </span>
        </div>
        <div class="flex flex-col gap-3">
          @for (a of annonces; track a.publicId) {
            <div class="p-3 rounded-xl border-l-2"
                 [style.border-left-color]="a.priorite === 'HAUTE' ? '#ef4444' : a.priorite === 'NORMALE' ? 'var(--accent)' : '#94a3b8'"
                 [style.background]="a.lu ? 'transparent' : 'rgba(37,99,235,0.04)'"
                 style="border-bottom:1px solid var(--border-color)">
              <div class="flex items-start justify-between gap-2 mb-1">
                <p class="text-xs font-bold" style="color:var(--text-primary)">{{ a.titre }}</p>
                @if (!a.lu) {
                  <div class="w-2 h-2 rounded-full shrink-0 mt-1" style="background:var(--accent)"></div>
                }
              </div>
              <p class="text-xs line-clamp-2" style="color:var(--text-secondary)">{{ a.contenu }}</p>
              <p class="text-xs mt-1.5" style="color:var(--text-muted)">{{ a.auteur }} · {{ a.date }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Agenda pédagogique -->
      <div class="sms-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold" style="color:var(--text-primary)">Agenda pédagogique</h2>
        </div>
        <div class="flex flex-col gap-2">
          @for (ev of evenements; track ev.publicId) {
            <div class="flex items-center gap-3 p-2.5 rounded-xl"
                 style="background:var(--surface-2)">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                   [style.background]="evColor(ev.type) + '18'">
                <mat-icon [style.color]="evColor(ev.type)"
                          style="font-size:15px;height:15px;width:15px">
                  {{ evIcon(ev.type) }}
                </mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold truncate" style="color:var(--text-primary)">{{ ev.titre }}</p>
                <p class="text-xs" style="color:var(--text-muted)">
                  {{ ev.date }}{{ ev.heure ? ' · ' + ev.heure : '' }}
                </p>
              </div>
              @if (ev.urgent) {
                <mat-icon style="font-size:14px;height:14px;width:14px;color:#ef4444">priority_high</mat-icon>
              }
            </div>
          }
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="sms-card p-5">
        <h2 class="font-bold mb-4" style="color:var(--text-primary)">Actions rapides</h2>
        <div class="grid grid-cols-2 gap-2">
          @for (action of quickActions; track action.label) {
            <a [routerLink]="action.path"
               class="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all hover:opacity-80"
               style="background:var(--surface-2)">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                   [style.background]="action.color + '18'">
                <mat-icon [style.color]="action.color"
                          style="font-size:18px;height:18px;width:18px">{{ action.icon }}</mat-icon>
              </div>
              <span class="text-xs font-semibold" style="color:var(--text-primary)">{{ action.label }}</span>
            </a>
          }
        </div>
      </div>

    </div>
  </div>

</div>
  `,
})
export class EvaluationDashboardComponent implements OnInit {
  readonly store = inject(LearningStore);

  readonly annonces  = MOCK_ANNONCES.slice(0, 4);
  readonly evenements = MOCK_EVENEMENTS.slice(0, 6);

  readonly quickActions = [
    { label:'Cours',        path:'/learning/cours',        icon:'menu_book',  color:'#6366f1' },
    { label:'Examens',      path:'/learning/examens',      icon:'quiz',       color:'var(--accent)' },
    { label:'Devoirs',      path:'/learning/devoirs',      icon:'assignment', color:'#f59e0b' },
    { label:'Sessions',     path:'/learning/sessions',     icon:'videocam',   color:'#d97706' },
    { label:'Résultats',    path:'/learning/examens',      icon:'leaderboard',color:'#16a34a' },
    { label:'Certificats',  path:'/learning/certificats',  icon:'workspace_premium', color:'#8b5cf6' },
  ];

  ngOnInit() {
    this.store.loadCours({});
    this.store.loadExamens();
    this.store.loadDevoirs({});
    this.store.loadResultats({});
    this.store.loadSessionsVirt();
    this.store.loadCertificats();
  }

  devoirsActifs = computed(() =>
    this.store.devoirs().filter(d => d.statut === 'OUVERT').slice(0, 4)
  );

  topResultats = computed(() =>
    [...MOCK_RESULTATS].sort((a, b) => a.rang - b.rang).slice(0, 5)
  );

  sessionsProchaines = computed(() =>
    MOCK_SESSIONS_VIRTUELLES
      .filter(s => s.statut === 'EN_COURS' || s.statut === 'PLANIFIEE')
      .slice(0, 4)
  );

  nbSessionsPlan()    { return MOCK_SESSIONS_VIRTUELLES.filter(s => s.statut === 'PLANIFIEE').length; }
  nbSessionsEnCours() { return MOCK_SESSIONS_VIRTUELLES.filter(s => s.statut === 'EN_COURS').length; }
  nonLues()           { return MOCK_ANNONCES.filter(a => !a.lu).length; }

  progressPct(done: number, total: number) { return total ? Math.round((done / total) * 100) : 0; }
  progressColor(done: number, total: number) {
    const p = this.progressPct(done, total);
    return p >= 75 ? '#16a34a' : p >= 40 ? 'var(--accent)' : '#f59e0b';
  }

  mentionBg(score: number, max: number) {
    const p = score / max;
    return p >= 0.8 ? 'rgba(22,163,74,0.10)' : p >= 0.6 ? 'rgba(37,99,235,0.10)' : p >= 0.5 ? 'rgba(245,158,11,0.10)' : 'rgba(239,68,68,0.10)';
  }
  mentionColor(score: number, max: number) {
    const p = score / max;
    return p >= 0.8 ? '#16a34a' : p >= 0.6 ? 'var(--accent)' : p >= 0.5 ? '#d97706' : '#dc2626';
  }

  sessionCfg(s: string) { return STATUT_SESSION_CFG[s] ?? STATUT_SESSION_CFG['PLANIFIEE']; }
  evColor(type: string)  { return EV_COLOR[type] ?? '#6366f1'; }
  evIcon(type: string)   { return EV_ICON[type]  ?? 'event'; }
}
