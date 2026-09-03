# Visor Andean Geology — Artículos georreferenciados

Visor web (Leaflet) de los **922 artículos de Andean Geology (Revista Geológica de Chile, 1974–2027)**
georreferenciados a partir de sus abstracts. Cada popup muestra el abstract y enlaces a la revista y al PDF
(revista de acceso abierto CC-BY).

**Publicado:** https://cvenegas-sernageomin.github.io/Andean-Geology/

## Capas

- **Puntos** (460) — estudios puntuales (minas, volcanes, afloramientos, secciones).
- **Regionales** (393) — polígono naranjo del área de estudio + símbolo rojo central.
- **Nacionales** (69) — revisiones de país completo.

Filtros por **búsqueda** (título/autor) y **década**.

## Estructura

- `index.html` — visor Leaflet (lee `articulos.geojson` en vivo).
- `articulos.geojson` — FeatureCollection WGS84 de los 922 artículos (id, título, autores, año, número,
  páginas, DOI, abstract, lugar, tipo, pdf_url, revista_url).
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