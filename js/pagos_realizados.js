const API =

"https://sebiso-pliegos-oficios-1.onrender.com";

/* =========================
   ELEMENTOS
========================= */

const tbody =

document.getElementById(
    "tbodyPagados"
);

const selectArea =

document.getElementById(
    "selectArea"
);

const inputBusqueda =

document.getElementById(
    "inputBusqueda"
);

const contadorResultados =

document.getElementById(
    "contadorResultados"
);

/* =========================
   VARIABLES
========================= */

let registrosPagados = [];

/* =========================
   CARGAR REGISTROS
========================= */

async function cargarPagados(){

    try{

        const area =
        selectArea.value;

        const respuesta =
        await fetch(

            `${API}/api/registros/${area}`

        );

        const data =
        await respuesta.json();

        /* =========================
           SOLO PAGADOS
        ========================= */

        registrosPagados =

            data.filter(

                registro => registro.pagado
            );

        pintarTabla(
            registrosPagados
        );

    }

    catch(error){

        console.log(error);

        alert(
            "Error cargando registros"
        );

    }

}

/* =========================
   PINTAR TABLA
========================= */

function pintarTabla(registros){

    tbody.innerHTML = "";

    contadorResultados.innerHTML =

        `${registros.length} registros`;

    if(registros.length === 0){

        tbody.innerHTML = `

            <tr>

                <td colspan="7">

                    No se encontraron registros

                </td>

            </tr>

        `;

        return;

    }

    registros.forEach((registro) => {

        tbody.innerHTML += `

            <tr>

                <td>

                    ${registro.codigo}

                </td>

                <td>

                    ${registro.persona}

                </td>

                <td>

                    ${formatearFecha(
                        registro.fecha
                    )}

                </td>

                <td>

                    <a
                        href="${registro.oficio_pdf}"
                        target="_blank"
                        class="btn-pdf"
                    >

                        Ver Oficio

                    </a>

                </td>

                <td>

                    <a
                        href="${registro.pliego_pdf}"
                        target="_blank"
                        class="btn-pdf"
                    >

                        Ver Pliego

                    </a>

                </td>

                <td>

                    $${parseFloat(
                        registro.cantidad_pagada || 0
                    ).toFixed(2)}

                </td>

                <td>

                    <span class="estado-pagado">

                        PAGADO

                    </span>

                </td>

            </tr>

        `;

    });

}

/* =========================
   BUSCADOR
========================= */

inputBusqueda.addEventListener(

    "input",

    () => {

        const texto =

            inputBusqueda.value
            .toLowerCase()
            .trim();

        const filtrados =

            registrosPagados.filter((registro) => {

                const persona =

                    (
                        registro.persona || ""
                    )
                    .toLowerCase();

                const fecha =

                    formatearFecha(
                        registro.fecha
                    )
                    .toLowerCase();

                return (

                    persona.includes(texto)

                    ||

                    fecha.includes(texto)

                );

            });

        pintarTabla(
            filtrados
        );

    }

);

/* =========================
   FORMATEAR FECHA
========================= */

function formatearFecha(fecha){

    return new Date(fecha)
    .toLocaleString(
        "es-MX"
    );

}

/* =========================
   CAMBIO AREA
========================= */

selectArea.addEventListener(

    "change",

    cargarPagados

);

/* =========================
   INIT
========================= */

cargarPagados();