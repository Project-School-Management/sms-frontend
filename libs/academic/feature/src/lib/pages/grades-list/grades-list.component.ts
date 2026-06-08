import { ChangeDetectionStrategy, Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AcademicStore } from '@sms/academic/data-access';
import { MOCK_PROMOTIONS } from '@sms/academic/data-access';
import { SkeletonTableComponent } from '@sms/shared/ui';

const CLASSES = [
  { id: 'cls-terminale-s1', libelle: 'Terminale S1', niveau: 'Terminale' },
  { id: 'cls-premiere-d',   libelle: 'Première D',   niveau: 'Première'  },
  { id: 'cls-seconde',      libelle: 'Seconde A',     niveau: 'Seconde'   },
];

@Component({
  selector: 'sms-grades-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, SkeletonTableComponent],
  template: `
<div class="p-6">

  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
    <div>
      <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Notes & Évaluations</h1>
      <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Gestion des notes par matière et par élève</p>
    </div>
    <div class="flex items-center gap-2">
      <a routerLink="/academic/bulletins"
         class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
         style="border: 1px solid var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">description</mat-icon>
        Bulletins
      </a>
      <button (click)="exportCsv()"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
              style="border: 1px solid var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">download</mat-icon>
        Export CSV
      </button>
      <a routerLink="/academic/saisie"
         class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
         style="background: var(--accent)">
        <mat-icon style="font-size: 18px; height: 18px; width: 18px">edit_note</mat-icon>
        Saisir des notes
      </a>
    </div>
  </div>

  <!-- ── Sélecteur de contexte ─────────────────────────────────────────── -->
  <div class="sms-card p-4 mb-6">
    <div class="flex flex-wrap gap-3 items-end">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Année académique</label>
        <select class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option>2025-2026</option>
          <option>2024-2025</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Niveau</label>
        <select [(ngModel)]="selectedNiveau" (ngModelChange)="onNiveauChange($event)"
                class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option value="">Tous les niveaux</option>
          <option value="Terminale">Terminale</option>
          <option value="Première">Première</option>
          <option value="Seconde">Seconde</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Classe</label>
        <select [ngModel]="store.selectedClasseId()" (ngModelChange)="store.setSelectedClasseId($event)"
                class="px-3 py-2 rounded-lg border text-sm font-semibold"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          @for (c of classesFiltrees(); track c.id) {
            <option [value]="c.id">{{ c.libelle }}</option>
          }
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Matière</label>
        <select [ngModel]="store.selectedMatiere()" (ngModelChange)="store.setSelectedMatiere($event)"
                class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option value="">Toutes les matières</option>
          @for (m of store.matieresList(); track m) { <option [value]="m">{{ m }}</option> }
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Période</label>
        <select [ngModel]="store.selectedPeriode()" (ngModelChange)="store.setSelectedPeriode($event)"
                class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option value="">Toute l'année</option>
          <option value="S1">Semestre 1</option>
          <option value="S2">Semestre 2</option>
          <option value="T1">Trimestre 1</option>
          <option value="T2">Trimestre 2</option>
          <option value="T3">Trimestre 3</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Statut éval.</label>
        <select [ngModel]="store.selectedTypeEval()" (ngModelChange)="store.setSelectedTypeEval($event)"
                class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option value="">Tous</option>
          <option value="VALIDEE">Validée</option>
          <option value="SAISIE">Saisie</option>
          <option value="MODIFIEE">Modifiée</option>
        </select>
      </div>
    </div>
  </div>

  <!-- ── KPI Cards tableau de bord ──────────────────────────────────────── -->
  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
    <div class="sms-card p-4 flex flex-col gap-1 col-span-1">
      <p class="text-xl font-bold" style="color: var(--text-primary)">{{ store.classeStats().nbEleves }}</p>
      <p class="text-xs" style="color: var(--text-secondary)">Élèves</p>
    </div>
    <div class="sms-card p-4 flex flex-col gap-1">
      <p class="text-xl font-bold" style="color: var(--text-primary)">{{ store.classeStats().nbEvals }}</p>
      <p class="text-xs" style="color: var(--text-secondary)">Évaluations</p>
    </div>
    <div class="sms-card p-4 flex flex-col gap-1">
      <p class="text-xl font-bold" [style.color]="noteColor(store.classeStats().moy)">{{ store.classeStats().moy }}/20</p>
      <p class="text-xs" style="color: var(--text-secondary)">Moy. classe</p>
    </div>
    <div class="sms-card p-4 flex flex-col gap-1">
      <p class="text-xl font-bold" style="color: #16a34a">{{ store.classeStats().meilleureNote }}/20</p>
      <p class="text-xs" style="color: var(--text-secondary)">Meilleure note</p>
    </div>
    <div class="sms-card p-4 flex flex-col gap-1">
      <p class="text-xl font-bold" style="color: #dc2626">{{ store.classeStats().plusFaible }}/20</p>
      <p class="text-xs" style="color: var(--text-secondary)">Plus faible</p>
    </div>
    <div class="sms-card p-4 flex flex-col gap-1">
      <p class="text-xl font-bold" style="color: #2563eb">{{ store.classeStats().tauxReussite }}%</p>
      <p class="text-xs" style="color: var(--text-secondary)">Taux réussite</p>
    </div>
    <div class="sms-card p-4 flex flex-col gap-1">
      <p class="text-xl font-bold" style="color: #f59e0b">{{ store.classeStats().absences }}</p>
      <p class="text-xs" style="color: var(--text-secondary)">Absences</p>
    </div>
  </div>

  <!-- ── Top performers & En difficulté ────────────────────────────────── -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <!-- Top 5 -->
    <div class="sms-card p-4">
      <div class="flex items-center gap-2 mb-3">
        <mat-icon style="color: #16a34a">emoji_events</mat-icon>
        <h3 class="font-semibold text-sm" style="color: var(--text-primary)">Top 5 meilleurs élèves</h3>
      </div>
      <div class="flex flex-col gap-2">
        @for (b of store.topPerformers(); track b.publicId; let i = $index) {
          <div class="flex items-center gap-3 p-2 rounded-lg" style="background: rgba(22,163,74,0.04)">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style="background: #16a34a; flex-shrink: 0">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate" style="color: var(--text-primary)">{{ b.studentNom }}</p>
            </div>
            <span class="font-bold text-sm shrink-0" style="color: #16a34a">{{ b.moyenne }}/20</span>
            <span class="text-xs px-1.5 py-0.5 rounded shrink-0" style="background: rgba(22,163,74,0.1); color: #16a34a">{{ b.mention }}</span>
          </div>
        }
      </div>
    </div>
    <!-- En difficulté -->
    <div class="sms-card p-4">
      <div class="flex items-center gap-2 mb-3">
        <mat-icon style="color: #dc2626">warning</mat-icon>
        <h3 class="font-semibold text-sm" style="color: var(--text-primary)">Élèves en difficulté (moy &lt; 10)</h3>
      </div>
      <div class="flex flex-col gap-2">
        @for (b of store.enDifficulte(); track b.publicId) {
          <div class="flex items-center gap-3 p-2 rounded-lg" style="background: rgba(239,68,68,0.04)">
            <mat-icon style="color: #dc2626; font-size: 20px; height: 20px; width: 20px; flex-shrink: 0">person_off</mat-icon>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate" style="color: var(--text-primary)">{{ b.studentNom }}</p>
            </div>
            <span class="font-bold text-sm shrink-0" style="color: #dc2626">{{ b.moyenne }}/20</span>
            <span class="text-xs px-1.5 py-0.5 rounded shrink-0" style="background: rgba(239,68,68,0.1); color: #dc2626">Insuffisant</span>
          </div>
        }
        @if (store.enDifficulte().length === 0) {
          <div class="flex items-center gap-2 py-4 justify-center">
            <mat-icon style="color: #16a34a">check_circle</mat-icon>
            <p class="text-sm" style="color: #16a34a">Aucun élève en difficulté</p>
          </div>
        }
      </div>
    </div>
  </div>

  <!-- ── Tableau de notes ──────────────────────────────────────────────── -->
  <div class="sms-card overflow-hidden">
    <div class="px-5 py-4 border-b flex flex-wrap items-center gap-3" style="border-color: var(--border-color)">
      <h3 class="font-semibold flex-1" style="color: var(--text-primary)">
        Liste des notes
        <span class="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style="background: var(--surface-2); color: var(--text-muted)">
          {{ store.filteredNotes().length }} résultat(s)
        </span>
      </h3>
      <div class="relative">
        <mat-icon class="absolute left-2 top-1/2 -translate-y-1/2" style="font-size: 16px; height: 16px; width: 16px; color: var(--text-muted)">search</mat-icon>
        <input [ngModel]="store.searchQuery()" (ngModelChange)="store.setSearchQuery($event)"
               placeholder="Rechercher un élève..."
               class="pl-8 pr-4 py-1.5 rounded-lg border text-sm w-56"
               style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)" />
      </div>
    </div>

    @if (store.loading()) {
      <sms-skeleton-table />
    } @else {
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: var(--surface-2)">
              <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Élève</th>
              <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Matière</th>
              <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Enseignant</th>
              <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Note /20</th>
              <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Coeff.</th>
              <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Appréciation</th>
              <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Statut</th>
              <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Date</th>
            </tr>
          </thead>
          <tbody>
            @for (note of store.filteredNotes(); track note.publicId) {
              <tr class="border-t hover:opacity-80 transition-opacity" style="border-color: var(--border-color)">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                         style="background: var(--accent)">
                      {{ initiales(note.studentNom ?? note.studentPublicId) }}
                    </div>
                    <span class="text-xs font-medium" style="color: var(--text-secondary)">
                      {{ note.studentNom ?? note.studentPublicId }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 font-medium" style="color: var(--text-primary)">{{ note.matiereLibelle }}</td>
                <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">{{ note.enseignantNom ?? '—' }}</td>
                <td class="px-4 py-3">
                  @if (note.absent) {
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background: #fee2e2; color: #dc2626">ABS</span>
                  } @else {
                    <span class="font-bold text-base" [style.color]="noteColor(note.valeur)">{{ note.valeur }}/20</span>
                  }
                </td>
                <td class="px-4 py-3 text-sm" style="color: var(--text-secondary)">{{ note.coefficient ?? 1 }}</td>
                <td class="px-4 py-3 text-xs max-w-[160px] truncate" style="color: var(--text-muted)" [title]="note.appreciation ?? ''">
                  {{ note.appreciation ?? '—' }}
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold" [ngStyle]="statutStyle(note.statut)">
                    {{ note.statut }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs" style="color: var(--text-muted)">{{ note.createdDate | date:'dd/MM/yyyy' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8">
                  <div class="flex flex-col items-center justify-center py-16 gap-3">
                    <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">grade</mat-icon>
                    <p style="color: var(--text-secondary)">Aucune note trouvée</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  </div>
</div>
  `,
})
export class GradesListComponent implements OnInit {
  readonly store = inject(AcademicStore);
  selectedNiveau = '';

