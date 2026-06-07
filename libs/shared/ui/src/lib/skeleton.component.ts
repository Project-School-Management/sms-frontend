import {
  ChangeDetectionStrategy, Component, Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ── SkeletonComponent ─────────────────────────────────────────────────────────
// Animated shimmer placeholder for loading states.
// Usage:
//   <sms-skeleton />                          → full-width text line
//   <sms-skeleton width="60%" />              → partial-width text line
//   <sms-skeleton height="200px" />           → tall block (card placeholder)
//   <sms-skeleton radius="50%" height="40px" width="40px" /> → avatar circle
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector:        'sms-skeleton',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule],
  template: `
    <div class="sms-skeleton"
         [style.width]="width"
         [style.height]="height"
         [style.border-radius]="radius">
    </div>
  `,
  styles: [`
    .sms-skeleton {
      display: block;
      background: linear-gradient(
        90deg,
        var(--surface-2)   0%,
        var(--border-color) 50%,
        var(--surface-2)   100%
      );
      background-size: 400% 100%;
      animation: sms-shimmer 1.6s ease-in-out infinite;
    }

    @keyframes sms-shimmer {
      0%   { background-position: 100% 50%; }
      100% { background-position:   0% 50%; }
    }
  `],
})
export class SkeletonComponent {
  @Input() width  = '100%';
  @Input() height = '16px';
  @Input() radius = '6px';
}

// ── SkeletonCardComponent ─────────────────────────────────────────────────────
// Pre-built skeleton for a standard KPI card
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector:        'sms-skeleton-card',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [SkeletonComponent],
  template: `
    <div class="sms-card p-5 space-y-4">
      <div class="flex justify-between">
        <sms-skeleton width="40px" height="40px" radius="10px" />
        <sms-skeleton width="56px" height="24px" radius="12px" />
      </div>
      <sms-skeleton width="80px" height="36px" />
      <sms-skeleton width="60%" height="14px" />
      <div class="flex items-end gap-px" style="height: 32px">
        @for (_ of bars; track $index) {
          <sms-skeleton [width]="'100%'" [height]="heights[$index]" radius="2px" />
        }
      </div>
      <sms-skeleton width="50%" height="12px" />
    </div>
  `,
})
export class SkeletonCardComponent {
  bars    = [1,2,3,4,5,6,7,8,9,10,11,12];
  heights = ['60%','70%','55%','80%','65%','75%','70%','85%','80%','90%','92%','100%'];
}

// ── SkeletonTableComponent ────────────────────────────────────────────────────
// Pre-built skeleton for a table with N rows
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector:        'sms-skeleton-table',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [SkeletonComponent],
  template: `
    <div class="sms-card overflow-hidden">
      <!-- Header -->
      <div class="px-5 py-4 flex gap-4" style="border-bottom: 1px solid var(--border-color)">
        <sms-skeleton width="120px" height="20px" />
        <sms-skeleton width="80px"  height="20px" />
        <sms-skeleton width="100px" height="20px" />
        <sms-skeleton width="90px"  height="20px" />
      </div>
      <!-- Rows -->
      @for (_ of rows; track $index) {
        <div class="px-5 py-4 flex items-center gap-4"
             [style.border-top]="$index > 0 ? '1px solid var(--border-color)' : 'none'">
          <sms-skeleton width="32px" height="32px" radius="8px" />
          <sms-skeleton width="140px" height="14px" />
          <sms-skeleton width="100px" height="14px" />
          <sms-skeleton width="80px"  height="14px" />
          <sms-skeleton width="56px"  height="22px" radius="11px" />
        </div>
      }
    </div>
  `,
})
export class SkeletonTableComponent {
  @Input() rows: number[] = [1, 2, 3, 4, 5];
}
