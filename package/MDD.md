# MDD - Desarrollo Dirigido por Modelos
## CívicaOS: Sistema de Inteligencia Cívica Multi-Nivel

**Versión:** 1.0.0
**Fecha:** 2026-05-18
**Autor:** MiniMax Agent
**Estado:** Especificación正式

---

## 1. Introducción al Desarrollo Dirigido por Modelos

### 1.1 Propósito del Documento

El Desarrollo Dirigido por Modelos (Model-Driven Development) en CívicaOS establece un marco sistemático para la creación, transformación y generación de código a partir de modelos abstractos. Este enfoque permite que la complejidad del sistema se gestione a través de modelos bien definidos que capturan la semántica del dominio de inteligencia cívica, reduciendo la posibilidad de errores y acelerando el desarrollo al automatizar la generación de código repetitivo. Los modelos servem como fuente única de verdad, a partir de la cual se generan automáticamente tanto el código de implementación como la documentación técnica y las interfaces de usuario.

### 1.2 Principios Fundamentales

El MDD en cívicaOS se fundamenta en cuatro principios que guían todas las decisiones de modelado y transformación. El primer principio es la separación de concerns, donde los modelos se organizan en capas que representan diferentes aspectos del sistema: modelos de dominio que capturan la lógica de negocio, modelos de comportamiento que especifican las interacciones entre componentes, modelos de datos que definen la estructura de información, y modelos de presentación que describen las interfaces de usuario. Esta separación permite que cada concern evolucione de manera independiente sin afectar las demás capas.

El segundo principio es la trazabilidad end-to-end, donde cada elemento del código generado puede rastrearse hasta su modelo fuente y, opcionalmente, hasta el requisito de negocio que lo motivó. Esta trazabilidad facilita la validación de que la implementación cumple con las especificaciones y permite analizar el impacto de cambios en los requisitos sobre el código existente.

El tercer principio es la generación automática de artefactos, donde los modelos se transforman en múltiples artefactos de software mediante reglas de transformación definidas. Estos artefactos incluyen código fuente en TypeScript y Python, esquemas de bases de datos, documentación técnica, casos de prueba, y configuraciones de infraestructura. La automatización reduce errores humanos y asegura consistencia entre los diferentes artefactos derivados del mismo modelo.

El cuarto principio es la validación temprada, donde los modelos se validan contra restricciones estáticas antes de la generación de código. Esta validación temprana permite detectar problemas de diseño en las fases más tempranas del desarrollo, cuando el costo de corrección es menor.

### 1.3 Framework de Modelado

El framework de modelado de cívicaOS utiliza herramientas y lenguajes específicos para cada tipo de modelo. Para los modelos de dominio y comportamiento se utiliza UML 2.5 con perfiles personalizados que capturan la semántica específica del dominio de inteligencia cívica. Para los modelos de datos se utilizan diagramas ER extendidos con soporte para tipos vectoriales y documentos JSON. Para los modelos de transformación se utiliza QVT (Query/View/Transformation) como lenguaje estándar de transformación de modelos. Para la generación de código se utilizan templates basados en MOFM2T (MOF Model to Text) implementados mediante archivos Epsilon Wizard Language (EWL).

---

## 2. Meta-Modelo de CívicaOS

### 2.1 Estructura del Meta-Modelo

El meta-modelo de cívicaOS define los conceptos abstractos que pueden instanciarse para representar elementos del sistema. Este meta-modelo se estructura en cuatro paquetes principales que corresponden a las diferentes vistas del sistema.

El paquete Core define los elementos fundamentales que otros paquetes extienden. Esta incluye la clase NamedElement que proporciona identidad y nombre a todos los elementos modelables, la clase TypedElement que asocia tipos de datos a elementos, y la clase PackageableElement que permite organizar elementos en paquetes jerárquicos. Todas las clases del meta-modelo heredan de estos elementos base, asegurando una estructura coherente y navegable.

El paquete Domain contiene los conceptos específicos del dominio de inteligencia cívica. Esto incluye Agent que representa un ciudadano sintético en el modelo ABM con sus atributos y comportamientos, PainPoint que representa un problema ciudadano con categoría, intensidad y ubicación, GeographicEntity que representa cualquier division territorial del sistema politico, y PolicyIntervention que representa una propuesta de politica publica con sus efectos esperados.

El paquete Behavior captura las interacciones entre elementos del sistema. Esto incluye Process que representa un flujo de trabajo ejecutable, Activity que representa una acción atómica dentro de un proceso, Transition que representa el flujo entre actividades, y GuardCondition que representa las condiciones que gobiernan las transiciones.

El paquete Infrastructure define los elementos técnicos que soportan la implementacion. Esto incluye Service que representa un componente de software expuesto como API, DataStore que representa un mecanismo de persistencia, y TransformationRule que define como convertir modelos entre diferentes niveles de abstraccion.

