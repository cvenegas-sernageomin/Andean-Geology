# Bibliografía geológica georreferenciada

Visor web (PWA instalable) de **2.885 artículos científicos de geología** ubicados en su área de estudio y
coloreados según su **temática**. Los artículos provienen de la bibliografía geológica de SERNAGEOMIN.

## Qué muestra
- **Color = temática** (12 temas). Cuatro temas se dibujan como anillo (centro blanco) para distinguirlos de los
  de relleno del mismo tono.

  | Tema | Artículos | | Tema | Artículos |
  |---|---|---|---|---|
  | Tectónica y estructural | 571 | | Geomorfología, glaciología y clima | 199 |
  | Volcanología | 394 | | Geocronología | 196 |
  | Sismología y geofísica | 337 | | Paleontología | 116 |
  | Geología económica | 307 | | Hidrogeología | 88 |
  | Sedimentología y estratigrafía | 293 | | Peligros y remociones en masa | 52 |
  | Petrología ígnea y geoquímica | 286 | | Metamorfismo | 46 |

- **Tamaño = tipo de área**: punto (772: volcán, yacimiento, localidad), regional (1.545: cuenca, cordillera,
  provincia; al abrirlo se dibuja su recuadro) y nacional (568: país completo).
- Popup: título, autores, año, revista, tema · lugar y enlace **«Ver en la editorial (DOI)»** (1.773 con DOI).
  **No se reproducen resúmenes ni se ofrecen descargas**: los artículos pertenecen a sus autores y editoriales.

## Cómo se hizo
- **Ubicación**: título y resumen de cada trabajo. Coordenadas explícitas (21 artículos) o un nomenclátor de
  volcanes (Smithsonian GVP), yacimientos, regiones geológicas curadas, ciudades (GeoNames) y países
  (Natural Earth). Se descartan las menciones de afiliaciones, autores y trabajos citados.
  **Los artículos sin un área de estudio identificable (teóricos, de laboratorio, globales) no se incluyen.**
- **Temática**: modelo de lenguaje bge-m3 (local) contra descripciones de cada tema, más palabras clave.
- **Control de calidad**: una muestra de 60 artículos (5 por tema) revisada contra título y resumen dio
  83 % de lugares correctos o aceptables y 86 % de temas correctos (o el secundario), antes de corregir los
  patrones de error encontrados. Puede haber errores: la georreferenciación es automática.

## Licencia y cita
La georreferenciación, la clasificación temática y el visor se distribuyen bajo
[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.es) (ver `LICENSE`). Los datos
bibliográficos pertenecen a sus autores y editoriales.

> SERNAGEOMIN / Venegas Benavides, C. (2026). *Bibliografía geológica georreferenciada por área de estudio y
> temática* [conjunto de datos]. https://cvenegas-sernageomin.github.io/Andean-Geology/bibliografia/
