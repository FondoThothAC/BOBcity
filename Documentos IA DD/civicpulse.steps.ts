/**
 * BDD — Step Definitions
 * CivicPulse / CívicaOS
 * Framework: Cucumber-JS + Playwright
 * Archivo: bdd/steps/civicpulse.steps.ts
 */

import { Given, When, Then, Before, After } from "@cucumber/cucumber";
import { Browser, Page, chromium, expect } from "@playwright/test";

let browser: Browser;
let page: Page;
const BASE_URL = "http://localhost:3335";

Before(async () => {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
});

After(async () => {
  await browser.close();
});

// ─── Given ────────────────────────────────────────────────────────────────────

Given("el sistema CivicPulse está corriendo localmente en el puerto {int}", async (puerto: number) => {
  await page.goto(`http://localhost:${puerto}`);
  await expect(page).toHaveTitle(/CivicPulse|CívicaOS/);
});

Given("los modelos Ollama están disponibles \\(Qwen2.5 o Mistral 7B\\)", async () => {
  const response = await page.request.get("http://localhost:11434/api/tags");
  expect(response.status()).toBe(200);
  const body = await response.json();
  const modelos = body.models?.map((m: { name: string }) => m.name) ?? [];
  const tieneModelo = modelos.some((m: string) =>
    m.includes("qwen") || m.includes("mistral") || m.includes("llama")
  );
  expect(tieneModelo).toBeTruthy();
});

Given("los datos del INE y INEGI para Hermosillo, Sonora están cargados", async () => {
  await page.goto(`${BASE_URL}/api/health/data`);
  const body = await page.evaluate(() => document.body.innerText);
  const json = JSON.parse(body);
  expect(json.ine_hermosillo).toBe("loaded");
  expect(json.inegi_sonora).toBe("loaded");
});

Given("el usuario selecciona la iniciativa {string}", async (iniciativa: string) => {
  await page.goto(`${BASE_URL}`);
  await page.getByRole("button", { name: "Orquestador OpenClaw" }).click();
  await page.getByText(iniciativa).click();
  await expect(page.getByText(iniciativa)).toHaveClass(/selected|active/);
});

Given("el usuario está en la sección {string}", async (seccion: string) => {
  await page.goto(`${BASE_URL}`);
  await page.getByRole("button", { name: seccion }).click();
  await expect(page.locator("h1, h2").first()).toContainText(seccion);
});

Given("el usuario escribe en el campo de texto {string}", async (texto: string) => {
  await page.goto(`${BASE_URL}`);
  await page.getByRole("button", { name: "Orquestador OpenClaw" }).click();
  await page.locator("textarea[placeholder*='iniciativa']").fill(texto);
});

Given("el sistema tiene cargados los resultados del PREP {int} y {int} para Sonora",
  async (año1: number, año2: number) => {
    const r1 = await page.request.get(`${BASE_URL}/api/electoral/prep/${año1}/sonora`);
    const r2 = await page.request.get(`${BASE_URL}/api/electoral/prep/${año2}/sonora`);
    expect(r1.status()).toBe(200);
    expect(r2.status()).toBe(200);
  }
);

Given("el análisis ha finalizado y el reporte está listo", async () => {
  await page.getByRole("button", { name: "Ejecutar Flujo de Agentes" }).click();
  await page.waitForSelector('[data-testid="reporte-final"]', { timeout: 180000 });
});

// ─── When ─────────────────────────────────────────────────────────────────────

When("el usuario hace clic en {string}", async (boton: string) => {
  await page.getByRole("button", { name: boton }).click();
});

When("el usuario activa el filtro {string}", async (filtro: string) => {
  await page.getByLabel(filtro).check();
  await page.waitForTimeout(500);
});

When("el mapa se actualiza", async () => {
  await page.waitForSelector('[data-testid="mapa-calor"]', { timeout: 10000 });
});

