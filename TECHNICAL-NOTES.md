# ⚡ TECHNICAL NOTES
## Plataforma de Gestión y Reservación de Sala de Juntas — Ibero CDMX
### Referencia Técnica de Implementación

> **Audiencia:** Desarrolladores del equipo | **Tecnología:** Vanilla HTML5/CSS3/JS

---

## ════════════════════════════════════════════════════════
## SECCIÓN 1: ESPECIFICACIONES DE IMPLEMENTACIÓN
## ════════════════════════════════════════════════════════

### 📦 1.1 Estructura de Datos (JSON / localStorage)

#### Esquema Reservación

```javascript
// Reservación individual
{
  id:              "r001",              // UUID string
  responsible:     "Dr. Miguel Álvarez", // Nombre libre
  area:            "Academia Telecom",   // Texto libre
  date:            "2026-04-15",         // ISO YYYY-MM-DD
  startTime:       "10:00",             // HH:MM 24h
  endTime:         "12:00",             // HH:MM 24h
  observations:    "Texto opcional",    // max 500 chars
  status:          "active",            // active|cancelled|past
  isRecurring:     false,
  recurringGroupId: null,               // UUID si es recurrente
  createdBy:       "u001",              // user ID
  createdAt:       "2026-04-01T09:00:00Z",
  updatedAt:       "2026-04-01T09:00:00Z",
  lastModifiedBy:  "u001",
  cancelReason:    null                 // Motivo cancelación (opcional)
}

// Grupo de recurrencia
{
  id:       "rg001",
  pattern:  "weekly",        // weekly|biweekly|monthly
  endDate:  "2026-12-31",   // o null si usa maxOccurrences
  maxOccurrences: 12,        // o null si usa endDate
  baseReservation: { /* datos base */ }
}
```

#### Esquema Usuario

```javascript
{
  id:          "u001",
  name:        "Julieta Esquinca Gómez",
  email:       "julieta.esquinca@ibero.mx",
  password:    "hashed_password",      // bcrypt en producción, texto plano en prototipo
  role:        "secretaria",           // secretaria|academico
  isAdmin:     true,                   // solo secretaria puede ser admin
  active:      true,
  lastLogin:   "2026-04-10T08:30:00Z",
  createdAt:   "2026-02-13T00:00:00Z"
}
```

#### Esquema Festivo / Cierre

```javascript
{
  id:   "h001",
  date: "2026-05-01",
  name: "Día del Trabajo",
  type: "holiday"    // holiday|closure
}
```

#### Esquema Entrada Audit Log

```javascript
{
  id:        "log001",
  userId:    "u001",
  userName:  "Julieta Esquinca",
  action:    "CREATE_RESERVATION",   // Ver catálogo abajo
  entityId:  "r001",
  details:   { responsible: "Dr. Álvarez", date: "2026-04-15" },
  timestamp: "2026-04-10T09:15:00Z"
}

// Catálogo de acciones:
// LOGIN | LOGOUT | CREATE_RESERVATION | UPDATE_RESERVATION
// CANCEL_RESERVATION | BULK_CANCEL | CREATE_USER | DEACTIVATE_USER
// ADD_HOLIDAY | REMOVE_HOLIDAY | RESTORE_BACKUP | AI_PARSE
```

#### Estructura localStorage

```javascript
// Claves en localStorage (prototipo):
localStorage.setItem('srj_users',        JSON.stringify([...]));
localStorage.setItem('srj_reservations', JSON.stringify([...]));
localStorage.setItem('srj_holidays',     JSON.stringify([...]));
localStorage.setItem('srj_closures',     JSON.stringify([...]));
localStorage.setItem('srj_responsible_history', JSON.stringify([...]));
localStorage.setItem('srj_audit_log',    JSON.stringify([...]));
localStorage.setItem('srj_current_user', JSON.stringify({...}));
localStorage.setItem('srj_session_time', Date.now().toString());
```

---

### 🔌 1.2 APIs de Cada Módulo

#### Auth Module API

```javascript
Auth.login(email, password)
// → { success: true, role: 'secretaria' } | { success: false, error: 'INVALID_CREDENTIALS' }

Auth.logout()
// → void (redirige a index.html)

Auth.checkSession()
// → User | null (null si expiró o no existe)

Auth.requireRole(role)
// → User | redirige a login si no coincide

Auth.requestPasswordReset(email)
// → { sent: true } (siempre, para no revelar existencia de cuenta)

Auth.resetPassword(token, newPassword)
// → { success: true } | { success: false, error: 'TOKEN_EXPIRED' }
```

#### Reservations Module API

