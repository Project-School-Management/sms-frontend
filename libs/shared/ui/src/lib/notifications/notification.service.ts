import { Injectable, computed, inject, signal, OnDestroy } from '@angular/core';
import { INotification, NotifType, NOTIF_TYPE_CONFIG } from './notification.model';
import { WebSocketMockService } from './websocket-mock.service';

function makeNotif(
  id: string,
  type: NotifType,
  title: string,
  message: string,
  read: boolean,
  archived: boolean,
  priority: 'high' | 'medium' | 'low',
  minutesAgo: number,
  route?: string,
): INotification {
  const cfg = NOTIF_TYPE_CONFIG[type];
  return {
    id, type, title, message, route, read, archived, priority,
    createdAt: new Date(Date.now() - minutesAgo * 60_000),
    icon: cfg.icon,
    color: cfg.color,
    colorBg: cfg.colorBg,
  };
}

const INITIAL_NOTIFS: INotification[] = [
  makeNotif('n-01', 'PAIEMENT',    'Paiement reçu',            'Mamadou Koné a payé 150 000 XOF (facture INV-0048).',                     false, false, 'high',   5,   '/finance/invoices'),
  makeNotif('n-02', 'INSCRIPTION', 'Nouvelle inscription',     'Fatoumata Bah a complété son dossier en Licence 2.',                       false, false, 'medium', 12,  '/students'),
  makeNotif('n-03', 'NOTE',        'Note saisie',              'M. Ouédraogo a saisi les notes de l\'examen de Maths L3 GL.',              false, false, 'medium', 30,  '/academic'),
  makeNotif('n-04', 'ALERTE',      'Facture en retard',        'INV-0031 d\'Aminata Traoré est en retard de 14 jours.',                   false, false, 'high',   45,  '/finance/invoices'),
  makeNotif('n-05', 'MESSAGE',     'Nouveau message',          'Seydou Diallo : "Bonjour, j\'ai une question sur mon bulletin..."',        false, false, 'low',    60,  '/communication/inbox'),
  makeNotif('n-06', 'PLANNING',    'Séance planifiée',         'Droit Civil demain à 08h00 en Salle A12.',                                 true,  false, 'medium', 120, '/schedule'),
  makeNotif('n-07', 'PAIEMENT',    'Bourse versée',            'Remboursement de bourse pour Ibrahim Coulibaly : 75 000 XOF.',             true,  false, 'medium', 180, '/finance/bourses'),
  makeNotif('n-08', 'NOTE',        'Moyenne critique',         'Boubacar Sawadogo — moyenne 6.2/20 ce semestre.',                          true,  false, 'high',   240, '/academic'),
  makeNotif('n-09', 'INSCRIPTION', 'Dossier incomplet',        'Kadiatou Bamba — pièce d\'identité manquante.',                            true,  false, 'low',    360, '/students'),
  makeNotif('n-10', 'SYSTEME',     'Sauvegarde réussie',       'Sauvegarde automatique des données effectuée avec succès.',                true,  true,  'low',    480),
  makeNotif('n-11', 'ALERTE',      'Quota stockage',           'Le stockage des documents atteint 85 % de la capacité.',                   true,  true,  'medium', 1440),
  makeNotif('n-12', 'PAIEMENT',    'Échéance proche',          'Rappel : 12 factures arrivent à échéance dans 3 jours.',                   true,  true,  'high',   2880, '/finance/invoices'),
];

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly ws = inject(WebSocketMockService);
  private subscription: ReturnType<typeof this.ws.incoming$.subscribe> | null = null;

  readonly all          = signal<INotification[]>(INITIAL_NOTIFS);
  readonly unread       = computed(() => this.all().filter(n => !n.read && !n.archived));
  readonly read         = computed(() => this.all().filter(n => n.read && !n.archived));
  readonly archived     = computed(() => this.all().filter(n => n.archived));
  readonly unreadCount  = computed(() => this.unread().length);

  markAsRead(id: string): void {
    this.all.update(list => list.map(n => n.id === id ? { ...n, read: true } : n));
  }

  markAllAsRead(): void {
    this.all.update(list => list.map(n => ({ ...n, read: true })));
  }

  archive(id: string): void {
    this.all.update(list => list.map(n => n.id === id ? { ...n, archived: true, read: true } : n));
  }

  archiveAll(): void {
    this.all.update(list => list.map(n => ({ ...n, archived: true, read: true })));
  }

  delete(id: string): void {
    this.all.update(list => list.filter(n => n.id !== id));
  }

  addNotification(n: INotification): void {
    this.all.update(list => [n, ...list]);
  }

  init(): void {
    if (this.subscription) return; // idempotent — prevents double subscription
    this.ws.connect();
    this.subscription = this.ws.incoming$.subscribe(n => this.addNotification(n));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.ws.disconnect();
  }
}