When("el flujo completo de orquestación se ejecuta", async () => {
  await page.getByRole("button", { name: "Ejecutar Flujo de Agentes" }).click();
  await page.waitForSelector('[data-testid="flujo-completo"]', { timeout: 300000 });
});

When("el sistema calcula la probabilidad", async () => {
  await page.getByRole("button", { name: "Calcular probabilidad de victoria" }).click();
  await page.waitForSelector('[data-testid="resultado-predictor"]', { timeout: 30000 });
});

When("el análisis termina", async () => {
  await page.waitForSelector('[data-testid="auditlog-completo"]', { timeout: 180000 });
});

// ─── Then ─────────────────────────────────────────────────────────────────────

Then("el agente {string} debe completarse en menos de {int} segundos", async (agente: string, segundos: number) => {
  const selector = `[data-agente="${agente}"][data-status="success"]`;
  await page.waitForSelector(selector, { timeout: segundos * 1000 });
  const elemento = page.locator(selector);
  await expect(elemento).toBeVisible();
});

Then("el agente {string} debe detectar al menos {int} puntos de dolor georreferenciados",
  async (agente: string, minPuntos: number) => {
    const texto = await page.locator(`[data-agente="${agente}"] [data-resultado]`).textContent();
    const match = texto?.match(/(\d+)\s+punto/i);
    const cantidad = match ? parseInt(match[1]) : 0;
    expect(cantidad).toBeGreaterThanOrEqual(minPuntos);
  }
);

Then("el reporte final debe incluir una sección {string}", async (seccion: string) => {
  const reporte = page.locator('[data-testid="reporte-final"]');
  await expect(reporte).toContainText(seccion);
});

Then("el registro de auditoría local debe mostrar un hash SHA-256 único", async () => {
  const hashes = await page.locator('[data-testid="audit-hash"]').allTextContents();
  const unicos = new Set(hashes);
  expect(unicos.size).toBe(hashes.length);
  hashes.forEach((h) => expect(h).toMatch(/^[a-f0-9]{64}$/));
});

Then("el mapa debe mostrar zonas en rojo con intensidad proporcional a los reportes", async () => {
  const zonasCriticas = page.locator('[data-intensidad="alta"]');
  await expect(zonasCriticas.first()).toBeVisible();
  const count = await zonasCriticas.count();
  expect(count).toBeGreaterThan(0);
});

Then("la suma de probabilidades de A y B debe ser {int}%", async (suma: number) => {
  const probA = parseFloat(
    (await page.locator('[data-candidato="A"] [data-prob]').textContent()) ?? "0"
  );
  const probB = parseFloat(
    (await page.locator('[data-candidato="B"] [data-prob]').textContent()) ?? "0"
  );
  expect(Math.round(probA + probB)).toBe(suma);
});

Then("el registro de auditoría debe contener al menos {int} entradas \\(una por agente\\)",
  async (minEntradas: number) => {
    const entradas = page.locator('[data-testid="audit-entry"]');
    const count = await entradas.count();
    expect(count).toBeGreaterThanOrEqual(minEntradas);
  }
);

Then("ningún registro debe mostrar llamadas a APIs externas durante el proceso", async () => {
  const llamadasExternas = page.locator('[data-estado-local="false"]');
  expect(await llamadasExternas.count()).toBe(0);
});

Then("debe mostrarse un modal con el contenido exacto del payload JSON a enviar", async () => {
  const modal = page.locator('[data-testid="modal-obp"]');
  await expect(modal).toBeVisible();
  const contenido = await modal.textContent();
  expect(contenido).toMatch(/\{[\s\S]*"iniciativa"[\s\S]*\}/);
});

Then("el tiempo total debe ser menor a {string} segundos", async (tiempoMax: string) => {
  const tiempoEl = page.locator('[data-testid="tiempo-procesamiento"]');
  const texto = await tiempoEl.textContent();
  const tiempo = parseFloat(texto ?? "9999");
  expect(tiempo).toBeLessThan(parseFloat(tiempoMax));
});
