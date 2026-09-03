# -*- coding: utf-8 -*-
"""Exporta articulos.geojson para el visor Andean Geology.

Fuentes: ubicaciones.json + abstracts.json del pipeline (RAG-Bibliografia).
Salida:  articulos.geojson (FeatureCollection, WGS84)
  - punto    -> Point
  - regional -> Polygon (bbox/geometria) o Point (solo centroide)
  - nacional -> Polygon (pais)
  - descartados/sin tipo: excluidos
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

DATA = Path(r"C:\Users\carlos.venegas\opencode\proyectos\RAG-Bibliografia\data\andean-geology")
OUT = Path(r"C:\Users\carlos.venegas\Claude\proyectos\Andean-Geology\articulos.geojson")

ubic = json.load(open(DATA / "ubicaciones.json", encoding="utf-8"))
abstracts = json.load(open(DATA / "abstracts.json", encoding="utf-8"))

VIEW_BASE = "https://www.andeangeology.cl/index.php/revista1/article/view"


def bbox_polygon(b):
    lo, la, hi, h2 = b["lon_min"], b["lat_min"], b["lon_max"], b["lat_max"]
    return {"type": "Polygon", "coordinates": [[[lo, la], [hi, la], [hi, h2], [lo, h2], [lo, la]]]}


features = []
stats = {"punto": 0, "regional": 0, "nacional": 0}
for aid, r in ubic.items():
    tipo = r.get("tipo")
    if not tipo or r.get("descartado"):
        continue
    if tipo == "punto" and r.get("lat") is None:
        continue

    if tipo == "punto":
        geom = {"type": "Point", "coordinates": [r["lon"], r["lat"]]}
    elif tipo == "regional":
        if r.get("bbox"):
            geom = bbox_polygon(r["bbox"])
        elif r.get("geometry"):
            geom = r["geometry"]
        elif r.get("lat") is not None:
            geom = {"type": "Point", "coordinates": [r["lon"], r["lat"]]}
        else:
            continue
    else:  # nacional
        if r.get("geometry"):
            geom = r["geometry"]
        elif r.get("lat") is not None:
            geom = {"type": "Point", "coordinates": [r["lon"], r["lat"]]}
        else:
            continue

    ab = abstracts.get(aid, {})
    props = {
        "id": aid,
        "titulo": r["titulo"],
        "autores": r.get("autores", ""),
        "anio": r.get("anio", ""),
        "numero": r.get("numero", ""),
        "paginas": r.get("paginas", ""),
        "doi": r.get("doi", ""),
        "lugar": r.get("lugar", ""),
        "confianza": r.get("confianza", ""),
        "tipo": tipo,
        "pdf_url": r.get("pdf_url", ""),
        "revista_url": f"{VIEW_BASE}/{aid}",
        "abstract": ab.get("abstract", ""),
        "keywords": ab.get("keywords", ""),
    }
    features.append({"type": "Feature", "properties": props, "geometry": geom})
    stats[tipo] += 1

fc = {"type": "FeatureCollection", "features": features}
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(fc, f, ensure_ascii=False)

print("features:", len(features), "|", stats)
print("tamano:", OUT.stat().st_size / 1024, "KB")