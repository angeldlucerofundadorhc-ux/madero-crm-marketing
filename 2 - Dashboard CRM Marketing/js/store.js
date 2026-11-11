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
        if (!Array.isArray(merged[key]) || (merged[key].length === 0 && base[key].length > 0 && loaded.schema_version !== base.schema_version)) {
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

    // Sincronizar banderas de módulos activos en gobernanza si corresponde
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

    // Paso 4 · Módulo 4: Contenido y Piezas Audiovisuales
    const contList = s.contenido_piezas || [];
    const contPlanificados = contList.filter(p => p.etapa_contenido === 'PLANIFICADO');
    const contProducidos = contList.filter(p => p.etapa_contenido === 'PRODUCIDO');
    const contEnviados = contList.filter(p => p.etapa_contenido === 'ENVIADO');
    const contObservados = contList.filter(p => p.etapa_contenido === 'OBSERVADO' || p.estado === 'OBSERVADO_MADERO');
    const contAprobados = contList.filter(p => p.etapa_contenido === 'APROBADO');
    const contPublicados = contList.filter(p => p.etapa_contenido === 'PUBLICADO');
    const contAtrasados = contList.filter(p => p.estado === 'ATRASADO');
    const contAbsorbidos = contList.filter(p => Boolean(p.trabajo_absorbido));
    const contRem = contList.filter(p => p.actor_id === 'REM');
    const contInterno = contList.filter(p => p.actor_id === 'MKT_INTERNO');

    // Paso 4 · Módulo 5: Redes Sociales Multicanal (IG, FB, TikTok, YouTube)
    const redesList = s.redes_sociales || [];
    const redesFrecPlanTotal = redesList.reduce((acc, r) => acc + (Number(r.frecuencia_plan_semanal) || 0), 0);
    const redesFrecRealTotal = redesList.reduce((acc, r) => acc + (Number(r.frecuencia_real_semanal) || 0), 0);
    const redesCumplimientoFrecPct = redesFrecPlanTotal > 0 ? Math.round((redesFrecRealTotal / redesFrecPlanTotal) * 100) : 0;
    const redesSeguidoresTotal = redesList.reduce((acc, r) => acc + (Number(r.seguidores_actual) || 0), 0);
    const redesAlcanceTotal = redesList.reduce((acc, r) => acc + (Number(r.alcance_periodo) || 0), 0);
    const redesInteraccionesTotal = redesList.reduce((acc, r) => acc + (Number(r.interacciones) || 0), 0);
    const redesBajoMetaCount = redesList.filter(r => (Number(r.frecuencia_real_semanal) || 0) < (Number(r.frecuencia_plan_semanal) || 0)).length;

    // Paso 4 · Módulo 6: Campañas Pagas y Pauta Digital
    const campList = s.campanas_pagas || [];
    const campPresupuestoAsignadoTotal = campList.reduce((acc, c) => acc + (Number(c.presupuesto_asignado) || 0), 0);
    const campPresupuestoEjecutadoTotal = campList.reduce((acc, c) => acc + (Number(c.presupuesto_ejecutado) || 0), 0);
    const campEjecucionPct = campPresupuestoAsignadoTotal > 0
      ? Math.round((campPresupuestoEjecutadoTotal / campPresupuestoAsignadoTotal) * 100)
      : 0;
    const campLeadsTotal = campList.reduce((acc, c) => acc + (Number(c.leads_generados) || 0), 0);
    const campCplPromedio = campLeadsTotal > 0 ? Math.round(campPresupuestoEjecutadoTotal / campLeadsTotal) : 0;
    const campCalidadAltaCount = campList.filter(c => c.calidad_lead_estado === 'ALTA').length;
    const campCalidadMediaCount = campList.filter(c => c.calidad_lead_estado === 'MEDIA').length;
    const campCalidadBajaCount = campList.filter(c => c.calidad_lead_estado === 'BAJA_OBSERVADA').length;
    const campObservadasCount = campList.filter(c => c.validacion_madero === 'OBSERVADA' || c.validacion_madero === 'PAUSADA_POR_MADERO' || c.estado === 'OBSERVADO_MADERO' || c.estado === 'ATRASADO').length;

    // Paso 5 · Módulo 7: Ecosistema Google
    const googleList = s.google_activos || [];
    const googlePropiedadOkCount = googleList.filter(g => g.propiedad_madero === 'PROPIETARIO_MADERO').length;
    const googleAccesoParcialCount = googleList.filter(g => g.propiedad_madero === 'ACCESO_PARCIAL').length;
    const googlePendTransferenciaCount = googleList.filter(g => g.propiedad_madero === 'PENDIENTE_TRANSFERENCIA').length;
    const googleAccesosPendientesCount = googleAccesoParcialCount + googlePendTransferenciaCount;

    // Paso 5 · Módulo 8: Plataforma Web y Staging
    const webList = s.web_cambios || [];
    const webEnStagingCount = webList.filter(w => w.etapa_web === 'EN_PRUEBA_STAGING').length;
    const webObservadosCount = webList.filter(w => w.etapa_web === 'OBSERVADO_QA' || w.estado === 'OBSERVADO_MADERO').length;
    const webValidadosCount = webList.filter(w => w.etapa_web === 'VALIDADO_PRODUCCION').length;
    const webEnDesarrolloCount = webList.filter(w => w.etapa_web === 'EN_DESARROLLO' || w.etapa_web === 'SOLICITADO').length;

    // Paso 5 · Módulo 10: Eventos y Presencia Regional
    const eventosList = s.eventos_regionales || [];
    const eventosPresupEstimadoTotal = eventosList.reduce((acc, e) => acc + (Number(e.presupuesto_estimado) || 0), 0);
    const eventosPresupRealTotal = eventosList.reduce((acc, e) => acc + (Number(e.presupuesto_real) || 0), 0);
    const eventosCerradosCount = eventosList.filter(e => e.estado === 'CERRADO_EVIDENCIA').length;
    const eventosProximosCount = eventosList.length - eventosCerradosCount;

    // Paso 5 · Módulo 11: Merchandising e Inventario POP
    const merchList = s.merchandising_stock || [];
    const merchValorTotal = merchList.reduce((acc, m) => acc + ((Number(m.stock_actual) || 0) * (Number(m.costo_unitario) || 0)), 0);
    const merchBajoMinimo = merchList.filter(m => (Number(m.stock_actual) || 0) <= (Number(m.stock_minimo_reposicion) || 0));
    const merchCostoReposicionEstimado = merchBajoMinimo.reduce((acc, m) => {
      const faltante = Math.max(10, ((Number(m.stock_minimo_reposicion) || 10) * 2) - (Number(m.stock_actual) || 0));
      return acc + (faltante * (Number(m.costo_unitario) || 0));
    }, 0);

    // Paso 5 · Módulo 12: Relación con Ventas y Stock Prioritario
    const ventasList = s.ventas_feedback || [];
    const ventasAbiertos = ventasList.filter(v => !v.cierre_verificado && v.estado !== 'CERRADO_EVIDENCIA');
    const ventasStockPrioritarioCount = ventasList.filter(v => v.tipo === 'STOCK_PRIORITARIO').length;
    const ventasCalidadLeadsCount = ventasList.filter(v => v.tipo === 'CALIDAD_LEADS').length;
    const ventasDesviosPubCount = ventasList.filter(v => v.tipo === 'PROBLEMA_PUBLICACION').length;

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

      // Módulo 4: Contenido y Piezas (Paso 4)
      contTotal: contList.length,
      contPlanificadosCount: contPlanificados.length,
      contProducidosCount: contProducidos.length,
      contEnviadosCount: contEnviados.length,
      contObservadosCount: contObservados.length,
      contAprobadosCount: contAprobados.length,
      contPublicadosCount: contPublicados.length,
      contAtrasadosCount: contAtrasados.length,
      contAbsorbidosCount: contAbsorbidos.length,
      contRemCount: contRem.length,
      contInternoCount: contInterno.length,

      // Módulo 5: Redes Sociales (Paso 4)
      redesTotalCanales: redesList.length,
      redesFrecPlanTotal,
      redesFrecRealTotal,
      redesCumplimientoFrecPct,
      redesSeguidoresTotal,
      redesAlcanceTotal,
      redesInteraccionesTotal,
      redesBajoMetaCount,

      // Módulo 6: Campañas Pagas (Paso 4)
      campTotal: campList.length,
      campPresupuestoAsignadoTotal,
      campPresupuestoEjecutadoTotal,
      campEjecucionPct,
      campLeadsTotal,
      campCplPromedio,
      campCalidadAltaCount,
      campCalidadMediaCount,
      campCalidadBajaCount,
      campObservadasCount,

      // Módulo 7: Ecosistema Google (Paso 5)
      googleTotal: googleList.length,
      googlePropiedadOkCount,
      googleAccesoParcialCount,
      googlePendTransferenciaCount,
      googleAccesosPendientesCount,

      // Módulo 8: Plataforma Web (Paso 5)
      webTotal: webList.length,
      webEnStagingCount,
      webObservadosCount,
      webValidadosCount,
      webEnDesarrolloCount,

      // Módulo 10: Eventos Regionales (Paso 5)
      eventosTotal: eventosList.length,
      eventosPresupEstimadoTotal,
      eventosPresupRealTotal,
      eventosCerradosCount,
      eventosProximosCount,

      // Módulo 11: Merchandising (Paso 5)
      merchTotalItems: merchList.length,
      merchValorTotal,
      merchBajoMinimoCount: merchBajoMinimo.length,
      merchBajoMinimo,
      merchCostoReposicionEstimado,

      // Módulo 12: Relación con Ventas (Paso 5)
      ventasTotal: ventasList.length,
      ventasAbiertosCount: ventasAbiertos.length,
      ventasStockPrioritarioCount,
      ventasCalidadLeadsCount,
      ventasDesviosPubCount,

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
  // PASO 4 · MÓDULOS 4, 5 Y 6: CONTENIDO, REDES SOCIALES Y CAMPAÑAS PAGAS
  // ------------------------------------------------------------------------

  // Módulo 4: Contenido y Piezas Audiovisuales
  function upsertContenidoPieza(payload) {
    const s = getState();
    if (!Array.isArray(s.contenido_piezas)) s.contenido_piezas = [];
    const list = s.contenido_piezas;

    if (payload.id) {
      const idx = list.findIndex(item => item.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload);
        persist(true);
        return list[idx];
      }
    }

    const nuevo = Object.assign(
      {
        id: nextId('CNT', list),
        titulo: '',
        formato: 'Reel / Short Vertical',
        canal_destino: 'Instagram / TikTok',
        plaza: 'Todas las plazas (Transversal)',
        actor_id: 'REM',
        responsable_nombre: 'REM (Agencia Externa)',
        etapa_contenido: 'PLANIFICADO',
        estado: 'PENDIENTE_INICIO',
        fecha_acordada: s.meta.fecha_corte || '2026-11-06',
        fecha_publicacion_real: '',
        observacion_madero: '',
        enlace_pieza: '',
        resultado_metricas: '',
        trabajo_absorbido: false,
        trabajo_absorbido_detalle: ''
      },
      payload,
      { id: payload.id || nextId('CNT', list) }
    );

    list.unshift(nuevo);
    persist(true);
    return nuevo;
  }

  function deleteContenidoPieza(id) {
    const s = getState();
    s.contenido_piezas = (s.contenido_piezas || []).filter(item => item.id !== id);
    persist(true);
  }

  function setContenidoEtapa(id, nuevaEtapa) {
    const item = (getState().contenido_piezas || []).find(i => i.id === id);
    if (!item) return;
    item.etapa_contenido = nuevaEtapa;
    // Sincronizar estado sugerido si pasa a OBSERVADO o PUBLICADO
    if (nuevaEtapa === 'OBSERVADO') item.estado = 'OBSERVADO_MADERO';
    else if (nuevaEtapa === 'ENVIADO') item.estado = 'ENTREGADO_REVISION';
    else if (nuevaEtapa === 'PRODUCIDO') item.estado = 'EN_ELABORACION';
    else if (nuevaEtapa === 'PUBLICADO') {
      item.estado = 'CERRADO_EVIDENCIA';
      if (!item.fecha_publicacion_real) item.fecha_publicacion_real = getState().meta.fecha_corte || '2026-11-06';
    }
    persist(true);
  }

  function setContenidoEstado(id, nuevoEstado) {
    const item = (getState().contenido_piezas || []).find(i => i.id === id);
    if (item) {
      item.estado = nuevoEstado;
      persist(true);
    }
  }

  function exportContenidoCSV(filteredList) {
    const list = Array.isArray(filteredList) ? filteredList : (getState().contenido_piezas || []);
    const headers = [
      'ID',
      'Título / Pieza',
      'Formato',
      'Canal Destino',
      'Plaza Territorial',
      'Actor Responsable',
      'Detalle Responsable',
      'Etapa Flujo Editorial',
      'Estado Oficial (Secc. 7)',
      'Fecha Acordada',
      'Fecha Publicación Real',
      'Observación / Criterio de Madero',
      'Trabajo Absorbido',
      'Detalle Trabajo Absorbido',
      'Enlace Pieza / Drive',
      'Resultado y Desempeño'
    ];
    const rows = list.map(p => [
      p.id,
      p.titulo,
      p.formato,
      p.canal_destino,
      p.plaza,
      p.actor_id,
      p.responsable_nombre,
      p.etapa_contenido,
      p.estado,
      p.fecha_acordada,
      p.fecha_publicacion_real,
      p.observacion_madero,
      p.trabajo_absorbido ? 'SÍ' : 'NO',
      p.trabajo_absorbido_detalle || '',
      p.enlace_pieza,
      p.resultado_metricas
    ]);
    const dateStr = (getState().meta.fecha_corte || 'reporte').replace(/[^0-9-]/g, '');
    exportCSV(`madero_modulo4_contenido_${dateStr}.csv`, headers, rows);
  }

  // Módulo 5: Redes Sociales Multicanal
  function upsertRedSocial(payload) {
    const s = getState();
    if (!Array.isArray(s.redes_sociales)) s.redes_sociales = [];
    const list = s.redes_sociales;

    if (payload.id) {
      const idx = list.findIndex(item => item.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload);
        if (payload.desglose_plazas) {
          list[idx].desglose_plazas = Object.assign({}, list[idx].desglose_plazas || {}, payload.desglose_plazas);
        }
        persist(true);
        return list[idx];
      }
    }

    const nuevo = Object.assign(
      {
        id: nextId('RED', list),
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
        tasa_engagement: '0.0%',
        desglose_plazas: {
          comodoro_pct: 50,
          neuquen_pct: 30,
          cordillera_pct: 20,
          comodoro_piezas: 0,
          neuquen_piezas: 0,
          cordillera_piezas: 0
        },
        formato_destacado: '',
        observacion_calidad: '',
        conclusion_lider: '',
        proxima_accion: '',
        evidencia_url: ''
      },
      payload,
      { id: payload.id || nextId('RED', list) }
    );

    list.push(nuevo);
    persist(true);
    return nuevo;
  }

  function deleteRedSocial(id) {
    const s = getState();
    s.redes_sociales = (s.redes_sociales || []).filter(item => item.id !== id);
    persist(true);
  }

  function exportRedesCSV() {
    const list = getState().redes_sociales || [];
    const headers = [
      'ID',
      'Canal Oficial',
      'Cuenta / Handle',
      'Actor Dominante',
      'Responsable Gestión',
      'Estado Canal',
      'Frec. Plan Semanal',
      'Frec. Real Semanal',
      'Seguidores Actuales',
      'Variación Audiencia',
      'Alcance Período',
      'Interacciones',
      'Engagement',
      '% Comodoro',
      '% Neuquén',
      '% Cordillera',
      'Formato Destacado',
      'Observación de Calidad Madero',
      'Conclusión del Líder (Ángelo Lucero)',
      'Próxima Acción'
    ];
    const rows = list.map(r => {
      const dp = r.desglose_plazas || {};
      return [
        r.id,
        r.canal,
        r.handle,
        r.actor_id,
        r.responsable_gestion,
        r.estado_canal,
        r.frecuencia_plan_semanal,
        r.frecuencia_real_semanal,
        r.seguidores_actual,
        r.variacion_audiencia,
        r.alcance_periodo,
        r.interacciones,
        r.tasa_engagement,
        (dp.comodoro_pct || 0) + '%',
        (dp.neuquen_pct || 0) + '%',
        (dp.cordillera_pct || 0) + '%',
        r.formato_destacado,
        r.observacion_calidad,
        r.conclusion_lider,
        r.proxima_accion
      ];
    });
    const dateStr = (getState().meta.fecha_corte || 'reporte').replace(/[^0-9-]/g, '');
    exportCSV(`madero_modulo5_redes_sociales_${dateStr}.csv`, headers, rows);
  }

  // Módulo 6: Campañas Pagas y Pauta Digital
  function upsertCampanaPaga(payload) {
    const s = getState();
    if (!Array.isArray(s.campanas_pagas)) s.campanas_pagas = [];
    const list = s.campanas_pagas;

    const presEjec = Number(payload.presupuesto_ejecutado) || 0;
    const leadsGen = Number(payload.leads_generados) || 0;
    const computedCpl = leadsGen > 0 ? Math.round(presEjec / leadsGen) : (Number(payload.cpl) || 0);

    if (payload.id) {
      const idx = list.findIndex(item => item.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload, { cpl: computedCpl });
        persist(true);
        return list[idx];
      }
    }

    const nuevo = Object.assign(
      {
        id: nextId('CMP', list),
        nombre: '',
        plataforma: 'Meta Ads',
        actor_id: 'REM',
        responsable_tecnico: 'REM (Tráfico)',
        validacion_madero: 'APROBADA',
        estado: 'EN_ELABORACION',
        objetivo: '',
        plazas_ubicaciones: 'Todas las plazas (Transversal)',
        presupuesto_asignado: 0,
        presupuesto_ejecutado: 0,
        vigencia_desde: s.meta.fecha_corte || '2026-11-01',
        vigencia_hasta: '2026-11-30',
        creativos_validados_detalle: '',
        creativos_url: '',
        leads_generados: 0,
        cpl: computedCpl,
        calidad_lead_estado: 'MEDIA',
        devolucion_ventas_leads: '',
        recomendacion_lider: '',
        accion_decision: 'MANTENER_OPTIMIZAR'
      },
      payload,
      { id: payload.id || nextId('CMP', list), cpl: computedCpl }
    );

    list.unshift(nuevo);
    persist(true);
    return nuevo;
  }

  function deleteCampanaPaga(id) {
    const s = getState();
    s.campanas_pagas = (s.campanas_pagas || []).filter(item => item.id !== id);
    persist(true);
  }

  function setCampanaEstado(id, nuevoEstado) {
    const item = (getState().campanas_pagas || []).find(i => i.id === id);
    if (item) {
      item.estado = nuevoEstado;
      persist(true);
    }
  }

  function setCampanaCalidadLead(id, nuevaCalidad) {
    const item = (getState().campanas_pagas || []).find(i => i.id === id);
    if (item) {
      item.calidad_lead_estado = nuevaCalidad;
      persist(true);
    }
  }

  function exportCampanasCSV(filteredList) {
    const list = Array.isArray(filteredList) ? filteredList : (getState().campanas_pagas || []);
    const headers = [
      'ID',
      'Nombre de Campaña',
      'Plataforma',
      'Actor Ejecución',
      'Validación Madero',
      'Estado Oficial (Secc. 7)',
      'Objetivo Comercial',
      'Plazas / Ubicaciones',
      'Presupuesto Asignado ($)',
      'Presupuesto Ejecutado ($)',
      'Vigencia Desde',
      'Vigencia Hasta',
      'Creativos Validados',
      'Leads Generados',
      'CPL ($)',
      'Calidad de Lead (Cruce Ventas)',
      'Devolución de Ventas sobre Leads',
      'Decisión / Acción',
      'Recomendación de Ángelo Lucero'
    ];
    const rows = list.map(c => [
      c.id,
      c.nombre,
      c.plataforma,
      c.actor_id,
      c.validacion_madero,
      c.estado,
      c.objetivo,
      c.plazas_ubicaciones,
      c.presupuesto_asignado,
      c.presupuesto_ejecutado,
      c.vigencia_desde,
      c.vigencia_hasta,
      c.creativos_validados_detalle,
      c.leads_generados,
      c.cpl,
      c.calidad_lead_estado,
      c.devolucion_ventas_leads,
      c.accion_decision,
      c.recomendacion_lider
    ]);
    const dateStr = (getState().meta.fecha_corte || 'reporte').replace(/[^0-9-]/g, '');
    exportCSV(`madero_modulo6_campanas_pagas_${dateStr}.csv`, headers, rows);
  }

  // ------------------------------------------------------------------------
  // PASO 5 · MÓDULOS 7, 8, 10, 11 Y 12: GOOGLE, WEB, EVENTOS, MERCH Y VENTAS
  // ------------------------------------------------------------------------

  // Módulo 7: Ecosistema Google
  function upsertGoogleActivo(payload) {
    const s = getState();
    if (!Array.isArray(s.google_activos)) s.google_activos = [];
    const list = s.google_activos;

    if (payload.id) {
      const idx = list.findIndex(item => item.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload);
        persist(true);
        return list[idx];
      }
    }

    const nuevo = Object.assign(
      {
        id: nextId('GGL', list),
        herramienta: 'Business Profile',
        sucursal_cuenta: 'Comodoro · Av. Polonia 546 (Salón Principal)',
        propiedad_madero: 'PROPIETARIO_MADERO',
        acceso_pendiente_detalle: '',
        actor_id: 'MKT_INTERNO',
        responsable_nombre: 'Marketing Interno',
        estado: 'EN_ELABORACION',
        entregable: '',
        evidencia: '',
        observacion: '',
        proximo_paso: ''
      },
      payload,
      { id: payload.id || nextId('GGL', list) }
    );

    list.unshift(nuevo);
    persist(true);
    return nuevo;
  }

  function deleteGoogleActivo(id) {
    const s = getState();
    s.google_activos = (s.google_activos || []).filter(item => item.id !== id);
    persist(true);
  }

  function setGoogleEstado(id, nuevoEstado) {
    const item = (getState().google_activos || []).find(i => i.id === id);
    if (item) {
      item.estado = nuevoEstado;
      persist(true);
    }
  }

  function exportGoogleCSV(filteredList) {
    const list = Array.isArray(filteredList) ? filteredList : (getState().google_activos || []);
    const headers = [
      'ID',
      'Herramienta Google',
      'Sucursal / Cuenta',
      'Propiedad Institucional Madero',
      'Detalle Acceso / Propiedad Pendiente',
      'Actor Responsable',
      'Responsable Operativo',
      'Estado Oficial (Secc. 7)',
      'Entregable / Configuración',
      'Observación de Madero',
      'Próximo Paso',
      'Evidencia URL'
    ];
    const rows = list.map(g => [
      g.id,
      g.herramienta,
      g.sucursal_cuenta,
      g.propiedad_madero,
      g.acceso_pendiente_detalle,
      g.actor_id,
      g.responsable_nombre,
      g.estado,
      g.entregable,
      g.observacion,
      g.proximo_paso,
      g.evidencia
    ]);
    const dateStr = (getState().meta.fecha_corte || 'reporte').replace(/[^0-9-]/g, '');
    exportCSV(`madero_modulo7_google_${dateStr}.csv`, headers, rows);
  }

  // Módulo 8: Plataforma Web y Staging
  function upsertWebCambio(payload) {
    const s = getState();
    if (!Array.isArray(s.web_cambios)) s.web_cambios = [];
    const list = s.web_cambios;

    if (payload.id) {
      const idx = list.findIndex(item => item.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload);
        persist(true);
        return list[idx];
      }
    }

    const nuevo = Object.assign(
      {
        id: nextId('WEB', list),
        cambio_solicitado: '',
        tipo: 'Mejora Funcional',
        actor_id: 'CHRISTIAN_WEB',
        responsable: 'L. Christian (Desarrollo Web)',
        etapa_web: 'SOLICITADO',
        estado: 'PENDIENTE_INICIO',
        url_prueba: '',
        observaciones_madero: '',
        fecha_acordada: s.meta.fecha_corte || '2026-11-10',
        validacion_final: ''
      },
      payload,
      { id: payload.id || nextId('WEB', list) }
    );

    list.unshift(nuevo);
    persist(true);
    return nuevo;
  }

  function deleteWebCambio(id) {
    const s = getState();
    s.web_cambios = (s.web_cambios || []).filter(item => item.id !== id);
    persist(true);
  }

  function setWebEtapa(id, nuevaEtapa) {
    const item = (getState().web_cambios || []).find(i => i.id === id);
    if (!item) return;
    item.etapa_web = nuevaEtapa;
    if (nuevaEtapa === 'EN_DESARROLLO') item.estado = 'EN_ELABORACION';
    else if (nuevaEtapa === 'EN_PRUEBA_STAGING') item.estado = 'ENTREGADO_REVISION';
    else if (nuevaEtapa === 'OBSERVADO_QA') item.estado = 'OBSERVADO_MADERO';
    else if (nuevaEtapa === 'VALIDADO_PRODUCCION') item.estado = 'CERRADO_EVIDENCIA';
    persist(true);
  }

  function setWebEstado(id, nuevoEstado) {
    const item = (getState().web_cambios || []).find(i => i.id === id);
    if (item) {
      item.estado = nuevoEstado;
      persist(true);
    }
  }

  function exportWebCSV(filteredList) {
    const list = Array.isArray(filteredList) ? filteredList : (getState().web_cambios || []);
    const headers = [
      'ID',
      'Cambio / Ticket Solicitado',
      'Tipo',
      'Actor',
      'Responsable Técnico',
      'Etapa Web',
      'Estado Oficial (Secc. 7)',
      'Fecha Acordada',
      'URL Prueba / Staging',
      'Observaciones QA Madero',
      'Validación Final'
    ];
    const rows = list.map(w => [
      w.id,
      w.cambio_solicitado,
      w.tipo,
      w.actor_id,
      w.responsable,
      w.etapa_web,
      w.estado,
      w.fecha_acordada,
      w.url_prueba,
      w.observaciones_madero,
      w.validacion_final
    ]);
    const dateStr = (getState().meta.fecha_corte || 'reporte').replace(/[^0-9-]/g, '');
    exportCSV(`madero_modulo8_web_${dateStr}.csv`, headers, rows);
  }

  // Módulo 10: Eventos y Presencia Regional
  function upsertEventoRegional(payload) {
    const s = getState();
    if (!Array.isArray(s.eventos_regionales)) s.eventos_regionales = [];
    const list = s.eventos_regionales;

    if (payload.id) {
      const idx = list.findIndex(item => item.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload);
        persist(true);
        return list[idx];
      }
    }

    const nuevo = Object.assign(
      {
        id: nextId('EVT', list),
        evento: '',
        ciudad_plaza: 'Comodoro · Av. Polonia 546 (Salón Principal)',
        fecha_inicio: s.meta.fecha_corte || '2026-11-15',
        fecha_fin: s.meta.fecha_corte || '2026-11-16',
        objetivo: '',
        presupuesto_estimado: 0,
        presupuesto_real: 0,
        actor_id: 'MKT_INTERNO',
        responsables: 'Marketing Interno',
        difusion_plan: '',
        estado: 'PENDIENTE_INICIO',
        resultado_medido: '',
        conclusion_lider: '',
        evidencia_url: ''
      },
      payload,
      { id: payload.id || nextId('EVT', list) }
    );

    list.unshift(nuevo);
    persist(true);
    return nuevo;
  }

  function deleteEventoRegional(id) {
    const s = getState();
    s.eventos_regionales = (s.eventos_regionales || []).filter(item => item.id !== id);
    persist(true);
  }

  function setEventoEstado(id, nuevoEstado) {
    const item = (getState().eventos_regionales || []).find(i => i.id === id);
    if (item) {
      item.estado = nuevoEstado;
      persist(true);
    }
  }

  function exportEventosCSV(filteredList) {
    const list = Array.isArray(filteredList) ? filteredList : (getState().eventos_regionales || []);
    const headers = [
      'ID',
      'Evento / Activación Regional',
      'Ciudad / Plaza',
      'Fecha Inicio',
      'Fecha Fin',
      'Objetivo Comercial y de Marca',
      'Presupuesto Estimado ($)',
      'Presupuesto Real ($)',
      'Responsables',
      'Plan de Difusión Previa y Cobertura',
      'Estado Oficial (Secc. 7)',
      'Resultado Medido',
      'Conclusión del Líder'
    ];
    const rows = list.map(e => [
      e.id,
      e.evento,
      e.ciudad_plaza,
      e.fecha_inicio,
      e.fecha_fin,
      e.objetivo,
      e.presupuesto_estimado,
      e.presupuesto_real,
      e.responsables,
      e.difusion_plan,
      e.estado,
      e.resultado_medido,
      e.conclusion_lider
    ]);
    const dateStr = (getState().meta.fecha_corte || 'reporte').replace(/[^0-9-]/g, '');
    exportCSV(`madero_modulo10_eventos_${dateStr}.csv`, headers, rows);
  }

  // Módulo 11: Merchandising e Inventario POP
  function upsertMerchItem(payload) {
    const s = getState();
    if (!Array.isArray(s.merchandising_stock)) s.merchandising_stock = [];
    const list = s.merchandising_stock;

    if (payload.id) {
      const idx = list.findIndex(item => item.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload);
        persist(true);
        return list[idx];
      }
    }

    const nuevo = Object.assign(
      {
        id: nextId('MER', list),
        articulo: '',
        categoria: 'Presentes de Entrega',
        sucursal_ubicacion: 'Comodoro · Av. Polonia 546 (Salón Principal)',
        stock_actual: 0,
        stock_minimo_reposicion: 10,
        costo_unitario: 0,
        destino_principal: '',
        utilizacion_periodo: '',
        necesidad_futura: '',
        responsable_control: 'Marketing Interno'
      },
      payload,
      { id: payload.id || nextId('MER', list) }
    );

    list.unshift(nuevo);
    persist(true);
    return nuevo;
  }

  function deleteMerchItem(id) {
    const s = getState();
    s.merchandising_stock = (s.merchandising_stock || []).filter(item => item.id !== id);
    persist(true);
  }

  function adjustMerchStock(id, delta) {
    const item = (getState().merchandising_stock || []).find(i => i.id === id);
    if (item) {
      item.stock_actual = Math.max(0, (Number(item.stock_actual) || 0) + Number(delta));
      persist(true);
    }
  }

  function exportMerchCSV(filteredList) {
    const list = Array.isArray(filteredList) ? filteredList : (getState().merchandising_stock || []);
    const headers = [
      'ID',
      'Artículo / Material POP',
      'Categoría',
      'Sucursal / Ubicación',
      'Stock Actual',
      'Punto Mínimo Reposición',
      'Estado Stock',
      'Costo Unitario ($)',
      'Valorización Total ($)',
      'Destino Principal',
      'Utilización en el Período',
      'Necesidad Futura / Reposición'
    ];
    const rows = list.map(m => {
      const st = Number(m.stock_actual) || 0;
      const min = Number(m.stock_minimo_reposicion) || 0;
      const unit = Number(m.costo_unitario) || 0;
      return [
        m.id,
        m.articulo,
        m.categoria,
        m.sucursal_ubicacion,
        st,
        min,
        st <= min ? 'REPOSICIÓN URGENTE' : 'OK',
        unit,
        st * unit,
        m.destino_principal,
        m.utilizacion_periodo,
        m.necesidad_futura
      ];
    });
    const dateStr = (getState().meta.fecha_corte || 'reporte').replace(/[^0-9-]/g, '');
    exportCSV(`madero_modulo11_merchandising_${dateStr}.csv`, headers, rows);
  }

  // Módulo 12: Relación con Ventas y Stock Prioritario
  function upsertVentaFeedback(payload) {
    const s = getState();
    if (!Array.isArray(s.ventas_feedback)) s.ventas_feedback = [];
    const list = s.ventas_feedback;

    if (payload.id) {
      const idx = list.findIndex(item => item.id === payload.id);
      if (idx !== -1) {
        list[idx] = Object.assign({}, list[idx], payload);
        persist(true);
        return list[idx];
      }
    }

    const nuevo = Object.assign(
      {
        id: nextId('VTA', list),
        fecha: s.meta.fecha_corte || '2026-11-06',
        sucursal_plaza: 'Comodoro · Av. Polonia 546 (Salón Principal)',
        referente_ventas: '',
        tipo: 'STOCK_PRIORITARIO',
        unidades_involucradas: '',
        descripcion: '',
        accion_marketing: '',
        actor_id: 'MKT_INTERNO',
        responsable: 'Ángelo Lucero',
        estado: 'EN_ELABORACION',
        cierre_verificado: false
      },
      payload,
      { id: payload.id || nextId('VTA', list) }
    );

    list.unshift(nuevo);
    persist(true);
    return nuevo;
  }

  function deleteVentaFeedback(id) {
    const s = getState();
    s.ventas_feedback = (s.ventas_feedback || []).filter(item => item.id !== id);
    persist(true);
  }

  function setVentaEstado(id, nuevoEstado) {
    const item = (getState().ventas_feedback || []).find(i => i.id === id);
    if (item) {
      item.estado = nuevoEstado;
      if (nuevoEstado === 'CERRADO_EVIDENCIA') item.cierre_verificado = true;
      persist(true);
    }
  }

  function toggleVentaCierre(id) {
    const item = (getState().ventas_feedback || []).find(i => i.id === id);
    if (item) {
      item.cierre_verificado = !item.cierre_verificado;
      if (item.cierre_verificado) item.estado = 'CERRADO_EVIDENCIA';
      persist(true);
    }
  }

  function exportVentasCSV(filteredList) {
    const list = Array.isArray(filteredList) ? filteredList : (getState().ventas_feedback || []);
    const headers = [
      'ID',
      'Fecha',
      'Sucursal / Plaza',
      'Referente Comercial / Salón',
      'Tipo de Requerimiento',
      'Unidades / Patentes / Campaña Involucrada',
      'Descripción / Devolución de Ventas',
      'Acción Ejecutada por Marketing',
      'Actor Responsable',
      'Responsable Seguimiento',
      'Estado Oficial (Secc. 7)',
      'Cierre Verificado con Ventas'
    ];
    const rows = list.map(v => [
      v.id,
      v.fecha,
      v.sucursal_plaza,
      v.referente_ventas,
      v.tipo,
      v.unidades_involucradas,
      v.descripcion,
      v.accion_marketing,
      v.actor_id,
      v.responsable,
      v.estado,
      v.cierre_verificado ? 'SÍ' : 'PENDIENTE'
    ]);
    const dateStr = (getState().meta.fecha_corte || 'reporte').replace(/[^0-9-]/g, '');
    exportCSV(`madero_modulo12_relacion_ventas_${dateStr}.csv`, headers, rows);
  }

  // Paso 6: Notas Ejecutivas del Informe Semanal a Dirección (Sección 10)
  function updateInformeSemanalNotas(patch) {
    const s = getState();
    if (!s.informe_semanal_notas) s.informe_semanal_notas = {};
    Object.assign(s.informe_semanal_notas, patch);
    persist(true);
  }

  function exportInformeDireccionCSV() {
    const s = getState();
    const sum = getComputedSummary();
    const notas = s.informe_semanal_notas || {};
    const headers = [
      'Bloque Sección 10 (Dirección)',
      'Indicador / Respaldo Operativo Consolidado',
      'Lectura y Conclusión Ejecutiva del Líder (Ángelo Lucero)'
    ];
    const rows = [
      ['1. Estado General del Área', `Semáforo: ${s.meta.semaforo_area} | Prioridades: ${sum.totalPrioridades} (${sum.priCerradasCount} cerradas, ${sum.priDesviosCount} desvíos)`, notas.bloque_1_resumen_general || s.meta.resumen_ejecutivo_lider],
      ['2. Marketing Interno', `Ocupación: ${sum.horasAsignadas}/${sum.capacidadTotalHs} hs (${sum.ocupacionPct}%) | Fotos Lucy DMS: ${sum.conFotoLucyTotal}/${sum.universoControladoTotal} (${sum.coberturaGeneralLucyPct}%) | Eventos: ${sum.eventosTotal} | Merch bajo mínimo: ${sum.merchBajoMinimoCount}`, notas.bloque_2_marketing_interno || ''],
      ['3. REM y Otros Proveedores', `Compromisos: ${sum.provTotal} (${sum.provAtrasadosCount} atrasados, ${sum.provObservadosCount} observados, ${sum.provPendMinutaCount} minutas pend.)`, notas.bloque_3_proveedores_rem || ''],
      ['4. Canales y Campañas', `Redes: ${sum.redesFrecRealTotal}/${sum.redesFrecPlanTotal} pub. sem. | Pauta: $${sum.campPresupuestoEjecutadoTotal} ejec. (${sum.campLeadsTotal} leads, CPL $${sum.campCplPromedio}) | Google: ${sum.googleAccesosPendientesCount} accesos pend. | Web: ${sum.webValidadosCount}/${sum.webTotal} en prod.`, notas.bloque_4_canales_campanas || ''],
      ['5. Control de Calidad', `Piezas observadas: ${sum.contObservadosCount} | Fotos calidad observada: ${sum.fotosCalidadObservadaCount} | Inconsistencias stock: ${sum.fotosInconsistenciasCanalesCount}`, notas.bloque_5_calidad || ''],
      ['6. Dependencias de Madero', `Agenda pend. info Madero: ${sum.priPendInfoMaderoCount} | Bloqueos equipo: ${sum.tareasBloqueadasCount} | Accesos Google: ${sum.googleAccesosPendientesCount}`, notas.bloque_6_dependencias_madero || ''],
      ['7. Trabajo Absorbido Internamente', `${sum.horasAbsorbidasConsolidadas.toFixed(1)} hs consolidadas (${sum.tareasAbsorbidasCount} tareas equipo + ${sum.contAbsorbidosCount} piezas contenido)`, notas.bloque_7_trabajo_absorbido || ''],
      ['8. Prioridades y Decisiones Dirección', `${sum.decisionesTotalCount} decisiones escaladas a Dirección | ${sum.ventasAbiertosCount} pedidos de Ventas en curso`, notas.bloque_8_prioridades_decisiones || '']
    ];
    const dateStr = (s.meta.fecha_corte || 'reporte').replace(/[^0-9-]/g, '');
    exportCSV(`madero_informe_semanal_direccion_secc10_${dateStr}.csv`, headers, rows);
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
    // Módulos 4, 5 y 6 (Paso 4)
    upsertContenidoPieza,
    deleteContenidoPieza,
    setContenidoEtapa,
    setContenidoEstado,
    exportContenidoCSV,
    upsertRedSocial,
    deleteRedSocial,
    exportRedesCSV,
    upsertCampanaPaga,
    deleteCampanaPaga,
    setCampanaEstado,
    setCampanaCalidadLead,
    exportCampanasCSV,
    // Módulos 7, 8, 10, 11 y 12 (Paso 5)
    upsertGoogleActivo,
    deleteGoogleActivo,
    setGoogleEstado,
    exportGoogleCSV,
    upsertWebCambio,
    deleteWebCambio,
    setWebEtapa,
    setWebEstado,
    exportWebCSV,
    upsertEventoRegional,
    deleteEventoRegional,
    setEventoEstado,
    exportEventosCSV,
    upsertMerchItem,
    deleteMerchItem,
    adjustMerchStock,
    exportMerchCSV,
    upsertVentaFeedback,
    deleteVentaFeedback,
    setVentaEstado,
    toggleVentaCierre,
    exportVentasCSV,
    // Paso 6 (Informe Semanal a Dirección)
    updateInformeSemanalNotas,
    exportInformeDireccionCSV,
    exportCSV,
    exportJSONBackup,
    importJSONBackup,
    resetToBaseline
  };
})();

