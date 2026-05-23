#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
analisis_correlacion.py — CívicaOS Engine
Motor matemático de correlación estadística y predicción de tendencias socioeconómicas.
"""

import os
import json
import psycopg2
import math
import sys

# Configuración de base de datos
DB_NAME = "civicaos"
DB_USER = "robertoeduardocelisrobles"
DB_HOST = "localhost"
OUTPUT_PATH = "/Volumes/SSD1TB/plataforma/simulation/insights_correlacion.json"

def conectar_db():
    return psycopg2.connect(dbname=DB_NAME, user=DB_USER, host=DB_HOST)

def calcular_media(valores):
    if not valores:
        return 0.0
    return sum(valores) / len(valores)

def calcular_desviacion_estandar(valores, media):
    if len(valores) <= 1:
        return 0.0
    suma_dif_cuad = sum((x - media) ** 2 for x in valores)
    return math.sqrt(suma_dif_cuad / (len(valores) - 1))

def calcular_pearson(x, y, media_x, media_y, std_x, std_y):
    if len(x) != len(y) or len(x) <= 1 or std_x == 0.0 or std_y == 0.0:
        return 0.0
    covarianza = sum((x[i] - media_x) * (y[i] - media_y) for i in range(len(x))) / (len(x) - 1)
    return covarianza / (std_x * std_y)

def normalizar(valor, min_val, max_val):
    if max_val == min_val:
        return 0.0
    return (valor - min_val) / (max_val - min_val)

def main():
    print("=== CívicaOS Engine: Motor de Análisis de Tendencias Sociales ===")
    
    try:
        conn = conectar_db()
        print("🐘 Conectado con éxito a PostgreSQL 17.")
    except Exception as e:
        print(f"❌ Error al conectar a la base de datos: {e}", file=sys.stderr)
        sys.exit(1)

    # 1. Cargar datos de secciones de la base de datos (Filtramos por San Luis Potosí '24' para el Piloto)
    print("📥 Cargando indicadores consolidados de San Luis Potosí...")
    columnas = [
        "id_seccion", "total_establecimientos", "comercios_retail",
        "servicios_alimentos", "manufactura", "poblacion_estimada",
        "promedio_escolaridad", "poblacion_activa"
    ]
    
    datos = []
    with conn.cursor() as cur:
        cur.execute(f"""
            SELECT {', '.join(columnas)} 
            FROM secciones_indicadores 
            WHERE estado = '24';
        """)
        datos = cur.fetchall()
    
    conn.close()
    
    total_registros = len(datos)
    print(f"📂 Se cargaron {total_registros} secciones electorales piloto.")
    
    if total_registros <= 1:
        print("⚠️ No hay suficientes datos para realizar cálculos de correlación.")
        sys.exit(0)

    # 2. Desempaquetar columnas en listas independientes
    secciones = [r[0] for r in datos]
    tot_estab = [float(r[1]) for r in datos]
    retail = [float(r[2]) for r in datos]
    alimentos = [float(r[3]) for r in datos]
    manuf = [float(r[4]) for r in datos]
    pob_est = [float(r[5]) for r in datos]
    escolaridad = [float(r[6]) for r in datos]
    pob_act = [float(r[7]) for r in datos]

    # 3. Calcular Estadísticas Descriptivas Básicas
    variables = {
        "total_establecimientos": tot_estab,
        "comercios_retail": retail,
        "servicios_alimentos": alimentos,
        "manufactura": manuf,
        "poblacion_estimada": pob_est,
        "promedio_escolaridad": escolaridad,
        "poblacion_activa": pob_act
    }

    stats = {}
    for var, vals in variables.items():
        media = calcular_media(vals)
        std = calcular_desviacion_estandar(vals, media)
        stats[var] = {
            "media": round(media, 4),
            "desviacion_estandar": round(std, 4),
            "min": round(min(vals), 4),
            "max": round(max(vals), 4)
        }

    # 4. Calcular Matriz de Correlación de Pearson
    print("🧮 Calculando matriz de correlación de Pearson...")
    nombres_var = list(variables.keys())
    matriz_correlacion = {}
    
    for v1 in nombres_var:
        matriz_correlacion[v1] = {}
        for v2 in nombres_var:
            m1, std1 = stats[v1]["media"], stats[v1]["desviacion_estandar"]
            m2, std2 = stats[v2]["media"], stats[v2]["desviacion_estandar"]
            coef = calcular_pearson(variables[v1], variables[v2], m1, m2, std1, std2)
            matriz_correlacion[v1][v2] = round(coef, 4)

    # 5. Identificar Secciones Hotspots (Puntos Calientes)
    print("🔥 Identificando Hotspots socioeconómicos...")
    hotspots_economicos = []
    hotspots_educativos = []
    
    # Crear listado estructurado para ordenar
    seccion_data_list = []
    for i in range(total_registros):
        seccion_data_list.append({
            "id_seccion": secciones[i],
            "total_establecimientos": tot_estab[i],
            "promedio_escolaridad": escolaridad[i],
            "poblacion_estimada": pob_est[i]
        })

    # Top 10 Densidad Económica
    seccion_data_list.sort(key=lambda x: x["total_establecimientos"], reverse=True)
    hotspots_economicos = seccion_data_list[:10]

    # Top 10 Escolaridad
    seccion_data_list.sort(key=lambda x: x["promedio_escolaridad"], reverse=True)
    hotspots_educativos = seccion_data_list[:10]

    # 6. Generar Índice de Dinamismo Social y Predicciones
    # El Índice de Dinamismo combina escolaridad promedio, densidad comercial y actividad laboral.
    print("📈 Modelando el Índice de Dinamismo Social por Sección...")
    secciones_dinamismo = []
    
    for i in range(total_registros):
        esc_norm = normalizar(escolaridad[i], stats["promedio_escolaridad"]["min"], stats["promedio_escolaridad"]["max"])
        estab_norm = normalizar(tot_estab[i], stats["total_establecimientos"]["min"], stats["total_establecimientos"]["max"])
        act_norm = normalizar(pob_act[i], stats["poblacion_activa"]["min"], stats["poblacion_activa"]["max"])
        
        # Fórmula ponderada del Índice
        indice = (0.4 * esc_norm) + (0.3 * estab_norm) + (0.3 * act_norm)
        
        # Clasificar la sección
        if indice >= 0.7:
            categoria = "Muy Alto Dinamismo"
        elif indice >= 0.4:
            categoria = "Dinamismo Moderado"
        else:
            categoria = "Bajo Dinamismo Social"
            
        secciones_dinamismo.append({
            "id_seccion": secciones[i],
            "indice_dinamismo": round(indice, 4),
            "categoria": categoria
        })

    # Ordenar por índice de dinamismo
    secciones_dinamismo.sort(key=lambda x: x["indice_dinamismo"], reverse=True)

    # 7. Redactar Reporte de Insights en Español Premium
    print("✍️ Redactando reporte de Insights de comportamiento social...")
    insights_texto = []
    
    corr_edu_eco = matriz_correlacion["promedio_escolaridad"]["total_establecimientos"]
    if corr_edu_eco > 0.5:
        insights_texto.append(
            f"Fuerte correlación positiva ({corr_edu_eco}) entre el nivel educativo promedio y la densidad de comercios establecidos. "
            "Las zonas de alta escolaridad son imanes naturales para el dinamismo económico local."
        )
    elif corr_edu_eco > 0.2:
        insights_texto.append(
            f"Se observa una tendencia positiva moderada ({corr_edu_eco}) que relaciona la escolaridad promedio de la población "
            "con un incremento en las actividades comerciales y de servicios en la sección."
        )
    else:
        insights_texto.append(
            f"Existe una correlación débil ({corr_edu_eco}) entre el promedio educativo y los establecimientos locales. "
            "Esto sugiere que la actividad comercial se distribuye de manera homogénea independientemente del nivel socioeducativo."
        )

    corr_act_est = matriz_correlacion["poblacion_activa"]["total_establecimientos"]
    if corr_act_est > 0.4:
        insights_texto.append(
            f"El volumen de la población económicamente activa y la cantidad de negocios están fuertemente acoplados ({corr_act_est}). "
            "Las fuentes de empleo directo se concentran fuertemente dentro de estas mismas secciones."
        )

    # 8. Exportar JSON consolidado
    reporte = {
        "metadata": {
            "estado_piloto": "San Luis Potosí (Clave 24)",
            "total_secciones_analizadas": total_registros,
            "timestamp": "2026-05-19"
        },
        "estadisticas_descriptivas": stats,
        "matriz_correlacion": matriz_correlacion,
        "hotspots": {
            "top_densidad_economica": hotspots_economicos,
            "top_nivel_educativo": hotspots_educativos
        },
        "top_dinamismo_social": secciones_dinamismo[:20],
        "insights_clave": insights_texto
    }

    # Guardar en archivo
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(reporte, f, indent=4, ensure_ascii=False)

    print(f"🎉 Proceso finalizado. El reporte científico de correlaciones ha sido exportado en: {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
