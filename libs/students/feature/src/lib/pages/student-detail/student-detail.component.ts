import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { StudentsStore } from '@sms/students/data-access';

@Component({
  selector: 'sms-student-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/students" class="text-blue-600 hover:underline text-sm">← Retour</a>
        <h1 class="text-2xl font-bold text-gray-900">Fiche étudiant</h1>
      </div>

      @if (store.loading()) {
        <div class="text-gray-500">Chargement...</div>
      }

      @if (store.selectedStudent(); as s) {
        <div class="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {{ s.firstName[0] }}{{ s.lastName[0] }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">{{ s.firstName }} {{ s.lastName }}</h2>
              <p class="text-sm text-gray-500 font-mono">{{ s.matricule }}</p>
              <span [class]="statutClass(s.statut)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ s.statut }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 uppercase mb-1">Date de naissance</p>
              <p class="text-sm font-medium">{{ s.dateNaissance | date:'dd/MM/yyyy' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase mb-1">Genre</p>
              <p class="text-sm font-medium">{{ s.genre === 'M' ? 'Masculin' : 'Féminin' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase mb-1">Email</p>
              <p class="text-sm font-medium">{{ s.email ?? '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase mb-1">Téléphone</p>
              <p class="text-sm font-medium">{{ s.phone ?? '—' }}</p>
            </div>
          </div>

          <div class="flex gap-3 pt-4 border-t border-gray-100">
            <a routerLink="/finance" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Voir factures</a>
            <a routerLink="/academic" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Voir notes</a>
          </div>
        </div>
      }
    </div>
  `,
})
export class StudentDetailComponent implements OnInit {
  readonly store = inject(StudentsStore);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.loadStudent(id);
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      ACTIF: 'bg-green-100 text-green-700', INACTIF: 'bg-gray-100 text-gray-600',
      DIPLOME: 'bg-blue-100 text-blue-700', EXCLUS: 'bg-red-100 text-red-700',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-600';
  }
}
