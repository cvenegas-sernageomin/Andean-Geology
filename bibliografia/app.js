/* Bibliografia geologica georreferenciada — visor (sin backend, solo lectura). */
'use strict';

/* ---------- temas: color FIJO por tema (nunca por ranking) ----------
   8 matices validados + 4 temas como anillo (centro blanco) del matiz de un tema afin,
   porque 12 colores no se distinguen solo por color: el anillo es la segunda codificacion. */
const TEMAS = {
  volcanologia:   {nombre:'Volcanología',                      color:'#e34948', anillo:false},
  tectonica:      {nombre:'Tectónica y estructural',           color:'#6250d6', anillo:false},
  economica:      {nombre:'Geología económica',                color:'#eda100', anillo:false},
  ignea:          {nombre:'Petrología ígnea y geoquímica',     color:'#eb6834', anillo:false},
  geofisica:      {nombre:'Sismología y geofísica',            color:'#2a78d6', anillo:false},
  geomorfologia:  {nombre:'Geomorfología, glaciología y clima',color:'#1baf7a', anillo:false},
  paleontologia:  {nombre:'Paleontología',                     color:'#008300', anillo:false},
  peligros:       {nombre:'Peligros y remociones en masa',     color:'#e87ba4', anillo:false},
  sedimentologia: {nombre:'Sedimentología y estratigrafía',    color:'#008300', anillo:true},
  metamorfismo:   {nombre:'Metamorfismo',                      color:'#6250d6', anillo:true},
  geocronologia:  {nombre:'Geocronología',                     color:'#2a78d6', anillo:true},
  hidrogeologia:  {nombre:'Hidrogeología',                     color:'#1baf7a', anillo:true}
};
const ORDEN = Object.keys(TEMAS);
const RADIO = {punto:5, regional:7, nacional:10};

/* ---------- mapa ---------- */
const map = L.map('map', {center:[-20, -60], zoom:3, worldCopyJump:true, zoomControl:true});
map.attributionControl.addAttribution('Georref. © SERNAGEOMIN / C. Venegas Benavides · <a href="https://creativecommons.org/licenses/by-nc/4.0/deed.es" target="_blank" rel="noopener">CC BY-NC 4.0</a>');
const bases = {
  /* fondo gris claro: los 12 colores de tema se leen mejor que sobre satelital */
  'Claro': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {maxNativeZoom:16, maxZoom:19, attribution:'Esri, HERE, Garmin, © OpenStreetMap'}),
  'Topográfico': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {maxZoom:19, attribution:'Esri'}),
  'Satelital': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {maxZoom:19, attribution:'Esri'})
};
bases['Claro'].addTo(map);
L.control.layers(bases, null, {position:'topright'}).addTo(map);
map.createPane('pane_bbox').style.zIndex = 390;

