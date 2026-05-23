import os
import sys
import json
import zipfile
import xml.etree.ElementTree as ET

# Definición de mapeo de Entidades Federativas en México (INE/INEGI)
ENTIDADES_MAP = {
    1: "AGUASCALIENTES", 2: "BAJA CALIFORNIA", 3: "BAJA CALIFORNIA SUR", 4: "CAMPECHE",
    5: "COAHUILA", 6: "COLIMA", 7: "CHIAPAS", 8: "CHIHUAHUA", 9: "CIUDAD DE MEXICO",
    10: "DURANGO", 11: "GUANAJUATO", 12: "GUERRERO", 13: "HIDALGO", 14: "JALISCO",
    15: "ESTADO DE MEXICO", 16: "MICHOACAN", 17: "MORELOS", 18: "NAYARIT", 19: "NUEVO LEON",
    20: "OAXACA", 21: "PUEBLA", 22: "QUERETARO", 23: "QUINTANA ROO", 24: "SAN LUIS POTOSI",
    25: "SINALOA", 26: "SONORA", 27: "TABASCO", 28: "TAMAULIPAS", 29: "TLAXCALA",
    30: "VERACRUZ", 31: "YUCATAN", 32: "ZACATECAS"
}

def parse_xlsx_fast_xml(filepath, col_keywords):
    """
    Parsea rápidamente un archivo Excel (.xlsx) gigante sin usar pandas, 
    leyendo directamente el XML comprimido para evitar saturación de memoria.
    """
    print(f"  -> Parseando XML de {os.path.basename(filepath)}...")
    data_rows = []
    try:
        with zipfile.ZipFile(filepath, 'r') as zip_ref:
            # 1. Leer shared strings
            shared_strings = []
            if 'xl/sharedStrings.xml' in zip_ref.namelist():
                with zip_ref.open('xl/sharedStrings.xml') as f:
                    tree = ET.parse(f)
                    root = tree.getroot()
                    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                    for t in root.findall('.//ns:t', ns):
                        shared_strings.append(t.text if t.text else "")
            
            # 2. Leer primera hoja
            if 'xl/worksheets/sheet1.xml' in zip_ref.namelist():
                with zip_ref.open('xl/worksheets/sheet1.xml') as f:
                    tree = ET.parse(f)
                    root = tree.getroot()
                    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                    
                    rows = root.findall('.//ns:row', ns)
                    if not rows:
                        return []
                    
                    # Leer cabecera (fila 1)
                    header_cells = rows[0].findall('ns:c', ns)
                    headers = []
                    for c in header_cells:
                        t = c.get('t')
                        v = c.find('ns:v', ns)
                        val = ""
                        if v is not None:
                            val_idx = v.text
                            if t == 's' and shared_strings:
                                val = shared_strings[int(val_idx)]
                            else:
                                val = val_idx
                        headers.append(val.upper().strip())
                    
                    print(f"  Cabeceras encontradas: {headers}")
                    
                    # Encontrar índices de interés (Entidad, Municipio, Sexo, Padrón, etc.)
                    col_indices = {}
                    for kw, key in col_keywords.items():
                        for idx, h in enumerate(headers):
                            if kw in h or h in kw:
                                col_indices[key] = idx
                                break
                    
                    print(f"  Índices mapeados: {col_indices}")
                    
                    # Procesar filas de datos
                    count = 0
                    for r in rows[1:]:
                        cells = r.findall('ns:c', ns)
                        row_data = {}
                        
                        # Extraer solo las celdas mapeadas
                        for key, col_idx in col_indices.items():
                            if col_idx < len(cells):
                                c = cells[col_idx]
                                t = c.get('t')
                                v = c.find('ns:v', ns)
                                val = ""
                                if v is not None:
                                    val_idx = v.text
                                    if t == 's' and shared_strings:
                                        val = shared_strings[int(val_idx)]
                                    else:
                                        val = val_idx
                                row_data[key] = val
                        
                        if row_data:
                            data_rows.append(row_data)
                            count += 1
                            if count % 100000 == 0:
                                print(f"    Procesadas {count} filas...")
                                
    except Exception as e:
        print(f"  [ERROR] Al parsear rápido XML: {e}")
    return data_rows

