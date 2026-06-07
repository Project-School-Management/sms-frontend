import { ChangeDetectionStrategy, Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AcademicStore } from '@sms/academic/data-access';

@Component({
  selector: 'sms-grades-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Notes & Évaluations</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Gestion des notes par matière et par étudiant</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/academic/bulletins"
             class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
             style="border: 1px solid var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">description</mat-icon>
            Bulletins
          </a>
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style="background: var(--accent)">
            <mat-icon style="font-size: 18px; height: 18px; width: 18px">add</mat-icon>
            Saisir une note
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
            <mat-icon style="color: var(--accent)">format_list_numbered</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.notes().length }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Total notes</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
            <mat-icon style="color: #16a34a">verified</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ nbValidees() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Validées</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(239,68,68,0.1)">
            <mat-icon style="color: #dc2626">person_off</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ nbAbsents() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Absences</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(59,130,246,0.1)">
            <mat-icon style="color: #2563eb">analytics</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ moyenneGlobale() }}/20</p>
            <p class="text-sm" style="color: var(--text-secondary)">Moyenne générale</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 border-b flex flex-wrap items-center gap-3" style="border-color: var(--border-color)">
          <h3 class="font-semibold flex-1" style="color: var(--text-primary)">Liste des notes</h3>
          <div class="flex items-center gap-2 flex-wrap">
            <select [(ngModel)]="matiereFilter"
              class="px-3 py-1.5 rounded-lg border text-sm"
              style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
              <option value="">Toutes les matières</option>
              <option value="Algorithmique">Algorithmique</option>
              <option value="Base de données">Base de données</option>
              <option value="Réseaux">Réseaux</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Français">Français</option>
              <option value="Anglais">Anglais</option>
              <option value="Physique-Chimie">Physique-Chimie</option>
              <option value="SVT">SVT</option>
              <option value="Histoire-Géo">Histoire-Géo</option>
            </select>
            <select [(ngModel)]="statutFilter"
              class="px-3 py-1.5 rounded-lg border text-sm"
              style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
              <option value="">Tous les statuts</option>
              <option value="VALIDEE">Validée</option>
              <option value="SAISIE">Saisie</option>
              <option value="MODIFIEE">Modifiée</option>
            </select>
          </div>
        </div>

        @if (store.loading()) {
          <div class="flex items-center justify-center py-16" style="color: var(--text-secondary)">
            <mat-icon class="animate-spin">refresh</mat-icon>&nbsp;Chargement...
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr style="background: var(--surface-2)">
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Étudiant</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Matière</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Note /20</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Coeff.</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Statut</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Enseignant</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Date</th>
                </tr>
              </thead>
              <tbody>
                @for (note of filteredNotes(); track note.publicId) {
                  <tr class="border-t hover:opacity-80 transition-opacity" style="border-color: var(--border-color)">
                    <td class="px-4 py-3 text-xs font-medium" style="color: var(--text-secondary)">{{ note.studentPublicId }}</td>
                    <td class="px-4 py-3 font-medium" style="color: var(--text-primary)">{{ note.matiereLibelle }}</td>
                    <td class="px-4 py-3">
                      @if (note.absent) {
                        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background: #fee2e2; color: #dc2626">ABS</span>
                      } @else {
                        <span class="font-bold text-sm" [style.color]="noteColor(note.valeur)">{{ note.valeur }}/20</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-sm" style="color: var(--text-secondary)">{{ (note as any).coefficient ?? 1 }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-semibold" [ngStyle]="statutStyle(note.statut)">
                        {{ note.statut }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">{{ (note as any).enseignantNom ?? '—' }}</td>
                    <td class="px-4 py-3 text-xs" style="color: var(--text-muted)">{{ note.createdDate | date:'dd/MM/yyyy' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7">
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

  matiereFilter = '';
  statutFilter = '';

  readonly nbValidees    = computed(() => this.store.notes().filter(n => n.statut === 'VALIDEE').length);
  readonly nbAbsents     = computed(() => this.store.notes().filter(n => n.absent).length);
  readonly moyenneGlobale = computed(() => {
    const notes = this.store.notes().filter(n => !n.absent && n.valeur !== null);
    if (!notes.length) return '—';
    const avg = notes.reduce((acc, n) => acc + (n.valeur ?? 0), 0) / notes.length;
    return avg.toFixed(1);
  });

  readonly filteredNotes = computed(() => {
    let notes = this.store.notes();
    if (this.matiereFilter) notes = notes.filter(n => n.matiereLibelle === this.matiereFilter);
    if (this.statutFilter)  notes = notes.filter(n => n.statut === this.statutFilter);
    return notes;
  });

  ngOnInit() { this.store.loadNotes({}); }

  noteColor(v: number | null): string {
    if (v === null) return 'var(--text-muted)';
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
}
