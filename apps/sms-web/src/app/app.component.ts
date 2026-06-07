import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationLoaderService, PageLoaderComponent } from '@sms/shared/ui';

@Component({
  selector:        'sms-root',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [RouterOutlet, PageLoaderComponent],
  template: `
    <!-- Top navigation progress bar (route transitions) -->
    <sms-page-loader />
    <!-- App shell -->
    <router-outlet />
  `,
})
export class AppComponent implements OnInit {
  private readonly _navLoader = inject(NavigationLoaderService);

  ngOnInit(): void {
    // Wire router events → loading progress bar
    this._navLoader.init();

    // Remove splash screen with a smooth fade once Angular has bootstrapped
    const splash = document.getElementById('sms-splash');
    if (splash) {
      // Small delay ensures the first paint is ready before fade-out
      setTimeout(() => {
        splash.classList.add('sms-splash--hidden');
        setTimeout(() => splash.remove(), 450);
      }, 400);
    }
  }
}
