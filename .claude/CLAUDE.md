# 📋 INSTRUCCIONES CLAUDE CODE
## Plataforma de Gestión y Reservación de Sala de Juntas
### Universidad Iberoamericana — Proyecto Ingeniería de Software 2026

> **Versión:** 1.0 | **Fecha:** Abril 2026 | **Líder:** Wendy Elizabeth Guzmán Orta
> **Patrocinadora:** Julieta Esquinca Gómez | **Tecnología:** HTML5 + CSS3 + JavaScript Vanilla

---

## ════════════════════════════════════════════════════════
## SECCIÓN 1: ANÁLISIS DE HISTORIAS DE USUARIO Y FLUJOS
## ════════════════════════════════════════════════════════

### 📊 1.1 Tabla Completa de Historias de Usuario

| ID | Historia de Usuario | Épica | Actor | Prioridad | SP | Flujo Principal |
|----|---------------------|-------|-------|-----------|-----|-----------------|
| HU-01 | Inicio de sesión como Secretaria | É-01 | Secretaria | Alta | 3 | Login → Dashboard Admin |
| HU-02 | Inicio de sesión como Académico | É-01 | Académico | Alta | 2 | Login → Vista Calendario (solo lectura) |
| HU-03 | Cierre de sesión seguro | É-01 | Ambos | Media | 1 | Cualquier pantalla → Logout → Login |
| HU-21 | Gestión de cuentas de usuario | É-01 | Secretaria | Alta | 5 | Config → Panel Usuarios → CRUD |
| HU-22 | Recuperación de contraseña | É-01 | Ambos | Media | 3 | Login → Olvidé contraseña → Email → Reset |
| HU-04 | Visualizar calendario de disponibilidad | É-02 | Ambos | Alta | 5 | Dashboard → Calendario Mensual/Semanal |
| HU-05 | Configurar días festivos y cierres | É-02 | Secretaria | Alta | 3 | Config → Calendario Maestro → Marcar fechas |
| HU-06 | Ver responsable en calendario | É-02 | Ambos | Alta | 2 | Calendario → Click bloque → Popup detalle |
| HU-07 | Navegación anual sin restricciones | É-02 | Secretaria | Alta | 3 | Calendario → Navegar meses/años libremente |
| HU-08 | Crear nueva reservación | É-03A | Secretaria | Alta | 8 | Calendario → Click slot → Formulario → Guardar |
| HU-09 | Detección traslape en tiempo real | É-03A | Secretaria | Alta | 5 | Formulario → Validación horario → Alerta/OK |
| HU-10 | Editar reservación existente | É-03A | Secretaria | Alta | 3 | Calendario → Click reserva → Editar → Guardar |
| HU-11 | Cancelar reservación individual | É-03A | Secretaria | Alta | 2 | Calendario → Click reserva → Cancelar → Confirmar |
| HU-12 | Eliminación masiva de reservaciones | É-03A | Secretaria | Alta | 5 | Lista → Selección múltiple → Eliminar todo |
| HU-13 | Consultar disponibilidad (Académico) | É-03B | Académico | Media | 2 | Login → Calendario solo lectura → Filtros |
| HU-14 | Ver detalle reservación específica | É-03B | Ambos | Media | 2 | Calendario → Click → Modal detalle |
| HU-27 | Crear reservación recurrente | É-03B | Secretaria | Media | 8 | Form reserva → Toggle recurrencia → Config patrón |
| HU-15 | Registrar responsable de cualquier área | É-04 | Secretaria | Alta | 3 | Form → Campo texto libre → Autocompletado historial |
| HU-16 | Agregar campo observaciones | É-04 | Secretaria | Media | 1 | Form → Campo observaciones opcional |
| HU-17 | Flujo optimizado sin reingreso datos | É-04 | Secretaria | Alta | 3 | Click slot → Form prellenado → 3 pasos máximo |
| HU-18 | Respaldo automático en la nube | É-05 | Sistema | Alta | 5 | Cron → Backup → Log estado |
| HU-19 | Recuperación ante fallos | É-05 | Sistema/Sec | Media | 3 | Config → Restaurar respaldo → Confirmar |
| HU-20 | Consultar historial reservaciones | É-06 | Secretaria | Media | 3 | Menú → Historial → Filtros → Lista |
| HU-23 | Confirmación por correo | É-07 | Sistema | Media | 3 | Guardar reserva → Auto email → Log |
| HU-24 | Recordatorio automático | É-07 | Sistema | Baja | 3 | Cron → 24h antes → Email responsable |
| HU-25 | Notificación cancelación | É-07 | Sistema | Media | 2 | Cancelar reserva → Auto email afectado |
| HU-26 | Buscar y filtrar reservaciones | É-08 | Ambos | Media | 4 | Menú → Buscar → Filtros → Lista resultados |
| HU-28 | Exportar a PDF o Excel | É-08 | Secretaria | Baja | 4 | Historial → Exportar → Seleccionar formato → Descargar |
| HU-29 | Dashboard de uso | É-09 | Secretaria | Baja | 5 | Menú → Dashboard → Gráficas métricas |
| HU-30 | Reporte ocupación por período | É-09 | Secretaria | Baja | 3 | Dashboard → Generar reporte → Exportar PDF |
| HU-31 | Reservar mediante lenguaje natural | É-10 | Secretaria | Alta | 8 | Panel IA → Texto libre → Propuesta → Confirmar |
| HU-32 | Revisar agenda propuesta por IA | É-10 | Secretaria | Alta | 5 | IA procesa → Tarjeta propuesta editable → Guardar |
| HU-33 | Sugerencias inteligentes horario | É-10 | Secretaria | Media | 5 | Form → Panel sugerencias laterales → Click sugerencia |

---

### 🗺️ 1.2 Mapa Visual de Flujos de Usuario

#### FLUJO 1: Secretaria — Creación de Reservación (Flujo Principal)

