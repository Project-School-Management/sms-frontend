import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';
import { MOCK_QUESTIONS_BANQUE, MOCK_RESULTATS } from '@sms/learning/data-access';

// ── Types locaux ─────────────────────────────────────────────────────────────
type ExamenTab = 'examens' | 'banque' | 'resultats' | 'stats';

const STATUT_CFG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  A_VENIR:  { label:'À venir',  bg:'rgba(99,102,241,0.10)', color:'#6366f1', icon:'schedule'  },
  EN_COURS: { label:'En cours', bg:'rgba(22,163,74,0.10)',  color:'#16a34a', icon:'radio_button_checked' },
  TERMINE:  { label:'Terminé',  bg:'rgba(107,114,128,0.10)',color:'#6b7280', icon:'check_circle' },
};

const DIFFICULTE_CFG: Record<string, { color: string; bg: string }> = {
  FACILE:   { color:'#16a34a', bg:'rgba(22,163,74,0.10)'   },
  MOYEN:    { color:'#d97706', bg:'rgba(217,119,6,0.10)'   },
  DIFFICILE:{ color:'#dc2626', bg:'rgba(220,38,38,0.10)'   },
};

const TYPE_CFG: Record<string, { label: string; icon: string; color: string }> = {
  QCM:            { label:'QCM',             icon:'radio_button_checked', color:'#6366f1' },
  VRAI_FAUX:      { label:'Vrai / Faux',     icon:'check_box',            color:'#10b981' },
  REPONSE_COURTE: { label:'Réponse courte',  icon:'short_text',           color:'#f59e0b' },
  REPONSE_LONGUE: { label:'Réponse longue',  icon:'subject',              color:'#8b5cf6' },
};

