// tests/e2e/orchestrator-flow.spec.ts
// ATDD: Test written before implementation, validates full user journey

import { test, expect } from '@playwright/test';

test.describe('Orchestrator Console - Full User Journey (ATDD)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3335');
    await page.getByRole('navigation').getByRole('link', { name: /orquestador/i }).click();
  });

  test('puede ejecutar flujo completo y exportar a OBP', async ({ page }) => {
    // Given: Seleccionar iniciativa
    await page.getByText('Crisis de Agua en Palo Verde - D8').click();
    
    // When: Ejecutar flujo
    await page.getByRole('button', { name: /ejecutar flujo/i }).click();
    
    // Then: Verificar animación de agentes
    await expect(page.locator('.agent-node.active')).toHaveCount(1);
    await page.waitForTimeout(3000); // Wait for simulation
    await expect(page.locator('.agent-node.success')).toHaveCount(7);
    
    // And: Verificar logs en terminal
    const terminal = page.locator('.terminal-body');
    await expect(terminal).toContainText('✅ qa_validator completado');
    
    // And: Verificar auditoría local
    const auditTable = page.locator('.audit-log-table');
    await expect(auditTable).toBeVisible();
    await expect(auditTable.locator('tr')).toHaveCountGreaterThan(2);
    
    // When: Exportar a OBP
    const exportPromise = page.waitForResponse(/\/obp-webhook/);
    await page.getByRole('button', { name: /exportar a open business plan/i }).click();
    
    // Then: Modal de éxito
    await expect(page.getByText('✅ Transferencia exitosa')).toBeVisible();
    
    // And: Payload válido enviado (verificar estructura)
    const exportResponse = await exportPromise;
    const payload = await exportResponse.json();
    expect(payload).toMatchObject({
      civicInitiativeId: expect.any(String),
      auditTrail: expect.arrayContaining([
        expect.objectContaining({ action: 'swarm_execution_started' })
      ])
    });
  });

  test('cumple privacidad local-first: no hay requests externas', async ({ page }) => {
    // Given: Configurar interceptor para detectar fugas de datos
    const externalRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
        externalRequests.push(url);
      }
    });

    // When: Ejecutar simulación con datos sensibles simulados
    await page.evaluate(() => {
      // Simular carga de datos INEGI en memoria local
      (window as any).mockSensitiveData = {
        citizens: Array(1000).fill({ id: 'anon', income: 'redacted' }),
        districts: { herm_d8: { painPoints: ['water'] } }
      };
    });
    await page.getByText('Plan de Movilidad Estudiantil - D6').click();
    await page.getByRole('button', { name: /ejecutar/i }).click();
    await page.waitForTimeout(5000);

    // Then: Ninguna request externa fue realizada
    expect(externalRequests).toHaveLength(0);
    
    // And: El log de auditoría confirma procesamiento local
    const auditHash = await page.locator('.audit-entry .hash').first().textContent();
    expect(auditHash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });
});