```
┌─────────────────────────────────────────────────────────────────────┐
│  INICIO: Secretaria accede al sistema                                │
└─────────────────────────┬───────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────┐
│  PANTALLA LOGIN                  │
│  [usuario] [contraseña] [Entrar] │
│  [¿Olvidaste tu contraseña?]     │
└──────────────┬───────────────────┘
               │ Credenciales válidas (Secretaria)
               ▼
┌──────────────────────────────────┐
│  DASHBOARD PRINCIPAL             │
│  ┌────────────────────────────┐  │
│  │  CALENDARIO MAESTRO (mes)  │  │
│  │  [←] Abril 2026 [→]       │  │
│  │  Lu Ma Mi Ju Vi Sa Do     │  │
│  │  [ ][ ][R][ ][F][ ][ ]   │  │  R=Reservada F=Festivo
│  └────────────────────────────┘  │
│  [Nueva Reservación] [Buscar]    │
└──────────────┬───────────────────┘
               │ Click en slot disponible
               ▼
┌──────────────────────────────────┐
│  MODAL: NUEVA RESERVACIÓN        │
│  Fecha: [prellenada]             │
│  Hora inicio: [prellenada]       │
│  Hora fin: [time picker]         │
│  ─── Validación tiempo real ───  │
│  ✅ Horario disponible           │
│  Responsable: [autocompletado]   │
│  Área/Depto: [texto libre]       │
│  Observaciones: [opcional]       │
│  ┌─────────────────────────────┐ │
│  │ ☐ Recurrencia               │ │
│  └─────────────────────────────┘ │
│  [Cancelar]    [Guardar ✓]       │
└──────────────┬───────────────────┘
               │ Guardar
               ▼
┌──────────────────────────────────┐
│  ✅ CONFIRMACIÓN                 │
│  "Reservación creada exitosa"    │
│  → Calendario actualizado        │
│  → Email enviado (si aplica)     │
└──────────────────────────────────┘
```

#### FLUJO 2: Académico — Consulta de Disponibilidad

```
LOGIN (académico)
      │
      ▼
VISTA CALENDARIO (solo lectura)
  - Sin botones de crear/editar
  - Bloques ocupados: nombre responsable visible
  - Badge "Modo Consulta"
      │
      ▼ Click en bloque ocupado
POPUP DETALLE (read-only)
  - Responsable, área, horario, observaciones
  - Sin acciones de edición
      │
      ▼
BUSCAR DISPONIBILIDAD
  - Filtrar por semana/mes
  - Ver días libres resaltados
```

#### FLUJO 3: Secretaria — Eliminación Masiva

```
MENÚ → "Gestionar Reservaciones"
      │
      ▼
VISTA LISTA/TABLA
  [☐] Fecha | Responsable | Área | Estado
  [☑] 15/04 | Dr. Ramírez | Acad | Activa
  [☑] 22/04 | Lic. Torres | Adm  | Activa
  [☐] 29/04 | Dr. López   | Inv  | Activa
      │
      │ [Seleccionar todo] [Filtrar]
      │ Seleccionadas: 2
      ▼
[🗑 Eliminar seleccionadas (2)]
      │
      ▼
MODAL CONFIRMACIÓN
  "¿Eliminar 2 reservaciones?"
  [Cancelar] [Confirmar eliminación]
      │
      ▼
✅ Eliminadas + Log + Emails cancelación
```

#### FLUJO 4: Secretaria — Asistente IA

```
PANEL IA (É-10)
  ┌────────────────────────────────────────┐
  │  🤖 Describe tu reservación:           │
  │  "reunión de academia el próximo       │
  │   jueves a las 10, 2 horas,            │
  │   con el Dr. Ramírez"                  │
  │                           [Procesar]   │
  └────────────────────────────────────────┘
      │ < 3 segundos
      ▼
  TARJETA PROPUESTA (editable)
  ┌────────────────────────────────────────┐
  │  📅 Fecha: Jueves 16 Abr 2026  [✏]   │
  │  ⏰ Inicio: 10:00           [✏]       │
  │  ⏰ Fin:    12:00           [✏]       │
  │  👤 Responsable: Dr. Ramírez [✏]      │
  │  🏢 Área: Academia         [✏]       │
  │  ✅ Horario DISPONIBLE                 │
  │                                        │
  │  [Cancelar]    [Confirmar y guardar]   │
  └────────────────────────────────────────┘
```

#### FLUJO 5: Secretaria — Configuración Calendario Maestro

```
MENÚ → Configuración → Calendario Maestro
      │
      ▼
CALENDARIO CONFIG
  - Click/rango de fechas
  - Etiquetar: [Día Festivo] [Cierre Institucional]
      │
      ▼
Días marcados → diferenciados visualmente
  → No seleccionables para nuevas reservas
  → Alerta si hay reservas existentes en esa fecha
```

---

### 🖥️ 1.3 Catálogo Completo de Pantallas

| # | ID Pantalla | Nombre | Roles | Historias |
|---|-------------|--------|-------|-----------|
| 01 | SCR-LOGIN | Pantalla de Login | Todos | HU-01, HU-02 |
| 02 | SCR-FORGOT | Recuperar Contraseña | Todos | HU-22 |
| 03 | SCR-RESET | Resetear Contraseña | Todos | HU-22 |
| 04 | SCR-DASHBOARD | Dashboard Principal (Secretaria) | Secretaria | HU-04, HU-07, HU-08 |
| 05 | SCR-CAL-READONLY | Calendario Solo Lectura | Académico | HU-02, HU-13 |
| 06 | SCR-CAL-MONTH | Vista Mensual Calendario | Ambos | HU-04, HU-06, HU-07 |
| 07 | SCR-CAL-WEEK | Vista Semanal Calendario | Ambos | HU-04, HU-06 |
| 08 | SCR-RESERVA-FORM | Formulario Nueva Reservación | Secretaria | HU-08, HU-09, HU-15, HU-16, HU-17 |
| 09 | SCR-RESERVA-EDIT | Formulario Editar Reservación | Secretaria | HU-10, HU-09 |
| 10 | SCR-RESERVA-DETAIL | Modal Detalle Reservación | Ambos | HU-14, HU-06 |
| 11 | SCR-RESERVA-LIST | Lista/Tabla Reservaciones | Secretaria | HU-12, HU-20 |
| 12 | SCR-RECURRING | Config Recurrencia | Secretaria | HU-27 |
| 13 | SCR-SEARCH | Búsqueda y Filtros | Ambos | HU-26 |
| 14 | SCR-HISTORY | Historial Reservaciones | Secretaria | HU-20 |
| 15 | SCR-EXPORT | Exportar Reservaciones | Secretaria | HU-28 |
| 16 | SCR-DASHBOARD-STATS | Dashboard Estadísticas | Secretaria | HU-29, HU-30 |
| 17 | SCR-USERS | Panel Gestión Usuarios | Secretaria Admin | HU-21 |
| 18 | SCR-CAL-CONFIG | Config Calendario Maestro | Secretaria | HU-05 |
| 19 | SCR-BACKUP | Panel Respaldos | Secretaria Admin | HU-18, HU-19 |
| 20 | SCR-AI-PANEL | Panel IA Lenguaje Natural | Secretaria | HU-31, HU-32, HU-33 |
| 21 | SCR-NOTIF-CONFIG | Config Notificaciones | Secretaria | HU-23, HU-24, HU-25 |

---

### 🔄 1.4 Estados y Transiciones de una Reservación

