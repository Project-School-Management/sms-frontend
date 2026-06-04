import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule }  from '@angular/material/sidenav';
import { MatToolbarModule }  from '@angular/material/toolbar';
import { MatIconModule }     from '@angular/material/icon';
import { MatButtonModule }   from '@angular/material/button';
import { MatListModule }     from '@angular/material/list';
import { MatBadgeModule }    from '@angular/material/badge';

import { AuthStore }   from '@sms/shared/auth';
import { AuthService } from '@sms/shared/auth';
import { Role }        from '@sms/shared/models';

interface NavItem {
  path:   string;
  label:  string;
  icon:   string;
  roles:  Role[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',       label: 'Tableau de bord', icon: 'dashboard',         roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.DIR, Role.SECRETARIAT, Role.COMPTABLE, Role.ENSEIGNANT, Role.ELEVE, Role.PARENT] },
  { path: '/admin',           label: 'Administration',  icon: 'admin_panel_settings', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
  { path: '/students',        label: 'Élèves',          icon: 'school',             roles: [Role.ADMIN, Role.DIR, Role.SECRETARIAT] },
  { path: '/academic',        label: 'Académique',      icon: 'grade',              roles: [Role.ADMIN, Role.DIR, Role.ENSEIGNANT] },
  { path: '/schedule',        label: 'Emplois du temps',icon: 'calendar_month',     roles: [Role.ADMIN, Role.DIR, Role.SECRETARIAT, Role.ENSEIGNANT, Role.ELEVE, Role.PARENT] },
  { path: '/communication',   label: 'Communication',   icon: 'chat',               roles: [Role.ADMIN, Role.DIR, Role.SECRETARIAT, Role.ENSEIGNANT, Role.ELEVE, Role.PARENT] },
  { path: '/finance',         label: 'Finance',         icon: 'payments',           roles: [Role.ADMIN, Role.DIR, Role.COMPTABLE] },
  { path: '/learning',        label: 'Évaluations',     icon: 'quiz',               roles: [Role.ADMIN, Role.DIR, Role.ENSEIGNANT, Role.ELEVE] },
  { path: '/analytics',       label: 'Rapports',        icon: 'bar_chart',          roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.DIR] },
];

@Component({
  selector:         'sms-main-layout',
  standalone:       true,
  changeDetection:  ChangeDetectionStrategy.OnPush,
  styleUrl:         './main-layout.component.scss',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatIconModule,
    MatButtonModule, MatListModule, MatBadgeModule,
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  protected readonly authStore   = inject(AuthStore);
  protected readonly authService = inject(AuthService);

  protected readonly navItems = NAV_ITEMS;

  get visibleNavItems(): NavItem[] {
    const role = this.authStore.userRole();
    if (!role) return [];
    return this.navItems.filter((item) => item.roles.includes(role));
  }

  logout(): void {
    this.authService.logout();
  }
}
