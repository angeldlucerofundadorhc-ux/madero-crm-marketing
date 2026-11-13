/* ==========================================================================
   Madero Automotores · Control Integral de Marketing
   Paso 2: Módulo 9 — Auditoría y Seguimiento de Proveedores (REM, L. Christian y Otros)
   Cumplimiento estricto de Secciones 5.9, 7 (Expediente), 8 (Minutas) y 9 (Dirección)
   ========================================================================== */

window.MaderoProveedores = (function () {
  const { esc, estadoBadge, actorBadge, posicionBadge, minutaBadge, formatDateDisplay } = window.MaderoUI;

  // Estado reactivo local de filtros
  const filters = {
    search: '',
    proveedor: 'ALL',
    estado: 'ALL',
    posicion: 'ALL',
    onlyDesvios: false,
    onlyAbsorbido: false,
    onlyMinutaPendiente: false,
    onlyEscalado: false,
    onlyVencidos: false
  };

  function setFilter(key, val) {
    filters[key] = val;
    window.MaderoApp.renderActiveView();
  }

  function resetFilters() {
    filters.search = '';
    filters.proveedor = 'ALL';
    filters.estado = 'ALL';
    filters.posicion = 'ALL';
    filters.onlyDesvios = false;
    filters.onlyAbsorbido = false;
    filters.onlyMinutaPendiente = false;
    filters.onlyEscalado = false;
    filters.onlyVencidos = false;
    window.MaderoApp.renderActiveView();
  }

  // Filtrado de compromisos
  function getFilteredCompromisos() {
    const list = window.MaderoStore.getState().proveedores_compromisos || [];
    const q = filters.search.toLowerCase().trim();

    return list.filter(item => {
      const provId = item.actor_id || item.proveedor_id || (item.proveedor === 'REM' ? 'REM' : item.proveedor === 'L. Christian' ? 'CHRISTIAN_WEB' : 'OTRO_PRESTADOR');
      if (filters.proveedor !== 'ALL' && provId !== filters.proveedor) return false;
      if (filters.estado !== 'ALL' && item.estado !== filters.estado) return false;
      const pos = item.posicion_madero_tipo || item.posicion_madero;
      if (filters.posicion !== 'ALL' && pos !== filters.posicion) return false;

      const isDesvio = ['ATRASADO', 'OBSERVADO_MADERO', 'DEVUELTO_CORRECCION'].includes(item.estado);
      if (filters.onlyDesvios && !isDesvio) return false;

      const hsAbs = window.MaderoStore.getHorasAbsorbidasCompromiso(item);
      if (filters.onlyAbsorbido && hsAbs <= 0) return false;

      const isPendMinuta = window.MaderoStore.isPendienteMinuta(item);
      if (filters.onlyMinutaPendiente && !isPendMinuta) return false;

      if (filters.onlyEscalado && (!item.escalar_a_direccion || item.estado === 'CERRADO_EVIDENCIA')) return false;

      const isVencido = window.MaderoStore.isVencidoSinActualizar(item);
      if (filters.onlyVencidos && !isVencido) return false;

      if (q) {
        const hay = [
          item.id,
          item.titulo_compromiso, item.frente_alcance, item.pedido_detalle,
          item.entregable_esperado,
          item.criterios_aceptacion, item.posicion_madero_fundamento,
          item.responsable_contraparte, item.proxima_accion_responsable, item.proveedor,
          item.observaciones_madero,
          item.recomendacion_direccion, item.recomendacion_lider,
          provId
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }

  // ========================================================================
  // RENDER PRINCIPAL DEL MÓDULO 9
  // ========================================================================
  function renderModule() {
    const summary = window.MaderoStore.getComputedSummary();
    const porProv = summary.porProveedor || {};
    const filtered = getFilteredCompromisos();
    const allCompromisos = window.MaderoStore.getState().proveedores_compromisos || [];

    // Tarjetas Comparativas de Proveedores (REM, L. Christian, Otros)
    const provCardsHtml = [
      { id: 'REM', name: 'REM · Agencia Externa de Rendimiento', icon: '⚡', desc: 'Meta Ads, Google Ads, Creatividades & Campañas' },
      { id: 'CHRISTIAN_WEB', name: 'L. Christian · Plataforma Web', icon: '🌐', desc: 'Sitio Web, Catálogo Digital & Performance Técnica' },
      { id: 'OTRO_PRESTADOR', name: 'Otros Prestadores Especiales', icon: '🔧', desc: 'Producciones audiovisuales, software y servicios puntuales' }
    ].map(p => {
      const data = porProv[p.id] || {
        total: 0, cerrados: 0, atrasados: 0, observados: 0, reprogramados: 0, pendMinuta: 0, horasAbs: 0, cumplimientoPct: 0
      };
      const isActiveFilter = filters.proveedor === p.id;

      return `
        <div class="glass-card p-4 sm:p-5 flex flex-col justify-between gap-3 border ${isActiveFilter ? 'border-stone-900 ring-2 ring-stone-900/10' : 'hover:border-stone-300'} transition">
          <div class="space-y-2.5">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">${p.icon}</span>
                <div>
                  <h3 class="text-xs sm:text-sm font-extrabold text-stone-900 tracking-tight leading-snug">${esc(p.name)}</h3>
                  <p class="text-[10px] text-stone-500">${esc(p.desc)}</p>
                </div>
              </div>
              <span class="badge-pill font-mono font-bold ${data.cumplimientoPct >= 75 ? 'badge-emerald' : data.cumplimientoPct >= 40 ? 'badge-amber' : 'badge-red'}">
                ${data.cumplimientoPct}% Cumplimiento
              </span>
            </div>

            <!-- Mini Matriz de Auditoría -->
            <div class="grid grid-cols-4 gap-1.5 pt-1 text-center">
              <div class="p-2 rounded-xl bg-stone-50 border border-stone-200/70">
                <div class="text-[9px] uppercase tracking-wider text-stone-500 font-bold">Total</div>
                <div class="text-xs sm:text-sm font-extrabold text-stone-900 mt-0.5">${data.total}</div>
              </div>
              <div class="p-2 rounded-xl ${data.atrasados > 0 ? 'bg-rose-50 border border-rose-200' : 'bg-stone-50 border border-stone-200/70'}">
                <div class="text-[9px] uppercase tracking-wider ${data.atrasados > 0 ? 'text-rose-700 font-bold' : 'text-stone-500 font-bold'}">Atrasos</div>
                <div class="text-xs sm:text-sm font-extrabold ${data.atrasados > 0 ? 'text-rose-700' : 'text-stone-700'} mt-0.5">${data.atrasados}</div>
              </div>
              <div class="p-2 rounded-xl ${data.observados > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-stone-50 border border-stone-200/70'}">
                <div class="text-[9px] uppercase tracking-wider ${data.observados > 0 ? 'text-amber-800 font-bold' : 'text-stone-500 font-bold'}">Observ.</div>
                <div class="text-xs sm:text-sm font-extrabold ${data.observados > 0 ? 'text-amber-800' : 'text-stone-700'} mt-0.5">${data.observados}</div>
              </div>
              <div class="p-2 rounded-xl ${data.reprogramados > 0 ? 'bg-stone-100 border border-stone-300' : 'bg-stone-50 border border-stone-200/70'}">
                <div class="text-[9px] uppercase tracking-wider text-stone-500 font-bold">Reprog.</div>
                <div class="text-xs sm:text-sm font-extrabold text-stone-900 mt-0.5">${data.reprogramados}</div>
              </div>
            </div>

            <!-- Indicadores Clave de Riesgo y Absorción (Secciones 7 y 8) -->
            <div class="pt-2 border-t border-stone-200/70 space-y-1.5 text-[11px]">
              <div class="flex items-center justify-between">
                <span class="text-stone-600">Trabajo absorbido por Madero:</span>
                <span class="font-extrabold ${data.horasAbs > 0 ? 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md' : 'text-stone-700'}">${data.horasAbs.toFixed(1)} hs</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-stone-600">Minutas pendientes de formalizar:</span>
                <span class="font-bold ${data.pendMinuta > 0 ? 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md' : 'text-emerald-700'}">
                  ${data.pendMinuta > 0 ? `⚠ ${data.pendMinuta} pendiente(s)` : '✓ Al día'}
                </span>
              </div>
            </div>
          </div>

          <div class="pt-2.5 border-t border-stone-200/60 flex items-center justify-between">
            <button type="button" onclick="MaderoProveedores.setFilter('proveedor', '${isActiveFilter ? 'ALL' : p.id}')" class="text-xs font-bold ${isActiveFilter ? 'text-rose-700' : 'text-stone-800 hover:text-stone-950'} flex items-center gap-1">
              <span>${isActiveFilter ? '✕ Quitar filtro' : 'Filtrar este proveedor'}</span>
              <span>→</span>
            </button>
            <button type="button" onclick="MaderoProveedores.openCompromisoModal(null, '${p.id}')" class="text-[11px] font-semibold text-stone-600 hover:text-stone-900 underline">
              + Agregar compromiso
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Selector de Proveedor en Barra de Filtros
    const provFilterButtons = [
      { id: 'ALL', label: `Todos (${allCompromisos.length})` },
      { id: 'REM', label: 'REM' },
      { id: 'CHRISTIAN_WEB', label: 'L. Christian' },
      { id: 'OTRO_PRESTADOR', label: 'Otros' }
    ].map(btn => {
      const active = filters.proveedor === btn.id;
      return `<button type="button" onclick="MaderoProveedores.setFilter('proveedor', '${btn.id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${active ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'}">${esc(btn.label)}</button>`;
    }).join('');

    // Opciones de Estado
    const estadoOptions = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
      `<option value="${st.id}" ${filters.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`
    ).join('');

    // Opciones de Posición Madero
    const posicionOptions = Object.values(window.MaderoData.POSICIONES_MADERO || {}).map(pos =>
      `<option value="${pos.id}" ${filters.posicion === pos.id ? 'selected' : ''}>${esc(pos.label)}</option>`
    ).join('');

    // Tabla de Compromisos
    const rowsHtml = filtered.length === 0 ? `
      <tr>
        <td colspan="7" class="py-10 text-center text-xs text-stone-500">
          No hay compromisos con proveedores que coincidan con los filtros aplicados.
        </td>
      </tr>
    ` : filtered.map(c => {
      const hsAbs = window.MaderoStore.getHorasAbsorbidasCompromiso(c);
      const isVencido = window.MaderoStore.isVencidoSinActualizar(c);
      const isPendMin = window.MaderoStore.isPendienteMinuta(c);
      const provKey = c.actor_id || c.proveedor_id || (c.proveedor === 'REM' ? 'REM' : c.proveedor === 'L. Christian' ? 'CHRISTIAN_WEB' : 'OTRO_PRESTADOR');
      const provInfo = (window.MaderoData.PROVEEDORES && window.MaderoData.PROVEEDORES[provKey]) || { nombreCorto: c.proveedor || provKey };
      const titulo = c.titulo_compromiso || c.frente_alcance || c.pedido_detalle;
      const entregable = c.entregable_esperado || c.pedido_detalle;
      const resp = c.responsable_contraparte || c.proxima_accion_responsable || c.proveedor || 'No asignado';
      const canal = c.canal_oficial || 'Reunión / Minuta';
      const fechaLim = c.fecha_acordada_actual || c.fecha_limite;
      const fechaOrig = c.fecha_acordada_original || c.fecha_pactada_original;
      const posMadero = c.posicion_madero_tipo || c.posicion_madero;
      const reprogCount = c.reprogramaciones_count || (Array.isArray(c.historial_reprogramaciones) ? c.historial_reprogramaciones.length : 0);

      // Tareas vinculadas chips
      const linkedChips = Array.isArray(c.tareas_vinculadas) && c.tareas_vinculadas.length > 0 ? `
        <div class="flex items-center gap-1 flex-wrap mt-1">
          <span class="text-[10px] text-stone-500 font-medium">Vinculado a:</span>
          ${c.tareas_vinculadas.map(tid => `
            <span class="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer" onclick="MaderoApp.navigateModule('m2-equipo')" title="Ver tarea interna ${esc(tid)}">
              ${esc(tid)}
            </span>
          `).join('')}
        </div>
      ` : '';

      return `
        <tr class="hover:bg-white/70 transition border-b border-stone-200/50">
          <!-- Col 1: ID y Proveedor -->
          <td class="py-3 px-3 align-top whitespace-nowrap">
            <div class="flex flex-col gap-1 items-start">
              <span class="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-stone-900 text-white">${esc(c.id)}</span>
              <span class="badge-pill badge-stone text-[10px] font-bold">${esc(provInfo.nombreCorto)}</span>
              ${c.escalar_a_direccion && c.estado !== 'CERRADO_EVIDENCIA' ? '<span class="badge-pill badge-amber font-extrabold text-[9px]">⚡ Escalado Dirección</span>' : ''}
            </div>
          </td>

          <!-- Col 2: Compromiso y Entregable -->
          <td class="py-3 px-3 align-top min-w-[240px] max-w-[360px]">
            <div class="font-extrabold text-stone-900 text-xs leading-snug cursor-pointer hover:underline" onclick="MaderoProveedores.openCompromisoModal('${esc(c.id)}')">
              ${esc(titulo)}
            </div>
            <p class="text-[11px] text-stone-600 mt-0.5 leading-relaxed">${esc(entregable)}</p>
            <div class="text-[10px] text-stone-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span><strong>Resp:</strong> ${esc(resp)}</span>
              <span>•</span>
              <span><strong>Canal:</strong> ${esc(canal)}</span>
            </div>
            ${linkedChips}
          </td>

          <!-- Col 3: Fecha Pactada & Desvíos -->
          <td class="py-3 px-3 align-top whitespace-nowrap">
            <div class="text-xs font-bold text-stone-900">${formatDateDisplay(fechaLim)}</div>
            ${fechaOrig && fechaOrig !== fechaLim ? `
              <div class="text-[10px] text-stone-500 line-through">Orig: ${formatDateDisplay(fechaOrig)}</div>
            ` : ''}
            ${reprogCount > 0 ? `
              <div class="mt-1">
                <span class="badge-pill badge-amber text-[9px] font-bold" title="${esc(reprogCount)} reprogramación(es) registrada(s)">
                  ${reprogCount} reprog.
                </span>
              </div>
            ` : ''}
            ${isVencido ? `
              <div class="mt-1 flex flex-col gap-1 items-start">
                <span class="badge-pill badge-red text-[9px] font-bold">⚠ Vencido sin act.</span>
                <button type="button" onclick="MaderoProveedores.quickSetAtrasado('${esc(c.id)}')" class="text-[9px] font-bold text-rose-700 hover:underline">
                  Marcar Atrasado
                </button>
              </div>
            ` : ''}
          </td>

          <!-- Col 4: Estado de Seguimiento (Cambio Rápido Inline) -->
          <td class="py-3 px-3 align-top whitespace-nowrap">
            <select onchange="MaderoProveedores.changeCompromisoEstado('${esc(c.id)}', this.value)" class="input-glass text-xs py-1 px-2 font-semibold">
              ${Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
                `<option value="${st.id}" ${c.estado === st.id ? 'selected' : ''}>${esc(st.shortLabel)}</option>`
              ).join('')}
            </select>
            <div class="mt-1 text-[10px] text-stone-500">
              ${estadoBadge(c.estado, true)}
            </div>
          </td>

          <!-- Col 5: Posición Madero & Minuta de Formalización -->
          <td class="py-3 px-3 align-top whitespace-nowrap">
            <div class="flex flex-col gap-1.5 items-start">
              ${posicionBadge(posMadero)}
              ${minutaBadge(c)}
            </div>
          </td>

          <!-- Col 6: Trabajo Absorbido por Madero -->
          <td class="py-3 px-3 align-top whitespace-nowrap">
            <div class="text-xs font-extrabold ${hsAbs > 0 ? 'text-rose-700' : 'text-stone-700'}">
              ${hsAbs.toFixed(1)} hs
            </div>
            <div class="text-[9px] text-stone-500">
              ${Array.isArray(c.tareas_vinculadas) && c.tareas_vinculadas.length > 0 ? 'Desde tareas del equipo' : (hsAbs > 0 ? 'Cálculo directo' : 'Sin absorción')}
            </div>
          </td>

          <!-- Col 7: Acciones -->
          <td class="py-3 px-3 align-top text-right whitespace-nowrap">
            <div class="flex items-center justify-end gap-1.5">
              <button type="button" onclick="MaderoProveedores.openCompromisoModal('${esc(c.id)}')" class="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold" title="Ver Expediente Completo (Sección 7 y 8)">
                👁
              </button>
              <button type="button" onclick="MaderoProveedores.openReprogramarModal('${esc(c.id)}')" class="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold" title="Registrar Reprogramación Formal">
                🕒
              </button>
              <button type="button" onclick="MaderoProveedores.deleteCompromisoConfirm('${esc(c.id)}')" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold" title="Eliminar compromiso">
                🗑
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="space-y-4 sm:space-y-5">
        <!-- Encabezado de Auditoría de Proveedores -->
        <div class="glass-card p-4 sm:p-6">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-stone-200/80">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="badge-pill badge-dark font-mono">Módulo 9 de 12 · Paso 2 Activo</span>
                <span class="badge-pill badge-emerald font-semibold">Auditoría Objetiva</span>
                <span class="badge-pill badge-stone font-mono text-[10px]">Esquema v${esc(window.MaderoData.INITIAL_STATE.schema_version)}</span>
              </div>
              <h1 class="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">Auditoría y Seguimiento de Proveedores Externos</h1>
              <p class="text-xs text-stone-600 mt-1 max-w-4xl leading-relaxed">
                Exigencia Sección 5.9: <em>"Registro de compromisos asumidos por proveedores (REM, Lucas Christian y otros), control estricto de fechas pactadas, registro formal de desvíos mediante minutas y auditoría del trabajo absorbido por Madero ante incumplimientos."</em>
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-auto">
              <button type="button" onclick="MaderoProveedores.openCompromisoModal()" class="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition">
                + Nuevo Compromiso
              </button>
              <button type="button" onclick="MaderoProveedores.exportCSV()" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 text-xs font-semibold transition">
                ⬇ Exportar CSV
              </button>
              <button type="button" onclick="MaderoUI.openEstadosGuideModal()" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition">
                Guía 9 Estados
              </button>
            </div>
          </div>

          <!-- Métricas Resumen Rápidas -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3 text-center">
            <div class="p-2.5 rounded-xl bg-stone-100/90 border border-stone-200">
              <span class="text-[10px] uppercase font-bold text-stone-600 block">Total Compromisos</span>
              <span class="text-base font-extrabold text-stone-900 mt-0.5 block">${summary.provTotal}</span>
            </div>
            <div class="p-2.5 rounded-xl ${summary.provAtrasadosCount > 0 ? 'bg-rose-50 border border-rose-200' : 'bg-stone-100/90 border border-stone-200'}">
              <span class="text-[10px] uppercase font-bold ${summary.provAtrasadosCount > 0 ? 'text-rose-700' : 'text-stone-600'} block">Atrasados</span>
              <span class="text-base font-extrabold ${summary.provAtrasadosCount > 0 ? 'text-rose-700' : 'text-stone-900'} mt-0.5 block">${summary.provAtrasadosCount}</span>
            </div>
            <div class="p-2.5 rounded-xl ${summary.provObservadosCount > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-stone-100/90 border border-stone-200'}">
              <span class="text-[10px] uppercase font-bold ${summary.provObservadosCount > 0 ? 'text-amber-800' : 'text-stone-600'} block">Observados Madero</span>
              <span class="text-base font-extrabold ${summary.provObservadosCount > 0 ? 'text-amber-800' : 'text-stone-900'} mt-0.5 block">${summary.provObservadosCount}</span>
            </div>
            <div class="p-2.5 rounded-xl ${summary.provPendMinutaCount > 0 ? 'bg-rose-50 border border-rose-200' : 'bg-stone-100/90 border border-stone-200'}">
              <span class="text-[10px] uppercase font-bold ${summary.provPendMinutaCount > 0 ? 'text-rose-800' : 'text-stone-600'} block">Minutas Pendientes</span>
              <span class="text-base font-extrabold ${summary.provPendMinutaCount > 0 ? 'text-rose-800' : 'text-stone-900'} mt-0.5 block">${summary.provPendMinutaCount}</span>
            </div>
            <div class="p-2.5 rounded-xl ${summary.provEscaladosCount > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-stone-100/90 border border-stone-200'}">
              <span class="text-[10px] uppercase font-bold ${summary.provEscaladosCount > 0 ? 'text-amber-800' : 'text-stone-600'} block">Escalados a Dirección</span>
              <span class="text-base font-extrabold ${summary.provEscaladosCount > 0 ? 'text-amber-800' : 'text-stone-900'} mt-0.5 block">${summary.provEscaladosCount}</span>
            </div>
            <div class="p-2.5 rounded-xl ${summary.horasAbsorbidasConsolidadas > 0 ? 'bg-rose-50 border border-rose-200' : 'bg-stone-100/90 border border-stone-200'}">
              <span class="text-[10px] uppercase font-bold ${summary.horasAbsorbidasConsolidadas > 0 ? 'text-rose-800' : 'text-stone-600'} block">Trabajo Absorbido</span>
              <span class="text-base font-extrabold ${summary.horasAbsorbidasConsolidadas > 0 ? 'text-rose-800' : 'text-stone-900'} mt-0.5 block">${summary.horasAbsorbidasConsolidadas.toFixed(1)} hs</span>
            </div>
          </div>
        </div>

        <!-- Tarjetas Comparativas por Proveedor -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          ${provCardsHtml}
        </div>

        <!-- Barra de Búsqueda y Filtros Multidimensionales -->
        <div class="glass-card p-4 space-y-3">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-[11px] font-bold text-stone-500 uppercase mr-1">Proveedor:</span>
              ${provFilterButtons}
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <div class="relative flex-1 sm:w-64">
                <input type="text" value="${esc(filters.search)}" oninput="MaderoProveedores.setFilter('search', this.value)" placeholder="Buscar por título, entregable, contacto..." class="input-glass w-full px-3 py-1.5 text-xs">
                ${filters.search ? `
                  <button type="button" onclick="MaderoProveedores.setFilter('search', '')" class="absolute right-2 top-1.5 text-xs text-stone-400 hover:text-stone-700">&times;</button>
                ` : ''}
              </div>

              <select onchange="MaderoProveedores.setFilter('estado', this.value)" class="input-glass text-xs py-1.5 px-2.5">
                <option value="ALL">Todos los Estados (${allCompromisos.length})</option>
                ${estadoOptions}
              </select>

              <select onchange="MaderoProveedores.setFilter('posicion', this.value)" class="input-glass text-xs py-1.5 px-2.5">
                <option value="ALL">Todas las Posiciones Madero</option>
                ${posicionOptions}
              </select>

              <button type="button" onclick="MaderoProveedores.resetFilters()" class="text-xs font-semibold text-stone-500 hover:text-stone-800 px-2 py-1">
                Limpiar filtros
              </button>
            </div>
          </div>

          <!-- Filtros Rápidos (Pills Activables) -->
          <div class="flex items-center gap-2 flex-wrap pt-2 border-t border-stone-200/60">
            <span class="text-[10px] uppercase font-bold text-stone-500">Filtros rápidos:</span>

            <button type="button" onclick="MaderoProveedores.setFilter('onlyDesvios', !filters.onlyDesvios)" class="px-2.5 py-1 rounded-lg text-xs font-semibold transition ${filters.onlyDesvios ? 'bg-rose-900 text-white shadow-xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'}">
              ${filters.onlyDesvios ? '✓ Solo Desvíos Activo' : 'Solo Desvíos (Atrasados + Observados)'}
            </button>

            <button type="button" onclick="MaderoProveedores.setFilter('onlyAbsorbido', !filters.onlyAbsorbido)" class="px-2.5 py-1 rounded-lg text-xs font-semibold transition ${filters.onlyAbsorbido ? 'bg-stone-900 text-white shadow-xs' : 'bg-stone-100 text-stone-800 hover:bg-stone-200'}">
              ${filters.onlyAbsorbido ? '✓ Trabajo Absorbido' : 'Con Trabajo Absorbido (> 0 hs)'}
            </button>

            <button type="button" onclick="MaderoProveedores.setFilter('onlyMinutaPendiente', !filters.onlyMinutaPendiente)" class="px-2.5 py-1 rounded-lg text-xs font-semibold transition ${filters.onlyMinutaPendiente ? 'bg-amber-900 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'}">
              ${filters.onlyMinutaPendiente ? '✓ Minuta Pendiente' : 'Minuta Pendiente (Sección 8)'}
            </button>

            <button type="button" onclick="MaderoProveedores.setFilter('onlyEscalado', !filters.onlyEscalado)" class="px-2.5 py-1 rounded-lg text-xs font-semibold transition ${filters.onlyEscalado ? 'bg-amber-900 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'}">
              ${filters.onlyEscalado ? '✓ Escalado a Dirección' : 'Escalado a Dirección'}
            </button>

            <button type="button" onclick="MaderoProveedores.setFilter('onlyVencidos', !filters.onlyVencidos)" class="px-2.5 py-1 rounded-lg text-xs font-semibold transition ${filters.onlyVencidos ? 'bg-rose-900 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}">
              ${filters.onlyVencidos ? '✓ Vencidos sin actualizar' : 'Vencidos sin actualizar'}
            </button>
          </div>
        </div>

        <!-- Tabla Trazable de Compromisos -->
        <div class="glass-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-stone-200/80 bg-stone-50/80 text-[10px] uppercase font-bold tracking-wider text-stone-600">
                  <th class="py-2.5 px-3">ID / Proveedor</th>
                  <th class="py-2.5 px-3">Compromiso & Entregable</th>
                  <th class="py-2.5 px-3">Fecha Pactada / Desvío</th>
                  <th class="py-2.5 px-3">Estado de Seguimiento</th>
                  <th class="py-2.5 px-3">Posición Madero & Minuta</th>
                  <th class="py-2.5 px-3">Trabajo Absorbido</th>
                  <th class="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200/60 text-xs">
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ========================================================================
  // OPERACIONES RÁPIDAS INLINE
  // ========================================================================
  function changeCompromisoEstado(id, nuevoEstado) {
    window.MaderoStore.setCompromisoEstado(id, nuevoEstado);
    window.MaderoUI.showToast(`Estado actualizado a ${nuevoEstado}`);
  }

  function quickSetAtrasado(id) {
    window.MaderoStore.setCompromisoEstado(id, 'ATRASADO');
    window.MaderoUI.showToast(`Compromiso ${id} marcado como ATRASADO`);
  }

  function deleteCompromisoConfirm(id) {
    if (confirm(`¿Estás seguro de que deseás eliminar el compromiso ${id}?`)) {
      window.MaderoStore.deleteCompromiso(id);
      window.MaderoUI.showToast(`Compromiso ${id} eliminado`, 'amber');
    }
  }

  // ========================================================================
  // MODAL EXPEDIENTE COMPLETO (Secciones 7 y 8)
  // ========================================================================
  function openCompromisoModal(id = null, defaultProv = 'REM') {
    const isEdit = Boolean(id);
    const item = isEdit
      ? window.MaderoStore.getState().proveedores_compromisos.find(c => c.id === id)
      : {
          id: '',
          proveedor_id: defaultProv,
          actor_id: defaultProv,
          titulo_compromiso: '',
          entregable_esperado: '',
          criterios_aceptacion: '',
          fecha_pactada_original: new Date().toISOString().slice(0, 10),
          fecha_limite: new Date().toISOString().slice(0, 10),
          responsable_contraparte: '',
          canal_oficial: 'Reunión semanal de seguimiento',
          estado: 'ASIGNADO',
          posicion_madero: 'EN_REVISION',
          observaciones_madero: '',
          reprogramaciones_count: 0,
          historial_reprogramaciones: [],
          minuta_formalizada: false,
          minuta_url: '',
          minuta_requiere_correccion: false,
          pasos_formalizacion_cumplidos: [],
          formalizacion_pasos: [false, false, false, false, false, false, false],
          tareas_vinculadas: [],
          horas_absorbidas_estimadas: 0,
          escalar_a_direccion: false,
          recomendacion_direccion: '',
          evidencia_url: '',
          evidencia_label: ''
        };

    if (!item) return;

    const state = window.MaderoStore.getState();
    const tasks = state.equipo_tareas || [];

    const itemProvId = item.actor_id || item.proveedor_id || (item.proveedor === 'REM' ? 'REM' : item.proveedor === 'L. Christian' ? 'CHRISTIAN_WEB' : 'OTRO_PRESTADOR') || defaultProv;
    const itemTitulo = item.titulo_compromiso || item.frente_alcance || item.pedido_detalle || '';
    const itemEntregable = item.entregable_esperado || item.pedido_detalle || '';
    const itemCriterios = item.criterios_aceptacion || item.posicion_madero_fundamento || '';
    const itemFechaOrig = item.fecha_acordada_original || item.fecha_pactada_original || new Date().toISOString().slice(0, 10);
    const itemFechaLim = item.fecha_acordada_actual || item.fecha_limite || new Date().toISOString().slice(0, 10);
    const itemContraparte = item.responsable_contraparte || item.proxima_accion_responsable || item.proveedor || '';
    const itemCanal = item.canal_oficial || 'Reunión semanal de seguimiento';
    const itemPos = item.posicion_madero_tipo || item.posicion_madero || 'EN_REVISION';
    const itemObs = item.observaciones_madero || item.posicion_madero_fundamento || '';
    const itemMinUrl = item.minuta_referencia || item.minuta_url || '';
    const itemHsManual = item.horas_absorbidas !== undefined ? item.horas_absorbidas : (item.horas_absorbidas_estimadas || 0);
    const itemRecDir = item.recomendacion_lider || item.recomendacion_direccion || '';

    // Opciones Proveedores
    const provSelect = Object.values(window.MaderoData.PROVEEDORES || {}).map(p =>
      `<option value="${p.id}" ${itemProvId === p.id ? 'selected' : ''}>${esc(p.nombre)} (${esc(p.nombreCorto || p.label)})</option>`
    ).join('');

    // Opciones Estados
    const estadoSelect = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
      `<option value="${st.id}" ${item.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`
    ).join('');

    // Opciones Posiciones Madero (filtra duplicados de ID si hubiere)
    const posVistas = {};
    const posSelect = Object.values(window.MaderoData.POSICIONES_MADERO || {}).filter(pos => {
      if (posVistas[pos.id]) return false;
      posVistas[pos.id] = true;
      return true;
    }).map(pos =>
      `<option value="${pos.id}" ${itemPos === pos.id ? 'selected' : ''}>${esc(pos.label)}</option>`
    ).join('');

    // Lista de Pasos de Formalización de Minutas (Sección 8)
    const pasosCat = window.MaderoData.PASOS_FORMALIZACION || [];
    const cumplidosActuales = Array.isArray(item.pasos_formalizacion_cumplidos) && item.pasos_formalizacion_cumplidos.length > 0
      ? item.pasos_formalizacion_cumplidos
      : (Array.isArray(item.formalizacion_pasos)
          ? item.formalizacion_pasos.map((val, idx) => val ? idx + 1 : null).filter(Boolean)
          : []);

    const pasosHtml = pasosCat.map(p => {
      const isChecked = cumplidosActuales.includes(p.num);
      return `
        <label class="flex items-start gap-2 p-2 rounded-xl bg-white border border-stone-200/70 hover:bg-stone-50 cursor-pointer">
          <input type="checkbox" name="paso_formalizacion" value="${p.num}" ${isChecked ? 'checked' : ''} class="mt-0.5 rounded border-stone-300 text-stone-900">
          <div>
            <div class="text-[11px] font-bold text-stone-900">${esc(p.label)}</div>
            <div class="text-[10px] text-stone-500">${esc(p.desc)}</div>
          </div>
        </label>
      `;
    }).join('');

    // Historial de Reprogramaciones HTML
    const reprogList = Array.isArray(item.historial_reprogramaciones) ? item.historial_reprogramaciones : [];
    const reprogHtml = reprogList.length === 0 ? `
      <div class="text-[11px] text-stone-500 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
        No se han registrado reprogramaciones formales para este compromiso.
      </div>
    ` : `
      <div class="space-y-1.5">
        ${reprogList.map((r, idx) => `
          <div class="p-2 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <span class="font-bold text-amber-950">#${idx + 1} (${formatDateDisplay(r.fecha_registro || r.registrado)}):</span>
              <span class="line-through text-stone-500">${formatDateDisplay(r.fecha_anterior)}</span> →
              <span class="font-extrabold text-stone-900">${formatDateDisplay(r.fecha_nueva)}</span>
              <span class="text-stone-600 ml-1">· ${esc(r.motivo)}</span>
            </div>
            <span class="text-[10px] font-semibold text-stone-500">${esc(r.autor || 'Ángelo Lucero')}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Selector de Tareas Internas Vinculadas (Trabajo Absorbido)
    const linkedTasks = Array.isArray(item.tareas_vinculadas) ? item.tareas_vinculadas : [];
    const tasksOptionsHtml = tasks.map(t => {
      const isLinked = linkedTasks.includes(t.id);
      return `
        <label class="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80 hover:bg-stone-50 cursor-pointer text-[11px]">
          <div class="flex items-center gap-2">
            <input type="checkbox" name="tarea_vinculada" value="${esc(t.id)}" ${isLinked ? 'checked' : ''} class="rounded border-stone-300 text-stone-900">
            <div>
              <span class="font-mono font-bold text-stone-900">${esc(t.id)}</span>
              <span class="text-stone-700 ml-1">${esc(t.titulo || t.tarea)}</span>
            </div>
          </div>
          <span class="font-mono font-extrabold ${t.es_trabajo_absorbido ? 'text-rose-700' : 'text-stone-600'}">${t.horas_estimadas} hs</span>
        </label>
      `;
    }).join('');

    window.MaderoUI.openModal({
      title: isEdit ? `Expediente de Proveedor: ${item.id}` : 'Nuevo Compromiso con Proveedor',
      subtitle: 'Sección 7 (Estructura de Expediente) y Sección 8 (Circuito de Formalización y Minutas)',
      maxWidth: 'max-w-3xl',
      bodyHtml: `
        <form id="form-compromiso" class="space-y-4">
          <input type="hidden" id="comp-id" value="${esc(item.id)}">

          <!-- Bloque 1: Identificación y Contraparte -->
          <div class="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div class="text-xs font-extrabold uppercase tracking-wider text-stone-700">Bloque 1 · Proveedor y Canal Oficial</div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Proveedor Expirado/Asignado</label>
                <select id="comp-proveedor" class="input-glass w-full px-3 py-2 text-xs">
                  ${provSelect}
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Responsable Contraparte</label>
                <input type="text" id="comp-contraparte" value="${esc(itemContraparte)}" placeholder="Ej: Lucas Christian / Tomás C." class="input-glass w-full px-3 py-2 text-xs" required>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Canal Oficial de Seguimiento</label>
                <input type="text" id="comp-canal" value="${esc(itemCanal)}" class="input-glass w-full px-3 py-2 text-xs" required>
              </div>
            </div>
          </div>

          <!-- Bloque 2: Definición y Entregable -->
          <div class="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div class="text-xs font-extrabold uppercase tracking-wider text-stone-700">Bloque 2 · Definición del Compromiso y Entregable</div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Título del Compromiso</label>
              <input type="text" id="comp-titulo" value="${esc(itemTitulo)}" class="input-glass w-full px-3 py-2 text-xs" required>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Entregable Esperado (Preciso y medible)</label>
              <textarea id="comp-entregable" rows="2" class="input-glass w-full px-3 py-2 text-xs leading-relaxed" required>${esc(itemEntregable)}</textarea>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Criterios de Aceptación Objetivos (Sección 7)</label>
              <textarea id="comp-criterios" rows="2" class="input-glass w-full px-3 py-2 text-xs leading-relaxed">${esc(itemCriterios)}</textarea>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha Pactada Original</label>
                <input type="date" id="comp-fecha-orig" value="${esc(itemFechaOrig)}" class="input-glass w-full px-3 py-2 text-xs" required>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha Límite Vigente</label>
                <input type="date" id="comp-fecha-limite" value="${esc(itemFechaLim)}" class="input-glass w-full px-3 py-2 text-xs" required>
              </div>
            </div>
          </div>

          <!-- Bloque 3: Estado de Seguimiento & Posición Oficial de Madero -->
          <div class="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div class="text-xs font-extrabold uppercase tracking-wider text-stone-700">Bloque 3 · Auditoría de Estado y Posición Madero</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Estado de Seguimiento (9 Oficiales)</label>
                <select id="comp-estado" class="input-glass w-full px-3 py-2 text-xs">
                  ${estadoSelect}
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Posición Oficial de Madero</label>
                <select id="comp-posicion" class="input-glass w-full px-3 py-2 text-xs">
                  ${posSelect}
                </select>
              </div>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Observaciones / Dictamen Crítico del Auditor (Ángelo)</label>
              <textarea id="comp-observaciones" rows="2" class="input-glass w-full px-3 py-2 text-xs leading-relaxed">${esc(itemObs)}</textarea>
            </div>
          </div>

          <!-- Bloque 4: Historial de Reprogramaciones (Sección 7) -->
          <div class="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase tracking-wider text-amber-950">Bloque 4 · Trazabilidad de Reprogramaciones (${reprogList.length})</span>
              <span class="text-[10px] text-amber-800">Sección 7 · Registro inalterable</span>
            </div>
            ${reprogHtml}
          </div>

          <!-- Bloque 5: Sección 8 · Minutas y Circuito de Formalización -->
          <div class="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase tracking-wider text-stone-800">Bloque 5 · Sección 8: Circuito de Formalización de Minutas</span>
              <span class="text-[10px] font-bold text-rose-700">Obligatorio en Desvíos</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${pasosHtml}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/80">
              <label class="flex items-center gap-2 text-xs font-bold text-stone-900 cursor-pointer">
                <input type="checkbox" id="comp-minuta-ok" ${item.minuta_formalizada ? 'checked' : ''} class="rounded border-stone-300 text-stone-900">
                <span>Minuta formalizada y archivada en Drive</span>
              </label>

              <label class="flex items-center gap-2 text-xs font-bold text-rose-700 cursor-pointer">
                <input type="checkbox" id="comp-minuta-correccion" ${item.minuta_requiere_correccion ? 'checked' : ''} class="rounded border-rose-300 text-rose-700">
                <span>Minuta requiere corrección o ajuste</span>
              </label>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Enlace a Minuta / Acta en Drive</label>
              <input type="text" id="comp-minuta-url" value="${esc(itemMinUrl)}" placeholder="https://drive.google.com/..." class="input-glass w-full px-3 py-2 text-xs">
            </div>
          </div>

          <!-- Bloque 6: Trabajo Absorbido por Madero & Tareas Vinculadas -->
          <div class="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase tracking-wider text-stone-800">Bloque 6 · Trabajo Absorbido por Madero</span>
              <span class="badge-pill badge-stone text-[10px]">Sin Doble Conteo</span>
            </div>
            <p class="text-[11px] text-stone-600 leading-relaxed">
              Si el equipo interno asumió tareas ante demoras del proveedor, seleccionalas debajo. Las horas se consolidarán automáticamente desde las tareas internas para evitar duplicaciones.
            </p>

            <div class="max-h-40 overflow-y-auto space-y-1.5 p-1">
              ${tasksOptionsHtml}
            </div>

            <div class="pt-2 border-t border-stone-200/80">
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Horas Absorbidas Manuales (Solo si no hay tareas internas vinculadas)</label>
              <input type="number" id="comp-horas-manual" step="0.5" min="0" value="${itemHsManual}" class="input-glass w-40 px-3 py-2 text-xs font-mono">
            </div>
          </div>

          <!-- Bloque 7: Escalación a Dirección & Recomendación -->
          <div class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase tracking-wider text-amber-950">Bloque 7 · Escalación a Dirección (Sección 1 y 9)</span>
              <span class="text-[10px] text-amber-800">Criterio Conducción</span>
            </div>
            <label class="flex items-center gap-2 text-xs font-bold text-stone-900 cursor-pointer">
              <input type="checkbox" id="comp-escalar" ${item.escalar_a_direccion ? 'checked' : ''} class="rounded border-amber-400 text-amber-900">
              <span>Escalar este caso a la bandeja de decisiones de Dirección</span>
            </label>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Dictamen / Recomendación Concreta de Ángelo para Dirección</label>
              <textarea id="comp-recomendacion" rows="2" class="input-glass w-full px-3 py-2 text-xs leading-relaxed" placeholder="Dictamen concreto del líder sobre la continuidad, penalidad o medida requerida...">${esc(itemRecDir)}</textarea>
            </div>
          </div>

          <!-- Bloque 8: Evidencia y Documentación Adjunta -->
          <div class="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div class="text-xs font-extrabold uppercase tracking-wider text-stone-700">Bloque 8 · Enlace a Evidencia Objetiva</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Etiqueta de Evidencia</label>
                <input type="text" id="comp-evid-label" value="${esc(item.evidencia_label)}" placeholder="Ej: Acta reunión 28/10 en Drive" class="input-glass w-full px-3 py-2 text-xs">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">URL de Evidencia</label>
                <input type="text" id="comp-evid-url" value="${esc(item.evidencia_url)}" placeholder="https://..." class="input-glass w-full px-3 py-2 text-xs">
              </div>
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200">Cancelar</button>
        <button type="button" onclick="MaderoProveedores.saveCompromisoModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800">Guardar Expediente</button>
      `
    });
  }

  // Guardar Expediente desde Modal
  function saveCompromisoModal() {
    const id = document.getElementById('comp-id').value;
    const isEdit = Boolean(id);

    // Recolectar checkboxes de pasos de formalización
    const pasosChecked = Array.from(document.querySelectorAll('input[name="paso_formalizacion"]:checked'))
      .map(cb => parseInt(cb.value, 10));

    // Recolectar tareas vinculadas
    const tareasVinculadas = Array.from(document.querySelectorAll('input[name="tarea_vinculada"]:checked'))
      .map(cb => cb.value);

    const existing = isEdit ? window.MaderoStore.getState().proveedores_compromisos.find(c => c.id === id) : null;

    const provVal = document.getElementById('comp-proveedor').value;
    const contraparteVal = document.getElementById('comp-contraparte').value.trim();
    const canalVal = document.getElementById('comp-canal').value.trim();
    const tituloVal = document.getElementById('comp-titulo').value.trim();
    const entregableVal = document.getElementById('comp-entregable').value.trim();
    const criteriosVal = document.getElementById('comp-criterios').value.trim();
    const fechaOrigVal = document.getElementById('comp-fecha-orig').value;
    const fechaLimVal = document.getElementById('comp-fecha-limite').value;
    const estadoVal = document.getElementById('comp-estado').value;
    const posVal = document.getElementById('comp-posicion').value;
    const obsVal = document.getElementById('comp-observaciones').value.trim();
    const minutaOkVal = document.getElementById('comp-minuta-ok').checked;
    const minutaCorrecVal = document.getElementById('comp-minuta-correccion').checked;
    const minUrlVal = document.getElementById('comp-minuta-url').value.trim();
    const hsManualVal = parseFloat(document.getElementById('comp-horas-manual').value) || 0;
    const escalarVal = document.getElementById('comp-escalar').checked;
    const recVal = document.getElementById('comp-recomendacion').value.trim();
    const evidLabelVal = document.getElementById('comp-evid-label').value.trim();
    const evidUrlVal = document.getElementById('comp-evid-url').value.trim();

    // Crear arreglo de booleanos para formalizacion_pasos
    const formalizacionPasosArr = [1, 2, 3, 4, 5, 6, 7].map(num => pasosChecked.includes(num));

    const payload = {
      id: id || undefined,
      proveedor_id: provVal,
      actor_id: provVal,
      proveedor: provVal === 'REM' ? 'REM' : provVal === 'CHRISTIAN_WEB' ? 'L. Christian' : 'Otro Prestador',
      responsable_contraparte: contraparteVal,
      proxima_accion_responsable: contraparteVal,
      canal_oficial: canalVal,
      titulo_compromiso: tituloVal,
      frente_alcance: tituloVal,
      entregable_esperado: entregableVal,
      pedido_detalle: entregableVal,
      criterios_aceptacion: criteriosVal,
      posicion_madero: posVal,
      posicion_madero_tipo: posVal,
      posicion_madero_fundamento: obsVal,
      observaciones_madero: obsVal,
      fecha_pactada_original: fechaOrigVal,
      fecha_acordada_original: fechaOrigVal,
      fecha_limite: fechaLimVal,
      fecha_acordada_actual: fechaLimVal,
      estado: estadoVal,
      minuta_formalizada: minutaOkVal,
      minuta_requiere_correccion: minutaCorrecVal,
      minuta_url: minUrlVal,
      minuta_referencia: minUrlVal,
      pasos_formalizacion_cumplidos: pasosChecked,
      formalizacion_pasos: formalizacionPasosArr,
      tareas_vinculadas: tareasVinculadas,
      horas_absorbidas_estimadas: hsManualVal,
      horas_absorbidas: hsManualVal,
      hubo_trabajo_absorbido: hsManualVal > 0 || tareasVinculadas.length > 0,
      escalar_a_direccion: escalarVal,
      recomendacion_direccion: recVal,
      recomendacion_lider: recVal,
      evidencia_label: evidLabelVal,
      evidencia_url: evidUrlVal,
      historial_reprogramaciones: existing ? existing.historial_reprogramaciones : [],
      reprogramaciones_count: existing ? (existing.reprogramaciones_count || (Array.isArray(existing.historial_reprogramaciones) ? existing.historial_reprogramaciones.length : 0)) : 0
    };

    window.MaderoStore.upsertCompromiso(payload);
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast(isEdit ? `Expediente ${id} actualizado` : 'Nuevo compromiso registrado');
  }

  // ========================================================================
  // MODAL REGISTRO DE REPROGRAMACIÓN FORMAL (Sección 7)
  // ========================================================================
  function openReprogramarModal(id) {
    const item = window.MaderoStore.getState().proveedores_compromisos.find(c => c.id === id);
    if (!item) return;

    window.MaderoUI.openModal({
      title: `Registrar Reprogramación Formal: ${item.id}`,
      subtitle: `Compromiso: ${item.titulo_compromiso}`,
      maxWidth: 'max-w-md',
      bodyHtml: `
        <div class="space-y-3">
          <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-stone-800">
            <strong>Fecha límite vigente actual:</strong> ${formatDateDisplay(item.fecha_limite)}
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Nueva Fecha Límite Pactada</label>
            <input type="date" id="reprog-nueva-fecha" value="${esc(item.fecha_limite)}" class="input-glass w-full px-3 py-2 text-xs" required>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Motivo Formal del Desvío / Justificación</label>
            <textarea id="reprog-motivo" rows="3" class="input-glass w-full px-3 py-2 text-xs leading-relaxed" placeholder="Explicación objetiva brindada por la contraparte o constatada por Madero..." required></textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Registrado por (Responsable de Control)</label>
            <input type="text" id="reprog-autor" value="Ángelo Lucero" class="input-glass w-full px-3 py-2 text-xs" required>
          </div>
        </div>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoProveedores.saveReprogramacionModal('${esc(item.id)}')" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800">Registrar Reprogramación</button>
      `
    });
  }

  function saveReprogramacionModal(id) {
    const fechaNueva = document.getElementById('reprog-nueva-fecha').value;
    const motivo = document.getElementById('reprog-motivo').value.trim();
    const autor = document.getElementById('reprog-autor').value.trim();

    if (!fechaNueva || !motivo) {
      alert('Por favor completá la nueva fecha y el motivo formal.');
      return;
    }

    window.MaderoStore.reprogramarCompromiso(id, fechaNueva, motivo, autor);
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast(`Compromiso ${id} reprogramado al ${formatDateDisplay(fechaNueva)}`, 'amber');
  }

  // ========================================================================
  // EXPORTACIÓN CSV CON BOM UTF-8 (Sección 9)
  // ========================================================================
  function exportCSV() {
    const list = getFilteredCompromisos();
    const dateStr = (window.MaderoStore.getState().meta.fecha_corte || 'corte').replace(/[^0-9-]/g, '');
    const filename = `madero_auditoria_proveedores_${dateStr}.csv`;

    const headers = [
      'ID',
      'Proveedor',
      'Responsable Contraparte',
      'Canal Oficial',
      'Título Compromiso',
      'Entregable Esperado',
      'Criterios Aceptación',
      'Fecha Pactada Original',
      'Fecha Límite Vigente',
      'Reprogramaciones Cantidad',
      'Estado Seguimiento',
      'Posición Madero',
      'Minuta Formalizada',
      'Minuta URL',
      'Tareas Internas Vinculadas',
      'Horas Absorbidas Computadas',
      'Escalado Dirección',
      'Recomendación Ángelo',
      'Evidencia Label',
      'Evidencia URL'
    ];

    const rows = list.map(c => {
      const provKey = c.actor_id || c.proveedor_id || (c.proveedor === 'REM' ? 'REM' : c.proveedor === 'L. Christian' ? 'CHRISTIAN_WEB' : 'OTRO_PRESTADOR');
      const provInfo = (window.MaderoData.PROVEEDORES && window.MaderoData.PROVEEDORES[provKey]) || { nombreCorto: c.proveedor || provKey };
      const titulo = c.titulo_compromiso || c.frente_alcance || c.pedido_detalle;
      const entregable = c.entregable_esperado || c.pedido_detalle;
      const criterios = c.criterios_aceptacion || c.posicion_madero_fundamento;
      const resp = c.responsable_contraparte || c.proxima_accion_responsable || c.proveedor;
      const canal = c.canal_oficial || 'Reunión / Minuta';
      const fechaOrig = c.fecha_acordada_original || c.fecha_pactada_original;
      const fechaLim = c.fecha_acordada_actual || c.fecha_limite;
      const posMadero = c.posicion_madero_tipo || c.posicion_madero;
      const minUrl = c.minuta_referencia || c.minuta_url;
      const recDir = c.recomendacion_lider || c.recomendacion_direccion;
      const reprogCount = c.reprogramaciones_count || (Array.isArray(c.historial_reprogramaciones) ? c.historial_reprogramaciones.length : 0);

      return [
        c.id,
        provInfo.nombreCorto,
        resp,
        canal,
        titulo,
        entregable,
        criterios,
        fechaOrig,
        fechaLim,
        reprogCount,
        c.estado,
        posMadero,
        c.minuta_formalizada ? 'SI' : 'NO',
        minUrl,
        (c.tareas_vinculadas || []).join('; '),
        window.MaderoStore.getHorasAbsorbidasCompromiso(c),
        c.escalar_a_direccion ? 'SI' : 'NO',
        recDir,
        c.evidencia_label,
        c.evidencia_url
      ];
    });

    window.MaderoStore.exportCSV(filename, headers, rows);
    window.MaderoUI.showToast(`Exportado ${list.length} compromisos a CSV`);
  }

  return {
    renderModule,
    setFilter,
    resetFilters,
    changeCompromisoEstado,
    quickSetAtrasado,
    deleteCompromisoConfirm,
    openCompromisoModal,
    saveCompromisoModal,
    openReprogramarModal,
    saveReprogramacionModal,
    exportCSV
  };
})();
