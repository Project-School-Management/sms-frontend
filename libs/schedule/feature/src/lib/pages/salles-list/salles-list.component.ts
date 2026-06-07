import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduleStore } from '@sms/schedule/data-access';

@Component({
  selector: 'sms-salles-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/schedule" class="text-blue-600 hover:underline text-sm">← Retour</a>
        <h1 class="text-2xl font-bold text-gray-900">Salles</h1>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (salle of store.salles(); track salle.publicId) {
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-gray-900">{{ salle.code }}</span>
              <span [class]="typeClass(salle.type)" class="px-2 py-0.5 rounded text-xs font-medium">{{ salle.type }}</span>
            </div>
            <p class="text-sm text-gray-600">{{ salle.libelle }}</p>
            <p class="text-xs text-gray-400 mt-1">Capacité : {{ salle.capacite }} places</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class SallesListComponent implements OnInit {
  readonly store = inject(ScheduleStore);

  ngOnInit() {
    this.store.loadSalles();
  }

  typeClass(type: string): string {
    const map: Record<string, string> = {
      AMPHI: 'bg-purple-100 text-purple-700',
      TD:    'bg-blue-100 text-blue-700',
      TP:    'bg-yellow-100 text-yellow-700',
      LABO:  'bg-green-100 text-green-700',
    };
    return map[type] ?? 'bg-gray-100 text-gray-600';
  }
}
