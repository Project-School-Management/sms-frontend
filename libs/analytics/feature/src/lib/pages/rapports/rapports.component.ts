import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsStore } from '@sms/analytics/data-access';

const RAPPORT_TYPES: Record<string, { label: string; icon: string; description: string }> = {
  BULLETIN_PROMOTION:  { label: 'Bulletins par promotion', icon: 'description', description: 'Export PDF de tous les bulletins d\'une promotion' },
  RAPPORT_FINANCIER:   { label: 'Rapport financier',       icon: 'account_balance', description: 'Synthèse des paiements et impayés par période' },
  EFFECTIFS:           { label: 'Effectifs étudiants',     icon: 'people', description: 'Répartition des effectifs par promotion et statut' },
  RECOUVREMENT:        { label: 'Taux de recouvrement',    icon: 'trending_up', description: 'Évolution mensuelle du recouvrement des frais' },
  NOTES_PROMOTION:     { label: 'Notes par promotion',     icon: 'grade', description: 'Tableau récapitulatif des notes par matière et étudiant' },
  ABSENCES:            { label: 'Rapport d\'absences',     icon: 'person_off', description: 'Liste des absences par étudiant et par matière' },
  EMPLOI_DU_TEMPS:     { label: 'Emploi du temps',         icon: 'calendar_month', description: 'Planning hebdomadaire de l\'établissement' },
  STATISTIQUES_GLOBALES:{ label: 'Statistiques globales',  icon: 'bar_chart', description: 'Tableau de bord complet pour la direction' },
};

const PERIODES = ['2025-2026', '2024-2025', '2023-2024'];

@Component({
  selector: 'sms-rapports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Rapports</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Génération et téléchargement de rapports analytiques</p>
        </div>
        <div class="flex items-center gap-2">
          <select [(ngModel)]="selectedPeriode" class="px-3 py-1.5 rounded-lg border text-sm"
            style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
            @for (p of periodes; track p) {
              <option [value]="p">{{ p }}</option>
            }
          </select>
          <a routerLink="/analytics" class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--accent)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
            Analytics
          </a>
        </div>
      </div>

      <!-- Rapports disponibles (à générer) -->
      <div class="sms-card overflow-hidden mb-6">
        <div class="px-5 py-4 border-b flex items-center justify-between" style="border-color: var(--border-color)">
          <div>
            <h3 class="font-semibold" style="color: var(--text-primary)">Rapports disponibles</h3>
            <p class="text-xs mt-0.5" style="color: var(--text-secondary)">
              Choisissez un format et cliquez sur Générer — le rapport apparaît dans la liste ci-dessous
            </p>
          </div>
          <!-- Format toggle -->
          <div class="flex items-center gap-1 p-1 rounded-lg" style="background: var(--surface-2)">
            @for (fmt of formats; track fmt) {
              <button (click)="selectedFormat.set(fmt)"
                class="px-3 py-1 rounded-md text-xs font-semibold transition-all"
                [style.background]="selectedFormat() === fmt ? 'var(--surface-1)' : 'transparent'"
                [style.color]="selectedFormat() === fmt ? 'var(--text-primary)' : 'var(--text-muted)'"
                [style.box-shadow]="selectedFormat() === fmt ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'">
                {{ fmt }}
              </button>
            }
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
          @for (entry of rapportTypes; track entry.type) {
            <div class="p-4 border-b border-r flex items-center gap-4 transition-opacity"
                 style="border-color: var(--border-color)">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   style="background: var(--accent-light)">
                <mat-icon style="color: var(--accent)">{{ entry.icon }}</mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm" style="color: var(--text-primary)">{{ entry.label }}</p>
                <p class="text-xs mt-0.5 truncate" style="color: var(--text-secondary)">{{ entry.description }}</p>
              </div>
              <button (click)="generate(entry.type)"
                class="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style="background: var(--accent-light); color: var(--accent)">
                <mat-icon style="font-size: 14px; height: 14px; width: 14px">download</mat-icon>
                {{ selectedFormat() }}
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Rapports générés -->
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 border-b" style="border-color: var(--border-color)">
          <h3 class="font-semibold" style="color: var(--text-primary)">Rapports récents</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style="background: var(--surface-2)">
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Rapport</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Format</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Statut</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Date</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (r of store.rapports(); track r.publicId) {
                <tr class="border-t hover:opacity-80 transition-opacity" style="border-color: var(--border-color)">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <mat-icon style="font-size: 16px; height: 16px; width: 16px; color: var(--accent)">
                        {{ rapportMeta(r.type).icon }}
                      </mat-icon>
                      <span class="font-medium" style="color: var(--text-primary)">{{ rapportMeta(r.type).label }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded text-xs font-semibold"
                          [style.background]="r.format === 'PDF' ? '#fee2e2' : '#dcfce7'"
                          [style.color]="r.format === 'PDF' ? '#dc2626' : '#16a34a'">
                      {{ r.format }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold" [ngStyle]="statutStyle(r.statut)">
                      {{ statutLabel(r.statut) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">{{ r.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3 text-right">
                    @if (r.downloadUrl && r.statut === 'TERMINE') {
                      <a [href]="r.downloadUrl"
                         class="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium hover:opacity-80 transition-opacity"
                         style="background: var(--accent-light); color: var(--accent)">
                        <mat-icon style="font-size: 14px; height: 14px; width: 14px">download</mat-icon>
                        Télécharger
                      </a>
                    }
                    @if (r.statut === 'EN_COURS') {
                      <span class="flex items-center gap-1 text-xs" style="color: var(--text-muted)">
                        <mat-icon class="animate-spin" style="font-size: 14px; height: 14px; width: 14px">refresh</mat-icon>
                        En cours...
                      </span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class RapportsComponent implements OnInit {
  readonly store = inject(AnalyticsStore);
  selectedPeriode = '2025-2026';
  readonly periodes = PERIODES;
  readonly formats = ['PDF', 'EXCEL'] as const;
  readonly selectedFormat = signal<'PDF' | 'EXCEL'>('PDF');

  readonly rapportTypes = Object.entries(RAPPORT_TYPES).map(([type, meta]) => ({ type, ...meta }));

  ngOnInit(): void {
    this.store.loadRapports();
  }

  generate(type: string): void {
    this.store.generateRapport(type, this.selectedFormat());
  }

  rapportMeta(type: string) {
    return RAPPORT_TYPES[type] ?? { label: type, icon: 'description', description: '' };
  }

  statutStyle(statut: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      TERMINE:  { background: '#dcfce7', color: '#16a34a' },
      EN_COURS: { background: '#fef3c7', color: '#d97706' },
      ERREUR:   { background: '#fee2e2', color: '#dc2626' },
    };
    return map[statut] ?? { background: '#f3f4f6', color: '#6b7280' };
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      TERMINE: 'Terminé', EN_COURS: 'En cours', ERREUR: 'Erreur',
    };
    return map[statut] ?? statut;
  }
}
