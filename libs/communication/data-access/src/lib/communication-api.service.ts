import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IConversation, IMessage, INotification } from '@sms/shared/models';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_NOTIFICATIONS } from './communication.mock';

@Injectable({ providedIn: 'root' })
export class CommunicationApiService {

  getConversations(): Observable<IConversation[]> {
    return of(MOCK_CONVERSATIONS).pipe(delay(300));
  }

  getMessages(conversationPublicId: string): Observable<IMessage[]> {
    return of(MOCK_MESSAGES).pipe(delay(200));
  }

  sendMessage(conversationPublicId: string, contenu: string): Observable<IMessage> {
    const msg: IMessage = {
      publicId: `msg-${Date.now()}`,
      expediteurPublicId: 'current-user',
      expediteurNom: 'Moi',
      contenu,
      lu: true,
      createdAt: new Date().toISOString(),
    };
    MOCK_MESSAGES.push(msg);
    return of(msg).pipe(delay(200));
  }

  getNotifications(): Observable<INotification[]> {
    return of(MOCK_NOTIFICATIONS).pipe(delay(200));
  }

  getUnreadCount(): Observable<number> {
    return of(MOCK_NOTIFICATIONS.filter(n => !n.lue).length).pipe(delay(100));
  }

  markAsRead(publicId: string): Observable<void> {
    const n = MOCK_NOTIFICATIONS.find(n => n.publicId === publicId);
    if (n) n.lue = true;
    return of(undefined).pipe(delay(100));
  }

  markAllAsRead(): Observable<void> {
    MOCK_NOTIFICATIONS.forEach(n => (n.lue = true));
    return of(undefined).pipe(delay(100));
  }
}
