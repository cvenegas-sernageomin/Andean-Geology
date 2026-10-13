# Visor Andean Geology — notas para Claude

Visor Leaflet de solo lectura de los artículos de Andean Geology. Repo `cvenegas-sernageomin/Andean-Geology` (rama `main`).
`articulos.geojson` lo lee **en vivo** la capa "📚 Artículos" de Geonotas: un push aquí se propaga solo.
Ficha en memoria: `proyecto-andean-geology`.

## Reglas
- Solo artículos: **no** agregar capas de cartas ni mapas (pedido explícito del usuario).
- La edición real es el pipeline de RAG-Bibliografia: corregir `ubicaciones.json` allá → `python tools/exportar_geojson.py` → commit + push.
- Para un número nuevo: `descargar_andeangeology.py --solo-numero` **sobrescribe** `manifest.json` y
  `extraer_ubicacion.py` **rehace** `ubicaciones.json` borrando correcciones manuales. Fusionar solo los ids nuevos y respaldar antes.
- Comparar el geojson nuevo contra `git show HEAD:articulos.geojson`: solo deben cambiar los ids nuevos.
- Las cifras están fijas en `README.md` y en la leyenda de `index.html`: actualizarlas.

## Verificar
Servidor: config `andean-geology` (puerto 8785).
