import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SkeletonComponent, SkeletonCardComponent, SkeletonTableComponent } from './skeleton.component';

// ── ProfileSkeletonComponent ──────────────────────────────────────────────────
// Header section: avatar + name + badges + action buttons
@Component({
  selector: 'sms-skeleton-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="sms-card p-6 mb-6">
      <div class="flex flex-wrap items-start gap-5">
        <!-- Avatar -->
        <sms-skeleton width="80px" height="80px" radius="16px" />
        <!-- Name / meta -->
        <div class="flex-1 space-y-2.5 min-w-48">
          <sms-skeleton width="220px" height="28px" />
          <sms-skeleton width="140px" height="16px" />
          <div class="flex gap-2 mt-2">
            <sms-skeleton width="80px" height="20px" radius="20px" />
            <sms-skeleton width="70px" height="20px" radius="20px" />
            <sms-skeleton width="90px" height="20px" radius="20px" />
          </div>
        </div>
        <!-- Actions -->
        <div class="flex flex-col gap-2">
          <sms-skeleton width="120px" height="34px" radius="8px" />
          <sms-skeleton width="120px" height="34px" radius="8px" />
          <sms-skeleton width="120px" height="34px" radius="8px" />
        </div>
      </div>
    </div>
  `,
})
export class ProfileSkeletonComponent {}

// ── FormSkeletonComponent ─────────────────────────────────────────────────────
// Generic form with N rows of label + input
@Component({
  selector: 'sms-skeleton-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="sms-card p-6">
      <sms-skeleton width="180px" height="22px" class="block mb-5" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        @for (_ of fields; track $index) {
          <div class="space-y-1.5">
            <sms-skeleton width="100px" height="13px" />
            <sms-skeleton width="100%" height="42px" radius="10px" />
          </div>
        }
      </div>
      <div class="flex justify-end gap-3 mt-6 pt-5 border-t" style="border-color:var(--border-color)">
        <sms-skeleton width="90px" height="38px" radius="8px" />
        <sms-skeleton width="130px" height="38px" radius="8px" />
      </div>
    </div>
  `,
})
export class FormSkeletonComponent {
  @Input() rows = 6;
  get fields(): number[] { return Array(this.rows).fill(0); }
}

// ── DetailPageSkeletonComponent ───────────────────────────────────────────────
// Full detail page: profile header + tabs + content
@Component({
  selector: 'sms-skeleton-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent, ProfileSkeletonComponent, SkeletonTableComponent],
  template: `
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-6">
      <sms-skeleton width="60px" height="14px" />
      <sms-skeleton width="14px" height="14px" radius="3px" />
      <sms-skeleton width="100px" height="14px" />
    </div>
    <!-- Profile card -->
    <sms-skeleton-profile />
    <!-- Tabs -->
    <div class="flex gap-1 mb-5 p-1 rounded-xl" style="background:var(--surface-2)">
      @for (_ of [1,2,3,4,5,6,7]; track $index) {
        <sms-skeleton width="80px" height="34px" radius="8px" />
      }
    </div>
    <!-- Content table -->
    <sms-skeleton-table />
  `,
})
export class DetailPageSkeletonComponent {}

