import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduleStore } from '@sms/schedule/data-access';

@Component({
  selector: 'sms-seances-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/schedule" class="text-blue-600 hover:underline text-sm">← Retour</a>
        <h1 class="text-2xl font-bold text-gray-900">Séances</h1>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Total séances</p>
          <p class="text-2xl font-bold text-gray-900">{{ store.seances().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Annulées</p>
          <p class="text-2xl font-bold text-red-500">{{ store.annuleesCount() }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Créneau</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Statut</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Motif</th>
            </tr>
          </thead>
          <tbody>
            @for (s of store.seances(); track s.publicId) {
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-500 text-xs">{{ s.timeSlotPublicId }}</td>
                <td class="px-4 py-3">{{ s.date | date:'dd/MM/yyyy' }}</td>
                <td class="px-4 py-3">
                  <span [class]="statutClass(s.statut)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ s.statut }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ s.motifAnnulation ?? '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class SeancesListComponent implements OnInit {
  readonly store = inject(ScheduleStore);

  ngOnInit() {
    this.store.loadSeances();
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      PLANIFIEE:  'bg-blue-100 text-blue-700',
      EFFECTUEE:  'bg-green-100 text-green-700',
      ANNULEE:    'bg-red-100 text-red-700',
      REPORTEE:   'bg-yellow-100 text-yellow-700',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-600';
  }
}
