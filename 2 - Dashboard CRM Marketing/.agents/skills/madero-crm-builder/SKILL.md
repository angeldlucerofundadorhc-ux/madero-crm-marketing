---
name: madero-crm-builder
description: >-
  Guía integral, arquitectura modular, reglas de negocio de Dirección y sistema
  de diseño Apple Glassmorphism para construir paso a paso (Pasos 1 a 6) el
  Dashboard y CRM de Control Integral de Marketing de Madero Automotores.
  Activar siempre que el usuario solicite planificar, implementar, revisar o
  ampliar cualquier paso o módulo de este proyecto en Antigravity IDE.
---

# Skill: Constructor Paso a Paso — Control Integral de Marketing (Madero Automotores)

Usá este skill en cada uno de los **6 Pasos** de desarrollo dentro de Antigravity IDE.

## Lectura Obligatoria Según el Paso Activo

1. **En todos los pasos**, consultá primero:
   - [01-lineamientos-direccion-completo.md](./references/01-lineamientos-direccion-completo.md) — Documento íntegro emitido por Dirección de Madero Automotores el 28/10/2026 (12 secciones y tablas oficiales).
   - [03-esquema-datos-12-modulos.md](./references/03-esquema-datos-12-modulos.md) — Esquema JSON unificado (`madero_crm_mkt_v1`) para no romper compatibilidad en `localStorage` entre pasos.
2. **Al tocar UI, estilos, tablas, modales o sincronización con Lucy DMS**, consultá:
   - [02-sistema-diseno-alistamiento.md](./references/02-sistema-diseno-alistamiento.md) — Tokens visuales exactos de `https://dashboard-alistamiento-pi.vercel.app/` y catálogo real de sucursales/talleres de Madero.

## Secuencia Oficial de los 6 Pasos

| Paso | Alcance Exacto | Archivos Principales |
| :--- | :--- | :--- |
| **Paso 1** | Arquitectura Base, Header de 2 Niveles, Dock VisionOS, Matriz de Gobernanza (Sección 4), **Módulo 1 (Agenda y Prioridades)** y **Módulo 2 (Equipo Interno, Capacidad, Reemplazos y Trabajo Absorbido)**. *(Existe un prototipo validado en `assets/referencias/avance-paso1-referencia/` listo para promover/ajustar).* | `index.html`, `css/styles.css`, `js/data.js`, `js/store.js`, `js/ui.js`, `js/modules/conduccion.js`, `js/app.js` |
| **Paso 2** | **Módulo 9: Auditoría y Seguimiento de Proveedores (REM, L. Christian y otros)** con los 10 campos obligatorios de Sección 7, circuito formal de minutas (Sección 8), los 9 estados normados y registro de **Trabajo Absorbido**. | `js/modules/proveedores.js` + integración en `data.js`, `store.js`, `app.js`, `index.html` |
| **Paso 3** | **Módulo 3: Reporte Semanal de Fotografías y Digitalización** (los 8 datos semanales de Sección 6: Universo controlado, Listos, Pendientes de coordinación, Pendientes de carga Drive/Lucy/Web, Cobertura incompleta, Calidad observada, Consistencia y Evolución + integración con snapshot Lucy DMS de 163 unidades). | `js/modules/fotografias.js` + integración en `data.js`, `store.js`, `app.js`, `index.html` |
| **Paso 4** | **Módulo 4 (Contenido y Piezas)**, **Módulo 5 (Redes Sociales: IG, FB, TikTok, YouTube por plaza)** y **Módulo 6 (Campañas Pagas: presupuesto, creativos, leads, CPL, calidad comercial y recomendación)**. | `js/modules/contenido-pauta.js` + integración en `data.js`, `store.js`, `app.js`, `index.html` |
| **Paso 5** | **Módulo 7 (Ecosistema Google)**, **Módulo 8 (Web y Staging)**, **Módulo 10 (Eventos y Presencia Regional)**, **Módulo 11 (Merchandising e Inventario POP)** y **Módulo 12 (Relación con Ventas y Stock Prioritario)**. | `js/modules/ecosistema-territorio.js` + integración en `data.js`, `store.js`, `app.js`, `index.html` |
| **Paso 6** | **Nivel 2 Completo: Informe Semanal Ejecutivo para Dirección (Sección 10)** con las 8 secciones exactas exigidas por Dirección, Alertas Tempranas consolidadas, Decisiones Requeridas, Criterio de Ángelo, Exportación Global CSV/JSON y Vista de Impresión PDF de 1 página. | `js/modules/informe-direccion.js` + refinamiento final `@media print` en `css/styles.css` |

## Protocolo de Validación al Cerrar Cada Paso
1. Ejecutar `node --check` sobre cada archivo `.js` creado o editado.
2. Verificar que `ensureDefaults()` en `js/store.js` fusione cualquier nueva colección de datos sin borrar ediciones previas guardadas en `localStorage`.
3. Confirmar que cada módulo nuevo incluya:
   - Buscador y filtros reactivos (preservando foco de input).
   - Modal completo de Alta / Edición / Inspección con evidencia y criterio de Ángelo.
   - Botón de exportación CSV con BOM UTF-8 (`\uFEFF`).
4. Detenerse y presentar un resumen claro a Ángelo para su validación antes de ejecutar el siguiente paso.
