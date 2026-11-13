/* ==========================================================================
   Madero Automotores · Control Integral de Marketing
   Módulo 3: Reporte Semanal de Fotografías, Digitalización y Consistencia de Stock
   (Sección 5.3 y Sección 6 de los Lineamientos de Dirección)
   ========================================================================== */

window.MaderoFotografias = (function () {
  let searchQuery = '';
  let sucursalFilter = 'ALL';
  let estadoFilter = 'ALL';
  let canalFaltanteFilter = 'ALL'; // 'ALL' | 'DRIVE' | 'LUCY' | 'WEB' | 'REDES'
  let onlyInconsistencias = false;
  let onlyCalidadObs = false;
  let sortField = 'dias_en_stock';
  let sortAsc = false;

  function esc(s) {
    return window.MaderoUI ? window.MaderoUI.esc(s) : String(s || '');
  }

  function formatMoney(num) {
    if (!num && num !== 0) return '-';
    return '$ ' + Number(num).toLocaleString('es-AR');
  }

  function formatKm(km) {
    if (!km && km !== 0) return '-';
    return Number(km).toLocaleString('es-AR') + ' km';
  }

  // ------------------------------------------------------------------------
  // FILTROS Y MUTADORES DE ESTADO LOCAL DEL MÓDULO
  // ------------------------------------------------------------------------
  function setSearch(val) {
    searchQuery = val;
    window.MaderoApp.renderAll();
  }

  function setSucursalFilter(suc) {
    sucursalFilter = suc;
    window.MaderoApp.renderAll();
  }

  function setEstadoFilter(st) {
    estadoFilter = st;
    window.MaderoApp.renderAll();
  }

  function setCanalFaltanteFilter(canal) {
    canalFaltanteFilter = canal;
    window.MaderoApp.renderAll();
  }

  function toggleOnlyInconsistencias() {
    onlyInconsistencias = !onlyInconsistencias;
    window.MaderoApp.renderAll();
  }

  function toggleOnlyCalidadObs() {
    onlyCalidadObs = !onlyCalidadObs;
    window.MaderoApp.renderAll();
  }

  function setSort(field) {
    if (sortField === field) {
      sortAsc = !sortAsc;
    } else {
      sortField = field;
      sortAsc = true;
    }
    window.MaderoApp.renderAll();
  }

  function resetFilters() {
    searchQuery = '';
    sucursalFilter = 'ALL';
    estadoFilter = 'ALL';
    canalFaltanteFilter = 'ALL';
    onlyInconsistencias = false;
    onlyCalidadObs = false;
    sortField = 'dias_en_stock';
    sortAsc = false;
    window.MaderoApp.renderAll();
  }

  // Atajos desde las 8 tarjetas ejecutivas de la Sección 6
  function focusFilter(type) {
    resetFilters();
    if (type === 'listos') {
      estadoFilter = 'LISTO_PARA_FOTOGRAFIAR';
    } else if (type === 'pendientes_coord') {
      estadoFilter = 'PENDIENTE_COORDINACION';
    } else if (type === 'pendientes_carga') {
      estadoFilter = 'FOTOGRAFIADO_PENDIENTE_CARGA';
    } else if (type === 'incompletos') {
      estadoFilter = 'COBERTURA_INCOMPLETA';
    } else if (type === 'calidad_obs') {
      onlyCalidadObs = true;
    } else if (type === 'inconsistencias') {
      onlyInconsistencias = true;
    } else if (type === 'al_dia') {
      estadoFilter = 'AL_DIA';
    }
    window.MaderoApp.renderAll();
    const tableEl = document.getElementById('tabla-fotografias-container');
    if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ------------------------------------------------------------------------
  // LÓGICA DE FILTRADO Y ORDENAMIENTO
  // ------------------------------------------------------------------------
  function getFilteredUnits() {
    const state = window.MaderoStore.getState();
    const list = state.fotografia_unidades || [];
    const q = searchQuery.trim().toLowerCase();

    return list.filter(u => {
      // Búsqueda en vivo
      if (q) {
        const matchPat = (u.patente || '').toLowerCase().includes(q);
        const matchModel = (u.marca_modelo || '').toLowerCase().includes(q);
        const matchColor = (u.color || '').toLowerCase().includes(q);
        const matchSuc = (u.sucursal || '').toLowerCase().includes(q);
        const matchNotas = (u.notas || '').toLowerCase().includes(q);
        const matchCausa = (u.causa_demora || '').toLowerCase().includes(q);
        const matchIncons = (u.detalle_inconsistencia || '').toLowerCase().includes(q);
        if (!matchPat && !matchModel && !matchColor && !matchSuc && !matchNotas && !matchCausa && !matchIncons) {
          return false;
        }
      }

      // Filtro por Sucursal
      if (sucursalFilter !== 'ALL') {
        if (sucursalFilter === 'TALLERES') {
          if (!u.es_taller && !(u.sucursal || '').toLowerCase().includes('taller') && u.sucursal !== 'Talleres Externos / Movimiento') {
            return false;
          }
        } else if (u.sucursal !== sucursalFilter) {
          return false;
        }
      }

      // Filtro por Estado de Proceso
      if (estadoFilter !== 'ALL') {
        if (estadoFilter === 'PENDIENTE_COORDINACION') {
          const isPendCoord = u.estado_proceso === 'PENDIENTE_COORDINACION' ||
            (Number(u.cantidad_fotos_actual) === 0 && u.estado_proceso !== 'AL_DIA' && u.estado_proceso !== 'LISTO_PARA_FOTOGRAFIAR');
          if (!isPendCoord) return false;
        } else if (u.estado_proceso !== estadoFilter) {
          return false;
        }
      }

      // Filtro por Canal Faltante
      if (canalFaltanteFilter === 'DRIVE' && u.cargado_drive) return false;
      if (canalFaltanteFilter === 'LUCY' && u.cargado_lucy) return false;
      if (canalFaltanteFilter === 'WEB' && u.cargado_web) return false;
      if (canalFaltanteFilter === 'REDES' && u.cargado_redes) return false;

      // Filtro Solo Inconsistencias
      if (onlyInconsistencias && !u.inconsistencia_detectada) return false;

      // Filtro Solo Calidad Observada
      if (onlyCalidadObs && u.calidad_estado !== 'OBSERVADA' && u.estado_proceso !== 'CALIDAD_OBSERVADA') return false;

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  // ------------------------------------------------------------------------
  // BADGES Y COMPONENTES VISUALES
  // ------------------------------------------------------------------------
  function getEstadoProcesoBadge(estado, causa) {
    const mapa = {
      'AL_DIA': { label: 'Al día (100%)', badge: 'badge-emerald', icon: 'ri-checkbox-circle-fill' },
      'LISTO_PARA_FOTOGRAFIAR': { label: 'Listo p/ fotos', badge: 'badge-blue', icon: 'ri-camera-lens-line' },
      'PENDIENTE_COORDINACION': { label: 'Pend. Coordinación', badge: 'badge-purple', icon: 'ri-time-line' },
      'FOTOGRAFIADO_PENDIENTE_CARGA': { label: 'Pendiente Carga', badge: 'badge-orange', icon: 'ri-upload-cloud-2-line' },
      'COBERTURA_INCOMPLETA': { label: 'Set Incompleto', badge: 'badge-amber', icon: 'ri-image-add-line' },
      'CALIDAD_OBSERVADA': { label: 'Calidad Observada', badge: 'badge-red', icon: 'ri-error-warning-fill' }
    };
    const conf = mapa[estado] || { label: estado, badge: 'badge-stone', icon: 'ri-information-line' };
    return `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${conf.badge}" title="${esc(causa || conf.label)}">
        <i class="${conf.icon}"></i>
        <span>${conf.label}</span>
      </span>
    `;
  }

  function getCalidadBadge(calidad, motivo) {
    if (calidad === 'APROBADA') {
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold badge-emerald"><i class="ri-check-line"></i> Aprobada</span>`;
    }
    if (calidad === 'OBSERVADA') {
      return `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold badge-red cursor-pointer" onclick="MaderoFotografias.openObservacionDetail('${esc(motivo)}')" title="${esc(motivo)}">
          <i class="ri-alert-fill"></i> Observada
        </span>
      `;
    }
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold badge-stone">Pend. Revisión</span>`;
  }

  function renderPlataformasBadges(u) {
    const p = (canal, cargado, label) => {
      const activeClass = cargado
        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
        : 'bg-stone-100 text-stone-400 border-stone-200 line-through opacity-70 hover:opacity-100 hover:text-stone-700';
      const icon = cargado ? 'ri-check-line' : 'ri-close-line';
      return `
        <button type="button" onclick="MaderoStore.toggleFotografiaCanal('${u.id}', '${canal}')"
          class="px-2 py-0.5 rounded text-[10px] border transition flex items-center gap-1 ${activeClass}"
          title="${label}: ${cargado ? 'Cargado en plataforma' : 'Pendiente de carga'} (Clic para cambiar)">
          <i class="${icon}"></i>
          <span>${label}</span>
        </button>
      `;
    };

    return `
      <div class="flex flex-wrap gap-1 items-center">
        ${p('Drive', u.cargado_drive, 'Drive')}
        ${p('Lucy', u.cargado_lucy, 'Lucy')}
        ${p('Web', u.cargado_web, 'Web')}
        ${p('Redes', u.cargado_redes, 'Redes')}
      </div>
    `;
  }

  function renderFotosProgressBar(actual, minimo, faltantes) {
    const act = Number(actual) || 0;
    const min = Number(minimo) || 8;
    const pct = Math.min(100, Math.round((act / min) * 100));
    const isComplete = act >= min;
    const barColor = isComplete ? 'bg-emerald-500' : (act > 0 ? 'bg-amber-500' : 'bg-red-400');

    return `
      <div class="min-w-[110px]" title="${esc(faltantes || `${act}/${min} fotos obligatorias`)}">
        <div class="flex items-center justify-between text-[11px] font-mono mb-1">
          <span class="font-bold text-stone-800">${act} <span class="text-stone-400 font-normal">/ ${min} fotos</span></span>
          <span class="text-[10px] font-semibold ${isComplete ? 'text-emerald-700' : 'text-amber-700'}">${pct}%</span>
        </div>
        <div class="w-full bg-stone-200/80 rounded-full h-1.5 overflow-hidden">
          <div class="${barColor} h-1.5 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
        </div>
        ${faltantes && !isComplete ? `<p class="text-[10px] text-amber-800 line-clamp-1 mt-0.5" title="${esc(faltantes)}">${esc(faltantes)}</p>` : ''}
      </div>
    `;
  }

  // ------------------------------------------------------------------------
  // RENDERIZADO PRINCIPAL DEL MÓDULO
  // ------------------------------------------------------------------------
  function renderModule() {
    const summary = window.MaderoStore.getComputedSummary();
    const meta = summary.fotosMeta || {};
    const ev = summary.fotosEvolucion || {};
    const filtered = getFilteredUnits();

    return `
      <div class="space-y-6">

        <!-- HEADER DEL MÓDULO 3 -->
        <div class="glass-card p-6 border-b border-stone-200/70">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Módulo 3 · Paso 3 Activo</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Sección 6 Cumplida</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-300">Lucy DMS Sync</span>
              </div>
              <h2 class="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
                <i class="ri-camera-3-line text-emerald-600"></i>
                Fotografías, Digitalización y Consistencia de Stock
              </h2>
              <p class="text-sm text-stone-600 mt-1 max-w-3xl">
                Control semanal obligatorio de cobertura real por unidad, sincronización de plataformas (Drive, Lucy DMS, Web y Redes) y auditoría de calidad visual institucional de Madero Automotores.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button type="button" onclick="MaderoFotografias.openCreateModal()" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-md transition flex items-center gap-1.5">
                <i class="ri-add-line text-sm"></i>
                <span>Nueva Unidad</span>
              </button>
              <button type="button" onclick="MaderoFotografias.openSyncLucyModal()" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/90 hover:bg-white text-stone-800 border border-stone-300 shadow-sm transition flex items-center gap-1.5">
                <i class="ri-refresh-line text-sm text-emerald-600"></i>
                <span>Sincronizar Lucy DMS</span>
              </button>
              <button type="button" onclick="MaderoFotografias.openEstandarModal()" class="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-sm transition flex items-center gap-1.5">
                <i class="ri-award-line text-sm text-amber-600"></i>
                <span>Estándar Calidad</span>
              </button>
              <button type="button" onclick="MaderoStore.exportFotografiaCSV()" class="px-3 py-2 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-stone-700 border border-stone-300 shadow-sm transition flex items-center gap-1.5">
                <i class="ri-file-excel-2-line text-sm text-emerald-700"></i>
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>

        <!-- EMBUDO EJECUTIVO: LOS 8 DATOS SEMANALES ESTABLES DE SECCIÓN 6 -->
        <div>
          <div class="flex items-center justify-between mb-3 px-1">
            <h3 class="text-sm font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <i class="ri-dashboard-3-line text-emerald-600"></i>
              Los 8 Datos Semanales Estables de Dirección (Sección 6)
            </h3>
            <span class="text-xs text-stone-500 font-mono">Línea de base: 163 unidades · Corte: ${esc(meta.fecha_corte || '2026-11-06')}</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            
            <!-- 1. Universo Controlado -->
            <div onclick="MaderoFotografias.resetFilters()" class="glass-card p-3 rounded-2xl border cursor-pointer hover:border-stone-400 transition group ${estadoFilter === 'ALL' && !onlyInconsistencias && !onlyCalidadObs ? 'ring-2 ring-stone-800' : ''}">
              <div class="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                <span>1. Universo</span>
                <i class="ri-car-line text-stone-400 group-hover:text-stone-800"></i>
              </div>
              <div class="mt-1 flex items-baseline gap-1">
                <span class="text-xl font-extrabold text-stone-900 font-mono">${summary.universoControladoTotal}</span>
                <span class="text-[10px] text-stone-500 font-mono">unid.</span>
              </div>
              <p class="text-[10px] text-stone-600 mt-0.5 line-clamp-1">
                <strong>${summary.conFotoLucyTotal}</strong> con foto (<strong class="text-emerald-700">${summary.coberturaGeneralLucyPct}%</strong>)
              </p>
            </div>

            <!-- 2. Listos para Fotografiar -->
            <div onclick="MaderoFotografias.focusFilter('listos')" class="glass-card p-3 rounded-2xl border cursor-pointer hover:border-blue-400 transition group ${estadoFilter === 'LISTO_PARA_FOTOGRAFIAR' ? 'ring-2 ring-blue-600 bg-blue-50/50' : ''}">
              <div class="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center justify-between">
                <span>2. Listos</span>
                <i class="ri-camera-lens-line text-blue-500"></i>
              </div>
              <div class="mt-1 flex items-baseline gap-1">
                <span class="text-xl font-extrabold text-blue-900 font-mono">${summary.fotosListosParaFotografiarCount}</span>
                <span class="text-[10px] text-blue-600 font-mono">preparados</span>
              </div>
              <p class="text-[10px] text-stone-600 mt-0.5 line-clamp-1">En salón/playón listos</p>
            </div>

            <!-- 3. Pendientes de Coordinación -->
            <div onclick="MaderoFotografias.focusFilter('pendientes_coord')" class="glass-card p-3 rounded-2xl border cursor-pointer hover:border-purple-400 transition group ${estadoFilter === 'PENDIENTE_COORDINACION' ? 'ring-2 ring-purple-600 bg-purple-50/50' : ''}">
              <div class="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center justify-between">
                <span>3. Pend. Coord.</span>
                <i class="ri-calendar-event-line text-purple-500"></i>
              </div>
              <div class="mt-1 flex items-baseline gap-1">
                <span class="text-xl font-extrabold text-purple-900 font-mono">${summary.fotosPendientesCoordinacionCount}</span>
                <span class="text-[10px] text-purple-600 font-mono">bloqueos</span>
              </div>
              <p class="text-[10px] text-stone-600 mt-0.5 line-clamp-1">Con causa y próx. acción</p>
            </div>

            <!-- 4. Fotografiados Pendientes de Carga -->
            <div onclick="MaderoFotografias.focusFilter('pendientes_carga')" class="glass-card p-3 rounded-2xl border cursor-pointer hover:border-orange-400 transition group ${estadoFilter === 'FOTOGRAFIADO_PENDIENTE_CARGA' ? 'ring-2 ring-orange-600 bg-orange-50/50' : ''}">
              <div class="text-[10px] font-bold text-orange-700 uppercase tracking-wider flex items-center justify-between">
                <span>4. Pend. Carga</span>
                <i class="ri-upload-cloud-2-line text-orange-500"></i>
              </div>
              <div class="mt-1 flex items-baseline gap-1">
                <span class="text-xl font-extrabold text-orange-900 font-mono">${summary.fotosPendientesCargaCount}</span>
                <span class="text-[10px] text-orange-600 font-mono">producidos</span>
              </div>
              <p class="text-[10px] text-stone-600 mt-0.5 line-clamp-1">Falta Drive/Lucy/Web</p>
            </div>

            <!-- 5. Cobertura Incompleta -->
            <div onclick="MaderoFotografias.focusFilter('incompletos')" class="glass-card p-3 rounded-2xl border cursor-pointer hover:border-amber-400 transition group ${estadoFilter === 'COBERTURA_INCOMPLETA' ? 'ring-2 ring-amber-600 bg-amber-50/50' : ''}">
              <div class="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
                <span>5. Incompleto</span>
                <i class="ri-image-add-line text-amber-500"></i>
              </div>
              <div class="mt-1 flex items-baseline gap-1">
                <span class="text-xl font-extrabold text-amber-900 font-mono">${summary.fotosCoberturaIncompletaCount}</span>
                <span class="text-[10px] text-amber-600 font-mono">&lt; 8 tomas</span>
              </div>
              <p class="text-[10px] text-stone-600 mt-0.5 line-clamp-1">Set parcial de fotos</p>
            </div>

            <!-- 6. Calidad Observada -->
            <div onclick="MaderoFotografias.focusFilter('calidad_obs')" class="glass-card p-3 rounded-2xl border cursor-pointer hover:border-red-400 transition group ${onlyCalidadObs ? 'ring-2 ring-red-600 bg-red-50/50' : ''}">
              <div class="text-[10px] font-bold text-red-700 uppercase tracking-wider flex items-center justify-between">
                <span>6. Calidad Obs.</span>
                <i class="ri-error-warning-line text-red-500"></i>
              </div>
              <div class="mt-1 flex items-baseline gap-1">
                <span class="text-xl font-extrabold text-red-700 font-mono">${summary.fotosCalidadObservadaCount}</span>
                <span class="text-[10px] text-red-600 font-mono">desvíos</span>
              </div>
              <p class="text-[10px] text-stone-600 mt-0.5 line-clamp-1">Ventas/Marketing Mkt</p>
            </div>

            <!-- 7. Consistencia Inter-Canales -->
            <div onclick="MaderoFotografias.focusFilter('inconsistencias')" class="glass-card p-3 rounded-2xl border cursor-pointer hover:border-red-400 transition group ${onlyInconsistencias ? 'ring-2 ring-red-600 bg-red-50/50 animate-pulse' : ''}">
              <div class="text-[10px] font-bold text-red-800 uppercase tracking-wider flex items-center justify-between">
                <span>7. Consistencia</span>
                <i class="ri-shuffle-line text-red-600"></i>
              </div>
              <div class="mt-1 flex items-baseline gap-1">
                <span class="text-xl font-extrabold text-red-800 font-mono">${summary.fotosInconsistenciasCanalesCount}</span>
                <span class="text-[10px] text-red-600 font-mono">cruces</span>
              </div>
              <p class="text-[10px] text-stone-600 mt-0.5 line-clamp-1">Lucy vs Web vs Salón</p>
            </div>

            <!-- 8. Evolución Semanal -->
            <div onclick="MaderoFotografias.openEvolucionModal()" class="glass-card p-3 rounded-2xl border cursor-pointer hover:border-emerald-400 transition group">
              <div class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                <span>8. Evolución</span>
                <i class="ri-line-chart-line text-emerald-600"></i>
              </div>
              <div class="mt-1 flex items-baseline gap-1">
                <span class="text-xl font-extrabold text-emerald-700 font-mono">+${ev.regularizadas_semana || 14}</span>
                <span class="text-[10px] text-emerald-600 font-mono">regul.</span>
              </div>
              <p class="text-[10px] text-stone-600 mt-0.5 line-clamp-1">Saldo: ${ev.pendientes_actuales || 31} pend.</p>
            </div>

          </div>
        </div>

        <!-- PANEL DE COBERTURA POR SUCURSAL REAL MADERO (ESTILO ALISTAMIENTO) -->
        <div class="glass-card p-5 rounded-2xl border border-stone-200/80">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 class="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <i class="ri-store-2-line text-emerald-600"></i>
                Cobertura Fotográfica por Sucursal y Talleres Externos (163 Unidades)
              </h3>
              <p class="text-xs text-stone-500 mt-0.5">
                Datos cruzados contra el tablero oficial de Alistamiento Madero y Lucy DMS. Hacé clic en cualquier sucursal para filtrar la tabla.
              </p>
            </div>
            ${sucursalFilter !== 'ALL' ? `
              <button type="button" onclick="MaderoFotografias.setSucursalFilter('ALL')" class="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition flex items-center gap-1">
                <i class="ri-filter-off-line"></i> Quitar filtro sucursal (${esc(sucursalFilter)})
              </button>
            ` : ''}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${summary.desgloseSucursales.map(suc => {
              const isSelected = sucursalFilter === suc.nombre || (suc.es_taller && sucursalFilter === 'TALLERES');
              const filterTarget = suc.es_taller ? 'TALLERES' : suc.nombre;
              const barColor = suc.pct_oficial === 100
                ? 'bg-emerald-500'
                : (suc.pct_oficial >= 60 ? 'bg-emerald-600' : (suc.pct_oficial >= 40 ? 'bg-amber-500' : 'bg-red-500'));
              const badgeClass = suc.pct_oficial === 100
                ? 'badge-emerald'
                : (suc.pct_oficial >= 60 ? 'badge-sky' : (suc.pct_oficial >= 40 ? 'badge-amber' : 'badge-red'));

              return `
                <div onclick="MaderoFotografias.setSucursalFilter('${esc(filterTarget)}')"
                  class="p-3 rounded-xl border transition cursor-pointer ${isSelected ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white/80 hover:bg-white border-stone-200/90 hover:border-stone-400'}">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xs font-bold truncate max-w-[170px]" title="${esc(suc.nombre)}">${esc(suc.nombre)}</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : badgeClass}">${suc.pct_oficial}%</span>
                  </div>
                  <div class="flex items-center justify-between text-[11px] font-mono mb-1.5 ${isSelected ? 'text-stone-300' : 'text-stone-600'}">
                    <span>${suc.con_foto} con foto / ${suc.total_stock} stock</span>
                    <span class="${suc.sin_foto === 0 ? (isSelected ? 'text-emerald-300' : 'text-emerald-700 font-bold') : (isSelected ? 'text-red-300' : 'text-red-600 font-bold')}">
                      ${suc.sin_foto === 0 ? '100% al día' : `Faltan ${suc.sin_foto}`}
                    </span>
                  </div>
                  <div class="w-full ${isSelected ? 'bg-stone-700' : 'bg-stone-200'} rounded-full h-1.5 overflow-hidden">
                    <div class="${barColor} h-1.5 rounded-full" style="width: ${suc.pct_oficial}%"></div>
                  </div>
                  <div class="mt-2 flex items-center justify-between text-[10px] ${isSelected ? 'text-stone-400' : 'text-stone-500'}">
                    <span>${esc(suc.ciudad)}</span>
                    <span class="font-mono">Muestra auditada: ${suc.muestra_total} un.</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ESTÁNDAR VISUAL DE CALIDAD FOTOGRÁFICA DE MADERO (SECCIÓN 6) -->
        <div class="glass-card p-4 rounded-2xl border border-amber-200/80 bg-amber-50/40">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                <i class="ri-award-fill text-lg"></i>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-bold text-amber-950 uppercase tracking-wider">Criterio Institucional Oficial · Ángelo Lucero (Líder de Marketing)</h4>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">Mínimo 8 Tomas Requeridas</span>
                </div>
                <p class="text-xs text-amber-900 mt-1 leading-relaxed">
                  "${esc(meta.estandar_calidad_texto || 'Mínimo 8 tomas estándar: Frente 3/4, Lateral, Trasera 3/4, Llanta, Puesto de conducción, Tablero encendido con kilometraje, Plazas traseras, Vano motor y baúl. Sin reflejos, con tapapatente centrado.')}"
                </p>
                <div class="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-amber-800 font-mono">
                  <span><i class="ri-check-line text-emerald-600 font-bold"></i> Formato 4:3 / 16:9</span>
                  <span><i class="ri-check-line text-emerald-600 font-bold"></i> Odómetro encendido</span>
                  <span><i class="ri-check-line text-emerald-600 font-bold"></i> Tapapatente Madero</span>
                  <span><i class="ri-close-line text-red-600 font-bold"></i> Prohibido personas o reflejos en cuadro</span>
                </div>
              </div>
            </div>
            <button type="button" onclick="MaderoFotografias.openEstandarModal()" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-sm shrink-0 transition">
              <i class="ri-edit-line"></i> Editar Estándar
            </button>
          </div>
        </div>

        <!-- BARRA DE FILTROS, BÚSQUEDA Y ACCIONES RÁPIDAS -->
        <div class="glass-card p-4 rounded-2xl border border-stone-200/80 space-y-3">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            <!-- Buscador en vivo -->
            <div class="relative flex-1 max-w-lg">
              <i class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
              <input type="text" id="foto-search-input" value="${esc(searchQuery)}" oninput="MaderoFotografias.setSearch(this.value)"
                placeholder="Buscar por patente (AF123CD), marca, modelo, color, causa de demora..."
                class="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white/90 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-800 placeholder-stone-400" />
              ${searchQuery ? `
                <button type="button" onclick="MaderoFotografias.setSearch('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs">
                  <i class="ri-close-circle-fill"></i>
                </button>
              ` : ''}
            </div>

            <!-- Selectores combinados -->
            <div class="flex flex-wrap items-center gap-2">
              
              <!-- Selector Sucursal -->
              <select onchange="MaderoFotografias.setSucursalFilter(this.value)" class="text-xs bg-white border border-stone-300 rounded-xl px-2.5 py-2 font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-800">
                <option value="ALL" ${sucursalFilter === 'ALL' ? 'selected' : ''}>Todas las Sucursales (${summary.fotosUnidadesTotales})</option>
                <option value="AV POLONIA 546" ${sucursalFilter === 'AV POLONIA 546' ? 'selected' : ''}>AV POLONIA 546 (Comodoro)</option>
                <option value="MADERO ALEM 828" ${sucursalFilter === 'MADERO ALEM 828' ? 'selected' : ''}>MADERO ALEM 828 (Comodoro)</option>
                <option value="MADERO MONSEÑOR D'ANDREA 1967" ${sucursalFilter === "MADERO MONSEÑOR D'ANDREA 1967" ? 'selected' : ''}>CAM D'ANDREA 1967 (Comodoro)</option>
                <option value="MADERO NEUQUEN" ${sucursalFilter === 'MADERO NEUQUEN' ? 'selected' : ''}>MADERO NEUQUEN (Neuquén)</option>
                <option value="CORDILLERA VENTA" ${sucursalFilter === 'CORDILLERA VENTA' ? 'selected' : ''}>CORDILLERA VENTA (Esquel)</option>
                <option value="Colon Stock S/garantia" ${sucursalFilter === 'Colon Stock S/garantia' ? 'selected' : ''}>Colon Stock S/garantia</option>
                <option value="TALLERES" ${sucursalFilter === 'TALLERES' ? 'selected' : ''}>Talleres Externos / Movimiento</option>
              </select>

              <!-- Selector Estado Proceso -->
              <select onchange="MaderoFotografias.setEstadoFilter(this.value)" class="text-xs bg-white border border-stone-300 rounded-xl px-2.5 py-2 font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-800">
                <option value="ALL" ${estadoFilter === 'ALL' ? 'selected' : ''}>Todos los Estados</option>
                <option value="AL_DIA" ${estadoFilter === 'AL_DIA' ? 'selected' : ''}>Al día (100%)</option>
                <option value="LISTO_PARA_FOTOGRAFIAR" ${estadoFilter === 'LISTO_PARA_FOTOGRAFIAR' ? 'selected' : ''}>Listos p/ fotografiar</option>
                <option value="PENDIENTE_COORDINACION" ${estadoFilter === 'PENDIENTE_COORDINACION' ? 'selected' : ''}>Pendientes Coordinación</option>
                <option value="FOTOGRAFIADO_PENDIENTE_CARGA" ${estadoFilter === 'FOTOGRAFIADO_PENDIENTE_CARGA' ? 'selected' : ''}>Pendientes de Carga</option>
                <option value="COBERTURA_INCOMPLETA" ${estadoFilter === 'COBERTURA_INCOMPLETA' ? 'selected' : ''}>Cobertura Incompleta (&lt;8 fotos)</option>
                <option value="CALIDAD_OBSERVADA" ${estadoFilter === 'CALIDAD_OBSERVADA' ? 'selected' : ''}>Calidad Observada</option>
              </select>

              <!-- Selector Canal Faltante -->
              <select onchange="MaderoFotografias.setCanalFaltanteFilter(this.value)" class="text-xs bg-white border border-stone-300 rounded-xl px-2.5 py-2 font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-800">
                <option value="ALL" ${canalFaltanteFilter === 'ALL' ? 'selected' : ''}>Falta en canal...</option>
                <option value="DRIVE" ${canalFaltanteFilter === 'DRIVE' ? 'selected' : ''}>Falta en Drive</option>
                <option value="LUCY" ${canalFaltanteFilter === 'LUCY' ? 'selected' : ''}>Falta en Lucy DMS</option>
                <option value="WEB" ${canalFaltanteFilter === 'WEB' ? 'selected' : ''}>Falta en Web Oficial</option>
                <option value="REDES" ${canalFaltanteFilter === 'REDES' ? 'selected' : ''}>Falta en Redes</option>
              </select>

              <!-- Checkbox Solo Inconsistencias -->
              <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition ${onlyInconsistencias ? 'bg-red-50 text-red-800 border-red-300 ring-1 ring-red-400' : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'}">
                <input type="checkbox" ${onlyInconsistencias ? 'checked' : ''} onchange="MaderoFotografias.toggleOnlyInconsistencias()" class="rounded text-red-600 focus:ring-red-500" />
                <span>Solo Inconsistencias (${summary.fotosInconsistenciasCanalesCount})</span>
              </label>

              <!-- Checkbox Solo Calidad Observada -->
              <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition ${onlyCalidadObs ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400' : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'}">
                <input type="checkbox" ${onlyCalidadObs ? 'checked' : ''} onchange="MaderoFotografias.toggleOnlyCalidadObs()" class="rounded text-amber-600 focus:ring-amber-500" />
                <span>Solo Calidad Obs. (${summary.fotosCalidadObservadaCount})</span>
              </label>

              ${(searchQuery || sucursalFilter !== 'ALL' || estadoFilter !== 'ALL' || canalFaltanteFilter !== 'ALL' || onlyInconsistencias || onlyCalidadObs) ? `
                <button type="button" onclick="MaderoFotografias.resetFilters()" class="text-xs font-semibold text-stone-500 hover:text-stone-900 px-2 py-1 transition flex items-center gap-1">
                  <i class="ri-refresh-line"></i> Limpiar
                </button>
              ` : ''}

            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-200/60 font-mono">
            <span>Mostrando <strong>${filtered.length}</strong> de <strong>${summary.fotosUnidadesTotales}</strong> unidades auditadas</span>
            <span>Hacé clic en los badges de <strong>Drive, Lucy, Web o Redes</strong> en cada fila para alternar su estado</span>
          </div>
        </div>

        <!-- TABLA MATRIZ DE VEHÍCULOS (ESTILO ALISTAMIENTO) -->
        <div id="tabla-fotografias-container" class="glass-card rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-stone-100/90 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
                  <th class="py-3 px-4 cursor-pointer hover:text-stone-900" onclick="MaderoFotografias.setSort('patente')">
                    Vehículo / Patente <i class="ri-arrow-up-down-line ml-0.5"></i>
                  </th>
                  <th class="py-3 px-3 cursor-pointer hover:text-stone-900" onclick="MaderoFotografias.setSort('sucursal')">
                    Sucursal / Ubicación <i class="ri-arrow-up-down-line ml-0.5"></i>
                  </th>
                  <th class="py-3 px-3 cursor-pointer hover:text-stone-900" onclick="MaderoFotografias.setSort('estado_proceso')">
                    Estado Sección 6 <i class="ri-arrow-up-down-line ml-0.5"></i>
                  </th>
                  <th class="py-3 px-3">
                    Plataformas (Drive / Lucy / Web / Redes)
                  </th>
                  <th class="py-3 px-3 cursor-pointer hover:text-stone-900" onclick="MaderoFotografias.setSort('cantidad_fotos_actual')">
                    Fotos vs Mín. 8 <i class="ri-arrow-up-down-line ml-0.5"></i>
                  </th>
                  <th class="py-3 px-3">
                    Calidad Madero
                  </th>
                  <th class="py-3 px-3">
                    Consistencia Canales
                  </th>
                  <th class="py-3 px-3 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200/70">
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="8" class="text-center py-12 text-stone-400">
                      <i class="ri-inbox-line text-4xl block mb-2"></i>
                      No se encontraron vehículos con los filtros aplicados.
                      <div class="mt-2">
                        <button type="button" onclick="MaderoFotografias.resetFilters()" class="text-xs text-emerald-800 font-bold underline">Restablecer filtros</button>
                      </div>
                    </td>
                  </tr>
                ` : filtered.map(u => {
                  const dias = Number(u.dias_en_stock) || 0;
                  const diasBadgeClass = dias > 40 ? 'text-red-700 font-bold' : (dias > 20 ? 'text-amber-700 font-semibold' : 'text-stone-500');

                  return `
                    <tr class="hover:bg-white/90 transition ${u.inconsistencia_detectada ? 'bg-red-50/20' : ''}">
                      
                      <!-- Columna 1: Vehículo / Patente -->
                      <td class="py-3 px-4">
                        <div class="flex items-start gap-2.5">
                          <span class="px-2 py-1 rounded bg-stone-900 text-amber-400 font-mono font-bold text-xs tracking-wider border border-stone-800 shadow-sm shrink-0">
                            ${esc(u.patente)}
                          </span>
                          <div>
                            <div class="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                              <a href="javascript:void(0)" onclick="MaderoFotografias.openDetailModal('${u.id}')" class="hover:underline">
                                ${esc(u.marca_modelo)}
                              </a>
                              <span class="text-stone-400 font-normal">(${u.anio})</span>
                            </div>
                            <div class="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5 font-mono">
                              <span>${esc(u.color)}</span>
                              <span>·</span>
                              <span>${formatKm(u.km)}</span>
                              <span>·</span>
                              <span class="${diasBadgeClass}">${dias}d en stock</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <!-- Columna 2: Sucursal / Ubicación -->
                      <td class="py-3 px-3">
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${u.es_taller ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-stone-100 text-stone-800 border border-stone-200'}">
                          <i class="${u.es_taller ? 'ri-tools-line' : 'ri-store-2-line'}"></i>
                          <span>${esc(u.sucursal)}</span>
                        </span>
                        ${u.es_taller ? `<div class="text-[10px] text-purple-700 font-medium mt-0.5">Taller Externo</div>` : ''}
                      </td>

                      <!-- Columna 3: Estado de Proceso (Sección 6) -->
                      <td class="py-3 px-3">
                        <div>
                          ${getEstadoProcesoBadge(u.estado_proceso, u.causa_demora)}
                          ${u.causa_demora ? `
                            <p class="text-[10px] text-stone-600 mt-1 max-w-[200px] line-clamp-2" title="${esc(u.causa_demora)}">
                              <strong>Causa:</strong> ${esc(u.causa_demora)}
                            </p>
                          ` : ''}
                          ${u.proxima_accion ? `
                            <p class="text-[10px] text-emerald-800 mt-0.5 max-w-[200px] line-clamp-1 font-medium" title="${esc(u.proxima_accion)}">
                              <strong>Acción:</strong> ${esc(u.proxima_accion)}
                            </p>
                          ` : ''}
                        </div>
                      </td>

                      <!-- Columna 4: Plataformas Clicables -->
                      <td class="py-3 px-3">
                        ${renderPlataformasBadges(u)}
                        <div class="mt-1 flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                          ${u.drive_folder_url ? `<a href="${esc(u.drive_folder_url)}" target="_blank" class="hover:text-emerald-700 hover:underline"><i class="ri-folder-shared-line"></i> Drive</a>` : ''}
                          ${u.lucy_url ? `<a href="${esc(u.lucy_url)}" target="_blank" class="hover:text-emerald-700 hover:underline"><i class="ri-external-link-line"></i> Lucy</a>` : ''}
                          ${u.web_url ? `<a href="${esc(u.web_url)}" target="_blank" class="hover:text-emerald-700 hover:underline"><i class="ri-global-line"></i> Web</a>` : ''}
                        </div>
                      </td>

                      <!-- Columna 5: Fotos vs Mínimo 8 -->
                      <td class="py-3 px-3">
                        ${renderFotosProgressBar(u.cantidad_fotos_actual, u.estandar_fotos_minimo, u.fotos_faltantes_detalle)}
                      </td>

                      <!-- Columna 6: Calidad Madero -->
                      <td class="py-3 px-3">
                        ${getCalidadBadge(u.calidad_estado, u.motivo_calidad)}
                        ${u.motivo_calidad ? `
                          <p class="text-[10px] text-red-800 mt-1 max-w-[170px] line-clamp-2" title="${esc(u.motivo_calidad)}">
                            ${esc(u.motivo_calidad)}
                          </p>
                          ${u.responsable_correccion ? `
                            <p class="text-[9px] text-stone-500 mt-0.5">Resp: ${esc(u.responsable_correccion)}</p>
                          ` : ''}
                        ` : ''}
                      </td>

                      <!-- Columna 7: Consistencia Inter-Canales -->
                      <td class="py-3 px-3">
                        ${u.inconsistencia_detectada ? `
                          <div class="cursor-pointer" onclick="MaderoFotografias.openInconsistenciaDetail('${u.id}')">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-900 border border-red-300 animate-pulse">
                              <i class="ri-alert-fill"></i> Desvío Canales
                            </span>
                            <p class="text-[10px] text-red-800 mt-1 max-w-[190px] line-clamp-2 font-medium" title="${esc(u.detalle_inconsistencia)}">
                              ${esc(u.detalle_inconsistencia)}
                            </p>
                            ${Array.isArray(u.canales_inconsistentes) && u.canales_inconsistentes.length > 0 ? `
                              <div class="text-[9px] text-stone-500 mt-0.5 font-mono">
                                Cruce: ${esc(u.canales_inconsistentes.join(' vs '))}
                              </div>
                            ` : ''}
                          </div>
                        ` : `
                          <span class="inline-flex items-center gap-1 text-[11px] text-stone-400 font-mono">
                            <i class="ri-check-line text-emerald-600"></i> Alineado
                          </span>
                        `}
                      </td>

                      <!-- Columna 8: Acciones -->
                      <td class="py-3 px-3 text-right">
                        <div class="flex items-center justify-end gap-1">
                          <button type="button" onclick="MaderoFotografias.openDetailModal('${u.id}')"
                            class="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition" title="Ver ficha técnica completa">
                            <i class="ri-eye-line text-sm"></i>
                          </button>
                          <button type="button" onclick="MaderoFotografias.openEditModal('${u.id}')"
                            class="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition" title="Editar unidad">
                            <i class="ri-edit-line text-sm"></i>
                          </button>
                          <button type="button" onclick="MaderoFotografias.confirmDelete('${u.id}', '${esc(u.patente)}')"
                            class="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition" title="Eliminar registro">
                            <i class="ri-delete-bin-line text-sm"></i>
                          </button>
                        </div>
                      </td>

                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // ------------------------------------------------------------------------
  // MODALES DEL MÓDULO 3
  // ------------------------------------------------------------------------
  function openCreateModal() {
    openEditModal(null);
  }

  function openEditModal(id) {
    const state = window.MaderoStore.getState();
    const isNew = !id;
    const u = isNew ? {
      id: '',
      patente: '',
      marca_modelo: '',
      anio: 2023,
      color: 'Blanco',
      km: 0,
      precio_revista: 0,
      sucursal: 'AV POLONIA 546',
      es_taller: false,
      dias_en_stock: 1,
      estado_proceso: 'LISTO_PARA_FOTOGRAFIAR',
      causa_demora: '',
      proxima_accion: 'Programar sesión fotográfica estándar en rampa.',
      cargado_drive: false,
      cargado_lucy: false,
      cargado_web: false,
      cargado_redes: false,
      cantidad_fotos_actual: 0,
      estandar_fotos_minimo: 8,
      fotos_faltantes_detalle: '',
      calidad_estado: 'PENDIENTE_REVISION',
      motivo_calidad: '',
      origen_observacion: 'Sin observación',
      responsable_correccion: '',
      fecha_nueva_revision: '',
      inconsistencia_detectada: false,
      detalle_inconsistencia: '',
      canales_inconsistentes: [],
      fecha_ultima_sesion: '',
      drive_folder_url: '',
      lucy_url: '',
      web_url: '',
      notas: ''
    } : (state.fotografia_unidades.find(item => item.id === id) || {});

    const title = isNew ? 'Nueva Unidad para Control Fotográfico' : `Editar Ficha Fotográfica · ${esc(u.patente)}`;

    const html = `
      <form onsubmit="MaderoFotografias.saveUnidad(event, '${esc(u.id)}')">
        <div class="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

          <!-- Fila 1: Datos identificatorios -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Patente / Dominio *</label>
              <input type="text" name="patente" value="${esc(u.patente)}" required placeholder="AF123CD"
                class="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 uppercase" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Marca, Modelo y Versión *</label>
              <input type="text" name="marca_modelo" value="${esc(u.marca_modelo)}" required placeholder="Toyota Hilux 2.8 SRV 4x4 AT"
                class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>

          <!-- Fila 2: Año, Color, Km, Precio -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Año</label>
              <input type="number" name="anio" value="${u.anio || 2023}" min="2000" max="2027"
                class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />
            </div>
            <div>
              <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Color</label>
              <input type="text" name="color" value="${esc(u.color)}" placeholder="Blanco"
                class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Kilometraje</label>
              <input type="number" name="km" value="${u.km || 0}"
                class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />
            </div>
            <div>
              <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Días en Stock</label>
              <input type="number" name="dias_en_stock" value="${u.dias_en_stock || 1}"
                class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />
            </div>
          </div>

          <!-- Fila 3: Sucursal y Es Taller -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Sucursal / Ubicación Real *</label>
              <select name="sucursal" class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900">
                <option value="AV POLONIA 546" ${u.sucursal === 'AV POLONIA 546' ? 'selected' : ''}>AV POLONIA 546 (Comodoro)</option>
                <option value="MADERO ALEM 828" ${u.sucursal === 'MADERO ALEM 828' ? 'selected' : ''}>MADERO ALEM 828 (Comodoro)</option>
                <option value="MADERO MONSEÑOR D'ANDREA 1967" ${u.sucursal === "MADERO MONSEÑOR D'ANDREA 1967" ? 'selected' : ''}>CAM D'ANDREA 1967 (Alistamiento Comodoro)</option>
                <option value="MADERO NEUQUEN" ${u.sucursal === 'MADERO NEUQUEN' ? 'selected' : ''}>MADERO NEUQUEN (Neuquén)</option>
                <option value="CORDILLERA VENTA" ${u.sucursal === 'CORDILLERA VENTA' ? 'selected' : ''}>CORDILLERA VENTA (Esquel)</option>
                <option value="Colon Stock S/garantia" ${u.sucursal === 'Colon Stock S/garantia' ? 'selected' : ''}>Colon Stock S/garantia (Comodoro)</option>
                <option value="Talleres Externos / Movimiento" ${u.sucursal === 'Talleres Externos / Movimiento' ? 'selected' : ''}>Talleres Externos / Movimiento</option>
                <option value="Sin asignar / Salón no especificado" ${u.sucursal === 'Sin asignar / Salón no especificado' ? 'selected' : ''}>Sin asignar / Salón no especificado</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-stone-700 uppercase mb-1">¿Está en Taller Externo?</label>
              <select name="es_taller" class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 font-medium">
                <option value="false" ${!u.es_taller ? 'selected' : ''}>NO · Salón / Playón Comercial</option>
                <option value="true" ${u.es_taller ? 'selected' : ''}>SÍ · Taller Mecánico / Chapa / Batea</option>
              </select>
            </div>
          </div>

          <!-- Fila 4: Estado de Proceso (Sección 6) -->
          <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div class="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <i class="ri-focus-2-line text-emerald-600"></i>
              Estado según los 8 Datos Estables de la Sección 6
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-stone-700 uppercase mb-1">Estado de Proceso</label>
                <select name="estado_proceso" class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 font-semibold">
                  <option value="AL_DIA" ${u.estado_proceso === 'AL_DIA' ? 'selected' : ''}>Al día (Fotografiado y 100% cargado)</option>
                  <option value="LISTO_PARA_FOTOGRAFIAR" ${u.estado_proceso === 'LISTO_PARA_FOTOGRAFIAR' ? 'selected' : ''}>Listo para fotografiar (preparado en salón)</option>
                  <option value="PENDIENTE_COORDINACION" ${u.estado_proceso === 'PENDIENTE_COORDINACION' ? 'selected' : ''}>Pendiente de coordinación (con causa)</option>
                  <option value="FOTOGRAFIADO_PENDIENTE_CARGA" ${u.estado_proceso === 'FOTOGRAFIADO_PENDIENTE_CARGA' ? 'selected' : ''}>Fotografiado pendiente de carga en plataformas</option>
                  <option value="COBERTURA_INCOMPLETA" ${u.estado_proceso === 'COBERTURA_INCOMPLETA' ? 'selected' : ''}>Cobertura incompleta (&lt; 8 tomas estándar)</option>
                  <option value="CALIDAD_OBSERVADA" ${u.estado_proceso === 'CALIDAD_OBSERVADA' ? 'selected' : ''}>Calidad observada / devuelta</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 uppercase mb-1">Cantidad de Fotos Actuales</label>
                <input type="number" name="cantidad_fotos_actual" value="${u.cantidad_fotos_actual || 0}" min="0" max="30"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-stone-700 uppercase mb-1">Causa de la Demora / Bloqueo</label>
                <input type="text" name="causa_demora" value="${esc(u.causa_demora)}" placeholder="Ej: Esperando pulido en alistamiento, clima adverso, etc."
                  class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 uppercase mb-1">Próxima Acción Comprometida</label>
                <input type="text" name="proxima_accion" value="${esc(u.proxima_accion)}" placeholder="Ej: Fotografiar el jueves 09:30 hs con Facundo"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900" />
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-stone-700 uppercase mb-1">Detalle de Fotos Faltantes (si &lt; 8 tomas)</label>
              <input type="text" name="fotos_faltantes_detalle" value="${esc(u.fotos_faltantes_detalle)}" placeholder="Ej: Faltan tomas de tablero encendido con kilometraje y vano motor."
                class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>

          <!-- Fila 5: Checkboxes de Carga en Plataformas -->
          <div class="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div class="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i class="ri-checkbox-multiple-line text-emerald-700"></i>
              Disponibilidad del Material por Plataforma (Dato 4 Sección 6)
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label class="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 text-xs font-semibold cursor-pointer">
                <input type="checkbox" name="cargado_drive" ${u.cargado_drive ? 'checked' : ''} class="rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Google Drive</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 text-xs font-semibold cursor-pointer">
                <input type="checkbox" name="cargado_lucy" ${u.cargado_lucy ? 'checked' : ''} class="rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Lucy DMS</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 text-xs font-semibold cursor-pointer">
                <input type="checkbox" name="cargado_web" ${u.cargado_web ? 'checked' : ''} class="rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Web Oficial</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 text-xs font-semibold cursor-pointer">
                <input type="checkbox" name="cargado_redes" ${u.cargado_redes ? 'checked' : ''} class="rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Redes / Clasificados</span>
              </label>
            </div>
          </div>

          <!-- Fila 6: Control de Calidad Madero (Dato 6 Sección 6) -->
          <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div class="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <i class="ri-shield-check-line text-emerald-600"></i>
              Control de Calidad Fotográfica Institucional (Dato 6)
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-stone-700 uppercase mb-1">Estado de Calidad</label>
                <select name="calidad_estado" class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 font-semibold">
                  <option value="APROBADA" ${u.calidad_estado === 'APROBADA' ? 'selected' : ''}>Aprobada Madero</option>
                  <option value="OBSERVADA" ${u.calidad_estado === 'OBSERVADA' ? 'selected' : ''}>Observada / Requiere Corrección</option>
                  <option value="PENDIENTE_REVISION" ${u.calidad_estado === 'PENDIENTE_REVISION' ? 'selected' : ''}>Pendiente de Revisión</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 uppercase mb-1">Origen de la Observación</label>
                <select name="origen_observacion" class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900">
                  <option value="Sin observación" ${u.origen_observacion === 'Sin observación' ? 'selected' : ''}>Sin observación</option>
                  <option value="Marketing" ${u.origen_observacion === 'Marketing' ? 'selected' : ''}>Marketing Interno</option>
                  <option value="Ventas" ${u.origen_observacion === 'Ventas' ? 'selected' : ''}>Ventas / Asesor Comercial</option>
                  <option value="Dirección" ${u.origen_observacion === 'Dirección' ? 'selected' : ''}>Dirección</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 uppercase mb-1">Responsable Corrección</label>
                <input type="text" name="responsable_correccion" value="${esc(u.responsable_correccion)}" placeholder="Facundo Gómez (Fotógrafo)"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900" />
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-stone-700 uppercase mb-1">Motivo Concreto de la Observación</label>
              <input type="text" name="motivo_calidad" value="${esc(u.motivo_calidad)}" placeholder="Ej: Reflejo en parabrisas, fondo desordenado con operarios visibles, etc."
                class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>

          <!-- Fila 7: Consistencia Inter-Canales (Dato 7 Sección 6) -->
          <div class="p-3 rounded-xl bg-red-50/60 border border-red-200 space-y-3">
            <div class="flex items-center justify-between">
              <div class="text-xs font-bold text-red-950 uppercase tracking-wider flex items-center gap-1.5">
                <i class="ri-shuffle-line text-red-700"></i>
                Consistencia Inter-Canales (Dato 7 Sección 6)
              </div>
              <label class="inline-flex items-center gap-2 text-xs font-bold text-red-900 cursor-pointer">
                <input type="checkbox" name="inconsistencia_detectada" ${u.inconsistencia_detectada ? 'checked' : ''} class="rounded text-red-600 focus:ring-red-500" />
                <span>¿Inconsistencia Detectada?</span>
              </label>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-red-900 uppercase mb-1">Detalle del Desvío Inter-Canales</label>
              <textarea name="detalle_inconsistencia" rows="2" placeholder="Ej: En Lucy figura a $24.800.000 como DISPONIBLE, pero en Web figura a $23.900.000 como RESERVADA."
                class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-800">${esc(u.detalle_inconsistencia)}</textarea>
            </div>
          </div>

          <!-- Fila 8: Enlaces y Notas -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Carpeta Google Drive</label>
              <input type="url" name="drive_folder_url" value="${esc(u.drive_folder_url)}" placeholder="https://drive.google.com/..."
                class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />
            </div>
            <div>
              <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Enlace Ficha Lucy DMS</label>
              <input type="url" name="lucy_url" value="${esc(u.lucy_url)}" placeholder="https://madero.lucydms.com/stock/..."
                class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />
            </div>
            <div>
              <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Enlace Ficha Web Oficial</label>
              <input type="url" name="web_url" value="${esc(u.web_url)}" placeholder="https://maderoautomotores.com/autos/..."
                class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />
            </div>
          </div>

        </div>

        <div class="mt-5 pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
          <button type="button" onclick="MaderoUI.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow transition">
            ${isNew ? 'Guardar Nueva Unidad' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    `;

    window.MaderoUI.openModal(title, html);
  }

  function saveUnidad(event, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const unidad = {
      id: id || '',
      patente: (formData.get('patente') || '').trim().toUpperCase(),
      marca_modelo: (formData.get('marca_modelo') || '').trim(),
      anio: Number(formData.get('anio')) || 2023,
      color: (formData.get('color') || 'Consultar').trim(),
      km: Number(formData.get('km')) || 0,
      dias_en_stock: Number(formData.get('dias_en_stock')) || 1,
      sucursal: formData.get('sucursal'),
      es_taller: formData.get('es_taller') === 'true',
      estado_proceso: formData.get('estado_proceso'),
      cantidad_fotos_actual: Number(formData.get('cantidad_fotos_actual')) || 0,
      estandar_fotos_minimo: 8,
      causa_demora: (formData.get('causa_demora') || '').trim(),
      proxima_accion: (formData.get('proxima_accion') || '').trim(),
      fotos_faltantes_detalle: (formData.get('fotos_faltantes_detalle') || '').trim(),
      cargado_drive: formData.get('cargado_drive') === 'on',
      cargado_lucy: formData.get('cargado_lucy') === 'on',
      cargado_web: formData.get('cargado_web') === 'on',
      cargado_redes: formData.get('cargado_redes') === 'on',
      calidad_estado: formData.get('calidad_estado'),
      origen_observacion: formData.get('origen_observacion'),
      responsable_correccion: (formData.get('responsable_correccion') || '').trim(),
      motivo_calidad: (formData.get('motivo_calidad') || '').trim(),
      inconsistencia_detectada: formData.get('inconsistencia_detectada') === 'on',
      detalle_inconsistencia: (formData.get('detalle_inconsistencia') || '').trim(),
      drive_folder_url: (formData.get('drive_folder_url') || '').trim(),
      lucy_url: (formData.get('lucy_url') || '').trim(),
      web_url: (formData.get('web_url') || '').trim()
    };

    window.MaderoStore.upsertFotografiaUnidad(unidad);
    window.MaderoUI.closeModal();
    window.MaderoApp.renderAll();
  }

  function confirmDelete(id, patente) {
    if (confirm(`¿Confirma eliminar el registro fotográfico de la patente ${patente}?`)) {
      window.MaderoStore.deleteFotografiaUnidad(id);
      window.MaderoApp.renderAll();
    }
  }

  function openDetailModal(id) {
    const state = window.MaderoStore.getState();
    const u = (state.fotografia_unidades || []).find(item => item.id === id);
    if (!u) return;

    const html = `
      <div class="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        
        <!-- Ficha de cabecera -->
        <div class="p-4 rounded-xl bg-stone-900 text-white flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-mono font-bold text-sm tracking-wider">
                ${esc(u.patente)}
              </span>
              <span class="text-xs text-stone-300 font-mono">${u.anio} · ${formatKm(u.km)}</span>
            </div>
            <h3 class="text-lg font-bold text-white tracking-tight">${esc(u.marca_modelo)}</h3>
            <p class="text-xs text-stone-400 mt-0.5">${esc(u.color)} · ${esc(u.sucursal)} · ${u.dias_en_stock} días en stock</p>
          </div>
          <div class="text-right">
            ${getEstadoProcesoBadge(u.estado_proceso, u.causa_demora)}
          </div>
        </div>

        <!-- Cobertura y Plataformas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span class="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">Disponibilidad por Plataforma</span>
            ${renderPlataformasBadges(u)}
          </div>
          <div class="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span class="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">Fotos vs Estándar Madero</span>
            ${renderFotosProgressBar(u.cantidad_fotos_actual, u.estandar_fotos_minimo, u.fotos_faltantes_detalle)}
          </div>
        </div>

        <!-- Calidad & Observaciones -->
        <div class="p-3 rounded-xl ${u.calidad_estado === 'OBSERVADA' ? 'bg-red-50 border border-red-200' : 'bg-stone-50 border border-stone-200'}">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-stone-800 uppercase tracking-wider">Control de Calidad (Dato 6 Sección 6)</span>
            ${getCalidadBadge(u.calidad_estado, u.motivo_calidad)}
          </div>
          ${u.motivo_calidad ? `
            <div class="text-xs text-stone-800 bg-white/80 p-2.5 rounded-lg border border-stone-200 space-y-1">
              <div><strong>Motivo:</strong> ${esc(u.motivo_calidad)}</div>
              <div class="flex items-center justify-between text-[11px] text-stone-500 font-mono pt-1">
                <span>Origen: ${esc(u.origen_observacion || 'Marketing')}</span>
                <span>Responsable corrección: ${esc(u.responsable_correccion || 'Facundo Gómez')}</span>
              </div>
            </div>
          ` : `
            <p class="text-xs text-stone-500">Material fotográfico bajo estándar de aceptación institucional sin observaciones pendientes.</p>
          `}
        </div>

        <!-- Inconsistencia entre canales -->
        ${u.inconsistencia_detectada ? `
          <div class="p-3 rounded-xl bg-red-50 border border-red-300">
            <div class="flex items-center gap-1.5 text-xs font-bold text-red-900 uppercase tracking-wider mb-1">
              <i class="ri-alert-fill text-red-700"></i> Desvío Inter-Canales Detectado (Dato 7 Sección 6)
            </div>
            <p class="text-xs text-red-900 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-red-200">
              ${esc(u.detalle_inconsistencia)}
            </p>
          </div>
        ` : ''}

        <!-- Enlaces directos -->
        <div class="p-3 rounded-xl bg-stone-50 border border-stone-200">
          <span class="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">Enlaces y Trazabilidad</span>
          <div class="flex flex-wrap gap-2 text-xs">
            ${u.drive_folder_url ? `<a href="${esc(u.drive_folder_url)}" target="_blank" class="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 flex items-center gap-1"><i class="ri-folder-shared-line text-emerald-600"></i> Abrir Carpeta Google Drive</a>` : ''}
            ${u.lucy_url ? `<a href="${esc(u.lucy_url)}" target="_blank" class="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 flex items-center gap-1"><i class="ri-database-2-line text-blue-600"></i> Ficha en Lucy DMS</a>` : ''}
            ${u.web_url ? `<a href="${esc(u.web_url)}" target="_blank" class="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 flex items-center gap-1"><i class="ri-global-line text-purple-600"></i> Ficha Web Oficial Madero</a>` : ''}
          </div>
        </div>

      </div>

      <div class="mt-5 pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
        <button type="button" onclick="MaderoUI.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition">
          Cerrar
        </button>
        <button type="button" onclick="MaderoFotografias.openEditModal('${u.id}')" class="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition flex items-center gap-1.5">
          <i class="ri-edit-line"></i> Editar Ficha
        </button>
      </div>
    `;

    window.MaderoUI.openModal(`Detalle Fotográfico · ${esc(u.patente)}`, html);
  }

  function openObservacionDetail(motivo) {
    window.MaderoUI.openModal({
      title: 'Observación de Calidad Fotográfica',
      subtitle: 'Revisión de cobertura y estándar visual',
      maxWidth: 'max-w-lg',
      bodyHtml: `
        <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-stone-800 text-xs leading-relaxed">
          ${esc(motivo || 'Sin detalle registrado para esta observación.')}
        </div>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition">Entendido</button>
      `
    });
  }

  function openInconsistenciaDetail(id) {
    openDetailModal(id);
  }

  function openEvolucionModal() {
    const summary = window.MaderoStore.getComputedSummary();
    const ev = summary.fotosEvolucion || {};
    const meta = summary.fotosMeta || {};

    const html = `
      <div class="space-y-4">
        <div class="p-4 rounded-xl bg-stone-900 text-white">
          <div class="text-xs text-emerald-400 font-mono uppercase mb-1">Dato 8 de la Sección 6</div>
          <h3 class="text-lg font-bold">Evolución Semanal de Cobertura Fotográfica</h3>
          <p class="text-xs text-stone-300 mt-1">${esc(meta.semana_activa || 'Semana 45')}</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span class="text-[10px] uppercase font-bold text-emerald-800 block">Altas de la semana</span>
            <span class="text-2xl font-extrabold text-emerald-900 font-mono">+${ev.altas_semana || 18}</span>
            <span class="text-[10px] text-emerald-700 block mt-0.5">Nuevos ingresos stock</span>
          </div>
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span class="text-[10px] uppercase font-bold text-emerald-800 block">Regularizadas</span>
            <span class="text-2xl font-extrabold text-emerald-900 font-mono">${ev.regularizadas_semana || 14}</span>
            <span class="text-[10px] text-emerald-700 block mt-0.5">Sesiones completadas</span>
          </div>
          <div class="p-3 rounded-xl bg-stone-100 border border-stone-200">
            <span class="text-[10px] uppercase font-bold text-stone-600 block">Semana Anterior</span>
            <span class="text-2xl font-extrabold text-stone-800 font-mono">${ev.pendientes_semana_anterior || 38}</span>
            <span class="text-[10px] text-stone-500 block mt-0.5">Saldo pendiente previo</span>
          </div>
          <div class="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span class="text-[10px] uppercase font-bold text-amber-800 block">Saldo Actual</span>
            <span class="text-2xl font-extrabold text-amber-900 font-mono">${ev.pendientes_actuales || 31}</span>
            <span class="text-[10px] text-emerald-700 font-bold block mt-0.5">${ev.variacion_saldo || -7} vs anterior</span>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-stone-50 border border-stone-200">
          <span class="text-xs font-bold text-stone-700 uppercase block mb-1">Lectura y Conclusión de Ángelo Lucero</span>
          <p class="text-xs text-stone-700 leading-relaxed">${esc(ev.comentario_lider || 'Se regularizaron 14 unidades en la semana con foco en Salón Polonia y Alem.')}</p>
        </div>

        <div class="text-right pt-2 border-t border-stone-200">
          <button type="button" onclick="MaderoUI.closeModal()" class="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white">
            Cerrar
          </button>
        </div>
      </div>
    `;

    window.MaderoUI.openModal('Evolución Semanal de Cobertura (Dato 8)', html);
  }

  function openEstandarModal() {
    const summary = window.MaderoStore.getComputedSummary();
    const meta = summary.fotosMeta || {};

    const html = `
      <form onsubmit="MaderoFotografias.saveEstandar(event)">
        <div class="space-y-4">
          <p class="text-xs text-stone-600">
            Definición oficial del <strong>Estándar de Calidad Fotográfica Aceptable de Madero</strong> según los lineamientos de Dirección (Sección 6).
          </p>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Criterio Institucional Visible</label>
            <textarea name="estandar_calidad_texto" rows="6" required class="w-full px-3 py-2 rounded-xl text-xs bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-800 leading-relaxed">${esc(meta.estandar_calidad_texto || '')}</textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Cantidad Mínima de Tomas Obligatorias</label>
            <input type="number" name="estandar_fotos_minimo" value="${meta.estandar_fotos_minimo || 8}" min="6" max="20"
              class="w-32 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900" />
          </div>
        </div>
        <div class="mt-5 pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
          <button type="button" onclick="MaderoUI.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition">
            Cancelar
          </button>
          <button type="submit" class="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition">
            Guardar Estándar
          </button>
        </div>
      </form>
    `;

    window.MaderoUI.openModal('Estándar de Calidad Fotográfica de Madero', html);
  }

  function saveEstandar(event) {
    event.preventDefault();
    const form = event.target;
    const txt = form.estandar_calidad_texto.value.trim();
    const minFotos = Number(form.estandar_fotos_minimo.value) || 8;

    window.MaderoStore.updateFotografiaMeta({
      estandar_calidad_texto: txt,
      estandar_fotos_minimo: minFotos
    });
    window.MaderoUI.closeModal();
    window.MaderoApp.renderAll();
  }

  function openSyncLucyModal() {
    const summary = window.MaderoStore.getComputedSummary();
    const meta = summary.fotosMeta || {};

    const html = `
      <div class="space-y-4">
        <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <div class="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase mb-1">
            <i class="ri-refresh-line text-emerald-700 text-sm"></i>
            Sincronización con Lucy DMS & Centro de Alistamiento
          </div>
          <p class="text-xs text-emerald-900">
            Permite importar o actualizar el snapshot de vehículos en stock directamente desde el sistema de gestión de Madero o mediante archivo JSON/CSV.
          </p>
          <div class="mt-2 text-[11px] text-emerald-800 font-mono">
            Última sync registrada: ${esc(meta.fecha_ultima_sync || '2026-11-06 10:30 hs')}
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Pegar Snapshot JSON de Lucy DMS o Alistamiento</label>
          <textarea id="lucy-json-input" rows="7" placeholder='[
  {
    "patente": "AF999ZZ",
    "marca_modelo": "Toyota Corolla GR-S 2.0",
    "anio": 2023,
    "color": "Rojo",
    "km": 15000,
    "sucursal": "AV POLONIA 546",
    "cantidad_fotos_actual": 8,
    "cargado_lucy": true
  }
]' class="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-800"></textarea>
        </div>

        <div class="flex items-center justify-between text-xs text-stone-500">
          <span>El importador fusiona por patente sin duplicar registros existentes.</span>
          <button type="button" onclick="MaderoFotografias.loadLucyDemoSnapshot()" class="text-xs text-emerald-800 font-bold hover:underline">
            Cargar Lote de Ejemplo
          </button>
        </div>

        <div class="mt-4 pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
          <button type="button" onclick="MaderoUI.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition">
            Cancelar
          </button>
          <button type="button" onclick="MaderoFotografias.processLucySync()" class="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition">
            Procesar e Importar
          </button>
        </div>
      </div>
    `;

    window.MaderoUI.openModal('Sincronización Lucy DMS / Alistamiento Madero', html);
  }

  function loadLucyDemoSnapshot() {
    const txtArea = document.getElementById('lucy-json-input');
    if (!txtArea) return;
    const demo = [
      {
        patente: 'AF-888-XX',
        marca_modelo: 'Volkswagen Amarok Highline V6 4x4',
        anio: 2023,
        color: 'Gris Indio',
        km: 29500,
        sucursal: 'AV POLONIA 546',
        cantidad_fotos_actual: 8,
        cargado_drive: true,
        cargado_lucy: true,
        cargado_web: true,
        cargado_redes: true
      },
      {
        patente: 'AE-999-ZZ',
        marca_modelo: 'Toyota Yaris XLS 1.5 CVT 5P',
        anio: 2022,
        color: 'Blanco Perlado',
        km: 38200,
        sucursal: "MADERO MONSEÑOR D'ANDREA 1967",
        cantidad_fotos_actual: 0,
        cargado_drive: false,
        cargado_lucy: false,
        cargado_web: false,
        cargado_redes: false,
        causa_demora: 'Ingreso reciente de toma de usado; pendiente lavado.',
        proxima_accion: 'Lavar y fotografiar el viernes.'
      }
    ];
    txtArea.value = JSON.stringify(demo, null, 2);
  }

  function processLucySync() {
    const txtArea = document.getElementById('lucy-json-input');
    if (!txtArea || !txtArea.value.trim()) {
      alert('Por favor pegá el JSON a importar.');
      return;
    }
    try {
      const parsed = JSON.parse(txtArea.value.trim());
      const cant = window.MaderoStore.importarLucySnapshot(parsed);
      alert(`Se procesaron con éxito ${cant} unidades desde Lucy DMS.`);
      window.MaderoUI.closeModal();
      window.MaderoApp.renderAll();
    } catch (err) {
      alert('Error en el formato JSON: ' + err.message);
    }
  }

  return {
    renderModule,
    setSearch,
    setSucursalFilter,
    setEstadoFilter,
    setCanalFaltanteFilter,
    toggleOnlyInconsistencias,
    toggleOnlyCalidadObs,
    setSort,
    resetFilters,
    focusFilter,
    openCreateModal,
    openEditModal,
    saveUnidad,
    confirmDelete,
    openDetailModal,
    openObservacionDetail,
    openInconsistenciaDetail,
    openEvolucionModal,
    openEstandarModal,
    saveEstandar,
    openSyncLucyModal,
    loadLucyDemoSnapshot,
    processLucySync
  };
})();
