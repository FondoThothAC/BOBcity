---
trigger: always_on
---

Reglas de Desarrollo y Sincronización en Español

1. Código y Comentarios en Español:

- Todos los comentarios de código, docstrings y explicaciones técnicas dentro de los archivos fuente (JS, JSX, PY, SH, etc.) deben escribirse única y exclusivamente en español.
- Todos los textos que se presenten al usuario en el Frontend (etiquetas, botones, alertas, descripciones, tooltips e indicadores de estado) deben estar en español neutro premium.

1. Sincronización Obligatoria con GitHub:

- Al terminar cualquier cambio, modificación o corrección en el código, el agente debe ejecutar el script `./git_sync.sh` desde el directorio raíz.
- Como argumento del script, debe pasarse un mensaje de commit claro y resumido escrito en español, detallando qué se ajustó (ejemplo: `./git_sync.sh "Calibración del motor de evolución temporal"`). Esto mantendrá el repositorio en la nube en sincronía perfecta para Claude, Qwen, Perplexity y Gemini.

3. Flujo de Trabajo (Workflows) y Control de Calidad:

Cualquier agente de IA que trabaje en este repositorio (como Qwen Coder, Gemini Pro, Perplexity o Claude) DEBE ejecutar de forma obligatoria y secuencial el siguiente flujo de trabajo ante cada cambio:
1. **Compilación de Validación:** Ejecutar el comando `npm run build` en el directorio raíz para validar que no existan errores de compilación o sintaxis en el código React.
2. **Sincronización Proactiva:** Si la compilación es exitosa, ejecutar proactivamente `./git_sync.sh` pasando como argumento un mensaje descriptivo de los ajustes realizados en español.
3. **Informe al Usuario:** Informar detalladamente al usuario sobre el resultado de la compilación y la sincronización exitosa a GitHub.

4. Sincronización de Especificaciones (Metodologías *DD):

- Cada vez que un cambio de código involucre nuevos parámetros del motor, variables físicas (como radiación solar o presión hídrica), o acoplamientos y retroalimentaciones matemáticas (como el caos social no lineal), el agente **debe proactivamente identificar y actualizar** los archivos de especificación correspondientes en la carpeta `Documentos IA DD/` (o su equivalente local).
- Esto incluye actualizar y mantener sincronizados los documentos de las metodologías que lo ameriten:
  - **TDD** (Test-Driven Development)
  - **BDD** (Behavior-Driven Development)
  - **ATDD** (Acceptance Test-Driven Development)
  - **SDD** (System Design Document)
  - **DDD** (Domain-Driven Design)
  - **MDD** (Model-Driven Development)
  - **IDD** (Interface Design Document)
  - **ADD** (Architectural Design Document)
  - **EDD** (Entity/Environment Design Document)
  - **CDD** (Component Design Document)
  - **PDD** (Physical/Parameter Design Document)
  - **UXDD** (User Experience Design Document)
- Ninguna funcionalidad física o lógica compleja debe ser implementada sin su correspondiente especificación viva.
