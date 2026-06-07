import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommunicationStore } from '@sms/communication/data-access';
import { IConversation } from '@sms/shared/models';

@Component({
  selector: 'sms-inbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Messagerie</h1>
        <a routerLink="/communication/notifications"
           class="relative px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Notifications
          @if (store.unreadCount() > 0) {
            <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {{ store.unreadCount() }}
            </span>
          }
        </a>
      </div>

      <div class="flex gap-4" style="height: 60vh">
        <!-- Conversation list -->
        <div class="w-80 bg-white rounded-lg border border-gray-200 overflow-y-auto">
          @for (conv of store.conversations(); track conv.publicId) {
            <button
              (click)="selectConv(conv)"
              [class]="store.selectedConversation()?.publicId === conv.publicId ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'"
              class="w-full text-left p-4 border-b border-gray-100">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 text-sm truncate">
                    {{ conv.titre ?? (conv.type === 'GROUPE' ? 'Groupe' : 'Conversation privée') }}
                  </p>
                  @if (conv.dernierMessage) {
                    <p class="text-xs text-gray-500 truncate mt-0.5">{{ conv.dernierMessage.contenu }}</p>
                  }
                </div>
                @if (conv.nbNonLus > 0) {
                  <span class="ml-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0">
                    {{ conv.nbNonLus }}
                  </span>
                }
              </div>
            </button>
          }
        </div>

        <!-- Message area -->
        <div class="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col">
          @if (store.selectedConversation(); as conv) {
            <div class="px-4 py-3 border-b border-gray-200">
              <p class="font-semibold text-gray-900">{{ conv.titre ?? 'Conversation' }}</p>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              @for (msg of store.messages(); track msg.publicId) {
                <div [class]="msg.expediteurPublicId === 'current-user' ? 'flex justify-end' : 'flex justify-start'">
                  <div [class]="msg.expediteurPublicId === 'current-user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'"
                       class="max-w-xs rounded-lg px-3 py-2 text-sm">
                    @if (msg.expediteurPublicId !== 'current-user') {
                      <p class="text-xs font-medium mb-1 text-gray-500">{{ msg.expediteurNom }}</p>
                    }
                    <p>{{ msg.contenu }}</p>
                    <p class="text-xs mt-1 opacity-70">{{ msg.createdAt | date:'HH:mm' }}</p>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="flex-1 flex items-center justify-center text-gray-400">
              Sélectionnez une conversation
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class InboxComponent implements OnInit {
  readonly store = inject(CommunicationStore);

  ngOnInit() {
    this.store.loadConversations();
    this.store.loadNotifications();
  }

  selectConv(conv: IConversation) {
    this.store.selectConversation(conv);
    this.store.loadMessages(conv.publicId);
  }
}