```javascript
Reservations.getAll()
// → Reservation[]  (todas, incluyendo canceladas y pasadas)

Reservations.getActive()
// → Reservation[]  (solo status === 'active' y fecha futura)

Reservations.getById(id)
// → Reservation | null

Reservations.getByDate(dateStr)
// → Reservation[]  (reservaciones en esa fecha)

Reservations.getByDateRange(startDate, endDate)
// → Reservation[]

Reservations.create(data)
// data: { responsible, area, date, startTime, endTime, observations? }
// → { success: true, reservation: Reservation } | { success: false, error: 'OVERLAP' | 'HOLIDAY' | 'INVALID_DATE' }

Reservations.update(id, data)
// → { success: true, reservation: Reservation } | { success: false, error: ... }

Reservations.cancel(id, reason?)
// → { success: true } | { success: false }

Reservations.cancelBulk(ids, reason?)
// → { success: true, cancelled: n, failed: m }

Reservations.checkOverlap(startTime, endTime, excludeId?)
// startTime/endTime: "YYYY-MM-DDTHH:MM"
// → { hasOverlap: false } | { hasOverlap: true, conflictWith: Reservation }
```

#### Calendar Module API

```javascript
Calendar.render(year, month)
// → void (actualiza DOM del calendario)

Calendar.goToPreviousMonth()
Calendar.goToNextMonth()
Calendar.goToDate(year, month)
// → void

Calendar.switchView(view)
// view: 'month' | 'week'
// → void

Calendar.refresh()
// → void (re-renderiza con datos actuales del Store)

Calendar.getSelectedSlot()
// → { date, startTime, endTime } | null
```

#### Search Module API

```javascript
Search.query(params)
// params: { text?, dateFrom?, dateTo?, area?, status?, page?, limit? }
// → { results: Reservation[], total: number, page: number }

Search.normalize(text)
// Normaliza acentos y mayúsculas: "García" → "garcia"
// → string

Search.highlight(text, query)
// → string con <mark> tags en coincidencias
```

#### AI Module API

```javascript
AI.parseNaturalLanguage(text)
// → Promise<{ date, startTime, endTime, responsible?, area?, observations? }>
//   | Promise<{ error: 'AMBIGUOUS', clarification: string }>
//   | Promise<{ error: 'UNRELATED' }>

AI.getSuggestions(date, duration?)
// duration en minutos
// → Promise<Suggestion[]>
// Suggestion: { startTime, endTime, occupancyPercent, suitability: 'high'|'medium'|'low' }

AI.confirmProposal(proposal, adjustments?)
// → Reservation (llama a Reservations.create internamente)
```

---

### 🔧 1.3 Funciones Críticas Implementadas

#### Detección de Traslape

```javascript
// js/modules/reservations.js

/**
 * Verifica si un rango de tiempo se traslapa con reservaciones existentes.
 * Detecta traslapes parciales (A cubre parte de B).
 *
 * @param {string} newStart - "YYYY-MM-DDTHH:MM"
 * @param {string} newEnd   - "YYYY-MM-DDTHH:MM"
 * @param {string|null} excludeId - ID a excluir (para edición)
 * @returns {{ hasOverlap: boolean, conflictWith?: Reservation }}
 */
function checkOverlap(newStart, newEnd, excludeId = null) {
  const start = new Date(newStart);
  const end   = new Date(newEnd);
  
  const reservations = Reservations.getActive().filter(r => r.id !== excludeId);
  
  for (const r of reservations) {
    const rStart = new Date(`${r.date}T${r.startTime}`);
    const rEnd   = new Date(`${r.date}T${r.endTime}`);
    
    // Traslape si: inicio < fin_existente Y fin > inicio_existente
    if (start < rEnd && end > rStart) {
      return { hasOverlap: true, conflictWith: r };
    }
  }
  
  return { hasOverlap: false };
}
```

#### Validación de Fecha Laboral

```javascript
/**
 * Verifica si una fecha es válida para reservar:
 * no es fin de semana, no es festivo, no es cierre.
 */
function isValidWorkDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00'); // Evitar problemas de zona horaria
  
  // No fin de semana
  const day = date.getDay();
  if (day === 0 || day === 6) {
    return { valid: false, reason: 'WEEKEND' };
  }
  
  // No festivo
  const holidays = Store.getState().holidays;
  if (holidays.some(h => h.date === dateStr && h.type === 'holiday')) {
    const holiday = holidays.find(h => h.date === dateStr);
    return { valid: false, reason: 'HOLIDAY', name: holiday.name };
  }
  
  // No cierre institucional
  const closures = Store.getState().holidays;
  if (closures.some(h => h.date === dateStr && h.type === 'closure')) {
    const closure = closures.find(h => h.date === dateStr);
    return { valid: false, reason: 'CLOSURE', name: closure.name };
  }
  
  return { valid: true };
}
```

#### Generador de Reservaciones Recurrentes

