const API = "https://sebiso-pliegos-oficios-1.onrender.com";
const UP = document.body.dataset.up;
const COLUMNAS = [
  ["consecutivo", "ID"], ["nombre", "Nombre"], ["adscripcion", "Adscripción"], ["cargo", "Cargo"], ["nivel", "Nivel"],
  ["rfc", "RFC"], ["nivel_aplicacion", "Nivel aplicación"], ["no_cuenta", "No. cuenta"],
  ["no_trabajador", "No. trabajador"], ["unidad", "Unidad Administrativa"], ["departamento", "Departamento o Área"],
];

let REGISTROS = [];
const estado = { texto: "", editando: null };

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = (t) => String(t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

async function api(ruta, opciones = {}) {
  const r = await fetch((location.hostname === "localhost" ? "" : API) + ruta, { ...opciones, headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token"), ...(opciones.headers || {}) } });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { location.href = "../index.html"; throw new Error(d.mensaje); }
  if (!r.ok) throw new Error(d.mensaje || "Error del servidor.");
  return d;
}

function visibles() {
  const q = norm(estado.texto);
  return REGISTROS.filter(r => !q || norm(COLUMNAS.map(([c]) => r[c]).join(" ")).includes(q));
}

function pintar() {
  const filas = visibles();
  $("pCabeza").innerHTML = `<tr>${COLUMNAS.map(([, t]) => `<th>${t}</th>`).join("")}<th class="p-acc">Acciones</th></tr>`;
  $("tvCuerpo").innerHTML = filas.length ? filas.map(r => `<tr>
      ${COLUMNAS.map(([c, t]) => `<td data-t="${t}" class="${c === "rfc" || c === "no_cuenta" ? "tv-mono" : ""} ${c === "rfc" || c === "consecutivo" || c === "no_cuenta" ? "p-entero" : ""}">${esc(r[c])}</td>`).join("")}
      <td class="p-acc" data-t=""><button type="button" class="tv-btn p-editar" data-id="${r.id}"><i class="bi bi-pencil"></i> Editar</button></td>
    </tr>`).join("") : `<tr><td colspan="${COLUMNAS.length + 1}" class="tv-vacio">No hay personal que coincida con la búsqueda.</td></tr>`;
  $("tvConteo").textContent = `${filas.length} ${filas.length === 1 ? "registro" : "registros"}`;
}

function abrirEditar(id) {
  const r = REGISTROS.find(x => x.id === id);
  if (!r) return;
  estado.editando = id;
  COLUMNAS.forEach(([c]) => { $("f_" + c).value = r[c] ?? ""; });
  $("pAviso").textContent = "";
  $("pDialogo").showModal();
}

async function guardar(e) {
  e.preventDefault();
  const cuerpo = Object.fromEntries(COLUMNAS.map(([c]) => [c, $("f_" + c).value]));
  const btn = $("pGuardar");
  btn.disabled = true;
  try {
    const { registro } = await api(`/api/personal/${estado.editando}`, { method: "PUT", body: JSON.stringify(cuerpo) });
    REGISTROS[REGISTROS.findIndex(x => x.id === registro.id)] = registro;
    $("pDialogo").close();
    pintar();
  } catch (err) {
    $("pAviso").textContent = err.message;
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  $("tvBuscar").addEventListener("input", (e) => { estado.texto = e.target.value; pintar(); });
  $("tvCuerpo").addEventListener("click", (e) => { const b = e.target.closest(".p-editar"); if (b) abrirEditar(Number(b.dataset.id)); });
  $("pForm").addEventListener("submit", guardar);
  $("pCancelar").addEventListener("click", () => $("pDialogo").close());
  $("tvCuerpo").innerHTML = `<tr><td colspan="12" class="tv-vacio">Cargando personal…</td></tr>`;
  try {
    REGISTROS = (await api("/api/personal?up=" + encodeURIComponent(UP))).registros;
    pintar();
  } catch (err) {
    $("tvCuerpo").innerHTML = `<tr><td colspan="12" class="tv-vacio">${esc(err.message)}</td></tr>`;
  }
});