```
                    ┌───────────────┐
                    │  PROPUESTA IA │ ← HU-31
                    └───────┬───────┘
                            │ Confirmar (HU-32)
                            ▼
┌──────────┐  Crear  ┌─────────────┐
│  (vacío) │ ───────►│   ACTIVA    │
└──────────┘ HU-08   └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
          Editar        Cancelar      Fecha pasa
          HU-10          HU-11
              │             │             │
              ▼             ▼             ▼
         ┌────────┐  ┌───────────┐  ┌──────────┐
         │ACTIVA  │  │ CANCELADA │  │  PASADA  │
         │(nueva) │  └───────────┘  └──────────┘
         └────────┘        │               │
                     En historial    En historial
                     (no se borra)   (no se borra)
```

---

## ════════════════════════════════════════════════════════
## SECCIÓN 2: ARQUITECTURA DE LA APLICACIÓN
## ════════════════════════════════════════════════════════

### 🏗️ 2.1 Diagrama Técnico (ASCII Art)

```
╔══════════════════════════════════════════════════════════════════╗
║                    ARQUITECTURA DEL SISTEMA                      ║
║              Plataforma Reservación Sala de Juntas               ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ┌─────────────────────────────────────────────────────────┐    ║
║  │                    CAPA PRESENTACIÓN                     │    ║
║  │  HTML5 + CSS3 + JavaScript Vanilla (Mobile-First)       │    ║
║  │                                                          │    ║
║  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │    ║
║  │  │ index.   │  │calendar. │  │reserva.  │  │admin.  │  │    ║
║  │  │ html     │  │ html     │  │ html     │  │ html   │  │    ║
║  │  │(Login)   │  │(Calend.) │  │(Form)    │  │(Panel) │  │    ║
║  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │    ║
║  └──────────────────────────┬────────────────────────────┘    ║
║                              │                                  ║
║  ┌───────────────────────────▼──────────────────────────────┐  ║
║  │                      CAPA LÓGICA (JS)                     │  ║
║  │                                                            │  ║
║  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │  ║
║  │  │  auth.js   │  │calendar.js │  │  reservations.js   │  │  ║
║  │  │ (HU-01..03)│  │(HU-04..07) │  │  (HU-08..17, 27)  │  │  ║
║  │  └────────────┘  └────────────┘  └────────────────────┘  │  ║
║  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │  ║
║  │  │  users.js  │  │ search.js  │  │     ai.js          │  │  ║
║  │  │  (HU-21)   │  │(HU-26..28) │  │  (HU-31..33)       │  │  ║
║  │  └────────────┘  └────────────┘  └────────────────────┘  │  ║
║  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │  ║
║  │  │  backup.js │  │notif.js    │  │   stats.js         │  │  ║
║  │  │ (HU-18,19) │  │(HU-23..25) │  │  (HU-29, 30)       │  │  ║
║  │  └────────────┘  └────────────┘  └────────────────────┘  │  ║
║  │  ┌───────────────────────────────────────────────────┐    │  ║
║  │  │                    store.js                        │    │  ║
║  │  │       (Estado Global + localStorage)               │    │  ║
║  │  └───────────────────────────────────────────────────┘    │  ║
║  └──────────────────────────┬────────────────────────────────┘  ║
║                              │                                    ║
║  ┌───────────────────────────▼──────────────────────────────┐  ║
║  │                    CAPA DE DATOS                          │  ║
║  │                                                            │  ║
║  │  ┌──────────────────┐      ┌──────────────────────────┐  │  ║
║  │  │  localStorage    │      │  API Backend (futuro)    │  │  ║
║  │  │  (Prototipo)     │      │  Node.js + Express       │  │  ║
║  │  │                  │      │  PostgreSQL               │  │  ║
║  │  │  - reservations  │      │  REST API / JWT           │  │  ║
║  │  │  - users         │      │                          │  │  ║
║  │  │  - calendar      │      │                          │  │  ║
║  │  │  - holidays      │      │                          │  │  ║
║  │  └──────────────────┘      └──────────────────────────┘  │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                    ║
║  SERVICIOS EXTERNOS:                                              ║
║  ┌─────────────┐  ┌────────────────┐  ┌──────────────────────┐  ║
║  │  SMTP       │  │  Cloud Storage │  │  OpenAI / Gemini API │  ║
║  │  (Correos)  │  │  (Respaldos)   │  │  (Módulo IA HU-31+)  │  ║
║  └─────────────┘  └────────────────┘  └──────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 📁 2.2 Estructura de Carpetas Detallada

```
sala-juntas-ibero/
│
├── index.html                    # Login / Landing
├── dashboard.html                # Dashboard secretaria
├── calendar.html                 # Vista calendario principal
├── reservacion.html              # Formulario reservación
├── admin.html                    # Panel administración
├── historial.html                # Historial y búsqueda
├── estadisticas.html             # Dashboard estadísticas
├── ai-panel.html                 # Panel IA lenguaje natural
│
├── css/
│   ├── variables.css             # Variables CSS (colores, tipografía)
│   ├── reset.css                 # Reset/normalize
│   ├── base.css                  # Estilos base globales
│   ├── layout.css                # Grid, contenedores, nav
│   ├── components/
│   │   ├── buttons.css           # Botones (primary, secondary, danger)
│   │   ├── forms.css             # Inputs, labels, validaciones
│   │   ├── modals.css            # Modales y overlays
│   │   ├── calendar.css          # Estilos calendario
│   │   ├── cards.css             # Tarjetas de reservación
│   │   ├── tables.css            # Tablas de datos
│   │   ├── alerts.css            # Alertas y notificaciones
│   │   ├── nav.css               # Navegación sidebar/header
│   │   └── badge.css             # Badges de rol/estado
│   ├── pages/
│   │   ├── login.css             # Estilos página login
│   │   ├── dashboard.css         # Estilos dashboard
│   │   ├── calendar-view.css     # Vista calendario específica
│   │   ├── admin.css             # Panel admin
│   │   └── stats.css             # Estadísticas/gráficas
│   └── responsive.css            # Media queries
│
├── js/
│   ├── core/
│   │   ├── store.js              # Estado global (patrón Module)
│   │   ├── router.js             # Enrutamiento SPA básico
│   │   ├── api.js                # Capa de abstracción de datos
│   │   └── utils.js              # Utilidades (fechas, validaciones)
│   ├── modules/
│   │   ├── auth.js               # Autenticación (HU-01, 02, 03, 22)
│   │   ├── calendar.js           # Lógica calendario (HU-04..07)
│   │   ├── reservations.js       # CRUD reservaciones (HU-08..17)
│   │   ├── recurring.js          # Recurrencia (HU-27)
│   │   ├── users.js              # Gestión usuarios (HU-21)
│   │   ├── holidays.js           # Días festivos (HU-05)
│   │   ├── search.js             # Búsqueda/filtros (HU-26)
│   │   ├── export.js             # Exportación (HU-28)
│   │   ├── notifications.js      # Emails/notificaciones (HU-23..25)
│   │   ├── backup.js             # Respaldos (HU-18, 19)
│   │   ├── stats.js              # Estadísticas (HU-29, 30)
│   │   └── ai.js                 # Módulo IA (HU-31..33)
│   ├── components/
│   │   ├── modal.js              # Componente modal reutilizable
│   │   ├── calendar-grid.js      # Grid de calendario
│   │   ├── time-picker.js        # Selector de hora
│   │   ├── autocomplete.js       # Autocompletado nombres
│   │   ├── date-range.js         # Rango de fechas
│   │   ├── toast.js              # Notificaciones toast
│   │   ├── confirm-dialog.js     # Diálogo confirmación
│   │   └── charts.js             # Gráficas estadísticas
│   └── pages/
│       ├── login.js              # Lógica página login
│       ├── dashboard.js          # Lógica dashboard
│       ├── calendar-page.js      # Lógica vista calendario
│       ├── admin-page.js         # Lógica panel admin
│       ├── history-page.js       # Lógica historial
│       ├── stats-page.js         # Lógica estadísticas
│       └── ai-page.js            # Lógica panel IA
│
├── assets/
│   ├── img/
│   │   ├── logo-ibero.svg        # Logo Ibero
│   │   ├── logo-ibero-white.svg  # Logo variante blanca
│   │   └── icons/                # Iconos SVG sistema
│   └── fonts/                    # Fuentes locales (si aplica)
│
├── data/
│   └── mock-data.js              # Datos iniciales mock
│
├── docs/
│   ├── README.md
│   ├── INSTRUCCIONES_CLAUDE_CODE.md
│   ├── TECHNICAL-NOTES.md
│   ├── HOW-TO-USE.md
│   └── ESTRUCTURA_PROYECTO.txt
│
└── tests/
    ├── test-auth.js              # Tests autenticación
    ├── test-calendar.js          # Tests calendario
    ├── test-reservations.js      # Tests reservaciones
    └── test-conflicts.js         # Tests detección traslapes
