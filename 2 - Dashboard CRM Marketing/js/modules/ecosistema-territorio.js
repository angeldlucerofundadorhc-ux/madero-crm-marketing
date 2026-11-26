/* ==========================================================================
   Madero Automotores · Control Integral de Marketing
   Cluster Google, Web & Territorio (Paso 5):
   - Módulo 7: Ecosistema Google & Propiedad de Accesos (Sección 4 y 5.7)
   - Módulo 8: Plataforma Web, Staging y QA (Sección 4 y 5.8)
   - Módulo 10: Eventos y Presencia Regional (Sección 4 y 5.10)
   - Módulo 11: Merchandising e Inventario POP (Sección 4 y 5.11)
   - Módulo 12: Relación con Ventas y Stock Prioritario (Sección 5.12)
   ========================================================================== */

window.MaderoEcosistemaTerritorio = (function () {
  let filtersGoogle = { search: '', herramienta: 'ALL', propiedad: 'ALL' };
  let filtersWeb = { search: '', etapa: 'ALL', actor: 'ALL' };
  let filtersEventos = { search: '', plaza: 'ALL' };
  let filtersMerch = { search: '', sucursal: 'ALL', onlyAlertaReposicion: false };
  let activePresupuestoTab = 'merch'; // 'merch' | 'apps' | 'movimientos' | 'cotizaciones' | 'pedidos'
  let filtersApps = { search: '', categoria: 'ALL', estado: 'ALL' };
  let filtersMovimientos = { search: '', tipo: 'ALL' };
  let filtersVentas = { search: '', tipo: 'ALL', plaza: 'ALL', onlyAbiertos: false };

  function esc(val) {
    return window.MaderoUI ? window.MaderoUI.esc(val) : String(val || '');
  }

  function formatMoney(num) {
    if (num === null || num === undefined || num === '') return '$ 0';
    return '$ ' + Number(num).toLocaleString('es-AR');
  }

  function propiedadGoogleBadge(propId) {
    const cat = (window.MaderoData.PROPIEDAD_GOOGLE && window.MaderoData.PROPIEDAD_GOOGLE[propId]) || {
      label: propId || 'Propiedad Madero',
      shortLabel: propId || 'Propiedad Madero',
      badge: 'badge-emerald',
      dot: 'bg-emerald-500'
    };
    return `<span class="badge-pill ${cat.badge}"><span class="w-1.5 h-1.5 rounded-full ${cat.dot}"></span>${esc(cat.shortLabel)}</span>`;
  }

  function etapaWebBadge(etapaId) {
    const cat = (window.MaderoData.ETAPAS_WEB && window.MaderoData.ETAPAS_WEB[etapaId]) || {
      label: etapaId || 'Solicitado',
      badge: 'badge-stone',
      dot: 'bg-stone-500'
    };
    return `<span class="badge-pill ${cat.badge}"><span class="w-1.5 h-1.5 rounded-full ${cat.dot}"></span>${esc(cat.label)}</span>`;
  }

  function tipoVentaBadge(tipoId) {
    const cat = (window.MaderoData.TIPOS_FEEDBACK_VENTAS && window.MaderoData.TIPOS_FEEDBACK_VENTAS[tipoId]) || {
      label: tipoId || 'Pedido Comercial',
      shortLabel: tipoId || 'Pedido Comercial',
      badge: 'badge-stone'
    };
    return `<span class="badge-pill ${cat.badge}">${esc(cat.shortLabel)}</span>`;
  }

  // ------------------------------------------------------------------------
  // BARRA DE SUB-NAVEGACIÓN DEL CLUSTER (Módulos 7, 8, 10, 11 y 12)
  // ------------------------------------------------------------------------
  function renderClusterSubnav(activeModId) {
    const sum = window.MaderoStore.getComputedSummary();
    const tabs = [
      { id: 'm7-google', num: 'Módulo 7', title: 'Google & Accesos', meta: `${sum.googlePropiedadOkCount}/${sum.googleTotal} prop. OK · ${sum.googleAccesosPendientesCount} pend.`, icon: '🔎' },
      { id: 'm8-web', num: 'Módulo 8', title: 'Web & Staging', meta: `${sum.webValidadosCount}/${sum.webTotal} prod. · ${sum.webEnStagingCount} staging`, icon: '💻' },
      { id: 'm10-eventos', num: 'Módulo 10', title: 'Eventos Regionales', meta: `${sum.eventosTotal} eventos · ${sum.eventosProximosCount} próx.`, icon: '🎪' },
      { id: 'm11-merch', num: 'Módulo 11', title: 'Presupuesto', meta: `${sum.merchBajoMinimoCount} repos. · ${sum.subsActivasCount} apps`, icon: '💳' },
      { id: 'm11-apps', num: 'Presupuesto', title: 'Suscripciones de Apps', meta: `${sum.subsActivasCount} apps · ${formatMoney(sum.subsMensualArs)}/mes`, icon: '📱' },
      { id: 'm12-ventas', num: 'Módulo 12', title: 'Relación con Ventas', meta: `${sum.ventasAbiertosCount} activos · ${sum.ventasStockPrioritarioCount} stock +180d`, icon: '🤝' }
    ];

    return `
      <div class="glass-card p-2 sm:p-2.5 flex flex-wrap items-center gap-1.5">
        ${tabs.map(t => {
          const active = t.id === activeModId;
          return `
            <button type="button" onclick="MaderoApp.navigateModule('${t.id}')" class="px-3 py-2 rounded-xl text-left transition flex items-center gap-2 ${active ? 'bg-stone-900 text-white shadow-sm' : 'bg-white/75 hover:bg-white text-stone-700 border border-stone-200/80'}">
              <span class="text-sm">${t.icon}</span>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono text-[9px] font-bold uppercase ${active ? 'text-amber-300' : 'text-stone-500'}">${esc(t.num)}</span>
                  <span class="text-xs font-extrabold tracking-tight">${esc(t.title)}</span>
                </div>
                <span class="text-[10px] font-mono block ${active ? 'text-stone-300' : 'text-stone-500'}">${esc(t.meta)}</span>
              </div>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  // ========================================================================
  // MÓDULO 7: ECOSISTEMA GOOGLE Y ACCESOS (Sección 4, 5.7 y 12)
  // ========================================================================
  function setGoogleSearch(val) {
    filtersGoogle.search = val;
    window.MaderoApp.renderAll();
  }

  function setGoogleFilter(key, val) {
    filtersGoogle[key] = val;
    window.MaderoApp.renderAll();
  }

  function resetGoogleFilters() {
    filtersGoogle = { search: '', herramienta: 'ALL', propiedad: 'ALL' };
    window.MaderoApp.renderAll();
  }

  function getFilteredGoogle() {
    const list = window.MaderoStore.getState().google_activos || [];
    const q = filtersGoogle.search.trim().toLowerCase();
    return list.filter(g => {
      if (filtersGoogle.herramienta !== 'ALL' && g.herramienta !== filtersGoogle.herramienta) return false;
      if (filtersGoogle.propiedad !== 'ALL' && g.propiedad_madero !== filtersGoogle.propiedad) return false;
      if (q) {
        const hay = [g.id, g.herramienta, g.sucursal_cuenta, g.acceso_pendiente_detalle, g.responsable_nombre, g.entregable, g.observacion, g.proximo_paso].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderGoogleModule() {
    const filtered = getFilteredGoogle();
    const sum = window.MaderoStore.getComputedSummary();
    const herramientas = ['Business Profile', 'Workspace', 'Analytics 4', 'Tag Manager', 'Search Console', 'Google Ads'];

    const rowsHtml = filtered.length === 0 ? `
      <tr><td colspan="7" class="py-10 text-center text-xs text-stone-500">Módulo 7 · Google pausado por Enzo. No hay registros inventados ni activos cargados.</td></tr>
    ` : filtered.map(g => {
      const estadoOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
        `<option value="${st.id}" ${g.estado === st.id ? 'selected' : ''}>${esc(st.shortLabel)}</option>`
      ).join('');

      const isRisk = g.propiedad_madero === 'PENDIENTE_TRANSFERENCIA';

      return `
        <tr class="hover:bg-white/60 transition align-top ${isRisk ? 'bg-rose-50/40' : ''}">
          <td class="py-3.5 px-3 whitespace-nowrap">
            <span class="font-mono font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(g.id)}</span>
            <span class="badge-pill badge-blue block mt-1.5 w-fit">${esc(g.herramienta)}</span>
          </td>

          <td class="py-3.5 px-3 min-w-[210px] max-w-[270px]">
            <button type="button" onclick="MaderoEcosistemaTerritorio.openGoogleModal('${esc(g.id)}')" class="text-left group">
              <span class="font-bold text-stone-900 group-hover:text-blue-900 text-xs block leading-snug">${esc(g.sucursal_cuenta)}</span>
            </button>
            <div class="mt-1">${window.MaderoUI.actorBadge(g.actor_id, true)} <span class="text-[10px] text-stone-500">${esc(g.responsable_nombre)}</span></div>
            ${g.evidencia ? `<a href="${esc(g.evidencia)}" target="_blank" rel="noopener noreferrer" class="inline-block mt-1 text-[10px] font-bold text-blue-800 hover:underline">🔗 Evidencia / Consola ↗</a>` : ''}
          </td>

          <td class="py-3.5 px-3 min-w-[220px] max-w-[280px]">
            <div class="mb-1">${propiedadGoogleBadge(g.propiedad_madero)}</div>
            <p class="text-[11px] ${isRisk ? 'text-rose-900 font-semibold' : 'text-stone-600'} leading-snug">${esc(g.acceso_pendiente_detalle)}</p>
          </td>

          <td class="py-3.5 px-3 min-w-[210px] max-w-[270px]">
            <p class="text-xs font-medium text-stone-800 leading-snug">${esc(g.entregable)}</p>
          </td>

          <td class="py-3.5 px-3 whitespace-nowrap">
            <div class="mb-1.5">${window.MaderoUI.estadoBadge(g.estado, true)}</div>
            <select onchange="MaderoStore.setGoogleEstado('${esc(g.id)}', this.value); MaderoUI.showToast('Estado Google actualizado')" class="text-[10px] bg-white border border-stone-300 rounded-lg px-2 py-1 text-stone-700 font-medium focus:outline-none">
              ${estadoOpts}
            </select>
          </td>

          <td class="py-3.5 px-3 min-w-[240px] max-w-[310px]">
            <div class="text-[11px] text-stone-700 leading-snug mb-1"><strong>Observación:</strong> ${esc(g.observacion)}</div>
            <div class="text-[10px] text-emerald-900 bg-emerald-50/80 border border-emerald-200 rounded-lg px-2 py-1"><strong>Próximo paso:</strong> ${esc(g.proximo_paso)}</div>
          </td>

          <td class="py-3.5 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoEcosistemaTerritorio.openGoogleModal('${esc(g.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold">Editar</button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.handleDeleteGoogle('${esc(g.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold">×</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="space-y-5">
        ${renderClusterSubnav('m7-google')}

        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="badge-pill badge-dark font-mono">Módulo 7 de 12</span>
                <span class="badge-pill badge-amber font-bold">⏸ Pausado por Enzo</span>
                <span class="badge-pill badge-stone">Sección 4, 5.7 y 12</span>
              </div>
              <h2 class="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">7. Google · Pausado por Enzo</h2>
              <p class="text-xs text-stone-600 mt-0.5">
                Frente pausado por decisión de Enzo. Sin datos inventados activos; listo para cargar registros reales cuando se reactive.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <button type="button" onclick="MaderoStore.exportGoogleCSV(MaderoEcosistemaTerritorio.getFilteredGoogle()); MaderoUI.showToast('CSV de Google descargado')" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                ⬇ Exportar CSV Google
              </button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.openGoogleModal(null)" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">
                + Nuevo Activo Google
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-2xl bg-emerald-50/75 border border-emerald-200/80 cursor-pointer" onclick="MaderoEcosistemaTerritorio.setGoogleFilter('propiedad', 'PROPIETARIO_MADERO')">
              <span class="text-[10px] font-bold uppercase text-emerald-900 block">Propiedad Institucional OK</span>
              <span class="font-mono text-2xl font-extrabold text-emerald-950">${sum.googlePropiedadOkCount} / ${sum.googleTotal}</span>
              <span class="text-[11px] text-emerald-800 block mt-0.5">Activos bajo titularidad raíz de Madero →</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 cursor-pointer" onclick="MaderoEcosistemaTerritorio.setGoogleFilter('propiedad', 'ACCESO_PARCIAL')">
              <span class="text-[10px] font-bold uppercase text-amber-900 block">Acceso Parcial / Verificación</span>
              <span class="font-mono text-2xl font-extrabold text-amber-950">${sum.googleAccesoParcialCount}</span>
              <span class="text-[11px] text-amber-800 block mt-0.5">En trámite de elevación de permisos →</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-rose-50/85 border border-rose-200/85 cursor-pointer" onclick="MaderoEcosistemaTerritorio.setGoogleFilter('propiedad', 'PENDIENTE_TRANSFERENCIA')">
              <span class="text-[10px] font-bold uppercase text-rose-900 block">Retenidos por Proveedor (REM)</span>
              <span class="font-mono text-2xl font-extrabold text-rose-950">${sum.googlePendTransferenciaCount}</span>
              <span class="text-[11px] text-rose-800 font-semibold block mt-0.5">Exigen transferencia inmediata de Owner →</span>
            </div>
          </div>
        </div>

        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <div class="flex flex-wrap items-center gap-2 flex-1">
              <input type="text" id="google-search-input" value="${esc(filtersGoogle.search)}" oninput="MaderoEcosistemaTerritorio.setGoogleSearch(this.value)" placeholder="Buscar herramienta, sucursal, acceso pendiente..." class="input-glass px-3.5 py-2 w-full sm:w-64">
              <select onchange="MaderoEcosistemaTerritorio.setGoogleFilter('herramienta', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Todas las Herramientas (6)</option>
                ${herramientas.map(h => `<option value="${esc(h)}" ${filtersGoogle.herramienta === h ? 'selected' : ''}>${esc(h)}</option>`).join('')}
              </select>
              <select onchange="MaderoEcosistemaTerritorio.setGoogleFilter('propiedad', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Todo Estado de Propiedad</option>
                <option value="PROPIETARIO_MADERO" ${filtersGoogle.propiedad === 'PROPIETARIO_MADERO' ? 'selected' : ''}>🟢 Propiedad Madero OK</option>
                <option value="ACCESO_PARCIAL" ${filtersGoogle.propiedad === 'ACCESO_PARCIAL' ? 'selected' : ''}>🟡 Acceso Parcial</option>
                <option value="PENDIENTE_TRANSFERENCIA" ${filtersGoogle.propiedad === 'PENDIENTE_TRANSFERENCIA' ? 'selected' : ''}>🔴 Pendiente Transferencia</option>
              </select>
            </div>
            ${(filtersGoogle.search || filtersGoogle.herramienta !== 'ALL' || filtersGoogle.propiedad !== 'ALL')
              ? `<button type="button" onclick="MaderoEcosistemaTerritorio.resetGoogleFilters()" class="text-xs font-semibold text-stone-500 hover:text-stone-900 underline">Limpiar filtros</button>` : ''}
          </div>

          <div class="overflow-x-auto rounded-xl border border-stone-200/70 bg-white/50">
            <table class="w-full text-left text-xs min-w-[980px]">
              <thead>
                <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                  <th class="py-3 px-3">ID / Herramienta</th>
                  <th class="py-3 px-3">Sucursal / Cuenta</th>
                  <th class="py-3 px-3">Propiedad &amp; Accesos Pendientes</th>
                  <th class="py-3 px-3">Entregable / Configuración</th>
                  <th class="py-3 px-3">Estado (Secc. 7)</th>
                  <th class="py-3 px-3">Observación y Próximo Paso</th>
                  <th class="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200/60">${rowsHtml}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function openGoogleModal(id) {
    const list = window.MaderoStore.getState().google_activos || [];
    const existing = id ? list.find(i => i.id === id) : null;
    const item = existing || {
      id: '',
      herramienta: 'Business Profile',
      sucursal_cuenta: 'Comodoro · Av. Polonia 546 (Salón Principal)',
      propiedad_madero: 'PROPIETARIO_MADERO',
      acceso_pendiente_detalle: '',
      actor_id: 'MKT_INTERNO',
      responsable_nombre: 'Ángelo Lucero',
      estado: 'EN_ELABORACION',
      entregable: '',
      evidencia: '',
      observacion: '',
      proximo_paso: ''
    };
    const herramientas = ['Business Profile', 'Workspace', 'Analytics 4', 'Tag Manager', 'Search Console', 'Google Ads'];
    const estadosOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
      `<option value="${st.id}" ${item.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`
    ).join('');

    window.MaderoUI.openModal({
      title: existing ? `Editar Activo Google · ${existing.id}` : 'Registrar Activo de Ecosistema Google',
      subtitle: 'Sección 5.7 · Control de propiedad institucional, accesos, entregables y próximos pasos.',
      maxWidth: 'max-w-2xl',
      bodyHtml: `
        <form class="space-y-3.5">
          <input type="hidden" id="ggl-id" value="${esc(item.id)}">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Herramienta Google</label>
              <select id="ggl-herramienta" class="input-glass w-full px-3 py-2 font-semibold">
                ${herramientas.map(h => `<option value="${esc(h)}" ${item.herramienta === h ? 'selected' : ''}>${esc(h)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Sucursal / Cuenta *</label>
              <input type="text" id="ggl-cuenta" value="${esc(item.sucursal_cuenta)}" class="input-glass w-full px-3 py-2" required>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-stone-100/80 border border-stone-200/80">
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Estado de Propiedad Institucional</label>
              <select id="ggl-propiedad" class="input-glass w-full px-3 py-2 font-semibold">
                <option value="PROPIETARIO_MADERO" ${item.propiedad_madero === 'PROPIETARIO_MADERO' ? 'selected' : ''}>Propiedad Institucional Madero (OK)</option>
                <option value="ACCESO_PARCIAL" ${item.propiedad_madero === 'ACCESO_PARCIAL' ? 'selected' : ''}>Acceso Parcial (Sin rol Owner)</option>
                <option value="PENDIENTE_TRANSFERENCIA" ${item.propiedad_madero === 'PENDIENTE_TRANSFERENCIA' ? 'selected' : ''}>Pendiente Transferencia de Proveedor</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Estado Oficial (Secc. 7)</label>
              <select id="ggl-estado" class="input-glass w-full px-3 py-2">${estadosOpts}</select>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Detalle de Acceso o Permiso Pendiente</label>
            <input type="text" id="ggl-acceso-det" value="${esc(item.acceso_pendiente_detalle)}" class="input-glass w-full px-3 py-2">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Actor Responsable</label>
              <select id="ggl-actor" class="input-glass w-full px-3 py-2">
                <option value="MKT_INTERNO" ${item.actor_id === 'MKT_INTERNO' ? 'selected' : ''}>Marketing Interno</option>
                <option value="REM" ${item.actor_id === 'REM' ? 'selected' : ''}>REM (Agencia)</option>
                <option value="CHRISTIAN_WEB" ${item.actor_id === 'CHRISTIAN_WEB' ? 'selected' : ''}>L. Christian (Web)</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Responsable Operativo</label>
              <input type="text" id="ggl-resp" value="${esc(item.responsable_nombre)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Entregable / Configuración Técnica</label>
            <input type="text" id="ggl-entregable" value="${esc(item.entregable)}" class="input-glass w-full px-3 py-2">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Observación de Madero</label>
            <textarea id="ggl-obs" rows="2" class="input-glass w-full px-3 py-2">${esc(item.observacion)}</textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Próximo Paso</label>
              <input type="text" id="ggl-proximo" value="${esc(item.proximo_paso)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">URL Evidencia / Carpeta</label>
              <input type="url" id="ggl-evidencia" value="${esc(item.evidencia)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoEcosistemaTerritorio.saveGoogleFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">Guardar Activo</button>
      `
    });
  }

  function saveGoogleFromModal() {
    const cuenta = document.getElementById('ggl-cuenta').value.trim();
    if (!cuenta) {
      window.MaderoUI.showToast('Indicá la sucursal o cuenta de Google', 'red');
      return;
    }
    window.MaderoStore.upsertGoogleActivo({
      id: document.getElementById('ggl-id').value.trim() || undefined,
      herramienta: document.getElementById('ggl-herramienta').value,
      sucursal_cuenta: cuenta,
      propiedad_madero: document.getElementById('ggl-propiedad').value,
      estado: document.getElementById('ggl-estado').value,
      acceso_pendiente_detalle: document.getElementById('ggl-acceso-det').value.trim(),
      actor_id: document.getElementById('ggl-actor').value,
      responsable_nombre: document.getElementById('ggl-resp').value.trim(),
      entregable: document.getElementById('ggl-entregable').value.trim(),
      observacion: document.getElementById('ggl-obs').value.trim(),
      proximo_paso: document.getElementById('ggl-proximo').value.trim(),
      evidencia: document.getElementById('ggl-evidencia').value.trim()
    });
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Activo Google guardado');
  }

  function handleDeleteGoogle(id) {
    if (confirm(`¿Eliminar el activo ${id}?`)) {
      window.MaderoStore.deleteGoogleActivo(id);
      window.MaderoUI.showToast(`Activo ${id} eliminado`, 'amber');
    }
  }

  // ========================================================================
  // MÓDULO 8: PLATAFORMA WEB Y STAGING (Sección 4 y 5.8)
  // ========================================================================
  function setWebSearch(val) {
    filtersWeb.search = val;
    window.MaderoApp.renderAll();
  }

  function setWebFilter(key, val) {
    filtersWeb[key] = val;
    window.MaderoApp.renderAll();
  }

  function resetWebFilters() {
    filtersWeb = { search: '', etapa: 'ALL', actor: 'ALL' };
    window.MaderoApp.renderAll();
  }

  function getFilteredWeb() {
    const list = window.MaderoStore.getState().web_cambios || [];
    const q = filtersWeb.search.trim().toLowerCase();
    return list.filter(w => {
      if (filtersWeb.etapa !== 'ALL' && w.etapa_web !== filtersWeb.etapa) return false;
      if (filtersWeb.actor !== 'ALL' && w.actor_id !== filtersWeb.actor) return false;
      if (q) {
        const hay = [w.id, w.cambio_solicitado, w.tipo, w.responsable, w.observaciones_madero, w.validacion_final].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderWebModule() {
    const allWeb = window.MaderoStore.getState().web_cambios || [];
    const filtered = getFilteredWeb();
    const etapasOrder = ['SOLICITADO', 'EN_DESARROLLO', 'EN_PRUEBA_STAGING', 'OBSERVADO_QA', 'VALIDADO_PRODUCCION'];

    const pipelineHtml = etapasOrder.map(etKey => {
      const cat = window.MaderoData.ETAPAS_WEB[etKey];
      const count = allWeb.filter(w => w.etapa_web === etKey).length;
      const isSelected = filtersWeb.etapa === etKey;
      return `
        <button type="button" onclick="MaderoEcosistemaTerritorio.setWebFilter('etapa', '${isSelected ? 'ALL' : etKey}')" class="p-3 rounded-2xl text-left transition border flex flex-col justify-between ${isSelected ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white/80 hover:bg-white border-stone-200/90 text-stone-900'}">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-stone-300' : 'text-stone-500'}">${esc(cat.label)}</span>
            <span class="w-2 h-2 rounded-full ${cat.dot}"></span>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="font-mono text-xl font-extrabold">${count}</span>
            <span class="text-[10px] font-semibold ${isSelected ? 'text-amber-300' : 'text-stone-500'}">${isSelected ? 'Activo ✓' : 'Filtrar →'}</span>
          </div>
        </button>
      `;
    }).join('');

    const rowsHtml = filtered.length === 0 ? `
      <tr><td colspan="7" class="py-10 text-center text-xs text-stone-500">No hay cambios o tickets web para el filtro seleccionado.</td></tr>
    ` : filtered.map(w => {
      const etapaOpts = Object.values(window.MaderoData.ETAPAS_WEB).map(et =>
        `<option value="${et.id}" ${w.etapa_web === et.id ? 'selected' : ''}>${esc(et.label)}</option>`
      ).join('');
      const estadoOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
        `<option value="${st.id}" ${w.estado === st.id ? 'selected' : ''}>${esc(st.shortLabel)}</option>`
      ).join('');

      return `
        <tr class="hover:bg-white/60 transition align-top">
          <td class="py-3.5 px-3 whitespace-nowrap">
            <span class="font-mono font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(w.id)}</span>
            <span class="text-[10px] font-bold text-stone-500 block mt-1.5">${esc(w.tipo)}</span>
          </td>
          <td class="py-3.5 px-3 min-w-[240px] max-w-[330px]">
            <button type="button" onclick="MaderoEcosistemaTerritorio.openWebModal('${esc(w.id)}')" class="text-left group">
              <span class="font-bold text-stone-900 group-hover:text-blue-900 text-xs block leading-snug">${esc(w.cambio_solicitado)}</span>
            </button>
            ${w.url_prueba ? `<a href="${esc(w.url_prueba)}" target="_blank" rel="noopener noreferrer" class="inline-block mt-1.5 text-[10px] font-mono font-bold text-sky-800 hover:underline">🔗 Entorno Prueba / URL: ${esc(w.url_prueba)} ↗</a>` : ''}
          </td>
          <td class="py-3.5 px-3 min-w-[150px]">
            <div class="mb-1">${window.MaderoUI.actorBadge(w.actor_id, true)}</div>
            <span class="text-[10px] text-stone-600 block">${esc(w.responsable)}</span>
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap">
            <div class="mb-1.5">${etapaWebBadge(w.etapa_web)}</div>
            <select onchange="MaderoStore.setWebEtapa('${esc(w.id)}', this.value); MaderoUI.showToast('Etapa Web actualizada')" class="text-[10px] bg-white border border-stone-300 rounded-lg px-2 py-1 text-stone-800 font-semibold w-full">
              ${etapaOpts}
            </select>
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap">
            <div class="font-mono text-xs font-semibold text-stone-800 mb-1">📅 ${window.MaderoUI.formatDateDisplay(w.fecha_acordada)}</div>
            <div class="mb-1">${window.MaderoUI.estadoBadge(w.estado, true)}</div>
            <select onchange="MaderoStore.setWebEstado('${esc(w.id)}', this.value); MaderoUI.showToast('Estado Web actualizado')" class="text-[10px] bg-white border border-stone-300 rounded-lg px-2 py-1 text-stone-700 w-full">
              ${estadoOpts}
            </select>
          </td>
          <td class="py-3.5 px-3 min-w-[240px] max-w-[320px]">
            <div class="text-[11px] text-stone-700 leading-snug mb-1"><strong>Observaciones QA Madero:</strong> ${esc(w.observaciones_madero)}</div>
            <div class="text-[10px] font-semibold text-emerald-900 bg-emerald-50/80 border border-emerald-200 rounded-lg px-2 py-1"><strong>Validación Final:</strong> ${esc(w.validacion_final)}</div>
          </td>
          <td class="py-3.5 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoEcosistemaTerritorio.openWebModal('${esc(w.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold">Editar</button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.handleDeleteWeb('${esc(w.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold">×</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="space-y-5">
        ${renderClusterSubnav('m8-web')}

        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="badge-pill badge-dark font-mono">Módulo 8 de 12</span>
                <span class="badge-pill badge-emerald">Operativo · Paso 5</span>
                <span class="badge-pill badge-sky">Sección 5.8 · L. Christian &amp; Desarrollo Web</span>
              </div>
              <h2 class="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">Plataforma Web: Cambios Solicitados, Entorno Staging, QA y Validación</h2>
              <p class="text-xs text-stone-600 mt-0.5">
                Trazabilidad técnica de desarrollos, sincronización con Lucy DMS, ruteo de WhatsApp por sucursal y control de calidad previo a salida en vivo.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <a href="https://maderoautomotores.com/" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl bg-sky-50 border border-sky-300 text-sky-900 text-xs font-bold hover:bg-sky-100 transition">
                🌐 maderoautomotores.com ↗
              </a>
              <a href="https://dashboard-alistamiento-pi.vercel.app/" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition">
                🚗 Dashboard Alistamiento ↗
              </a>
              <a href="https://madero-evento-neuquen.vercel.app/" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl bg-purple-50 border border-purple-300 text-purple-900 text-xs font-bold hover:bg-purple-100 transition">
                🎟 Evento Neuquén ↗
              </a>
              <button type="button" onclick="MaderoStore.exportWebCSV(MaderoEcosistemaTerritorio.getFilteredWeb()); MaderoUI.showToast('CSV de Web descargado')" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                ⬇ Exportar CSV Web
              </button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.openWebModal(null)" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">
                + Nuevo Cambio / Ticket Web
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            ${pipelineHtml}
          </div>
        </div>

        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <div class="flex flex-wrap items-center gap-2 flex-1">
              <input type="text" id="web-search-input" value="${esc(filtersWeb.search)}" oninput="MaderoEcosistemaTerritorio.setWebSearch(this.value)" placeholder="Buscar ticket web, URL staging, observación QA..." class="input-glass px-3.5 py-2 w-full sm:w-72">
              <select onchange="MaderoEcosistemaTerritorio.setWebFilter('actor', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Todos los Responsables</option>
                <option value="CHRISTIAN_WEB" ${filtersWeb.actor === 'CHRISTIAN_WEB' ? 'selected' : ''}>L. Christian (Web / Dev)</option>
                <option value="REM" ${filtersWeb.actor === 'REM' ? 'selected' : ''}>REM (Tracking / Píxeles)</option>
                <option value="MKT_INTERNO" ${filtersWeb.actor === 'MKT_INTERNO' ? 'selected' : ''}>Marketing Interno</option>
              </select>
            </div>
            ${(filtersWeb.search || filtersWeb.etapa !== 'ALL' || filtersWeb.actor !== 'ALL')
              ? `<button type="button" onclick="MaderoEcosistemaTerritorio.resetWebFilters()" class="text-xs font-semibold text-stone-500 hover:text-stone-900 underline">Limpiar filtros</button>` : ''}
          </div>

          <div class="overflow-x-auto rounded-xl border border-stone-200/70 bg-white/50">
            <table class="w-full text-left text-xs min-w-[960px]">
              <thead>
                <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                  <th class="py-3 px-3">ID / Tipo</th>
                  <th class="py-3 px-3">Cambio Solicitado y URL Prueba</th>
                  <th class="py-3 px-3">Responsable</th>
                  <th class="py-3 px-3">Etapa Web (5 Etapas)</th>
                  <th class="py-3 px-3">Fecha y Estado</th>
                  <th class="py-3 px-3">Observaciones QA y Validación Final</th>
                  <th class="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200/60">${rowsHtml}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function openWebModal(id) {
    const list = window.MaderoStore.getState().web_cambios || [];
    const existing = id ? list.find(i => i.id === id) : null;
    const item = existing || {
      id: '',
      cambio_solicitado: '',
      tipo: 'Mejora Funcional',
      actor_id: 'CHRISTIAN_WEB',
      responsable: 'L. Christian (Desarrollo Web)',
      etapa_web: 'SOLICITADO',
      estado: 'PENDIENTE_INICIO',
      url_prueba: 'https://staging.maderoautomotores.com/',
      observaciones_madero: '',
      fecha_acordada: '2026-11-10',
      validacion_final: ''
    };
    const etapasOpts = Object.values(window.MaderoData.ETAPAS_WEB).map(et =>
      `<option value="${et.id}" ${item.etapa_web === et.id ? 'selected' : ''}>${esc(et.label)}</option>`
    ).join('');
    const estadosOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
      `<option value="${st.id}" ${item.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`
    ).join('');

    window.MaderoUI.openModal({
      title: existing ? `Editar Cambio Web · ${existing.id}` : 'Registrar Nuevo Cambio / Ticket Web',
      subtitle: 'Sección 5.8 · Seguimiento de desarrollo, staging, observaciones de QA y validación en producción.',
      maxWidth: 'max-w-2xl',
      bodyHtml: `
        <form class="space-y-3.5">
          <input type="hidden" id="web-id" value="${esc(item.id)}">
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Cambio o Requerimiento Solicitado *</label>
            <input type="text" id="web-cambio" value="${esc(item.cambio_solicitado)}" class="input-glass w-full px-3 py-2" required>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Categoría / Tipo</label>
              <input type="text" id="web-tipo" value="${esc(item.tipo)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Actor Principal</label>
              <select id="web-actor" class="input-glass w-full px-3 py-2">
                <option value="CHRISTIAN_WEB" ${item.actor_id === 'CHRISTIAN_WEB' ? 'selected' : ''}>L. Christian (Web)</option>
                <option value="REM" ${item.actor_id === 'REM' ? 'selected' : ''}>REM</option>
                <option value="MKT_INTERNO" ${item.actor_id === 'MKT_INTERNO' ? 'selected' : ''}>Marketing Interno</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Responsable Técnico</label>
              <input type="text" id="web-resp" value="${esc(item.responsable)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-stone-100/80 border border-stone-200/80">
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Etapa Web</label>
              <select id="web-etapa" class="input-glass w-full px-3 py-2 font-semibold">${etapasOpts}</select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Estado Oficial</label>
              <select id="web-estado" class="input-glass w-full px-3 py-2">${estadosOpts}</select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Fecha Acordada</label>
              <input type="date" id="web-fecha" value="${esc(item.fecha_acordada)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">URL de Prueba / Staging / Producción</label>
            <input type="url" id="web-url" value="${esc(item.url_prueba)}" class="input-glass w-full px-3 py-2">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Observaciones de QA de Madero</label>
            <textarea id="web-obs" rows="2" class="input-glass w-full px-3 py-2">${esc(item.observaciones_madero)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Validación Final de Puesta en Producción</label>
            <input type="text" id="web-val" value="${esc(item.validacion_final)}" class="input-glass w-full px-3 py-2">
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoEcosistemaTerritorio.saveWebFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">Guardar Ticket Web</button>
      `
    });
  }

  function saveWebFromModal() {
    const cambio = document.getElementById('web-cambio').value.trim();
    if (!cambio) {
      window.MaderoUI.showToast('Describí el cambio web solicitado', 'red');
      return;
    }
    window.MaderoStore.upsertWebCambio({
      id: document.getElementById('web-id').value.trim() || undefined,
      cambio_solicitado: cambio,
      tipo: document.getElementById('web-tipo').value.trim(),
      actor_id: document.getElementById('web-actor').value,
      responsable: document.getElementById('web-resp').value.trim(),
      etapa_web: document.getElementById('web-etapa').value,
      estado: document.getElementById('web-estado').value,
      fecha_acordada: document.getElementById('web-fecha').value,
      url_prueba: document.getElementById('web-url').value.trim(),
      observaciones_madero: document.getElementById('web-obs').value.trim(),
      validacion_final: document.getElementById('web-val').value.trim()
    });
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Cambio web guardado');
  }

  function handleDeleteWeb(id) {
    if (confirm(`¿Eliminar el ticket web ${id}?`)) {
      window.MaderoStore.deleteWebCambio(id);
      window.MaderoUI.showToast(`Ticket ${id} eliminado`, 'amber');
    }
  }

  // ========================================================================
  // MÓDULO 10: EVENTOS Y PRESENCIA REGIONAL (Sección 4 y 5.10)
  // ========================================================================
  function setEventosSearch(val) {
    filtersEventos.search = val;
    window.MaderoApp.renderAll();
  }

  function setEventosPlaza(val) {
    filtersEventos.plaza = val;
    window.MaderoApp.renderAll();
  }

  function getFilteredEventos() {
    const list = window.MaderoStore.getState().eventos_regionales || [];
    const q = filtersEventos.search.trim().toLowerCase();
    return list.filter(e => {
      if (filtersEventos.plaza !== 'ALL' && e.ciudad_plaza !== filtersEventos.plaza) return false;
      if (q) {
        const hay = [e.id, e.evento, e.ciudad_plaza, e.objetivo, e.responsables, e.difusion_plan, e.resultado_medido, e.conclusion_lider].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderEventosModule() {
    const filtered = getFilteredEventos();
    const sum = window.MaderoStore.getComputedSummary();

    const rowsHtml = filtered.length === 0 ? `
      <tr><td colspan="7" class="py-10 text-center text-xs text-stone-500">No hay eventos regionales registrados para este filtro.</td></tr>
    ` : filtered.map(e => {
      const estadoOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
        `<option value="${st.id}" ${e.estado === st.id ? 'selected' : ''}>${esc(st.shortLabel)}</option>`
      ).join('');

      return `
        <tr class="hover:bg-white/60 transition align-top">
          <td class="py-3.5 px-3 whitespace-nowrap">
            <span class="font-mono font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(e.id)}</span>
            <div class="font-mono text-[10px] text-stone-600 mt-1.5">
              📅 ${window.MaderoUI.formatDateDisplay(e.fecha_inicio)}<br>al ${window.MaderoUI.formatDateDisplay(e.fecha_fin)}
            </div>
          </td>
          <td class="py-3.5 px-3 min-w-[240px] max-w-[320px]">
            <button type="button" onclick="MaderoEcosistemaTerritorio.openEventoModal('${esc(e.id)}')" class="text-left group">
              <span class="font-bold text-stone-900 group-hover:text-blue-900 text-xs block leading-snug">${esc(e.evento)}</span>
            </button>
            <div class="text-[10px] font-semibold text-stone-700 mt-1">📍 ${esc(e.ciudad_plaza)}</div>
            <p class="text-[11px] text-stone-600 mt-1 leading-snug"><strong>Objetivo:</strong> ${esc(e.objetivo)}</p>
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap">
            <div class="text-[10px] font-bold uppercase text-stone-500">Estimado / Real</div>
            <div class="font-mono text-xs font-bold text-stone-900">${formatMoney(e.presupuesto_estimado)}</div>
            <div class="font-mono text-[11px] text-emerald-800">Ejec: ${formatMoney(e.presupuesto_real)}</div>
          </td>
          <td class="py-3.5 px-3 min-w-[200px] max-w-[260px]">
            <div class="text-[11px] font-semibold text-stone-900 mb-1">${esc(e.responsables)}</div>
            <p class="text-[10px] text-stone-600 leading-snug"><strong>Difusión:</strong> ${esc(e.difusion_plan)}</p>
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap">
            <div class="mb-1.5">${window.MaderoUI.estadoBadge(e.estado, true)}</div>
            <select onchange="MaderoStore.setEventoEstado('${esc(e.id)}', this.value); MaderoUI.showToast('Estado de evento actualizado')" class="text-[10px] bg-white border border-stone-300 rounded-lg px-2 py-1 text-stone-700 w-full">
              ${estadoOpts}
            </select>
          </td>
          <td class="py-3.5 px-3 min-w-[240px] max-w-[320px]">
            <div class="text-[11px] text-stone-700 leading-snug mb-1.5"><strong>Resultado / Avance:</strong> ${esc(e.resultado_medido)}</div>
            <div class="p-2 rounded-xl bg-stone-900 text-stone-100 text-[10px] leading-snug">
              <strong class="text-amber-300">🧭 Conclusión Líder:</strong> ${esc(e.conclusion_lider)}
            </div>
          </td>
          <td class="py-3.5 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoEcosistemaTerritorio.openEventoModal('${esc(e.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold">Editar</button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.handleDeleteEvento('${esc(e.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold">×</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="space-y-5">
        ${renderClusterSubnav('m10-eventos')}

        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="badge-pill badge-dark font-mono">Módulo 10 de 12</span>
                <span class="badge-pill badge-emerald">Operativo · Paso 5</span>
                <span class="badge-pill badge-blue">Sección 4 y 5.10 · Marketing Interno</span>
              </div>
              <h2 class="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">Eventos y Presencia Regional: Calendario, Presupuesto, Difusión y Resultado</h2>
              <p class="text-xs text-stone-600 mt-0.5">
                Planificación anticipada de activaciones comerciales en Comodoro Rivadavia, Neuquén y Cordillera con medición de impacto real en salón.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <button type="button" onclick="MaderoStore.exportEventosCSV(MaderoEcosistemaTerritorio.getFilteredEventos()); MaderoUI.showToast('CSV de Eventos descargado')" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                ⬇ Exportar CSV Eventos
              </button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.openEventoModal(null)" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">
                + Nuevo Evento / Activación
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Agenda Territorial</span>
              <span class="font-mono text-2xl font-extrabold text-stone-900">${sum.eventosTotal} eventos</span>
              <span class="text-[11px] text-emerald-700 font-semibold block mt-0.5">${sum.eventosProximosCount} próximos · ${sum.eventosCerradosCount} ejecutados</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Presupuesto Estimado Total</span>
              <span class="font-mono text-2xl font-extrabold text-stone-900">${formatMoney(sum.eventosPresupEstimadoTotal)}</span>
              <span class="text-[11px] text-stone-600 block mt-0.5">Comodoro + Neuquén + Cordillera</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Inversión Ejecutada / Comprometida</span>
              <span class="font-mono text-2xl font-extrabold text-stone-900">${formatMoney(sum.eventosPresupRealTotal)}</span>
              <span class="text-[11px] text-blue-800 font-semibold block mt-0.5">Con respaldo de proveedores y salón</span>
            </div>
          </div>
        </div>

        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <input type="text" id="eventos-search-input" value="${esc(filtersEventos.search)}" oninput="MaderoEcosistemaTerritorio.setEventosSearch(this.value)" placeholder="Buscar evento, ciudad, objetivo, resultado..." class="input-glass px-3.5 py-2 w-full sm:w-72">
            <select onchange="MaderoEcosistemaTerritorio.setEventosPlaza(this.value)" class="input-glass px-3 py-2">
              <option value="ALL">Todas las Plazas</option>
              ${window.MaderoData.PLAZAS.map(pl => `<option value="${esc(pl)}" ${filtersEventos.plaza === pl ? 'selected' : ''}>${esc(pl)}</option>`).join('')}
            </select>
          </div>

          <div class="overflow-x-auto rounded-xl border border-stone-200/70 bg-white/50">
            <table class="w-full text-left text-xs min-w-[960px]">
              <thead>
                <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                  <th class="py-3 px-3">ID / Fechas</th>
                  <th class="py-3 px-3">Evento / Ciudad / Objetivo</th>
                  <th class="py-3 px-3">Presupuesto</th>
                  <th class="py-3 px-3">Responsables &amp; Difusión</th>
                  <th class="py-3 px-3">Estado (Secc. 7)</th>
                  <th class="py-3 px-3">Resultado Medido y Conclusión</th>
                  <th class="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200/60">${rowsHtml}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function openEventoModal(id) {
    const list = window.MaderoStore.getState().eventos_regionales || [];
    const existing = id ? list.find(i => i.id === id) : null;
    const item = existing || {
      id: '',
      evento: '',
      ciudad_plaza: 'Comodoro · Av. Polonia 546 (Salón Principal)',
      fecha_inicio: '2026-11-15',
      fecha_fin: '2026-11-16',
      objetivo: '',
      presupuesto_estimado: 500000,
      presupuesto_real: 0,
      actor_id: 'MKT_INTERNO',
      responsables: 'Ángelo Lucero + Equipo Interno',
      difusion_plan: '',
      estado: 'PENDIENTE_INICIO',
      resultado_medido: '',
      conclusion_lider: '',
      evidencia_url: ''
    };
    const plazasOpts = (window.MaderoData.PLAZAS || []).map(pl =>
      `<option value="${esc(pl)}" ${item.ciudad_plaza === pl ? 'selected' : ''}>${esc(pl)}</option>`
    ).join('');
    const estadosOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
      `<option value="${st.id}" ${item.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`
    ).join('');

    window.MaderoUI.openModal({
      title: existing ? `Editar Evento Regional · ${existing.id}` : 'Registrar Evento / Activación Regional',
      subtitle: 'Sección 5.10 · Calendario, ciudad, objetivo, presupuesto, difusión y resultado medido.',
      maxWidth: 'max-w-2xl',
      bodyHtml: `
        <form class="space-y-3.5">
          <input type="hidden" id="evt-id" value="${esc(item.id)}">
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Nombre del Evento / Activación *</label>
            <input type="text" id="evt-nombre" value="${esc(item.evento)}" class="input-glass w-full px-3 py-2" required>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Ciudad / Plaza</label>
              <select id="evt-plaza" class="input-glass w-full px-3 py-2">${plazasOpts}</select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha Inicio</label>
              <input type="date" id="evt-inicio" value="${esc(item.fecha_inicio)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha Fin</label>
              <input type="date" id="evt-fin" value="${esc(item.fecha_fin)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Objetivo Comercial y de Marca</label>
            <input type="text" id="evt-objetivo" value="${esc(item.objetivo)}" class="input-glass w-full px-3 py-2">
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-stone-100/80 border border-stone-200/80">
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Presup. Estimado ($)</label>
              <input type="number" id="evt-pres-est" value="${esc(item.presupuesto_estimado)}" class="input-glass w-full px-3 py-1.5 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Presup. Real ($)</label>
              <input type="number" id="evt-pres-real" value="${esc(item.presupuesto_real)}" class="input-glass w-full px-3 py-1.5 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Estado Oficial</label>
              <select id="evt-estado" class="input-glass w-full px-3 py-1.5">${estadosOpts}</select>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Responsables</label>
              <input type="text" id="evt-resp" value="${esc(item.responsables)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Plan de Difusión Previa y Cobertura</label>
              <input type="text" id="evt-difusion" value="${esc(item.difusion_plan)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Resultado Medido / Estado de Preparación</label>
            <textarea id="evt-resultado" rows="2" class="input-glass w-full px-3 py-2">${esc(item.resultado_medido)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-900 mb-1">🧭 Conclusión del Líder (Ángelo Lucero)</label>
            <textarea id="evt-conclusion" rows="2" class="input-glass w-full px-3 py-2">${esc(item.conclusion_lider)}</textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoEcosistemaTerritorio.saveEventoFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">Guardar Evento</button>
      `
    });
  }

  function saveEventoFromModal() {
    const evento = document.getElementById('evt-nombre').value.trim();
    if (!evento) {
      window.MaderoUI.showToast('El nombre del evento es obligatorio', 'red');
      return;
    }
    window.MaderoStore.upsertEventoRegional({
      id: document.getElementById('evt-id').value.trim() || undefined,
      evento,
      ciudad_plaza: document.getElementById('evt-plaza').value,
      fecha_inicio: document.getElementById('evt-inicio').value,
      fecha_fin: document.getElementById('evt-fin').value,
      objetivo: document.getElementById('evt-objetivo').value.trim(),
      presupuesto_estimado: Number(document.getElementById('evt-pres-est').value) || 0,
      presupuesto_real: Number(document.getElementById('evt-pres-real').value) || 0,
      estado: document.getElementById('evt-estado').value,
      responsables: document.getElementById('evt-resp').value.trim(),
      difusion_plan: document.getElementById('evt-difusion').value.trim(),
      resultado_medido: document.getElementById('evt-resultado').value.trim(),
      conclusion_lider: document.getElementById('evt-conclusion').value.trim()
    });
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Evento regional guardado');
  }

  function handleDeleteEvento(id) {
    if (confirm(`¿Eliminar el evento ${id}?`)) {
      window.MaderoStore.deleteEventoRegional(id);
      window.MaderoUI.showToast(`Evento ${id} eliminado`, 'amber');
    }
  }

  // ========================================================================
  // MÓDULO 11: PRESUPUESTO (MERCHANDISING & REPOSICIÓN + SUSCRIPCIONES DE APPS)
  // ========================================================================
  function setPresupuestoTab(tab) {
    activePresupuestoTab = tab || 'merch';
    if (window.MaderoApp && window.MaderoApp.navigateModule) {
      window.MaderoApp.navigateModule(activePresupuestoTab === 'apps' ? 'm11-apps' : 'm11-merch');
    } else if (window.MaderoApp) {
      window.MaderoApp.renderAll();
    }
  }

  function openQuickNewPresupuesto() {
    if (activePresupuestoTab === 'apps') return openSuscripcionModal(null);
    if (activePresupuestoTab === 'movimientos') return openMovimientoModal(null);
    if (activePresupuestoTab === 'cotizaciones') return openCotizacionModal(null);
    if (activePresupuestoTab === 'pedidos') return openPedidoModal(null, null);
    return openMerchModal(null);
  }

  function setMerchSearch(val) {
    filtersMerch.search = val;
    window.MaderoApp.renderAll();
  }

  function setMerchSucursal(val) {
    filtersMerch.sucursal = val;
    window.MaderoApp.renderAll();
  }

  function filterMerchBySucursalAlerta(sucursal) {
    activePresupuestoTab = 'merch';
    if (filtersMerch.sucursal === sucursal && filtersMerch.onlyAlertaReposicion) {
      filtersMerch.sucursal = 'ALL';
      filtersMerch.onlyAlertaReposicion = false;
    } else {
      filtersMerch.sucursal = sucursal;
      filtersMerch.onlyAlertaReposicion = true;
    }
    window.MaderoApp.renderAll();
  }

  function toggleMerchAlerta() {
    activePresupuestoTab = 'merch';
    filtersMerch.onlyAlertaReposicion = !filtersMerch.onlyAlertaReposicion;
    window.MaderoApp.renderAll();
  }

  function clearMerchFilters() {
    filtersMerch.search = '';
    filtersMerch.sucursal = 'ALL';
    filtersMerch.onlyAlertaReposicion = false;
    window.MaderoApp.renderAll();
  }

  function getMerchCiudadGroup(sucursal) {
    const s = String(sucursal || '');
    if (s.startsWith('Neuquén')) return 'NEUQUEN';
    return 'COMODORO';
  }

  function getFilteredMerch() {
    const list = window.MaderoStore.getState().merchandising_stock || [];
    const q = filtersMerch.search.trim().toLowerCase();
    return list.filter(m => {
      if (filtersMerch.sucursal === 'GRUPO:COMODORO' || filtersMerch.sucursal === 'Comodoro Rivadavia') {
        if (getMerchCiudadGroup(m.sucursal_ubicacion) !== 'COMODORO') return false;
      } else if (filtersMerch.sucursal === 'GRUPO:NEUQUEN' || filtersMerch.sucursal === 'Neuquén') {
        if (getMerchCiudadGroup(m.sucursal_ubicacion) !== 'NEUQUEN') return false;
      } else if (filtersMerch.sucursal !== 'ALL' && m.sucursal_ubicacion !== filtersMerch.sucursal) {
        return false;
      }
      if (filtersMerch.onlyAlertaReposicion && (Number(m.stock_actual) || 0) > (Number(m.stock_minimo_reposicion) || 0)) return false;
      if (q) {
        const hay = [m.id, m.articulo, m.categoria, m.sucursal_ubicacion, m.destino_principal, m.necesidad_futura].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function setAppsSearch(val) {
    filtersApps.search = val;
    window.MaderoApp.renderAll();
  }

  function setAppsFilter(key, val) {
    filtersApps[key] = val;
    window.MaderoApp.renderAll();
  }

  function getFilteredApps() {
    const list = window.MaderoStore.getState().presupuesto_suscripciones || [];
    const q = filtersApps.search.trim().toLowerCase();
    return list.filter(sub => {
      if (filtersApps.categoria !== 'ALL' && sub.categoria !== filtersApps.categoria) return false;
      if (filtersApps.estado !== 'ALL' && sub.estado !== filtersApps.estado) return false;
      if (q) {
        const hay = [sub.id, sub.app, sub.categoria, sub.medio_pago, sub.responsable, sub.notas].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function setMovimientosSearch(val) {
    filtersMovimientos.search = val;
    window.MaderoApp.renderAll();
  }

  function setMovimientosTipo(val) {
    filtersMovimientos.tipo = val;
    window.MaderoApp.renderAll();
  }

  function getFilteredMovimientos() {
    const list = window.MaderoStore.getState().merchandising_movimientos || [];
    const q = filtersMovimientos.search.trim().toLowerCase();
    return list.filter(mov => {
      if (filtersMovimientos.tipo !== 'ALL' && mov.tipo !== filtersMovimientos.tipo) return false;
      if (q) {
        const hay = [mov.id, mov.articulo, mov.patente, mov.sucursal, mov.responsable, mov.nota].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderMerchTab(sum) {
    const allMerch = window.MaderoStore.getState().merchandising_stock || [];
    const filtered = getFilteredMerch();

    const calcGroupStats = grp => {
      const items = allMerch.filter(m => getMerchCiudadGroup(m.sucursal_ubicacion) === grp);
      const valor = items.reduce((acc, m) => acc + ((Number(m.stock_actual) || 0) * (Number(m.costo_unitario) || 0)), 0);
      const alertas = items.filter(m => (Number(m.stock_actual) || 0) <= (Number(m.stock_minimo_reposicion) || 0)).length;
      const unidades = items.reduce((acc, m) => acc + (Number(m.stock_actual) || 0), 0);
      return { count: items.length, valor, alertas, unidades };
    };
    const statsComodoro = calcGroupStats('COMODORO');
    const statsNeuquen = calcGroupStats('NEUQUEN');

    const sucAlertasHtml = (sum.merchAlertasPorSucursal || []).length === 0
      ? '<span class="text-[11px] text-emerald-700 font-semibold">✓ Todas las sucursales con stock saludable</span>'
      : (sum.merchAlertasPorSucursal || []).map(a => {
          const active = filtersMerch.sucursal === a.sucursal && filtersMerch.onlyAlertaReposicion;
          return `
            <button type="button" onclick="MaderoEcosistemaTerritorio.filterMerchBySucursalAlerta('${esc(a.sucursal)}')" class="px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition flex items-center gap-1.5 ${active ? 'bg-rose-600 text-white border-rose-700' : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'}">
              <span>📍 ${esc(a.sucursal.split('·').pop().trim())}</span>
              <span class="font-mono font-extrabold">${a.count}</span>
            </button>
          `;
        }).join('');

    const renderMerchRow = m => {
      const st = Number(m.stock_actual) || 0;
      const min = Number(m.stock_minimo_reposicion) || 0;
      const unit = Number(m.costo_unitario) || 0;
      const valTotal = st * unit;
      const isLow = st <= min;

      return `
        <tr class="hover:bg-white/60 transition align-top ${isLow ? 'bg-rose-50/40' : ''}">
          <td class="py-3.5 px-3 whitespace-nowrap">
            <span class="font-mono font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(m.id)}</span>
            <span class="text-[10px] font-bold text-stone-600 block mt-1.5">${esc(m.categoria)}</span>
          </td>
          <td class="py-3.5 px-3 min-w-[230px] max-w-[310px]">
            <button type="button" onclick="MaderoEcosistemaTerritorio.openMerchModal('${esc(m.id)}')" class="text-left group">
              <span class="font-bold text-stone-900 group-hover:text-blue-900 text-xs block leading-snug">${esc(m.articulo)}</span>
            </button>
            <div class="text-[10px] text-stone-600 mt-1">📍 ${esc(m.sucursal_ubicacion)}</div>
            <div class="text-[10px] text-stone-500 mt-0.5"><strong>Destino:</strong> ${esc(m.destino_principal)}</div>
            ${m.enlace_url ? `<a href="${esc(m.enlace_url)}" target="_blank" rel="noopener noreferrer" class="text-[10px] text-blue-700 underline font-semibold mt-1 inline-block">🔗 Ver producto proveedor ↗</a>` : ''}
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap text-center">
            <div class="inline-flex items-center gap-1.5 bg-white border border-stone-300 rounded-xl px-2 py-1">
              <button type="button" onclick="MaderoStore.adjustMerchStock('${esc(m.id)}', -1)" class="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 font-mono font-bold text-xs">−</button>
              <span class="font-mono text-sm font-extrabold ${isLow ? 'text-rose-700' : 'text-stone-900'} px-1">${st}</span>
              <button type="button" onclick="MaderoStore.adjustMerchStock('${esc(m.id)}', 1)" class="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 font-mono font-bold text-xs">+</button>
            </div>
            <div class="text-[10px] font-mono text-stone-500 mt-1">Mín. reposición: ${min}</div>
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap">
            ${isLow
              ? '<span class="badge-pill badge-red font-bold"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Reponer Urgente</span>'
              : '<span class="badge-pill badge-emerald"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Stock Saludable</span>'}
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap font-mono">
            <div class="text-xs font-bold text-stone-900">${formatMoney(valTotal)}</div>
            <div class="text-[10px] text-stone-500">Unit: ${formatMoney(unit)}</div>
          </td>
          <td class="py-3.5 px-3 min-w-[230px] max-w-[310px]">
            <div class="text-[11px] text-stone-700 leading-snug mb-1"><strong>Uso período:</strong> ${esc(m.utilizacion_periodo)}</div>
            <div class="text-[10px] font-semibold ${isLow ? 'text-rose-900 bg-rose-100/80 border border-rose-300' : 'text-stone-700 bg-stone-100/80 border border-stone-200'} rounded-lg px-2 py-1">
              <strong>Proyección:</strong> ${esc(m.necesidad_futura)}
            </div>
          </td>
          <td class="py-3.5 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoEcosistemaTerritorio.openMovimientoModal('${esc(m.id)}')" title="Registrar entrega / movimiento" class="px-2 py-1 rounded-lg bg-white border border-stone-300 text-stone-800 text-[11px] font-semibold hover:bg-stone-50">🔄 Mov.</button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.openPedidoModal(null, '${esc(m.id)}')" title="Solicitar reposición" class="px-2 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold hover:bg-amber-100">📦 Pedir</button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.openMerchModal('${esc(m.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold">Editar</button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.handleDeleteMerch('${esc(m.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold">×</button>
            </div>
          </td>
        </tr>
      `;
    };

    const groupDefs = [
      { key: 'NEUQUEN', title: '📍 Neuquén' },
      { key: 'COMODORO', title: '📍 Comodoro Rivadavia' }
    ];

    let rowsHtml = '';
    if (filtered.length === 0) {
      rowsHtml = `<tr><td colspan="7" class="py-10 text-center text-xs text-stone-500">No hay ítems de merchandising para el filtro seleccionado.</td></tr>`;
    } else {
      rowsHtml = groupDefs.map(g => {
        const groupItems = filtered.filter(m => getMerchCiudadGroup(m.sucursal_ubicacion) === g.key);
        if (groupItems.length === 0) return '';
        const gVal = groupItems.reduce((acc, m) => acc + ((Number(m.stock_actual) || 0) * (Number(m.costo_unitario) || 0)), 0);
        const gUnidades = groupItems.reduce((acc, m) => acc + (Number(m.stock_actual) || 0), 0);
        const gAlertas = groupItems.filter(m => (Number(m.stock_actual) || 0) <= (Number(m.stock_minimo_reposicion) || 0)).length;
        return `
          <tr class="bg-stone-200/60 border-y border-stone-300/70">
            <td colspan="7" class="py-2 px-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-extrabold uppercase tracking-wider text-stone-900">${esc(g.title)}</span>
                <div class="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span class="badge-pill badge-stone">${groupItems.length} ítem(s) · ${gUnidades} u.</span>
                  <span class="badge-pill badge-blue">${formatMoney(gVal)}</span>
                  ${gAlertas > 0 ? `<span class="badge-pill badge-red">${gAlertas} a reponer</span>` : '<span class="badge-pill badge-emerald">Sin alertas</span>'}
                </div>
              </div>
            </td>
          </tr>
          ${groupItems.map(renderMerchRow).join('')}
        `;
      }).join('');
    }

    return `
      <div class="glass-card p-4 sm:p-6 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button type="button" onclick="MaderoEcosistemaTerritorio.setMerchSucursal('${filtersMerch.sucursal === 'Neuquén' ? 'ALL' : 'Neuquén'}')" class="p-3 rounded-2xl text-left border transition ${filtersMerch.sucursal === 'Neuquén' || filtersMerch.sucursal === 'GRUPO:NEUQUEN' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white/75 border-stone-200/80 hover:bg-white'}">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-extrabold">📍 Neuquén</span>
              <span class="font-mono text-[10px] font-bold ${statsNeuquen.alertas > 0 ? 'text-rose-600' : 'text-emerald-600'}">${statsNeuquen.alertas} alerta(s)</span>
            </div>
            <div class="font-mono text-sm font-extrabold mt-1">${formatMoney(statsNeuquen.valor)}</div>
            <div class="text-[10px] opacity-80">${statsNeuquen.count} líneas · ${statsNeuquen.unidades} unidades</div>
          </button>
          <button type="button" onclick="MaderoEcosistemaTerritorio.setMerchSucursal('${filtersMerch.sucursal === 'Comodoro Rivadavia' ? 'ALL' : 'Comodoro Rivadavia'}')" class="p-3 rounded-2xl text-left border transition ${filtersMerch.sucursal === 'Comodoro Rivadavia' || filtersMerch.sucursal === 'GRUPO:COMODORO' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white/75 border-stone-200/80 hover:bg-white'}">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-extrabold">📍 Comodoro Rivadavia</span>
              <span class="font-mono text-[10px] font-bold ${statsComodoro.alertas > 0 ? 'text-rose-600' : 'text-emerald-600'}">${statsComodoro.alertas} alerta(s)</span>
            </div>
            <div class="font-mono text-sm font-extrabold mt-1">${formatMoney(statsComodoro.valor)}</div>
            <div class="text-[10px] opacity-80">${statsComodoro.count} líneas · ${statsComodoro.unidades} unidades</div>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-stone-100/70 border border-stone-200/70">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-stone-600 mr-1">Alertas por Sucursal:</span>
          ${sucAlertasHtml}
          ${filtersMerch.sucursal !== 'ALL' || filtersMerch.onlyAlertaReposicion || filtersMerch.search ? `
            <button type="button" onclick="MaderoEcosistemaTerritorio.clearMerchFilters()" class="ml-auto text-[11px] font-bold text-stone-700 hover:underline">Limpiar filtro</button>
          ` : ''}
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2 flex-1">
            <input type="text" id="merch-search-input" value="${esc(filtersMerch.search)}" oninput="MaderoEcosistemaTerritorio.setMerchSearch(this.value)" placeholder="Buscar artículo, sucursal, destino..." class="input-glass px-3.5 py-2 w-full sm:w-72">
            <select onchange="MaderoEcosistemaTerritorio.setMerchSucursal(this.value)" class="input-glass px-3 py-2">
              <option value="ALL" ${filtersMerch.sucursal === 'ALL' ? 'selected' : ''}>Todas las Sucursales (Neuquén y Comodoro)</option>
              <option value="Neuquén" ${filtersMerch.sucursal === 'Neuquén' || filtersMerch.sucursal === 'GRUPO:NEUQUEN' ? 'selected' : ''}>📍 Neuquén</option>
              <option value="Comodoro Rivadavia" ${filtersMerch.sucursal === 'Comodoro Rivadavia' || filtersMerch.sucursal === 'GRUPO:COMODORO' ? 'selected' : ''}>📍 Comodoro Rivadavia</option>
            </select>
          </div>
          <button type="button" onclick="MaderoEcosistemaTerritorio.toggleMerchAlerta()" class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${filtersMerch.onlyAlertaReposicion ? 'bg-rose-600 text-white border-rose-700' : 'bg-rose-50 text-rose-900 border-rose-200'}">
            🚨 Solo Bajo Punto de Reposición (${sum.merchBajoMinimoCount})
          </button>
        </div>

        <div class="overflow-x-auto rounded-xl border border-stone-200/70 bg-white/50">
          <table class="w-full text-left text-xs min-w-[980px]">
            <thead>
              <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                <th class="py-3 px-3">ID / Categoría</th>
                <th class="py-3 px-3">Artículo / Sucursal / Destino</th>
                <th class="py-3 px-3 text-center">Stock Físico</th>
                <th class="py-3 px-3">Estado Reposición</th>
                <th class="py-3 px-3">Valorización</th>
                <th class="py-3 px-3">Utilización y Necesidad Futura</th>
                <th class="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-200/60">${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderAppsTab(sum) {
    const filtered = getFilteredApps();
    const estadoBadgeMap = {
      ACTIVA: '<span class="badge-pill badge-emerald"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Activa</span>',
      POR_VENCER: '<span class="badge-pill badge-amber font-bold"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Por Vencer</span>',
      CONTRATAR: '<span class="badge-pill badge-red font-bold"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Contratar</span>',
      VENCIDA: '<span class="badge-pill badge-red font-bold"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Vencida</span>',
      PENDIENTE_APROBACION: '<span class="badge-pill badge-orange font-bold"><span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Pend. Aprobación</span>',
      PAUSADA: '<span class="badge-pill badge-stone">Pausada / Baja</span>'
    };
    const categorias = ['IA y Productividad', 'Diseño y Video', 'Web y Hosting', 'Marketing y Pauta', 'Software / Gestión'];

    const rowsHtml = filtered.length === 0 ? `
      <tr><td colspan="7" class="py-10 text-center text-xs text-stone-500">No hay suscripciones registradas para este filtro.</td></tr>
    ` : filtered.map(sub => {
      const m = Number(sub.monto) || 0;
      const tc = sub.moneda === 'USD' ? (Number(sub.tipo_cambio) || 1200) : 1;
      const arsMensual = sub.plan_periodicidad === 'Único' ? 0 : Math.round((m * tc) / (sub.plan_periodicidad === 'Anual' ? 12 : 1));
      const montoOrig = sub.moneda === 'USD' ? `USD ${m.toLocaleString('es-AR')}` : formatMoney(m);
      const currPrefix = sub.moneda === 'USD' ? 'USD ' : '$ ';
      const refMens = Number(sub.precio_mensual_ref) || 0;
      const refAnual = Number(sub.precio_anual_ref) || 0;
      const formatPlanVal = val => sub.moneda === 'USD' ? `USD ${val.toLocaleString('es-AR')}` : formatMoney(val);
      const mensOptLabel = refMens > 0 ? `Mensual (${formatPlanVal(refMens)})` : 'Mensual';
      const anualOptLabel = refAnual > 0 ? `Anual (${formatPlanVal(refAnual)})` : 'Anual';
      const refsHtml = (refMens > 0 || refAnual > 0)
        ? `<div class="text-[10px] text-stone-500 mt-1">${refMens > 0 ? `Men: ${esc(currPrefix + refMens.toLocaleString('es-AR'))}` : ''}${refMens > 0 && refAnual > 0 ? ' · ' : ''}${refAnual > 0 ? `Anu: ${esc(currPrefix + refAnual.toLocaleString('es-AR'))}` : ''}</div>`
        : '';
      return `
        <tr class="hover:bg-white/60 transition align-top">
          <td class="py-3.5 px-3 whitespace-nowrap">
            <span class="font-mono font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(sub.id)}</span>
            <span class="text-[10px] font-bold text-stone-600 block mt-1.5">${esc(sub.categoria)}</span>
          </td>
          <td class="py-3.5 px-3 min-w-[220px] max-w-[300px]">
            <button type="button" onclick="MaderoEcosistemaTerritorio.openSuscripcionModal('${esc(sub.id)}')" class="text-left group">
              <span class="font-bold text-stone-900 group-hover:text-blue-900 text-xs block leading-snug">${esc(sub.app)}</span>
            </button>
            ${sub.notas ? `<p class="text-[11px] text-stone-600 mt-1 leading-snug">${esc(sub.notas)}</p>` : ''}
            ${sub.comprobante_url ? `<a href="${esc(sub.comprobante_url)}" target="_blank" rel="noopener noreferrer" class="text-[10px] text-blue-700 underline font-semibold mt-1 inline-block">🔗 Enlace / Facturación ↗</a>` : ''}
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap">
            <span class="badge-pill badge-blue">${esc(sub.plan_periodicidad)}</span>
            <div class="text-[10px] text-stone-500 mt-1">Resp: ${esc(sub.responsable)}</div>
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap font-mono">
            <div class="text-xs font-bold text-stone-900">${esc(montoOrig)}</div>
            <div class="text-[10px] text-stone-600">≈ ${formatMoney(arsMensual)}/mes</div>
            <select onchange="MaderoEcosistemaTerritorio.quickChangeSuscripcionPlan('${esc(sub.id)}', this.value)" class="mt-1.5 text-[10px] bg-white border border-stone-300 rounded-lg px-2 py-1 font-sans font-semibold text-stone-800">
              <option value="Mensual" ${sub.plan_periodicidad === 'Mensual' ? 'selected' : ''}>${esc(mensOptLabel)}</option>
              <option value="Anual" ${sub.plan_periodicidad === 'Anual' ? 'selected' : ''}>${esc(anualOptLabel)}</option>
              ${sub.plan_periodicidad === 'Único' ? '<option value="Único" selected>Pago Único</option>' : ''}
            </select>
            ${refsHtml}
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap">
            <div class="text-xs font-semibold text-stone-800">${esc(sub.medio_pago || '—')}</div>
            <div class="text-[10px] font-mono text-stone-500 mt-0.5">Vence: ${esc(sub.fecha_vencimiento || '—')}</div>
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap">${estadoBadgeMap[sub.estado] || esc(sub.estado)}</td>
          <td class="py-3.5 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoEcosistemaTerritorio.openSuscripcionModal('${esc(sub.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold">Editar</button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.handleDeleteSuscripcion('${esc(sub.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold">×</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="glass-card p-4 sm:p-6 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2 flex-1">
            <input type="text" id="apps-search-input" value="${esc(filtersApps.search)}" oninput="MaderoEcosistemaTerritorio.setAppsSearch(this.value)" placeholder="Buscar app, medio de pago, responsable..." class="input-glass px-3.5 py-2 w-full sm:w-72">
            <select onchange="MaderoEcosistemaTerritorio.setAppsFilter('categoria', this.value)" class="input-glass px-3 py-2">
              <option value="ALL">Todas las Categorías</option>
              ${categorias.map(c => `<option value="${esc(c)}" ${filtersApps.categoria === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            </select>
            <select onchange="MaderoEcosistemaTerritorio.setAppsFilter('estado', this.value)" class="input-glass px-3 py-2">
              <option value="ALL">Todos los Estados</option>
              <option value="ACTIVA" ${filtersApps.estado === 'ACTIVA' ? 'selected' : ''}>Activas</option>
              <option value="POR_VENCER" ${filtersApps.estado === 'POR_VENCER' ? 'selected' : ''}>Por Vencer</option>
              <option value="CONTRATAR" ${filtersApps.estado === 'CONTRATAR' ? 'selected' : ''}>Contratar</option>
              <option value="PENDIENTE_APROBACION" ${filtersApps.estado === 'PENDIENTE_APROBACION' ? 'selected' : ''}>Pend. Aprobación</option>
              <option value="PAUSADA" ${filtersApps.estado === 'PAUSADA' ? 'selected' : ''}>Pausadas</option>
            </select>
          </div>
          <div class="text-xs font-mono font-bold text-stone-700">
            Total mensual activo: ${formatMoney(sum.subsMensualArs)} ${sum.subsMensualUsd > 0 ? `(incl. USD ${sum.subsMensualUsd.toFixed(1)})` : ''}
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-stone-200/70 bg-white/50">
          <table class="w-full text-left text-xs min-w-[920px]">
            <thead>
              <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                <th class="py-3 px-3">ID / Categoría</th>
                <th class="py-3 px-3">App / Servicio y Uso</th>
                <th class="py-3 px-3">Periodicidad</th>
                <th class="py-3 px-3">Costo / Mensual ARS</th>
                <th class="py-3 px-3">Medio de Pago y Vencimiento</th>
                <th class="py-3 px-3">Estado</th>
                <th class="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-200/60">${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderMovimientosTab() {
    const filtered = getFilteredMovimientos();
    const tipoLabels = {
      ENTREGA_CLIENTE: { label: 'Entrega a Cliente', badge: 'badge-amber', sign: '−' },
      INGRESO_REPOSICION: { label: 'Ingreso Reposición', badge: 'badge-emerald', sign: '+' },
      TRASLADO_SUCURSAL: { label: 'Traslado Sucursal', badge: 'badge-blue', sign: '−' },
      AJUSTE_INVENTARIO: { label: 'Ajuste Stock', badge: 'badge-stone', sign: '=' }
    };

    const rowsHtml = filtered.length === 0 ? `
      <tr><td colspan="7" class="py-10 text-center text-xs text-stone-500">Todavía no hay movimientos ni entregas registradas.</td></tr>
    ` : filtered.map(mov => {
      const meta = tipoLabels[mov.tipo] || { label: mov.tipo, badge: 'badge-stone', sign: '' };
      return `
        <tr class="hover:bg-white/60 transition align-top">
          <td class="py-3 px-3 whitespace-nowrap font-mono">
            <div class="text-xs font-bold text-stone-900">${esc(mov.fecha)}</div>
            <div class="text-[10px] text-stone-500">${esc(mov.id)}</div>
          </td>
          <td class="py-3 px-3 whitespace-nowrap"><span class="badge-pill ${meta.badge}">${esc(meta.label)}</span></td>
          <td class="py-3 px-3 min-w-[220px] max-w-[300px]">
            <div class="font-bold text-stone-900 text-xs leading-snug">${esc(mov.articulo)}</div>
            ${mov.nota ? `<div class="text-[11px] text-stone-600 mt-0.5">${esc(mov.nota)}</div>` : ''}
          </td>
          <td class="py-3 px-3 whitespace-nowrap text-center font-mono font-extrabold text-sm text-stone-900">${meta.sign}${mov.cantidad}</td>
          <td class="py-3 px-3 whitespace-nowrap font-mono">
            ${mov.patente ? `<span class="badge-pill badge-dark">${esc(mov.patente)}</span>` : '<span class="text-stone-400">—</span>'}
          </td>
          <td class="py-3 px-3">
            <div class="text-[11px] text-stone-700">${esc(mov.sucursal || '—')}</div>
            <div class="text-[10px] text-stone-500">${esc(mov.responsable || '')}</div>
          </td>
          <td class="py-3 px-3 text-right whitespace-nowrap">
            <button type="button" onclick="MaderoEcosistemaTerritorio.handleDeleteMovimiento('${esc(mov.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold">×</button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="glass-card p-4 sm:p-6 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2 flex-1">
            <input type="text" id="mov-search-input" value="${esc(filtersMovimientos.search)}" oninput="MaderoEcosistemaTerritorio.setMovimientosSearch(this.value)" placeholder="Buscar por patente, artículo, sucursal..." class="input-glass px-3.5 py-2 w-full sm:w-72">
            <select onchange="MaderoEcosistemaTerritorio.setMovimientosTipo(this.value)" class="input-glass px-3 py-2">
              <option value="ALL">Todos los Movimientos</option>
              <option value="ENTREGA_CLIENTE" ${filtersMovimientos.tipo === 'ENTREGA_CLIENTE' ? 'selected' : ''}>Entrega a Cliente</option>
              <option value="INGRESO_REPOSICION" ${filtersMovimientos.tipo === 'INGRESO_REPOSICION' ? 'selected' : ''}>Ingreso por Reposición</option>
              <option value="TRASLADO_SUCURSAL" ${filtersMovimientos.tipo === 'TRASLADO_SUCURSAL' ? 'selected' : ''}>Traslado entre Sucursales</option>
              <option value="AJUSTE_INVENTARIO" ${filtersMovimientos.tipo === 'AJUSTE_INVENTARIO' ? 'selected' : ''}>Ajuste de Inventario</option>
            </select>
          </div>
          <button type="button" onclick="MaderoEcosistemaTerritorio.openMovimientoModal(null)" class="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800">+ Registrar Movimiento</button>
        </div>

        <div class="overflow-x-auto rounded-xl border border-stone-200/70 bg-white/50">
          <table class="w-full text-left text-xs min-w-[880px]">
            <thead>
              <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                <th class="py-3 px-3">Fecha / ID</th>
                <th class="py-3 px-3">Tipo</th>
                <th class="py-3 px-3">Artículo y Detalle</th>
                <th class="py-3 px-3 text-center">Cant.</th>
                <th class="py-3 px-3">Patente / Op.</th>
                <th class="py-3 px-3">Sucursal / Resp.</th>
                <th class="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-200/60">${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderCotizacionesTab() {
    const list = window.MaderoStore.getState().merchandising_cotizaciones || [];
    const estadoMap = {
      EN_EVALUACION: '<span class="badge-pill badge-amber">En Evaluación</span>',
      SELECCIONADA: '<span class="badge-pill badge-emerald">Seleccionada</span>',
      ORDEN_EMITIDA: '<span class="badge-pill badge-blue">Orden Emitida</span>',
      DESCARTADA: '<span class="badge-pill badge-stone">Descartada</span>'
    };

    const rowsHtml = list.length === 0 ? `
      <tr><td colspan="7" class="py-10 text-center text-xs text-stone-500">Sin cotizaciones cargadas todavía.</td></tr>
    ` : list.map(c => {
      const total = (Number(c.cantidad) || 0) * (Number(c.precio_unitario) || 0);
      return `
        <tr class="hover:bg-white/60 transition align-top">
          <td class="py-3.5 px-3 whitespace-nowrap">
            <span class="font-mono font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(c.id)}</span>
            <div class="text-[10px] font-mono text-stone-500 mt-1">${esc(c.fecha)}</div>
          </td>
          <td class="py-3.5 px-3 min-w-[220px]">
            <div class="font-bold text-stone-900 text-xs">${esc(c.proveedor)}</div>
            ${c.proveedor_email ? `<a href="mailto:${esc(c.proveedor_email)}" class="text-[10px] text-[#ff9c6e] hover:underline block mt-0.5">✉️ ${esc(c.proveedor_email)}</a>` : ''}
            <div class="text-[11px] text-stone-700 mt-0.5">${esc(c.item_kit)}</div>
            ${c.enlace_url && /^(https?:\/\/|data:)/i.test(c.enlace_url) ? `
              <a href="${esc(c.enlace_url)}" target="_blank" rel="noopener noreferrer" ${/^data:/i.test(c.enlace_url) ? `download="${esc(c.archivo_nombre || 'presupuesto.pdf')}"` : ''} class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-[#de4800]/15 hover:bg-[#de4800] text-[#ff9c6e] hover:text-white border border-[#de4800]/35 text-[10px] font-semibold transition">
                📄 ${esc(c.archivo_nombre || 'Ver PDF / Presupuesto')} ↗
              </a>
            ` : ''}
            ${c.notas ? `<div class="text-[10px] text-stone-500 mt-1">${esc(c.notas)}</div>` : ''}
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap font-mono text-center font-bold">${c.cantidad} u.</td>
          <td class="py-3.5 px-3 whitespace-nowrap font-mono">
            <div class="text-xs font-bold text-stone-900">${formatMoney(c.precio_unitario)} /u</div>
            <div class="text-[10px] text-stone-600">Total: ${formatMoney(total)}</div>
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap text-xs text-stone-700">${esc(c.plazo_entrega || '—')}</td>
          <td class="py-3.5 px-3 whitespace-nowrap">${estadoMap[c.estado] || esc(c.estado)}</td>
          <td class="py-3.5 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoEcosistemaTerritorio.openCotizacionModal('${esc(c.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold">Editar</button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.handleDeleteCotizacion('${esc(c.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold">×</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="glass-card p-4 sm:p-6 space-y-4">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 class="text-sm font-extrabold text-stone-900">Comparativa de Proveedores y Cotizaciones</h3>
            <p class="text-xs text-stone-500">Presupuestos comparados para kits de entrega y reposición POP.</p>
          </div>
          <button type="button" onclick="MaderoEcosistemaTerritorio.openCotizacionModal(null)" class="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800">+ Nueva Cotización</button>
        </div>

        <div class="overflow-x-auto rounded-xl border border-stone-200/70 bg-white/50">
          <table class="w-full text-left text-xs min-w-[880px]">
            <thead>
              <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                <th class="py-3 px-3">ID / Fecha</th>
                <th class="py-3 px-3">Proveedor e Ítem / Kit</th>
                <th class="py-3 px-3 text-center">Cant.</th>
                <th class="py-3 px-3">Precio Unit. / Total</th>
                <th class="py-3 px-3">Plazo Entrega</th>
                <th class="py-3 px-3">Estado</th>
                <th class="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-200/60">${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderPedidosTab() {
    const list = window.MaderoStore.getState().merchandising_pedidos || [];
    const estados = [
      { id: 'SOLICITADO', label: 'Solicitado' },
      { id: 'APROBADO_DIRECCION', label: 'Aprobado Dirección' },
      { id: 'EN_PRODUCCION', label: 'En Producción' },
      { id: 'ENVIADO', label: 'Enviado / En Camino' },
      { id: 'RECIBIDO', label: 'Recibido en Sucursal' }
    ];

    const rowsHtml = list.length === 0 ? `
      <tr><td colspan="7" class="py-10 text-center text-xs text-stone-500">No hay pedidos de reposición registrados.</td></tr>
    ` : list.map(p => {
      const opts = estados.map(st => `<option value="${st.id}" ${p.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`).join('');
      return `
        <tr class="hover:bg-white/60 transition align-top">
          <td class="py-3.5 px-3 whitespace-nowrap font-mono">
            <span class="font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(p.id)}</span>
            <div class="text-[10px] text-stone-500 mt-1">${esc(p.fecha_pedido)}</div>
          </td>
          <td class="py-3.5 px-3 min-w-[230px]">
            <div class="font-bold text-stone-900 text-xs leading-snug">${esc(p.articulo)}</div>
            <div class="text-[10px] text-stone-600 mt-0.5">📍 Destino: ${esc(p.sucursal_destino)}</div>
            ${p.nota ? `<div class="text-[10px] text-stone-500 mt-0.5">${esc(p.nota)}</div>` : ''}
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap font-mono font-bold text-center">${p.cantidad} u.</td>
          <td class="py-3.5 px-3 whitespace-nowrap">
            <div class="text-xs font-semibold text-stone-800">${esc(p.proveedor || 'A definir')}</div>
            <div class="text-[10px] font-mono text-stone-600">${formatMoney(p.monto_estimado)}</div>
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap font-mono text-xs">${esc(p.fecha_estimada_entrega || '—')}</td>
          <td class="py-3.5 px-3 whitespace-nowrap">
            <select onchange="MaderoEcosistemaTerritorio.quickChangePedidoEstado('${esc(p.id)}', this.value)" class="text-[11px] bg-white border border-stone-300 rounded-lg px-2 py-1 font-semibold">
              ${opts}
            </select>
          </td>
          <td class="py-3.5 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoEcosistemaTerritorio.openPedidoModal('${esc(p.id)}', null)" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold">Editar</button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.handleDeletePedido('${esc(p.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold">×</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="glass-card p-4 sm:p-6 space-y-4">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 class="text-sm font-extrabold text-stone-900">Bitácora de Pedidos de Reposición</h3>
            <p class="text-xs text-stone-500">Seguimiento de órdenes desde la solicitud hasta la recepción en cada sucursal.</p>
          </div>
          <button type="button" onclick="MaderoEcosistemaTerritorio.openPedidoModal(null, null)" class="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800">+ Nuevo Pedido de Reposición</button>
        </div>

        <div class="overflow-x-auto rounded-xl border border-stone-200/70 bg-white/50">
          <table class="w-full text-left text-xs min-w-[900px]">
            <thead>
              <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                <th class="py-3 px-3">ID / Fecha</th>
                <th class="py-3 px-3">Artículo y Destino</th>
                <th class="py-3 px-3 text-center">Cant.</th>
                <th class="py-3 px-3">Proveedor / Monto Est.</th>
                <th class="py-3 px-3">Entrega Est.</th>
                <th class="py-3 px-3">Estado</th>
                <th class="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-200/60">${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderAppsModule() {
    activePresupuestoTab = 'apps';
    return renderMerchModule('m11-apps');
  }

  function renderMerchModule(forceSubnavId) {
    if (!forceSubnavId && activePresupuestoTab === 'apps') {
      activePresupuestoTab = 'merch';
    }
    const sum = window.MaderoStore.getComputedSummary();
    const activeSubnavId = forceSubnavId || 'm11-merch';
    const tabs = [
      { id: 'merch', label: `🎁 Merchandising y Reposición (${sum.merchTotalItems})` },
      { id: 'apps', label: `📱 Suscripciones de Apps (${sum.subsTotalCount})` },
      { id: 'movimientos', label: `🔄 Movimientos y Entregas (${sum.merchMovimientosCount})` },
      { id: 'cotizaciones', label: `🏷️ Proveedores y Cotizaciones (${sum.merchCotizacionesCount})` },
      { id: 'pedidos', label: `📦 Bitácora de Reposición (${sum.merchPedidosActivosCount})` }
    ];

    const exportAction = activePresupuestoTab === 'apps'
      ? `MaderoStore.exportSuscripcionesCSV(MaderoEcosistemaTerritorio.getFilteredApps()); MaderoUI.showToast('CSV de Suscripciones descargado')`
      : activePresupuestoTab === 'movimientos'
      ? `MaderoStore.exportMerchMovimientosCSV(MaderoEcosistemaTerritorio.getFilteredMovimientos()); MaderoUI.showToast('CSV de Movimientos descargado')`
      : activePresupuestoTab === 'cotizaciones'
      ? `MaderoStore.exportMerchCotizacionesCSV(); MaderoUI.showToast('CSV de Cotizaciones descargado')`
      : `MaderoStore.exportMerchCSV(MaderoEcosistemaTerritorio.getFilteredMerch()); MaderoUI.showToast('CSV de Merchandising descargado')`;

    const primaryBtnLabel = activePresupuestoTab === 'apps'
      ? '+ Nueva Suscripción App'
      : activePresupuestoTab === 'movimientos'
      ? '+ Registrar Movimiento'
      : activePresupuestoTab === 'cotizaciones'
      ? '+ Nueva Cotización'
      : activePresupuestoTab === 'pedidos'
      ? '+ Nuevo Pedido Reposición'
      : '+ Nuevo Ítem Merchandising';

    let tabBody = '';
    if (activePresupuestoTab === 'apps') tabBody = renderAppsTab(sum);
    else if (activePresupuestoTab === 'movimientos') tabBody = renderMovimientosTab();
    else if (activePresupuestoTab === 'cotizaciones') tabBody = renderCotizacionesTab();
    else if (activePresupuestoTab === 'pedidos') tabBody = renderPedidosTab();
    else tabBody = renderMerchTab(sum);

    return `
      <div class="space-y-5">
        ${renderClusterSubnav(activeSubnavId)}

        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="badge-pill badge-dark font-mono">Módulo 11 de 12</span>
                <span class="badge-pill badge-emerald">Operativo · Presupuesto</span>
                <span class="badge-pill badge-blue">Sección 4 y 5.11 · POP, Reposición &amp; Apps</span>
              </div>
              <h2 class="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">Presupuesto: Merchandising, Reposición y Suscripciones de Apps</h2>
              <p class="text-xs text-stone-600 mt-0.5">
                Control unificado de costos de apps digitales, inventario físico POP para reponer por sucursal, entregas con patente, cotizaciones y pedidos.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <button type="button" onclick="${exportAction}" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                ⬇ Exportar CSV
              </button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.openQuickNewPresupuesto()" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">
                ${esc(primaryBtnLabel)}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/80 cursor-pointer" onclick="MaderoEcosistemaTerritorio.setPresupuestoTab('apps')">
              <span class="text-[10px] font-bold uppercase text-sky-900 block">Suscripciones de Apps / Mes</span>
              <span class="font-mono text-2xl font-extrabold text-stone-900">${formatMoney(sum.subsMensualArs)}</span>
              <span class="text-[11px] text-sky-900 block mt-0.5">${sum.subsActivasCount} activas · ${sum.subsContratarCount} por contratar · ${sum.subsPorVencerCount} por vencer →</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80 cursor-pointer" onclick="MaderoEcosistemaTerritorio.setPresupuestoTab('merch')">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Valorización Stock POP</span>
              <span class="font-mono text-2xl font-extrabold text-stone-900">${formatMoney(sum.merchValorTotal)}</span>
              <span class="text-[11px] text-stone-600 block mt-0.5">En ${sum.merchTotalItems} líneas de materiales POP</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-rose-50/85 border border-rose-200/85 cursor-pointer" onclick="MaderoEcosistemaTerritorio.toggleMerchAlerta()">
              <span class="text-[10px] font-bold uppercase text-rose-900 block">Alertas de Reposición</span>
              <span class="font-mono text-2xl font-extrabold text-rose-950">${sum.merchBajoMinimoCount} ítem(s)</span>
              <span class="text-[11px] text-rose-800 font-semibold block mt-0.5">En ${(sum.merchAlertasPorSucursal || []).length} sucursal(es) · Filtrar →</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 cursor-pointer" onclick="MaderoEcosistemaTerritorio.setPresupuestoTab('pedidos')">
              <span class="text-[10px] font-bold uppercase text-amber-900 block">Previsión Compra + Pedidos</span>
              <span class="font-mono text-2xl font-extrabold text-amber-950">${formatMoney(sum.merchCostoReposicionEstimado)}</span>
              <span class="text-[11px] text-amber-800 block mt-0.5">${sum.merchPedidosActivosCount} pedido(s) en curso →</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-1.5 pt-1">
            ${tabs.map(t => `
              <button type="button" onclick="MaderoEcosistemaTerritorio.setPresupuestoTab('${t.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold border transition ${activePresupuestoTab === t.id ? 'bg-stone-900 text-white border-stone-900 shadow-xs' : 'bg-white/75 text-stone-700 border-stone-200 hover:bg-white'}">
                ${esc(t.label)}
              </button>
            `).join('')}
          </div>
        </div>

        ${tabBody}
      </div>
    `;
  }

  function openMerchModal(id) {
    const list = window.MaderoStore.getState().merchandising_stock || [];
    const existing = id ? list.find(i => i.id === id) : null;
    const item = existing || {
      id: '',
      articulo: '',
      categoria: 'Presentes de Entrega',
      sucursal_ubicacion: 'Comodoro Rivadavia',
      stock_actual: 20,
      stock_minimo_reposicion: 15,
      costo_unitario: 15000,
      destino_principal: '',
      utilizacion_periodo: '',
      necesidad_futura: '',
      responsable_control: 'Marketing Interno'
    };
    const merchSucNormalizada = String(item.sucursal_ubicacion || '').startsWith('Neuquén') ? 'Neuquén' : 'Comodoro Rivadavia';
    const plazasOpts = ['Comodoro Rivadavia', 'Neuquén'].map(pl =>
      `<option value="${esc(pl)}" ${merchSucNormalizada === pl ? 'selected' : ''}>${esc(pl)}</option>`
    ).join('');

    window.MaderoUI.openModal({
      title: existing ? `Editar Ítem Merchandising · ${existing.id}` : 'Registrar Ítem de Merchandising / POP',
      subtitle: 'Presupuesto · Inventario, destino, costo unitario, punto de reposición y proyección.',
      maxWidth: 'max-w-xl',
      bodyHtml: `
        <form class="space-y-3.5">
          <input type="hidden" id="mer-id" value="${esc(item.id)}">
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Artículo / Material POP *</label>
            <input type="text" id="mer-articulo" value="${esc(item.articulo)}" class="input-glass w-full px-3 py-2" required>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Categoría</label>
              <input type="text" id="mer-cat" value="${esc(item.categoria)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Sucursal / Depósito</label>
              <select id="mer-suc" class="input-glass w-full px-3 py-2">${plazasOpts}</select>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3 p-3 rounded-xl bg-stone-100/80 border border-stone-200/80">
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Stock Actual</label>
              <input type="number" id="mer-stock" value="${esc(item.stock_actual)}" min="0" class="input-glass w-full px-2.5 py-1.5 font-mono">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Mín. Reposición</label>
              <input type="number" id="mer-min" value="${esc(item.stock_minimo_reposicion)}" min="0" class="input-glass w-full px-2.5 py-1.5 font-mono">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Costo Unit. ($)</label>
              <input type="number" id="mer-costo" value="${esc(item.costo_unitario)}" min="0" class="input-glass w-full px-2.5 py-1.5 font-mono">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Destino Principal</label>
            <input type="text" id="mer-destino" value="${esc(item.destino_principal)}" class="input-glass w-full px-3 py-2">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Utilización en el Período</label>
            <input type="text" id="mer-uso" value="${esc(item.utilizacion_periodo)}" class="input-glass w-full px-3 py-2">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Necesidad Futura / Pedido de Reposición</label>
            <textarea id="mer-futuro" rows="2" class="input-glass w-full px-3 py-2">${esc(item.necesidad_futura)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Enlace Producto / Proveedor (opcional)</label>
            <input type="text" id="mer-url" value="${esc(item.enlace_url || '')}" placeholder="https://..." class="input-glass w-full px-3 py-2">
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoEcosistemaTerritorio.saveMerchFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">Guardar Ítem</button>
      `
    });
  }

  function saveMerchFromModal() {
    const articulo = document.getElementById('mer-articulo').value.trim();
    if (!articulo) {
      window.MaderoUI.showToast('El nombre del artículo es obligatorio', 'red');
      return;
    }
    window.MaderoStore.upsertMerchItem({
      id: document.getElementById('mer-id').value.trim() || undefined,
      articulo,
      categoria: document.getElementById('mer-cat').value.trim(),
      sucursal_ubicacion: document.getElementById('mer-suc').value,
      stock_actual: Number(document.getElementById('mer-stock').value) || 0,
      stock_minimo_reposicion: Number(document.getElementById('mer-min').value) || 0,
      costo_unitario: Number(document.getElementById('mer-costo').value) || 0,
      destino_principal: document.getElementById('mer-destino').value.trim(),
      utilizacion_periodo: document.getElementById('mer-uso').value.trim(),
      necesidad_futura: document.getElementById('mer-futuro').value.trim(),
      enlace_url: (document.getElementById('mer-url')?.value || '').trim()
    });
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Ítem de merchandising actualizado');
  }

  function handleDeleteMerch(id) {
    if (confirm(`¿Eliminar el ítem ${id}?`)) {
      window.MaderoStore.deleteMerchItem(id);
      window.MaderoUI.showToast(`Ítem ${id} eliminado`, 'amber');
    }
  }

  // Modales: Suscripciones de Apps
  function openSuscripcionModal(id) {
    const list = window.MaderoStore.getState().presupuesto_suscripciones || [];
    const existing = id ? list.find(s => s.id === id) : null;
    const item = existing || {
      id: '',
      app: '',
      categoria: 'IA y Productividad',
      plan_periodicidad: 'Mensual',
      moneda: 'USD',
      monto: 20,
      tipo_cambio: 1200,
      medio_pago: 'Tarjeta Corporativa ARQ · 1172',
      fecha_vencimiento: new Date().toISOString().slice(0, 10),
      responsable: 'Ángelo Lucero',
      estado: 'ACTIVA',
      comprobante_url: '',
      notas: ''
    };
    const categorias = ['IA y Productividad', 'Diseño y Video', 'Web y Hosting', 'Marketing y Pauta', 'Software / Gestión'];
    window.MaderoUI.openModal({
      title: existing ? `Editar Suscripción · ${existing.id}` : 'Registrar Suscripción de App',
      subtitle: 'Presupuesto · Control mensual/anual de herramientas digitales, moneda, vencimiento y medio de pago.',
      maxWidth: 'max-w-xl',
      bodyHtml: `
        <form class="space-y-3.5">
          <input type="hidden" id="sub-id" value="${esc(item.id)}">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Nombre de la App / Servicio *</label>
              <input type="text" id="sub-app" value="${esc(item.app)}" placeholder="Ej. ChatGPT Plus, Canva Pro..." class="input-glass w-full px-3 py-2" required>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Categoría</label>
              <select id="sub-cat" class="input-glass w-full px-3 py-2">
                ${categorias.map(c => `<option value="${esc(c)}" ${item.categoria === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-stone-100/80 border border-stone-200/80">
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Periodicidad</label>
              <select id="sub-per" class="input-glass w-full px-2 py-1.5">
                <option value="Mensual" ${item.plan_periodicidad === 'Mensual' ? 'selected' : ''}>Mensual</option>
                <option value="Anual" ${item.plan_periodicidad === 'Anual' ? 'selected' : ''}>Anual</option>
                <option value="Único" ${item.plan_periodicidad === 'Único' ? 'selected' : ''}>Pago Único</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Moneda</label>
              <select id="sub-mon" class="input-glass w-full px-2 py-1.5">
                <option value="ARS" ${item.moneda === 'ARS' ? 'selected' : ''}>ARS ($)</option>
                <option value="USD" ${item.moneda === 'USD' ? 'selected' : ''}>USD</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">Monto</label>
              <input type="number" id="sub-monto" value="${esc(item.monto)}" min="0" step="0.01" class="input-glass w-full px-2 py-1.5 font-mono">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-stone-700 mb-1">TC (si USD)</label>
              <input type="number" id="sub-tc" value="${esc(item.tipo_cambio || 1200)}" min="1" class="input-glass w-full px-2 py-1.5 font-mono">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Valor Ref. Plan Mensual (opcional)</label>
              <input type="number" id="sub-ref-mensual" value="${esc(item.precio_mensual_ref || '')}" min="0" step="0.01" placeholder="Ej. 13.99" class="input-glass w-full px-3 py-2 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Valor Ref. Plan Anual (opcional)</label>
              <input type="number" id="sub-ref-anual" value="${esc(item.precio_anual_ref || '')}" min="0" step="0.01" placeholder="Ej. 129.99" class="input-glass w-full px-3 py-2 font-mono">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Medio de Pago</label>
              <input type="text" id="sub-pago" list="sub-pago-list" value="${esc(item.medio_pago)}" class="input-glass w-full px-3 py-2">
              <datalist id="sub-pago-list">
                <option value="Tarjeta Corporativa ARQ · 1172">
                <option value="Tarjeta Corporativa">
                <option value="Mercado Pago">
                <option value="Transferencia Bancaria">
                <option value="Plan Hobby / Sin costo">
              </datalist>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Próx. Vencimiento</label>
              <input type="date" id="sub-vto" value="${esc(item.fecha_vencimiento)}" class="input-glass w-full px-3 py-2 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Estado</label>
              <select id="sub-estado" class="input-glass w-full px-3 py-2">
                <option value="ACTIVA" ${item.estado === 'ACTIVA' ? 'selected' : ''}>Activa</option>
                <option value="POR_VENCER" ${item.estado === 'POR_VENCER' ? 'selected' : ''}>Por Vencer</option>
                <option value="CONTRATAR" ${item.estado === 'CONTRATAR' ? 'selected' : ''}>Contratar</option>
                <option value="PENDIENTE_APROBACION" ${item.estado === 'PENDIENTE_APROBACION' ? 'selected' : ''}>Pend. Aprobación</option>
                <option value="PAUSADA" ${item.estado === 'PAUSADA' ? 'selected' : ''}>Pausada / Baja</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Responsable</label>
              <input type="text" id="sub-resp" value="${esc(item.responsable)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Link Facturación / Panel</label>
              <input type="text" id="sub-url" value="${esc(item.comprobante_url)}" placeholder="https://..." class="input-glass w-full px-3 py-2">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Uso / Notas</label>
            <textarea id="sub-notas" rows="2" class="input-glass w-full px-3 py-2">${esc(item.notas)}</textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoEcosistemaTerritorio.saveSuscripcionFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">Guardar Suscripción</button>
      `
    });
  }

  function saveSuscripcionFromModal() {
    const app = document.getElementById('sub-app').value.trim();
    if (!app) {
      window.MaderoUI.showToast('El nombre de la app es obligatorio', 'red');
      return;
    }
    const moneda = document.getElementById('sub-mon').value;
    window.MaderoStore.upsertSuscripcion({
      id: document.getElementById('sub-id').value.trim() || undefined,
      app,
      categoria: document.getElementById('sub-cat').value,
      plan_periodicidad: document.getElementById('sub-per').value,
      moneda,
      monto: Number(document.getElementById('sub-monto').value) || 0,
      precio_mensual_ref: Number(document.getElementById('sub-ref-mensual')?.value) || 0,
      precio_anual_ref: Number(document.getElementById('sub-ref-anual')?.value) || 0,
      tipo_cambio: moneda === 'USD' ? (Number(document.getElementById('sub-tc').value) || 1200) : 1,
      medio_pago: document.getElementById('sub-pago').value.trim(),
      fecha_vencimiento: document.getElementById('sub-vto').value,
      estado: document.getElementById('sub-estado').value,
      responsable: document.getElementById('sub-resp').value.trim(),
      comprobante_url: document.getElementById('sub-url').value.trim(),
      notas: document.getElementById('sub-notas').value.trim()
    });
    activePresupuestoTab = 'apps';
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Suscripción guardada');
  }

  function handleDeleteSuscripcion(id) {
    if (confirm(`¿Eliminar la suscripción ${id}?`)) {
      window.MaderoStore.deleteSuscripcion(id);
      window.MaderoUI.showToast(`Suscripción ${id} eliminada`, 'amber');
    }
  }

  function quickChangeSuscripcionPlan(id, nuevaPeriodicidad) {
    window.MaderoStore.setSuscripcionPeriodicidad(id, nuevaPeriodicidad);
    window.MaderoUI.showToast(`Plan de ${id} actualizado a ${nuevaPeriodicidad}`);
  }

  // Modales: Movimientos y Entregas por Fecha / Patente
  function openMovimientoModal(presetMerchId) {
    const merchList = window.MaderoStore.getState().merchandising_stock || [];
    const todayIso = new Date().toISOString().slice(0, 10);
    const merchOpts = merchList.map(m =>
      `<option value="${esc(m.id)}" ${presetMerchId === m.id ? 'selected' : ''}>${esc(m.id)} · ${esc(m.articulo)} (Stock: ${m.stock_actual})</option>`
    ).join('');
    const merchSucs = ['Comodoro Rivadavia', 'Neuquén'];
    const plazasOpts = merchSucs.map(pl => `<option value="${esc(pl)}">${esc(pl)}</option>`).join('');

    window.MaderoUI.openModal({
      title: 'Registrar Movimiento o Entrega de Merchandising',
      subtitle: 'Asentá entregas por fecha/patente, ingresos de reposición o traslados entre sucursales.',
      maxWidth: 'max-w-xl',
      bodyHtml: `
        <form class="space-y-3.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha *</label>
              <input type="date" id="mov-fecha" value="${esc(todayIso)}" class="input-glass w-full px-3 py-2 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Tipo de Movimiento</label>
              <select id="mov-tipo" class="input-glass w-full px-3 py-2">
                <option value="ENTREGA_CLIENTE">Entrega a Cliente (Descuenta stock)</option>
                <option value="INGRESO_REPOSICION">Ingreso por Reposición (Suma stock)</option>
                <option value="TRASLADO_SUCURSAL">Traslado a otra Sucursal (Descuenta)</option>
                <option value="AJUSTE_INVENTARIO">Ajuste de Inventario</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Artículo POP *</label>
            <select id="mov-merch" class="input-glass w-full px-3 py-2">${merchOpts}</select>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Cantidad *</label>
              <input type="number" id="mov-cant" value="1" min="1" class="input-glass w-full px-3 py-2 font-mono font-bold">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Patente / Operación</label>
              <input type="text" id="mov-patente" placeholder="Ej. AG082JF" class="input-glass w-full px-3 py-2 font-mono uppercase">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Responsable</label>
              <input type="text" id="mov-resp" value="Ángelo Lucero" class="input-glass w-full px-3 py-2">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Sucursal / Destino</label>
            <select id="mov-suc" class="input-glass w-full px-3 py-2">${plazasOpts}</select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Nota / Observación</label>
            <input type="text" id="mov-nota" placeholder="Ej. Entrega vehículo 0km o reposición proveedor..." class="input-glass w-full px-3 py-2">
          </div>
          <label class="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
            <input type="checkbox" id="mov-ajustar" checked class="rounded">
            <span>Actualizar automáticamente el stock físico del artículo</span>
          </label>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoEcosistemaTerritorio.saveMovimientoFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">Guardar Movimiento</button>
      `
    });
  }

  function saveMovimientoFromModal() {
    const merch_id = document.getElementById('mov-merch').value;
    if (!merch_id) {
      window.MaderoUI.showToast('Seleccioná un artículo de merchandising', 'red');
      return;
    }
    window.MaderoStore.addMerchMovimiento({
      fecha: document.getElementById('mov-fecha').value,
      tipo: document.getElementById('mov-tipo').value,
      merch_id,
      cantidad: Number(document.getElementById('mov-cant').value) || 1,
      patente: document.getElementById('mov-patente').value.trim(),
      responsable: document.getElementById('mov-resp').value.trim(),
      sucursal: document.getElementById('mov-suc').value,
      nota: document.getElementById('mov-nota').value.trim(),
      ajustar_stock: document.getElementById('mov-ajustar').checked
    });
    activePresupuestoTab = 'movimientos';
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Movimiento registrado');
  }

  function handleDeleteMovimiento(id) {
    if (confirm(`¿Eliminar el movimiento ${id} del historial? (No revierte el stock físico)`)) {
      window.MaderoStore.deleteMerchMovimiento(id);
      window.MaderoUI.showToast(`Movimiento ${id} eliminado`, 'amber');
    }
  }

  // Modales: Proveedores y Cotizaciones
  function handleCotizacionPdfSelect(inputEl) {
    const file = inputEl && inputEl.files && inputEl.files[0];
    if (!file) return;

    const nameEl = document.getElementById('cot-archivo-nombre');
    const urlEl = document.getElementById('cot-url');
    const badgeEl = document.getElementById('cot-pdf-status');
    if (nameEl) nameEl.value = file.name;
    if (badgeEl) badgeEl.textContent = `Subiendo ${file.name}...`;

    window.MaderoUI.uploadAttachmentFile(file, res => {
      if (res.ok && res.url) {
        if (urlEl) urlEl.value = res.url;
        if (badgeEl) badgeEl.textContent = `✓ ${file.name}`;
      } else {
        if (urlEl && /^data:/i.test(urlEl.value)) urlEl.value = '';
        if (badgeEl) badgeEl.textContent = 'No se pudo adjuntar';
      }
    });
  }

  function openCotizacionModal(id) {
    const list = window.MaderoStore.getState().merchandising_cotizaciones || [];
    const existing = id ? list.find(c => c.id === id) : null;
    const item = existing || {
      id: '',
      fecha: new Date().toISOString().slice(0, 10),
      proveedor: '',
      proveedor_email: '',
      item_kit: '',
      cantidad: 50,
      precio_unitario: 15000,
      plazo_entrega: '10 días hábiles',
      estado: 'EN_EVALUACION',
      enlace_url: '',
      archivo_nombre: '',
      notas: ''
    };
    window.MaderoUI.openModal({
      title: existing ? `Editar Cotización · ${existing.id}` : 'Registrar Cotización de Proveedor',
      subtitle: 'Comparativa de presupuestos para merchandising, kits de entrega o material POP.',
      maxWidth: 'max-w-xl',
      bodyHtml: `
        <form class="space-y-3.5">
          <input type="hidden" id="cot-id" value="${esc(item.id)}">
          <input type="hidden" id="cot-archivo-nombre" value="${esc(item.archivo_nombre || '')}">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Proveedor *</label>
              <input type="text" id="cot-prov" value="${esc(item.proveedor)}" placeholder="Ej. Face Publicidad, Plan X..." class="input-glass w-full px-3 py-2" required>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">E-mail del Proveedor</label>
              <input type="email" id="cot-email" value="${esc(item.proveedor_email || '')}" placeholder="ventas@proveedor.com" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha Cotización</label>
              <input type="date" id="cot-fecha" value="${esc(item.fecha)}" class="input-glass w-full px-3 py-2 font-mono">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Ítem / Kit Cotizado *</label>
            <input type="text" id="cot-item" value="${esc(item.item_kit)}" class="input-glass w-full px-3 py-2" required>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Cantidad</label>
              <input type="number" id="cot-cant" value="${esc(item.cantidad)}" min="1" class="input-glass w-full px-3 py-2 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Precio Unitario ($)</label>
              <input type="number" id="cot-unit" value="${esc(item.precio_unitario)}" min="0" class="input-glass w-full px-3 py-2 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Plazo Entrega</label>
              <input type="text" id="cot-plazo" value="${esc(item.plazo_entrega)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Estado</label>
              <select id="cot-estado" class="input-glass w-full px-3 py-2">
                <option value="EN_EVALUACION" ${item.estado === 'EN_EVALUACION' ? 'selected' : ''}>En Evaluación</option>
                <option value="SELECCIONADA" ${item.estado === 'SELECCIONADA' ? 'selected' : ''}>Seleccionada</option>
                <option value="ORDEN_EMITIDA" ${item.estado === 'ORDEN_EMITIDA' ? 'selected' : ''}>Orden Emitida</option>
                <option value="DESCARTADA" ${item.estado === 'DESCARTADA' ? 'selected' : ''}>Descartada</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Enlace / PDF Cotización</label>
              <input type="text" id="cot-url" value="${esc(item.enlace_url)}" placeholder="https://... o subí PDF abajo" class="input-glass w-full px-3 py-2">
              <div class="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                <label class="inline-flex items-center gap-1.5 cursor-pointer text-[11px]">
                  <span class="px-2.5 py-1 rounded-lg bg-[#de4800]/15 hover:bg-[#de4800] text-[#ff9c6e] hover:text-white border border-[#de4800]/35 font-semibold transition">📄 Subir PDF (hasta 3 MB)</span>
                  <input type="file" accept=".pdf,application/pdf,image/*" onchange="MaderoEcosistemaTerritorio.handleCotizacionPdfSelect(this)" class="hidden">
                </label>
                <span id="cot-pdf-status" class="text-[10px] text-stone-500 truncate max-w-[160px]">${esc(item.archivo_nombre || '')}</span>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Notas / Condiciones</label>
            <textarea id="cot-notas" rows="2" class="input-glass w-full px-3 py-2">${esc(item.notas)}</textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoEcosistemaTerritorio.saveCotizacionFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">Guardar Cotización</button>
      `
    });
  }

  function saveCotizacionFromModal() {
    const proveedor = document.getElementById('cot-prov').value.trim();
    const item_kit = document.getElementById('cot-item').value.trim();
    if (!proveedor || !item_kit) {
      window.MaderoUI.showToast('Proveedor e ítem cotizado son obligatorios', 'red');
      return;
    }
    window.MaderoStore.upsertMerchCotizacion({
      id: document.getElementById('cot-id').value.trim() || undefined,
      fecha: document.getElementById('cot-fecha').value,
      proveedor,
      proveedor_email: (document.getElementById('cot-email')?.value || '').trim(),
      item_kit,
      cantidad: Number(document.getElementById('cot-cant').value) || 1,
      precio_unitario: Number(document.getElementById('cot-unit').value) || 0,
      plazo_entrega: document.getElementById('cot-plazo').value.trim(),
      estado: document.getElementById('cot-estado').value,
      enlace_url: document.getElementById('cot-url').value.trim(),
      archivo_nombre: (document.getElementById('cot-archivo-nombre')?.value || '').trim(),
      notas: document.getElementById('cot-notas').value.trim()
    });
    activePresupuestoTab = 'cotizaciones';
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Cotización guardada');
  }

  function handleDeleteCotizacion(id) {
    if (confirm(`¿Eliminar la cotización ${id}?`)) {
      window.MaderoStore.deleteMerchCotizacion(id);
      window.MaderoUI.showToast(`Cotización ${id} eliminada`, 'amber');
    }
  }

  // Modales: Bitácora de Pedidos de Reposición
  function openPedidoModal(id, presetMerchId) {
    const list = window.MaderoStore.getState().merchandising_pedidos || [];
    const merchList = window.MaderoStore.getState().merchandising_stock || [];
    const existing = id ? list.find(p => p.id === id) : null;
    const presetItem = presetMerchId ? merchList.find(m => m.id === presetMerchId) : null;
    const item = existing || {
      id: '',
      fecha_pedido: new Date().toISOString().slice(0, 10),
      merch_id: presetItem ? presetItem.id : '',
      articulo: presetItem ? presetItem.articulo : '',
      cantidad: presetItem ? Math.max(10, (Number(presetItem.stock_minimo_reposicion) || 10) * 2 - (Number(presetItem.stock_actual) || 0)) : 20,
      sucursal_destino: presetItem ? presetItem.sucursal_ubicacion : 'Comodoro · Av. Polonia 546 (Salón Principal)',
      proveedor: '',
      monto_estimado: presetItem ? (Math.max(10, (Number(presetItem.stock_minimo_reposicion) || 10) * 2 - (Number(presetItem.stock_actual) || 0)) * (Number(presetItem.costo_unitario) || 0)) : 0,
      estado: 'SOLICITADO',
      fecha_estimada_entrega: '',
      responsable: 'Ángelo Lucero',
      nota: ''
    };
    const merchSucDest = String(item.sucursal_destino || '').startsWith('Neuquén') ? 'Neuquén' : 'Comodoro Rivadavia';
    const plazasOpts = ['Comodoro Rivadavia', 'Neuquén'].map(pl =>
      `<option value="${esc(pl)}" ${merchSucDest === pl ? 'selected' : ''}>${esc(pl)}</option>`
    ).join('');

    window.MaderoUI.openModal({
      title: existing ? `Editar Pedido de Reposición · ${existing.id}` : 'Nuevo Pedido de Reposición',
      subtitle: 'Bitácora de compras y despachos POP hacia sucursales.',
      maxWidth: 'max-w-xl',
      bodyHtml: `
        <form class="space-y-3.5">
          <input type="hidden" id="ped-id" value="${esc(item.id)}">
          <input type="hidden" id="ped-merch-id" value="${esc(item.merch_id)}">
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Artículo / Material a Reponer *</label>
            <input type="text" id="ped-art" value="${esc(item.articulo)}" class="input-glass w-full px-3 py-2" required>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha Pedido</label>
              <input type="date" id="ped-fecha" value="${esc(item.fecha_pedido)}" class="input-glass w-full px-3 py-2 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Cantidad</label>
              <input type="number" id="ped-cant" value="${esc(item.cantidad)}" min="1" class="input-glass w-full px-3 py-2 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Monto Est. ($)</label>
              <input type="number" id="ped-monto" value="${esc(item.monto_estimado)}" min="0" class="input-glass w-full px-3 py-2 font-mono">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Sucursal Destino</label>
              <select id="ped-suc" class="input-glass w-full px-3 py-2">${plazasOpts}</select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Proveedor</label>
              <input type="text" id="ped-prov" value="${esc(item.proveedor)}" placeholder="Ej. Face Publicidad, Plan X..." class="input-glass w-full px-3 py-2">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Estado</label>
              <select id="ped-estado" class="input-glass w-full px-3 py-2">
                <option value="SOLICITADO" ${item.estado === 'SOLICITADO' ? 'selected' : ''}>Solicitado</option>
                <option value="APROBADO_DIRECCION" ${item.estado === 'APROBADO_DIRECCION' ? 'selected' : ''}>Aprobado Dirección</option>
                <option value="EN_PRODUCCION" ${item.estado === 'EN_PRODUCCION' ? 'selected' : ''}>En Producción</option>
                <option value="ENVIADO" ${item.estado === 'ENVIADO' ? 'selected' : ''}>Enviado / En Camino</option>
                <option value="RECIBIDO" ${item.estado === 'RECIBIDO' ? 'selected' : ''}>Recibido</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Entrega Estimada</label>
              <input type="date" id="ped-entrega" value="${esc(item.fecha_estimada_entrega)}" class="input-glass w-full px-3 py-2 font-mono">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Responsable</label>
              <input type="text" id="ped-resp" value="${esc(item.responsable)}" class="input-glass w-full px-3 py-2">
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Nota</label>
            <textarea id="ped-nota" rows="2" class="input-glass w-full px-3 py-2">${esc(item.nota)}</textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoEcosistemaTerritorio.savePedidoFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">Guardar Pedido</button>
      `
    });
  }

  function savePedidoFromModal() {
    const articulo = document.getElementById('ped-art').value.trim();
    if (!articulo) {
      window.MaderoUI.showToast('El artículo a reponer es obligatorio', 'red');
      return;
    }
    window.MaderoStore.upsertMerchPedido({
      id: document.getElementById('ped-id').value.trim() || undefined,
      merch_id: document.getElementById('ped-merch-id').value.trim(),
      articulo,
      fecha_pedido: document.getElementById('ped-fecha').value,
      cantidad: Number(document.getElementById('ped-cant').value) || 1,
      monto_estimado: Number(document.getElementById('ped-monto').value) || 0,
      sucursal_destino: document.getElementById('ped-suc').value,
      proveedor: document.getElementById('ped-prov').value.trim(),
      estado: document.getElementById('ped-estado').value,
      fecha_estimada_entrega: document.getElementById('ped-entrega').value,
      responsable: document.getElementById('ped-resp').value.trim(),
      nota: document.getElementById('ped-nota').value.trim()
    });
    activePresupuestoTab = 'pedidos';
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Pedido de reposición guardado');
  }

  function handleDeletePedido(id) {
    if (confirm(`¿Eliminar el pedido ${id}?`)) {
      window.MaderoStore.deleteMerchPedido(id);
      window.MaderoUI.showToast(`Pedido ${id} eliminado`, 'amber');
    }
  }

  function quickChangePedidoEstado(id, nuevoEstado) {
    window.MaderoStore.setMerchPedidoEstado(id, nuevoEstado);
    window.MaderoUI.showToast(`Pedido ${id} actualizado`);
  }

  // ========================================================================
  // MÓDULO 12: RELACIÓN CON VENTAS Y STOCK PRIORITARIO (Sección 5.12)
  // ========================================================================
  function setVentasSearch(val) {
    filtersVentas.search = val;
    window.MaderoApp.renderAll();
  }

  function setVentasFilter(key, val) {
    filtersVentas[key] = val;
    window.MaderoApp.renderAll();
  }

  function toggleVentasAbiertos() {
    filtersVentas.onlyAbiertos = !filtersVentas.onlyAbiertos;
    window.MaderoApp.renderAll();
  }

  function getFilteredVentas() {
    const list = window.MaderoStore.getState().ventas_feedback || [];
    const q = filtersVentas.search.trim().toLowerCase();
    return list.filter(v => {
      if (filtersVentas.tipo !== 'ALL' && v.tipo !== filtersVentas.tipo) return false;
      if (filtersVentas.plaza !== 'ALL' && v.sucursal_plaza !== filtersVentas.plaza) return false;
      if (filtersVentas.onlyAbiertos && (v.cierre_verificado || v.estado === 'CERRADO_EVIDENCIA')) return false;
      if (q) {
        const hay = [v.id, v.sucursal_plaza, v.referente_ventas, v.unidades_involucradas, v.descripcion, v.accion_marketing, v.responsable].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderVentasModule() {
    const filtered = getFilteredVentas();
    const sum = window.MaderoStore.getComputedSummary();

    const rowsHtml = filtered.length === 0 ? `
      <tr><td colspan="7" class="py-10 text-center text-xs text-stone-500">No hay registros comerciales para el filtro seleccionado.</td></tr>
    ` : filtered.map(v => {
      const estadoOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
        `<option value="${st.id}" ${v.estado === st.id ? 'selected' : ''}>${esc(st.shortLabel)}</option>`
      ).join('');

      return `
        <tr class="hover:bg-white/60 transition align-top">
          <td class="py-3.5 px-3 whitespace-nowrap">
            <span class="font-mono font-bold text-stone-900 text-xs px-1.5 py-0.5 rounded bg-stone-200/75 border border-stone-300/80">${esc(v.id)}</span>
            <div class="font-mono text-[10px] text-stone-500 mt-1">📅 ${window.MaderoUI.formatDateDisplay(v.fecha)}</div>
            <div class="mt-1">${tipoVentaBadge(v.tipo)}</div>
          </td>
          <td class="py-3.5 px-3 min-w-[180px]">
            <span class="font-bold text-stone-900 text-xs block">${esc(v.sucursal_plaza)}</span>
            <span class="text-[11px] text-stone-600 block mt-0.5">👤 ${esc(v.referente_ventas)}</span>
          </td>
          <td class="py-3.5 px-3 min-w-[230px] max-w-[310px]">
            <button type="button" onclick="MaderoEcosistemaTerritorio.openVentaModal('${esc(v.id)}')" class="text-left group">
              <span class="font-mono font-bold text-stone-900 group-hover:text-blue-900 text-xs block">${esc(v.unidades_involucradas)}</span>
            </button>
            <p class="text-[11px] text-stone-700 mt-1 leading-snug">${esc(v.descripcion)}</p>
          </td>
          <td class="py-3.5 px-3 min-w-[230px] max-w-[310px]">
            <div class="p-2.5 rounded-xl bg-stone-100/85 border border-stone-200/80 text-[11px] text-stone-800 leading-snug">
              <strong class="block text-[10px] uppercase text-stone-500 mb-0.5">Respuesta / Acción Marketing:</strong>
              ${esc(v.accion_marketing)}
            </div>
            <div class="mt-1 text-[10px] text-stone-500">${window.MaderoUI.actorBadge(v.actor_id, true)} · ${esc(v.responsable)}</div>
          </td>
          <td class="py-3.5 px-3 whitespace-nowrap">
            <div class="mb-1.5">${window.MaderoUI.estadoBadge(v.estado, true)}</div>
            <select onchange="MaderoStore.setVentaEstado('${esc(v.id)}', this.value); MaderoUI.showToast('Estado actualizado')" class="text-[10px] bg-white border border-stone-300 rounded-lg px-2 py-1 text-stone-700 w-full">
              ${estadoOpts}
            </select>
          </td>
          <td class="py-3.5 px-3 text-center whitespace-nowrap">
            <button type="button" onclick="MaderoStore.toggleVentaCierre('${esc(v.id)}')" class="px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${v.cierre_verificado ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'}">
              ${v.cierre_verificado ? '✓ Verificado Ventas' : 'Marcar Verificado'}
            </button>
          </td>
          <td class="py-3.5 px-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button type="button" onclick="MaderoEcosistemaTerritorio.openVentaModal('${esc(v.id)}')" class="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-semibold">Editar</button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.handleDeleteVenta('${esc(v.id)}')" class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 text-[11px] font-bold">×</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="space-y-5">
        ${renderClusterSubnav('m12-ventas')}

        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="badge-pill badge-dark font-mono">Módulo 12 de 12</span>
                <span class="badge-pill badge-emerald">Operativo · Paso 5</span>
                <span class="badge-pill badge-amber">Sección 5.12 · Coordinación Comercial</span>
              </div>
              <h2 class="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">Relación con Ventas: Stock Prioritario (+180d), Calidad de Leads y Desvíos</h2>
              <p class="text-xs text-stone-600 mt-0.5">
                Articulación semanal entre Marketing y los equipos comerciales de Polonia, Alem, CAM D'Andrea, Neuquén y Cordillera.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <button type="button" onclick="MaderoStore.exportVentasCSV(MaderoEcosistemaTerritorio.getFilteredVentas()); MaderoUI.showToast('CSV de Relación con Ventas descargado')" class="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50">
                ⬇ Exportar CSV Ventas
              </button>
              <button type="button" onclick="MaderoEcosistemaTerritorio.openVentaModal(null)" class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold">
                + Nuevo Requerimiento de Ventas
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 cursor-pointer" onclick="MaderoEcosistemaTerritorio.setVentasFilter('tipo', 'STOCK_PRIORITARIO')">
              <span class="text-[10px] font-bold uppercase text-amber-900 block">Stock Prioritario (+180d)</span>
              <span class="font-mono text-2xl font-extrabold text-amber-950">${sum.ventasStockPrioritarioCount}</span>
              <span class="text-[11px] text-amber-800 block mt-0.5">Empuje focalizado de rotación →</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 cursor-pointer" onclick="MaderoEcosistemaTerritorio.setVentasFilter('tipo', 'CALIDAD_LEADS')">
              <span class="text-[10px] font-bold uppercase text-blue-900 block">Feedback Calidad de Leads</span>
              <span class="font-mono text-2xl font-extrabold text-blue-950">${sum.ventasCalidadLeadsCount}</span>
              <span class="text-[11px] text-blue-800 block mt-0.5">Devoluciones de salón sobre pauta →</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 cursor-pointer" onclick="MaderoEcosistemaTerritorio.setVentasFilter('tipo', 'PROBLEMA_PUBLICACION')">
              <span class="text-[10px] font-bold uppercase text-rose-900 block">Desvíos en Publicación</span>
              <span class="font-mono text-2xl font-extrabold text-rose-950">${sum.ventasDesviosPubCount}</span>
              <span class="text-[11px] text-rose-800 block mt-0.5">Diferencias salón vs web/redes →</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80">
              <span class="text-[10px] font-bold uppercase text-stone-500 block">Frentes Comerciales Activos</span>
              <span class="font-mono text-2xl font-extrabold text-stone-900">${sum.ventasAbiertosCount} / ${sum.ventasTotal}</span>
              <span class="text-[11px] text-emerald-700 font-semibold block mt-0.5">En seguimiento hasta validación</span>
            </div>
          </div>
        </div>

        <div class="glass-card p-4 sm:p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2 flex-1">
              <input type="text" id="ventas-search-input" value="${esc(filtersVentas.search)}" oninput="MaderoEcosistemaTerritorio.setVentasSearch(this.value)" placeholder="Buscar patente, modelo, sucursal, referente de ventas..." class="input-glass px-3.5 py-2 w-full sm:w-72">
              <select onchange="MaderoEcosistemaTerritorio.setVentasFilter('tipo', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Todos los Tipos</option>
                <option value="STOCK_PRIORITARIO" ${filtersVentas.tipo === 'STOCK_PRIORITARIO' ? 'selected' : ''}>Stock Prioritario (+180d)</option>
                <option value="CALIDAD_LEADS" ${filtersVentas.tipo === 'CALIDAD_LEADS' ? 'selected' : ''}>Devolución Calidad de Leads</option>
                <option value="PROBLEMA_PUBLICACION" ${filtersVentas.tipo === 'PROBLEMA_PUBLICACION' ? 'selected' : ''}>Desvío en Publicación</option>
                <option value="PEDIDO_COMERCIAL" ${filtersVentas.tipo === 'PEDIDO_COMERCIAL' ? 'selected' : ''}>Pedido Comercial de Salón</option>
              </select>
              <select onchange="MaderoEcosistemaTerritorio.setVentasFilter('plaza', this.value)" class="input-glass px-3 py-2">
                <option value="ALL">Todas las Sucursales</option>
                ${window.MaderoData.PLAZAS.map(pl => `<option value="${esc(pl)}" ${filtersVentas.plaza === pl ? 'selected' : ''}>${esc(pl)}</option>`).join('')}
              </select>
            </div>
            <button type="button" onclick="MaderoEcosistemaTerritorio.toggleVentasAbiertos()" class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${filtersVentas.onlyAbiertos ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border-stone-300'}">
              Solo Pendientes de Cierre (${sum.ventasAbiertosCount})
            </button>
          </div>

          <div class="overflow-x-auto rounded-xl border border-stone-200/70 bg-white/50">
            <table class="w-full text-left text-xs min-w-[960px]">
              <thead>
                <tr class="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100/70">
                  <th class="py-3 px-3">ID / Fecha / Tipo</th>
                  <th class="py-3 px-3">Sucursal &amp; Referente</th>
                  <th class="py-3 px-3">Unidades / Necesidad o Devolución</th>
                  <th class="py-3 px-3">Acción de Marketing y Responsable</th>
                  <th class="py-3 px-3">Estado (Secc. 7)</th>
                  <th class="py-3 px-3 text-center">Conformidad Ventas</th>
                  <th class="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200/60">${rowsHtml}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function openVentaModal(id) {
    const list = window.MaderoStore.getState().ventas_feedback || [];
    const existing = id ? list.find(i => i.id === id) : null;
    const item = existing || {
      id: '',
      fecha: window.MaderoStore.getState().meta.fecha_corte || '2026-11-06',
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
    };
    const plazasOpts = (window.MaderoData.PLAZAS || []).map(pl =>
      `<option value="${esc(pl)}" ${item.sucursal_plaza === pl ? 'selected' : ''}>${esc(pl)}</option>`
    ).join('');
    const estadosOpts = Object.values(window.MaderoData.ESTADOS_SEGUIMIENTO).map(st =>
      `<option value="${st.id}" ${item.estado === st.id ? 'selected' : ''}>${esc(st.label)}</option>`
    ).join('');

    window.MaderoUI.openModal({
      title: existing ? `Editar Requerimiento de Ventas · ${existing.id}` : 'Registrar Requerimiento / Devolución de Ventas',
      subtitle: 'Sección 5.12 · Necesidades comerciales, calidad de leads, stock prioritario y desvíos detectados.',
      maxWidth: 'max-w-2xl',
      bodyHtml: `
        <form class="space-y-3.5">
          <input type="hidden" id="vta-id" value="${esc(item.id)}">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Fecha</label>
              <input type="date" id="vta-fecha" value="${esc(item.fecha)}" class="input-glass w-full px-3 py-2">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Tipo de Requerimiento</label>
              <select id="vta-tipo" class="input-glass w-full px-3 py-2 font-semibold">
                <option value="STOCK_PRIORITARIO" ${item.tipo === 'STOCK_PRIORITARIO' ? 'selected' : ''}>Stock Prioritario (+180d)</option>
                <option value="CALIDAD_LEADS" ${item.tipo === 'CALIDAD_LEADS' ? 'selected' : ''}>Devolución Calidad de Leads</option>
                <option value="PROBLEMA_PUBLICACION" ${item.tipo === 'PROBLEMA_PUBLICACION' ? 'selected' : ''}>Desvío en Publicación</option>
                <option value="PEDIDO_COMERCIAL" ${item.tipo === 'PEDIDO_COMERCIAL' ? 'selected' : ''}>Pedido Comercial de Salón</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Sucursal / Plaza</label>
              <select id="vta-plaza" class="input-glass w-full px-3 py-2">${plazasOpts}</select>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Referente de Ventas Solicitante *</label>
              <input type="text" id="vta-ref" value="${esc(item.referente_ventas)}" placeholder="Ej: Gerencia Ventas Polonia" class="input-glass w-full px-3 py-2" required>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-700 mb-1">Unidades / Patentes / Campaña Involucrada *</label>
              <input type="text" id="vta-unidades" value="${esc(item.unidades_involucradas)}" placeholder="Ej: AE-901-BC (Amarok V6)" class="input-glass w-full px-3 py-2" required>
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Descripción del Pedido o Problema Reportado por Ventas</label>
            <textarea id="vta-desc" rows="2" class="input-glass w-full px-3 py-2">${esc(item.descripcion)}</textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-stone-700 mb-1">Acción Tomada por Marketing</label>
            <textarea id="vta-accion" rows="2" class="input-glass w-full px-3 py-2">${esc(item.accion_marketing)}</textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-stone-100/80 border border-stone-200/80">
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Actor Ejecutor</label>
              <select id="vta-actor" class="input-glass w-full px-3 py-1.5">
                <option value="MKT_INTERNO" ${item.actor_id === 'MKT_INTERNO' ? 'selected' : ''}>Marketing Interno</option>
                <option value="REM" ${item.actor_id === 'REM' ? 'selected' : ''}>REM</option>
                <option value="CHRISTIAN_WEB" ${item.actor_id === 'CHRISTIAN_WEB' ? 'selected' : ''}>L. Christian (Web)</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Responsable</label>
              <input type="text" id="vta-resp" value="${esc(item.responsable)}" class="input-glass w-full px-3 py-1.5">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-stone-800 mb-1">Estado Oficial</label>
              <select id="vta-estado" class="input-glass w-full px-3 py-1.5">${estadosOpts}</select>
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" onclick="MaderoUI.closeModal()" class="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">Cancelar</button>
        <button type="button" onclick="MaderoEcosistemaTerritorio.saveVentaFromModal()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">Guardar Registro</button>
      `
    });
  }

  function saveVentaFromModal() {
    const unidades = document.getElementById('vta-unidades').value.trim();
    if (!unidades) {
      window.MaderoUI.showToast('Indicá las unidades o campaña involucrada', 'red');
      return;
    }
    const estado = document.getElementById('vta-estado').value;
    window.MaderoStore.upsertVentaFeedback({
      id: document.getElementById('vta-id').value.trim() || undefined,
      fecha: document.getElementById('vta-fecha').value,
      tipo: document.getElementById('vta-tipo').value,
      sucursal_plaza: document.getElementById('vta-plaza').value,
      referente_ventas: document.getElementById('vta-ref').value.trim(),
      unidades_involucradas: unidades,
      descripcion: document.getElementById('vta-desc').value.trim(),
      accion_marketing: document.getElementById('vta-accion').value.trim(),
      actor_id: document.getElementById('vta-actor').value,
      responsable: document.getElementById('vta-resp').value.trim(),
      estado,
      cierre_verificado: estado === 'CERRADO_EVIDENCIA'
    });
    window.MaderoUI.closeModal();
    window.MaderoUI.showToast('Requerimiento comercial guardado');
  }

  function handleDeleteVenta(id) {
    if (confirm(`¿Eliminar el registro comercial ${id}?`)) {
      window.MaderoStore.deleteVentaFeedback(id);
      window.MaderoUI.showToast(`Registro ${id} eliminado`, 'amber');
    }
  }

  return {
    renderGoogleModule,
    renderWebModule,
    renderEventosModule,
    renderMerchModule,
    renderAppsModule,
    renderVentasModule,
    // Google
    setGoogleSearch,
    setGoogleFilter,
    resetGoogleFilters,
    getFilteredGoogle,
    openGoogleModal,
    saveGoogleFromModal,
    handleDeleteGoogle,
    // Web
    setWebSearch,
    setWebFilter,
    resetWebFilters,
    getFilteredWeb,
    openWebModal,
    saveWebFromModal,
    handleDeleteWeb,
    // Eventos
    setEventosSearch,
    setEventosPlaza,
    getFilteredEventos,
    openEventoModal,
    saveEventoFromModal,
    handleDeleteEvento,
    // Presupuesto & Merch
    setPresupuestoTab,
    openQuickNewPresupuesto,
    setMerchSearch,
    setMerchSucursal,
    filterMerchBySucursalAlerta,
    toggleMerchAlerta,
    clearMerchFilters,
    getFilteredMerch,
    openMerchModal,
    saveMerchFromModal,
    handleDeleteMerch,
    setAppsSearch,
    setAppsFilter,
    getFilteredApps,
    openSuscripcionModal,
    saveSuscripcionFromModal,
    handleDeleteSuscripcion,
    quickChangeSuscripcionPlan,
    setMovimientosSearch,
    setMovimientosTipo,
    getFilteredMovimientos,
    openMovimientoModal,
    saveMovimientoFromModal,
    handleDeleteMovimiento,
    openCotizacionModal,
    handleCotizacionPdfSelect,
    saveCotizacionFromModal,
    handleDeleteCotizacion,
    openPedidoModal,
    savePedidoFromModal,
    handleDeletePedido,
    quickChangePedidoEstado,
    // Ventas
    setVentasSearch,
    setVentasFilter,
    toggleVentasAbiertos,
    getFilteredVentas,
    openVentaModal,
    saveVentaFromModal,
    handleDeleteVenta
  };
})();

