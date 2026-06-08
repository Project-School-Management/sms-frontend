import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export type EmptyStateType =
  | 'students'    | 'teachers'   | 'grades'      | 'bulletins'
  | 'invoices'    | 'payments'   | 'documents'   | 'notifications'
  | 'schedule'    | 'messages'   | 'absences'    | 'exams'
  | 'courses'     | 'reports'    | 'users'       | 'generic'
  | 'search'      | 'error'      | 'academic'    | 'classes';

interface EmptyStateCfg {
  icon:        string;
  title:       string;
  description: string;
}

const CONFIGS: Record<EmptyStateType, EmptyStateCfg> = {
  students:      { icon: 'group',               title: 'Aucun élève trouvé',          description: 'Inscrivez le premier élève pour démarrer.' },
  teachers:      { icon: 'person',              title: 'Aucun enseignant',             description: 'Ajoutez des enseignants à votre établissement.' },
  grades:        { icon: 'grade',               title: 'Aucune note disponible',       description: 'Les notes apparaîtront ici après la saisie.' },
  bulletins:     { icon: 'description',         title: 'Aucun bulletin disponible',    description: 'Les bulletins sont générés à la fin de chaque période.' },
  invoices:      { icon: 'receipt_long',        title: 'Aucune facture',               description: 'Les factures sont créées automatiquement lors des inscriptions.' },
  payments:      { icon: 'payments',            title: 'Aucun paiement enregistré',    description: 'Les paiements Mobile Money apparaîtront ici.' },
  documents:     { icon: 'folder_open',         title: 'Aucun document',               description: 'Déposez des documents pour compléter le dossier.' },
  notifications: { icon: 'notifications_none',  title: 'Aucune notification',          description: 'Vous n\'avez aucune notification pour le moment.' },
  schedule:      { icon: 'calendar_month',      title: 'Emploi du temps vide',         description: 'Aucune séance planifiée pour cette période.' },
  messages:      { icon: 'inbox',               title: 'Boîte de réception vide',      description: 'Aucun message reçu pour le moment.' },
  absences:      { icon: 'event_available',     title: 'Aucune absence enregistrée',   description: 'Aucune absence ou retard cette période.' },
  exams:         { icon: 'quiz',                title: 'Aucun examen disponible',       description: 'Les examens planifiés apparaîtront ici.' },
  courses:       { icon: 'menu_book',           title: 'Aucun cours disponible',        description: 'Ajoutez des cours au catalogue pour commencer.' },
  reports:       { icon: 'bar_chart',           title: 'Aucun rapport généré',          description: 'Générez votre premier rapport analytique.' },
  users:         { icon: 'manage_accounts',     title: 'Aucun utilisateur',             description: 'Créez les comptes utilisateurs de l\'établissement.' },
  academic:      { icon: 'school',              title: 'Données académiques vides',     description: 'Les données de notation apparaîtront ici.' },
  classes:       { icon: 'class',               title: 'Aucune classe configurée',      description: 'Configurez les classes et promotions de l\'établissement.' },
  search:        { icon: 'search_off',          title: 'Aucun résultat',                description: 'Essayez de modifier vos critères de recherche.' },
  error:         { icon: 'error_outline',       title: 'Une erreur est survenue',       description: 'Veuillez réessayer ou contacter l\'administrateur.' },
  generic:       { icon: 'inbox',               title: 'Aucun élément',                 description: 'Il n\'y a rien à afficher pour le moment.' },
};

@Component({
  selector:        'sms-empty-state',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center py-14 px-6 gap-4">
      <!-- Icon -->
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center"
           style="background: var(--surface-2)">
        <mat-icon style="font-size: 32px; height: 32px; width: 32px; color: var(--text-muted)">
          {{ resolvedIcon }}
        </mat-icon>
      </div>
      <!-- Text -->
      <div>
        <h3 class="text-base font-semibold mb-1" style="color: var(--text-primary)">
          {{ resolvedTitle }}
        </h3>
        <p class="text-sm max-w-xs mx-auto" style="color: var(--text-secondary)">
          {{ resolvedDescription }}
        </p>
      </div>
      <!-- Action button -->
      @if (actionLabel) {
        @if (actionLink) {
          <a [routerLink]="actionLink"
             class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
             style="background: var(--accent)">
            @if (actionIcon) {
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">{{ actionIcon }}</mat-icon>
            }
            {{ actionLabel }}
          </a>
        } @else {
          <button (click)="action.emit()"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
                  style="background: var(--accent)">
            @if (actionIcon) {
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">{{ actionIcon }}</mat-icon>
            }
            {{ actionLabel }}
          </button>
        }
      }
    </div>
  `,
})
export class EmptyStateComponent {
  /** Pre-defined type (uses built-in config) */
  @Input() type: EmptyStateType = 'generic';

  /** Override individual fields */
  @Input() icon?:        string;
  @Input() title?:       string;
  @Input() description?: string;

  /** Optional CTA */
  @Input() actionLabel?: string;
  @Input() actionLink?:  string | string[];
  @Input() actionIcon?:  string;
  @Output() action = new EventEmitter<void>();

  get cfg():                EmptyStateCfg   { return CONFIGS[this.type] ?? CONFIGS.generic; }
  get resolvedIcon():       string           { return this.icon        ?? this.cfg.icon;        }
  get resolvedTitle():      string           { return this.title       ?? this.cfg.title;       }
  get resolvedDescription():string           { return this.description ?? this.cfg.description; }
}