@Component({
  selector:        'sms-examens-list',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6 max-w-full">

  <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
  <div class="flex items-start justify-between mb-5 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Examens & Évaluations</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        Gestion des examens, banque de questions et suivi des résultats
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <a routerLink="/learning"
         class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80"
         style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
        <mat-icon style="font-size:16px;height:16px;width:16px">menu_book</mat-icon>
        Cours
      </a>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:18px;height:18px;width:18px">add</mat-icon>
        Nouvel examen
      </button>
    </div>
  </div>

  <!-- ── KPI Cards ─────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:var(--accent-light)">
        <mat-icon style="color:var(--accent);font-size:20px;height:20px;width:20px">quiz</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.examens().length }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Total</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(99,102,241,0.10)">
        <mat-icon style="color:#6366f1;font-size:20px;height:20px;width:20px">schedule</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ nbAVenir() }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">À venir</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(22,163,74,0.10)">
        <mat-icon style="color:#16a34a;font-size:20px;height:20px;width:20px">radio_button_checked</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ nbEnCours() }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">En cours</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(107,114,128,0.10)">
        <mat-icon style="color:#6b7280;font-size:20px;height:20px;width:20px">check_circle</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ nbTermines() }}</p>
        <p class="text-xs" style="color:var(--text-secondary)">Terminés</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style="background:rgba(16,185,129,0.10)">
        <mat-icon style="color:#10b981;font-size:20px;height:20px;width:20px">trending_up</mat-icon>
      </div>
      <div>
        <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ tauxReussiteResultats() }}%</p>
        <p class="text-xs" style="color:var(--text-secondary)">Taux réussite</p>
      </div>
    </div>
  </div>

  <!-- ── Barre onglets ─────────────────────────────────────────────────────── -->
  <div class="flex gap-1 mb-5 p-1 rounded-2xl"
       style="background:var(--surface-2);border:1px solid var(--border-color)">
    @for (tab of examTabs; track tab.id) {
      <button (click)="activeTab.set(tab.id)"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center"
              [style.background]="activeTab()===tab.id ? 'var(--surface-1)' : 'transparent'"
              [style.color]="activeTab()===tab.id ? 'var(--text-primary)' : 'var(--text-secondary)'"
              [style.box-shadow]="activeTab()===tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'">
        <mat-icon style="font-size:17px;height:17px;width:17px">{{ tab.icon }}</mat-icon>
        {{ tab.label }}
        @if (tab.badge && tab.badge() > 0) {
          <span class="px-1.5 py-0.5 rounded-full text-xs font-bold"
                [style.background]="activeTab()===tab.id ? 'var(--accent)' : 'rgba(99,102,241,0.15)'"
                [style.color]="activeTab()===tab.id ? '#fff' : 'var(--accent)'">
            {{ tab.badge() }}
          </span>
        }
      </button>
    }
  </div>


  <!-- ████████ ONGLET EXAMENS ████████ -->
  @if (activeTab() === 'examens') {
    @if (store.loading()) {
      <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
        <mat-icon class="animate-spin">refresh</mat-icon> Chargement…
      </div>
    } @else {
      <div class="flex flex-col gap-4">
        @for (exam of store.examens(); track exam.publicId) {
          <div class="sms-card p-5 border-l-4"
               [style.border-left-color]="statutCfg(exam.statut).color">
            <div class="flex items-start gap-4 flex-wrap">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                   [style.background]="statutCfg(exam.statut).bg">
                <mat-icon [style.color]="statutCfg(exam.statut).color"
                          style="font-size:22px;height:22px;width:22px">{{ statutCfg(exam.statut).icon }}</mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 class="font-bold text-sm" style="color:var(--text-primary)">{{ exam.titre }}</h3>
                  <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                        [style.background]="statutCfg(exam.statut).bg"
                        [style.color]="statutCfg(exam.statut).color">
                    {{ statutCfg(exam.statut).label }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-4 text-xs mt-1" style="color:var(--text-muted)">
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:12px;height:12px;width:12px">book</mat-icon>
                    {{ exam.matiereLibelle }}
                  </span>
                  @if (exam.niveauLibelle) {
                    <span class="flex items-center gap-1">
                      <mat-icon style="font-size:12px;height:12px;width:12px">school</mat-icon>
                      {{ exam.niveauLibelle }}
                    </span>
                  }
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:12px;height:12px;width:12px">timer</mat-icon>
                    {{ exam.dureeMinutes }} min
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon style="font-size:12px;height:12px;width:12px">quiz</mat-icon>
                    {{ exam.questions.length }} questions · {{ totalPoints(exam) }} pts
                  </span>
                  @if (exam.salleLibelle) {
                    <span class="flex items-center gap-1">
                      <mat-icon style="font-size:12px;height:12px;width:12px">meeting_room</mat-icon>
                      {{ exam.salleLibelle }}
                    </span>
                  }
                </div>
                <div class="flex items-center gap-2 mt-2 text-xs">
                  <mat-icon style="font-size:13px;height:13px;width:13px;color:var(--accent)">event</mat-icon>
                  <span style="color:var(--text-secondary)">{{ exam.dateDebut }} → {{ exam.dateFin }}</span>
                </div>
                @if (exam.statut !== 'TERMINE') {
                  <div class="flex flex-wrap gap-1.5 mt-3">
                    @for (badge of antiTricheBadges.slice(0,4); track badge.label) {
                      <span class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                            style="background:var(--surface-2);color:var(--text-muted)">
                        <mat-icon style="font-size:11px;height:11px;width:11px">{{ badge.icon }}</mat-icon>
                        {{ badge.label }}
                      </span>
                    }
                  </div>
                }
              </div>
              <div class="flex flex-col gap-2 shrink-0">
                @if (exam.statut === 'A_VENIR') {
                  <a [routerLink]="['/learning/examens', exam.publicId]"
                     class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-80"
                     style="background:var(--accent)">
                    <mat-icon style="font-size:16px;height:16px;width:16px">play_arrow</mat-icon>
                    Démarrer
                  </a>
                } @else {
                  <a [routerLink]="['/learning/examens', exam.publicId]"
                     class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                     style="background:var(--surface-2);color:var(--text-secondary)">
                    <mat-icon style="font-size:16px;height:16px;width:16px">visibility</mat-icon>
                    Voir
                  </a>
                }
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80"
                        style="background:var(--surface-2);color:var(--text-secondary)">
                  <mat-icon style="font-size:14px;height:14px;width:14px">edit</mat-icon>
                  Modifier
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  }


  <!-- ████████ ONGLET BANQUE DE QUESTIONS ████████ -->
  @if (activeTab() === 'banque') {
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="font-bold text-lg" style="color:var(--text-primary)">Banque de questions</h2>
        <p class="text-sm mt-0.5" style="color:var(--text-muted)">{{ questions.length }} questions · Réutilisables dans vos examens</p>
      </div>
      <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80"
              style="background:var(--accent)">
        <mat-icon style="font-size:16px;height:16px;width:16px">add</mat-icon>
        Ajouter une question
      </button>
    </div>
    <!-- Filtres -->
    <div class="flex flex-wrap gap-2 mb-5">
      <select [(ngModel)]="matiereFilter"
              class="px-3 py-2 rounded-xl border text-xs font-medium"
              style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
        <option value="">Toutes les matières</option>
        @for (m of matiereOptions; track m) { <option [value]="m">{{ m }}</option> }
      </select>
      <select [(ngModel)]="typeFilter"
              class="px-3 py-2 rounded-xl border text-xs font-medium"
              style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
        <option value="">Tous les types</option>
        @for (t of typeOptions; track t.value) { <option [value]="t.value">{{ t.label }}</option> }
      </select>
      <div class="flex gap-1 p-1 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
        @for (d of difficulteOptions; track d.value) {
          <button (click)="difficulteFilter.set(difficulteFilter()===d.value ? '' : d.value)"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  [style.background]="difficulteFilter()===d.value ? diffCfg(d.value).bg : 'transparent'"
                  [style.color]="difficulteFilter()===d.value ? diffCfg(d.value).color : 'var(--text-secondary)'">
            {{ d.label }}
          </button>
        }
      </div>
    </div>
    <!-- Liste questions -->
    <div class="flex flex-col gap-3">
      @for (q of questionsFiltrees(); track q.publicId; let i=$index) {
        <div class="sms-card p-5">
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                 style="background:var(--accent)">{{ i+1 }}</div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm mb-2" style="color:var(--text-primary)">{{ q.enonce }}</p>
              @if (q.options && q.options.length > 0) {
                <div class="flex flex-wrap gap-2 mb-3">
                  @for (opt of q.options; track opt) {
                    <span class="px-3 py-1 rounded-xl text-xs font-medium border"
                          [style.background]="q.bonnesReponses.includes(opt) ? 'rgba(22,163,74,0.10)' : 'var(--surface-2)'"
                          [style.color]="q.bonnesReponses.includes(opt) ? '#16a34a' : 'var(--text-secondary)'"
                          [style.border-color]="q.bonnesReponses.includes(opt) ? 'rgba(22,163,74,0.30)' : 'var(--border-color)'">
                      {{ q.bonnesReponses.includes(opt) ? '✓ ' : '' }}{{ opt }}
                    </span>
                  }
                </div>
              }
              <div class="flex flex-wrap gap-3 text-xs">
                <span class="flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                      [style.background]="typeCfg(q.type).color + '15'"
                      [style.color]="typeCfg(q.type).color">
                  <mat-icon style="font-size:11px;height:11px;width:11px">{{ typeCfg(q.type).icon }}</mat-icon>
                  {{ typeCfg(q.type).label }}
                </span>
                <span class="px-2 py-0.5 rounded-full font-semibold"
                      [style.background]="diffCfg(q.difficulte).bg"
                      [style.color]="diffCfg(q.difficulte).color">{{ q.difficulte }}</span>
                <span style="color:var(--text-muted)">{{ q.matiere }}</span>
                <span class="flex items-center gap-1" style="color:var(--text-muted)">
                  <mat-icon style="font-size:11px;height:11px;width:11px">grade</mat-icon>
                  {{ q.points }} pts
                </span>
                <span class="flex items-center gap-1" style="color:var(--text-muted)">
                  <mat-icon style="font-size:11px;height:11px;width:11px">quiz</mat-icon>
                  Utilisée dans {{ q.utiliseesDans }} examen(s)
                </span>
              </div>
              <div class="flex flex-wrap gap-1 mt-2">
                @for (tag of q.tags; track tag) {
                  <span class="px-1.5 py-0.5 rounded text-xs"
                        style="background:var(--surface-2);color:var(--text-muted)">#{{ tag }}</span>
                }
              </div>
            </div>
            <div class="flex gap-1 shrink-0">
              <button class="p-1.5 rounded-lg hover:opacity-70"
                      style="background:var(--accent-light);color:var(--accent)">
                <mat-icon style="font-size:14px;height:14px;width:14px">add_circle</mat-icon>
              </button>
              <button class="p-1.5 rounded-lg hover:opacity-70"
                      style="background:var(--surface-2);color:var(--text-secondary)">
                <mat-icon style="font-size:14px;height:14px;width:14px">edit</mat-icon>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  }


  <!-- ████████ ONGLET RÉSULTATS ████████ -->
  @if (activeTab() === 'resultats') {
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-bold text-lg" style="color:var(--text-primary)">Résultats & Classement</h2>
      <button class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:opacity-80"
              style="background:var(--surface-2);color:var(--text-secondary);border:1px solid var(--border-color)">
        <mat-icon style="font-size:14px;height:14px;width:14px">download</mat-icon>
        Exporter
      </button>
    </div>
    <!-- En-tête examen -->
    <div class="sms-card p-4 mb-5 flex items-center gap-4"
         style="background:var(--accent-light);border:1px solid rgba(99,102,241,0.20)">
      <mat-icon style="color:var(--accent)">quiz</mat-icon>
      <div>
        <p class="font-bold text-sm" style="color:var(--text-primary)">Contrôle Mathématiques</p>
        <p class="text-xs" style="color:var(--text-muted)">15 mai 2026 · 20 points · {{ resultats.length }} participants</p>
      </div>
      <div class="flex-1"></div>
      <div class="text-right">
        <p class="text-2xl font-bold" style="color:var(--accent)">{{ moyenneGenerale() }}/20</p>
        <p class="text-xs" style="color:var(--text-muted)">Moyenne</p>
      </div>
    </div>
    <!-- Podium top 3 -->
    <div class="flex items-end justify-center gap-4 mb-6">
      @for (r of top3(); track r.publicId; let i=$index) {
        <div class="flex flex-col items-center gap-2" [style.order]="i===0 ? 2 : i===1 ? 1 : 3">
          <div class="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
               [style.background]="i===0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : i===1 ? 'linear-gradient(135deg,#9ca3af,#6b7280)' : 'linear-gradient(135deg,#d97706,#b45309)'">
            {{ r.etudiantNom.charAt(0) }}
          </div>
          <p class="text-xs font-semibold text-center" style="color:var(--text-primary)">{{ r.etudiantNom.split(' ')[0] }}</p>
          <div class="flex items-center justify-center font-bold rounded-t-xl text-white px-4"
               [style.background]="i===0 ? '#f59e0b' : i===1 ? '#9ca3af' : '#d97706'"
               [style.height.px]="i===0 ? 72 : i===1 ? 52 : 40"
               [style.width.px]="80">
            {{ r.score }}/20
          </div>
          <div class="w-20 flex items-center justify-center py-1 rounded-b" style="background:var(--surface-2)">
            <mat-icon style="font-size:14px;height:14px;width:14px"
                      [style.color]="i===0 ? '#f59e0b' : i===1 ? '#9ca3af' : '#d97706'">
              {{ i===0 ? 'emoji_events' : i===1 ? 'military_tech' : 'workspace_premium' }}
            </mat-icon>
          </div>
        </div>
      }
    </div>
    <!-- Table résultats -->
    <div class="sms-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr style="background:var(--surface-2)">
            <th class="text-center px-4 py-3 text-xs font-bold uppercase tracking-wide w-12" style="color:var(--text-secondary)">Rang</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Étudiant</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Score</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Durée</th>
            <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Mention</th>
          </tr>
        </thead>
        <tbody>
          @for (r of resultats; track r.publicId) {
            <tr class="border-t hover:opacity-80 transition-opacity" style="border-color:var(--border-color)">
              <td class="px-4 py-3 text-center">
                @if (r.rang <= 3) {
                  <mat-icon style="font-size:18px;height:18px;width:18px"
                            [style.color]="r.rang===1 ? '#f59e0b' : r.rang===2 ? '#9ca3af' : '#d97706'">
                    {{ r.rang===1 ? 'emoji_events' : r.rang===2 ? 'military_tech' : 'workspace_premium' }}
                  </mat-icon>
                } @else {
                  <span class="text-xs font-bold" style="color:var(--text-muted)">{{ r.rang }}</span>
                }
              </td>
              <td class="px-4 py-3">
                <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ r.etudiantNom }}</p>
                <p class="text-xs" style="color:var(--text-muted)">{{ r.etudiantClasse }}</p>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-20 rounded-full h-1.5" style="background:var(--surface-2)">
                    <div class="h-1.5 rounded-full"
                         [style.background]="r.score >= 16 ? '#16a34a' : r.score >= 10 ? 'var(--accent)' : '#ef4444'"
                         [style.width]="((r.score / r.scoreMax) * 100) + '%'"></div>
                  </div>
                  <span class="text-sm font-bold"
                        [style.color]="r.score >= 16 ? '#16a34a' : r.score >= 10 ? 'var(--accent)' : '#ef4444'">
                    {{ r.score }}/{{ r.scoreMax }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs" style="color:var(--text-muted)">{{ r.dureeMinutes }} min</td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                      [style.background]="r.score >= 16 ? 'rgba(22,163,74,0.10)' : r.score >= 12 ? 'rgba(99,102,241,0.10)' : r.score >= 10 ? 'rgba(245,158,11,0.10)' : 'rgba(239,68,68,0.10)'"
                      [style.color]="r.score >= 16 ? '#16a34a' : r.score >= 12 ? '#6366f1' : r.score >= 10 ? '#d97706' : '#dc2626'">
                  {{ r.mention }}
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }


  <!-- ████████ ONGLET STATISTIQUES ████████ -->
  @if (activeTab() === 'stats') {
    <h2 class="font-bold text-lg mb-5" style="color:var(--text-primary)">Statistiques des évaluations</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="sms-card p-5 text-center">
        <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Moyenne générale</p>
        <p class="text-4xl font-bold" style="color:var(--accent)">{{ moyenneGenerale() }}/20</p>
      </div>
      <div class="sms-card p-5 text-center">
        <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Taux de réussite</p>
        <p class="text-4xl font-bold" style="color:#16a34a">{{ tauxReussiteResultats() }}%</p>
      </div>
      <div class="sms-card p-5 text-center">
        <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Meilleure note</p>
        <p class="text-4xl font-bold" style="color:#f59e0b">{{ meilleureNote() }}/20</p>
      </div>
      <div class="sms-card p-5 text-center">
        <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Note la plus basse</p>
        <p class="text-4xl font-bold" style="color:#ef4444">{{ plusBasseNote() }}/20</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="sms-card p-5">
        <h3 class="font-bold mb-4" style="color:var(--text-primary)">Répartition des mentions</h3>
        <div class="flex flex-col gap-3">
          @for (m of repartitionMentions(); track m.mention) {
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium" style="color:var(--text-primary)">{{ m.mention }}</span>
                <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ m.nb }} · {{ m.pct }}%</span>
              </div>
              <div class="rounded-full h-2" style="background:var(--surface-2)">
                <div class="h-2 rounded-full" [style.background]="m.color" [style.width]="m.pct + '%'"></div>
              </div>
            </div>
          }
        </div>
      </div>
      <div class="sms-card p-5">
        <h3 class="font-bold mb-4" style="color:var(--text-primary)">Distribution des notes</h3>
        <div class="flex items-end gap-2 h-36">
          @for (b of distributionNotes(); track b.range) {
            <div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ b.nb }}</span>
              <div class="w-full rounded-t-lg"
                   [style.height.px]="Math.max((maxDistribution() > 0 ? (b.nb / maxDistribution()) * 100 : 0), b.nb > 0 ? 4 : 0)"
                   [style.background]="b.nb > 0 ? 'var(--accent)' : 'var(--surface-2)'"
                   [style.opacity]="b.nb > 0 ? '1' : '0.3'"></div>
              <span class="text-xs" style="color:var(--text-muted);font-size:9px">{{ b.range }}</span>
            </div>
          }
        </div>
      </div>
      <div class="sms-card p-5">
        <h3 class="font-bold mb-4" style="color:var(--text-primary)">Types de questions</h3>
        <div class="flex flex-col gap-3">
          @for (t of repartitionTypes(); track t.type) {
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                   [style.background]="typeCfg(t.type).color + '15'">
                <mat-icon [style.color]="typeCfg(t.type).color"
                          style="font-size:16px;height:16px;width:16px">{{ typeCfg(t.type).icon }}</mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium" style="color:var(--text-primary)">{{ typeCfg(t.type).label }}</span>
                  <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ t.nb }} · {{ t.pct }}%</span>
                </div>
                <div class="rounded-full h-1.5" style="background:var(--surface-2)">
                  <div class="h-1.5 rounded-full" [style.background]="typeCfg(t.type).color"
                       [style.width]="t.pct + '%'"></div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
      <div class="sms-card p-5">
        <h3 class="font-bold mb-4" style="color:var(--text-primary)">Paramètres anti-triche actifs</h3>
        <div class="flex flex-col gap-2">
          @for (a of antiTricheBadges; track a.label) {
            <div class="flex items-center gap-3 p-3 rounded-xl" style="background:var(--surface-2)">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                   style="background:rgba(22,163,74,0.10)">
                <mat-icon style="color:#16a34a;font-size:15px;height:15px;width:15px">{{ a.icon }}</mat-icon>
              </div>
              <span class="text-sm flex-1" style="color:var(--text-primary)">{{ a.label }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style="background:rgba(22,163,74,0.10);color:#16a34a">Activé</span>
            </div>
          }
        </div>
      </div>
    </div>
  }

