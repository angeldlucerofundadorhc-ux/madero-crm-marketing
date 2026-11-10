# Esquema de Datos Unificado (`madero_crm_mkt_v1`) — Los 12 Módulos + Capa Gerencial

Todos los pasos (`Paso 1` a `Paso 6`) leen y persisten sobre un único objeto raíz guardado en `localStorage` bajo la clave `madero_crm_mkt_v1` mediante `window.MaderoStore`.

> **Regla de Evolución Incremental:** En `js/store.js`, la función `ensureDefaults(loaded)` debe conservar siempre los arrays ya editados por Ángelo y únicamente inyectar las colecciones nuevas que aún no existan al avanzar de un paso al siguiente.

---

## Enums Oficiales Compartidos (`window.MaderoData`)

### `ESTADOS_SEGUIMIENTO` (Sección 7 — 9 Estados)
- `PENDIENTE_INFO_MADERO`: `"Pendiente de información de Madero"`
- `PENDIENTE_INICIO`: `"Pendiente de inicio"`
- `EN_ELABORACION`: `"En elaboración"`
- `ENTREGADO_REVISION`: `"Entregado a revisión"`
- `OBSERVADO_MADERO`: `"Observado por Madero"`
- `DEVUELTO_CORRECCION`: `"Devuelto para corrección"`
- `REPROGRAMADO`: `"Reprogramado"`
- `ATRASADO`: `"Atrasado"`
- `CERRADO_EVIDENCIA`: `"Cerrado con evidencia"`

### `ACTORES` (Sección 1 y 4 — 6 Responsables)
- `MKT_INTERNO`: `"Marketing Interno"`
- `REM`: `"REM (Agencia Externa)"`
- `CHRISTIAN_WEB`: `"L. Christian (Web / Dev)"`
- `OTRO_PRESTADOR`: `"Otros Prestadores"`
- `AREAS_MADERO`: `"Áreas de Madero (Ventas / CAM / Admin)"`
- `DIRECCION`: `"Dirección de Madero"`

---

## Estructura Completa del Estado Raíz

```json
{
  "schema_version": "1.0.0",
  "updated_at": "ISO-8601",
  "meta": {
    "titulo": "Madero Automotores · Control Integral de Marketing",
    "lider": "Ángelo Lucero",
    "cargo_lider": "Líder de Marketing",
    "fecha_lineamientos": "2026-10-28",
    "fecha_corte": "2026-11-06",
    "semana_activa": "Semana 45 · 02 al 08 Nov 2026",
    "semaforo_area": "VERDE | AMBAR | ROJO",
    "resumen_ejecutivo_lider": "Lectura general de Ángelo para abrir el informe semanal a Dirección"
  },

  "gobernanza_frentes": "/* Paso 1 · Los 7 frentes estructurales de Sección 4 */",
  "agenda_prioridades": "/* Paso 1 · Módulo 1: Agenda y prioridades */",
  "equipo_miembros":    "/* Paso 1 · Módulo 2A: Capacidad, cobertura y reemplazos */",
  "equipo_tareas":      "/* Paso 1 · Módulo 2B: Tareas internas, bloqueos, calidad y trabajo absorbido */",

  "proveedores_compromisos": "/* Paso 2 · Módulo 9: Seguimiento REM, L. Christian y otros (10 campos Secc. 7 + Minutas Secc. 8) */",

  "fotografia_semanal_meta": "/* Paso 3 · Módulo 3A: Evolución vs semana anterior y criterio de aceptación fotográfica */",
  "fotografia_unidades":     "/* Paso 3 · Módulo 3B: Control por unidad (Drive, Lucy, Web, set incompleto, calidad observada, consistencia) */",

  "contenido_piezas":   "/* Paso 4 · Módulo 4: Flujo Planificado -> Producido -> Enviado -> Observado/Aprobado -> Publicado */",
  "redes_sociales":     "/* Paso 4 · Módulo 5: IG, FB, TikTok, YouTube con frecuencia, audiencia, desempeño por plaza y conclusión */",
  "campanas_pagas":     "/* Paso 4 · Módulo 6: Objetivo, presupuesto, creativos, plazas, leads, CPL, calidad comercial y recomendación */",

  "google_activos":     "/* Paso 5 · Módulo 7: Business Profile, Workspace, GA4, GTM, Search Console, Ads, accesos y entregables */",
  "web_cambios":        "/* Paso 5 · Módulo 8: Cambios solicitados, etapa, staging/prueba, observaciones, responsable, fecha y validación */",
  "eventos_regionales": "/* Paso 5 · Módulo 10: Calendario futuro, ciudad, objetivo, presupuesto, difusión y resultado */",
  "merchandising_stock":"/* Paso 5 · Módulo 11: Inventario, sucursal/destino, costo, punto de reposición, uso y necesidad futura */",
  "ventas_feedback":    "/* Paso 5 · Módulo 12: Necesidades comerciales, devoluciones de leads, stock prioritario y desvíos */",

  "informe_semanal_notas": "/* Paso 6 · Nivel 2: Notas ejecutivas complementarias para las 8 secciones de Sección 10 */"
}
```