```javascript
/**
 * Genera instancias de reservaciones recurrentes.
 * Omite días festivos y cierres automáticamente.
 *
 * @param {Object} baseData - Datos base de la reservación
 * @param {string} pattern  - 'weekly' | 'biweekly' | 'monthly'
 * @param {string} endDate  - Fecha fin YYYY-MM-DD
 * @param {number} maxOccurrences - Máximo de ocurrencias (default: 52)
 * @returns {{ created: Reservation[], skipped: string[], groupId: string }}
 */
function generateRecurring(baseData, pattern, endDate, maxOccurrences = 52) {
  const groupId = generateUUID();
  const created = [];
  const skipped = [];
  
  let currentDate = new Date(baseData.date + 'T12:00:00');
  const endDateObj = new Date(endDate + 'T12:00:00');
  let count = 0;
  
  const intervalDays = {
    'weekly':    7,
    'biweekly': 14,
    'monthly':  null  // Mes siguiente mismo día
  };
  
  while (currentDate <= endDateObj && count < maxOccurrences) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const validity = isValidWorkDate(dateStr);
    
    if (validity.valid) {
      const reservation = {
        ...baseData,
        id: generateUUID(),
        date: dateStr,
        isRecurring: true,
        recurringGroupId: groupId,
        createdAt: new Date().toISOString()
      };
      
      const overlap = checkOverlap(
        `${dateStr}T${baseData.startTime}`,
        `${dateStr}T${baseData.endTime}`
      );
      
      if (!overlap.hasOverlap) {
        created.push(reservation);
        count++;
      } else {
        skipped.push({ date: dateStr, reason: 'OVERLAP', conflict: overlap.conflictWith });
      }
    } else {
      skipped.push({ date: dateStr, reason: validity.reason, name: validity.name });
    }
    
    // Avanzar fecha
    if (pattern === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() + intervalDays[pattern]);
    }
  }
  
  return { created, skipped, groupId };
}
```

#### Normalización para Búsqueda (HU-26)

```javascript
/**
 * Normaliza texto para búsqueda insensible a mayúsculas y acentos.
 * "García" → "garcia"
 */
function normalizeForSearch(text) {
  return text
    .toLowerCase()
    .normalize('NFD')                           // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '')           // Elimina diacríticos
    .trim();
}

function searchReservations(params) {
  let results = Reservations.getAll();
  
  if (params.text) {
    const normalized = normalizeForSearch(params.text);
    results = results.filter(r =>
      normalizeForSearch(r.responsible).includes(normalized) ||
      normalizeForSearch(r.area).includes(normalized)
    );
  }
  
  if (params.dateFrom) {
    results = results.filter(r => r.date >= params.dateFrom);
  }
  
  if (params.dateTo) {
    results = results.filter(r => r.date <= params.dateTo);
  }
  
  if (params.status && params.status !== 'all') {
    results = results.filter(r => r.status === params.status);
  }
  
  // Ordenar por fecha
  results.sort((a, b) => a.date.localeCompare(b.date));
  
  return results;
}
```

#### Integración IA — Parser de Lenguaje Natural

```javascript
// js/modules/ai.js

const AI_CONFIG = {
  apiUrl: 'https://api.anthropic.com/v1/messages',  // Configurable
  model:  'claude-sonnet-4-20250514',
  systemPrompt: `Eres un asistente de gestión de sala de juntas de la Universidad Iberoamericana.
  Tu función es extraer información de reservación de texto en español.
  Responde SOLO con JSON válido, sin texto adicional.
  
  Schema de respuesta:
  {
    "status": "complete" | "incomplete" | "unrelated",
    "date": "YYYY-MM-DD" | null,
    "startTime": "HH:MM" | null,
    "endTime": "HH:MM" | null,
    "responsible": "string" | null,
    "area": "string" | null,
    "observations": "string" | null,
    "clarificationNeeded": "string" | null
  }
  
  Hoy es: ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
  Horario disponible: Lunes a Viernes, 08:00 a 20:00.`
};

async function parseNaturalLanguage(userText) {
  try {
    const response = await fetch(AI_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
        // API key se maneja server-side en producción
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        max_tokens: 500,
        system: AI_CONFIG.systemPrompt,
        messages: [{ role: 'user', content: userText }]
      })
    });
    
    const data = await response.json();
    const text = data.content[0].text;
    return JSON.parse(text);
    
  } catch (error) {
    console.error('AI parse error:', error);
    return { status: 'error', fallback: true };
  }
}
```

---

## ════════════════════════════════════════════════════════
## SECCIÓN 2: PATRONES DE DESARROLLO
## ════════════════════════════════════════════════════════

### 🏗️ 2.1 Patrón Module (IIFE)

Todos los módulos usan el patrón Module para encapsulación:

