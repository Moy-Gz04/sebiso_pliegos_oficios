/* =========================
   CONFIGURACIÓN
========================= */

const API = "https://sebiso-pliegos-oficios-1.onrender.com";

const AREA = "UP-04";

const tbodyViaticos = document.getElementById("tbodyViaticos");

/** ID del registro que se va a eliminar (se llena al abrir el modal) */
let idEliminarViatico = null;

/* =========================
   CARGAR VIÁTICOS GENERADOS
========================= */

async function cargarViaticos() {

    tbodyViaticos.innerHTML = `
        <tr>
            <td colspan="5" style="padding:30px;">
                Cargando...
            </td>
        </tr>
    `;

    try {

        const respuesta = await fetch(

            `${API}/api/viaticos-generados/${AREA}`

        );

        if (!respuesta.ok) {

            throw new Error(`HTTP ${respuesta.status}`);

        }

        const resultado = await respuesta.json();

        const registros = resultado.registros || [];

        tbodyViaticos.innerHTML = "";

        if (registros.length === 0) {

            tbodyViaticos.innerHTML = `
                <tr>
                    <td colspan="5" style="padding:30px;">
                        No hay viáticos generados
                    </td>
                </tr>
            `;

            return;
        }

        registros.forEach((registro) => {

            tbodyViaticos.innerHTML += construirFila(registro);

        });

    }

    catch (error) {

        console.error("ERROR CARGANDO VIÁTICOS:", error);

        tbodyViaticos.innerHTML = `
            <tr>
                <td colspan="5" style="padding:30px; color:#DC2626;">
                    Error al cargar viáticos generados
                </td>
            </tr>
        `;

    }

}

/* =========================
   CONSTRUIR FILA
========================= */

function construirFila(registro) {

    const fecha = new Date(

        registro.fecha_generacion

    ).toLocaleString("es-MX", {

        day:    "2-digit",
        month:  "2-digit",
        year:   "numeric",
        hour:   "2-digit",
        minute: "2-digit"

    });

    const detalle =

        typeof registro.detalle === "string"

        ? JSON.parse(registro.detalle)

        : registro.detalle;

    const nombres =

        (detalle || [])

        .map((fila) => `<span class="chip-persona">${escaparHTML(fila.persona || "")}</span>`)

        .join(" ");

    return `

        <tr>

            <td>${fecha}</td>

            <td style="text-align:left;">
                <div class="lista-personas">
                    ${nombres}
                </div>
            </td>

            <td>
                <span class="badge-total">
                    ${registro.total_personas}
                </span>
            </td>

            <td>
                <a
                    href="${registro.pdf_url}"
                    target="_blank"
                    class="btn-pdf"
                >
                    Ver PDF
                </a>
            </td>

            <td>
                <button
                    type="button"
                    class="btn-eliminar"
                    onclick="abrirModalEliminarViatico(${registro.id})"
                >
                    Eliminar
                </button>
            </td>

        </tr>

    `;

}

/* =========================
   ESCAPAR HTML (seguridad)
========================= */

function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

/* =========================
   MODAL ELIMINAR
========================= */

function abrirModalEliminarViatico(id) {

    idEliminarViatico = id;

    abrirModal("modalEliminarViatico");

}

document.getElementById("confirmarEliminarViatico")

?.addEventListener("click", async () => {

    if (!idEliminarViatico) return;

    try {

        const respuesta = await fetch(

            `${API}/api/viaticos-generados/${idEliminarViatico}`,

            { method: "DELETE" }

        );

        const data = await respuesta.json();

        if (!respuesta.ok || !data.ok) {

            throw new Error(data.msg || "Error eliminando");

        }

        cerrarModal("modalEliminarViatico");

        cargarViaticos();

    }

    catch (error) {

        console.error("ERROR ELIMINANDO VIÁTICO:", error);

        alert("No se pudo eliminar: " + error.message);

    }

    finally {

        idEliminarViatico = null;

    }

});

/* =========================
   INICIO
========================= */

cargarViaticos();