### 2.2 Diagrama de Clases del Meta-Modelo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PAQUETE CORE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────┐         ┌──────────────────────┐                 │
│  │   <<abstract>>       │         │   <<abstract>>       │                 │
│  │    NamedElement      │         │    TypedElement      │                 │
│  ├──────────────────────┤         ├──────────────────────┤                 │
│  │ + id: UUID           │         │ + type: DataType     │                 │
│  │ + name: String       │         └──────────┬───────────┘                 │
│  │ + description: String│                    │                             │
│  └──────────┬───────────┘                    │                             │
│             │                                │                             │
│  ┌──────────┴────────────────────────────────┴───────────┐                 │
│  │                   <<abstract>>                        │                 │
│  │               ModelElement                            │                 │
│  ├────────────────────────────────────────────────────────┤                 │
│  │ + metadata: Metadata                                  │                 │
│  │ + constraints: Constraint[]                          │                 │
│  │ + taggedValues: TaggedValue[]                          │                 │
│  └──────────┬─────────────────────────────────────────────┘                 │
│             │                                                          │
│  ┌──────────┴───────────────────────────────────────────┐                 │
│  │                                                       │                 │
│  │         ┌─────────────┐  ┌─────────────┐  ┌────────┐ │                 │
│  │         │   Package   │  │  Classifier │  │Property│ │                 │
│  │         ├─────────────┤  ├─────────────┤  ├────────┤ │                 │
│  │         │ + elements  │  │ + isAbstract│  │+owner  │ │                 │
│  │         └──────┬──────┘  └──────┬──────┘  └────┬──┘ │                 │
│  │                │               │               │    │                 │
│  └────────────────┴───────────────┴───────────────┘    │                 │
│                                                         │                 │
└─────────────────────────────────────────────────────────┼─────────────────┘
                                                          │
┌─────────────────────────────────────────────────────────┼─────────────────┐
│                           PAQUETE DOMAIN                │                 │
├─────────────────────────────────────────────────────────┼─────────────────┤
│                                                         │                 │
│  ┌──────────────────────────────────────────────────────┴────────────────┐ │
│  │                        <<classifier>>                                │ │
│  │                         CivicEntity                                 │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │ + category: PainCategory                                             │ │
│  │ + intensity: Number [0..100]                                         │ │
│  │ + probability: Number [0..1]                                          │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                              △                                              │
│         ┌────────────────────┼────────────────────┐                       │
│         │                    │                    │                       │
│  ┌──────┴───────┐    ┌────────┴────────┐   ┌──────┴───────┐                │
│  │  PainPoint   │    │   PolicyInter  │   │    Agent     │                │
│  ├──────────────┤    ├────────────────┤   ├──────────────┤                │
│  │+location     │    │+effects        │   │+attributes   │                │
│  │+source       │    │+cost           │   │+opinions     │                │
│  │+affectedPop  │    │+targetSectors  │   │+happiness     │                │
│  └──────────────┘    └────────────────┘   └──────────────┘                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       GeographicEntity                              │   │
│  ├───────────────────────────────────────────────────────────────────────┤   │
│  │ + entityType: GeoEntityType                                          │   │
│  │ + coordinates: Coordinates                                           │   │
│  │ + boundary: GeoBoundary                                              │   │
│  │ + parentId: UUID (optional)                                          │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         PAQUETE BEHAVIOR                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          Process                                    │   │
│  ├───────────────────────────────────────────────────────────────────────┤   │
│  │ + name: String                                                        │   │
│  │ + activities: Activity[]                                             │   │
│  │ + transitions: Transition[]                                          │   │
│  │ + initialActivity: Activity                                          │   │
│  │ + finalActivities: Activity[]                                        │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────┐  ┌───────────────────────────────────┐   │
│  │          Activity             │  │           Transition              │   │
│  ├───────────────────────────────┤  ├───────────────────────────────────┤   │
│  │ + name: String                │  │ + source: Activity                │   │
│  │ + type: ActivityType          │  │ + target: Activity                │   │
│  │ + agent: AgentType (optional)│  │ + guard: GuardCondition          │   │
│  │ + input: Property[]           │  │ + action: Action                  │   │
│  │ + output: Property[]          │  └───────────────────────────────────┘   │
│  └───────────────────────────────┘                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        PAQUETE INFRASTRUCTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────┐    ┌────────────────────────┐                  │
│  │        Service         │    │       DataStore        │                  │
│  ├────────────────────────┤    ├────────────────────────┤                  │
│  │ + name: String          │    │ + name: String        │                  │
│  │ + operations: Operation│    │ + type: StorageType   │                  │
│  │ + endpoints: Endpoint[] │    │ + schema: Schema      │                  │
│  │ + technology: String    │    │ + connection: String  │                  │
│  └───────────┬────────────┘    └────────────────────────┘                  │
│              │                                                             │
│  ┌───────────┴────────────┐                                                │
│  │    TransformationRule  │                                                │
│  ├────────────────────────┤                                                │
│  │ + sourceModel: String  │                                                │
│  │ + targetModel: String  │                                                │
│  │ + transformationType   │                                                │
│  │ + rules: Rule[]        │                                                │
│  └────────────────────────┘                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modelos Específicos de Dominio