```

---

## ════════════════════════════════════════════════════════
## SECCIÓN 3: ESPECIFICACIONES DE DISEÑO UI/UX
## ════════════════════════════════════════════════════════

### 🎨 3.1 Paleta de Colores

```css
:root {
  /* ── COLORES PRIMARIOS ── */
  --color-primary:       #ef3e42;   /* Rojo Ibero — Botones principales, headers */
  --color-primary-dark:  #c62d30;   /* Hover/active de primario */
  --color-primary-light: #f87275;   /* Estados focus, bordes activos */
  --color-primary-bg:    #fef2f2;   /* Fondo sutil de elementos activos */

  /* ── COLORES SECUNDARIOS ── */
  --color-secondary:     #333333;   /* Gris oscuro — Textos, iconos */
  --color-secondary-mid: #555555;   /* Texto secundario */
  --color-secondary-light: #888888; /* Texto deshabilitado, placeholders */

  /* ── FONDOS ── */
  --color-bg:            #ffffff;   /* Fondo principal */
  --color-bg-alt:        #f5f5f5;   /* Fondo alternativo (sidebar, cards) */
  --color-bg-hover:      #eeeeee;   /* Hover en items de lista */
  --color-border:        #e0e0e0;   /* Bordes de separación */

  /* ── ESTADOS ── */
  --color-success:       #28a745;   /* Verde — Reservación activa, confirmación */
  --color-success-bg:    #f0fff4;
  --color-error:         #dc3545;   /* Rojo — Error, traslape detectado */
  --color-error-bg:      #fff5f5;
  --color-warning:       #ffc107;   /* Amarillo — Advertencia, día festivo */
  --color-warning-bg:    #fffdf0;
  --color-info:          #17a2b8;   /* Azul — Info, cierre institucional */
  --color-info-bg:       #f0fbff;

  /* ── CALENDARIO ESPECÍFICO ── */
  --cal-occupied:        #ef3e42;   /* Bloque ocupado */
  --cal-available:       #28a745;   /* Bloque disponible */
  --cal-holiday:         #ffc107;   /* Día festivo */
  --cal-closed:          #6c757d;   /* Cierre institucional */
  --cal-today:           #17a2b8;   /* Hoy */
  --cal-recurring:       #6f42c1;   /* Reservación recurrente */
}
```

### 📝 3.2 Tipografía y Fonts

```css
:root {
  /* ── FAMILIA TIPOGRÁFICA ── */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                 "Helvetica Neue", Arial, sans-serif;

  /* ── TAMAÑOS ── */
  --font-size-xs:   12px;
  --font-size-sm:   14px;
  --font-size-base: 16px;   /* Body text */
  --font-size-md:   18px;   /* Subtítulos */
  --font-size-lg:   20px;
  --font-size-xl:   24px;   /* Títulos sección */
  --font-size-2xl:  28px;
  --font-size-3xl:  32px;   /* Títulos página */

  /* ── PESOS ── */
  --font-weight-regular:    400;
  --font-weight-medium:     500;
  --font-weight-semibold:   600;
  --font-weight-bold:       700;

  /* ── ALTURAS DE LÍNEA ── */
  --line-height-tight:  1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}

/* Aplicación: */
h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); }
h2 { font-size: var(--font-size-xl);  font-weight: var(--font-weight-bold); }
h3 { font-size: var(--font-size-md);  font-weight: var(--font-weight-semibold); }
p  { font-size: var(--font-size-base); font-weight: var(--font-weight-regular); }
```

### 📐 3.3 Espaciado y Grid

```css
:root {
  /* ── ESPACIADO BASE (múltiplos de 8px) ── */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;

  /* ── BORDER RADIUS ── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* ── SOMBRAS ── */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.12);
  --shadow-md:  0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg:  0 10px 15px rgba(0,0,0,0.10);
  --shadow-xl:  0 20px 25px rgba(0,0,0,0.10);

  /* ── GRID ── */
  --container-max: 1200px;
  --sidebar-width: 260px;
  --header-height: 64px;
}

/* GRID RESPONSIVE */
/* Mobile (320px+): 1 columna */
/* Tablet (768px+): sidebar + contenido */
/* Desktop (1200px+): sidebar + contenido + panel lateral */
```

### 🧩 3.4 Componentes Clave

#### Botones
```css
/* Primario */
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover { background: var(--color-primary-dark); }

