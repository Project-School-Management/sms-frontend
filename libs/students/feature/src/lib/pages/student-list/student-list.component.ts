import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentsStore } from '@sms/students/data-access';

@Component({
  selector: 'sms-student-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Étudiants</h1>
        <a routerLink="/students/new"
           class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Nouvel étudiant
        </a>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Total</p>
          <p class="text-2xl font-bold text-gray-900">{{ store.students().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Actifs</p>
          <p class="text-2xl font-bold text-green-600">{{ store.actifsCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Inactifs</p>
          <p class="text-2xl font-bold text-gray-400">{{ store.inactifsCount() }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-3 mb-4">
        <input
          type="search"
          placeholder="Rechercher par nom, matricule..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          [ngModel]="store.searchQuery()"
          (ngModelChange)="store.setSearchQuery($event)"
        />
        <select
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          [ngModel]="store.statutFilter()"
          (ngModelChange)="store.setStatutFilter($event)"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
          <option value="DIPLOME">Diplômé</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        @if (store.loading()) {
          <div class="flex items-center justify-center h-32 text-gray-500">Chargement...</div>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-4 py-3 text-gray-600 font-medium">Matricule</th>
                <th class="text-left px-4 py-3 text-gray-600 font-medium">Nom</th>
                <th class="text-left px-4 py-3 text-gray-600 font-medium">Prénom</th>
                <th class="text-left px-4 py-3 text-gray-600 font-medium">Genre</th>
                <th class="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                <th class="text-left px-4 py-3 text-gray-600 font-medium">Statut</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (student of store.filteredStudents(); track student.publicId) {
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ student.matricule }}</td>
                  <td class="px-4 py-3 font-medium">{{ student.lastName }}</td>
                  <td class="px-4 py-3">{{ student.firstName }}</td>
                  <td class="px-4 py-3">{{ student.genre === 'M' ? 'Masculin' : 'Féminin' }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ student.email ?? '—' }}</td>
                  <td class="px-4 py-3">
                    <span [class]="statutClass(student.statut)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                      {{ student.statut }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <a [routerLink]="['/students', student.publicId]"
                       class="text-blue-600 hover:underline text-xs">Voir</a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-400">Aucun étudiant trouvé</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
})
export class StudentListComponent implements OnInit {
  readonly store = inject(StudentsStore);

  ngOnInit() {
    this.store.loadStudents({ page: 0 });
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      ACTIF:     'bg-green-100 text-green-700',
      INACTIF:   'bg-gray-100 text-gray-600',
      DIPLOME:   'bg-blue-100 text-blue-700',
      EXCLUS:    'bg-red-100 text-red-700',
      TRANSFERE: 'bg-yellow-100 text-yellow-700',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-600';
  }
}
