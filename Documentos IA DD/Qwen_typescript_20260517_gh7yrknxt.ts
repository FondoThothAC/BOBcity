// features/step-definitions/electoral-prediction.steps.ts (ATDD)
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { runPredictionPipeline } from '../../src/pipelines/prediction';
import { mockLocalOllama } from '../../src/test-utils/mock-ollama';

Given('un distrito {string} con índice socioeconómico {int}', async (name, index) => {
  global.testContext.district = await createTestDistrict(name, index);
});

When('ejecuto el modelo predictivo con historial electoral de {int} ciclos', async (cycles) => {
  const result = await runPredictionPipeline({
    district: global.testContext.district,
    candidate: global.testContext.candidate,
    historicalCycles: cycles,
    localModel: 'qwen2.5:14b', // Tier 1 default
    enableXAI: true
  });
  global.testContext.prediction = result;
});

Then('la probabilidad de victoria debe estar entre {int}% y {int}%', (min, max) => {
  const prob = global.testContext.prediction.winProbability * 100;
  expect(prob).toBeGreaterThanOrEqual(min);
  expect(prob).toBeLessThanOrEqual(max);
});

Then('el informe debe incluir explicación SHAP de los {int} factores principales', (count) => {
  const explanations = global.testContext.prediction.xaiExplanation?.topFactors;
  expect(explanations).toHaveLength(count);
  expect(explanations?.[0]).toHaveProperty('feature', 'socioeconomicIndex');
});