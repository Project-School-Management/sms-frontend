import {
  ChangeDetectionStrategy, Component, OnInit,
  inject, signal, computed, input, output,
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
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.scss',
})
export class NotificationPanelComponent implements OnInit {
  // ── Modern signal-based I/O ───────────────────────────────────────────────
  readonly open = input<boolean>(false);
  readonly closePanel = output<void>();

  readonly svc = inject(NotificationService);
  private readonly router = inject(Router);

  readonly activeTab = signal<PanelTab>('all');

  /** Onglets avec compteurs réels dérivés du store de notifications. */
  readonly tabs = computed(() => [
    { key: 'all'      as PanelTab, label: 'Tout',      count: 0 },
    { key: 'unread'   as PanelTab, label: 'Non lues',  count: this.svc.unreadCount() },
    { key: 'read'     as PanelTab, label: 'Lues',      count: this.svc.read().length },
    { key: 'archived' as PanelTab, label: 'Archivées', count: this.svc.archived().length },
  ]);

  readonly displayed = computed(() => {
    switch (this.activeTab()) {
      case 'unread':   return this.svc.unread();
      case 'read':     return this.svc.read();
      case 'archived': return this.svc.archived();
      default:         return this.svc.all().filter(n => !n.archived);
    }
  });

  readonly emptyLabel = computed(() => {
    switch (this.activeTab()) {
      case 'unread':   return 'Aucune notification non lue';
      case 'read':     return 'Aucune notification lue';
      case 'archived': return 'Aucune notification archivée';
      default:         return 'Aucune notification';
    }
  });

  ngOnInit(): void {
    this.svc.init();
  }

  close(): void {
    this.closePanel.emit();
  }

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