### 3.1 Modelo de Agente ABM

El modelo de agente para el motor de simulación basada en agentes define la estructura y comportamiento de los ciudadanos sintéticos que populan el gemelo digital social. Este modelo es crítico porque determina la calidad de las simulaciones y la precisión de las predicciones.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<civic:Model xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI"
             xmlns:civic="http://civica.os/mdd/agent-model"
             name="ABMAgentModel" version="1.0.0">

  <!-- Enumeraciones del Modelo -->
  <enumerations>
    <Enumeration name="AgentSector">
      <literals>
        <Literal name="small_business" label="Pequeña Empresa" weight="0.25"/>
        <Literal name="young_professional" label="Profesional Joven" weight="0.20"/>
        <Literal name="industrial_worker" label="Trabajador Industrial" weight="0.25"/>
        <Literal name="student" label="Estudiante" weight="0.15"/>
        <Literal name="retired" label="Jubilado" weight="0.15"/>
      </literals>
    </Enumeration>

    <Enumeration name="AgentAttribute">
      <literals>
        <Literal name="age" type="Integer" range="[18, 85]"/>
        <Literal name="income_level" type="Real" range="[0, 1]"/>
        <Literal name="education_level" type="Real" range="[0, 1]"/>
        <Literal name="political_leaning" type="Real" range="[-1, 1]"/>
        <Literal name="media_consumption" type="Real" range="[0, 1]"/>
        <Literal name="civic_engagement" type="Real" range="[0, 1]"/>
        <Literal name="protest_tendency" type="Real" range="[0, 1]"/>
      </literals>
    </Enumeration>
  </enumerations>

  <!-- Clase Agent Principal -->
  <classes>
    <Class name="Agent" isAbstract="true">
      <attributes>
        <Attribute name="id" type="UUID" multiplicity="1" isReadOnly="true"/>
        <Attribute name="sector" type="AgentSector" multiplicity="1"/>
        <Attribute name="age" type="Integer" multiplicity="1"/>
        <Attribute name="income_level" type="Real" multiplicity="1"/>
        <Attribute name="education_level" type="Real" multiplicity="1"/>
        <Attribute name="political_leaning" type="Real" multiplicity="1"/>
      </attributes>

      <operations>
        <Operation name="initialize" visibility="public">
          <parameters>
            <Parameter name="sector" type="AgentSector"/>
            <Parameter name="seed" type="Integer"/>
          </parameters>
        </Operation>

        <Operation name="updateOpinion" visibility="public">
          <parameters>
            <Parameter name="topic" type="String"/>
            <Parameter name="delta" type="Real"/>
          </parameters>
          <constraints>
            <Constraint name="opinion_range" language="OCL">
              "self.opinions->forAll(v | v >= -1 and v <= 1)"
            </Constraint>
          </constraints>
        </Operation>

        <Operation name="calculateHappiness" visibility="public">
          <return type="Real"/>
        </Operation>
      </operations>
    </Class>

    <!-- Clase AgentSintetico Especializada -->
    <Class name="SyntheticAgent" extends="Agent">
      <attributes>
        <Attribute name="opinions" type="Dict[String, Real]" multiplicity="1"/>
        <Attribute name="happiness" type="Real" multiplicity="1" defaultValue="50"/>
        <Attribute name="voting_intention" type="String" multiplicity="0..1"/>
        <Attribute name="behavior_patterns" type="BehaviorPatterns" multiplicity="1"/>
      </attributes>

      <operations>
        <Operation name="interact" visibility="private">
          <parameters>
            <Parameter name="other" type="SyntheticAgent"/>
            <Parameter name="convergence_parameter" type="Real"/>
            <Parameter name="opinion_bound" type="Real"/>
          </parameters>
        </Operation>

        <Operation name="respondToPolicy" visibility="public">
          <parameters>
            <Parameter name="policy" type="PolicyIntervention"/>
          </parameters>
        </Operation>
      </operations>
    </Class>
  </classes>

  <!-- Relaciones -->
  <associations>
    <Association name="AgentPolicyInteraction">
      <source class="SyntheticAgent" multiplicity="*"/>
      <target class="PolicyIntervention" multiplicity="*"/>
      <properties>
        <Property name="impact" type="Real"/>
        <Property name="timestamp" type="DateTime"/>
      </properties>
    </Association>
  </associations>

  <!-- Restricciones del Modelo -->
  <constraints>
    <Constraint name="population_size" language="OCL">
      "context Model:
       self.agents->size() >= 100 and self.agents->size() <= 1000000"
    </Constraint>

    <Constraint name="sector_distribution" language="OCL">
      "context SyntheticAgent:
       let total = SyntheticAgent.allInstances()->size():
       SyntheticAgent.allInstances()
         ->select(a | a.sector = AgentSector::small_business)
         ->size() >= total * 0.20"
    </Constraint>
  </constraints>

