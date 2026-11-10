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


    // Fotografías y Digitalización (Módulo 3 - Paso 3)
    const fotosUnidades = s.fotografia_unidades || [];
    const fotosMeta = s.fotografia_semanal_meta || {};
    const fotosEvolucion = fotosMeta.evolucion || {};
    const universoControladoTotal = fotosMeta.universo_controlado_total || 163;
    const conFotoLucyTotal = fotosMeta.con_foto_lucy_total || 97;
    const sinFotoLucyTotal = fotosMeta.sin_foto_lucy_total || 66;
    const coberturaGeneralLucyPct = universoControladoTotal > 0
      ? Math.round((conFotoLucyTotal / universoControladoTotal) * 1000) / 10
      : 0;

    const fotosListosParaFotografiar = fotosUnidades.filter(u => u.estado_proceso === 'LISTO_PARA_FOTOGRAFIAR');
    const fotosPendientesCoordinacion = fotosUnidades.filter(u =>
      u.estado_proceso === 'PENDIENTE_COORDINACION' ||
      (Number(u.cantidad_fotos_actual) === 0 && u.estado_proceso !== 'AL_DIA' && u.estado_proceso !== 'LISTO_PARA_FOTOGRAFIAR')
    );
    const fotosPendientesCarga = fotosUnidades.filter(u =>
      Number(u.cantidad_fotos_actual) > 0 &&
      (!u.cargado_drive || !u.cargado_lucy || !u.cargado_web || !u.cargado_redes)
    );
    const fotosCoberturaIncompleta = fotosUnidades.filter(u =>
      Number(u.cantidad_fotos_actual) > 0 &&
      Number(u.cantidad_fotos_actual) < (Number(u.estandar_fotos_minimo) || 8)
    );
    const fotosCalidadObservada = fotosUnidades.filter(u =>
      u.calidad_estado === 'OBSERVADA' || u.estado_proceso === 'CALIDAD_OBSERVADA'
    );
    const fotosInconsistenciasCanales = fotosUnidades.filter(u => Boolean(u.inconsistencia_detectada));
    const fotosAlDia = fotosUnidades.filter(u =>
      u.estado_proceso === 'AL_DIA' &&
      !u.inconsistencia_detectada &&
      u.cargado_drive && u.cargado_lucy && u.cargado_web && u.cargado_redes &&
      Number(u.cantidad_fotos_actual) >= (Number(u.estandar_fotos_minimo) || 8)
    );

    // Desglose por sucursales
    const catalogoSucursales = (window.MaderoData && window.MaderoData.SUCURSALES_MADERO) || [];
    const desgloseSucursales = catalogoSucursales.map(suc => {
      const enMuestra = fotosUnidades.filter(u => {
        if (suc.es_taller) return u.es_taller || (u.sucursal && (u.sucursal.toLowerCase().includes('taller') || u.sucursal === 'Talleres Externos / Movimiento'));
        return u.sucursal === suc.nombre;
      });
      const conFotoMuestra = enMuestra.filter(u => Number(u.cantidad_fotos_actual) >= (Number(u.estandar_fotos_minimo) || 8) && u.cargado_lucy).length;
      const sinFotoMuestra = enMuestra.length - conFotoMuestra;
      const pctOficial = suc.total_stock > 0 ? Math.round((suc.con_foto / suc.total_stock) * 100) : 0;
      return {
        ...suc,
        muestra_total: enMuestra.length,
        muestra_con_foto: conFotoMuestra,
        muestra_sin_foto: sinFotoMuestra,
        pct_oficial: pctOficial
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


      // Módulo 3: Fotografías y Digitalización (Sección 6)
      fotosUnidadesTotales: fotosUnidades.length,
      universoControladoTotal,
      conFotoLucyTotal,
      sinFotoLucyTotal,
      coberturaGeneralLucyPct,
      fotosListosParaFotografiarCount: fotosListosParaFotografiar.length,
      fotosListosParaFotografiar,
      fotosPendientesCoordinacionCount: fotosPendientesCoordinacion.length,
      fotosPendientesCoordinacion,
      fotosPendientesCargaCount: fotosPendientesCarga.length,
      fotosPendientesCarga,
      fotosCoberturaIncompletaCount: fotosCoberturaIncompleta.length,
      fotosCoberturaIncompleta,
      fotosCalidadObservadaCount: fotosCalidadObservada.length,
      fotosCalidadObservada,
      fotosInconsistenciasCanalesCount: fotosInconsistenciasCanales.length,
      fotosInconsistenciasCanales,
      fotosAlDiaCount: fotosAlDia.length,
      desgloseSucursales,
      fotosEvolucion,
      fotosMeta,
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
  // MÓDULO 3: FOTOGRAFÍAS, DIGITALIZACIÓN Y SINCRONIZACIÓN (Paso 3)
  // ------------------------------------------------------------------------
  function upsertFotografiaUnidad(unidad) {
    const list = getState().fotografia_unidades;
    if (!unidad.id) {
      unidad.id = nextId('FOT', list);
    }
    // Auto-detección inteligente del estado si no viene forzado
    if (!unidad.estado_proceso) {
      if (unidad.inconsistencia_detectada) {
        unidad.estado_proceso = 'AL_DIA'; // o inconsistencia
      } else if (unidad.calidad_estado === 'OBSERVADA') {
        unidad.estado_proceso = 'CALIDAD_OBSERVADA';
      } else if (Number(unidad.cantidad_fotos_actual) === 0) {
        unidad.estado_proceso = unidad.causa_demora ? 'PENDIENTE_COORDINACION' : 'LISTO_PARA_FOTOGRAFIAR';
      } else if (Number(unidad.cantidad_fotos_actual) < (Number(unidad.estandar_fotos_minimo) || 8)) {
        unidad.estado_proceso = 'COBERTURA_INCOMPLETA';
      } else if (!unidad.cargado_drive || !unidad.cargado_lucy || !unidad.cargado_web || !unidad.cargado_redes) {
        unidad.estado_proceso = 'FOTOGRAFIADO_PENDIENTE_CARGA';
      } else {
        unidad.estado_proceso = 'AL_DIA';
      }
    }
    const idx = list.findIndex(u => u.id === unidad.id);
    if (idx !== -1) {
      list[idx] = Object.assign({}, list[idx], unidad);
    } else {
      list.unshift(unidad);
    }
    persist(true);
    return unidad;
  }

  function deleteFotografiaUnidad(id) {
    const list = getState().fotografia_unidades;
    const idx = list.findIndex(u => u.id === id);
    if (idx !== -1) {
      list.splice(idx, 1);
      persist(true);
      return true;
    }
    return false;
  }

  function toggleFotografiaCanal(id, canal) {
    const list = getState().fotografia_unidades;
    const item = list.find(u => u.id === id);
    if (item) {
      const key = 'cargado_' + canal.toLowerCase();
      if (key in item) {
        item[key] = !item[key];
        // Recalcular estado de carga
        if (Number(item.cantidad_fotos_actual) >= (Number(item.estandar_fotos_minimo) || 8)) {
          if (item.cargado_drive && item.cargado_lucy && item.cargado_web && item.cargado_redes) {
            if (item.calidad_estado !== 'OBSERVADA') {
              item.estado_proceso = 'AL_DIA';
            }
          } else {
            item.estado_proceso = 'FOTOGRAFIADO_PENDIENTE_CARGA';
          }
        }
        persist(true);
        return item;
      }
    }
    return null;
  }

  function updateFotografiaMeta(patch) {
    const meta = getState().fotografia_semanal_meta;
    if (meta) {
      Object.assign(meta, patch);
      persist(true);
      return meta;
    }
    return null;
  }

  function importarLucySnapshot(items) {
    if (!Array.isArray(items) || items.length === 0) return 0;
    const list = getState().fotografia_unidades;
    let importados = 0;
    items.forEach(raw => {
      if (!raw.patente) return;
      const normPat = raw.patente.toUpperCase().trim();
      const existing = list.find(u => u.patente.toUpperCase().trim() === normPat);
      if (existing) {
        Object.assign(existing, {
          marca_modelo: raw.marca_modelo || existing.marca_modelo,
          anio: raw.anio || existing.anio,
          color: raw.color || existing.color,
          km: raw.km !== undefined ? raw.km : existing.km,
          precio_revista: raw.precio_revista || existing.precio_revista,
          sucursal: raw.sucursal || existing.sucursal,
          es_taller: raw.es_taller !== undefined ? raw.es_taller : existing.es_taller,
          cantidad_fotos_actual: raw.cantidad_fotos_actual !== undefined ? raw.cantidad_fotos_actual : existing.cantidad_fotos_actual,
          cargado_lucy: raw.cargado_lucy !== undefined ? raw.cargado_lucy : existing.cargado_lucy
        });
      } else {
        const newUnit = {
          id: nextId('FOT', list),
          patente: normPat,
          marca_modelo: raw.marca_modelo || 'Vehículo importado Lucy',
          anio: Number(raw.anio) || 2022,
          color: raw.color || 'Consultar',
          km: Number(raw.km) || 0,
          precio_revista: Number(raw.precio_revista) || 0,
          sucursal: raw.sucursal || 'Sin asignar / Salón no especificado',
          es_taller: Boolean(raw.es_taller),
          dias_en_stock: Number(raw.dias_en_stock) || 1,
          estado_proceso: Number(raw.cantidad_fotos_actual || 0) > 0 ? 'FOTOGRAFIADO_PENDIENTE_CARGA' : 'LISTO_PARA_FOTOGRAFIAR',
          causa_demora: raw.causa_demora || '',
          proxima_accion: raw.proxima_accion || 'Auditar sesión fotográfica en salón.',
          cargado_drive: Boolean(raw.cargado_drive),
          cargado_lucy: Boolean(raw.cargado_lucy),
          cargado_web: Boolean(raw.cargado_web),
          cargado_redes: Boolean(raw.cargado_redes),
          cantidad_fotos_actual: Number(raw.cantidad_fotos_actual) || 0,
          estandar_fotos_minimo: 8,
          fotos_faltantes_detalle: raw.fotos_faltantes_detalle || '',
          calidad_estado: raw.calidad_estado || 'PENDIENTE_REVISION',
          motivo_calidad: raw.motivo_calidad || '',
          origen_observacion: raw.origen_observacion || 'Sin observación',
          responsable_correccion: raw.responsable_correccion || '',
          fecha_nueva_revision: raw.fecha_nueva_revision || '',
          inconsistencia_detectada: Boolean(raw.inconsistencia_detectada),
          detalle_inconsistencia: raw.detalle_inconsistencia || '',
          canales_inconsistentes: Array.isArray(raw.canales_inconsistentes) ? raw.canales_inconsistentes : [],
          fecha_ultima_sesion: raw.fecha_ultima_sesion || '',
          drive_folder_url: raw.drive_folder_url || '',
          lucy_url: raw.lucy_url || ('https://madero.lucydms.com/stock/' + normPat.replace(/-/g, '')),
          web_url: raw.web_url || '',
          notas: raw.notas || 'Importado desde Lucy DMS.'
        };
        list.push(newUnit);
      }
      importados++;
    });
    persist(true);
    return importados;
  }

  function exportFotografiaCSV() {
    const list = getState().fotografia_unidades || [];
    const headers = [
      'ID',
      'Patente',
      'Marca y Modelo',
      'Año',
      'Color',
      'Km',
      'Precio Revista',
      'Sucursal / Ubicación',
      'Es Taller',
      'Días en Stock',
      'Estado Proceso',
      'Causa Demora',
      'Próxima Acción',
      'Drive',
      'Lucy DMS',
      'Web Oficial',
      'Redes',
      'Fotos Actuales',
      'Estándar Mínimo',
      'Fotos Faltantes',
      'Calidad Estado',
      'Motivo Calidad',
      'Origen Observación',
      'Responsable Corrección',
      'Fecha Nueva Revisión',
      'Inconsistencia Detectada',
      'Detalle Inconsistencia',
      'Fecha Última Sesión',
      'Notas'
    ];
    const rows = list.map(u => [
      u.id,
      u.patente,
      u.marca_modelo,
      u.anio,
      u.color,
      u.km,
      u.precio_revista,
      u.sucursal,
      u.es_taller ? 'SÍ' : 'NO',
      u.dias_en_stock,
      u.estado_proceso,
      u.causa_demora,
      u.proxima_accion,
      u.cargado_drive ? 'SÍ' : 'NO',
      u.cargado_lucy ? 'SÍ' : 'NO',
      u.cargado_web ? 'SÍ' : 'NO',
      u.cargado_redes ? 'SÍ' : 'NO',
      u.cantidad_fotos_actual,
      u.estandar_fotos_minimo,
      u.fotos_faltantes_detalle,
      u.calidad_estado,
      u.motivo_calidad,
      u.origen_observacion,
      u.responsable_correccion,
      u.fecha_nueva_revision,
      u.inconsistencia_detectada ? 'SÍ' : 'NO',
      u.detalle_inconsistencia,
      u.fecha_ultima_sesion,
      u.notas
    ]);
    const dateStr = (getState().meta.fecha_corte || 'reporte').replace(/[^0-9-]/g, '');
    exportCSV(`madero_reporte_fotografia_secc6_${dateStr}.csv`, headers, rows);
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
    // Módulo 3 (Paso 3)
    upsertFotografiaUnidad,
    deleteFotografiaUnidad,
    toggleFotografiaCanal,
    updateFotografiaMeta,
    importarLucySnapshot,
    exportFotografiaCSV,
    exportCSV,
    exportJSONBackup,
    importJSONBackup,
    resetToBaseline
  };
})();

