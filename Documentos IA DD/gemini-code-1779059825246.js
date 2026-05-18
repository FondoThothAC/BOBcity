import { SwarmManifest } from './swarm_manifest.js';
import { ollamaInference } from './local_llm_connector.js'; // Tu conector local

/**
 * Motor de Orquestación ODAS
 * Ejecuta la pipeline xDD pasando el estado acumulado de agente a agente.
 */
export async function executeSwarmPipeline(initialProblem, tierLevel = 1) {
  console.log(`🚀 Iniciando Enjambre ODAS [Tier Hardware: ${tierLevel}]`);
  console.log(`📥 Input Cívico: ${initialProblem.title}`);

  // El "State" es la memoria compartida del enjambre
  let swarmState = {
    originalProblem: initialProblem,
    domain: null,
    contracts: null,
    mathModel: null,
    tests: null,
    securityClearance: null,
    finalReport: null
  };

  // 1. DDD: Definir el Dominio
  swarmState.domain = await triggerAgent(SwarmManifest.DDD, JSON.stringify(swarmState.originalProblem));
  
  // 2. CDD: Crear el Contrato para OBP
  swarmState.contracts = await triggerAgent(SwarmManifest.CDD, swarmState.domain);

  // 3. MDD & BDD: Modelar las matemáticas y el comportamiento de la simulación (Concurrente)
  const [mathModel, behaviorScenarios] = await Promise.all([
    triggerAgent(SwarmManifest.MDD, swarmState.domain),
    triggerAgent(SwarmManifest.BDD, swarmState.domain)
  ]);
  swarmState.mathModel = mathModel;
  swarmState.behaviorScenarios = behaviorScenarios;

  // 4. TDD & SDD: Auditoría de Reglas y Seguridad (Concurrente)
  const validationPayload = JSON.stringify({
      contracts: swarmState.contracts, 
      model: swarmState.mathModel
  });
  const [testResults, securitySeal] = await Promise.all([
    triggerAgent(SwarmManifest.TDD, validationPayload),
    triggerAgent(SwarmManifest.SDD, validationPayload)
  ]);
  swarmState.tests = testResults;
  swarmState.securityClearance = securitySeal;

  // Evaluar Fallo de TDD
  if (swarmState.tests.includes("FAIL")) {
    throw new Error("🛑 El Enjambre detuvo la ejecución: La política no pasó la auditoría de TDD.");
  }

  // 5. UXDD: Redacción del Plan de Ataque Final
  const finalContext = JSON.stringify({
    problem: swarmState.originalProblem,
    mathImpact: swarmState.mathModel,
    security: swarmState.securityClearance
  });
  
  swarmState.finalReport = await triggerAgent(SwarmManifest.UXDD, finalContext);

  console.log(`✅ Flujo Enjambre Completado. Listo para Exportar a Open Business Plan.`);
  
  return {
    report: swarmState.finalReport,
    safePayloadForOBP: swarmState.contracts,
    auditTrail: swarmState.securityClearance
  };
}

// Función auxiliar para llamar al LLM local
async function triggerAgent(agentConfig, inputData) {
  console.log(`⚡ [${agentConfig.id}] ${agentConfig.name} está procesando...`);
  
  const prompt = `
    ${agentConfig.systemPrompt}
    
    ---- INPUT RECIBIDO ----
    ${inputData}
    
    ---- TU RESPUESTA ESPERADA ----
  `;

  // Aquí conectas con tu API de Ollama/vLLM local
  return await ollamaInference({
    model: agentConfig.model,
    prompt: prompt,
    temperature: 0.2 // Baja temperatura para mantener la precisión lógica
  });
}