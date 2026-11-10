/* ==========================================================================
   Madero Automotores · Control Integral de Marketing
   Utilidades UI: Escape Seguro, Badges Oficiales, Modales, Toasts y Blueprint
   ========================================================================== */

window.MaderoUI = (function () {
  function esc(val) {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function estadoBadge(estadoId, useShort = false) {
    const cat = window.MaderoData.ESTADOS_SEGUIMIENTO[estadoId] || {
      label: estadoId || 'Sin estado',
      shortLabel: estadoId || 'Sin estado',
      badge: 'badge-stone',
      dot: 'bg-stone-500',
      uso: ''
    };
    const text = useShort ? cat.shortLabel : cat.label;
    return `<span class="badge-pill ${cat.badge}" title="${esc(cat.uso)}"><span class="w-1.5 h-1.5 rounded-full ${cat.dot}"></span>${esc(text)}</span>`;
  }

  function actorBadge(actorId, useShort = true) {
    const cat = window.MaderoData.ACTORES[actorId] || {
      label: actorId || 'Sin asignar',
      shortLabel: actorId || 'Sin asignar',
      badge: 'badge-stone'
    };
    const text = useShort ? cat.shortLabel : cat.label;
    return `<span class="badge-pill ${cat.badge}" title="${esc(cat.label)}">${esc(text)}</span>`;
  }

  function prioridadBadge(prioId) {
    const cat = window.MaderoData.PRIORIDADES[prioId] || { label: prioId || 'Media', badge: 'badge-stone' };
    return `<span class="badge-pill ${cat.badge}">${esc(cat.label)}</span>`;
  }

  function posicionBadge(posId) {
    const cat = (window.MaderoData.POSICIONES_MADERO && window.MaderoData.POSICIONES_MADERO[posId]) || {
      label: posId || 'Conforme',
      badge: 'badge-stone'
    };
    return `<span class="badge-pill ${cat.badge}">${esc(cat.label)}</span>`;
  }

  function minutaBadge(compromiso) {
    if (!compromiso) return '';
    if (compromiso.minuta_formalizada && !compromiso.minuta_requiere_correccion) {
      return `<span class="badge-pill badge-emerald" title="Minuta formalizada y archivada"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Minuta OK</span>`;
    }
    const posReq = (window.MaderoData && window.MaderoData.POSICIONES_REQUIEREN_MINUTA) || ['OBSERVADO', 'RECHAZADO', 'REQUIERE_AJUSTE'];
    const pos = compromiso.posicion_madero_tipo || compromiso.posicion_madero;
    if (posReq.includes(pos) || compromiso.minuta_requiere_correccion) {
      return `<span class="badge-pill badge-red font-bold" title="Sección 8: Requiere minuta formalizada obligatoria por desvío u observación"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Minuta Pendiente</span>`;
    }
    return `<span class="badge-pill badge-stone text-[10px] text-stone-500" title="Posición conforme no exige minuta extraordinaria">No obligatoria</span>`;
  }

  function semaforoBadge(sem) {
    if (sem === 'VERDE') return '<span class="badge-pill badge-emerald"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>En Control</span>';
    if (sem === 'ROJO') return '<span class="badge-pill badge-red font-bold"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Crítico / Exigencia</span>';
    return '<span class="badge-pill badge-amber"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Seguimiento Activo</span>';
  }

  function formatDateDisplay(isoDate) {
    if (!isoDate) return '—';
    const parts = String(isoDate).split('-');
    if (parts.length !== 3) return esc(isoDate);
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // ------------------------------------------------------------------------
  // SISTEMA DE MODALES GLASSMORPHIC
  // ------------------------------------------------------------------------
  function openModal({ title, subtitle = '', maxWidth = 'max-w-2xl', bodyHtml = '', footerHtml = '' }) {
    const root = document.getElementById('global-modal-root');
    if (!root) return;

    root.innerHTML = `
      <div class="fixed inset-0 bg-stone-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto" onclick="if(event.target === this) MaderoUI.closeModal()">
        <div class="glass-card ${maxWidth} w-full bg-white/95 p-5 sm:p-6 my-auto modal-animate max-h-[92vh] flex flex-col">
          <div class="flex items-start justify-between gap-3 pb-3.5 mb-4 border-b border-stone-200/80 shrink-0">
            <div>
              <h3 class="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">${esc(title)}</h3>
              ${subtitle ? `<p class="text-[11px] sm:text-xs text-stone-500 mt-0.5">${esc(subtitle)}</p>` : ''}
            </div>
            <button type="button" onclick="MaderoUI.closeModal()" class="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center font-mono text-sm transition shrink-0">&times;</button>
          </div>
          <div class="overflow-y-auto pr-1 space-y-4 text-xs text-stone-700 flex-1">
            ${bodyHtml}
          </div>
          ${footerHtml ? `<div class="pt-4 mt-4 border-t border-stone-200/80 flex flex-wrap items-center justify-end gap-2 shrink-0">${footerHtml}</div>` : ''}
        </div>
      </div>
    `;
    root.classList.remove('hidden');
  }

  function closeModal() {
    const root = document.getElementById('global-modal-root');
    if (!root) return;
    root.classList.add('hidden');
    root.innerHTML = '';
  }

  // Escape key closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // ------------------------------------------------------------------------
  // TOAST FEEDBACK SUTIL
  // ------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(message, tone = 'emerald') {
    const el = document.getElementById('global-toast');
    if (!el) return;
    const tones = {
      emerald: 'bg-stone-900 text-white border-emerald-500/40',
      amber: 'bg-amber-950 text-amber-50 border-amber-400/40',
      red: 'bg-rose-950 text-rose-50 border-rose-400/40'
    };
    el.className = `fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl border shadow-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${tones[tone] || tones.emerald}`;
    el.innerHTML = `<span class="w-2 h-2 rounded-full ${tone === 'red' ? 'bg-rose-400' : tone === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'}"></span><span>${esc(message)}</span>`;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.add('hidden');
    }, 3000);
  }

  // ------------------------------------------------------------------------
  // MODAL: GUÍA DE LOS 9 ESTADOS OFICIALES (Sección 7 del Documento)
  // ------------------------------------------------------------------------
  function openEstadosGuideModal() {
    const rows = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st => `
      <div class="p-3 rounded-xl bg-stone-50/90 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>${estadoBadge(st.id, false)}</div>
        <p class="text-xs text-stone-600 sm:text-right max-w-md">${esc(st.uso)}</p>
      </div>
    `).join('');

    openModal({
      title: 'Circuito Oficial de 9 Estados de Seguimiento',
      subtitle: 'Sección 7 · Los estados describen el momento objetivo del trabajo; no califican personalmente.',
      maxWidth: 'max-w-2xl',
      bodyHtml: `<div class="space-y-2">${rows}</div>`,
      footerHtml: `<button type="button" onclick="MaderoUI.closeModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800">Entendido</button>`
    });
  }

  // ------------------------------------------------------------------------
  // MODAL: CENTRO DE DATOS, CORTE SEMANAL Y RESPALDO JSON
  // ------------------------------------------------------------------------
  function openDataCenterModal() {
    const meta = window.MaderoStore.getState().meta;
    openModal({
      title: 'Configuración de Corte Semanal & Respaldo de Datos',
      subtitle: 'Persistencia local activa (LocalStorage) · Exportación e importación de instantáneas para Dirección.',
      maxWidth: 'max-w-xl',
      bodyHtml: `
        <form id="form-meta-config" class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Período / Semana Activa</label>
              <input type="text" id="cfg-semana" value="${esc(meta.semana_activa)}" class="input-glass w-full px-3 py-2" required>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha de Corte</label>
              <input type="date" id="cfg-fecha-corte" value="${esc(meta.fecha_corte)}" class="input-glass w-full px-3 py-2" required>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Responsable de Conducción</label>
              <input type="text" id="cfg-lider" value="${esc(meta.lider)}" class="input-glass w-full px-3 py-2" required>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Semáforo Global del Área</label>
              <select id="cfg-semaforo" class="input-glass w-full px-3 py-2">
                <option value="VERDE" ${meta.semaforo_area === 'VERDE' ? 'selected' : ''}>Verde · Operación en Control</option>
                <option value="AMBAR" ${meta.semaforo_area === 'AMBAR' ? 'selected' : ''}>Ámbar · Seguimiento Activo / Ajustes</option>
                <option value="ROJO" ${meta.semaforo_area === 'ROJO' ? 'selected' : ''}>Rojo · Desvíos Críticos Escalados</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Lectura General del Líder (Encabezado de Informe a Dirección)</label>
            <textarea id="cfg-resumen" rows="4" class="input-glass w-full px-3 py-2 leading-relaxed">${esc(meta.resumen_ejecutivo_lider)}</textarea>
          </div>
        </form>

        <div class="p-3.5 rounded-2xl bg-stone-100/90 border border-stone-200 space-y-2.5 mt-2">
          <div class="font-bold text-stone-900 text-xs">Portabilidad y Continuidad Documental (Sección 2 y 9)</div>
          <p class="text-[11px] text-stone-600 leading-relaxed">
            Descargá un respaldo <code>.json</code> para archivar en la carpeta semanal de Drive o restaurar datos en cualquier equipo.
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="MaderoStore.exportJSONBackup(); MaderoUI.showToast('Respaldo JSON descargado')" class="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 font-semibold text-xs hover:bg-stone-50">
              ⬇ Descargar Respaldo JSON
            </button>
            <label class="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 font-semibold text-xs hover:bg-stone-50 cursor-pointer">
              ⬆ Importar JSON
              <input type="file" accept=".json" class="hidden" onchange="MaderoApp.handleImportJSON(event)">
            </label>
            <button type="button" onclick="MaderoApp.handleResetBaseline()" class="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs hover:bg-rose-100 ml-auto">
              Restaurar Línea Base
            </button>
          </div>
        </div>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoApp.saveMetaFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">Guardar Configuración</button>
      `
    });
  }

  // ------------------------------------------------------------------------
  // VISTA DE ARQUITECTURA PROGRAMADA (Para Módulos de Pasos 2 al 5 durante Paso 1)
  // ------------------------------------------------------------------------
  function renderUpcomingModuleBlueprint(moduloObj) {
    if (!moduloObj) return '';
    const camposHtml = (moduloObj.camposClave || []).map(c => `
      <div class="p-2.5 rounded-xl bg-white/80 border border-stone-200/80 flex items-center gap-2 text-xs text-stone-800 font-medium">
        <span class="w-1.5 h-1.5 rounded-full bg-stone-800 shrink-0"></span>
        <span>${esc(c)}</span>
      </div>
    `).join('');

    return `
      <div class="glass-card p-5 sm:p-7 space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
          <div>
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="badge-pill badge-dark font-mono">Módulo ${moduloObj.num} de 12</span>
              <span class="badge-pill badge-amber font-semibold">Programado en Paso ${moduloObj.paso} del Plan</span>
              ${actorBadge(moduloObj.actorDominante, false)}
            </div>
            <h2 class="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">${esc(moduloObj.nombre)}</h2>
            <p class="text-xs text-stone-600 mt-1">Exigencia literal de Dirección (Sección 5): <strong>"${esc(moduloObj.alcanceDireccion)}"</strong></p>
          </div>
          <button type="button" onclick="MaderoApp.navigateModule('m1-agenda')" class="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition shrink-0 self-start sm:self-auto">
            ← Volver a Paso 1 Activo
          </button>
        </div>

        <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
          <strong>Desarrollo Incremental Paso a Paso:</strong> Están activos el <strong>Paso 1 (Agenda y Equipo Interno)</strong> y el <strong>Paso 2 (Módulo 9 Proveedores)</strong>. Debajo podés verificar la estructura exacta de campos que implementaremos para <strong>${esc(moduloObj.nombre)}</strong> en el <strong>Paso ${moduloObj.paso}</strong>.
        </div>

        <div>
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-stone-600 mb-3">Estructura de Campos y Controles Previstos para este Módulo:</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            ${camposHtml}
          </div>
        </div>
      </div>
    `;
  }

  return {
    esc,
    estadoBadge,
    actorBadge,
    prioridadBadge,
    posicionBadge,
    minutaBadge,
    semaforoBadge,
    formatDateDisplay,
    openModal,
    closeModal,
    showToast,
    openEstadosGuideModal,
    openDataCenterModal,
    renderUpcomingModuleBlueprint
  };
})();

