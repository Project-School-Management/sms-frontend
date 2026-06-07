import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LearningStore } from '@sms/learning/data-access';

@Component({
  selector: 'sms-cours-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/learning" class="text-blue-600 hover:underline text-sm">← Retour</a>
        <h1 class="text-2xl font-bold text-gray-900">Cours</h1>
      </div>

      @if (store.loading()) {
        <div class="text-gray-500">Chargement...</div>
      }

      @if (store.selectedCours(); as c) {
        <div class="space-y-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <span class="text-sm text-blue-600 font-medium">{{ c.matiereLibelle }}</span>
            <h2 class="text-xl font-bold text-gray-900 mt-1">{{ c.titre }}</h2>
            <p class="text-gray-600 mt-2">{{ c.description }}</p>
            <div class="flex items-center gap-4 mt-4">
              <p class="text-sm text-gray-500">{{ c.enseignantNom }}</p>
              <div class="flex-1">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="c.progression"></div>
                </div>
                <p class="text-xs text-gray-400 mt-0.5">{{ c.progression }}% complété</p>
              </div>
            </div>
          </div>

          @for (chap of c.chapitres; track chap.publicId) {
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 class="font-semibold text-gray-900">Chapitre {{ chap.ordre }} — {{ chap.titre }}</h3>
              </div>
              <div class="divide-y divide-gray-100">
                @for (res of chap.ressources; track res.publicId) {
                  <div class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                    <span class="w-8 h-8 rounded flex items-center justify-center text-sm bg-gray-100">
                      {{ typeEmoji(res.type) }}
                    </span>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">{{ res.titre }}</p>
                      <p class="text-xs text-gray-400">{{ res.type }}</p>
                    </div>
                    @if (res.vue) {
                      <span class="text-xs text-green-600 font-medium">✓ Vu</span>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CoursDetailComponent implements OnInit {
  readonly store = inject(LearningStore);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.loadCour(id);
  }

  typeEmoji(type: string): string {
    const map: Record<string, string> = { PDF: '📄', VIDEO: '🎬', LIEN: '🔗', IMAGE: '🖼️' };
    return map[type] ?? '📁';
  }
}