</civic:Model>
```

### 3.2 Modelo de Proceso de Orquestación

El modelo de proceso de orquestación define el flujo de trabajo que sigue una consulta de análisis a través del sistema multi-agente. Este modelo es fundamental para asegurar que todas las etapas del análisis se ejecuten correctamente y en el orden apropiado.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<civic:ProcessModel xmi:version="2.0"
                    xmlns:xmi="http://www.omg.org/XMI"
                    xmlns:civic="http://civica.os/mdd/process-model"
                    name="OrchestrationProcess" version="1.0.0">

  <processes>
    <Process name="CivicAnalysisOrchestration">
      <description>
        Proceso principal de orquestación para análisis cívico.
        Coordina múltiples agentes especializados para producir
        recomendaciones actionable a partir de consultas de usuario.
      </description>

      <activities>
        <!-- Actividad Inicial -->
        <Activity name="ReceiveUserQuery" type="initial">
          <input>
            <Property name="query_text" type="String"/>
            <Property name="context" type="QueryContext"/>
          </input>
          <output>
            <Property name="parsed_query" type="ParsedQuery"/>
          </output>
          <implementation>
            <service>OrchestratorService</service>
            <operation>parseQuery</operation>
          </implementation>
        </Activity>

        <!-- Agente Super -->
        <Activity name="DecomposeTask" type="task" agent="SUPER_AGENT">
          <input>
            <Property name="parsed_query" type="ParsedQuery"/>
          </input>
          <output>
            <Property name="subtasks" type="Subtask[]"/>
          </output>
          <implementation>
            <service>SuperAgentService</service>
            <operation>decomposeQuery</operation>
          </implementation>
          <timeEstimate unit="seconds" min="1" max="5"/>
        </Activity>

        <!-- Agente Data Collector -->
        <Activity name="CollectData" type="task" agent="DATA_COLLECTOR">
          <input>
            <Property name="task_spec" type="DataCollectionSpec"/>
          </input>
          <output>
            <Property name="collected_data" type="CollectedData"/>
            <Property name="data_quality" type="DataQualityReport"/>
          </output>
          <implementation>
            <service>DataCollectorAgent</service>
            <operation>collect</operation>
          </implementation>
          <timeEstimate unit="seconds" min="10" max="60"/>
          <dependencies>
            <Dependency source="DecomposeTask"/>
          </dependencies>
        </Activity>

        <!-- Agente Analyzer -->
        <Activity name="AnalyzePatterns" type="task" agent="ANALYZER">
          <input>
            <Property name="collected_data" type="CollectedData"/>
            <Property name="analysis_type" type="AnalysisType"/>
          </input>
          <output>
            <Property name="pain_points" type="PainPoint[]"/>
            <Property name="geographic_clusters" type="GeoCluster[]"/>
            <Property name="trends" type="Trend[]"/>
          </output>
          <implementation>
            <service>AnalyzerAgent</service>
            <operation>analyze</operation>
          </implementation>
          <timeEstimate unit="seconds" min="15" max="45"/>
          <dependencies>
            <Dependency source="CollectData"/>
          </dependencies>
        </Activity>

        <!-- Agente Simulator -->
        <Activity name="RunSimulation" type="task" agent="SIMULATOR">
          <input>
            <Property name="pain_points" type="PainPoint[]"/>
            <Property name="policies" type="PolicyIntervention[]"/>
            <Property name="simulation_config" type="SimulationConfig"/>
          </input>
          <output>
            <Property name="simulation_results" type="SimulationResult[]"/>
            <Property name="trajectories" type="Trajectory[]"/>
          </output>
          <implementation>
            <service>SimulatorAgent</service>
            <operation>simulate</operation>
          </implementation>
          <timeEstimate unit="seconds" min="20" max="120"/>
          <dependencies>
            <Dependency source="AnalyzePatterns"/>
          </dependencies>
          <optional>true</optional>
        </Activity>

        <!-- Agente Recommender -->
        <Activity name="GenerateRecommendations" type="task" agent="RECOMMENDER">
          <input>
            <Property name="analysis_results" type="AnalysisResult"/>
            <Property name="simulation_results" type="SimulationResult[]"/>
            <Property name="preferences" type="RecommendationPreferences"/>
          </input>
          <output>
            <Property name="recommendations" type="Recommendation[]"/>
            <Property name="priority_order" type="Priority[]"/>
            <Property name="risk_assessment" type="RiskAssessment"/>
          </output>
          <implementation>
            <service>RecommenderAgent</service>
            <operation>recommend</operation>
          </implementation>
          <timeEstimate unit="seconds" min="10" max="30"/>
          <dependencies>
            <Dependency source="AnalyzePatterns"/>
            <Dependency source="RunSimulation" optional="true"/>
          </dependencies>
        </Activity>

        <!-- Agente Integrator -->
        <Activity name="IntegrateWithOBP" type="task" agent="INTEGRATOR">
          <input>
            <Property name="recommendations" type="Recommendation[]"/>
            <Property name="export_config" type="ExportConfig"/>
          </input>
          <output>
            <Property name="export_result" type="OBPExportResult"/>
          </output>
          <implementation>
            <service>IntegratorAgent</service>
            <operation>exportToOBP</operation>
          </implementation>
          <timeEstimate unit="seconds" min="5" max="20"/>
          <dependencies>
            <Dependency source="GenerateRecommendations"/>
          </dependencies>
          <optional>true</optional>
        </Activity>

        <!-- Actividad Final -->
        <Activity name="CompileResults" type="final">
          <input>
            <Property name="all_outputs" type="Map[String, Any]"/>
          </input>
          <output>
            <Property name="orchestration_result" type="OrchestrationResult"/>
            <Property name="audit_log" type="AuditLog[]"/>
          </output>
          <implementation>
            <service>OrchestratorService</service>
            <operation>compileResults</operation>
          </implementation>
        </Activity>
      </activities>

      <transitions>
        <Transition source="ReceiveUserQuery" target="DecomposeTask">
          <guard>
            <Condition language="Simple">
              "parsed_query.is_valid"
            </Condition>
          </guard>
        </Transition>

        <Transition source="DecomposeTask" target="CollectData">
          <guard>
            <Condition language="Simple">
              "subtasks.size() > 0"
            </Condition>
          </guard>
        </Transition>

        <Transition source="CollectData" target="AnalyzePatterns">
          <guard>
            <Condition language="Simple">
              "collected_data.is_complete"
            </Condition>
          </guard>
        </Transition>

        <Transition source="AnalyzePatterns" target="RunSimulation">
          <guard>
            <Condition language="Simple">
              "simulation_config.requested"
            </Condition>
          </guard>
          <onSkip target="GenerateRecommendations"/>
        </Transition>

        <Transition source="RunSimulation" target="GenerateRecommendations"/>

        <Transition source="GenerateRecommendations" target="IntegrateWithOBP">
          <guard>
            <Condition language="Simple">
              "export_config.enabled"
            </Condition>
          </guard>
          <onSkip target="CompileResults"/>
        </Transition>

        <Transition source="IntegrateWithOBP" target="CompileResults"/>

        <Transition source="CompileResults" target="ProcessEnd">
          <type>completion</type>
        </Transition>
      </transitions>

    </Process>
  </processes>

</civic:ProcessModel>
```

