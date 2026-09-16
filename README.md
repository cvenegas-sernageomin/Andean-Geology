# Visor Andean Geology — Artículos georreferenciados

Visor web (Leaflet) de los **921 artículos de Andean Geology (Revista Geológica de Chile, 1974–2027)**
georreferenciados a partir de sus abstracts. Cada popup muestra el abstract y enlaces a la revista y al PDF
(revista de acceso abierto CC-BY).

**Publicado:** https://cvenegas-sernageomin.github.io/Andean-Geology/

## Capas

Se distinguen por `properties.tipo`, y las tres se dibujan como **marcadores circulares** (los regionales
y nacionales, agrupados en clusters):

- **Puntos** (405) — estudios puntuales (minas, volcanes, afloramientos, secciones). Círculo amarillo.
- **Regionales** (461) — área de estudio. Círculo rojo en el centro del área.
- **Nacionales** (55) — revisiones de país completo. Círculo azul, anclado en la capital del país.

Filtros por **búsqueda** (título/autor) y **década/año**.

> El GeoJSON trae geometrías de área (147 `Polygon` + 35 `MultiPolygon`, el resto `Point`), pero **el visor
> no las dibuja**: usa el centro de su *bounding box*. Los polígonos siguen en el archivo por si algún
> consumidor los necesita; son el 23 % de su peso (dos de la Región de Aysén pesan ~200 KB cada uno).

## Estructura

- `index.html` — visor Leaflet (lee `articulos.geojson` en vivo).
- `articulos.geojson` — FeatureCollection WGS84 de los 921 artículos. Propiedades: `id`, `titulo`,
  `autores`, `anio`, `numero`, `paginas`, `doi`, `lugar`, `tipo`, `confianza`, `keywords`, `abstract`,
  `pdf_url`, `revista_url`.
- `assets/banner_andeangeology.jpg` — banner oficial de la revista.
- `tools/exportar_geojson.py` — regenera `articulos.geojson` desde el pipeline de georreferenciación
  (ubicaciones.json + abstracts.json de RAG-Bibliografia).

## Regenerar datos

```powershell
python tools/exportar_geojson.py   # lee C:\Users\carlos.venegas\opencode\proyectos\RAG-Bibliografia\data\andean-geology
```

## Pipeline de georreferenciación

Extracción sin LLM (regex WGS84/UTM + gazetteer de países/regiones/volcanes/ciudades + capa curada andina),
revisión manual integrada, KMZ paralelo (`Andean_Geology.geo.kmz`). Detalle en la memoria del proyecto
RAG-Bibliografia.

El campo `confianza` refleja qué tan directa fue esa extracción: **225 artículos en `alta`** (coordenadas
explícitas en el texto) y **696 en `media`** (resueltos por gazetteer). Conviene mostrarlo aguas abajo: una
ubicación de confianza media es aproximada y no debería tomarse como dato duro sin revisar el artículo.

## Quién consume este archivo

`articulos.geojson` se lee **en vivo** desde su URL publicada, así que corregir una georreferenciación aquí
(editar `ubicaciones.json` en RAG-Bibliografia → reexportar → `git push`) se propaga sola a los
consumidores, sin que haya que republicarlos:

- Este visor.
- Las PWAs de terreno **Geonotas** (v126+) y **Geonotas Light** (light-25+), donde aparece como la capa
  "📚 Artículos" de la vista mapa. Guardan una copia para uso sin señal y revisan si hay versión nueva
  comparando el `Last-Modified` del archivo, así que el cambio entra la próxima vez que se enciende la capa
  con conexión.
