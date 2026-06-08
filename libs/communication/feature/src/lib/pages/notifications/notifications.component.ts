import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService, SkeletonComponent, INotification } from '@sms/shared/ui';

type Tab = 'all' | 'unread' | 'read' | 'archived';

interface TabDef { key: Tab; label: string; icon: string; count: number; }

const PRIORITY_CONFIG = {
  high:   { label: 'Haute',   bg: 'rgba(239,68,68,0.10)',   color: '#dc2626' },
  medium: { label: 'Moyenne', bg: 'rgba(245,158,11,0.10)',  color: '#d97706' },
  low:    { label: 'Basse',   bg: 'rgba(107,114,128,0.10)', color: '#6b7280' },
};

@Component({
  selector: 'sms-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule, SkeletonComponent],
  styles: [`
    .notif-row:hover .row-actions { opacity: 1; }
    .row-actions { opacity: 0; transition: opacity 0.15s; }
    @media (hover: none) { .row-actions { opacity: 1; } }
  `],
  template: `
<div class="p-6 max-w-4xl mx-auto">

  <!-- ── Header ── -->
  <div class="flex items-start justify-between gap-4 mb-6 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Centre de notifications</h1>
      <p class="text-sm mt-0.5" style="color: var(--text-secondary)">
        @if (svc.unreadCount() > 0) {
          <span class="font-semibold" style="color: var(--accent)">{{ svc.unreadCount() }} non lue(s)</span>
          &nbsp;· {{ svc.all().length }} au total
        } @else {
          Toutes les notifications ont été lues
        }
      </p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      @if (svc.unreadCount() > 0) {
        <button (click)="svc.markAllAsRead()"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border hover:opacity-80 transition-opacity"
          style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">done_all</mat-icon>
          Tout marquer lu
        </button>
      }
      @if (svc.unread().length > 0) {
        <button (click)="svc.archiveAll()"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border hover:opacity-80 transition-opacity"
          style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">archive</mat-icon>
          Tout archiver
        </button>
      }
      <a routerLink="/communication"
         class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--accent)">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
        Messagerie
      </a>
    </div>
  </div>

  <!-- ── KPI Cards ── -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
           style="background: var(--accent-light)">
        <mat-icon style="color: var(--accent); font-size: 18px; height: 18px; width: 18px">notifications</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color: var(--text-primary)">{{ svc.all().length }}</p>
        <p class="text-xs" style="color: var(--text-secondary)">Total</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
           style="background: rgba(239,68,68,0.10)">
        <mat-icon style="color: #ef4444; font-size: 18px; height: 18px; width: 18px">mark_email_unread</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color: var(--text-primary)">{{ svc.unreadCount() }}</p>
        <p class="text-xs" style="color: var(--text-secondary)">Non lues</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
           style="background: rgba(22,163,74,0.10)">
        <mat-icon style="color: #16a34a; font-size: 18px; height: 18px; width: 18px">mark_email_read</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color: var(--text-primary)">{{ svc.read().length }}</p>
        <p class="text-xs" style="color: var(--text-secondary)">Lues</p>
      </div>
    </div>
    <div class="sms-card p-4 flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
           style="background: rgba(107,114,128,0.10)">
        <mat-icon style="color: #6b7280; font-size: 18px; height: 18px; width: 18px">inventory_2</mat-icon>
      </div>
      <div>
        <p class="text-xl font-bold" style="color: var(--text-primary)">{{ svc.archived().length }}</p>
        <p class="text-xs" style="color: var(--text-secondary)">Archivées</p>
      </div>
    </div>
  </div>

  <!-- ── Tab bar ── -->
  <div class="flex gap-1 mb-4 p-1 rounded-xl w-fit" style="background: var(--surface-2)">
    @for (tab of tabs(); track tab.key) {
      <button (click)="activeTab.set(tab.key)"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        [style.background]="activeTab() === tab.key ? 'var(--surface-1)' : 'transparent'"
        [style.color]="activeTab() === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)'"
        [style.box-shadow]="activeTab() === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'">
        <mat-icon style="font-size: 15px; height: 15px; width: 15px">{{ tab.icon }}</mat-icon>
        {{ tab.label }}
        @if (tab.count > 0) {
          <span class="px-1.5 py-0.5 rounded-full text-xs font-bold"
                [style.background]="activeTab() === tab.key ? '#ef4444' : 'rgba(239,68,68,0.12)'"
                [style.color]="activeTab() === tab.key ? '#fff' : '#dc2626'">
            {{ tab.count }}
          </span>
        }
      </button>
    }
  </div>

  <!-- ── Skeleton Loader ── -->
  @if (loading()) {
    <div class="flex flex-col gap-3">
      @for (i of [1,2,3,4,5]; track i) {
        <div class="sms-card p-5 flex items-start gap-4">
          <sms-skeleton width="44px" height="44px" radius="12px" />
          <div class="flex-1 flex flex-col gap-2 pt-1">
            <div class="flex items-center gap-3">
              <sms-skeleton width="180px" height="14px" />
              <sms-skeleton width="60px"  height="18px" radius="9px" />
              <sms-skeleton width="70px"  height="18px" radius="9px" />
            </div>
            <sms-skeleton width="90%" height="12px" />
            <sms-skeleton width="40%" height="12px" />
          </div>
        </div>
      }
    </div>
  }

  <!-- ── Notification list ── -->
  @if (!loading()) {
    <div class="flex flex-col gap-2">
      @for (n of displayed(); track n.id) {
        <div class="notif-row sms-card overflow-hidden transition-all"
             [style.border-left]="!n.read ? '3px solid var(--accent)' : '3px solid transparent'">
          <div class="p-4 flex items-start gap-4 relative">

            <!-- Type icon -->
            <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                 [style.background]="n.colorBg">
              <mat-icon [style.color]="n.color" style="font-size: 20px; height: 20px; width: 20px">
                {{ n.icon }}
              </mat-icon>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="text-sm font-semibold"
                     [style.color]="n.read ? 'var(--text-secondary)' : 'var(--text-primary)'">
                    {{ n.title }}
                  </p>
                  @if (!n.read) {
                    <span class="w-2 h-2 rounded-full shrink-0" style="background: #ef4444"></span>
                  }
                  <!-- Priority badge -->
                  <span class="px-1.5 py-0.5 rounded text-xs font-medium"
                        [style.background]="priorityCfg(n.priority).bg"
                        [style.color]="priorityCfg(n.priority).color">
                    {{ priorityCfg(n.priority).label }}
                  </span>
                  <!-- Type badge -->
                  <span class="px-1.5 py-0.5 rounded text-xs font-medium"
                        [style.background]="n.colorBg"
                        [style.color]="n.color">
                    {{ n.type }}
                  </span>
                </div>
                <p class="text-xs whitespace-nowrap shrink-0" style="color: var(--text-muted)">
                  {{ timeAgo(n.createdAt) }}
                </p>
              </div>

              <p class="text-sm mt-1 leading-relaxed" style="color: var(--text-secondary)">
                {{ n.message }}
              </p>

              @if (n.route) {
                <button (click)="navigate(n)"
                  class="text-xs font-medium mt-1.5 hover:underline"
                  style="color: var(--accent)">
                  Voir le détail →
                </button>
              }
            </div>

            <!-- Hover action buttons -->
            <div class="row-actions absolute right-3 top-3 flex items-center gap-1">
              @if (!n.read) {
                <button (click)="svc.markAsRead(n.id)"
                  class="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                  style="background: var(--surface-2); color: var(--text-muted)"
                  title="Marquer comme lu">
                  <mat-icon style="font-size: 14px; height: 14px; width: 14px">check</mat-icon>
                </button>
              }
              @if (!n.archived) {
                <button (click)="svc.archive(n.id)"
                  class="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                  style="background: var(--surface-2); color: var(--text-muted)"
                  title="Archiver">
                  <mat-icon style="font-size: 14px; height: 14px; width: 14px">archive</mat-icon>
                </button>
              }
              <button (click)="svc.delete(n.id)"
                class="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                style="background: rgba(239,68,68,0.08); color: #dc2626"
                title="Supprimer">
                <mat-icon style="font-size: 14px; height: 14px; width: 14px">delete_outline</mat-icon>
              </button>
            </div>
          </div>
        </div>

      } @empty {
        <!-- ── Empty State ── -->
        <div class="sms-card flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-20 h-20 rounded-full flex items-center justify-center"
               style="background: var(--surface-2)">
            <mat-icon style="font-size: 40px; height: 40px; width: 40px; color: var(--text-muted)">
              {{ emptyIcon() }}
            </mat-icon>
          </div>
          <div class="text-center">
            <p class="font-semibold" style="color: var(--text-primary)">{{ emptyTitle() }}</p>
            <p class="text-sm mt-1" style="color: var(--text-secondary)">{{ emptyMessage() }}</p>
          </div>
          @if (activeTab() !== 'all') {
            <button (click)="activeTab.set('all')"
              class="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
              style="background: var(--accent-light); color: var(--accent)">
              Voir toutes les notifications
            </button>
          }
        </div>
      }
    </div>
  }

</div>
  `,
})
export class NotificationsComponent implements OnInit {
  readonly svc = inject(NotificationService);
  private readonly router = inject(Router);

