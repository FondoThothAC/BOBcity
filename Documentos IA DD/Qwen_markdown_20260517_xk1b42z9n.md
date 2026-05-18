## ✅ Pre-Release Checklist - CivicPulse MVP

### UxDD (User Experience)
- [ ] Navegación por teclado completa (Tab, Enter, Esc)
- [ ] Contrastes WCAG AA verificados (terminal oscuro con texto legible)
- [ ] Anuncios para screen readers en eventos críticos (aria-live)
- [ ] Loading states con feedback visual y textual
- [ ] Mensajes de error accionables y en lenguaje claro

### BDD/TDD (Calidad)
- [ ] Todos los escenarios Gherkin pasan en CI
- [ ] Cobertura de tests > 85% en componentes críticos
- [ ] Tests de integración E2E validan flujo completo
- [ ] Mocks de Ollama/ABM para tests deterministas

### ADD/SDD (Seguridad)
- [ ] Datos sensibles nunca en logs de consola
- [ ] Hash SHA-256 para cada entrada de auditoría
- [ ] Certificados mTLS generados localmente (no CA pública)
- [ ] Limpieza segura de memoria al finalizar sesión

### EDD/CDD (Arquitectura)
- [ ] Eventos pub/sub desacoplados (NATS local)
- [ ] Componentes React con props typing estricto
- [ ] Error boundaries en cada módulo del swarm
- [ ] Hot-reload funcional para desarrollo ágil

### MDD/PDD (Mantenibilidad)
- [ ] Schemas JSON/YAML como única fuente de verdad
- [ ] Prompts de agentes versionados en /prompts/
- [ ] Documentación auto-generada desde tipos TypeScript
- [ ] Scripts de deploy idempotentes y documentados