function popupOpts(){ return {maxWidth: Math.min(520, Math.max(220, window.innerWidth - 55))}; }
function esc(t){ const d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
function swatch(tema){
  const t = TEMAS[tema];
  return t.anillo ? '<span class="sw anillo" style="border-color:'+t.color+'"></span>'
                  : '<span class="sw" style="background:'+t.color+';border:1px solid rgba(0,0,0,.2)"></span>';
}
function estilo(p){
  const t = TEMAS[p.tema], r = RADIO[p.tipo] || 6;
  if (t.anillo) return {radius:r, color:t.color, weight:3.5, fillColor:'#ffffff', fillOpacity:p.tipo==='nacional'?.6:1, opacity:1};
  return {radius:r, color:'#ffffff', weight:p.tipo==='nacional'?1:1.5, fillColor:t.color,
          fillOpacity:p.tipo==='nacional'?.55:.95, opacity:1};
}
function popupHTML(p){
  let h = '<div class="pp"><b class="t">'+esc(p.titulo)+'</b>';
  if (p.autores) h += '<br/><span class="aut">'+esc(p.autores)+'</span>';
  const met = [p.anio, p.revista].filter(Boolean).map(esc).join(' · ');
  if (met) h += '<div class="met">'+met+'</div>';
  h += '<div class="tema">'+swatch(p.tema)+'<span><b>'+esc(TEMAS[p.tema].nombre)+'</b>'+(p.lugar?' · '+esc(p.lugar):'')+'</span></div>';
  if (p.tema2 && TEMAS[p.tema2]) h += '<div class="tema2">también: '+esc(TEMAS[p.tema2].nombre)+'</div>';
  h += '<div class="met">'+(p.confianza==='alta'?'Ubicación por coordenadas del trabajo':'Ubicación por topónimo')+
       ' · '+({punto:'punto',regional:'área regional',nacional:'país completo'})[p.tipo]+'</div>';
  if (p.doi) h += '<a class="btn" target="_blank" rel="noopener noreferrer" href="https://doi.org/'+encodeURI(p.doi)+'">Ver en la editorial (DOI) ↗</a>';
  return h + '</div>';
}

/* ---------- capas ---------- */
let DATOS = null;
const cluster = L.markerClusterGroup({
  /* sin disableClusteringAtZoom: muchos articulos comparten coordenada (p. ej. "Andes") y solo el
     abanico (spiderfy) en el zoom maximo los separa */
  showCoverageOnHover:false, spiderfyOnMaxZoom:true, maxClusterRadius:45,
  iconCreateFunction: c => L.divIcon({html:'<div>'+c.getChildCount()+'</div>', className:'cl', iconSize:[40,40]})
}).addTo(map);
let bboxCapa = null;
const activos = new Set(ORDEN);

function filtrados(ignorarTema){
  const q = (document.getElementById('busq').value || '').trim().toLowerCase();
  const dec = document.getElementById('decada').value;
  const conf = document.getElementById('conf').value;
  const tipos = {punto:chk('punto'), regional:chk('regional'), nacional:chk('nacional')};
  return DATOS.features.filter(f => {
    const p = f.properties;
    if (!ignorarTema && !activos.has(p.tema)) return false;
    if (!tipos[p.tipo]) return false;
    if (conf && p.confianza !== conf) return false;
    if (dec && !String(p.anio || '').startsWith(dec)) return false;
    if (q && !p._busca.includes(q)) return false;
    return true;
  });
}
function chk(t){ return document.getElementById('chk-'+t).checked; }

function render(){
  if (!DATOS) return;
  const po = popupOpts();
  const lista = filtrados(false);
  const marcas = lista.map(f => {
    const p = f.properties, c = f.geometry.coordinates;
    const m = L.circleMarker([c[1], c[0]], estilo(p)).bindPopup(popupHTML(p), po);
    m.bindTooltip('<b>'+esc(TEMAS[p.tema].nombre)+'</b>'+esc(p.titulo.length>90?p.titulo.slice(0,88)+'…':p.titulo),
                  {className:'tt', direction:'top', offset:[0,-4]});
    m.feature = f;
    return m;
  });
  cluster.clearLayers(); cluster.addLayers(marcas);
  /* conteos: por tema ignorando el filtro de tema (para saber que hay al encenderlo) */
  const porTema = {}; ORDEN.forEach(t => porTema[t] = 0);
  filtrados(true).forEach(f => porTema[f.properties.tema]++);
  ORDEN.forEach(t => { const el = document.getElementById('n-'+t); if (el) el.textContent = porTema[t]; });
  const porTipo = {punto:0, regional:0, nacional:0};
  lista.forEach(f => porTipo[f.properties.tipo]++);
  Object.keys(porTipo).forEach(k => document.getElementById('n-'+k).textContent = porTipo[k]);
  document.getElementById('total').textContent = lista.length + ' de ' + DATOS.features.length + ' artículos en el mapa';
}

map.on('popupopen', e => {
  const f = e.popup._source && e.popup._source.feature;
  if (bboxCapa) { bboxCapa.remove(); bboxCapa = null; }
  if (f && f.properties.bbox) {
    const b = f.properties.bbox, t = TEMAS[f.properties.tema];
    bboxCapa = L.rectangle([[b[0], b[2]], [b[1], b[3]]],
      {pane:'pane_bbox', color:t.color, weight:1.5, dashArray:'5 4', fillColor:t.color, fillOpacity:.08, interactive:false}).addTo(map);
  }
});
map.on('popupclose', () => { if (bboxCapa) { bboxCapa.remove(); bboxCapa = null; } });

/* ---------- panel de temas ---------- */
function armarTemas(){
  const cont = document.getElementById('temas'), ley = document.getElementById('leytemas');
  ORDEN.forEach(t => {
    const lab = document.createElement('label'); lab.className = 'capa';
    lab.innerHTML = '<input type="checkbox" checked data-tema="'+t+'"/>'+swatch(t)+
      '<span class="nom">'+esc(TEMAS[t].nombre)+' <span class="n" id="n-'+t+'"></span></span>'+
      '<button type="button" class="solo" data-solo="'+t+'" title="Mostrar solo este tema">solo</button>';
    cont.appendChild(lab);
    const fila = document.createElement('div'); fila.className = 'fila';
    fila.innerHTML = swatch(t) + esc(TEMAS[t].nombre); ley.appendChild(fila);
  });
  cont.addEventListener('change', e => {
    const t = e.target.dataset.tema; if (!t) return;
    e.target.checked ? activos.add(t) : activos.delete(t); render();
  });
  cont.addEventListener('click', e => {
    const t = e.target.dataset && e.target.dataset.solo; if (!t) return;
    e.preventDefault(); fijarTemas([t]);
  });
  document.getElementById('todos').onclick = () => fijarTemas(ORDEN);
  document.getElementById('ninguno').onclick = () => fijarTemas([]);
}
function fijarTemas(lista){
  activos.clear(); lista.forEach(t => activos.add(t));
  document.querySelectorAll('#temas input[data-tema]').forEach(i => i.checked = activos.has(i.dataset.tema));
  render();
}
armarTemas();

['chk-punto','chk-regional','chk-nacional','decada','conf'].forEach(id => document.getElementById(id).addEventListener('change', render));
let deb = null;
document.getElementById('busq').addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(render, 200); });

