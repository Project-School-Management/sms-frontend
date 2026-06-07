import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommunicationStore } from '@sms/communication/data-access';
import { IConversation } from '@sms/shared/models';

@Component({
  selector: 'sms-inbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
    <div class="p-6 h-full flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Messagerie</h1>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary)">{{ store.conversations().length }} conversations actives</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/communication/notifications" class="relative px-4 py-2 rounded-lg text-sm border hover:opacity-80 transition-opacity"
             style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
            <mat-icon style="font-size: 18px; height: 18px; width: 18px">notifications</mat-icon>
            @if (store.unreadCount() > 0) {
              <span class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                {{ store.unreadCount() }}
              </span>
            }
          </a>
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style="background: var(--accent)">
            <mat-icon style="font-size: 18px; height: 18px; width: 18px">edit</mat-icon>
            Nouvelle conversation
          </button>
        </div>
      </div>

      <!-- 3-Column Layout -->
      <div class="flex gap-4 flex-1 min-h-0" style="height: calc(100vh - 200px)">
        <!-- Column 1: Conversation list -->
        <div class="w-72 sms-card flex flex-col overflow-hidden">
          <!-- Search -->
          <div class="p-3 border-b" style="border-color: var(--border-color)">
            <div class="relative">
              <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2" style="font-size: 16px; height: 16px; width: 16px; color: var(--text-muted)">search</mat-icon>
              <input [(ngModel)]="searchConv" type="search" placeholder="Rechercher..."
                class="w-full pl-8 pr-3 py-1.5 rounded-lg border text-sm focus:outline-none"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)" />
            </div>
          </div>
          <!-- Conversations -->
          <div class="flex-1 overflow-y-auto">
            @for (conv of filteredConvs(); track conv.publicId) {
              <button (click)="selectConv(conv)"
                class="w-full text-left p-3 border-b transition-all"
                [style.background]="store.selectedConversation()?.publicId === conv.publicId ? 'var(--accent-light)' : 'transparent'"
                [style.border-left]="store.selectedConversation()?.publicId === conv.publicId ? '3px solid var(--accent)' : '3px solid transparent'"
                style="border-bottom-color: var(--border-color)">
                <div class="flex items-start gap-2.5">
                  <!-- Avatar -->
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                       [style.background]="conv.type === 'GROUPE' ? '#6366f1' : '#0891b2'">
                    {{ conv.type === 'GROUPE' ? 'G' : convInitials(conv) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-semibold truncate" style="color: var(--text-primary)">
                        {{ conv.titre ?? convTitle(conv) }}
                      </p>
                      @if (conv.nbNonLus > 0) {
                        <span class="ml-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 font-bold">
                          {{ conv.nbNonLus }}
                        </span>
                      }
                    </div>
                    @if (conv.dernierMessage) {
                      <p class="text-xs truncate mt-0.5" style="color: var(--text-secondary)">
                        {{ conv.dernierMessage.contenu }}
                      </p>
                      <p class="text-xs mt-0.5" style="color: var(--text-muted)">
                        {{ conv.dernierMessage.createdAt | date:'HH:mm' }}
                      </p>
                    }
                  </div>
                </div>
              </button>
            } @empty {
              <div class="flex flex-col items-center justify-center py-8 gap-2">
                <mat-icon style="color: var(--text-muted)">chat_bubble_outline</mat-icon>
                <p class="text-xs" style="color: var(--text-secondary)">Aucune conversation</p>
              </div>
            }
          </div>
        </div>

        <!-- Column 2: Messages -->
        <div class="flex-1 sms-card flex flex-col overflow-hidden">
          @if (store.selectedConversation(); as conv) {
            <!-- Header conversation -->
            <div class="px-4 py-3 border-b flex items-center gap-3" style="border-color: var(--border-color)">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                   [style.background]="conv.type === 'GROUPE' ? '#6366f1' : '#0891b2'">
                {{ conv.type === 'GROUPE' ? 'G' : convInitials(conv) }}
              </div>
              <div>
                <p class="font-semibold" style="color: var(--text-primary)">{{ conv.titre ?? convTitle(conv) }}</p>
                <p class="text-xs" style="color: var(--text-secondary)">
                  {{ conv.type === 'GROUPE' ? conv.participants.length + ' participants' : 'Conversation privée' }}
                </p>
              </div>
            </div>
            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              @for (msg of store.messages(); track msg.publicId) {
                <div [class]="msg.expediteurPublicId === 'usr-001' ? 'flex justify-end' : 'flex justify-start'">
                  <div [style.background]="msg.expediteurPublicId === 'usr-001' ? 'var(--accent)' : 'var(--surface-2)'"
                       [style.color]="msg.expediteurPublicId === 'usr-001' ? '#fff' : 'var(--text-primary)'"
                       [style.border]="msg.expediteurPublicId === 'usr-001' ? 'none' : '1px solid var(--border-color)'"
                       class="max-w-xs rounded-2xl px-4 py-2.5 text-sm">
                    @if (msg.expediteurPublicId !== 'usr-001') {
                      <p class="text-xs font-semibold mb-1" style="color: var(--accent)">{{ msg.expediteurNom }}</p>
                    }
                    <p>{{ msg.contenu }}</p>
                    <p class="text-xs mt-1 opacity-60 text-right">{{ msg.createdAt | date:'HH:mm' }}</p>
                  </div>
                </div>
              } @empty {
                <div class="flex flex-col items-center justify-center h-full gap-3">
                  <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">chat</mat-icon>
                  <p style="color: var(--text-secondary)">Aucun message</p>
                </div>
              }
            </div>
            <!-- Input -->
            <div class="px-4 py-3 border-t flex gap-2" style="border-color: var(--border-color)">
              <input [(ngModel)]="newMessage" type="text" placeholder="Écrire un message..."
                class="flex-1 px-4 py-2 rounded-xl border text-sm focus:outline-none"
                style="background: var(--surface-2); border-color: var(--border-color); color: var(--text-primary)" />
              <button class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background: var(--accent)">
                <mat-icon style="color: #fff; font-size: 18px; height: 18px; width: 18px">send</mat-icon>
              </button>
            </div>
          } @else {
            <div class="flex-1 flex flex-col items-center justify-center gap-3">
              <mat-icon style="font-size: 64px; height: 64px; width: 64px; color: var(--text-muted)">chat_bubble_outline</mat-icon>
              <p class="text-lg font-medium" style="color: var(--text-secondary)">Sélectionnez une conversation</p>
              <p class="text-sm" style="color: var(--text-muted)">ou créez-en une nouvelle</p>
            </div>
          }
        </div>

        <!-- Column 3: Infos conversation -->
        @if (store.selectedConversation(); as conv) {
          <div class="w-64 sms-card p-4 flex flex-col gap-4 overflow-y-auto">
            <div class="text-center">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2"
                   [style.background]="conv.type === 'GROUPE' ? '#6366f1' : '#0891b2'">
                {{ conv.type === 'GROUPE' ? 'G' : convInitials(conv) }}
              </div>
              <p class="font-semibold" style="color: var(--text-primary)">{{ conv.titre ?? convTitle(conv) }}</p>
              <span class="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                    [style.background]="conv.type === 'GROUPE' ? 'var(--accent-light)' : 'rgba(8,145,178,0.1)'"
                    [style.color]="conv.type === 'GROUPE' ? 'var(--accent)' : '#0891b2'">
                {{ conv.type === 'GROUPE' ? 'Groupe' : 'Privé' }}
              </span>
            </div>
            <div class="border-t pt-4" style="border-color: var(--border-color)">
              <p class="text-xs font-semibold mb-2" style="color: var(--text-secondary)">PARTICIPANTS ({{ conv.participants.length }})</p>
              <div class="flex flex-col gap-2">
                @for (p of conv.participants.slice(0, 6); track p) {
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                         style="background: #6366f1">{{ p[0].toUpperCase() }}</div>
                    <span class="text-xs" style="color: var(--text-secondary)">{{ p }}</span>
                  </div>
                }
                @if (conv.participants.length > 6) {
                  <p class="text-xs" style="color: var(--text-muted)">+ {{ conv.participants.length - 6 }} autres</p>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class InboxComponent implements OnInit {
  readonly store = inject(CommunicationStore);
  searchConv = '';
  newMessage = '';

  ngOnInit() {
    this.store.loadConversations();
    this.store.loadNotifications();
  }

  filteredConvs() {
    const s = this.searchConv.toLowerCase();
    if (!s) return this.store.conversations();
    return this.store.conversations().filter(c =>
      (c.titre ?? '').toLowerCase().includes(s) ||
      c.dernierMessage?.contenu?.toLowerCase().includes(s)
    );
  }

  selectConv(conv: IConversation) {
    this.store.selectConversation(conv);
    this.store.loadMessages(conv.publicId);
  }

  convTitle(conv: IConversation): string {
    return conv.type === 'GROUPE' ? 'Groupe' : 'Conversation privée';
  }

  convInitials(conv: IConversation): string {
    if (conv.titre) return conv.titre[0].toUpperCase();
    return conv.participants[0]?.[0]?.toUpperCase() ?? '?';
  }
}
