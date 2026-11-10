/* ==========================================================================
   Madero Automotores · Control Integral de Marketing
   Catálogos Normados (Dirección 28/10/2026) & Línea de Base Inicial
   ========================================================================== */

window.MaderoData = (function () {
  // ------------------------------------------------------------------------
  // 1. LOS 9 ESTADOS OFICIALES DEL CIRCUITO DE SEGUIMIENTO (Sección 7)
  // ------------------------------------------------------------------------
  const ESTADOS_SEGUIMIENTO = {
    PENDIENTE_INFO_MADERO: {
      id: 'PENDIENTE_INFO_MADERO',
      label: 'Pendiente de información de Madero',
      shortLabel: 'Pend. Info Madero',
      badge: 'badge-violet',
      dot: 'bg-violet-500',
      uso: 'Falta un acceso, dato, material o aprobación interna.'
    },
    PENDIENTE_INICIO: {
      id: 'PENDIENTE_INICIO',
      label: 'Pendiente de inicio',
      shortLabel: 'Pendiente inicio',
      badge: 'badge-stone',
      dot: 'bg-stone-500',
      uso: 'El compromiso está definido, pero la ejecución todavía no comenzó.'
    },
    EN_ELABORACION: {
      id: 'EN_ELABORACION',
      label: 'En elaboración',
      shortLabel: 'En elaboración',
      badge: 'badge-blue',
      dot: 'bg-blue-500',
      uso: 'El responsable está trabajando sobre el entregable.'
    },
    ENTREGADO_REVISION: {
      id: 'ENTREGADO_REVISION',
      label: 'Entregado a revisión',
      shortLabel: 'A revisión Madero',
      badge: 'badge-sky',
      dot: 'bg-sky-500',
      uso: 'Existe una entrega que Madero debe controlar.'
    },
    OBSERVADO_MADERO: {
      id: 'OBSERVADO_MADERO',
      label: 'Observado por Madero',
      shortLabel: 'Observado Madero',
      badge: 'badge-amber',
      dot: 'bg-amber-500',
      uso: 'La entrega requiere aclaración o corrección.'
    },
    DEVUELTO_CORRECCION: {
      id: 'DEVUELTO_CORRECCION',
      label: 'Devuelto para corrección',
      shortLabel: 'Devuelto a corregir',
      badge: 'badge-orange',
      dot: 'bg-orange-500',
      uso: 'El proveedor recibió una devolución concreta y debe presentar una nueva versión.'
    },
    REPROGRAMADO: {
      id: 'REPROGRAMADO',
      label: 'Reprogramado',
      shortLabel: 'Reprogramado',
      badge: 'badge-purple',
      dot: 'bg-purple-500',
      uso: 'Se acordó una nueva fecha y quedó registrado el motivo.'
    },
    ATRASADO: {
      id: 'ATRASADO',
      label: 'Atrasado',
      shortLabel: 'Atrasado',
      badge: 'badge-red',
      dot: 'bg-rose-600',
      uso: 'La fecha acordada venció sin entrega aceptada ni reprogramación confirmada.'
    },
    CERRADO_EVIDENCIA: {
      id: 'CERRADO_EVIDENCIA',
      label: 'Cerrado con evidencia',
      shortLabel: 'Cerrado c/ evidencia',
      badge: 'badge-emerald',
      dot: 'bg-emerald-500',
      uso: 'El resultado fue verificado y validado.'
    }
  };

  // ------------------------------------------------------------------------
  // 2. SEPARACIÓN DE RESPONSABILIDADES — LOS 6 ACTORES (Sección 1 y 4)
  // ------------------------------------------------------------------------
  const ACTORES = {
    MKT_INTERNO: {
      id: 'MKT_INTERNO',
      label: 'Marketing Interno',
      shortLabel: 'Mkt Interno',
      badge: 'badge-emerald',
      dot: 'bg-emerald-600'
    },
    REM: {
      id: 'REM',
      label: 'REM (Agencia Externa)',
      shortLabel: 'REM',
      badge: 'badge-blue',
      dot: 'bg-blue-600'
    },
    CHRISTIAN_WEB: {
      id: 'CHRISTIAN_WEB',
      label: 'L. Christian (Web / Dev)',
      shortLabel: 'L. Christian',
      badge: 'badge-sky',
      dot: 'bg-sky-600'
    },
    OTRO_PRESTADOR: {
      id: 'OTRO_PRESTADOR',
      label: 'Otros Prestadores',
      shortLabel: 'Otro Prestador',
      badge: 'badge-purple',
      dot: 'bg-purple-600'
    },
    AREAS_MADERO: {
      id: 'AREAS_MADERO',
      label: 'Áreas de Madero (Ventas / CAM / Admin)',
      shortLabel: 'Áreas Madero',
      badge: 'badge-amber',
      dot: 'bg-amber-600'
    },
    DIRECCION: {
      id: 'DIRECCION',
      label: 'Dirección de Madero',
      shortLabel: 'Dirección',
      badge: 'badge-dark',
      dot: 'bg-stone-900'
    }
  };

  // ------------------------------------------------------------------------
  // 3. PLAZAS Y SUCURSALES OPERATIVAS DE MADERO AUTOMOTORES
  // ------------------------------------------------------------------------
  const PLAZAS = [
    'Todas las plazas (Transversal)',
    'Comodoro · Av. Polonia 546 (Salón Principal)',
    'Comodoro · Av. Alem 828',
    'Comodoro · CAM (Monseñor D\'Andrea 1967)',
    'Comodoro · Colón Stock',
    'Neuquén · Madero Neuquén',
    'Cordillera · Cordillera Venta'
  ];

  const PRIORIDADES = {
    CRITICA: { id: 'CRITICA', label: 'Crítica', badge: 'badge-red' },
    ALTA: { id: 'ALTA', label: 'Alta', badge: 'badge-amber' },
    MEDIA: { id: 'MEDIA', label: 'Media', badge: 'badge-blue' },
    BAJA: { id: 'BAJA', label: 'Baja', badge: 'badge-stone' }
  };

  // ------------------------------------------------------------------------
  // 3B. PROVEEDORES EXTERNOS, POSICIÓN DE MADERO Y FORMALIZACIÓN (Secc. 7 y 8)
  // ------------------------------------------------------------------------
  const PROVEEDORES = {
    REM: { id: 'REM', label: 'REM', nombre: 'REM (Agencia Externa)', nombreCorto: 'REM' },
    CHRISTIAN_WEB: { id: 'CHRISTIAN_WEB', label: 'L. Christian', nombre: 'L. Christian (Web / Dev)', nombreCorto: 'L. Christian' },
    OTRO_PRESTADOR: { id: 'OTRO_PRESTADOR', label: 'Otro Prestador', nombre: 'Otros Prestadores Especiales', nombreCorto: 'Otros' }
  };

  const POSICIONES_MADERO = {
    APROBADO: { id: 'APROBADO', label: 'Aprobado / Conforme', badge: 'badge-emerald' },
    CONFORME: { id: 'APROBADO', label: 'Aprobado / Conforme', badge: 'badge-emerald' },
    OBSERVADO: { id: 'OBSERVADO', label: 'Observado por Madero', badge: 'badge-amber' },
    RECHAZADO: { id: 'RECHAZADO', label: 'Rechazado formalmente', badge: 'badge-red' },
    REQUIERE_AJUSTE: { id: 'REQUIERE_AJUSTE', label: 'Requiere ajuste en minuta', badge: 'badge-orange' },
    EN_REVISION: { id: 'EN_REVISION', label: 'En revisión / Pendiente', badge: 'badge-sky' },
    PENDIENTE_AUDITORIA: { id: 'EN_REVISION', label: 'En revisión / Pendiente', badge: 'badge-sky' }
  };

  // Posiciones que exigen dejar la disconformidad asentada en minuta (Sección 8)
  const POSICIONES_REQUIEREN_MINUTA = ['OBSERVADO', 'RECHAZADO', 'REQUIERE_AJUSTE'];

  // Los 7 pasos literales del circuito de formalización (Sección 8)
  const PASOS_FORMALIZACION = [
    { num: 1, label: 'Paso 1 · Evidencia', desc: 'Registrar el entregable o compromiso y conservar la evidencia.' },
    { num: 2, label: 'Paso 2 · Observación', desc: 'Expresar con claridad qué aspecto Madero observa y cuál es el estándar esperado.' },
    { num: 3, label: 'Paso 3 · Plazo y Responsable', desc: 'Definir quién debe corregirlo y cuál es la fecha acordada para la nueva entrega.' },
    { num: 4, label: 'Paso 4 · Minuta Textual', desc: 'Verificar que la minuta reproduzca la observación, la respuesta y el compromiso sin suavizar su contenido.' },
    { num: 5, label: 'Paso 5 · Reclamo por Omisión', desc: 'Solicitar la corrección de la minuta cuando el punto haya sido omitido o quede ambiguo.' },
    { num: 6, label: 'Paso 6 · Traslado al Tablero', desc: 'Trasladar el compromiso al tablero y mantenerlo en seguimiento hasta la validación final.' },
    { num: 7, label: 'Paso 7 · Validación de Cierre', desc: 'Validar formalmente el cumplimiento con evidencia antes de dar por cerrado el desvío.' }
  ];

  // ------------------------------------------------------------------------
  // 4. MAPA OFICIAL DE LOS 12 MÓDULOS EXIGIDOS POR DIRECCIÓN (Sección 5)
  // ------------------------------------------------------------------------
  const MODULOS_SISTEMA = [
    {
      num: 1,
      id: 'm1-agenda',
      cluster: 'conduccion',
      paso: 1,
      activoEnPasoActual: true,
      nombre: 'Agenda y prioridades',
      corto: '1. Agenda',
      alcanceDireccion: 'Objetivos, responsables, fechas, dependencias, próximos pasos y decisiones requeridas.',
      actorDominante: 'MKT_INTERNO',
      camposClave: ['Objetivo y frente', 'Actor responsable', 'Fecha acordada', 'Estado (9 estados)', 'Dependencia bloqueante', 'Próximo paso', 'Decisión requerida de Dirección', 'Evidencia y Criterio del Líder']
    },
    {
      num: 2,
      id: 'm2-equipo',
      cluster: 'conduccion',
      paso: 1,
      activoEnPasoActual: true,
      nombre: 'Equipo interno',
      corto: '2. Equipo Interno',
      alcanceDireccion: 'Tareas, capacidad, cobertura, bloqueos, reemplazos y calidad del trabajo.',
      actorDominante: 'MKT_INTERNO',
      camposClave: ['Carga horaria vs capacidad', 'Cobertura por plaza', 'Esquema de reemplazo / backup', 'Documentación de continuidad', 'Tareas semanales', 'Bloqueos operativos', 'Trabajo absorbido', 'Evaluación de calidad Madero']
    },
    {
      num: 3,
      id: 'm3-fotos',
      cluster: 'fotos',
      paso: 3,
      activoEnPasoActual: false,
      nombre: 'Fotografías y digitalización',
      corto: '3. Fotografías',
      alcanceDireccion: 'Cobertura por unidad, coordinación, carga por plataforma, calidad y evolución semanal.',
      actorDominante: 'MKT_INTERNO',
      camposClave: ['Universo controlado (Lucy DMS)', 'Listos para fotografiar', 'Pendientes de coordinación + causa', 'Fotografiados pendientes de carga (Drive, Lucy, Web)', 'Cobertura incompleta (fotos faltantes)', 'Calidad observada + revisión', 'Consistencia entre canales', 'Evolución vs semana anterior']
    },
    {
      num: 4,
      id: 'm4-contenido',
      cluster: 'contenido-pauta',
      paso: 4,
      activoEnPasoActual: false,
      nombre: 'Contenido',
      corto: '4. Contenido',
      alcanceDireccion: 'Planificado, producido, enviado, observado, aprobado, publicado, enlace y resultado.',
      actorDominante: 'REM',
      camposClave: ['Pieza y formato', 'Etapa del flujo editorial', 'Responsable (REM / Interno)', 'Observación formal de Madero', 'Enlace a pieza / Drive', 'Fecha publicación y desempeño']
    },
    {
      num: 5,
      id: 'm5-redes',
      cluster: 'contenido-pauta',
      paso: 4,
      activoEnPasoActual: false,
      nombre: 'Redes sociales',
      corto: '5. Redes Sociales',
      alcanceDireccion: 'Instagram, Facebook, TikTok y YouTube con frecuencia, audiencia, desempeño, contenido por plaza y conclusión.',
      actorDominante: 'MKT_INTERNO',
      camposClave: ['Canal (IG, FB, TikTok, YouTube)', 'Frecuencia planificada vs real', 'Audiencia y alcance', 'Distribución de contenido por plaza (Comodoro, Neuquén, Cordillera)', 'Conclusión del Líder']
    },
    {
      num: 6,
      id: 'm6-campanas',
      cluster: 'contenido-pauta',
      paso: 4,
      activoEnPasoActual: false,
      nombre: 'Campañas pagas',
      corto: '6. Campañas Pagas',
      alcanceDireccion: 'Objetivo, presupuesto, creativos, fechas, ubicaciones, resultado, calidad de lead y recomendación.',
      actorDominante: 'REM',
      camposClave: ['Objetivo comercial', 'Presupuesto asignado vs ejecutado', 'Creativos validados', 'Segmentación / Plazas', 'Leads y CPL', 'Calidad de lead (cruce con Ventas)', 'Recomendación de Ángelo']
    },
    {
      num: 7,
      id: 'm7-google',
      cluster: 'ecosistema',
      paso: 5,
      activoEnPasoActual: false,
      nombre: 'Google',
      corto: '7. Google',
      alcanceDireccion: 'Business Profile, Workspace, Analytics, Tag Manager, Search Console, Ads, accesos y entregables.',
      actorDominante: 'REM',
      camposClave: ['Activo Google por sucursal/cuenta', 'Propiedad y accesos pendientes de Madero', 'Estado de configuración técnica', 'Entregables y evidencia', 'Observación y próximo paso']
    },
    {
      num: 8,
      id: 'm8-web',
      cluster: 'ecosistema',
      paso: 5,
      activoEnPasoActual: false,
      nombre: 'Web',
      corto: '8. Web',
      alcanceDireccion: 'Cambios solicitados, etapa, prueba, observaciones, responsable, fecha y validación.',
      actorDominante: 'CHRISTIAN_WEB',
      camposClave: ['Cambio o ticket solicitado', 'Responsable técnico (L. Christian / otro)', 'Etapa (Pedido, Desarrollo, Prueba/Staging, Producción)', 'Observaciones de QA Madero', 'Fecha acordada y validación final']
    },
    {
      num: 9,
      id: 'm9-proveedores',
      cluster: 'proveedores',
      paso: 2,
      activoEnPasoActual: true,
      nombre: 'Proveedores (REM y otros)',
      corto: '9. Proveedores & REM',
      alcanceDireccion: 'Alcance, compromisos, observaciones, reclamos, demoras, correcciones, evidencia y cierre.',
      actorDominante: 'REM',
      camposClave: ['Frente y alcance acordado', 'Pedido y fecha comunicada', 'Fecha acordada y reprogramaciones', '9 estados normados', 'Evidencia (minuta, link, captura)', 'Posición formal de Madero', 'Respuesta del proveedor', 'Trabajo absorbido por Madero', 'Próxima acción y cierre validado']
    },
    {
      num: 10,
      id: 'm10-eventos',
      cluster: 'ecosistema',
      paso: 5,
      activoEnPasoActual: false,
      nombre: 'Eventos y presencia regional',
      corto: '10. Eventos',
      alcanceDireccion: 'Calendario futuro, ciudad, objetivo, presupuesto, responsables, difusión y resultado.',
      actorDominante: 'MKT_INTERNO',
      camposClave: ['Evento / Activación', 'Ciudad / Plaza', 'Objetivo comercial y de marca', 'Presupuesto estimado vs real', 'Responsables y difusión previa', 'Resultado medido y aprendizaje']
    },
    {
      num: 11,
      id: 'm11-merch',
      cluster: 'ecosistema',
      paso: 5,
      activoEnPasoActual: false,
      nombre: 'Merchandising',
      corto: '11. Merchandising',
      alcanceDireccion: 'Inventario, destino, costo, reposición, utilización y necesidades futuras.',
      actorDominante: 'MKT_INTERNO',
      camposClave: ['Ítem / Material POP', 'Stock físico por sucursal', 'Destino (Entregas clientes, Eventos, Salones)', 'Costo unitario y punto de reposición', 'Necesidades futuras proyectadas']
    },
    {
      num: 12,
      id: 'm12-ventas',
      cluster: 'ecosistema',
      paso: 5,
      activoEnPasoActual: false,
      nombre: 'Relación con Ventas',
      corto: '12. Ventas',
      alcanceDireccion: 'Necesidades comerciales, devoluciones sobre leads, stock prioritario y problemas detectados.',
      actorDominante: 'AREAS_MADERO',
      camposClave: ['Pedido comercial por sucursal', 'Devolución de asesores sobre calidad de leads', 'Unidades en stock prioritario (+180d / críticas)', 'Desvíos detectados entre publicación y salón', 'Acción conjunta acordada']
    }
  ];

  // ------------------------------------------------------------------------
  // 5. LÍNEA DE BASE INICIAL (Fiel al corte post-devolución 28/10/2026)
  // ------------------------------------------------------------------------
  const INITIAL_STATE = {
    schema_version: '1.2.0-paso2',
    updated_at: '2026-11-06T14:30:00-03:00',

    meta: {
      titulo: 'Madero Automotores · Control Integral de Marketing',
      subtitulo: 'Sistema Operativo de Conducción, Auditoría de Proveedores & Reporte a Dirección',
      lider: 'Ángelo Lucero',
      cargo_lider: 'Líder de Marketing',
      emisor_marco: 'Dirección de Madero Automotores',
      fecha_lineamientos: '2026-10-28',
      fecha_corte: '2026-11-06',
      semana_activa: 'Semana 45 · 02 al 08 Nov 2026',
      semaforo_area: 'AMBAR', // VERDE | AMBAR | ROJO
      resumen_ejecutivo_lider:
        'El área se encuentra en transición ordenada hacia el control operativo integral solicitado por Dirección el 28/10. En Marketing Interno, el foco inmediato está en reducir las 66 unidades pendientes de fotografía en Lucy DMS (concentradas en CAM Monseñor D\'Andrea, Neuquén y talleres) y blindar la cobertura de eventos regionales. Frente a REM y proveedores externos, se formalizaron todas las observaciones en minuta, prohibiendo la sustitución silenciosa: cada corrección absorbida internamente queda registrada con horas e impacto para respaldar la revisión de servicio ante Dirección.'
    },

    // SECCIÓN 4: MATRIZ OFICIAL DE SEPARACIÓN DE RESPONSABILIDADES (7 FRENTES)
    gobernanza_frentes: [
      {
        id: 'GOB-01',
        frente: 'Digitalización y fotografías de unidades',
        actor_id: 'MKT_INTERNO',
        responsabilidad_oficial: 'Marketing interno',
        control_esperado: 'Organizar la producción, medir cobertura, controlar calidad y asegurar carga en Drive, Lucy, web y demás plataformas.',
        modulo_link: 'm3-fotos',
        semaforo: 'AMBAR',
        indicador_corto: '97/163 en Lucy (59.5%) · Polonia 100% al día',
        criterio_lider: 'Av. Polonia (31/31) y Av. Alem (19/20) operan bajo estándar. El pasivo se concentra en CAM D\'Andrea (14 sin foto), Neuquén (13) y unidades retenidas en talleres externos (23).',
        recomendacion: 'Instaurar ventana fija martes y jueves con CAM Alistamiento para fotografiar toda unidad apenas sale de lavado antes de trasladarse.'
      },
      {
        id: 'GOB-02',
        frente: 'Stock visual y datos publicados',
        actor_id: 'MKT_INTERNO',
        responsabilidad_oficial: 'Marketing interno con apoyo de las áreas correspondientes',
        control_esperado: 'Detectar diferencias, asignar responsables y seguir la corrección.',
        modulo_link: 'm3-fotos',
        semaforo: 'AMBAR',
        indicador_corto: '9 diferencias detectadas (Kms / Color / Ubicación)',
        criterio_lider: 'Existen unidades en Lucy con kilometraje en 0 km o "CONSULTAR COLOR" y desfasajes de baja en web cuando se reserva una unidad.',
        recomendacion: 'Auditar semanalmente contra el reporte vivo de Lucy DMS y asignar corrección de ficha técnica con plazo máximo de 48 hs.'
      },
      {
        id: 'GOB-03',
        frente: 'Contenido y piezas contratadas',
        actor_id: 'REM',
        responsabilidad_oficial: 'REM u otro prestador según alcance',
        control_esperado: 'Revisar, aprobar u observar, solicitar correcciones y controlar la entrega final.',
        modulo_link: 'm9-proveedores',
        semaforo: 'ROJO',
        indicador_corto: '4 piezas observadas · 6.5 hs absorbidas internamente',
        criterio_lider: 'REM mantiene entregas sobre la fecha límite y errores reiterados de identidad visual y datos de financiación que obligaron a intervención interna en octubre.',
        recomendacion: 'No publicar ni corregir en silencio ninguna pieza fuera de estándar: devolver formalmente por minuta con plazo de 24 hs y documentar reincidencia.'
      },
      {
        id: 'GOB-04',
        frente: 'Campañas y pauta',
        actor_id: 'REM',
        responsabilidad_oficial: 'REM en la ejecución técnica; Madero en prioridades, presupuesto y validaciones',
        control_esperado: 'Controlar calendario, creativos, segmentación, inversión, resultado y calidad de los contactos.',
        modulo_link: 'm6-campanas',
        semaforo: 'AMBAR',
        indicador_corto: 'Pauta activa Comodoro + Neuquén · Ajuste calidad leads',
        criterio_lider: 'El volumen de consultas es aceptable, pero Ventas reporta contactos fuera de zona o buscando financiación 100% sin anticipo en unidades seleccionadas.',
        recomendacion: 'Exigir a REM filtro de calificación en formularios Meta y reorientar presupuesto hacia stock +180 días disponible en salón.'
      },
      {
        id: 'GOB-05',
        frente: 'Google, YouTube y web',
        actor_id: 'CHRISTIAN_WEB',
        responsabilidad_oficial: 'Según el alcance acordado con cada proveedor y las dependencias de Madero',
        control_esperado: 'Mostrar etapa, acceso pendiente, entregable, evidencia, observación y próximo paso.',
        modulo_link: 'm7-google',
        semaforo: 'AMBAR',
        indicador_corto: '2 accesos Google pendientes · 3 mejoras web en curso',
        criterio_lider: 'Persisten accesos de propietario en Google Business Profile / Tag Manager por consolidar bajo dominio corporativo de Madero.',
        recomendacion: 'Destrabar con Gerencia/Administración los códigos de verificación de fichas Google para centralizar propiedad institucional al 100%.'
      },
      {
        id: 'GOB-06',
        frente: 'Eventos, presencia territorial y merchandising',
        actor_id: 'MKT_INTERNO',
        responsabilidad_oficial: 'Marketing interno',
        control_esperado: 'Planificar, presupuestar, controlar inventario, ejecutar y medir resultado.',
        modulo_link: 'm10-eventos',
        semaforo: 'VERDE',
        indicador_corto: 'Operativo Evento / Taxi Drift + Control POP activo',
        criterio_lider: 'La coordinación de acreditaciones, prensa, cobertura audiovisual con TikTok/Gerencia y material en predio se encuentra ordenada y documentada.',
        recomendacion: 'Medir post-evento alcance orgánico, leads captados en predio y consumo real de merchandising para informe del lunes.'
      },
      {
        id: 'GOB-07',
        frente: 'Continuidad de servicios externos',
        actor_id: 'DIRECCION',
        responsabilidad_oficial: 'Dirección',
        control_esperado: 'Presentar antecedentes, situación actual y recomendación; no decidir unilateralmente la baja.',
        modulo_link: 'm9-proveedores',
        semaforo: 'AMBAR',
        indicador_corto: 'Expediente REM documentado p/ revisión mensual',
        criterio_lider: 'Marketing sostiene la exigencia técnica y el registro objetivo de entregas, demoras y trabajo absorbido sobre REM sin interrumpir la operación comercial.',
        recomendacion: 'Completar 4 semanas de trazabilidad estandarizada en este tablero para elevar a Dirección el dictamen integral de desempeño contractual.'
      }
    ],

    // MÓDULO 1: AGENDA Y PRIORIDADES (Sección 5.1)
    agenda_prioridades: [
      {
        id: 'PRI-01',
        frente: 'Gobernanza y Tablero',
        objetivo: 'Puesta en marcha de la línea de base del Sistema de Control Integral de Marketing',
        descripcion: 'Consolidar en un único tablero operativo los 12 frentes exigidos en la devolución del 28/10, separando Marketing Interno, REM, L. Christian y dependencias de Madero.',
        actor_id: 'MKT_INTERNO',
        responsable: 'Ángelo Lucero',
        plaza: 'Todas las plazas (Transversal)',
        prioridad: 'CRITICA',
        estado: 'EN_ELABORACION',
        fecha_compromiso: '2026-11-09',
        dependencia: 'Validación de criterios de aceptación y corte semanal con Dirección (Sección 11).',
        proximo_paso: 'Revisar Paso 1 y Paso 2 del tablero y fijar día fijo de emisión del informe semanal.',
        requiere_decision_direccion: true,
        detalle_decision_direccion: 'Acordar formalmente con Dirección el día/hora de corte semanal (sugerido: viernes 16:00 hs) y validar los parámetros del estándar fotográfico de aceptación.',
        evidencia_label: 'Devolución Dirección 28/10/2026',
        evidencia_url: '1 - Base/Devolucion_Angelo_Control_Integral_Marketing_2026-10-28.docx',
        criterio_lider: 'Prioridad número uno de conducción: ningún dato gerencial se presentará sin respaldo operativo trazable.'
      },
      {
        id: 'PRI-02',
        frente: 'Proveedores (REM)',
        objetivo: 'Cierre de puntos observados en Minuta REM del 15/10 y regularización de grilla Noviembre',
        descripcion: 'Exigir entrega corregida de piezas gráficas y calendario de pauta de noviembre con foco en rotación de usados seleccionados, dejando asentadas en minuta las demoras previas.',
        actor_id: 'REM',
        responsable: 'REM · Equipo Cuentas & Diseño (Control: Ángelo)',
        plaza: 'Todas las plazas (Transversal)',
        prioridad: 'CRITICA',
        estado: 'OBSERVADO_MADERO',
        fecha_compromiso: '2026-11-04',
        dependencia: 'REM debe reenviar adaptaciones respetando manual tipográfico y placas de sucursal correctas.',
        proximo_paso: 'Reclamar formalmente versión corregida V2 y asentar atraso de 48 hs en historial maestro de auditoría REM.',
        requiere_decision_direccion: false,
        detalle_decision_direccion: '',
        evidencia_label: 'Minuta REM 15/10 + Historial Auditoría',
        evidencia_url: '#auditoria-rem-minuta-15-10',
        criterio_lider: 'Se detuvo la corrección interna silenciosa: las 3 placas con datos erróneos fueron devueltas formalmente con criterio escrito.'
      },
      {
        id: 'PRI-03',
        frente: 'Fotografías y Digitalización',
        objetivo: 'Operativo de captura para reducir las 14 unidades sin foto en CAM Monseñor D\'Andrea 1967',
        descripcion: 'Ejecutar sesión fotográfica escalonada sobre las unidades listas en CAM D\'Andrea que ya finalizaron mecánica pero aún no tienen cobertura en Lucy DMS ni Web.',
        actor_id: 'MKT_INTERNO',
        responsable: 'Equipo Foto Comodoro + Coord. CAM',
        plaza: 'Comodoro · CAM (Monseñor D\'Andrea 1967)',
        prioridad: 'ALTA',
        estado: 'EN_ELABORACION',
        fecha_compromiso: '2026-11-10',
        dependencia: 'Disponibilidad de llaves y lavado estético previo por parte del equipo de CAM.',
        proximo_paso: 'Fotografiar tanda inicial de 8 unidades listas el viernes por la mañana y subir en el día a Drive, Lucy y Web.',
        requiere_decision_direccion: false,
        detalle_decision_direccion: '',
        evidencia_label: 'Cruce en vivo Lucy DMS (14 pend. en D\'Andrea)',
        evidencia_url: 'https://dashboard-alistamiento-pi.vercel.app/',
        criterio_lider: 'Av. Polonia está al 100% (31/31); resolver D\'Andrea elevará la cobertura general de Comodoro por encima del 78%.'
      },
      {
        id: 'PRI-04',
        frente: 'Fotografías y Digitalización',
        objetivo: 'Regularización de 13 unidades pendientes de fotografía en sucursal Madero Neuquén',
        descripcion: 'Coordinar sesión local bajo protocolo de 8 ángulos obligatorios para eliminar el faltante visual de unidades frescas y normales (Cruze PHR737, Focus NXL964, Fiesta OJG945, A3 NQQ809).',
        actor_id: 'MKT_INTERNO',
        responsable: 'Referente Foto Neuquén (Supervisa: Ángelo)',
        plaza: 'Neuquén · Madero Neuquén',
        prioridad: 'ALTA',
        estado: 'PENDIENTE_INICIO',
        fecha_compromiso: '2026-11-11',
        dependencia: 'Confirmación de estado de salón de las 13 unidades por responsable de sucursal Neuquén.',
        proximo_paso: 'Validar listado de patentes con sucursal Neuquén hoy y fijar cronograma lunes/martes.',
        requiere_decision_direccion: false,
        detalle_decision_direccion: '',
        evidencia_label: 'Reporte Lucy DMS Plaza Neuquén (27/40 con foto)',
        evidencia_url: 'https://dashboard-alistamiento-pi.vercel.app/',
        criterio_lider: 'Hay unidades de alta rotación comercial en Neuquén con más de 30 días sin publicar por falta de set fotográfico.'
      },
      {
        id: 'PRI-05',
        frente: 'Google y Activos Digitales',
        objetivo: 'Consolidación de propiedad institucional en Google Business Profile, Analytics 4 y Tag Manager',
        descripcion: 'Completar el pedido de accesos de propietario principal bajo cuenta institucional de Madero Automotores para todas las sucursales y contenedores de medición.',
        actor_id: 'DIRECCION',
        responsable: 'Ángelo Lucero + Dirección / Admin',
        plaza: 'Todas las plazas (Transversal)',
        prioridad: 'ALTA',
        estado: 'PENDIENTE_INFO_MADERO',
        fecha_compromiso: '2026-11-08',
        dependencia: 'Se requiere validación por SMS/correo gerencial de recuperación para transferir propiedad primaria de 2 perfiles de sucursal.',
        proximo_paso: 'Coordinar ventana de 15 minutos con titular de la cuenta histórica para aceptar transferencia.',
        requiere_decision_direccion: true,
        detalle_decision_direccion: 'Definir casilla maestra institucional definitiva (ej. sistemas/gerencia@maderoautomotores) que detentará siempre la propiedad raíz de activos Google y Meta Business.',
        evidencia_label: 'Documento: Pedido de accesos Google',
        evidencia_url: '#pedido-accesos-google',
        criterio_lider: 'Riesgo estructural de continuidad: ningún proveedor ni cuenta personal debe retener propiedad primaria de activos de Madero.'
      },
      {
        id: 'PRI-06',
        frente: 'Web y Stock Publicado',
        objetivo: 'Corrección de sincronización de filtros y estados de reserva en catálogo Web',
        descripcion: 'Ajustar con desarrollo web la visualización de unidades reservadas y filtros por plaza para evitar ofrecer en pauta autos ya señados en salón.',
        actor_id: 'CHRISTIAN_WEB',
        responsable: 'L. Christian (Control QA: Ángelo)',
        plaza: 'Todas las plazas (Transversal)',
        prioridad: 'ALTA',
        estado: 'ENTREGADO_REVISION',
        fecha_compromiso: '2026-11-07',
        dependencia: 'Entorno de prueba entregado; falta validación cruzada de Marketing Interno sobre 6 unidades reservadas.',
        proximo_paso: 'Ejecutar prueba funcional hoy sobre patentes reservadas (NDA773, AA740EU) y dar OK o devolver observaciones.',
        requiere_decision_direccion: false,
        detalle_decision_direccion: '',
        evidencia_label: 'Ticket Web #14 · Entorno Staging',
        evidencia_url: '#staging-web-catalogo',
        criterio_lider: 'Mejora directa en experiencia comercial: evita fricción entre asesores de Ventas y clientes que consultan por autos ya reservados.'
      },
      {
        id: 'PRI-07',
        frente: 'Eventos y Presencia Territorial',
        objetivo: 'Ejecución integral, control de accesos, prensa y cobertura audiovisual Evento / Taxi Drift',
        descripcion: 'Asegurar acreditaciones de invitados y staff activo, cobertura en vivo de Reels/TikTok junto a Carlos Rodríguez y medición posterior de impacto de marca.',
        actor_id: 'MKT_INTERNO',
        responsable: 'Ángelo Lucero + Carlos Rodríguez + Juan Pérez',
        plaza: 'Comodoro · Av. Alem 828',
        prioridad: 'CRITICA',
        estado: 'CERRADO_EVIDENCIA',
        fecha_compromiso: '2026-11-06',
        dependencia: 'Padrón depurado de 38 empleados activos y bloqueo explícito de 23 bajas validado con Operaciones.',
        proximo_paso: 'Relevar métricas de repercusión en redes y consumo de merchandising al cierre de la jornada.',
        requiere_decision_direccion: false,
        detalle_decision_direccion: '',
        evidencia_label: 'Planilla Maestra Control Accesos Evento Madero',
        evidencia_url: 'Control_Accesos_Invitados_Evento_Madero.xlsx',
        criterio_lider: 'Ejemplo de articulación interna ordenada entre Marketing, Gerencia General y Operaciones con trazabilidad documental completa.'
      },
      {
        id: 'PRI-08',
        frente: 'Campañas Pagas y Ventas',
        objetivo: 'Campaña específica de rotación para stock crítico (+180 días disponibles con foto)',
        descripcion: 'Activar pauta segmentada sobre 18 unidades seleccionadas con foto completa en Polonia y Neuquén que superan los 180 días en parque.',
        actor_id: 'REM',
        responsable: 'REM Tráfico + Validación Comercial Madero',
        plaza: 'Todas las plazas (Transversal)',
        prioridad: 'ALTA',
        estado: 'ATRASADO',
        fecha_compromiso: '2026-11-03',
        dependencia: 'REM demoró el armado del carrusel dinámico por falta de adaptación de plantillas de precio/anticipo.',
        proximo_paso: 'Intimar entrega hoy antes de las 18:00 hs; dejar asentado atraso de 3 días e impacto en rotación.',
        requiere_decision_direccion: true,
        detalle_decision_direccion: 'Confirmar tope de inversión adicional para empuje de unidades inmovilizadas (+180 días) en Comodoro y Neuquén durante noviembre.',
        evidencia_label: 'Listado Stock Crítico c/ Foto + Reclamo REM',
        evidencia_url: '#pauta-stock-critico-nov',
        criterio_lider: 'Cada día de atraso en pauta sobre stock +180d tiene costo financiero directo; requiere prioridad comercial y seguimiento diario.'
      }
    ],

    // MÓDULO 2A: EQUIPO INTERNO — CAPACIDAD, COBERTURA Y CONTINUIDAD (Sección 2 y 5.2)
    equipo_miembros: [
      {
        id: 'MEM-01',
        nombre: 'Ángelo Lucero',
        rol: 'Líder de Marketing · Conducción, Calidad y Proveedores',
        plaza_base: 'Comodoro · Av. Alem 828 (Cobertura Transversal)',
        horas_capacidad_semanal: 45,
        reemplazo_designado: 'Dirección / Referente Operativo Comodoro (según frente)',
        estado_continuidad: 'DOCUMENTADO', // DOCUMENTADO | EN_PROCESO | RIESGO_SIN_BACKUP
        detalle_continuidad: 'Tablero centralizado, minutas REM y criterios de aceptación formalizados por escrito.',
        estandar_calidad: 'Control final de marca y auditoría de terceros',
        observaciones: 'Foco actual en ordenar operación base y erradicar sustitución silenciosa de proveedores.'
      },
      {
        id: 'MEM-02',
        nombre: 'Célula Fotografía & Detailing Visual · Comodoro',
        rol: 'Captura Fotográfica y Video de Unidades en Salón / CAM',
        plaza_base: 'Polonia 546 · Alem 828 · CAM D\'Andrea 1967 · Colón',
        horas_capacidad_semanal: 40,
        reemplazo_designado: 'Cobertura cruzada Ángelo Lucero / Operador Audiovisual',
        estado_continuidad: 'DOCUMENTADO',
        detalle_continuidad: 'Guía de 8 tomas obligatorias (frente 3/4, lateral, trasera, tablero, plazas, motor, baúl).',
        estandar_calidad: '92% lotes aprobados en 1ra revisión',
        observaciones: 'Cuello de botella principal: espera de lavado y movimiento de autos en CAM D\'Andrea.'
      },
      {
        id: 'MEM-03',
        nombre: 'Gestión de Plataformas & Stock Digital',
        rol: 'Carga en Drive, Lucy DMS, Web Oficial y Auditoría de Fichas',
        plaza_base: 'Todas las plazas (Transversal)',
        horas_capacidad_semanal: 35,
        reemplazo_designado: 'Ángelo Lucero + Soporte Admin Comercial',
        estado_continuidad: 'EN_PROCESO',
        detalle_continuidad: 'En redacción instructivo paso a paso de nomenclatura de carpetas Drive -> Lucy -> Web.',
        estandar_calidad: 'Verificación cruzada semanal vs inventario vivo',
        observaciones: 'Absorbió 4 hs esta semana corrigiendo placas y textos mal entregados por agencia externa.'
      },
      {
        id: 'MEM-04',
        nombre: 'Referente Operativo · Plaza Neuquén & Cordillera',
        rol: 'Captura Local de Stock, Reels de Salón y Vínculo con Ventas NQN',
        plaza_base: 'Neuquén · Madero Neuquén',
        horas_capacidad_semanal: 30,
        reemplazo_designado: 'Asesor designado Sucursal Neuquén (para fotos urgentes de ingreso)',
        estado_continuidad: 'EN_PROCESO',
        detalle_continuidad: 'Requiere homologar iluminación interior de salón Neuquén con el estándar de Av. Polonia.',
        estandar_calidad: '2 observaciones de encuadre/reflejos en revisión semanal',
        observaciones: '13 unidades pendientes de fotografiar en plaza Neuquén programadas para inicio de semana.'
      },
      {
        id: 'MEM-05',
        nombre: 'Coordinación Contenido Orgánico, Eventos & Merchandising',
        rol: 'Activaciones Regionales, TikTok / Reels en Vivo y Control POP',
        plaza_base: 'Comodoro + Articulación Regional',
        horas_capacidad_semanal: 30,
        reemplazo_designado: 'Articulación Carlos Rodríguez (TikTok/Eventos) + Ángelo Lucero',
        estado_continuidad: 'DOCUMENTADO',
        detalle_continuidad: 'Planillas de acreditación, inventario de merchandising y checklist de eventos operativos.',
        estandar_calidad: 'Alta respuesta orgánica en activaciones presenciales',
        observaciones: 'Semana de alta demanda operativa por ejecución de Evento / Taxi Drift.'
      }
    ],

    // MÓDULO 2B: TAREAS SEMANALES DEL EQUIPO INTERNO (Sección 5.2)
    equipo_tareas: [
      {
        id: 'INT-01',
        tarea: 'Relevamiento completo y auditoría de consistencia Lucy DMS vs Drive vs Web (163 unidades)',
        miembro_id: 'MEM-03',
        categoria: 'Auditoría Stock Visual',
        plaza: 'Todas las plazas (Transversal)',
        horas_estimadas: 6,
        es_trabajo_absorbido: false,
        origen_absorbido: '',
        estado: 'CERRADO_EVIDENCIA',
        fecha_entrega: '2026-11-04',
        bloqueo: '',
        calidad_estado: 'APROBADO', // APROBADO | OBSERVADO | PENDIENTE
        nota_calidad: 'Se detectaron 9 unidades con km/color incompleto en Lucy; derivadas para saneamiento.',
        evidencia: 'Exportación CSV Lucy DMS 04/11'
      },
      {
        id: 'INT-02',
        tarea: 'Sesión fotográfica lote ingresos recientes en Salón Principal Av. Polonia 546 (5 unidades)',
        miembro_id: 'MEM-02',
        categoria: 'Fotografía y Salón',
        plaza: 'Comodoro · Av. Polonia 546 (Salón Principal)',
        horas_estimadas: 5,
        es_trabajo_absorbido: false,
        origen_absorbido: '',
        estado: 'CERRADO_EVIDENCIA',
        fecha_entrega: '2026-11-05',
        bloqueo: '',
        calidad_estado: 'APROBADO',
        nota_calidad: '100% del salón Polonia (31/31 unidades) con cobertura completa de 5+ fotos en Lucy.',
        evidencia: 'Carpeta Drive /Polonia/2026-11-S45'
      },
      {
        id: 'INT-03',
        tarea: 'Coordinación y captura de 14 unidades sin foto alojadas en CAM Monseñor D\'Andrea 1967',
        miembro_id: 'MEM-02',
        categoria: 'Fotografía y Salón',
        plaza: 'Comodoro · CAM (Monseñor D\'Andrea 1967)',
        horas_estimadas: 10,
        es_trabajo_absorbido: false,
        origen_absorbido: '',
        estado: 'EN_ELABORACION',
        fecha_entrega: '2026-11-10',
        bloqueo: '6 de las 14 unidades aguardan lavado exterior y despeje de playón en CAM.',
        calidad_estado: 'PENDIENTE',
        nota_calidad: 'Se exige fondo despejado sin vehículos en reparación detrás.',
        evidencia: 'Plan de Fotografía CAM S45'
      },
      {
        id: 'INT-04',
        tarea: 'Re-edición urgente de 4 placas de historias y carrusel de usados por errores de entrega de REM',
        miembro_id: 'MEM-03',
        categoria: 'Diseño / Urgencia Absorbida',
        plaza: 'Todas las plazas (Transversal)',
        horas_estimadas: 4,
        es_trabajo_absorbido: true,
        origen_absorbido: 'REM entregó piezas con tipografía fuera de manual y dirección de sucursal incorrecta a horas de salir.',
        estado: 'CERRADO_EVIDENCIA',
        fecha_entrega: '2026-11-05',
        bloqueo: '',
        calidad_estado: 'APROBADO',
        nota_calidad: 'Resuelto internamente para no frenar pauta del fin de semana; registrado para reclamo a REM.',
        evidencia: 'Comparativa Antes/Después en Carpeta Auditoría REM'
      },
      {
        id: 'INT-05',
        tarea: 'Rehacer fotografías interiores de 3 unidades en Madero Neuquén por contraluz y reflejos',
        miembro_id: 'MEM-04',
        categoria: 'Fotografía y Salón',
        plaza: 'Neuquén · Madero Neuquén',
        horas_estimadas: 3.5,
        es_trabajo_absorbido: false,
        origen_absorbido: '',
        estado: 'OBSERVADO_MADERO',
        fecha_entrega: '2026-11-08',
        bloqueo: '',
        calidad_estado: 'OBSERVADO',
        nota_calidad: 'Observado por Ángelo: reflejo directo en pantalla multimedia y encuadre torcido en plazas traseras. Nueva revisión lunes.',
        evidencia: 'Revisión Calidad Fotos NQN #08'
      },
      {
        id: 'INT-06',
        tarea: 'Armado de padrón de puerta, acreditaciones de invitados y cobertura en vivo Evento / Taxi Drift',
        miembro_id: 'MEM-05',
        categoria: 'Eventos y Territorio',
        plaza: 'Comodoro · Av. Alem 828',
        horas_estimadas: 12,
        es_trabajo_absorbido: false,
        origen_absorbido: '',
        estado: 'CERRADO_EVIDENCIA',
        fecha_entrega: '2026-11-06',
        bloqueo: '',
        calidad_estado: 'APROBADO',
        nota_calidad: 'Cruce verificado de 38 empleados activos y alertas de seguridad en puerta.',
        evidencia: 'Control_Accesos_Invitados_Evento_Madero.xlsx'
      },
      {
        id: 'INT-07',
        tarea: 'Redacción interna de copys técnicos y fichas de campaña Meta Ads no provistos en tiempo por REM',
        miembro_id: 'MEM-01',
        categoria: 'Gestión y Control',
        plaza: 'Todas las plazas (Transversal)',
        horas_estimadas: 2.5,
        es_trabajo_absorbido: true,
        origen_absorbido: 'REM envió textos genéricos sin especificar versión, transmisión ni plaza de exhibición de las unidades.',
        estado: 'CERRADO_EVIDENCIA',
        fecha_entrega: '2026-11-04',
        bloqueo: '',
        calidad_estado: 'APROBADO',
        nota_calidad: 'Copys corregidos bajo estándar comercial Madero y reclamo asentado en minuta.',
        evidencia: 'Documento Copys Corregidos S45'
      },
      {
        id: 'INT-08',
        tarea: 'Recuento físico de kits de entrega, gorras, llaveros y portadocumentos en Alem y Polonia',
        miembro_id: 'MEM-05',
        categoria: 'Merchandising',
        plaza: 'Comodoro · Av. Polonia 546 (Salón Principal)',
        horas_estimadas: 4,
        es_trabajo_absorbido: false,
        origen_absorbido: '',
        estado: 'PENDIENTE_INICIO',
        fecha_entrega: '2026-11-11',
        bloqueo: 'Aguardando cierre de consumo del evento de hoy para consolidar stock real remanente.',
        calidad_estado: 'PENDIENTE',
        nota_calidad: 'Incluir alerta de punto de pedido para carpetas de pre-entrega.',
        evidencia: 'Planilla Stock Merchandising Noviembre'
      }
    ],

    // MÓDULO 9: SEGUIMIENTO DE REM Y OTROS PROVEEDORES (Secciones 5.9, 7, 8 y 9)
    // Cada registro cubre los 10 campos obligatorios de la Sección 7 + formalización de minuta (Sección 8).
    proveedores_compromisos: [
      {
        id: 'PRV-01',
        proveedor: 'REM',
        actor_id: 'REM',
        prestador_detalle: '',
        agenda_vinculada: 'PRI-02',
        frente_alcance: 'Contenido y piezas contratadas · Plantillas de placas de historias y carrusel de usados adaptadas por sucursal. Criterio acordado: manual tipográfico Madero, dirección y teléfono de sucursal correctos, datos de financiación validados por Ventas.',
        pedido_detalle: 'Rehacer las 4 placas de historias y el carrusel de usados observados en la Minuta REM del 15/10, con dirección de sucursal y tipografía corregidas.',
        fecha_pedido: '2026-10-15',
        fecha_acordada_original: '2026-10-22',
        fecha_acordada_actual: '2026-11-07',
        historial_reprogramaciones: [
          { fecha_anterior: '2026-10-22', fecha_nueva: '2026-11-07', motivo: 'Devolución formal de la V1 por errores de marca y datos de sucursal: REM debe presentar V2 corregida.', registrado: '2026-10-24' }
        ],
        estado: 'DEVUELTO_CORRECCION',
        fecha_entrega_proveedor: '2026-10-24',
        evidencia_label: 'Carpeta Auditoría REM · Comparativa V1 vs estándar',
        evidencia_url: '#auditoria-rem-placas',
        posicion_madero_tipo: 'RECHAZADO',
        posicion_madero_fundamento: 'La V1 llegó con tipografía fuera de manual y la dirección de Av. Alem 828 asignada a Av. Polonia 546. Estándar esperado: manual de marca vigente y datos de sucursal verificados contra el listado oficial.',
        minuta_formalizada: true,
        minuta_referencia: 'Minuta REM 15/10 — Punto 3 verificado sin suavizar',
        minuta_requiere_correccion: false,
        formalizacion_pasos: [true, true, true, true, false, true, false],
        respuesta_proveedor: 'REM reconoce el error de datos de sucursal; compromete V2 corregida para el 07/11 y propone revisión cruzada previa con Marketing antes de cada envío.',
        hubo_trabajo_absorbido: true,
        horas_absorbidas: 4,
        trabajo_absorbido_detalle: 'Marketing Interno re-editó las 4 placas para no frenar la pauta del fin de semana. Impacto: 4 hs de Gestión de Plataformas desviadas de la carga de stock.',
        tareas_vinculadas: ['INT-04'],
        proxima_accion_responsable: 'REM · Diseño (Control: Ángelo)',
        proxima_accion_detalle: 'Recibir V2 corregida y validar contra checklist de marca; si reincide, elevar como reiteración.',
        fecha_revision: '2026-11-07',
        cierre_validado: false,
        cierre_evidencia_final: '',
        escalar_a_direccion: false,
        recomendacion_lider: 'Exigir revisión cruzada previa obligatoria y documentar como antecedente de calidad para la revisión mensual del servicio.'
      },
      {
        id: 'PRV-02',
        proveedor: 'REM',
        actor_id: 'REM',
        prestador_detalle: '',
        agenda_vinculada: '',
        frente_alcance: 'Campañas y pauta · Copys técnicos y fichas de campaña Meta Ads de usados seleccionados. Criterio: versión, transmisión, km y plaza de exhibición de cada unidad.',
        pedido_detalle: 'Entregar copys específicos por unidad para la campaña de usados de noviembre, alineados con la ficha de Lucy DMS.',
        fecha_pedido: '2026-10-27',
        fecha_acordada_original: '2026-10-30',
        fecha_acordada_actual: '2026-11-05',
        historial_reprogramaciones: [
          { fecha_anterior: '2026-10-30', fecha_nueva: '2026-11-05', motivo: 'Devolución por textos genéricos: REM se comprometió verbalmente a reenviar versión corregida.', registrado: '2026-10-31' }
        ],
        estado: 'OBSERVADO_MADERO',
        fecha_entrega_proveedor: '2026-10-31',
        evidencia_label: 'Documento Copys Corregidos S45 (versión interna)',
        evidencia_url: '#copys-meta-s45',
        posicion_madero_tipo: 'OBSERVADO',
        posicion_madero_fundamento: 'Textos genéricos sin versión, transmisión ni plaza: no permiten calificar el lead. Estándar: copy por unidad con datos de la ficha Lucy DMS y llamada a la acción por sucursal.',
        minuta_formalizada: false,
        minuta_referencia: '',
        minuta_requiere_correccion: false,
        formalizacion_pasos: [true, true, true, false, false, true, false],
        respuesta_proveedor: 'REM indicó que los datos por unidad "no estaban en el brief"; sin nueva fecha confirmada por escrito.',
        hubo_trabajo_absorbido: true,
        horas_absorbidas: 2.5,
        trabajo_absorbido_detalle: 'Ángelo redactó los copys técnicos para sostener la salida de la campaña (2,5 hs de conducción desviadas).',
        tareas_vinculadas: ['INT-07'],
        proxima_accion_responsable: 'Ángelo Lucero',
        proxima_accion_detalle: 'Asentar la observación en la próxima minuta semanal con REM y exigir fecha firme de reenvío.',
        fecha_revision: '2026-11-07',
        cierre_validado: false,
        cierre_evidencia_final: '',
        escalar_a_direccion: false,
        recomendacion_lider: 'Formalizar en minuta: sin registro escrito, la corrección interna se confunde con un cumplimiento del proveedor.'
      },
      {
        id: 'PRV-03',
        proveedor: 'REM',
        actor_id: 'REM',
        prestador_detalle: '',
        agenda_vinculada: 'PRI-08',
        frente_alcance: 'Campañas y pauta · Carrusel dinámico de stock +180 días con foto completa (Polonia y Neuquén). Criterio: plantillas de precio/anticipo aprobadas por Ventas.',
        pedido_detalle: 'Armar y activar el carrusel dinámico sobre 18 unidades +180 días con foto completa.',
        fecha_pedido: '2026-10-24',
        fecha_acordada_original: '2026-10-31',
        fecha_acordada_actual: '2026-11-03',
        historial_reprogramaciones: [
          { fecha_anterior: '2026-10-31', fecha_nueva: '2026-11-03', motivo: 'REM solicitó adaptar plantillas de precio y anticipo; nueva fecha confirmada por mail.', registrado: '2026-10-30' }
        ],
        estado: 'ATRASADO',
        fecha_entrega_proveedor: '',
        evidencia_label: 'Listado Stock Crítico c/ Foto + Reclamo REM',
        evidencia_url: '#pauta-stock-critico-nov',
        posicion_madero_tipo: 'REQUIERE_AJUSTE',
        posicion_madero_fundamento: 'Venció la fecha reprogramada sin entrega. Estándar: carrusel activo con precio, anticipo y plaza por unidad.',
        minuta_formalizada: true,
        minuta_referencia: 'Minuta semanal REM 05/11 — Punto 2 (atraso de 3 días) asentado textual',
        minuta_requiere_correccion: false,
        formalizacion_pasos: [true, true, true, true, false, true, true],
        respuesta_proveedor: 'Sin respuesta formal desde el reclamo del 04/11.',
        hubo_trabajo_absorbido: false,
        horas_absorbidas: 0,
        trabajo_absorbido_detalle: '',
        tareas_vinculadas: [],
        proxima_accion_responsable: 'REM Tráfico (Control: Ángelo)',
        proxima_accion_detalle: 'Intimar entrega antes de las 18:00 hs y registrar el impacto en la rotación de stock.',
        fecha_revision: '2026-11-06',
        cierre_validado: false,
        cierre_evidencia_final: '',
        escalar_a_direccion: true,
        recomendacion_lider: 'Segunda reiteración de atraso en pauta crítica entre octubre y noviembre. Recomiendo que Dirección convoque a REM a una revisión formal de nivel de servicio y defina el tope de inversión adicional para stock inmovilizado.'
      },
      {
        id: 'PRV-04',
        proveedor: 'REM',
        actor_id: 'REM',
        prestador_detalle: '',
        agenda_vinculada: '',
        frente_alcance: 'Contenido y piezas contratadas · Grilla de contenidos orgánicos de noviembre (IG, FB, TikTok) por plaza. Criterio: mínimo 3 piezas semanales por plaza y calendario validado.',
        pedido_detalle: 'Presentar la grilla mensual de noviembre con piezas por plaza (Comodoro, Neuquén, Cordillera).',
        fecha_pedido: '2026-10-20',
        fecha_acordada_original: '2026-11-03',
        fecha_acordada_actual: '2026-11-03',
        historial_reprogramaciones: [],
        estado: 'ENTREGADO_REVISION',
        fecha_entrega_proveedor: '2026-11-03',
        evidencia_label: 'Grilla Noviembre REM v1 (Drive)',
        evidencia_url: '#grilla-nov-rem',
        posicion_madero_tipo: 'EN_REVISION',
        posicion_madero_fundamento: 'En control: verificar equilibrio entre plazas y que Neuquén y Cordillera tengan contenido propio.',
        minuta_formalizada: false,
        minuta_referencia: '',
        minuta_requiere_correccion: false,
        formalizacion_pasos: [true, false, false, false, false, true, false],
        respuesta_proveedor: 'Entregada en fecha.',
        hubo_trabajo_absorbido: false,
        horas_absorbidas: 0,
        trabajo_absorbido_detalle: '',
        tareas_vinculadas: [],
        proxima_accion_responsable: 'Ángelo Lucero',
        proxima_accion_detalle: 'Revisar la grilla y aprobar u observar por escrito.',
        fecha_revision: '2026-11-07',
        cierre_validado: false,
        cierre_evidencia_final: '',
        escalar_a_direccion: false,
        recomendacion_lider: ''
      },
      {
        id: 'PRV-05',
        proveedor: 'REM',
        actor_id: 'REM',
        prestador_detalle: '',
        agenda_vinculada: '',
        frente_alcance: 'Campañas y pauta · Reporte mensual de pauta de octubre (inversión, leads, CPL por plaza y calidad de contacto). Criterio: datos por campaña y cruce con la devolución de Ventas.',
        pedido_detalle: 'Entregar el reporte de resultados de pauta de octubre con apertura por plaza.',
        fecha_pedido: '2026-10-31',
        fecha_acordada_original: '2026-11-05',
        fecha_acordada_actual: '2026-11-10',
        historial_reprogramaciones: [
          { fecha_anterior: '2026-11-05', fecha_nueva: '2026-11-10', motivo: 'REM informó demora en la exportación de Meta Business por cambio de permisos; Madero aceptó la nueva fecha.', registrado: '2026-11-04' }
        ],
        estado: 'REPROGRAMADO',
        fecha_entrega_proveedor: '',
        evidencia_label: 'Mail REM 04/11 (reprogramación)',
        evidencia_url: '#mail-rem-0411',
        posicion_madero_tipo: 'OBSERVADO',
        posicion_madero_fundamento: 'El reporte de septiembre no incluyó apertura por plaza ni calidad de lead. Estándar: CPL por plaza y cruce con devoluciones de Ventas.',
        minuta_formalizada: true,
        minuta_referencia: 'Minuta semanal REM 05/11 — Punto 4 omitido (pedido de apertura por plaza)',
        minuta_requiere_correccion: true,
        formalizacion_pasos: [true, true, true, false, false, true, false],
        respuesta_proveedor: 'Compromete el reporte para el 10/11 incluyendo apertura por plaza.',
        hubo_trabajo_absorbido: false,
        horas_absorbidas: 0,
        trabajo_absorbido_detalle: '',
        tareas_vinculadas: [],
        proxima_accion_responsable: 'Ángelo Lucero',
        proxima_accion_detalle: 'Solicitar la corrección de la minuta del 05/11 para que refleje el pedido de apertura por plaza.',
        fecha_revision: '2026-11-07',
        cierre_validado: false,
        cierre_evidencia_final: '',
        escalar_a_direccion: false,
        recomendacion_lider: 'Pedir la corrección de la minuta antes del 10/11 para que el compromiso quede trazable.'
      },
      {
        id: 'PRV-06',
        proveedor: 'L. Christian',
        actor_id: 'CHRISTIAN_WEB',
        prestador_detalle: '',
        agenda_vinculada: 'PRI-06',
        frente_alcance: 'Google, YouTube y web · Ticket Web #14: estado de reserva y filtros por plaza en el catálogo. Criterio: una unidad señada deja de mostrarse como disponible en menos de 24 hs.',
        pedido_detalle: 'Corregir la visualización de unidades reservadas y los filtros por plaza.',
        fecha_pedido: '2026-10-28',
        fecha_acordada_original: '2026-11-05',
        fecha_acordada_actual: '2026-11-05',
        historial_reprogramaciones: [],
        estado: 'ENTREGADO_REVISION',
        fecha_entrega_proveedor: '2026-11-05',
        evidencia_label: 'Ticket Web #14 · Entorno Staging',
        evidencia_url: '#staging-web-catalogo',
        posicion_madero_tipo: 'EN_REVISION',
        posicion_madero_fundamento: 'Pendiente la prueba funcional de Marketing sobre 6 unidades reservadas (NDA773, AA740EU, entre otras).',
        minuta_formalizada: false,
        minuta_referencia: '',
        minuta_requiere_correccion: false,
        formalizacion_pasos: [true, true, true, false, false, true, false],
        respuesta_proveedor: 'Entregado en staging; aguarda validación de Madero.',
        hubo_trabajo_absorbido: false,
        horas_absorbidas: 0,
        trabajo_absorbido_detalle: '',
        tareas_vinculadas: [],
        proxima_accion_responsable: 'Ángelo Lucero',
        proxima_accion_detalle: 'Ejecutar la prueba funcional y dar OK o devolver observaciones.',
        fecha_revision: '2026-11-07',
        cierre_validado: false,
        cierre_evidencia_final: '',
        escalar_a_direccion: false,
        recomendacion_lider: ''
      },
      {
        id: 'PRV-07',
        proveedor: 'L. Christian',
        actor_id: 'CHRISTIAN_WEB',
        prestador_detalle: '',
        agenda_vinculada: '',
        frente_alcance: 'Google, YouTube y web · Corrección de fichas web con precio y kilometraje desfasados respecto de Lucy DMS. Criterio: 0 diferencias en las 9 unidades detectadas.',
        pedido_detalle: 'Sincronizar precio y km de 9 fichas web con Lucy DMS.',
        fecha_pedido: '2026-10-24',
        fecha_acordada_original: '2026-10-29',
        fecha_acordada_actual: '2026-10-29',
        historial_reprogramaciones: [],
        estado: 'CERRADO_EVIDENCIA',
        fecha_entrega_proveedor: '2026-10-28',
        evidencia_label: 'Captura comparativa web vs Lucy 29/10',
        evidencia_url: '#captura-fichas-2910',
        posicion_madero_tipo: 'APROBADO',
        posicion_madero_fundamento: 'Verificadas las 9 fichas contra Lucy DMS.',
        minuta_formalizada: false,
        minuta_referencia: '',
        minuta_requiere_correccion: false,
        formalizacion_pasos: [true, true, true, false, false, true, false],
        respuesta_proveedor: 'Corregido antes de la fecha acordada.',
        hubo_trabajo_absorbido: false,
        horas_absorbidas: 0,
        trabajo_absorbido_detalle: '',
        tareas_vinculadas: [],
        proxima_accion_responsable: 'L. Christian',
        proxima_accion_detalle: 'Sin acción pendiente.',
        fecha_revision: '',
        cierre_validado: true,
        cierre_evidencia_final: 'Captura comparativa 29/10 validada por Ángelo',
        escalar_a_direccion: false,
        recomendacion_lider: ''
      },
      {
        id: 'PRV-08',
        proveedor: 'Otro Prestador',
        actor_id: 'OTRO_PRESTADOR',
        prestador_detalle: 'Imprenta / Gráfica (cartelería del evento)',
        agenda_vinculada: 'PRI-07',
        frente_alcance: 'Eventos, presencia territorial y merchandising · Lonas y cartelería para el Evento / Taxi Drift. Criterio: medidas, logo vigente y entrega en predio 48 hs antes.',
        pedido_detalle: 'Imprimir 2 lonas y 6 carteles con identidad Madero para el evento.',
        fecha_pedido: '2026-10-27',
        fecha_acordada_original: '2026-11-04',
        fecha_acordada_actual: '2026-11-04',
        historial_reprogramaciones: [],
        estado: 'CERRADO_EVIDENCIA',
        fecha_entrega_proveedor: '2026-11-05',
        evidencia_label: 'Fotos de montaje en predio',
        evidencia_url: '#fotos-montaje-evento',
        posicion_madero_tipo: 'APROBADO',
        posicion_madero_fundamento: 'Calidad de impresión correcta; la entrega llegó un día tarde.',
        minuta_formalizada: false,
        minuta_referencia: '',
        minuta_requiere_correccion: false,
        formalizacion_pasos: [true, true, false, false, false, true, false],
        respuesta_proveedor: 'La imprenta atribuyó la demora a falta de insumo y no cobró el flete.',
        hubo_trabajo_absorbido: true,
        horas_absorbidas: 1.5,
        trabajo_absorbido_detalle: 'Marketing Interno retiró el material y armó la cartelería en el predio fuera de horario (1,5 hs).',
        tareas_vinculadas: [],
        proxima_accion_responsable: 'Ángelo Lucero',
        proxima_accion_detalle: 'Sin acción pendiente; pedir con 72 hs de margen en próximos eventos.',
        fecha_revision: '',
        cierre_validado: true,
        cierre_evidencia_final: 'Fotos de montaje + remito de entrega 05/11',
        escalar_a_direccion: false,
        recomendacion_lider: 'Para futuros eventos, cerrar pedidos gráficos con 72 hs de margen.'
      },
      {
        id: 'PRV-09',
        proveedor: 'Otro Prestador',
        actor_id: 'OTRO_PRESTADOR',
        prestador_detalle: 'Titular de cuenta histórica (ex administrador de fichas Google)',
        agenda_vinculada: 'PRI-05',
        frente_alcance: 'Google, YouTube y web · Transferencia de propiedad principal de 2 fichas de Google Business Profile a la cuenta institucional de Madero.',
        pedido_detalle: 'Aceptar la transferencia de propiedad de las fichas de sucursal a la casilla institucional.',
        fecha_pedido: '2026-10-29',
        fecha_acordada_original: '2026-11-08',
        fecha_acordada_actual: '2026-11-08',
        historial_reprogramaciones: [],
        estado: 'PENDIENTE_INFO_MADERO',
        fecha_entrega_proveedor: '',
        evidencia_label: 'Documento: Pedido de accesos Google',
        evidencia_url: '#pedido-accesos-google',
        posicion_madero_tipo: 'EN_REVISION',
        posicion_madero_fundamento: 'Falta que Dirección defina la casilla maestra institucional para completar la transferencia.',
        minuta_formalizada: false,
        minuta_referencia: '',
        minuta_requiere_correccion: false,
        formalizacion_pasos: [true, false, true, false, false, true, false],
        respuesta_proveedor: 'El titular aceptó coordinar una ventana de 15 minutos una vez definida la casilla.',
        hubo_trabajo_absorbido: false,
        horas_absorbidas: 0,
        trabajo_absorbido_detalle: '',
        tareas_vinculadas: [],
        proxima_accion_responsable: 'Ángelo Lucero + Dirección / Admin',
        proxima_accion_detalle: 'Obtener la definición de la casilla maestra y coordinar la transferencia.',
        fecha_revision: '2026-11-08',
        cierre_validado: false,
        cierre_evidencia_final: '',
        escalar_a_direccion: false,
        recomendacion_lider: ''
      }
    ]
  };

  return {
    ESTADOS_SEGUIMIENTO,
    ACTORES,
    PLAZAS,
    PRIORIDADES,
    PROVEEDORES,
    POSICIONES_MADERO,
    POSICIONES_REQUIEREN_MINUTA,
    PASOS_FORMALIZACION,
    MODULOS_SISTEMA,
    INITIAL_STATE
  };
})();

