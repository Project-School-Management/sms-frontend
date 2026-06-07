import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { IConversation, IMessage, INotification } from '@sms/shared/models';
import { CommunicationApiService } from './communication-api.service';

interface CommunicationState {
  conversations: IConversation[]; selectedConversation: IConversation | null;
  messages: IMessage[]; notifications: INotification[];
  unreadCount: number; loading: boolean; error: string | null;
}

export const CommunicationStore = signalStore(
  { providedIn: 'root' },
  withState<CommunicationState>({
    conversations: [], selectedConversation: null, messages: [], notifications: [],
    unreadCount: 0, loading: false, error: null,
  }),
  withComputed(({ notifications }) => ({
    unreadNotifications: computed(() => notifications().filter(n => !n.lue)),
  })),
  withMethods((store, api = inject(CommunicationApiService)) => ({
    loadConversations: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.getConversations().pipe(
        tap(conversations => patchState(store, { conversations, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadMessages: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(id => api.getMessages(id).pipe(
        tap(messages => patchState(store, { messages, loading: false })),
        catchError((e: Error) => { patchState(store, { loading: false, error: e.message }); return EMPTY; })
      ))
    )),
    loadNotifications: rxMethod<void>(pipe(
      switchMap(() => api.getNotifications().pipe(
        tap(notifications => patchState(store, { notifications, unreadCount: notifications.filter(n => !n.lue).length })),
        catchError(() => EMPTY)
      ))
    )),
    markAllAsRead: rxMethod<void>(pipe(
      switchMap(() => api.markAllAsRead().pipe(
        tap(() => patchState(store, s => ({ notifications: s.notifications.map(n => ({ ...n, lue: true })), unreadCount: 0 }))),
        catchError(() => EMPTY)
      ))
    )),
    selectConversation: (c: IConversation | null) => patchState(store, { selectedConversation: c }),
    clearError:         () => patchState(store, { error: null }),
  }))
);
