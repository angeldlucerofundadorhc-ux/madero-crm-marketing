# PASO 4 de 6 — Contenido, Redes Sociales Multicanal y Campañas Pagas

## ¿Qué construye este paso?
Implementa el cluster completo **`📣 Contenido & Pauta`** con los **Módulos 4, 5 y 6 (Sección 4 y Sección 5.4–5.6)**:
1. **Módulo 4 — Contenido y Piezas Audiovisuales (`m4-contenido`):**
   - Trazabilidad completa del circuito editorial: `Planificado` → `Producido` → `Enviado` → `Observado por Madero` / `Aprobado` → `Publicado`.
   - Separación clara entre piezas contratadas a **REM**, **Otros Prestadores** o producidas por **Marketing Interno**.
   - Enlace directo a la pieza/Drive, observaciones de calidad de Madero, fecha acordada vs fecha real y resultado de publicación.
2. **Módulo 5 — Redes Sociales Multicanal (`m5-redes`):**
   - Tablero auditado de **Instagram, Facebook, TikTok y YouTube**.
   - Frecuencia planificada vs ejecutada, evolución de audiencia, alcance/interacciones, **distribución de contenido por plaza territorial** (Comodoro Rivadavia, Neuquén, Cordillera) y **conclusión propia de Ángelo** por canal.
3. **Módulo 6 — Campañas Pagas y Pauta Digital (`m6-campanas`):**
   - Separación explícita exigida en Sección 4: *REM en la ejecución técnica; Madero en prioridades, presupuesto y validaciones*.
   - Objetivo comercial, presupuesto asignado vs ejecutado, creativos validados, fechas de vigencia, ubicaciones/plazas, leads generados, CPL, **evaluación de calidad de lead** (cruce con Ventas) y **recomendación concreta de Ángelo** (escalar, corregir segmentación/formulario o pausar).

---

## Prompt para copiar y pegar en Antigravity IDE

```text
/plan Ya validé el Paso 3. Ahora vamos a ejecutar únicamente el PASO 4: Módulos 4 (Contenido), 5 (Redes Sociales) y 6 (Campañas Pagas).

Instrucciones obligatorias:
1. Leé `AGENTS.md` y consultá `.agents/skills/madero-crm-builder/references/01-lineamientos-direccion-completo.md` (Sección 4 y Sección 5 módulos 4, 5 y 6) y `03-esquema-datos-12-modulos.md`.
2. Incorporá las colecciones `contenido_piezas`, `redes_sociales` y `campanas_pagas` en `js/data.js` y `js/store.js` preservando en `localStorage` todo lo cargado en los Pasos 1, 2 y 3.
3. Creá `js/modules/contenido-pauta.js` y conectalo en `index.html` y `js/app.js` (marcando `m4-contenido`, `m5-redes` y `m6-campanas` como `activoEnPasoActual: true`).
4. Asegurate de incluir:
   - En Módulo 4 (Contenido): vista/filtros por las 6 etapas del flujo (`Planificado` a `Publicado`), responsable (REM vs Interno), observación de Madero, link de evidencia y resultado.
   - En Módulo 5 (Redes): tarjetas y tabla comparativa de Instagram, Facebook, TikTok y YouTube con frecuencia real vs meta, métricas de audiencia/desempeño, cobertura equilibrada por plaza (Comodoro, Neuquén, Cordillera) y conclusión editable de Ángelo.
   - En Módulo 6 (Campañas Pagas): control presupuestario (asignado vs ejecutado), creativos, plazas, volumen de leads, CPL, semáforo de calidad comercial del lead y recomendación accionable del Líder.
   - Modales CRUD completos y exportación CSV UTF-8 BOM en los tres módulos.
5. NO avances al Paso 5 todavía. Verificá sintaxis con `node --check` y esperá mi validación.
```

---

## Checklist de validación antes de pasar al Paso 5
- [ ] En **Contenido** puedo seguir una pieza desde `Planificado` hasta `Publicado`, pasando por `Observado` con devolución escrita.
- [ ] En **Redes Sociales** están presentes los 4 canales exactos (**Instagram, Facebook, TikTok y YouTube**) con desglose por plaza y conclusión del Líder.
- [ ] En **Campañas Pagas** se refleja tanto la inversión y el resultado cuantitativo como la **calidad real del lead** reportada por Ventas y la recomendación de Ángelo.