/* Secundario, Peligro, Ghost — variaciones similares */
```

#### Calendario — Bloque de Reservación
```
┌─────────────────────┐
│ 🔴 10:00 - 12:00    │  ← Color según estado
│ Dr. Ramírez         │  ← Nombre responsable
│ Academia            │  ← Área (truncado)
└─────────────────────┘
```

#### Modal Formulario
```
┌────────────────────────────────────────────────┐
│  ✕  Nueva Reservación                          │
├────────────────────────────────────────────────┤
│  📅 Fecha          [15 de Abril, 2026]  (read) │
│  ⏰ Hora inicio    [10:00    ▼]                │
│  ⏰ Hora fin       [12:00    ▼]                │
│  ─── Validación: ✅ Horario disponible ───     │
│  👤 Responsable    [___________  ▼ historial]  │
│  🏢 Área/Depto.    [___________________________]│
│  📝 Observaciones  [___________________________]│
│                    [___________________________]│
│  ☐ Crear como recurrente                       │
├────────────────────────────────────────────────┤
│            [Cancelar]    [Guardar ✓]           │
└────────────────────────────────────────────────┘
```

---

## ════════════════════════════════════════════════════════
## SECCIÓN 4: ESTRUCTURA DE CARPETAS Y ARCHIVOS
## ════════════════════════════════════════════════════════

*(Ver Sección 2.2 para árbol completo)*

### 📋 4.1 Descripción de Archivos Críticos

| Archivo | Propósito | HU Relacionadas |
|---------|-----------|-----------------|
| `store.js` | Estado global de la app. Gestiona: sesión usuario, reservaciones, calendario, configuración | Todas |
| `auth.js` | Login, logout, verificación roles, recuperación contraseña | HU-01, 02, 03, 22 |
| `calendar.js` | Renderizado del calendario, navegación, detección de traslapes | HU-04, 05, 06, 07, 09 |
| `reservations.js` | CRUD completo de reservaciones, validaciones | HU-08, 10, 11, 12 |
| `recurring.js` | Lógica de reservaciones recurrentes, generación de instancias | HU-27 |
| `ai.js` | Integración con API de IA, parsing de lenguaje natural, sugerencias | HU-31, 32, 33 |
| `mock-data.js` | Dataset inicial para prototipo (usuarios, reservaciones, festivos) | Todas |
| `variables.css` | Design tokens centralizados, paleta de colores completa | — |

---

## ════════════════════════════════════════════════════════
## SECCIÓN 5: REQUISITOS TÉCNICOS DETALLADOS
## ════════════════════════════════════════════════════════

### ⚙️ 5.1 Tecnologías a Usar

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| HTML | HTML5 semántico | Sin frameworks, máxima compatibilidad |
| CSS | CSS3 + Variables | Mobile-first, componentes reutilizables |
| JS | Vanilla JS ES6+ | Sin dependencias, máximo control |
| Storage | localStorage (prototipo) | No requiere backend para demo |
| PDF Export | jsPDF (CDN) | Generación PDF del lado cliente |
| Excel Export | SheetJS/XLSX (CDN) | Exportación Excel estándar |
| IA | API Claude/OpenAI | Procesamiento lenguaje natural |
| Gráficas | Chart.js (CDN) | Visualizaciones estadísticas |
| Iconos | Feather Icons (CDN) | Iconos SVG ligeros |

### 🔧 5.2 Funcionalidades Core

**Autenticación:**
- Login con usuario/contraseña (mock: `secretaria@ibero.mx / Admin123!`)
- Diferenciación de roles en localStorage
- Timeout de sesión a 30 minutos de inactividad
- Protección de rutas por rol

**Calendario:**
- Vista mensual y semanal
- Navegación sin restricciones semestrales (12+ meses)
- Click en slot → apertura formulario con fecha/hora prellenada
- Marcado visual: ocupado (rojo), disponible (verde), festivo (amarillo), cierre (gris)
- Actualización en tiempo real al crear/modificar/cancelar

**Reservaciones:**
- Formulario de 3 pasos máximo (HU-17)
- Detección de traslape en tiempo real (onChange en selectores de hora)
- Campo de texto libre para responsable + autocompletado historial
- Campo observaciones opcional (max 500 chars)
- Eliminación masiva con selección múltiple y confirmación
- Recurrencia: semanal, quincenal, mensual, hasta 52 instancias

**IA (módulo opcional):**
- Campo texto libre en panel dedicado
- Llamada a API externa (configurable: Claude/GPT)
- Extracción: fecha, hora, responsable, duración
- Tarjeta propuesta editable antes de confirmar
- Fallback a formulario manual si API no disponible
- Sugerencias de 3 mejores horarios (basado en historial)

### ✅ 5.3 Validaciones

```javascript
// Traslape de horarios
function checkOverlap(startNew, endNew, existingReservations) {
  return existingReservations.some(r => {
    const startR = new Date(r.startTime);
    const endR   = new Date(r.endTime);
    return startNew < endR && endNew > startR;
  });
}

// Horario válido (no festivo, no cierre, día laboral)
function isValidDate(date, holidays, closures) {
  const day = date.getDay(); // 0=Dom, 6=Sáb
  if (day === 0 || day === 6) return false;
  const dateStr = date.toISOString().split('T')[0];
  if (holidays.includes(dateStr)) return false;
  if (closures.includes(dateStr)) return false;
  return true;
}

// Contraseña (mínimo 8 chars)
function validatePassword(pwd) {
  return pwd.length >= 8;
}
```

### 🗄️ 5.4 Datos Iniciales (Mock)

```javascript
// data/mock-data.js
const MOCK_DATA = {
  users: [
    {
      id: "u001",
      name: "Julieta Esquinca Gómez",
      email: "julieta.esquinca@ibero.mx",
      role: "secretaria",
      password: "Admin123!",   // Hash en producción
      isAdmin: true,
      active: true,
      lastLogin: null
    },
    {
      id: "u002",
      name: "Dr. Miguel Ángel Álvarez",
      email: "miguel.alvarez@ibero.mx",
      role: "academico",
      password: "Acad456!",
      isAdmin: false,
      active: true,
      lastLogin: null
    }
  ],

  reservations: [
    {
      id: "r001",
      title: "Junta de Academia",
      responsible: "Dr. Miguel Ángel Álvarez",
      area: "Academia de Telecomunicaciones",
      date: "2026-04-15",
      startTime: "10:00",
      endTime:   "12:00",
      observations: "Revisión plan semestral",
      status: "active",
      createdBy: "u001",
      createdAt: "2026-04-01T09:00:00",
      isRecurring: false,
      recurringGroupId: null
    },
    {
      id: "r002",
      title: "Reunión Directiva",
      responsible: "Lic. Patricia Torres",
      area: "Coordinación Administrativa",
      date: "2026-04-16",
      startTime: "09:00",
      endTime:   "10:30",
      observations: "",
      status: "active",
      createdBy: "u001",
      createdAt: "2026-04-02T08:30:00",
      isRecurring: true,
      recurringGroupId: "rg001"
    }
  ],

  holidays: [
    { date: "2026-05-01", name: "Día del Trabajo" },
    { date: "2026-09-16", name: "Independencia de México" },
    { date: "2026-11-02", name: "Día de Muertos" },
    { date: "2026-12-25", name: "Navidad" }
  ],

  institutionalClosures: [
    { date: "2026-04-30", name: "Cierre Fin de Semestre" },
    { date: "2026-07-01", name: "Inicio Vacaciones Verano" }
  ],

  responsibleHistory: [
    "Dr. Miguel Ángel Álvarez Hernández",
    "Lic. Patricia Torres Mendoza",
    "Dr. Ricardo Sánchez Zepeda",
    "Mtra. Wendy Guzmán Orta"
  ]
};
```

---

## ════════════════════════════════════════════════════════
## SECCIÓN 6: INSTRUCCIONES PASO A PASO PARA CLAUDE CODE
## ════════════════════════════════════════════════════════

### 📌 INSTRUCCIÓN INICIAL PARA CLAUDE CODE

**Copia este mensaje exacto al iniciar Claude Code:**

```
Voy a desarrollar un prototipo interactivo en HTML5 puro para una 
Plataforma de Gestión y Reservación de Sala de Juntas de la Universidad 
Iberoamericana. 

