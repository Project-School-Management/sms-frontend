import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface IBroadcast {
  id: string;
  titre: string;
  destinataires: string;
  total: number;
  lus: number;
  date: Date;
  statut: 'ENVOYE' | 'PLANIFIE' | 'BROUILLON';
}

const MOCK_BROADCASTS: IBroadcast[] = [
  {
    id: 'bc-001',
    titre: 'Résultats semestre 1 — L3 GL & L2 Gestion',
    destinataires: 'Tous les parents et étudiants',
    total: 432, lus: 318,
    date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    statut: 'ENVOYE',
  },
  {
    id: 'bc-002',
    titre: 'Rappel : paiement des frais de scolarité',
    destinataires: 'Parents — factures impayées',
    total: 87, lus: 65,
    date: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    statut: 'ENVOYE',
  },
  {
    id: 'bc-003',
    titre: 'Réunion pédagogique — Vendredi 20 juin',
    destinataires: 'Tous les enseignants',
    total: 34, lus: 28,
    date: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    statut: 'ENVOYE',
  },
  {
    id: 'bc-004',
    titre: 'Journée portes ouvertes — Samedi 28 juin',
    destinataires: 'Tous les contacts',
    total: 0, lus: 0,
    date: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    statut: 'PLANIFIE',
  },
];

@Component({
  selector: 'sms-broadcast-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold" style="color: var(--text-primary)">Campagnes de diffusion</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">{{ broadcasts.length }} campagnes</p>
        </div>
        <a routerLink="/communication/broadcast/new"
           class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
           style="background: var(--accent)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">campaign</mat-icon>
          Nouvelle diffusion
        </a>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="sms-card p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: rgba(99,102,241,0.12)">
            <mat-icon style="color: #6366f1; font-size: 20px; height: 20px; width: 20px">campaign</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ broadcasts.length }}</p>
            <p class="text-xs" style="color: var(--text-secondary)">Total campagnes</p>
          </div>
        </div>
        <div class="sms-card p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: rgba(22,163,74,0.12)">
            <mat-icon style="color: #16a34a; font-size: 20px; height: 20px; width: 20px">visibility</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ avgOpenRate() }}%</p>
            <p class="text-xs" style="color: var(--text-secondary)">Taux d'ouverture moyen</p>
          </div>
        </div>
        <div class="sms-card p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: rgba(8,145,178,0.12)">
            <mat-icon style="color: #0891b2; font-size: 20px; height: 20px; width: 20px">people</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold" style="color: var(--text-primary)">{{ totalRecipients() }}</p>
            <p class="text-xs" style="color: var(--text-secondary)">Total destinataires</p>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="sms-card overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-xs uppercase" style="border-color: var(--border-color); color: var(--text-muted)">
              <th class="text-left px-5 py-3 font-semibold">Campagne</th>
              <th class="text-left px-4 py-3 font-semibold">Destinataires</th>
              <th class="text-center px-4 py-3 font-semibold">Envoyés</th>
              <th class="text-center px-4 py-3 font-semibold">Lus</th>
              <th class="text-center px-4 py-3 font-semibold">Taux</th>
              <th class="text-left px-4 py-3 font-semibold">Date</th>
              <th class="text-center px-4 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            @for (bc of broadcasts; track bc.id) {
              <tr class="border-b hover:opacity-80 transition-opacity"
                  style="border-color: var(--border-color)">
                <td class="px-5 py-3.5">
                  <p class="font-medium" style="color: var(--text-primary)">{{ bc.titre }}</p>
                </td>
                <td class="px-4 py-3.5">
                  <p class="text-xs" style="color: var(--text-secondary)">{{ bc.destinataires }}</p>
                </td>
                <td class="px-4 py-3.5 text-center font-semibold" style="color: var(--text-primary)">
                  {{ bc.total }}
                </td>
                <td class="px-4 py-3.5 text-center" style="color: var(--text-secondary)">
                  {{ bc.lus }}
                </td>
                <td class="px-4 py-3.5 text-center">
                  @if (bc.total > 0) {
                    <span class="font-semibold" style="color: #16a34a">
                      {{ openRate(bc) }}%
                    </span>
                  } @else {
                    <span style="color: var(--text-muted)">—</span>
                  }
                </td>
                <td class="px-4 py-3.5 text-xs" style="color: var(--text-muted)">
                  {{ bc.date | date:'dd/MM/yyyy' }}
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [style.background]="statusStyle(bc.statut).bg"
                        [style.color]="statusStyle(bc.statut).color">
                    {{ statusLabel(bc.statut) }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class BroadcastListComponent {
  readonly broadcasts = MOCK_BROADCASTS;

  avgOpenRate(): number {
    const sent = this.broadcasts.filter(b => b.total > 0);
    if (!sent.length) return 0;
    const total = sent.reduce((acc, b) => acc + Math.round((b.lus / b.total) * 100), 0);
    return Math.round(total / sent.length);
  }

  totalRecipients(): number {
    return this.broadcasts.reduce((acc, b) => acc + b.total, 0);
  }

  openRate(bc: IBroadcast): number {
    return bc.total > 0 ? Math.round((bc.lus / bc.total) * 100) : 0;
  }

  statusLabel(statut: IBroadcast['statut']): string {
    return statut === 'ENVOYE' ? 'Envoyé' : statut === 'PLANIFIE' ? 'Planifié' : 'Brouillon';
  }

  statusStyle(statut: IBroadcast['statut']): { bg: string; color: string } {
    switch (statut) {
      case 'ENVOYE':   return { bg: 'rgba(22,163,74,0.12)',  color: '#16a34a' };
      case 'PLANIFIE': return { bg: 'rgba(245,158,11,0.12)', color: '#d97706' };
      default:         return { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' };
    }
  }
}
