import { Injectable, signal, computed } from '@angular/core';
import { MonoTypeOperatorFunction } from 'rxjs';
import { tap, finalize }            from 'rxjs/operators';

// ── Loading Service ───────────────────────────────────────────────────────────
// Central hub for all loading states across the application.
// Manages both navigation progress and HTTP request indicators.
// Anti-flicker: loader appears only after 200ms, hides after min 400ms.
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class LoadingService {

  // ── Private state ───────────────────────────────────────────────────────────
  private readonly _httpCount    = signal(0);
  private readonly _navActive    = signal(false);
  private readonly _progress     = signal(0);
  private readonly _message      = signal('Chargement...');

  private _progressTimer: ReturnType<typeof setInterval> | null = null;
  private _showTimers    = new Set<ReturnType<typeof setTimeout>>();
  private _hideTimers    = new Set<ReturnType<typeof setTimeout>>();

  // ── Public read-only signals ────────────────────────────────────────────────
  readonly navLoading  = this._navActive.asReadonly();
  readonly progress    = this._progress.asReadonly();
  readonly message     = this._message.asReadonly();
  readonly httpLoading = computed(() => this._httpCount() > 0);

  // ── Navigation loader ───────────────────────────────────────────────────────

  /** Call when a route navigation starts */
  startNavigation(): void {
    this._navActive.set(true);
    this._progress.set(5);
    this._simulateProgress();
  }

  /** Call when navigation completes (success, error, or cancel) */
  endNavigation(): void {
    this._clearProgressTimer();
    this._progress.set(100);
    const t = setTimeout(() => {
      this._navActive.set(false);
      this._progress.set(0);
      this._hideTimers.delete(t);
    }, 350);
    this._hideTimers.add(t);
  }

  // ── HTTP / manual loader ────────────────────────────────────────────────────

  /** Increment active request count (with 200ms anti-flicker delay) */
  increment(message = 'Chargement...'): void {
    this._message.set(message);
    this._httpCount.update(n => n + 1);
  }

  /** Decrement active request count */
  decrement(): void {
    this._httpCount.update(n => Math.max(0, n - 1));
  }

  // ── RxJS operator ───────────────────────────────────────────────────────────

  /** Wrap an Observable to auto-show/hide the loader */
  withLoader<T>(message?: string): MonoTypeOperatorFunction<T> {
    return (source$) => source$.pipe(
      tap(() => this.increment(message)),
      finalize(() => this.decrement()),
    );
  }

  // ── Internal ────────────────────────────────────────────────────────────────

  private _simulateProgress(): void {
    this._clearProgressTimer();
    let val = 5;
    this._progressTimer = setInterval(() => {
      if (!this._navActive()) {
        this._clearProgressTimer();
        return;
      }
      const remaining = 88 - val;
      val += remaining * 0.09 + 0.5;
      this._progress.set(Math.min(88, val));
      if (val >= 88) this._clearProgressTimer();
    }, 60);
  }

  private _clearProgressTimer(): void {
    if (this._progressTimer !== null) {
      clearInterval(this._progressTimer);
      this._progressTimer = null;
    }
  }
}
