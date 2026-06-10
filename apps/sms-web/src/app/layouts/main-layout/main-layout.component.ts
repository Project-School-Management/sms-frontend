import {
  Component, ChangeDetectionStrategy, inject, signal, computed,
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule }    from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthStore }   from '@sms/shared/auth';
import { AuthService } from '@sms/shared/auth';
// (PageLoaderComponent is already mounted in AppComponent — no need to duplicate here)
import { Role }        from '@sms/shared/models';
import { NotificationService, NotificationPanelComponent } from '@sms/shared/ui';

// ── Types ─────────────────────────────────────────────────────────────────────
interface NavChild { path: string; label: string; }
interface NavItem  {
  id:        string;
  path:      string;
  label:     string;
  icon:      string;
  roles:     Role[];
  children?: NavChild[];
}
interface NavGroup { label: string; items: NavItem[]; }

// ── Navigation config ─────────────────────────────────────────────────────────
const ALL: Role[] = Object.values(Role) as Role[];

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'PRINCIPAL',
    items: [
      {
        id: 'dashboard', path: '/dashboard',
        label: 'Tableau de bord', icon: 'space_dashboard',
        roles: ALL,
      },
    ],
  },
  {
    label: 'ACADÉMIQUE',
    items: [
      {
        id: 'students', path: '/students',
        label: 'Élèves', icon: 'group',
        roles: [Role.ADMIN, Role.DIR, Role.SECRETARIAT],
        children: [
          { path: '/students',     label: 'Liste des élèves' },
          { path: '/students/new', label: 'Nouvelle inscription' },
        ],
      },
      {
        id: 'academic', path: '/academic',
        label: 'Notes & Bulletins', icon: 'menu_book',
        roles: [Role.ADMIN, Role.DIR, Role.ENSEIGNANT],
        children: [
          { path: '/academic',              label: 'Notes'          },
          { path: '/academic/evaluations',  label: 'Évaluations'   },
          { path: '/academic/classes',      label: 'Classes'        },
          { path: '/academic/bulletins',    label: 'Bulletins'      },
          { path: '/academic/saisie',       label: 'Saisie notes'   },
        ],
      },
      {
        id: 'schedule', path: '/schedule',
        label: 'Emplois du temps', icon: 'calendar_month',
        roles: [Role.ADMIN, Role.DIR, Role.SECRETARIAT, Role.ENSEIGNANT, Role.ELEVE, Role.PARENT],
        children: [
          { path: '/schedule',         label: 'Calendrier' },
          { path: '/schedule/seances', label: 'Séances' },
          { path: '/schedule/salles',  label: 'Salles' },
        ],
      },
    ],
  },
  {
    label: 'SUIVI & COMMUNICATION',
    items: [
      {
        id: 'communication', path: '/communication',
        label: 'Messagerie', icon: 'chat_bubble_outline',
        roles: [Role.ADMIN, Role.DIR, Role.SECRETARIAT, Role.ENSEIGNANT, Role.ELEVE, Role.PARENT],
        children: [
          { path: '/communication',               label: 'Boîte de réception' },
          { path: '/communication/notifications', label: 'Notifications' },
        ],
      },
      {
        id: 'learning', path: '/learning',
        label: 'Évaluations en ligne', icon: 'quiz',
        roles: [Role.ADMIN, Role.DIR, Role.ENSEIGNANT, Role.ELEVE],
        children: [
          { path: '/learning',              label: 'Tableau de bord'    },
          { path: '/learning/cours',        label: 'Cours & E-learning' },
          { path: '/learning/examens',      label: 'Examens & Quiz'     },
          { path: '/learning/devoirs',      label: 'Devoirs & Travaux'  },
          { path: '/learning/sessions',     label: 'Sessions virtuelles'},
          { path: '/learning/certificats',  label: 'Certificats'        },
        ],
      },
    ],
  },
  {
    label: 'FINANCES',
    items: [
      {
        id: 'finance', path: '/finance',
        label: 'Finance', icon: 'account_balance_wallet',
        roles: [Role.ADMIN, Role.DIR, Role.COMPTABLE],
        children: [
          { path: '/finance',               label: 'Tableau de bord' },
          { path: '/finance/invoices',      label: 'Factures'        },
          { path: '/finance/frais',         label: 'Frais'           },
          { path: '/finance/paiements',     label: 'Paiements'       },
          { path: '/finance/bourses',       label: 'Bourses'         },
          { path: '/finance/reductions',    label: 'Réductions'      },
          { path: '/finance/echeanciers',   label: 'Échéanciers'     },
          { path: '/finance/remboursements',label: 'Remboursements'  },
          { path: '/finance/rapports',      label: 'Rapports'        },
        ],
      },
    ],
  },
  {
    label: 'ADMINISTRATION',
    items: [
      {
        id: 'config', path: '/config',
        label: 'Configuration', icon: 'settings',
        roles: [Role.SUPER_ADMIN, Role.ADMIN],
        children: [
          { path: '/config',          label: "Vue d'ensemble"          },
          { path: '/config/academic', label: 'Référentiels académiques' },
          { path: '/config/rooms',    label: 'Salles & bâtiments'       },
          { path: '/config/finance',  label: 'Référentiels financiers'  },
          { path: '/config/calendar', label: 'Calendrier académique'    },
        ],
      },
      {
        id: 'admin', path: '/admin',
        label: 'Utilisateurs', icon: 'manage_accounts',
        roles: [Role.SUPER_ADMIN, Role.ADMIN],
        children: [
          { path: '/admin',        label: 'Liste des utilisateurs' },
          { path: '/admin/rbac',   label: 'Rôles & Permissions'   },
          { path: '/admin/annees', label: 'Années académiques'    },
        ],
      },
      {
        id: 'analytics', path: '/analytics',
        label: 'Rapports & KPIs', icon: 'bar_chart',
        roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.DIR],
        children: [
          { path: '/analytics',          label: 'KPIs' },
          { path: '/analytics/rapports', label: 'Rapports' },
        ],
      },
    ],
  },
];

