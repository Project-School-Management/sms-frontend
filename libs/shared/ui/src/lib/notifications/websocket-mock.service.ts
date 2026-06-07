import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, interval, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { INotification, NotifType, NOTIF_TYPE_CONFIG } from './notification.model';

const MOCK_EVENTS: Array<{ type: NotifType; title: string; message: string; route?: string; priority: 'high' | 'medium' | 'low' }> = [
  {
    type: 'PAIEMENT', priority: 'high',
    title: 'Paiement reçu',
    message: 'Mamadou Koné a effectué un versement de 150 000 XOF pour la facture INV-2025-0048.',
    route: '/finance/invoices',
  },
  {
    type: 'INSCRIPTION', priority: 'medium',
    title: 'Nouvelle inscription',
    message: 'Fatoumata Bah vient de compléter son dossier d\'inscription en Licence 2 Gestion.',
    route: '/students',
  },
  {
    type: 'NOTE', priority: 'medium',
    title: 'Note saisie',
    message: 'M. Ouédraogo a saisi les notes de l\'examen de Mathématiques pour la promotion L3 GL.',
    route: '/academic',
  },
  {
    type: 'ALERTE', priority: 'high',
    title: 'Facture en retard',
    message: 'La facture INV-2025-0031 d\'Aminata Traoré est en retard de 14 jours.',
    route: '/finance/invoices',
  },
  {
    type: 'MESSAGE', priority: 'low',
    title: 'Nouveau message',
    message: 'Seydou Diallo vous a envoyé un message : "Bonjour, j\'ai une question concernant mon bulletin..."',
    route: '/communication/inbox',
  },
  {
    type: 'PLANNING', priority: 'medium',
    title: 'Séance planifiée',
    message: 'Une séance de Droit Civil est planifiée demain à 08h00 en Salle A12.',
    route: '/schedule',
  },
  {
    type: 'SYSTEME', priority: 'low',
    title: 'Sauvegarde effectuée',
    message: 'La sauvegarde automatique des données a été effectuée avec succès.',
  },
  {
    type: 'PAIEMENT', priority: 'medium',
    title: 'Remboursement traité',
    message: 'Le remboursement de bourse pour Ibrahim Coulibaly a été traité : 75 000 XOF.',
    route: '/finance/bourses',
  },
  {
    type: 'NOTE', priority: 'high',
    title: 'Moyenne critique',
    message: 'L\'étudiant Boubacar Sawadogo a une moyenne générale de 6.2/20 ce semestre.',
    route: '/academic',
  },
  {
    type: 'INSCRIPTION', priority: 'low',
    title: 'Dossier incomplet',
    message: 'Le dossier de Kadiatou Bamba est incomplet : pièce d\'identité manquante.',
    route: '/students',
  },
];

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

@Injectable({ providedIn: 'root' })
export class WebSocketMockService implements OnDestroy {
  private readonly _incoming$ = new Subject<INotification>();
  private destroy$ = new Subject<void>();
  private subscription: Subscription | null = null;

  readonly incoming$: Observable<INotification> = this._incoming$.asObservable();

  connect(): void {
    if (this.subscription) return;
    // Génère une notification toutes les 15-30 secondes (simulé par 20s fixe pour démo)
    this.subscription = interval(20_000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const template = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
        const cfg = NOTIF_TYPE_CONFIG[template.type];
        const notif: INotification = {
          id: generateId(),
          type: template.type,
          title: template.title,
          message: template.message,
          route: template.route,
          read: false,
          archived: false,
          priority: template.priority,
          createdAt: new Date(),
          icon: cfg.icon,
          color: cfg.color,
          colorBg: cfg.colorBg,
        };
        this._incoming$.next(notif);
      });
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
