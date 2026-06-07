import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LearningStore } from '@sms/learning/data-access';

@Component({
  selector: 'sms-examens-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/learning" class="text-blue-600 hover:underline text-sm">← Retour</a>
        <h1 class="text-2xl font-bold text-gray-900">Examens en ligne</h1>
      </div>

      @if (store.loading()) {
        <div class="text-gray-500">Chargement...</div>
      } @else {
        <div class="grid gap-4">
          @for (exam of store.examens(); track exam.publicId) {
            <div class="bg-white rounded-lg border border-gray-200 p-5">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ exam.titre }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ exam.matiereLibelle }}</p>
                  <div class="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span>⏱ {{ exam.dureeMinutes }} min</span>
                    <span>{{ exam.questions.length }} question(s)</span>
                    <span>📅 {{ exam.dateDebut | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                </div>
                <button
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Démarrer
                </button>
              </div>
            </div>
          } @empty {
            <div class="text-center py-8 text-gray-400">Aucun examen disponible</div>
          }
        </div>
      }
    </div>
  `,
})
export class ExamensListComponent implements OnInit {
  readonly store = inject(LearningStore);

  ngOnInit() {
    this.store.loadExamens();
  }
}