---

## 4. Reglas de Transformación

### 4.1 Transformación: Modelo de Dominio a TypeScript

Esta regla de transformación genera código TypeScript a partir de los modelos de dominio. La transformación preserva la estructura de clases, genera validaciones automáticas basadas en las restricciones del modelo, y crea tipos para todas las enumeraciones y estructuras de datos.

```epsilon
// src/transformations/DomainToTypeScript.eol

import 'platform:/resource/civicaos/mdd/metamodel/Core.ecore';
import 'platform:/resource/civicaos/mdd/metamodel/Domain.ecore';

@greedy
transformation DomainToTypeScript {
  public outModel: Standard::Model;

  @creates outModel
  main() {
    outModel := new Standard::Model;
    outModel.name := 'Generated TypeScript Types';

    -- Transformar enumeraciones
    Enumeration.allInstances().forEach(e) {
      this.transformEnumeration(e);
    };

    -- Transformar clases
    Class.allInstances().forEach(c) {
      if c.isAbstract then
        this.transformAbstractClass(c)
      else
        this.transformConcreteClass(c)
      endif
    };
  }

  operation transformEnumeration(e: Enumeration) {
    var enumFile: Standard::ModelElement := new Standard::ModelElement;
    enumFile.name := e.name + '.ts';

    var content: String := 'export enum ' + e.name + ' {\n';
    e.literals.forEach(l | l.index < e.literals.size() - 1) {
      content := content + '  ' + l.name + ' = \'' + l.name + '\',\n';
    } orElse {
      content := content + '  ' + l.name + ' = \'' + l.name + '\'\n';
    };
    content := content + '}\n\n';
    content := content + 'export type ' + e.name + 'Literal = ';
    e.literals.forEach(l | l.index < e.literals.size() - 1) {
      content := content + '\'' + l.name + '\' | ';
    } orElse {
      content := content + '\'' + l.name + '\';\n';
    };

    enumFile.setProperty('content', content);
    outModel.addElement(enumFile);
  }

  operation transformConcreteClass(c: Class) {
    var classFile: Standard::ModelElement := new Standard::ModelElement;
    classFile.name := c.name + '.ts';

    var content: String := '';
    content := content + 'export interface ' + c.name + 'Props {\n';
    c.attributes.forEach(a | {
      content := content + '  ' + a.name + ': ' + this.tsType(a.type) + ';\n';
    });
    content := content + '}\n\n';

    content := content + 'export class ' + c.name + ' {\n';
    content := content + '  private constructor(private props: ' + c.name + 'Props) {}\n\n';

    content := content + '  public static create(props: ' + c.name + 'Props): ' + c.name + ' {\n';
    content := content + '    // Validaciones generadas automáticamente\n';
    c.attributes.forEach(a | {
      if a.type.isKindOf(DataType::String) then
        content := content + '    if (!props.' + a.name + ') throw new Error("' + a.name + ' es requerido");\n'
      endif
    });
    content := content + '    return new ' + c.name + '(props);\n';
    content := content + '  }\n\n';

    -- Generar getters
    c.attributes.forEach(a | {
      content := content + '  get ' + a.name + '(): ' + this.tsType(a.type) + ' {\n';
      content := content + '    return this.props.' + a.name + ';\n';
      content := content + '  }\n\n';
    });

    content := content + '}\n';

    classFile.setProperty('content', content);
    outModel.addElement(classFile);
  }

  operation tsType(type: DataType): String {
    if type.isKindOf(DataType::String) then return 'string' endif;
    if type.isKindOf(DataType::Integer) then return 'number' endif;
    if type.isKindOf(DataType::Real) then return 'number' endif;
    if type.isKindOf(DataType::Boolean) then return 'boolean' endif;
    if type.isKindOf(DataType::Date) then return 'Date' endif;
    if type.isKindOf(Enumeration) then return type.name else return 'any' endif;
  }
}
```

