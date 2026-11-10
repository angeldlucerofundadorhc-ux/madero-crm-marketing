# PASO 3 de 6 — Reporte Semanal de Fotografías, Digitalización y Consistencia de Stock

## ¿Qué construye este paso?
Implementa íntegramente el **Módulo 3 (Sección 5.3 y Sección 6 completa)**:
1. **`js/modules/fotografias.js` — Los 8 Datos Semanales Estables de la Sección 6:**
   - **1. Universo controlado:** Total de vehículos en stock bajo seguimiento (cruzado con sucursales reales de Lucy DMS: Polonia 546, Alem 828, CAM Monseñor D'Andrea 1967, Colón Stock, Madero Neuquén, Cordillera y talleres).
   - **2. Listos para fotografiar:** Unidades disponibles y preparadas en salón.
   - **3. Pendientes de coordinación:** Unidades listas cuya sesión aún no se realizó, con **causa** (falta lavado, llave, playón ocupado, clima) y **próxima acción**.
   - **4. Fotografiados pendientes de carga:** Material ya producido indicando en qué plataforma falta subir (**Drive**, **Lucy DMS**, **Web Oficial**, **Redes/Clasificados**).
   - **5. Cobertura incompleta:** Unidades con set parcial (ej. menos de 8 tomas estándar, detallando qué fotos faltan: interior, motor, tablero, etc.).
   - **6. Calidad observada:** Material rechazado/observado por Marketing o Ventas, con **motivo concreto**, **responsable** y **fecha de nueva revisión**.
   - **7. Consistencia inter-canales:** Diferencias detectadas de fotos, precio/estado de reserva, km o color entre Drive, Lucy, Web y salón físico.
   - **8. Evolución semanal:** Comparativa de altas, unidades regularizadas y saldo pendiente respecto de la semana anterior + definición visible del **Estándar de Calidad Aceptable de Madero**.
2. **Sincronización / Importación con Lucy DMS:**
   - Base embebida representativa de las unidades reales de Madero + botón para **Importar CSV/JSON de Lucy / Alistamiento** o consultar snapshot público de `https://dashboard-alistamiento-pi.vercel.app/api/sync-lucy` (modo lectura segura sin `force=true`, con fallback local si hay restricción CORS).

---

## Prompt para copiar y pegar en Antigravity IDE

```text
/plan Ya validé el Paso 2. Ahora vamos a ejecutar únicamente el PASO 3: Módulo 3 de Reporte Semanal de Fotografías, Digitalización y Consistencia de Stock.

Instrucciones obligatorias:
1. Leé `AGENTS.md` y consultá `.agents/skills/madero-crm-builder/references/01-lineamientos-direccion-completo.md` (Sección 6 completa), `02-sistema-diseno-alistamiento.md` (sucursales reales y estructura Lucy DMS) y `03-esquema-datos-12-modulos.md`.
2. Incorporá `fotografia_semanal_meta` y `fotografia_unidades` en `js/data.js` y `js/store.js` preservando todos los datos previos en `localStorage`.
3. Creá `js/modules/fotografias.js` y conectalo en `index.html` y `js/app.js` (marcando `m3-fotos` como `activoEnPasoActual: true`).
4. El módulo debe mostrar con claridad visual estilo Alistamiento:
   - Embudo superior con los 8 indicadores semanales obligatorios de la Sección 6 + barra de progreso de cobertura por sucursal (Polonia 546, Alem 828, CAM D'Andrea 1967, Colón, Neuquén, Cordillera y Talleres).
   - Bloque editable del "Estándar de Calidad Fotográfica Aceptable de Madero" y panel de Evolución vs Semana Anterior (altas, regularizadas y pendientes).
   - Matriz por vehículo (patente, marca/modelo, sucursal, días en stock) con checkboxes/badges individuales de plataforma (`Drive`, `Lucy`, `Web`, `Redes`), cantidad de fotos vs estándar, estado de calidad, observaciones de Ventas/Marketing y alerta de inconsistencia entre canales.
   - Modal de edición por unidad, alta manual, importador CSV/sincronización opcional con Lucy DMS y exportación CSV UTF-8 BOM.
5. NO avances al Paso 4 todavía. Verificá sintaxis con `node --check` y esperá mi revisión.
```

---

## Checklist de validación antes de pasar al Paso 4
- [ ] Están visibles y diferenciados los **8 datos semanales exactos** pedidos por Dirección en la Sección 6.
- [ ] En cada unidad se puede distinguir si falta **coordinar sesión**, si ya fue fotografiada pero **falta subir a Drive / Lucy / Web**, si tiene **set incompleto**, **calidad observada** o **inconsistencia de datos**.
- [ ] Puedo filtrar por sucursal (`CAM Monseñor D'Andrea`, `Neuquén`, `Polonia`, etc.) igual de cómodo que en el dashboard de Alistamiento.
