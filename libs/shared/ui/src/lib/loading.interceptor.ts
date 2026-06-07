import { HttpInterceptorFn } from '@angular/common/http';
import { inject }            from '@angular/core';
import { finalize }          from 'rxjs/operators';
import { LoadingService }    from './loading.service';

// ── Loading HTTP Interceptor ──────────────────────────────────────────────────
// Automatically tracks HTTP requests.
// Skips: assets, fonts, and polling endpoints.
// ─────────────────────────────────────────────────────────────────────────────

const SKIP_PATTERNS = [
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /\/assets\//,
  /ngsw/,
];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip non-API requests to avoid false loading indicators
  const skip = SKIP_PATTERNS.some(p => p.test(req.url));
  if (skip) return next(req);

  const loading = inject(LoadingService);
  loading.increment();

  return next(req).pipe(
    finalize(() => loading.decrement()),
  );
};
