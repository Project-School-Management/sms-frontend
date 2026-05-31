import { Injectable, OnDestroy, inject } from '@angular/core';
import { Observable, Subject }            from 'rxjs';
import { Client, IMessage, StompConfig } from '@stomp/stompjs';
import SockJS                             from 'sockjs-client';

import { INotification } from '@sms/shared/models';
import { AuthService }   from '@sms/shared/auth';

/**
 * WebSocketService — STOMP over SockJS (communication-service)
 * Endpoint : /ws  (proxied vers sms-communication-service via api-gateway)
 *
 * Usage :
 *   const ws = inject(WebSocketService);
 *   ws.connect();
 *   ws.notifications$.subscribe(n => { ... });
 */
@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private readonly authService = inject(AuthService);

  private client!: Client;
  private readonly _notifications$ = new Subject<INotification>();

  /** Stream de notifications temps-réel */
  readonly notifications$: Observable<INotification> =
    this._notifications$.asObservable();

  async connect(): Promise<void> {
    const token = await this.authService.getToken();

    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders:   { Authorization: `Bearer ${token}` },
      reconnectDelay:   5000,
      onConnect:        () => this.onConnected(),
      onDisconnect:     () => console.warn('[WebSocket] disconnected'),
      onStompError:     (frame) => console.error('[WebSocket] error', frame),
    } as StompConfig);

    this.client.activate();
  }

  disconnect(): void {
    if (this.client?.active) {
      this.client.deactivate();
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
    this._notifications$.complete();
  }

  // ── private ────────────────────────────────────────────────────────────────
  private onConnected(): void {
    // Abonnement au topic personnel de l'utilisateur courant
    this.client.subscribe('/user/queue/notifications', (msg: IMessage) => {
      try {
        const notif = JSON.parse(msg.body) as INotification;
        this._notifications$.next(notif);
      } catch (e) {
        console.error('[WebSocket] parse error', e);
      }
    });
  }
}
