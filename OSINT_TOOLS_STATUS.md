# 🕵️ OSINT Tools Status - CivicaOS Dashboard

## 📊 Estado Actual del Framework OSINT

### ✅ Herramientas EN LÍNEA (2/7)

| Herramienta | Estado | Tipo | Descripción |
|-------------|--------|------|-------------|
| **Macro Events Ingestor** | 🟢 EN LÍNEA | Nativa | RSS Feeds + Scoring Semántico con LLM local |
| **OSINT Harvester Agent** | 🟢 EN LÍNEA | Nativa | Orquestador del pipeline OSINT |

### ⚠️ Herramientas en MODO SIMULACIÓN (3/7)

Estas herramientas están referenciadas pero requieren instalación:

| Herramienta | Estado | GitHub | Función |
|-------------|--------|--------|---------|
| **Sherlock** | 🟡 MODO SIMULACIÓN | [GitHub](https://github.com/sherlock-project/sherlock) | Búsqueda de usernames en redes sociales |
| **theHarvester** | 🟡 MODO SIMULACIÓN | [GitHub](https://github.com/laramies/theHarvester) | Extracción de emails, subdominios y nombres |
| **GHunt** | 🟡 MODO SIMULACIÓN | [GitHub](https://github.com/mxrch/GHunt) | Investigación de cuentas Google |

### ❌ Herramientas SIN CONEXIÓN (2/7)

| Herramienta | Estado | Función |
|-------------|--------|---------|
| **Maltego** | 🔴 SIN CONEXIÓN | Análisis de enlaces y visualización de grafos |
| **SpiderFoot** | 🔴 SIN CONEXIÓN | Automatización de recolección OSINT |

---

## 🛠️ Instalación de Herramientas

Para instalar las herramientas que están en modo simulación, ejecuta:

```bash
cd /workspace
./install_osint_tools.sh
```

Este script instalará automáticamente:
- ✅ Sherlock
- ✅ theHarvester  
- ✅ GHunt
- ✅ SpiderFoot

Después de la instalación, las herramientas cambiarán de estado en el dashboard.

---

## 📋 Verificación de Estado

Para verificar el estado actual de las herramientas instaladas:

```bash
/workspace/osint_tools/check_osint_tools.sh
```

---

## 🔗 Referencias

- **[OSINT Framework](https://osintframework.com)** - Directorio completo de herramientas OSINT
- **CivicaOS Vault** - Notas de inteligencia generadas en `civicaos-vault/entities/`

---

## 📈 Métricas Actuales

| Métrica | Valor |
|---------|-------|
| Eventos Macro Procesados | 24 |
| Entidades Perfiladas | 18 |
| Correos Expuestos | 142 |
| Huellas Digitales Mapeadas | 67 |

---

*Última actualización: Dashboard CivicaOS v2.0*
