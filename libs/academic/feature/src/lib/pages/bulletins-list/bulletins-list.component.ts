import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AcademicStore } from '@sms/academic/data-access';

@Component({
  selector: 'sms-bulletins-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <a routerLink="/academic" class="text-blue-600 hover:underline text-sm">← Retour</a>
          <h1 class="text-2xl font-bold text-gray-900">Bulletins</h1>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Total bulletins</p>
          <p class="text-2xl font-bold text-gray-900">{{ store.bulletins().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Publiés</p>
          <p class="text-2xl font-bold text-green-600">{{ store.nbPublies() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Moyenne globale</p>
          <p class="text-2xl font-bold text-blue-600">{{ store.moyenneGlobale() }}/20</p>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Étudiant</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Promotion</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Semestre</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Moyenne</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Rang</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Statut</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            @for (b of store.filteredBulletins(); track b.publicId) {
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">{{ b.studentNom }}</td>
                <td class="px-4 py-3 text-gray-600">{{ b.promotionLibelle }}</td>
                <td class="px-4 py-3">S{{ b.semestre }}</td>
                <td class="px-4 py-3">
                  <span [class]="moyenneClass(b.moyenne)" class="font-bold">{{ b.moyenne }}/20</span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ b.rang }}</td>
                <td class="px-4 py-3">
                  <span [class]="statutClass(b.statut)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ b.statut }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <a [routerLink]="['/academic/bulletins', b.publicId]"
                     class="text-blue-600 hover:underline text-xs">Voir</a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class BulletinsListComponent implements OnInit {
  readonly store = inject(AcademicStore);

  ngOnInit() {
    this.store.loadBulletins({});
    this.store.loadPromotions();
  }

  moyenneClass(m: number): string {
    if (m >= 16) return 'text-green-600';
    if (m >= 12) return 'text-blue-600';
    if (m >= 10) return 'text-gray-700';
    return 'text-red-500';
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      PUBLIE:      'bg-green-100 text-green-700',
      GENERE:      'bg-blue-100 text-blue-700',
      EN_ATTENTE:  'bg-gray-100 text-gray-600',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-600';
  }
}