### 4.2 Transformación: Modelo de Proceso a Código de Orquestación

Esta transformación genera el código de implementación del orquestador a partir del modelo de proceso. El código generado incluye la gestión de estados, el manejo de dependencias entre actividades, y la integración con el sistema de eventos.

```epsilon
// src/transformations/ProcessToOrchestrator.eol

import 'platform:/resource/civicaos/mdd/metamodel/Behavior.ecore';

transformation ProcessToOrchestrator {
  main() {
    Process.allInstances().forEach(p) {
      this.generateOrchestratorClass(p);
      this.generateActivityHandlers(p);
      this.generateTransitionManager(p);
    };
  }

  operation generateOrchestratorClass(p: Process) {
    var className := p.name.replace(' ', '') + 'Orchestrator';
    var content := '''
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../shared/logger';
import { AuditService } from '../services/AuditService';

export interface OrchestrationContext {
  jobId: string;
  startTime: Date;
  userId?: string;
  query: string;
  state: Map<string, any>;
}

export class ''' + className + ''' extends EventEmitter {
  private context: OrchestrationContext;
  private activityStates: Map<string, ActivityState> = new Map();
  private logger: Logger;

  constructor() {
    super();
    this.logger = new Logger('Orchestrator');
  }

  public async execute(input: any): Promise<any> {
    this.context = {
      jobId: uuidv4(),
      startTime: new Date(),
      state: new Map()
    };

    this.logger.info(`Starting orchestration: ${this.context.jobId}`);

    await this.executeInitialActivity('ReceiveUserQuery', input);

    const result = await this.compileResults();
    this.logger.info(`Orchestration completed: ${this.context.jobId}`);

    return result;
  }

  private async executeInitialActivity(name: string, input: any): Promise<void> {
    this.logger.info(`Executing initial activity: ${name}`);
    // Implementar lógica de actividad inicial
  }

  private async executeTaskActivity(name: string, input: any): Promise<void> {
    const activity = this.getActivity(name);
    if (!activity) {
      throw new Error(`Activity not found: ${name}`);
    }

    this.updateActivityState(name, 'processing');
    this.emit('activity:started', { activity: name, jobId: this.context.jobId });

    try {
      const startTime = Date.now();
      const result = await this.callAgentService(activity, input);
      const duration = Date.now() - startTime;

      this.context.state.set(name, result);
      this.updateActivityState(name, 'completed', { duration, result });

      this.emit('activity:completed', {
        activity: name,
        jobId: this.context.jobId,
        duration
      });
    } catch (error) {
      this.updateActivityState(name, 'failed', { error: error.message });
      this.emit('activity:failed', { activity: name, error });
      throw error;
    }
  }

  private async evaluateTransitions(fromActivity: string): Promise<string | null> {
    const transitions = this.getOutgoingTransitions(fromActivity);

    for (const transition of transitions) {
      if (this.evaluateGuard(transition.guard)) {
        return transition.target;
      }
    }

    return null;
  }

  private evaluateGuard(guard: GuardCondition): boolean {
    if (!guard) return true;

    // Evaluar condición de guard
    const { expression } = guard;
    const state = this.context.state;

    // Implementar evaluación de expresiones OCL simplificadas
    return true;
  }

  private async compileResults(): Promise<any> {
    const results = {};
    this.context.state.forEach((value, key) => {
      results[key] = value;
    });

    return {
      jobId: this.context.jobId,
      results,
      duration: Date.now() - this.context.startTime.getTime(),
      auditLog: await AuditService.getInstance().getLogs(this.context.jobId)
    };
  }

  private updateActivityState(name: string, status: string, data?: any): void {
    this.activityStates.set(name, {
      name,
      status,
      timestamp: new Date(),
      ...data
    });
    this.emit('state:changed', { activity: name, status });
  }

  private getActivity(name: string): Activity | null {
    // Obtener definición de actividad del modelo
    return null;
  }

  private getOutgoingTransitions(name: string): Transition[] {
    // Obtener transiciones salientes
    return [];
  }

  private async callAgentService(activity: Activity, input: any): Promise<any> {
    // Llamar al servicio del agente correspondiente
    return {};
  }
}
''';

    this.writeFile(className + '.ts', content);
  }
}
```

