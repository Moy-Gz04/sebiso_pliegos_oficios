/* =========================
   TBODY
========================= */

const tbody = document.getElementById("tbodyResultados");

/* =========================
   API
========================= */

const API = "https://sebiso-pliegos-oficios-1.onrender.com";

/* =========================
   VARIABLES
========================= */

let codigoEliminar = null;

let codigoSPG = null;

let codigoRecibo = null;

/* =========================
   NORMALIZAR ESTATUS
========================= */

function normalizarEstatus(estatus) {
  return String(estatus || "")
    .trim()

    .toUpperCase();
}

/* =========================
   MODALES
========================= */

function abrirModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "flex";
  }
}

function cerrarModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "none";
  }
}

/* =========================
   MODAL SPG
========================= */

function abrirModalSPG(codigo) {
  codigoSPG = codigo;

  abrirModal("modalSPG");
}

/* =========================
   MODAL RECIBO
========================= */

function abrirModalRecibo(codigo) {
  codigoRecibo = codigo;

  abrirModal("modalRecibo");
}

/* =========================
   CALCULAR TOTAL SPG
========================= */

function calcularTotalSPG() {
  const montoInput = document.getElementById("spgMonto");

  const retInput = document.getElementById("spgRet");

  const totalInput = document.getElementById("spgTot");

  if (!montoInput || !retInput || !totalInput) {
    return;
  }

  const monto = parseFloat(montoInput.value.replace(/[^0-9.-]+/g, "")) || 0;

  const retenciones = parseFloat(retInput.value.replace(/[^0-9.-]+/g, "")) || 0;

  const total = monto + retenciones;

  totalInput.value = total.toLocaleString(
    "es-MX",

    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

/* =========================
   GENERAR SPG
========================= */

async function generarSPG() {
  try {
    const datos = {
      codigo: codigoSPG,

      anio: document.getElementById("spgAnio").value,

      ur: document.getElementById("spgUR").value,

      up: document.getElementById("spgUP").value,

      rubro: document.getElementById("spgR").value,

      og: document.getElementById("spgOG").value,

      proyecto: document.getElementById("spgPR").value,

      cuenta: document.getElementById("spgCuenta").value,

      monto: document.getElementById("spgMonto").value,

      retenciones: document.getElementById("spgRet").value,

      total: document.getElementById("spgTot").value,
    };

    console.log("DATOS SPG:", datos);

    cerrarModal("modalSPG");

    alert("SPG generado correctamente");

    cargarRegistros();
  } catch (error) {
    console.error("ERROR SPG:", error);

    alert(error.message);
  }
}

/* =========================
   GENERAR RECIBO
========================= */

async function generarRecibo() {
  try {
    console.log("GENERANDO RECIBO:", codigoRecibo);

    cerrarModal("modalRecibo");

    alert("Recibo generado correctamente");

    cargarRegistros();
  } catch (error) {
    console.error("ERROR RECIBO:", error);

    alert(error.message);
  }
}

/* =========================
   BADGES ESTATUS
========================= */

function obtenerBadgeEstatus(estatus) {
  const estado = normalizarEstatus(estatus);

  switch (estado) {
    case "ENVIADO":
      return `

                <span
                    class="badge-estatus badge-enviado">

                    Enviado

                </span>

            `;

    case "PAGADO":

    case "ACEPTADO":
      return `

                <span
                    class="badge-estatus badge-aceptado">

                    Pagado

                </span>

            `;

    case "RECHAZADO":
      return `

                <span
                    class="badge-estatus badge-rechazado">

                    Rechazado

                </span>

            `;

    default:
      return `

                <span
                    class="badge-estatus badge-creado">

                    Creado

                </span>

            `;
  }
}

/* =========================
   BOTÓN ENVIAR
========================= */

function obtenerBotonEnviar(registro) {
  const estatus = normalizarEstatus(registro.estatus);

  if (estatus === "CREADO" || !estatus) {
    return `

            <button
                class="btn-enviar"
                onclick="enviarRegistro('${registro.codigo}')">

                Enviar

            </button>

        `;
  }

  if (estatus === "ENVIADO") {
    return `

            <button
                class="btn-enviado"
                disabled>

                Enviado

            </button>

        `;
  }

  if (estatus === "PAGADO" || estatus === "ACEPTADO") {
    return `

            <button
                class="btn-aceptado"
                disabled>

                Pagado

            </button>

        `;
  }

  if (estatus === "RECHAZADO") {
    return `

            <button
                class="btn-rechazado"
                onclick="reenviarRegistro('${registro.codigo}')">

                Reenviar

            </button>

        `;
  }

  return `

        <button
            class="btn-bloqueado"
            disabled>

            Bloqueado

        </button>

    `;
}

/* =========================
   REENVIAR
========================= */

async function reenviarRegistro(codigo) {
  try {
    const confirmar = confirm("¿Deseas reenviar este registro?");

    if (!confirmar) {
      return;
    }

    const response = await fetch(
      `${API}/api/registros/reenviar/${codigo}`,

      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error reenviando registro");
    }

    cargarRegistros();
  } catch (error) {
    console.error("ERROR REENVIANDO:", error);

    alert(error.message);
  }
}

/* =========================
   ENVIAR REGISTRO
========================= */

async function enviarRegistro(codigo) {
  try {
    const response = await fetch(
      `${API}/api/registros/enviar/${codigo}`,

      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error enviando registro");
    }

    cargarRegistros();
  } catch (error) {
    console.error("ERROR ENVIANDO:", error);

    alert(error.message);
  }
}

/* =========================
   OBSERVACIONES
========================= */

async function guardarObservaciones(codigo, observaciones) {
  try {
    const response = await fetch(
      `${API}/api/registros/observaciones/${codigo}`,

      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          observaciones,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error guardando observaciones");
    }
  } catch (error) {
    console.error("ERROR OBSERVACIONES:", error);

    alert(error.message);
  }
}

/* =========================
   CARGAR REGISTROS
========================= */

async function cargarRegistros() {
  try {
    const response = await fetch(`${API}/api/registros/UP-01`);

    if (!response.ok) {
      throw new Error("Error obteniendo registros");
    }

    const registros = await response.json();

    tbody.innerHTML = "";

    if (registros.length === 0) {
      tbody.innerHTML = `

                <tr>

                    <td colspan="12">

                        No hay registros

                    </td>

                </tr>

            `;

      return;
    }

    registros.sort((a, b) => {
      const orden = {
        CREADO: 1,
        RECHAZADO: 2,
        ENVIADO: 3,
        PAGADO: 4,
        ACEPTADO: 4,
      };

      return (
        (orden[normalizarEstatus(a.estatus)] || 99) -
        (orden[normalizarEstatus(b.estatus)] || 99)
      );
    });

    for (const registro of registros) {
      const estatus = normalizarEstatus(registro.estatus);

      const bloqueado =
        estatus === "PAGADO" || estatus === "ACEPTADO" || estatus === "ENVIADO";

      const permitirEliminar =
        estatus === "CREADO" || estatus === "RECHAZADO" || !estatus;

      tbody.innerHTML += `

            <tr>

            <td colspan="12">

            <div class="card-registro">

                <!-- SUPERIOR -->

                <div class="fila-superior">

                    <div class="info-item">

                        <span class="info-label">
                            ID
                        </span>

                        <span class="info-valor">
                            ${registro.codigo || "-"}
                        </span>

                    </div>

                    <div class="info-item">

                        <span class="info-label">
                            Persona
                        </span>

                        <span class="info-valor">
                            ${registro.persona || "-"}
                        </span>

                    </div>

                    <div class="info-item">

                        <span class="info-label">
                            Fecha y Hora
                        </span>

                        <span class="info-valor">

                            ${
                              registro.fecha
                                ? new Date(registro.fecha).toLocaleString(
                                    "es-MX",
                                  )
                                : "-"
                            }

                        </span>

                    </div>

                    <div class="info-item">

                        <span class="info-label">
                            Estatus
                        </span>

                        ${obtenerBadgeEstatus(registro.estatus)}

                    </div>

                    <div class="info-item">

                        <span class="info-label">
                            Eliminar
                        </span>

                        ${
                          permitirEliminar
                            ? `

                            <button
                                class="btn-eliminar"
                                onclick="eliminarRegistro('${registro.codigo}')">

                                Eliminar

                            </button>

                            `
                            : `

                            <button
                                class="btn-bloqueado"
                                disabled>

                                Bloqueado

                            </button>

                            `
                        }

                    </div>

                </div>

                <!-- PDFS -->

                <div
                    class="fila-pdfs"
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        gap:30px;
                        flex-wrap:wrap;
                    "
                >

                    <!-- OFICIO -->

                    <div
                        class="info-item"
                        style="
                            flex:1;
                            text-align:center;
                        "
                    >

                        <span class="info-label">
                            Oficio PDF
                        </span>

                        <a
                            href="${registro.oficio_pdf || "#"}"
                            target="_blank"
                            class="link-pdf">

                            Ver Oficio

                        </a>

                    </div>

                    <!-- PLIEGO -->

                    <div
                        class="info-item"
                        style="
                            flex:1;
                            text-align:center;
                        "
                    >

                        <span class="info-label">
                            Pliego PDF
                        </span>

                        <a
                            href="${registro.pliego_pdf || "#"}"
                            target="_blank"
                            class="link-pdf">

                            Ver Pliego

                        </a>

                    </div>

                    <!-- SPG -->

                    <div
                        class="info-item"
                        style="
                            flex:1;
                            text-align:center;
                        "
                    >

                        <span class="info-label">
                            SPG PDF
                        </span>

                        ${
                          registro.spg_pdf
                            ? `

                            <a
                                href="${registro.spg_pdf}"
                                target="_blank"
                                class="link-pdf">

                                Ver SPG

                            </a>

                            `
                            : `

                            <button
                                class="btn-bloqueado"
                                disabled>

                                Sin SPG

                            </button>

                            `
                        }

                    </div>

                    <!-- RECIBO -->

                    <div
                        class="info-item"
                        style="
                            flex:1;
                            text-align:center;
                        "
                    >

                        <span class="info-label">
                            Recibo PDF
                        </span>

                        ${
                          registro.recibo_pdf
                            ? `

                            <a
                                href="${registro.recibo_pdf}"
                                target="_blank"
                                class="link-pdf">

                                Ver Recibo

                            </a>

                            `
                            : `

                            <button
                                class="btn-bloqueado"
                                disabled>

                                Sin Recibo

                            </button>

                            `
                        }

                    </div>

                </div>

                <!-- INFERIOR -->

                <div class="fila-inferior">

                    <div class="info-item">

                        <span class="info-label">
                            Observaciones Área
                        </span>

                        <textarea
                            class="textarea-observaciones"
                            placeholder="Observaciones del área..."
                            onchange="guardarObservaciones(
                                '${registro.codigo}',
                                this.value
                            )"
                            ${bloqueado ? "readonly" : ""}
                        >${registro.observaciones || ""}</textarea>

                    </div>

                    <div class="info-item">

                        <span class="info-label">
                            Observaciones Administración
                        </span>

                        <textarea
                            class="textarea-observaciones-admin"
                            readonly
                            placeholder="Observaciones administración..."
                        >${registro.observaciones_admin || ""}</textarea>

                    </div>

                    <!-- ACCIONES -->

                    <div class="acciones-laterales">

                        <!-- TERMINAR -->

<div class="info-item">

    <span class="info-label">
        Terminar Trámite
    </span>

    ${
      registro.spg_pdf
        ? registro.recibo_pdf
          ? `

        <button
            class="btn-aceptado"
            disabled>

            Finalizado

        </button>

        `
          : `

        <button
            class="btn-enviar"
            onclick="abrirModalRecibo('${registro.codigo}')">

            Generar Recibo

        </button>

        `
        : `

        <button
            class="btn-enviar"
            onclick="abrirModalSPG('${registro.codigo}')">

            Generar SPG

        </button>

        `
    }

</div>

                        <!-- ENVIAR -->

                        <div class="info-item">

                            <span class="info-label">
                                Enviar
                            </span>

                            ${obtenerBotonEnviar(registro)}

                        </div>

                    </div>

                </div>

            </div>

            </td>

            </tr>

            `;
    }
  } catch (error) {
    console.error("ERROR REGISTROS:", error);
  }
}

/* =========================
   ELIMINAR
========================= */

function eliminarRegistro(codigo) {
  codigoEliminar = codigo;

  abrirModal("modalEliminar");
}

/* =========================
   CONFIRMAR ELIMINAR
========================= */

const btnConfirmarEliminar = document.getElementById("confirmarEliminar");

btnConfirmarEliminar.addEventListener(
  "click",

  async function () {
    try {
      const response = await fetch(
        `${API}/api/registros/${codigoEliminar}`,

        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error eliminando");
      }

      cerrarModal("modalEliminar");

      abrirModal("modalExito");

      cargarRegistros();
    } catch (error) {
      console.error("ERROR ELIMINANDO:", error);

      alert(error.message);
    }
  },
);

/* =========================
   INICIALIZAR TODO
========================= */

document.addEventListener(
  "DOMContentLoaded",

  () => {
    if (typeof llenarAnios === "function") {
      llenarAnios("spgAnio");
    }

    if (typeof llenarUP === "function") {
      llenarUP();
    }

    if (typeof llenarRubros === "function") {
      llenarRubros();
    }

    if (typeof llenarProyectos === "function") {
      llenarProyectos();
    }

    if (typeof llenarObjetoGasto === "function") {
      llenarObjetoGasto();
    }

    const spgMonto = document.getElementById("spgMonto");

    const spgRet = document.getElementById("spgRet");

    if (spgMonto) {
      spgMonto.addEventListener(
        "input",

        calcularTotalSPG,
      );
    }

    if (spgRet) {
      spgRet.addEventListener(
        "input",

        calcularTotalSPG,
      );
    }

    const btnGenerarSPG = document.getElementById("btnGenerarSPG");

    if (btnGenerarSPG) {
      btnGenerarSPG.addEventListener(
        "click",

        generarSPG,
      );
    }

    const btnGenerarRecibo = document.getElementById("btnGenerarRecibo");

    if (btnGenerarRecibo) {
      btnGenerarRecibo.addEventListener(
        "click",

        generarRecibo,
      );
    }

    cargarRegistros();

    setInterval(
      cargarRegistros,

      30000,
    );
  },
);
