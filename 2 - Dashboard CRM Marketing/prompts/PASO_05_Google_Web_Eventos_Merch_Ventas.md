# PASO 5 de 6 — Google, Web, Eventos Regionales, Merchandising y Relación con Ventas

## ¿Qué construye este paso?
Completa los 5 módulos restantes del **Nivel 1 Operativo** dentro del cluster **`🌐 Google, Web & Territorio`** (**Módulos 7, 8, 10, 11 y 12** de la Sección 5):
1. **Módulo 7 — Ecosistema Google (`m7-google`):**
   - Auditoría de **Google Business Profile** (por sucursal), **Workspace**, **Analytics 4**, **Tag Manager**, **Search Console** y **Google Ads**.
   - Control de **propiedad institucional y accesos pendientes** de Madero vs proveedores, entregables, evidencia, observación y próximo paso.
2. **Módulo 8 — Plataforma Web (`m8-web`):**
   - Seguimiento técnico con **L. Christian** u otros prestadores: cambios solicitados, etapa (`Solicitado`, `En desarrollo`, `En prueba / Staging`, `Observado QA`, `Validado en Producción`), URL de prueba, observaciones de Madero, fecha acordada y validación final.
3. **Módulo 10 — Eventos y Presencia Regional (`m10-eventos`):**
   - Calendario futuro y ejecutado (Comodoro, Neuquén, Cordillera, activaciones especiales), objetivo comercial/marca, presupuesto estimado vs real, responsables, difusión previa y resultado medido.
4. **Módulo 11 — Merchandising e Inventario POP (`m11-merch`):**
   - Inventario físico por sucursal/depósito, destino (kits de entrega a clientes, eventos, indumentaria/salón), costo unitario, alertas automáticas de **punto de reposición**, utilización y necesidades futuras.
5. **Módulo 12 — Relación con Ventas (`m12-ventas`):**
   - Puente formal entre Marketing y los equipos comerciales de cada salón: necesidades comerciales, devoluciones de asesores sobre calidad de leads, **stock prioritario a empujar (+180 días)** y desvíos detectados entre publicación y salón físico.

---

## Prompt para copiar y pegar en Antigravity IDE

```text
/plan Ya validé el Paso 4. Ahora vamos a ejecutar únicamente el PASO 5 para completar los 12 módulos operativos del Nivel 1: Módulos 7 (Google), 8 (Web), 10 (Eventos y Presencia Regional), 11 (Merchandising) y 12 (Relación con Ventas).

Instrucciones obligatorias:
1. Leé `AGENTS.md` y consultá `.agents/skills/madero-crm-builder/references/01-lineamientos-direccion-completo.md` (Sección 4 y Sección 5 módulos 7, 8, 10, 11 y 12) y `03-esquema-datos-12-modulos.md`.
2. Incorporá `google_activos`, `web_cambios`, `eventos_regionales`, `merchandising_stock` y `ventas_feedback` en `js/data.js` y `js/store.js` sin sobrescribir ningún dato previo en `localStorage`.
3. Creá `js/modules/ecosistema-territorio.js` y conectalo en `index.html` y `js/app.js` (marcando los 5 módulos como `activoEnPasoActual: true`, con lo cual los 12 módulos de la tira superior quedan 100% operativos en verde).
4. Verificá que cada uno de los 5 módulos tenga:
   - KPIs propios en cabecera, buscador/filtros reactivos, estados normados, modal completo de Alta/Edición y exportación CSV UTF-8 BOM.
   - En Google: semáforo claro de propiedad institucional vs accesos pendientes de Madero.
   - En Web: circuito completo con entorno de prueba/staging y validación final.
   - En Merchandising: cálculo automático de valorización de stock y alerta roja/ámbar cuando `stock_actual <= stock_minimo_reposicion`.
   - En Relación con Ventas: vinculación con patentes/unidades críticas y seguimiento hasta el cierre.
5. NO avances al Paso 6 todavía. Verificá sintaxis con `node --check` y esperá mi validación.
```

---

## Checklist de validación antes de pasar al Paso 6
- [ ] Los **12 módulos** exigidos en la Sección 5 tienen punto esmeralda activo en la barra superior y funcionan sin vistas pendientes.
- [ ] Quedan claramente expuestos los **accesos pendientes de Google**, las **etapas de prueba Web**, el **punto de reposición de Merchandising** y los **pedidos/devoluciones de Ventas**.