```javascript
// js/modules/ejemplo.js
const NombreModulo = (() => {
  // ── Estado privado ──
  let _privateState = [];
  
  // ── Funciones privadas ──
  function _privateHelper(data) {
    // lógica interna
    return data;
  }
  
  // ── API pública ──
  const publicMethod = (param) => {
    return _privateHelper(param);
  };
  
  const anotherMethod = () => {
    return [..._privateState]; // copia defensiva
  };
  
  // ── Inicialización ──
  const init = () => {
    _privateState = JSON.parse(localStorage.getItem('srj_key') || '[]');
  };
  
  // ── Exportar API ──
  return { publicMethod, anotherMethod, init };
})();
```

### 🔄 2.2 Patrón Event Delegation

Para manejar eventos en listas dinámicas (evitar múltiples listeners):

```javascript
// ✅ CORRECTO: Un listener en el contenedor padre
document.querySelector('#reservations-container').addEventListener('click', (e) => {
  const card = e.target.closest('.reservation-card');
  if (!card) return;
  
  if (e.target.closest('.btn-edit')) {
    handleEdit(card.dataset.id);
  } else if (e.target.closest('.btn-cancel')) {
    handleCancel(card.dataset.id);
  } else if (e.target.closest('.btn-details')) {
    handleDetails(card.dataset.id);
  }
});

// ❌ INCORRECTO: Listener en cada elemento
document.querySelectorAll('.btn-edit').forEach(btn => {
  btn.addEventListener('click', handleEdit);  // Se pierde al re-render
});
```

### 🔔 2.3 Patrón Observer (Pub/Sub para Store)

```javascript
// js/core/store.js — con sistema de eventos
const Store = (() => {
  let state = { /* ... */ };
  const subscribers = {};
  
  const subscribe = (event, callback) => {
    if (!subscribers[event]) subscribers[event] = [];
    subscribers[event].push(callback);
    return () => { // Función para desuscribirse
      subscribers[event] = subscribers[event].filter(cb => cb !== callback);
    };
  };
  
  const emit = (event, data) => {
    (subscribers[event] || []).forEach(cb => cb(data));
  };
  
  const setState = (updates) => {
    state = { ...state, ...updates };
    emit('stateChanged', state);
    // Emitir eventos específicos
    if (updates.reservations) emit('reservationsChanged', state.reservations);
    if (updates.currentUser) emit('authChanged', state.currentUser);
  };
  
  return { subscribe, setState, getState: () => ({ ...state }) };
})();

// Uso:
// Calendario se actualiza automáticamente cuando cambian las reservaciones
const unsubscribe = Store.subscribe('reservationsChanged', (reservations) => {
  Calendar.refresh();
});
```

---

## ════════════════════════════════════════════════════════
## SECCIÓN 3: EJEMPLOS DE CÓDIGO COMPLETOS
## ════════════════════════════════════════════════════════

### 💻 3.1 Renderizado del Calendario Mensual (Completo)

```javascript
// js/components/calendar-grid.js

function renderMonthGrid(year, month, container) {
  const reservations = Reservations.getActive();
  const holidays     = Store.getState().holidays;
  const today        = new Date().toISOString().split('T')[0];
  
  // Primer día del mes (0=Dom, 1=Lun, ...)
  const firstDay = new Date(year, month, 1);
  // Ajustar para semana Lunes-Domingo
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1; // Lunes = 0
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let html = `
    <div class="calendar-grid">
      <div class="calendar-header">
        <div class="day-label">Lun</div>
        <div class="day-label">Mar</div>
        <div class="day-label">Mié</div>
        <div class="day-label">Jue</div>
        <div class="day-label">Vie</div>
        <div class="day-label">Sáb</div>
        <div class="day-label">Dom</div>
      </div>
      <div class="calendar-body">
  `;
  
  // Celdas vacías antes del primer día
  for (let i = 0; i < startDow; i++) {
    html += `<div class="calendar-cell empty"></div>`;
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayReservations = reservations.filter(r => r.date === dateStr);
    const holiday = holidays.find(h => h.date === dateStr);
    const isToday = dateStr === today;
    const isWeekend = [5, 6].includes((new Date(dateStr + 'T12:00:00').getDay() + 6) % 7);
    
    let cellClass = 'calendar-cell';
    if (isToday)    cellClass += ' today';
    if (isWeekend)  cellClass += ' weekend';
    if (holiday?.type === 'holiday')  cellClass += ' holiday';
    if (holiday?.type === 'closure')  cellClass += ' closure';
    if (!holiday && !isWeekend) cellClass += ' available';
    
    html += `
      <div class="${cellClass}" 
           data-date="${dateStr}"
           ${!holiday && !isWeekend ? 'data-clickable="true"' : ''}>
        <span class="day-number">${day}</span>
        ${holiday ? `<span class="holiday-label">${holiday.name}</span>` : ''}
        <div class="day-reservations">
    `;
    
    dayReservations.slice(0, 3).forEach(r => {
      const isRecurring = r.isRecurring ? 'recurring' : '';
      html += `
        <div class="reservation-block ${isRecurring}" 
             data-reservation-id="${r.id}"
             title="${r.responsible} — ${r.startTime}-${r.endTime}">
          <span class="block-time">${r.startTime}</span>
          <span class="block-name">${r.responsible.split(' ')[0]}</span>
        </div>
      `;
    });
    
    if (dayReservations.length > 3) {
      html += `<div class="more-reservations">+${dayReservations.length - 3} más</div>`;
    }
    
    html += `</div></div>`;
  }
  
  html += `</div></div>`;
  container.innerHTML = html;
  
  // Event delegation en el grid
  container.addEventListener('click', handleCalendarClick);
}

function handleCalendarClick(e) {
  const cell = e.target.closest('[data-clickable="true"]');
  const block = e.target.closest('[data-reservation-id]');
  
  if (block) {
    const resId = block.dataset.reservationId;
    showReservationDetail(resId);
  } else if (cell) {
    const date = cell.dataset.date;
    openNewReservationModal(date);
  }
}
```

