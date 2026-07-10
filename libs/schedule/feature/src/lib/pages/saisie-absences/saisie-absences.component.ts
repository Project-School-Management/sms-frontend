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
  templateUrl: './saisie-absences.component.html',
  styleUrl: './saisie-absences.component.scss',
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

  isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  toggle(id: string): void {
    const next = new Set(this.selected());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selected.set(next);
  }

  toggleAll(): void {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.roster().map(e => e.publicId)));
  }

  onClasseChange(): void {
    this.selected.set(new Set());
  }

  canSubmit(): boolean {
    return !!this.classeId && !!this.matiereId && this.selectedCount() > 0;
  }

  reset(): void {
    this.selected.set(new Set());
    this.matiereId = '';
  }

  submit(): void {
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
