import {
  ChangeDetectionStrategy, Component, EventEmitter, HostListener,
  Input, OnInit, Output, inject, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from './notification.service';
import { INotification } from './notification.model';

type PanelTab = 'all' | 'unread' | 'read' | 'archived';

@Component({
  selector: 'sms-notification-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  styles: [`
    .panel-enter { animation: slideDown 0.2s ease-out; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .notif-row:hover .notif-actions { opacity: 1; }
    .notif-actions { opacity: 0; transition: opacity 0.15s; }
  `],
  template: `
    @if (open) {
      <!-- Overlay semi-transparent -->
      <div class="fixed inset-0 z-40" style="background: rgba(0,0,0,0.15)"
           (click)="close()"></div>

      <!-- Panel -->
      <div class="fixed top-14 right-4 z-50 panel-enter"
           style="width: 380px; max-height: 520px; display: flex; flex-direction: column;
                  background: var(--surface-1); border: 1px solid var(--border-color);
                  border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); overflow: hidden;"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b"
             style="border-color: var(--border-color); flex-shrink: 0">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm" style="color: var(--text-primary)">Notifications</span>
            @if (svc.unreadCount() > 0) {
              <span class="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
                    style="background: #ef4444; min-width: 20px; text-align: center">
                {{ svc.unreadCount() }}
              </span>
            }
          </div>
          <div class="flex items-center gap-1">
            @if (svc.unreadCount() > 0) {
              <button (click)="svc.markAllAsRead()"
                class="text-xs px-2 py-1 rounded-md hover:opacity-80 transition-opacity"
                style="color: var(--accent); background: var(--accent-light)">
                Tout marquer lu
              </button>
            }
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b px-3 pt-2 gap-1" style="border-color: var(--border-color); flex-shrink: 0">
          @for (tab of tabs; track tab.key) {
            <button (click)="activeTab.set(tab.key)"
              class="px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors relative"
              [style.color]="activeTab() === tab.key ? 'var(--accent)' : 'var(--text-secondary)'"
              [style.border-bottom]="activeTab() === tab.key ? '2px solid var(--accent)' : '2px solid transparent'">
              {{ tab.label }}
              @if (tab.count > 0) {
                <span class="ml-1 px-1 rounded-full text-xs"
                      style="background: rgba(239,68,68,0.12); color: #dc2626">
                  {{ tab.count }}
                </span>
              }
            </button>
          }
        </div>

        <!-- List -->
        <div style="flex: 1; overflow-y: auto">
          @for (n of displayed(); track n.id) {
            <div class="notif-row flex items-start gap-3 px-4 py-3 border-b transition-colors cursor-pointer relative"
                 [style.background]="!n.read ? n.colorBg : 'transparent'"
                 style="border-color: var(--border-color)"
                 (click)="onNotifClick(n)">
              <!-- Icon -->
              <div class="rounded-full flex items-center justify-center shrink-0"
                   style="width: 36px; height: 36px"
                   [style.background]="n.colorBg">
                <mat-icon [style.color]="n.color" style="font-size: 18px; height: 18px; width: 18px">
                  {{ n.icon }}
                </mat-icon>
              </div>
              <!-- Content -->
              <div style="flex: 1; min-width: 0">
                <p class="text-xs font-semibold truncate"
                   [style.color]="n.read ? 'var(--text-secondary)' : 'var(--text-primary)'">
                  {{ n.title }}
                </p>
                <p class="text-xs mt-0.5" style="color: var(--text-secondary);
                   display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden">
                  {{ n.message }}
                </p>
                <p class="text-xs mt-1" style="color: var(--text-muted)">{{ timeAgo(n.createdAt) }}</p>
              </div>
              <!-- Unread dot -->
              @if (!n.read) {
                <div class="shrink-0 mt-1.5 w-2 h-2 rounded-full" style="background: #ef4444"></div>
              }
              <!-- Hover actions -->
              <div class="notif-actions absolute right-2 top-2 flex gap-1">
                @if (!n.read) {
                  <button (click)="markRead($event, n.id)"
                    class="p-1 rounded-md hover:opacity-80"
                    style="background: var(--surface-2); color: var(--text-muted)"
                    title="Marquer comme lu">
                    <mat-icon style="font-size: 13px; height: 13px; width: 13px">check</mat-icon>
                  </button>
                }
                <button (click)="archiveItem($event, n.id)"
                  class="p-1 rounded-md hover:opacity-80"
                  style="background: var(--surface-2); color: var(--text-muted)"
                  title="Archiver">
                  <mat-icon style="font-size: 13px; height: 13px; width: 13px">archive</mat-icon>
                </button>
              </div>
            </div>
          } @empty {
            <div class="flex flex-col items-center justify-center py-10 gap-2">
              <mat-icon style="font-size: 40px; height: 40px; width: 40px; color: var(--text-muted)">
                notifications_none
              </mat-icon>
              <p class="text-xs" style="color: var(--text-secondary)">Aucune notification</p>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-4 py-2.5 text-center border-t" style="border-color: var(--border-color); flex-shrink: 0">
          <button (click)="goHistory()"
            class="text-xs font-medium hover:underline"
            style="color: var(--accent)">
            Voir tout l'historique →
          </button>
        </div>
      </div>
    }
  `,
})
export class NotificationPanelComponent implements OnInit {
  @Input()  open = false;
  @Output() closePanel = new EventEmitter<void>();

  readonly svc = inject(NotificationService);
  private router = inject(Router);

  readonly activeTab = signal<PanelTab>('all');

  readonly tabs = computed(() => [
    { key: 'all'      as PanelTab, label: 'Tout',       count: 0 },
    { key: 'unread'   as PanelTab, label: 'Non lues',   count: this.svc.unreadCount() },
    { key: 'read'     as PanelTab, label: 'Lues',       count: 0 },
    { key: 'archived' as PanelTab, label: 'Archivées',  count: 0 },
  ]);

  readonly displayed = computed(() => {
    switch (this.activeTab()) {
      case 'unread':   return this.svc.unread();
      case 'read':     return this.svc.read();
      case 'archived': return this.svc.archived();
      default:         return this.svc.all().filter(n => !n.archived);
    }
  });

  ngOnInit(): void {
    this.svc.init();
  }

  close(): void { this.closePanel.emit(); }

  onNotifClick(n: INotification): void {
    this.svc.markAsRead(n.id);
    if (n.route) {
      this.router.navigateByUrl(n.route);
      this.close();
    }
  }

  markRead(event: Event, id: string): void {
    event.stopPropagation();
    this.svc.markAsRead(id);
  }

  archiveItem(event: Event, id: string): void {
    event.stopPropagation();
    this.svc.archive(id);
  }

  goHistory(): void {
    this.router.navigateByUrl('/communication/notifications');
    this.close();
  }

  timeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60)    return `Il y a ${diff}s`;
    if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return `Il y a ${Math.floor(diff / 86400)}j`;
  }
}
