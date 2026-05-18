import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  Search, 
  FileText, 
  Folder, 
  Cpu, 
  Database, 
  Layers, 
  AlertCircle, 
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  Code
} from 'lucide-react';

export default function SyntoWiki() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);
  const [vaultFilter, setVaultFilter] = useState('all'); // 'all', 'wiki', 'raw', 'drafts'
  const [brainLogs, setBrainLogs] = useState([
    "🧠 [Claude Brain Skill] Inicializado en el repositorio.",
    "📁 [Vault Scanner] Enlazadas 14 notas activas en Obsidian Vault.",
    "🔗 [Vault Linker] 0 enlaces rotos detectados."
  ]);
  const [queryResult, setQueryResult] = useState(null);

  // Core vault notes matching SPEC.md and actual platform context
  const [articles, setArticles] = useState([
    {
      id: 'civicaos-core.md',
      title: 'civicaos-core.md',
      type: 'wiki',
      tags: ['civicaos', 'spec', 'local-first'],
      date: '2026-05-18',
      author: 'Antigravity / Roberto Celis',
      content: `---
created: 2026-05-18
type: core_spec
status: active
tags: [civicaos, spec, local-first]
---

# ⬡ CívicaOS Engine · Core Specification

## 🎯 Propósito
Plataforma de inteligencia cívica predictiva, 100% local-first, para:
- Detectar puntos de dolor ciudadano (GIS + NLP)
- Simular impacto de políticas públicas (ABM)
- Predecir escenarios electorales (XGBoost + explicabilidad)
- Exportar soluciones ejecutables (Open Business Plan)

## 🧱 Arquitectura de Referencia
\`\`\`
Tier 1 (M4 16GB): gemma4:e4b + qwen2.5:14b + PostGIS + Neo4j (local)
Tier 2 (DGX): qwen2.5:72b + fine-tuning LoRA + ABM masivo
Tier 3 (H100): entrenamiento federado + RL + simulación nacional
\`\`\`

## 🔐 Principios No Negociables
1. Zero datos crudos salen del entorno local del cliente.
2. Cada operación genera hash SHA256 para auditoría.
3. Consentimiento granular y revocable para captura ciudadana.
4. Explicabilidad obligatoria: toda predicción incluye drivers.

## 🗂️ Estructura de Vault (Synto)
\`\`\`
~/civicaos-wiki/
├── raw/              # Notas crudas (ingesta manual/auto)
├── wiki/             # Artículos aprobados (publicables)
├── drafts/           # Borradores pendientes de revisión
├── sessions/         # Logs de ejecución de OpenClaw
└── .obsidian/        # Configuración de Obsidian
\`\`\``
    },
    {
      id: 'proyectos-activos.md',
      title: 'proyectos-activos.md',
      type: 'wiki',
      tags: ['hermosillo', 'agua', 'active-projects'],
      date: '2026-05-17',
      author: 'SuperAgentOrchestrator',
      content: `---
created: 2026-05-17
type: dynamic_status
project: HER-DIS-08
tags: [hermosillo, agua, active-projects]
---

# Proyectos Cívicos Activos: Hermosillo

## 1. Pozos y Cisternas Inteligentes Hermosillo Sur (HER-DIS-08)
- **Sector**: Agua y Saneamiento
- **Ubicación**: Palo Verde, Hermosillo, Sonora (Distrito 8)
- **Estado**: Simulación Completada. Aprobado para exportación a OBP.
- **Dolor Territorial de Origen**: Severidad del agua indexada en 0.72. Cortes intermitentes los fines de semana.
- **Plan de Ataque**:
  - Inversión de $85.4 MDP (Esquema mixto público-privado).
  - Integración de cisternas IoT locales con control descentralizado en SQLite local-first.
  - Conexión del modelo financiero con OpenBusinessPlan v2.5 para la administración cooperativa.

## 2. Subsidios Estudiantiles Distrito 6 (MORENA-SONORA-2026)
- **Sector**: Movilidad y Transporte
- **Estado**: Análisis Inicial.
- **Dolor Territorial**: 0.85 en movilidad durante horas pico en zona de maquilas y universidades.`
    },
    {
      id: 'privacy-compliance.md',
      title: 'privacy-compliance.md',
      type: 'wiki',
      tags: ['privacy', 'compliance', 'gdpr', 'lgpd'],
      date: '2026-05-18',
      author: 'AuditAgent',
      content: `---
created: 2026-05-18
type: compliance_policy
status: active
tags: [privacy, compliance, gdpr, lgpd]
---

# Política de Cumplimiento de Privacidad y Zero-Trust

## 🛡️ Principios Generales
El Gemelo Digital de CívicaOS opera exclusivamente en el servidor on-premise local del cliente. No se realizan conexiones salientes con datos personales identificables (PII).

## 🔒 Consentimiento del Ciudadano (ThothAgora)
1. **Captura Desvinculada**: La CURP y el Código Postal se utilizan para timbrado criptográfico y firma del gemelo digital, pero nunca se guardan en texto plano en la base de datos central.
2. **Generación de Hash**: La firma SHA-256 de la opinión cívica se asocia a la cédula de participación ciudadana de forma inmutable, garantizando transparencia.
3. **Control Total**: El ciudadano autoriza de forma explícita y revocable tres capas de análisis:
   - Capa GIS (Geolocalización del descontento).
   - Capa NLP (Análisis de sentimiento temático).
   - Capa Psicográfica (Ponderación de valores).`
    },
    {
      id: 'opinion_asalariado_raw.md',
      title: 'opinion_asalariado_raw.md',
      type: 'raw',
      tags: ['thothagora', 'raw-ingestion', 'agua'],
      date: '2026-05-18',
      author: 'ThothAgora Ingestion',
      content: `---
created: 2026-05-18
project: HER-DIS-08
type: citizen_capture
tags: [thothagora, raw-ingestion, agua]
audit_hash: a4f89d3c5e2197e884b80b27e8a93e8274cf8f2e2764a2f8b5f39e38c92a9b3d
---

# Ingesta Automática: Cédula Ciudadana

\`\`\`json
{
  "sector": "asalariado",
  "district": "HER-DIS-08",
  "water_pain": 0.85,
  "transit_pain": 0.50,
  "potholes_pain": 0.30,
  "safety_pain": 0.65,
  "proposal": "Pavimentación urgente de la calzada de Palo Verde y regularización del tandeo de agua los fines de semana."
}
\`\`\``
    },
    {
      id: 'draft-water-obp-proposal.md',
      title: 'draft-water-obp-proposal.md',
      type: 'drafts',
      tags: ['obp-draft', 'water-infrastructure'],
      date: '2026-05-18',
      author: 'ReportWriterAgent',
      content: `---
created: 2026-05-18
project: HER-DIS-08
type: business_proposal
status: draft
tags: [obp-draft, water-infrastructure]
---

# Borrador de Propuesta Ejecutiva para Open Business Plan

## Proyecto: Red de Pozos Inteligentes Palo Verde
- **ID**: OBP-BP-2026-004
- **CAPEX estimado**: $85.4 MDP
- **Horizonte**: 5 años
- **Población Directa Impactada**: 45,000 ciudadanos

### Resumen Ejecutivo
Basado en las cédulas ingestas en ThothAgora y la simulación multi-agente ejecutada localmente en CivicPulse, la dotación focalizada de agua reduce el descontento hídrico territorial a 3 años en un 32% y eleva la felicidad general del distrito del 38% al 60%.`
    }
  ]);

  // Execute Simulated Synto Natural Language Query
  const handleSyntoQuery = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsQuerying(true);
    setQueryResult(null);

    // Dynamic responses matching actual query inputs
    setTimeout(() => {
      let response = {
        answer: "No se encontraron artículos con información suficiente en el Vault local de Obsidian para responder a tu consulta. Intenta reformular con palabras clave como 'agua', 'dolor', o 'arquitectura'.",
        sources: [],
        confidence: 0,
        tokens: 0,
        speed: 0
      };

      const q = searchQuery.toLowerCase();
      if (q.includes('agua') || q.includes('dolor') || q.includes('hermosillo') || q.includes('palo verde')) {
        response = {
          answer: "De acuerdo al artículo **[[proyectos-activos.md]]** y las quejas raw recolectadas en **[[opinion_asalariado_raw.md]]**, el mayor punto de dolor cívico en Hermosillo se encuentra en el **Distrito 8 (Palo Verde)** con una severidad crítica de agua indexada en **0.72**. La simulación ABM local proyecta que una inversión mixta de **$85.4 MDP** para cisternas inteligentes IoT e infraestructura local reducirá el descontento en un **32%** a 3 años, elevando la felicidad agregada del sector asalariado. El plan de acción está redactado como borrador en **[[draft-water-obp-proposal.md]]** listo para exportar a **Open Business Plan**.",
          sources: ['proyectos-activos.md', 'opinion_asalariado_raw.md', 'draft-water-obp-proposal.md'],
          confidence: 96,
          tokens: 412,
          speed: 34.5 // ms/token
        };
      } else if (q.includes('arquitectura') || q.includes('local') || q.includes('tier') || q.includes('m4')) {
        response = {
          answer: "El sistema **CívicaOS Engine** está diseñado bajo una arquitectura estrictamente local-first (100% on-premise) para garantizar privacidad absoluta, de acuerdo al artículo **[[civicaos-core.md]]** y **[[privacy-compliance.md]]**. En el **Nivel 1 (Mac Mini M4 16GB)** se ejecutan modelos compactos como `gemma3` y `qwen2.5:14b` localmente con Ollama. El procesamiento de población sintética soporta hasta **10,000 agentes** virtuales en este nivel, mientras que las bases PostGIS y SQLite procesan geolocalización y datos demográficos locales sin enviar PII a la nube.",
          sources: ['civicaos-core.md', 'privacy-compliance.md'],
          confidence: 98,
          tokens: 356,
          speed: 32.8
        };
      }

      setQueryResult(response);
      setIsQuerying(false);

      // Log in the Claude Brain terminal
      setBrainLogs(prev => [
        ...prev,
        `🤖 [Synto Local LLM] Query procesada con éxito: "${searchQuery}"`,
        `🔍 [Ollama Inferencia] Modelo activo: qwen2.5:14b | Confianza: ${response.confidence}% | Tokens: ${response.tokens}`
      ]);

      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: { message: `Synto: Consulta completada (${response.confidence}% de confianza)`, type: 'success' }
      }));

    }, 1500);
  };

  // Run Claude Brain integration operations
  const runBrainAction = (action) => {
    window.dispatchEvent(new CustomEvent('civic-toast', {
      detail: { message: `Ejecutando acción de cerebro local: ${action}`, type: 'info' }
    }));

    if (action === 'ingest') {
      setBrainLogs(prev => [
        ...prev,
        `📥 [Claude Brain Skill] Ejecutando: /brain ingest ...`,
        `📝 [Claude Brain Ingest] Guardada sesión de desarrollo activa en 'brain/sessions/session_active.md'.`,
        `✅ [Sync] Vault de Obsidian actualizado exitosamente.`
      ]);
    } else if (action === 'lint') {
      setBrainLogs(prev => [
        ...prev,
        `🧹 [Claude Brain Skill] Ejecutando: /brain lint ...`,
        `🔍 [Linter] Verificando referencias y wikilinks...`,
        `✅ [Linter] 0 enlaces rotos o notas huérfanas encontradas. Estructura limpia.`
      ]);
    }
  };

  // Filter notes to display in the list
  const filteredArticles = articles.filter(art => {
    const matchesFilter = vaultFilter === 'all' || art.type === vaultFilter;
    const matchesSearch = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Title Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }} className="glass-card">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Brain size={24} className="neon-icon" style={{ color: 'var(--neon-emerald)' }} />
            LLM Wiki Local (Obsidian & Synto) & Claude Brain Skill
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Base de conocimiento auto-generada localmente y sincronizada con tu Obsidian Vault privado.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => runBrainAction('ingest')}
            className="btn-outline" 
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          >
            <Code size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />
            /brain Ingest
          </button>
          <button 
            onClick={() => runBrainAction('lint')}
            className="btn-outline" 
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          >
            /brain Lint
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem' }} className="responsive-grid">
        
        {/* Left Side: Vault Explorer */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.45)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
              <Folder size={18} style={{ color: 'var(--neon-blue)' }} />
              Explorador del Vault
            </h3>
            <span className="chip chip-cyan" style={{ fontSize: '0.65rem' }}>Local Vault</span>
          </div>

          {/* Vault category selector buttons */}
          <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            <button 
              onClick={() => setVaultFilter('all')}
              className={`btn-tab ${vaultFilter === 'all' ? 'active' : ''}`}
              style={{ flex: 1, fontSize: '0.7rem', padding: '0.3rem', background: vaultFilter === 'all' ? 'rgba(255,255,255,0.06)' : 'transparent', color: vaultFilter === 'all' ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Todos
            </button>
            <button 
              onClick={() => setVaultFilter('wiki')}
              className={`btn-tab ${vaultFilter === 'wiki' ? 'active' : ''}`}
              style={{ flex: 1, fontSize: '0.7rem', padding: '0.3rem', background: vaultFilter === 'wiki' ? 'rgba(16, 185, 129, 0.15)' : 'transparent', color: vaultFilter === 'wiki' ? 'var(--neon-emerald)' : 'var(--text-secondary)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              wiki/
            </button>
            <button 
              onClick={() => setVaultFilter('raw')}
              className={`btn-tab ${vaultFilter === 'raw' ? 'active' : ''}`}
              style={{ flex: 1, fontSize: '0.7rem', padding: '0.3rem', background: vaultFilter === 'raw' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', color: vaultFilter === 'raw' ? 'var(--neon-blue)' : 'var(--text-secondary)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              raw/
            </button>
            <button 
              onClick={() => setVaultFilter('drafts')}
              className={`btn-tab ${vaultFilter === 'drafts' ? 'active' : ''}`}
              style={{ flex: 1, fontSize: '0.7rem', padding: '0.3rem', background: vaultFilter === 'drafts' ? 'rgba(245, 158, 11, 0.15)' : 'transparent', color: vaultFilter === 'drafts' ? 'var(--neon-amber)' : 'var(--text-secondary)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              drafts/
            </button>
          </div>

          {/* Article items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
            {filteredArticles.map(art => (
              <div 
                key={art.id}
                onClick={() => setActiveArticle(art)}
                style={{
                  padding: '0.75rem',
                  background: activeArticle?.id === art.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid',
                  borderColor: activeArticle?.id === art.id ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-glass)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <FileText size={18} style={{ 
                  color: art.type === 'wiki' 
                    ? 'var(--neon-emerald)' 
                    : art.type === 'raw' 
                      ? 'var(--neon-blue)' 
                      : 'var(--neon-amber)' 
                }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: activeArticle?.id === art.id ? '#fff' : 'var(--text-primary)' }}>{art.title}</h4>
                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem' }}>
                    {art.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>#{t}</span>
                    ))}
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            ))}
            {filteredArticles.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '2rem 0' }}>
                Ninguna nota encontrada en esta carpeta.
              </div>
            )}
          </div>

          {/* Brain / Sync logs terminal */}
          <div style={{ flex: 1, background: '#020408', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.65rem', maxHeight: '160px', overflowY: 'auto' }}>
            <div style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Layers size={10} />
              CLAUDE BRAIN SKILL STATUS
            </div>
            {brainLogs.map((log, idx) => (
              <div key={idx} style={{ color: log.includes('✅') ? 'var(--neon-emerald)' : 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {log}
              </div>
            ))}
          </div>

        </div>

        {/* Right Side: Synto Query & Note Reader */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Synto AI Inferencia Query Form */}
          <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.45)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginBottom: '0.85rem' }}>
              <Brain size={18} style={{ color: 'var(--neon-emerald)' }} />
              Synto AI Engine (Ollama Local)
            </h3>

            <form onSubmit={handleSyntoQuery} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  type="text" 
                  placeholder="Preguntar al vault local (ej. ¿Cuál es el descontento de agua en Palo Verde?)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="premium-input"
                  style={{ width: '100%', paddingLeft: '2.2rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
              </div>
              <button 
                type="submit" 
                disabled={isQuerying}
                className="btn-premium"
                style={{ 
                  background: 'linear-gradient(135deg, var(--neon-emerald) 0%, #047857 100%)',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
                  padding: '0 1.5rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: isQuerying ? 0.6 : 1
                }}
              >
                {isQuerying ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                Preguntar
              </button>
            </form>

            {/* Synto response card */}
            {queryResult && (
              <div style={{ 
                marginTop: '1.25rem', 
                background: 'rgba(16, 185, 129, 0.05)', 
                border: '1px solid rgba(16, 185, 129, 0.25)', 
                borderRadius: '8px', 
                padding: '1.25rem',
                animation: 'scaleIn 0.25s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16, 185, 129, 0.15)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--neon-emerald)', fontWeight: 'bold' }}>
                    <Cpu size={12} />
                    Inferencia: qwen2.5:14b (Tier 1 Local)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Confianza: <strong>{queryResult.confidence}%</strong></span>
                    <span>Tokens: <strong>{queryResult.tokens}</strong></span>
                    <span>Velocidad: <strong>{queryResult.speed} ms/t</strong></span>
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {queryResult.answer}
                </p>

                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Citas del Vault:</span>
                  {queryResult.sources.map(src => (
                    <span 
                      key={src}
                      onClick={() => {
                        const target = articles.find(a => a.id === src);
                        if (target) setActiveArticle(target);
                      }}
                      style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--neon-blue)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '4px', padding: '0.1rem 0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      <FileText size={10} />
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Article markdown viewer */}
          <div className="glass-card" style={{ flex: 1, padding: '1.5rem', background: 'rgba(15, 23, 42, 0.45)', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            {activeArticle ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                
                {/* Note title bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{activeArticle.title}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      <span>Autor: {activeArticle.author}</span>
                      <span>•</span>
                      <span>Sincronizado: {activeArticle.date}</span>
                    </div>
                  </div>
                  <span className={`tag-badge`} style={{
                    background: activeArticle.type === 'wiki' 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : activeArticle.type === 'raw' 
                        ? 'rgba(59, 130, 246, 0.15)' 
                        : 'rgba(245, 158, 11, 0.15)',
                    color: activeArticle.type === 'wiki' 
                      ? 'var(--neon-emerald)' 
                      : activeArticle.type === 'raw' 
                        ? 'var(--neon-blue)' 
                        : 'var(--neon-amber)',
                    borderColor: activeArticle.type === 'wiki' 
                      ? 'var(--neon-emerald)' 
                      : activeArticle.type === 'raw' 
                        ? 'var(--neon-blue)' 
                        : 'var(--neon-amber)'
                  }}>
                    {activeArticle.type.toUpperCase()} VAULT
                  </span>
                </div>

                {/* Markdown text area */}
                <pre style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  background: '#04060b',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5'
                }}>
                  {activeArticle.content}
                </pre>

              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem' }}>
                <BookOpen size={48} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                <span>Ninguna nota seleccionada</span>
                <span style={{ fontSize: '0.75rem' }}>Selecciona un artículo en el explorador del vault para ver su especificación en Markdown.</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
