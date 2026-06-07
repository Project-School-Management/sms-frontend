import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from './loading.service';

// ── PageLoaderComponent ───────────────────────────────────────────────────────
// Slim top progress bar — appears during route navigation.
// Inspired by NProgress / YouTube / Linear.
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector:        'sms-page-loader',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule],
  template: `
    @if (loading.navLoading()) {
      <div class="sms-page-loader">
        <div class="sms-page-loader__bar"
             [style.width.%]="loading.progress()">
          <div class="sms-page-loader__glow"></div>
        </div>
      </div>
    }
  `,
  styles: [`
    .sms-page-loader {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 99999;
      overflow: hidden;
      pointer-events: none;
    }

    .sms-page-loader__bar {
      height: 100%;
      background: linear-gradient(90deg, var(--accent) 0%, #818cf8 60%, #a5b4fc 100%);
      transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 0 2px 2px 0;
      position: relative;
      will-change: width;
    }

    .sms-page-loader__glow {
      position: absolute;
      top: -4px;
      right: -6px;
      width: 80px;
      height: 12px;
      border-radius: 50%;
      background: rgba(165, 180, 252, 0.7);
      filter: blur(6px);
      pointer-events: none;
    }
  `],
})
export class PageLoaderComponent {
  protected readonly loading = inject(LoadingService);
}
