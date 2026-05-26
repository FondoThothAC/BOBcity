import os
import json

try:
    from crewai import Agent, Task, Crew, Process
    CREW_AI_AVAILABLE = True
except ImportError:
    CREW_AI_AVAILABLE = False

# We would normally set OPENAI_API_KEY, but for now we simulate or use a dummy.
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "dummy-key-for-local-llm")

def trigger_cctv_analysis(camera_name: str, event_description: str):
    """
    Trigger a multi-agent analysis using CrewAI on a CCTV feed event.
    """
    if not CREW_AI_AVAILABLE:
        return f"[FALLBACK MODE] CrewAI no está instalado/configurado. Simulando análisis táctico de {camera_name}: {event_description}. Nodos: 2, Aristas: 1."

    try:
        # Definición de Agentes
        observer_agent = Agent(
            role='Analista OSINT de CCTV',
            goal=f'Monitorear la cámara {camera_name} y extraer datos tácticos.',
            backstory='Un ex-agente de inteligencia especializado en análisis de video y reconocimiento de anomalías urbanas.',
            verbose=True,
            allow_delegation=False
        )

        ontology_agent = Agent(
            role='Mapeador Ontológico',
            goal='Tomar los datos extraídos por el observador y generar vínculos (nodos y aristas) para Palantir Gotham.',
            backstory='Experto en análisis de grafos y teoría de redes criminales y sociales.',
            verbose=True,
            allow_delegation=False
        )

        # Definición de Tareas
        task1 = Task(
            description=f'Analizar el siguiente evento detectado en la cámara {camera_name}: "{event_description}". Extrae sujetos, vehículos y comportamientos inusuales.',
            expected_output='Lista estructurada de entidades detectadas en el evento.',
            agent=observer_agent
        )

        task2 = Task(
            description='Convierte las entidades extraídas en un formato JSON compatible con el motor ontológico (nodos y aristas).',
            expected_output='Un JSON con "nodes" y "links" mapeando el evento.',
            agent=ontology_agent
        )

        # Enjambre (Crew)
        cctv_crew = Crew(
            agents=[observer_agent, ontology_agent],
            tasks=[task1, task2],
            process=Process.sequential,
            verbose=True
        )

        # Para efectos de demostración, como no hay API Key real siempre, mockeamos el resultado si falla.
        result = cctv_crew.kickoff()
        return str(result)
    except Exception as e:
        return f"[MOCK CREW_AI RESULT DUE TO LLM API ERR] Anomalía en {camera_name} procesada: {event_description}. Entidades: Vehículo Sospechoso, Multitud 50+. Vínculos creados exitosamente. Error real: {str(e)}"

if __name__ == "__main__":
    print("Testing CrewAI Orchestrator...")
    res = trigger_cctv_analysis("Zócalo CDMX", "Multitud de 500 personas marchando hacia Palacio Nacional")
    print(res)
