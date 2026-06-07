import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CommunicationStore } from '@sms/communication/data-access';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
  badge?: () => number;
}

@Component({
  selector: 'sms-communication-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, MatIconModule],
  template: `
    <div class="flex h-full" style="min-height: calc(100vh - 60px)">

      <!-- Sidebar Messagerie -->
      <aside class="flex flex-col shrink-0 border-r"
             style="width: 220px; background: var(--surface-1); border-color: var(--border-color)">

        <!-- Header sidebar -->
        <div class="px-4 py-4 border-b" style="border-color: var(--border-color)">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                 style="background: var(--accent)">
              <mat-icon style="color: #fff; font-size: 18px; height: 18px; width: 18px">mail</mat-icon>
            </div>
            <span class="font-semibold text-sm" style="color: var(--text-primary)">Messagerie</span>
          </div>
        </div>

        <!-- Compose button -->
        <div class="px-3 py-3">
          <a routerLink="/communication/compose"
             class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
             style="background: var(--accent)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">edit</mat-icon>
            Nouveau message
          </a>
        </div>

        <!-- Nav links -->
        <nav class="flex flex-col gap-0.5 px-2 flex-1">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path"
               routerLinkActive="active-nav"
               [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
               class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group"
               style="color: var(--text-secondary)">
              <mat-icon style="font-size: 18px; height: 18px; width: 18px">{{ link.icon }}</mat-icon>
              <span class="flex-1">{{ link.label }}</span>
              @if (link.badge && link.badge() > 0) {
                <span class="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
                      style="background: #ef4444; min-width: 18px; text-align: center">
                  {{ link.badge() }}
                </span>
              }
            </a>
          }
        </nav>

        <!-- Diffusion -->
        <div class="px-2 pb-4 border-t mt-2 pt-3" style="border-color: var(--border-color)">
          <p class="text-xs font-semibold px-3 mb-2 uppercase" style="color: var(--text-muted)">Diffusion</p>
          @for (link of broadcastLinks; track link.path) {
            <a [routerLink]="link.path"
               routerLinkActive="active-nav"
               class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
               style="color: var(--text-secondary)">
              <mat-icon style="font-size: 18px; height: 18px; width: 18px">{{ link.icon }}</mat-icon>
              <span>{{ link.label }}</span>
            </a>
          }
        </div>
      </aside>

      <!-- Content -->
      <div class="flex-1 overflow-auto" style="background: var(--content-bg)">
        <router-outlet />
      </div>

    </div>
  `,
  styles: [`
    a.active-nav {
      background: var(--accent-light);
      color: var(--accent) !important;
    }
    a.active-nav mat-icon {
      color: var(--accent) !important;
    }
  `],
})
export class CommunicationLayoutComponent {
  readonly store = inject(CommunicationStore);

  readonly navLinks: NavLink[] = [
    { path: '/communication/inbox',  label: 'Boîte de réception', icon: 'inbox',      exact: true,  badge: () => this.store.unreadCount() },
    { path: '/communication/sent',   label: 'Envoyés',            icon: 'send',        exact: false },
    { path: '/communication/drafts', label: 'Brouillons',         icon: 'drafts',      exact: false },
  ];

  readonly broadcastLinks: NavLink[] = [
    { path: '/communication/broadcast', label: 'Campagnes', icon: 'campaign', exact: true },
  ];
}
