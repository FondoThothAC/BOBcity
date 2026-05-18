/**
 * ATDD — Acceptance Test Driven Development
 * CivicPulse / CívicaOS
 * Tests de aceptación desde la perspectiva del cliente final
 * Framework: Playwright Test
 * Ejecutar: npx playwright test atdd/
 */

import { test, expect, Page } from "@playwright/test";

const BASE = "http://localhost:3335";

// ─── Criterios de Aceptación de Negocio ───────────────────────────────────────

test.describe("ATDD › Criterios de Aceptación — Cliente Municipal", () => {

  test("AC-01: Funcionario puede obtener reporte de municipio en < 3 minutos (Nivel 1)", async ({ page }) => {
    await page.goto(BASE);
    const t0 = Date.now();
    await page.getByText("Crisis de Agua en Palo Verde - D8").click();
    await page.getByRole("button", { name: "Ejecutar Flujo de Agentes" }).click();
    await page.waitForSelector('[data-testid="reporte-final"]', { timeout: 180_000 });
    const duracion = (Date.now() - t0) / 1000;
    expect(duracion).toBeLessThan(180);
    await expect(page.locator('[data-testid="reporte-final"]')).toBeVisible();
  });

  test("AC-02: Reporte incluye mapa, gráfica de impacto y plan de 3 fases", async ({ page }) => {
    await page.goto(`${BASE}/reporte/demo`);
    await expect(page.locator('[data-testid="mapa-calor"]')).toBeVisible();
    await expect(page.locator('[data-testid="grafica-impacto"]')).toBeVisible();
    await expect(page.locator('[data-testid="plan-3-fases"]')).toBeVisible();
  });

  test("AC-03: Exportación a OBP genera confirmación visual y hash de transferencia", async ({ page }) => {
    await page.goto(`${BASE}/reporte/demo`);
    await page.getByRole("button", { name: "Exportar a Open Business Plan" }).click();
    await expect(page.locator('[data-testid="modal-obp"]')).toBeVisible();
    await page.getByRole("button", { name: "Confirmar exportación" }).click();
    await expect(page.locator('[data-testid="hash-transferencia"]')).toBeVisible();
    const hash = await page.locator('[data-testid="hash-transferencia"]').textContent();
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("AC-04: Sistema funciona completamente offline (sin internet)", async ({ page, context }) => {
    await context.setOffline(true);
    await page.goto(BASE);
    await expect(page.locator("body")).not.toContainText("Error de red");
    await expect(page.locator('[data-testid="status-local"]')).toContainText("Local");
    await context.setOffline(false);
  });

  test("AC-05: Predictor Electoral muestra probabilidades con margen de error visible", async ({ page }) => {
    await page.goto(`${BASE}/predictor`);
    await page.locator('[data-candidato="A"] input[name="sector"]').fill("seguridad publica");
    await page.locator('[data-candidato="A"] input[name="experiencia"]').fill("8");
    await page.locator('[data-candidato="B"] input[name="sector"]').fill("empresarial");
    await page.locator('[data-candidato="B"] input[name="experiencia"]').fill("0");
    await page.getByRole("button", { name: "Calcular probabilidad" }).click();
    await page.waitForSelector('[data-testid="resultado-predictor"]');
    await expect(page.locator('[data-testid="margen-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="factor-dominante"]')).toBeVisible();
  });
});
