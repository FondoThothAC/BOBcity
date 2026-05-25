// src/components/SyntoWiki.jsx
// CDD / UXDD: Módulo de LLM Wiki Local (Obsidian & Synto) con integración de base de conocimiento local-first.
// Todos los comentarios y explicaciones técnicas se encuentran exclusivamente en español.

import React, { useState, useMemo } from 'react';
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
  Code,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Settings,
  HelpCircle,
  FileCode
} from 'lucide-react';

export default function SyntoWiki() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);
  const [vaultFilter, setVaultFilter] = useState('all'); // 'all', 'wiki', 'raw', 'drafts', 'reports'
  const [activeViewMode, setActiveViewMode] = useState('markdown'); // 'markdown', 'json-cache'
  
  // Terminal de logs de sincronización y comandos de Obsidian
  const [brainLogs, setBrainLogs] = useState([
    "🧠 [Claude Brain Skill] Inicializado en el puerto de comunicación local.",
    "📁 [Vault Scanner] Enlazadas 14 notas activas en Obsidian Vault.",
    "🔗 [Vault Linker] 0 enlaces rotos detectados en el grafo.",
    "🔌 [Obsidian CLI] Buscando instancia de Obsidian activa en puerto por defecto..."
  ]);
  const [queryResult, setQueryResult] = useState(null);

  // Overlay para el switcher rápido simulado de Obsidian CLI
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const [switcherQuery, setSwitcherQuery] = useState('');

  // 1. Colección estructurada de artículos (Vault Shape de memoria persistente)
  const [articles, setArticles] = useState([
    {
      id: 'index.md',
      title: 'index.md',
      type: 'wiki',
      tags: ['inicio', 'portal', 'dashboard'],
      date: '2026-05-18',
      author: 'Antigravity / Roberto Celis',
      frontmatter: {
        created: '2026-05-18',
        type: 'index_page',
        status: 'active',
        tags: ['inicio', 'portal', 'dashboard']
      },
      content: `# ⬡ CívicaOS Engine · Bóveda de Conocimiento
Bienvenido al Oráculo del Ágora. Este repositorio contiene notas interconectadas mediante [[wikilinks]] que componen el gemelo digital demográfico, las simulaciones ABM y el modelo predictivo de Cívica OS.

## 📂 Carpetas del Sistema
- [[civicaos-core.md]]: Especificación del núcleo del motor de gobernanza.
- [[entities/hermosillo-030.md]]: Perfil del Gemelo Digital Social de Hermosillo.
- [[concepts/modelo-hk.md]]: Fundamento matemático del modelo Hegselmann-Krause.
- [[reports/contradicciones.md]]: Auditoría de inconsistencias del padrón electoral.
- [[reports/preguntas-abiertas.md]]: Demandas cívicas pendientes de resolución.
- [[syntheses/sintesis-agua-paloverde.md]]: Diagnóstico de pozos y mitigación.`,
      backlinks: [],
      sources: []
    },
    {
      id: 'civicaos-core.md',
      title: 'civicaos-core.md',
      type: 'wiki',
      tags: ['civicaos', 'spec', 'local-first'],
      date: '2026-05-18',
      author: 'Antigravity / Roberto Celis',
      frontmatter: {
        created: '2026-05-18',
        type: 'core_spec',
        status: 'active',
        confidence: 0.98,
        tags: ['civicaos', 'spec', 'local-first']
      },
      content: `# ⬡ CívicaOS Engine · Core Specification

## 🎯 Propósito
Plataforma de inteligencia cívica predictiva, 100% local-first, para:
- Detectar puntos de dolor ciudadano (GIS + NLP)
- Simular impacto de políticas públicas ([[concepts/modelo-hk.md]])
- Predecir escenarios electorales (XGBoost + explicabilidad)
- Exportar soluciones ejecutables ([[syntheses/sintesis-agua-paloverde.md]])

## 🧱 Arquitectura de Referencia
\`\`\`
Tier 1 (M4 16GB): gemma4:e4b + qwen2.5:14b + PostGIS + SQLite (local)
Tier 2 (DGX): qwen2.5:72b + fine-tuning LoRA + ABM masivo
Tier 3 (H100): simulación nacional de 5M a 30M de agentes
\`\`\`

## 🔐 Principios No Negociables
1. Zero datos crudos salen del entorno local del cliente.
2. Cada operación genera hash SHA256 para auditoría.
3. Consentimiento granular y revocable para captura ciudadana.`,
      backlinks: ['index.md', 'concepts/modelo-hk.md'],
      sources: []
    },
    {
      id: 'entities/hermosillo-030.md',
      title: 'entities/hermosillo-030.md',
      type: 'wiki',
      tags: ['hermosillo', 'demografia', 'inegi'],
      date: '2026-05-18',
      author: 'DataCollectorAgent',
      frontmatter: {
        created: '2026-05-18',
        type: 'entity_profile',
        status: 'active',
        inegi_code: '26030',
        ine_code: '26049',
        population: 936263,
        voters_list: 612500,
        tags: ['hermosillo', 'demografia', 'inegi']
      },
      content: `# Gemelo Digital: Hermosillo, Sonora

## 📈 Datos Demográficos de INEGI (Censo 2020)
- **Población Total**: 936,263 habitantes.
- **Grado Promedio de Escolaridad**: 11.2 años.
- **Población Económicamente Activa (PEA)**: 543,000 ciudadanos.
- **Viviendas con Cobertura de Agua Entubada**: 88.5%.

## 🗳️ Datos Electorales del INE (Lista Nominal 2024)
- **Secciones Electorales**: 453 secciones.
- **Lista Nominal Activa**: 612,500 electores.
- **Participación Electoral Histórica Promedio**: 54.2%.

## ⚠️ Zonas Críticas de Dolor Territorial
- **Palo Verde (Distrito 8)**: Grave escasez de agua (tandeos los fines de semana).
- **Norte (Distrito 6)**: Tiempos de traslado excesivos de transporte público.`,
      backlinks: ['index.md', 'reports/contradicciones.md', 'syntheses/sintesis-agua-paloverde.md'],
      sources: []
    },
    {
      id: 'concepts/modelo-hk.md',
      title: 'concepts/modelo-hk.md',
      type: 'wiki',
      tags: ['abm', 'matematica', 'HK'],
      date: '2026-05-18',
      author: 'SimulatorAgent',
      frontmatter: {
        created: '2026-05-18',
        type: 'mathematical_model',
        status: 'verified',
        confidence: 0.95,
        model_type: 'Hegselmann-Krause',
        tags: ['abm', 'matematica', 'HK']
      },
      content: `# Dinámica de Opinión: Modelo Hegselmann-Krause (HK)

El Sandbox de políticas públicas del [[civicaos-core.md]] utiliza el modelo matemático de confianza acotada de Hegselmann-Krause para proyectar la convergencia o polarización de opiniones.

## 📐 Ecuación de Dinámica Social
Para un agente $i$ en el ciclo $t$:
$$\theta_i(t+1) = \\frac{1}{|I(i, \\theta(t))|} \\sum_{j \\in I(i, \\theta(t))} \\theta_j(t)$$

Donde $I(i, \\theta(t))$ es el conjunto de agentes cuya diferencia ideológica es menor que el umbral de tolerancia $\\epsilon$:
$$I(i, \\theta(t)) = \\{j \\; | \\; |\\theta_i(t) - \\theta_j(t)| < \\epsilon\\}$$

## ⚙️ Parámetros de Calibración
- **Épsilon ($\\epsilon$)**: Sensibilidad de tolerancia (default: 0.3).
- **Mu ($\\mu$)**: Compromiso ideológico.
- **Políticas Públicas**: Desplazan los dolores iniciales, alterando el vector $\\theta$.`,
      backlinks: ['index.md', 'civicaos-core.md'],
      sources: []
    },
    {
      id: 'reports/contradicciones.md',
      title: 'reports/contradicciones.md',
      type: 'reports',
      tags: ['contradiccion', 'auditoria', 'ine'],
      date: '2026-05-18',
      author: 'AuditAgent',
      frontmatter: {
        created: '2026-05-18',
        type: 'quality_report',
        status: 'review',
        contradictions_count: 2,
        tags: ['contradiccion', 'auditoria', 'ine']
      },
      claims: [
        { id: 'c1', evidence: 'El Padrón INE reporta 1,280 afiliados a partidos en la Sección 034, pero la encuesta ThothAgora tiene 1,840 firmas únicas.', status: 'review', source: 'derfe_padron_nominal_sexo' },
        { id: 'c2', evidence: 'Tasa de descontento hídrico de Palo Verde en 0.72 choca con los datos de gasto público asignados a agua en 2025.', status: 'stale', source: 'valores_municipales_anuales' }
      ],
      content: `# Reporte de Inconsistencias y Calidad de Datos

Este reporte de auditoría automático detecta contradicciones entre las fuentes oficiales del **INE/INEGI** y las ingestas en tiempo real de **ThothAgora**.

## 🔴 Inconsistencia Electorales
- **Sección 034 (Hermosillo)**: La suma total de afiliados declarada en ` + '`partidos_militantes`' + ` supera el padrón nominal reportado por la DERFE en esa sección.
- **Acción**: Ejecutar conciliación cruzando fechas de afiliación con los últimos movimientos de la Lista Nominal.

## 🟡 Desviación de Gasto Social vs Dolor Cívico
- **Distrito 8 (Palo Verde)**: Existe un volumen de reportes ciudadanos de falta de agua un 45% mayor a lo esperado según el presupuesto de obras públicas devengado e inyectado.`,
      backlinks: ['index.md'],
      sources: ['entities/hermosillo-030.md', 'sources/thothagora-ingest.md']
    },
    {
      id: 'reports/preguntas-abiertas.md',
      title: 'reports/preguntas-abiertas.md',
      type: 'reports',
      tags: ['preguntas', 'open-questions'],
      date: '2026-05-18',
      author: 'SuperAgentOrchestrator',
      frontmatter: {
        created: '2026-05-18',
        type: 'open_questions_report',
        status: 'active',
        pending_questions: 3,
        tags: ['preguntas', 'open-questions']
      },
      claims: [
        { id: 'q1', evidence: '¿Cuál es la causa del repunte en el descontento de seguridad en Palo Verde posterior a las 20:00 hrs?', status: 'active', source: 'opinion_asalariado_raw' },
        { id: 'q2', evidence: '¿La baja de participación electoral en el norte está asociada a la falta de transporte los domingos?', status: 'active', source: 'derfe_padron_nominal_sexo' }
      ],
      content: `# Cuestionamientos Cívicos Pendientes

Preguntas y anomalías detectadas en los patrones de comportamiento de la población sintética que requieren mayor análisis o calibración bayesiana.

## ❓ 1. Parámetro de Movilidad Crítico
- **Pregunta**: ¿Por qué los agentes del sector "obreros" muestran una tolerancia al dolor de movilidad menor ($\\epsilon = 0.15$) que los "estudiantes" ($\\epsilon = 0.35$)?
- **Hipótesis**: Pérdida de bonos de puntualidad en maquilas del Distrito 6.

## ❓ 2. Efecto de tandeos de agua los domingos
- **Pregunta**: ¿El tandeo dominical reduce el ROI de felicidad de forma exponencial comparado con el tandeo de lunes a viernes?`,
      backlinks: ['index.md'],
      sources: ['sources/thothagora-ingest.md']
    },
    {
      id: 'syntheses/sintesis-agua-paloverde.md',
      title: 'syntheses/sintesis-agua-paloverde.md',
      type: 'drafts',
      tags: ['agua', 'hermosillo', 'sintesis'],
      date: '2026-05-18',
      author: 'ReportWriterAgent',
      frontmatter: {
        created: '2026-05-18',
        type: 'synthesis',
        status: 'active',
        project_id: 'HER-DIS-08',
        budget: '$85.4 MDP',
        population_impacted: 45000,
        tags: ['agua', 'hermosillo', 'sintesis']
      },
      content: `# Síntesis Ejecutiva: Pozos Inteligentes Palo Verde

## 📊 Diagnóstico Territorial
A partir de los datos censales en [[entities/hermosillo-030.md]] y las ingestas ciudadanas de [[sources/thothagora-ingest.md]], se ha diagnosticado una crisis hídrica focalizada en Palo Verde, Hermosillo, Sonora.

## 🛠️ Plan de Intervención (Fases)
1. **Fase 1: Digitalización**: Instalación de caudalímetros IoT locales en red de pozos.
2. **Fase 2: Redistribución**: Modelo ABM estima que un desvío del 15% del flujo industrial estabilizará la felicidad de los comerciantes.
3. **Fase 3: Transferencia Financiera**: Exportar los capex/opex a Open Business Plan para el fideicomiso.

## 📈 Impacto Simulado en Indicadores
- **Felicidad Promedio**: Aumento del **38% al 60%** a 3 años.
- **Intención de Voto**: Swing de **+6.5%** en favor del Candidato A.`,
      backlinks: ['index.md', 'reports/contradicciones.md'],
      sources: ['entities/hermosillo-030.md', 'sources/thothagora-ingest.md']
    },
    {
      id: 'sources/thothagora-ingest.md',
      title: 'sources/thothagora-ingest.md',
      type: 'raw',
      tags: ['thothagora', 'raw-data', 'ingest'],
      date: '2026-05-18',
      author: 'ThothAgora Ingestion',
      frontmatter: {
        created: '2026-05-18',
        type: 'citizen_capture',
        status: 'ingested',
        audit_hash: 'sha256:a4f89d3c5e2197e884b80b27e8a93e8274cf8f2e2764a2f8b5f39e38c92a9b3d',
        tags: ['thothagora', 'raw-data', 'ingest']
      },
      content: `# Ingesta de Cédula Cívica Soberana

Cédula ciudadana firmada digitalmente con sal criptográfica local. Los datos de identidad (CURP) se encuentran ofuscados.

\`\`\`json
{
  "hash_registro": "a4f89d3c5e2197e884b80b27e8a93e8274cf8f2e...",
  "sector": "asalariado",
  "district": "HER-DIS-08",
  "water_pain": 0.85,
  "transit_pain": 0.50,
  "potholes_pain": 0.30,
  "safety_pain": 0.65,
  "proposal": "Pavimentación urgente de la calzada de Palo Verde y regularización del tandeo de agua los fines de semana."
}
\`\`\``,
      backlinks: ['reports/contradicciones.md', 'reports/preguntas-abiertas.md', 'syntheses/sintesis-agua-paloverde.md'],
      sources: []
    }
  ]);

  // Inicializar seleccionando index.md por defecto
  useMemo(() => {
    if (!activeArticle && articles.length > 0) {
      setActiveArticle(articles[0]);
    }
  }, [articles, activeArticle]);

  // 2. Simular comandos de Obsidian CLI y actualizar terminal
  const executeObsidianCliCommand = (command, args = "") => {
    const timestamp = new Date().toLocaleTimeString();
    let logsToAdd = [];
    
    if (command === 'status') {
      logsToAdd = [
        `🔌 [Obsidian CLI] ejecutando: obsidian status`,
        `🟢 Conexión activa con Obsidian App v1.15.3`,
        `📂 Vault detectado: "CívicaOS Knowledge Vault"`,
        `📍 Ruta local: /Volumes/SSD1TB/plataforma/civicaos-vault/`
      ];
      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: { message: 'Obsidian CLI: Conexión Activa', type: 'success' }
      }));
    } 
    else if (command === 'daily') {
      const todayStr = new Date().toISOString().split('T')[0];
      logsToAdd = [
        `🔌 [Obsidian CLI] ejecutando: obsidian daily:append content="- [x] Simulación ABM completada"`,
        `📝 Nota Diaria [${todayStr}.md] actualizada en el Vault.`,
        `✅ Agregados 2 registros de auditoría de agentes.`
      ];
      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: { message: 'Nota Diaria en Obsidian actualizada', type: 'success' }
      }));
    } 
    else if (command === 'open') {
      if (!activeArticle) return;
      logsToAdd = [
        `🔌 [Obsidian CLI] ejecutando: obsidian open file="${activeArticle.title}" newtab`,
        `🖥️ Abriendo archivo en Obsidian Editor: ${activeArticle.title}`,
        `⚡ Foco transferido exitosamente.`
      ];
      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: { message: `Abierto en Obsidian Desktop: ${activeArticle.title}`, type: 'info' }
      }));
    }
    else if (command === 'switcher') {
      setShowQuickSwitcher(true);
      setSwitcherQuery('');
      logsToAdd = [
        `🔌 [Obsidian CLI] ejecutando: obsidian command workspace:quick-switcher`,
        `🔍 Lanzando el Switcher rápido de archivos en la interfaz de Cívica OS...`
      ];
    }
    else if (command === 'reload') {
      logsToAdd = [
        `🔌 [Obsidian CLI] ejecutando: obsidian plugin:reload memory-wiki`,
        `🔄 Recargando plugin CívicaOS Memory Linker...`,
        `✅ 14 notas re-indexadas y grafo 3D recalculado.`
      ];
      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: { message: 'Plugin Memory Wiki recargado', type: 'success' }
      }));
    }

    setBrainLogs(prev => [...prev, ...logsToAdd]);
  };

  // 3. Ejecutar consulta al Vault local de Obsidian
  const handleSyntoQuery = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsQuerying(true);
    setQueryResult(null);

    setTimeout(() => {
      let response = {
        answer: "No se encontraron artículos con información suficiente en el Vault local de Obsidian para responder a tu consulta. Intenta reformular con palabras clave como 'agua', 'dolor', o 'arquitectura'.",
        sources: [],
        confidence: 0,
        tokens: 0,
        speed: 0
      };

      const q = searchQuery.toLowerCase();
      if (q.includes('agua') || q.includes('dolor') || q.includes('hermosillo') || q.includes('palo verde') || q.includes('pozo')) {
        response = {
          answer: "De acuerdo a la nota **[[syntheses/sintesis-agua-paloverde.md]]** y los reportes de quejas en **[[sources/thothagora-ingest.md]]**, el mayor dolor territorial en Hermosillo se encuentra en **Palo Verde (Distrito 8)** con una severidad crítica de agua indexada en **0.85**. El plan de ataque detalla una inversión de **$85.4 MDP** para cisternas IoT inteligentes, con lo cual la simulación ABM local estima que la felicidad colectiva de la zona incrementará del **38% al 60%** a 3 años, generando además un impacto político de **+6.5%** de intención de voto.",
          sources: ['syntheses/sintesis-agua-paloverde.md', 'sources/thothagora-ingest.md'],
          confidence: 96,
          tokens: 412,
          speed: 34.5
        };
      } else if (q.includes('arquitectura') || q.includes('local') || q.includes('tier') || q.includes('m4') || q.includes('zero')) {
        response = {
          answer: "La arquitectura base de **CívicaOS Engine** detallada en **[[civicaos-core.md]]** es estrictamente local-first (100% on-premise) para garantizar privacidad absoluta. En el **Nivel 1 (Mac Mini M4 16GB)** se corre inferencia local con Ollama (ej. `qwen2.5:14b`) y se opera la base de datos de microdatos (PostGIS + SQLite) para resguardar la identidad de los ciudadanos sin transmitir datos crudos a la nube.",
          sources: ['civicaos-core.md'],
          confidence: 98,
          tokens: 356,
          speed: 32.8
        };
      } else if (q.includes('contradiccion') || q.includes('diferencia') || q.includes('ine') || q.includes('militantes')) {
        response = {
          answer: "El reporte de calidad **[[reports/contradicciones.md]]** expone una desviación en la **Sección 034**, donde la base de afiliados de partidos (`partidos_militantes`) excede la lista nominal registrada por la DERFE en esa sección. Asimismo, expone que los reclamos de agua en Palo Verde rebasan el presupuesto devengado en obras hidráulicas locales.",
          sources: ['reports/contradicciones.md', 'entities/hermosillo-030.md'],
          confidence: 94,
          tokens: 384,
          speed: 31.2
        };
      }

      setQueryResult(response);
      setIsQuerying(false);

      setBrainLogs(prev => [
        ...prev,
        `🤖 [Synto Inferencia] Query procesada con éxito: "${searchQuery}"`,
        `🔍 [Ollama Local] qwen2.5:14b | Confianza: ${response.confidence}% | Tokens: ${response.tokens}`
      ]);

      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: { message: `Synto: Consulta completada (${response.confidence}% confianza)`, type: 'success' }
      }));

    }, 1200);
  };

  // Simular la compilación del vault completo en formato agent-digest.json
  const runBrainAction = (action) => {
    window.dispatchEvent(new CustomEvent('civic-toast', {
      detail: { message: `Ejecutando acción de cerebro local: ${action}`, type: 'info' }
    }));

    if (action === 'ingest') {
      setBrainLogs(prev => [
        ...prev,
        `📥 [Claude Brain Skill] Instando: openclaw wiki compile ...`,
        `📝 [Compilador] Generando caché JSON de inferencia en '.openclaw-wiki/cache/agent-digest.json'`,
        `✅ [Sync] Bóveda de Obsidian sincronizada e indexada exitosamente.`
      ]);
    } else if (action === 'lint') {
      setBrainLogs(prev => [
        ...prev,
        `🧹 [Claude Brain Skill] Instando: openclaw wiki lint ...`,
        `🔍 [Linter] Verificando referencias y consistencia de claims...`,
        `✅ [Linter] 0 enlaces rotos detectados en 8 notas. Grafo limpio.`
      ]);
    }
  };

  // Filtro de notas por tags, nombre y tipo
  const filteredArticles = articles.filter(art => {
    const matchesFilter = 
      vaultFilter === 'all' || 
      (vaultFilter === 'wiki' && art.type === 'wiki' && !art.id.includes('/')) ||
      (vaultFilter === 'entities' && art.id.startsWith('entities/')) ||
      (vaultFilter === 'concepts' && art.id.startsWith('concepts/')) ||
      (vaultFilter === 'reports' && art.type === 'reports') ||
      (vaultFilter === 'drafts' && art.type === 'drafts') ||
      (vaultFilter === 'raw' && art.type === 'raw');
      
    const matchesSearch = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesFilter && matchesSearch;
  });

  // Generador de wikilinks interactivos en el visor Markdown
  const renderContentWithWikiLinks = (content) => {
    if (!content) return "";
    
    // Regex para buscar [[nota.md]] o [[folder/nota.md]]
    const parts = content.split(/(\[\[[a-zA-Z0-9\/\-\_\.]+\.md\]\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const docId = part.substring(2, part.length - 2);
        const exists = articles.some(a => a.id === docId);
        
        return (
          <span 
            key={index}
            onClick={() => {
              const target = articles.find(a => a.id === docId);
              if (target) {
                setActiveArticle(target);
                setActiveViewMode('markdown');
              } else {
                window.dispatchEvent(new CustomEvent('civic-toast', {
                  detail: { message: `Nota muerta: ${docId}`, type: 'warning' }
                }));
              }
            }}
            style={{
              color: exists ? 'var(--neon-blue)' : 'var(--neon-rose)',
              textDecoration: 'underline',
              cursor: exists ? 'pointer' : 'help',
              fontWeight: '700'
            }}
          >
            {docId}
          </span>
        );
      }
      return part;
    });
  };

  // 4. Vista de digest JSON en caché legible por LLM (agent-digest.json)
  const agentDigestJsonStr = useMemo(() => {
    const digest = {
      timestamp: "2026-05-18T00:10:00Z",
      vault_name: "CívicaOS Bóveda Local",
      total_notes: articles.length,
      model_references: articles.map(a => ({
        id: a.id,
        type: a.frontmatter.type,
        status: a.frontmatter.status,
        confidence: a.frontmatter.confidence || 1.0,
        links_count: a.backlinks.length + (a.sources ? a.sources.length : 0)
      })),
      contradictions_active: articles
        .filter(a => a.type === 'reports' && a.claims)
        .flatMap(a => a.claims)
    };
    return JSON.stringify(digest, null, 2);
  }, [articles]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 🚀 Barra de Título con acciones de Cerebro Local */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }} className="glass-card">
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Brain size={24} className="neon-icon" style={{ color: 'var(--neon-emerald)' }} />
            Obsidian LLM Knowledge Vault & memory-wiki
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Compila y sincroniza de forma inmutable notas demográficas y reclamos de ThothAgora en tu Bóveda local de Obsidian.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => runBrainAction('ingest')}
            className="btn-outline" 
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={14} />
            wiki Compile
          </button>
          <button 
            onClick={() => runBrainAction('lint')}
            className="btn-outline" 
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <AlertCircle size={14} />
            wiki Lint
          </button>
        </div>
      </div>

      {/* 💻 Grid de Trabajo Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }} className="responsive-grid">
        
        {/* Panel Izquierdo: Explorador de Notas y Comandos CLI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Explorador de Bóveda */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', background: 'rgba(15, 23, 42, 0.45)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                <Folder size={18} style={{ color: 'var(--neon-blue)' }} />
                Explorador del Vault
              </h3>
              <span className="chip chip-cyan" style={{ fontSize: '0.6rem' }}>Obsidian.md</span>
            </div>

            {/* Filtros de la Bóveda */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              {['all', 'wiki', 'entities', 'concepts', 'reports', 'drafts', 'raw'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setVaultFilter(filter)}
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.25rem 0.5rem',
                    background: vaultFilter === filter ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    color: vaultFilter === filter ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: vaultFilter === filter ? 'var(--neon-blue)' : 'transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {filter === 'all' ? 'todos' : filter + '/'}
                </button>
              ))}
            </div>

            {/* Listado de Archivos Filtrados */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '240px', overflowY: 'auto' }}>
              {filteredArticles.map(art => (
                <div 
                  key={art.id}
                  onClick={() => {
                    setActiveArticle(art);
                    setActiveViewMode('markdown');
                  }}
                  style={{
                    padding: '0.6rem 0.75rem',
                    background: activeArticle?.id === art.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid',
                    borderColor: activeArticle?.id === art.id ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-glass)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                >
                  <FileText size={16} style={{ 
                    color: art.id.startsWith('entities/') 
                      ? 'var(--neon-blue)' 
                      : art.id.startsWith('concepts/') 
                        ? 'var(--neon-purple)' 
                        : art.type === 'reports' 
                          ? 'var(--neon-rose)' 
                          : 'var(--neon-emerald)' 
                  }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: activeArticle?.id === art.id ? '#fff' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{art.title}</h4>
                  </div>
                  <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* 🔌 Control Remoto Obsidian CLI */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'rgba(15, 23, 42, 0.45)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
              <Settings size={16} style={{ color: 'var(--neon-purple)' }} />
              Obsidian CLI Control Remoto
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button 
                onClick={() => executeObsidianCliCommand('status')}
                className="btn-outline" 
                style={{ fontSize: '0.7rem', padding: '0.4rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <Terminal size={12} />
                cli status
              </button>
              <button 
                onClick={() => executeObsidianCliCommand('daily')}
                className="btn-outline" 
                style={{ fontSize: '0.7rem', padding: '0.4rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <Clock size={12} />
                daily note
              </button>
              <button 
                onClick={() => executeObsidianCliCommand('open')}
                className="btn-outline" 
                style={{ fontSize: '0.7rem', padding: '0.4rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <LinkIcon size={12} />
                open in app
              </button>
              <button 
                onClick={() => executeObsidianCliCommand('switcher')}
                className="btn-outline" 
                style={{ fontSize: '0.7rem', padding: '0.4rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <Search size={12} />
                quick-switcher
              </button>
            </div>
            
            <button 
              onClick={() => executeObsidianCliCommand('reload')}
              className="btn-outline" 
              style={{ fontSize: '0.7rem', width: '100%', padding: '0.4rem', borderColor: 'rgba(163, 116, 255, 0.3)' }}
            >
              🔄 Reload memory-wiki plugin
            </button>
          </div>

          {/* Consola de logs de Claude Brain */}
          <div style={{ background: '#020408', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.65rem', minHeight: '130px', maxHeight: '180px', overflowY: 'auto' }}>
            <div style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Terminal size={10} />
              CLAUDE BRAIN LOGS
            </div>
            {brainLogs.map((log, idx) => (
              <div key={idx} style={{ color: log.includes('✅') || log.includes('🟢') ? 'var(--neon-emerald)' : log.includes('🔌') ? 'var(--neon-cyan)' : 'var(--text-secondary)', marginBottom: '0.25rem', lineHeight: '1.3' }}>
                {log}
              </div>
            ))}
          </div>

        </div>

        {/* Panel Derecho: Consultas IA, Visualizador de Frontmatter y Contenido de Notas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Formulario de consulta Synto AI (Ollama) */}
          <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.45)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginBottom: '0.75rem' }}>
              <Brain size={18} style={{ color: 'var(--neon-emerald)' }} />
              Inferencia Synto AI (Búsqueda Semántica en el Vault)
            </h3>

            <form onSubmit={handleSyntoQuery} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  type="text" 
                  placeholder="Pregunta algo sobre agua, contradicciones, Hermosillo o modelo HK..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="premium-input"
                  style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>
              <button 
                type="submit" 
                disabled={isQuerying}
                className="btn-premium"
                style={{ 
                  background: 'linear-gradient(135deg, var(--neon-emerald) 0%, #047857 100%)',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
                  padding: '0 1.25rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: isQuerying ? 0.6 : 1
                }}
              >
                {isQuerying ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Buscar
              </button>
            </form>

            {/* Resultado de Inferencia */}
            {queryResult && (
              <div style={{ 
                marginTop: '1rem', 
                background: 'rgba(16, 185, 129, 0.04)', 
                border: '1px solid rgba(16, 185, 129, 0.25)', 
                borderRadius: '8px', 
                padding: '1rem',
                animation: 'scaleIn 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16, 185, 129, 0.15)', paddingBottom: '0.4rem', marginBottom: '0.6rem', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--neon-emerald)', fontWeight: 'bold' }}>
                    <Cpu size={12} />
                    qwen2.5:14b (Local Inferencia)
                  </span>
                  <span>Confianza: <strong>{queryResult.confidence}%</strong> | Speed: <strong>{queryResult.speed} ms/t</strong></span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                  {queryResult.answer}
                </p>

                <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Notas Citadas:</span>
                  {queryResult.sources.map(src => (
                    <span 
                      key={src}
                      onClick={() => {
                        const target = articles.find(a => a.id === src);
                        if (target) {
                          setActiveArticle(target);
                          setActiveViewMode('markdown');
                        }
                      }}
                      style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--neon-blue)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '4px', padding: '0.1rem 0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      <FileText size={10} />
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lector de Notas */}
          <div className="glass-card" style={{ flex: 1, padding: '1.25rem', background: 'rgba(15, 23, 42, 0.45)', minHeight: '350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {activeArticle ? (
              <>
                {/* Título de nota y selectores de Vista */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.6rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>{activeArticle.title}</h3>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Por: {activeArticle.author} · {activeArticle.date}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => setActiveViewMode('markdown')}
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.3rem 0.6rem',
                        background: activeViewMode === 'markdown' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        color: activeViewMode === 'markdown' ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid',
                        borderColor: activeViewMode === 'markdown' ? 'var(--neon-blue)' : 'var(--border-glass)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Markdown
                    </button>
                    <button
                      onClick={() => setActiveViewMode('json-cache')}
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.3rem 0.6rem',
                        background: activeViewMode === 'json-cache' ? 'rgba(163, 116, 255, 0.2)' : 'transparent',
                        color: activeViewMode === 'json-cache' ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid',
                        borderColor: activeViewMode === 'json-cache' ? 'var(--neon-purple)' : 'var(--border-glass)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      JSON Cache
                    </button>
                  </div>
                </div>

                {/* 📄 VISTA MARKDOWN */}
                {activeViewMode === 'markdown' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    
                    {/* Visualizador de YAML Frontmatter (Properties Card) */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                        <Settings size={12} />
                        PROPIEDADES DE LA NOTA (FRONTMATTER YAML)
                      </div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {Object.entries(activeArticle.frontmatter).map(([key, val]) => (
                          <div 
                            key={key} 
                            style={{ 
                              fontSize: '0.65rem', 
                              background: 'rgba(255,255,255,0.04)', 
                              border: '1px solid var(--border-glass)', 
                              borderRadius: '4px', 
                              padding: '0.2rem 0.4rem', 
                              color: 'var(--text-primary)' 
                            }}
                          >
                            <span style={{ color: 'var(--text-secondary)' }}>{key}:</span>{" "}
                            <strong style={{ color: key === 'status' && val === 'verified' ? 'var(--neon-emerald)' : 'inherit' }}>
                              {Array.isArray(val) ? val.join(', ') : String(val)}
                            </strong>
                          </div>
                        ))}
                      </div>

                      {/* Claims del Reporte (si existen) */}
                      {activeArticle.claims && activeArticle.claims.length > 0 && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--neon-rose)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} />
                            AFIRMACIONES Y EVIDENCIAS DE AUDITORÍA (CLAIMS)
                          </div>
                          
                          {activeArticle.claims.map((claim) => (
                            <div 
                              key={claim.id} 
                              style={{ 
                                display: 'flex', 
                                gap: '0.5rem', 
                                background: 'rgba(239, 68, 68, 0.05)', 
                                border: '1px solid rgba(239, 68, 68, 0.15)', 
                                borderRadius: '4px', 
                                padding: '0.4rem 0.6rem' 
                              }}
                            >
                              <span style={{ 
                                fontSize: '0.6rem', 
                                padding: '0.1rem 0.3rem', 
                                height: 'fit-content',
                                borderRadius: '4px',
                                background: claim.status === 'review' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: claim.status === 'review' ? 'var(--neon-amber)' : 'var(--neon-rose)',
                                fontWeight: 'bold'
                              }}>
                                {claim.status.toUpperCase()}
                              </span>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.7rem', color: '#fff', lineHeight: '1.4' }}>{claim.evidence}</p>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Origen de datos: {claim.source}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cuerpo de la Nota en Markdown */}
                    <div style={{
                      flex: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'var(--text-primary)',
                      background: '#04060b',
                      padding: '1rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-glass)',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6'
                    }}>
                      {renderContentWithWikiLinks(activeArticle.content)}
                    </div>

                    {/* 🔗 SECCIÓN RELATED & BACKLINKS */}
                    <div style={{ 
                      marginTop: '0.5rem', 
                      background: 'rgba(59, 130, 246, 0.03)', 
                      border: '1px solid rgba(59, 130, 246, 0.15)', 
                      borderRadius: '6px', 
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--neon-blue)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <LinkIcon size={12} />
                        ENLACES RELACIONADOS Y BACKLINKS (COMPILADOR WIKI)
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.65rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Mencionada en (Backlinks):</span>
                          {activeArticle.backlinks.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                              {activeArticle.backlinks.map(link => (
                                <span 
                                  key={link}
                                  onClick={() => setActiveArticle(articles.find(a => a.id === link))}
                                  style={{ color: 'var(--neon-blue)', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                  [[{link}]]
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Ningún backlink detectado.</span>
                          )}
                        </div>

                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Fuentes de Origen (Sources):</span>
                          {activeArticle.sources && activeArticle.sources.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                              {activeArticle.sources.map(src => (
                                <span 
                                  key={src}
                                  onClick={() => setActiveArticle(articles.find(a => a.id === src))}
                                  style={{ color: 'var(--neon-emerald)', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                  [[{src}]]
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Sin referencias externas.</span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* ⚙️ VISTA JSON CACHE (Para Inferencia LLM) */}
                {activeViewMode === 'json-cache' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileCode size={14} style={{ color: 'var(--neon-purple)' }} />
                      <span>Vista del archivo caché comprimido <strong>.openclaw-wiki/cache/agent-digest.json</strong></span>
                    </div>

                    <pre style={{
                      flex: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'var(--neon-purple)',
                      background: '#020306',
                      padding: '1rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(163, 116, 255, 0.25)',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.4'
                    }}>
                      {agentDigestJsonStr}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem' }}>
                <BookOpen size={40} style={{ opacity: 0.15 }} />
                <span>Ninguna nota seleccionada</span>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* 🔍 SWITCHER RÁPIDO SIMULADO (MODAL OVERLAY) */}
      {showQuickSwitcher && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 7, 18, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '15vh'
        }}
        onClick={() => setShowQuickSwitcher(false)}
        >
          <div style={{
            width: '550px',
            background: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid rgba(163, 116, 255, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 30px rgba(163, 116, 255, 0.2)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
              <Search size={16} style={{ color: 'var(--neon-purple)' }} />
              <input
                type="text"
                placeholder="Buscar nota en el vault..."
                value={switcherQuery}
                onChange={(e) => setSwitcherQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.85rem',
                  width: '100%'
                }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '250px', overflowY: 'auto' }}>
              {articles
                .filter(a => switcherQuery === '' || a.title.toLowerCase().includes(switcherQuery.toLowerCase()))
                .map(art => (
                  <div
                    key={art.id}
                    onClick={() => {
                      setActiveArticle(art);
                      setActiveViewMode('markdown');
                      setShowQuickSwitcher(false);
                      setBrainLogs(prev => [...prev, `🔌 [Obsidian CLI] Quick-switcher seleccionó: ${art.title}`]);
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(163, 116, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  >
                    <span>{art.title}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{art.type}</span>
                  </div>
                ))}
            </div>

            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
              Presiona en cualquier lugar fuera para cerrar
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