fetch('articulos.geojson', {cache:'no-cache'}).then(r => r.json()).then(d => {
  d.features.forEach(f => { const p = f.properties;
    p._busca = [p.titulo, p.autores, p.revista, p.lugar].join(' ').toLowerCase(); });
  DATOS = d;
  const sel = document.getElementById('decada');
  const decs = [...new Set(d.features.map(f => f.properties.anio).filter(Boolean).map(a => Math.floor(a/10)*10))].sort();
  decs.forEach(x => { const o = document.createElement('option'); o.value = String(x).slice(0,3); o.textContent = x+'s'; sel.appendChild(o); });
  document.getElementById('sub').textContent = d.features.length.toLocaleString('es-CL') + ' artículos por área de estudio y temática';
  render(); map.invalidateSize();
}).catch(e => { console.error('No se pudo cargar articulos.geojson:', e);
  document.getElementById('total').textContent = 'No se pudieron cargar los artículos (¿sin conexión la primera vez?).'; });

/* ---------- panel plegable ---------- */
const panel = document.getElementById('panel'), phead = document.getElementById('phead'), pt = document.getElementById('ptoggle');
function togglePanel(){
  const col = panel.classList.toggle('collapsed');
  pt.innerHTML = col ? '&#9650;' : '&#9660;';
  pt.title = pt.ariaLabel = col ? 'Mostrar panel' : 'Ocultar panel';
  phead.setAttribute('aria-expanded', String(!col));
  setTimeout(() => map.invalidateSize(), 220);
}
phead.addEventListener('click', e => { if (e.target.closest('.hbtn') && e.target !== pt) return; togglePanel(); });
phead.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePanel(); } });
pt.addEventListener('click', e => { e.stopPropagation(); togglePanel(); });
if (window.matchMedia('(max-width:640px)').matches) togglePanel();
let anchoPrev = window.innerWidth, rzT = null;
window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => {
  if (window.innerWidth !== anchoPrev) { anchoPrev = window.innerWidth; render(); }
  map.invalidateSize(); }, 150); });
if (window.ResizeObserver) new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById('map'));

/* ---------- modales ---------- */
function abrir(id){ document.getElementById(id).classList.add('open'); }
function cerrar(m){ m.classList.remove('open'); document.getElementById('flecha').classList.remove('on'); }
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m || e.target.hasAttribute('data-cierra')) cerrar(m); });
});
document.getElementById('leybtn').onclick = () => abrir('mley');

/* presentacion "¿como se usa?" (primera visita, reabrible con ?) */
const tarjetas = [...document.querySelectorAll('#mayuda .tarj')];
let ti = 0;
const pts = document.getElementById('apts');
tarjetas.forEach(() => pts.appendChild(document.createElement('span')));
function verTarjeta(i){
  ti = Math.max(0, Math.min(tarjetas.length - 1, i));
  tarjetas.forEach((t, k) => t.classList.toggle('on', k === ti));
  [...pts.children].forEach((s, k) => s.classList.toggle('on', k === ti));
  document.getElementById('aant').style.visibility = ti ? 'visible' : 'hidden';
  document.getElementById('asig').textContent = ti === tarjetas.length - 1 ? 'Empezar' : 'Siguiente';
}
document.getElementById('aant').onclick = () => verTarjeta(ti - 1);
document.getElementById('asig').onclick = () => ti === tarjetas.length - 1 ? cerrar(document.getElementById('mayuda')) : verTarjeta(ti + 1);
document.getElementById('bayuda').onclick = e => { e.stopPropagation(); verTarjeta(0); abrir('mayuda'); };
try { if (!localStorage.getItem('bgr-intro')) { verTarjeta(0); abrir('mayuda'); localStorage.setItem('bgr-intro', '1'); } } catch (_) {}

