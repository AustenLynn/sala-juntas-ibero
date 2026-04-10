# 📖 HOW TO USE — Guía de Uso
## Paquete de Documentación para Claude Code
### Plataforma de Gestión y Reservación de Sala de Juntas — Ibero CDMX

---

## 🎯 ¿QUÉ ES ESTE PAQUETE?

Este paquete contiene todo lo necesario para que **Claude Code** construya un prototipo interactivo funcional de la Plataforma de Reservación de Sala de Juntas de la Ibero, basado en las 33 historias de usuario del proyecto.

**Tiempo estimado de desarrollo:** 3-5 horas con Claude Code siguiendo este paquete.

---

## 📂 DOCUMENTOS QUE RECIBISTE

| Documento | Tamaño aprox. | Uso |
|-----------|---------------|-----|
| `INSTRUCCIONES_CLAUDE_CODE.md` | Principal | Guía completa de desarrollo (este es el documento maestro) |
| `TECHNICAL-NOTES.md` | Referencia | Código completo, patrones, ejemplos |
| `HOW-TO-USE.md` | Este archivo | Cómo usar los documentos y trabajar con Claude Code |
| `ESTRUCTURA_PROYECTO.txt` | Visual | Árbol de carpetas, paleta de colores, timeline |
| `README.md` | Ejecutivo | Síntesis del proyecto para presentar al equipo |

---

## 🔄 FLUJO DE TRABAJO RECOMENDADO (5 PASOS)

### PASO 1: Preparar el entorno (5 min)

```bash
# Crear carpeta del proyecto
mkdir sala-juntas-ibero
cd sala-juntas-ibero

# Iniciar git (recomendado para control de versiones)
git init

# Abrir con Claude Code
claude  # en la carpeta del proyecto
```

**Verificar:**
- [ ] Claude Code está instalado (`claude --version`)
- [ ] Estás en la carpeta correcta del proyecto
- [ ] Tienes los 5 documentos descargados

---

### PASO 2: Dar contexto inicial a Claude Code (2 min)

Copia y pega este mensaje **exacto** como primer mensaje en Claude Code:

```
Voy a desarrollar un prototipo interactivo HTML5 para la Plataforma de 
Gestión y Reservación de Sala de Juntas de la Universidad Iberoamericana.

Tengo un documento de instrucciones detallado. Por favor léelo completo 
antes de comenzar a codificar.

El documento contiene:
- 33 historias de usuario organizadas en 10 épicas
- Arquitectura de la aplicación (HTML5 + CSS3 + JS Vanilla)
- Diseño UI/UX con paleta de colores (#ef3e42 rojo Ibero)
- Estructura de carpetas completa
- 4 fases de desarrollo con 40+ tareas específicas

¿Estás listo para recibir el documento de instrucciones?
```

---

### PASO 3: Compartir el documento principal (1 min)

Cuando Claude Code confirme que está listo, pega el contenido completo de `INSTRUCCIONES_CLAUDE_CODE.md` en el chat, o usa:

```bash
# En Claude Code, puedes referenciar el archivo directamente:
# "Lee el archivo INSTRUCCIONES_CLAUDE_CODE.md y comencemos con la FASE 1"
```

Si Claude Code tiene acceso al sistema de archivos (modo agente):
```
Lee el archivo /ruta/al/INSTRUCCIONES_CLAUDE_CODE.md 
y el archivo /ruta/al/TECHNICAL-NOTES.md 
y luego comencemos con la TAREA 1.1 de la FASE 1.
```

---

### PASO 4: Desarrollar por fases (El proceso principal)

**REGLA DE ORO:** Completa una FASE completamente antes de pasar a la siguiente.

#### Comunicación efectiva con Claude Code:

**Para iniciar una tarea específica:**
```
Vamos a implementar la TAREA 2.3 — Módulo calendar.js.
Necesito las funciones: renderMonth(), navigateTo(), markHolidays(), 
renderReservations() siguiendo el patrón Module definido en las instrucciones.
El archivo va en js/modules/calendar.js
```

**Para pedir revisión:**
```
Revisa el archivo js/modules/auth.js que acabas de crear y verifica que:
1. Implementa correctamente el timeout de 30 minutos (HU-03)
2. Redirige según el rol del usuario (secretaria → dashboard, académico → calendar)
3. Usa el patrón Module (IIFE) definido en las instrucciones
```

**Para pedir corrección:**
```
El formulario de nueva reservación (TAREA 3.1) no está prellenando 
la hora cuando hago click en el calendario. Según HU-17, debe 
prellenar automáticamente. Por favor revisa la función 
openNewReservationModal() en js/modules/reservations-ui.js
```

**Para verificar accesibilidad:**
```
Revisa el modal de reservación en reservacion.html y asegúrate que:
- Tenga aria-label en el botón de cerrar
- Los inputs tengan labels asociadas correctamente
- Se pueda cerrar con Escape
- Tenga focus trap (Tab solo navega dentro del modal)
```

