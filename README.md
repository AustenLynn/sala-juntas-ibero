# 🏛️ README — Paquete de Documentación para Claude Code
## Plataforma de Gestión y Reservación de Sala de Juntas
### Universidad Iberoamericana CDMX — Ingeniería de Software 2026

---

## 📋 RESUMEN DEL PROYECTO

La **Plataforma de Gestión y Reservación de Sala de Juntas** reemplaza el sistema manual y limitado que actualmente usa el departamento de la Ibero. El sistema nuevo elimina las restricciones semestrales, simplifica el formulario de reservación, detecta traslapes en tiempo real, e incluye un asistente de IA para reservar mediante lenguaje natural.

**Patrocinadora:** Julieta Esquinca Gómez | **Líder:** Wendy Elizabeth Guzmán Orta

---

## 📦 LO QUE TIENES EN ESTE PAQUETE

| Documento | Tamaño aprox. | Para qué usarlo |
|-----------|---------------|-----------------|
| `INSTRUCCIONES_CLAUDE_CODE.md` | ~150 KB | **Documento maestro.** Contiene análisis de historias, arquitectura, especificaciones UI/UX, estructura de carpetas, requisitos técnicos e instrucciones paso a paso divididas en 4 fases con 40+ tareas. Proporcionar a Claude Code al inicio. |
| `TECHNICAL-NOTES.md` | ~80 KB | Referencia técnica con código completo funcionando: estructuras de datos JSON, APIs de cada módulo, funciones críticas implementadas, patrones de diseño, ejemplos de código para traslape, exportación PDF, integración IA, y checklist de testing. |
| `HOW-TO-USE.md` | ~35 KB | Guía de uso del paquete: flujo de trabajo en 5 pasos, cómo comunicarse con Claude Code, templates de mensajes por situación, solución a problemas comunes, y checklists de progreso por fase. |
| `ESTRUCTURA_PROYECTO.txt` | ~15 KB | Mapa visual ASCII del árbol de carpetas, paleta de colores con códigos hex, resumen de todas las HU, características clave con ✅, timeline de desarrollo, datos mock para demostración. |
| `README.md` | ~10 KB | Este archivo. Síntesis ejecutiva para presentar al equipo y entender de un vistazo qué contiene el paquete. |

---

## ⚡ RESUMEN EJECUTIVO

### ¿Qué construye este paquete?

Un **prototipo interactivo funcional** en HTML5 puro (sin frameworks) que implementa las 33 historias de usuario del proyecto, listo para demostrar a la patrocinadora y entregar como prototipo del semestre.

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5 semántico + CSS3 + JavaScript ES6 Vanilla |
| Storage (prototipo) | localStorage del navegador |
| PDF | jsPDF via CDN |
| Excel | SheetJS via CDN |
| Gráficas | Chart.js via CDN |
| IA | API Claude Sonnet / OpenAI GPT (configurable) |
| Iconos | Feather Icons via CDN |

### Tiempo estimado de desarrollo

| Fase | Descripción | Tiempo estimado |
|------|------------|-----------------|
| FASE 1 | Fundamentos, autenticación, store | 1.5 horas |
| FASE 2 | Calendario maestro | 1.5 horas |
| FASE 3 | CRUD Reservaciones | 2 horas |
| FASE 4 | IA, estadísticas, exportación | 2 horas |
| **TOTAL** | **Prototipo completo** | **~7 horas** |

---

## 🚀 CÓMO USAR ESTOS DOCUMENTOS (5 PASOS)

1. **Lee este README** para entender el paquete completo *(ya lo estás haciendo)*

2. **Abre Claude Code** en la carpeta de tu proyecto
   ```bash
   mkdir sala-juntas-ibero && cd sala-juntas-ibero && claude
   ```

3. **Comparte el documento maestro** (`INSTRUCCIONES_CLAUDE_CODE.md`) como primer mensaje en Claude Code