Tecnología: Vanilla HTML5 + CSS3 + JavaScript ES6 (sin frameworks).
Color primario: #ef3e42 (Rojo Ibero).
Mobile-first responsive (320px, 768px, 1200px).

Seguiremos el documento INSTRUCCIONES_CLAUDE_CODE.md fase por fase.
Por favor confirma que estás listo para comenzar con la FASE 1.
```

---

### 🚀 FASE 1: Fundamentos y Autenticación (HU-01, 02, 03)

**Objetivo:** Sistema base funcional con login diferenciado por roles.

#### TAREA 1.1 — Crear estructura de proyecto
- **Archivos a crear:** Estructura completa de carpetas descrita en Sección 4
- **Contenido requerido:**
  - Carpetas: `css/`, `css/components/`, `css/pages/`, `js/`, `js/core/`, `js/modules/`, `js/components/`, `js/pages/`, `assets/img/`, `data/`
  - Todos los archivos HTML vacíos (shell)
- **Criterio de aceptación:** `ls -la` muestra toda la estructura sin errores

#### TAREA 1.2 — Crear variables.css y reset.css
- **Archivo:** `css/variables.css`
- **Contenido:** Todas las variables CSS de la Sección 3.1, 3.2, 3.3
- **Criterio:** Variables disponibles en todos los componentes

#### TAREA 1.3 — Crear store.js (Estado Global)
- **Archivo:** `js/core/store.js`
- **Contenido requerido:**
```javascript
const Store = (() => {
  let state = {
    currentUser: null,
    reservations: [],
    users: [],
    holidays: [],
    closures: [],
    responsibleHistory: []
  };
  
  const getState = () => ({ ...state });
  const setState = (updates) => { state = { ...state, ...updates }; };
  const getUser = () => state.currentUser;
  const isAdmin = () => state.currentUser?.role === 'secretaria';
  
  return { getState, setState, getUser, isAdmin };
})();
```
- **Criterio:** `Store.getState()` devuelve objeto vacío sin errores

#### TAREA 1.4 — Crear mock-data.js
- **Archivo:** `data/mock-data.js`
- **Contenido:** Dataset completo de la Sección 5.4
- **Criterio:** `MOCK_DATA.users.length === 2` en consola

#### TAREA 1.5 — Crear pantalla de Login (index.html + login.css + login.js)
- **Archivos:** `index.html`, `css/pages/login.css`, `js/pages/login.js`
- **Contenido requerido:**
  - Logo Ibero (svg o placeholder)
  - Formulario: campo usuario, contraseña, botón "Iniciar Sesión"
  - Link "¿Olvidaste tu contraseña?"
  - Color primario `#ef3e42` en botón y header
  - Mensaje de error inline (sin revelar cuál campo falló)
- **Criterio:** Formulario visible, botón con color correcto, error muestra "Credenciales inválidas"

#### TAREA 1.6 — Crear módulo auth.js
- **Archivo:** `js/modules/auth.js`
- **Contenido:**
```javascript
const Auth = (() => {
  const login = (email, password) => {
    const user = MOCK_DATA.users.find(
      u => u.email === email && u.password === password && u.active
    );
    if (!user) return { success: false };
    Store.setState({ currentUser: user });
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('loginTime', Date.now());
    return { success: true, role: user.role };
  };
  
  const logout = () => {
    Store.setState({ currentUser: null });
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTime');
    window.location.href = '/index.html';
  };
  
  const checkSession = () => {
    const user = localStorage.getItem('currentUser');
    const loginTime = localStorage.getItem('loginTime');
    if (!user || !loginTime) return null;
    const elapsed = Date.now() - parseInt(loginTime);
    if (elapsed > 30 * 60 * 1000) { logout(); return null; } // 30 min
    return JSON.parse(user);
  };
  
  const requireRole = (requiredRole) => {
    const user = checkSession();
    if (!user || user.role !== requiredRole) {
      window.location.href = '/index.html';
    }
    return user;
  };
  
  return { login, logout, checkSession, requireRole };
})();
```
- **Criterio:** Login redirige a `dashboard.html` (secretaria) o `calendar.html` (académico)

#### TAREA 1.7 — Crear pantalla Forgot Password
- **Archivos:** Sección en `index.html` o `forgot.html`, `auth.js` (ampliar)
- **Contenido:** Campo email, botón "Enviar enlace", mensaje genérico de confirmación
- **Criterio:** Muestra "Si el correo existe, recibirás un enlace" (sin revelar existencia)

---

### 🚀 FASE 2: Calendario Maestro (HU-04, 05, 06, 07)

**Objetivo:** Calendario interactivo con reservaciones, festivos y navegación libre.

#### TAREA 2.1 — Layout principal con sidebar
- **Archivo:** `css/layout.css`, `dashboard.html`
- **Contenido:**
  - Sidebar izquierdo (260px): logo, menú navegación, info usuario, logout
  - Header superior: título sección, breadcrumb, badge rol
  - Área contenido principal
- **Criterio:** Layout visible en 320px, 768px y 1200px sin overflow horizontal

#### TAREA 2.2 — Componente CalendarGrid
- **Archivo:** `js/components/calendar-grid.js`
- **Contenido:** Genera grid de calendario (Lu-Do) para el mes especificado
- **Criterio:** Muestra días correctos para Abril 2026

#### TAREA 2.3 — Módulo calendar.js
- **Archivo:** `js/modules/calendar.js`
- **Funciones clave:**
  - `renderMonth(year, month)` → actualiza DOM con grid del mes
  - `navigateTo(direction)` → anterior/siguiente mes sin restricción
  - `markHolidays(holidays)` → aplica clase CSS a días festivos
  - `markClosed(closures)` → aplica clase CSS a cierres institucionales
  - `renderReservations(reservations)` → pinta bloques en días ocupados
