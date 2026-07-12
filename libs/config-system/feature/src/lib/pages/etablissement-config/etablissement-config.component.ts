import { ChangeDetectionStrategy, Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReferenceStore } from '@sms/config-system/data-access';
import { ToastService } from '@sms/shared/ui';

interface EtablissementForm {
  libelle: string;
  nomCourt: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
}

const EMPTY_FORM: EtablissementForm = {
  libelle: '', nomCourt: '', adresse: '', ville: '', pays: '', telephone: '', email: '',
};

/**
 * Configuration de l'identité de l'établissement (story 3-1).
 * docs/architecture/tenancy-model.md §5.2/§5.3 — Phase 2, créé par le
 * Directeur / Admin du tenant (pas la plateforme).
 */
@Component({
  selector: 'sms-etablissement-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  templateUrl: './etablissement-config.component.html',
  styleUrl: './etablissement-config.component.scss',
})
export class EtablissementConfigComponent implements OnInit {
  readonly refStore = inject(ReferenceStore);
  private readonly toast = inject(ToastService);

  form: EtablissementForm = { ...EMPTY_FORM };

  constructor() {
    // Initialise le formulaire dès que l'établissement est chargé.
    effect(() => {
      const etab = this.refStore.etablissement();
      if (etab) {
        this.form = {
          libelle: etab.libelle,
          nomCourt: etab.nomCourt ?? '',
          adresse: etab.adresse ?? '',
          ville: etab.ville ?? '',
          pays: etab.pays ?? '',
          telephone: etab.telephone ?? '',
          email: etab.email ?? '',
        };
      }
    });
  }

  ngOnInit(): void {
    if (!this.refStore.loaded()) this.refStore.loadAll();
  }

  submit(): void {
    if (!this.form.libelle.trim()) {
      this.toast.error('Le nom de l\'établissement est requis.');
      return;
    }
    this.refStore.saveEtablissement({ ...this.form });
    this.toast.success('Identité de l\'établissement mise à jour.');
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('Le logo ne doit pas dépasser 2 Mo.');
      return;
    }
    this.refStore.uploadLogo(file);
    this.toast.success('Logo mis à jour.');
  }
}
