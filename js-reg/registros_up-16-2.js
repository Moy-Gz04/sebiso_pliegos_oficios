"use strict";

/* ============================================================
   1. CONSTANTES Y VARIABLES GLOBALES
   ============================================================ */

/** Elemento <tbody> donde se renderizan las tarjetas de registros */
const tbody = document.getElementById("tbodyResultados");

/** URL base del backend (Render) */
const API = "https://sebiso-pliegos-oficios-1.onrender.com";

/**
 * Código del registro activo en cada modal.
 * Se asignan justo antes de abrir el modal correspondiente.
 */
let codigoEliminar = null;

/* ============================================================
   2. UTILIDADES GENERALES
   ============================================================ */

/**
 * Normaliza un valor de estatus: string, sin espacios, mayúsculas.
 * @param {*} estatus
 * @returns {string}
 */
function normalizarEstatus(estatus) {
  return String(estatus || "").trim().toUpperCase();
}

/**
 * Escapa caracteres especiales HTML para evitar XSS al inyectar
 * datos del servidor directamente en innerHTML.
 * @param {*} valor
 * @returns {string}
 */
function escaparHTML(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ============================================================
   3. ALERTAS PERSONALIZADAS
   ============================================================ */

/**
 * Muestra el modal de alerta con título y mensaje personalizados.
 * @param {string} titulo  – Texto del encabezado
 * @param {string} mensaje – Cuerpo del mensaje (acepta HTML)
 */
function mostrarAlerta(titulo, mensaje) {
  const elTitulo  = document.getElementById("modalAlertaTitulo");
  const elMensaje = document.getElementById("modalAlertaMensaje");
  const elModal   = document.getElementById("modalAlerta");

  if (!elTitulo || !elMensaje || !elModal) {
    // Fallback si el modal aún no existe en el DOM
    alert(`${titulo}\n\n${mensaje}`);
    return;
  }

  elTitulo.innerHTML  = titulo;
  elMensaje.innerHTML = mensaje;
  elModal.classList.add("activo");
}

/**
 * Cierra el modal de alerta personalizada.
 */
function cerrarAlerta() {
  document.getElementById("modalAlerta")?.classList.remove("activo");
}

/* ============================================================
   4. CONTROL DE MODALES
   ============================================================ */

/**
 * Abre un modal añadiendo la clase "activo".
 * @param {string} id
 */
function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("activo");
}

/**
 * Cierra un modal removiendo la clase "activo".
 * @param {string} id
 */
function cerrarModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("activo");
}

/* ============================================================
   5. BADGES
   ============================================================ */

/**
 * Retorna el HTML del badge de estatus según el valor normalizado.
 * @param {string} estatus
 * @returns {string}
 */
function obtenerBadgeEstatus(estatus) {
  switch (normalizarEstatus(estatus)) {
    case "ENVIADO":
      return `<span class="badge-estatus badge-enviado">Enviado</span>`;
    case "PAGADO":
    case "ACEPTADO":
      return `<span class="badge-estatus badge-aceptado">Pagado</span>`;
    case "RECHAZADO":
      return `<span class="badge-estatus badge-rechazado">Rechazado</span>`;
    default:
      return `<span class="badge-estatus badge-creado">Creado</span>`;
  }
}

/* ============================================================
   6. CRUD DE REGISTROS (SOLO VISUALIZACIÓN)
   ============================================================ */

/* ---- 6.1 CARGAR REGISTROS -------------------------------- */

/**
 * Obtiene todos los registros de la unidad presupuestal activa
 * y los renderiza como tarjetas en el tbody.
 *
 * MODO VISUALIZACIÓN: únicamente se muestran los enlaces a
 * Oficio y Pliego, y el botón de Eliminar. El resto de acciones
 * (generar SPG/LAG/Recibo/Anexo C, enviar, observaciones) están
 * ocultas/bloqueadas.
 *
 * ─────────────────────────────────────────────────────────────
 * CAMBIO DE ACUERDO A AREA:
 *   Reemplaza "UP-01" por el código correspondiente.
 * ─────────────────────────────────────────────────────────────
 */