### 💻 3.2 Modal de Reservación con Validación en Tiempo Real

```javascript
// js/modules/reservations-ui.js

function openNewReservationModal(date, startTime = '09:00', endTime = '10:00') {
  const isAdmin = Auth.checkSession()?.role === 'secretaria';
  if (!isAdmin) return;
  
  const modal = document.getElementById('reservation-modal');
  
  // Prellenar campos (HU-17: sin reingreso de datos)
  document.getElementById('res-date').value      = formatDateDisplay(date);
  document.getElementById('res-date-hidden').value = date;
  document.getElementById('res-start').value     = startTime;
  document.getElementById('res-end').value       = endTime;
  document.getElementById('res-observations').value = '';
  document.getElementById('res-responsible').value  = '';
  document.getElementById('res-area').value         = '';
  
  // Validación inicial
  validateTimeRange(date, startTime, endTime);
  
  modal.classList.add('active');
  modal.querySelector('[data-close]').focus();
  
  // Event listeners en el modal
  document.getElementById('res-start').addEventListener('change', onTimeChange);
  document.getElementById('res-end').addEventListener('change', onTimeChange);
}

function onTimeChange() {
  const date  = document.getElementById('res-date-hidden').value;
  const start = document.getElementById('res-start').value;
  const end   = document.getElementById('res-end').value;
  validateTimeRange(date, start, end);
}

function validateTimeRange(date, start, end) {
  const indicator = document.getElementById('overlap-indicator');
  const saveBtn   = document.getElementById('btn-save-reservation');
  
  if (!start || !end || start >= end) {
    indicator.className = 'overlap-indicator warning';
    indicator.innerHTML = '⚠️ La hora de fin debe ser posterior a la de inicio';
    saveBtn.disabled = true;
    return;
  }
  
  const overlap = Reservations.checkOverlap(
    `${date}T${start}`,
    `${date}T${end}`,
    document.getElementById('res-editing-id')?.value || null
  );
  
  if (overlap.hasOverlap) {
    indicator.className = 'overlap-indicator error';
    indicator.innerHTML = `
      ❌ <strong>Traslape detectado</strong><br>
      ${overlap.conflictWith.startTime}–${overlap.conflictWith.endTime}: 
      ${overlap.conflictWith.responsible}
    `;
    saveBtn.disabled = true;
  } else {
    indicator.className = 'overlap-indicator success';
    indicator.innerHTML = '✅ Horario disponible';
    saveBtn.disabled = false;
  }
}

function saveReservation() {
  const data = {
    responsible:  document.getElementById('res-responsible').value.trim(),
    area:         document.getElementById('res-area').value.trim(),
    date:         document.getElementById('res-date-hidden').value,
    startTime:    document.getElementById('res-start').value,
    endTime:      document.getElementById('res-end').value,
    observations: document.getElementById('res-observations').value.trim()
  };
  
  // Validaciones
  if (!data.responsible) {
    showToast('El nombre del responsable es requerido', 'error');
    return;
  }
  
  const result = Reservations.create(data);
  
  if (result.success) {
    closeModal('reservation-modal');
    showToast('✅ Reservación creada exitosamente', 'success');
    Calendar.refresh();
    // Actualizar historial de responsables
    updateResponsibleHistory(data.responsible);
  } else {
    showToast(`Error: ${result.error}`, 'error');
  }
}
```

### 💻 3.3 Exportación a PDF (con jsPDF)