4. **Sigue las fases en orden** — Fase 1 → 2 → 3 → 4, sin saltarse pasos

5. **Usa `TECHNICAL-NOTES.md`** cuando necesites código de referencia o examples de funciones específicas

> 💡 Lee `HOW-TO-USE.md` para templates de mensajes y solución de problemas

---

## 📊 COMPARACIÓN ANTES / DESPUÉS

| Aspecto | Sistema Actual (Problema) | Sistema Nuevo (Solución) |
|---------|--------------------------|--------------------------|
| Restricción temporal | Solo semestre académico activo | Reservas hasta 12 meses adelante |
| Detección de conflictos | Solo al final del proceso | En tiempo real, antes de completar |
| Catálogo de personas | Solo profesores del semestre | Cualquier nombre, texto libre |
| Campos del formulario | Incluye teléfono, software, claves | Solo lo esencial: responsable, área, hora |
| Visibilidad | No muestra quién reservó | Nombre del responsable en el calendario |
| Eliminación | Una por una | Masiva: múltiples en una sola acción |
| Días festivos | No integrados | Calendario maestro con festivos y cierres |
| Independencia | Depende del sistema académico | Completamente autónomo |
| IA | No existe | Reservar con lenguaje natural |
| Respaldos | No automatizados | Automáticos en la nube |

---

## 🔑 PUNTOS CLAVE PARA RECORDAR

**Para el desarrollador:**
- Usar **HTML5 + CSS3 + JS Vanilla** — sin React, Vue, Angular ni ningún framework
- Color primario: **`#ef3e42`** (rojo Ibero) en todos los botones y elementos de énfasis
- El formulario de reservación **NUNCA** debe pedir: teléfono, correo, clave de cómputo, software
- La detección de traslape ocurre **onChange** (tiempo real), no al hacer submit
- Dos roles distintos: **Secretaria** (CRUD completo) y **Académico** (solo lectura)
- Todo el estado del prototipo vive en **localStorage** con prefijo `srj_`

**Para el proyecto:**
- Las historias de usuario están en el documento **v2.1** (33 HU, 104 SP, 10 épicas)
- La Épica 10 (IA) es el diferenciador del proyecto — lenguaje natural para reservar
- El dashboard de estadísticas (HU-29, 30) es la evidencia formal de KPIs para la patrocinadora
- El módulo de IA es **opcional**: si la API no está disponible, cae al formulario manual

---

## 🎁 QUÉ OBTIENES AL FINAL

Al completar las 4 fases con Claude Code, tendrás:

✅ **Un prototipo funcional** listo para demostrar a Julieta Esquinca (patrocinadora)
✅ **21 pantallas implementadas** cubriendo todos los flujos de usuario
✅ **33 historias de usuario** implementadas
✅ **Código limpio y comentado** siguiendo patrones profesionales (Module, Observer, Event Delegation)
✅ **Responsive** en móvil, tablet y desktop
✅ **Accesible** (WCAG 2.1 nivel AA)
✅ **Listo para deploy** en Vercel, GitHub Pages o servidor propio
✅ **Base sólida** para la implementación del backend (Node.js + PostgreSQL)

---

## 📞 REFERENCIAS DEL PROYECTO

| Documento | Descripción |
|-----------|-------------|
| Historias de Usuario v2.1 | 33 HU en 10 épicas, 104 SP totales |
| Acta de Constitución | Objetivos, alcance, interesados, cronograma |
| Solicitud Formal de Proyecto | Contexto y justificación del sistema |
| Estudio de Viabilidad | KPIs y métricas de éxito |
| Diagrama de Procesos | Flujos funcionales y de desarrollo |
| Matriz RACI | Responsabilidades del equipo |

---

*README.md — v1.0 — Paquete de Documentación Claude Code*
*Plataforma Reservación Sala de Juntas — Ibero CDMX — Abril 2026*
*Equipo de desarrollo: Guzmán, Álvarez, Juárez, Castillo, López, Román, Pérez, Sánchez*
