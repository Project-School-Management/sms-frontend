import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AbsencesStore, MOCK_CLASSE_ROSTER, IEleveRoster } from '@sms/schedule/data-access';
import { ISaisirAbsencesRequest } from '@sms/shared/models';

interface Option { id: string; libelle: string; }

const CLASSE_OPTIONS: Option[] = [
  { id: 'cls-terminale-s1', libelle: 'Terminale S1' },
  { id: 'cls-terminale-a1', libelle: 'Terminale A1' },
  { id: 'cls-premiere-d',   libelle: 'Première D' },
];

const MATIERE_OPTIONS: Option[] = [
  { id: 'mat-maths', libelle: 'Mathématiques' },
  { id: 'mat-phys',  libelle: 'Physique-Chimie' },
  { id: 'mat-svt',   libelle: 'SVT' },
  { id: 'mat-fr',    libelle: 'Français' },
  { id: 'mat-ang',   libelle: 'Anglais' },
  { id: 'mat-hist',  libelle: 'Histoire-Géo' },
  { id: 'mat-philo', libelle: 'Philosophie' },
];

@Component({
  selector: 'sms-saisie-absences',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
<div class="p-6 max-w-4xl mx-auto">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
    <div>
      <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Saisie des absences</h1>
      <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Marquez les élèves absents pour une séance</p>
    </div>
    <a routerLink="/schedule/absences" class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--accent)">
      <mat-icon style="font-size: 16px; height: 16px; width: 16px">list</mat-icon>
      Suivi des absences
    </a>
  </div>

  <!-- Sélection séance -->
  <div class="sms-card p-5 mb-4">
    <h3 class="font-semibold mb-4" style="color: var(--text-primary)">1. Séance concernée</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Classe</label>
        <select [(ngModel)]="classeId" (ngModelChange)="onClasseChange()"
                class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option value="">Choisir…</option>
          @for (c of classeOptions; track c.id) { <option [value]="c.id">{{ c.libelle }}</option> }
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Matière</label>
        <select [(ngModel)]="matiereId"
                class="px-3 py-2 rounded-lg border text-sm"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
          <option value="">Choisir…</option>
          @for (m of matiereOptions; track m.id) { <option [value]="m.id">{{ m.libelle }}</option> }
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium" style="color: var(--text-secondary)">Date &amp; heure</label>
        <input type="datetime-local" [(ngModel)]="dateHeure"
               class="px-3 py-2 rounded-lg border text-sm"
               style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
      </div>
    </div>
  </div>

  <!-- Liste élèves -->
  @if (classeId) {
    <div class="sms-card overflow-hidden mb-4">
      <div class="px-5 py-4 border-b flex items-center justify-between" style="border-color: var(--border-color)">
        <h3 class="font-semibold" style="color: var(--text-primary)">
          2. Élèves absents
          <span class="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style="background: var(--surface-2); color: var(--text-muted)">
            {{ selectedCount() }} sélectionné(s) / {{ roster().length }}
          </span>
        </h3>
        <button (click)="toggleAll()" class="text-xs hover:opacity-80" style="color: var(--accent)">
          {{ allSelected() ? 'Tout désélectionner' : 'Tout sélectionner' }}
        </button>
      </div>
      <div class="divide-y" style="border-color: var(--border-color)">
        @for (e of roster(); track e.publicId) {
          <label class="flex items-center gap-3 px-5 py-3 cursor-pointer hover:opacity-90 transition-opacity"
                 [style.background]="isSelected(e.publicId) ? 'rgba(239,68,68,0.06)' : 'transparent'">
            <input type="checkbox" [checked]="isSelected(e.publicId)" (change)="toggle(e.publicId)"
                   style="width: 18px; height: 18px; accent-color: #dc2626">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                 style="background: var(--accent-light); color: var(--accent)">
              {{ initials(e.nom) }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium" style="color: var(--text-primary)">{{ e.nom }}</p>
              <p class="text-xs font-mono" style="color: var(--text-muted)">{{ e.matricule }}</p>
            </div>
            @if (isSelected(e.publicId)) {
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background: #fee2e2; color: #dc2626">Absent</span>
            }
          </label>
        }
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3">
      <button (click)="reset()" class="px-4 py-2 rounded-lg text-sm hover:opacity-80"
              style="border: 1px solid var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
        Annuler
      </button>
      <button (click)="submit()" [disabled]="!canSubmit() || store.saving()"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style="background: #dc2626">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">{{ store.saving() ? 'hourglass_empty' : 'save' }}</mat-icon>
        Enregistrer {{ selectedCount() }} absence(s)
      </button>
    </div>
  } @else {
    <div class="sms-card p-12 flex flex-col items-center justify-center gap-3">
      <mat-icon style="font-size: 40px; height: 40px; width: 40px; color: var(--text-muted)">groups</mat-icon>
      <p style="color: var(--text-secondary)">Sélectionnez une classe pour afficher la liste des élèves</p>
    </div>
  }
</div>
  `,
})
export class SaisieAbsencesComponent {
  readonly store = inject(AbsencesStore);

  readonly classeOptions  = CLASSE_OPTIONS;
  readonly matiereOptions = MATIERE_OPTIONS;

  classeId  = '';
  matiereId = '';
  dateHeure = new Date().toISOString().slice(0, 16);

  private readonly selected = signal<Set<string>>(new Set());

  readonly roster = computed<IEleveRoster[]>(() => MOCK_CLASSE_ROSTER[this.classeId] ?? []);
  readonly selectedCount = computed(() => this.selected().size);
  readonly allSelected   = computed(() => this.roster().length > 0 && this.selected().size === this.roster().length);

  isSelected(id: string) { return this.selected().has(id); }

  toggle(id: string) {
    const next = new Set(this.selected());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selected.set(next);
  }

  toggleAll() {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.roster().map(e => e.publicId)));
  }

  onClasseChange() { this.selected.set(new Set()); }

  canSubmit() { return !!this.classeId && !!this.matiereId && this.selectedCount() > 0; }

  reset() {
    this.selected.set(new Set());
    this.matiereId = '';
  }

  submit() {
    if (!this.canSubmit()) return;
    const classe  = CLASSE_OPTIONS.find(c => c.id === this.classeId)!;
    const matiere = MATIERE_OPTIONS.find(m => m.id === this.matiereId)!;
    const request: ISaisirAbsencesRequest = {
      matierePublicId: this.matiereId,
      classePublicId:  this.classeId,
      elevePublicIds:  [...this.selected()],
      heureAbsence:    new Date(this.dateHeure).toISOString(),
      anneeAcademiquePublicId: 'annee-2025-2026',
    };
    this.store.saisirAbsences({
      request,
      meta: {
        matiereLibelle: matiere.libelle,
        classeLibelle:  classe.libelle,
        enseignantPublicId: 'ens-current', enseignantNom: 'Enseignant connecté',
        eleves: this.roster().map(e => ({ publicId: e.publicId, nom: e.nom, matricule: e.matricule })),
      },
    });
    this.reset();
  }

  initials(nom: string): string {
    return nom.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