// ── ChartSkeletonComponent ────────────────────────────────────────────────────
// A placeholder for chart blocks (bar chart visual)
@Component({
  selector: 'sms-skeleton-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 border-b flex items-center justify-between"
           style="border-color:var(--border-color)">
        <sms-skeleton width="160px" height="18px" />
        <sms-skeleton width="80px" height="14px" />
      </div>
      <div class="p-5">
        <!-- Bar chart simulation -->
        <div class="flex items-end gap-2" style="height:120px">
          @for (h of barHeights; track $index) {
            <div class="flex-1 flex flex-col justify-end gap-1">
              <sms-skeleton width="100%" [height]="h" radius="4px 4px 0 0" />
              <sms-skeleton width="100%" height="10px" radius="3px" />
            </div>
          }
        </div>
        <div class="flex gap-3 mt-4">
          @for (_ of [1,2,3]; track $index) {
            <div class="flex items-center gap-1.5">
              <sms-skeleton width="12px" height="12px" radius="3px" />
              <sms-skeleton width="60px" height="11px" />
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ChartSkeletonComponent {
  barHeights = ['60px','90px','45px','110px','75px','100px','55px','80px'];
}

// ── DashboardSkeletonComponent ────────────────────────────────────────────────
// KPI cards row + 2 chart blocks + table
@Component({
  selector: 'sms-skeleton-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent, SkeletonCardComponent, SkeletonTableComponent, ChartSkeletonComponent],
  template: `
    <!-- KPI row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      @for (_ of [1,2,3,4]; track $index) { <sms-skeleton-card /> }
    </div>
    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <sms-skeleton-chart />
      <sms-skeleton-chart />
    </div>
    <!-- Table -->
    <sms-skeleton-table />
  `,
})
export class DashboardSkeletonComponent {}

// ── TimelineSkeletonComponent ─────────────────────────────────────────────────
// Vertical timeline (historique, audit)
@Component({
  selector: 'sms-skeleton-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="flex flex-col gap-3">
      @for (_ of items; track $index) {
        <div class="sms-card p-5 flex items-start gap-4">
          <sms-skeleton width="40px" height="40px" radius="10px" />
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-2">
              <sms-skeleton width="140px" height="15px" />
              <sms-skeleton width="70px" height="20px" radius="10px" />
            </div>
            <sms-skeleton width="80%" height="13px" />
            <div class="flex gap-3 mt-1">
              <sms-skeleton width="100px" height="11px" />
              <sms-skeleton width="120px" height="11px" />
            </div>
          </div>
          <sms-skeleton width="70px" height="11px" />
        </div>
      }
    </div>
  `,
})
export class TimelineSkeletonComponent {
  @Input() count = 4;
  get items(): number[] { return Array(this.count).fill(0); }
}

// ── ListSkeletonComponent ─────────────────────────────────────────────────────
// Vertical list of items (card style, not table)
@Component({
  selector: 'sms-skeleton-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="flex flex-col gap-3">
      @for (_ of items; track $index) {
        <div class="sms-card p-5 flex items-center gap-4">
          <sms-skeleton width="44px" height="44px" radius="12px" />
          <div class="flex-1 space-y-2">
            <sms-skeleton width="60%" height="15px" />
            <sms-skeleton width="40%" height="12px" />
          </div>
          <div class="flex gap-2">
            <sms-skeleton width="70px" height="22px" radius="11px" />
            <sms-skeleton width="30px" height="30px" radius="8px" />
          </div>
        </div>
      }
    </div>
  `,
})
export class ListSkeletonComponent {
  @Input() count = 5;
  get items(): number[] { return Array(this.count).fill(0); }
}

// ── DocumentSkeletonComponent ─────────────────────────────────────────────────
// Document list (files, certificates, etc.)
@Component({
  selector: 'sms-skeleton-document',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="sms-card overflow-hidden">
      <div class="px-5 py-4 flex items-center justify-between border-b"
           style="border-color:var(--border-color)">
        <div class="flex items-center gap-2">
          <sms-skeleton width="18px" height="18px" radius="4px" />
          <sms-skeleton width="160px" height="18px" />
        </div>
        <div class="flex gap-2">
          <sms-skeleton width="60px" height="13px" />
          <sms-skeleton width="70px" height="13px" />
        </div>
      </div>
      @for (_ of items; track $index) {
        <div class="px-5 py-4 flex items-center gap-4 border-t"
             style="border-color:var(--border-color)">
          <sms-skeleton width="40px" height="40px" radius="10px" />
          <div class="flex-1 space-y-1.5">
            <sms-skeleton width="200px" height="14px" />
            <sms-skeleton width="120px" height="11px" />
          </div>
          <sms-skeleton width="60px" height="24px" radius="6px" />
        </div>
      }
    </div>
  `,
})
export class DocumentSkeletonComponent {
  @Input() count = 5;
  get items(): number[] { return Array(this.count).fill(0); }
}

// ── NotificationSkeletonComponent ────────────────────────────────────────────
// Notification list items
@Component({
  selector: 'sms-skeleton-notification',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="flex flex-col">
      @for (_ of items; track $index) {
        <div class="px-4 py-3.5 flex items-start gap-3 border-b" style="border-color:var(--border-color)">
          <sms-skeleton width="36px" height="36px" radius="50%" />
          <div class="flex-1 space-y-1.5">
            <sms-skeleton width="75%" height="13px" />
            <sms-skeleton width="50%" height="11px" />
          </div>
          <sms-skeleton width="55px" height="10px" />
        </div>
      }
    </div>
  `,
})
export class NotificationSkeletonComponent {
  @Input() count = 6;
  get items(): number[] { return Array(this.count).fill(0); }
}

// Re-export base skeletons for convenience
export { SkeletonComponent, SkeletonCardComponent, SkeletonTableComponent };
