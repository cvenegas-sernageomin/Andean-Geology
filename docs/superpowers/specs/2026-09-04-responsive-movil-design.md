# Diseño — Pulido responsive del visor (teléfonos y tablets)

**Fecha:** 2026-09-04
**Repo:** cvenegas-sernageomin/Andean-Geology (GitHub Pages)
**Archivo afectado:** `index.html` (solo CSS + ajustes mínimos de JS)

## Contexto
El visor ya tiene base responsive (viewport meta, unidades `dvh`, panel plegable, `safe-area-inset`,
remap de `invalidateSize` en resize/orientation). Pero en teléfonos/tablets falla la experiencia:
popup que se desborda, zoom automático de iOS al enfocar, zonas táctiles pequeñas, mapa reducido
en landscape y scroll-chaining en el panel.

## Objetivo
Experiencia cómoda en teléfonos y tablets sin cambiar la lógica de datos ni el comportamiento
en desktop (≥641px intacto).

## Cambios

### Móvil `@media (max-width:640px)`
1. **Popup**: `min-width:0`, `max-width:calc(100vw - 20px)` (hoy `min-width:340px` desborda pantallas de 320px). Contenido con `-webkit-text-size-adjust:100%` (ya global).
2. **Inputs**: `font-size:16px` en `#busq` y `#decada` → evita el zoom automático de iOS al enfocar. Panel: `max-height:55dvh` → `62dvh` para más espacio de lista.
3. **Zonas táctiles**: `#ptoggle` a 44px de alto; `.capa` con padding vertical mayor; `.btn` y `.lm` con padding y font-size mayores; controles de Leaflet (`leaflet-control-layers`) con font-size ≥16px e input/checkbox 22px.
4. **Panel landscape** `(max-height:480px)`: panel compacto `max-height:38dvh` para dejar el mapa grande.
5. **Logo**: se mantiene visible, solo se reduce (alto ~26px) en pantallas ≤480px. El título se trunca con `overflow:hidden; text-overflow:ellipsis; white-space:nowrap`.
6. **Barra colapsable**: la cabecera (`#phead`) permanece siempre visible con su botón `#ptoggle` para colapsar/expandir el cuerpo, de modo que el mapa nunca quede tapado de forma permanente. En móvil el panel arranca colapsado (ya existe, se conserva).

### Global (aplica también desktop, sin romper nada)
7. `touch-action:manipulation` en botones/inputs/enlaces (elimina el zoom de doble-tap y el delay).
8. `overscroll-behavior:contain` en `#pbody` y `body` (evita pull-to-refresh/scroll-chaining).
9. `font-size:16px` en todos los `<input>`/`<select>`.

## Verificación
- Deploy a GitHub Pages y verificar `articulos.geojson`/`index.html` 200.
- Prueba con emulación móvil (anchos 320/375/640 y landscape) y reporte del usuario en su teléfono/tablet.
- Sin cambios en `articulos.geojson`, KMZ ni datos.

## No incluido (YAGNI)
- Popup bottom-sheet, drawer de capas, zoom custom, gesto de deslizar (opción "UX móvil completo", descartada).
- Cambios de datos/georreferenciación.