---

## 5. Flujo de Transformación de Modelos

### 5.1 Pipeline de Generación de Código

El pipeline de generación de código de cívicaOS transforma los modelos abstractos en código ejecutable siguiendo una secuencia de pasos que aseguran calidad y consistencia. El pipeline comienza con la validación de modelos, donde cada modelo se verifica contra el meta-modelo y las restricciones definidas. Los modelos que no pasan la validación se rechazan con mensajes de error específicos que indican el tipo y ubicación del problema. Esta validación temprana previene la generación de código a partir de modelos inválidos, evitando errores en cascada en las fases posteriores.

El segundo paso es la transformación de modelos, donde los modelos validados se transforman utilizando las reglas definidas. Cada tipo de modelo tiene sus propias reglas de transformación que generan diferentes artefactos. Por ejemplo, un modelo de dominio genera interfaces TypeScript, entidades de base de datos, y servicios de dominio. Un modelo de proceso genera el código del orquestador, los gestores de estado, y la configuración de eventos. Este paso utiliza el motor de transformación Epsilon para ejecutar las reglas de manera automatizada y reproducible.

El tercer paso es la síntesis de artefactos, donde los artefactos generados se combinan con templates y configuraciones para producir los archivos finales. Por ejemplo, las interfaces TypeScript se combinan con los servicios de validación para crear clases completas con constructor, getters, y métodos de negocio. Los modelos de proceso se combinan con la configuración del servidor para crear endpoints REST completos. Este paso asegura que los artefactos generados sean utilizables sin modificación adicional.

El cuarto paso es la validación post-generación, donde los artefactos generados se verifican para asegurar que cumplen con los estándares de calidad definidos. Esta validación incluye linting de código, verificación de tipos TypeScript, y revisión de que todas las dependencias están correctamente importadas. Los artefactos que no pasan la validación se marcan para revisión manual o se regeneran automáticamente si el error es recuperable.

El quinto paso es la salida de artefactos, donde los artefactos validados se escriben en el sistema de archivos del proyecto. Los archivos se organizan siguiendo la estructura del proyecto definida en el SDD, con directorios separados para domain, services, api, y components. Cada archivo incluye comentarios que indican que fue generado automáticamente y la fecha de generación, junto con instrucciones para no editar manualmente.

### 5.2 Diagrama de Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PIPELINE DE GENERACIÓN                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│   │  Modelos    │     │ Validación  │     │Transformación│    │  Síntesis  │   │
│   │  Source     │────▶│   Modelo    │────▶│  de Modelos │────▶│ de Artefa. │   │
│   │  (.xmi)     │     │  (Meta)     │     │   (Epsilon) │     │   (Templates)│   │
│   └─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘   │
│                                                                   │          │
│                                                                   ▼          │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │                        VALIDACIÓN POST-GENERACIÓN                     │   │
│   │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐           │   │
│   │  │  TSLint   │  │ TypeScript│  │  Deps     │  │ Coverage  │           │   │
│   │  │ Validation│  │  Check    │  │ Check     │  │ Verify    │           │   │
│   │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘           │   │
│   │        └──────────────┴──────────────┴──────────────┘               │   │
│   └──────────────────────────────────┬────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │                        SALIDA DE ARTEFACTOS                           │   │
│   │                                                                       │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│   │  │  Domain     │  │  Services   │  │    API      │  │  Components │  │   │
│   │  │  Entities   │  │  Business   │  │  REST API   │  │    React    │  │   │
│   │  │  *.ts       │  │  Logic.ts   │  │  Router.ts  │  │   *.tsx     │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│   │                                                                       │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│   │  │   Tests    │  │  Database   │  │   Config    │  │    Docs     │  │   │
│   │  │  Spec.ts   │  │  Schema.sql │  │  Docker.yml │  │   API.md    │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│   │                                                                       │   │
│   └───────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Herramientas y Configuración del MDD

### 6.1 Configuración del Entorno Eclipse Modeling

El entorno de modelado de cívicaOS se configura utilizando Eclipse Modeling Framework (EMF) con plugins especializados. Esta configuración permite la edición visual de modelos, la validación automática, y la ejecución de transformaciones desde el IDE.

