# PASO 1 de 6 — Arquitectura Base, Separación de Responsabilidades, Agenda y Equipo Interno

## ¿Qué construye este paso?
1. **Marco Visual Apple Glassmorphism Madero (`index.html`, `css/styles.css`, `js/ui.js`, `js/app.js`):**
   - Header Maestro con selector de **Dos Niveles** (`Nivel 1: Control Operativo` vs `Nivel 2: Informe Dirección`), configuración de corte semanal y respaldo/importación JSON.
   - 4 Tarjetas Ejecutivas superiores clicables.
   - Tira horizontal de acceso directo a los **12 Módulos** + **VisionOS Floating Bottom Dock**.
2. **Motor de Estado Reactivo (`js/data.js`, `js/store.js`):**
   - Persistencia en `localStorage` (`madero_crm_mkt_v1`), los **9 estados oficiales** de Sección 7 y los **6 actores de responsabilidad** de Sección 1.
3. **Sección 4 + Módulo 1 (Agenda y Prioridades) + Módulo 2 (Equipo Interno, Capacidad, Reemplazos y Trabajo Absorbido)** (`js/modules/conduccion.js`).

> **Nota útil:** En `assets/referencias/avance-paso1-referencia/` ya tenés guardado y testeado el prototipo completo de este Paso 1. El prompt de abajo le indica al agente revisarlo, promoverlo a la raíz del proyecto o ajustarlo según tus indicaciones.

---

## Prompt para copiar y pegar en Antigravity IDE

```text
/plan Vamos a ejecutar únicamente el PASO 1 del proyecto Control Integral de Marketing de Madero Automotores.

Instrucciones obligatorias:
1. Leé primero `AGENTS.md` y activá el skill `.agents/skills/madero-crm-builder/SKILL.md` junto con sus 3 referencias (`01-lineamientos-direccion-completo.md`, `02-sistema-diseno-alistamiento.md` y `03-esquema-datos-12-modulos.md`).
2. Revisá también la base de referencia que existe en `assets/referencias/avance-paso1-referencia/`.
3. Implementá en la raíz de este workspace (`index.html`, `css/styles.css`, `js/data.js`, `js/store.js`, `js/ui.js`, `js/modules/conduccion.js`, `js/app.js`) el PASO 1 completo:
   - Estética idéntica al benchmark Apple Glassmorphism de Alistamiento (`Plus Jakarta Sans` + `JetBrains Mono` + `.glass-card` + `.vision-dock`).
   - Selector superior de Dos Niveles (Nivel 1 Operativo / Nivel 2 Informe Dirección).
   - Matriz interactiva de los 7 Frentes de Separación de Responsabilidades (Sección 4) con semáforo y Criterio editable de Ángelo.
   - Módulo 1 (Agenda y Prioridades) con CRUD completo, filtros por los 6 actores y 9 estados, bandeja destacada de Decisiones Requeridas de Dirección y exportación CSV UTF-8.
   - Módulo 2 (Equipo Interno) con tarjetas de capacidad horaria semanal, cobertura por plaza (Polonia, Alem, CAM D'Andrea, Colón, Neuquén, Cordillera), esquema de reemplazo/backup documentado, bloqueos, control de calidad y marcado explícito de Trabajo Absorbido.
   - Blueprints limpios de arquitectura prevista para los módulos de los Pasos 2 al 5.
4. NO avances al Paso 2 todavía. Verificá sintaxis con `node --check` y esperá mi validación visual.
```

---

## Checklist de validación antes de pasar al Paso 2
- [ ] Al abrir `index.html` se ven las 4 tarjetas superiores, la tira de los 12 módulos y el dock inferior flotante sin errores en consola.
- [ ] Se puede crear/editar una prioridad en **Módulo 1**, marcar `Requiere decisión de Dirección` y ver cómo impacta al instante en la bandeja oscura y en el contador superior.
- [ ] En **Módulo 2 (Equipo Interno)** se visualizan las horas asignadas vs capacidad, el backup de continuidad y los casos de **Trabajo Absorbido**.
- [ ] Al refrescar el navegador (`F5`), todos los cambios persisten en `localStorage`.