---

## Contratos Detallados por Paso

### Paso 2 — `proveedores_compromisos[]` (Módulo 9 · Secciones 7 y 8)
Cada registro DEBE incluir los **10 campos obligatorios de la Sección 7** + verificación de minuta de la **Sección 8**:
- `id`: `"PRV-01"`
- `proveedor`: `"REM"` | `"L. Christian"` | `"Otro Prestador"`
- `actor_id`: `"REM"` | `"CHRISTIAN_WEB"` | `"OTRO_PRESTADOR"`
- `frente_alcance`: Servicio, entregable puntual y criterio acordado *(Campo 1)*
- `pedido_detalle`: Qué se solicitó exactamente *(Campo 2a)*
- `fecha_pedido`: `"YYYY-MM-DD"` cuándo quedó comunicado *(Campo 2b)*
- `fecha_acordada_original`: `"YYYY-MM-DD"` *(Campo 3a)*
- `fecha_acordada_actual`: `"YYYY-MM-DD"` *(Campo 3b)*
- `historial_reprogramaciones`: Motivo y fechas de reprogramación *(Campo 3c)*
- `estado`: Uno de los 9 `ESTADOS_SEGUIMIENTO` *(Campo 4)*
- `evidencia_label` y `evidencia_url`: Enlace, pieza, captura, informe o minuta *(Campo 5)*
- `posicion_madero_tipo`: `"APROBADO"` | `"OBSERVADO"` | `"RECHAZADO"` | `"REQUIERE_AJUSTE"` | `"EN_REVISION"` *(Campo 6a)*
- `posicion_madero_fundamento`: Qué observa Madero y cuál es el estándar esperado *(Campo 6b)*
- `minuta_formalizada`: `boolean` + `minuta_referencia` (ej. `"Minuta REM 15/10 — Punto 3 verificado sin suavizar"`) *(Sección 8)*
- `respuesta_proveedor`: Explicación recibida, acción comprometida y nueva fecha *(Campo 7)*
- `hubo_trabajo_absorbido`: `boolean`, `horas_absorbidas`: `number`, `trabajo_absorbido_detalle`: Actividad realizada por Madero, motivo e impacto *(Campo 8)*
- `proxima_accion_responsable`, `proxima_accion_detalle`, `fecha_revision`: *(Campo 9)*
- `cierre_validado`: `boolean`, `cierre_evidencia_final`: *(Campo 10)*
- `escalar_a_direccion`: `boolean`, `recomendacion_lider`: Conclusión de Ángelo si hay reiteración o decisión contractual.

### Paso 3 — `fotografia_semanal_meta` + `fotografia_unidades[]` (Módulo 3 · Sección 6)
Debe reflejar exactamente los **8 datos semanales estables de la Sección 6**:
1. `universo_controlado`: Total de vehículos en stock incluidos en seguimiento (ej. 163 unidades de Lucy DMS).
2. `listos_para_fotografiar`: Unidades disponibles en salón listas para sesión.
3. `pendientes_coordinacion`: Unidades listas no fotografiadas aún (`causa_demora`, `proxima_accion`).
4. `fotografiados_pendientes_carga`: Material producido que falta subir indicando flags booleanos individuales: `cargado_drive`, `cargado_lucy`, `cargado_web`, `cargado_redes`.
5. `cobertura_incompleta`: Unidades con set parcial (`cantidad_fotos_actual` vs `estandar_fotos_minimo: 8`, `fotos_faltantes_detalle`).
6. `calidad_observada`: Material observado (`motivo_calidad`, `origen_observacion`: Marketing / Ventas / Dirección, `responsable_correccion`, `fecha_nueva_revision`).
7. `consistencia_canales`: Diferencias de fotos, precio, km, color o reserva entre Drive, Lucy, Web y Redes (`inconsistencia_detectada`, `detalle_inconsistencia`).
8. `evolucion_semanal`: `{ altas_semana, regularizadas_semana, pendientes_semana_anterior, pendientes_actuales, criterio_calidad_aceptable }`.

