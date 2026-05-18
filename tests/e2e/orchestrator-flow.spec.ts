// tests/e2e/orchestrator-flow.spec.ts
// ATDD: Acceptance Test-Driven Development flow

import { test, expect } from '@playwright/test';

test.describe('CivicPulse - Consola de Orquestación E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local development preview
    await page.goto('http://localhost:3335');
  });

  test('debe navegar exitosamente a la consola del orquestador', async ({ page }) => {
    // Click navigation button for Orchestrator
    const navLink = page.locator('button:has-text("Orquestador OpenClaw")');
    await expect(navLink).toBeVisible();
    await navLink.click();

    // Verify view headers render correctly
    const title = page.locator('h2:has-text("Consola de Orquestación Swarm")');
    await expect(title).toBeVisible();
  });

  test('debe permitir seleccionar una iniciativa cívica y correr la simulación', async ({ page }) => {
    // Go to console
    await page.locator('button:has-text("Orquestador OpenClaw")').click();

    // Select preconfigured card
    const card = page.locator('button:has-text("Crisis de Agua en Palo Verde - D8")');
    await expect(card).toBeVisible();
    await card.click();

    // Trigger orchestration execution
    const runBtn = page.locator('button:has-text("Ejecutar")');
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // Wait for agent flows to complete sequential nodes
    await page.waitForTimeout(6000);

    // Verify export triggers successfully
    const exportBtn = page.locator('button:has-text("Exportar a Open Business Plan")');
    await expect(exportBtn).toBeVisible();
  });

  test('debe garantizar procesamiento local sin llamadas externas a la nube', async ({ page }) => {
    const interceptedRequests: string[] = [];

    // Track network requests
    page.on('request', (req) => {
      const url = req.url();
      if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
        interceptedRequests.push(url);
      }
    });

    // Go to console and execute simulation
    await page.locator('button:has-text("Orquestador OpenClaw")').click();
    await page.locator('button:has-text("Crisis de Agua en Palo Verde - D8")').click();
    await page.locator('button:has-text("Ejecutar")').click();

    await page.waitForTimeout(6000);

    // Assert that no cloud-based external API endpoints were hit during local execution
    expect(interceptedRequests.length).toBe(0);
  });
});
