// playwright.config.js
// Configuración de Playwright para pruebas E2E y de regresión visual
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    actionTimeout: 10000,
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'python3 simulation/api_server.py',
      url: 'http://localhost:5001/api/secciones?estado=26',
      reuseExistingServer: true,
      timeout: 15000,
    },
    {
      command: 'npm run dev -- --port 3335',
      url: 'http://localhost:3335',
      reuseExistingServer: true,
      timeout: 15000,
    }
  ],
});
