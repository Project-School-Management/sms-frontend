// Public API — @sms/shared/ui
// Loading system · Skeletons · Shared UI components · Notifications

export { LoadingService }          from './lib/loading.service';
export { NavigationLoaderService } from './lib/navigation-loader.service';
export { PageLoaderComponent }     from './lib/page-loader.component';
export { loadingInterceptor }      from './lib/loading.interceptor';
export {
  SkeletonComponent,
  SkeletonCardComponent,
  SkeletonTableComponent,
} from './lib/skeleton.component';

// ── Notifications ────────────────────────────────────────────────────────────
export type { INotification, NotifType, NotifPriority } from './lib/notifications/notification.model';
export { NOTIF_TYPE_CONFIG }           from './lib/notifications/notification.model';
export { WebSocketMockService }        from './lib/notifications/websocket-mock.service';
export { NotificationService }         from './lib/notifications/notification.service';
export { NotificationPanelComponent }  from './lib/notifications/notification-panel.component';
