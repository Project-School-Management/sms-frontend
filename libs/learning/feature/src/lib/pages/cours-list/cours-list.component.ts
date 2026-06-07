import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LearningStore } from '@sms/learning/data-access';

@Component({
  selector: 'sms-cours-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Cours & E-learning</h1>
        <a routerLink="/learning/examens"
           class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
          Examens en ligne
        </a>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Total cours</p>
          <p class="text-2xl font-bold text-gray-900">{{ store.nbCours() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Publiés</p>
          <p class="text-2xl font-bold text-green-600">{{ store.coursPublies().length }}</p>
        </div>
      </div>

      @if (store.loading()) {
        <div class="text-gray-500">Chargement...</div>
      } @else {
        <div class="grid gap-4">
          @for (cours of store.cours(); track cours.publicId) {
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span [class]="statutClass(cours.statut)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                      {{ cours.statut }}
                    </span>
                    <span class="text-xs text-gray-400">{{ cours.matiereLibelle }}</span>
                  </div>
                  <h3 class="font-semibold text-gray-900">{{ cours.titre }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ cours.description }}</p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ cours.chapitres.length }} chapitre(s) · {{ cours.enseignantNom }}
                  </p>
                </div>
                <div class="ml-4 text-right">
                  <div class="w-24">
                    <p class="text-xs text-gray-500 mb-1">Progression</p>
                    <div class="w-full bg-gray-200 rounded-full h-1.5">
                      <div class="bg-blue-600 h-1.5 rounded-full" [style.width.%]="cours.progression"></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">{{ cours.progression }}%</p>
                  </div>
                  <a [routerLink]="['/learning', cours.publicId]"
                     class="mt-2 inline-block text-blue-600 hover:underline text-xs">Accéder</a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CoursListComponent implements OnInit {
  readonly store = inject(LearningStore);

  ngOnInit() {
    this.store.loadCours({});
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      PUBLIE:   'bg-green-100 text-green-700',
      BROUILLON:'bg-gray-100 text-gray-600',
      ARCHIVE:  'bg-red-100 text-red-600',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-600';
  }
}
