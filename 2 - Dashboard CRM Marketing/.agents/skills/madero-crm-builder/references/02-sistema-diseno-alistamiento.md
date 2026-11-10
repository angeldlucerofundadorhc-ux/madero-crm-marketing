# Sistema de Diseño Benchmark & Contexto Operativo Lucy DMS

- **Referencia oficial provista por el usuario:** `https://dashboard-alistamiento-pi.vercel.app/` (*Madero Automotores · Centro de Alistamiento & Taller*)

---

## 1. Identidad Visual "Apple Glassmorphism Delicate"

### Tipografías (Google Fonts)
- **Editorial y UI:** `Plus Jakarta Sans` (pesos `300, 400, 500, 600, 700, 800`), `tracking-tight` en títulos (`font-extrabold`).
- **Métricas, IDs, Patentes, Porcentajes y Fechas:** `JetBrains Mono` (`.font-mono`).

### Fondo y Superficies
- **Body Background:**
  ```css
  background: radial-gradient(circle at 10% 20%, rgba(245, 240, 235, 0.98), rgba(238, 231, 222, 0.94) 50%, rgba(230, 222, 212, 0.98) 100%);
  color: #1c1917;
  ```
- **`.glass-card`:**
  ```css
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: 1.5rem;
  box-shadow: 0 10px 36px -10px rgba(45, 35, 25, 0.07), 0 1px 3px 0 rgba(0, 0, 0, 0.02);
  ```
- **`.glass-card-dark` (Paneles ejecutivos de alto contraste / Escalamientos a Dirección):**
  ```css
  background: rgba(28, 25, 23, 0.93);
  backdrop-filter: blur(32px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fafaf9;
  ```
- **`.vision-dock` (Barra flotante inferior de navegación):**
  ```css
  background: rgba(255, 255, 255, 0.91);
  backdrop-filter: blur(32px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 40px -8px rgba(45, 35, 25, 0.22), 0 2px 8px rgba(0, 0, 0, 0.06);
  ```
- **Tab Activo (`.tab-btn-active`):** `background: #1c1917 !important; color: #ffffff !important;`

### Badges Semánticos (`.badge-pill`)
- `badge-emerald`: Cumplido / Cerrado con evidencia / Estándar OK (`#065f46` sobre `rgba(16, 185, 129, 0.13)`)
- `badge-amber`: Observado por Madero / Seguimiento activo (`#92400e` sobre `rgba(245, 158, 11, 0.15)`)
- `badge-orange`: Devuelto para corrección (`#9a3412` sobre `rgba(249, 115, 22, 0.14)`)
- `badge-blue`: En elaboración (`#1e40af` sobre `rgba(59, 130, 246, 0.14)`)
- `badge-sky`: Entregado a revisión / Web Dev (`#075985` sobre `rgba(14, 165, 233, 0.14)`)
- `badge-purple`: Reprogramado (`#6b21a8` sobre `rgba(168, 85, 247, 0.14)`)
- `badge-violet`: Pendiente de información de Madero (`#5b21b6` sobre `rgba(139, 92, 246, 0.14)`)
- `badge-red`: Atrasado / Crítico / Trabajo Absorbido (`#991b1b` sobre `rgba(239, 68, 68, 0.13)`)
- `badge-stone`: Pendiente de inicio (`#44403c` sobre `rgba(120, 113, 108, 0.13)`)
- `badge-dark`: Dirección / Nivel Ejecutivo (`#1c1917` texto `#fafaf9`)
- **Regla de contraste en tarjetas oscuras (`.glass-card-dark .badge-*`):** Siempre redefinir colores claros luminosos (`#6ee7b7`, `#fcd34d`, `#93c5fd`, `#c4b5fd`, `#fca5a5`) cuando un `.badge-pill` se renderiza dentro de `.glass-card-dark`.

---

## 2. Anatomía UX Heredada del Benchmark

1. **Top App Bar (`max-w-7xl mx-auto`):** Emblema oscuro redondeado `M`, título `Madero Automotores`, subtítulo de conducción, selector de Nivel (`Control Operativo` vs `Informe Dirección`) y botón de Configuración/Sincronización.
2. **4 Tarjetas Ejecutivas Clicables (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`):** Resumen vivo en la parte superior que al hacer clic filtra directamente la tabla o módulo correspondiente.
3. **Tira Horizontal de los 12 Módulos + VisionOS Bottom Dock:** Acceso en 1 clic a los 12 módulos en desktop y dock inferior táctil de 6 clusters en mobile/desktop.
4. **Tablas Responsivas con Scroll Táctil Suave:** Buscador en vivo, filtros combinados, cambio rápido de estado inline, botón `CSV` (Excel UTF-8 BOM) y modal de ficha completa.

---

## 3. Datos Reales de Sucursales, Talleres y Lucy DMS (Para Paso 3 y Paso 5)

Extraídos del tablero operativo de Alistamiento de Madero Automotores (`163` unidades en línea base):

### Salones y Depósitos Comerciales (`is_taller: false`)
- `MADERO NEUQUEN` — ~40 unidades (27 con foto / 13 sin foto)
- `AV POLONIA 546` (Comodoro · Salón Principal) — ~31 unidades (31 con foto / 0 sin foto — **100% al día**)
- `MADERO MONSEÑOR D'ANDREA 1967` (CAM Comodoro) — ~24 unidades (10 con foto / 14 sin foto)
- `MADERO ALEM 828` (Comodoro) — ~20 unidades (19 con foto / 1 sin foto)
- `Colon Stock S/garantia` (Comodoro) — ~12 unidades (0 con foto / 12 sin foto)
- `CORDILLERA VENTA` — ~4 unidades (2 con foto / 2 sin foto)
- `Sin asignar / Salón no especificado` — ~8 unidades (3 con foto / 5 sin foto)

### Talleres Externos / En Movimiento (`is_taller: true`)
- `LUCAS MECANICO` (10 un.)
- `MOVIMIENTO` (6 un.)
- `DANI MECANICO (ALEM)` (3 un.)
- `MOHE SERVICE SRL` (1 un.)
- `GERMAN CHAPISTA` (1 un.)
- `BILOVA S.A.S (CHAPISTA NEUQUEN)` (1 un.)
- `SERVICIO` (1 un.)

### Endpoint Público de Consulta Lucy DMS (Opcional en Paso 3)
- En `https://dashboard-alistamiento-pi.vercel.app/api/sync-lucy` (GET sin `?force=true` para no consumir cuota diaria) se devuelve `{ ok: true, source: "lucy_live", data: { operational_summary, stock_items, locations, workshops, pre_delivery } }`.
- En el **Paso 3 (Fotografías y Digitalización)** incluir tanto un **snapshot local embebido** (para funcionar 100% offline/sin CORS) como opción de **Importar JSON/CSV desde Lucy/Alistamiento** o intento de fetch opcional con fallback limpio.
