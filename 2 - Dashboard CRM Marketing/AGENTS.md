# Reglas del Proyecto: Dashboard & CRM de Control Integral de Marketing — Madero Automotores

Este directorio contiene el proyecto **Control Integral de Marketing** para **Madero Automotores**, conducido por **Ángelo Lucero (Líder de Marketing)** bajo los lineamientos formales emitidos por **Dirección el 28 de octubre de 2026**.

## 1. Regla Estricta de Trabajo "Paso a Paso"
- **PROHIBIDO construir los 12 módulos de golpe en una sola respuesta.** Este sistema es complejo y requiere precisión operativa absoluta.
- Ejecutá **únicamente el Paso puntual** que el usuario te indique (Paso 1, Paso 2, Paso 3, Paso 4, Paso 5 o Paso 6, detallados en `prompts/`).
- Al finalizar cada paso:
  1. Verificá sintaxis de todos los archivos JS (`node --check`).
  2. Comprobá que las vistas anteriores sigan funcionando sin regresiones y que `localStorage` preserve los datos previos.
  3. Detenete y pedí validación explícita de Ángelo antes de pasar al siguiente paso.

## 2. Fuentes de Verdad Obligatorias
Antes de diseñar o escribir código en cualquier paso, activá y consultá el skill local `.agents/skills/madero-crm-builder/SKILL.md` y sus tres documentos de referencia:
- `.agents/skills/madero-crm-builder/references/01-lineamientos-direccion-completo.md` (Transcripción íntegra de la devolución de Dirección del 28/10/2026).
- `.agents/skills/madero-crm-builder/references/02-sistema-diseno-alistamiento.md` (ADN visual Apple Glassmorphism y contexto real de sucursales/Lucy DMS de `https://dashboard-alistamiento-pi.vercel.app/`).
- `.agents/skills/madero-crm-builder/references/03-esquema-datos-12-modulos.md` (Contrato JSON unificado en `localStorage` bajo la clave `madero_crm_mkt_v1`).

## 3. Invariantes de Dominio y Negocio (No Negociables)
1. **Dos Niveles de Información (Sección 3):**
   - **Nivel 1 (Prioritario):** Control Operativo de Marketing (los 12 módulos con evidencia, fechas, calidad y responsables).
   - **Nivel 2:** Resumen Gerencial / Informe Semanal a Dirección (construido sobre datos operativos validados + lectura y criterio propio de Ángelo).
2. **Separación Nítida de Responsabilidades — Los 6 Actores (Sección 1 y 4):**
   - `MKT_INTERNO`: Marketing Interno
   - `REM`: Agencia Externa REM
   - `CHRISTIAN_WEB`: L. Christian (Desarrollo / Web)
   - `OTRO_PRESTADOR`: Otros Prestadores Externos
   - `AREAS_MADERO`: Áreas Internas de Madero (Ventas, CAM Alistamiento/Taller, Administración)
   - `DIRECCION`: Dirección de Madero Automotores
3. **Circuito Oficial de 9 Estados (Sección 7):**
   Usar siempre los 9 estados normados sin inventar sinónimos ambiguos:
   `PENDIENTE_INFO_MADERO` · `PENDIENTE_INICIO` · `EN_ELABORACION` · `ENTREGADO_REVISION` · `OBSERVADO_MADERO` · `DEVUELTO_CORRECCION` · `REPROGRAMADO` · `ATRASADO` · `CERRADO_EVIDENCIA`.
4. **Prohibición de Sustitución Silenciosa (Sección 7, 8 y 9):**
   Toda actividad que Marketing Interno deba absorber de urgencia por demora o falla de calidad de REM u otro proveedor debe registrarse explícitamente como **Trabajo Absorbido** (horas, motivo, impacto y reclamo de origen).
5. **Plazas Reales de Madero Automotores:**
   - Comodoro Rivadavia: `Av. Polonia 546 (Salón Principal)`, `Av. Alem 828`, `CAM (Monseñor D'Andrea 1967)`, `Colón Stock`
   - Neuquén: `Madero Neuquén`
   - Cordillera: `Cordillera Venta`

## 4. Arquitectura Técnica y Estándar Visual
- **Stack:** HTML5 + Tailwind CSS (CDN) + CSS propio (`css/styles.css`) + Vanilla JavaScript modular (`js/*.js` y `js/modules/*.js`) cargado con etiquetas `<script>` estándar (sin bundlers complejos ni ES Modules que fallen por CORS en `file://`), 100% listo para abrir localmente o desplegar en Vercel.
- **Estética:** Sistema *Apple Glassmorphism Delicate* idéntico a `dashboard-alistamiento-pi.vercel.app` (fondo radial piedra cálido, `.glass-card`, `.glass-card-dark`, `.vision-dock`, tipografías `Plus Jakarta Sans` + `JetBrains Mono`).
- **Calidad Técnica:**
  - Escapar siempre texto dinámico con `MaderoUI.esc()` (especialmente apóstrofes como `Monseñor D'Andrea`).
  - Preservar foco y posición del cursor en inputs de búsqueda reactiva (`oninput`).
  - Exportar archivos `.csv` con BOM UTF-8 (`\uFEFF`) para compatibilidad directa con Microsoft Excel en Windows.
