/* ==========================================================================
   Madero Automotores · Control Integral de Marketing
   Cluster Contenido & Pauta (Paso 4):
   - Módulo 4: Contenido y Piezas Audiovisuales (Sección 4 y 5.4)
   - Módulo 5: Redes Sociales Multicanal: IG, FB, TikTok y YouTube (Sección 5.5)
   - Módulo 6: Campañas Pagas, Presupuesto, Calidad de Lead y Recomendación (Sección 4 y 5.6)
   ========================================================================== */

window.MaderoContenidoPauta = (function () {
  // Estado local de filtros para Módulo 4 (Contenido)
  let filtersContenido = {
    search: '',
    etapa: 'ALL',
    actor: 'ALL',
    plaza: 'ALL',
    onlyObservadas: false,
    onlyAbsorbido: false
  };

  // Estado local de filtros para Módulo 6 (Campañas Pagas)
  let filtersCampanas = {
    search: '',
    plataforma: 'ALL',
    calidadLead: 'ALL',
    plaza: 'ALL',
    onlyObservadas: false
  };

  function esc(val) {
    return window.MaderoUI ? window.MaderoUI.esc(val) : String(val || '');
  }

  function formatMoney(num) {
    if (num === null || num === undefined || num === '') return '$ 0';
    return '$ ' + Number(num).toLocaleString('es-AR');
  }

  function formatNumber(num) {
    if (num === null || num === undefined || num === '') return '0';
    return Number(num).toLocaleString('es-AR');
  }

  // ------------------------------------------------------------------------
  // HELPERS DE BADGES ESPECÍFICOS DE PASO 4
  // ------------------------------------------------------------------------
  function etapaContenidoBadge(etapaId) {
    const cat = (window.MaderoData.ETAPAS_CONTENIDO && window.MaderoData.ETAPAS_CONTENIDO[etapaId]) || {
      label: etapaId || 'Planificado',
      badge: 'badge-stone',
      dot: 'bg-stone-500'
    };
    return `<span class="badge-pill ${cat.badge}"><span class="w-1.5 h-1.5 rounded-full ${cat.dot}"></span>${esc(cat.label)}</span>`;
  }

  function calidadLeadBadge(calidadId) {
    const cat = (window.MaderoData.CALIDAD_LEADS && window.MaderoData.CALIDAD_LEADS[calidadId]) || {
      label: calidadId || 'Media',
      shortLabel: calidadId || 'Media',
      badge: 'badge-amber',
      dot: 'bg-amber-500'
    };
    return `<span class="badge-pill ${cat.badge}"><span class="w-1.5 h-1.5 rounded-full ${cat.dot}"></span>${esc(cat.shortLabel || cat.label)}</span>`;
  }

  function decisionCampanaBadge(decId) {
    const cat = (window.MaderoData.DECISIONES_CAMPANA && window.MaderoData.DECISIONES_CAMPANA[decId]) || {
      label: decId || 'Mantener y optimizar',
      badge: 'badge-blue'
    };
    return `<span class="badge-pill ${cat.badge}">${esc(cat.label)}</span>`;
  }

  // ------------------------------------------------------------------------
  // BARRA DE SUB-NAVEGACIÓN DEL CLUSTER (Módulos 4, 5 y 6)
  // ------------------------------------------------------------------------
  function renderClusterSubnav(activeModId) {
    const sum = window.MaderoStore.getComputedSummary();
    const tabs = [
      {
        id: 'm4-contenido',
        num: 'Módulo 4',
        title: 'Contenido y Piezas',
        meta: `${sum.contPublicadosCount}/${sum.contTotal} publicadas · ${sum.contObservadosCount} obs.`,
        icon: '🎬'
      },
      {
        id: 'm5-redes',
        num: 'Módulo 5',
        title: 'Redes Sociales (IG · FB · TikTok · YT)',
        meta: `${sum.redesFrecRealTotal}/${sum.redesFrecPlanTotal} sem. (${sum.redesCumplimientoFrecPct}%)`,
        icon: '📱'
      },
      {
        id: 'm6-campanas',
        num: 'Módulo 6',
        title: 'Campañas Pagas & Calidad Lead',
        meta: `${sum.campLeadsTotal} leads · CPL ${formatMoney(sum.campCplPromedio)}`,
        icon: '🎯'
      }
    ];

    return `
      <div class="glass-card p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-1.5 flex-1">
          ${tabs.map(t => {
            const active = t.id === activeModId;
            return `
              <button type="button" onclick="MaderoApp.navigateModule('${t.id}')" class="px-3.5 py-2 rounded-xl text-left transition flex items-center gap-2.5 ${active ? 'bg-stone-900 text-white shadow-sm' : 'bg-white/70 hover:bg-white text-stone-700 border border-stone-200/80'}">
                <span class="text-base">${t.icon}</span>
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono text-[10px] font-bold uppercase ${active ? 'text-amber-300' : 'text-stone-500'}">${esc(t.num)}</span>
                    <span class="text-xs font-extrabold tracking-tight">${esc(t.title)}</span>
                  </div>
                  <span class="text-[10px] font-mono block ${active ? 'text-stone-300' : 'text-stone-500'}">${esc(t.meta)}</span>
                </div>
              </button>
            `;
          }).join('')}
        </div>
        <div class="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100/90 border border-stone-200/80 text-[11px] text-stone-600">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span><strong>Sección 4:</strong> REM ejecuta piezas/pauta contratada · Madero define prioridad, presupuesto y aprueba calidad</span>
        </div>
      </div>
    `;
  }

  // ========================================================================
  // MÓDULO 4: CONTENIDO Y PIEZAS AUDIOVISUALES (Sección 4 y 5.4)
  // ========================================================================
  function setContenidoSearch(val) {
    filtersContenido.search = val;
    window.MaderoApp.renderAll();
  }

  function setContenidoFilter(key, val) {
    filtersContenido[key] = val;
    window.MaderoApp.renderAll();
  }

  function toggleContenidoFlag(key) {
    filtersContenido[key] = !filtersContenido[key];
    window.MaderoApp.renderAll();
  }

  function resetContenidoFilters() {
    filtersContenido = {
      search: '',
      etapa: 'ALL',
      actor: 'ALL',
      plaza: 'ALL',
      onlyObservadas: false,
      onlyAbsorbido: false
    };
    window.MaderoApp.renderAll();
  }

  function getFilteredContenido() {
    const list = window.MaderoStore.getState().contenido_piezas || [];
    const q = filtersContenido.search.trim().toLowerCase();

    return list.filter(item => {
      if (filtersContenido.etapa !== 'ALL' && item.etapa_contenido !== filtersContenido.etapa) return false;
      if (filtersContenido.actor !== 'ALL' && item.actor_id !== filtersContenido.actor) return false;
      if (filtersContenido.plaza !== 'ALL' && item.plaza !== filtersContenido.plaza) return false;
      if (filtersContenido.onlyObservadas) {
        const isObs = item.etapa_contenido === 'OBSERVADO' || item.estado === 'OBSERVADO_MADERO' || item.estado === 'DEVUELTO_CORRECCION' || item.estado === 'ATRASADO';
        if (!isObs) return false;
      }
      if (filtersContenido.onlyAbsorbido && !item.trabajo_absorbido) return false;

      if (q) {
        const hay = [
          item.id,
          item.titulo,
          item.formato,
          item.canal_destino,
          item.plaza,
          item.responsable_nombre,
          item.observacion_madero,
          item.resultado_metricas
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function quickChangeEtapaContenido(id, nuevaEtapa) {
    window.MaderoStore.setContenidoEtapa(id, nuevaEtapa);
    window.MaderoUI.showToast(`Pieza ${id} actualizada a etapa: ${nuevaEtapa}`);
  }

  function quickChangeEstadoContenido(id, nuevoEstado) {
    window.MaderoStore.setContenidoEstado(id, nuevoEstado);
    window.MaderoUI.showToast(`Estado de ${id} actualizado`);
  }

  function renderContenidoModule() {
    const state = window.MaderoStore.getState();
    const allPiezas = state.contenido_piezas || [];
    const filtered = getFilteredContenido();
    const sum = window.MaderoStore.getComputedSummary();

    // Circuito de 6 etapas interactivo
    const etapasOrder = ['PLANIFICADO', 'PRODUCIDO', 'ENVIADO', 'OBSERVADO', 'APROBADO', 'PUBLICADO'];
    const pipelineHtml = etapasOrder.map(etKey => {
      const cat = window.MaderoData.ETAPAS_CONTENIDO[etKey];
      const count = allPiezas.filter(p => p.etapa_contenido === etKey).length;
      const isSelected = filtersContenido.etapa === etKey;
      const isWarning = etKey === 'OBSERVADO' && count > 0;

      return `
        <button type="button" onclick="MaderoContenidoPauta.setContenidoFilter('etapa', '${isSelected ? 'ALL' : etKey}')" class="p-3 rounded-2xl text-left transition border flex flex-col justify-between ${isSelected ? 'bg-stone-900 text-white border-stone-900 shadow-md' : isWarning ? 'bg-amber-50/90 hover:bg-amber-100/80 border-amber-300 text-stone-900' : 'bg-white/80 hover:bg-white border-stone-200/90 text-stone-900'}">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-stone-300' : 'text-stone-500'}">${esc(cat.label)}</span>
            <span class="w-2 h-2 rounded-full ${cat.dot}"></span>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="font-mono text-xl sm:text-2xl font-extrabold">${count}</span>
            <span class="text-[10px] font-semibold ${isSelected ? 'text-amber-300' : 'text-stone-500'}">${isSelected ? 'Filtro activo ✓' : 'Filtrar →'}</span>
          </div>
        </button>
      `;
    }).join('');

    const rowsHtml = filtered.length === 0 ? `
      <tr>
        <td colspan="7" class="py-10 text-center text-xs text-stone-500">No se encontraron piezas audiovisuales o gráficas con los filtros aplicados.</td>
      </tr>
    ` : filtered.map(p => {
      const etapaOpts = Object.values(window.MaderoData.ETAPAS_CONTENIDO).map(et =>
        `<option value="${et.id}" ${p.etapa_contenido === et.id ? 'selected' : ''}>${esc(et.label)}</option>`
      ).join('');

      const estadoOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
        `<option value="${st.id}" ${p.estado === st.id ? 'selected' : ''}>${esc(st.shortLabel)}</option>`
      ).join('');

      const isObsOrDelay = p.etapa_contenido === 'OBSERVADO' || p.estado === 'OBSERVADO_MADERO' || p.estado === 'ATRASADO';

      return `
        <tr class="hover:bg-white/60 transition align-top ${p.trabajo_absorbido ? 'bg-rose-50/35' : isObsOrDelay ? 'bg-amber-50/30' : ''}">
          <td class="py-3.5 px-3 whitespace-nowrap">
            <span class="font-mono font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(p.id)}</span>
            <span class="text-[10px] font-bold text-stone-600 block mt-1.5">${esc(p.formato)}</span>
            <span class="text-[10px] text-stone-500 block">${esc(p.canal_destino)}</span>
          </td>

          <td class="py-3.5 px-3 min-w-[240px] max-w-[330px]">
            <button type="button" onclick="MaderoContenidoPauta.openPiezaModal('${esc(p.id)}')" class="text-left group">
              <span class="font-bold text-stone-900 group-hover:text-blue-900 text-xs block leading-snug">${esc(p.titulo)}</span>
            </button>
            <div class="text-[10px] text-stone-600 mt-1 flex items-center gap-1">
              <span>📍</span><span>${esc(p.plaza)}</span>
            </div>
            ${p.trabajo_absorbido ? `
              <div class="mt-1.5 p-2 rounded-lg bg-rose-100/85 border border-rose-300 text-[10px] text-rose-950 leading-snug">
                <strong>🛡️ TRABAJO ABSORBIDO:</strong> ${esc(p.trabajo_absorbido_detalle)}
              </div>
            ` : ''}
            ${p.enlace_pieza ? `
              <a href="${esc(p.enlace_pieza)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-blue-800 hover:underline">
                🔗 Ver pieza / carpeta en Drive ↗
              </a>
            ` : ''}
          </td>

          <td class="py-3.5 px-3 min-w-[155px]">
            <div class="mb-1">${window.MaderoUI.actorBadge(p.actor_id, false)}</div>
            <span class="text-[10px] text-stone-600 block leading-snug">${esc(p.responsable_nombre)}</span>
          </td>

          <td class="py-3.5 px-3 whitespace-nowrap">
            <div class="mb-1.5">${etapaContenidoBadge(p.etapa_contenido)}</div>
            <select onchange="MaderoContenidoPauta.quickChangeEtapaContenido('${esc(p.id)}', this.value)" class="text-[10px] bg-white border border-stone-300 rounded-lg px-2 py-1 text-stone-800 font-semibold focus:outline-none w-full">
              ${etapaOpts}
            </select>
          </td>

          <td class="py-3.5 px-3 whitespace-nowrap">
            <div class="font-mono text-[11px] text-stone-800 font-semibold">Acordada: ${window.MaderoUI.formatDateDisplay(p.fecha_acordada)}</div>
            <div class="font-mono text-[10px] text-emerald-800 mb-1.5">Publicada: ${p.fecha_publicacion_real ? window.MaderoUI.formatDateDisplay(p.fecha_publicacion_real) : 'Pendiente'}</div>
            <div class="mb-1">${window.MaderoUI.estadoBadge(p.estado, true)}</div>
            <select onchange="MaderoContenidoPauta.quickChangeEstadoContenido('${esc(p.id)}', this.value)" class="text-[10px] bg-white border border-stone-300 rounded-lg px-2 py-1 text-stone-700 font-medium focus:outline-none w-full">
              ${estadoOpts}
            </select>
          </td>

          <td class="py-3.5 px-3 min-w-[250px] max-w-[340px]">
            <div class="p-2 rounded-xl ${p.etapa_contenido === 'OBSERVADO' || p.estado === 'OBSERVADO_MADERO' ? 'bg-amber-100/80 border border-amber-300 text-amber-950' : 'bg-stone-100/80 border border-stone-200/80 text-stone-700'} text-[11px] leading-snug mb-1.5">
              <strong class="block text-[10px] uppercase tracking-wider text-stone-900 mb-0.5">Posición / Observación Madero:</strong>
              ${esc(p.observacion_madero || 'Sin observaciones registradas.')}
            </div>
            ${p.resultado_metricas ? `
              <div class="text-[10px] text-stone-600 leading-snug">
                <strong class="text-stone-800">📊 Resultado:</strong> ${esc(p.resultado_metricas)}
              </div>
            ` : ''}
          </td>

          <td class="py-3.5 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoContenidoPauta.openPiezaModal('${esc(p.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800">
                Editar
              </button>
              <button type="button" onclick="MaderoContenidoPauta.handleDeletePieza('${esc(p.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold" title="Eliminar pieza">
                ×
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="space-y-5">
        ${renderClusterSubnav('m4-contenido')}

        <!-- Encabezado y Circuito Editorial de 6 Etapas -->
        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="badge-pill badge-dark font-mono">Módulo 4 de 12</span>
                <span class="badge-pill badge-emerald">Operativo · Paso 4</span>
                <span class="badge-pill badge-blue">Sección 4 y 5.4 · Trazabilidad Editorial</span>
              </div>
              <h2 class="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">Control de Contenido y Piezas Audiovisuales / Gráficas</h2>
              <p class="text-xs text-stone-600 mt-0.5">
                Recorrido completo exigido por Dirección: <strong>Planificado → Producido → Enviado → Observado / Aprobado → Publicado</strong>, diferenciando entregas de <strong>REM</strong> vs <strong>Producción Interna</strong>.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <button type="button" onclick="MaderoStore.exportContenidoCSV(MaderoContenidoPauta.getFilteredContenido()); MaderoUI.showToast('CSV de Contenido descargado')" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                ⬇ Exportar CSV
              </button>
              <button type="button" onclick="MaderoContenidoPauta.openPiezaModal(null)" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm">
                + Nueva Pieza de Contenido
              </button>
            </div>
          </div>

          <!-- Pipeline Interactivo de 6 Etapas -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-stone-600">Circuito Editorial de 6 Etapas (Clic para filtrar bandeja)</span>
              <span class="text-[11px] text-stone-500 font-mono">REM: ${sum.contRemCount} piezas · Mkt Interno: ${sum.contInternoCount} piezas · Absorbidas: ${sum.contAbsorbidosCount}</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              ${pipelineHtml}
            </div>
          </div>
        </div>

        <!-- Tabla de Seguimiento de Piezas -->
        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
              <input type="text" id="contenido-search-input" value="${esc(filtersContenido.search)}" oninput="MaderoContenidoPauta.setContenidoSearch(this.value)" placeholder="Buscar pieza, formato, plaza, observación..." class="input-glass px-3.5 py-2 w-full sm:w-64">

              <select onchange="MaderoContenidoPauta.setContenidoFilter('actor', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Todos los Responsables</option>
                <option value="REM" ${filtersContenido.actor === 'REM' ? 'selected' : ''}>REM (Agencia Externa)</option>
                <option value="MKT_INTERNO" ${filtersContenido.actor === 'MKT_INTERNO' ? 'selected' : ''}>Marketing Interno</option>
                <option value="OTRO_PRESTADOR" ${filtersContenido.actor === 'OTRO_PRESTADOR' ? 'selected' : ''}>Otros Prestadores</option>
              </select>

              <select onchange="MaderoContenidoPauta.setContenidoFilter('plaza', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Todas las Plazas</option>
                ${window.MaderoData.PLAZAS.map(pl => `<option value="${esc(pl)}" ${filtersContenido.plaza === pl ? 'selected' : ''}>${esc(pl)}</option>`).join('')}
              </select>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button type="button" onclick="MaderoContenidoPauta.toggleContenidoFlag('onlyObservadas')" class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${filtersContenido.onlyObservadas ? 'bg-amber-600 text-white border-amber-700' : 'bg-amber-50 text-amber-900 border-amber-200'}">
                ⚠ Observadas / Atrasadas (${sum.contObservadosCount + sum.contAtrasadosCount})
              </button>
              <button type="button" onclick="MaderoContenidoPauta.toggleContenidoFlag('onlyAbsorbido')" class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${filtersContenido.onlyAbsorbido ? 'bg-rose-600 text-white border-rose-700' : 'bg-rose-50 text-rose-900 border-rose-200'}">
                🛡️ Trabajo Absorbido (${sum.contAbsorbidosCount})
              </button>
              ${(filtersContenido.search || filtersContenido.etapa !== 'ALL' || filtersContenido.actor !== 'ALL' || filtersContenido.plaza !== 'ALL' || filtersContenido.onlyObservadas || filtersContenido.onlyAbsorbido)
                ? `<button type="button" onclick="MaderoContenidoPauta.resetContenidoFilters()" class="text-xs font-semibold text-stone-500 hover:text-stone-900 underline">Limpiar filtros</button>`
                : ''}
            </div>
          </div>

          <div class="overflow-x-auto -mx-1 sm:mx-0 rounded-xl border border-stone-200/70 bg-white/50">
            <table class="w-full text-left text-xs min-w-[980px]">
              <thead>
                <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                  <th class="py-3 px-3">ID / Formato</th>
                  <th class="py-3 px-3">Pieza / Plaza / Evidencia Drive</th>
                  <th class="py-3 px-3">Actor / Elaboración</th>
                  <th class="py-3 px-3">Etapa Flujo (Secc. 5.4)</th>
                  <th class="py-3 px-3">Fechas y Estado</th>
                  <th class="py-3 px-3">Observación de Madero y Resultado</th>
                  <th class="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200/60">
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function openPiezaModal(id) {
    const list = window.MaderoStore.getState().contenido_piezas || [];
    const existing = id ? list.find(i => i.id === id) : null;
    const item = existing || {
      id: '',
      titulo: '',
      formato: 'Reel / Short Vertical',
      canal_destino: 'Instagram / TikTok',
      plaza: 'Comodoro · Av. Polonia 546 (Salón Principal)',
      actor_id: 'REM',
      responsable_nombre: 'REM (Agencia Externa)',
      etapa_contenido: 'PLANIFICADO',
      estado: 'PENDIENTE_INICIO',
      fecha_acordada: window.MaderoStore.getState().meta.fecha_corte || '2026-11-06',
      fecha_publicacion_real: '',
      observacion_madero: '',
      enlace_pieza: '',
      resultado_metricas: '',
      trabajo_absorbido: false,
      trabajo_absorbido_detalle: ''
    };

    const formatosOpts = (window.MaderoData.FORMATOS_CONTENIDO || []).map(f =>
      `<option value="${esc(f)}" ${item.formato === f ? 'selected' : ''}>${esc(f)}</option>`
    ).join('');

    const plazasOpts = (window.MaderoData.PLAZAS || []).map(pl =>
      `<option value="${esc(pl)}" ${item.plaza === pl ? 'selected' : ''}>${esc(pl)}</option>`
    ).join('');

    const etapasOpts = Object.values(window.MaderoData.ETAPAS_CONTENIDO).map(et =>
      `<option value="${et.id}" ${item.etapa_contenido === et.id ? 'selected' : ''}>${esc(et.label)}</option>`
    ).join('');

    const estadosOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
      `<option value="${st.id}" ${item.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`
    ).join('');

    window.MaderoUI.openModal({
      title: existing ? `Editar Pieza de Contenido · ${existing.id}` : 'Registrar Nueva Pieza de Contenido',
      subtitle: 'Sección 4 y 5.4 · Control de piezas contratadas a REM u otros prestadores y producción audiovisual interna.',
      maxWidth: 'max-w-2xl',
      bodyHtml: `
        <form id="form-contenido-pieza" class="space-y-3.5">
          <input type="hidden" id="cnt-id" value="${esc(item.id)}">

          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Título / Concepto de la Pieza *</label>
            <input type="text" id="cnt-titulo" value="${esc(item.titulo)}" placeholder="Ej: Reel Comparativo Pickups Stock Inmediato Polonia" class="input-glass w-full px-3 py-2" required>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Formato</label>
              <select id="cnt-formato" class="input-glass w-full px-3 py-2">
                ${formatosOpts}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Canales de Destino</label>
              <input type="text" id="cnt-canal" value="${esc(item.canal_destino)}" placeholder="Instagram / TikTok / YouTube" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Plaza Territorial</label>
              <select id="cnt-plaza" class="input-glass w-full px-3 py-2">
                ${plazasOpts}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Actor Responsable Principal (Sección 4)</label>
              <select id="cnt-actor" class="input-glass w-full px-3 py-2">
                <option value="REM" ${item.actor_id === 'REM' ? 'selected' : ''}>REM (Agencia Externa)</option>
                <option value="MKT_INTERNO" ${item.actor_id === 'MKT_INTERNO' ? 'selected' : ''}>Marketing Interno</option>
                <option value="OTRO_PRESTADOR" ${item.actor_id === 'OTRO_PRESTADOR' ? 'selected' : ''}>Otro Prestador Externo</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Detalle Responsable / Equipo</label>
              <input type="text" id="cnt-resp-nombre" value="${esc(item.responsable_nombre)}" placeholder="Ej: REM (Edición) / Mkt Interno (Crudos)" class="input-glass w-full px-3 py-2">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-stone-100/80 border border-stone-200/80">
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Etapa del Circuito Editorial (6 Etapas)</label>
              <select id="cnt-etapa" class="input-glass w-full px-3 py-2 font-semibold">
                ${etapasOpts}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Estado Oficial de Seguimiento (9 Estados)</label>
              <select id="cnt-estado" class="input-glass w-full px-3 py-2">
                ${estadosOpts}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha Acordada de Entrega / Salida</label>
              <input type="date" id="cnt-fecha-acordada" value="${esc(item.fecha_acordada)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha Real de Publicación</label>
              <input type="date" id="cnt-fecha-real" value="${esc(item.fecha_publicacion_real)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Observación de Calidad de Madero / Criterio de Aprobación o Rechazo</label>
            <textarea id="cnt-observacion" rows="2" placeholder="Indicá qué aprobó u observó Madero (ej. error de precio, placa legal, audio, iluminación) y referencia a minuta..." class="input-glass w-full px-3 py-2">${esc(item.observacion_madero)}</textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Enlace a Pieza / Carpeta Drive / Post</label>
              <input type="url" id="cnt-enlace" value="${esc(item.enlace_pieza)}" placeholder="https://drive.google.com/..." class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Resultado / Desempeño de Publicación</label>
              <input type="text" id="cnt-resultado" value="${esc(item.resultado_metricas)}" placeholder="Alcance, reproducciones, guardados, consultas..." class="input-glass w-full px-3 py-2">
            </div>
          </div>

          <div class="p-3 rounded-xl bg-rose-50/75 border border-rose-200/80 space-y-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="cnt-absorbido" ${item.trabajo_absorbido ? 'checked' : ''} class="rounded text-rose-600 focus:ring-rose-500">
              <span class="text-xs font-bold text-rose-950">🛡️ Hubo Trabajo Absorbido por Marketing Interno (No sustitución silenciosa)</span>
            </label>
            <input type="text" id="cnt-absorbido-detalle" value="${esc(item.trabajo_absorbido_detalle)}" placeholder="Si Marketing Interno tuvo que rehacer o corregir de urgencia esta pieza de REM, detallá horas y motivo..." class="input-glass w-full px-3 py-1.5 text-xs">
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoContenidoPauta.savePiezaFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">Guardar Pieza</button>
      `
    });
  }

  function savePiezaFromModal() {
    const titulo = document.getElementById('cnt-titulo').value.trim();
    if (!titulo) {
      window.MaderoUI.showToast('El título de la pieza es obligatorio', 'red');
      return;
    }

    const payload = {
      id: document.getElementById('cnt-id').value.trim() || undefined,
      titulo,
      formato: document.getElementById('cnt-formato').value,
      canal_destino: document.getElementById('cnt-canal').value.trim(),
      plaza: document.getElementById('cnt-plaza').value,
      actor_id: document.getElementById('cnt-actor').value,
      responsable_nombre: document.getElementById('cnt-resp-nombre').value.trim(),
      etapa_contenido: document.getElementById('cnt-etapa').value,
      estado: document.getElementById('cnt-estado').value,
      fecha_acordada: document.getElementById('cnt-fecha-acordada').value,
      fecha_publicacion_real: document.getElementById('cnt-fecha-real').value,
      observacion_madero: document.getElementById('cnt-observacion').value.trim(),
      enlace_pieza: document.getElementById('cnt-enlace').value.trim(),
      resultado_metricas: document.getElementById('cnt-resultado').value.trim(),
      trabajo_absorbido: document.getElementById('cnt-absorbido').checked,
      trabajo_absorbido_detalle: document.getElementById('cnt-absorbido-detalle').value.trim()
    };

    window.MaderoStore.upsertContenidoPieza(payload);
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Pieza de contenido guardada correctamente');
  }

  function handleDeletePieza(id) {
    if (confirm(`¿Eliminar la pieza ${id} del registro de Contenido?`)) {
      window.MaderoStore.deleteContenidoPieza(id);
      window.MaderoUI.showToast(`Pieza ${id} eliminada`, 'amber');
    }
  }

  // ========================================================================
  // MÓDULO 5: REDES SOCIALES MULTICANAL (Sección 5.5: IG, FB, TikTok, YouTube)
  // ========================================================================
  function renderRedesModule() {
    const state = window.MaderoStore.getState();
    const redes = state.redes_sociales || [];
    const sum = window.MaderoStore.getComputedSummary();

    const channelIcons = {
      Instagram: '📸',
      Facebook: '📘',
      TikTok: '🎵',
      YouTube: '▶️'
    };

    // Promedios territoriales ponderados
    const avgComodoro = redes.length > 0 ? Math.round(redes.reduce((a, r) => a + (Number((r.desglose_plazas || {}).comodoro_pct) || 0), 0) / redes.length) : 59;
    const avgNeuquen = redes.length > 0 ? Math.round(redes.reduce((a, r) => a + (Number((r.desglose_plazas || {}).neuquen_pct) || 0), 0) / redes.length) : 28;
    const avgCordillera = Math.max(0, 100 - avgComodoro - avgNeuquen);

    const cardsHtml = redes.map(r => {
      const plan = Number(r.frecuencia_plan_semanal) || 1;
      const real = Number(r.frecuencia_real_semanal) || 0;
      const frecPct = Math.min(100, Math.round((real / plan) * 100));
      const dp = r.desglose_plazas || { comodoro_pct: 55, neuquen_pct: 30, cordillera_pct: 15, comodoro_piezas: 0, neuquen_piezas: 0, cordillera_piezas: 0 };

      let statusBadge = '<span class="badge-pill badge-emerald"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Frecuencia en Meta</span>';
      if (real < plan && real >= plan * 0.75) {
        statusBadge = '<span class="badge-pill badge-amber"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Seguimiento Semanal</span>';
      } else if (real < plan * 0.75) {
        statusBadge = '<span class="badge-pill badge-red font-bold"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Bajo Meta Semanal</span>';
      }

      const icon = channelIcons[r.canal] || '🌐';

      return `
        <div class="glass-card p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div class="space-y-4">
            <!-- Encabezado del Canal -->
            <div class="flex items-start justify-between gap-2 pb-3 border-b border-stone-200/70">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
                  ${icon}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-extrabold text-stone-900">${esc(r.canal)}</h3>
                    <span class="font-mono text-[10px] text-stone-500">${esc(r.id)}</span>
                  </div>
                  <p class="text-xs font-mono text-stone-600">${esc(r.handle)}</p>
                </div>
              </div>
              <div class="text-right">
                ${statusBadge}
                <div class="text-[10px] text-stone-500 mt-1">${esc(r.responsable_gestion)}</div>
              </div>
            </div>

            <!-- KPI Grid del Canal: Frecuencia, Audiencia, Alcance, Interacciones -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div class="p-2.5 rounded-xl bg-white/80 border border-stone-200/80">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Frecuencia Sem.</span>
                <span class="font-mono text-base font-extrabold ${real < plan ? 'text-amber-800' : 'text-stone-900'}">${real} / ${plan} pub.</span>
                <div class="w-full h-1.5 rounded-full bg-stone-200 mt-1 overflow-hidden">
                  <div class="h-full ${real >= plan ? 'bg-emerald-600' : real >= plan * 0.75 ? 'bg-amber-500' : 'bg-rose-600'}" style="width:${frecPct}%"></div>
                </div>
              </div>

              <div class="p-2.5 rounded-xl bg-white/80 border border-stone-200/80">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Audiencia Actual</span>
                <span class="font-mono text-base font-extrabold text-stone-900">${formatNumber(r.seguidores_actual)}</span>
                <span class="text-[10px] font-mono text-emerald-700 font-semibold block mt-0.5">${esc(r.variacion_audiencia)}</span>
              </div>

              <div class="p-2.5 rounded-xl bg-white/80 border border-stone-200/80">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Alcance Período</span>
                <span class="font-mono text-base font-extrabold text-stone-900">${formatNumber(r.alcance_periodo)}</span>
                <span class="text-[10px] text-stone-500 block mt-0.5">Cuentas únicas</span>
              </div>

              <div class="p-2.5 rounded-xl bg-white/80 border border-stone-200/80">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Interacciones</span>
                <span class="font-mono text-base font-extrabold text-stone-900">${formatNumber(r.interacciones)}</span>
                <span class="text-[10px] font-mono text-blue-800 font-semibold block mt-0.5">Eng: ${esc(r.tasa_engagement)}</span>
              </div>
            </div>

            <!-- Distribución de Contenido por Plaza Territorial (Comodoro, Neuquén, Cordillera) -->
            <div class="p-3 rounded-2xl bg-stone-100/85 border border-stone-200/80 space-y-2">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-stone-800">Distribución de Contenido por Plaza Territorial</span>
                <span class="font-mono text-[10px] text-stone-600">Comodoro ${dp.comodoro_pct}% · Neuquén ${dp.neuquen_pct}% · Cordillera ${dp.cordillera_pct}%</span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-stone-200 overflow-hidden flex">
                <div class="h-full bg-stone-900" style="width:${dp.comodoro_pct || 0}%" title="Comodoro Rivadavia: ${dp.comodoro_pct}%"></div>
                <div class="h-full bg-blue-600" style="width:${dp.neuquen_pct || 0}%" title="Neuquén: ${dp.neuquen_pct}%"></div>
                <div class="h-full bg-emerald-600" style="width:${dp.cordillera_pct || 0}%" title="Cordillera: ${dp.cordillera_pct}%"></div>
              </div>
              <div class="grid grid-cols-3 gap-2 text-[10px] pt-0.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-stone-900"></span>
                  <span><strong>Comodoro:</strong> ${dp.comodoro_piezas || 0} pzs (${dp.comodoro_pct}%)</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span><strong>Neuquén:</strong> ${dp.neuquen_piezas || 0} pzs (${dp.neuquen_pct}%)</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span><strong>Cordillera:</strong> ${dp.cordillera_piezas || 0} pzs (${dp.cordillera_pct}%)</span>
                </div>
              </div>
            </div>

            <!-- Formato Destacado y Observación de Calidad -->
            <div class="space-y-1.5 text-xs">
              <div><strong class="text-stone-900">Formato de mayor tracción:</strong> <span class="text-stone-700">${esc(r.formato_destacado)}</span></div>
              <div><strong class="text-stone-900">Control de calidad Madero:</strong> <span class="text-stone-700">${esc(r.observacion_calidad)}</span></div>
            </div>

            <!-- Conclusión Propia del Líder (Ángelo Lucero) -->
            <div class="p-3.5 rounded-2xl bg-stone-900 text-stone-100 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-amber-300">🧭 Conclusión del Líder · Ángelo Lucero</span>
                <span class="text-[10px] font-mono text-stone-400">Sección 1 y 5.5</span>
              </div>
              <p class="text-xs leading-relaxed text-stone-100">${esc(r.conclusion_lider)}</p>
              ${r.proxima_accion ? `<div class="pt-1.5 mt-1.5 border-t border-white/15 text-[11px] text-emerald-300"><strong>Próximo paso:</strong> ${esc(r.proxima_accion)}</div>` : ''}
            </div>
          </div>

          <div class="pt-3 border-t border-stone-200/70 flex items-center justify-between gap-2">
            ${r.evidencia_url ? `<a href="${esc(r.evidencia_url)}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-blue-800 hover:underline">🔗 Abrir canal oficial ↗</a>` : '<span></span>'}
            <button type="button" onclick="MaderoContenidoPauta.openRedModal('${esc(r.id)}')" class="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">
              ✎ Actualizar Métricas y Conclusión
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Tabla comparativa sintética
    const tableRowsHtml = redes.map(r => {
      const dp = r.desglose_plazas || {};
      const plan = Number(r.frecuencia_plan_semanal) || 0;
      const real = Number(r.frecuencia_real_semanal) || 0;
      return `
        <tr class="hover:bg-white/60 transition">
          <td class="py-3 px-3 font-bold text-stone-900">
            ${channelIcons[r.canal] || '🌐'} ${esc(r.canal)}
            <span class="block text-[10px] font-mono font-normal text-stone-500">${esc(r.handle)}</span>
          </td>
          <td class="py-3 px-3 font-mono font-bold ${real < plan ? 'text-amber-700' : 'text-emerald-700'}">${real} / ${plan} sem.</td>
          <td class="py-3 px-3 font-mono">${formatNumber(r.seguidores_actual)} <span class="text-[10px] text-emerald-700">(${esc(r.variacion_audiencia)})</span></td>
          <td class="py-3 px-3 font-mono">${formatNumber(r.alcance_periodo)}</td>
          <td class="py-3 px-3 font-mono">${formatNumber(r.interacciones)} <span class="text-[10px] text-blue-800">(${esc(r.tasa_engagement)})</span></td>
          <td class="py-3 px-3 font-mono text-[11px]">Com: ${dp.comodoro_pct || 0}% · Nqn: ${dp.neuquen_pct || 0}% · Cord: ${dp.cordillera_pct || 0}%</td>
          <td class="py-3 px-3 text-xs text-stone-700 max-w-xs">${esc(r.conclusion_lider)}</td>
          <td class="py-3 px-3 text-right">
            <button type="button" onclick="MaderoContenidoPauta.openRedModal('${esc(r.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold">Editar</button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="space-y-5">
        ${renderClusterSubnav('m5-redes')}

        <!-- Resumen Consolidado Multicanal -->
        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="badge-pill badge-dark font-mono">Módulo 5 de 12</span>
                <span class="badge-pill badge-emerald">Operativo · Paso 4</span>
                <span class="badge-pill badge-blue">Sección 5.5 · Instagram, Facebook, TikTok y YouTube</span>
              </div>
              <h2 class="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">Auditoría de Redes Sociales Multicanal y Cobertura por Plaza</h2>
              <p class="text-xs text-stone-600 mt-0.5">
                Control de frecuencia planificada vs ejecutada, evolución de audiencia, desempeño orgánico, equilibrio territorial (Comodoro, Neuquén, Cordillera) y conclusión propia del Líder.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <button type="button" onclick="MaderoStore.exportRedesCSV(); MaderoUI.showToast('CSV de Redes Sociales descargado')" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                ⬇ Exportar CSV Redes
              </button>
              <button type="button" onclick="MaderoContenidoPauta.openRedModal(null)" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">
                + Agregar Canal / Cuenta
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Frecuencia Consolidada</span>
              <span class="font-mono text-xl font-extrabold text-stone-900">${sum.redesFrecRealTotal} / ${sum.redesFrecPlanTotal} pub.</span>
              <span class="text-[11px] font-semibold ${sum.redesCumplimientoFrecPct >= 85 ? 'text-emerald-700' : 'text-amber-700'} block mt-0.5">${sum.redesCumplimientoFrecPct}% de meta semanal cumplida</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Comunidad Total (4 Redes)</span>
              <span class="font-mono text-xl font-extrabold text-stone-900">${formatNumber(sum.redesSeguidoresTotal)}</span>
              <span class="text-[11px] text-stone-600 block mt-0.5">IG + FB + TikTok + YouTube</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Alcance &amp; Interacción</span>
              <span class="font-mono text-xl font-extrabold text-stone-900">${formatNumber(sum.redesAlcanceTotal)}</span>
              <span class="text-[11px] text-blue-800 font-semibold block mt-0.5">${formatNumber(sum.redesInteraccionesTotal)} interacciones medidas</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-stone-100/90 border border-stone-200/90">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Equilibrio Territorial Promedio</span>
              <span class="font-mono text-base font-extrabold text-stone-900">Com ${avgComodoro}% · Nqn ${avgNeuquen}% · Cord ${avgCordillera}%</span>
              <span class="text-[11px] text-amber-800 font-medium block mt-0.5">Meta: reforzar Cordillera (+15%)</span>
            </div>
          </div>
        </div>

        <!-- 4 Tarjetas Detalladas de Canales Oficiales -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${cardsHtml}
        </div>

        <!-- Matriz Comparativa de los 4 Canales -->
        <div class="glass-card p-4 sm:p-6 space-y-3">
          <h3 class="text-sm sm:text-base font-extrabold text-stone-900">Matriz Comparativa Multicanal (Sección 5.5)</h3>
          <div class="overflow-x-auto rounded-xl border border-stone-200/70 bg-white/50">
            <table class="w-full text-left text-xs min-w-[860px]">
              <thead>
                <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                  <th class="py-3 px-3">Canal</th>
                  <th class="py-3 px-3">Frec. Real / Plan</th>
                  <th class="py-3 px-3">Audiencia</th>
                  <th class="py-3 px-3">Alcance</th>
                  <th class="py-3 px-3">Interacciones</th>
                  <th class="py-3 px-3">Cobertura por Plaza</th>
                  <th class="py-3 px-3">Conclusión Ejecutiva de Ángelo</th>
                  <th class="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200/60">
                ${tableRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function openRedModal(id) {
    const list = window.MaderoStore.getState().redes_sociales || [];
    const existing = id ? list.find(i => i.id === id) : null;
    const item = existing || {
      id: '',
      canal: 'Instagram',
      handle: '@maderoautomotores',
      actor_id: 'MKT_INTERNO',
      responsable_gestion: 'Marketing Interno',
      estado_canal: 'EN_META',
      frecuencia_plan_semanal: 5,
      frecuencia_real_semanal: 5,
      seguidores_actual: 0,
      variacion_audiencia: '+0%',
      alcance_periodo: 0,
      interacciones: 0,
      tasa_engagement: '4.0%',
      desglose_plazas: {
        comodoro_pct: 55,
        neuquen_pct: 30,
        cordillera_pct: 15,
        comodoro_piezas: 3,
        neuquen_piezas: 2,
        cordillera_piezas: 1
      },
      formato_destacado: '',
      observacion_calidad: '',
      conclusion_lider: '',
      proxima_accion: '',
      evidencia_url: ''
    };
    const dp = item.desglose_plazas || {};

    window.MaderoUI.openModal({
      title: existing ? `Actualizar Canal · ${existing.canal} (${existing.id})` : 'Agregar Canal de Redes Sociales',
      subtitle: 'Sección 5.5 · Frecuencia, métricas de audiencia, distribución territorial por plaza y conclusión del Líder.',
      maxWidth: 'max-w-2xl',
      bodyHtml: `
        <form id="form-red-social" class="space-y-3.5">
          <input type="hidden" id="red-id" value="${esc(item.id)}">

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Canal Oficial</label>
              <select id="red-canal" class="input-glass w-full px-3 py-2 font-semibold">
                <option value="Instagram" ${item.canal === 'Instagram' ? 'selected' : ''}>Instagram</option>
                <option value="Facebook" ${item.canal === 'Facebook' ? 'selected' : ''}>Facebook</option>
                <option value="TikTok" ${item.canal === 'TikTok' ? 'selected' : ''}>TikTok</option>
                <option value="YouTube" ${item.canal === 'YouTube' ? 'selected' : ''}>YouTube</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Usuario / Handle</label>
              <input type="text" id="red-handle" value="${esc(item.handle)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Responsable de Gestión</label>
              <input type="text" id="red-resp" value="${esc(item.responsable_gestion)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-stone-100/80 border border-stone-200/80">
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Frec. Plan Sem.</label>
              <input type="number" id="red-frec-plan" value="${esc(item.frecuencia_plan_semanal)}" min="0" class="input-glass w-full px-2.5 py-1.5 font-mono">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Frec. Real Sem.</label>
              <input type="number" id="red-frec-real" value="${esc(item.frecuencia_real_semanal)}" min="0" class="input-glass w-full px-2.5 py-1.5 font-mono">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Seguidores</label>
              <input type="number" id="red-seguidores" value="${esc(item.seguidores_actual)}" min="0" class="input-glass w-full px-2.5 py-1.5 font-mono">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Variación Sem.</label>
              <input type="text" id="red-variacion" value="${esc(item.variacion_audiencia)}" placeholder="+420 (+0.9%)" class="input-glass w-full px-2.5 py-1.5 font-mono">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Alcance del Período</label>
              <input type="number" id="red-alcance" value="${esc(item.alcance_periodo)}" min="0" class="input-glass w-full px-3 py-2 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Interacciones Totales</label>
              <input type="number" id="red-interacciones" value="${esc(item.interacciones)}" min="0" class="input-glass w-full px-3 py-2 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Tasa Engagement</label>
              <input type="text" id="red-engagement" value="${esc(item.tasa_engagement)}" placeholder="4.8%" class="input-glass w-full px-3 py-2 font-mono">
            </div>
          </div>

          <!-- Desglose por plaza -->
          <div class="p-3 rounded-xl bg-stone-100/80 border border-stone-200/80 space-y-2">
            <div class="text-[11px] font-bold text-stone-800">Distribución de Contenido por Plaza (Porcentaje y Piezas de la Semana)</div>
            <div class="grid grid-cols-3 gap-2.5">
              <div>
                <label class="block text-[10px] font-semibold text-stone-600 mb-1">Comodoro (% / pzs)</label>
                <div class="flex gap-1.5">
                  <input type="number" id="red-com-pct" value="${esc(dp.comodoro_pct ?? 55)}" class="input-glass w-1/2 px-2 py-1 font-mono" placeholder="%">
                  <input type="number" id="red-com-pzs" value="${esc(dp.comodoro_piezas ?? 5)}" class="input-glass w-1/2 px-2 py-1 font-mono" placeholder="Pzs">
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-stone-600 mb-1">Neuquén (% / pzs)</label>
                <div class="flex gap-1.5">
                  <input type="number" id="red-nqn-pct" value="${esc(dp.neuquen_pct ?? 30)}" class="input-glass w-1/2 px-2 py-1 font-mono" placeholder="%">
                  <input type="number" id="red-nqn-pzs" value="${esc(dp.neuquen_piezas ?? 3)}" class="input-glass w-1/2 px-2 py-1 font-mono" placeholder="Pzs">
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-stone-600 mb-1">Cordillera (% / pzs)</label>
                <div class="flex gap-1.5">
                  <input type="number" id="red-cor-pct" value="${esc(dp.cordillera_pct ?? 15)}" class="input-glass w-1/2 px-2 py-1 font-mono" placeholder="%">
                  <input type="number" id="red-cor-pzs" value="${esc(dp.cordillera_piezas ?? 1)}" class="input-glass w-1/2 px-2 py-1 font-mono" placeholder="Pzs">
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Formato Destacado &amp; Observación de Calidad</label>
            <input type="text" id="red-formato" value="${esc(item.formato_destacado)}" placeholder="Formato de mejor rendimiento..." class="input-glass w-full px-3 py-2 mb-2">
            <input type="text" id="red-obs" value="${esc(item.observacion_calidad)}" placeholder="Observación de calidad sobre publicaciones..." class="input-glass w-full px-3 py-2">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-stone-900 mb-1">🧭 Conclusión Propia del Líder (Ángelo Lucero) *</label>
            <textarea id="red-conclusion" rows="3" class="input-glass w-full px-3 py-2 leading-relaxed" required>${esc(item.conclusion_lider)}</textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Próxima Acción Operativa</label>
              <input type="text" id="red-accion" value="${esc(item.proxima_accion)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">URL del Canal Oficial</label>
              <input type="url" id="red-url" value="${esc(item.evidencia_url)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoContenidoPauta.saveRedFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">Guardar Canal</button>
      `
    });
  }

  function saveRedFromModal() {
    const conclusion = document.getElementById('red-conclusion').value.trim();
    if (!conclusion) {
      window.MaderoUI.showToast('La conclusión del Líder para el canal es obligatoria', 'red');
      return;
    }

    const payload = {
      id: document.getElementById('red-id').value.trim() || undefined,
      canal: document.getElementById('red-canal').value,
      handle: document.getElementById('red-handle').value.trim(),
      responsable_gestion: document.getElementById('red-resp').value.trim(),
      frecuencia_plan_semanal: Number(document.getElementById('red-frec-plan').value) || 0,
      frecuencia_real_semanal: Number(document.getElementById('red-frec-real').value) || 0,
      seguidores_actual: Number(document.getElementById('red-seguidores').value) || 0,
      variacion_audiencia: document.getElementById('red-variacion').value.trim(),
      alcance_periodo: Number(document.getElementById('red-alcance').value) || 0,
      interacciones: Number(document.getElementById('red-interacciones').value) || 0,
      tasa_engagement: document.getElementById('red-engagement').value.trim(),
      desglose_plazas: {
        comodoro_pct: Number(document.getElementById('red-com-pct').value) || 0,
        comodoro_piezas: Number(document.getElementById('red-com-pzs').value) || 0,
        neuquen_pct: Number(document.getElementById('red-nqn-pct').value) || 0,
        neuquen_piezas: Number(document.getElementById('red-nqn-pzs').value) || 0,
        cordillera_pct: Number(document.getElementById('red-cor-pct').value) || 0,
        cordillera_piezas: Number(document.getElementById('red-cor-pzs').value) || 0
      },
      formato_destacado: document.getElementById('red-formato').value.trim(),
      observacion_calidad: document.getElementById('red-obs').value.trim(),
      conclusion_lider: conclusion,
      proxima_accion: document.getElementById('red-accion').value.trim(),
      evidencia_url: document.getElementById('red-url').value.trim()
    };

    window.MaderoStore.upsertRedSocial(payload);
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast(`Canal ${payload.canal} actualizado`);
  }

  // ========================================================================
  // MÓDULO 6: CAMPAÑAS PAGAS Y PAUTA DIGITAL (Sección 4 y 5.6)
  // ========================================================================
  function setCampanasSearch(val) {
    filtersCampanas.search = val;
    window.MaderoApp.renderAll();
  }

  function setCampanasFilter(key, val) {
    filtersCampanas[key] = val;
    window.MaderoApp.renderAll();
  }

  function toggleCampanasObservadas() {
    filtersCampanas.onlyObservadas = !filtersCampanas.onlyObservadas;
    window.MaderoApp.renderAll();
  }

  function resetCampanasFilters() {
    filtersCampanas = {
      search: '',
      plataforma: 'ALL',
      calidadLead: 'ALL',
      plaza: 'ALL',
      onlyObservadas: false
    };
    window.MaderoApp.renderAll();
  }

  function getFilteredCampanas() {
    const list = window.MaderoStore.getState().campanas_pagas || [];
    const q = filtersCampanas.search.trim().toLowerCase();

    return list.filter(c => {
      if (filtersCampanas.plataforma !== 'ALL' && c.plataforma !== filtersCampanas.plataforma) return false;
      if (filtersCampanas.calidadLead !== 'ALL' && c.calidad_lead_estado !== filtersCampanas.calidadLead) return false;
      if (filtersCampanas.plaza !== 'ALL' && c.plazas_ubicaciones !== filtersCampanas.plaza) return false;
      if (filtersCampanas.onlyObservadas) {
        const isObs = c.calidad_lead_estado === 'BAJA_OBSERVADA' || c.validacion_madero === 'OBSERVADA' || c.validacion_madero === 'PAUSADA_POR_MADERO' || c.estado === 'OBSERVADO_MADERO' || c.estado === 'ATRASADO';
        if (!isObs) return false;
      }

      if (q) {
        const hay = [
          c.id,
          c.nombre,
          c.plataforma,
          c.objetivo,
          c.plazas_ubicaciones,
          c.creativos_validados_detalle,
          c.devolucion_ventas_leads,
          c.recomendacion_lider
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function quickChangeCalidadLead(id, nuevaCalidad) {
    window.MaderoStore.setCampanaCalidadLead(id, nuevaCalidad);
    window.MaderoUI.showToast(`Calidad de lead en ${id} actualizada a ${nuevaCalidad}`);
  }

  function quickChangeEstadoCampana(id, nuevoEstado) {
    window.MaderoStore.setCampanaEstado(id, nuevoEstado);
    window.MaderoUI.showToast(`Estado de campaña ${id} actualizado`);
  }

  function renderCampanasModule() {
    const filtered = getFilteredCampanas();
    const sum = window.MaderoStore.getComputedSummary();

    const rowsHtml = filtered.length === 0 ? `
      <tr>
        <td colspan="7" class="py-10 text-center text-xs text-stone-500">No hay campañas pagas que coincidan con el filtro seleccionado.</td>
      </tr>
    ` : filtered.map(c => {
      const asig = Number(c.presupuesto_asignado) || 0;
      const ejec = Number(c.presupuesto_ejecutado) || 0;
      const pct = asig > 0 ? Math.min(100, Math.round((ejec / asig) * 100)) : 0;

      const calidadOpts = Object.values(window.MaderoData.CALIDAD_LEADS).map(cl =>
        `<option value="${cl.id}" ${c.calidad_lead_estado === cl.id ? 'selected' : ''}>${esc(cl.shortLabel)}</option>`
      ).join('');

      const estadoOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
        `<option value="${st.id}" ${c.estado === st.id ? 'selected' : ''}>${esc(st.shortLabel)}</option>`
      ).join('');

      const isBajaCalidad = c.calidad_lead_estado === 'BAJA_OBSERVADA';

      return `
        <tr class="hover:bg-white/60 transition align-top ${isBajaCalidad ? 'bg-rose-50/35' : ''}">
          <td class="py-3.5 px-3 whitespace-nowrap">
            <span class="font-mono font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(c.id)}</span>
            <span class="badge-pill ${c.plataforma === 'Google Ads' ? 'badge-sky' : 'badge-blue'} block mt-1.5 w-fit">${esc(c.plataforma)}</span>
            <div class="font-mono text-[10px] text-stone-500 mt-1">
              ${window.MaderoUI.formatDateDisplay(c.vigencia_desde)} →<br>${window.MaderoUI.formatDateDisplay(c.vigencia_hasta)}
            </div>
          </td>

          <td class="py-3.5 px-3 min-w-[230px] max-w-[310px]">
            <button type="button" onclick="MaderoContenidoPauta.openCampanaModal('${esc(c.id)}')" class="text-left group">
              <span class="font-bold text-stone-900 group-hover:text-blue-900 text-xs block leading-snug">${esc(c.nombre)}</span>
            </button>
            <p class="text-[11px] text-stone-600 mt-1 leading-snug"><strong>Objetivo:</strong> ${esc(c.objetivo)}</p>
            <div class="text-[10px] text-stone-600 mt-1 flex items-center gap-1">
              <span>📍</span><span class="font-semibold">${esc(c.plazas_ubicaciones)}</span>
            </div>
            <div class="text-[10px] text-stone-500 mt-1 leading-snug">
              <strong>Creativos:</strong> ${esc(c.creativos_validados_detalle)}
            </div>
            ${c.creativos_url ? `
              <a href="${esc(c.creativos_url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-blue-800 hover:underline">
                🔗 Ver anuncios / creativos en Drive ↗
              </a>
            ` : ''}
          </td>

          <td class="py-3.5 px-3 whitespace-nowrap min-w-[165px]">
            <div class="text-[10px] font-bold uppercase text-stone-500">Ejecutado vs Asignado</div>
            <div class="font-mono text-xs font-extrabold text-stone-900 mt-0.5">${formatMoney(ejec)}</div>
            <div class="font-mono text-[10px] text-stone-500">de ${formatMoney(asig)} (${pct}%)</div>
            <div class="w-full h-1.5 rounded-full bg-stone-200 mt-1.5 overflow-hidden">
              <div class="h-full ${pct > 95 ? 'bg-amber-600' : 'bg-stone-900'}" style="width:${pct}%"></div>
            </div>
            <div class="mt-2">${window.MaderoUI.actorBadge(c.actor_id, true)} <span class="text-[10px] text-stone-500">Ejec. técnica</span></div>
          </td>

          <td class="py-3.5 px-3 whitespace-nowrap text-center">
            <div class="p-2 rounded-xl bg-white/85 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Leads</span>
              <span class="font-mono text-base font-extrabold text-stone-900">${formatNumber(c.leads_generados)}</span>
              <span class="text-[10px] font-mono text-stone-600 block mt-0.5">CPL: <strong>${formatMoney(c.cpl)}</strong></span>
            </div>
            <div class="mt-1.5">${window.MaderoUI.estadoBadge(c.estado, true)}</div>
            <select onchange="MaderoContenidoPauta.quickChangeEstadoCampana('${esc(c.id)}', this.value)" class="mt-1 text-[10px] bg-white border border-stone-300 rounded-lg px-1.5 py-1 text-stone-700 font-medium focus:outline-none w-full">
              ${estadoOpts}
            </select>
          </td>

          <td class="py-3.5 px-3 min-w-[230px] max-w-[290px]">
            <div class="mb-1.5">${calidadLeadBadge(c.calidad_lead_estado)}</div>
            <select onchange="MaderoContenidoPauta.quickChangeCalidadLead('${esc(c.id)}', this.value)" class="mb-2 text-[10px] bg-white border border-stone-300 rounded-lg px-2 py-1 text-stone-800 font-semibold focus:outline-none w-full">
              ${calidadOpts}
            </select>
            <div class="p-2 rounded-xl ${isBajaCalidad ? 'bg-rose-100/80 border border-rose-300 text-rose-950' : 'bg-stone-100/80 border border-stone-200/80 text-stone-700'} text-[11px] leading-snug">
              <strong class="block text-[10px] uppercase tracking-wider mb-0.5">Devolución Ventas (Salón):</strong>
              ${esc(c.devolucion_ventas_leads)}
            </div>
          </td>

          <td class="py-3.5 px-3 min-w-[240px] max-w-[310px]">
            <div class="mb-1.5">${decisionCampanaBadge(c.accion_decision)}</div>
            <div class="p-2.5 rounded-xl bg-stone-900 text-stone-100 text-[11px] leading-snug">
              <strong class="block text-[10px] uppercase tracking-wider text-amber-300 mb-0.5">🧭 Recomendación de Ángelo:</strong>
              ${esc(c.recomendacion_lider)}
            </div>
          </td>

          <td class="py-3.5 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoContenidoPauta.openCampanaModal('${esc(c.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800">
                Editar
              </button>
              <button type="button" onclick="MaderoContenidoPauta.handleDeleteCampana('${esc(c.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold" title="Eliminar campaña">
                ×
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="space-y-5">
        ${renderClusterSubnav('m6-campanas')}

        <!-- Encabezado y KPIs Presupuestarios / Calidad Comercial -->
        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="badge-pill badge-dark font-mono">Módulo 6 de 12</span>
                <span class="badge-pill badge-emerald">Operativo · Paso 4</span>
                <span class="badge-pill badge-amber">Sección 4 y 5.6 · REM Ejecuta / Madero Valida</span>
              </div>
              <h2 class="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">Campañas Pagas, Presupuesto, Calidad de Lead y Recomendación</h2>
              <p class="text-xs text-stone-600 mt-0.5">
                Separación explícita (Sección 4): <strong>REM en la ejecución técnica; Madero en prioridades, presupuesto y validaciones</strong>. Cruce directo entre volumen de leads y calidad comercial real reportada por Ventas.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <button type="button" onclick="MaderoStore.exportCampanasCSV(MaderoContenidoPauta.getFilteredCampanas()); MaderoUI.showToast('CSV de Campañas Pagas descargado')" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                ⬇ Exportar CSV Pauta
              </button>
              <button type="button" onclick="MaderoContenidoPauta.openCampanaModal(null)" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm">
                + Nueva Campaña Paga
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Inversión Ejecutada / Asignada</span>
              <span class="font-mono text-lg sm:text-xl font-extrabold text-stone-900">${formatMoney(sum.campPresupuestoEjecutadoTotal)}</span>
              <span class="text-[11px] font-mono text-stone-600 block mt-0.5">de ${formatMoney(sum.campPresupuestoAsignadoTotal)} (${sum.campEjecucionPct}% ejec.)</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Volumen &amp; CPL Promedio</span>
              <span class="font-mono text-lg sm:text-xl font-extrabold text-stone-900">${formatNumber(sum.campLeadsTotal)} leads</span>
              <span class="text-[11px] font-mono text-blue-800 font-semibold block mt-0.5">CPL ponderado: ${formatMoney(sum.campCplPromedio)}</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/75 border border-emerald-200/80 cursor-pointer" onclick="MaderoContenidoPauta.setCampanasFilter('calidadLead', 'ALTA')">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">Calidad Comercial (Ventas)</span>
              <span class="font-mono text-lg sm:text-xl font-extrabold text-emerald-950">${sum.campCalidadAltaCount} Alta · ${sum.campCalidadMediaCount} Media</span>
              <span class="text-[11px] text-emerald-800 font-semibold block mt-0.5">Con intención real / permuta →</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/85 cursor-pointer" onclick="MaderoContenidoPauta.setCampanasFilter('calidadLead', 'BAJA_OBSERVADA')">
              <span class="text-[10px] font-bold uppercase tracking-wider text-rose-900 block">Leads Observados por Ventas</span>
              <span class="font-mono text-lg sm:text-xl font-extrabold text-rose-950">${sum.campCalidadBajaCount} campaña(s)</span>
              <span class="text-[11px] text-rose-800 font-semibold block mt-0.5">Exigen ajuste de segmentación REM →</span>
            </div>
          </div>
        </div>

        <!-- Tabla de Auditoría de Campañas Pagas -->
        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
              <input type="text" id="campanas-search-input" value="${esc(filtersCampanas.search)}" oninput="MaderoContenidoPauta.setCampanasSearch(this.value)" placeholder="Buscar campaña, objetivo, plaza, devolución Ventas..." class="input-glass px-3.5 py-2 w-full sm:w-64">

              <select onchange="MaderoContenidoPauta.setCampanasFilter('plataforma', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Todas las Plataformas</option>
                <option value="Meta Ads" ${filtersCampanas.plataforma === 'Meta Ads' ? 'selected' : ''}>Meta Ads (IG / FB / WhatsApp)</option>
                <option value="Google Ads" ${filtersCampanas.plataforma === 'Google Ads' ? 'selected' : ''}>Google Ads (Search / YouTube / Display)</option>
              </select>

              <select onchange="MaderoContenidoPauta.setCampanasFilter('calidadLead', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Toda Calidad de Lead</option>
                <option value="ALTA" ${filtersCampanas.calidadLead === 'ALTA' ? 'selected' : ''}>🟢 Calidad Alta (Calificados)</option>
                <option value="MEDIA" ${filtersCampanas.calidadLead === 'MEDIA' ? 'selected' : ''}>🟡 Calidad Media (Mixto)</option>
                <option value="BAJA_OBSERVADA" ${filtersCampanas.calidadLead === 'BAJA_OBSERVADA' ? 'selected' : ''}>🔴 Calidad Baja / Observada por Ventas</option>
              </select>

              <select onchange="MaderoContenidoPauta.setCampanasFilter('plaza', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Todas las Plazas</option>
                ${window.MaderoData.PLAZAS.map(pl => `<option value="${esc(pl)}" ${filtersCampanas.plaza === pl ? 'selected' : ''}>${esc(pl)}</option>`).join('')}
              </select>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button type="button" onclick="MaderoContenidoPauta.toggleCampanasObservadas()" class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${filtersCampanas.onlyObservadas ? 'bg-rose-600 text-white border-rose-700' : 'bg-rose-50 text-rose-900 border-rose-200'}">
                ⚠ Observadas / Baja Calidad (${sum.campObservadasCount})
              </button>
              ${(filtersCampanas.search || filtersCampanas.plataforma !== 'ALL' || filtersCampanas.calidadLead !== 'ALL' || filtersCampanas.plaza !== 'ALL' || filtersCampanas.onlyObservadas)
                ? `<button type="button" onclick="MaderoContenidoPauta.resetCampanasFilters()" class="text-xs font-semibold text-stone-500 hover:text-stone-900 underline">Limpiar filtros</button>`
                : ''}
            </div>
          </div>

          <div class="overflow-x-auto -mx-1 sm:mx-0 rounded-xl border border-stone-200/70 bg-white/50">
            <table class="w-full text-left text-xs min-w-[1020px]">
              <thead>
                <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                  <th class="py-3 px-3">ID / Plataforma</th>
                  <th class="py-3 px-3">Campaña / Objetivo / Creativos</th>
                  <th class="py-3 px-3">Presupuesto (Asignado vs Ejec.)</th>
                  <th class="py-3 px-3 text-center">Leads, CPL y Estado</th>
                  <th class="py-3 px-3">Calidad de Lead (Cruce con Ventas)</th>
                  <th class="py-3 px-3">Recomendación Concreta de Ángelo</th>
                  <th class="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200/60">
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function openCampanaModal(id) {
    const list = window.MaderoStore.getState().campanas_pagas || [];
    const existing = id ? list.find(i => i.id === id) : null;
    const item = existing || {
      id: '',
      nombre: '',
      plataforma: 'Meta Ads',
      actor_id: 'REM',
      responsable_tecnico: 'REM (Tráfico) · Supervisado por Ángelo Lucero',
      validacion_madero: 'APROBADA',
      estado: 'EN_ELABORACION',
      objetivo: '',
      plazas_ubicaciones: 'Comodoro · Av. Polonia 546 (Salón Principal)',
      presupuesto_asignado: 500000,
      presupuesto_ejecutado: 0,
      vigencia_desde: '2026-11-01',
      vigencia_hasta: '2026-11-30',
      creativos_validados_detalle: '',
      creativos_url: '',
      leads_generados: 0,
      cpl: 0,
      calidad_lead_estado: 'MEDIA',
      devolucion_ventas_leads: '',
      recomendacion_lider: '',
      accion_decision: 'MANTENER_OPTIMIZAR'
    };

    const plazasOpts = (window.MaderoData.PLAZAS || []).map(pl =>
      `<option value="${esc(pl)}" ${item.plazas_ubicaciones === pl ? 'selected' : ''}>${esc(pl)}</option>`
    ).join('');

    const estadosOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
      `<option value="${st.id}" ${item.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`
    ).join('');

    const calidadOpts = Object.values(window.MaderoData.CALIDAD_LEADS).map(cl =>
      `<option value="${cl.id}" ${item.calidad_lead_estado === cl.id ? 'selected' : ''}>${esc(cl.label)}</option>`
    ).join('');

    const decisionesOpts = Object.values(window.MaderoData.DECISIONES_CAMPANA).map(dc =>
      `<option value="${dc.id}" ${item.accion_decision === dc.id ? 'selected' : ''}>${esc(dc.label)}</option>`
    ).join('');

    window.MaderoUI.openModal({
      title: existing ? `Editar Campaña Paga · ${existing.id}` : 'Registrar Nueva Campaña Paga',
      subtitle: 'Sección 4 y 5.6 · Presupuesto, creativos, leads, evaluación comercial de Ventas y recomendación del Líder.',
      maxWidth: 'max-w-2xl',
      bodyHtml: `
        <form id="form-campana-paga" class="space-y-3.5">
          <input type="hidden" id="cmp-id" value="${esc(item.id)}">

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Nombre de la Campaña *</label>
              <input type="text" id="cmp-nombre" value="${esc(item.nombre)}" placeholder="Ej: Meta Ads · Pickups Trabajo & Flota" class="input-glass w-full px-3 py-2" required>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Plataforma</label>
              <select id="cmp-plataforma" class="input-glass w-full px-3 py-2 font-semibold">
                <option value="Meta Ads" ${item.plataforma === 'Meta Ads' ? 'selected' : ''}>Meta Ads (IG / FB / WA)</option>
                <option value="Google Ads" ${item.plataforma === 'Google Ads' ? 'selected' : ''}>Google Ads (Search / YT)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Objetivo Comercial</label>
              <input type="text" id="cmp-objetivo" value="${esc(item.objetivo)}" placeholder="Generación de leads WhatsApp con filtro de anticipo..." class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Plaza / Ubicación Geográfica</label>
              <select id="cmp-plaza" class="input-glass w-full px-3 py-2">
                ${plazasOpts}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-stone-100/85 border border-stone-200/80">
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Presup. Asignado ($)</label>
              <input type="number" id="cmp-pres-asig" value="${esc(item.presupuesto_asignado)}" min="0" step="1000" class="input-glass w-full px-2.5 py-1.5 font-mono">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Presup. Ejecutado ($)</label>
              <input type="number" id="cmp-pres-ejec" value="${esc(item.presupuesto_ejecutado)}" min="0" step="1000" class="input-glass w-full px-2.5 py-1.5 font-mono">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Leads Generados</label>
              <input type="number" id="cmp-leads" value="${esc(item.leads_generados)}" min="0" class="input-glass w-full px-2.5 py-1.5 font-mono">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Estado (Secc. 7)</label>
              <select id="cmp-estado" class="input-glass w-full px-2 py-1.5 text-[11px]">
                ${estadosOpts}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Vigencia Desde</label>
              <input type="date" id="cmp-desde" value="${esc(item.vigencia_desde)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Vigencia Hasta</label>
              <input type="date" id="cmp-hasta" value="${esc(item.vigencia_hasta)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Validación Madero</label>
              <select id="cmp-validacion" class="input-glass w-full px-3 py-2">
                <option value="APROBADA" ${item.validacion_madero === 'APROBADA' ? 'selected' : ''}>Aprobada por Madero</option>
                <option value="OBSERVADA" ${item.validacion_madero === 'OBSERVADA' ? 'selected' : ''}>Observada (Ajustar segmentación/copy)</option>
                <option value="EN_REVISION" ${item.validacion_madero === 'EN_REVISION' ? 'selected' : ''}>En Revisión de Creativos</option>
                <option value="PAUSADA_POR_MADERO" ${item.validacion_madero === 'PAUSADA_POR_MADERO' ? 'selected' : ''}>Pausada por Decisión Madero</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Creativos Validados (Detalle)</label>
              <input type="text" id="cmp-creativos" value="${esc(item.creativos_validados_detalle)}" placeholder="Reels / Carruseles activos..." class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Enlace a Carpeta de Creativos / Drive</label>
              <input type="url" id="cmp-url" value="${esc(item.creativos_url)}" placeholder="https://drive.google.com/..." class="input-glass w-full px-3 py-2">
            </div>
          </div>

          <!-- Cruce con Ventas -->
          <div class="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-stone-900 mb-1">Calidad Comercial del Lead (Cruce con Ventas)</label>
                <select id="cmp-calidad" class="input-glass w-full px-3 py-2 font-semibold">
                  ${calidadOpts}
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-900 mb-1">Decisión Accionable del Líder</label>
                <select id="cmp-decision" class="input-glass w-full px-3 py-2 font-semibold">
                  ${decisionesOpts}
                </select>
              </div>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Devolución de los Equipos de Ventas de Salón sobre los Contactos Recibidos</label>
              <textarea id="cmp-devolucion-ventas" rows="2" placeholder="¿Qué reportan los vendedores de Polonia, Alem, CAM, Neuquén o Cordillera sobre estos leads?" class="input-glass w-full px-3 py-2">${esc(item.devolucion_ventas_leads)}</textarea>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-stone-900 mb-1">🧭 Recomendación Concreta de Ángelo Lucero *</label>
            <textarea id="cmp-recomendacion" rows="2" placeholder="Fundamento técnico y comercial: escalar presupuesto, acotar radio en REM, agregar filtro de anticipo o pausar..." class="input-glass w-full px-3 py-2" required>${esc(item.recomendacion_lider)}</textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoContenidoPauta.saveCampanaFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">Guardar Campaña</button>
      `
    });
  }

  function saveCampanaFromModal() {
    const nombre = document.getElementById('cmp-nombre').value.trim();
    if (!nombre) {
      window.MaderoUI.showToast('El nombre de la campaña es obligatorio', 'red');
      return;
    }

    const payload = {
      id: document.getElementById('cmp-id').value.trim() || undefined,
      nombre,
      plataforma: document.getElementById('cmp-plataforma').value,
      objetivo: document.getElementById('cmp-objetivo').value.trim(),
      plazas_ubicaciones: document.getElementById('cmp-plaza').value,
      presupuesto_asignado: Number(document.getElementById('cmp-pres-asig').value) || 0,
      presupuesto_ejecutado: Number(document.getElementById('cmp-pres-ejec').value) || 0,
      leads_generados: Number(document.getElementById('cmp-leads').value) || 0,
      estado: document.getElementById('cmp-estado').value,
      vigencia_desde: document.getElementById('cmp-desde').value,
      vigencia_hasta: document.getElementById('cmp-hasta').value,
      validacion_madero: document.getElementById('cmp-validacion').value,
      creativos_validados_detalle: document.getElementById('cmp-creativos').value.trim(),
      creativos_url: document.getElementById('cmp-url').value.trim(),
      calidad_lead_estado: document.getElementById('cmp-calidad').value,
      accion_decision: document.getElementById('cmp-decision').value,
      devolucion_ventas_leads: document.getElementById('cmp-devolucion-ventas').value.trim(),
      recomendacion_lider: document.getElementById('cmp-recomendacion').value.trim()
    };

    window.MaderoStore.upsertCampanaPaga(payload);
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Campaña paga actualizada con éxito');
  }

  function handleDeleteCampana(id) {
    if (confirm(`¿Eliminar la campaña ${id} del registro de Pauta?`)) {
      window.MaderoStore.deleteCampanaPaga(id);
      window.MaderoUI.showToast(`Campaña ${id} eliminada`, 'amber');
    }
  }

  return {
    renderContenidoModule,
    renderRedesModule,
    renderCampanasModule,
    // Contenido handlers
    setContenidoSearch,
    setContenidoFilter,
    toggleContenidoFlag,
    resetContenidoFilters,
    getFilteredContenido,
    quickChangeEtapaContenido,
    quickChangeEstadoContenido,
    openPiezaModal,
    savePiezaFromModal,
    handleDeletePieza,
    // Redes handlers
    openRedModal,
    saveRedFromModal,
    // Campañas handlers
    setCampanasSearch,
    setCampanasFilter,
    toggleCampanasObservadas,
    resetCampanasFilters,
    getFilteredCampanas,
    quickChangeCalidadLead,
    quickChangeEstadoCampana,
    openCampanaModal,
    saveCampanaFromModal,
    handleDeleteCampana
  };
})();

