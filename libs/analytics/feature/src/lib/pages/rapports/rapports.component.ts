import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsStore } from '@sms/analytics/data-access';

@Component({
  selector: 'sms-rapports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/analytics" class="text-blue-600 hover:underline text-sm">← Retour</a>
        <h1 class="text-2xl font-bold text-gray-900">Rapports générés</h1>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Type</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Format</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Statut</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            @for (r of store.rapports(); track r.publicId) {
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">{{ r.type }}</td>
                <td class="px-4 py-3">
                  <span [class]="r.format === 'PDF' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
                        class="px-2 py-0.5 rounded text-xs font-medium">
                    {{ r.format }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span [class]="statutClass(r.statut)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ r.statut }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ r.createdAt | date:'dd/MM/yyyy' }}</td>
                <td class="px-4 py-3 text-right">
                  @if (r.downloadUrl && r.statut === 'TERMINE') {
                    <a [href]="r.downloadUrl" class="text-blue-600 hover:underline text-xs">Télécharger</a>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class RapportsComponent implements OnInit {
  readonly store = inject(AnalyticsStore);

  ngOnInit() {
    this.store.loadRapports();
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      TERMINE:  'bg-green-100 text-green-700',
      EN_COURS: 'bg-yellow-100 text-yellow-700',
      ERREUR:   'bg-red-100 text-red-700',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-600';
  }
}