```javascript
// js/modules/export.js

function exportToPDF(reservations, dateRange) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(18);
  doc.setTextColor(239, 62, 66); // #ef3e42
  doc.text('Universidad Iberoamericana CDMX', 20, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(51, 51, 51);
  doc.text('Sala de Juntas — Reporte de Reservaciones', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(136, 136, 136);
  doc.text(`Período: ${dateRange.from} al ${dateRange.to}`, 20, 38);
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 20, 44);
  
  // Línea separadora
  doc.setDrawColor(239, 62, 66);
  doc.setLineWidth(0.5);
  doc.line(20, 48, 190, 48);
  
  // Tabla de datos
  const headers = [['Fecha', 'Hora', 'Responsable', 'Área', 'Estado']];
  const rows = reservations.map(r => [
    formatDateDisplay(r.date),
    `${r.startTime}–${r.endTime}`,
    r.responsible,
    r.area,
    r.status === 'active' ? 'Activa' : 'Cancelada'
  ]);
  
  doc.autoTable({
    head: headers,
    body: rows,
    startY: 52,
    headStyles: {
      fillColor: [239, 62, 66],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    styles: { fontSize: 9, cellPadding: 4 }
  });
  
  // Total
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.text(`Total de reservaciones: ${reservations.length}`, 20, finalY);
  
  doc.save(`reservaciones_sala_juntas_${dateRange.from}_${dateRange.to}.pdf`);
}
```

### 💻 3.4 Toast Notifications

```javascript
// js/components/toast.js

function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container') 
                    || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Cerrar">✕</button>
  `;
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    dismissToast(toast);
  });
  
  container.appendChild(toast);
  
  // Animación de entrada
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  
  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }
}

function dismissToast(toast) {
  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-atomic', 'false');
  document.body.appendChild(container);
  return container;
}
```

---

## ════════════════════════════════════════════════════════
## SECCIÓN 4: CONSIDERACIONES IMPORTANTES
## ════════════════════════════════════════════════════════

### 💾 4.1 Persistencia de Datos (Prototipo)

```javascript
// Wrapper para localStorage con manejo de errores y prefijo
const Storage = {
  PREFIX: 'srj_',
  
  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('localStorage lleno. Limpiar datos antiguos.');
      }
      return false;
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  
  remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  },
  
  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
};

// Inicialización: cargar mock data si no existen datos
function initializeStorage() {
  if (!Storage.get('initialized')) {
    Storage.set('users',        MOCK_DATA.users);
    Storage.set('reservations', MOCK_DATA.reservations);
    Storage.set('holidays',     MOCK_DATA.holidays);
    Storage.set('closures',     MOCK_DATA.institutionalClosures);
    Storage.set('responsible_history', MOCK_DATA.responsibleHistory);
    Storage.set('audit_log',    []);
    Storage.set('initialized',  true);
    console.log('✅ Sistema inicializado con datos mock');
  }
}
```

### 📅 4.2 Fechas y Horarios — Consideraciones Críticas

```javascript
// PROBLEMA: new Date("2026-04-15") interpreta como UTC medianoche
// → En zona horaria negativa (CDMX = UTC-6), resulta en 14/Abr

// SOLUCIÓN: Siempre agregar T12:00:00 para fechas sin hora
const date = new Date("2026-04-15T12:00:00"); // ✅ Seguro en cualquier zona

// Comparación de fechas (siempre como strings YYYY-MM-DD)
function isDateInRange(dateStr, fromStr, toStr) {
  return dateStr >= fromStr && dateStr <= toStr;  // Comparación string es correcta para ISO
}

// Formatear para mostrar al usuario (español)
function formatDateDisplay(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  // → "miércoles, 15 de abril de 2026"
}

// Formatear hora para mostrar
function formatTimeDisplay(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const period = h >= 12 ? 'p.m.' : 'a.m.';
  const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${displayH}:${minutes} ${period}`;
  // → "10:00 a.m."
}

// Generar UUID simple para IDs en prototipo
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

### ♿ 4.3 Accesibilidad (WCAG 2.1)

```html
<!-- Botones: siempre con aria-label si solo tienen ícono -->
<button aria-label="Cerrar modal" class="modal-close">✕</button>

<!-- Formularios: labels explícitas asociadas -->
<label for="res-responsible">Responsable <span aria-hidden="true">*</span></label>
<input id="res-responsible" type="text" 
       aria-required="true"
       aria-describedby="res-responsible-hint">
<span id="res-responsible-hint" class="hint">
  Nombre de la persona responsable de la reunión
</span>

<!-- Alertas dinámicas: aria-live -->
<div id="overlap-indicator" 
     role="alert"
     aria-live="assertive"
     aria-atomic="true">
</div>

<!-- Calendario: roles ARIA -->
<div role="grid" aria-label="Calendario de Abril 2026">
  <div role="row">
    <div role="columnheader" abbr="Lunes">Lun</div>
    <!-- ... -->
  </div>
  <div role="row">
    <div role="gridcell" 
         aria-label="15 de abril" 
         aria-selected="false"
         tabindex="0">15</div>
  </div>
</div>

<!-- Modales: focus trap -->
<!-- Al abrir modal: mover focus al primer elemento interactivo -->
<!-- Al cerrar: regresar focus al elemento que abrió el modal -->
<!-- Escape siempre cierra el modal -->
```

```javascript
// Focus trap en modal
function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];
  
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    if (e.key === 'Escape') closeModal(modal);
  });
  
  first.focus();
}
```

### ⚡ 4.4 Performance

```javascript
// Debounce para búsqueda en tiempo real
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Uso en búsqueda (HU-26: responder < 2 segundos para 1000 reservaciones)
const debouncedSearch = debounce((query) => {
  const results = Search.query({ text: query });
  renderSearchResults(results);
}, 200);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// Lazy loading de reservaciones en historial
// Mostrar 20 a la vez, cargar más al hacer scroll
function loadMoreReservations(page) {
  const PAGE_SIZE = 20;
  const all = Reservations.getAll();
  return all.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
}

