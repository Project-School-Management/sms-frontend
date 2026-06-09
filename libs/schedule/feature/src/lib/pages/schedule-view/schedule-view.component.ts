import {
  ChangeDetectionStrategy, Component, inject, OnInit, computed, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ScheduleStore } from '@sms/schedule/data-access';
import { MOCK_CLASSES }  from '@sms/schedule/data-access';
import { ITimeSlot }     from '@sms/shared/models';

// ── Constantes ────────────────────────────────────────────────────────────────
const JOURS_ORDRE  = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI'] as const;
const JOURS_LABELS: Record<string,string> = {
  LUNDI:'Lundi', MARDI:'Mardi', MERCREDI:'Mercredi',
  JEUDI:'Jeudi', VENDREDI:'Vendredi', SAMEDI:'Samedi',
};
const CRENEAUX = ['07:30','08:30','09:30','10:30','11:30','14:00','15:00','16:00'];
const NIVEAUX  = ['Tous','Terminale','Première','Seconde','3ème','Licence','Master'];

const MATIERE_COLORS: Record<string,string> = {
  'Mathématiques':'#6366f1', 'Physique-Chimie':'#f59e0b', 'SVT':'#10b981',
  'Français':'#ec4899',      'Anglais':'#0ea5e9',          'Histoire-Géo':'#a855f7',
  'Philosophie':'#8b5cf6',   'EPS':'#22c55e',              'Latin':'#d97706',
  'Espagnol':'#f43f5e',      'Arts Plastiques':'#14b8a6',  'Algorithmique':'#6366f1',
  'Base de données':'#10b981','Réseaux':'#0ea5e9',          'Sécurité Inf.':'#ef4444',
  'Intelligence Artif.':'#8b5cf6','Cloud & DevOps':'#06b6d4','Programmation':'#a855f7',
};

const MOCK_HISTORIQUE = [
  { id:'h1', date:'2026-06-09 14:32', auteur:'Admin Koné Aïcha',  action:'Modification salle',     detail:'Terminale S1 — Maths Lundi 07h30 : B12 → A101', type:'salle'       },
  { id:'h2', date:'2026-06-08 10:15', auteur:'Admin Koné Aïcha',  action:'Changement enseignant',  detail:'Première D — Physique : Mme Diallo → Mme Traoré Aïssata', type:'enseignant' },
  { id:'h3', date:'2026-06-07 09:00', auteur:'Système',           action:'Génération automatique', detail:'EDT Terminale S1 généré pour l\'année 2025-2026', type:'generation'  },
  { id:'h4', date:'2026-06-06 16:45', auteur:'Admin Koné Aïcha',  action:'Ajout créneau',          detail:'3ème B — SVT Mardi 14h00 : Labo SVT ajouté', type:'modification' },
  { id:'h5', date:'2026-06-05 11:20', auteur:'Dir. Coulibaly',    action:'Validation EDT',         detail:'EDT Terminale S1 validé et publié', type:'modification'              },
  { id:'h6', date:'2026-06-03 08:30', auteur:'Système',           action:'Génération automatique', detail:'EDT Seconde A généré automatiquement', type:'generation'             },
  { id:'h7', date:'2026-06-01 15:10', auteur:'Admin Koné Aïcha',  action:'Suppression créneau',    detail:'Terminale A1 — Latin Samedi 09h30 supprimé', type:'modification'    },
];

type MainTab      = 'edt' | 'conflits' | 'historique' | 'stats';
type ViewMode     = 'semaine' | 'jour' | 'liste' | 'enseignant' | 'salle';
type ConflitFilter = 'tous' | 'ENSEIGNANT' | 'SALLE';

interface ConflitGroupe {
  entity:   string;
  type:     'ENSEIGNANT' | 'SALLE';
  count:    number;
  slots:    { jour: string; heure: string }[];
  priorite: 'critique' | 'haute' | 'moyenne';
}

