import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScheduleStore } from '@sms/schedule/data-access';

const JOURS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];

@Component({
  selector: 'sms-schedule-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Emploi du temps</h1>
        <div class="flex gap-2">
          <a routerLink="/schedule/seances" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Séances</a>
          <a routerLink="/schedule/salles" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Salles</a>
        </div>
      </div>

      <!-- Filter by day -->
      <div class="flex gap-2 mb-6 flex-wrap">
        <button (click)="store.setJourFilter('')"
          [class]="store.jourFilter() === '' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'"
          class="px-3 py-1.5 rounded-lg text-sm font-medium">
          Tous
        </button>
        @for (jour of jours; track jour) {
          <button (click)="store.setJourFilter(jour)"
            [class]="store.jourFilter() === jour ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium">
            {{ jour }}
          </button>
        }
      </div>

      <!-- Timetable grid -->
      @if (store.loading()) {
        <div class="text-gray-500">Chargement...</div>
      } @else {
        <div class="space-y-3">
          @for (slot of store.filteredSlots(); track slot.publicId) {
            <div class="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
              <div class="w-20 text-center">
                <p class="text-xs font-bold text-blue-600 uppercase">{{ slot.jour }}</p>
                <p class="text-sm font-medium">{{ slot.heureDebut }}</p>
                <p class="text-xs text-gray-400">{{ slot.heureFin }}</p>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ slot.matiereLibelle }}</p>
                <p class="text-sm text-gray-500">{{ slot.promotionLibelle }}</p>
              </div>
              <div class="text-right text-sm">
                <p class="font-medium text-gray-700">{{ slot.salleLibelle }}</p>
                <p class="text-gray-500 text-xs">{{ slot.enseignantNom }}</p>
              </div>
            </div>
          } @empty {
            <div class="text-center py-8 text-gray-400">Aucun créneau trouvé</div>
          }
        </div>
      }
    </div>
  `,
})
export class ScheduleViewComponent implements OnInit {
  readonly store = inject(ScheduleStore);
  readonly jours = JOURS;

  ngOnInit() {
    this.store.loadTimeSlots({});
  }
}
