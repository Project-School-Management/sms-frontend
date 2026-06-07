import { ChangeDetectionStrategy, Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AcademicStore } from '@sms/academic/data-access';

@Component({
  selector: 'sms-grades-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Notes & Évaluations</h1>
        <a routerLink="/academic/bulletins"
           class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Voir bulletins
        </a>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Total notes</p>
          <p class="text-2xl font-bold text-gray-900">{{ store.notes().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Validées</p>
          <p class="text-2xl font-bold text-green-600">{{ nbValidees() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Absents</p>
          <p class="text-2xl font-bold text-red-500">{{ nbAbsents() }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        @if (store.loading()) {
          <div class="flex items-center justify-center h-32 text-gray-500">Chargement...</div>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-4 py-3 text-gray-600 font-medium">Étudiant</th>
                <th class="text-left px-4 py-3 text-gray-600 font-medium">Matière</th>
                <th class="text-left px-4 py-3 text-gray-600 font-medium">Note /20</th>
                <th class="text-left px-4 py-3 text-gray-600 font-medium">Statut</th>
                <th class="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              @for (note of store.notes(); track note.publicId) {
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-500 text-xs">{{ note.studentPublicId }}</td>
                  <td class="px-4 py-3 font-medium">{{ note.matiereLibelle }}</td>
                  <td class="px-4 py-3">
                    @if (note.absent) {
                      <span class="text-red-500 font-medium">ABS</span>
                    } @else {
                      <span [class]="noteClass(note.valeur)">{{ note.valeur }}/20</span>
                    }
                  </td>
                  <td class="px-4 py-3">
                    <span [class]="statutClass(note.statut)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                      {{ note.statut }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-500">{{ note.createdDate | date:'dd/MM/yyyy' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
})
export class GradesListComponent implements OnInit {
  readonly store = inject(AcademicStore);

  readonly nbValidees = computed(() => this.store.notes().filter(n => n.statut === 'VALIDEE').length);
  readonly nbAbsents  = computed(() => this.store.notes().filter(n => n.absent).length);

  ngOnInit() { this.store.loadNotes({}); }

  noteClass(v: number | null): string {
    if (v === null) return 'text-gray-400';
    if (v >= 14) return 'font-bold text-green-600';
    if (v >= 10) return 'font-medium text-gray-700';
    return 'font-bold text-red-500';
  }
  statutClass(statut: string): string {
    const map: Record<string, string> = {
      VALIDEE: 'bg-green-100 text-green-700', SAISIE: 'bg-yellow-100 text-yellow-700', MODIFIEE: 'bg-blue-100 text-blue-700',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-600';
  }
}
