# PASO 2 de 6 — Auditoría y Seguimiento de Proveedores (REM, L. Christian y Otros)

## ¿Qué construye este paso?
El corazón del control externo exigido por Dirección en las **Secciones 5.9, 7, 8 y 9**:
1. **`js/modules/proveedores.js` — Módulo 9 Completo:**
   - Tarjetas de resumen por proveedor (`REM`, `L. Christian`, `Otros Prestadores`): tasa de entrega en fecha, cantidad de entregables observados/devueltos, reprogramaciones, atrasos y **total de horas de Trabajo Absorbido por Madero**.
   - **Los 10 Campos Obligatorios de la Sección 7** en cada compromiso:
     1. Frente y alcance acordado
     2. Pedido y fecha comunicada
     3. Fecha acordada + historial de reprogramaciones con motivo
     4. Etapa actual (los **9 estados normados**)
     5. Evidencia verificable (link, pieza, captura, documento)
     6. Posición formal de Madero (Aprobación, Observación, Rechazo o Ajuste + estándar esperado)
     7. Respuesta del proveedor (explicación, acción comprometida, nueva fecha)
     8. **Trabajo absorbido** por Madero (horas, actividad realizada, motivo e impacto)
     9. Próxima acción (responsable, acción esperada y fecha de revisión)
     10. Cierre con evidencia final validada
   - **Control de Minutas (Sección 8):** Checkbox y referencia documental que verifica que la observación quedó asentada en minuta *sin suavizar su contenido* (con alerta si falta reflejar o corregir minuta).
   - **Escalamiento a Dirección:** Marcador directo cuando exista reiteración, falta de respuesta o decisión contractual que exceda la autoridad del Líder.

---

## Prompt para copiar y pegar en Antigravity IDE

```text
/plan Ya validé el Paso 1. Ahora vamos a ejecutar únicamente el PASO 2: Módulo 9 de Auditoría y Seguimiento de Proveedores (REM, L. Christian y otros prestadores).

Instrucciones obligatorias:
1. Leé `AGENTS.md` y consultá `.agents/skills/madero-crm-builder/references/01-lineamientos-direccion-completo.md` (especialmente Secciones 7, 8 y 9) y `03-esquema-datos-12-modulos.md`.
2. Agregá la colección `proveedores_compromisos` en `js/data.js` con casos operativos realistas (incluyendo compromisos de REM de contenido/pauta/reportes vinculados a la Minuta del 15/10, tickets con L. Christian y otros prestadores), y asegurate de que `ensureDefaults()` en `js/store.js` la fusione sin perder ningún dato editado en el Paso 1.
3. Creá `js/modules/proveedores.js` y conectalo en `index.html` y `js/app.js` (marcando `m9-proveedores` como `activoEnPasoActual: true`).
4. El módulo debe incluir:
   - Panel comparativo por proveedor (cumplimiento, atrasos, observaciones, minutas pendientes de corregir y horas de Trabajo Absorbido).
   - Filtros por proveedor, por los 9 estados oficiales, por Posición de Madero, "Solo con Trabajo Absorbido", "Pendiente asentar en Minuta" y "Escalado a Dirección".
   - Tabla trazable + Modal de Expediente Completo con los 10 campos obligatorios de Sección 7 y el checklist de formalización de Sección 8.
   - Integración de los contadores de Proveedores y Trabajo Absorbido con los KPIs superiores y la vista de Nivel 2.
   - Exportación CSV UTF-8 BOM para Excel.
5. NO avances al Paso 3 todavía. Verificá sintaxis con `node --check` y detenete para mi revisión.
```

---

## Checklist de validación antes de pasar al Paso 3
- [ ] Cada compromiso de REM o proveedor permite cargar los **10 campos de la Sección 7** sin excepción.
- [ ] Puedo filtrar en 1 clic compromisos **Atrasados**, **Observados por Madero**, con **Trabajo Absorbido** o **Sin formalizar en minuta**.
- [ ] Las horas de Trabajo Absorbido en Proveedores se suman y reflejan coherentemente en el indicador superior y en el Resumen de Dirección.