</div>
  `,
})
export class ExamensListComponent implements OnInit {
  readonly store = inject(LearningStore);
  readonly Math  = Math;

  readonly questions = MOCK_QUESTIONS_BANQUE;
  readonly resultats  = MOCK_RESULTATS;

  activeTab        = signal<ExamenTab>('examens');
  matiereFilter    = '';
  typeFilter       = '';
  difficulteFilter = signal('');

  readonly matiereOptions = [...new Set(MOCK_QUESTIONS_BANQUE.map(q => q.matiere))];
  readonly typeOptions = [
    { value:'QCM',            label:'QCM'            },
    { value:'VRAI_FAUX',      label:'Vrai / Faux'    },
    { value:'REPONSE_COURTE', label:'Réponse courte' },
    { value:'REPONSE_LONGUE', label:'Réponse longue' },
  ];
  readonly difficulteOptions = [
    { value:'FACILE',   label:'Facile'    },
    { value:'MOYEN',    label:'Moyen'    },
    { value:'DIFFICILE',label:'Difficile' },
  ];
  readonly antiTricheBadges = [
    { label:'Chronomètre activé',           icon:'timer'    },
    { label:'Sauvegarde automatique',        icon:'save'     },
    { label:'Une seule tentative',           icon:'lock'     },
    { label:'Ordre aléatoire des questions', icon:'shuffle'  },
    { label:'Plein écran obligatoire',       icon:'fullscreen'},
  ];

  readonly examTabs: { id: ExamenTab; label: string; icon: string; badge?: () => number }[] = [
    { id:'examens',   label:'Examens',            icon:'quiz',          badge: () => this.store.examens().length },
    { id:'banque',    label:'Banque de questions', icon:'library_books', badge: () => this.questions.length },
    { id:'resultats', label:'Résultats',           icon:'leaderboard',   badge: () => this.resultats.length },
    { id:'stats',     label:'Statistiques',        icon:'analytics' },
  ];

  ngOnInit() { this.store.loadExamens(); }

  nbAVenir()   { return this.store.examens().filter(e => e.statut === 'A_VENIR').length; }
  nbEnCours()  { return this.store.examens().filter(e => e.statut === 'EN_COURS').length; }
  nbTermines() { return this.store.examens().filter(e => e.statut === 'TERMINE').length; }

  totalPoints(exam: { questions: { points: number }[] }): number {
    return exam.questions.reduce((s, q) => s + q.points, 0);
  }

  questionsFiltrees = computed(() => {
    let list = this.questions;
    if (this.matiereFilter)       list = list.filter(q => q.matiere    === this.matiereFilter);
    if (this.typeFilter)          list = list.filter(q => q.type       === this.typeFilter);
    if (this.difficulteFilter())  list = list.filter(q => q.difficulte === this.difficulteFilter());
    return list;
  });

  top3 = computed(() => [...this.resultats].sort((a, b) => a.rang - b.rang).slice(0, 3));

  moyenneGenerale = computed(() => {
    if (!this.resultats.length) return 0;
    return Math.round((this.resultats.reduce((s, r) => s + r.score, 0) / this.resultats.length) * 10) / 10;
  });

  tauxReussiteResultats = computed(() => {
    const reussis = this.resultats.filter(r => r.score >= r.scoreMax / 2).length;
    return this.resultats.length ? Math.round((reussis / this.resultats.length) * 100) : 0;
  });

  meilleureNote = computed(() => Math.max(...this.resultats.map(r => r.score), 0));
  plusBasseNote = computed(() => Math.min(...this.resultats.map(r => r.score), 20));

  repartitionMentions = computed(() => {
    const groups: Record<string, { mention: string; nb: number; color: string }> = {
      'Excellent':   { mention:'Excellent',   nb:0, color:'#16a34a' },
      'Très Bien':   { mention:'Très Bien',   nb:0, color:'#10b981' },
      'Bien':        { mention:'Bien',         nb:0, color:'#6366f1' },
      'Assez Bien':  { mention:'Assez Bien',   nb:0, color:'#f59e0b' },
      'Passable':    { mention:'Passable',     nb:0, color:'#d97706' },
      'Insuffisant': { mention:'Insuffisant',  nb:0, color:'#ef4444' },
    };
    for (const r of this.resultats) { if (groups[r.mention]) groups[r.mention].nb++; }
    const total = this.resultats.length || 1;
    return Object.values(groups).filter(g => g.nb > 0)
      .map(g => ({ ...g, pct: Math.round((g.nb / total) * 100) }));
  });

  distributionNotes = computed(() => {
    const ranges = [
      { range:'0-4', min:0, max:4 },  { range:'5-7', min:5, max:7 },
      { range:'8-9', min:8, max:9 },  { range:'10-11', min:10, max:11 },
      { range:'12-13',min:12,max:13 },{ range:'14-15',min:14,max:15 },
      { range:'16-17',min:16,max:17 },{ range:'18-20',min:18,max:20 },
    ];
    return ranges.map(r => ({
      range: r.range,
      nb:    this.resultats.filter(res => res.score >= r.min && res.score <= r.max).length,
    }));
  });

  maxDistribution = computed(() => Math.max(...this.distributionNotes().map(b => b.nb), 1));

  repartitionTypes = computed(() => {
    const map = new Map<string, number>();
    for (const q of this.questions) map.set(q.type, (map.get(q.type) ?? 0) + 1);
    const total = this.questions.length || 1;
    return [...map.entries()]
      .map(([type, nb]) => ({ type, nb, pct: Math.round((nb / total) * 100) }))
      .sort((a, b) => b.nb - a.nb);
  });

  statutCfg(s: string) { return STATUT_CFG[s]    ?? STATUT_CFG['A_VENIR']; }
  diffCfg(d: string)   { return DIFFICULTE_CFG[d] ?? DIFFICULTE_CFG['MOYEN']; }
  typeCfg(t: string)   { return TYPE_CFG[t]       ?? TYPE_CFG['QCM']; }
}
