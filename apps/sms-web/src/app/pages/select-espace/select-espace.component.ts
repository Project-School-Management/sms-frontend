import { ChangeDetectionStrategy, Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EspaceStore, AuthService } from '@sms/shared/auth';
import { WorkspaceType } from '@sms/shared/models';

const ICONS: Record<WorkspaceType, { icon: string; color: string; bg: string }> = {
  [WorkspaceType.FUNDAMENTAL]: { icon: 'child_care',     color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  [WorkspaceType.COLLEGE]:     { icon: 'school',          color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
  [WorkspaceType.LYCEUM]:      { icon: 'auto_stories',    color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  [WorkspaceType.UNIVERSITY]:  { icon: 'account_balance', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
};

/**
 * Écran de sélection d'espace (docs/architecture/tenancy-model.md §6).
 * Affiché uniquement quand l'utilisateur a plusieurs affectations (espaceGuard).
 * Une fois choisi, l'espace est persisté (EspaceStore) et propagé via
 * l'en-tête `X-Workspace-Id` sur toutes les requêtes suivantes.
 */
@Component({
  selector: 'sms-select-espace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  templateUrl: './select-espace.component.html',
  styleUrl: './select-espace.component.scss',
})
export class SelectEspaceComponent implements OnInit {
  readonly store = inject(EspaceStore);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly tenantLabel = computed(() => this.store.espaces()[0]?.tenantLabel ?? 'votre établissement');

  ngOnInit(): void {
    // Accessible dans deux cas : (1) le guard y renvoie faute de sélection,
    // (2) l'utilisateur clique « Changer d'espace » depuis le menu alors qu'un
    // espace est déjà choisi. Seul un accès direct à l'URL sans rien à choisir
    // (0 ou 1 espace) doit rebondir vers le tableau de bord.
    if (this.store.espaces().length <= 1) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  choose(workspaceId: string): void {
    this.store.selectEspace(workspaceId);
    this.router.navigateByUrl('/dashboard');
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }

  icon(type: WorkspaceType): string { return ICONS[type].icon; }
  iconColor(type: WorkspaceType): string { return ICONS[type].color; }
  iconBg(type: WorkspaceType): string { return ICONS[type].bg; }
}
