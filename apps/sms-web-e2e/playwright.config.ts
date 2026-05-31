import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — SMS E2E (Sprint 10)
 * 5 flows principaux :
 *   1. Login Keycloak PKCE
 *   2. CRUD élève complet
 *   3. Saisie notes + bulletin
 *   4. Virement frais de scolarité
 *   5. Envoi message + notification WS
 */
export default defineConfig({
  testDir:    './src',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries:    process.env['CI'] ? 2 : 0,
  workers:    process.env['CI'] ? 1 : undefined,
  reporter:   'html',

  use: {
    baseURL:       'http://localhost:4200',
    trace:         'on-first-retry',
    screenshot:    'only-on-failure',
    video:         'retain-on-failure',
    actionTimeout:  15_000,
  },

  projects: [
    {
      name:  'chromium',
      use:   { ...devices['Desktop Chrome'] },
    },
    {
      name:  'Mobile Chrome',
      use:   { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command:            'npx nx serve sms-web',
    url:                'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout:            120_000,
  },
});
