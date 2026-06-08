import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LearningStore } from '@sms/learning/data-access';
import { TypeRessource } from '@sms/shared/models';

const RESSOURCE_ICON: Record<TypeRessource, string> = {
  PDF:      'description',
  VIDEO:    'play_circle',
  ZIP:      'folder_zip',
  LIEN:     'link',
  IMAGE:    'image',
  AUDIO:    'headphones',
  EXERCICE: 'assignment',
};

@Component({
  selector: 'sms-cours-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">

      <!-- Back -->
      <a routerLink="/learning"
         class="inline-flex items-center gap-1 text-sm mb-5 hover:opacity-80"
         style="color: var(--accent)">
        <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
        Retour aux cours
      </a>

      @if (store.loading()) {
        <div class="flex items-center justify-center py-16 gap-2" style="color: var(--text-secondary)">
          <mat-icon class="animate-spin">refresh</mat-icon>
          Chargement...
        </div>
      }

      @if (store.selectedCours(); as c) {
        <!-- Header card -->
        <div class="sms-card p-6 mb-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span class="px-2 py-0.5 rounded text-xs font-semibold" [ngStyle]="statutStyle(c.statut)">{{ c.statut }}</span>
                @if (c.niveauLibelle) {
                  <span class="text-xs" style="color: var(--text-muted)">{{ c.niveauLibelle }}</span>
                }
              </div>
              <h1 class="text-2xl font-bold mb-1" style="color: var(--text-primary)">{{ c.titre }}</h1>
              <p class="text-sm leading-relaxed" style="color: var(--text-secondary)">{{ c.description }}</p>

              <div class="flex flex-wrap gap-4 mt-4 text-sm" style="color: var(--text-muted)">
                <span class="flex items-center gap-1">
                  <mat-icon style="font-size: 16px; height: 16px; width: 16px">category</mat-icon>
                  {{ c.matiereLibelle }}
                </span>
                <span class="flex items-center gap-1">
                  <mat-icon style="font-size: 16px; height: 16px; width: 16px">person</mat-icon>
                  {{ c.enseignantNom }}
                </span>
                <span class="flex items-center gap-1">
                  <mat-icon style="font-size: 16px; height: 16px; width: 16px">schedule</mat-icon>
                  {{ c.dureeHeures ?? '?' }}h de cours
                </span>
                <span class="flex items-center gap-1">
                  <mat-icon style="font-size: 16px; height: 16px; width: 16px">layers</mat-icon>
                  {{ c.chapitres.length }} chapitre(s)
                </span>
              </div>
            </div>

            <div class="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                 style="background: var(--accent-light)">
              <mat-icon style="color: var(--accent); font-size: 32px; height: 32px; width: 32px">menu_book</mat-icon>
            </div>
          </div>

          <!-- Progression bar -->
          <div class="mt-5">
            <div class="flex items-center justify-between text-xs mb-1.5">
              <span style="color: var(--text-secondary)">Progression globale</span>
              <span class="font-semibold" style="color: var(--accent)">{{ c.progression }}%</span>
            </div>
            <div class="w-full rounded-full h-2" style="background: var(--border-color)">
              <div class="h-2 rounded-full transition-all" style="background: var(--accent)"
                   [style.width.%]="c.progression"></div>
            </div>
          </div>
        </div>

        <!-- Chapitres accordéon -->
        <div class="flex flex-col gap-4">
          @for (chap of c.chapitres; track chap.publicId; let i = $index) {
            <div class="sms-card overflow-hidden">
              <button class="w-full flex items-center gap-3 px-5 py-4 border-b text-left hover:opacity-90 transition-opacity"
                      style="border-color: var(--border-color)"
                      (click)="toggleChap(chap.publicId)">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-semibold text-sm"
                     style="background: var(--accent-light); color: var(--accent)">
                  {{ i + 1 }}
                </div>
                <span class="flex-1 font-semibold text-left" style="color: var(--text-primary)">{{ chap.titre }}</span>
                <span class="text-xs mr-2" style="color: var(--text-muted)">
                  {{ chap.ressources.length }} ressource(s)
                </span>
                <mat-icon style="color: var(--text-muted); font-size: 20px; height: 20px; width: 20px">
                  {{ openChaps().has(chap.publicId) ? 'expand_less' : 'expand_more' }}
                </mat-icon>
              </button>

              @if (openChaps().has(chap.publicId)) {
                <div class="divide-y" style="border-color: var(--border-color)">
                  @for (res of chap.ressources; track res.publicId) {
                    <div class="flex items-center gap-3 px-5 py-3 hover:opacity-90 transition-opacity">
                      <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                           [style.background]="res.vue ? 'rgba(22,163,74,0.10)' : 'var(--surface-2)'">
                        <mat-icon [style.color]="res.vue ? '#16a34a' : 'var(--text-muted)'"
                                  style="font-size: 18px; height: 18px; width: 18px">
                          {{ icon(res.type) }}
                        </mat-icon>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate" style="color: var(--text-primary)">{{ res.titre }}</p>
                        <p class="text-xs" style="color: var(--text-muted)">{{ res.type }}</p>
                      </div>
                      @if (res.vue) {
                        <span class="flex items-center gap-1 text-xs font-medium" style="color: #16a34a">
                          <mat-icon style="font-size: 14px; height: 14px; width: 14px">check_circle</mat-icon>
                          Vu
                        </span>
                      } @else {
                        <button class="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                                style="background: var(--accent-light); color: var(--accent)">
                          Accéder
                        </button>
                      }
                    </div>
                  } @empty {
                    <div class="px-5 py-4 text-sm" style="color: var(--text-muted)">
                      Aucune ressource dans ce chapitre.
                    </div>
                  }
                </div>
              }
            </div>
          } @empty {
            <div class="sms-card flex flex-col items-center justify-center py-12 gap-3">
              <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">layers</mat-icon>
              <p style="color: var(--text-secondary)">Aucun chapitre disponible pour ce cours.</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CoursDetailComponent implements OnInit {
  readonly store = inject(LearningStore);
  private readonly route = inject(ActivatedRoute);

  readonly openChaps = signal<Set<string>>(new Set());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('publicId') ?? '';
    this.store.loadCour(id);
  }

  toggleChap(id: string): void {
    this.openChaps.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  icon(type: TypeRessource): string {
    return RESSOURCE_ICON[type] ?? 'insert_drive_file';
  }

  statutStyle(statut: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      PUBLIE:   { background: '#dcfce7', color: '#16a34a' },
      BROUILLON:{ background: '#f3f4f6', color: '#6b7280' },
      ARCHIVE:  { background: '#fee2e2', color: '#dc2626' },
    };
    return map[statut] ?? { background: '#f3f4f6', color: '#6b7280' };
  }
}