---

### PASO 5: Testing y verificación (30 min)

Cuando Claude Code termine una fase, ejecuta la verificación:

```
Necesito verificar que la FASE 2 está completa. Por favor:

1. Abre el archivo calendar.html en el navegador
2. Verifica que el calendario muestra el mes actual
3. Confirma que puedes navegar 6 meses hacia adelante
4. Comprueba que los días festivos (1 Mayo, 16 Sept) aparecen marcados
5. Verifica que click en día disponible abre el modal

Reporta qué funciona y qué necesita corrección.
```

---

## 💬 CÓMO COMUNICARSE CON CLAUDE CODE

### Templates de mensajes por situación:

#### 🚀 Iniciar nueva tarea
```
Tarea: [NÚMERO Y NOMBRE]
Archivo(s): [ruta del archivo]
Basado en: HU-[XX] — [nombre de la historia]
Requisito específico: [lo más importante a implementar]
```

#### 🔧 Corregir bug
```
Bug encontrado en: [archivo.js, función específica]
Comportamiento actual: [qué hace mal]
Comportamiento esperado: [qué debería hacer según HU-XX]
Pasos para reproducir: [1. Hacer X, 2. Click en Y, 3. Ver Z]
```

#### 🎨 Ajuste de diseño
```
El componente [nombre] no coincide con las especificaciones de diseño.
Problema: [descripción]
Especificación correcta (de la Sección 3 de instrucciones): 
- Color: #ef3e42 para [elemento]
- Tamaño: [px o rem]
- Espaciado: [valor]
```

#### 📋 Revisar código existente
```
Revisa el archivo [archivo.js] y verifica que:
- Implementa el patrón Module (IIFE)
- Cumple los criterios de aceptación de HU-[XX]
- No tiene console.log de debug
- Maneja correctamente los errores
```

#### ⚡ Optimización de performance
```
La función [nombre] en [archivo] tarda demasiado cuando hay 
más de 50 reservaciones. Por favor optimízala aplicando:
- Debounce de 200ms en la búsqueda
- Filtrado en memoria (no re-fetch)
- Referencia: TECHNICAL-NOTES.md Sección 4.4
```

---

## 🚨 QUÉ HACER SI ENCUENTRAS PROBLEMAS

### Problema: Claude Code no entiende el contexto del proyecto

**Solución:** Recuérdale el contexto con este mensaje:
```
Recordatorio de contexto:
- Proyecto: Plataforma Reservación Sala de Juntas, Ibero CDMX
- Stack: HTML5 + CSS3 + JS Vanilla (sin frameworks)
- Color primario: #ef3e42
- Patrón JS: Module (IIFE) como en store.js y auth.js
- Datos: localStorage en prototipo
- Actor principal: Secretaria (rol admin) y Académico (solo lectura)
Continuemos con [tarea específica].
```

---

### Problema: El código generado usa un framework (React, Vue, etc.)

**Solución:**
```
⚠️ Este proyecto es HTML5 puro, sin frameworks.
Por favor reescribe [componente] usando:
- HTML5 semántico estándar
- CSS3 puro (sin Tailwind, Bootstrap, etc.)
- JavaScript Vanilla ES6+ (sin React, Vue, Angular)
- El patrón Module (IIFE) para encapsulación
```

---

### Problema: El formulario tiene campos que no deben estar

**Solución:**
```
⚠️ El formulario de reservación NO debe tener estos campos:
- Teléfono
- Correo electrónico
- Clave de cómputo
- Selección de software
- Grupos escolares

Solo debe tener: Responsable, Área/Departamento, Hora inicio, 
Hora fin, y Observaciones (opcional). Referencia: HU-08, HU-17.
```

---

### Problema: El traslape no se detecta en tiempo real

**Solución:**
```
La detección de traslape debe ocurrir onChange en los selectores 
de hora, NO solo al hacer click en Guardar. 

Por favor agrega event listeners 'change' en:
- document.getElementById('res-start')  
- document.getElementById('res-end')

Que llamen a validateTimeRange() inmediatamente.
Referencia: Sección 3.3 de INSTRUCCIONES y TAREA 3.3.
```

---

### Problema: La sesión de Claude Code se perdió / contexto muy largo

**Solución:** Inicia una nueva sesión con este resumen:
```
Retomamos el proyecto Sala Juntas Ibero.
Estado actual: FASE [X] completada, iniciando FASE [Y].
Archivos creados hasta ahora: [lista los principales]
Stack: HTML5+CSS3+JS Vanilla, localStorage, color #ef3e42.
Continúa con la TAREA [número].
```

---

## 💡 TIPS PARA TRABAJO EFICIENTE

### ✅ Sí hacer:

1. **Una tarea a la vez** — No pidas múltiples tareas simultáneas. Claude Code trabaja mejor con una tarea clara.