def main():
    datos_dir = "/Volumes/SSD1TB/plataforma/Datos"
    output_file = "/Volumes/SSD1TB/plataforma/src/data/real_electoral_metrics.json"
    
    if not os.path.exists(datos_dir):
        print(f"El directorio de Datos {datos_dir} no existe. Por favor verifique.")
        sys.exit(1)
        
    print("=================================================================")
    print(" CívicaOS: Data Ingestion Pipeline - Procesamiento de Datos Reales")
    print("=================================================================")
    
    # Estructura del consolidado nacional
    # consolidado[ENTIDAD][MUNICIPIO] = { padron, lista_nominal, morena, pan, pri, mc, prd, pt, pvem }
    consolidado = {}

    # 1. Procesar Padrón y Lista Nominal Abierta del INE (pdln_edms_sexo)
    ine_file = "DatosAbiertos-derfe-pdln_edms_sexo_20260507.xlsx"
    ine_path = os.path.join(datos_dir, ine_file)
    
    if os.path.exists(ine_path):
        keywords = {
            "ENTIDAD": "entidad",
            "MUNICIPIO": "municipio",
            "PADRON": "padron",
            "NOMINAL": "lista_nominal"
        }
        rows = parse_xlsx_fast_xml(ine_path, keywords)
        print(f"  -> Total de registros INE extraídos: {len(rows)}")
        
        for r in rows:
            try:
                ent_id = int(r.get("entidad", 0))
                mun_id = int(r.get("municipio", 0))
                pad = int(float(r.get("padron", 0)))
                nom = int(float(r.get("lista_nominal", 0)))
                
                ent_name = ENTIDADES_MAP.get(ent_id, f"ESTADO_{ent_id}")
                
                if ent_name not in consolidado:
                    consolidado[ent_name] = {}
                if mun_id not in consolidado[ent_name]:
                    consolidado[ent_name][mun_id] = {
                        "municipio_id": mun_id,
                        "padron": 0,
                        "lista_nominal": 0,
                        "MORENA": 0,
                        "PAN": 0,
                        "PRI": 0,
                        "MC": 0,
                        "PRD": 0,
                        "PT": 0,
                        "PVEM": 0
                    }
                
                consolidado[ent_name][mun_id]["padron"] += pad
                consolidado[ent_name][mun_id]["lista_nominal"] += nom
            except Exception:
                continue
    else:
        print(f"  [ALERTA] Archivo del INE no encontrado: {ine_file}. Se usará estimación base.")

    # 2. Procesar los padrones de militantes de cada partido
    partidos = {
        "MORENA": "PADRON_MORENA_2023.xlsx",
        "PAN": "PADRON_PAN_2023-1.xlsx",
        "PRI": "PADRON_PRI_2023.xlsx",
        "MC": "PADRON_MC_2023.xlsx",
        "PRD": "PADRON_PRD_2023.xlsx",
        "PT": "PADRON_PT_2023.xlsx",
        "PVEM": "PADRON_PVEM_2023.xlsx"
    }

    party_keywords = {
        "ENTIDAD": "entidad",
        "MUNICIPIO": "municipio"
    }

    for party, filename in partidos.items():
        party_path = os.path.join(datos_dir, filename)
        if os.path.exists(party_path):
            print(f"\n  -> Procesando afiliados de: {party}...")
            rows = parse_xlsx_fast_xml(party_path, party_keywords)
            print(f"  -> Total de registros afiliados {party}: {len(rows)}")
            
            for r in rows:
                try:
                    # Las bases de partidos a veces traen el nombre del estado o el ID
                    ent_raw = r.get("entidad", "").strip().upper()
                    mun_raw = r.get("municipio", "").strip().upper()
                    
                    if not ent_raw:
                        continue
                    
                    # Intentar resolver Entidad
                    ent_name = None
                    if ent_raw.isdigit():
                        ent_name = ENTIDADES_MAP.get(int(ent_raw))
                    else:
                        for k, name in ENTIDADES_MAP.items():
                            if name in ent_raw or ent_raw in name:
                                ent_name = name
                                break
                    
                    if not ent_name:
                        ent_name = ent_raw
                        
                    if ent_name not in consolidado:
                        consolidado[ent_name] = {}
                        
                    # Agrupar afiliados por municipio
                    if mun_raw not in consolidado[ent_name]:
                        consolidado[ent_name][mun_raw] = {
                            "municipio_nombre": mun_raw,
                            "padron": 0,
                            "lista_nominal": 0,
                            "MORENA": 0,
                            "PAN": 0,
                            "PRI": 0,
                            "MC": 0,
                            "PRD": 0,
                            "PT": 0,
                            "PVEM": 0
                        }
                    
                    # Incrementar conteo de militantes
                    if party in consolidado[ent_name][mun_raw]:
                        consolidado[ent_name][mun_raw][party] += 1
                except Exception:
                    continue
        else:
            print(f"  [INFO] Archivo de militantes {party} no encontrado en Datos/.")

    # Guardar consolidado
    try:
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as out:
            json.dump(consolidado, out, indent=2, ensure_ascii=False)
        print("\n=================================================================")
        print(f" ✅ [PROCESO EXITOSO] Consolidado exportado a:")
        print(f" {output_file}")
        print("=================================================================")
    except Exception as err:
        print(f" [ERROR] Al escribir JSON de salida: {err}")

if __name__ == "__main__":
    main()
