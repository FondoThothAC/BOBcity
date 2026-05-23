import os
import sys

def inspect_xlsx_headers(filepath):
    print(f"\n--- Analizando: {os.path.basename(filepath)} ---")
    try:
        # Intentar importar pandas y openpyxl para análisis rápido
        import pandas as pd
        # Leer solo las primeras 5 filas para no saturar memoria
        df = pd.read_excel(filepath, nrows=5)
        print("Columnas encontradas:")
        print(list(df.columns))
        print("\nPrimeras filas de muestra:")
        print(df.to_string())
    except ImportError:
        print("Pandas u Openpyxl no están instalados en el entorno de Python.")
        print("Intentando análisis alternativo mediante parsing XML nativo de Office Open XML...")
        try:
            import zipfile
            import xml.etree.ElementTree as ET
            
            with zipfile.ZipFile(filepath, 'r') as zip_ref:
                # Leer el archivo de strings compartidos para entender el contenido
                shared_strings = []
                if 'xl/sharedStrings.xml' in zip_ref.namelist():
                    with zip_ref.open('xl/sharedStrings.xml') as f:
                        tree = ET.parse(f)
                        root = tree.getroot()
                        # Namespace de OpenXML
                        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                        for t in root.findall('.//ns:t', ns):
                            shared_strings.append(t.text)
                
                # Leer la primera hoja
                if 'xl/worksheets/sheet1.xml' in zip_ref.namelist():
                    with zip_ref.open('xl/worksheets/sheet1.xml') as f:
                        tree = ET.parse(f)
                        root = tree.getroot()
                        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                        
                        # Extraer las primeras filas
                        rows = root.findall('.//ns:row', ns)
                        print(f"Total de filas detectadas en XML (aprox): {len(rows)}")
                        
                        # Leer celdas de las primeras 5 filas
                        for r in rows[:6]:
                            row_vals = []
                            for c in r.findall('ns:c', ns):
                                t = c.get('t')
                                v = c.find('ns:v', ns)
                                val = ""
                                if v is not None:
                                    val_idx = v.text
                                    if t == 's' and shared_strings:
                                        val = shared_strings[int(val_idx)]
                                    else:
                                        val = val_idx
                                row_vals.append(val)
                            print(f"Fila {r.get('r')}: {row_vals}")
        except Exception as ex:
            print(f"Error en análisis alternativo: {ex}")
    except Exception as e:
        print(f"Error al leer Excel: {e}")

if __name__ == "__main__":
    datos_dir = "/Volumes/SSD1TB/plataforma/Datos"
    if not os.path.exists(datos_dir):
        print(f"El directorio {datos_dir} no existe.")
        sys.exit(1)
        
    files = [f for f in os.listdir(datos_dir) if f.endswith('.xlsx')]
    print(f"Encontrados {len(files)} archivos Excel para inspeccionar.")
    
    # Inspeccionar una muestra representativa de cada tipo
    sample_files = [
        "DatosAbiertos-derfe-pdln_edms_sexo_20260507.xlsx",
        "PADRON_PAN_2023-1.xlsx",
        "PADRON_MORENA_2023.xlsx"
    ]
    
    for filename in sample_files:
        filepath = os.path.join(datos_dir, filename)
        if os.path.exists(filepath):
            inspect_xlsx_headers(filepath)
        else:
            print(f"Archivo no encontrado: {filename}")