async function cargarRegistros() {
  tbody.innerHTML = `
    <tr>
      <td colspan="12" style="text-align:center; padding:20px;">
        Cargando registros...
      </td>
    </tr>`;

  try {
    // CAMBIO DE ACUERDO A AREA → cambiar "UP-01" por el código de la nueva área
    const response = await fetch(`${API}/api/registros/UP-16`);
    if (!response.ok) throw new Error("Error obteniendo registros");

    const registros = await response.json();
    tbody.innerHTML = "";

    if (registros.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="12" style="text-align:center; padding:20px;">
            No hay registros
          </td>
        </tr>`;
      return;
    }

    // Orden de visualización: CREADO → RECHAZADO → ENVIADO → PAGADO/ACEPTADO
    const orden = { CREADO: 1, RECHAZADO: 2, ENVIADO: 3, PAGADO: 4, ACEPTADO: 4 };
    registros.sort(
      (a, b) =>
        (orden[normalizarEstatus(a.estatus)] || 99) -
        (orden[normalizarEstatus(b.estatus)] || 99)
    );

    for (const registro of registros) {
      tbody.innerHTML += construirTarjeta(registro);
    }
  } catch (error) {
    console.error("ERROR CARGANDO REGISTROS:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align:center; padding:20px; color:red;">
          Error al cargar registros: ${escaparHTML(error.message)}
        </td>
      </tr>`;
  }
}

/**
 * Construye el HTML de una tarjeta de registro en modo SOLO VISUALIZACIÓN.
 *
 * Acciones permitidas únicamente:
 *   - Ver Oficio (si existe)
 *   - Ver Pliego (si existe)
 *   - Eliminar registro (si el estatus lo permite)
 *
 * Todo lo demás (SPG, LAG, Recibo, Anexo C, Terminar Trámite, Enviar,
 * Observaciones) queda oculto/bloqueado.
 *
 * @param {Object} registro
 * @returns {string}
 */
function construirTarjeta(registro) {
  const estatus          = normalizarEstatus(registro.estatus);
  const permitirEliminar = ["CREADO", "RECHAZADO", ""].includes(estatus);

  const codigo  = escaparHTML(registro.codigo  || "-");
  const persona = escaparHTML(registro.persona || "-");
  const fecha   = registro.fecha
    ? escaparHTML(new Date(registro.fecha).toLocaleString("es-MX"))
    : "-";

  const btnEliminar = permitirEliminar
    ? `<button class="btn-eliminar" onclick="eliminarRegistro('${codigo}')">Eliminar</button>`
    : `<button class="btn-bloqueado" disabled>Bloqueado</button>`;

  // Helper: enlace a PDF existente o botón deshabilitado
  const linkPDF = (url, textoSi, textoNo) =>
    url
      ? `<a href="${escaparHTML(url)}" target="_blank" class="link-pdf">${textoSi}</a>`
      : `<button class="btn-bloqueado" disabled>${textoNo}</button>`;

  return `
    <tr>
      <td colspan="12">
        <div class="card-registro">

          <!-- FILA SUPERIOR: identificación y estatus -->
          <div class="fila-superior">
            <div class="info-item">
              <span class="info-label">ID</span>
              <span class="info-valor">${codigo}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Persona</span>
              <span class="info-valor">${persona}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha y Hora</span>
              <span class="info-valor">${fecha}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estatus</span>
              ${obtenerBadgeEstatus(registro.estatus)}
            </div>
            <div class="info-item">
              <span class="info-label">Eliminar</span>
              ${btnEliminar}
            </div>
          </div>

          <!-- FILA PDFs: únicamente Oficio y Pliego -->
          <div class="fila-pdfs">
            <div class="info-item">
              <span class="info-label">Oficio PDF</span>
              ${linkPDF(registro.oficio_pdf, "Ver Oficio", "Sin Oficio")}
            </div>
            <div class="info-item">
              <span class="info-label">Pliego PDF</span>
              ${linkPDF(registro.pliego_pdf, "Ver Pliego", "Sin Pliego")}
            </div>
          </div>

        </div>
      </td>
    </tr>`;
}

/* ---- 6.2 ELIMINAR REGISTRO -------------------------------- */

function eliminarRegistro(codigo) {
  codigoEliminar = codigo;
  abrirModal("modalEliminar");
}

/* ============================================================
   7. INICIALIZACIÓN (DOMContentLoaded)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ── 7.1  Confirmar eliminación ─────────────────────────── */
  document.getElementById("confirmarEliminar")?.addEventListener("click", async () => {
    try {
      const response = await fetch(`${API}/api/registros/${codigoEliminar}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error eliminando");

      cerrarModal("modalEliminar");
      abrirModal("modalExito");
      cargarRegistros();
    } catch (error) {
      console.error("ERROR ELIMINANDO:", error);
      mostrarAlerta("❌ Error al eliminar", error.message);
    }
  });

  /* ── 7.2  Modal de alerta personalizada ─────────────────── */
  document.getElementById("btnCerrarAlerta")?.addEventListener("click", cerrarAlerta);
  document.getElementById("modalAlerta")?.addEventListener("click", (e) => {
    if (e.target.id === "modalAlerta") cerrarAlerta();
  });

  /* ── 7.3  Carga inicial + refresco automático ───────────── */
  cargarRegistros();
  setInterval(cargarRegistros, 30_000);
});