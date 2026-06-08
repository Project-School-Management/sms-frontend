// ══════════════════════════════════════════════════════════════════════════════
// Public API — @sms/shared/ui
// Loading · Skeletons · EmptyState · ErrorState · Toast · Documents · Notifications
// ══════════════════════════════════════════════════════════════════════════════

// ── Loading system ────────────────────────────────────────────────────────────
export { LoadingService }          from './lib/loading.service';
export { NavigationLoaderService } from './lib/navigation-loader.service';
export { PageLoaderComponent }     from './lib/page-loader.component';
export { loadingInterceptor }      from './lib/loading.interceptor';

// ── Base Skeletons ────────────────────────────────────────────────────────────
export {
  SkeletonComponent,
  SkeletonCardComponent,
  SkeletonTableComponent,
} from './lib/skeleton.component';

// ── Extended Skeleton Variants ────────────────────────────────────────────────
export {
  ProfileSkeletonComponent,
  FormSkeletonComponent,
  DetailPageSkeletonComponent,
  DashboardSkeletonComponent,
  ChartSkeletonComponent,
  TimelineSkeletonComponent,
  ListSkeletonComponent,
  DocumentSkeletonComponent,
  NotificationSkeletonComponent,
} from './lib/skeleton-variants.component';

// ── Empty States ──────────────────────────────────────────────────────────────
export type { EmptyStateType } from './lib/empty-state.component';
export { EmptyStateComponent }   from './lib/empty-state.component';

// ── Error States ──────────────────────────────────────────────────────────────
export type { ErrorStateType } from './lib/error-state.component';
export { ErrorStateComponent }   from './lib/error-state.component';

// ── Toast Notifications ───────────────────────────────────────────────────────
export type { ToastType }   from './lib/toast.service';
export { ToastService }      from './lib/toast.service';

// ── Document Generation ───────────────────────────────────────────────────────
export type {
  DocStudent,
  DocNote,
  DocBulletin,
  DocInvoice,
  DocSchool,
} from './lib/document.service';
export { DocumentService } from './lib/document.service';

// ── In-app Notifications ─────────────────────────────────────────────────────
export type { INotification, NotifType, NotifPriority } from './lib/notifications/notification.model';
export { NOTIF_TYPE_CONFIG }           from './lib/notifications/notification.model';
export { WebSocketMockService }        from './lib/notifications/websocket-mock.service';
export { NotificationService }         from './lib/notifications/notification.service';
export { NotificationPanelComponent }  from './lib/notifications/notification-panel.component';
