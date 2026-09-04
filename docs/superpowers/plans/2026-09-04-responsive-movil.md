# Pulido Responsive Móvil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer el visor Andean Geology cómodo en teléfonos y tablets (≤640px) sin cambiar la lógica de datos ni el comportamiento en desktop (≥641px).

**Architecture:** Cambios de solo CSS en el bloque `<style>` de `index.html` (más reglas globales de touch/scroll). Sin cambios de lógica JS de datos; se conservan panel colapsable, logo y el auto-colapso inicial en móvil.

**Tech Stack:** HTML/CSS estático, Leaflet 1.9.4 (no versiones de dependencia), GitHub Pages para deploy.

## Global Constraints

- No modificar `articulos.geojson`, KMZ ni `ubicaciones.json`.
- Desktop (≥641px) debe quedar visualmente idéntico al actual.
- Mantener el logo `#plogo` visible en móvil (solo reducirlo, no ocultarlo).
- La cabecera `#phead` con botón `#ptoggle` debe seguir colapsando/expandiendo el cuerpo `#pbody`.
- Sin agregar dependencias ni archivos nuevos fuera de `index.html` (salvo la spec/plan ya creados).

---

### Task 1: CSS responsive + reglas táctiles en `index.html`

**Files:**
- Modify: `C:\Users\carlos.venegas\Claude\proyectos\Andean-Geology\index.html` (bloque `<style>`, líneas 12–61)

**Interfaces:**
- Consumes: estructura HTML existente (`#panel`, `#phead`, `#ptoggle`, `#plogo`, `#pbody`, `.capa`, `.bloque`, `#busq`, `#decada`, `#leybtn`, `.leaflet-popup-content`, `.btn`, `.lm`).
- Produces: reglas CSS listas para verificación manual en el navegador.

- [ ] **Step 1: Agregar reglas globales de touch/scroll/inputs**

Insertar justo después de la línea 12 (`html,body{...}`) y antes de `#app{`:

```css
  input,select,button{touch-action:manipulation}
  input,select{font-size:16px}
  html,body{overscroll-behavior:none}
  #pbody{overscroll-behavior-y:contain}
```

- [ ] **Step 2: Reemplazar la media query móvil existente (línea 44)**

Reemplazar:
```css
  @media (max-width:640px){ #panel{max-height:55vh;max-height:55dvh} #phead h1{font-size:13px} }
```
por:
```css
  @media (max-width:640px){
    #panel{max-height:62dvh}
    #phead h1{font-size:13px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #ptoggle{height:44px;min-width:44px}
    #plogo{height:26px}
    .leaflet-popup-content{min-width:0;max-width:calc(100vw - 20px);max-height:60vh}
    .capa{font-size:15px;padding:9px 2px}
    .capa input{width:22px;height:22px}
    .btn{padding:9px 12px;font-size:13px}
    .lm{font-size:12.5px;padding:6px 12px}
    #busq{font-size:16px}
    #decada{font-size:16px}
    .bloque{padding:10px 12px}
    #leybtn{font-size:14px;padding:10px}
    .leaflet-control-layers,.leaflet-control-layers label{font-size:15px}
    .leaflet-control-layers input[type=checkbox]{width:22px;height:22px}
  }
  @media (max-width:640px) and (max-height:480px){ #panel{max-height:38dvh} }
```

- [ ] **Step 3: Añadir ajuste de tablet (641–900px)**

Agregar antes del bloque `@media (min-width:900px){...}` (línea 43):
```css
  @media (min-width:641px) and (max-width:900px){ #panel{max-height:50dvh} }
```

- [ ] **Step 4: Verificar estructura del HTML servido**

Run (PowerShell, desde el repo):
```powershell
python -m http.server 8765 --directory "C:\Users\carlos.venegas\Claude\proyectos\Andean-Geology" ; # ctrl+c tras la comprobación
```
En otra terminal:
```powershell
$h = Invoke-WebRequest http://localhost:8765/index.html -UseBasicParsing
$t = $h.Content
if ($t -match 'max-width:640px' -and $t -match 'touch-action:manipulation' -and $t -match 'overscroll-behavior-y:contain' -and $t -match 'min-width:0;max-width:calc\(100vw - 20px\)') { "OK: reglas presentes" } else { "FALTA ALGUNA REGLA" }
```
Expected: `OK: reglas presentes`

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: pulido responsive para movil (popup, inputs, touch, panel landscape)"
```

---

### Task 2: Deploy y verificación en producción

**Files:**
- Modify: (ninguno — deploy)

**Interfaces:**
- Consumes: Task 1 (index.html con reglas aplicadas y commiteado).
- Produces: visor actualizado en `https://cvenegas-sernageomin.github.io/Andean-Geology/`.

- [ ] **Step 1: Push a GitHub Pages**

Run (desde `C:\Users\carlos.venegas\Claude\proyectos\Andean-Geology`):
```bash
git push origin main
```
Expected: `main -> main` sin errores.

- [ ] **Step 2: Verificar despliegue (esperar build ~55 s)**

Run:
```powershell
Start-Sleep -Seconds 55
python -c "import requests; t=requests.get('https://cvenegas-sernageomin.github.io/Andean-Geology/index.html',timeout=60).text; print('OK 200' if 'touch-action:manipulation' in t and 'max-width:640px' in t else 'FALTA REGLA EN PRODUCCION'); import requests as r; print('geojson:', r.get('https://cvenegas-sernageomin.github.io/Andean-Geology/articulos.geojson',timeout=60).status_code)"
```
Expected: `OK 200` y `geojson: 200`.

- [ ] **Step 3: Validación visual por el usuario**

Pedir al usuario abrir el visor en su teléfono/tablet (retrato y apaisado, ancho 320–640px) y verificar:
1. Popup de un punto no se desborda y es legible.
2. Al enfocar el buscador no hay zoom automático (iOS).
3. La cabecera con logo se mantiene y el botón colapsa/expande el panel sin tapar el mapa.
4. En apaisado el mapa queda grande.

- [ ] **Step 4: Marcar la spec como implementada (opcional, solo si el usuario confirma la validación)**

Actualizar `docs/superpowers/specs/2026-09-04-responsive-movil-design.md` añadiendo una línea final `**Estado:** implementado y verificado en producción (fecha).` y commitear.

---

## Self-Review
- **Cobertura de spec:** cada punto del spec (popup, inputs, touch targets, landscape, logo, barra colapsable, touch-action, overscroll) tiene su regla en Task 1 Step 2; tablet en Step 3; verificación en Task 2. Sin huecos.
- **Placeholders:** no hay TBD/TODO; cada paso tiene código o comando concreto.
- **Consistencia de tipos/selectores:** todos los selectores usados coinciden con el HTML existente (`#ptoggle`, `#plogo`, `#phead h1`, `.capa input`, `.btn`, `.lm`, `.leaflet-control-layers`, `#busq`, `#decada`, `#leybtn`, `.bloque`).