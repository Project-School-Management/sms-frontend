import { ChangeDetectionStrategy, Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReferenceStore, IEspaceConfig, EspaceWorkspaceType } from '@sms/config-system/data-access';
import { AuthStore } from '@sms/shared/auth';
import { Role } from '@sms/shared/models';
import { ToastService } from '@sms/shared/ui';

const TYPE_ICONS: Record<EspaceWorkspaceType, { icon: string; color: string; bg: string; label: string }> = {
  FUNDAMENTAL: { icon: 'child_care',     color: '#16a34a', bg: 'rgba(22,163,74,0.12)',  label: 'École Fondamentale' },
  COLLEGE:     { icon: 'school',        color: '#0891b2', bg: 'rgba(8,145,178,0.12)',  label: 'Collège' },
  LYCEUM:      { icon: 'auto_stories',  color: '#2563eb', bg: 'rgba(37,99,235,0.12)',  label: 'Lycée' },
  UNIVERSITY:  { icon: 'account_balance', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Université' },
};

/**
 * Gestion des espaces de l'établissement (docs/architecture/tenancy-model.md
 * §2-3, §5, §13.3). Affichage adapté au rôle :
 * - Tous les rôles admin/direction : consultation
 * - SUPER_ADMIN uniquement : déclaration d'un nouvel espace (Phase 1)
 * - SUPER_ADMIN + ADMIN : activation/désactivation d'un espace existant
 */
@Component({
  selector: 'sms-espaces-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  templateUrl: './espaces-config.component.html',
  styleUrl: './espaces-config.component.scss',
})
export class EspacesConfigComponent implements OnInit {
  readonly refStore = inject(ReferenceStore);
  private readonly authStore = inject(AuthStore);
  private readonly toast = inject(ToastService);

  selectedType: EspaceWorkspaceType = 'FUNDAMENTAL';
  customLabel = '';

  readonly isSuperAdmin = computed(() => this.authStore.userRole() === Role.SUPER_ADMIN);
  readonly canManage = computed(() =>
    this.isSuperAdmin() || this.authStore.userRole() === Role.ADMIN
  );

  ngOnInit(): void {
    if (!this.refStore.loaded()) this.refStore.loadAll();
    this.refStore.loadEspaces();
  }

  typeLabel(type: EspaceWorkspaceType): string {
    return TYPE_ICONS[type].label;
  }

  icon(type: EspaceWorkspaceType): string { return TYPE_ICONS[type].icon; }
  iconColor(type: EspaceWorkspaceType): string { return TYPE_ICONS[type].color; }
  iconBg(type: EspaceWorkspaceType): string { return TYPE_ICONS[type].bg; }

  toggle(espace: IEspaceConfig): void {
    this.refStore.toggleEspace({ publicId: espace.publicId, active: !espace.active });
    this.toast.success(espace.active
      ? `Espace « ${espace.label} » désactivé.`
      : `Espace « ${espace.label} » réactivé.`);
  }

  create(): void {
    const label = this.customLabel.trim() || this.typeLabel(this.selectedType);
    this.refStore.createEspace({ workspaceType: this.selectedType, label });
    this.toast.success(`Espace « ${label} » déclaré avec succès.`);
    this.customLabel = '';
  }
}