const ROLE_LABELS: Partial<Record<Role, string>> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.ADMIN]:       'Administrateur',
  [Role.DIR]:         'Directeur',
  [Role.SECRETARIAT]: 'Secrétariat',
  [Role.COMPTABLE]:   'Comptable',
  [Role.ENSEIGNANT]:  'Enseignant',
  [Role.ELEVE]:       'Élève',
  [Role.PARENT]:      'Parent',
};

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector:        'sms-main-layout',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl:        './main-layout.component.scss',
  templateUrl:     './main-layout.component.html',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, CommonModule,
    MatIconModule, MatTooltipModule, NotificationPanelComponent,
  ],
})
export class MainLayoutComponent {
  protected readonly authStore    = inject(AuthStore);
  protected readonly authService  = inject(AuthService);
  protected readonly router       = inject(Router);
  readonly notifService           = inject(NotificationService);

  // ── UI state ──────────────────────────────────────────────────────────────
  protected readonly isCollapsed   = signal(false);
  protected readonly isDarkMode    = signal(false);
  protected readonly isMobileOpen  = signal(false);
  protected readonly expandedSet   = signal<Set<string>>(new Set());
  readonly notifPanelOpen          = signal(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  protected readonly visibleGroups = computed(() => {
    const role = this.authStore.userRole();
    if (!role) return NAV_GROUPS; // show all in dev/skipKeycloak mode
    return NAV_GROUPS
      .map(g => ({ ...g, items: g.items.filter(i => i.roles.includes(role)) }))
      .filter(g => g.items.length > 0);
  });

  protected readonly userInitials = computed(() => {
    const u = this.authStore.currentUser();
    if (!u) return 'U';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || 'U';
  });

  protected readonly userFullName = computed(() => {
    const u = this.authStore.currentUser();
    if (!u) return 'Utilisateur';
    return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
  });

  protected readonly userRoleLabel = computed(() => {
    const role = this.authStore.userRole();
    return role ? (ROLE_LABELS[role] ?? role) : '';
  });

  // ── Actions ───────────────────────────────────────────────────────────────
  protected toggleSidebar():   void { this.isCollapsed.update(v => !v); }
  protected closeMobileMenu(): void { this.isMobileOpen.set(false); }

  protected toggleNotifPanel(event: Event): void {
    event.stopPropagation();
    this.notifPanelOpen.update(v => !v);
  }

  protected toggleDarkMode(): void {
    this.isDarkMode.update(v => !v);
    document.body.classList.toggle('dark-mode', this.isDarkMode());
  }

  protected toggleItem(id: string): void {
    this.expandedSet.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected isExpanded(id: string): boolean {
    return this.expandedSet().has(id);
  }

  protected isItemActive(item: NavItem): boolean {
    return this.router.isActive(item.path, {
      paths: 'subset', queryParams: 'ignored',
      fragment: 'ignored', matrixParams: 'ignored',
    });
  }
}