// Throttle para eventos de scroll
function throttle(fn, delay = 100) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}
```

---

## ════════════════════════════════════════════════════════
## SECCIÓN 5: TESTING
## ════════════════════════════════════════════════════════

### 🧪 5.1 Casos de Prueba Manuales

#### Módulo: Autenticación

| # | Caso de prueba | Pasos | Resultado esperado |
|---|----------------|-------|---------------------|
| A01 | Login secretaria válido | Email: julieta.esquinca@ibero.mx / Pass: Admin123! | Redirige a dashboard con botones create/edit visibles |
| A02 | Login académico válido | Email: miguel.alvarez@ibero.mx / Pass: Acad456! | Redirige a calendario modo lectura, sin botones admin |
| A03 | Credenciales inválidas | Email correcto, password incorrecto | Mensaje "Credenciales inválidas" sin revelar cuál campo |
| A04 | Timeout de sesión | Iniciar sesión, esperar 31 minutos (simular) | Redirige a login con mensaje de sesión expirada |
| A05 | Acceso URL directa sin login | Navegar a dashboard.html sin sesión | Redirige a login |
| A06 | Acceso URL admin como académico | Loguearse como académico, ir a admin.html via URL | Redirige a calendar.html |
| A07 | Logout | Botón "Cerrar sesión" | Limpia sesión, redirige a login, back button no funciona |

#### Módulo: Calendario

| # | Caso de prueba | Pasos | Resultado esperado |
|---|----------------|-------|---------------------|
| C01 | Navegar meses | Click flechas anterior/siguiente 12 veces | Navega sin restricción semestral |
| C02 | Día festivo no seleccionable | Click en 1 de Mayo (Día del Trabajo) | No abre formulario, muestra tooltip del festivo |
| C03 | Slot disponible abre formulario | Click en día laboral libre | Modal de nueva reservación con fecha prellenada |
| C04 | Bloque ocupado muestra info | Click en bloque rojo existente | Popup con responsable, área, horario |
| C05 | Actualización en tiempo real | Crear reservación, observar calendario | Bloque aparece inmediatamente sin recargar |
| C06 | Vista semanal | Toggle a vista semana | Grid de 7 días con horas visibles |

#### Módulo: Reservaciones

| # | Caso de prueba | Pasos | Resultado esperado |
|---|----------------|-------|---------------------|
| R01 | Crear reservación válida | Llenar formulario completo sin conflicto | Reservación aparece en calendario |
| R02 | Detectar traslape exacto | Crear reservación 10:00-12:00, luego intentar 10:00-12:00 misma fecha | Alerta roja inmediata antes de completar |
| R03 | Detectar traslape parcial | Reserva 10:00-12:00 existe, intentar 11:00-13:00 | Alerta: "Traslape con Dr. X (10:00-12:00)" |
| R04 | Prellenado de fecha/hora | Click en slot 15/Abr 10:00 | Modal muestra fecha: 15 Abr 2026, inicio: 10:00 |
| R05 | Campo responsable texto libre | Escribir nombre nuevo "Lic. García" | Se acepta y se guarda en historial |
| R06 | Autocompletado responsable | Escribir "Dr." | Dropdown muestra "Dr. Miguel Ángel Álvarez" y otros |
| R07 | Observaciones opcionales | Guardar sin campo observaciones | Reservación creada exitosamente |
| R08 | Cancelar reservación | Click editar → Cancelar → Confirmar | Slot libre en calendario, registro en historial |
| R09 | Eliminación masiva (3) | Seleccionar 3, click eliminar, confirmar | 3 reservaciones eliminadas, calendario actualizado |
| R10 | Recurrencia semanal 4 semanas | Crear con toggle recurrente, semanal, 4 ocurrencias | 4 bloques en calendario con ícono de repetición |
| R11 | Recurrencia salta festivo | Recurrente cae en festivo | Esa instancia omitida, alerta con fechas omitidas |
| R12 | Editar no traslapa consigo mismo | Editar reservación existente sin cambiar hora | Validación pasa (excluye ID propio) |

#### Módulo: Búsqueda y Exportación

| # | Caso de prueba | Pasos | Resultado esperado |
|---|----------------|-------|---------------------|
| B01 | Búsqueda con acentos | Buscar "garcia" | Encuentra "García" |
| B02 | Búsqueda case insensitive | Buscar "RAMIREZ" | Encuentra "Ramírez" |
| B03 | Filtro por estado | Filtrar "canceladas" | Solo muestra canceladas |
| B04 | Exportar PDF vacío | Exportar rango sin reservaciones | Mensaje "No hay reservaciones en el período" |
| B05 | Exportar PDF con datos | Exportar con 5 reservaciones | PDF descargado con tabla correcta |

### ✅ 5.2 Checklist de Validación Pre-Entrega

**UI/UX:**
- [ ] Responsive funciona en 320px (móvil)
- [ ] Responsive funciona en 768px (tablet)
- [ ] Responsive funciona en 1200px (desktop)
- [ ] Color primario #ef3e42 en todos los botones principales
- [ ] Logo Ibero visible en header/sidebar
- [ ] No hay scroll horizontal en ningún breakpoint

**Funcionalidad Core:**
- [ ] Login Secretaria → redirige a Dashboard con acceso completo
- [ ] Login Académico → redirige a Calendario modo solo lectura
- [ ] Calendario navega 12+ meses sin restricción
- [ ] Días festivos marcados y no clickeables
- [ ] Click en slot disponible → modal con fecha/hora prellenada
- [ ] Traslape detectado en tiempo real (< 500ms)
- [ ] Reservación creada aparece inmediatamente en calendario
- [ ] Cancelar reservación libera el slot inmediatamente
- [ ] Eliminación masiva funciona con múltiple selección

**Accesibilidad:**
- [ ] Navegación completa solo con teclado
- [ ] Modales tienen focus trap
- [ ] Escape cierra cualquier modal
- [ ] Alertas dinámicas son anunciadas por lectores de pantalla
- [ ] Contraste de colores cumple WCAG AA (4.5:1)

---

## ════════════════════════════════════════════════════════
## SECCIÓN 6: DESPLIEGUE
## ════════════════════════════════════════════════════════

### 📋 6.1 Pre-Despliegue Checklist

```bash
# Verificar antes de desplegar:
□ Todos los console.log de debug eliminados
□ Datos sensibles no están en código fuente (API keys, passwords)
□ mock-data.js NO incluido en producción (usar API real)
□ HTML válido (validar con W3C)
□ CSS sin errores de sintaxis
□ JS sin errores en consola del navegador
□ Imágenes optimizadas (< 100KB cada una)
□ Favicon presente
□ meta description y title en cada HTML
□ Open Graph tags para compartir
```

### 🌐 6.2 Instrucciones para Vercel

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. En el directorio del proyecto
vercel login

# 3. Primer despliegue
vercel

# 4. Configurar dominio personalizado (opcional)
vercel domains add sala-juntas.ibero.mx

# 5. Despliegue de producción
vercel --prod

# vercel.json (en la raíz)
# {
#   "rewrites": [
#     { "source": "/(.*)", "destination": "/index.html" }
#   ]
# }
```

### 📄 6.3 Instrucciones para GitHub Pages

```bash
# 1. Crear repositorio en GitHub
# 2. Push del código

git init
git add .
git commit -m "feat: prototipo inicial sala juntas"
git remote add origin https://github.com/[usuario]/sala-juntas-ibero.git
git push -u origin main

# 3. En GitHub: Settings → Pages → Source: Deploy from branch
# Branch: main, Folder: / (root)

# 4. URL resultante:
# https://[usuario].github.io/sala-juntas-ibero/
```

### 🖥️ 6.4 Instrucciones para Servidor Propio

```bash
# Opción 1: NGINX (recomendado)
# /etc/nginx/sites-available/sala-juntas
server {
    listen 80;
    server_name sala-juntas.ibero.mx;
    root /var/www/sala-juntas;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache de assets
    location ~* \.(css|js|png|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Opción 2: Servidor local para desarrollo
# Nunca usar file:// (falla con módulos JS)
npx serve .           # Instala serve temporalmente
# o
python3 -m http.server 8000
# o
npx live-server       # Con auto-reload
```

---

*Fin de TECHNICAL-NOTES.md*
*Versión 1.0 — Ibero CDMX — Ing. de Software 2026*
