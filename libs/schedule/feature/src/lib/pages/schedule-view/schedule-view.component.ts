import { ChangeDetectionStrategy, Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ScheduleStore } from '@sms/schedule/data-access';
import { MOCK_CLASSES } from '@sms/schedule/data-access';
import { ITimeSlot } from '@sms/shared/models';

const JOURS_ORDRE = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'] as const;
const JOURS_LABELS: Record<string, string> = {
  LUNDI: 'Lundi', MARDI: 'Mardi', MERCREDI: 'Mercredi',
  JEUDI: 'Jeudi', VENDREDI: 'Vendredi', SAMEDI: 'Samedi',
};
const CRENEAUX = ['07:30', '08:30', '09:30', '10:30', '11:30', '14:00', '15:00', '16:00'];
const NIVEAUX  = ['Tous', 'Terminale', 'Première', 'Seconde', '3ème'];

const MATIERE_COLORS: Record<string, string> = {
  'Mathématiques':   '#6366f1',
  'Physique-Chimie': '#f59e0b',
  'SVT':             '#10b981',
  'Français':        '#ec4899',
  'Anglais':         '#0ea5e9',
  'Histoire-Géo':    '#a855f7',
  'Philosophie':     '#8b5cf6',
  'EPS':             '#22c55e',
  'Latin':           '#d97706',
  'Espagnol':        '#f43f5e',
  'Arts Plastiques': '#14b8a6',
};

type ViewMode = 'semaine' | 'jour' | 'liste' | 'enseignant' | 'salle';

