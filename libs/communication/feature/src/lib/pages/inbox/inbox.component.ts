import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommunicationStore } from '@sms/communication/data-access';

type InboxFilter = 'all' | 'unread' | 'attachment';

interface IMockConversation {
  id: string;
  from: string;
  fromRole: string;
  subject: string;
  preview: string;
  date: Date;
  unread: boolean;
  hasAttachment: boolean;
}

const MOCK_INBOX: IMockConversation[] = [
  { id: 'msg-001', from: 'Mamadou Koné',      fromRole: 'Parent',     subject: 'Demande de certificat de scolarité', preview: 'Bonjour, je me permets de vous contacter...', date: new Date(Date.now() - 2 * 3600 * 1000),    unread: true,  hasAttachment: false },
  { id: 'msg-002', from: 'Fatoumata Bah',      fromRole: 'Étudiante',  subject: 'Question sur les résultats du semestre 1', preview: 'Bonjour, je n\'ai pas encore reçu...', date: new Date(Date.now() - 5 * 3600 * 1000),    unread: true,  hasAttachment: false },
  { id: 'msg-003', from: 'Ibrahim Coulibaly',  fromRole: 'Parent',     subject: 'Re: Dossier de bourse', preview: 'Merci pour les informations, je vais préparer...', date: new Date(Date.now() - 1 * 86400 * 1000),  unread: true,  hasAttachment: true  },
  { id: 'msg-004', from: 'Aminata Traoré',     fromRole: 'Étudiante',  subject: 'Absence justifiée — semaine du 02/06', preview: 'Bonjour, veuillez trouver ci-joint...', date: new Date(Date.now() - 2 * 86400 * 1000),  unread: false, hasAttachment: true  },
  { id: 'msg-005', from: 'Seydou Diallo',      fromRole: 'Parent',     subject: 'Inscription Licence 2 — 2025/2026', preview: 'Bonjour, mon fils Oumar voudrait s\'inscrire...', date: new Date(Date.now() - 3 * 86400 * 1000), unread: false, hasAttachment: false },
  { id: 'msg-006', from: 'Kadiatou Bamba',     fromRole: 'Étudiante',  subject: 'Problème avec le portail étudiant', preview: 'Bonjour, je n\'arrive pas à accéder...', date: new Date(Date.now() - 4 * 86400 * 1000),  unread: false, hasAttachment: false },
  { id: 'msg-007', from: 'Ousmane Traoré',     fromRole: 'Parent',     subject: 'Demande de rendez-vous', preview: 'Bonjour, je souhaiterais prendre rendez-vous...', date: new Date(Date.now() - 5 * 86400 * 1000),  unread: false, hasAttachment: false },
  { id: 'msg-008', from: 'Aissatou Barry',     fromRole: 'Étudiante',  subject: 'Attestation de réussite — Licence 3', preview: 'Bonjour, pourriez-vous me délivrer...', date: new Date(Date.now() - 7 * 86400 * 1000),  unread: false, hasAttachment: false },
];

@Component({
  selector: 'sms-inbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold" style="color: var(--text-primary)">Boîte de réception</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">
            {{ unreadCount() }} non-lu(s) sur {{ mockMessages.length }} messages
          </p>
        </div>
        <a routerLink="/communication/compose"
           class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
           style="background: var(--accent)">
          <mat-icon style="font-size: 16px; height: 16px; width: 16px">edit</mat-icon>
          Nouveau message
        </a>
      </div>

      <!-- Search + Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-5">
        <div class="relative flex-1 max-w-sm">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2"
                    style="font-size: 16px; height: 16px; width: 16px; color: var(--text-muted)">search</mat-icon>
          <input [(ngModel)]="search" type="search" placeholder="Rechercher un message..."
            class="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none"
            style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)" />
        </div>
        <div class="flex gap-2">
          @for (f of filters; track f.key) {
            <button (click)="activeFilter.set(f.key)"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
              [style.background]="activeFilter() === f.key ? 'var(--accent)' : 'var(--surface-2)'"
              [style.color]="activeFilter() === f.key ? '#fff' : 'var(--text-secondary)'"
              [style.border-color]="activeFilter() === f.key ? 'var(--accent)' : 'var(--border-color)'">
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      <!-- Message List -->
      <div class="sms-card overflow-hidden">
        @for (msg of filtered(); track msg.id) {
          <a [routerLink]="['/communication/inbox', msg.id]"
             class="flex items-start gap-3 px-5 py-4 border-b transition-all hover:opacity-80"
             [style.background]="msg.unread ? 'rgba(var(--accent-rgb, 59,130,246),0.04)' : 'transparent'"
             style="border-color: var(--border-color); text-decoration: none">
            <!-- Avatar -->
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                 [style.background]="avatarColor(msg.fromRole)">
              {{ msg.from[0] }}
            </div>
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm truncate"
                   [style.font-weight]="msg.unread ? '600' : '400'"
                   style="color: var(--text-primary)">
                  {{ msg.from }}
                  <span class="text-xs font-normal ml-1" style="color: var(--text-muted)">({{ msg.fromRole }})</span>
                </p>
                <div class="flex items-center gap-1.5 shrink-0">
                  @if (msg.hasAttachment) {
                    <mat-icon style="font-size: 14px; height: 14px; width: 14px; color: var(--text-muted)">attach_file</mat-icon>
                  }
                  <p class="text-xs" style="color: var(--text-muted)">{{ formatDate(msg.date) }}</p>
                </div>
              </div>
              <p class="text-sm mt-0.5 truncate"
                 [style.font-weight]="msg.unread ? '500' : '400'"
                 style="color: var(--text-primary)">{{ msg.subject }}</p>
              <p class="text-xs mt-0.5 truncate" style="color: var(--text-secondary)">{{ msg.preview }}</p>
            </div>
            <!-- Unread dot -->
            @if (msg.unread) {
              <div class="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5" style="background: var(--accent)"></div>
            }
          </a>
        } @empty {
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">inbox</mat-icon>
            <p class="font-medium" style="color: var(--text-secondary)">Aucun message</p>
            <p class="text-sm" style="color: var(--text-muted)">Votre boîte de réception est vide</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class InboxComponent implements OnInit {
  readonly store = inject(CommunicationStore);
  private router = inject(Router);

  readonly mockMessages = MOCK_INBOX;
  search = '';
  readonly activeFilter = signal<InboxFilter>('all');

  readonly unreadCount = computed(() => this.mockMessages.filter(m => m.unread).length);

  readonly filters: { key: InboxFilter; label: string }[] = [
    { key: 'all',        label: 'Tous' },
    { key: 'unread',     label: 'Non lus' },
    { key: 'attachment', label: 'Avec PJ' },
  ];

  ngOnInit(): void {
    this.store.loadConversations();
  }

  filtered(): IMockConversation[] {
    let list = this.mockMessages;
    if (this.activeFilter() === 'unread') list = list.filter(m => m.unread);
    if (this.activeFilter() === 'attachment') list = list.filter(m => m.hasAttachment);
    if (this.search.trim()) {
      const s = this.search.toLowerCase();
      list = list.filter(m =>
        m.from.toLowerCase().includes(s) ||
        m.subject.toLowerCase().includes(s) ||
        m.preview.toLowerCase().includes(s)
      );
    }
    return list;
  }

  avatarColor(role: string): string {
    const map: Record<string, string> = {
      'Parent': '#0891b2', 'Étudiante': '#6366f1', 'Enseignant': '#d97706',
    };
    return map[role] ?? '#6b7280';
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400 * 1000) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (diff < 7 * 86400 * 1000) {
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      return days[date.getDay()];
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }
}
