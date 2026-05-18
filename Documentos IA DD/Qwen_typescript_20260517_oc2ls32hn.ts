// src/domain/agents/types.ts (MDD: Generado desde schema/agent-schema.json)
export type AgentRole = 
  | 'orchestrator'    // Coordina el flujo, decide rutas, maneja errores
  | 'data_collector'  // Ingesta INE/INEGI, scraping ético, normalización
  | 'profile_builder' // Matriz de candidatos, clustering, NLP
  | 'simulator'       // Motor ABM, escenarios what-if, métricas
  | 'policy_designer' // Genera propuestas, evalúa viabilidad (BDD rules)
  | 'report_writer'   // Redacta informes, assets, attack plans
  | 'qa_validator'    // Ejecuta tests BDD/TDD, rechaza outputs no conformes
  | 'obp_connector'   // Empaqueta y envía a Open Business Plan

export interface AgentSpec {
  id: string;
  role: AgentRole;
  model: string; // e.g., "qwen2.5:32b", "nemotron-3:70b"
  skills: SkillSpec[];
  constraints: AgentConstraints;
  outputSchema: JSONSchema; // Validación estructural (MDD)
}