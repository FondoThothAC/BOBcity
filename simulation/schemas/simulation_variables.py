import json
import os
from typing import Dict, List, Any

class SimulationVariablesSchema:
    """
    Define el esquema central de variables para la simulación histórica y futura (Las 1000+ variables).
    Organizado por Dimensiones y Categorías.
    """
    
    @staticmethod
    def get_core_dimensions() -> Dict[str, Any]:
        return {
            "dimension_sociodemografica": {
                "description": "Datos de población, salud y educación (Fuente principal: INEGI)",
                "categories": {
                    "poblacion": [
                        {"id": "pop_total", "name": "Población Total", "type": "int"},
                        {"id": "pop_densidad", "name": "Densidad Poblacional (hab/km2)", "type": "float"},
                        {"id": "pop_edad_mediana", "name": "Edad Mediana", "type": "float"},
                        {"id": "pop_hombres_pct", "name": "Porcentaje Hombres", "type": "float"},
                        {"id": "pop_mujeres_pct", "name": "Porcentaje Mujeres", "type": "float"},
                        {"id": "tasa_natalidad", "name": "Tasa de Natalidad", "type": "float"},
                        {"id": "tasa_mortalidad", "name": "Tasa de Mortalidad General", "type": "float"}
                    ],
                    "educacion": [
                        {"id": "edu_escolaridad_promedio", "name": "Grado Promedio de Escolaridad", "type": "float"},
                        {"id": "edu_analfabetismo_pct", "name": "Tasa de Analfabetismo", "type": "float"},
                        {"id": "edu_escuelas_publicas", "name": "Número de Escuelas Públicas", "type": "int"},
                        {"id": "edu_escuelas_privadas", "name": "Número de Escuelas Privadas", "type": "int"}
                    ],
                    "salud": [
                        {"id": "salud_camas_hospital", "name": "Camas de hospital por 1000 hab", "type": "float"},
                        {"id": "salud_derechohabiencia_pct", "name": "Porcentaje con acceso a salud pública", "type": "float"},
                        {"id": "salud_mortalidad_infantil", "name": "Tasa de mortalidad infantil", "type": "float"}
                    ]
                }
            },
            "dimension_economica": {
                "description": "Datos de economía local, empleo y finanzas (Fuentes: INEGI, SHCP)",
                "categories": {
                    "macro_local": [
                        {"id": "econ_pib_municipal", "name": "PIB Municipal Estimado", "type": "float"},
                        {"id": "econ_inflacion_local", "name": "Índice de Precios Local", "type": "float"},
                        {"id": "econ_inversion_extranjera", "name": "Inversión Extranjera Directa", "type": "float"}
                    ],
                    "empleo": [
                        {"id": "emp_tasa_desempleo", "name": "Tasa de Desocupación", "type": "float"},
                        {"id": "emp_tasa_informalidad", "name": "Tasa de Informalidad Laboral", "type": "float"},
                        {"id": "emp_salario_promedio", "name": "Salario Diario Integrado Promedio", "type": "float"}
                    ],
                    "fiscal_municipal": [
                        {"id": "fisc_recaudacion_predial", "name": "Recaudación de Predial (MXN)", "type": "float"},
                        {"id": "fisc_participaciones_federales", "name": "Participaciones Federales Ramo 33 (MXN)", "type": "float"},
                        {"id": "fisc_deuda_publica", "name": "Deuda Pública Municipal (MXN)", "type": "float"}
                    ]
                }
            },
            "dimension_infraestructura": {
                "description": "Desarrollo urbano y servicios públicos",
                "categories": {
                    "servicios": [
                        {"id": "inf_cobertura_agua", "name": "Cobertura de Agua Potable (%)", "type": "float"},
                        {"id": "inf_cobertura_drenaje", "name": "Cobertura de Drenaje (%)", "type": "float"},
                        {"id": "inf_cobertura_electricidad", "name": "Cobertura de Energía Eléctrica (%)", "type": "float"}
                    ],
                    "movilidad": [
                        {"id": "mov_vehiculos_motor", "name": "Vehículos de motor registrados", "type": "int"},
                        {"id": "mov_km_pavimentados", "name": "Kilómetros de calles pavimentadas", "type": "float"},
                        {"id": "mov_accidentes_transito", "name": "Accidentes de tránsito anuales", "type": "int"}
                    ]
                }
            },
            "dimension_politico_electoral": {
                "description": "Resultados electorales e ideología (Fuentes: INE, OPLES)",
                "categories": {
                    "resultados": [
                        {"id": "elec_participacion_pct", "name": "Porcentaje de Participación Ciudadana", "type": "float"},
                        {"id": "elec_partido_ganador", "name": "Partido Político Ganador", "type": "string"},
                        {"id": "elec_margen_victoria", "name": "Margen de Victoria (%)", "type": "float"},
                        {"id": "elec_alternancia", "name": "Hubo Alternancia Política (0/1)", "type": "int"}
                    ],
                    "perfil_candidato_ganador": [
                        {"id": "cand_genero", "name": "Género del Ganador", "type": "string"},
                        {"id": "cand_edad_eleccion", "name": "Edad al momento de la elección", "type": "int"},
                        {"id": "cand_escolaridad", "name": "Nivel de Escolaridad del Ganador", "type": "string"},
                        {"id": "cand_propuestas_clave", "name": "Lista de propuestas clave extraídas (NLP)", "type": "array"}
                    ]
                }
            },
            "dimension_seguridad": {
                "description": "Seguridad pública y percepción (Fuentes: SESNSP)",
                "categories": {
                    "incidencia_delictiva": [
                        {"id": "seg_tasa_homicidios", "name": "Tasa de Homicidios Dolosos (por 100k hab)", "type": "float"},
                        {"id": "seg_robo_vehiculos", "name": "Robo de Vehículos", "type": "int"},
                        {"id": "seg_percepcion_inseguridad", "name": "Percepción de Inseguridad (%)", "type": "float"}
                    ]
                }
            }
        }

    @staticmethod
    def generate_schema_file(output_path: str):
        schema = SimulationVariablesSchema.get_core_dimensions()
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(schema, f, indent=4, ensure_ascii=False)
        return output_path

if __name__ == "__main__":
    # Script para generar el JSON local si se llama directamente
    output = "data_lake/schemas/simulation_variables_v1.json"
    SimulationVariablesSchema.generate_schema_file(output)
    print(f"Esquema de variables generado en: {output}")
