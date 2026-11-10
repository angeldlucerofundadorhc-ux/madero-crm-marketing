# PASO 6 de 6 — Capa Gerencial Completa: Informe Semanal a Dirección, Alertas Tempranas y PDF

## ¿Qué construye este paso?
Cierra el circuito de **Dos Niveles (Sección 3)** e implementa en su totalidad el **Formato Oficial del Informe Semanal a Dirección (Sección 10)**:
1. **`js/modules/informe-direccion.js` — Los 8 Bloques Exactos de la Sección 10 (100% Alimentados en Vivo desde los 12 Módulos Operativos):**
   - **Bloque 1:** Resumen del estado general del área, semáforo global y cambios relevantes de la semana (firmado con la lectura propia de Ángelo).
   - **Bloque 2 — Marketing Interno:** Síntesis consolidada de tareas, cobertura fotográfica semanal (Drive/Lucy/Web), eventos y estado de merchandising.
   - **Bloque 3 — REM y Otros Proveedores:** Compromisos activos, entregas cerradas, observaciones formales, atrasos, estado de minutas y próximos pasos.
   - **Bloque 4 — Canales y Campañas:** Publicaciones, pauta paga (inversión, CPL, calidad de leads), Google, YouTube, Web y principales conclusiones.
   - **Bloque 5 — Control de Calidad:** Entregables aceptados vs observados/devueltos (internos y externos) y criterio aplicado por Madero.
   - **Bloque 6 — Dependencias de Madero:** Accesos, información, material, lavado/llaves o aprobaciones internas pendientes que bloquean avances.
   - **Bloque 7 — Trabajo Absorbido Internamente (No Sustitución Silenciosa):** Horas y tareas absorbidas tanto en Equipo Interno como en Proveedores + medida tomada para corregir la causa de origen.
   - **Bloque 8 — Prioridades de la Semana Siguiente y Decisiones que Requiere Dirección:** Con antecedentes, impacto y **recomendación profesional concreta de Ángelo Lucero**.
2. **Motor de Alertas Tempranas (Anticipación — Sección 1 y 9):**
   - Detección automática de vencimientos próximos, stock crítico sin foto, reposiciones urgentes de merchandising, minutas sin formalizar y campañas con baja calidad de lead.
3. **Exportación Ejecutiva Lista para Reunión de Dirección:**
   - Modo **Impresión Ejecutiva / Guardar como PDF** limpio (hoja institucional Madero sin menús ni scrollbars) + **Exportación Maestra de Respaldo Semanal (JSON + Pack CSV)**.

---

## Prompt para copiar y pegar en Antigravity IDE

```text
/plan Ya validé los Pasos 1 a 5 (los 12 módulos operativos). Ahora vamos a ejecutar el PASO 6 FINAL: Capa Gerencial Completa e Informe Semanal a Dirección (Secciones 3, 9 y 10).

Instrucciones obligatorias:
1. Leé `AGENTS.md` y consultá `.agents/skills/madero-crm-builder/references/01-lineamientos-direccion-completo.md` (especialmente Secciones 1, 3, 9 y los 8 puntos exactos de la Sección 10) y `03-esquema-datos-12-modulos.md`.
2. Creá `js/modules/informe-direccion.js`, integrá los cálculos transversales de los 12 módulos en `js/store.js` (`getExecutiveReportData()`) y conectalo al Nivel 2 (`Nivel 2 · Informe Dirección`) en `js/app.js` e `index.html`.
3. La vista de Nivel 2 debe:
   - Mostrar los 8 bloques exactos de la Sección 10 alimentados automáticamente con los datos reales cargados en los 12 módulos, más campos de conclusión ejecutiva editables por Ángelo en cada bloque.
   - Incluir un panel de "Alertas Tempranas y Anticipación" que detecte automáticamente atrasos, bloqueos internos, stock sin foto en salones principales, minutas no cerradas y stock bajo de merchandising.
   - Permitir hacer clic en cualquier indicador gerencial para saltar directo al módulo operativo de respaldo ("Breve en su lectura y completo en su respaldo").
   - Perfeccionar `@media print` en `css/styles.css` para que el botón `Imprimir / Guardar PDF para Dirección` genere un informe ejecutivo impecable listo para presentar o enviar por correo/WhatsApp a Dirección.
4. Ejecutá verificación completa de sintaxis (`node --check`) en todos los archivos JS y confirmá que el sistema completo de 12 módulos + 2 niveles opere sin errores.
```

---

## Checklist final del proyecto completo
- [ ] Dirección puede abrir `Nivel 2 · Informe Dirección` y comprender en 2 minutos el panorama completo de Marketing **sin reconstruir chats ni minutas**.
- [ ] Cada cifra del resumen gerencial tiene trazabilidad directa con clic hacia su módulo operativo en el Nivel 1.
- [ ] `Ctrl + P` / `Imprimir / PDF` produce un informe institucional limpio, legible y profesional con la conclusión y recomendaciones de Ángelo Lucero.
