# Guía Maestra de Ejecución en Antigravity IDE
## Dashboard & CRM de Control Integral de Marketing — Madero Automotores

Todo quedó estructurado y preparado en esta carpeta (`2 - Dashboard CRM Marketing`) para que lo ejecutes **vos mismo, paso a paso y bajo tu control directo desde Antigravity IDE**, sin mezclar archivos con tus otros trabajos de la carpeta raíz.

---

## 1. Cómo abrir el proyecto en Antigravity IDE

1. Abrí **Antigravity IDE**.
2. Andá a **File → Open Folder...** y seleccioná exactamente esta carpeta:
   ```text
   D:\00-Software-Base\03-Proyectos\00-Madero\18 - CRM para el Depto de Marketing\2 - Dashboard CRM Marketing
   ```
3. **Importante (por qué abrir esta subcarpeta como raíz del Workspace):**
   - Al abrir `2 - Dashboard CRM Marketing` como raíz, Antigravity IDE detecta **automáticamente**:
     - `AGENTS.md` → Reglas permanentes que impiden que el agente se apure o saltee campos del documento de Dirección.
     - `.agents/skills/madero-crm-builder/` → Skill especializado con la transcripción completa del `.docx` de Dirección (`01-lineamientos-direccion-completo.md`), el ADN visual de Alistamiento/Lucy DMS (`02-sistema-diseno-alistamiento.md`) y el contrato JSON de los 12 módulos (`03-esquema-datos-12-modulos.md`).

---

## 2. Estructura de carpetas que tenés lista

```text
2 - Dashboard CRM Marketing/
├── AGENTS.md                                      # Reglas automáticas siempre activas en Antigravity IDE
├── INSTRUCCIONES_ANTIGRAVITY_IDE.md               # Esta guía maestra de ejecución
├── vercel.json                                    # Configuración lista para deploy en Vercel
├── .agents/
│   └── skills/
│       └── madero-crm-builder/
│           ├── SKILL.md                           # Skill local descubierto automáticamente por Antigravity IDE
│           └── references/
│               ├── 01-lineamientos-direccion-completo.md   # Documento íntegro del 28/10/2026 (12 secciones)
│               ├── 02-sistema-diseno-alistamiento.md       # Estilos Apple Glassmorphism + Sucursales Lucy DMS
│               └── 03-esquema-datos-12-modulos.md          # Esquema JSON unificado (localStorage)
├── prompts/                                       # 6 Prompts listos para copiar y pegar (uno por paso)
│   ├── PASO_01_Arquitectura_Gobernanza_Agenda_Equipo.md
│   ├── PASO_02_Auditoria_Proveedores_REM_Trabajo_Absorbido.md
│   ├── PASO_03_Fotografias_Digitalizacion_Sync_Lucy.md
│   ├── PASO_04_Contenido_Redes_Campanas_Pagas.md
│   ├── PASO_05_Google_Web_Eventos_Merch_Ventas.md
│   └── PASO_06_Informe_Semanal_Direccion_Alertas_PDF.md
├── docs/
│   └── MAPA_FUNCIONAL_Y_CHECKLIST_DIRECCION.md    # Checklist de trazabilidad contra cada punto de Dirección
├── css/                                           # Destino para styles.css
├── js/
│   └── modules/                                   # Destino para data.js, store.js, ui.js, app.js y módulos 1..12
└── assets/
    └── referencias/
        └── avance-paso1-referencia/               # Prototipo validado del Paso 1 por si querés reutilizarlo como base
```

---

## 3. Flujo de Ejecución Paso a Paso (En 6 Etapas Controladas)

Abrí el panel de **Agent / Chat** en Antigravity IDE (idealmente en una conversación limpia o usando `/compact` cada 2 pasos para mantener máxima precisión de contexto) y seguí este orden:

### Etapa 1 — Base, Separación de Responsabilidades, Agenda y Equipo Interno
- Abrí `prompts/PASO_01_Arquitectura_Gobernanza_Agenda_Equipo.md`.
- Copiá el bloque de prompt (incluye `/plan`) y pegalo en el chat de Antigravity IDE.
- Revisá el plan, aprobá con **Proceed** y probá `index.html` en tu navegador.
- *(Nota: el agente ya cuenta con `assets/referencias/avance-paso1-referencia/` como base verificada, por lo que el Paso 1 quedará sólido de inmediato y podrás pedirle cualquier ajuste fino de nombres o criterios antes de seguir).*

### Etapa 2 — Núcleo de Auditoría de Proveedores (REM, L. Christian y Otros)
- Cuando estés conforme con el Paso 1, abrí `prompts/PASO_02_Auditoria_Proveedores_REM_Trabajo_Absorbido.md`.
- Pegá el prompt en Antigravity IDE.
- Validá los **10 campos obligatorios de la Sección 7**, los **9 estados**, el **control de minutas sin suavizar (Sección 8)** y el registro de **Trabajo Absorbido**.

### Etapa 3 — Reporte Semanal de Fotografías, Digitalización y Stock Lucy DMS
- Abrí `prompts/PASO_03_Fotografias_Digitalizacion_Sync_Lucy.md` y pegá su prompt.
- Validá los **8 indicadores semanales de la Sección 6**, los checks de carga por plataforma (`Drive`, `Lucy`, `Web`, `Redes`), la cobertura por sucursal (`Polonia`, `Alem`, `CAM D'Andrea`, `Colón`, `Neuquén`, `Cordillera`) y el control de calidad/consistencia.

### Etapa 4 — Contenido, Redes Sociales (IG, FB, TikTok, YouTube) y Campañas Pagas
- Abrí `prompts/PASO_04_Contenido_Redes_Campanas_Pagas.md` y pegá su prompt.
- Validá el flujo de aprobación de piezas, métricas por plaza y cruce de calidad de leads con Ventas.

### Etapa 5 — Google, Web, Eventos Regionales, Merchandising y Relación con Ventas
- Abrí `prompts/PASO_05_Google_Web_Eventos_Merch_Ventas.md` y pegá su prompt.
- Con esto los **12 módulos operativos del Nivel 1** quedan 100% activos en verde.

### Etapa 6 — Capa Gerencial: Informe Semanal a Dirección, Alertas y PDF
- Abrí `prompts/PASO_06_Informe_Semanal_Direccion_Alertas_PDF.md` y pegá su prompt.
- Validá los **8 bloques exactos de la Sección 10** en `Nivel 2 · Informe Dirección` y probá el botón `Imprimir / Guardar PDF`.

---

## 4. Cómo Previsualizar Localmente Mientras Desarrollás

La arquitectura está diseñada sin compiladores pesados para que puedas probarla al instante de cualquiera de estas 3 maneras:

1. **Doble clic directo:** Abrí `index.html` directamente en Google Chrome o Edge (`file:///...` funciona sin errores de CORS).
2. **Servidor local Python (en la terminal de Antigravity IDE):**
   ```powershell
   python -m http.server 8080
   ```
   Y abrí `http://localhost:8080`.
3. **Extensión Live Server** en Antigravity IDE (`Go Live` sobre `index.html`).

---

## 5. Cómo Publicar en Vercel (Igual que el Dashboard de Alistamiento)

Cuando tengas los 6 pasos validados, desde la terminal integrada de Antigravity IDE parada en `2 - Dashboard CRM Marketing`:

```powershell
npx vercel
```
Y para pasar a producción:
```powershell
npx vercel --prod
```
