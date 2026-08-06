/* =========================
   CONFIGURACIÓN
========================= */

const API = "https://sebiso-pliegos-oficios-1.onrender.com";

const AREA = "UP-01-S-DRM";

const tbodyViaticos = document.getElementById("tbodyViaticos");

/* =========================
   CARGAR VIÁTICOS GENERADOS
========================= */

async function cargarViaticos() {

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
                    <td colspan="4">No hay viáticos generados</td>
                </tr>
            `;

            return;
        }

        registros.forEach((registro) => {

            const fecha = new Date(

                registro.fecha_generacion

            ).toLocaleString("es-MX");

            const detalle =

                typeof registro.detalle === "string"

                ? JSON.parse(registro.detalle)

                : registro.detalle;

            const nombres =

                detalle

                .map((fila) => fila.persona)

                .join(", ");

            tbodyViaticos.innerHTML += `

                <tr>

                    <td>${fecha}</td>

                    <td>${nombres}</td>

                    <td>${registro.total_personas}</td>

                    <td>
                        <a
                            href="${registro.pdf_url}"
                            target="_blank"
                            class="btn-pdf"
                        >
                            Ver PDF
                        </a>
                    </td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error("ERROR CARGANDO VIÁTICOS:", error);

        tbodyViaticos.innerHTML = `
            <tr>
                <td colspan="4" style="color:red;">
                    Error al cargar viáticos generados
                </td>
            </tr>
        `;

    }

}

/* =========================
   INICIO
========================= */

cargarViaticos();