### Paso 4 — `contenido_piezas[]`, `redes_sociales[]`, `campanas_pagas[]` (Módulos 4, 5 y 6)
- **`contenido_piezas[]`:** `id`, `titulo`, `formato` (`Reel`, `Carrusel`, `Story`, `YouTube`, `Gráfica`), `plaza`, `actor_id` (`REM` / `MKT_INTERNO`), `etapa_contenido` (`PLANIFICADO` | `PRODUCIDO` | `ENVIADO` | `OBSERVADO` | `APROBADO` | `PUBLICADO`), `estado` (9 estados), `fecha_compromiso`, `observacion_madero`, `enlace_pieza`, `resultado_metricas`.
- **`redes_sociales[]`:** `id`, `canal` (`Instagram`, `Facebook`, `TikTok`, `YouTube`), `frecuencia_plan_semanal`, `frecuencia_real_semanal`, `seguidores_actual`, `variacion_audiencia`, `alcance_periodo`, `interacciones`, `desglose_plazas` (cobertura Comodoro, Neuquén, Cordillera), `conclusion_lider`.
- **`campanas_pagas[]`:** `id`, `nombre`, `plataforma` (`Meta Ads`, `Google Ads`), `actor_id` (`REM`), `objetivo`, `plazas_ubicaciones`, `presupuesto_asignado`, `presupuesto_ejecutado`, `vigencia_desde`, `vigencia_hasta`, `creativos_url`, `leads_generados`, `cpl`, `calidad_lead_estado` (`ALTA` | `MEDIA` | `BAJA_OBSERVADA`), `devolucion_ventas_leads`, `recomendacion_lider`.

### Paso 5 — `google_activos[]`, `web_cambios[]`, `eventos_regionales[]`, `merchandising_stock[]`, `ventas_feedback[]` (Módulos 7, 8, 10, 11 y 12)
- **`google_activos[]`:** `id`, `herramienta` (`Business Profile`, `Workspace`, `Analytics 4`, `Tag Manager`, `Search Console`, `Google Ads`), `sucursal_cuenta`, `propiedad_madero` (`PROPIETARIO_MADERO` | `ACCESO_PARCIAL` | `PENDIENTE_TRANSFERENCIA`), `acceso_pendiente_detalle`, `actor_id`, `estado`, `entregable`, `evidencia`, `observacion`, `proximo_paso`.
- **`web_cambios[]`:** `id`, `cambio_solicitado`, `tipo`, `responsable` (`L. Christian` / otro), `etapa_web` (`SOLICITADO` | `EN_DESARROLLO` | `EN_PRUEBA_STAGING` | `OBSERVADO_QA` | `VALIDADO_PRODUCCION`), `estado`, `url_prueba`, `observaciones_madero`, `fecha_acordada`, `validacion_final`.
- **`eventos_regionales[]`:** `id`, `evento`, `ciudad_plaza`, `fecha_inicio`, `fecha_fin`, `objetivo`, `presupuesto_estimado`, `presupuesto_real`, `responsables`, `difusion_plan`, `estado`, `resultado_medido`, `conclusion_lider`.
- **`merchandising_stock[]`:** `id`, `articulo`, `categoria`, `sucursal_ubicacion`, `stock_actual`, `stock_minimo_reposicion`, `costo_unitario`, `destino_principal`, `utilizacion_periodo`, `necesidad_futura`.
- **`ventas_feedback[]`:** `id`, `fecha`, `sucursal_plaza`, `referente_ventas`, `tipo` (`CALIDAD_LEADS` | `STOCK_PRIORITARIO` | `PROBLEMA_PUBLICACION` | `PEDIDO_COMERCIAL`), `unidades_involucradas` (patentes/modelos), `descripcion`, `accion_marketing`, `responsable`, `estado`, `cierre_verificado`.

### Paso 6 — Capa Gerencial Consolidada (`informe_semanal_notas` + vista ejecutiva Sección 10)
Integra automáticamente en una sola vista ejecutiva (y layout imprimible A4/PDF) los **8 bloques obligatorios de la Sección 10**:
1. Estado general del área y cambios relevantes de la semana.
2. Marketing interno (tareas, fotos, digitalización, contenido, eventos, merchandising).
3. REM y otros proveedores (compromisos, entregas, observaciones, atrasos, próximos pasos).
4. Canales y campañas (redes, pauta, Google, YouTube, web y conclusiones).
5. Calidad (entregables aceptados, observados o devueltos y criterio aplicado).
6. Dependencias de Madero (accesos, información, material o aprobaciones pendientes).
7. Trabajo absorbido internamente y medida tomada para corregir la causa de origen.
8. Prioridades de la semana siguiente y decisiones que requiere Dirección (con recomendación firmada por Ángelo Lucero).
