import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export type ErrorStateType = 'generic' | 'network' | 'permission' | 'notfound' | 'server';

interface ErrorStateCfg {
  icon:        string;
  iconColor:   string;
  iconBg:      string;
  title:       string;
  description: string;
  retryLabel:  string;
}

const CONFIGS: Record<ErrorStateType, ErrorStateCfg> = {
  generic: {
    icon:        'error_outline',
    iconColor:   '#dc2626',
    iconBg:      'rgba(239,68,68,0.1)',
    title:       'Une erreur est survenue',
    description: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
    retryLabel:  'Réessayer',
  },
  network: {
    icon:        'wifi_off',
    iconColor:   '#d97706',
    iconBg:      'rgba(217,119,6,0.1)',
    title:       'Problème de connexion',
    description: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
    retryLabel:  'Réessayer la connexion',
  },
  permission: {
    icon:        'lock',
    iconColor:   '#6366f1',
    iconBg:      'rgba(99,102,241,0.1)',
    title:       'Accès refusé',
    description: 'Vous n\'avez pas les droits nécessaires pour accéder à cette ressource.',
    retryLabel:  'Retour',
  },
  notfound: {
    icon:        'search_off',
    iconColor:   '#6b7280',
    iconBg:      'rgba(107,114,128,0.1)',
    title:       'Ressource introuvable',
    description: 'L\'élément que vous cherchez n\'existe pas ou a été supprimé.',
    retryLabel:  'Retour à la liste',
  },
  server: {
    icon:        'dns',
    iconColor:   '#dc2626',
    iconBg:      'rgba(239,68,68,0.1)',
    title:       'Erreur serveur (5xx)',
    description: 'Le serveur a rencontré une erreur. Notre équipe technique a été notifiée.',
    retryLabel:  'Réessayer',
  },
};

@Component({
  selector:        'sms-error-state',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="sms-card flex flex-col items-center justify-center text-center py-14 px-6 gap-4">
      <!-- Icon -->
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center"
           [style.background]="resolvedCfg.iconBg">
        <mat-icon style="font-size: 32px; height: 32px; width: 32px"
                  [style.color]="resolvedCfg.iconColor">
          {{ resolvedCfg.icon }}
        </mat-icon>
      </div>
      <!-- Title + description -->
      <div>
        <h3 class="text-base font-semibold mb-1" style="color: var(--text-primary)">
          {{ resolvedTitle }}
        </h3>
        <p class="text-sm max-w-sm mx-auto" style="color: var(--text-secondary)">
          {{ resolvedDescription }}
        </p>
        @if (message) {
          <p class="text-xs mt-2 px-3 py-1.5 rounded-lg font-mono"
             style="background: rgba(239,68,68,0.06); color: #dc2626; max-width: 400px; margin: 8px auto 0">
            {{ message }}
          </p>
        }
      </div>
      <!-- Actions -->
      <div class="flex items-center gap-3 flex-wrap justify-center">
        @if (backLink) {
          <a [routerLink]="backLink"
             class="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
             style="border-color:var(--border-color);color:var(--text-secondary);background:var(--surface-2)">
            ← Retour
          </a>
        }
        @if (showRetry) {
          <button (click)="retry.emit()"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
                  style="background: var(--accent)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">refresh</mat-icon>
            {{ resolvedCfg.retryLabel }}
          </button>
        }
      </div>
    </div>
  `,
})
export class ErrorStateComponent {
  @Input() type:         ErrorStateType = 'generic';
  @Input() message?:     string;   // technical error message (optional)
  @Input() title?:       string;   // override title
  @Input() description?: string;   // override description
  @Input() showRetry    = true;
  @Input() backLink?:    string | string[];

  @Output() retry = new EventEmitter<void>();

  get resolvedCfg():         ErrorStateCfg { return CONFIGS[this.type] ?? CONFIGS.generic; }
  get resolvedTitle():       string         { return this.title       ?? this.resolvedCfg.title;       }
  get resolvedDescription(): string         { return this.description ?? this.resolvedCfg.description; }
}
