import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommunicationStore } from '@sms/communication/data-access';

type NotifFilter = 'all' | 'unread' | 'read';

@Component({
  selector: 'sms-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Notifications</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">
            {{ store.unreadNotifications().length }} non-lue(s) sur {{ store.notifications().length }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          @if (store.unreadNotifications().length > 0) {
            <button (click)="store.markAllAsRead()"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border hover:opacity-80 transition-opacity"
              style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">done_all</mat-icon>
              Tout marquer comme lu
            </button>
          }
          <a routerLink="/communication"
             class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--accent)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
            Messagerie
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 mb-4">
        @for (f of filters; track f.key) {
          <button (click)="activeFilter.set(f.key)"
            class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            [style.background]="activeFilter() === f.key ? 'var(--accent)' : 'var(--surface-2)'"
            [style.color]="activeFilter() === f.key ? '#fff' : 'var(--text-secondary)'"
            [style.border]="'1px solid ' + (activeFilter() === f.key ? 'var(--accent)' : 'var(--border-color)')">
            {{ f.label }}
            @if (f.count > 0) {
              <span class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                    [style.background]="activeFilter() === f.key ? 'rgba(255,255,255,0.25)' : 'var(--accent-light)'"
                    [style.color]="activeFilter() === f.key ? '#fff' : 'var(--accent)'">
                {{ f.count }}
              </span>
            }
          </button>
        }
      </div>

      <!-- Notification list -->
      <div class="flex flex-col gap-2">
        @for (notif of filteredNotifications(); track notif.publicId) {
          <div class="sms-card overflow-hidden transition-all hover:opacity-80"
               [style.border-left]="!notif.lue ? '3px solid var(--accent)' : '3px solid transparent'">
            <div class="p-4 flex items-start gap-3">
              <!-- Type icon -->
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   [style.background]="typeStyle(notif.type).bg">
                <mat-icon [style.color]="typeStyle(notif.type).color" style="font-size: 20px; height: 20px; width: 20px">
                  {{ typeIcon(notif.type) }}
                </mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-sm font-semibold" style="color: var(--text-primary)">{{ notif.titre }}</p>
                  <div class="flex items-center gap-2 shrink-0">
                    @if (!notif.lue) {
                      <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: var(--accent)"></span>
                    }
                    <p class="text-xs whitespace-nowrap" style="color: var(--text-muted)">
                      {{ notif.createdAt | date:'dd/MM HH:mm' }}
                    </p>
                  </div>
                </div>
                <p class="text-sm mt-0.5" style="color: var(--text-secondary)">{{ notif.contenu }}</p>
                @if (notif.actionUrl) {
                  <a [routerLink]="notif.actionUrl" class="text-xs font-medium mt-1 inline-block hover:underline" style="color: var(--accent)">
                    Voir le détail →
                  </a>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">notifications_none</mat-icon>
            <p style="color: var(--text-secondary)">Aucune notification</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  readonly store = inject(CommunicationStore);
  readonly activeFilter = signal<NotifFilter>('all');

  readonly filters = computed(() => [
    { key: 'all' as NotifFilter,    label: 'Toutes',    count: this.store.notifications().length },
    { key: 'unread' as NotifFilter, label: 'Non lues',  count: this.store.unreadNotifications().length },
    { key: 'read' as NotifFilter,   label: 'Lues',      count: this.store.notifications().length - this.store.unreadNotifications().length },
  ]);

  ngOnInit() {
    this.store.loadNotifications();
  }

  filteredNotifications() {
    const all = this.store.notifications();
    if (this.activeFilter() === 'unread') return all.filter(n => !n.lue);
    if (this.activeFilter() === 'read')   return all.filter(n => n.lue);
    return all;
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      BULLETIN: 'description', PAIEMENT: 'payments', SEANCE: 'event',
      NOTE: 'grade', INSCRIPTION: 'how_to_reg', SYSTEME: 'settings',
    };
    return map[type] ?? 'notifications';
  }

  typeStyle(type: string): { bg: string; color: string } {
    const map: Record<string, { bg: string; color: string }> = {
      BULLETIN:    { bg: 'rgba(37,99,235,0.1)',  color: '#2563eb' },
      PAIEMENT:    { bg: 'rgba(22,163,74,0.1)',  color: '#16a34a' },
      SEANCE:      { bg: 'rgba(217,119,6,0.1)',  color: '#d97706' },
      NOTE:        { bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
      INSCRIPTION: { bg: 'rgba(8,145,178,0.1)',  color: '#0891b2' },
      SYSTEME:     { bg: 'rgba(107,114,128,0.1)',color: '#6b7280' },
    };
    return map[type] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' };
  }
}
