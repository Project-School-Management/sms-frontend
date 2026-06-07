import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface IReply {
  from: string;
  body: string;
  date: Date;
}

interface IMessage {
  id: string;
  from: string;
  fromRole: string;
  to: string;
  subject: string;
  body: string;
  date: Date;
  read: boolean;
  thread?: IReply[];
}

const MOCK_MESSAGES: Record<string, IMessage> = {
  'msg-001': {
    id: 'msg-001',
    from: 'Mamadou Koné', fromRole: 'Parent',
    to: 'Secrétariat',
    subject: 'Demande de certificat de scolarité',
    body: `Bonjour,

Je me permets de vous contacter afin de demander un certificat de scolarité pour mon fils Ousmane Koné, actuellement inscrit en Licence 3 Génie Logiciel.

Ce document m'est nécessaire pour une demande de bourse auprès du Ministère de l'Enseignement Supérieur.

Je vous serais très reconnaissant de bien vouloir traiter cette demande dans les meilleurs délais.

Cordialement,
Mamadou Koné`,
    date: new Date(Date.now() - 2 * 3600 * 1000),
    read: false,
    thread: [
      {
        from: 'Secrétariat',
        body: 'Bonjour M. Koné, nous avons bien reçu votre demande. Le certificat sera prêt d\'ici 48h.',
        date: new Date(Date.now() - 1 * 3600 * 1000),
      },
    ],
  },
  'msg-002': {
    id: 'msg-002',
    from: 'Fatoumata Bah', fromRole: 'Étudiante',
    to: 'Administration',
    subject: 'Question sur les résultats du semestre 1',
    body: `Bonjour,

Je n'ai pas encore reçu mes résultats du semestre 1. Pourriez-vous me confirmer quand ils seront disponibles ?

Merci d'avance.

Fatoumata Bah - L2 Gestion`,
    date: new Date(Date.now() - 5 * 3600 * 1000),
    read: true,
    thread: [],
  },
};

@Component({
  selector: 'sms-message-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm mb-6" style="color: var(--text-secondary)">
        <a routerLink="/communication/inbox" class="hover:underline" style="color: var(--accent)">Boîte de réception</a>
        <mat-icon style="font-size: 14px; height: 14px; width: 14px">chevron_right</mat-icon>
        <span class="truncate" style="color: var(--text-primary)">{{ msg()?.subject ?? 'Message' }}</span>
      </nav>

      @if (msg(); as m) {
        <!-- Message card -->
        <div class="sms-card p-6 mb-4">
          <h2 class="text-xl font-bold mb-4" style="color: var(--text-primary)">{{ m.subject }}</h2>

          <div class="flex items-center gap-3 mb-5 pb-4 border-b" style="border-color: var(--border-color)">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                 style="background: #6366f1">
              {{ m.from[0] }}
            </div>
            <div class="flex-1">
              <p class="font-semibold text-sm" style="color: var(--text-primary)">{{ m.from }}</p>
              <p class="text-xs" style="color: var(--text-secondary)">{{ m.fromRole }} → {{ m.to }}</p>
            </div>
            <p class="text-xs" style="color: var(--text-muted)">{{ m.date | date:'dd/MM/yyyy à HH:mm' }}</p>
          </div>

          <div class="text-sm whitespace-pre-line leading-relaxed" style="color: var(--text-primary)">{{ m.body }}</div>

          <div class="flex items-center gap-2 mt-5 pt-4 border-t flex-wrap" style="border-color: var(--border-color)">
            <button (click)="showReply.set(!showReply())"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90"
              style="background: var(--accent)">
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">reply</mat-icon>
              Répondre
            </button>
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border hover:opacity-80 transition-opacity"
              style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">forward</mat-icon>
              Transférer
            </button>
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border hover:opacity-80 transition-opacity"
              style="border-color: var(--border-color); color: var(--text-secondary); background: var(--surface-2)">
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">archive</mat-icon>
              Archiver
            </button>
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border hover:opacity-80 transition-opacity ml-auto"
              style="border-color: var(--border-color); color: #dc2626; background: rgba(239,68,68,0.08)">
              <mat-icon style="font-size: 16px; height: 16px; width: 16px">delete_outline</mat-icon>
              Supprimer
            </button>
          </div>
        </div>

        <!-- Reply form -->
        @if (showReply()) {
          <div class="sms-card p-4 mb-4">
            <p class="text-sm font-semibold mb-3" style="color: var(--text-primary)">Répondre à {{ m.from }}</p>
            <textarea [(ngModel)]="replyText"
              rows="4"
              placeholder="Votre réponse..."
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none"
              style="border-color: var(--border-color); background: var(--surface-2); color: var(--text-primary)">
            </textarea>
            <div class="flex gap-2 mt-3">
              <button (click)="sendReply()"
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
                style="background: var(--accent)">
                <mat-icon style="font-size: 16px; height: 16px; width: 16px">send</mat-icon>
                Envoyer
              </button>
              <button (click)="showReply.set(false)"
                class="px-4 py-2 rounded-lg text-sm border hover:opacity-80"
                style="border-color: var(--border-color); color: var(--text-secondary)">
                Annuler
              </button>
            </div>
          </div>
        }

        <!-- Thread -->
        @if (m.thread && m.thread.length > 0) {
          <div class="sms-card p-5">
            <h3 class="text-sm font-semibold mb-4" style="color: var(--text-secondary)">
              {{ m.thread.length }} réponse(s)
            </h3>
            <div class="flex flex-col gap-4">
              @for (reply of m.thread; track reply.date) {
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                       style="background: #0891b2">{{ reply.from[0] }}</div>
                  <div class="flex-1 rounded-xl p-3" style="background: var(--surface-2)">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-semibold" style="color: var(--text-primary)">{{ reply.from }}</span>
                      <span class="text-xs" style="color: var(--text-muted)">{{ reply.date | date:'dd/MM HH:mm' }}</span>
                    </div>
                    <p class="text-sm" style="color: var(--text-secondary)">{{ reply.body }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      } @else {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: var(--text-muted)">mail_outline</mat-icon>
          <p style="color: var(--text-secondary)">Message introuvable</p>
          <a routerLink="/communication/inbox" class="text-sm" style="color: var(--accent)">Retour à la boîte de réception</a>
        </div>
      }
    </div>
  `,
})
export class MessageDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);

  readonly msg = signal<IMessage | null>(null);
  readonly showReply = signal(false);
  replyText = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.msg.set(MOCK_MESSAGES[id] ?? null);
  }

  sendReply(): void {
    const m = this.msg();
    if (!m || !this.replyText.trim()) return;
    const reply: IReply = {
      from: 'Moi',
      body: this.replyText,
      date: new Date(),
    };
    this.msg.set({ ...m, thread: [...(m.thread ?? []), reply] });
    this.replyText = '';
    this.showReply.set(false);
  }
}