  classesFiltrees = computed(() => {
    if (!this.selectedNiveau) return CLASSES;
    return CLASSES.filter(c => c.niveau === this.selectedNiveau);
  });

  onNiveauChange(niveau: string) {
    this.selectedNiveau = niveau;
    const first = CLASSES.find(c => !niveau || c.niveau === niveau);
    if (first) this.store.setSelectedClasseId(first.id);
  }

  ngOnInit() {
    this.store.loadNotes({});
    this.store.loadBulletins({});
  }

  noteColor(v: number | null | undefined): string {
    if (v === null || v === undefined) return 'var(--text-muted)';
    if (v >= 16) return '#16a34a';
    if (v >= 14) return '#2563eb';
    if (v >= 10) return 'var(--text-primary)';
    return '#dc2626';
  }

  statutStyle(statut: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      VALIDEE:  { background: '#dcfce7', color: '#16a34a' },
      SAISIE:   { background: '#fef3c7', color: '#d97706' },
      MODIFIEE: { background: '#dbeafe', color: '#2563eb' },
    };
    return map[statut] ?? { background: '#f3f4f6', color: '#6b7280' };
  }

  initiales(nom: string): string {
    return nom.split(' ').map(p => p[0] ?? '').slice(0, 2).join('').toUpperCase();
  }

  exportCsv(): void {
    const notes = this.store.filteredNotes();
    if (!notes.length) return;
    const header = ['Élève', 'Matière', 'Note /20', 'Coefficient', 'Statut', 'Enseignant', 'Date'];
    const rows = notes.map(n => [
      n.studentNom ?? n.studentPublicId,
      n.matiereLibelle,
      n.absent ? 'ABS' : (n.valeur ?? '—'),
      n.coefficient ?? 1,
      n.statut,
      n.enseignantNom ?? '—',
      n.createdDate,
    ]);
    const csv = [header, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `notes-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