@Component({
  selector: 'sms-schedule-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6">

  <!-- ── Header ────────────────────────────────────────────────────────── -->
  <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
    <div>
      <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Emploi du temps</h1>
      <p class="text-sm mt-0.5" style="color: var(--text-secondary)">{{ classeInfo()?.libelle }} — {{ classeInfo()?.niveau }} {{ classeInfo()?.filiere }}</p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:opacity-80"
              style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">print</mat-icon> Imprimer
      </button>
      <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:opacity-80"
              style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">download</mat-icon> Export PDF
      </button>
      <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:opacity-80"
              style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">table_chart</mat-icon> Excel
      </button>
      <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style="background: var(--accent)">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">auto_awesome</mat-icon> Générer auto
      </button>
    </div>
  </div>

  <!-- ── Sélecteur de contexte ─────────────────────────────────────────── -->
  <div class="sms-card p-4 mb-4">
    <div class="flex flex-wrap gap-3 items-end">
      <!-- Année académique -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Année académique</label>
        <select class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option>2025-2026</option>
          <option>2024-2025</option>
        </select>
      </div>
      <!-- Niveau -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Niveau</label>
        <select [(ngModel)]="selectedNiveau"
                (ngModelChange)="onNiveauChange($event)"
                class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          @for (n of niveaux; track n) { <option [value]="n">{{ n }}</option> }
        </select>
      </div>
      <!-- Classe -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Classe</label>
        <select [ngModel]="store.selectedClasseId()"
                (ngModelChange)="onClasseChange($event)"
                class="px-3 py-2 rounded-lg border text-sm font-semibold"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          @for (c of classesFiltrees(); track c.id) {
            <option [value]="c.id">{{ c.libelle }}</option>
          }
        </select>
      </div>
      <!-- Séparateur -->
      <div class="flex-1"></div>
      <!-- Vue -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Vue</label>
        <div class="flex gap-1">
          @for (v of views; track v.id) {
            <button (click)="store.setSelectedView(v.id)"
                    class="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    [style.background]="store.selectedView() === v.id ? 'var(--accent)' : 'var(--surface-2)'"
                    [style.color]="store.selectedView() === v.id ? '#fff' : 'var(--text-secondary)'"
                    [style.border]="'1px solid ' + (store.selectedView() === v.id ? 'var(--accent)' : 'var(--border-color)')">
              {{ v.label }}
            </button>
          }
        </div>
      </div>
    </div>
  </div>

  <!-- ── Bandeau infos classe ──────────────────────────────────────────── -->
  @if (classeInfo(); as cls) {
    <div class="sms-card p-4 mb-4">
      <div class="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div style="color: var(--text-secondary)">Classe : <strong style="color: var(--text-primary)">{{ cls.libelle }}</strong></div>
        <div style="color: var(--text-secondary)">Effectif : <strong style="color: var(--text-primary)">{{ cls.effectif }} élèves</strong></div>
        <div style="color: var(--text-secondary)">Année : <strong style="color: var(--text-primary)">2025-2026</strong></div>
        <div style="color: var(--text-secondary)">Prof. principal : <strong style="color: var(--text-primary)">{{ cls.professeurPrincipal }}</strong></div>
        <div style="color: var(--text-secondary)">Salle principale : <strong style="color: var(--text-primary)">{{ cls.sallePrincipale }}</strong></div>
        <div style="color: var(--text-secondary)">Séances/semaine : <strong style="color: var(--accent)">{{ store.kpiStats().nbCours }}</strong></div>
      </div>
    </div>
  }

  <!-- ── KPI Cards ──────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
    <div class="sms-card p-4 flex items-start gap-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background: var(--accent-light)">
        <mat-icon style="color: var(--accent); font-size: 18px; height: 18px; width: 18px">event_note</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color: var(--text-primary)">{{ store.kpiStats().nbCours }}</p>
        <p class="text-xs" style="color: var(--text-secondary)">Cours/semaine</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-start gap-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background: rgba(16,185,129,0.1)">
        <mat-icon style="color: #10b981; font-size: 18px; height: 18px; width: 18px">schedule</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color: var(--text-primary)">{{ store.kpiStats().heures }}h</p>
        <p class="text-xs" style="color: var(--text-secondary)">Enseignement</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-start gap-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background: rgba(99,102,241,0.1)">
        <mat-icon style="color: #6366f1; font-size: 18px; height: 18px; width: 18px">room</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color: var(--text-primary)">{{ store.kpiStats().salles }}</p>
        <p class="text-xs" style="color: var(--text-secondary)">Salles utilisées</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-start gap-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background: rgba(236,72,153,0.1)">
        <mat-icon style="color: #ec4899; font-size: 18px; height: 18px; width: 18px">people</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color: var(--text-primary)">{{ store.kpiStats().enseignants }}</p>
        <p class="text-xs" style="color: var(--text-secondary)">Enseignants</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-start gap-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background: rgba(245,158,11,0.1)">
        <mat-icon style="color: #f59e0b; font-size: 18px; height: 18px; width: 18px">analytics</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color: var(--text-primary)">{{ store.kpiStats().tauxOccupation }}%</p>
        <p class="text-xs" style="color: var(--text-secondary)">Taux occupation</p>
      </div>
    </div>
  </div>

  <!-- ── Conflits ───────────────────────────────────────────────────────── -->
  @if (store.conflits().length > 0) {
    <div class="sms-card p-4 mb-4 border-l-4" style="border-left-color: #ef4444; background: rgba(239,68,68,0.04)">
      <div class="flex items-center gap-2 mb-3">
        <mat-icon style="color: #ef4444">warning</mat-icon>
        <span class="font-semibold text-sm" style="color: #ef4444">{{ store.conflits().length }} conflit(s) détecté(s)</span>
      </div>
      <div class="flex flex-col gap-2">
        @for (c of store.conflits(); track c.slot1PublicId) {
          <div class="flex items-start gap-2 text-xs p-2 rounded-lg" style="background: rgba(239,68,68,0.06)">
            <span class="px-1.5 py-0.5 rounded text-white text-xs font-semibold shrink-0"
                  [style.background]="c.type === 'ENSEIGNANT' ? '#f59e0b' : '#ef4444'">
              {{ c.type }}
            </span>
            <span style="color: var(--text-secondary)">{{ c.description }} — <strong>{{ jourLabel(c.jour) }}</strong> à {{ c.heure }}</span>
          </div>
        }
      </div>
    </div>
  }

  <!-- ── Navigation semaine ────────────────────────────────────────────── -->
  @if (store.selectedView() === 'semaine' || store.selectedView() === 'liste') {
    <div class="flex items-center justify-center gap-3 mb-4">
      <button (click)="changeWeek(-1)"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:opacity-80"
              style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">chevron_left</mat-icon>
        Semaine préc.
      </button>
      <span class="text-sm font-semibold px-4 py-1.5 rounded-lg" style="color: var(--text-primary); background: var(--surface-2)">
        {{ weekLabel() }}
      </span>
      <button (click)="changeWeek(1)"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm hover:opacity-80"
              style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
        Semaine suiv.
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">chevron_right</mat-icon>
      </button>
      <button (click)="store.setCurrentWeekOffset(0)"
              class="px-3 py-1.5 rounded-lg text-sm font-medium"
              style="border: 1px solid var(--accent); color: var(--accent); background: var(--accent-light)">
        Aujourd'hui
      </button>
    </div>
  }

  @if (store.loading()) {
    <div class="flex items-center justify-center py-16" style="color: var(--text-secondary)">
      <mat-icon class="animate-spin">refresh</mat-icon>&nbsp;Chargement...
    </div>
  } @else {

    <!-- ══════════════ VUE SEMAINE ══════════════ -->
    @if (store.selectedView() === 'semaine') {
      <div class="sms-card overflow-hidden">
        <!-- En-tête jours -->
        <div class="grid border-b" style="grid-template-columns: 72px repeat(6, 1fr); border-color: var(--border-color)">
          <div class="px-2 py-3" style="background: var(--surface-2)"></div>
          @for (jour of jours; track jour) {
            <div class="px-2 py-3 text-center border-l" style="background: var(--surface-2); border-color: var(--border-color)">
              <p class="text-xs font-bold" style="color: var(--text-primary)">{{ joursLabels[jour] }}</p>
              <p class="text-xs mt-0.5" style="color: var(--text-muted)">{{ jourDate(jour) }}</p>
              @if (jour === 'SAMEDI') {
                <span class="text-xs px-1.5 rounded" style="background: rgba(245,158,11,0.12); color: #d97706">Matinée</span>
              }
            </div>
          }
        </div>
        <!-- Lignes créneaux -->
        @for (heure of creneaux; track heure) {
          @if (heure !== 'PAUSE') {
            <div class="grid border-b" style="grid-template-columns: 72px repeat(6, 1fr); border-color: var(--border-color)">
              <div class="px-2 py-2 text-right text-xs border-r" style="color: var(--text-muted); border-color: var(--border-color); padding-top: 6px">
                {{ heure }}
              </div>
              @for (jour of jours; track jour) {
                @if (jour === 'SAMEDI' && isApresMinuit(heure)) {
                  <div class="border-l min-h-[58px]" style="border-color: var(--border-color); background: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.02) 4px, rgba(0,0,0,0.02) 8px)">
                  </div>
                } @else {
                  <div class="border-l min-h-[58px] p-1" style="border-color: var(--border-color)">
                    @for (slot of slotsFor(jour, heure); track slot.publicId) {
                      <div class="rounded-lg p-2 text-xs cursor-pointer hover:opacity-80 transition-opacity mb-0.5"
                           [style.background]="courseColor(slot.matiereLibelle) + '20'"
                           [style.border-left]="'3px solid ' + courseColor(slot.matiereLibelle)">
                        <p class="font-bold truncate" [style.color]="courseColor(slot.matiereLibelle)">{{ slot.matiereLibelle }}</p>
                        <p class="truncate" style="color: var(--text-secondary)">{{ shortName(slot.enseignantNom) }}</p>
                        <div class="flex items-center gap-1 mt-1">
                          <mat-icon style="font-size: 9px; height: 9px; width: 9px; color: #6366f1; line-height: 1">room</mat-icon>
                          <span class="font-semibold" style="color: #6366f1; background: rgba(99,102,241,0.12); padding: 1px 4px; border-radius: 3px; font-size: 10px">{{ slot.salleLibelle }}</span>
                        </div>
                      </div>
                    }
                    @if (slotsFor(jour, heure).length === 0) {
                      <div class="min-h-[50px] flex items-center justify-center text-xs" style="color: var(--text-muted)">—</div>
                    }
                  </div>
                }
              }
            </div>
          }
        }
      </div>

      <!-- Légende -->
      <div class="mt-4 sms-card p-4">
        <p class="text-xs font-semibold mb-2" style="color: var(--text-secondary)">LÉGENDE MATIÈRES</p>
        <div class="flex flex-wrap gap-2">
          @for (entry of legendeEntries(); track entry.matiere) {
            <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                 [style.background]="entry.couleur + '20'">
              <div class="w-2 h-2 rounded-full" [style.background]="entry.couleur"></div>
              <span class="text-xs font-medium" [style.color]="entry.couleur">{{ entry.matiere }}</span>
            </div>
          }
        </div>
      </div>
    }

    <!-- ══════════════ VUE JOUR ══════════════ -->
    @if (store.selectedView() === 'jour') {
      <!-- Sélecteur jour -->
      <div class="flex gap-2 mb-4 flex-wrap">
        @for (jour of jours; track jour) {
          <button (click)="store.setSelectedJour(jour)"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  [style.background]="store.selectedJour() === jour ? 'var(--accent)' : 'var(--surface-2)'"
                  [style.color]="store.selectedJour() === jour ? '#fff' : 'var(--text-secondary)'"
                  [style.border]="'1px solid ' + (store.selectedJour() === jour ? 'var(--accent)' : 'var(--border-color)')">
            {{ joursLabels[jour] }}
          </button>
        }
      </div>
      <div class="flex flex-col gap-3">
        @for (heure of creneaux; track heure) {
          @for (slot of slotsFor(store.selectedJour(), heure); track slot.publicId) {
            <div class="sms-card p-4 flex items-center gap-4 border-l-4"
                 [style.border-left-color]="courseColor(slot.matiereLibelle)">
              <div class="w-20 text-center shrink-0">
                <p class="text-xs font-bold" style="color: var(--text-muted)">{{ heure }}</p>
                <p class="text-xs" style="color: var(--text-muted)">{{ nextHour(heure) }}</p>
              </div>
              <div class="w-2 self-stretch rounded-full shrink-0" [style.background]="courseColor(slot.matiereLibelle)"></div>
              <div class="flex-1">
                <p class="font-bold text-base" style="color: var(--text-primary)">{{ slot.matiereLibelle }}</p>
                <p class="text-sm mt-0.5" style="color: var(--text-secondary)">{{ slot.enseignantNom }}</p>
                <p class="text-xs mt-0.5" style="color: var(--text-muted)">{{ slot.promotionLibelle }}</p>
              </div>
              <div class="text-right">
                <div class="flex items-center gap-1.5 justify-end mb-1">
                  <mat-icon style="font-size: 14px; height: 14px; width: 14px; color: #6366f1">room</mat-icon>
                  <span class="font-semibold text-sm" style="color: #6366f1; background: rgba(99,102,241,0.12); padding: 2px 8px; border-radius: 6px">{{ slot.salleLibelle }}</span>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full" style="background: rgba(22,163,74,0.1); color: #16a34a">Planifiée</span>
              </div>
            </div>
          }
        }
        @if (slotsForJour(store.selectedJour()).length === 0) {
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">calendar_today</mat-icon>
            <p style="color: var(--text-secondary)">Aucun cours ce jour</p>
          </div>
        }
      </div>
    }

    <!-- ══════════════ VUE LISTE ══════════════ -->
    @if (store.selectedView() === 'liste') {
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 border-b" style="border-color: var(--border-color)">
          <h3 class="font-semibold" style="color: var(--text-primary)">Tous les cours de la semaine</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style="background: var(--surface-2)">
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Jour</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Horaire</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Matière</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Enseignant</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Salle</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Statut</th>
              </tr>
            </thead>
            <tbody>
              @for (slot of slotsOrdered(); track slot.publicId) {
                <tr class="border-t hover:opacity-80 transition-opacity" style="border-color: var(--border-color)">
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded text-xs font-semibold"
                          [style.background]="courseColor(slot.matiereLibelle) + '20'"
                          [style.color]="courseColor(slot.matiereLibelle)">
                      {{ joursLabels[slot.jour] }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-mono text-xs" style="color: var(--text-secondary)">
                    {{ slot.heureDebut }} – {{ slot.heureFin }}
                  </td>
                  <td class="px-4 py-3">
                    <span class="font-semibold" style="color: var(--text-primary)">{{ slot.matiereLibelle }}</span>
                  </td>
                  <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">{{ slot.enseignantNom }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-1">
                      <mat-icon style="font-size: 12px; height: 12px; width: 12px; color: #6366f1">room</mat-icon>
                      <span class="font-semibold text-xs" style="color: #6366f1; background: rgba(99,102,241,0.1); padding: 1px 6px; border-radius: 4px">{{ slot.salleLibelle }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background: rgba(22,163,74,0.1); color: #16a34a">Planifiée</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <!-- ══════════════ VUE ENSEIGNANT ══════════════ -->
    @if (store.selectedView() === 'enseignant') {
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (ens of enseignantsStats(); track ens.id) {
          <div class="sms-card p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                   style="background: var(--accent)">
                {{ initiales(ens.nom) }}
              </div>
              <div>
                <p class="font-semibold text-sm" style="color: var(--text-primary)">{{ ens.nom }}</p>
                <p class="text-xs" style="color: var(--text-muted)">{{ ens.nbCours }} séance(s) / semaine</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-1">
              @for (m of ens.matieres; track m) {
                <span class="px-2 py-0.5 rounded text-xs font-medium"
                      [style.background]="courseColor(m) + '20'"
                      [style.color]="courseColor(m)">{{ m }}</span>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- ══════════════ VUE SALLE ══════════════ -->
    @if (store.selectedView() === 'salle') {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (s of sallesStats(); track s.libelle) {
          <div class="sms-card p-4">
            <div class="flex items-center justify-between mb-2">
              <p class="font-bold" style="color: var(--text-primary)">{{ s.libelle }}</p>
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    [style.background]="s.occupe ? '#fee2e2' : '#dcfce7'"
                    [style.color]="s.occupe ? '#dc2626' : '#16a34a'">
                {{ s.occupe ? 'Occupée' : 'Disponible' }}
              </span>
            </div>
            <p class="text-xs mb-3" style="color: var(--text-muted)">{{ s.nbCours }} cours planifiés</p>
            <div class="flex items-center gap-2">
              <div class="flex-1 rounded-full h-1.5" style="background: var(--surface-2)">
                <div class="h-1.5 rounded-full" style="background: var(--accent)"
                     [style.width]="tauxSalle(s.nbCours) + '%'"></div>
              </div>
              <span class="text-xs font-semibold" style="color: var(--text-secondary)">{{ tauxSalle(s.nbCours) }}%</span>
            </div>
          </div>
        }
      </div>
    }
  }
</div>
  `,
})
export class ScheduleViewComponent implements OnInit {
  readonly store = inject(ScheduleStore);

  readonly jours       = JOURS_ORDRE;
  readonly joursLabels = JOURS_LABELS;
  readonly creneaux    = CRENEAUX;
  readonly niveaux     = NIVEAUX;
  readonly views: { id: ViewMode; label: string }[] = [
    { id: 'semaine',    label: 'Semaine'    },
    { id: 'jour',       label: 'Jour'       },
    { id: 'liste',      label: 'Liste'      },
    { id: 'enseignant', label: 'Enseignant' },
    { id: 'salle',      label: 'Salle'      },
  ];

  selectedNiveau = 'Tous';

  ngOnInit() {
    this.store.loadTimeSlots({});
    this.store.loadSalles();
  }

  // ── Sélecteurs ──────────────────────────────────────────────────────────

  classesFiltrees = computed(() => {
    if (!this.selectedNiveau || this.selectedNiveau === 'Tous') return MOCK_CLASSES;
    return MOCK_CLASSES.filter(c => c.niveau === this.selectedNiveau);
  });

  classeInfo = computed(() =>
    MOCK_CLASSES.find(c => c.id === this.store.selectedClasseId()) ?? null
  );

  onNiveauChange(niveau: string) {
    this.selectedNiveau = niveau;
    const first = MOCK_CLASSES.find(c => c.niveau === niveau || niveau === 'Tous');
    if (first) this.store.setSelectedClasseId(first.id);
  }

  onClasseChange(id: string) {
    this.store.setSelectedClasseId(id);
  }

  // ── Helpers semaine ─────────────────────────────────────────────────────

  weekLabel(): string {
    const base = new Date(2026, 5, 8); // semaine du 8 juin 2026 (lundi)
    const offset = this.store.currentWeekOffset();
    const lundi = new Date(base.getTime() + offset * 7 * 86400000);
    const samedi = new Date(lundi.getTime() + 5 * 86400000);
    const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `Semaine du ${fmt(lundi)} au ${fmt(samedi)} 2026`;
  }

  jourDate(jour: string): string {
    const base = new Date(2026, 5, 8);
    const offset = this.store.currentWeekOffset();
    const idx = JOURS_ORDRE.indexOf(jour as typeof JOURS_ORDRE[number]);
    const d = new Date(base.getTime() + (offset * 7 + idx) * 86400000);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  changeWeek(delta: number) {
    this.store.setCurrentWeekOffset(this.store.currentWeekOffset() + delta);
  }

  isApresMinuit(heure: string): boolean {
    return heure >= '14:00';
  }

  // ── Grille ──────────────────────────────────────────────────────────────

  slotsFor(jour: string, heure: string): ITimeSlot[] {
    return this.store.slotsForClasse().filter(s => s.jour === jour && s.heureDebut === heure);
  }

  slotsForJour(jour: string): ITimeSlot[] {
    return this.store.slotsForClasse().filter(s => s.jour === jour);
  }

  slotsOrdered = computed(() => {
    const slots = [...this.store.slotsForClasse()];
    const jourOrdre = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
    return slots.sort((a, b) => {
      const dj = jourOrdre.indexOf(a.jour) - jourOrdre.indexOf(b.jour);
      if (dj !== 0) return dj;
      return a.heureDebut.localeCompare(b.heureDebut);
    });
  });

  nextHour(heure: string): string {
    const idx = CRENEAUX.indexOf(heure);
    return idx >= 0 && idx + 1 < CRENEAUX.length ? CRENEAUX[idx + 1] : '';
  }

  // ── Couleurs ─────────────────────────────────────────────────────────────

  courseColor(matiere: string): string {
    return MATIERE_COLORS[matiere] ?? '#6366f1';
  }

  legendeEntries = computed(() => {
    const matieres = [...new Set(this.store.slotsForClasse().map(s => s.matiereLibelle))];
    return matieres.map(m => ({ matiere: m, couleur: this.courseColor(m) }));
  });

  // ── Vue enseignant ───────────────────────────────────────────────────────

  enseignantsStats = computed(() => {
    const map = new Map<string, { id: string; nom: string; nbCours: number; matieres: Set<string> }>();
    for (const s of this.store.slotsForClasse()) {
      if (!map.has(s.enseignantPublicId)) {
        map.set(s.enseignantPublicId, { id: s.enseignantPublicId, nom: s.enseignantNom, nbCours: 0, matieres: new Set() });
      }
      const e = map.get(s.enseignantPublicId)!;
      e.nbCours++;
      e.matieres.add(s.matiereLibelle);
    }
    return [...map.values()].map(e => ({ ...e, matieres: [...e.matieres] }));
  });

  // ── Vue salle ────────────────────────────────────────────────────────────

  sallesStats = computed(() => {
    const map = new Map<string, { libelle: string; nbCours: number; occupe: boolean }>();
    for (const s of this.store.slotsForClasse()) {
      if (!map.has(s.sallePublicId)) {
        map.set(s.sallePublicId, { libelle: s.salleLibelle, nbCours: 0, occupe: false });
      }
      map.get(s.sallePublicId)!.nbCours++;
    }
    // Marquer "occupée maintenant" si on est un lundi matin (simulation)
    const now = new Date();
    const nowHeure = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const nowJour = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'][now.getDay()];
    for (const s of this.store.slotsForClasse()) {
      if (s.jour === nowJour && s.heureDebut <= nowHeure && nowHeure < s.heureFin) {
        const entry = map.get(s.sallePublicId);
        if (entry) entry.occupe = true;
      }
    }
    return [...map.values()];
  });

  tauxSalle(nbCours: number): number {
    return Math.min(Math.round((nbCours / 12) * 100), 100);
  }

  // ── Utilitaires ──────────────────────────────────────────────────────────

  jourLabel(jour: string): string {
    return JOURS_LABELS[jour] ?? jour;
  }

  shortName(nom: string): string {
    const parts = nom.replace(/^(M\.|Mme)\s*/, '').split(' ');
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : nom;
  }

  initiales(nom: string): string {
    return nom.replace(/^(M\.|Mme)\s*/, '').split(' ')
      .map(p => p[0] ?? '')
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
