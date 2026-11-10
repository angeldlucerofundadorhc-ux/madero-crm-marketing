/* ==========================================================================
   Madero Automotores · Control Integral de Marketing
   Paso 1: Gobernanza (Sección 4), Módulo 1 (Agenda) y Módulo 2 (Equipo Interno)
   + Vista Ejecutiva Conectada de Nivel 2 (Sección 3 y 10)
   ========================================================================== */

window.MaderoConduccion = (function () {
  const { esc, estadoBadge, actorBadge, prioridadBadge, semaforoBadge, formatDateDisplay } = window.MaderoUI;

  // Estado local de filtros de interfaz (no muta los datos)
  const filtersAgenda = {
    search: '',
    actor: 'ALL',
    estado: 'ALL',
    prioridad: 'ALL',
    plaza: 'ALL',
    onlyDireccion: false,
    onlyDesvios: false
  };

  const filtersEquipo = {
    search: '',
    miembro: 'ALL',
    calidad: 'ALL',
    onlyBloqueos: false,
    onlyAbsorbido: false
  };

  // ========================================================================
  // A. SECCIÓN 4: MATRIZ DE SEPARACIÓN DE RESPONSABILIDADES Y CRITERIO LÍDER
  // ========================================================================
  function renderGobernanzaSection() {
    const state = window.MaderoStore.getState();
    const frentes = state.gobernanza_frentes || [];

    const cardsHtml = frentes.map(g => `
      <div class="glass-card p-4 sm:p-5 flex flex-col justify-between gap-3 hover:border-stone-300 transition">
        <div class="space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-700">${esc(g.id)}</span>
              ${actorBadge(g.actor_id, false)}
            </div>
            ${semaforoBadge(g.semaforo)}
          </div>

          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">${esc(g.frente)}</h3>
            <p class="text-[11px] text-stone-500 mt-0.5"><strong>Responsabilidad principal:</strong> ${esc(g.responsabilidad_oficial)}</p>
          </div>

          <div class="p-2.5 rounded-xl bg-stone-100/80 border border-stone-200/70 text-[11px] text-stone-700 leading-relaxed">
            <span class="font-bold text-stone-900 uppercase text-[10px] tracking-wider block mb-0.5">Control esperado de Ángelo (Sección 4):</span>
            ${esc(g.control_esperado)}
          </div>

          <div class="p-3 rounded-xl bg-white/85 border border-stone-200/90 space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-extrabold uppercase tracking-wider text-stone-600">Lectura y Criterio Actual del Líder</span>
              <span class="font-mono text-[10px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">${esc(g.indicador_corto)}</span>
            </div>
            <p class="text-xs text-stone-800 leading-relaxed">${esc(g.criterio_lider)}</p>
            <p class="text-[11px] text-emerald-900 bg-emerald-50/80 border border-emerald-200/70 rounded-lg px-2.5 py-1.5">
              <strong>Recomendación:</strong> ${esc(g.recomendacion)}
            </p>
          </div>
        </div>

        <div class="pt-2.5 border-t border-stone-200/60 flex items-center justify-between gap-2">
          <button type="button" onclick="MaderoConduccion.openEditGobernanzaModal('${esc(g.id)}')" class="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50 transition">
            ✎ Actualizar Criterio / Semáforo
          </button>
          <button type="button" onclick="MaderoApp.navigateModule('${esc(g.modulo_link)}')" class="text-xs font-bold text-stone-800 hover:text-stone-950 flex items-center gap-1">
            <span>Ir al módulo</span><span>→</span>
          </button>
        </div>
      </div>
    `).join('');

    return `
      <div class="space-y-4 sm:space-y-5">
        <div class="glass-card p-4 sm:p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="badge-pill badge-dark">Sección 4 · Documento Dirección</span>
                <span class="badge-pill badge-emerald">7 Frentes Estructurales</span>
              </div>
              <h2 class="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">Matriz de Separación de Responsabilidades y Criterio del Líder</h2>
              <p class="text-xs text-stone-500 mt-0.5">Delimitación explícita entre Marketing Interno, REM, L. Christian, Áreas de Madero y Dirección, con la conclusión vigente de Ángelo en cada frente.</p>
            </div>
            <button type="button" onclick="MaderoUI.openEstadosGuideModal()" class="px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50 shrink-0 self-start sm:self-auto">
              Ver Circuito de 9 Estados →
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  function openEditGobernanzaModal(id) {
    const item = window.MaderoStore.getState().gobernanza_frentes.find(g => g.id === id);
    if (!item) return;

    window.MaderoUI.openModal({
      title: `Actualizar Frente: ${item.frente}`,
      subtitle: `Responsabilidad principal: ${item.responsabilidad_oficial}`,
      maxWidth: 'max-w-xl',
      bodyHtml: `
        <div class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Semáforo del Frente</label>
              <select id="gob-semaforo" class="input-glass w-full px-3 py-2">
                <option value="VERDE" ${item.semaforo === 'VERDE' ? 'selected' : ''}>Verde · En Control</option>
                <option value="AMBAR" ${item.semaforo === 'AMBAR' ? 'selected' : ''}>Ámbar · Seguimiento Activo</option>
                <option value="ROJO" ${item.semaforo === 'ROJO' ? 'selected' : ''}>Rojo · Crítico / Exigencia</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Indicador Corto de Respaldo</label>
              <input type="text" id="gob-indicador" value="${esc(item.indicador_corto)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Conclusión / Criterio Actual de Ángelo</label>
            <textarea id="gob-criterio" rows="3" class="input-glass w-full px-3 py-2 leading-relaxed">${esc(item.criterio_lider)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Recomendación Concreta / Próxima Medida</label>
            <textarea id="gob-recomendacion" rows="2" class="input-glass w-full px-3 py-2 leading-relaxed">${esc(item.recomendacion)}</textarea>
          </div>
        </div>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoConduccion.saveGobernanzaModal('${esc(item.id)}')" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800">Guardar Criterio</button>
      `
    });
  }

  function saveGobernanzaModal(id) {
    window.MaderoStore.updateGobernanzaFrente(id, {
      semaforo: document.getElementById('gob-semaforo').value,
      indicador_corto: document.getElementById('gob-indicador').value.trim(),
      criterio_lider: document.getElementById('gob-criterio').value.trim(),
      recomendacion: document.getElementById('gob-recomendacion').value.trim()
    });
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Criterio del frente actualizado');
  }

  // ========================================================================
  // B. MÓDULO 1: AGENDA Y PRIORIDADES DE CONDUCCIÓN (Sección 5.1)
  // ========================================================================
  function getFilteredPrioridades() {
    const list = window.MaderoStore.getState().agenda_prioridades || [];
    const q = filtersAgenda.search.toLowerCase().trim();

    return list.filter(item => {
      if (filtersAgenda.actor !== 'ALL' && item.actor_id !== filtersAgenda.actor) return false;
      if (filtersAgenda.estado !== 'ALL' && item.estado !== filtersAgenda.estado) return false;
      if (filtersAgenda.prioridad !== 'ALL' && item.prioridad !== filtersAgenda.prioridad) return false;
      if (filtersAgenda.plaza !== 'ALL' && item.plaza !== filtersAgenda.plaza) return false;
      if (filtersAgenda.onlyDireccion && (!item.requiere_decision_direccion || item.estado === 'CERRADO_EVIDENCIA')) return false;
      if (filtersAgenda.onlyDesvios && !['ATRASADO', 'OBSERVADO_MADERO', 'DEVUELTO_CORRECCION'].includes(item.estado)) return false;

      if (q) {
        const hay = [
          item.id, item.frente, item.objetivo, item.descripcion,
          item.responsable, item.plaza, item.dependencia,
          item.proximo_paso, item.evidencia_label, item.evidencia_url, item.criterio_lider
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderAgendaModule() {
    const state = window.MaderoStore.getState();
    const allItems = state.agenda_prioridades || [];
    const filtered = getFilteredPrioridades();
    const sum = window.MaderoStore.getComputedSummary();
    const decisionesActivas = sum.decisionesConsolidadas || [];
    const desviosActivos = allItems.filter(p => ['ATRASADO', 'OBSERVADO_MADERO', 'DEVUELTO_CORRECCION'].includes(p.estado));

    // Bandeja destacada de Decisiones Requeridas de Dirección (Consolidada: Agenda + Proveedores)
    const decisionesHtml = decisionesActivas.length === 0 ? '' : `
      <div class="glass-card-dark p-4 sm:p-5 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h3 class="text-xs sm:text-sm font-extrabold text-white tracking-tight uppercase">Decisiones y Definiciones Requeridas de Dirección (${decisionesActivas.length})</h3>
          </div>
          <span class="text-[11px] text-stone-300">Sección 1 y 9 · Escalamiento documentado (Prioridades y Proveedores) con recomendación de Ángelo</span>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
          ${decisionesActivas.map(d => {
            const isProv = d.tipo === 'PROVEEDOR';
            const clickCall = isProv ? `MaderoProveedores.openCompromisoModal('${esc(d.id)}')` : `MaderoConduccion.openPrioridadModal('${esc(d.id)}')`;
            const headerTag = isProv ? `${esc(d.id)} · PROV: ${esc(d.autor)}` : `${esc(d.id)} · ${esc(d.data.frente || 'Agenda')}`;
            const desc = isProv ? (d.data.recomendacion_direccion || d.data.entregable_esperado) : (d.data.detalle_decision_direccion || d.data.proximo_paso);
            const metaDate = isProv ? d.data.fecha_limite : d.data.fecha_compromiso;

            return `
              <div class="p-3.5 rounded-2xl bg-white/8 border border-white/15 flex flex-col justify-between gap-2 hover:bg-white/12 transition cursor-pointer" onclick="${clickCall}">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-mono text-[10px] font-bold text-amber-300">${headerTag}</span>
                    ${estadoBadge(d.data.estado, true)}
                  </div>
                  <div class="font-bold text-white text-xs leading-snug">${esc(d.titulo)}</div>
                  <p class="text-[11px] text-stone-300 leading-relaxed">${esc(desc)}</p>
                </div>
                <div class="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-200 font-semibold">
                  <span>Meta: ${formatDateDisplay(metaDate)}</span>
                  <span>Ver expediente →</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Selector de Actores (Separación de responsabilidades)
    const actorButtons = [
      { id: 'ALL', label: `Todos (${allItems.length})` },
      { id: 'MKT_INTERNO', label: 'Mkt Interno' },
      { id: 'REM', label: 'REM' },
      { id: 'CHRISTIAN_WEB', label: 'L. Christian' },
      { id: 'OTRO_PRESTADOR', label: 'Otros Prest.' },
      { id: 'AREAS_MADERO', label: 'Áreas Madero' },
      { id: 'DIRECCION', label: 'Dirección' }
    ].map(btn => {
      const active = filtersAgenda.actor === btn.id;
      return `<button type="button" onclick="MaderoConduccion.setAgendaFilter('actor', '${btn.id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${active ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'}">${esc(btn.label)}</button>`;
    }).join('');

    // Opciones de Estado
    const estadoOptions = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
      `<option value="${st.id}" ${filtersAgenda.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`
    ).join('');

    const plazaOptions = window.MaderoData.PLAZAS.map(p =>
      `<option value="${esc(p)}" ${filtersAgenda.plaza === p ? 'selected' : ''}>${esc(p)}</option>`
    ).join('');

    // Filas de la tabla
    const rowsHtml = filtered.length === 0 ? `
      <tr>
        <td colspan="7" class="py-10 text-center text-xs text-stone-500">
          No hay objetivos o prioridades que coincidan con los filtros activos.
        </td>
      </tr>
    ` : filtered.map(item => {
      const quickStateOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
        `<option value="${st.id}" ${item.estado === st.id ? 'selected' : ''}>${esc(st.shortLabel)}</option>`
      ).join('');

      const hasExternalUrl = item.evidencia_url && /^https?:\/\//i.test(item.evidencia_url);
      const evidenciaCellHtml = hasExternalUrl
        ? `<a href="${esc(item.evidencia_url)}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-blue-700 hover:text-blue-900 underline font-semibold truncate block max-w-[185px]" title="${esc(item.evidencia_label || item.evidencia_url)}">📎 ${esc(item.evidencia_label || 'Abrir evidencia')} ↗</a>`
        : `<div class="text-[11px] text-stone-700 font-medium truncate max-w-[185px]" title="${esc((item.evidencia_label || 'Sin adjunto') + (item.evidencia_url ? ' · ' + item.evidencia_url : ''))}">📎 ${esc(item.evidencia_label || 'Sin adjunto')}</div>`;

      return `
        <tr class="hover:bg-white/55 transition align-top">
          <td class="py-3 px-3 whitespace-nowrap">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="font-mono font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(item.id)}</span>
              ${prioridadBadge(item.prioridad)}
            </div>
            <span class="text-[10px] font-semibold text-stone-500 block">${esc(item.frente)}</span>
          </td>

          <td class="py-3 px-3 min-w-[250px] max-w-[340px]">
            <button type="button" onclick="MaderoConduccion.openPrioridadModal('${esc(item.id)}')" class="text-left group">
              <span class="font-bold text-stone-900 group-hover:text-blue-900 text-xs block leading-snug">${esc(item.objetivo)}</span>
            </button>
            <p class="text-[11px] text-stone-600 mt-1 leading-relaxed"><strong class="text-stone-800">Próx. paso:</strong> ${esc(item.proximo_paso || '—')}</p>
            ${item.criterio_lider ? `<p class="text-[10px] text-stone-500 italic mt-1">Criterio Ángelo: "${esc(item.criterio_lider)}"</p>` : ''}
          </td>

          <td class="py-3 px-3 whitespace-nowrap">
            <div class="mb-1">${actorBadge(item.actor_id, true)}</div>
            <span class="text-xs font-semibold text-stone-800 block">${esc(item.responsable)}</span>
            <span class="text-[10px] text-stone-500 block truncate max-w-[175px]" title="${esc(item.plaza)}">${esc(item.plaza)}</span>
          </td>

          <td class="py-3 px-3 min-w-[200px] max-w-[260px]">
            <div class="font-mono text-xs font-bold ${item.estado === 'ATRASADO' ? 'text-rose-700' : 'text-stone-900'} mb-1">
              📅 ${formatDateDisplay(item.fecha_compromiso)}
            </div>
            <p class="text-[11px] text-stone-600 leading-snug">
              <strong class="text-stone-700">Dependencia:</strong> ${esc(item.dependencia || 'Sin bloqueo externo')}
            </p>
          </td>

          <td class="py-3 px-3 whitespace-nowrap">
            <div class="mb-1.5">${estadoBadge(item.estado, true)}</div>
            <select onchange="MaderoConduccion.quickChangeEstadoPrioridad('${esc(item.id)}', this.value)" class="text-[10px] bg-white/90 border border-stone-300 rounded-lg px-2 py-1 text-stone-700 font-medium focus:outline-none">
              ${quickStateOpts}
            </select>
          </td>

          <td class="py-3 px-3 min-w-[165px]">
            ${item.requiere_decision_direccion
              ? `<span class="badge-pill badge-amber font-bold mb-1">⚡ Decisión Dirección</span>`
              : `<span class="badge-pill badge-stone mb-1">Resolución Operativa</span>`}
            ${evidenciaCellHtml}
          </td>

          <td class="py-3 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoConduccion.openPrioridadModal('${esc(item.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800 transition">
                Ficha
              </button>
              <button type="button" onclick="MaderoConduccion.handleDeletePrioridad('${esc(item.id)}')" title="Eliminar" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold transition">
                ×
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="space-y-5">
        ${decisionesHtml}

        <div class="glass-card p-4 sm:p-6 space-y-4">
          <!-- Cabecera del Módulo 1 -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="badge-pill badge-dark font-mono">Módulo 1 de 12</span>
                <span class="badge-pill badge-emerald">Operativo · Paso 1</span>
              </div>
              <h2 class="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">Agenda y Prioridades de Conducción</h2>
              <p class="text-xs text-stone-500 mt-0.5">Objetivos, separación por actor responsable, fechas acordadas, dependencias bloqueantes, próximos pasos y decisiones requeridas.</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button type="button" onclick="MaderoUI.openEstadosGuideModal()" class="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50">
                9 Estados Oficiales
              </button>
              <button type="button" onclick="MaderoConduccion.exportAgendaCSV()" class="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                ⬇ CSV Excel
              </button>
              <button type="button" onclick="MaderoConduccion.openPrioridadModal(null)" class="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs">
                + Nueva Prioridad / Objetivo
              </button>
            </div>
          </div>

          <!-- Barra de Filtros Multi-dimensión -->
          <div class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <input type="text" id="agenda-search-input" value="${esc(filtersAgenda.search)}" oninput="MaderoConduccion.setAgendaSearch(this.value)" placeholder="Buscar objetivo, frente, dependencia, responsable..." class="input-glass px-3.5 py-2 w-full">

              <select onchange="MaderoConduccion.setAgendaFilter('estado', this.value)" class="input-glass px-3 py-2 w-full">
                <option value="ALL">Todos los Estados (9 normados)</option>
                ${estadoOptions}
              </select>

              <select onchange="MaderoConduccion.setAgendaFilter('prioridad', this.value)" class="input-glass px-3 py-2 w-full">
                <option value="ALL">Todas las Prioridades</option>
                <option value="CRITICA" ${filtersAgenda.prioridad === 'CRITICA' ? 'selected' : ''}>Prioridad Crítica</option>
                <option value="ALTA" ${filtersAgenda.prioridad === 'ALTA' ? 'selected' : ''}>Prioridad Alta</option>
                <option value="MEDIA" ${filtersAgenda.prioridad === 'MEDIA' ? 'selected' : ''}>Prioridad Media</option>
                <option value="BAJA" ${filtersAgenda.prioridad === 'BAJA' ? 'selected' : ''}>Prioridad Baja</option>
              </select>

              <select onchange="MaderoConduccion.setAgendaFilter('plaza', this.value)" class="input-glass px-3 py-2 w-full">
                <option value="ALL">Todas las Plazas / Sucursales</option>
                ${plazaOptions}
              </select>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2.5">
              <div class="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl overflow-x-auto max-w-full no-scrollbar">
                ${actorButtons}
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <button type="button" onclick="MaderoConduccion.toggleAgendaFlag('onlyDireccion')" class="px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${filtersAgenda.onlyDireccion ? 'bg-amber-600 text-white border-amber-700' : 'bg-amber-50/90 text-amber-900 border-amber-200 hover:bg-amber-100'}">
                  ⚡ Requiere Dirección (${decisionesActivas.length})
                </button>
                <button type="button" onclick="MaderoConduccion.toggleAgendaFlag('onlyDesvios')" class="px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${filtersAgenda.onlyDesvios ? 'bg-rose-600 text-white border-rose-700' : 'bg-rose-50/90 text-rose-900 border-rose-200 hover:bg-rose-100'}">
                  🚨 Atrasados / Observados (${desviosActivos.length})
                </button>
                ${(filtersAgenda.actor !== 'ALL' || filtersAgenda.estado !== 'ALL' || filtersAgenda.prioridad !== 'ALL' || filtersAgenda.plaza !== 'ALL' || filtersAgenda.onlyDireccion || filtersAgenda.onlyDesvios || filtersAgenda.search)
                  ? `<button type="button" onclick="MaderoConduccion.resetAgendaFilters()" class="text-xs font-semibold text-stone-500 hover:text-stone-900 underline">Limpiar filtros</button>`
                  : ''}
              </div>
            </div>
          </div>

          <!-- Tabla Operativa -->
          <div class="overflow-x-auto -mx-1 sm:mx-0 rounded-xl border border-stone-200/70 bg-white/45">
            <table class="w-full text-left text-xs min-w-[920px]">
              <thead>
                <tr class="border-b border-stone-300/60 bg-stone-100/70 text-stone-600 font-bold text-[11px] uppercase tracking-wider">
                  <th class="py-2.5 px-3">ID / Frente</th>
                  <th class="py-2.5 px-3">Objetivo &amp; Próximo Paso</th>
                  <th class="py-2.5 px-3">Actor &amp; Responsable</th>
                  <th class="py-2.5 px-3">Fecha &amp; Dependencia</th>
                  <th class="py-2.5 px-3">Estado Oficial</th>
                  <th class="py-2.5 px-3">Nivel / Evidencia</th>
                  <th class="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody id="agenda-tbody" class="divide-y divide-stone-200/60">
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between pt-2 text-xs text-stone-500 gap-2">
            <span>Mostrando <strong>${filtered.length}</strong> de <strong>${allItems.length}</strong> objetivos registrados</span>
            <span class="text-[11px]">Trazabilidad activa · Los cambios se guardan automáticamente en este navegador</span>
          </div>
        </div>
      </div>
    `;
  }

  function openPrioridadModal(id) {
    const existing = id ? window.MaderoStore.getState().agenda_prioridades.find(p => p.id === id) : null;
    const item = existing || {
      id: '',
      frente: 'Fotografías y Digitalización',
      objetivo: '',
      descripcion: '',
      actor_id: 'MKT_INTERNO',
      responsable: 'Ángelo Lucero',
      plaza: window.MaderoData.PLAZAS[0],
      prioridad: 'ALTA',
      estado: 'PENDIENTE_INICIO',
      fecha_compromiso: window.MaderoStore.getState().meta.fecha_corte || '2026-11-10',
      dependencia: '',
      proximo_paso: '',
      requiere_decision_direccion: false,
      detalle_decision_direccion: '',
      evidencia_label: '',
      evidencia_url: '',
      criterio_lider: ''
    };

    const actorOpts = Object.values(window.MaderoData.ACTORES).map(a =>
      `<option value="${a.id}" ${item.actor_id === a.id ? 'selected' : ''}>${esc(a.label)}</option>`
    ).join('');

    const estadoOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
      `<option value="${st.id}" ${item.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`
    ).join('');

    const plazaOpts = window.MaderoData.PLAZAS.map(p =>
      `<option value="${esc(p)}" ${item.plaza === p ? 'selected' : ''}>${esc(p)}</option>`
    ).join('');

    window.MaderoUI.openModal({
      title: existing ? `Ficha de Prioridad ${item.id}` : 'Registrar Nueva Prioridad u Objetivo',
      subtitle: 'Módulo 1 · Agenda, separación de responsabilidades, dependencias y escalamiento a Dirección.',
      maxWidth: 'max-w-2xl',
      bodyHtml: `
        <div class="space-y-3.5">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Frente de Marketing</label>
              <input type="text" id="pri-frente" value="${esc(item.frente)}" placeholder="Ej. Proveedores (REM), Fotos, Google..." class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Prioridad</label>
              <select id="pri-prioridad" class="input-glass w-full px-3 py-2">
                <option value="CRITICA" ${item.prioridad === 'CRITICA' ? 'selected' : ''}>Crítica</option>
                <option value="ALTA" ${item.prioridad === 'ALTA' ? 'selected' : ''}>Alta</option>
                <option value="MEDIA" ${item.prioridad === 'MEDIA' ? 'selected' : ''}>Media</option>
                <option value="BAJA" ${item.prioridad === 'BAJA' ? 'selected' : ''}>Baja</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha Acordada / Meta</label>
              <input type="date" id="pri-fecha" value="${esc(item.fecha_compromiso)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Objetivo / Compromiso Concreto *</label>
            <input type="text" id="pri-objetivo" value="${esc(item.objetivo)}" placeholder="Qué se debe lograr o entregar con claridad" class="input-glass w-full px-3 py-2 font-semibold">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Contexto y Alcance Operativo</label>
            <textarea id="pri-descripcion" rows="2" class="input-glass w-full px-3 py-2 leading-relaxed">${esc(item.descripcion)}</textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Actor Responsable (Sección 1)</label>
              <select id="pri-actor" class="input-glass w-full px-3 py-2">${actorOpts}</select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Persona / Equipo Asignado</label>
              <input type="text" id="pri-responsable" value="${esc(item.responsable)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Plaza / Sucursal</label>
              <select id="pri-plaza" class="input-glass w-full px-3 py-2">${plazaOpts}</select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Estado Oficial del Circuito (9 Estados)</label>
              <select id="pri-estado" class="input-glass w-full px-3 py-2 font-semibold">${estadoOpts}</select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Evidencia o Documento</label>
              <input type="text" id="pri-evidencia-label" value="${esc(item.evidencia_label)}" placeholder="Ej. Minuta REM 15/10, Carpeta Drive..." class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Enlace / Ruta de Evidencia</label>
              <input type="text" id="pri-evidencia-url" value="${esc(item.evidencia_url)}" placeholder="https://... o ruta de referencia" class="input-glass w-full px-3 py-2">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Dependencia / Qué falta para avanzar</label>
              <textarea id="pri-dependencia" rows="2" placeholder="Acceso, lavado, aprobación, entrega previa..." class="input-glass w-full px-3 py-2">${esc(item.dependencia)}</textarea>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Próximo Paso Inmediato</label>
              <textarea id="pri-proximo" rows="2" placeholder="Acción concreta y fecha de control..." class="input-glass w-full px-3 py-2">${esc(item.proximo_paso)}</textarea>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Criterio / Lectura de Ángelo Lucero</label>
            <input type="text" id="pri-criterio" value="${esc(item.criterio_lider)}" placeholder="Conclusión objetiva del Líder sobre este punto" class="input-glass w-full px-3 py-2">
          </div>

          <div class="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2">
            <label class="flex items-center gap-2 cursor-pointer font-bold text-amber-950 text-xs">
              <input type="checkbox" id="pri-req-dir" ${item.requiere_decision_direccion ? 'checked' : ''} class="rounded text-stone-900">
              <span>⚡ Este punto requiere una definición o decisión de Dirección (Escalamiento Sección 9)</span>
            </label>
            <textarea id="pri-det-dir" rows="2" placeholder="Si requiere decisión de Dirección: indicar antecedentes, opciones y recomendación concreta de Ángelo..." class="input-glass w-full px-3 py-2">${esc(item.detalle_decision_direccion)}</textarea>
          </div>
        </div>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoConduccion.savePrioridadFromModal('${esc(item.id)}')" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800">Guardar en Agenda</button>
      `
    });
  }

  function savePrioridadFromModal(existingId) {
    const objetivo = document.getElementById('pri-objetivo').value.trim();
    if (!objetivo) {
      window.MaderoUI.showToast('Ingresá el objetivo principal', 'red');
      return;
    }

    window.MaderoStore.upsertPrioridad({
      id: existingId || undefined,
      frente: document.getElementById('pri-frente').value.trim() || 'General',
      prioridad: document.getElementById('pri-prioridad').value,
      fecha_compromiso: document.getElementById('pri-fecha').value,
      objetivo,
      descripcion: document.getElementById('pri-descripcion').value.trim(),
      actor_id: document.getElementById('pri-actor').value,
      responsable: document.getElementById('pri-responsable').value.trim() || 'Ángelo Lucero',
      plaza: document.getElementById('pri-plaza').value,
      estado: document.getElementById('pri-estado').value,
      evidencia_label: document.getElementById('pri-evidencia-label').value.trim(),
      evidencia_url: document.getElementById('pri-evidencia-url').value.trim(),
      dependencia: document.getElementById('pri-dependencia').value.trim(),
      proximo_paso: document.getElementById('pri-proximo').value.trim(),
      criterio_lider: document.getElementById('pri-criterio').value.trim(),
      requiere_decision_direccion: document.getElementById('pri-req-dir').checked,
      detalle_decision_direccion: document.getElementById('pri-det-dir').value.trim()
    });

    window.MaderoUI.closeModal();
    window.MaderoUI.showToast(existingId ? 'Prioridad actualizada' : 'Nueva prioridad registrada');
  }

  function handleDeletePrioridad(id) {
    if (confirm(`¿Eliminar el registro ${id} de la Agenda?`)) {
      window.MaderoStore.deletePrioridad(id);
      window.MaderoUI.showToast(`Registro ${id} eliminado`, 'amber');
    }
  }

  function quickChangeEstadoPrioridad(id, nuevoEstado) {
    window.MaderoStore.setPrioridadEstado(id, nuevoEstado);
    window.MaderoUI.showToast(`Estado de ${id} actualizado`);
  }

  function setAgendaFilter(key, val) {
    filtersAgenda[key] = val;
    window.MaderoApp.renderActiveView();
  }

  function setAgendaSearch(val) {
    filtersAgenda.search = val;
    window.MaderoApp.renderActiveView();
  }

  function toggleAgendaFlag(key) {
    filtersAgenda[key] = !filtersAgenda[key];
    window.MaderoApp.renderActiveView();
  }

  function clearAgendaFiltersState() {
    filtersAgenda.search = '';
    filtersAgenda.actor = 'ALL';
    filtersAgenda.estado = 'ALL';
    filtersAgenda.prioridad = 'ALL';
    filtersAgenda.plaza = 'ALL';
    filtersAgenda.onlyDireccion = false;
    filtersAgenda.onlyDesvios = false;
  }

  function resetAgendaFilters() {
    clearAgendaFiltersState();
    window.MaderoApp.renderActiveView();
  }

  function focusAgendaDesvios() {
    clearAgendaFiltersState();
    filtersAgenda.onlyDesvios = true;
  }

  function focusAgendaDireccion() {
    clearAgendaFiltersState();
    filtersAgenda.onlyDireccion = true;
  }

  function exportAgendaCSV() {
    const items = getFilteredPrioridades();
    const headers = [
      'ID', 'Frente', 'Prioridad', 'Objetivo', 'Actor Responsabilidad',
      'Responsable', 'Plaza', 'Fecha Acordada', 'Estado Oficial',
      'Dependencia', 'Proximo Paso', 'Requiere Decision Direccion',
      'Detalle Decision Direccion', 'Evidencia', 'Enlace Evidencia', 'Criterio Lider'
    ];
    const rows = items.map(i => [
      i.id,
      i.frente,
      i.prioridad,
      i.objetivo,
      (window.MaderoData.ACTORES[i.actor_id] || {}).label || i.actor_id,
      i.responsable,
      i.plaza,
      i.fecha_compromiso,
      (window.MaderoData.ESTADOS_SEGUIMIENTO[i.estado] || {}).label || i.estado,
      i.dependencia,
      i.proximo_paso,
      i.requiere_decision_direccion ? 'SI' : 'NO',
      i.detalle_decision_direccion,
      i.evidencia_label,
      i.evidencia_url,
      i.criterio_lider
    ]);
    window.MaderoStore.exportCSV('madero_mkt_agenda_prioridades.csv', headers, rows);
    window.MaderoUI.showToast('CSV de Agenda exportado');
  }

  // ========================================================================
  // C. MÓDULO 2: EQUIPO INTERNO, CAPACIDAD, REEMPLAZOS Y CALIDAD (Sección 5.2)
  // ========================================================================
  function getFilteredTareasEquipo() {
    const tasks = window.MaderoStore.getState().equipo_tareas || [];
    const q = filtersEquipo.search.toLowerCase().trim();

    return tasks.filter(t => {
      if (filtersEquipo.miembro !== 'ALL' && t.miembro_id !== filtersEquipo.miembro) return false;
      if (filtersEquipo.calidad !== 'ALL' && t.calidad_estado !== filtersEquipo.calidad) return false;
      if (filtersEquipo.onlyBloqueos && (!t.bloqueo || !t.bloqueo.trim() || t.estado === 'CERRADO_EVIDENCIA')) return false;
      if (filtersEquipo.onlyAbsorbido && !t.es_trabajo_absorbido) return false;

      if (q) {
        const hay = [t.id, t.tarea, t.categoria, t.plaza, t.bloqueo, t.nota_calidad, t.origen_absorbido, t.evidencia].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderEquipoModule() {
    const state = window.MaderoStore.getState();
    const members = state.equipo_miembros || [];
    const allTasks = state.equipo_tareas || [];
    const filteredTasks = getFilteredTareasEquipo();
    const summary = window.MaderoStore.getComputedSummary();

    const memberMap = {};
    members.forEach(m => { memberMap[m.id] = m; });

    // Tarjetas de Capacidad, Cobertura y Reemplazos (Continuidad Sección 2)
    const memberCardsHtml = members.map(m => {
      const mTasks = allTasks.filter(t => t.miembro_id === m.id);
      const totalHs = mTasks.reduce((acc, t) => acc + (Number(t.horas_estimadas) || 0), 0);
      const absHs = mTasks.filter(t => t.es_trabajo_absorbido).reduce((acc, t) => acc + (Number(t.horas_estimadas) || 0), 0);
      const cap = Number(m.horas_capacidad_semanal) || 40;
      const pct = Math.min(100, Math.round((totalHs / cap) * 100));
      const over = totalHs > cap;

      let contBadge = '<span class="badge-pill badge-emerald">Backup Documentado</span>';
      if (m.estado_continuidad === 'EN_PROCESO') contBadge = '<span class="badge-pill badge-amber">Manual en Proceso</span>';
      if (m.estado_continuidad === 'RIESGO_SIN_BACKUP') contBadge = '<span class="badge-pill badge-red font-bold">Riesgo · Sin Backup</span>';

      const isSelected = filtersEquipo.miembro === m.id;

      return `
        <div class="glass-card p-4 sm:p-5 flex flex-col justify-between gap-3 ${isSelected ? 'ring-2 ring-stone-900' : ''}">
          <div class="space-y-2.5">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="font-mono text-[10px] font-bold text-stone-500">${esc(m.id)}</span>
                <h3 class="text-sm font-extrabold text-stone-900 leading-snug">${esc(m.nombre)}</h3>
                <p class="text-[11px] text-stone-600 font-medium">${esc(m.rol)}</p>
              </div>
              ${contBadge}
            </div>

            <div class="text-[11px] text-stone-600 flex items-center gap-1.5">
              <span>📍</span><span class="truncate" title="${esc(m.plaza_base)}">${esc(m.plaza_base)}</span>
            </div>

            <!-- Barra de Carga Horaria -->
            <div class="p-2.5 rounded-xl bg-white/80 border border-stone-200/80 space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-stone-700">Carga Semanal Asignada</span>
                <span class="font-mono font-bold ${over ? 'text-rose-700' : 'text-stone-900'}">${totalHs} / ${cap} hs (${Math.round((totalHs / cap) * 100)}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                <div class="h-full ${over ? 'bg-rose-600' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-600'} rounded-full transition-all" style="width:${pct}%"></div>
              </div>
              ${absHs > 0 ? `<div class="text-[10px] text-rose-700 font-semibold">⚠ Incluye ${absHs} hs de trabajo absorbido por desvíos externos</div>` : `<div class="text-[10px] text-stone-500">Sin desvío por sustitución de proveedores</div>`}
            </div>

            <!-- Reemplazo / Continuidad y Calidad -->
            <div class="text-[11px] text-stone-700 space-y-1 bg-stone-100/75 p-2.5 rounded-xl border border-stone-200/60">
              <div><strong class="text-stone-900">Reemplazo / Cobertura:</strong> ${esc(m.reemplazo_designado)}</div>
              <div class="text-[10px] text-stone-500">${esc(m.detalle_continuidad)}</div>
              ${m.estandar_calidad ? `<div class="text-[10px] text-emerald-900 pt-1 border-t border-stone-200/70"><strong>Calidad:</strong> ${esc(m.estandar_calidad)}</div>` : ''}
              ${m.observaciones ? `<div class="text-[10px] text-stone-600 italic">${esc(m.observaciones)}</div>` : ''}
            </div>
          </div>

          <div class="pt-2.5 border-t border-stone-200/60 flex items-center justify-between gap-2">
            <button type="button" onclick="MaderoConduccion.openMiembroModal('${esc(m.id)}')" class="text-xs font-semibold text-stone-600 hover:text-stone-900">
              ✎ Editar Rol / Backup
            </button>
            <button type="button" onclick="MaderoConduccion.setEquipoFilter('miembro', '${isSelected ? 'ALL' : esc(m.id)}')" class="px-2.5 py-1 rounded-lg ${isSelected ? 'bg-stone-900 text-white' : 'bg-stone-200/75 text-stone-800 hover:bg-stone-300/70'} text-[11px] font-bold transition">
              ${isSelected ? 'Mostrando tareas ✓' : `Ver tareas (${mTasks.length}) →`}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Tabla de Tareas Internas
    const taskRowsHtml = filteredTasks.length === 0 ? `
      <tr>
        <td colspan="7" class="py-10 text-center text-xs text-stone-500">No hay tareas internas para el filtro seleccionado.</td>
      </tr>
    ` : filteredTasks.map(t => {
      const m = memberMap[t.miembro_id];
      const respName = m ? m.nombre : t.miembro_id;

      let calBadge = '<span class="badge-pill badge-stone">Pendiente Rev.</span>';
      if (t.calidad_estado === 'APROBADO') calBadge = '<span class="badge-pill badge-emerald">✓ Estándar OK</span>';
      if (t.calidad_estado === 'OBSERVADO') calBadge = '<span class="badge-pill badge-amber font-bold">⚠ Calidad Observada</span>';

      const quickStateOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
        `<option value="${st.id}" ${t.estado === st.id ? 'selected' : ''}>${esc(st.shortLabel)}</option>`
      ).join('');

      return `
        <tr class="hover:bg-white/55 transition align-top ${t.es_trabajo_absorbido ? 'bg-rose-50/35' : ''}">
          <td class="py-3 px-3 whitespace-nowrap">
            <span class="font-mono font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(t.id)}</span>
            <span class="text-[10px] font-semibold text-stone-500 block mt-1">${esc(t.categoria)}</span>
          </td>

          <td class="py-3 px-3 min-w-[250px] max-w-[340px]">
            <button type="button" onclick="MaderoConduccion.openTareaEquipoModal('${esc(t.id)}')" class="text-left group">
              <span class="font-bold text-stone-900 group-hover:text-blue-900 text-xs block leading-snug">${esc(t.tarea)}</span>
            </button>
            ${t.es_trabajo_absorbido ? `
              <div class="mt-1.5 p-2 rounded-lg bg-rose-100/80 border border-rose-300/80 text-[10px] text-rose-950 leading-snug">
                <strong>🛡️ TRABAJO ABSORBIDO (No sustitución silenciosa):</strong> ${esc(t.origen_absorbido)}
              </div>
            ` : ''}
            ${t.evidencia ? `<span class="text-[10px] text-stone-500 block mt-1">📎 Evidencia: ${esc(t.evidencia)}</span>` : ''}
          </td>

          <td class="py-3 px-3 min-w-[170px]">
            <span class="font-semibold text-stone-900 text-xs block">${esc(respName)}</span>
            <span class="text-[10px] text-stone-500 block">${esc(t.plaza)}</span>
          </td>

          <td class="py-3 px-3 text-center whitespace-nowrap">
            <span class="font-mono font-extrabold text-stone-900 text-xs">${esc(t.horas_estimadas)} hs</span>
            ${t.es_trabajo_absorbido ? `
              <span class="badge-pill badge-red text-[9px] block mt-1">Absorbido</span>
              ${(() => {
                const provComp = (state.proveedores_compromisos || []).find(c => Array.isArray(c.tareas_vinculadas) && c.tareas_vinculadas.includes(t.id));
                return provComp ? `<button type="button" onclick="MaderoApp.navigateModule('m9-proveedores')" class="font-mono text-[9px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded px-1 py-0.5 block mt-1 cursor-pointer" title="Ver reclamo en Módulo 9 Proveedores">Reclamo ${esc(provComp.id)}</button>` : '';
              })()}
            ` : ''}
          </td>

          <td class="py-3 px-3 whitespace-nowrap">
            <div class="font-mono text-xs font-semibold text-stone-800 mb-1">📅 ${formatDateDisplay(t.fecha_entrega)}</div>
            <div class="mb-1.5">${estadoBadge(t.estado, true)}</div>
            <select onchange="MaderoConduccion.quickChangeEstadoTarea('${esc(t.id)}', this.value)" class="text-[10px] bg-white/90 border border-stone-300 rounded-lg px-2 py-1 text-stone-700 font-medium focus:outline-none">
              ${quickStateOpts}
            </select>
          </td>

          <td class="py-3 px-3 min-w-[210px] max-w-[260px]">
            <div class="mb-1">${calBadge}</div>
            ${t.bloqueo ? `<p class="text-[10px] text-amber-900 bg-amber-100/75 border border-amber-300/70 rounded px-2 py-1 mb-1"><strong>🚧 Bloqueo:</strong> ${esc(t.bloqueo)}</p>` : ''}
            ${t.nota_calidad ? `<p class="text-[10px] text-stone-600 leading-snug">${esc(t.nota_calidad)}</p>` : ''}
          </td>

          <td class="py-3 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoConduccion.openTareaEquipoModal('${esc(t.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800">
                Editar
              </button>
              <button type="button" onclick="MaderoConduccion.handleDeleteTareaEquipo('${esc(t.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold">
                ×
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="space-y-5">
        <!-- Encabezado y Resumen de Capacidad / Continuidad -->
        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="badge-pill badge-dark font-mono">Módulo 2 de 12</span>
                <span class="badge-pill badge-emerald">Operativo · Paso 1</span>
              </div>
              <h2 class="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">Equipo Interno: Capacidad, Cobertura, Reemplazos y Calidad</h2>
              <p class="text-xs text-stone-500 mt-0.5">Supervisión de carga semanal, continuidad documental ante ausencias, bloqueos en sucursales y registro explícito de trabajo absorbido.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" onclick="MaderoConduccion.openMiembroModal(null)" class="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                + Rol / Integrante
              </button>
              <button type="button" onclick="MaderoConduccion.exportEquipoCSV()" class="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                ⬇ CSV Equipo
              </button>
              <button type="button" onclick="MaderoConduccion.openTareaEquipoModal(null)" class="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">
                + Nueva Tarea Interna
              </button>
            </div>
          </div>

          <!-- Cinta de Indicadores Internos -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="p-3.5 rounded-2xl bg-white/75 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Ocupación Planificada</span>
              <span class="font-mono text-xl font-extrabold text-stone-900">${summary.horasAsignadas} / ${summary.capacidadTotalHs} hs</span>
              <span class="text-[11px] text-emerald-700 font-semibold block mt-0.5">${summary.ocupacionPct}% de capacidad semanal</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-white/75 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Continuidad / Reemplazos</span>
              <span class="font-mono text-xl font-extrabold text-stone-900">${summary.backupsDocumentados}/${summary.totalMiembros}</span>
              <span class="text-[11px] text-stone-600 block mt-0.5">Funciones con backup documentado</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">Bloqueos &amp; Calidad</span>
              <span class="font-mono text-xl font-extrabold text-amber-950">${summary.tareasBloqueadasCount} bloq · ${summary.tareasCalidadObsCount} obs</span>
              <span class="text-[11px] text-amber-800 block mt-0.5">Frentes que requieren destrabe</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-rose-50/75 border border-rose-200/80">
              <span class="text-[10px] font-bold uppercase tracking-wider text-rose-900 block">Trabajo Absorbido (Secc. 9)</span>
              <span class="font-mono text-xl font-extrabold text-rose-900">${summary.horasAbsorbidasConsolidadas.toFixed(1)} hs</span>
              <span class="text-[11px] text-rose-800 block mt-0.5">${summary.horasAbsorbidas} hs equipo + ${summary.provHorasAbsorbidasManuales} hs prov</span>
            </div>
          </div>
        </div>

        <!-- Grid de Células / Integrantes -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${memberCardsHtml}
        </div>

        <!-- Tabla de Tareas del Equipo Interno -->
        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200/70">
            <div>
              <h3 class="text-sm sm:text-base font-extrabold text-stone-900">Ejecución Semanal de Tareas, Bloqueos y Control de Calidad</h3>
              <p class="text-xs text-stone-500">Cada urgencia resuelta internamente por falla de un proveedor se marca como <strong>Trabajo Absorbido</strong> para reclamo formal.</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
              <input type="text" id="equipo-search-input" value="${esc(filtersEquipo.search)}" oninput="MaderoConduccion.setEquipoSearch(this.value)" placeholder="Buscar tarea, sucursal, bloqueo, evidencia..." class="input-glass px-3.5 py-2 w-full sm:w-72">

              <select onchange="MaderoConduccion.setEquipoFilter('miembro', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Todos los Roles / Integrantes</option>
                ${members.map(m => `<option value="${esc(m.id)}" ${filtersEquipo.miembro === m.id ? 'selected' : ''}>${esc(m.nombre)}</option>`).join('')}
              </select>

              <select onchange="MaderoConduccion.setEquipoFilter('calidad', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Toda Evaluación de Calidad</option>
                <option value="APROBADO" ${filtersEquipo.calidad === 'APROBADO' ? 'selected' : ''}>✓ Aprobado Estándar Madero</option>
                <option value="OBSERVADO" ${filtersEquipo.calidad === 'OBSERVADO' ? 'selected' : ''}>⚠ Calidad Observada (Rehacer)</option>
                <option value="PENDIENTE" ${filtersEquipo.calidad === 'PENDIENTE' ? 'selected' : ''}>Pendiente de Revisión</option>
              </select>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button type="button" onclick="MaderoConduccion.toggleEquipoFlag('onlyBloqueos')" class="px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${filtersEquipo.onlyBloqueos ? 'bg-amber-600 text-white border-amber-700' : 'bg-amber-50 text-amber-900 border-amber-200'}">
                🚧 Con Bloqueo (${summary.tareasBloqueadasCount})
              </button>
              <button type="button" onclick="MaderoConduccion.toggleEquipoFlag('onlyAbsorbido')" class="px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${filtersEquipo.onlyAbsorbido ? 'bg-rose-600 text-white border-rose-700' : 'bg-rose-50 text-rose-900 border-rose-200'}">
                🛡️ Trabajo Absorbido (${summary.tareasAbsorbidasCount})
              </button>
              ${(filtersEquipo.miembro !== 'ALL' || filtersEquipo.calidad !== 'ALL' || filtersEquipo.onlyBloqueos || filtersEquipo.onlyAbsorbido || filtersEquipo.search)
                ? `<button type="button" onclick="MaderoConduccion.resetEquipoFilters()" class="text-xs font-semibold text-stone-500 hover:text-stone-900 underline">Limpiar filtros</button>`
                : ''}
            </div>
          </div>

          <div class="overflow-x-auto -mx-1 sm:mx-0 rounded-xl border border-stone-200/70 bg-white/45">
            <table class="w-full text-left text-xs min-w-[900px]">
              <thead>
                <tr class="border-b border-stone-300/60 bg-stone-100/70 text-stone-600 font-bold text-[11px] uppercase tracking-wider">
                  <th class="py-2.5 px-3">ID / Categoría</th>
                  <th class="py-2.5 px-3">Tarea &amp; Trazabilidad</th>
                  <th class="py-2.5 px-3">Responsable &amp; Plaza</th>
                  <th class="py-2.5 px-3 text-center">Carga</th>
                  <th class="py-2.5 px-3">Fecha &amp; Estado</th>
                  <th class="py-2.5 px-3">Calidad &amp; Bloqueos</th>
                  <th class="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200/60">
                ${taskRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function openMiembroModal(id) {
    const existing = id ? window.MaderoStore.getState().equipo_miembros.find(m => m.id === id) : null;
    const item = existing || {
      id: '',
      nombre: '',
      rol: '',
      plaza_base: window.MaderoData.PLAZAS[0],
      horas_capacidad_semanal: 40,
      reemplazo_designado: '',
      estado_continuidad: 'EN_PROCESO',
      detalle_continuidad: '',
      estandar_calidad: '',
      observaciones: ''
    };

    window.MaderoUI.openModal({
      title: existing ? `Editar Rol / Integrante (${item.id})` : 'Agregar Integrante o Célula Funcional',
      subtitle: 'Módulo 2 · Capacidad semanal, cobertura territorial y esquema de reemplazo.',
      maxWidth: 'max-w-xl',
      bodyHtml: `
        <div class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Nombre o Célula Funcional *</label>
              <input type="text" id="mem-nombre" value="${esc(item.nombre)}" class="input-glass w-full px-3 py-2 font-semibold">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Capacidad Semanal (Horas)</label>
              <input type="number" id="mem-horas" value="${esc(item.horas_capacidad_semanal)}" min="1" max="70" class="input-glass w-full px-3 py-2 font-mono">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Rol / Responsabilidad Operativa</label>
            <input type="text" id="mem-rol" value="${esc(item.rol)}" class="input-glass w-full px-3 py-2">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Plaza / Sucursales Cubiertas</label>
            <input type="text" id="mem-plaza" value="${esc(item.plaza_base)}" class="input-glass w-full px-3 py-2">
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Reemplazo Designado (Backup)</label>
              <input type="text" id="mem-reemplazo" value="${esc(item.reemplazo_designado)}" placeholder="Quién cubre ante licencia o urgencia" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Estado de Continuidad Documental</label>
              <select id="mem-cont-estado" class="input-glass w-full px-3 py-2">
                <option value="DOCUMENTADO" ${item.estado_continuidad === 'DOCUMENTADO' ? 'selected' : ''}>Proceso y Backup Documentado</option>
                <option value="EN_PROCESO" ${item.estado_continuidad === 'EN_PROCESO' ? 'selected' : ''}>Instructivo en Elaboración</option>
                <option value="RIESGO_SIN_BACKUP" ${item.estado_continuidad === 'RIESGO_SIN_BACKUP' ? 'selected' : ''}>Riesgo · Sin Reemplazo Definido</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Detalle de Continuidad / Instructivo</label>
            <textarea id="mem-cont-det" rows="2" class="input-glass w-full px-3 py-2">${esc(item.detalle_continuidad)}</textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Estándar / Indicador de Calidad</label>
              <input type="text" id="mem-estandar" value="${esc(item.estandar_calidad)}" placeholder="Ej. 92% lotes aprobados en 1ra revisión" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Observaciones Operativas</label>
              <input type="text" id="mem-obs" value="${esc(item.observaciones)}" placeholder="Foco actual o cuello de botella..." class="input-glass w-full px-3 py-2">
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        ${existing ? `<button type="button" onclick="MaderoConduccion.handleDeleteMiembro('${esc(item.id)}')" class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold mr-auto">Eliminar</button>` : ''}
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoConduccion.saveMiembroFromModal('${esc(item.id)}')" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800">Guardar</button>
      `
    });
  }

  function saveMiembroFromModal(existingId) {
    const nombre = document.getElementById('mem-nombre').value.trim();
    if (!nombre) {
      window.MaderoUI.showToast('Ingresá el nombre o célula funcional', 'red');
      return;
    }
    window.MaderoStore.upsertMiembro({
      id: existingId || undefined,
      nombre,
      horas_capacidad_semanal: Number(document.getElementById('mem-horas').value) || 40,
      rol: document.getElementById('mem-rol').value.trim(),
      plaza_base: document.getElementById('mem-plaza').value.trim(),
      reemplazo_designado: document.getElementById('mem-reemplazo').value.trim(),
      estado_continuidad: document.getElementById('mem-cont-estado').value,
      detalle_continuidad: document.getElementById('mem-cont-det').value.trim(),
      estandar_calidad: document.getElementById('mem-estandar').value.trim(),
      observaciones: document.getElementById('mem-obs').value.trim()
    });
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Integrante / rol guardado');
  }

  function handleDeleteMiembro(id) {
    if (confirm(`¿Eliminar el rol / integrante ${id}?`)) {
      if (filtersEquipo.miembro === id) {
        filtersEquipo.miembro = 'ALL';
      }
      window.MaderoStore.deleteMiembro(id);
      window.MaderoUI.closeModal();
      window.MaderoUI.showToast(`Integrante ${id} eliminado`, 'amber');
    }
  }

  function openTareaEquipoModal(id) {
    const state = window.MaderoStore.getState();
    const members = state.equipo_miembros || [];
    const existing = id ? state.equipo_tareas.find(t => t.id === id) : null;
    const item = existing || {
      id: '',
      tarea: '',
      miembro_id: (members[0] && members[0].id) || 'MEM-01',
      categoria: 'Fotografía y Salón',
      plaza: window.MaderoData.PLAZAS[0],
      horas_estimadas: 3,
      es_trabajo_absorbido: false,
      origen_absorbido: '',
      estado: 'EN_ELABORACION',
      fecha_entrega: state.meta.fecha_corte || '2026-11-08',
      bloqueo: '',
      calidad_estado: 'PENDIENTE',
      nota_calidad: '',
      evidencia: ''
    };

    const estadoOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
      `<option value="${st.id}" ${item.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`
    ).join('');

    const plazaOpts = window.MaderoData.PLAZAS.map(p =>
      `<option value="${esc(p)}" ${item.plaza === p ? 'selected' : ''}>${esc(p)}</option>`
    ).join('');

    window.MaderoUI.openModal({
      title: existing ? `Editar Tarea Interna ${item.id}` : 'Registrar Tarea del Equipo Interno',
      subtitle: 'Módulo 2 · Carga de trabajo, bloqueos, control de calidad y trabajo absorbido.',
      maxWidth: 'max-w-2xl',
      bodyHtml: `
        <div class="space-y-3.5">
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Descripción de la Tarea *</label>
            <input type="text" id="tsk-nombre" value="${esc(item.tarea)}" class="input-glass w-full px-3 py-2 font-semibold">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Responsable Interno</label>
              <select id="tsk-miembro" class="input-glass w-full px-3 py-2">
                ${members.map(m => `<option value="${esc(m.id)}" ${item.miembro_id === m.id ? 'selected' : ''}>${esc(m.nombre)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Categoría Operativa</label>
              <select id="tsk-categoria" class="input-glass w-full px-3 py-2">
                ${['Fotografía y Salón', 'Carga Lucy / Drive / Web', 'Auditoría Stock Visual', 'Diseño / Urgencia Absorbida', 'Eventos y Territorio', 'Merchandising', 'Gestión y Control'].map(c => `<option value="${c}" ${item.categoria === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Horas Estimadas / Insumidas</label>
              <input type="number" step="0.5" min="0.5" id="tsk-horas" value="${esc(item.horas_estimadas)}" class="input-glass w-full px-3 py-2 font-mono">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Plaza / Sucursal</label>
              <select id="tsk-plaza" class="input-glass w-full px-3 py-2">${plazaOpts}</select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha Comprometida</label>
              <input type="date" id="tsk-fecha" value="${esc(item.fecha_entrega)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Estado Oficial</label>
              <select id="tsk-estado" class="input-glass w-full px-3 py-2">${estadoOpts}</select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Evaluación de Calidad Madero</label>
              <select id="tsk-calidad" class="input-glass w-full px-3 py-2">
                <option value="PENDIENTE" ${item.calidad_estado === 'PENDIENTE' ? 'selected' : ''}>Pendiente de Revisión</option>
                <option value="APROBADO" ${item.calidad_estado === 'APROBADO' ? 'selected' : ''}>✓ Aprobado bajo Estándar Madero</option>
                <option value="OBSERVADO" ${item.calidad_estado === 'OBSERVADO' ? 'selected' : ''}>⚠ Observado · Requiere Corrección</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Evidencia / Carpeta / Respaldo</label>
              <input type="text" id="tsk-evidencia" value="${esc(item.evidencia)}" placeholder="Carpeta Drive, CSV, Link..." class="input-glass w-full px-3 py-2">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Bloqueo Operativo (dejar vacío si no hay)</label>
              <textarea id="tsk-bloqueo" rows="2" placeholder="Ej. Falta llave, falta lavado en CAM..." class="input-glass w-full px-3 py-2">${esc(item.bloqueo)}</textarea>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Criterio / Observación de Calidad</label>
              <textarea id="tsk-nota-calidad" rows="2" placeholder="Motivo de aprobación u observación..." class="input-glass w-full px-3 py-2">${esc(item.nota_calidad)}</textarea>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-rose-50/85 border border-rose-200/90 space-y-2">
            <label class="flex items-center gap-2 cursor-pointer font-bold text-rose-950 text-xs">
              <input type="checkbox" id="tsk-absorbido" ${item.es_trabajo_absorbido ? 'checked' : ''} class="rounded text-rose-700">
              <span>🛡️ Trabajo Absorbido: Marketing Interno debió ejecutar esta tarea por demora o falla de un proveedor externo (Sección 7 y 9)</span>
            </label>
            <input type="text" id="tsk-origen-abs" value="${esc(item.origen_absorbido)}" placeholder="Indicar qué proveedor debía hacerlo, motivo e impacto para reclamar solución de origen..." class="input-glass w-full px-3 py-2">
          </div>
        </div>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoConduccion.saveTareaFromModal('${esc(item.id)}')" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800">Guardar Tarea</button>
      `
    });
  }

  function saveTareaFromModal(existingId) {
    const tarea = document.getElementById('tsk-nombre').value.trim();
    if (!tarea) {
      window.MaderoUI.showToast('Describí la tarea interna', 'red');
      return;
    }
    window.MaderoStore.upsertTareaEquipo({
      id: existingId || undefined,
      tarea,
      miembro_id: document.getElementById('tsk-miembro').value,
      categoria: document.getElementById('tsk-categoria').value,
      horas_estimadas: Number(document.getElementById('tsk-horas').value) || 1,
      plaza: document.getElementById('tsk-plaza').value,
      fecha_entrega: document.getElementById('tsk-fecha').value,
      estado: document.getElementById('tsk-estado').value,
      calidad_estado: document.getElementById('tsk-calidad').value,
      evidencia: document.getElementById('tsk-evidencia').value.trim(),
      bloqueo: document.getElementById('tsk-bloqueo').value.trim(),
      nota_calidad: document.getElementById('tsk-nota-calidad').value.trim(),
      es_trabajo_absorbido: document.getElementById('tsk-absorbido').checked,
      origen_absorbido: document.getElementById('tsk-origen-abs').value.trim()
    });
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast(existingId ? 'Tarea actualizada' : 'Tarea interna agregada');
  }

  function handleDeleteTareaEquipo(id) {
    if (confirm(`¿Eliminar la tarea interna ${id}?`)) {
      window.MaderoStore.deleteTareaEquipo(id);
      window.MaderoUI.showToast(`Tarea ${id} eliminada`, 'amber');
    }
  }

  function quickChangeEstadoTarea(id, nuevoEstado) {
    window.MaderoStore.setTareaEquipoEstado(id, nuevoEstado);
    window.MaderoUI.showToast(`Estado de ${id} actualizado`);
  }

  function setEquipoFilter(key, val) {
    filtersEquipo[key] = val;
    window.MaderoApp.renderActiveView();
  }

  function setEquipoSearch(val) {
    filtersEquipo.search = val;
    window.MaderoApp.renderActiveView();
  }

  function toggleEquipoFlag(key) {
    filtersEquipo[key] = !filtersEquipo[key];
    window.MaderoApp.renderActiveView();
  }

  function clearEquipoFiltersState() {
    filtersEquipo.search = '';
    filtersEquipo.miembro = 'ALL';
    filtersEquipo.calidad = 'ALL';
    filtersEquipo.onlyBloqueos = false;
    filtersEquipo.onlyAbsorbido = false;
  }

  function resetEquipoFilters() {
    clearEquipoFiltersState();
    window.MaderoApp.renderActiveView();
  }

  function focusEquipoCapacidad() {
    clearEquipoFiltersState();
  }

  function focusEquipoAbsorbido() {
    clearEquipoFiltersState();
    filtersEquipo.onlyAbsorbido = true;
  }

  function exportEquipoCSV() {
    const state = window.MaderoStore.getState();
    const mMap = {};
    (state.equipo_miembros || []).forEach(m => { mMap[m.id] = m.nombre; });
    const rows = getFilteredTareasEquipo().map(t => [
      t.id,
      t.categoria,
      t.tarea,
      mMap[t.miembro_id] || t.miembro_id,
      t.plaza,
      t.horas_estimadas,
      t.es_trabajo_absorbido ? 'SI' : 'NO',
      t.origen_absorbido,
      t.fecha_entrega,
      (window.MaderoData.ESTADOS_SEGUIMIENTO[t.estado] || {}).label || t.estado,
      t.calidad_estado,
      t.bloqueo,
      t.nota_calidad,
      t.evidencia
    ]);
    window.MaderoStore.exportCSV(
      'madero_mkt_equipo_interno.csv',
      ['ID', 'Categoria', 'Tarea', 'Responsable', 'Plaza', 'Horas', 'Trabajo Absorbido', 'Origen Absorbido', 'Fecha', 'Estado', 'Calidad', 'Bloqueo', 'Nota Calidad', 'Evidencia'],
      rows
    );
    window.MaderoUI.showToast('CSV de Equipo Interno exportado');
  }

  // ========================================================================
  // D. NIVEL 2: VISTA CONECTADA DEL RESUMEN GERENCIAL A DIRECCIÓN (Secc. 3 y 10)
  // ========================================================================
  function renderResumenGerencialPreview() {
    const state = window.MaderoStore.getState();
    const meta = state.meta;
    const sum = window.MaderoStore.getComputedSummary();
    const tareasAbs = (state.equipo_tareas || []).filter(t => t.es_trabajo_absorbido);
    const provManualAbs = (state.proveedores_compromisos || []).filter(c =>
      (Number(c.horas_absorbidas_estimadas) || 0) > 0 &&
      (!Array.isArray(c.tareas_vinculadas) || c.tareas_vinculadas.length === 0)
    );
    const depMadero = (state.agenda_prioridades || []).filter(p => p.estado === 'PENDIENTE_INFO_MADERO');
    const porProv = sum.porProveedor || {};

    return `
      <div class="space-y-5">
        <!-- Encabezado Ejecutivo del Informe Semanal -->
        <div class="glass-card p-5 sm:p-7 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-stone-200/80">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1.5">
                <span class="badge-pill badge-dark">Nivel 2 · Resumen Gerencial para Dirección</span>
                <span class="badge-pill badge-blue font-mono">${esc(meta.semana_activa)}</span>
                ${semaforoBadge(meta.semaforo_area)}
              </div>
              <h2 class="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">Informe Semanal de Conducción de Marketing</h2>
              <p class="text-xs text-stone-500 mt-0.5">Destinatario: <strong>Dirección de Madero Automotores</strong> · Elaborado por: <strong>${esc(meta.lider)} (${esc(meta.cargo_lider)})</strong> · Corte: <span class="font-mono">${formatDateDisplay(meta.fecha_corte)}</span></p>
            </div>
            <div class="flex items-center gap-2 no-print">
              <button type="button" onclick="MaderoUI.openDataCenterModal()" class="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                ✎ Editar Lectura del Líder
              </button>
              <button type="button" onclick="window.print()" class="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800">
                🖨 Imprimir / PDF
              </button>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-stone-900 text-stone-100 space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-widest text-amber-300 block">1. Panorama General y Lectura Propia del Líder (Sección 10)</span>
            <p class="text-xs sm:text-sm leading-relaxed text-stone-100">${esc(meta.resumen_ejecutivo_lider)}</p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Frentes Estructurales</span>
              <span class="font-mono text-lg font-extrabold text-stone-900">${sum.frentesVerde} OK · ${sum.frentesAmbar} Seg · ${sum.frentesRojo} Crít</span>
              <span class="text-[11px] text-stone-500 block">Sobre 7 frentes de Sección 4</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Decisiones Dirección</span>
              <span class="font-mono text-lg font-extrabold text-amber-800">${sum.decisionesTotalCount} requeridas</span>
              <span class="text-[11px] text-stone-500 block">Consolidado Agenda (${sum.decisionesDireccionCount}) + Proveedor (${sum.provEscaladosCount})</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Dependencias Internas</span>
              <span class="font-mono text-lg font-extrabold text-violet-800">${depMadero.length} pendientes</span>
              <span class="text-[11px] text-stone-500 block">Accesos / definiciones Madero</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200">
              <span class="text-[10px] font-bold uppercase text-rose-900 block">Trabajo Absorbido</span>
              <span class="font-mono text-lg font-extrabold text-rose-900">${sum.horasAbsorbidasConsolidadas.toFixed(1)} hs</span>
              <span class="text-[11px] text-rose-800 block">${sum.horasAbsorbidas} hs equipo + ${sum.provHorasAbsorbidasManuales} hs prov</span>
            </div>
          </div>
        </div>

        <!-- Bloque 3: Auditoría y Cumplimiento de Proveedores Externos (Secciones 5.9 y 8) -->
        <div class="glass-card p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-stone-200 pb-2">
            <div>
              <h3 class="text-sm font-extrabold text-stone-900">Auditoría Ejecutiva de Proveedores (Sección 5.9 · Módulo 9 Activo)</h3>
              <p class="text-xs text-stone-500">Supervisión objetiva de compromisos, atrasos, posición de Madero, minutas formalizadas y trabajo absorbido.</p>
            </div>
            <button type="button" onclick="MaderoApp.navigateModule('m9-proveedores')" class="text-xs font-bold text-stone-800 hover:text-stone-950">
              Ir a Módulo 9 Proveedores →
            </button>
          </div>

          <div class="overflow-x-auto rounded-xl border border-stone-200/80">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="bg-stone-50 text-[10px] uppercase font-bold text-stone-600 border-b border-stone-200">
                  <th class="py-2 px-3">Proveedor Externo</th>
                  <th class="py-2 px-3 text-center">Compromisos</th>
                  <th class="py-2 px-3 text-center">Cumplimiento</th>
                  <th class="py-2 px-3 text-center">Atrasos</th>
                  <th class="py-2 px-3 text-center">Observados Madero</th>
                  <th class="py-2 px-3 text-center">Reprogramaciones</th>
                  <th class="py-2 px-3 text-center">Minutas Pendientes</th>
                  <th class="py-2 px-3 text-right">Trabajo Absorbido</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200/70">
                ${[
                  { id: 'REM', nombre: 'REM · Agencia Externa de Rendimiento' },
                  { id: 'CHRISTIAN_WEB', nombre: 'L. Christian · Plataforma Web' },
                  { id: 'OTRO_PRESTADOR', nombre: 'Otros Prestadores Especiales' }
                ].map(p => {
                  const d = porProv[p.id] || { total: 0, cumplimientoPct: 0, atrasados: 0, observados: 0, reprogramados: 0, pendMinuta: 0, horasAbs: 0 };
                  return `
                    <tr class="hover:bg-white/60">
                      <td class="py-2.5 px-3 font-extrabold text-stone-900">${esc(p.nombre)}</td>
                      <td class="py-2.5 px-3 text-center font-mono font-bold">${d.total}</td>
                      <td class="py-2.5 px-3 text-center">
                        <span class="badge-pill font-mono ${d.cumplimientoPct >= 75 ? 'badge-emerald' : d.cumplimientoPct >= 40 ? 'badge-amber' : 'badge-red'}">
                          ${d.cumplimientoPct}%
                        </span>
                      </td>
                      <td class="py-2.5 px-3 text-center font-bold ${d.atrasados > 0 ? 'text-rose-700' : 'text-stone-500'}">${d.atrasados}</td>
                      <td class="py-2.5 px-3 text-center font-bold ${d.observados > 0 ? 'text-amber-800' : 'text-stone-500'}">${d.observados}</td>
                      <td class="py-2.5 px-3 text-center font-mono">${d.reprogramados}</td>
                      <td class="py-2.5 px-3 text-center">
                        ${d.pendMinuta > 0 ? `<span class="badge-pill badge-red text-[10px]">⚠ ${d.pendMinuta}</span>` : '<span class="text-emerald-700 font-bold">✓ 0</span>'}
                      </td>
                      <td class="py-2.5 px-3 text-right font-mono font-extrabold ${d.horasAbs > 0 ? 'text-rose-700' : 'text-stone-700'}">${d.horasAbs.toFixed(1)} hs</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Dos Columnas Ejecutivas: Decisiones Dirección + Trabajo Absorbido -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="glass-card p-5 space-y-3">
            <h3 class="text-sm font-extrabold text-stone-900 border-b border-stone-200 pb-2">Decisiones que Requiere Dirección (${sum.decisionesTotalCount} en vivo)</h3>
            <div class="space-y-2.5">
              ${(sum.decisionesConsolidadas || []).length === 0
                ? '<p class="text-xs text-stone-500">Sin decisiones pendientes de Dirección en este corte.</p>'
                : (sum.decisionesConsolidadas || []).map(d => {
                  const isProv = d.tipo === 'PROVEEDOR';
                  const clickCall = isProv ? `MaderoProveedores.openCompromisoModal('${esc(d.id)}')` : `MaderoConduccion.openPrioridadModal('${esc(d.id)}')`;
                  const desc = isProv ? (d.data.recomendacion_direccion || d.data.entregable_esperado) : (d.data.detalle_decision_direccion || d.data.proximo_paso);
                  return `
                    <div class="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1 cursor-pointer hover:bg-amber-100/60 transition" onclick="${clickCall}">
                      <div class="flex items-center justify-between">
                        <span class="font-mono text-[10px] font-bold text-amber-900">${esc(d.id)} · ${isProv ? `PROVEEDOR (${esc(d.autor)})` : `AGENDA (${esc(d.data.frente || 'Conducción')})`}</span>
                        ${estadoBadge(d.data.estado, true)}
                      </div>
                      <div class="font-bold text-stone-900 text-xs">${esc(d.titulo)}</div>
                      <p class="text-[11px] text-stone-700 leading-relaxed">${esc(desc)}</p>
                    </div>
                  `;
                }).join('')}
            </div>
          </div>

          <div class="glass-card p-5 space-y-3">
            <h3 class="text-sm font-extrabold text-stone-900 border-b border-stone-200 pb-2">Trabajo Absorbido por Falla de Terceros (${sum.horasAbsorbidasConsolidadas.toFixed(1)} hs consolidado)</h3>
            <div class="space-y-2.5">
              ${tareasAbs.length === 0 && provManualAbs.length === 0
                ? '<p class="text-xs text-stone-500">Sin trabajo absorbido registrado en la semana.</p>'
                : [
                  ...tareasAbs.map(t => `
                    <div class="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-mono text-[10px] font-bold text-rose-900">${esc(t.id)} · ${esc(t.horas_estimadas)} hs (Tarea Equipo)</span>
                        <span class="badge-pill badge-red">Reclamo de origen</span>
                      </div>
                      <div class="font-bold text-stone-900 text-xs">${esc(t.tarea)}</div>
                      <p class="text-[11px] text-rose-950"><strong>Causa:</strong> ${esc(t.origen_absorbido)}</p>
                    </div>
                  `),
                  ...provManualAbs.map(c => `
                    <div class="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-mono text-[10px] font-bold text-rose-900">${esc(c.id)} · ${c.horas_absorbidas_estimadas} hs (${esc(c.proveedor_id)})</span>
                        <span class="badge-pill badge-red">Auditoría Directa</span>
                      </div>
                      <div class="font-bold text-stone-900 text-xs">${esc(c.titulo_compromiso)}</div>
                      <p class="text-[11px] text-rose-950"><strong>Causa:</strong> ${esc(c.observaciones_madero || c.entregable_esperado)}</p>
                    </div>
                  `)
                ].join('')}
            </div>
          </div>
        </div>

        <div class="glass-card p-4 sm:p-5 bg-stone-100/80 border border-stone-300/70 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div>
            <strong>Nota de Evolución Gerencial (Paso 2 de 6):</strong> Esta vista ejecutiva consolida en vivo Gobernanza (Sección 4), Agenda (Módulo 1), Equipo Interno (Módulo 2) y Auditoría de Proveedores (Módulo 9). Al avanzar a los <strong>Pasos 3, 4, 5 y 6</strong> sumará automáticamente los indicadores del Embudo de Fotografías Lucy DMS, Campañas, Google/Web y Ventas.
          </div>
          <button type="button" onclick="MaderoApp.setNivel('operativo')" class="px-3.5 py-2 rounded-xl bg-stone-900 text-white font-semibold shrink-0">
            Volver a Control Operativo →
          </button>
        </div>
      </div>
    `;
  }

  return {
    renderGobernanzaSection,
    openEditGobernanzaModal,
    saveGobernanzaModal,
    renderAgendaModule,
    openPrioridadModal,
    savePrioridadFromModal,
    handleDeletePrioridad,
    quickChangeEstadoPrioridad,
    setAgendaFilter,
    setAgendaSearch,
    toggleAgendaFlag,
    resetAgendaFilters,
    focusAgendaDesvios,
    focusAgendaDireccion,
    exportAgendaCSV,
    renderEquipoModule,
    openMiembroModal,
    saveMiembroFromModal,
    handleDeleteMiembro,
    openTareaEquipoModal,
    saveTareaFromModal,
    handleDeleteTareaEquipo,
    quickChangeEstadoTarea,
    setEquipoFilter,
    setEquipoSearch,
    toggleEquipoFlag,
    resetEquipoFilters,
    focusEquipoCapacidad,
    focusEquipoAbsorbido,
    exportEquipoCSV,
    renderResumenGerencialPreview
  };
})();

