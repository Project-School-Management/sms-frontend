import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AbsencesStore } from '@sms/schedule/data-access';

const CLASSE_LABELS: Record<string, string> = {
  'cls-terminale-s1': 'Terminale S1',
  'cls-terminale-a1': 'Terminale A1',
  'cls-premiere-d':   'Première D',
};

@Component({
  selector: 'sms-absences-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  templateUrl: './absences-list.component.html',
  styleUrl: './absences-list.component.scss',
})
export class AbsencesListComponent implements OnInit {
  readonly store = inject(AbsencesStore);
  readonly classes = Object.entries(CLASSE_LABELS).map(([id, libelle]) => ({ id, libelle }));

  readonly justifyingId = signal<string | null>(null);
  motif = '';

  ngOnInit(): void {
    this.store.loadAbsences();
  }

  startJustify(id: string): void {
    this.justifyingId.set(id);
    this.motif = '';
  }

  cancelJustify(): void {
    this.justifyingId.set(null);
    this.motif = '';
  }

  confirmJustify(id: string): void {
    if (!this.motif.trim()) return;
    this.store.justifierAbsence({
      publicId: id,
      motif: this.motif.trim(),
      agent: { publicId: 'usr-secretariat-01', nom: 'Secrétariat connecté' },
    });
    this.cancelJustify();
  }
}
