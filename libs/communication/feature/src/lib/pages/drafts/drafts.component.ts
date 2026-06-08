import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface IDraft {
  id: string;
  to?: string;
  subject?: string;
  preview?: string;
  updatedAt: Date;
}

const MOCK_DRAFTS: IDraft[] = [
  {
    id: 'd-001',
    to: 'Tous les parents',
    subject: 'Réunion de parents — Trimestre 2',
    preview: 'Chers parents, nous avons le plaisir de vous convier à la réunion...',
    updatedAt: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: 'd-002',
    to: 'Comité pédagogique',
    subject: 'Bilan mi-année et perspectives',
    preview: 'Chers collègues, voici le résumé de notre bilan de mi-année...',
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
  },
];

@Component({
  selector: 'sms-drafts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold" style="color: var(--text-primary)">Brouillons</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">{{ drafts.length }} brouillon(s)</p>
        </div>
        <a routerLink="/communication/compose"
           class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
           style="background: var(--accent)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">add</mat-icon>
          Nouveau message
        </a>
      </div>

      @if (drafts.length > 0) {
        <div class="sms-card overflow-hidden">
          @for (draft of drafts; track draft.id) {
            <div class="flex items-start gap-3 px-5 py-4 border-b" style="border-color: var(--border-color)">
              <!-- Icon -->
              <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                   style="background: rgba(245,158,11,0.12)">
                <mat-icon style="font-size: 18px; height: 18px; width: 18px; color: #d97706">drafts</mat-icon>
              </div>
              <!-- Content -->
              <div class="flex-1 min-w-0">
                @if (draft.to) {
                  <p class="text-xs" style="color: var(--text-muted)">À : {{ draft.to }}</p>
                }
                <p class="text-sm font-semibold mt-0.5" style="color: var(--text-primary)">
                  {{ draft.subject ?? '(Sans objet)' }}
                </p>
                @if (draft.preview) {
                  <p class="text-xs mt-0.5 truncate" style="color: var(--text-secondary)">{{ draft.preview }}</p>
                }
                <p class="text-xs mt-1" style="color: var(--text-muted)">
                  Dernière modification : {{ draft.updatedAt | date:'dd/MM/yyyy à HH:mm' }}
                </p>
              </div>
              <!-- Actions -->
              <div class="flex items-center gap-2 shrink-0">
                <a [routerLink]="['/communication/compose']" [queryParams]="{ draft: draft.id }"
                   class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90"
                   style="background: var(--accent)">
                  <mat-icon style="font-size: 14px; height: 14px; width: 14px">edit</mat-icon>
                  Reprendre
                </a>
                <button (click)="deleteDraft(draft.id)"
                        class="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                        title="Supprimer ce brouillon"
                        style="color: #dc2626">
                  <mat-icon style="font-size: 18px; height: 18px; width: 18px">delete_outline</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">drafts</mat-icon>
          <p style="color: var(--text-secondary)">Aucun brouillon</p>
        </div>
      }
    </div>
  `,
})
export class DraftsComponent {
  readonly draftList = signal([...MOCK_DRAFTS]);
  // expose as getter so template can use it
  get drafts() { return this.draftList(); }

  deleteDraft(id: string): void {
    this.draftList.update(list => list.filter(d => d.id !== id));
  }
}
