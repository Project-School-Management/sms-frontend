import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UsersStore } from '@sms/users/data-access';

@Component({
  selector: 'sms-annees',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Années académiques</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Gestion des années scolaires de l'établissement</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/admin" class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--accent)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
            Administration
          </a>
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style="background: var(--accent)">
            <mat-icon style="font-size: 18px; height: 18px; width: 18px">add</mat-icon>
            Nouvelle année
          </button>
        </div>
      </div>

      <!-- Active year banner -->
      @if (activeAnnee()) {
        <div class="rounded-xl p-4 mb-4 flex items-center gap-4"
             style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: rgba(255,255,255,0.2)">
            <mat-icon style="color: #fff; font-size: 24px; height: 24px; width: 24px">school</mat-icon>
          </div>
          <div class="flex-1">
            <p class="text-white font-bold">{{ activeAnnee()?.libelle }}</p>
            <p class="text-white/70 text-xs">
              Du {{ activeAnnee()?.dateDebut | date:'dd/MM/yyyy' }} au {{ activeAnnee()?.dateFin | date:'dd/MM/yyyy' }}
            </p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold" style="background: rgba(255,255,255,0.25); color: #fff">
            Année active
          </span>
        </div>
      }

      <!-- Années list -->
      <div class="flex flex-col gap-3">
        @for (annee of store.annees(); track annee.publicId) {
          <div class="sms-card p-5 flex items-center justify-between transition-all hover:opacity-90"
               [style.border-color]="annee.active ? 'var(--accent)' : 'var(--border-color)'">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                   [style.background]="annee.active ? 'var(--accent-light)' : 'var(--surface-2)'">
                <mat-icon [style.color]="annee.active ? 'var(--accent)' : 'var(--text-muted)'"
                          style="font-size: 22px; height: 22px; width: 22px">
                  calendar_month
                </mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="font-semibold" style="color: var(--text-primary)">{{ annee.libelle }}</p>
                  @if (annee.active) {
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold" style="background: #dcfce7; color: #16a34a">
                      En cours
                    </span>
                  }
                </div>
                <p class="text-xs mt-0.5" style="color: var(--text-secondary)">
                  Du {{ annee.dateDebut | date:'dd MMMM yyyy' }} au {{ annee.dateFin | date:'dd MMMM yyyy' }}
                </p>
                @if (!annee.active) {
                  <p class="text-xs mt-0.5" style="color: var(--text-muted)">Année clôturée</p>
                }
              </div>
            </div>
            <div class="flex items-center gap-2">
              @if (!annee.active) {
                <button class="px-3 py-1.5 rounded-lg text-xs font-medium border hover:opacity-80 transition-opacity"
                  style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
                  Activer
                </button>
              }
              <button class="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
                style="border-color: var(--border-color); color: var(--text-muted); background: var(--surface-2)">
                <mat-icon style="font-size: 16px; height: 16px; width: 16px">edit</mat-icon>
              </button>
            </div>
          </div>
        } @empty {
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">calendar_month</mat-icon>
            <p style="color: var(--text-secondary)">Aucune année académique</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class AnneesComponent implements OnInit {
  readonly store = inject(UsersStore);

  ngOnInit() {
    this.store.loadAnnees();
  }

  activeAnnee() {
    return this.store.annees().find(a => a.active);
  }
}