- **Criterio:** Navegar de Enero 2026 a Enero 2027 sin bloqueos

#### TAREA 2.4 — Vista semanal del calendario
- **Archivo:** `js/modules/calendar.js` (ampliar), `css/pages/calendar-view.css`
- **Contenido:** Toggle vista mensual/semanal, grid de 7 días con horas (08:00-20:00)
- **Criterio:** Reservaciones aparecen en slot de hora correcto

#### TAREA 2.5 — Popup detalle al click en bloque
- **Archivo:** `js/components/modal.js`, `calendar.js`
- **Contenido:**
  - Click en bloque ocupado → popup pequeño (no modal completo)
  - Muestra: responsable, área, hora inicio-fin, observaciones
  - Para secretaria: botones "Editar" y "Cancelar"
  - Para académico: solo información
- **Criterio:** Popup aparece en posición correcta, cierra con Escape o click fuera

#### TAREA 2.6 — Configuración días festivos (HU-05)
- **Archivo:** `js/modules/holidays.js`, pantalla `admin.html` (sección config)
- **Contenido:**
  - Mini-calendario para seleccionar fecha
  - Dropdown: tipo (Día Festivo / Cierre Institucional)
  - Lista de fechas marcadas con opción de eliminar
  - Alerta si hay reservaciones existentes en fecha a marcar
- **Criterio:** Días marcados no son clickeables para nueva reservación

---

### 🚀 FASE 3: Reservaciones (HU-08 al 17, 27)

**Objetivo:** CRUD completo de reservaciones con todas las validaciones.

#### TAREA 3.1 — Formulario Nueva Reservación
- **Archivo:** `reservacion.html`, `js/pages/reservacion.js`, `css/components/forms.css`
- **Contenido:**
  - Se abre como modal al hacer click en slot disponible del calendario
  - Fecha/hora prellenadas automáticamente (HU-17)
  - Time pickers para hora inicio y fin
  - Validación traslape en tiempo real (onChange en time pickers)
  - Indicador visual: ✅ Disponible / ❌ Traslape con [nombre responsable]
  - Campo responsable con autocompletado del historial
  - Campo área (texto libre)
  - Campo observaciones (opcional, 500 chars max)
  - Solo campos mencionados — NUNCA teléfono, correo, software, clave
- **Criterio:** Formulario prellenado con fecha/hora del slot seleccionado

#### TAREA 3.2 — Módulo reservations.js
- **Archivo:** `js/modules/reservations.js`
- **Funciones:**
```javascript
const Reservations = (() => {
  const create = (data) => { /* valida, guarda en localStorage */ };
  const update = (id, data) => { /* valida, actualiza */ };
  const cancel = (id) => { /* marca como cancelada */ };
  const getAll = () => { /* lee localStorage */ };
  const getById = (id) => { /* busca por id */ };
  const checkOverlap = (startTime, endTime, excludeId) => { /* lógica traslape */ };
  return { create, update, cancel, getAll, getById, checkOverlap };
})();
```
- **Criterio:** `Reservations.create(data)` guarda en localStorage y actualiza calendario

#### TAREA 3.3 — Detección traslape en tiempo real (HU-09)
- **Archivo:** `js/modules/reservations.js`
- **Contenido:**
  - Event listener en `change` de ambos time pickers
  - Llama a `checkOverlap()` inmediatamente
  - Muestra alerta ANTES de completar resto del formulario
  - Detecta traslapes parciales (10:00-12:00 bloquea 11:00-13:00)
- **Criterio:** Al cambiar hora a conflictiva → alerta roja aparece < 500ms

#### TAREA 3.4 — Editar reservación (HU-10)
- **Archivo:** `js/modules/reservations.js`, `js/pages/reservacion.js`
- **Contenido:** Formulario pre-cargado con datos existentes, validación traslape excluyendo la reserva actual
- **Criterio:** Campos muestran valores actuales al abrir edición

#### TAREA 3.5 — Cancelar reservación individual (HU-11)
- **Archivo:** `js/modules/reservations.js`
- **Contenido:** Diálogo confirmación → cancelar → liberar slot → registrar en historial
- **Criterio:** Slot queda verde inmediatamente tras cancelación

#### TAREA 3.6 — Vista lista y eliminación masiva (HU-12)
- **Archivo:** `js/modules/reservations.js`, nueva sección en `historial.html`
- **Contenido:**
  - Tabla con checkboxes por fila
  - Botón "Seleccionar todo"
  - Contador "X seleccionadas"
  - Filtros: rango fechas, nombre, estado
  - Modal confirmación con número de reservas a eliminar
- **Criterio:** Eliminar 3 seleccionadas → 3 desaparecen del calendario

#### TAREA 3.7 — Reservaciones recurrentes (HU-27)
- **Archivo:** `js/modules/recurring.js`
- **Contenido:**
  - Toggle "Recurrente" en formulario
  - Selector frecuencia: semanal / quincenal / mensual
  - Fecha fin o número de ocurrencias
  - Genera todas las instancias automáticamente
  - Salta festivos y emite alerta de cuáles se omitieron
  - Indicador visual en calendario (ícono de repetición)
  - Cancelar una instancia vs cancelar serie completa
- **Criterio:** Crear recurrencia semanal por 4 semanas → 4 bloques en calendario

#### TAREA 3.8 — Autocompletado responsable (HU-15)
- **Archivo:** `js/components/autocomplete.js`
- **Contenido:**
  - Input de texto libre
  - Dropdown con sugerencias del historial al escribir >= 2 caracteres
  - Acepta nombre nuevo no existente en historial
  - Guarda nombre nuevo en historial tras guardar reservación
- **Criterio:** Escribir "Dr." → muestra todos los "Dr." del historial

---

### 🚀 FASE 4: Funcionalidades Avanzadas (HU-20..33)

**Objetivo:** Historial, búsqueda, exportación, notificaciones, IA y estadísticas.

#### TAREA 4.1 — Historial de reservaciones (HU-20)
- **Archivo:** `historial.html`, `js/pages/history-page.js`
- **Contenido:** Tabla completa con filtros (fecha, responsable, estado), incluye canceladas
- **Criterio:** Filtrar por "cancelada" muestra solo canceladas

#### TAREA 4.2 — Búsqueda y filtros (HU-26)
- **Archivo:** `js/modules/search.js`
- **Contenido:** Búsqueda insensible a mayúsculas/acentos, resultados < 2 segundos
- **Criterio:** "garcia" encuentra "García"

