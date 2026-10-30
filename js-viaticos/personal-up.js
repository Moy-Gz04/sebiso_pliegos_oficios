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
  const faltan = REGISTROS.filter(r => !r.validado).length;
  $("pContador").classList.toggle("p-contador-listo", faltan === 0);
  $("pContador").innerHTML = faltan
    ? `<b>${faltan}</b> <span>de ${REGISTROS.length} por confirmar</span>`
    : `<i class="bi bi-check-circle-fill"></i> <span>Todos confirmados</span>`;
  $("pCabeza").innerHTML = `<tr>${COLUMNAS.map(([, t]) => `<th>${t}</th>`).join("")}<th class="p-acc">Acciones</th></tr>`;
  $("tvCuerpo").innerHTML = filas.length ? filas.map(r => `<tr class="${r.validado ? "p-validado" : ""}">
      ${COLUMNAS.map(([c, t]) => `<td data-t="${t}" class="${c === "rfc" || c === "no_cuenta" ? "tv-mono" : ""} ${c === "rfc" || c === "consecutivo" || c === "no_cuenta" ? "p-entero" : ""} ${String(r[c] ?? "").trim() ? "" : "p-falta"}">${esc(r[c])}</td>`).join("")}
      <td class="p-acc" data-t=""><span class="p-botones">
        <button type="button" class="p-icono p-validar" data-id="${r.id}" aria-pressed="${!!r.validado}" title="${r.validado ? "Quitar confirmación" : "Confirmar datos"}" aria-label="${r.validado ? "Quitar confirmación" : "Confirmar datos"} de ${esc(r.nombre)}"><i class="bi bi-check-lg"></i></button>
        <button type="button" class="p-icono p-editar" data-id="${r.id}" title="Editar" aria-label="Editar a ${esc(r.nombre)}"><i class="bi bi-pencil"></i></button>
      </span></td>
    </tr>`).join("") : `<tr><td colspan="${COLUMNAS.length + 1}" class="tv-vacio">No hay personal que coincida con la búsqueda.</td></tr>`;
  $("tvConteo").textContent = `${filas.length} ${filas.length === 1 ? "registro" : "registros"}`;
}

function marcarVacios() {
  COLUMNAS.forEach(([c]) => $("f_" + c).classList.toggle("p-falta", !$("f_" + c).value.trim()));
}

function abrirEditar(id) {
  const r = REGISTROS.find(x => x.id === id);
  if (!r) return;
  estado.editando = id;
  COLUMNAS.forEach(([c]) => { $("f_" + c).value = r[c] ?? ""; });
  marcarVacios();
  $("pAviso").textContent = "";
  $("pDialogo").showModal();
}

async function abrirValidar(id) {
  const r = REGISTROS.find(x => x.id === id);
  if (!r) return;
  const vacios = COLUMNAS.filter(([c]) => !String(r[c] ?? "").trim()).map(([, t]) => t);
  if (!r.validado && vacios.length) {
    const M = window.MiniSEBISO, texto = "No se puede confirmar: faltan datos";
    if (M?.preguntar && !M.apagado) M.preguntar({ titulo: "¡Atención!", pregunta: texto, detalle: esc(`${r.nombre}. Falta: ${vacios.join(", ")}.`), soloOk: true, btnOk: "Entendido", iconoOk: "ti-check", saludoOk: "¡Va!", textoOk: "Te espero cuando esté completo." });
    else window.alert(`${texto}\n${r.nombre}\nFalta: ${vacios.join(", ")}`);
    return;
  }
  const pregunta = r.validado ? "¿Quitar la confirmación?" : "¿Confirmas que los datos son correctos?";
  const M = window.MiniSEBISO;
  const si = M?.preguntar && !M.apagado
    ? await M.preguntar({ titulo: "¡Hola!", pregunta, detalle: esc(r.nombre), btnOk: "Sí", btnCancel: "No", iconoOk: "ti-check", estiloOk: "dorado", saludoOk: "¡Va!", textoOk: "Lo guardo ahora mismo…" })
    : window.confirm(`${pregunta}
${r.nombre}`);
  if (!si) return;
  try {
    const { registro } = await api(`/api/personal/${r.id}/validar`, { method: "PUT", body: JSON.stringify({ validado: !r.validado }) });
    REGISTROS[REGISTROS.indexOf(r)] = registro;
    pintar();
  } catch (err) {
    M?.preguntar && !M.apagado ? M.preguntar({ titulo: "¡Ups!", pregunta: esc(err.message), soloOk: true }) : window.alert(err.message);
  }
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
  $("tvCuerpo").addEventListener("click", (e) => {
    const editar = e.target.closest(".p-editar"), validar = e.target.closest(".p-validar");
    if (editar) abrirEditar(Number(editar.dataset.id));
    if (validar) abrirValidar(Number(validar.dataset.id));
  });
  document.querySelector(".tv-cabeza").insertAdjacentHTML("beforeend", '<div class="p-contador" id="pContador" role="status" aria-live="polite"></div>');
  $("pForm").addEventListener("submit", guardar);
  $("pForm").addEventListener("input", marcarVacios);
  $("pCancelar").addEventListener("click", () => $("pDialogo").close());
  $("tvCuerpo").innerHTML = `<tr><td colspan="12" class="tv-vacio">Cargando personal…</td></tr>`;
  try {
    REGISTROS = (await api("/api/personal?up=" + encodeURIComponent(UP))).registros;
    pintar();
  } catch (err) {
    $("tvCuerpo").innerHTML = `<tr><td colspan="12" class="tv-vacio">${esc(err.message)}</td></tr>`;
  }
});
