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

  let weeklyFocusFilter = 'ALL'; // 'ALL' | 'CRITICAS' | 'ATRASADAS' | 'SEG:Mario' | ...
  let weeklyGroupMode = 'SEGMENTO'; // 'SEGMENTO' | 'URGENCIA'

  function setWeeklyFocusFilter(val) {
    weeklyFocusFilter = val || 'ALL';
    window.MaderoApp.renderActiveView();
  }

  function setWeeklyGroupMode(mode) {
    weeklyGroupMode = mode === 'URGENCIA' ? 'URGENCIA' : 'SEGMENTO';
    window.MaderoApp.renderActiveView();
  }

  // ------------------------------------------------------------------------
  // BITÁCORA DE AVANCES Y ARCHIVOS CON FECHA (COMPARTIDA AGENDA + EQUIPO)
  // ------------------------------------------------------------------------
  function getAgendaOrEquipoRecord(kind, id) {
    const state = window.MaderoStore.getState();
    if (kind === 'AGENDA') {
      const p = (state.agenda_prioridades || []).find(item => item.id === id);
      if (!p) return null;
      return {
        kind: 'AGENDA',
        item: p,
        titulo: p.objetivo,
        subtitulo: p.frente || 'Agenda y Prioridades',
        estado: p.estado,
        avances: Array.isArray(p.avances_archivos) ? p.avances_archivos : [],
        evidenciaLabel: p.evidencia_label || '',
        evidenciaUrl: p.evidencia_url || ''
      };
    }

    const t = (state.equipo_tareas || []).find(item => item.id === id);
    if (!t) return null;
    return {
      kind: 'EQUIPO',
      item: t,
      titulo: t.tarea,
      subtitulo: t.categoria || 'Equipo Interno',
      estado: t.estado,
      avances: Array.isArray(t.avances_archivos) ? t.avances_archivos : [],
      evidenciaLabel: t.evidencia || '',
      evidenciaUrl: ''
    };
  }

  function buildAvanceFileBadgeHtml(av) {
    const rawUrl = String((av && av.archivo_url) || '').trim();
    const fileName = String((av && av.archivo_nombre) || '').trim();
    const isClickableUrl = /^(https?:\/\/|data:)/i.test(rawUrl);

    if (isClickableUrl) {
      const isDataUrl = /^data:/i.test(rawUrl);
      const dlAttr = isDataUrl ? ` download="${esc(fileName || 'archivo_adjunto')}"` : '';
      return `<a href="${esc(rawUrl)}" target="_blank" rel="noopener noreferrer"${dlAttr} class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#de4800]/15 hover:bg-[#de4800] text-[#ff9c6e] hover:text-white border border-[#de4800]/35 text-[10px] font-semibold transition max-w-full truncate" title="${esc(fileName || rawUrl)}">📄 <span class="truncate">${esc(fileName || 'Abrir archivo')}</span> ↗</a>`;
    }

    const fallbackText = fileName || rawUrl;
    if (!fallbackText) return '';
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-stone-700 border border-stone-200/60 text-[10px] font-medium max-w-full truncate" title="${esc(fallbackText)}">📎 <span class="truncate">${esc(fallbackText)}</span></span>`;
  }

  function renderAvancesTimelineHtml(avances, kind, itemId, options = {}) {
    const list = Array.isArray(avances) ? avances : [];
    if (list.length === 0) return '';

    const { compact = true, maxItems = list.length, showDelete = false } = options;
    const sliced = list.slice(0, maxItems);
    const hiddenCount = Math.max(0, list.length - sliced.length);

    const entriesHtml = sliced.map(av => {
      const fileHtml = buildAvanceFileBadgeHtml(av);
      return `
        <div class="${compact ? 'p-2 rounded-lg bg-white/10 border border-stone-200/45' : 'p-2.5 rounded-xl bg-white/10 border border-stone-200/55'} space-y-1">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="badge-pill badge-orange font-mono text-[10px]">📅 ${formatDateDisplay(av.fecha)}</span>
              ${av.autor ? `<span class="text-[10px] font-bold text-stone-800">${esc(av.autor)}</span>` : ''}
            </div>
            ${showDelete ? `<button type="button" onclick="MaderoConduccion.deleteAvance('${esc(kind)}', '${esc(itemId)}', '${esc(av.id)}')" title="Eliminar avance" class="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[10px] font-bold transition">×</button>` : ''}
          </div>
          ${av.nota ? `<p class="text-[11px] text-stone-700 leading-snug">${esc(av.nota)}</p>` : ''}
          ${fileHtml ? `<div class="pt-0.5 flex flex-wrap gap-1.5">${fileHtml}</div>` : ''}
        </div>
      `;
    }).join('');

    const moreHtml = hiddenCount > 0
      ? `<button type="button" onclick="MaderoConduccion.openAvanceModal('${esc(kind)}', '${esc(itemId)}')" class="text-[10px] font-semibold text-[#ff9c6e] hover:underline">+ Ver ${hiddenCount} registro(s) anterior(es) →</button>`
      : '';

    return `
      <div class="mt-2 pt-2 border-t border-stone-200/45 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">Avances y Archivos con Fecha (${list.length})</span>
        </div>
        <div class="space-y-1.5">
          ${entriesHtml}
          ${moreHtml}
        </div>
      </div>
    `;
  }

  function renderModalAvancesBlock(kind, item) {
    const avances = Array.isArray(item.avances_archivos) ? item.avances_archivos : [];
    const timelineHtml = avances.length > 0
      ? renderAvancesTimelineHtml(avances, kind, item.id, { compact: false, showDelete: false })
      : '<p class="text-[11px] text-stone-500">Sin avances ni archivos cargados con fecha todavía.</p>';

    return `
      <div class="p-3.5 rounded-2xl bg-stone-100/75 border border-stone-200/75 space-y-2">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <span class="text-xs font-extrabold text-stone-900">📎 Bitácora de Avances y Archivos con Fecha</span>
            <span class="text-[10px] text-stone-500 block">Guías, devoluciones, links de Drive/Docs o archivos adjuntos ordenados por fecha.</span>
          </div>
          <button type="button" onclick="MaderoConduccion.openAvanceModal('${esc(kind)}', '${esc(item.id)}')" class="px-2.5 py-1.5 rounded-xl bg-[#de4800] hover:brightness-110 text-white text-[11px] font-bold transition shrink-0">
            + Agregar Avance / Archivo
          </button>
        </div>
        ${timelineHtml}
      </div>
    `;
  }

  function handleAvanceFileSelect(inputEl) {
    const file = inputEl && inputEl.files && inputEl.files[0];
    if (!file) return;

    const nameEl = document.getElementById('av-archivo-nombre');
    const urlEl = document.getElementById('av-archivo-url');
    if (nameEl) nameEl.value = file.name;

    window.MaderoUI.uploadAttachmentFile(file, res => {
      if (urlEl) {
        if (res.ok && res.url) {
          urlEl.value = res.url;
        } else if (!res.ok && /^data:/i.test(urlEl.value)) {
          urlEl.value = '';
        }
      }
    });
  }

  function openAvanceModal(kind, id) {
    const rec = getAgendaOrEquipoRecord(kind, id);
    if (!rec) {
      window.MaderoUI.showToast('No se encontró la tarea o prioridad seleccionada', 'red');
      return;
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    const currentEstadoMeta = window.MaderoData.ESTADOS_SEGUIMIENTO[rec.estado] || { label: rec.estado };
    const estadoOpts = [
      `<option value="">Mantener estado actual (${esc(currentEstadoMeta.label)})</option>`,
      ...Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
        `<option value="${st.id}">${esc(st.label)}</option>`
      )
    ].join('');

    const historyHtml = rec.avances.length > 0
      ? renderAvancesTimelineHtml(rec.avances, kind, id, { compact: false, showDelete: true })
      : '<p class="text-xs text-stone-500 p-3 rounded-xl bg-stone-100/70 border border-stone-200/60">Todavía no hay avances ni archivos registrados con fecha en este ítem.</p>';

    window.MaderoUI.openModal({
      title: `Avances y Archivos con Fecha · ${rec.item.id}`,
      subtitle: `${rec.titulo}`,
      maxWidth: 'max-w-2xl',
      bodyHtml: `
        <div class="space-y-4">
          <div class="p-3.5 rounded-2xl bg-stone-100/75 border border-stone-200/75 space-y-3">
            <div class="text-xs font-extrabold text-stone-900">+ Registrar Nuevo Avance o Archivo con Fecha</div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha *</label>
                <input type="date" id="av-fecha" value="${esc(todayIso)}" class="input-glass w-full px-3 py-2 font-mono">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Quién envía / Registra</label>
                <input type="text" id="av-autor" list="av-autor-list" value="Ángelo Lucero" placeholder="Ej. Equipo de REM, REM GrowthSulting, Ángelo..." class="input-glass w-full px-3 py-2">
                <datalist id="av-autor-list">
                  <option value="Ángelo Lucero">
                  <option value="Equipo de REM">
                  <option value="REM GrowthSulting">
                  <option value="REM Pauta">
                  <option value="REM Diseño">
                  <option value="Carlos">
                  <option value="Mario">
                  <option value="Bet">
                  <option value="Agustín">
                </datalist>
                <div class="flex flex-wrap items-center gap-1 mt-1.5">
                  <button type="button" onclick="const el=document.getElementById('av-autor'); if(el){el.value='Ángelo Lucero'; el.focus();}" class="px-1.5 py-0.5 rounded bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-[10px] font-semibold transition">Ángelo</button>
                  <button type="button" onclick="const el=document.getElementById('av-autor'); if(el){el.value='Equipo de REM'; el.focus();}" class="px-1.5 py-0.5 rounded bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-700 text-[10px] font-semibold transition">Equipo de REM</button>
                  <button type="button" onclick="const el=document.getElementById('av-autor'); if(el){el.value='REM GrowthSulting'; el.focus();}" class="px-1.5 py-0.5 rounded bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-700 text-[10px] font-semibold transition">REM GrowthSulting</button>
                  <button type="button" onclick="const el=document.getElementById('av-autor'); if(el){el.value='REM Pauta'; el.focus();}" class="px-1.5 py-0.5 rounded bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-700 text-[10px] font-semibold transition">REM Pauta</button>
                  <button type="button" onclick="const el=document.getElementById('av-autor'); if(el){el.value='REM Diseño'; el.focus();}" class="px-1.5 py-0.5 rounded bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-700 text-[10px] font-semibold transition">REM Diseño</button>
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Estado tras este avance</label>
                <select id="av-nuevo-estado" class="input-glass w-full px-3 py-2">${estadoOpts}</select>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Qué se recibió o avanzó en esta fecha</label>
              <textarea id="av-nota" rows="2" placeholder="Ej. REM envió guía para revisar fichas de Google en Neuquén antes de depurar fotos viejas..." class="input-glass w-full px-3 py-2"></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Nombre del Archivo / Documento</label>
                <input type="text" id="av-archivo-nombre" value="" placeholder="Ej. Guía para revisar fichas Google Neuquén" class="input-glass w-full px-3 py-2">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-stone-700 mb-1">Enlace (Google Docs / Drive / Web)</label>
                <input type="text" id="av-archivo-url" value="" placeholder="https://docs.google.com/..." class="input-glass w-full px-3 py-2">
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <label class="inline-flex items-center gap-2 text-[11px] text-stone-700 cursor-pointer">
                <span class="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-800 font-semibold hover:bg-stone-50 transition">📁 Adjuntar archivo desde PC</span>
                <input type="file" id="av-file-input" onchange="MaderoConduccion.handleAvanceFileSelect(this)" class="hidden">
                <span class="text-[10px] text-stone-500">Hasta 3 MB directo a la nube (o pegá el link arriba)</span>
              </label>

              ${kind === 'AGENDA' ? `
                <label class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-700 cursor-pointer">
                  <input type="checkbox" id="av-act-prox" class="rounded text-stone-900">
                  <span>Actualizar "Próx. paso" con esta nota</span>
                </label>
              ` : ''}
            </div>
          </div>

          <div>
            ${historyHtml}
          </div>
        </div>
      `,
      footerHtml: `
        <button type="button" onclick="${kind === 'AGENDA' ? `MaderoConduccion.openPrioridadModal('${esc(id)}')` : `MaderoConduccion.openTareaEquipoModal('${esc(id)}')`}" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold mr-auto">Ver Ficha Completa</button>
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cerrar</button>
        <button type="button" onclick="MaderoConduccion.saveAvanceFromModal('${esc(kind)}', '${esc(id)}')" class="px-4 py-2 rounded-xl bg-[#de4800] hover:brightness-110 text-white text-xs font-bold">Guardar Avance / Archivo</button>
      `
    });
  }

  function saveAvanceFromModal(kind, id) {
    const fecha = (document.getElementById('av-fecha') && document.getElementById('av-fecha').value) || new Date().toISOString().slice(0, 10);
    const autor = (document.getElementById('av-autor') && document.getElementById('av-autor').value.trim()) || 'Ángelo Lucero';
    const nota = (document.getElementById('av-nota') && document.getElementById('av-nota').value.trim()) || '';
    const archivo_nombre = (document.getElementById('av-archivo-nombre') && document.getElementById('av-archivo-nombre').value.trim()) || '';
    const archivo_url = (document.getElementById('av-archivo-url') && document.getElementById('av-archivo-url').value.trim()) || '';
    const nuevo_estado = (document.getElementById('av-nuevo-estado') && document.getElementById('av-nuevo-estado').value) || '';
    const actProxEl = document.getElementById('av-act-prox');
    const actualizar_proximo_paso = Boolean(actProxEl && actProxEl.checked);

    if (!nota && !archivo_nombre && !archivo_url) {
      window.MaderoUI.showToast('Ingresá una nota de avance o adjuntá un archivo / link', 'red');
      return;
    }

    const res = window.MaderoStore.addAvanceItem(kind, id, {
      fecha,
      autor,
      nota,
      archivo_nombre,
      archivo_url,
      nuevo_estado,
      actualizar_proximo_paso
    });

    if (!res) {
      window.MaderoUI.showToast('No se pudo guardar el avance', 'red');
      return;
    }

    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Avance / archivo registrado con fecha');
  }

  function deleteAvance(kind, id, avanceId) {
    if (!confirm('¿Eliminar este registro de avance / archivo?')) return;
    window.MaderoStore.deleteAvanceItem(kind, id, avanceId);
    openAvanceModal(kind, id);
    window.MaderoUI.showToast('Registro eliminado', 'amber');
  }

  function buildWeeklyStartPanel(state) {
    const prioWeight = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };
    const segmentoOrden = ['Mario', 'Carlos', 'Bet', 'Agustín', 'REM', 'Diarias', 'Objetivo Mkt', 'Equipo Interno'];
    const segmentoTitulos = {
      Mario: 'Tareas Solicitadas por Mario',
      Carlos: 'Tareas Solicitadas por Carlos',
      Bet: 'Tareas Solicitadas por Bet',
      Agustín: 'Tareas Solicitadas por Agustín',
      REM: 'Tareas REM (Campañas NOV & Revisión)',
      Diarias: 'Tareas Diarias',
      'Objetivo Mkt': 'Tareas Objetivo de Marketing',
      'Equipo Interno': 'Otras Tareas del Equipo Interno'
    };

    const miembrosMap = {};
    (state.equipo_miembros || []).forEach(m => {
      miembrosMap[m.id] = m.nombre || m.id;
    });

    const agendaPendientes = (state.agenda_prioridades || [])
      .filter(p => p.estado !== 'CERRADO_EVIDENCIA')
      .map(p => ({
        kind: 'AGENDA',
        id: p.id,
        segmento: p.segmento || (p.frente && p.frente.startsWith('Solicitado por ') ? p.frente.replace('Solicitado por ', '') : 'Agenda'),
        titulo: p.objetivo,
        subtitulo: p.proximo_paso || p.dependencia || p.frente || '',
        responsable: p.responsable || 'Conducción',
        origenLabel: p.segmento || 'Agenda',
        prioridad: p.prioridad || 'MEDIA',
        estado: p.estado,
        horas: Number(p.horas_estimadas) || 0,
        fecha: p.fecha_compromiso || '9999-12-31',
        avances: Array.isArray(p.avances_archivos) ? p.avances_archivos : [],
        evidencia_label: p.evidencia_label || '',
        evidencia_url: p.evidencia_url || ''
      }));

    const equipoPendientes = (state.equipo_tareas || [])
      .filter(t => t.estado !== 'CERRADO_EVIDENCIA')
      .map(t => {
        const inferredPrio = t.prioridad || (t.estado === 'ATRASADO' || t.bloqueo ? 'ALTA' : 'MEDIA');
        return {
          kind: 'EQUIPO',
          id: t.id,
          segmento: t.segmento || 'Equipo Interno',
          titulo: t.tarea,
          subtitulo: t.bloqueo ? `Bloqueo: ${t.bloqueo}` : (t.categoria || ''),
          responsable: miembrosMap[t.miembro_id] || t.miembro_id || 'Equipo Interno',
          origenLabel: 'Equipo',
          prioridad: inferredPrio,
          estado: t.estado,
          horas: Number(t.horas_estimadas) || 0,
          fecha: t.fecha_entrega || '9999-12-31',
          avances: Array.isArray(t.avances_archivos) ? t.avances_archivos : [],
          evidencia_label: t.evidencia || '',
          evidencia_url: ''
        };
      });

    const allPending = [...agendaPendientes, ...equipoPendientes].sort((a, b) => {
      const aLate = a.estado === 'ATRASADO' ? 1 : 0;
      const bLate = b.estado === 'ATRASADO' ? 1 : 0;
      if (aLate !== bLate) return bLate - aLate;

      const pa = prioWeight[a.prioridad] || 0;
      const pb = prioWeight[b.prioridad] || 0;
      if (pa !== pb) return pb - pa;

      return String(a.fecha).localeCompare(String(b.fecha));
    });

    const atrasadasCount = allPending.filter(x => x.estado === 'ATRASADO').length;
    const criticasAltasCount = allPending.filter(x => x.prioridad === 'CRITICA' || x.prioridad === 'ALTA').length;

    const segCounts = {};
    allPending.forEach(x => {
      segCounts[x.segmento] = (segCounts[x.segmento] || 0) + 1;
    });

    const filtered = allPending.filter(x => {
      if (weeklyFocusFilter === 'ATRASADAS') return x.estado === 'ATRASADO';
      if (weeklyFocusFilter === 'CRITICAS') return x.prioridad === 'CRITICA' || x.prioridad === 'ALTA';
      if (weeklyFocusFilter.startsWith('SEG:')) {
        return x.segmento === weeklyFocusFilter.slice(4);
      }
      return true;
    });

    const filterDefs = [
      { id: 'ALL', label: `Todas (${allPending.length})` },
      { id: 'CRITICAS', label: `Críticas / Altas (${criticasAltasCount})` },
      { id: 'ATRASADAS', label: `Atrasadas (${atrasadasCount})` }
    ];

    Object.keys(segCounts)
      .sort((a, b) => {
        const ia = segmentoOrden.indexOf(a);
        const ib = segmentoOrden.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
      .forEach(seg => {
        filterDefs.push({ id: `SEG:${seg}`, label: `${seg} (${segCounts[seg]})` });
      });

    const filterBtns = filterDefs.map(btn => {
      const isAct = weeklyFocusFilter === btn.id;
      return `<button type="button" onclick="MaderoConduccion.setWeeklyFocusFilter('${esc(btn.id)}')" class="px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${isAct ? 'bg-[#de4800] text-white shadow-xs' : 'bg-white/10 text-stone-600 hover:text-stone-900 border border-stone-200/50'}">${esc(btn.label)}</button>`;
    }).join('');

    const renderItemRow = item => {
      const isAgenda = item.kind === 'AGENDA';
      const openCall = isAgenda
        ? `MaderoConduccion.openPrioridadModal('${esc(item.id)}')`
        : `MaderoConduccion.openTareaEquipoModal('${esc(item.id)}')`;
      const closeCall = isAgenda
        ? `MaderoConduccion.quickChangeEstadoPrioridad('${esc(item.id)}', 'CERRADO_EVIDENCIA')`
        : `MaderoConduccion.quickChangeEstadoTarea('${esc(item.id)}', 'CERRADO_EVIDENCIA')`;

      const avancesHtml = renderAvancesTimelineHtml(item.avances, item.kind, item.id, { compact: true, maxItems: 3 });

      return `
        <div class="p-3 sm:px-4 rounded-xl bg-white/60 border border-stone-200/70 hover:border-[#de4800]/45 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div class="space-y-1 min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              ${prioridadBadge(item.prioridad)}
              ${estadoBadge(item.estado, true)}
              <span class="badge-pill badge-stone font-mono text-[10px]">${esc(item.origenLabel)} · ${esc(item.id)}</span>
              ${item.horas ? `<span class="badge-pill badge-amber font-mono text-[10px]">⏱ ${item.horas}h</span>` : ''}
              <span class="text-[11px] font-semibold text-stone-600">👤 ${esc(item.responsable)}</span>
              <span class="text-[11px] font-mono ${item.estado === 'ATRASADO' ? 'text-rose-600 font-bold' : 'text-stone-500'}">📅 ${formatDateDisplay(item.fecha)}</span>
            </div>
            <button type="button" onclick="${openCall}" class="text-left block w-full group">
              <div class="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#de4800] transition leading-snug">${esc(item.titulo)}</div>
            </button>
            ${item.subtitulo ? `<p class="text-[11px] text-stone-500 leading-snug">${esc(item.subtitulo)}</p>` : ''}
            ${avancesHtml}
          </div>
          <div class="flex items-center gap-1.5 shrink-0 flex-wrap justify-end self-end sm:self-center">
            <button type="button" onclick="MaderoConduccion.openAvanceModal('${item.kind}', '${esc(item.id)}')" title="Agregar archivo o avance con fecha" class="px-2.5 py-1.5 rounded-lg bg-[#de4800]/15 hover:bg-[#de4800] text-[#ff9c6e] hover:text-white border border-[#de4800]/35 text-[11px] font-bold transition whitespace-nowrap">
              📎 ${item.avances.length > 0 ? `+ Avance / Archivo (${item.avances.length})` : '+ Avance / Archivo'}
            </button>
            <button type="button" onclick="${closeCall}" title="Marcar como cerrada con evidencia" class="px-2.5 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-500/30 text-[11px] font-bold transition">
              ✓ Cerrar
            </button>
            <button type="button" onclick="${openCall}" class="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold transition">
              Abrir
            </button>
          </div>
        </div>
      `;
    };

    let listBodyHtml = '';
    if (filtered.length === 0) {
      listBodyHtml = `
        <div class="py-8 text-center text-xs text-stone-500">
          No hay tareas ni prioridades pendientes en este filtro. ¡Semana al día!
        </div>
      `;
    } else if (weeklyGroupMode === 'SEGMENTO') {
      const grouped = {};
      filtered.forEach(item => {
        const key = item.segmento || 'Otros';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      });

      const orderedKeys = Object.keys(grouped).sort((a, b) => {
        const ia = segmentoOrden.indexOf(a);
        const ib = segmentoOrden.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });

      listBodyHtml = orderedKeys.map(seg => `
        <div class="space-y-2 pt-1">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#ff7a3d] flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-[#de4800]"></span>
              ${esc(segmentoTitulos[seg] || seg)}
            </h3>
            <span class="text-[10px] font-mono text-stone-500">${grouped[seg].length} pendiente(s)</span>
          </div>
          <div class="space-y-2">
            ${grouped[seg].map(renderItemRow).join('')}
          </div>
        </div>
      `).join('');
    } else {
      listBodyHtml = `<div class="space-y-2">${filtered.map(renderItemRow).join('')}</div>`;
    }

    return `
      <div class="glass-card p-4 sm:p-5 space-y-3.5">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-stone-200/70">
          <div>
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="w-2 h-2 rounded-full bg-[#de4800] animate-pulse"></span>
              <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-[#ff7a3d]">Arranque de Semana</span>
              <span class="badge-pill badge-stone font-mono text-[10px]">${allPending.length} pendientes</span>
              ${atrasadasCount > 0 ? `<span class="badge-pill badge-red font-bold text-[10px]">${atrasadasCount} atrasadas</span>` : ''}
            </div>
            <h2 class="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">Tareas y Prioridades Pendientes</h2>
            <p class="text-xs text-stone-500 mt-0.5">Segmentadas por solicitante y frente, ordenadas por urgencia dentro de cada grupo.</p>
          </div>
          <div class="flex items-center gap-2 flex-wrap shrink-0">
            <div class="inline-flex p-0.5 rounded-xl bg-stone-200/70 border border-stone-300/60">
              <button type="button" onclick="MaderoConduccion.setWeeklyGroupMode('SEGMENTO')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${weeklyGroupMode === 'SEGMENTO' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'}">
                Segmentado
              </button>
              <button type="button" onclick="MaderoConduccion.setWeeklyGroupMode('URGENCIA')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${weeklyGroupMode === 'URGENCIA' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'}">
                Por Urgencia
              </button>
            </div>
            <button type="button" onclick="MaderoConduccion.openPrioridadModal(null)" class="px-3 py-1.5 rounded-xl bg-[#de4800] hover:brightness-110 text-white text-xs font-bold shadow-xs transition">
              + Nueva Prioridad
            </button>
            <button type="button" onclick="MaderoConduccion.openTareaEquipoModal(null)" class="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50 transition">
              + Nueva Tarea
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          ${filterBtns}
        </div>

        <div class="space-y-3">
          ${listBodyHtml}
        </div>
      </div>
    `;
  }

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
        ? `<a href="${esc(item.evidencia_url)}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-blue-700 hover:text-blue-900 underline font-semibold leading-snug block max-w-[210px]" title="${esc(item.evidencia_label || item.evidencia_url)}">📎 ${esc(item.evidencia_label || 'Abrir evidencia')} ↗</a>`
        : `<div class="text-[11px] text-stone-700 font-medium leading-snug max-w-[210px]" title="${esc((item.evidencia_label || 'Sin adjunto') + (item.evidencia_url ? ' · ' + item.evidencia_url : ''))}">📎 ${esc(item.evidencia_label || 'Sin adjunto')}</div>`;

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
            ${Array.isArray(item.avances_archivos) && item.avances_archivos.length > 0 ? `
              <button type="button" onclick="MaderoConduccion.openAvanceModal('AGENDA', '${esc(item.id)}')" class="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#ff9c6e] hover:underline">
                📎 ${item.avances_archivos.length} avance(s) / archivo(s) con fecha →
              </button>
            ` : ''}
          </td>

          <td class="py-3 px-3">
            <div class="mb-1">${actorBadge(item.actor_id, true)}</div>
            <span class="text-xs font-semibold text-stone-800 block">${esc(item.responsable)}</span>
            <span class="text-[10px] text-stone-500 block leading-snug max-w-[200px]" title="${esc(item.plaza)}">${esc(item.plaza)}</span>
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
              <button type="button" onclick="MaderoConduccion.openAvanceModal('AGENDA', '${esc(item.id)}')" title="Avances y archivos con fecha" class="px-2 py-1 rounded-lg bg-[#de4800]/15 hover:bg-[#de4800] text-[#ff9c6e] hover:text-white border border-[#de4800]/35 text-[11px] font-bold transition">
                📎${Array.isArray(item.avances_archivos) && item.avances_archivos.length ? ` ${item.avances_archivos.length}` : ''}
              </button>
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

    const weeklyStartHtml = buildWeeklyStartPanel(state);

    return `
      <div class="space-y-5">
        ${weeklyStartHtml}

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
              <div class="flex flex-wrap items-center gap-1 bg-stone-200/70 p-1 rounded-xl max-w-full">
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
      segmento: 'Mario',
      frente: 'Solicitado por Mario',
      objetivo: '',
      descripcion: '',
      actor_id: 'MKT_INTERNO',
      responsable: 'Ángelo Lucero',
      plaza: window.MaderoData.PLAZAS[0],
      prioridad: 'ALTA',
      estado: 'PENDIENTE_INICIO',
      horas_estimadas: 2,
      fecha_compromiso: window.MaderoStore.getState().meta.fecha_corte || '2026-11-16',
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Segmento / Solicitante</label>
              <select id="pri-segmento" class="input-glass w-full px-3 py-2" onchange="const f=document.getElementById('pri-frente'); if(!f.value || f.value.startsWith('Solicitado') || f.value.startsWith('Tareas')) f.value=(['Mario','Carlos','Bet','Agustín'].includes(this.value)?'Solicitado por '+this.value:this.value);">
                <option value="Mario" ${(item.segmento || '') === 'Mario' ? 'selected' : ''}>Solicitado por Mario</option>
                <option value="Carlos" ${(item.segmento || '') === 'Carlos' ? 'selected' : ''}>Solicitado por Carlos</option>
                <option value="Bet" ${(item.segmento || '') === 'Bet' ? 'selected' : ''}>Solicitado por Bet</option>
                <option value="Agustín" ${(item.segmento || '') === 'Agustín' ? 'selected' : ''}>Solicitado por Agustín</option>
                <option value="REM" ${(item.segmento || '') === 'REM' ? 'selected' : ''}>Tareas REM</option>
                <option value="Diarias" ${(item.segmento || '') === 'Diarias' ? 'selected' : ''}>Tareas Diarias</option>
                <option value="Objetivo Mkt" ${(item.segmento || '') === 'Objetivo Mkt' ? 'selected' : ''}>Objetivo de Marketing</option>
                <option value="General" ${!['Mario','Carlos','Bet','Agustín','REM','Diarias','Objetivo Mkt'].includes(item.segmento || '') ? 'selected' : ''}>General / Otro</option>
              </select>
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
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Horas Estimadas (42.5h)</label>
              <input type="number" step="0.5" min="0" max="45" id="pri-horas" value="${esc(item.horas_estimadas ?? 2)}" class="input-glass w-full px-3 py-2 font-mono font-bold">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha Acordada / Meta</label>
              <input type="date" id="pri-fecha" value="${esc(item.fecha_compromiso)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>
          <input type="hidden" id="pri-frente" value="${esc(item.frente)}">

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
              <input type="text" id="pri-responsable" list="pri-responsable-list" value="${esc(item.responsable)}" placeholder="Ej. Equipo de REM, Ángelo Lucero..." class="input-glass w-full px-3 py-2">
              <datalist id="pri-responsable-list">
                <option value="Equipo de REM">
                <option value="REM GrowthSulting">
                <option value="REM (Control: Ángelo)">
                <option value="REM Tráfico & Diseño (Control: Ángelo)">
                <option value="REM Pauta">
                <option value="REM Diseño">
                <option value="Ángelo Lucero + REM">
                <option value="Ángelo Lucero">
                <option value="Agustina + REM (Curación: Ángelo)">
              </datalist>
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
          ${existing ? renderModalAvancesBlock('AGENDA', item) : ''}
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

    const segVal = document.getElementById('pri-segmento') ? document.getElementById('pri-segmento').value : 'General';
    const frenteVal = document.getElementById('pri-frente').value.trim() || (['Mario','Carlos','Bet','Agustín'].includes(segVal) ? `Solicitado por ${segVal}` : segVal);
    const horasVal = Number(document.getElementById('pri-horas') ? document.getElementById('pri-horas').value : 0) || 0;

    window.MaderoStore.upsertPrioridad({
      id: existingId || undefined,
      segmento: segVal,
      frente: frenteVal,
      prioridad: document.getElementById('pri-prioridad').value,
      horas_estimadas: horasVal,
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

    // Tarjetas limpias de Equipo Real y Red de Apoyo (sin paredes de texto)
    const renderMemberCard = m => {
      const mTasks = allTasks.filter(t => t.miembro_id === m.id);
      const pendingCount = mTasks.filter(t => t.estado !== 'CERRADO_EVIDENCIA').length;
      const absHs = mTasks.filter(t => t.es_trabajo_absorbido).reduce((acc, t) => acc + (Number(t.horas_estimadas) || 0), 0);

      let contBadge = '<span class="badge-pill badge-emerald">Backup OK</span>';
      if (m.estado_continuidad === 'EN_PROCESO') contBadge = '<span class="badge-pill badge-amber">Guía en Proceso</span>';
      if (m.estado_continuidad === 'RIESGO_SIN_BACKUP') contBadge = '<span class="badge-pill badge-red font-bold">Sin Backup</span>';

      const isSelected = filtersEquipo.miembro === m.id;
      const isCore = m.grupo !== 'APOYO_SUCURSAL';

      return `
        <div class="glass-card p-4 flex flex-col justify-between gap-3 ${isSelected ? 'ring-2 ring-[#de4800]' : ''}">
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span class="badge-pill ${isCore ? 'badge-blue' : 'badge-stone'} text-[10px]">${isCore ? 'Marketing Interno' : 'Apoyo Sucursal'}</span>
                  ${contBadge}
                </div>
                <h3 class="text-sm font-extrabold text-stone-900 leading-snug">${esc(m.nombre)}</h3>
                <p class="text-[11px] text-stone-600 font-medium leading-snug mt-0.5">${esc(m.rol)}</p>
              </div>
            </div>

            <div class="text-[11px] text-stone-600 flex items-center gap-1.5">
              <span>📍</span><span>${esc(m.plaza_base)}</span>
            </div>

            <div class="text-[11px] text-stone-700 bg-stone-100/75 p-2.5 rounded-xl border border-stone-200/60 space-y-1">
              <p class="leading-snug">${esc(m.detalle_continuidad)}</p>
              <div class="text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
                <strong class="text-stone-700">Backup:</strong> ${esc(m.reemplazo_designado)}
              </div>
            </div>

            ${(() => {
              const sueldo = Number(m.sueldo_actual) || 0;
              const moneda = m.sueldo_moneda === 'USD' ? 'USD' : '$';
              const fmt = n => `${moneda} ${Number(n || 0).toLocaleString('es-AR')}`;
              const aumentos = Array.isArray(m.historial_aumentos) ? m.historial_aumentos : [];
              const viaticos = Array.isArray(m.viaticos) ? m.viaticos : [];
              const totalViaticos = viaticos.reduce((acc, v) => acc + (Number(v.monto) || 0), 0);
              const pendViaticos = viaticos.filter(v => v.estado === 'PENDIENTE').length;
              const ultAum = aumentos[0];
              if (!sueldo && viaticos.length === 0 && aumentos.length === 0) return '';
              return `
                <div class="text-[11px] bg-white/10 border border-stone-200/50 p-2 rounded-xl space-y-1">
                  ${sueldo > 0 ? `
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-stone-600">💵 ${esc(m.modalidad_pago || 'Mensual')}</span>
                      <span class="font-mono font-bold text-stone-900">${fmt(sueldo)}</span>
                    </div>
                  ` : ''}
                  ${ultAum ? `
                    <div class="text-[10px] text-emerald-700 font-semibold">
                      📈 Últ. aumento ${formatDateDisplay(ultAum.fecha)}${ultAum.porcentaje !== null && ultAum.porcentaje !== undefined ? ` (+${ultAum.porcentaje}%)` : ''}
                    </div>
                  ` : ''}
                  ${viaticos.length > 0 ? `
                    <div class="flex items-center justify-between gap-2 text-[10px] text-stone-600 pt-0.5 border-t border-stone-200/40">
                      <span>🚗 Viáticos (${viaticos.length}${pendViaticos ? ` · ${pendViaticos} pend.` : ''})</span>
                      <span class="font-mono font-semibold text-stone-800">${fmt(totalViaticos)}</span>
                    </div>
                  ` : ''}
                </div>
              `;
            })()}

            ${absHs > 0 ? `<div class="text-[10px] text-rose-700 font-bold">⚠ Absorbió ${absHs}h por desvíos de terceros</div>` : ''}
          </div>

          <div class="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2.5">
              <button type="button" onclick="MaderoConduccion.openMiembroModal('${esc(m.id)}')" class="text-xs font-semibold text-stone-600 hover:text-stone-900">
                ✎ Editar
              </button>
              <button type="button" onclick="MaderoConduccion.openMiembroCompensacionModal('${esc(m.id)}')" class="text-xs font-semibold text-[#ff9c6e] hover:underline">
                💵 Sueldos y Viáticos
              </button>
            </div>
            <button type="button" onclick="MaderoConduccion.setEquipoFilter('miembro', '${isSelected ? 'ALL' : esc(m.id)}')" class="px-2.5 py-1 rounded-lg ${isSelected ? 'bg-[#de4800] text-white' : 'bg-stone-200/75 text-stone-800 hover:bg-stone-300/70'} text-[11px] font-bold transition">
              ${isSelected ? '✓ Viendo tareas' : `${pendingCount} activa(s) · ${mTasks.length} total`}
            </button>
          </div>
        </div>
      `;
    };

    const coreMembers = members.filter(m => m.grupo !== 'APOYO_SUCURSAL');
    const apoyoMembers = members.filter(m => m.grupo === 'APOYO_SUCURSAL');

    const memberCardsHtml = `
      <div class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#ff7a3d]">Núcleo Marketing Interno (${coreMembers.length})</h3>
            <span class="text-[11px] text-stone-500">Conducción, contenido propio IG/TikTok y crudos NQN</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            ${coreMembers.map(renderMemberCard).join('')}
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-stone-600">Red de Apoyo en Sucursales &amp; Alistamiento (${apoyoMembers.length})</h3>
            <span class="text-[11px] text-stone-500">Fotos NQN, El Bolsón 0km y preparación en Comodoro</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            ${apoyoMembers.map(renderMemberCard).join('')}
          </div>
        </div>

        <div class="p-3 sm:px-4 rounded-2xl bg-white/40 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="badge-pill badge-blue font-bold">Circuito con REM (Externo)</span>
            <span class="text-stone-700">Agustina / Antonella graban crudos → Ángelo filtra y reenvía → REM edita videos de calendario y gestiona campañas pagas.</span>
          </div>
          <button type="button" onclick="MaderoApp.navigateModule('m9-proveedores')" class="text-[#ff7a3d] font-bold hover:underline shrink-0">
            Auditar REM →
          </button>
        </div>
      </div>
    `;

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
            ${Array.isArray(t.avances_archivos) && t.avances_archivos.length > 0 ? `
              <button type="button" onclick="MaderoConduccion.openAvanceModal('EQUIPO', '${esc(t.id)}')" class="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#ff9c6e] hover:underline">
                📎 ${t.avances_archivos.length} avance(s) / archivo(s) con fecha →
              </button>
            ` : ''}
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
              <button type="button" onclick="MaderoConduccion.openAvanceModal('EQUIPO', '${esc(t.id)}')" title="Avances y archivos con fecha" class="px-2 py-1 rounded-lg bg-[#de4800]/15 hover:bg-[#de4800] text-[#ff9c6e] hover:text-white border border-[#de4800]/35 text-[11px] font-bold transition">
                📎${Array.isArray(t.avances_archivos) && t.avances_archivos.length ? ` ${t.avances_archivos.length}` : ''}
              </button>
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
              <p class="text-xs text-stone-500 mt-0.5">Supervisión de carga semanal (base jornada Lun a Vie · 9:30 a 19:00 con 1h de almuerzo = 42.5h netas semanales), continuidad documental ante ausencias y trabajo absorbido.</p>
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
              <span class="text-[11px] text-emerald-700 font-semibold block mt-0.5">${summary.ocupacionPct}% de capacidad semanal (Lun–Vie 9:30–19:00 · 1h almuerzo)</span>
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

        <!-- Grid de Equipo Interno Real & Red de Apoyo -->
        ${memberCardsHtml}

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
      observaciones: '',
      sueldo_actual: 0,
      sueldo_moneda: 'ARS',
      modalidad_pago: 'Mensual',
      fecha_ultimo_pago: '',
      notas_pago: '',
      historial_aumentos: [],
      viaticos: []
    };

    const aumCount = Array.isArray(item.historial_aumentos) ? item.historial_aumentos.length : 0;
    const viaCount = Array.isArray(item.viaticos) ? item.viaticos.length : 0;

    window.MaderoUI.openModal({
      title: existing ? `Editar Rol / Integrante (${item.id})` : 'Agregar Integrante o Célula Funcional',
      subtitle: 'Módulo 2 · Capacidad semanal, esquema de reemplazo, sueldo/pago y viáticos.',
      maxWidth: 'max-w-2xl',
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

          <div class="p-3.5 rounded-2xl bg-stone-100/75 border border-stone-200/75 space-y-2.5">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span class="text-xs font-extrabold text-stone-900">💵 Sueldo / Pago Base y Viáticos</span>
              ${existing ? `
                <button type="button" onclick="MaderoConduccion.openMiembroCompensacionModal('${esc(item.id)}')" class="px-2.5 py-1 rounded-xl bg-[#de4800] hover:brightness-110 text-white text-[11px] font-bold transition">
                  📈 Aumentos (${aumCount}) y 🚗 Viáticos (${viaCount}) →
                </button>
              ` : '<span class="text-[10px] text-stone-500">Guardá la ficha para cargar aumentos y viáticos.</span>'}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Sueldo / Pago Actual</label>
                <input type="number" id="mem-sueldo" value="${esc(item.sueldo_actual ?? 0)}" min="0" step="100" class="input-glass w-full px-2.5 py-1.5 font-mono font-bold">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Moneda</label>
                <select id="mem-moneda" class="input-glass w-full px-2.5 py-1.5">
                  <option value="ARS" ${(item.sueldo_moneda || 'ARS') === 'ARS' ? 'selected' : ''}>ARS ($)</option>
                  <option value="USD" ${item.sueldo_moneda === 'USD' ? 'selected' : ''}>USD</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Modalidad</label>
                <select id="mem-modalidad" class="input-glass w-full px-2.5 py-1.5">
                  ${['Mensual', 'Quincenal', 'Por pieza / Freelance', 'Honorarios'].map(mod => `<option value="${mod}" ${(item.modalidad_pago || 'Mensual') === mod ? 'selected' : ''}>${mod}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Último Pago</label>
                <input type="date" id="mem-ultimo-pago" value="${esc(item.fecha_ultimo_pago || '')}" class="input-glass w-full px-2.5 py-1.5 font-mono">
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-stone-700 mb-1">Notas de Pago (CBU / Alias / Acuerdo)</label>
              <input type="text" id="mem-notas-pago" value="${esc(item.notas_pago || '')}" placeholder="Ej. Pago del 1 al 5, incluye viáticos de traslado..." class="input-glass w-full px-2.5 py-1.5">
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
      observaciones: document.getElementById('mem-obs').value.trim(),
      sueldo_actual: Math.max(0, Number(document.getElementById('mem-sueldo')?.value) || 0),
      sueldo_moneda: document.getElementById('mem-moneda')?.value || 'ARS',
      modalidad_pago: document.getElementById('mem-modalidad')?.value || 'Mensual',
      fecha_ultimo_pago: document.getElementById('mem-ultimo-pago')?.value || '',
      notas_pago: (document.getElementById('mem-notas-pago')?.value || '').trim()
    });
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Integrante / rol guardado');
  }

  function formatCompMoney(amount, currency) {
    const prefix = currency === 'USD' ? 'USD' : '$';
    return `${prefix} ${Number(amount || 0).toLocaleString('es-AR')}`;
  }

  function openMiembroCompensacionModal(id) {
    const m = (window.MaderoStore.getState().equipo_miembros || []).find(i => i.id === id);
    if (!m) {
      window.MaderoUI.showToast('Integrante no encontrado', 'red');
      return;
    }

    const moneda = m.sueldo_moneda === 'USD' ? 'USD' : 'ARS';
    const sueldoActual = Number(m.sueldo_actual) || 0;
    const aumentos = Array.isArray(m.historial_aumentos) ? m.historial_aumentos : [];
    const viaticos = Array.isArray(m.viaticos) ? m.viaticos : [];
    const totalViaticos = viaticos.reduce((acc, v) => acc + (Number(v.monto) || 0), 0);
    const totalPendiente = viaticos.filter(v => v.estado === 'PENDIENTE').reduce((acc, v) => acc + (Number(v.monto) || 0), 0);
    const todayIso = new Date().toISOString().slice(0, 10);

    const aumentosHtml = aumentos.length === 0
      ? '<p class="text-[11px] text-stone-500">Sin aumentos registrados todavía.</p>'
      : aumentos.map(a => `
        <div class="p-2.5 rounded-xl bg-white/10 border border-stone-200/50 flex items-center justify-between gap-2">
          <div class="space-y-0.5 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="badge-pill badge-orange font-mono text-[10px]">📅 ${formatDateDisplay(a.fecha)}</span>
              <span class="font-mono text-xs font-bold text-stone-900">${formatCompMoney(a.monto_anterior, moneda)} → ${formatCompMoney(a.monto_nuevo, moneda)}</span>
              ${a.porcentaje !== null && a.porcentaje !== undefined ? `<span class="badge-pill badge-emerald text-[10px]">+${a.porcentaje}%</span>` : ''}
            </div>
            ${a.motivo ? `<p class="text-[11px] text-stone-600">${esc(a.motivo)}</p>` : ''}
          </div>
          <button type="button" onclick="MaderoConduccion.deleteAumentoFromModal('${esc(m.id)}', '${esc(a.id)}')" title="Eliminar registro" class="px-2 py-0.5 rounded bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-xs font-bold shrink-0">×</button>
        </div>
      `).join('');

    const estadoBadgeViatico = st => {
      if (st === 'PAGADO') return '<span class="badge-pill badge-emerald text-[10px]">Pagado</span>';
      if (st === 'RENDIDO') return '<span class="badge-pill badge-blue text-[10px]">Rendido</span>';
      return '<span class="badge-pill badge-amber text-[10px]">Pendiente</span>';
    };

    const viaticosHtml = viaticos.length === 0
      ? '<p class="text-[11px] text-stone-500">Sin viáticos cargados todavía.</p>'
      : viaticos.map(v => {
        const hasUrl = v.comprobante_url && /^(https?:\/\/|data:)/i.test(v.comprobante_url);
        const nextEst = v.estado === 'PENDIENTE' ? 'RENDIDO' : v.estado === 'RENDIDO' ? 'PAGADO' : 'PENDIENTE';
        return `
          <div class="p-2.5 rounded-xl bg-white/10 border border-stone-200/50 flex items-start justify-between gap-2">
            <div class="space-y-1 min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="badge-pill badge-stone font-mono text-[10px]">📅 ${formatDateDisplay(v.fecha)}</span>
                <span class="font-mono text-xs font-extrabold text-stone-900">${formatCompMoney(v.monto, v.moneda || moneda)}</span>
                <button type="button" onclick="MaderoConduccion.quickChangeViaticoEstado('${esc(m.id)}', '${esc(v.id)}', '${nextEst}')" title="Clic para cambiar estado" class="cursor-pointer">
                  ${estadoBadgeViatico(v.estado)}
                </button>
              </div>
              <div class="text-xs font-semibold text-stone-800">${esc(v.concepto)}</div>
              ${hasUrl ? `
                <a href="${esc(v.comprobante_url)}" target="_blank" rel="noopener noreferrer" ${/^data:/i.test(v.comprobante_url) ? `download="${esc(v.comprobante_nombre || 'comprobante')}"` : ''} class="inline-flex items-center gap-1 text-[10px] font-semibold text-[#ff9c6e] hover:underline">
                  📄 ${esc(v.comprobante_nombre || 'Ver comprobante')} ↗
                </a>
              ` : ''}
            </div>
            <button type="button" onclick="MaderoConduccion.deleteViaticoFromModal('${esc(m.id)}', '${esc(v.id)}')" title="Eliminar viático" class="px-2 py-0.5 rounded bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-xs font-bold shrink-0">×</button>
          </div>
        `;
      }).join('');

    window.MaderoUI.openModal({
      title: `Sueldos, Aumentos y Viáticos · ${m.nombre}`,
      subtitle: `${m.id} · ${m.rol || 'Equipo Interno'}`,
      maxWidth: 'max-w-3xl',
      bodyHtml: `
        <div class="space-y-4">
          <!-- Resumen -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div class="p-3 rounded-xl bg-stone-100/75 border border-stone-200/75">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Sueldo / Pago Actual</span>
              <span class="font-mono text-lg font-extrabold text-stone-900">${formatCompMoney(sueldoActual, moneda)}</span>
              <span class="text-[10px] text-stone-500 block">${esc(m.modalidad_pago || 'Mensual')}</span>
            </div>
            <div class="p-3 rounded-xl bg-stone-100/75 border border-stone-200/75">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Aumentos Registrados</span>
              <span class="font-mono text-lg font-extrabold text-stone-900">${aumentos.length}</span>
              <span class="text-[10px] text-stone-500 block">${aumentos[0] ? `Último: ${formatDateDisplay(aumentos[0].fecha)}` : 'Sin historial aún'}</span>
            </div>
            <div class="p-3 rounded-xl bg-stone-100/75 border border-stone-200/75">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Total Viáticos (${viaticos.length})</span>
              <span class="font-mono text-lg font-extrabold text-stone-900">${formatCompMoney(totalViaticos, moneda)}</span>
              <span class="text-[10px] text-amber-700 font-semibold block">Pendiente: ${formatCompMoney(totalPendiente, moneda)}</span>
            </div>
          </div>

          <!-- Bloque A: Aumentos de Sueldo -->
          <div class="p-3.5 rounded-2xl bg-stone-100/75 border border-stone-200/75 space-y-3">
            <div class="text-xs font-extrabold text-stone-900">📈 Registrar Aumento de Sueldo / Pago</div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Fecha del Aumento *</label>
                <input type="date" id="aum-fecha" value="${esc(todayIso)}" class="input-glass w-full px-2.5 py-1.5 font-mono">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Nuevo Sueldo / Pago (${moneda}) *</label>
                <input type="number" id="aum-monto" value="${esc(sueldoActual)}" min="0" step="100" class="input-glass w-full px-2.5 py-1.5 font-mono font-bold">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Motivo / Acuerdo</label>
                <input type="text" id="aum-motivo" placeholder="Ej. Ajuste inflación / desempeño..." class="input-glass w-full px-2.5 py-1.5">
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" onclick="MaderoConduccion.saveAumentoFromModal('${esc(m.id)}')" class="px-3.5 py-1.5 rounded-xl bg-[#de4800] hover:brightness-110 text-white text-xs font-bold transition">
                + Registrar Aumento y Actualizar Sueldo
              </button>
            </div>
            <div class="space-y-1.5 pt-2 border-t border-stone-200/60">
              ${aumentosHtml}
            </div>
          </div>

          <!-- Bloque B: Viáticos -->
          <div class="p-3.5 rounded-2xl bg-stone-100/75 border border-stone-200/75 space-y-3">
            <div class="text-xs font-extrabold text-stone-900">🚗 Registrar Viático</div>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Fecha *</label>
                <input type="date" id="via-fecha" value="${esc(todayIso)}" class="input-glass w-full px-2.5 py-1.5 font-mono">
              </div>
              <div class="sm:col-span-2">
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Concepto / Motivo *</label>
                <input type="text" id="via-concepto" placeholder="Ej. Combustible traslado Neuquén, peajes, almuerzo..." class="input-glass w-full px-2.5 py-1.5">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Monto (${moneda}) *</label>
                <input type="number" id="via-monto" value="" min="0" step="100" placeholder="15000" class="input-glass w-full px-2.5 py-1.5 font-mono font-bold">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
              <div>
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Estado</label>
                <select id="via-estado" class="input-glass w-full px-2.5 py-1.5">
                  <option value="PENDIENTE">Pendiente de Reintegro</option>
                  <option value="RENDIDO">Rendido / Aprobado</option>
                  <option value="PAGADO">Pagado / Reintegrado</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-[10px] font-bold text-stone-700 mb-1">Comprobante (Link o subir PDF/Foto hasta 3 MB)</label>
                <input type="hidden" id="via-comp-nombre" value="">
                <div class="flex items-center gap-2">
                  <input type="text" id="via-comp-url" value="" placeholder="https://... o adjuntá comprobante" class="input-glass flex-1 px-2.5 py-1.5">
                  <label class="inline-flex items-center cursor-pointer shrink-0">
                    <span class="px-2.5 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-[11px] font-semibold hover:bg-stone-50">📄 Adjuntar</span>
                    <input type="file" accept=".pdf,application/pdf,image/*" onchange="MaderoConduccion.handleViaticoFileSelect(this)" class="hidden">
                  </label>
                </div>
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" onclick="MaderoConduccion.saveViaticoFromModal('${esc(m.id)}')" class="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition">
                + Agregar Viático
              </button>
            </div>
            <div class="space-y-1.5 pt-2 border-t border-stone-200/60">
              ${viaticosHtml}
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoConduccion.openMiembroModal('${esc(m.id)}')" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold mr-auto">← Volver a Ficha del Integrante</button>
        <button type="button" onclick="MaderoUI.closeModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">Cerrar</button>
      `
    });
  }

  function saveAumentoFromModal(miembroId) {
    const fecha = (document.getElementById('aum-fecha')?.value || '').trim();
    const montoNuevo = Number(document.getElementById('aum-monto')?.value);
    const motivo = (document.getElementById('aum-motivo')?.value || '').trim();
    if (!fecha || isNaN(montoNuevo) || montoNuevo <= 0) {
      window.MaderoUI.showToast('Ingresá fecha y el nuevo monto válido', 'red');
      return;
    }
    window.MaderoStore.addMiembroAumento(miembroId, { fecha, monto_nuevo: montoNuevo, motivo });
    openMiembroCompensacionModal(miembroId);
    window.MaderoUI.showToast('Aumento registrado y sueldo actualizado');
  }

  function deleteAumentoFromModal(miembroId, aumentoId) {
    if (!confirm('¿Eliminar este registro de aumento?')) return;
    window.MaderoStore.deleteMiembroAumento(miembroId, aumentoId);
    openMiembroCompensacionModal(miembroId);
    window.MaderoUI.showToast('Registro de aumento eliminado', 'amber');
  }

  function handleViaticoFileSelect(inputEl) {
    const file = inputEl && inputEl.files && inputEl.files[0];
    if (!file) return;
    const nameEl = document.getElementById('via-comp-nombre');
    const urlEl = document.getElementById('via-comp-url');
    if (nameEl) nameEl.value = file.name;
    window.MaderoUI.uploadAttachmentFile(file, res => {
      if (urlEl && res.ok && res.url) {
        urlEl.value = res.url;
      }
    });
  }

  function saveViaticoFromModal(miembroId) {
    const fecha = (document.getElementById('via-fecha')?.value || '').trim();
    const concepto = (document.getElementById('via-concepto')?.value || '').trim();
    const monto = Number(document.getElementById('via-monto')?.value);
    const estado = document.getElementById('via-estado')?.value || 'PENDIENTE';
    const comprobante_nombre = (document.getElementById('via-comp-nombre')?.value || '').trim();
    const comprobante_url = (document.getElementById('via-comp-url')?.value || '').trim();
    if (!concepto || isNaN(monto) || monto <= 0) {
      window.MaderoUI.showToast('Ingresá concepto y monto del viático', 'red');
      return;
    }
    window.MaderoStore.addMiembroViatico(miembroId, {
      fecha,
      concepto,
      monto,
      estado,
      comprobante_nombre,
      comprobante_url
    });
    openMiembroCompensacionModal(miembroId);
    window.MaderoUI.showToast('Viático registrado');
  }

  function quickChangeViaticoEstado(miembroId, viaticoId, nuevoEstado) {
    window.MaderoStore.setMiembroViaticoEstado(miembroId, viaticoId, nuevoEstado);
    openMiembroCompensacionModal(miembroId);
    window.MaderoUI.showToast(`Viático marcado como ${nuevoEstado}`);
  }

  function deleteViaticoFromModal(miembroId, viaticoId) {
    if (!confirm('¿Eliminar este viático?')) return;
    window.MaderoStore.deleteMiembroViatico(miembroId, viaticoId);
    openMiembroCompensacionModal(miembroId);
    window.MaderoUI.showToast('Viático eliminado', 'amber');
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
          ${existing ? renderModalAvancesBlock('EQUIPO', item) : ''}
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
    setWeeklyFocusFilter,
    setWeeklyGroupMode,
    openAvanceModal,
    handleAvanceFileSelect,
    saveAvanceFromModal,
    deleteAvance,
    exportAgendaCSV,
    renderEquipoModule,
    openMiembroModal,
    saveMiembroFromModal,
    handleDeleteMiembro,
    openMiembroCompensacionModal,
    saveAumentoFromModal,
    deleteAumentoFromModal,
    handleViaticoFileSelect,
    saveViaticoFromModal,
    quickChangeViaticoEstado,
    deleteViaticoFromModal,
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

