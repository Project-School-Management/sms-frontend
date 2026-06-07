import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommunicationStore } from '@sms/communication/data-access';

@Component({
  selector: 'sms-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <a routerLink="/communication" class="text-blue-600 hover:underline text-sm">← Retour</a>
          <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>
        @if (store.unreadNotifications().length > 0) {
          <button (click)="store.markAllAsRead()"
            class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            Tout marquer comme lu
          </button>
        }
      </div>

      <div class="space-y-2">
        @for (notif of store.notifications(); track notif.publicId) {
          <div [class]="notif.lue ? 'bg-white' : 'bg-blue-50 border-l-4 border-l-blue-500'"
               class="rounded-lg border border-gray-200 p-4">
            <div class="flex items-start gap-3">
              <span [class]="typeColor(notif.type)" class="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">
                {{ typeEmoji(notif.type) }}
              </span>
              <div class="flex-1">
                <p class="font-medium text-gray-900 text-sm">{{ notif.titre }}</p>
                <p class="text-sm text-gray-600 mt-0.5">{{ notif.contenu }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ notif.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              @if (!notif.lue) {
                <span class="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0"></span>
              }
            </div>
          </div>
        } @empty {
          <div class="text-center py-12 text-gray-400">Aucune notification</div>
        }
      </div>
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  readonly store = inject(CommunicationStore);

  ngOnInit() {
    this.store.loadNotifications();
  }

  typeColor(type: string): string {
    const map: Record<string, string> = {
      BULLETIN:    'bg-blue-100',
      PAIEMENT:    'bg-green-100',
      SEANCE:      'bg-yellow-100',
      NOTE:        'bg-purple-100',
      INSCRIPTION: 'bg-indigo-100',
      SYSTEME:     'bg-gray-100',
    };
    return map[type] ?? 'bg-gray-100';
  }

  typeEmoji(type: string): string {
    const map: Record<string, string> = {
      BULLETIN: '📋', PAIEMENT: '💰', SEANCE: '📅', NOTE: '📝', INSCRIPTION: '✅', SYSTEME: '🔔',
    };
    return map[type] ?? '🔔';
  }
}