```json
// .civicaos/mdd-config.json
{
  "metaModelVersion": "1.0.0",
  "workspacePath": "./workspace",
  "modelStoragePath": "./models",
  "generationOutputPath": "./src/generated",
  "transformationEngine": "epsilon",

  "metaModels": [
    {
      "name": "Core",
      "path": "metamodel/Core.ecore",
      "description": "Elementos base del meta-modelo"
    },
    {
      "name": "Domain",
      "path": "metamodel/Domain.ecore",
      "description": "Conceptos del dominio de inteligencia cívica"
    },
    {
      "name": "Behavior",
      "path": "metamodel/Behavior.ecore",
      "description": "Modelos de comportamiento y procesos"
    },
    {
      "name": "Infrastructure",
      "path": "metamodel/Infrastructure.ecore",
      "description": "Elementos de infraestructura técnica"
    }
  ],

  "transformations": [
    {
      "name": "DomainToTypeScript",
      "source": "metamodel/Domain.ecore",
      "target": "code/typescript",
      "engine": "epsilon",
      "script": "transformations/DomainToTypeScript.eol",
      "outputFolder": "src/generated/domain"
    },
    {
      "name": "ProcessToOrchestrator",
      "source": "metamodel/Behavior.ecore",
      "target": "code/typescript",
      "engine": "epsilon",
      "script": "transformations/ProcessToOrchestrator.eol",
      "outputFolder": "src/generated/orchestrator"
    },
    {
      "name": "DomainToPostgreSQL",
      "source": "metamodel/Domain.ecore",
      "target": "database/sql",
      "engine": "epsilon",
      "script": "transformations/DomainToPostgreSQL.eol",
      "outputFolder": "database/migrations"
    }
  ],

  "validation": {
    "enabled": true,
    "runOnSave": true,
    "constraints": [
      {
        "name": "noCircularDependencies",
        "severity": "error"
      },
      {
        "name": "requiredAttributes",
        "severity": "error"
      },
      {
        "name": "consistentNaming",
        "severity": "warning"
      }
    ]
  },

  "generationOptions": {
    "addHeaderComment": true,
    "headerTemplate": "/* Generated by CívicaOS MDD on {{date}}. Do not edit manually. */",
    "formatOutput": true,
    "organizeImports": true
  }
}
```

### 6.2 Scripts de Automatización

Los scripts de automatización permiten ejecutar el pipeline de generación desde la línea de comandos, facilitando la integración con sistemas de CI/CD.

```typescript
// scripts/mdd-generator.ts

import { MddConfig, MetaModelLoader, TransformationEngine } from '@civicaos/mdd-core';
import { Logger } from '@civicaos/logger';

export class MddGenerator {
  private config: MddConfig;
  private logger: Logger;
  private metaModelLoader: MetaModelLoader;
  private transformationEngine: TransformationEngine;

  constructor() {
    this.config = MddConfig.load('./.civicaos/mdd-config.json');
    this.logger = new Logger('MDDGenerator');
    this.metaModelLoader = new MetaModelLoader();
    this.transformationEngine = new TransformationEngine();
  }

  public async runPipeline(): Promise<void> {
    this.logger.info('Starting MDD pipeline...');

    try {
      // Cargar meta-modelos
      this.logger.info('Loading meta-models...');
      await this.loadMetaModels();

      // Validar modelos de entrada
      this.logger.info('Validating source models...');
      const validationResults = await this.validateModels();
      if (!validationResults.success) {
        this.logger.error('Model validation failed:', validationResults.errors);
        process.exit(1);
      }

      // Ejecutar transformaciones
      this.logger.info('Running transformations...');
      for (const transformation of this.config.transformations) {
        await this.runTransformation(transformation);
      }

      // Validar artefactos generados
      this.logger.info('Validating generated artifacts...');
      const artifactResults = await this.validateArtifacts();
      if (!artifactResults.success) {
        this.logger.warn('Artifact validation found issues:', artifactResults.warnings);
      }

      this.logger.info('MDD pipeline completed successfully.');
    } catch (error) {
      this.logger.error('Pipeline failed:', error);
      process.exit(1);
    }
  }

  private async loadMetaModels(): Promise<void> {
    for (const metaModel of this.config.metaModels) {
      const model = await this.metaModelLoader.load(metaModel.path);
      this.transformationEngine.registerMetaModel(metaModel.name, model);
    }
  }

  private async validateModels(): Promise<ValidationResult> {
    // Implementar validación de modelos
    return { success: true, errors: [], warnings: [] };
  }

  private async runTransformation(
    transformation: TransformationConfig
  ): Promise<void> {
    this.logger.info(`Running transformation: ${transformation.name}`);

    const sourceModel = await this.loadModel(transformation.source);
    const result = await this.transformationEngine.execute(
      transformation.script,
      sourceModel
    );

    await this.writeArtifacts(transformation.outputFolder, result);
    this.logger.info(`Transformation ${transformation.name} completed.`);
  }

  private async validateArtifacts(): Promise<ValidationResult> {
    // Implementar validación de artefactos
    return { success: true, errors: [], warnings: [] };
  }
}

// Punto de entrada
const generator = new MddGenerator();
generator.runPipeline();
```

---

*Documento MDD actualizado: 2026-05-18*
*Próxima revisión programada: 2026-06-18*