  readonly activeTab = signal<Tab>('all');
  readonly loading   = signal(true);

  readonly tabs = computed<TabDef[]>(() => [
    { key: 'all',      label: 'Toutes',    icon: 'notifications',      count: 0 },
    { key: 'unread',   label: 'Non lues',  icon: 'mark_email_unread',  count: this.svc.unreadCount() },
    { key: 'read',     label: 'Lues',      icon: 'mark_email_read',    count: 0 },
    { key: 'archived', label: 'Archivées', icon: 'inventory_2',        count: this.svc.archived().length },
  ]);

  readonly displayed = computed<INotification[]>(() => {
    switch (this.activeTab()) {
      case 'unread':   return this.svc.unread();
      case 'read':     return this.svc.read();
      case 'archived': return this.svc.archived();
      default:         return this.svc.all().filter(n => !n.archived);
    }
  });

  ngOnInit(): void {
    this.svc.init();
    // Brief artificial delay to show skeleton (matches realistic API latency)
    setTimeout(() => this.loading.set(false), 400);
  }

  navigate(n: INotification): void {
    this.svc.markAsRead(n.id);
    if (n.route) this.router.navigateByUrl(n.route);
  }

  priorityCfg(priority: string) {
    return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.low;
  }

  timeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60)    return `Il y a ${diff}s`;
    if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return date.toLocaleDateString('fr-FR');
  }

  emptyIcon(): string {
    const map: Record<Tab, string> = {
      all:      'notifications_none',
      unread:   'mark_email_read',
      read:     'drafts',
      archived: 'inventory_2',
    };
    return map[this.activeTab()];
  }

  emptyTitle(): string {
    const map: Record<Tab, string> = {
      all:      'Aucune notification',
      unread:   'Tout est à jour !',
      read:     'Aucune notification lue',
      archived: 'Aucune archive',
    };
    return map[this.activeTab()];
  }

  emptyMessage(): string {
    const map: Record<Tab, string> = {
      all:      'Vous n\'avez pas encore reçu de notifications.',
      unread:   'Vous avez lu toutes vos notifications.',
      read:     'Vous n\'avez pas encore lu de notifications.',
      archived: 'Aucune notification archivée pour l\'instant.',
    };
    return map[this.activeTab()];
  }
}
