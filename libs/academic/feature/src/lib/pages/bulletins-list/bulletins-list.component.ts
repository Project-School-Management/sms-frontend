import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AcademicStore } from '@sms/academic/data-access';

@Component({
  selector: 'sms-bulletins-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Bulletins scolaires</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">Résultats consolidés par étudiant et par semestre</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/academic" class="flex items-center gap-1 text-sm hover:opacity-80" style="color: var(--accent)">
            <mat-icon style="font-size: 16px; height: 16px; width: 16px">arrow_back</mat-icon>
            Retour aux notes
          </a>
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style="background: var(--accent)">
            <mat-icon style="font-size: 18px; height: 18px; width: 18px">picture_as_pdf</mat-icon>
            Générer bulletins
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: var(--accent-light)">
            <mat-icon style="color: var(--accent)">description</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.bulletins().length }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Total bulletins</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(22,163,74,0.1)">
            <mat-icon style="color: #16a34a">publish</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.nbPublies() }}</p>
            <p class="text-sm" style="color: var(--text-secondary)">Publiés</p>
          </div>
        </div>
        <div class="sms-card p-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(59,130,246,0.1)">
            <mat-icon style="color: #2563eb">bar_chart</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ store.moyenneGlobale() }}/20</p>
            <p class="text-sm" style="color: var(--text-secondary)">Moyenne globale</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="sms-card overflow-hidden">
        <div class="px-5 py-4 border-b flex flex-wrap items-center gap-3" style="border-color: var(--border-color)">
          <h3 class="font-semibold flex-1" style="color: var(--text-primary)">Liste des bulletins</h3>
          <div class="flex items-center gap-2">
            <select [(ngModel)]="promoFilter"
              class="px-3 py-1.5 rounded-lg border text-sm"
              style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
              <option value="">Toutes les promotions</option>
              <option value="promo-001">L3 GL 2025</option>
              <option value="promo-002">L2 GL 2025</option>
              <option value="promo-003">M1 RI 2025</option>
              <option value="promo-004">L1 GL 2025</option>
              <option value="promo-005">M2 RI 2025</option>
            </select>
            <select [(ngModel)]="semestreFilter"
              class="px-3 py-1.5 rounded-lg border text-sm"
              style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)">
              <option value="">Tous les semestres</option>
              <option value="1">Semestre 1</option>
              <option value="2">Semestre 2</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style="background: var(--surface-2)">
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Étudiant</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Promotion</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Semestre</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Moyenne</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Rang</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Mention</th>
                <th class="text-left px-4 py-3 font-medium" style="color: var(--text-secondary)">Statut</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (b of filteredBulletins(); track b.publicId) {
                <tr class="border-t hover:opacity-80 transition-opacity" style="border-color: var(--border-color)">
                  <td class="px-4 py-3 font-medium" style="color: var(--text-primary)">{{ b.studentNom }}</td>
                  <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">{{ b.promotionLibelle }}</td>
                  <td class="px-4 py-3 text-xs font-medium" style="color: var(--text-secondary)">S{{ b.semestre }}</td>
                  <td class="px-4 py-3">
                    <span class="font-bold text-sm" [style.color]="moyenneColor(b.moyenne)">{{ b.moyenne }}/20</span>
                  </td>
                  <td class="px-4 py-3 text-sm font-medium" style="color: var(--text-secondary)">{{ b.rang }}{{ b.rang === 1 ? 'er' : 'ème' }}</td>
                  <td class="px-4 py-3 text-xs" style="color: var(--text-secondary)">{{ (b as any).mention ?? '—' }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold" [ngStyle]="statutStyle(b.statut)">
                      {{ b.statut }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <a [routerLink]="['/academic/bulletins', b.publicId]"
                       class="text-xs font-medium hover:underline" style="color: var(--accent)">Voir →</a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8">
                    <div class="flex flex-col items-center justify-center py-16 gap-3">
                      <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">description</mat-icon>
                      <p style="color: var(--text-secondary)">Aucun bulletin trouvé</p>
                    </div>
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
export class BulletinsListComponent implements OnInit {
  readonly store = inject(AcademicStore);

  promoFilter = '';
  semestreFilter = '';

  ngOnInit() {
    this.store.loadBulletins({});
    this.store.loadPromotions();
  }

  filteredBulletins() {
    let list = this.store.filteredBulletins();
    if (this.promoFilter)    list = list.filter(b => b.promotionPublicId === this.promoFilter);
    if (this.semestreFilter) list = list.filter(b => String(b.semestre) === this.semestreFilter);
    return list;
  }

  moyenneColor(m: number): string {
    if (m >= 16) return '#16a34a';
    if (m >= 14) return '#2563eb';
    if (m >= 10) return 'var(--text-primary)';
    return '#dc2626';
  }

  statutStyle(statut: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      PUBLIE:     { background: '#dcfce7', color: '#16a34a' },
      GENERE:     { background: '#dbeafe', color: '#2563eb' },
      EN_ATTENTE: { background: '#f3f4f6', color: '#6b7280' },
    };
    return map[statut] ?? { background: '#f3f4f6', color: '#6b7280' };
  }
}
