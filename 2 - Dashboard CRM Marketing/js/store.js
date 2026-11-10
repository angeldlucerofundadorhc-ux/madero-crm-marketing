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

  // Regla de Evolución Incremental: preserva arrays editados y fusiona objetos nuevos entre Pasos 1..6
  function ensureDefaults(loaded) {
    const base = deepClone(window.MaderoData.INITIAL_STATE);
    if (!loaded || typeof loaded !== 'object') return base;

    const merged = Object.assign({}, base, loaded);
    merged.schema_version = base.schema_version;

    Object.keys(base).forEach(key => {
      if (Array.isArray(base[key])) {
        if (!Array.isArray(merged[key])) {
          merged[key] = base[key];
        }
      } else if (base[key] && typeof base[key] === 'object') {
        merged[key] = Object.assign(
          {},
          base[key],
          loaded[key] && typeof loaded[key] === 'object' && !Array.isArray(loaded[key]) ? loaded[key] : {}
        );
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
  // HELPERS DE REGLAS DE NEGOCIO (PASO 2 - PROVEEDORES)
  // ------------------------------------------------------------------------
  function getHorasAbsorbidasCompromiso(c) {
    if (!c) return 0;
    const s = getState();
    const tasks = s.equipo_tareas || [];
    if (Array.isArray(c.tareas_vinculadas) && c.tareas_vinculadas.length > 0) {
      return c.tareas_vinculadas.reduce((acc, tid) => {
        const t = tasks.find(item => item.id === tid);
        return acc + (t ? (Number(t.horas_estimadas) || 0) : 0);
      }, 0);
    }
    const val = c.horas_absorbidas !== undefined ? c.horas_absorbidas : c.horas_absorbidas_estimadas;
    return Number(val) || 0;
  }

  function isPendienteMinuta(c) {
    if (!c) return false;
    const posReq = (window.MaderoData && window.MaderoData.POSICIONES_REQUIEREN_MINUTA) || [
      'OBSERVADO', 'RECHAZADO', 'REQUIERE_AJUSTE'
    ];
    const pos = c.posicion_madero_tipo || c.posicion_madero;
    const requiere = posReq.includes(pos);
    if (!requiere) return false;
    return !c.minuta_formalizada || Boolean(c.minuta_requiere_correccion);
  }

  function isVencidoSinActualizar(c) {
    if (!c) return false;
    const fl = c.fecha_acordada_actual || c.fecha_limite;
    if (!fl) return false;
    const s = getState();
    const fechaCorte = (s.meta && s.meta.fecha_corte) || '2026-11-06';
    const noAplica = ['CERRADO_EVIDENCIA', 'ATRASADO', 'SUSPENDIDO_PAUSA', 'OBSERVADO_MADERO', 'DEVUELTO_CORRECCION'];
    if (noAplica.includes(c.estado)) return false;
    return fl < fechaCorte;
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
    const provList = s.proveedores_compromisos || [];

    // Agenda (Módulo 1)
    const priDecisiones = pri.filter(p => p.requiere_decision_direccion && p.estado !== 'CERRADO_EVIDENCIA');
    const priAtrasadas = pri.filter(p => p.estado === 'ATRASADO');
    const priObservadas = pri.filter(p => p.estado === 'OBSERVADO_MADERO' || p.estado === 'DEVUELTO_CORRECCION');
    const priPendInfoMadero = pri.filter(p => p.estado === 'PENDIENTE_INFO_MADERO');
    const priCerradas = pri.filter(p => p.estado === 'CERRADO_EVIDENCIA');

    // Equipo Interno (Módulo 2)
    const capacidadTotalHs = members.reduce((acc, m) => acc + (Number(m.horas_capacidad_semanal) || 0), 0);
    const horasAsignadas = tasks.reduce((acc, t) => acc + (Number(t.horas_estimadas) || 0), 0);
    const ocupacionPct = capacidadTotalHs > 0 ? Math.round((horasAsignadas / capacidadTotalHs) * 100) : 0;

    const tareasAbsorbidas = tasks.filter(t => t.es_trabajo_absorbido);
    const horasAbsorbidasTareas = tareasAbsorbidas.reduce((acc, t) => acc + (Number(t.horas_estimadas) || 0), 0);

    const tareasBloqueadas = tasks.filter(t => t.bloqueo && t.bloqueo.trim() !== '' && t.estado !== 'CERRADO_EVIDENCIA');
    const tareasCalidadObs = tasks.filter(t => t.calidad_estado === 'OBSERVADO');
    const backupsDocumentados = members.filter(m => m.estado_continuidad === 'DOCUMENTADO').length;

    // Proveedores (Módulo 9 - Paso 2)
    const provAtrasados = provList.filter(c => c.estado === 'ATRASADO');
    const provObservados = provList.filter(c => c.estado === 'OBSERVADO_MADERO' || c.estado === 'DEVUELTO_CORRECCION');
    const provDesviosAbiertos = provAtrasados.length + provObservados.length;
    const provPendMinuta = provList.filter(isPendienteMinuta);
    const provEscalados = provList.filter(c => c.escalar_a_direccion && c.estado !== 'CERRADO_EVIDENCIA');
    const provCerrados = provList.filter(c => c.estado === 'CERRADO_EVIDENCIA');
    const provVencidosSinActualizar = provList.filter(isVencidoSinActualizar);

    // Trabajo absorbido manual en proveedores sin tarea interna vinculada (evita doble conteo)
    const provManualesSinVincular = provList.filter(c => {
      const val = c.horas_absorbidas !== undefined ? c.horas_absorbidas : c.horas_absorbidas_estimadas;
      return (Number(val) || 0) > 0 &&
        (!Array.isArray(c.tareas_vinculadas) || c.tareas_vinculadas.length === 0);
    });
    const provHorasAbsorbidasManuales = provManualesSinVincular.reduce((acc, c) => {
      const val = c.horas_absorbidas !== undefined ? c.horas_absorbidas : c.horas_absorbidas_estimadas;
      return acc + (Number(val) || 0);
    }, 0);
    const horasAbsorbidasConsolidadas = horasAbsorbidasTareas + provHorasAbsorbidasManuales;

    // Decisiones Dirección Consolidadas (Prioridades Agenda + Compromisos Proveedor Escalados)
    const decisionesConsolidadas = [
      ...priDecisiones.map(p => ({ tipo: 'PRIORIDAD', id: p.id, titulo: p.titulo || p.objetivo, autor: p.responsable, urgencia: p.urgencia || 'ALTA', data: p })),
      ...provEscalados.map(c => ({
        tipo: 'PROVEEDOR',
        id: c.id,
        titulo: c.titulo_compromiso || c.frente_alcance || c.pedido_detalle,
        autor: c.actor_id || c.proveedor_id || c.proveedor,
        urgencia: 'ALTA',
        data: c
      }))
    ];

    // Métricas por Proveedor
    const catalogoProv = (window.MaderoData && window.MaderoData.PROVEEDORES) || {};
    const porProveedor = {};
    Object.keys(catalogoProv).forEach(provKey => {
      const items = provList.filter(c => (c.actor_id || c.proveedor_id) === provKey);
      const total = items.length;
      const cerrados = items.filter(c => c.estado === 'CERRADO_EVIDENCIA').length;
      const atrasados = items.filter(c => c.estado === 'ATRASADO').length;
      const observados = items.filter(c => c.estado === 'OBSERVADO_MADERO' || c.estado === 'DEVUELTO_CORRECCION').length;
      const reprogramados = items.filter(c =>
        (c.reprogramaciones_count || 0) > 0 ||
        (Array.isArray(c.historial_reprogramaciones) && c.historial_reprogramaciones.length > 0) ||
        c.estado === 'REPROGRAMADO'
      ).length;
      const pendMinuta = items.filter(isPendienteMinuta).length;
      const horasAbs = items.reduce((acc, c) => acc + getHorasAbsorbidasCompromiso(c), 0);
      const cumplimientoPct = total > 0 ? Math.round((cerrados / total) * 100) : 0;

      porProveedor[provKey] = {
        total,
        cerrados,
        atrasados,
        observados,
        reprogramados,
        pendMinuta,
        horasAbs,
        cumplimientoPct
      };
    });

    const frentesRojo = gob.filter(g => g.semaforo === 'ROJO').length;
    const frentesAmbar = gob.filter(g => g.semaforo === 'AMBAR').length;
    const frentesVerde = gob.filter(g => g.semaforo === 'VERDE').length;

    return {
      // Agenda
      totalPrioridades: pri.length,
      decisionesDireccionCount: priDecisiones.length,
      decisionesDireccion: priDecisiones,
      priAtrasadasCount: priAtrasadas.length,
      priObservadasCount: priObservadas.length,
      priDesviosCount: priAtrasadas.length + priObservadas.length,
      priPendInfoMaderoCount: priPendInfoMadero.length,
      priCerradasCount: priCerradas.length,

      // Equipo Interno
      capacidadTotalHs,
      horasAsignadas,
      ocupacionPct,
      tareasTotales: tasks.length,
      tareasAbsorbidasCount: tareasAbsorbidas.length,
      horasAbsorbidas: horasAbsorbidasTareas,
      tareasBloqueadasCount: tareasBloqueadas.length,
      tareasCalidadObsCount: tareasCalidadObs.length,
      backupsDocumentados,
      totalMiembros: members.length,

      // Proveedores (Módulo 9)
      provTotal: provList.length,
      provAtrasadosCount: provAtrasados.length,
      provObservadosCount: provObservados.length,
      provDesviosCount: provDesviosAbiertos,
      provPendMinutaCount: provPendMinuta.length,
      provEscaladosCount: provEscalados.length,
      provCerradosCount: provCerrados.length,
      provVencidosSinActualizarCount: provVencidosSinActualizar.length,
      provHorasAbsorbidasManuales,
      porProveedor,

      // Métricas Consolidadas Transversales
      horasAbsorbidasConsolidadas,
      decisionesConsolidadas,
      decisionesTotalCount: decisionesConsolidadas.length,

      // Gobernanza
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

  // Módulo 9: Auditoría y Seguimiento de Proveedores (Paso 2)
  function upsertCompromiso(payload) {
    const list = getState().proveedores_compromisos;
    if (payload.id) {
      const idx = list.findIndex(c => c.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload);
        persist(true);
        return list[idx];
      }
    }
    const nuevo = Object.assign({
      historial_reprogramaciones: [],
      reprogramaciones_count: 0,
      tareas_vinculadas: [],
      pasos_formalizacion_cumplidos: []
    }, payload, {
      id: nextId('PRV', list)
    });
    list.unshift(nuevo);
    persist(true);
    return nuevo;
  }

  function deleteCompromiso(id) {
    const s = getState();
    s.proveedores_compromisos = s.proveedores_compromisos.filter(c => c.id !== id);
    persist(true);
  }

  function setCompromisoEstado(id, nuevoEstado) {
    const item = getState().proveedores_compromisos.find(c => c.id === id);
    if (item) {
      item.estado = nuevoEstado;
      persist(true);
    }
  }

  function reprogramarCompromiso(id, fechaNueva, motivo, autor) {
    const item = getState().proveedores_compromisos.find(c => c.id === id);
    if (item) {
      const fechaAnterior = item.fecha_acordada_actual || item.fecha_limite;
      if (!Array.isArray(item.historial_reprogramaciones)) {
        item.historial_reprogramaciones = [];
      }
      item.historial_reprogramaciones.push({
        fecha_anterior: fechaAnterior,
        fecha_nueva: fechaNueva,
        motivo: motivo || 'Reprogramación solicitada',
        fecha_registro: new Date().toISOString().slice(0, 10),
        registrado: new Date().toISOString().slice(0, 10),
        autor: autor || 'Ángelo Lucero'
      });
      item.fecha_acordada_actual = fechaNueva;
      item.fecha_limite = fechaNueva;
      item.reprogramaciones_count = item.historial_reprogramaciones.length;
      item.estado = 'REPROGRAMADO';
      persist(true);
      return item;
    }
    return null;
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
    // Módulo 9 (Paso 2)
    upsertCompromiso,
    deleteCompromiso,
    setCompromisoEstado,
    reprogramarCompromiso,
    getHorasAbsorbidasCompromiso,
    isPendienteMinuta,
    isVencidoSinActualizar,
    exportCSV,
    exportJSONBackup,
    importJSONBackup,
    resetToBaseline
  };
})();

