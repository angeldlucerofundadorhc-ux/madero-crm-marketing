/* ==========================================================================
   Madero Automotores · Control Integral de Marketing
   Paso 6 · Nivel 2: Informe Semanal a Dirección, Alertas Tempranas y Vista PDF
   (Sección 1, 3, 9 y los 8 Bloques Exactos de la Sección 10)
   ========================================================================== */

window.MaderoInformeDireccion = (function () {
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
  // MOTOR DE ALERTAS TEMPRANAS Y ANTICIPACIÓN (Sección 1 y 9)
  // ------------------------------------------------------------------------
  function buildEarlyAlerts(state, sum) {
    const alerts = [];

    if (sum.provAtrasadosCount > 0 || sum.provPendMinutaCount > 0) {
      alerts.push({
        nivel: 'CRITICA',
        badge: 'badge-red',
        frente: 'Proveedores & Minutas (Secc. 7 y 8)',
        detalle: `${sum.provAtrasadosCount} compromiso(s) atrasado(s) y ${sum.provPendMinutaCount} observación(es) que exigen verificación en minuta sin suavizar.`,
        modulo: 'm9-proveedores',
        cta: 'Auditar Proveedores →'
      });
    }

    if (sum.googlePendTransferenciaCount > 0) {
      alerts.push({
        nivel: 'CRITICA',
        badge: 'badge-red',
        frente: 'Propiedad Raíz Google (Secc. 5.7)',
        detalle: `${sum.googlePendTransferenciaCount} activo(s) críticos (Business Profile Neuquén y Tag Manager) siguen bajo titularidad de REM.`,
        modulo: 'm7-google',
        cta: 'Ver Accesos Google →'
      });
    }

    if (sum.campCalidadBajaCount > 0) {
      alerts.push({
        nivel: 'ALTA',
        badge: 'badge-amber',
        frente: 'Pauta Digital & Calidad de Leads (Secc. 5.6)',
        detalle: `${sum.campCalidadBajaCount} campaña(s) observada(s) por baja calidad comercial reportada por Ventas (ajuste de segmentación/radio exigido a REM).`,
        modulo: 'm6-campanas',
        cta: 'Ver Campañas Pagas →'
      });
    }

    if (sum.sinFotoLucyTotal > 0 || sum.fotosInconsistenciasCanalesCount > 0) {
      alerts.push({
        nivel: 'ALTA',
        badge: 'badge-amber',
        frente: 'Cobertura Fotográfica Lucy DMS (Secc. 6)',
        detalle: `${sum.sinFotoLucyTotal} unidades sin foto en Lucy DMS (concentradas en CAM D'Andrea, Neuquén y talleres) y ${sum.fotosInconsistenciasCanalesCount} inconsistencias entre canales.`,
        modulo: 'm3-fotos',
        cta: 'Ver Reporte Fotos →'
      });
    }

    if (sum.merchBajoMinimoCount > 0) {
      alerts.push({
        nivel: 'MEDIA',
        badge: 'badge-orange',
        frente: 'Punto de Reposición Merchandising (Secc. 5.11)',
        detalle: `${sum.merchBajoMinimoCount} artículo(s) POP/Kits de entrega están en o por debajo del stock mínimo de seguridad.`,
        modulo: 'm11-merch',
        cta: 'Ver Inventario POP →'
      });
    }

    return alerts;
  }

  // ------------------------------------------------------------------------
  // VISTA PRINCIPAL DEL NIVEL 2: INFORME SEMANAL A DIRECCIÓN (Sección 10)
  // ------------------------------------------------------------------------
  function renderExecutiveReport() {
    const state = window.MaderoStore.getState();
    const meta = state.meta || {};
    const sum = window.MaderoStore.getComputedSummary();
    const notas = state.informe_semanal_notas || {};
    const alerts = buildEarlyAlerts(state, sum);

    // Dependencias de Madero (Bloque 6)
    const priPendMadero = (state.agenda_prioridades || []).filter(p => p.estado === 'PENDIENTE_INFO_MADERO');
    const googlePend = (state.google_activos || []).filter(g => g.propiedad_madero !== 'PROPIETARIO_MADERO');
    const tareasBloq = (state.equipo_tareas || []).filter(t => t.bloqueo && t.bloqueo.trim() !== '' && t.estado !== 'CERRADO_EVIDENCIA');

    // Trabajo Absorbido (Bloque 7)
    const tareasAbs = (state.equipo_tareas || []).filter(t => t.es_trabajo_absorbido);
    const piezasAbs = (state.contenido_piezas || []).filter(p => p.trabajo_absorbido);
    const provAbs = (state.proveedores_compromisos || []).filter(c => c.hubo_trabajo_absorbido || (Number(c.horas_absorbidas) || 0) > 0);

    return `
      <div class="space-y-6">
        <!-- BARRA SUPERIOR DE ACCIONES DEL INFORME GERENCIAL (Oculta al imprimir) -->
        <div class="glass-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 no-print">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-lg shadow-sm shrink-0">🏛️</div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="badge-pill badge-dark font-mono">Nivel 2 · Resumen Gerencial</span>
                <span class="badge-pill badge-emerald">Sección 3 y 10 · Alimentado en Vivo desde los 12 Módulos</span>
              </div>
              <h2 class="text-sm sm:text-base font-extrabold text-stone-900 mt-0.5">Formato Oficial del Informe Semanal a Dirección (8 Bloques Normados)</h2>
              <p class="text-xs text-stone-500">Breve en su lectura y completo en su respaldo: hacé clic en cualquier indicador para inspeccionar su módulo operativo.</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <button type="button" onclick="MaderoInformeDireccion.openNotasInformeModal()" class="px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
              ✎ Editar Conclusiones (8 Bloques)
            </button>
            <button type="button" onclick="MaderoStore.exportInformeDireccionCSV(); MaderoUI.showToast('CSV Ejecutivo Sección 10 descargado')" class="px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
              ⬇ CSV Sección 10
            </button>
            <button type="button" onclick="window.print()" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
              <span>🖨️</span>
              <span>Imprimir / Guardar PDF Dirección</span>
            </button>
          </div>
        </div>

        <!-- HOJA INSTITUCIONAL DEL INFORME SEMANAL -->
        <div class="glass-card p-5 sm:p-8 space-y-6 print:shadow-none print:border-stone-300">
          <!-- MEMBRETE OFICIAL -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-stone-900">
            <div>
              <div class="text-[11px] font-mono uppercase tracking-widest text-stone-500 font-bold">MADERO AUTOMOTORES · DEPARTAMENTO DE MARKETING</div>
              <h1 class="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight mt-0.5">INFORME SEMANAL DE CONDUCCIÓN Y CONTROL INTEGRAL</h1>
              <p class="text-xs text-stone-600 mt-1">
                <strong>Conducción:</strong> ${esc(meta.lider)} (${esc(meta.cargo_lider)}) · <strong>Destinatario:</strong> ${esc(meta.emisor_marco)}
              </p>
            </div>
            <div class="sm:text-right space-y-1">
              <div>${window.MaderoUI.semaforoBadge(meta.semaforo_area)}</div>
              <div class="font-mono text-xs font-bold text-stone-900">${esc(meta.semana_activa)}</div>
              <div class="font-mono text-[11px] text-stone-500">Corte validado: ${window.MaderoUI.formatDateDisplay(meta.fecha_corte)}</div>
            </div>
          </div>

          <!-- PANEL DE ANTICIPACIÓN Y ALERTAS TEMPRANAS (Sección 1 y 9) -->
          <div class="p-4 rounded-2xl bg-amber-50/85 border border-amber-300/90 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-2">
                <span>⚡</span>
                <span>Panel de Anticipación y Alertas Detectadas por Marketing (${alerts.length})</span>
              </span>
              <span class="text-[11px] font-mono text-amber-900">Sección 1 y 9 · Prevención de impacto comercial</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              ${alerts.map(a => `
                <div class="p-3 rounded-xl bg-white/90 border border-amber-200 flex flex-col justify-between gap-2">
                  <div>
                    <div class="flex items-center justify-between gap-1 mb-1">
                      <span class="text-[11px] font-extrabold text-stone-900">${esc(a.frente)}</span>
                      <span class="badge-pill ${a.badge} text-[9px]">${esc(a.nivel)}</span>
                    </div>
                    <p class="text-[11px] text-stone-700 leading-snug">${esc(a.detalle)}</p>
                  </div>
                  <button type="button" onclick="MaderoApp.navigateModule('${a.modulo}')" class="text-[11px] font-bold text-blue-800 hover:underline text-left no-print">
                    ${esc(a.cta)}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- BLOQUE 1: RESUMEN DEL ESTADO GENERAL DEL ÁREA -->
          <div class="p-4 sm:p-5 rounded-2xl bg-white/85 border border-stone-200/90 space-y-3">
            <div class="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
              <div>
                <span class="font-mono text-[10px] font-bold uppercase text-stone-500">Sección 10 · Bloque 1 de 8</span>
                <h3 class="text-sm sm:text-base font-extrabold text-stone-900">1. Resumen del Estado General del Área y Cambios Relevantes de la Semana</h3>
              </div>
              <button type="button" onclick="MaderoApp.navigateModule('gob-frentes')" class="text-xs font-bold text-blue-800 hover:underline no-print">Ver Matriz Sección 4 →</button>
            </div>
            <p class="text-xs sm:text-sm text-stone-800 leading-relaxed bg-stone-100/80 p-3.5 rounded-xl border border-stone-200/80">
              ${esc(notas.bloque_1_resumen_general || meta.resumen_ejecutivo_lider)}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div class="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span class="text-[10px] text-stone-500 uppercase font-bold block">7 Frentes Gobernanza</span>
                <span class="font-mono font-extrabold text-stone-900">${sum.frentesVerde} Verde · ${sum.frentesAmbar} Ámbar · ${sum.frentesRojo} Rojo</span>
              </div>
              <div class="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span class="text-[10px] text-stone-500 uppercase font-bold block">Agenda Prioridades</span>
                <span class="font-mono font-extrabold text-stone-900">${sum.totalPrioridades} activas (${sum.priCerradasCount} cerradas)</span>
              </div>
              <div class="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span class="text-[10px] text-stone-500 uppercase font-bold block">12 Módulos Operativos</span>
                <span class="font-mono font-extrabold text-emerald-700">12 / 12 en producción</span>
              </div>
              <div class="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span class="text-[10px] text-stone-500 uppercase font-bold block">Desvíos Controlados</span>
                <span class="font-mono font-extrabold text-amber-800">${sum.priDesviosCount} en agenda · ${sum.provDesviosCount} prov.</span>
              </div>
            </div>
          </div>

          <!-- BLOQUE 2: MARKETING INTERNO -->
          <div class="p-4 sm:p-5 rounded-2xl bg-white/85 border border-stone-200/90 space-y-3">
            <div class="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
              <div>
                <span class="font-mono text-[10px] font-bold uppercase text-stone-500">Sección 10 · Bloque 2 de 8</span>
                <h3 class="text-sm sm:text-base font-extrabold text-stone-900">2. Marketing Interno: Tareas, Fotografías, Digitalización, Contenido, Eventos y Merchandising</h3>
              </div>
              <div class="flex gap-2 no-print">
                <button type="button" onclick="MaderoApp.navigateModule('m2-equipo')" class="text-xs font-bold text-blue-800 hover:underline">M2 Equipo →</button>
                <button type="button" onclick="MaderoApp.navigateModule('m3-fotos')" class="text-xs font-bold text-blue-800 hover:underline">M3 Fotos →</button>
              </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer" onclick="MaderoApp.navigateModule('m2-equipo')">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Capacidad &amp; Continuidad</span>
                <span class="font-mono text-base font-extrabold text-stone-900">${sum.horasAsignadas} / ${sum.capacidadTotalHs} hs (${sum.ocupacionPct}%)</span>
                <span class="text-[10px] text-emerald-700 block mt-0.5">Backups doc: ${sum.backupsDocumentados}/${sum.totalMiembros}</span>
              </div>
              <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer" onclick="MaderoApp.navigateModule('m3-fotos')">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Fotografía Lucy DMS</span>
                <span class="font-mono text-base font-extrabold text-stone-900">${sum.conFotoLucyTotal}/${sum.universoControladoTotal} (${sum.coberturaGeneralLucyPct}%)</span>
                <span class="text-[10px] text-amber-800 block mt-0.5">${sum.sinFotoLucyTotal} sin foto · Polonia 100%</span>
              </div>
              <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer" onclick="MaderoApp.navigateModule('m10-eventos')">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Eventos Regionales</span>
                <span class="font-mono text-base font-extrabold text-stone-900">${sum.eventosTotal} eventos</span>
                <span class="text-[10px] text-stone-600 block mt-0.5">Presup: ${formatMoney(sum.eventosPresupEstimadoTotal)}</span>
              </div>
              <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer" onclick="MaderoApp.navigateModule('m11-merch')">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Merchandising POP</span>
                <span class="font-mono text-base font-extrabold text-stone-900">${formatMoney(sum.merchValorTotal)}</span>
                <span class="text-[10px] text-rose-700 font-semibold block mt-0.5">${sum.merchBajoMinimoCount} ítem(s) en punto reposición</span>
              </div>
            </div>
            <p class="text-xs text-stone-700 leading-relaxed bg-stone-100/75 p-3 rounded-xl border border-stone-200/70">
              <strong>Lectura del Líder:</strong> ${esc(notas.bloque_2_marketing_interno)}
            </p>
          </div>

          <!-- BLOQUE 3: REM Y OTROS PROVEEDORES -->
          <div class="p-4 sm:p-5 rounded-2xl bg-white/85 border border-stone-200/90 space-y-3">
            <div class="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
              <div>
                <span class="font-mono text-[10px] font-bold uppercase text-stone-500">Sección 10 · Bloque 3 de 8</span>
                <h3 class="text-sm sm:text-base font-extrabold text-stone-900">3. REM y Otros Proveedores: Compromisos, Entregas, Observaciones, Atrasos y Próximos Pasos</h3>
              </div>
              <button type="button" onclick="MaderoApp.navigateModule('m9-proveedores')" class="text-xs font-bold text-blue-800 hover:underline no-print">M9 Auditoría Proveedores →</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              ${Object.keys(sum.porProveedor || {}).map(k => {
                const pv = sum.porProveedor[k];
                const metaPv = window.MaderoData.PROVEEDORES[k] || { nombre: k };
                return `
                  <div class="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-extrabold text-stone-900">${esc(metaPv.nombre)}</span>
                      <span class="font-mono text-xs font-bold text-stone-700">${pv.cerrados}/${pv.total} cerrados</span>
                    </div>
                    <div class="text-[11px] text-stone-600">
                      Atrasados: <strong class="text-rose-700">${pv.atrasados}</strong> · Observados: <strong class="text-amber-700">${pv.observados}</strong> · Reprog: <strong>${pv.reprogramados}</strong>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <p class="text-xs text-stone-700 leading-relaxed bg-stone-100/75 p-3 rounded-xl border border-stone-200/70">
              <strong>Lectura del Líder:</strong> ${esc(notas.bloque_3_proveedores_rem)}
            </p>
          </div>

          <!-- BLOQUE 4: CANALES Y CAMPAÑAS -->
          <div class="p-4 sm:p-5 rounded-2xl bg-white/85 border border-stone-200/90 space-y-3">
            <div class="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
              <div>
                <span class="font-mono text-[10px] font-bold uppercase text-stone-500">Sección 10 · Bloque 4 de 8</span>
                <h3 class="text-sm sm:text-base font-extrabold text-stone-900">4. Canales y Campañas: Publicaciones, Pauta, Google, YouTube, Web y Principales Conclusiones</h3>
              </div>
              <div class="flex gap-2 no-print">
                <button type="button" onclick="MaderoApp.navigateModule('m5-redes')" class="text-xs font-bold text-blue-800 hover:underline">M5 Redes →</button>
                <button type="button" onclick="MaderoApp.navigateModule('m6-campanas')" class="text-xs font-bold text-blue-800 hover:underline">M6 Pauta →</button>
              </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer" onclick="MaderoApp.navigateModule('m5-redes')">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Redes (IG/FB/TK/YT)</span>
                <span class="font-mono text-base font-extrabold text-stone-900">${sum.redesFrecRealTotal}/${sum.redesFrecPlanTotal} pub. sem.</span>
                <span class="text-[10px] text-stone-600 block mt-0.5">Alcance: ${formatNumber(sum.redesAlcanceTotal)}</span>
              </div>
              <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer" onclick="MaderoApp.navigateModule('m6-campanas')">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Pauta Paga &amp; Leads</span>
                <span class="font-mono text-base font-extrabold text-stone-900">${formatNumber(sum.campLeadsTotal)} leads</span>
                <span class="text-[10px] text-blue-800 font-semibold block mt-0.5">Ejec: ${formatMoney(sum.campPresupuestoEjecutadoTotal)} · CPL ${formatMoney(sum.campCplPromedio)}</span>
              </div>
              <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer" onclick="MaderoApp.navigateModule('m7-google')">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Ecosistema Google</span>
                <span class="font-mono text-base font-extrabold text-stone-900">${sum.googlePropiedadOkCount}/${sum.googleTotal} prop. OK</span>
                <span class="text-[10px] text-rose-700 font-semibold block mt-0.5">${sum.googlePendTransferenciaCount} retenidos por REM</span>
              </div>
              <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer" onclick="MaderoApp.navigateModule('m8-web')">
                <span class="text-[10px] font-bold uppercase text-stone-500 block">Plataforma Web</span>
                <span class="font-mono text-base font-extrabold text-stone-900">${sum.webValidadosCount}/${sum.webTotal} en prod.</span>
                <span class="text-[10px] text-sky-800 block mt-0.5">${sum.webEnStagingCount} en staging · ${sum.webObservadosCount} obs.</span>
              </div>
            </div>
            <p class="text-xs text-stone-700 leading-relaxed bg-stone-100/75 p-3 rounded-xl border border-stone-200/70">
              <strong>Lectura del Líder:</strong> ${esc(notas.bloque_4_canales_campanas)}
            </p>
          </div>

          <!-- BLOQUE 5 Y BLOQUE 6 EN GRILLA DOBLE -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- BLOQUE 5: CONTROL DE CALIDAD -->
            <div class="p-4 sm:p-5 rounded-2xl bg-white/85 border border-stone-200/90 space-y-3">
              <div class="border-b border-stone-200/80 pb-2">
                <span class="font-mono text-[10px] font-bold uppercase text-stone-500">Sección 10 · Bloque 5 de 8</span>
                <h3 class="text-sm sm:text-base font-extrabold text-stone-900">5. Calidad: Entregables Aceptados, Observados o Devueltos y Criterio</h3>
              </div>
              <ul class="space-y-1.5 text-xs text-stone-700">
                <li>• <strong>Contenido y Piezas (M4):</strong> ${sum.contPublicadosCount} publicadas con estándar OK · <strong class="text-amber-800">${sum.contObservadosCount} observada(s)</strong> por error de placa/tasa.</li>
                <li>• <strong>Fotografía de Stock (M3):</strong> <strong class="text-amber-800">${sum.fotosCalidadObservadaCount} unidad(es) con calidad observada</strong> y <strong class="text-rose-700">${sum.fotosInconsistenciasCanalesCount} inconsistencias</strong> detectadas entre Drive/Lucy/Web.</li>
                <li>• <strong>Auditoría de Proveedores (M9):</strong> <strong class="text-amber-800">${sum.provObservadosCount} entregables observados</strong> y asentados en minuta.</li>
              </ul>
              <p class="text-xs text-stone-700 leading-relaxed bg-stone-100/75 p-3 rounded-xl border border-stone-200/70">
                <strong>Criterio aplicado por Ángelo:</strong> ${esc(notas.bloque_5_calidad)}
              </p>
            </div>

            <!-- BLOQUE 6: DEPENDENCIAS DE MADERO -->
            <div class="p-4 sm:p-5 rounded-2xl bg-white/85 border border-stone-200/90 space-y-3">
              <div class="border-b border-stone-200/80 pb-2">
                <span class="font-mono text-[10px] font-bold uppercase text-stone-500">Sección 10 · Bloque 6 de 8</span>
                <h3 class="text-sm sm:text-base font-extrabold text-stone-900">6. Dependencias de Madero: Accesos, Información o Aprobaciones Pendientes</h3>
              </div>
              <ul class="space-y-1.5 text-xs text-stone-700">
                ${priPendMadero.map(p => `<li>• <strong>[${esc(p.id)}]</strong> ${esc(p.objetivo)} — <em>Depende de: ${esc(p.dependencia_bloqueo)}</em></li>`).join('')}
                ${googlePend.map(g => `<li>• <strong>[${esc(g.id)} · ${esc(g.herramienta)}]</strong> ${esc(g.sucursal_cuenta)} — <em>${esc(g.acceso_pendiente_detalle)}</em></li>`).join('')}
                ${tareasBloq.map(t => `<li>• <strong>[${esc(t.id)}]</strong> ${esc(t.tarea)} — <em>Bloqueo: ${esc(t.bloqueo)}</em></li>`).join('')}
              </ul>
              <p class="text-xs text-stone-700 leading-relaxed bg-stone-100/75 p-3 rounded-xl border border-stone-200/70">
                <strong>Destrabe solicitado:</strong> ${esc(notas.bloque_6_dependencias_madero)}
              </p>
            </div>
          </div>

          <!-- BLOQUE 7: TRABAJO ABSORBIDO INTERNAMENTE (NO SUSTITUCIÓN SILENCIOSA) -->
          <div class="p-4 sm:p-5 rounded-2xl bg-rose-50/75 border border-rose-200/90 space-y-3">
            <div class="flex items-center justify-between border-b border-rose-200/80 pb-2.5">
              <div>
                <span class="font-mono text-[10px] font-bold uppercase text-rose-900">Sección 10 · Bloque 7 de 8 · Regla de No Sustitución Silenciosa</span>
                <h3 class="text-sm sm:text-base font-extrabold text-rose-950">7. Trabajo Absorbido Internamente (${sum.horasAbsorbidasConsolidadas.toFixed(1)} hs) y Medida Tomada para Corregir la Causa</h3>
              </div>
              <button type="button" onclick="MaderoApp.jumpToTrabajoAbsorbido()" class="text-xs font-bold text-rose-900 hover:underline no-print">Ver Evidencia en M9 →</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              ${tareasAbs.map(t => `
                <div class="p-3 rounded-xl bg-white/90 border border-rose-200">
                  <div class="font-bold text-stone-900">[${esc(t.id)}] ${esc(t.tarea)} (${esc(t.horas_estimadas)} hs)</div>
                  <p class="text-[11px] text-rose-900 mt-1"><strong>Causa / Reclamo:</strong> ${esc(t.origen_absorbido)}</p>
                </div>
              `).join('')}
              ${piezasAbs.map(p => `
                <div class="p-3 rounded-xl bg-white/90 border border-rose-200">
                  <div class="font-bold text-stone-900">[${esc(p.id)}] ${esc(p.titulo)}</div>
                  <p class="text-[11px] text-rose-900 mt-1"><strong>Detalle:</strong> ${esc(p.trabajo_absorbido_detalle)}</p>
                </div>
              `).join('')}
            </div>
            <p class="text-xs text-rose-950 leading-relaxed bg-white/80 p-3 rounded-xl border border-rose-200">
              <strong>Medida de origen tomada por Ángelo:</strong> ${esc(notas.bloque_7_trabajo_absorbido)}
            </p>
          </div>

          <!-- BLOQUE 8: PRIORIDADES DE LA SEMANA SIGUIENTE Y DECISIONES QUE REQUIERE DIRECCIÓN -->
          <div class="glass-card-dark p-5 sm:p-6 rounded-2xl space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/15">
              <div>
                <span class="font-mono text-[10px] font-bold uppercase text-amber-300">Sección 10 · Bloque 8 de 8 · Escalamiento Documentado</span>
                <h3 class="text-base sm:text-lg font-extrabold text-white">8. Prioridades de la Semana Siguiente y Decisiones que Requiere Dirección (${sum.decisionesTotalCount})</h3>
              </div>
              <span class="badge-pill badge-amber">Con antecedente, impacto y recomendación del Líder</span>
            </div>

            <p class="text-xs text-stone-200 leading-relaxed bg-white/10 p-3.5 rounded-xl border border-white/15">
              ${esc(notas.bloque_8_prioridades_decisiones)}
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${(sum.decisionesConsolidadas || []).map(dec => {
                const d = dec.data || {};
                const rec = d.recomendacion_lider || d.criterio_lider || '';
                const ant = d.decision_detalle || d.posicion_madero_fundamento || d.pedido_detalle || '';
                return `
                  <div class="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1.5">
                    <div class="flex items-center justify-between gap-2">
                      <span class="font-mono text-[11px] font-bold text-amber-300">[${esc(dec.id)}] ${esc(dec.tipo)}</span>
                      <span class="badge-pill badge-red">${esc(dec.urgencia || 'ALTA')}</span>
                    </div>
                    <div class="text-xs font-extrabold text-white leading-snug">${esc(dec.titulo)}</div>
                    <p class="text-[11px] text-stone-300 leading-snug"><strong>Antecedente / Situación:</strong> ${esc(ant)}</p>
                    <p class="text-[11px] text-emerald-300 leading-snug pt-1 border-t border-white/10"><strong>🧭 Recomendación de Ángelo:</strong> ${esc(rec)}</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function openNotasInformeModal() {
    const notas = window.MaderoStore.getState().informe_semanal_notas || {};

    window.MaderoUI.openModal({
      title: 'Editar Conclusiones Ejecutivas del Informe Semanal (Sección 10)',
      subtitle: 'Personalizá la lectura y conclusión de Ángelo Lucero para cada uno de los 8 bloques normados.',
      maxWidth: 'max-w-3xl',
      bodyHtml: `
        <form class="space-y-3">
          <div>
            <label class="block text-[11px] font-bold text-stone-800 mb-1">1. Resumen del Estado General del Área y Cambios de la Semana</label>
            <textarea id="inf-b1" rows="2" class="input-glass w-full px-3 py-2">${esc(notas.bloque_1_resumen_general)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-800 mb-1">2. Marketing Interno (Tareas, Fotos, Contenido, Eventos, Merch)</label>
            <textarea id="inf-b2" rows="2" class="input-glass w-full px-3 py-2">${esc(notas.bloque_2_marketing_interno)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-800 mb-1">3. REM y Otros Proveedores</label>
            <textarea id="inf-b3" rows="2" class="input-glass w-full px-3 py-2">${esc(notas.bloque_3_proveedores_rem)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-800 mb-1">4. Canales y Campañas (Redes, Pauta, Google, YouTube, Web)</label>
            <textarea id="inf-b4" rows="2" class="input-glass w-full px-3 py-2">${esc(notas.bloque_4_canales_campanas)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-800 mb-1">5. Control de Calidad y Criterio Aplicado</label>
            <textarea id="inf-b5" rows="2" class="input-glass w-full px-3 py-2">${esc(notas.bloque_5_calidad)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-800 mb-1">6. Dependencias de Madero (Accesos, Información, Aprobaciones)</label>
            <textarea id="inf-b6" rows="2" class="input-glass w-full px-3 py-2">${esc(notas.bloque_6_dependencias_madero)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-800 mb-1">7. Trabajo Absorbido Internamente y Medida Correctiva de Origen</label>
            <textarea id="inf-b7" rows="2" class="input-glass w-full px-3 py-2">${esc(notas.bloque_7_trabajo_absorbido)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-800 mb-1">8. Prioridades de la Semana Siguiente y Decisiones de Dirección</label>
            <textarea id="inf-b8" rows="2" class="input-glass w-full px-3 py-2">${esc(notas.bloque_8_prioridades_decisiones)}</textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoInformeDireccion.saveNotasFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">Guardar Conclusiones</button>
      `
    });
  }

  function saveNotasFromModal() {
    window.MaderoStore.updateInformeSemanalNotas({
      bloque_1_resumen_general: document.getElementById('inf-b1').value.trim(),
      bloque_2_marketing_interno: document.getElementById('inf-b2').value.trim(),
      bloque_3_proveedores_rem: document.getElementById('inf-b3').value.trim(),
      bloque_4_canales_campanas: document.getElementById('inf-b4').value.trim(),
      bloque_5_calidad: document.getElementById('inf-b5').value.trim(),
      bloque_6_dependencias_madero: document.getElementById('inf-b6').value.trim(),
      bloque_7_trabajo_absorbido: document.getElementById('inf-b7').value.trim(),
      bloque_8_prioridades_decisiones: document.getElementById('inf-b8').value.trim()
    });
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Conclusiones del Informe Semanal actualizadas');
  }

  return {
    renderExecutiveReport,
    openNotasInformeModal,
    saveNotasFromModal
  };
})();

