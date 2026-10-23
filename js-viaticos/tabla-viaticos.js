/**********************************************************************
 *
 * VIÁTICOS POR U.P. — tabla dinámica
 * Una sola tabla con los viáticos de todas las U.P.: búsqueda, filtros
 * por U.P. y mes, orden por columna, totales que se actualizan solos y
 * "Agrupar por" (U.P., servidor público, mes o municipio) con subtotales.
 * Se pueden agregar registros a mano o con Excel (una hoja por U.P.;
 * el servidor no duplica lo que ya estaba guardado).
 *
 **********************************************************************/

const API = "https://sebiso-pliegos-oficios-1.onrender.com";
const MESES = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];

let REGISTROS = [];   // todos los viáticos (con up_clave / up_nombre)
let UNIDADES = [];    // [{ id, clave, nombre }]
const estado = { texto: "", up: "", mes: "", agrupar: "", orden: { campo: "up_clave", dir: 1 }, abiertos: new Set() };

const $ = (id) => document.getElementById(id);
const dinero = (n) => Number(n || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = (t) => String(t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const avisar = (msg) => alert(msg);   // asistente-ventanas.js lo muestra con la mascota

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar(){
    $("tvBuscar").addEventListener("input", (e) => { estado.texto = e.target.value; pintar(); });
    $("tvPestanas").addEventListener("click", (e) => { const b = e.target.closest(".tv-pestana"); if (!b) return; estado.up = b.dataset.up; estado.abiertos.clear(); pintar(); });
    $("tvMes").addEventListener("change", (e) => { estado.mes = e.target.value; pintar(); });
    $("tvAgrupar").addEventListener("change", (e) => { estado.agrupar = e.target.value; estado.abiertos.clear(); pintar(); });
    $("tvLimpiar").addEventListener("click", () => {
        estado.texto = estado.up = estado.mes = estado.agrupar = "";
        $("tvBuscar").value = ""; $("tvMes").value = ""; $("tvAgrupar").value = "";
        pintar();
    });
    document.querySelectorAll("#tvTabla thead th[data-campo]").forEach(th => th.addEventListener("click", () => {
        const c = th.dataset.campo;
        estado.orden = { campo: c, dir: estado.orden.campo === c ? -estado.orden.dir : 1 };
        pintar();
    }));
    $("tvAgregar").addEventListener("click", abrirAgregar);
    $("tvImportar").addEventListener("click", () => $("tvArchivo").click());
    $("tvArchivo").addEventListener("change", importarExcel);
    $("tvForm").addEventListener("submit", guardarManual);
    $("tvCancelar").addEventListener("click", () => $("tvDialogo").close());
    $("tvMesForm").innerHTML = MESES.map(m => `<option>${m}</option>`).join("");
    $("tvMes").innerHTML = `<option value="">Todos los meses</option>` + MESES.map(m => `<option value="${m}">${m[0] + m.slice(1).toLowerCase()}</option>`).join("");
    await Promise.all([cargarUnidades(), cargarRegistros()]);
}

async function cargarUnidades(){
    try {
        UNIDADES = await (await fetch(`${API}/api/viaticos/unidades`)).json();
        $("tvUpForm").innerHTML = UNIDADES.map(u => `<option value="${u.id}">U.P. ${u.clave} · ${esc(u.nombre)}</option>`).join("");
    } catch (e) { console.error(e); }
}

async function cargarRegistros(){
    $("tvCuerpo").innerHTML = `<tr><td colspan="7" class="tv-vacio">Cargando viáticos…</td></tr>`;
    try {
        const r = await fetch(`${API}/api/viaticos/todos`);
        const d = await r.json();
        if (!r.ok || d.ok === false) throw new Error(d.mensaje || "No se pudo consultar");
        REGISTROS = d.registros.map(x => ({ ...x, importe: Number(x.importe) }));
        pintar();
    } catch (e) {
        console.error(e);
        $("tvCuerpo").innerHTML = `<tr><td colspan="7" class="tv-vacio">No se pudieron cargar los viáticos. Recarga la página en unos segundos (el servidor puede estar despertando).</td></tr>`;
    }
}

/* ---------- filtrar, ordenar y pintar ---------- */
function filtrados(){
    const q = norm(estado.texto).trim();
    return REGISTROS.filter(r =>
        (!estado.up || r.up_clave === estado.up) &&
        (!estado.mes || r.mes === estado.mes) &&
        (!q || norm(`${r.nombre_servidor} ${r.rfc} ${r.municipio} ${r.mes} U.P. ${r.up_clave} ${r.up_nombre}`).includes(q))
    );
}
function comparar(a, b){
    const { campo, dir } = estado.orden;
    let x = a[campo], y = b[campo];
    if (campo === "mes") { x = MESES.indexOf(x); y = MESES.indexOf(y); }
    if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
    return String(x).localeCompare(String(y), "es") * dir;
}
const filaHTML = (r, sub) => `
    <tr class="${sub ? "tv-detalle" : ""}">
        <td><span class="tv-up">U.P. ${esc(r.up_clave)}</span></td>
        <td>${esc(r.nombre_servidor)}</td>
        <td class="tv-mono">${esc(r.rfc)}</td>
        <td>${esc(r.mes[0] + r.mes.slice(1).toLowerCase())}</td>
        <td>${esc(r.municipio)}</td>
        <td class="tv-num">${dinero(r.importe)}</td>
        <td class="tv-acc"><button type="button" class="tv-borrar" title="Eliminar registro" aria-label="Eliminar registro de ${esc(r.nombre_servidor)}" data-id="${r.id}">✕</button></td>
    </tr>`;

const AGRUPAR = {
    up_clave: { titulo: "U.P.", etiqueta: (r) => `U.P. ${r.up_clave} · ${r.up_nombre}` },
    nombre_servidor: { titulo: "Servidor público", etiqueta: (r) => r.nombre_servidor },
    mes: { titulo: "Mes", etiqueta: (r) => r.mes[0] + r.mes.slice(1).toLowerCase(), orden: (k) => MESES.indexOf(k.toUpperCase()) },
    municipio: { titulo: "Municipio", etiqueta: (r) => r.municipio },
};

/* Pestañas: «Todas» y una por U.P. con registros; el número cuenta con la búsqueda y el mes aplicados */
function pintarPestanas(){
    const q = norm(estado.texto).trim();
    const base = REGISTROS.filter(r => (!estado.mes || r.mes === estado.mes) &&
        (!q || norm(`${r.nombre_servidor} ${r.rfc} ${r.municipio} ${r.mes} U.P. ${r.up_clave} ${r.up_nombre}`).includes(q)));
    const claves = [...new Set(REGISTROS.map(r => r.up_clave))].sort();
    const nombre = (c) => (UNIDADES.find(u => u.clave === c) || REGISTROS.find(r => r.up_clave === c) || {}).nombre || (REGISTROS.find(r => r.up_clave === c) || {}).up_nombre || "";
    const pest = (up, titulo, n, tip) => `<button type="button" class="tv-pestana" role="tab" data-up="${up}" aria-selected="${estado.up === up}" title="${esc(tip)}">${titulo}<small>${n} reg.</small></button>`;
    $("tvPestanas").innerHTML = pest("", "Todas", base.length, "Todas las unidades presupuestales") +
        claves.map(c => pest(c, `U.P. ${esc(c)}`, base.filter(r => r.up_clave === c).length, nombre(c))).join("");
}

function pintar(){
    pintarPestanas();
    const lista = filtrados().sort(comparar);
    const total = lista.reduce((s, r) => s + r.importe, 0);
    $("tvConteo").textContent = `${lista.length} registro${lista.length === 1 ? "" : "s"}`;
    $("tvTotal").textContent = dinero(total);
    $("tvPersonas").textContent = new Set(lista.map(r => r.rfc || r.nombre_servidor)).size;
    document.querySelectorAll("#tvTabla thead th[data-campo]").forEach(th => {
        th.dataset.orden = th.dataset.campo === estado.orden.campo ? (estado.orden.dir > 0 ? "asc" : "desc") : "";
    });

    if (!lista.length) {
        $("tvCuerpo").innerHTML = `<tr><td colspan="7" class="tv-vacio">No hay registros con esos filtros.</td></tr>`;
    } else if (!estado.agrupar) {
        $("tvCuerpo").innerHTML = lista.map(r => filaHTML(r)).join("");
    } else {
        const g = AGRUPAR[estado.agrupar];
        const grupos = new Map();
        lista.forEach(r => { const k = g.etiqueta(r); if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(r); });
        const claves = [...grupos.keys()].sort((a, b) => g.orden ? g.orden(a) - g.orden(b) : grupos.get(b).reduce((s, r) => s + r.importe, 0) - grupos.get(a).reduce((s, r) => s + r.importe, 0));
        $("tvCuerpo").innerHTML = claves.map(k => {
            const filas = grupos.get(k), sub = filas.reduce((s, r) => s + r.importe, 0), abierto = estado.abiertos.has(k);
            return `
                <tr class="tv-grupo" data-grupo="${esc(k)}" tabindex="0" aria-expanded="${abierto}">
                    <td colspan="5"><span class="tv-flecha">${abierto ? "▾" : "▸"}</span> <b>${esc(k)}</b> <span class="tv-cuenta">${filas.length} registro${filas.length === 1 ? "" : "s"} · ${(sub / total * 100).toFixed(1)}%</span></td>
                    <td class="tv-num"><b>${dinero(sub)}</b></td><td></td>
                </tr>${abierto ? filas.map(r => filaHTML(r, true)).join("") : ""}`;
        }).join("");
    }
}

document.addEventListener("click", (e) => {
    const g = e.target.closest(".tv-grupo");
    if (g) { const k = g.dataset.grupo; estado.abiertos.has(k) ? estado.abiertos.delete(k) : estado.abiertos.add(k); pintar(); return; }
    const b = e.target.closest(".tv-borrar");
    if (b) borrar(Number(b.dataset.id));
});
document.addEventListener("keydown", (e) => { const g = e.target.closest && e.target.closest(".tv-grupo"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); g.click(); } });

async function borrar(id){
    const r = REGISTROS.find(x => x.id === id);
    if (!r || !confirm(`¿Eliminar el viático de ${r.nombre_servidor} (${r.mes}, ${r.municipio}, ${dinero(r.importe)})?`)) return;
    try {
        const res = await fetch(`${API}/api/viaticos/${id}`, { method: "DELETE" });
        const d = await res.json().catch(() => ({}));
        if (!res.ok || d.ok === false) throw new Error(d.mensaje || "No se pudo eliminar");
        REGISTROS = REGISTROS.filter(x => x.id !== id);
        pintar();
    } catch (err) { avisar(err.message); }
}

/* ---------- agregar a mano ---------- */
function abrirAgregar(){
    $("tvForm").reset();
    if (estado.up) { const u = UNIDADES.find(x => x.clave === estado.up); if (u) $("tvUpForm").value = u.id; }
    $("tvDialogo").showModal();
    $("tvNombre").focus();
}
async function guardarManual(e){
    e.preventDefault();
    const datos = {
        unidad_id: $("tvUpForm").value,
        nombre_servidor: $("tvNombre").value.trim(),
        rfc: $("tvRfc").value.trim().toUpperCase(),
        mes: $("tvMesForm").value,
        municipio: $("tvMunicipio").value.trim().toUpperCase(),
        importe: Number($("tvImporte").value),
    };
    const btn = $("tvGuardar"); btn.disabled = true;
    try {
        const res = await fetch(`${API}/api/viaticos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
        const d = await res.json().catch(() => ({}));
        if (!res.ok || d.ok === false) throw new Error(d.mensaje || "No se pudo guardar");
        $("tvDialogo").close();
        await cargarRegistros();
    } catch (err) { avisar(err.message); }
    finally { btn.disabled = false; }
}

/* ---------- importar Excel (una hoja por U.P.) ---------- */
function importarExcel(){
    const archivo = $("tvArchivo").files[0];
    $("tvArchivo").value = "";
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = (ev) => procesarExcel(ev.target.result);
    lector.readAsArrayBuffer(archivo);
}
async function procesarExcel(buffer){
    const libro = XLSX.read(buffer, { type: "array" });
    const porUnidad = new Map(), avisos = [];
    const campo = (o, nombres) => { for (const n of nombres) { const k = Object.keys(o).find(x => norm(x).trim() === norm(n)); if (k && o[k] !== "") return o[k]; } return ""; };
    libro.SheetNames.forEach(hoja => {
        const filas = XLSX.utils.sheet_to_json(libro.Sheets[hoja], { header: 1, defval: "" });
        const iEnc = filas.findIndex(f => f.some(c => norm(c).trim() === "RFC"));
        if (iEnc < 0) return;
        const m = hoja.match(/(\d{1,2})/);
        const unidad = m ? UNIDADES.find(u => String(u.clave).padStart(2, "0") === m[1].padStart(2, "0")) : (estado.up ? UNIDADES.find(u => u.clave === estado.up) : null);
        if (!unidad) { avisos.push(m ? `La hoja «${hoja}» es de la U.P. ${m[1]}, que no existe en el sistema.` : `La hoja «${hoja}» no indica su U.P. (filtra una U.P. arriba para importarla ahí).`); return; }
        const enc = filas[iEnc].map(c => String(c).trim());
        filas.slice(iEnc + 1).forEach(f => {
            const o = {}; enc.forEach((h, i) => { if (h) o[h] = f[i]; });
            const nombre = String(campo(o, ["Nombre del Servidor Público", "SERVIDOR PUBLICO", "NOMBRE"])).trim();
            if (!nombre) return;
            const g = porUnidad.get(unidad.id) || { clave: unidad.clave, registros: [], total: 0 };
            const importe = Number(String(campo(o, ["IMPORTE"])).replace(/[$,\s]/g, "")) || 0;
            g.registros.push({ nombre_servidor: nombre, rfc: String(campo(o, ["RFC"])).trim().toUpperCase(), mes: norm(campo(o, ["MES"])).trim(),
                municipio: String(campo(o, ["MUNICIPIO VISITADO", "MUNICIPIO"])).trim().toUpperCase(), importe });
            g.total += importe; porUnidad.set(unidad.id, g);
        });
    });
    const n = [...porUnidad.values()].reduce((s, g) => s + g.registros.length, 0);
    if (!n) { avisar(["El archivo no tiene renglones de viáticos.", ...avisos].join(" ")); return; }
    const malos = [...porUnidad.values()].flatMap(g => g.registros.filter(r => !MESES.includes(r.mes) || !(r.importe > 0)).map(r => `U.P. ${g.clave} · ${r.nombre_servidor}`));
    if (malos.length) { avisar(`Revisa el mes o el importe de: ${malos.slice(0, 6).join("; ")}${malos.length > 6 ? "…" : ""}`); return; }
    const resumen = [...porUnidad.values()].map(g => `U.P. ${g.clave}: ${g.registros.length} · ${dinero(g.total)}`).join("\n");
    if (!confirm(`Se importarán ${n} registro(s):\n\n${resumen}${avisos.length ? "\n\nAvisos:\n" + avisos.join("\n") : ""}\n\nLo que ya esté guardado no se duplica. ¿Continuar?`)) return;
    let agregados = 0, existian = 0; const errores = [];
    for (const [unidad_id, g] of porUnidad) {
        try {
            const res = await fetch(`${API}/api/viaticos/importar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ unidad_id, registros: g.registros }) });
            const d = await res.json();
            if (!res.ok || d.ok === false) throw new Error(d.mensaje || "Error");
            agregados += d.insertados ?? g.registros.length; existian += d.omitidos ?? 0;
        } catch (err) { errores.push(`U.P. ${g.clave}: ${err.message}`); }
    }
    avisar(`Importación terminada. Agregados: ${agregados} · Ya existían: ${existian}${errores.length ? " · Con error: " + errores.join("; ") : ""}`);
    await cargarRegistros();
}
