import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

const BASE_CONFIG: MatSnackBarConfig = {
  horizontalPosition: 'right',
  verticalPosition:   'top',
  duration:           4000,
};

const CONFIGS: Record<ToastType, MatSnackBarConfig & { panelClass: string[] }> = {
  success: { ...BASE_CONFIG, panelClass: ['sms-toast', 'sms-toast--success'] },
  error:   { ...BASE_CONFIG, duration: 6000, panelClass: ['sms-toast', 'sms-toast--error'] },
  warning: { ...BASE_CONFIG, panelClass: ['sms-toast', 'sms-toast--warning'] },
  info:    { ...BASE_CONFIG, panelClass: ['sms-toast', 'sms-toast--info'] },
};

const ICONS: Record<ToastType, string> = {
  success: '✔',
  error:   '✖',
  warning: '⚠',
  info:    'ℹ',
};

/**
 * Toast notifications using MatSnackBar.
 * Add the following global CSS to styles.scss once:
 *
 *   .sms-toast            { border-radius: 10px !important; font-size: 14px; }
 *   .sms-toast--success   { background: #16a34a !important; color: #fff !important; }
 *   .sms-toast--error     { background: #dc2626 !important; color: #fff !important; }
 *   .sms-toast--warning   { background: #d97706 !important; color: #fff !important; }
 *   .sms-toast--info      { background: #2563eb !important; color: #fff !important; }
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, duration = 4000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 6000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 5000): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }

  private show(message: string, type: ToastType, duration: number): void {
    this.snackBar.open(
      `${ICONS[type]}  ${message}`,
      '✕',
      { ...CONFIGS[type], duration },
    );
  }
}
