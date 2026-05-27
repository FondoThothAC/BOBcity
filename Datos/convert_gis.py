import os
import sys

# Attempt to install geopandas if not present
try:
    import geopandas as gpd
except ImportError:
    import subprocess
    print("Installing geopandas and dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "geopandas", "shapely"])
    import geopandas as gpd

SHAPEFILE_DIR = "SHAPEFILE"
OUTPUT_DIR = "../public/data/geojson"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Archivos a procesar
shapefiles = [
    "DISTRITO_FEDERAL.shp",
    "DISTRITO_LOCAL.shp",
    "MUNICIPIO.shp",
    "SECCION.shp",
    "ENTIDAD.shp"
]

def procesar_shapefiles():
    for shp_name in shapefiles:
        shp_path = os.path.join(SHAPEFILE_DIR, shp_name)
        if not os.path.exists(shp_path):
            print(f"[{shp_name}] No encontrado en {SHAPEFILE_DIR}")
            continue
        
        print(f"[{shp_name}] Cargando...")
        try:
            gdf = gpd.read_file(shp_path)
            
            print(f"[{shp_name}] Encontrados {len(gdf)} registros nacionales. Simplificando...")
            
            # Reproyectar a EPSG:4326 (estándar para GeoJSON / web mapping) si no lo está
            if gdf.crs is None or gdf.crs.to_epsg() != 4326:
                try:
                    gdf = gdf.to_crs(epsg=4326)
                except Exception as e:
                    print(f"[{shp_name}] Warning proyectando: {e}")
            
            # Simplificamos geometría para web (reducir nodos)
            # Para mapas nacionales con decenas de miles de polígonos usamos mayor tolerancia
            tolerance = 0.002 if 'SECCION' in shp_name else 0.001
            gdf['geometry'] = gdf['geometry'].simplify(tolerance=tolerance, preserve_topology=True)
            
            out_name = shp_name.replace(".shp", ".geojson")
            out_path = os.path.join(OUTPUT_DIR, out_name)
            
            print(f"[{shp_name}] Guardando {out_path}...")
            gdf.to_file(out_path, driver="GeoJSON")
            print(f"[{shp_name}] OK.")
            
        except Exception as e:
            print(f"[{shp_name}] ERROR: {e}")

if __name__ == "__main__":
    procesar_shapefiles()
