import { ChangeDetectionStrategy, Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StudentsStore } from '@sms/students/data-access';

@Component({
  selector: 'sms-student-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Étudiants</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Gestion des étudiants inscrits</p>
        </div>
        <a routerLink="/students/new"
           class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
           style="background: var(--accent)">
          <mat-icon style="font-size: 18px; height: 18px; width: 18px">add</mat-icon>
          Nouvel étudiant
        </a>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
            <mat-icon style="color: var(--accent)">people</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.students().length }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Total étudiants</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
            <mat-icon style="color: #16a34a">check_circle</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.actifsCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Actifs</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(107,114,128,0.1)">
            <mat-icon style="color: #6b7280">pause_circle</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.inactifsCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Inactifs</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(37,99,235,0.1)">
            <mat-icon style="color: #2563eb">workspace_premium</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ diplomeCount() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Diplômés</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 border-b flex flex-wrap items-center gap-3" style="border-color: var(--border-color)">
          <h3 class="font-semibold flex-1" style="color: var(--text-primary)">Liste des étudiants</h3>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="relative">
              <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2" style="font-size: 16px; height: 16px; width: 16px; color: var(--text-muted)">search</mat-icon>
              <input
                type="search"
                placeholder="Rechercher nom, matricule..."
                class="pl-8 pr-3 py-1.5 rounded-lg border text-sm focus:outline-none"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary); width: 220px"
                [ngModel]="store.searchQuery()"
                (ngModelChange)="store.setSearchQuery($event)"
              />
            </div>
            <select
              class="px-3 py-1.5 rounded-lg border text-sm focus:outline-none"
              style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)"
              [ngModel]="store.statutFilter()"
              (ngModelChange)="store.setStatutFilter($event)"
            >
              <option value="">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
              <option value="DIPLOME">Diplômé</option>
              <option value="EXCLUS">Exclus</option>
              <option value="TRANSFERE">Transféré</option>
            </select>
            <select
              class="px-3 py-1.5 rounded-lg border text-sm focus:outline-none"
              style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)"
              [ngModel]="classeFilter()"
              (ngModelChange)="classeFilter.set($event)"
            >
              <option value="">Toutes les promos</option>
              <option value="promo-001">L3 GL 2025</option>
              <option value="promo-002">L2 GL 2025</option>
              <option value="promo-003">M1 RI 2025</option>
              <option value="promo-004">L1 GL 2025</option>
              <option value="promo-005">M2 RI 2025</option>
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
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Matricule</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Promotion</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Genre</th>
                  <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Statut</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                @for (student of displayedStudents(); track student.publicId) {
                  <tr class="border-t hover:opacity-80 transition-opacity" style="border-color: var(--border-color)">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                             [style.background]="avatarColor(student.genre)">
                          {{ student.firstName[0] }}{{ student.lastName[0] }}
                        </div>
                        <div>
                          <p class="font-medium" style="color: var(--text-primary)">{{ student.firstName }} {{ student.lastName }}</p>
                          <p class="text-xs" style="color: var(--text-secondary)">{{ student.email ?? '—' }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 font-mono text-xs" style="color: var(--text-secondary)">{{ student.matricule }}</td>
                    <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">{{ promoLabel(student.classePublicId) }}</td>
                    <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">{{ student.genre === 'M' ? 'Masculin' : 'Féminin' }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-semibold" [ngStyle]="statutStyle(student.statut)">
                        {{ student.statut }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center gap-2 justify-end">
                        <a [routerLink]="['/students', student.publicId]"
                           class="px-2 py-1 rounded text-xs font-medium hover:opacity-80 transition-opacity"
                           style="background: var(--accent-light); color: var(--accent)">
                          Voir
                        </a>
                        <a [routerLink]="['/students', student.publicId, 'edit']"
                           class="px-2 py-1 rounded text-xs font-medium hover:opacity-80 transition-opacity"
                           style="background: var(--surface-2); color: var(--text-secondary)">
                          Modifier
                        </a>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6">
                      <div class="flex flex-col items-center justify-center py-16 gap-3">
                        <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">people_outline</mat-icon>
                        <p style="color: var(--text-secondary)">Aucun étudiant trouvé</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-5 py-3 border-t flex items-center justify-between" style="border-color: var(--border-color)">
            <p class="text-sm" style="color: var(--text-secondary)">
              {{ displayedStudents().length }} sur {{ store.filteredStudents().length }} étudiant(s)
            </p>
            <div class="flex items-center gap-1">
              <button (click)="prevPage()" [disabled]="currentPage() === 0"
                class="px-3 py-1 rounded text-xs border disabled:opacity-40"
                style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
                ← Préc.
              </button>
              <span class="px-3 py-1 text-xs" style="color: var(--text-secondary)">
                Page {{ currentPage() + 1 }} / {{ totalPages() }}
              </span>
              <button (click)="nextPage()" [disabled]="currentPage() >= totalPages() - 1"
                class="px-3 py-1 rounded text-xs border disabled:opacity-40"
                style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
                Suiv. →
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class StudentListComponent implements OnInit {
  readonly store = inject(StudentsStore);
  readonly classeFilter = signal('');
  readonly currentPage = signal(0);
  readonly pageSize = 10;

  readonly diplomeCount = computed(() => this.store.students().filter(s => s.statut === 'DIPLOME').length);

  readonly filteredByClasse = computed(() => {
    const cls = this.classeFilter();
    const students = this.store.filteredStudents();
    return cls ? students.filter(s => s.classePublicId === cls) : students;
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredByClasse().length / this.pageSize)));

  readonly displayedStudents = computed(() => {
    const page = this.currentPage();
    return this.filteredByClasse().slice(page * this.pageSize, (page + 1) * this.pageSize);
  });

  ngOnInit() {
    this.store.loadStudents({ page: 0 });
  }

  prevPage() { this.currentPage.update(p => Math.max(0, p - 1)); }
  nextPage() { this.currentPage.update(p => Math.min(this.totalPages() - 1, p + 1)); }

  avatarColor(genre: string): string {
    return genre === 'F' ? '#ec4899' : '#6366f1';
  }

  promoLabel(id?: string): string {
    const map: Record<string, string> = {
      'promo-001': 'L3 GL 2025', 'promo-002': 'L2 GL 2025',
      'promo-003': 'M1 RI 2025', 'promo-004': 'L1 GL 2025', 'promo-005': 'M2 RI 2025',
    };
    return id ? (map[id] ?? id) : '—';
  }

  statutStyle(statut: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      ACTIF:     { background: '#dcfce7', color: '#16a34a' },
      INACTIF:   { background: '#f3f4f6', color: '#6b7280' },
      DIPLOME:   { background: '#dbeafe', color: '#2563eb' },
      EXCLUS:    { background: '#fee2e2', color: '#dc2626' },
      TRANSFERE: { background: '#fef3c7', color: '#d97706' },
    };
    return map[statut] ?? { background: '#f3f4f6', color: '#6b7280' };
  }
}