#### TAREA 4.3 — Exportación PDF y Excel (HU-28)
- **Archivo:** `js/modules/export.js`
- **Librerías:** jsPDF, SheetJS vía CDN
- **Criterio:** PDF generado contiene tabla con reservaciones del rango

#### TAREA 4.4 — Dashboard estadísticas (HU-29, 30)
- **Archivo:** `estadisticas.html`, `js/pages/stats-page.js`
- **Librerías:** Chart.js vía CDN
- **Gráficas:** Ocupación mensual (barras), Top 5 áreas (dona), Cancelaciones vs activas
- **Criterio:** Gráficas renderizan correctamente con datos mock

#### TAREA 4.5 — Panel IA Lenguaje Natural (HU-31, 32)
- **Archivo:** `ai-panel.html`, `js/modules/ai.js`
- **Contenido:**
  - Campo texto libre "Describe tu reservación"
  - Llamada a API IA (configurable vía variable en config)
  - Tarjeta propuesta editable
  - Fallback a formulario manual si API falla
- **Criterio:** Texto "reunión mañana a las 10" genera propuesta con fecha correcta

#### TAREA 4.6 — Sugerencias horario inteligentes (HU-33)
- **Archivo:** `js/modules/ai.js` (ampliar)
- **Contenido:** Panel lateral con 3 mejores horarios disponibles al seleccionar fecha
- **Criterio:** Click en sugerencia pre-llena time pickers del formulario

#### TAREA 4.7 — Gestión de usuarios (HU-21)
- **Archivo:** Sección en `admin.html`, `js/modules/users.js`
- **Contenido:** CRUD usuarios (crear/editar/desactivar), tabla con estado/último acceso
- **Criterio:** Desactivar usuario → ese usuario no puede iniciar sesión

#### TAREA 4.8 — Notificaciones y correos (HU-23, 24, 25)
- **Archivo:** `js/modules/notifications.js`
- **Contenido:** Simulación de envío email (console.log en prototipo), log de notificaciones
- **Criterio:** Al crear reservación → log muestra "Email enviado a [responsable]"

---

## ════════════════════════════════════════════════════════
## SECCIÓN 7: NOTAS TÉCNICAS PARA DESARROLLO BACKEND
## ════════════════════════════════════════════════════════

### 🔌 7.1 Stack Recomendado

| Capa | Tecnología | Versión Recomendada |
|------|-----------|---------------------|
| Runtime | Node.js | 20 LTS |
| Framework | Express.js | 4.x |
| Base de datos | PostgreSQL | 16 |
| ORM | Prisma | 5.x |
| Autenticación | JWT + bcrypt | — |
| Email | Nodemailer | 6.x |
| Nube Storage | AWS S3 / Google Cloud | — |
| IA | OpenAI API / Anthropic API | GPT-4o / Claude Sonnet |
| Deploy | Vercel (frontend) + Railway (backend) | — |

### 🌐 7.2 Endpoints API a Implementar

```
POST   /api/auth/login              → { token, user }
POST   /api/auth/logout             → 200 OK
POST   /api/auth/forgot-password    → 200 OK (genérico)
POST   /api/auth/reset-password     → 200 OK

GET    /api/reservations            → [ reservación, ... ]
POST   /api/reservations            → reservación creada
PUT    /api/reservations/:id        → reservación actualizada
DELETE /api/reservations/:id        → 204 No Content
DELETE /api/reservations/bulk       → { deleted: n }

GET    /api/calendar/holidays       → [ festivo, ... ]
POST   /api/calendar/holidays       → festivo creado
DELETE /api/calendar/holidays/:id   → 204

GET    /api/users                   → [ usuario, ... ]
POST   /api/users                   → usuario creado
PUT    /api/users/:id               → usuario actualizado
PATCH  /api/users/:id/deactivate    → usuario desactivado

POST   /api/ai/parse-reservation    → propuesta de reservación
GET    /api/ai/suggestions?date=X   → [ sugerencia, ... ]

GET    /api/stats/dashboard         → { ocupacion, top5areas, cancelaciones }
GET    /api/stats/report?start&end  → reporte detallado

GET    /api/backups                 → [ backup, ... ]
POST   /api/backups/restore/:id     → 202 Accepted
```

### 🗃️ 7.3 Modelos de Base de Datos

```sql
-- USUARIOS
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(200) NOT NULL,
  email        VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('secretaria', 'academico') NOT NULL,
  is_admin     BOOLEAN DEFAULT FALSE,
  active       BOOLEAN DEFAULT TRUE,
  last_login   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RESERVACIONES
CREATE TABLE reservations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  responsible_name VARCHAR(200) NOT NULL,
  area             VARCHAR(200) NOT NULL,
  start_time       TIMESTAMPTZ NOT NULL,
  end_time         TIMESTAMPTZ NOT NULL,
  observations     TEXT,
  status           ENUM('active','cancelled','past') DEFAULT 'active',
  is_recurring     BOOLEAN DEFAULT FALSE,
  recurring_group  UUID REFERENCES recurring_groups(id),
  created_by       UUID REFERENCES users(id),
  last_modified_by UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- RECURRENCIAS
CREATE TABLE recurring_groups (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern   ENUM('weekly','biweekly','monthly') NOT NULL,
  end_date  DATE,
  max_ocurrences INTEGER
);

-- FESTIVOS Y CIERRES
CREATE TABLE calendar_events (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date  DATE NOT NULL,
  name  VARCHAR(200) NOT NULL,
  type  ENUM('holiday','closure') NOT NULL
);

-- LOG AUDITORÍA
CREATE TABLE audit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id),
  action     VARCHAR(100) NOT NULL,
  entity     VARCHAR(100),
  entity_id  UUID,
  details    JSONB,
  timestamp  TIMESTAMPTZ DEFAULT NOW()
);

-- RESPALDOS
CREATE TABLE backups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloud_url  TEXT NOT NULL,
  status     ENUM('success','failed') NOT NULL,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 🔒 7.4 Consideraciones de Seguridad

| Amenaza | Mitigación |
|---------|-----------|
| Inyección SQL | ORM Prisma con queries parametrizadas |
| XSS | Sanitizar inputs, CSP headers |
| CSRF | Tokens CSRF en formularios |
| Sesiones robadas | JWT con expiración, refresh tokens |
| Contraseñas | bcrypt con salt rounds >= 12 |
| Datos en tránsito | HTTPS obligatorio, HSTS |
| Acceso no autorizado | Verificación de rol en cada endpoint |
| Datos en reposo (backups) | Cifrado AES-256 en S3 |
| Fuerza bruta | Rate limiting: 5 intentos → bloqueo 15 min |
| URLs de administración | Protección por middleware de autenticación |

---

*Fin del documento INSTRUCCIONES_CLAUDE_CODE.md*
*Versión 1.0 — Abril 2026 — Ibero Universidad CDMX*
