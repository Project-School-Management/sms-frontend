import { Injectable, inject } from '@angular/core';
import {
  Router, NavigationStart, NavigationEnd,
  NavigationCancel, NavigationError,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoadingService } from './loading.service';

// ── Navigation Loader Service ─────────────────────────────────────────────────
// Subscribes to Angular Router events and drives the top progress bar.
// Call init() once from AppComponent.ngOnInit().
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class NavigationLoaderService {

  private readonly _router  = inject(Router);
  private readonly _loading = inject(LoadingService);

  /** Wire the router events to the loading service. Call once at app startup. */
  init(): void {
    this._router.events
      .pipe(
        filter(
          e =>
            e instanceof NavigationStart  ||
            e instanceof NavigationEnd    ||
            e instanceof NavigationCancel ||
            e instanceof NavigationError,
        ),
      )
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this._loading.startNavigation();
        } else {
          this._loading.endNavigation();
        }
      });
  }
}
