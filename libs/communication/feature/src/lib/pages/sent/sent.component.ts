import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface ISentMessage {
  id: string;
  to: string;
  toRole: string;
  subject: string;
  preview: string;
  date: Date;
  status: 'ENVOYE' | 'LU' | 'NON_LU';
}

const MOCK_SENT: ISentMessage[] = [
  {
    id: 's-001',
    to: 'Tous les parents — L3 GL', toRole: 'Parents',
    subject: 'Résultats des examens du semestre 1 disponibles',
    preview: 'Chers parents, nous avons le plaisir de vous informer que les résultats...',
    date: new Date(Date.now() - 1 * 3600 * 1000),
    status: 'LU',
  },
  {
    id: 's-002',
    to: 'Aminata Traoré', toRole: 'Étudiante',
    subject: 'Rappel : facture en retard',
    preview: 'Bonjour Aminata, nous vous rappelons que votre facture INV-0031...',
    date: new Date(Date.now() - 24 * 3600 * 1000),
    status: 'NON_LU',
  },
  {
    id: 's-003',
    to: 'M. Ouédraogo', toRole: 'Enseignant',
    subject: 'Confirmation séance annulée du 05/06',
    preview: 'Bonjour, veuillez noter que la séance de mercredi 05 juin est annulée...',
    date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    status: 'LU',
  },
  {
    id: 's-004',
    to: 'Seydou Diallo', toRole: 'Parent',
    subject: 'Re: Question sur le dossier d\'inscription',
    preview: 'Bonjour M. Diallo, en réponse à votre question, voici les documents...',
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    status: 'LU',
  },
  {
    id: 's-005',
    to: 'Tous les enseignants', toRole: 'Enseignants',
    subject: 'Réunion pédagogique — Vendredi 13 juin à 15h',
    preview: 'Chers collègues, une réunion pédagogique est organisée vendredi 13 juin...',
    date: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    status: 'ENVOYE',
  },
];

@Component({
  selector: 'sms-sent',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold" style="color: var(--text-primary)">Messages envoyés</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">{{ messages.length }} messages envoyés</p>
        </div>
        <a routerLink="/communication/compose"
           class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
           style="background: var(--accent)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">edit</mat-icon>
          Nouveau message
        </a>
      </div>

      <!-- Search -->
      <div class="relative mb-4 max-w-sm">
        <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2" style="font-size: 16px; height: 16px; width: 16px; color: var(--text-muted)">search</mat-icon>
        <input [(ngModel)]="search" type="search" placeholder="Rechercher..."
          class="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none"
          style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)" />
      </div>

      <!-- List -->
      <div class="sms-card overflow-hidden">
        @for (msg of filtered(); track msg.id) {
          <div class="flex items-start gap-3 px-5 py-4 border-b hover:opacity-80 transition-opacity cursor-pointer"
               style="border-color: var(--border-color)">
            <!-- Avatar -->
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                 style="background: #0891b2">
              {{ msg.to[0] }}
            </div>
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-medium truncate" style="color: var(--text-primary)">
                  À : {{ msg.to }}
                  <span class="font-normal text-xs ml-1" style="color: var(--text-muted)">({{ msg.toRole }})</span>
                </p>
                <p class="text-xs shrink-0" style="color: var(--text-muted)">{{ msg.date | date:'dd/MM HH:mm' }}</p>
              </div>
              <p class="text-sm font-semibold mt-0.5" style="color: var(--text-primary)">{{ msg.subject }}</p>
              <p class="text-xs mt-0.5 truncate" style="color: var(--text-secondary)">{{ msg.preview }}</p>
            </div>
            <!-- Status -->
            <div class="shrink-0">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [style.background]="statusStyle(msg.status).bg"
                    [style.color]="statusStyle(msg.status).color">
                {{ statusLabel(msg.status) }}
              </span>
            </div>
          </div>
        } @empty {
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">send</mat-icon>
            <p style="color: var(--text-secondary)">Aucun message envoyé</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class SentComponent {
  readonly messages = MOCK_SENT;
  search = '';

  filtered(): ISentMessage[] {
    if (!this.search.trim()) return this.messages;
    const s = this.search.toLowerCase();
    return this.messages.filter(m =>
      m.to.toLowerCase().includes(s) ||
      m.subject.toLowerCase().includes(s) ||
      m.preview.toLowerCase().includes(s)
    );
  }

  statusLabel(status: ISentMessage['status']): string {
    return status === 'ENVOYE' ? 'Envoyé' : status === 'LU' ? 'Lu' : 'Non lu';
  }

  statusStyle(status: ISentMessage['status']): { bg: string; color: string } {
    switch (status) {
      case 'LU':     return { bg: 'rgba(22,163,74,0.12)',  color: '#16a34a' };
      case 'NON_LU': return { bg: 'rgba(245,158,11,0.12)', color: '#d97706' };
      default:       return { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' };
    }
  }
}
