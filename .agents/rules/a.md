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
