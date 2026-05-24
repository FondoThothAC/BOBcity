#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# simulation/predict_engine.py
# MDD / PDD: Motor Estadístico de Correlaciones y Predicción para Cívica OS

import psycopg2
from psycopg2.extras import RealDictCursor
import numpy as np
import json

def get_connection():
    return psycopg2.connect(
        host="localhost",
        port="5432",
        dbname="civicaos",
        user="robertoeduardocelisrobles"
    )

import math

def calculate_pearson(x, y):
    """Calcula el coeficiente de correlación de Pearson entre dos listas de números"""
    if len(x) != len(y) or len(x) < 2:
        return 0.0, 1.0
    
    mx = np.mean(x)
    my = np.mean(y)
    
    xm, ym = x - mx, y - my
    
    r_num = np.sum(xm * ym)
    r_den = np.sqrt(np.sum(xm**2) * np.sum(ym**2))
    
    if r_den == 0:
        return 0.0, 1.0
        
    r = r_num / r_den
    
    # Cálculo simple aproximado del p-valor
    # t = r * sqrt((n-2)/(1-r^2))
    n = len(x)
    if abs(r) >= 1.0:
        p_val = 0.0
    else:
        t_stat = r * np.sqrt((n - 2) / (1 - r**2))
        # Aproximación de dos colas
        p_val = min(1.0, 2.0 * (1.0 - 0.5 * (1.0 + math.erf(abs(t_stat) / np.sqrt(2)))))
        
    return float(r), float(p_val)

def compute_all_correlations():
    """Analiza la base de datos y calcula correlaciones históricas"""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # 1. Obtener todas las columnas numéricas de valores_municipales_anuales
    cur.execute("SELECT * FROM valores_municipales_anuales ORDER BY municipio_id, anio;")
    rows = cur.fetchall()
    
    if not rows:
        print("No hay datos para correlacionar.")
        conn.close()
        return
        
    # Agrupar por municipio
    data_by_mun = {}
    for r in rows:
        mun_id = r["municipio_id"]
        if mun_id not in data_by_mun:
            data_by_mun[mun_id] = []
        data_by_mun[mun_id].append(r)
        
    # Limpiar tabla de correlaciones
    cur.execute("TRUNCATE TABLE correlaciones_variables;")
    
    variables = [
        "pobreza_extrema_pct", "pobreza_moderada_pct", "calles_pavimentadas_pct",
        "transporte_publico_cobertura", "alumbrado_publico_pct", "cobertura_internet_pct",
        "tasa_criminalidad", "pib_municipal", "presupuesto_shcp_mxn"
    ]
    
    variables_nombres = {
        "pobreza_extrema_pct": "Pobreza Extrema (%)",
        "pobreza_moderada_pct": "Pobreza Moderada (%)",
        "calles_pavimentadas_pct": "Pavimentación de Calles (%)",
        "transporte_publico_cobertura": "Cobertura de Transporte (%)",
        "alumbrado_publico_pct": "Alumbrado Público (%)",
        "cobertura_internet_pct": "Cobertura de Internet (%)",
        "tasa_criminalidad": "Tasa de Criminalidad (por 100k hab)",
        "pib_municipal": "PIB Municipal",
        "presupuesto_shcp_mxn": "Presupuesto Federal Asignado"
    }

    for mun_id, records in data_by_mun.items():
        n_records = len(records)
        if n_records < 3:
            continue
            
        print(f"Calculando correlaciones para municipio: {mun_id} ({n_records} años de datos)")
        
        # Extraer arrays
        data_arrays = {}
        for var in variables:
            data_arrays[var] = np.array([float(r[var]) for r in records if r[var] is not None])
            
        # Calcular correlaciones de pares
        for i in range(len(variables)):
            for j in range(i + 1, len(variables)):
                var_x = variables[i]
                var_y = variables[j]
                
                x_vals = data_arrays[var_x]
                y_vals = data_arrays[var_y]
                
                r, p = calculate_pearson(x_vals, y_vals)
                
                # Descripción interpretativa
                relacion = "positiva" if r > 0 else "negativa"
                fuerza = "fuerte" if abs(r) > 0.7 else ("moderada" if abs(r) > 0.4 else "débil")
                
                desc = (
                    f"Existe una correlación {fuerza} y {relacion} ({r:.2f}) "
                    f"entre {variables_nombres[var_x]} y {variables_nombres[var_y]}."
                )
                
                cur.execute("""
                    INSERT INTO correlaciones_variables (
                        municipio_id, variable_x, variable_y, coeficiente_correlacion, p_valor, descripcion
                    ) VALUES (%s, %s, %s, %s, %s, %s);
                """, (mun_id, var_x, var_y, r, p, desc))
                
    conn.commit()
    conn.close()
    print("Correlaciones calculadas y guardadas.")

def predict_impact(municipio_id: str, variable_modificada: str, incremento_pct: float):
    """
    Predice el impacto en cascada de modificar una variable,
    basado en las correlaciones históricas almacenadas.
    """
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Obtener las correlaciones de esta variable
    cur.execute("""
        SELECT variable_x, variable_y, coeficiente_correlacion 
        FROM correlaciones_variables
        WHERE municipio_id = %s AND (variable_x = %s OR variable_y = %s)
        AND abs(coeficiente_correlacion) > 0.3;
    """, (municipio_id, variable_modificada, variable_modificada))
    
    corrs = cur.fetchall()
    
    # Obtener el último estado del municipio (año 2024)
    cur.execute("""
        SELECT * FROM valores_municipales_anuales
        WHERE municipio_id = %s
        ORDER BY anio DESC LIMIT 1;
    """, (municipio_id,))
    ultimo_estado = cur.fetchone()
    
    conn.close()
    
    if not ultimo_estado:
        return {"error": "Municipio no encontrado o sin datos."}
        
    predicciones = {
        "variable_modificada": variable_modificada,
        "cambio_solicitado": f"{incremento_pct:+.2f}%",
        "impacto_estimado": {}
    }
    
    for c in corrs:
        # Identificar cuál es la variable afectada (la Y, o la X)
        var_afectada = c["variable_y"] if c["variable_x"] == variable_modificada else c["variable_x"]
        coef = float(c["coeficiente_correlacion"])
        
        # Efecto estimado simple de primer orden: Cambio = Cambio_X * Coeficiente
        # En una simulación más compleja, esto usaría un sistema dinámico multivariable
        cambio_esperado_pct = incremento_pct * coef
        valor_actual = float(ultimo_estado[var_afectada])
        valor_nuevo = valor_actual * (1 + (cambio_esperado_pct / 100.0))
        
        # Evitar valores imposibles (porcentajes fuera de 0-100)
        if "pct" in var_afectada:
            valor_nuevo = max(0.0, min(100.0, valor_nuevo))
            
        predicciones["impacto_estimado"][var_afectada] = {
            "valor_actual": valor_actual,
            "valor_proyectado": valor_nuevo,
            "cambio_porcentual": f"{cambio_esperado_pct:+.2f}%",
            "coeficiente_relacion": coef
        }
        
    return predicciones

if __name__ == "__main__":
    compute_all_correlations()
    # Prueba de predicción: ¿Qué pasa si incrementamos pavimentación un 10% en Hermosillo (26019)?
    print("\n--- Simulando Impacto de +10% en Calles Pavimentadas ---")
    resultados = predict_impact("26019", "calles_pavimentadas_pct", 10.0)
    print(json.dumps(resultados, indent=4, ensure_ascii=False))
