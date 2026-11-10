/* ==========================================================================
   Madero Automotores · Control Integral de Marketing
   Motor Reactivo de Estado, Persistencia LocalStorage y Exportación
   ========================================================================== */

window.MaderoStore = (function () {
  const STORAGE_KEY = 'madero_crm_mkt_v1';
  let state = null;
  const listeners = [];

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function ensureDefaults(loaded) {
    const base = deepClone(window.MaderoData.INITIAL_STATE);
    if (!loaded || typeof loaded !== 'object') return base;

    const merged = Object.assign({}, base, loaded);
    merged.meta = Object.assign({}, base.meta, loaded.meta || {});

    // Preserve arrays if present, otherwise initialize from baseline
    ['gobernanza_frentes', 'agenda_prioridades', 'equipo_miembros', 'equipo_tareas'].forEach(key => {
      if (!Array.isArray(merged[key])) {
        merged[key] = base[key];
      }
    });

    return merged;
  }

  function init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = ensureDefaults(JSON.parse(raw));
      } else {
        state = deepClone(window.MaderoData.INITIAL_STATE);
        persist(false);
      }
    } catch (err) {
      console.warn('LocalStorage fallback activo:', err);
      state = deepClone(window.MaderoData.INITIAL_STATE);
    }
    return state;
  }

  function persist(notify = true) {
    state.updated_at = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Error guardando estado en localStorage:', err);
    }
    if (notify) {
      listeners.forEach(fn => {
        try { fn(state); } catch (e) { console.error('Subscriber error:', e); }
      });
    }
  }

  function subscribe(fn) {
    listeners.push(fn);
  }

  function getState() {
    if (!state) init();
    return state;
  }

  // ------------------------------------------------------------------------
  // MÉTRICAS CONSOLIDADAS EN VIVO (Conecta Nivel Operativo -> Nivel Gerencial)
  // ------------------------------------------------------------------------
  function getComputedSummary() {
    const s = getState();
    const pri = s.agenda_prioridades || [];
    const members = s.equipo_miembros || [];
    const tasks = s.equipo_tareas || [];
    const gob = s.gobernanza_frentes || [];

    const decisionesDireccion = pri.filter(p => p.requiere_decision_direccion && p.estado !== 'CERRADO_EVIDENCIA');
    const priAtrasadas = pri.filter(p => p.estado === 'ATRASADO');
    const priObservadas = pri.filter(p => p.estado === 'OBSERVADO_MADERO' || p.estado === 'DEVUELTO_CORRECCION');
    const priPendInfoMadero = pri.filter(p => p.estado === 'PENDIENTE_INFO_MADERO');
    const priCerradas = pri.filter(p => p.estado === 'CERRADO_EVIDENCIA');

    const capacidadTotalHs = members.reduce((acc, m) => acc + (Number(m.horas_capacidad_semanal) || 0), 0);
    const horasAsignadas = tasks.reduce((acc, t) => acc + (Number(t.horas_estimadas) || 0), 0);
    const ocupacionPct = capacidadTotalHs > 0 ? Math.round((horasAsignadas / capacidadTotalHs) * 100) : 0;

    const tareasAbsorbidas = tasks.filter(t => t.es_trabajo_absorbido);
    const horasAbsorbidas = tareasAbsorbidas.reduce((acc, t) => acc + (Number(t.horas_estimadas) || 0), 0);

    const tareasBloqueadas = tasks.filter(t => t.bloqueo && t.bloqueo.trim() !== '' && t.estado !== 'CERRADO_EVIDENCIA');
    const tareasCalidadObs = tasks.filter(t => t.calidad_estado === 'OBSERVADO');
    const backupsDocumentados = members.filter(m => m.estado_continuidad === 'DOCUMENTADO').length;

    const frentesRojo = gob.filter(g => g.semaforo === 'ROJO').length;
    const frentesAmbar = gob.filter(g => g.semaforo === 'AMBAR').length;
    const frentesVerde = gob.filter(g => g.semaforo === 'VERDE').length;

    return {
      totalPrioridades: pri.length,
      decisionesDireccionCount: decisionesDireccion.length,
      decisionesDireccion,
      priAtrasadasCount: priAtrasadas.length,
      priObservadasCount: priObservadas.length,
      priDesviosCount: priAtrasadas.length + priObservadas.length,
      priPendInfoMaderoCount: priPendInfoMadero.length,
      priCerradasCount: priCerradas.length,
      capacidadTotalHs,
      horasAsignadas,
      ocupacionPct,
      tareasTotales: tasks.length,
      tareasAbsorbidasCount: tareasAbsorbidas.length,
      horasAbsorbidas,
      tareasBloqueadasCount: tareasBloqueadas.length,
      tareasCalidadObsCount: tareasCalidadObs.length,
      backupsDocumentados,
      totalMiembros: members.length,
      frentesRojo,
      frentesAmbar,
      frentesVerde
    };
  }

  // ------------------------------------------------------------------------
  // MUTADORES Y OPERACIONES CRUD
  // ------------------------------------------------------------------------
  function updateMeta(patch) {
    Object.assign(getState().meta, patch);
    persist(true);
  }

  function updateGobernanzaFrente(id, patch) {
    const list = getState().gobernanza_frentes;
    const idx = list.findIndex(item => item.id === id);
    if (idx !== -1) {
      list[idx] = Object.assign({}, list[idx], patch);
      persist(true);
    }
  }

  function nextId(prefix, list) {
    let max = 0;
    list.forEach(item => {
      const m = String(item.id || '').match(/(\d+)$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > max) max = n;
      }
    });
    const next = String(max + 1).padStart(2, '0');
    return `${prefix}-${next}`;
  }

  // Módulo 1: Agenda y Prioridades
  function upsertPrioridad(payload) {
    const list = getState().agenda_prioridades;
    if (payload.id) {
      const idx = list.findIndex(i => i.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload);
        persist(true);
        return list[idx];
      }
    }
    const nuevo = Object.assign({}, payload, {
      id: nextId('PRI', list)
    });
    list.unshift(nuevo);
    persist(true);
    return nuevo;
  }

  function deletePrioridad(id) {
    const s = getState();
    s.agenda_prioridades = s.agenda_prioridades.filter(i => i.id !== id);
    persist(true);
  }

  function setPrioridadEstado(id, nuevoEstado) {
    const item = getState().agenda_prioridades.find(i => i.id === id);
    if (item) {
      item.estado = nuevoEstado;
      persist(true);
    }
  }

  // Módulo 2A: Miembros / Roles del Equipo Interno
  function upsertMiembro(payload) {
    const list = getState().equipo_miembros;
    if (payload.id) {
      const idx = list.findIndex(i => i.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload);
        persist(true);
        return list[idx];
      }
    }
    const nuevo = Object.assign({}, payload, {
      id: nextId('MEM', list)
    });
    list.push(nuevo);
    persist(true);
    return nuevo;
  }

  function deleteMiembro(id) {
    const s = getState();
    s.equipo_miembros = s.equipo_miembros.filter(m => m.id !== id);
    persist(true);
  }

  // Módulo 2B: Tareas del Equipo Interno
  function upsertTareaEquipo(payload) {
    const list = getState().equipo_tareas;
    if (payload.id) {
      const idx = list.findIndex(i => i.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload);
        persist(true);
        return list[idx];
      }
    }
    const nuevo = Object.assign({}, payload, {
      id: nextId('INT', list)
    });
    list.unshift(nuevo);
    persist(true);
    return nuevo;
  }

  function deleteTareaEquipo(id) {
    const s = getState();
    s.equipo_tareas = s.equipo_tareas.filter(t => t.id !== id);
    persist(true);
  }

  function setTareaEquipoEstado(id, nuevoEstado) {
    const item = getState().equipo_tareas.find(t => t.id === id);
    if (item) {
      item.estado = nuevoEstado;
      persist(true);
    }
  }

  // ------------------------------------------------------------------------
  // IMPORTACIÓN / EXPORTACIÓN / BACKUP SEGURO
  // ------------------------------------------------------------------------
  function exportCSV(filename, headers, rows) {
    const escapeCell = val => {
      const str = val === null || val === undefined ? '' : String(val);
      return '"' + str.replace(/"/g, '""') + '"';
    };
    const lines = [headers.map(escapeCell).join(',')];
    rows.forEach(r => {
      lines.push(r.map(escapeCell).join(','));
    });
    // UTF-8 BOM para apertura perfecta de tildes/ñ en Microsoft Excel (Windows)
    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportJSONBackup() {
    const json = JSON.stringify(getState(), null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = (getState().meta.fecha_corte || 'backup').replace(/[^0-9-]/g, '');
    a.href = url;
    a.download = `madero_control_marketing_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importJSONBackup(jsonText) {
    const parsed = JSON.parse(jsonText);
    state = ensureDefaults(parsed);
    persist(true);
    return state;
  }

  function resetToBaseline() {
    state = deepClone(window.MaderoData.INITIAL_STATE);
    persist(true);
    return state;
  }

  return {
    init,
    subscribe,
    getState,
    getComputedSummary,
    updateMeta,
    updateGobernanzaFrente,
    upsertPrioridad,
    deletePrioridad,
    setPrioridadEstado,
    upsertMiembro,
    deleteMiembro,
    upsertTareaEquipo,
    deleteTareaEquipo,
    setTareaEquipoEstado,
    exportCSV,
    exportJSONBackup,
    importJSONBackup,
    resetToBaseline
  };
})();
