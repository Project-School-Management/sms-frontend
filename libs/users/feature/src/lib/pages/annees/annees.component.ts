import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsersStore } from '@sms/users/data-access';

@Component({
  selector: 'sms-annees',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-2xl">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/admin" class="text-blue-600 hover:underline text-sm">← Retour</a>
        <h1 class="text-2xl font-bold text-gray-900">Années académiques</h1>
      </div>

      <div class="space-y-3">
        @for (annee of store.annees(); track annee.publicId) {
          <div class="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p class="font-semibold text-gray-900">{{ annee.libelle }}</p>
              <p class="text-sm text-gray-500">
                {{ annee.dateDebut | date:'dd/MM/yyyy' }} → {{ annee.dateFin | date:'dd/MM/yyyy' }}
              </p>
            </div>
            @if (annee.active) {
              <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class AnneesComponent implements OnInit {
  readonly store = inject(UsersStore);

  ngOnInit() {
    this.store.loadAnnees();
  }
}
