const tbody =
document.getElementById(
    "tbodyResultados"
);

/* =========================
   VARIABLE ELIMINAR
========================= */

let codigoEliminar = null;

/* =========================
   MODALES
========================= */

function abrirModal(id){

    const modal =
    document.getElementById(id);

    if(modal){

        modal.style.display = "flex";

    }

}

function cerrarModal(id){

    const modal =
    document.getElementById(id);

    if(modal){

        modal.style.display = "none";

    }

}

/* =========================
   CARGAR REGISTROS
========================= */

async function cargarRegistros(){

    try{

        const response =
        await fetch(

            /* =========================
               CAMBIO A UP-05
            ========================= */

            "http://localhost:3000/api/registros/UP-05"

        );

        if(!response.ok){

            throw new Error(
                "Error obteniendo registros"
            );

        }

        const registros =
        await response.json();

        tbody.innerHTML = "";

        /* =========================
           RECORRER REGISTROS
        ========================= */

        for(const registro of registros){

            tbody.innerHTML += `

                <tr>

                    <td>
                        ${registro.codigo}
                    </td>

                    <td>
                        ${registro.persona}
                    </td>

                    <td>

                        ${new Date(
                            registro.fecha
                        ).toLocaleString()}

                    </td>

                    <td>

                        <a
                            href="${registro.oficio_pdf}"
                            target="_blank">

                            Ver Oficio

                        </a>

                    </td>

                    <td>

                        <a
                            href="${registro.pliego_pdf}"
                            target="_blank">

                            Ver Pliego

                        </a>

                    </td>

                    <td>

                        <button
                            class="btn-eliminar"
                            onclick="eliminarRegistro('${registro.codigo}')">

                            Eliminar

                        </button>

                    </td>

                </tr>

            `;

        }

    }

    catch(error){

        console.error(
            "ERROR REGISTROS:",
            error
        );

    }

}

/* =========================
   ABRIR MODAL ELIMINAR
========================= */

function eliminarRegistro(codigo){

    codigoEliminar = codigo;

    abrirModal(
        "modalEliminar"
    );

}

/* =========================
   CONFIRMAR ELIMINAR
========================= */

const btnConfirmarEliminar =
document.getElementById(
    "confirmarEliminar"
);

btnConfirmarEliminar.addEventListener(

    "click",

    async function(){

        try{

            const response =
            await fetch(

                `http://localhost:3000/api/registros/${codigoEliminar}`,

                {

                    method:'DELETE'

                }

            );

            if(!response.ok){

                throw new Error(
                    'Error eliminando'
                );

            }

            cerrarModal(
                "modalEliminar"
            );

            abrirModal(
                "modalExito"
            );

            cargarRegistros();

        }

        catch(error){

            console.error(
                "ERROR ELIMINANDO:",
                error
            );

        }

    }

);

/* =========================
   INICIAR
========================= */

cargarRegistros();