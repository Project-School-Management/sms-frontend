import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersStore } from '@sms/users/data-access';

const ROLES = ['', 'ADMIN', 'DIR', 'SECRETARIAT', 'COMPTABLE', 'ENSEIGNANT', 'ELEVE', 'PARENT'];

@Component({
  selector: 'sms-users-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <div class="flex gap-2">
          <a routerLink="/admin/annees" class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Années académiques
          </a>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Total utilisateurs</p>
          <p class="text-2xl font-bold text-gray-900">{{ store.users().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Actifs</p>
          <p class="text-2xl font-bold text-green-600">{{ store.activeCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500">Filtre actuel</p>
          <p class="text-2xl font-bold text-blue-600">{{ store.roleFilter() || 'Tous' }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 mb-4 flex-wrap">
        @for (role of roles; track role) {
          <button (click)="store.setRoleFilter(role)"
            [class]="store.roleFilter() === role ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium">
            {{ role || 'Tous' }}
          </button>
        }
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Nom</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Rôles</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">2FA</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            @for (user of store.filteredUsers(); track user.publicId) {
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">{{ user.firstName }} {{ user.lastName }}</td>
                <td class="px-4 py-3 text-gray-500">{{ user.email }}</td>
                <td class="px-4 py-3">
                  @for (role of user.authorities; track role) {
                    <span class="mr-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{{ role }}</span>
                  }
                </td>
                <td class="px-4 py-3">
                  <span [class]="user.twoFaEnabled ? 'text-green-600' : 'text-gray-400'" class="text-xs font-medium">
                    {{ user.twoFaEnabled ? '✓ Actif' : '—' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span [class]="user.activated ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                        class="px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ user.activated ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class UsersListComponent implements OnInit {
  readonly store = inject(UsersStore);
  readonly roles = ROLES;

  ngOnInit() {
    this.store.loadUsers();
  }
}
