/* ==========================================================================
   Madero Automotores · Control Integral de Marketing
   Controlador Principal SPA: Niveles, 12 Módulos, KPIs Vivos y Dock VisionOS
   ========================================================================== */

window.MaderoApp = (function () {
  let activeNivel = 'operativo'; // 'operativo' | 'gerencial'
  let activeModuleId = 'm1-agenda'; // 'm1-agenda' | 'm2-equipo' | 'gob-frentes' | 'm3-fotos' ... 'm12-ventas'

  function getClusterForModule(modId) {
    if (modId === 'gob-frentes' || modId === 'm1-agenda' || modId === 'm2-equipo') return 'conduccion';
    if (modId === 'm9-proveedores') return 'proveedores';
    if (modId === 'm3-fotos') return 'fotos';
    if (['m4-contenido', 'm5-redes', 'm6-campanas'].includes(modId)) return 'contenido-pauta';
    if (['m7-google', 'm8-web', 'm10-eventos', 'm11-merch', 'm12-ventas'].includes(modId)) return 'ecosistema';
    return 'conduccion';
  }

  function setNivel(nivel) {
    activeNivel = nivel;
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateCluster(clusterId) {
    if (clusterId === 'direccion') {
      setNivel('gerencial');
      return;
    }
    activeNivel = 'operativo';
    const defaultByCluster = {
      'conduccion': 'm1-agenda',
      'proveedores': 'm9-proveedores',
      'fotos': 'm3-fotos',
      'contenido-pauta': 'm4-contenido',
      'ecosistema': 'm7-google'
    };
    activeModuleId = defaultByCluster[clusterId] || 'm1-agenda';
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateModule(modId) {
    activeNivel = 'operativo';
    activeModuleId = modId;
    renderAll();
  }

  // Atajos desde las 4 tarjetas ejecutivas superiores (sincronizan header, tira, dock y vista)
  function jumpToAgendaDesvios() {
    activeNivel = 'operativo';
    activeModuleId = 'm1-agenda';
    window.MaderoConduccion.focusAgendaDesvios();
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function jumpToDecisionesDireccion() {
    activeNivel = 'operativo';
    activeModuleId = 'm1-agenda';
    window.MaderoConduccion.focusAgendaDireccion();
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function jumpToEquipoCapacidad() {
    activeNivel = 'operativo';
    activeModuleId = 'm2-equipo';
    window.MaderoConduccion.focusEquipoCapacidad();
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function jumpToTrabajoAbsorbido() {
    activeNivel = 'operativo';
    activeModuleId = 'm9-proveedores';
    window.MaderoProveedores.setFilter('onlyAbsorbido', true);
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ------------------------------------------------------------------------
  // RENDERIZADO DEL HEADER, KPIs SUPERIORES, TIRA DE 12 MÓDULOS Y DOCK
  // ------------------------------------------------------------------------
  function updateHeaderAndKPIs() {
    const state = window.MaderoStore.getState();
    const meta = state.meta;
    const sum = window.MaderoStore.getComputedSummary();

    const setTxt = (id, t) => {
      const el = document.getElementById(id);
      if (el) el.textContent = t;
    };
    const setHtml = (id, h) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = h;
    };

    setTxt('hdr-semana', meta.semana_activa);
    setTxt('hdr-corte', window.MaderoUI.formatDateDisplay(meta.fecha_corte));
    setTxt('hdr-lider', meta.lider);

    // Botones de Nivel 1 vs Nivel 2
    const btnOp = document.getElementById('btn-nivel-operativo');
    const btnGer = document.getElementById('btn-nivel-gerencial');
    if (btnOp && btnGer) {
      if (activeNivel === 'operativo') {
        btnOp.className = 'px-3 py-1.5 rounded-xl text-xs font-bold transition tab-btn-active';
        btnGer.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 transition';
      } else {
        btnGer.className = 'px-3 py-1.5 rounded-xl text-xs font-bold transition tab-btn-active';
        btnOp.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 transition';
      }
    }

    // 4 Tarjetas Ejecutivas Superiores
    setTxt('kpi-pri-badge', `${sum.totalPrioridades} frentes`);
    setTxt('kpi-pri-count', sum.totalPrioridades);
    setHtml(
      'kpi-pri-desc',
      sum.priDesviosCount > 0
        ? `<strong class="text-rose-600 font-bold">${sum.priAtrasadasCount} atrasado(s)</strong> · <strong class="text-amber-700 font-bold">${sum.priObservadasCount} observado(s)</strong> por Madero.`
        : 'Todos los compromisos dentro de plazo.'
    );
    setTxt('kpi-pri-closed', `Cerrados c/ evidencia: ${sum.priCerradasCount}`);

    setTxt('kpi-dir-badge', `${sum.decisionesTotalCount} esc.`);
    setTxt('kpi-dir-count', sum.decisionesTotalCount);
    setHtml(
      'kpi-dir-desc',
      `Agenda (${sum.decisionesDireccionCount}) + Proveedor (${sum.provEscaladosCount}). <strong class="text-violet-700">${sum.priPendInfoMaderoCount} pend. info Madero</strong>.`
    );

    setTxt('kpi-eq-badge', `${sum.ocupacionPct}% carga`);
    setTxt('kpi-eq-count', `${sum.horasAsignadas}h`);
    setTxt('kpi-eq-sub', `de ${sum.capacidadTotalHs}h semanales`);
    setHtml(
      'kpi-eq-desc',
      `Backup doc: <strong class="text-emerald-700">${sum.backupsDocumentados}/${sum.totalMiembros}</strong> · Bloqueos: <strong class="text-amber-700">${sum.tareasBloqueadasCount}</strong>.`
    );

    const totalCasosAbs = sum.tareasAbsorbidasCount + (sum.provHorasAbsorbidasManuales > 0 ? 1 : 0);
    setTxt('kpi-abs-badge', `${totalCasosAbs} casos`);
    setTxt('kpi-abs-count', `${sum.horasAbsorbidasConsolidadas.toFixed(1)}h`);
    setHtml(
      'kpi-abs-desc',
      `${sum.horasAbsorbidas}h equipo (${sum.tareasAbsorbidasCount} tareas) + ${sum.provHorasAbsorbidasManuales}h prov. Sin doble conteo.`
    );

    // Dock Badges
    setTxt('dock-lbl-conduccion', `Conducción (${sum.totalPrioridades})`);
    setTxt('dock-lbl-proveedores', `Proveedores (${sum.provDesviosCount})`);
    setTxt('dock-lbl-fotos', `Fotografías (${sum.fotosUnidadesTotales || 36})`);
    setTxt('dock-lbl-contenido-pauta', `Contenido & Pauta (${(sum.contTotal || 0) + (sum.campTotal || 0)})`);
    setTxt('dock-lbl-direccion', `Dirección (${sum.decisionesTotalCount})`);

    // Spatial Bento Hero Widgets (SVG Dial, Arc, Showroom Camera, 7-Frentes)
    const cobPct = Number(sum.coberturaGeneralLucyPct || 0);
    setTxt('bento-media-sub', `${sum.provDesviosCount || 0} desvíos prov. · ${(sum.contTotal || 0) + (sum.campTotal || 0)} piezas/camp.`);
    setTxt('bento-cam-pct', `${cobPct}%`);
    setTxt('bento-cam-stats', `${sum.fotosAlDiaCount || 0}/${sum.fotosUnidadesTotales || 36}`);
    setTxt('bento-dial-max', `${sum.capacidadTotalHs || 0}h`);
    setTxt('bento-lucy-sub', `Corte: ${window.MaderoUI.formatDateDisplay(meta.fecha_corte)} · ${cobPct}% fotos`);

    const dialRing = document.getElementById('bento-dial-ring');
    if (dialRing) {
      const occ = Math.min(100, Math.max(0, Number(sum.ocupacionPct || 0)));
      dialRing.setAttribute('stroke-dashoffset', String(Math.round(289 - (289 * occ) / 100)));
    }

    const arcPath = document.getElementById('bento-arc-path');
    const arcThumb = document.getElementById('bento-arc-thumb');
    if (arcPath || arcThumb) {
      const ratio = sum.totalPrioridades > 0
        ? Math.min(1, Math.max(0.12, (sum.priDesviosCount + sum.decisionesTotalCount) / Math.max(1, sum.totalPrioridades)))
        : 0.25;
      if (arcPath) arcPath.setAttribute('stroke-dashoffset', String(Math.round(151 * (1 - ratio))));
      if (arcThumb) {
        const theta = (-Math.PI / 2) + ratio * Math.PI;
        arcThumb.setAttribute('cx', (15 + 48 * Math.cos(theta)).toFixed(1));
        arcThumb.setAttribute('cy', (64 + 48 * Math.sin(theta)).toFixed(1));
      }
    }

    const gobList = (window.MaderoStore.getState().gobernanza_frentes || []);
    if (gobList.length > 0) {
      const okFrentes = gobList.filter(f => (f.semaforo || 'VERDE') === 'VERDE').length;
      setTxt('bento-frentes-pct', `${okFrentes}/${gobList.length}`);
    }
  }

  function renderModuleStrip() {
    const strip = document.getElementById('modules-12-strip');
    if (!strip) return;

    if (activeNivel === 'gerencial') {
      strip.classList.add('hidden');
      return;
    }
    strip.classList.remove('hidden');

    const gobActive = activeModuleId === 'gob-frentes';
    let html = `
      <button type="button" onclick="MaderoApp.navigateModule('gob-frentes')" class="spatial-pill px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shrink-0 ${gobActive ? 'spatial-pill-active' : ''}">
        <span class="w-1.5 h-1.5 rounded-full ${gobActive ? 'bg-[#f4f1ea]' : 'bg-[#de4800]'}"></span>
        <span>7 Frentes</span>
      </button>
      <span class="hidden sm:inline-block w-px h-4 bg-stone-300/80 mx-0.5 select-none" aria-hidden="true"></span>
    `;

    window.MaderoData.MODULOS_SISTEMA.forEach(m => {
      const isAct = activeModuleId === m.id;
      const dotClass = isAct ? 'bg-[#f4f1ea]' : (m.activoEnPasoActual ? 'bg-[#de4800]' : 'bg-stone-400');
      const stepTag = m.activoEnPasoActual ? '' : `<span class="text-[9px] font-mono opacity-75">P${m.paso}</span>`;
      html += `
        <button type="button" onclick="MaderoApp.navigateModule('${m.id}')" class="spatial-pill px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shrink-0 ${isAct ? 'spatial-pill-active' : ''}">
          <span class="w-1.5 h-1.5 rounded-full ${dotClass}"></span>
          <span>${window.MaderoUI.esc(m.corto)}</span>
          ${stepTag}
        </button>
      `;
    });

    html += `
      <button type="button" onclick="MaderoApp.triggerQuickNew()" class="spatial-pill-new px-4 py-1.5 text-xs font-bold whitespace-nowrap flex items-center gap-1 shrink-0 ml-auto">
        <i class="ri-add-line text-sm"></i>
        <span>Nuevo</span>
      </button>
    `;

    strip.innerHTML = html;
  }

  function updateDockActiveState() {
    const clusters = ['conduccion', 'proveedores', 'fotos', 'contenido-pauta', 'ecosistema', 'direccion'];
    const currentCluster = activeNivel === 'gerencial' ? 'direccion' : getClusterForModule(activeModuleId);

    clusters.forEach(c => {
      ['dock-btn-' + c, 'dock-mob-' + c].forEach(domId => {
        const btn = document.getElementById(domId);
        if (!btn) return;
        if (c === currentCluster) btn.classList.add('tab-btn-active');
        else btn.classList.remove('tab-btn-active');
      });

      const sideBtn = document.getElementById('side-btn-' + c);
      if (sideBtn) {
        if (c === currentCluster) sideBtn.classList.add('side-btn-active');
        else sideBtn.classList.remove('side-btn-active');
      }
    });
  }

  function renderActiveView() {
    const container = document.getElementById('app-view-container');
    if (!container) return;

    // Preservar foco y posición del cursor en búsquedas reactivas
    const activeEl = document.activeElement;
    const restoreId = activeEl && container.contains(activeEl) && activeEl.id ? activeEl.id : null;
    const selStart = restoreId && typeof activeEl.selectionStart === 'number' ? activeEl.selectionStart : null;
    const selEnd = restoreId && typeof activeEl.selectionEnd === 'number' ? activeEl.selectionEnd : null;

    let html = '';
    if (activeNivel === 'gerencial') {
      html = window.MaderoInformeDireccion
        ? window.MaderoInformeDireccion.renderExecutiveReport()
        : window.MaderoConduccion.renderResumenGerencialPreview();
    } else if (activeModuleId === 'gob-frentes') {
      html = window.MaderoConduccion.renderGobernanzaSection();
    } else if (activeModuleId === 'm1-agenda') {
      html = window.MaderoConduccion.renderAgendaModule();
    } else if (activeModuleId === 'm2-equipo') {
      html = window.MaderoConduccion.renderEquipoModule();
    } else if (activeModuleId === 'm9-proveedores') {
      html = window.MaderoProveedores.renderModule();
    } else if (activeModuleId === 'm3-fotos') {
      html = window.MaderoFotografias.renderModule();
    } else if (activeModuleId === 'm4-contenido') {
      html = window.MaderoContenidoPauta.renderContenidoModule();
    } else if (activeModuleId === 'm5-redes') {
      html = window.MaderoContenidoPauta.renderRedesModule();
    } else if (activeModuleId === 'm6-campanas') {
      html = window.MaderoContenidoPauta.renderCampanasModule();
    } else if (activeModuleId === 'm7-google') {
      html = window.MaderoEcosistemaTerritorio.renderGoogleModule();
    } else if (activeModuleId === 'm8-web') {
      html = window.MaderoEcosistemaTerritorio.renderWebModule();
    } else if (activeModuleId === 'm10-eventos') {
      html = window.MaderoEcosistemaTerritorio.renderEventosModule();
    } else if (activeModuleId === 'm11-merch') {
      html = window.MaderoEcosistemaTerritorio.renderMerchModule();
    } else if (activeModuleId === 'm12-ventas') {
      html = window.MaderoEcosistemaTerritorio.renderVentasModule();
    } else {
      const modObj = window.MaderoData.MODULOS_SISTEMA.find(m => m.id === activeModuleId);
      html = window.MaderoUI.renderUpcomingModuleBlueprint(modObj);
    }

    container.innerHTML = html;

    if (restoreId) {
      const nextEl = document.getElementById(restoreId);
      if (nextEl) {
        nextEl.focus({ preventScroll: true });
        if (selStart !== null && typeof nextEl.setSelectionRange === 'function') {
          try { nextEl.setSelectionRange(selStart, selEnd); } catch (_) {}
        }
      }
    }
  }

  function renderAll() {
    updateHeaderAndKPIs();
    renderModuleStrip();
    updateDockActiveState();
    renderActiveView();
  }

  // ------------------------------------------------------------------------
  // GESTIÓN DE CONFIGURACIÓN Y BACKUP JSON
  // ------------------------------------------------------------------------
  function saveMetaFromModal() {
    window.MaderoStore.updateMeta({
      semana_activa: document.getElementById('cfg-semana').value.trim(),
      fecha_corte: document.getElementById('cfg-fecha-corte').value,
      lider: document.getElementById('cfg-lider').value.trim(),
      semaforo_area: document.getElementById('cfg-semaforo').value,
      resumen_ejecutivo_lider: document.getElementById('cfg-resumen').value.trim()
    });
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Corte semanal y lectura actualizados');
  }

  function handleImportJSON(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        window.MaderoStore.importJSONBackup(e.target.result);
        window.MaderoUI.closeModal();
        window.MaderoUI.showToast('Respaldo JSON restaurado con éxito');
      } catch (err) {
        window.MaderoUI.showToast('Archivo JSON inválido: ' + err.message, 'red');
      }
    };
    reader.readAsText(file);
  }

  function handleResetBaseline() {
    if (confirm('¿Restaurar todos los datos a la línea de base inicial del sistema?')) {
      window.MaderoStore.resetToBaseline();
      window.MaderoUI.closeModal();
      window.MaderoUI.showToast('Línea de base original restaurada', 'amber');
    }
  }

  // Inicialización
  window.addEventListener('DOMContentLoaded', () => {
    window.MaderoStore.init();
    window.MaderoStore.subscribe(() => {
      renderAll();
    });
    renderAll();
  });

  function handleGlobalSearch(query) {
    const q = String(query || '');
    if (activeNivel === 'gerencial') {
      if (!q.trim()) return;
      activeNivel = 'operativo';
      activeModuleId = 'm1-agenda';
    }
    switch (activeModuleId) {
      case 'gob-frentes':
        if (q.trim()) activeModuleId = 'm1-agenda';
        if (window.MaderoConduccion?.setAgendaSearch) window.MaderoConduccion.setAgendaSearch(q);
        break;
      case 'm1-agenda':
        if (window.MaderoConduccion?.setAgendaSearch) window.MaderoConduccion.setAgendaSearch(q);
        break;
      case 'm2-equipo':
        if (window.MaderoConduccion?.setEquipoSearch) window.MaderoConduccion.setEquipoSearch(q);
        break;
      case 'm9-proveedores':
        if (window.MaderoProveedores?.setFilter) window.MaderoProveedores.setFilter('search', q);
        break;
      case 'm3-fotos':
        if (window.MaderoFotografias?.setSearch) window.MaderoFotografias.setSearch(q);
        break;
      case 'm4-contenido':
      case 'm5-redes':
        if (window.MaderoContenidoPauta?.setContenidoSearch) window.MaderoContenidoPauta.setContenidoSearch(q);
        break;
      case 'm6-campanas':
        if (window.MaderoContenidoPauta?.setCampanasSearch) window.MaderoContenidoPauta.setCampanasSearch(q);
        break;
      case 'm7-google':
        if (window.MaderoEcosistemaTerritorio?.setGoogleSearch) window.MaderoEcosistemaTerritorio.setGoogleSearch(q);
        break;
      case 'm8-web':
        if (window.MaderoEcosistemaTerritorio?.setWebSearch) window.MaderoEcosistemaTerritorio.setWebSearch(q);
        break;
      case 'm10-eventos':
        if (window.MaderoEcosistemaTerritorio?.setEventosSearch) window.MaderoEcosistemaTerritorio.setEventosSearch(q);
        break;
      case 'm11-merch':
        if (window.MaderoEcosistemaTerritorio?.setMerchSearch) window.MaderoEcosistemaTerritorio.setMerchSearch(q);
        break;
      case 'm12-ventas':
        if (window.MaderoEcosistemaTerritorio?.setVentasSearch) window.MaderoEcosistemaTerritorio.setVentasSearch(q);
        break;
      default:
        break;
    }
    updateHeaderAndKPIs();
    updateDockActiveState();
    renderModuleStrip();
  }

  function triggerQuickNew() {
    if (activeNivel === 'gerencial') {
      if (window.MaderoInformeDireccion?.openNotasInformeModal) {
        window.MaderoInformeDireccion.openNotasInformeModal();
      }
      return;
    }
    switch (activeModuleId) {
      case 'gob-frentes':
      case 'm1-agenda':
        window.MaderoConduccion?.openPrioridadModal(null);
        break;
      case 'm2-equipo':
        window.MaderoConduccion?.openTareaEquipoModal(null);
        break;
      case 'm9-proveedores':
        window.MaderoProveedores?.openCompromisoModal();
        break;
      case 'm3-fotos':
        window.MaderoFotografias?.openCreateModal();
        break;
      case 'm4-contenido':
        window.MaderoContenidoPauta?.openPiezaModal(null);
        break;
      case 'm5-redes':
        window.MaderoContenidoPauta?.openRedModal(null);
        break;
      case 'm6-campanas':
        window.MaderoContenidoPauta?.openCampanaModal(null);
        break;
      case 'm7-google':
        window.MaderoEcosistemaTerritorio?.openGoogleModal(null);
        break;
      case 'm8-web':
        window.MaderoEcosistemaTerritorio?.openWebModal(null);
        break;
      case 'm10-eventos':
        window.MaderoEcosistemaTerritorio?.openEventoModal(null);
        break;
      case 'm11-merch':
        window.MaderoEcosistemaTerritorio?.openMerchModal(null);
        break;
      case 'm12-ventas':
        window.MaderoEcosistemaTerritorio?.openVentaModal(null);
        break;
      default:
        window.MaderoConduccion?.openPrioridadModal(null);
        break;
    }
  }

  function toggleBentoHero() {
    const hero = document.getElementById('spatial-bento-hero');
    const btn = document.getElementById('btn-toggle-bento');
    if (!hero) return;
    const isHidden = hero.classList.toggle('hidden');
    if (btn) {
      btn.innerHTML = isHidden
        ? '<i class="ri-eye-off-line text-xs"></i> Mostrar Bento'
        : '<i class="ri-eye-line text-xs"></i> Ocultar Bento';
    }
  }

  function toggleThemeMode() {
    const isSpatial = document.body.classList.toggle('spatial-theme');
    ['theme-toggle-icon', 'theme-toggle-icon-mob'].forEach(id => {
      const icon = document.getElementById(id);
      if (icon) {
        icon.className = isSpatial
          ? (id === 'theme-toggle-icon' ? 'ri-moon-clear-line text-base' : 'ri-moon-clear-line text-sm')
          : (id === 'theme-toggle-icon' ? 'ri-sun-line text-base' : 'ri-sun-line text-sm');
      }
    });
    if (window.MaderoUI?.showToast) {
      window.MaderoUI.showToast(isSpatial ? 'Modo Spatial Frosted Glass activado' : 'Modo Claro Clásico activado');
    }
  }

  return {
    setNivel,
    navigateCluster,
    navigateModule,
    jumpToAgendaDesvios,
    jumpToDecisionesDireccion,
    jumpToEquipoCapacidad,
    jumpToTrabajoAbsorbido,
    renderActiveView,
    renderAll,
    saveMetaFromModal,
    handleImportJSON,
    handleResetBaseline,
    handleGlobalSearch,
    triggerQuickNew,
    toggleBentoHero,
    toggleThemeMode
  };
})();

