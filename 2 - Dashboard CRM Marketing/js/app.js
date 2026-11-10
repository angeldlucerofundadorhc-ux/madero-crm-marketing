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
    setTxt('dock-lbl-direccion', `Dirección (${sum.decisionesTotalCount})`);
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
      <button type="button" onclick="MaderoApp.navigateModule('gob-frentes')" class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition shrink-0 ${gobActive ? 'subtab-btn-active' : 'bg-white/75 hover:bg-white text-stone-700 border border-stone-200/90'}">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>Secc. 4 · Separación Responsabilidades (7)</span>
      </button>
    `;

    window.MaderoData.MODULOS_SISTEMA.forEach(m => {
      const isAct = activeModuleId === m.id;
      const dotClass = m.activoEnPasoActual ? 'bg-emerald-500' : 'bg-stone-400';
      const stepTag = m.activoEnPasoActual ? '' : `<span class="text-[9px] font-mono opacity-75">P${m.paso}</span>`;
      html += `
        <button type="button" onclick="MaderoApp.navigateModule('${m.id}')" class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition shrink-0 ${isAct ? 'subtab-btn-active' : 'bg-white/75 hover:bg-white text-stone-700 border border-stone-200/90'}">
          <span class="w-1.5 h-1.5 rounded-full ${dotClass}"></span>
          <span>${window.MaderoUI.esc(m.corto)}</span>
          ${stepTag}
        </button>
      `;
    });

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
      html = window.MaderoConduccion.renderResumenGerencialPreview();
    } else if (activeModuleId === 'gob-frentes') {
      html = window.MaderoConduccion.renderGobernanzaSection();
    } else if (activeModuleId === 'm1-agenda') {
      html = window.MaderoConduccion.renderAgendaModule();
    } else if (activeModuleId === 'm2-equipo') {
      html = window.MaderoConduccion.renderEquipoModule();
    } else if (activeModuleId === 'm9-proveedores') {
      html = window.MaderoProveedores.renderModule();
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
    handleResetBaseline
  };
})();

