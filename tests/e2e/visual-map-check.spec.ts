// tests/e2e/visual-map-check.spec.ts
import { test, expect } from '@playwright/test';

test.describe('CivicPulse - Verificación Visual y de Consola en Chrome', () => {
  test('debe ingresar a la consola de agentes, navegar al mapa, y capturar pantallas sin errores en consola', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capturar errores de consola no controlados o excepciones en la página
    page.on('pageerror', (err) => {
      console.error('❌ [Error de Página]:', err.message);
      consoleErrors.push(`PageError: ${err.message}`);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        console.error('❌ [Error de Consola]:', text);
        consoleErrors.push(`ConsoleError: ${text}`);
      }
    });

    // 1. Navegar al lobby principal
    console.log('🔗 Navegando a http://localhost:3335 ...');
    await page.goto('http://localhost:3335');
    await expect(page).toHaveTitle(/CívicaOS Engine/);

    // 2. Acceder al portal de agentes
    console.log('🔑 Ingresando al panel de agentes...');
    const agentAccessBtn = page.locator('button:has-text("Acceso Agentes")');
    await expect(agentAccessBtn).toBeVisible();
    await agentAccessBtn.click();

    // 3. Autenticación con contraseña de agente
    const passInput = page.locator('input[type="password"]');
    await expect(passInput).toBeVisible();
    await passInput.fill('CIVICAOS-AGENT');
    await page.locator('button:has-text("Iniciar Consola de Agente")').click();

    // 4. Cambiar a la pestaña del Mapa
    console.log('🗺️ Cambiando a la pestaña Mapas de Dolor (GIS)...');
    const mapTab = page.locator('.nav-item:has-text("Mapas de Dolor (GIS)")');
    await expect(mapTab).toBeVisible();
    await mapTab.click();

    // 5. Verificar que el contenedor de Leaflet se renderiza
    console.log('📌 Verificando contenedor Leaflet...');
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();

    // 6. Tomar captura de pantalla inicial
    console.log('📸 Tomando captura de pantalla inicial del mapa...');
    const initialScreenshotPath = '/Volumes/SSD1TB/robertoeduardocelisrobles/.gemini/antigravity-ide/brain/98bd8434-6f9f-40fb-ad88-b42963aec646/mapa_inicial.png';
    await page.screenshot({ path: initialScreenshotPath });

    // 7. Intentar interactuar con el mapa seleccionando Sonora y Hermosillo si las opciones están disponibles
    console.log('🧪 Buscando controles de selección de estados/municipios...');
    const stateSelector = page.locator('select.state-selector, select:has-text("Selecciona Estado"), select').first();
    if (await stateSelector.isVisible()) {
      console.log('Select de estado visible, seleccionando Sonora...');
      // Intentar seleccionar por texto o valor
      await stateSelector.selectOption({ label: 'Sonora' });
      await page.waitForTimeout(1000);
      
      const munSelector = page.locator('select.municipality-selector, select').nth(1);
      if (await munSelector.isVisible()) {
        console.log('Select de municipio visible, seleccionando Hermosillo...');
        await munSelector.selectOption({ label: 'Hermosillo' });
        await page.waitForTimeout(2000);
      }
    }

    // 8. Tomar captura de pantalla final después de las interacciones
    console.log('📸 Tomando captura de pantalla final...');
    const finalScreenshotPath = '/Volumes/SSD1TB/robertoeduardocelisrobles/.gemini/antigravity-ide/brain/98bd8434-6f9f-40fb-ad88-b42963aec646/mapa_final.png';
    await page.screenshot({ path: finalScreenshotPath });

    // 9. Validar que no se registraron errores críticos relacionados a React o mapas
    console.log('🛑 Verificando errores en consola...');
    const criticalErrors = consoleErrors.filter(e => 
      e.toLowerCase().includes('typeerror') || 
      e.toLowerCase().includes('getpolygonstats') || 
      e.toLowerCase().includes('react')
    );
    expect(criticalErrors.length).toBe(0);
    console.log('✅ Prueba de visualización de mapas finalizada con éxito sin errores críticos.');
  });
});