// ── Composant ─────────────────────────────────────────────────────────────────
@Component({
  selector:        'sms-schedule-view',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, FormsModule, MatIconModule],
  styles: [`
    @media print {
      .no-print   { display: none !important; }
      .print-only { display: flex !important; }
      .sms-card   { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
      @page       { size: A4 landscape; margin: 10mm; }
      body        { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .course-cell { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    .print-only { display: none; }
    .tab-indicator { transition: all 0.2s; }
    .course-cell { transition: opacity 0.15s, transform 0.15s; }
    .course-cell:hover { opacity: 0.85; transform: scale(1.01); }
    .conflit-card { transition: box-shadow 0.2s; }
    .conflit-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.10); }
  `],
  template: `
<div class="p-6 max-w-full">

  <!-- ══════════ EN-TÊTE IMPRESSION (caché à l'écran) ══════════ -->
  <div class="print-only items-center gap-4 mb-6 pb-4 border-b"
       style="border-color:#e5e7eb">
    <div class="w-12 h-12 rounded-xl flex items-center justify-center"
         style="background:var(--accent);color:#fff;font-weight:700;font-size:18px">S</div>
    <div class="flex-1">
      <h1 style="font-size:20px;font-weight:700;color:#111">Emploi du Temps — {{ classeInfo()?.libelle }}</h1>
      <p style="color:#6b7280;font-size:13px">
        {{ classeInfo()?.niveau }} · {{ classeInfo()?.filiere }} · Année académique 2025-2026
      </p>
    </div>
    <div style="text-align:right;font-size:12px;color:#9ca3af">
      Imprimé le {{ today() }}<br>Lycée International de Côte d'Ivoire
    </div>
  </div>

  <!-- ══════════ TITRE PAGE ══════════ -->
  <div class="no-print flex items-start justify-between mb-5 gap-3 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color:var(--text-primary)">Emploi du Temps</h1>
      <p class="text-sm mt-0.5" style="color:var(--text-secondary)">
        {{ classeInfo()?.libelle ? classeInfo()!.libelle + ' — ' + classeInfo()!.niveau + ' · ' + classeInfo()!.filiere : 'Sélectionnez une classe' }}
        <span class="mx-2 opacity-40">·</span>
        <span style="color:var(--accent)" class="font-semibold">2025-2026</span>
      </p>
    </div>
    @if (toast()) {
      <div class="text-xs px-3 py-2 rounded-xl flex items-center gap-2"
           style="background:rgba(22,163,74,0.08);color:#16a34a;border:1px solid rgba(22,163,74,0.2)">
        <mat-icon style="font-size:14px;height:14px;width:14px">check_circle</mat-icon>
        {{ toast() }}
      </div>
    }
  </div>

  <!-- ══════════ BARRE ONGLETS PRINCIPAUX ══════════ -->
  <div class="no-print flex gap-1 mb-6 p-1 rounded-2xl"
       style="background:var(--surface-2);border:1px solid var(--border-color)">

    <!-- EDT -->
    <button (click)="activeTab.set('edt')"
            class="tab-indicator flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center"
            [style.background]="activeTab()==='edt' ? 'var(--surface-1)' : 'transparent'"
            [style.color]="activeTab()==='edt' ? 'var(--text-primary)' : 'var(--text-secondary)'"
            [style.box-shadow]="activeTab()==='edt' ? '0 1px 4px rgba(0,0,0,0.10)' : 'none'">
      <mat-icon style="font-size:18px;height:18px;width:18px">calendar_month</mat-icon>
      EDT
    </button>

    <!-- Conflits -->
    <button (click)="activeTab.set('conflits')"
            class="tab-indicator flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center relative"
            [style.background]="activeTab()==='conflits' ? 'var(--surface-1)' : 'transparent'"
            [style.color]="activeTab()==='conflits' ? '#dc2626' : (store.conflits().length > 0 ? '#ef4444' : 'var(--text-secondary)')"
            [style.box-shadow]="activeTab()==='conflits' ? '0 1px 4px rgba(0,0,0,0.10)' : 'none'">
      <mat-icon style="font-size:18px;height:18px;width:18px">warning</mat-icon>
      Conflits
      @if (store.conflits().length > 0) {
        <span class="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
              style="background:#ef4444;min-width:20px;text-align:center">
          {{ store.conflits().length }}
        </span>
      }
    </button>

    <!-- Historique -->
    <button (click)="activeTab.set('historique')"
            class="tab-indicator flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center"
            [style.background]="activeTab()==='historique' ? 'var(--surface-1)' : 'transparent'"
            [style.color]="activeTab()==='historique' ? 'var(--text-primary)' : 'var(--text-secondary)'"
            [style.box-shadow]="activeTab()==='historique' ? '0 1px 4px rgba(0,0,0,0.10)' : 'none'">
      <mat-icon style="font-size:18px;height:18px;width:18px">history</mat-icon>
      Historique
    </button>

    <!-- Statistiques -->
    <button (click)="activeTab.set('stats')"
            class="tab-indicator flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center"
            [style.background]="activeTab()==='stats' ? 'var(--surface-1)' : 'transparent'"
            [style.color]="activeTab()==='stats' ? 'var(--text-primary)' : 'var(--text-secondary)'"
            [style.box-shadow]="activeTab()==='stats' ? '0 1px 4px rgba(0,0,0,0.10)' : 'none'">
      <mat-icon style="font-size:18px;height:18px;width:18px">analytics</mat-icon>
      Statistiques
    </button>
  </div>


  <!-- ████████████████████ ONGLET EDT ████████████████████ -->
  @if (activeTab() === 'edt') {

    <!-- ── Sélecteur de contexte ──────────────────────────────────────────── -->
    <div class="no-print sms-card p-4 mb-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">ANNÉE ACADÉMIQUE</label>
          <select class="px-3 py-2 rounded-lg border text-sm"
                  style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
            <option>2025-2026</option>
            <option>2024-2025</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">NIVEAU</label>
          <select [(ngModel)]="selectedNiveau"
                  (ngModelChange)="onNiveauChange($event)"
                  class="px-3 py-2 rounded-lg border text-sm"
                  style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
            @for (n of niveaux; track n) { <option [value]="n">{{ n }}</option> }
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">CLASSE</label>
          <select [ngModel]="store.selectedClasseId()"
                  (ngModelChange)="onClasseChange($event)"
                  class="px-3 py-2 rounded-lg border text-sm font-semibold"
                  style="background:var(--surface-2);border-color:var(--border-color);color:var(--text-primary)">
            @for (c of classesFiltrees(); track c.id) {
              <option [value]="c.id">{{ c.libelle }}</option>
            }
          </select>
        </div>
        <div class="flex-1"></div>
        <!-- Sous-vues EDT -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold" style="color:var(--text-secondary)">VUE</label>
          <div class="flex gap-1 p-1 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border-color)">
            @for (v of views; track v.id) {
              <button (click)="store.setSelectedView(v.id)"
                      class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      [style.background]="store.selectedView()===v.id ? 'var(--accent)' : 'transparent'"
                      [style.color]="store.selectedView()===v.id ? '#fff' : 'var(--text-secondary)'">
                <mat-icon style="font-size:13px;height:13px;width:13px">{{ v.icon }}</mat-icon>
                {{ v.label }}
              </button>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- ── Bandeau classe (affiché à l'écran ET à l'impression) ─────────── -->
    @if (classeInfo(); as cls) {
      <div class="sms-card p-5 mb-4">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0"
                 style="background:linear-gradient(135deg,var(--accent),#8b5cf6)">
              {{ cls.libelle.substring(0,2) }}
            </div>
            <div>
              <h2 class="text-xl font-bold" style="color:var(--text-primary)">{{ cls.libelle }}</h2>
              <div class="flex items-center gap-3 mt-1 flex-wrap text-sm">
                <span class="px-2 py-0.5 rounded-lg font-semibold" style="background:var(--accent-light);color:var(--accent)">{{ cls.niveau }}</span>
                <span style="color:var(--text-secondary)">{{ cls.filiere }}</span>
                <span class="flex items-center gap-1" style="color:var(--text-muted)">
                  <mat-icon style="font-size:13px;height:13px;width:13px">people</mat-icon>
                  {{ cls.effectif }} élèves
                </span>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide" style="color:var(--text-muted)">Prof. principal</p>
              <p class="font-semibold mt-0.5" style="color:var(--text-primary)">{{ cls.professeurPrincipal || '—' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide" style="color:var(--text-muted)">Salle principale</p>
              <p class="font-semibold mt-0.5" style="color:var(--text-primary)">{{ cls.sallePrincipale || '—' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide" style="color:var(--text-muted)">Année</p>
              <p class="font-semibold mt-0.5" style="color:var(--text-primary)">2025-2026</p>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ── KPI Cards ────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      <div class="sms-card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style="background:rgba(99,102,241,0.12)">
            <mat-icon style="color:#6366f1;font-size:20px;height:20px;width:20px">event_note</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.kpiStats().nbCours }}</p>
            <p class="text-xs font-medium" style="color:var(--text-secondary)">Cours / semaine</p>
          </div>
        </div>
      </div>
      <div class="sms-card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style="background:rgba(16,185,129,0.12)">
            <mat-icon style="color:#10b981;font-size:20px;height:20px;width:20px">schedule</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.kpiStats().heures }}h</p>
            <p class="text-xs font-medium" style="color:var(--text-secondary)">Volume horaire</p>
          </div>
        </div>
      </div>
      <div class="sms-card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style="background:rgba(6,182,212,0.12)">
            <mat-icon style="color:#0891b2;font-size:20px;height:20px;width:20px">meeting_room</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.kpiStats().salles }}</p>
            <p class="text-xs font-medium" style="color:var(--text-secondary)">Salles utilisées</p>
          </div>
        </div>
      </div>
      <div class="sms-card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style="background:rgba(236,72,153,0.12)">
            <mat-icon style="color:#ec4899;font-size:20px;height:20px;width:20px">school</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.kpiStats().enseignants }}</p>
            <p class="text-xs font-medium" style="color:var(--text-secondary)">Enseignants</p>
          </div>
        </div>
      </div>
      <div class="sms-card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style="background:rgba(245,158,11,0.12)">
            <mat-icon style="color:#f59e0b;font-size:20px;height:20px;width:20px">donut_large</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color:var(--text-primary)">{{ store.kpiStats().tauxOccupation }}%</p>
            <p class="text-xs font-medium" style="color:var(--text-secondary)">Taux occupation</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Barre d'actions ──────────────────────────────────────────────── -->
    <div class="no-print sms-card p-3 mb-4">
      <div class="flex items-center gap-1 flex-wrap">
        <button (click)="printSchedule()"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                style="color:var(--text-secondary);background:var(--surface-2)">
          <mat-icon style="font-size:16px;height:16px;width:16px">print</mat-icon> Imprimer
        </button>
        <button (click)="exportSimulated('PDF')"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                style="color:var(--text-secondary);background:var(--surface-2)">
          <mat-icon style="font-size:16px;height:16px;width:16px">picture_as_pdf</mat-icon> Export PDF
        </button>
        <button (click)="exportSimulated('Excel')"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                style="color:var(--text-secondary);background:var(--surface-2)">
          <mat-icon style="font-size:16px;height:16px;width:16px">table_chart</mat-icon> Excel
        </button>
        <div class="w-px h-6 mx-1" style="background:var(--border-color)"></div>
        <button (click)="autoGenerate()" [disabled]="generating()"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:opacity-80 disabled:opacity-50 transition-opacity"
                style="background:var(--accent)">
          @if (generating()) {
            <mat-icon class="animate-spin" style="font-size:16px;height:16px;width:16px">refresh</mat-icon>
            Génération…
          } @else {
            <mat-icon style="font-size:16px;height:16px;width:16px">auto_awesome</mat-icon>
            Générer auto
          }
        </button>
        <button (click)="exportSimulated('Partage')"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                style="color:var(--text-secondary);background:var(--surface-2)">
          <mat-icon style="font-size:16px;height:16px;width:16px">share</mat-icon> Partager
        </button>
        <div class="flex-1"></div>
        @if (store.conflits().length > 0) {
          <button (click)="activeTab.set('conflits')"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
                  style="background:rgba(239,68,68,0.10);color:#dc2626;border:1px solid rgba(239,68,68,0.2)">
            <mat-icon style="font-size:16px;height:16px;width:16px">warning</mat-icon>
            {{ store.conflits().length }} conflits détectés
          </button>
        }
      </div>
    </div>

    <!-- ── Navigation semaine ──────────────────────────────────────────── -->
    @if (store.selectedView()==='semaine' || store.selectedView()==='liste') {
      <div class="no-print flex items-center justify-center gap-3 mb-4 flex-wrap">
        <button (click)="changeWeek(-1)"
                class="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:opacity-80"
                style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
          <mat-icon style="font-size:16px;height:16px;width:16px">chevron_left</mat-icon> Semaine préc.
        </button>
        <span class="text-sm font-bold px-4 py-1.5 rounded-lg" style="color:var(--text-primary);background:var(--surface-2)">
          {{ weekLabel() }}
        </span>
        <button (click)="changeWeek(1)"
                class="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:opacity-80"
                style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
          Semaine suiv. <mat-icon style="font-size:16px;height:16px;width:16px">chevron_right</mat-icon>
        </button>
        <button (click)="store.setCurrentWeekOffset(0)"
                class="px-3 py-1.5 rounded-lg text-sm font-semibold"
                style="border:1px solid var(--accent);color:var(--accent);background:var(--accent-light)">
          Aujourd'hui
        </button>
      </div>
    }

    @if (store.loading()) {
      <div class="flex items-center justify-center py-20 gap-3" style="color:var(--text-secondary)">
        <mat-icon class="animate-spin">refresh</mat-icon> Chargement de l'emploi du temps…
      </div>
    } @else {

      <!-- ════════ VUE SEMAINE ════════ -->
      @if (store.selectedView()==='semaine') {
        <div class="sms-card overflow-hidden mb-4">
          <!-- En-tête jours -->
          <div class="grid" style="grid-template-columns: 80px repeat(6, 1fr)">
            <div class="px-2 py-4 border-b border-r" style="background:var(--surface-2);border-color:var(--border-color)"></div>
            @for (jour of jours; track jour) {
              <div class="px-2 py-3 text-center border-b border-l"
                   style="border-color:var(--border-color)"
                   [style.background]="jour==='SAMEDI' ? 'rgba(139,92,246,0.06)' : 'var(--surface-2)'">
                <p class="text-xs font-bold uppercase tracking-wide" style="color:var(--text-primary)">{{ joursLabels[jour] }}</p>
                <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ jourDate(jour) }}</p>
                @if (jour==='SAMEDI') {
                  <span class="text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block"
                        style="background:rgba(139,92,246,0.12);color:#7c3aed;font-size:10px">Matinée</span>
                }
              </div>
            }
          </div>

          <!-- Lignes créneaux -->
          @for (heure of creneaux; track heure) {
            <!-- Pause déjeuner -->
            @if (heure === '14:00') {
              <div class="grid border-b" style="grid-template-columns:80px repeat(6,1fr);border-color:var(--border-color)">
                <div class="px-2 py-1.5 text-right text-xs border-r flex items-center justify-end"
                     style="color:var(--text-muted);border-color:var(--border-color);background:var(--surface-2)">
                  <span class="text-xs italic">Pause</span>
                </div>
                @for (jour of jours; track jour) {
                  <div class="border-l"
                       style="border-color:var(--border-color);background:repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(0,0,0,0.015) 3px,rgba(0,0,0,0.015) 6px)">
                    <div class="py-1 text-center text-xs" style="color:var(--text-muted);font-style:italic;font-size:10px">
                      12:00 – 14:00 &nbsp; Pause déjeuner
                    </div>
                  </div>
                }
              </div>
            }

            <div class="grid border-b" style="grid-template-columns:80px repeat(6,1fr);border-color:var(--border-color)">
              <!-- Heure -->
              <div class="px-3 py-2 border-r flex flex-col items-end justify-start pt-2"
                   style="border-color:var(--border-color);background:var(--surface-2)">
                <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ heure }}</span>
                <span class="text-xs" style="color:var(--text-muted)">{{ nextHour(heure) }}</span>
              </div>

              <!-- Cellules par jour -->
              @for (jour of jours; track jour) {
                @if (jour==='SAMEDI' && isApresMidi(heure)) {
                  <!-- Samedi après-midi = indisponible -->
                  <div class="border-l min-h-[72px]"
                       style="border-color:var(--border-color);background:repeating-linear-gradient(135deg,transparent,transparent 4px,rgba(139,92,246,0.04) 4px,rgba(139,92,246,0.04) 8px)">
                  </div>
                } @else {
                  <div class="border-l min-h-[72px] p-1.5 flex flex-col gap-1"
                       style="border-color:var(--border-color)"
                       [style.background]="jour==='SAMEDI' ? 'rgba(139,92,246,0.02)' : 'transparent'">
                    @for (slot of slotsFor(jour, heure); track slot.publicId) {
                      <div class="course-cell rounded-xl p-2 cursor-pointer"
                           [style.background]="courseColor(slot.matiereLibelle) + '18'"
                           [style.border]="'1.5px solid ' + courseColor(slot.matiereLibelle) + '40'"
                           [style.border-left]="'3px solid ' + courseColor(slot.matiereLibelle)">
                        <!-- Matière -->
                        <p class="text-xs font-bold leading-tight truncate"
                           [style.color]="courseColor(slot.matiereLibelle)">
                          {{ slot.matiereLibelle }}
                        </p>
                        <!-- Enseignant -->
                        <p class="text-xs truncate mt-0.5" style="color:var(--text-secondary);font-size:10px">
                          {{ shortName(slot.enseignantNom) }}
                        </p>
                        <!-- Badge salle -->
                        <div class="flex items-center gap-0.5 mt-1">
                          <mat-icon style="font-size:9px;height:9px;width:9px;color:#6366f1;flex-shrink:0">location_on</mat-icon>
                          <span class="font-bold truncate"
                                style="color:#6366f1;background:rgba(99,102,241,0.12);padding:1px 5px;border-radius:4px;font-size:10px">
                            {{ slot.salleLibelle }}
                          </span>
                        </div>
                      </div>
                    }
                    @if (slotsFor(jour, heure).length === 0) {
                      <div class="min-h-[60px] flex items-center justify-center">
                        <span class="text-xs italic" style="color:var(--text-muted);font-size:10px">Libre</span>
                      </div>
                    }
                  </div>
                }
              }
            </div>
          }
        </div>

      }

      <!-- ════════ VUE JOUR ════════ -->
      @if (store.selectedView()==='jour') {
        <div class="no-print flex gap-2 mb-4 flex-wrap">
          @for (jour of jours; track jour) {
            <button (click)="store.setSelectedJour(jour)"
                    class="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    [style.background]="store.selectedJour()===jour ? 'var(--accent)' : 'var(--surface-2)'"
                    [style.color]="store.selectedJour()===jour ? '#fff' : 'var(--text-secondary)'"
                    [style.border]="'1px solid ' + (store.selectedJour()===jour ? 'var(--accent)' : 'var(--border-color)')">
              {{ joursLabels[jour] }}
            </button>
          }
        </div>
        <div class="flex flex-col gap-3">
          @for (heure of creneaux; track heure) {
            @for (slot of slotsFor(store.selectedJour(), heure); track slot.publicId) {
              <div class="sms-card p-4 flex items-center gap-4 border-l-4"
                   [style.border-left-color]="courseColor(slot.matiereLibelle)">
                <div class="w-16 text-center shrink-0">
                  <p class="text-sm font-bold" style="color:var(--text-secondary)">{{ heure }}</p>
                  <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ nextHour(heure) }}</p>
                </div>
                <div class="w-1.5 self-stretch rounded-full shrink-0"
                     [style.background]="courseColor(slot.matiereLibelle)"></div>
                <div class="flex-1">
                  <p class="font-bold text-base" style="color:var(--text-primary)">{{ slot.matiereLibelle }}</p>
                  <p class="text-sm mt-0.5" style="color:var(--text-secondary)">{{ slot.enseignantNom }}</p>
                  <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ slot.promotionLibelle }}</p>
                </div>
                <div class="text-right shrink-0">
                  <div class="flex items-center gap-1.5 justify-end mb-2">
                    <mat-icon style="font-size:14px;height:14px;width:14px;color:#6366f1">location_on</mat-icon>
                    <span class="font-bold text-sm"
                          style="color:#6366f1;background:rgba(99,102,241,0.12);padding:3px 10px;border-radius:8px">
                      {{ slot.salleLibelle }}
                    </span>
                  </div>
                  <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style="background:rgba(22,163,74,0.10);color:#16a34a">Planifiée</span>
                </div>
              </div>
            }
          }
          @if (slotsForJour(store.selectedJour()).length === 0) {
            <div class="sms-card flex flex-col items-center justify-center py-16 gap-3">
              <mat-icon style="font-size:48px;height:48px;width:48px;color:var(--text-muted)">calendar_today</mat-icon>
              <p class="font-semibold" style="color:var(--text-secondary)">Aucun cours ce jour</p>
              <p class="text-sm" style="color:var(--text-muted)">Journée libre pour {{ classeInfo()?.libelle }}</p>
            </div>
          }
        </div>
      }

      <!-- ════════ VUE LISTE ════════ -->
      @if (store.selectedView()==='liste') {
        <div class="sms-card overflow-hidden">
          <div class="px-5 py-4 border-b flex items-center justify-between"
               style="border-color:var(--border-color)">
            <h3 class="font-bold" style="color:var(--text-primary)">Tous les cours de la semaine</h3>
            <span class="text-sm" style="color:var(--text-muted)">{{ slotsOrdered().length }} séances</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr style="background:var(--surface-2)">
                  <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Jour</th>
                  <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Horaire</th>
                  <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Matière</th>
                  <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Enseignant</th>
                  <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Salle</th>
                  <th class="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style="color:var(--text-secondary)">Statut</th>
                </tr>
              </thead>
              <tbody>
                @for (slot of slotsOrdered(); track slot.publicId) {
                  <tr class="border-t hover:opacity-80 transition-opacity"
                      style="border-color:var(--border-color)">
                    <td class="px-4 py-3">
                      <span class="px-2 py-1 rounded-lg text-xs font-semibold"
                            [style.background]="courseColor(slot.matiereLibelle) + '15'"
                            [style.color]="courseColor(slot.matiereLibelle)">
                        {{ joursLabels[slot.jour] }}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-mono text-xs font-semibold" style="color:var(--text-secondary)">
                      {{ slot.heureDebut }} – {{ slot.heureFin }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full shrink-0"
                              [style.background]="courseColor(slot.matiereLibelle)"></span>
                        <span class="font-semibold" style="color:var(--text-primary)">{{ slot.matiereLibelle }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-xs" style="color:var(--text-secondary)">{{ slot.enseignantNom }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-1">
                        <mat-icon style="font-size:12px;height:12px;width:12px;color:#6366f1">location_on</mat-icon>
                        <span class="font-bold text-xs"
                              style="color:#6366f1;background:rgba(99,102,241,0.10);padding:2px 8px;border-radius:6px">
                          {{ slot.salleLibelle }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style="background:rgba(22,163,74,0.10);color:#16a34a">Planifiée</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ════════ VUE ENSEIGNANT ════════ -->
      @if (store.selectedView()==='enseignant') {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (ens of enseignantsStats(); track ens.id) {
            <div class="sms-card p-5">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                     style="background:linear-gradient(135deg,var(--accent),#8b5cf6)">
                  {{ initiales(ens.nom) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-sm truncate" style="color:var(--text-primary)">{{ ens.nom }}</p>
                  <p class="text-xs mt-0.5" style="color:var(--text-muted)">
                    {{ ens.nbCours }} séance(s) · {{ ens.heures }}h / semaine
                  </p>
                </div>
              </div>
              <div class="flex flex-wrap gap-1.5">
                @for (m of ens.matieres; track m) {
                  <span class="px-2.5 py-1 rounded-xl text-xs font-semibold"
                        [style.background]="courseColor(m) + '15'"
                        [style.color]="courseColor(m)"
                        [style.border]="'1px solid ' + courseColor(m) + '30'">
                    {{ m }}
                  </span>
                }
              </div>
              <div class="mt-4 pt-3 border-t" style="border-color:var(--border-color)">
                <div class="flex items-center gap-2">
                  <span class="text-xs" style="color:var(--text-muted)">Occupation semaine</span>
                  <div class="flex-1 rounded-full h-1.5" style="background:var(--surface-2)">
                    <div class="h-1.5 rounded-full" style="background:var(--accent)"
                         [style.width]="Math.min((ens.heures / 30) * 100, 100) + '%'"></div>
                  </div>
                  <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ ens.heures }}h</span>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ════════ VUE SALLE ════════ -->
      @if (store.selectedView()==='salle') {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (s of sallesStats(); track s.libelle) {
            <div class="sms-card p-5">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                       [style.background]="s.occupe ? 'rgba(239,68,68,0.10)' : 'rgba(22,163,74,0.10)'">
                    <mat-icon [style.color]="s.occupe ? '#dc2626' : '#16a34a'"
                              style="font-size:20px;height:20px;width:20px">meeting_room</mat-icon>
                  </div>
                  <div>
                    <p class="font-bold text-sm" style="color:var(--text-primary)">{{ s.libelle }}</p>
                    <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ s.nbCours }} créneaux planifiés</p>
                  </div>
                </div>
                <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                      [style.background]="s.occupe ? 'rgba(239,68,68,0.10)' : 'rgba(22,163,74,0.10)'"
                      [style.color]="s.occupe ? '#dc2626' : '#16a34a'">
                  {{ s.occupe ? 'Occupée' : 'Disponible' }}
                </span>
              </div>
              <div class="mt-3">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs" style="color:var(--text-muted)">Taux d'utilisation</span>
                  <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ tauxSalle(s.nbCours) }}%</span>
                </div>
                <div class="rounded-full h-2" style="background:var(--surface-2)">
                  <div class="h-2 rounded-full transition-all"
                       [style.background]="s.occupe ? '#ef4444' : 'var(--accent)'"
                       [style.width]="tauxSalle(s.nbCours) + '%'"></div>
                </div>
              </div>
            </div>
          }
        </div>
      }

    }<!-- /fin @else loading -->
  }<!-- /fin onglet EDT -->


  <!-- ████████████████████ ONGLET CONFLITS ████████████████████ -->
  @if (activeTab() === 'conflits') {

    <!-- Résumé conflits -->
    <div class="grid grid-cols-3 gap-4 mb-5">
      <div class="sms-card p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
             style="background:rgba(239,68,68,0.12)">
          <mat-icon style="color:#dc2626;font-size:24px;height:24px;width:24px">warning</mat-icon>
        </div>
        <div>
          <p class="text-3xl font-bold" style="color:#dc2626">{{ store.conflits().length }}</p>
          <p class="text-xs font-semibold" style="color:var(--text-secondary)">Total conflits</p>
        </div>
      </div>
      <div class="sms-card p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
             style="background:rgba(245,158,11,0.12)">
          <mat-icon style="color:#d97706;font-size:24px;height:24px;width:24px">person</mat-icon>
        </div>
        <div>
          <p class="text-3xl font-bold" style="color:#d97706">{{ nbConflitsEnseignant() }}</p>
          <p class="text-xs font-semibold" style="color:var(--text-secondary)">Conflits enseignants</p>
        </div>
      </div>
      <div class="sms-card p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
             style="background:rgba(99,102,241,0.12)">
          <mat-icon style="color:#6366f1;font-size:24px;height:24px;width:24px">meeting_room</mat-icon>
        </div>
        <div>
          <p class="text-3xl font-bold" style="color:#6366f1">{{ nbConflitsSalle() }}</p>
          <p class="text-xs font-semibold" style="color:var(--text-secondary)">Conflits salles</p>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="flex gap-2 mb-5">
      @for (f of conflitFilters; track f.value) {
        <button (click)="conflitFilter.set(f.value)"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                [style.background]="conflitFilter()===f.value ? 'var(--accent)' : 'var(--surface-2)'"
                [style.color]="conflitFilter()===f.value ? '#fff' : 'var(--text-secondary)'"
                [style.border]="'1px solid ' + (conflitFilter()===f.value ? 'var(--accent)' : 'var(--border-color)')">
          <mat-icon style="font-size:16px;height:16px;width:16px">{{ f.icon }}</mat-icon>
          {{ f.label }}
          <span class="px-1.5 py-0.5 rounded-full text-xs font-bold"
                [style.background]="conflitFilter()===f.value ? 'rgba(255,255,255,0.25)' : 'var(--surface-1)'"
                [style.color]="conflitFilter()===f.value ? '#fff' : 'var(--text-secondary)'">
            {{ f.count() }}
          </span>
        </button>
      }
    </div>

    <!-- Liste groupée des conflits -->
    @if (conflitsFiltres().length === 0) {
      <div class="sms-card flex flex-col items-center justify-center py-16 gap-3">
        <mat-icon style="font-size:48px;height:48px;width:48px;color:var(--text-muted)">check_circle</mat-icon>
        <p class="font-semibold" style="color:var(--text-secondary)">Aucun conflit détecté</p>
      </div>
    } @else {
      <div class="flex flex-col gap-4">
        @for (groupe of conflitsFiltres(); track groupe.entity) {
          <div class="sms-card conflit-card overflow-hidden border-l-4"
               [style.border-left-color]="groupe.priorite==='critique' ? '#dc2626' : groupe.priorite==='haute' ? '#d97706' : '#8b5cf6'">
            <!-- En-tête groupe -->
            <div class="p-4 flex items-start gap-4 border-b" style="border-color:var(--border-color)">
              <!-- Icône type -->
              <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                   [style.background]="groupe.type==='ENSEIGNANT' ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)'">
                <mat-icon [style.color]="groupe.type==='ENSEIGNANT' ? '#d97706' : '#6366f1'"
                          style="font-size:20px;height:20px;width:20px">
                  {{ groupe.type==='ENSEIGNANT' ? 'person' : 'meeting_room' }}
                </mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="font-bold text-sm" style="color:var(--text-primary)">{{ groupe.entity }}</p>
                  <span class="text-xs px-2.5 py-0.5 rounded-full font-bold"
                        [style.background]="groupe.priorite==='critique' ? 'rgba(220,38,38,0.10)' : groupe.priorite==='haute' ? 'rgba(217,119,6,0.10)' : 'rgba(139,92,246,0.10)'"
                        [style.color]="groupe.priorite==='critique' ? '#dc2626' : groupe.priorite==='haute' ? '#d97706' : '#7c3aed'">
                    {{ groupe.priorite === 'critique' ? '⚡ Critique' : groupe.priorite === 'haute' ? '⚠ Élevée' : '• Moyenne' }}
                  </span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                        [style.background]="groupe.type==='ENSEIGNANT' ? 'rgba(245,158,11,0.10)' : 'rgba(99,102,241,0.10)'"
                        [style.color]="groupe.type==='ENSEIGNANT' ? '#d97706' : '#6366f1'">
                    {{ groupe.type === 'ENSEIGNANT' ? 'Enseignant' : 'Salle' }}
                  </span>
                </div>
                <p class="text-sm mt-1" style="color:var(--text-secondary)">
                  <strong style="color:var(--text-primary)">{{ groupe.count }}</strong>
                  {{ groupe.count > 1 ? 'conflits détectés' : 'conflit détecté' }}
                </p>
              </div>
              <!-- Actions -->
              <div class="flex items-center gap-2 shrink-0">
                <button class="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                        style="background:rgba(22,163,74,0.10);color:#16a34a">
                  <mat-icon style="font-size:13px;height:13px;width:13px;vertical-align:middle">auto_fix_high</mat-icon>
                  Résoudre
                </button>
                <button class="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                        style="background:var(--surface-2);color:var(--text-secondary)">
                  Ignorer
                </button>
              </div>
            </div>
            <!-- Créneaux en conflit -->
            <div class="p-4">
              <p class="text-xs font-bold uppercase tracking-wide mb-3" style="color:var(--text-muted)">
                Créneaux concernés
              </p>
              <div class="flex flex-wrap gap-2">
                @for (slot of groupe.slots; track slot.jour + slot.heure) {
                  <div class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                       style="background:var(--surface-2);color:var(--text-primary);border:1px solid var(--border-color)">
                    <mat-icon style="font-size:13px;height:13px;width:13px;color:var(--accent)">schedule</mat-icon>
                    <span style="color:var(--text-secondary)">{{ jourLabel(slot.jour) }}</span>
                    <span class="font-bold">{{ slot.heure }}</span>
                    <button class="ml-1 hover:opacity-70 transition-opacity"
                            style="color:#6366f1;font-size:10px;padding:1px 6px;background:rgba(99,102,241,0.10);border-radius:4px">
                      Voir
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  }<!-- /fin onglet Conflits -->


  <!-- ████████████████████ ONGLET HISTORIQUE ████████████████████ -->
  @if (activeTab() === 'historique') {
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b flex items-center justify-between"
           style="border-color:var(--border-color)">
        <div>
          <h3 class="font-bold" style="color:var(--text-primary)">Journal des modifications</h3>
          <p class="text-xs mt-0.5" style="color:var(--text-muted)">{{ historique.length }} entrées</p>
        </div>
        <button class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-80"
                style="background:var(--surface-2);color:var(--text-secondary)">
          <mat-icon style="font-size:14px;height:14px;width:14px">download</mat-icon>
          Exporter
        </button>
      </div>

      <div class="relative">
        <!-- Ligne verticale timeline -->
        <div class="absolute left-[47px] top-0 bottom-0 w-0.5"
             style="background:var(--border-color)"></div>

        @for (entry of historique; track entry.id; let last=$last) {
          <div class="flex items-start gap-4 px-5 py-4"
               [style.border-bottom]="!last ? '1px solid var(--border-color)' : 'none'">
            <!-- Icône -->
            <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative z-10 border-2"
                 [style.background]="histoColor(entry.type).bg"
                 [style.border-color]="histoColor(entry.type).color">
              <mat-icon [style.color]="histoColor(entry.type).color"
                        style="font-size:16px;height:16px;width:16px">{{ histoIcon(entry.type) }}</mat-icon>
            </div>
            <!-- Contenu -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-sm" style="color:var(--text-primary)">{{ entry.action }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                      [style.background]="histoColor(entry.type).bg"
                      [style.color]="histoColor(entry.type).color">
                  {{ entry.auteur }}
                </span>
              </div>
              <p class="text-sm mt-1" style="color:var(--text-secondary)">{{ entry.detail }}</p>
              <p class="text-xs mt-1.5 flex items-center gap-1" style="color:var(--text-muted)">
                <mat-icon style="font-size:12px;height:12px;width:12px">access_time</mat-icon>
                {{ entry.date }}
              </p>
            </div>
            <button class="shrink-0 px-2.5 py-1.5 rounded-lg text-xs hover:opacity-70 transition-opacity"
                    style="background:var(--surface-2);color:var(--text-secondary)">
              Annuler
            </button>
          </div>
        }
      </div>
    </div>
  }<!-- /fin onglet Historique -->


  <!-- ████████████████████ ONGLET STATISTIQUES ████████████████████ -->
  @if (activeTab() === 'stats') {

    <!-- Volume horaire global -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="sms-card p-5">
        <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Total séances</p>
        <p class="text-4xl font-bold" style="color:var(--text-primary)">{{ statsData().total }}</p>
        <p class="text-xs mt-1" style="color:var(--text-secondary)">cette semaine</p>
      </div>
      <div class="sms-card p-5">
        <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Volume horaire</p>
        <p class="text-4xl font-bold" style="color:var(--accent)">{{ statsData().total }}h</p>
        <p class="text-xs mt-1" style="color:var(--text-secondary)">1 créneau = 1h</p>
      </div>
      <div class="sms-card p-5">
        <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Matières</p>
        <p class="text-4xl font-bold" style="color:#10b981">{{ statsData().byMatiere.length }}</p>
        <p class="text-xs mt-1" style="color:var(--text-secondary)">disciplines</p>
      </div>
      <div class="sms-card p-5">
        <p class="text-xs font-bold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Enseignants</p>
        <p class="text-4xl font-bold" style="color:#ec4899">{{ statsData().byEns.length }}</p>
        <p class="text-xs mt-1" style="color:var(--text-secondary)">intervenants</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

      <!-- Répartition par matière -->
      <div class="sms-card p-5">
        <h3 class="font-bold mb-4" style="color:var(--text-primary)">Répartition par matière</h3>
        <div class="flex flex-col gap-3">
          @for (m of statsData().byMatiere; track m.matiere) {
            <div>
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full" [style.background]="courseColor(m.matiere)"></span>
                  <span class="text-sm font-medium" style="color:var(--text-primary)">{{ m.matiere }}</span>
                </div>
                <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ m.heures }}h · {{ m.pct }}%</span>
              </div>
              <div class="rounded-full h-2" style="background:var(--surface-2)">
                <div class="h-2 rounded-full"
                     [style.background]="courseColor(m.matiere)"
                     [style.width]="m.pct + '%'"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Heures par jour -->
      <div class="sms-card p-5">
        <h3 class="font-bold mb-4" style="color:var(--text-primary)">Heures par jour</h3>
        <div class="flex items-end gap-3 h-36">
          @for (d of statsData().byJour; track d.jour) {
            <div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ d.heures }}h</span>
              <div class="w-full rounded-t-lg transition-all"
                   [style.height]="(d.heures / statsMaxJour() * 100) + 'px'"
                   [style.background]="'var(--accent)'"
                   [style.min-height]="d.heures > 0 ? '4px' : '0'"
                   [style.opacity]="d.heures > 0 ? '1' : '0.2'">
              </div>
              <span class="text-xs" style="color:var(--text-muted)">{{ joursLabels[d.jour].substring(0,3) }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Charge par enseignant -->
      <div class="sms-card p-5">
        <h3 class="font-bold mb-4" style="color:var(--text-primary)">Charge par enseignant</h3>
        <div class="flex flex-col gap-3">
          @for (e of statsData().byEns; track e.nom) {
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                   style="background:var(--accent)">{{ initiales(e.nom) }}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm truncate" style="color:var(--text-primary)">{{ shortName(e.nom) }}</span>
                  <span class="text-xs font-bold shrink-0 ml-2" style="color:var(--text-secondary)">{{ e.heures }}h</span>
                </div>
                <div class="rounded-full h-1.5" style="background:var(--surface-2)">
                  <div class="h-1.5 rounded-full" style="background:var(--accent)"
                       [style.width]="Math.min((e.heures / 30) * 100, 100) + '%'"></div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Occupation des salles -->
      <div class="sms-card p-5">
        <h3 class="font-bold mb-4" style="color:var(--text-primary)">Occupation des salles</h3>
        <div class="flex flex-col gap-3">
          @for (s of sallesStats(); track s.libelle) {
            @if (s.nbCours > 0) {
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                     style="background:rgba(99,102,241,0.12)">
                  <mat-icon style="color:#6366f1;font-size:16px;height:16px;width:16px">meeting_room</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium" style="color:var(--text-primary)">{{ s.libelle }}</span>
                    <span class="text-xs font-bold" style="color:var(--text-secondary)">{{ tauxSalle(s.nbCours) }}%</span>
                  </div>
                  <div class="rounded-full h-1.5" style="background:var(--surface-2)">
                    <div class="h-1.5 rounded-full" style="background:#6366f1"
                         [style.width]="tauxSalle(s.nbCours) + '%'"></div>
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </div>

    </div>
  }<!-- /fin onglet Statistiques -->

</div>
  `,
})
export class ScheduleViewComponent implements OnInit {
  readonly store = inject(ScheduleStore);