2. **Pide archivos completos** — Es mejor pedir el archivo completo que ediciones parciales. Menos errores de integración.

3. **Verifica en el navegador** — Después de cada tarea, abre el HTML en el navegador y prueba manualmente.

4. **Guarda en git frecuentemente** — `git commit -m "feat: tarea X.X completada"` al terminar cada tarea.

5. **Usa los datos mock** — Los datos en `data/mock-data.js` están listos para demostrar todas las funcionalidades.

6. **Referencia las HU** — Siempre menciona la Historia de Usuario (HU-XX) en tus solicitudes para mantener contexto.

### ❌ No hacer:

1. **No mezclar fases** — Termina la FASE 1 completamente antes de empezar la FASE 2.

2. **No pedir backend todavía** — El prototipo usa localStorage. El backend se implementa después.

3. **No usar CDN para cosas core** — Chart.js, jsPDF: OK en CDN. Lógica de negocio: siempre local.

4. **No olvidar el rol del académico** — Cada pantalla debe verificar el rol y mostrar/ocultar opciones apropiadamente.

5. **No usar `\n` en textContent** — Para saltos de línea en JS, crear elementos Paragraph separados.

---

## 📊 CHECKLIST DE PROGRESO POR FASE

### FASE 1: Fundamentos y Autenticación
- [ ] Estructura de carpetas creada
- [ ] variables.css con todos los design tokens
- [ ] store.js con patrón Module
- [ ] mock-data.js con datos iniciales
- [ ] index.html con formulario de login
- [ ] auth.js con login/logout/checkSession
- [ ] Login redirige correctamente según rol
- [ ] Pantalla "Olvidé mi contraseña" funcional

### FASE 2: Calendario Maestro
- [ ] Layout con sidebar responsive
- [ ] Componente CalendarGrid renderizando
- [ ] Navegación mensual libre (sin restricciones)
- [ ] Vista semanal implementada
- [ ] Días festivos marcados visualmente
- [ ] Click en bloque → popup con detalles
- [ ] Config de días festivos en admin panel

### FASE 3: Reservaciones
- [ ] Formulario modal abre con datos prellenados
- [ ] Validación traslape en tiempo real (onChange)
- [ ] CRUD completo (crear, editar, cancelar)
- [ ] Eliminación masiva con selección múltiple
- [ ] Autocompletado de responsables
- [ ] Reservaciones recurrentes (semanal/quincenal/mensual)
- [ ] Vista calendario actualiza inmediatamente

### FASE 4: Funcionalidades Avanzadas
- [ ] Historial con filtros completos
- [ ] Búsqueda insensible a acentos
- [ ] Exportación PDF funcional
- [ ] Dashboard con gráficas (Chart.js)
- [ ] Panel IA con texto libre
- [ ] Gestión de usuarios (CRUD)
- [ ] Notificaciones (simuladas con console.log)

---

## ✅ CHECKLIST FINAL ANTES DE PRESENTAR

### Funcional
- [ ] Login con ambos roles funciona
- [ ] Calendario navega sin restricciones
- [ ] Crear reservación: 3 pasos, sin campos innecesarios
- [ ] Traslape detectado antes de guardar
- [ ] Cancelar reservación libera el slot
- [ ] Eliminar masiva funciona
- [ ] Historial muestra todas las reservaciones
- [ ] Búsqueda encuentra con y sin acentos
- [ ] Exportar PDF descarga archivo

### Diseño
- [ ] Color #ef3e42 en botones principales
- [ ] Logo Ibero visible
- [ ] Mobile (320px): sin scroll horizontal
- [ ] Tablet (768px): sidebar colapsado o visible
- [ ] Desktop (1200px): layout completo

### Accesibilidad
- [ ] Tab navega todos los elementos interactivos
- [ ] Escape cierra modales
- [ ] Alertas dinámicas anunciadas

### Demostración
- [ ] Demo completa de flujo Secretaria (crear → ver en calendario)
- [ ] Demo flujo Académico (solo lectura)
- [ ] Demo detección traslape en vivo
- [ ] Demo eliminación masiva
- [ ] Demo Panel IA (si está implementado)

---

## 📞 SOPORTE Y REFERENCIAS

| Recurso | Descripción |
|---------|-------------|
| `INSTRUCCIONES_CLAUDE_CODE.md` | Documento maestro — leer primero |
| `TECHNICAL-NOTES.md` | Código de referencia y patrones |
| `ESTRUCTURA_PROYECTO.txt` | Vista visual del árbol de archivos |
| Historias de usuario v2.1 | Documento original del proyecto (PDF) |
| Acta de Constitución | Contexto del proyecto (PDF) |

**Equipo de desarrollo:**
- Líder: Wendy Elizabeth Guzmán Orta
- Patrocinadora: Julieta Esquinca Gómez
- Ibero Universidad CDMX — Ingeniería de Software 2026

---

*HOW-TO-USE.md — v1.0 — Abril 2026*