/* ---------- instalar como app ---------- */
let promptInst = null;
const enApp = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); promptInst = e; mostrarBanner(); });
function mostrarBanner(){
  if (enApp) return;
  try { if (sessionStorage.getItem('bgr-binst-x')) return; } catch (_) {}
  document.getElementById('binst').classList.add('on');
}
function instalar(){
  document.getElementById('binst').classList.remove('on');
  if (promptInst) { promptInst.prompt(); promptInst.userChoice.finally(() => promptInst = null); return; }
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let pasos;
  if (enApp) pasos = ['El visor ya está instalado y abierto como app.'];
  else if (ios) pasos = ['Toca el botón Compartir (cuadrado con flecha) de Safari o Chrome.', 'Elige «Agregar a pantalla de inicio».', 'Confirma con «Agregar».'];
  else if (/SamsungBrowser/.test(ua)) pasos = ['Toca el menú ☰ abajo a la derecha.', 'Elige «Agregar página a» → «Pantalla de inicio».'];
  else if (/Firefox/.test(ua)) pasos = ['Toca el menú ⋮ de Firefox.', 'Elige «Instalar» o «Agregar a pantalla de inicio».'];
  else pasos = ['Abre el menú ⋮ del navegador (arriba a la derecha).', 'Elige «Instalar app» o «Agregar a pantalla de inicio».', 'Confirma con «Instalar».'];
  document.getElementById('pasos').innerHTML = '<ol>' + pasos.map(p => '<li>'+esc(p)+'</li>').join('') + '</ol>';
  abrir('minst');
  if (!ios && !enApp) document.getElementById('flecha').classList.add('on');
}
document.getElementById('binstalar').onclick = e => { e.stopPropagation(); instalar(); };
document.getElementById('binst-si').onclick = instalar;
document.getElementById('binst-x').onclick = () => { document.getElementById('binst').classList.remove('on');
  try { sessionStorage.setItem('bgr-binst-x', '1'); } catch (_) {} };
if (!enApp) setTimeout(() => { if (!promptInst) mostrarBanner(); }, 4000);
if (enApp) document.getElementById('binstalar').style.display = 'none';

/* ---------- GPS: ver donde estoy (sigue la posicion; arrastrar deja de seguir) ---------- */
const Gps = L.Control.extend({options:{position:'topleft'}, onAdd(){
  const b = L.DomUtil.create('a', 'leaflet-bar gps'); b.href = '#'; b.title = 'Mi ubicación'; b.innerHTML = '◎';
  b.setAttribute('role', 'button'); b.setAttribute('aria-label', 'Mi ubicación');
  L.DomEvent.on(b, 'click', e => { L.DomEvent.stop(e); gpsToggle(b); }); return b; }});
map.addControl(new Gps());
let gpsId = null, gpsMarca = null, gpsSigue = true, gpsPrimera = true;
function gpsToggle(b){
  if (gpsId !== null && !gpsSigue) { gpsSigue = true; if (gpsMarca) map.panTo(gpsMarca.getLatLng()); return; }
  if (gpsId !== null) { navigator.geolocation.clearWatch(gpsId); gpsId = null; b.classList.remove('on');
    if (gpsMarca) { gpsMarca.remove(); gpsMarca = null; } return; }
  if (!navigator.geolocation) { alert('Este navegador no entrega la ubicación.'); return; }
  b.classList.add('on'); gpsSigue = true; gpsPrimera = true;
  gpsId = navigator.geolocation.watchPosition(pos => {
    const ll = [pos.coords.latitude, pos.coords.longitude];
    if (!gpsMarca) gpsMarca = L.circleMarker(ll, {radius:7, color:'#fff', weight:2.5, fillColor:'#0b6bcb', fillOpacity:1}).addTo(map);
    else gpsMarca.setLatLng(ll);
    if (gpsPrimera) { map.setView(ll, Math.max(map.getZoom(), 8)); gpsPrimera = false; }
    else if (gpsSigue) map.panTo(ll, {animate:true, duration:1});
  }, err => { alert('No se pudo obtener la ubicación: ' + err.message); gpsToggle(b); },
  {enableHighAccuracy:true, maximumAge:1000});
}
map.on('dragstart', () => { gpsSigue = false; });

/* ---------- service worker ---------- */
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