  // ── Constantes ──────────────────────────────────────────────────────────────
  readonly jours       = JOURS_ORDRE;
  readonly joursLabels = JOURS_LABELS;
  readonly creneaux    = CRENEAUX;
  readonly niveaux     = NIVEAUX;
  readonly historique  = MOCK_HISTORIQUE;
  readonly Math        = Math;

  readonly views: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'semaine',    label: 'Semaine',    icon: 'grid_view'    },
    { id: 'jour',       label: 'Jour',       icon: 'view_day'     },
    { id: 'liste',      label: 'Liste',      icon: 'view_list'    },
    { id: 'enseignant', label: 'Enseignant', icon: 'person'       },
    { id: 'salle',      label: 'Salle',      icon: 'meeting_room' },
  ];

  readonly conflitFilters: { value: ConflitFilter; label: string; icon: string; count: () => number }[] = [
    { value: 'tous',       label: 'Tous',        icon: 'list',         count: () => this.store.conflits().length },
    { value: 'ENSEIGNANT', label: 'Enseignants', icon: 'person',       count: () => this.nbConflitsEnseignant() },
    { value: 'SALLE',      label: 'Salles',      icon: 'meeting_room', count: () => this.nbConflitsSalle()      },
  ];

  // ── State local ─────────────────────────────────────────────────────────────
  activeTab      = signal<MainTab>('edt');
  conflitFilter  = signal<ConflitFilter>('tous');
  selectedNiveau = 'Tous';
  readonly generating    = signal(false);
  readonly toast         = signal('');

  // ── Init ────────────────────────────────────────────────────────────────────
  ngOnInit() {
    this.store.loadTimeSlots({});
    this.store.loadSalles();
  }

  // ── Filtres classes ──────────────────────────────────────────────────────────
  classesFiltrees = computed(() => {
    if (!this.selectedNiveau || this.selectedNiveau === 'Tous') return MOCK_CLASSES;
    return MOCK_CLASSES.filter(c => c.niveau.startsWith(this.selectedNiveau.replace('3ème','3')));
  });

  classeInfo = computed(() =>
    MOCK_CLASSES.find(c => c.id === this.store.selectedClasseId()) ?? null
  );

  onNiveauChange(niveau: string): void {
    this.selectedNiveau = niveau;
    const first = niveau === 'Tous'
      ? MOCK_CLASSES[0]
      : MOCK_CLASSES.find(c => c.niveau.startsWith(niveau.replace('3ème','3')));
    if (first) this.store.setSelectedClasseId(first.id);
  }

  onClasseChange(id: string): void { this.store.setSelectedClasseId(id); }

  // ── Semaine ─────────────────────────────────────────────────────────────────
  weekLabel(): string {
    const base   = new Date(2026, 5, 8);
    const offset = this.store.currentWeekOffset();
    const lundi  = new Date(base.getTime() + offset * 7 * 86400000);
    const sam    = new Date(lundi.getTime() + 5 * 86400000);
    const fmt    = (d: Date) => d.toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
    return `Semaine du ${fmt(lundi)} au ${fmt(sam)} 2026`;
  }

  jourDate(jour: string): string {
    const base   = new Date(2026, 5, 8);
    const offset = this.store.currentWeekOffset();
    const idx    = JOURS_ORDRE.indexOf(jour as typeof JOURS_ORDRE[number]);
    const d      = new Date(base.getTime() + (offset * 7 + idx) * 86400000);
    return d.toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
  }

  changeWeek(delta: number): void {
    this.store.setCurrentWeekOffset(this.store.currentWeekOffset() + delta);
  }

  isApresMidi(heure: string): boolean { return heure >= '14:00'; }

  today(): string {
    return new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
  }

  // ── Grille ───────────────────────────────────────────────────────────────────
  slotsFor(jour: string, heure: string): ITimeSlot[] {
    return this.store.slotsForClasse().filter(s => s.jour === jour && s.heureDebut === heure);
  }

  slotsForJour(jour: string): ITimeSlot[] {
    return this.store.slotsForClasse().filter(s => s.jour === jour);
  }

  slotsOrdered = computed(() => {
    const order = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI'];
    return [...this.store.slotsForClasse()].sort((a, b) => {
      const dj = order.indexOf(a.jour) - order.indexOf(b.jour);
      return dj !== 0 ? dj : a.heureDebut.localeCompare(b.heureDebut);
    });
  });

  nextHour(heure: string): string {
    const idx = CRENEAUX.indexOf(heure);
    return idx >= 0 && idx + 1 < CRENEAUX.length ? CRENEAUX[idx + 1] : '';
  }

  // ── Couleurs ─────────────────────────────────────────────────────────────────
  courseColor(matiere: string): string {
    return MATIERE_COLORS[matiere] ?? '#6366f1';
  }

  legendeEntries = computed(() => {
    const matieres = [...new Set(this.store.slotsForClasse().map(s => s.matiereLibelle))];
    return matieres.map(m => ({ matiere: m, couleur: this.courseColor(m) }));
  });

  // ── Vue enseignant ────────────────────────────────────────────────────────────
  enseignantsStats = computed(() => {
    const map = new Map<string, { id: string; nom: string; nbCours: number; heures: number; matieres: Set<string> }>();
    for (const s of this.store.slotsForClasse()) {
      if (!map.has(s.enseignantPublicId)) {
        map.set(s.enseignantPublicId, { id: s.enseignantPublicId, nom: s.enseignantNom, nbCours: 0, heures: 0, matieres: new Set() });
      }
      const e = map.get(s.enseignantPublicId)!;
      e.nbCours++;
      e.heures++;
      e.matieres.add(s.matiereLibelle);
    }
    return [...map.values()].map(e => ({ ...e, matieres: [...e.matieres] }))
                             .sort((a, b) => b.heures - a.heures);
  });

  // ── Vue salle ─────────────────────────────────────────────────────────────────
  sallesStats = computed(() => {
    const map = new Map<string, { libelle: string; nbCours: number; occupe: boolean }>();
    for (const s of this.store.slotsForClasse()) {
      if (!map.has(s.sallePublicId)) {
        map.set(s.sallePublicId, { libelle: s.salleLibelle, nbCours: 0, occupe: false });
      }
      map.get(s.sallePublicId)!.nbCours++;
    }
    const now     = new Date();
    const nowH    = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const nowJour = ['DIMANCHE','LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI'][now.getDay()];
    for (const s of this.store.slotsForClasse()) {
      if (s.jour === nowJour && s.heureDebut <= nowH && nowH < s.heureFin) {
        const entry = map.get(s.sallePublicId);
        if (entry) entry.occupe = true;
      }
    }
    return [...map.values()].sort((a, b) => b.nbCours - a.nbCours);
  });

  tauxSalle(nbCours: number): number { return Math.min(Math.round((nbCours / 12) * 100), 100); }

  // ── Conflits groupés ──────────────────────────────────────────────────────────
  private extractEntity(desc: string, type: 'ENSEIGNANT' | 'SALLE'): string {
    if (type === 'ENSEIGNANT') return desc.split(' est planifié')[0];
    return desc.replace('Salle ', '').split(' utilisée')[0];
  }

  conflitsGroupes = computed((): ConflitGroupe[] => {
    const map = new Map<string, ConflitGroupe>();
    for (const c of this.store.conflits()) {
      const entity = this.extractEntity(c.description, c.type);
      if (!map.has(entity)) {
        map.set(entity, { entity, type: c.type, count: 0, slots: [], priorite: 'moyenne' });
      }
      const g = map.get(entity)!;
      g.count++;
      if (!g.slots.find(s => s.jour === c.jour && s.heure === c.heure)) {
        g.slots.push({ jour: c.jour, heure: c.heure });
      }
    }
    return [...map.values()]
      .map(g => ({
        ...g,
        priorite: g.count >= 3 ? 'critique' : g.count >= 2 ? 'haute' : 'moyenne' as ConflitGroupe['priorite'],
      }))
      .sort((a, b) => b.count - a.count);
  });

  conflitsFiltres = computed(() => {
    const f = this.conflitFilter();
    return f === 'tous'
      ? this.conflitsGroupes()
      : this.conflitsGroupes().filter(g => g.type === f);
  });

  nbConflitsEnseignant(): number { return this.store.conflits().filter(c => c.type === 'ENSEIGNANT').length; }
  nbConflitsSalle():      number { return this.store.conflits().filter(c => c.type === 'SALLE').length; }

  // ── Statistiques ──────────────────────────────────────────────────────────────
  statsData = computed(() => {
    const slots = this.store.slotsForClasse();
    const total = slots.length;
    const byMatiere = new Map<string, number>();
    const byJour    = new Map<string, number>();
    const byEns     = new Map<string, { nom: string; heures: number }>();

    for (const s of slots) {
      byMatiere.set(s.matiereLibelle, (byMatiere.get(s.matiereLibelle) ?? 0) + 1);
      byJour.set(s.jour, (byJour.get(s.jour) ?? 0) + 1);
      if (!byEns.has(s.enseignantPublicId)) byEns.set(s.enseignantPublicId, { nom: s.enseignantNom, heures: 0 });
      byEns.get(s.enseignantPublicId)!.heures++;
    }

    return {
      total,
      byMatiere: [...byMatiere.entries()]
        .map(([matiere, heures]) => ({ matiere, heures, pct: total > 0 ? Math.round((heures / total) * 100) : 0 }))
        .sort((a, b) => b.heures - a.heures),
      byJour: JOURS_ORDRE.map(j => ({ jour: j, heures: byJour.get(j) ?? 0 })),
      byEns: [...byEns.values()].sort((a, b) => b.heures - a.heures),
    };
  });

  statsMaxJour = computed(() => Math.max(...this.statsData().byJour.map(d => d.heures), 1) * 1.2);

  // ── Historique helpers ────────────────────────────────────────────────────────
  histoIcon(type: string): string {
    return { modification:'edit', generation:'auto_awesome', enseignant:'person', salle:'meeting_room' }[type] ?? 'info';
  }
  histoColor(type: string): { color: string; bg: string } {
    return {
      modification: { color:'#0891b2', bg:'rgba(8,145,178,0.10)' },
      generation:   { color:'#7c3aed', bg:'rgba(124,58,237,0.10)' },
      enseignant:   { color:'#d97706', bg:'rgba(217,119,6,0.10)'  },
      salle:        { color:'#6366f1', bg:'rgba(99,102,241,0.10)' },
    }[type] ?? { color:'#6b7280', bg:'rgba(107,114,128,0.10)' };
  }

  // ── Utilitaires ───────────────────────────────────────────────────────────────
  jourLabel(jour: string): string { return JOURS_LABELS[jour] ?? jour; }

  shortName(nom: string): string {
    const clean = nom.replace(/^(M\.|Mme)\s*/, '');
    const parts = clean.split(' ');
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : nom;
  }

  initiales(nom: string): string {
    return nom.replace(/^(M\.|Mme)\s*/, '').split(' ')
      .map(p => p[0] ?? '').slice(0, 2).join('').toUpperCase();
  }

  // ── Actions ───────────────────────────────────────────────────────────────────
  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3200);
  }

  printSchedule():            void { window.print(); }
  exportSimulated(f: string): void { this.showToast(`${f} généré — téléchargement simulé`); }

  autoGenerate(): void {
    this.generating.set(true);
    setTimeout(() => {
      this.generating.set(false);
      this.showToast('Emploi du temps généré avec succès !');
    }, 2000);
  }
}
