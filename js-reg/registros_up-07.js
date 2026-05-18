const tbody =
document.getElementById(
    "tbodyResultados"
);

/* =========================
   API
========================= */

const API =

"https://sebiso-pliegos-oficios-1.onrender.com";

/* =========================
   VARIABLE ELIMINAR
========================= */

let codigoEliminar = null;

/* =========================
   NORMALIZAR ESTATUS
========================= */

function normalizarEstatus(estatus){

    return String(
        estatus || ''
    )

    .trim()

    .toUpperCase();

}

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
   BADGE ESTATUS
========================= */

function obtenerBadgeEstatus(estatus){

    const estado =
    normalizarEstatus(
        estatus
    );

    switch(estado){

        case "ENVIADO":

            return `

                <span
                    class="badge-estatus badge-enviado">

                    Enviado

                </span>

            `;

        case "PAGADO":

            return `

                <span
                    class="badge-estatus badge-aceptado">

                    Pagado

                </span>

            `;

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

function obtenerBotonEnviar(registro){

    const estatus =
    normalizarEstatus(
        registro.estatus
    );

    /* =========================
       CREADO
    ========================= */

    if(

        estatus === "CREADO"
        ||
        !estatus

    ){

        return `

            <button
                class="btn-enviar"
                onclick="enviarRegistro('${registro.codigo}')">

                Enviar

            </button>

        `;

    }

    /* =========================
       ENVIADO
    ========================= */

    if(estatus === "ENVIADO"){

        return `

            <button
                class="btn-enviado"
                disabled>

                Enviado

            </button>

        `;

    }

    /* =========================
       PAGADO
    ========================= */

    if(

        estatus === "PAGADO"
        ||
        estatus === "ACEPTADO"

    ){

        return `

            <button
                class="btn-aceptado"
                disabled>

                Pagado

            </button>

        `;

    }

    /* =========================
       RECHAZADO
    ========================= */

    if(estatus === "RECHAZADO"){

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

async function reenviarRegistro(codigo){

    try{

        const confirmar =
        confirm(

            "¿Deseas reenviar este registro?"

        );

        if(!confirmar){

            return;

        }

        const response =
        await fetch(

            `${API}/api/registros/reenviar/${codigo}`,

            {

                method:'PUT',

                headers:{
                    'Content-Type':'application/json'
                }

            }

        );

        const data =
        await response.json();

        if(!response.ok){

            throw new Error(

                data.error ||

                "Error reenviando registro"

            );

        }

        cargarRegistros();

    }

    catch(error){

        console.error(
            "ERROR REENVIANDO:",
            error
        );

        alert(
            error.message
        );

    }

}

/* =========================
   ENVIAR REGISTRO
========================= */

async function enviarRegistro(codigo){

    try{

        const response =
        await fetch(

            `${API}/api/registros/enviar/${codigo}`,

            {

                method:'PUT',

                headers:{
                    'Content-Type':'application/json'
                }

            }

        );

        const data =
        await response.json();

        if(!response.ok){

            throw new Error(

                data.error ||

                "Error enviando registro"

            );

        }

        cargarRegistros();

    }

    catch(error){

        console.error(
            "ERROR ENVIANDO:",
            error
        );

        alert(
            error.message
        );

    }

}

/* =========================
   GUARDAR OBSERVACIONES
========================= */

async function guardarObservaciones(

    codigo,
    observaciones

){

    try{

        const response =
        await fetch(

            `${API}/api/registros/observaciones/${codigo}`,

            {

                method:'PUT',

                headers:{
                    'Content-Type':'application/json'
                },

                body:JSON.stringify({

                    observaciones

                })

            }

        );

        const data =
        await response.json();

        if(!response.ok){

            throw new Error(

                data.error ||

                "Error guardando observaciones"

            );

        }

    }

    catch(error){

        console.error(
            "ERROR OBSERVACIONES:",
            error
        );

        alert(
            error.message
        );

    }

}

/* =========================
   CARGAR REGISTROS
========================= */

async function cargarRegistros(){

    try{

        const response =
        await fetch(

            `${API}/api/registros/UP-07`

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
           SIN REGISTROS
        ========================= */

        if(registros.length === 0){

            tbody.innerHTML = `

                <tr>

                    <td colspan="10">

                        No hay registros

                    </td>

                </tr>

            `;

            return;

        }

        /* =========================
           ORDENAR
        ========================= */

        registros.sort((a,b)=>{

            const orden = {

                "CREADO":1,
                "RECHAZADO":2,
                "ENVIADO":3,
                "PAGADO":4,
                "ACEPTADO":4

            };

            return (

                (orden[
                    normalizarEstatus(a.estatus)
                ] || 99)

                -

                (orden[
                    normalizarEstatus(b.estatus)
                ] || 99)

            );

        });

        /* =========================
           RECORRER
        ========================= */

        for(const registro of registros){

            const estatus =
            normalizarEstatus(
                registro.estatus
            );

            /* =========================
               BLOQUEAR
            ========================= */

            const bloqueado =

                estatus === "PAGADO"
                ||
                estatus === "ACEPTADO"
                ||
                estatus === "ENVIADO";

            /* =========================
               ELIMINAR
            ========================= */

            const permitirEliminar =

                estatus === "CREADO"
                ||
                estatus === "RECHAZADO"
                ||
                !estatus;

            tbody.innerHTML += `

                <tr>

                    <!-- ID -->

                    <td>

                        ${registro.codigo || '-'}

                    </td>

                    <!-- PERSONA -->

                    <td>

                        ${registro.persona || '-'}

                    </td>

                    <!-- FECHA -->

                    <td>

                        ${registro.fecha

                            ?

                            new Date(
                                registro.fecha
                            ).toLocaleString(
                                'es-MX'
                            )

                            :

                            '-'

                        }

                    </td>

                    <!-- OFICIO -->

                    <td>

                        <a
                            href="${registro.oficio_pdf || '#'}"
                            target="_blank"
                            class="link-pdf">

                            Ver Oficio

                        </a>

                    </td>

                    <!-- PLIEGO -->

                    <td>

                        <a
                            href="${registro.pliego_pdf || '#'}"
                            target="_blank"
                            class="link-pdf">

                            Ver Pliego

                        </a>

                    </td>

                    <!-- ENVIAR -->

                    <td>

                        ${obtenerBotonEnviar(registro)}

                    </td>

                    <!-- ESTATUS -->

                    <td>

                        ${obtenerBadgeEstatus(registro.estatus)}

                    </td>

                    <!-- OBSERVACIONES ÁREA -->

                    <td>

                        <textarea
                            class="textarea-observaciones"
                            placeholder="Observaciones del área..."
                            onchange="guardarObservaciones(
                                '${registro.codigo}',
                                this.value
                            )"
                            ${bloqueado ? 'readonly' : ''}
                        >${registro.observaciones || ''}</textarea>

                    </td>

                    <!-- OBSERVACIONES ADMIN -->

                    <td>

                        <textarea
                            class="textarea-observaciones-admin"
                            readonly
                            placeholder="Observaciones administración..."
                        >${registro.observaciones_admin || ''}</textarea>

                    </td>

                    <!-- ELIMINAR -->

                    <td>

                        ${permitirEliminar

                            ?

                            `

                            <button
                                class="btn-eliminar"
                                onclick="eliminarRegistro('${registro.codigo}')">

                                Eliminar

                            </button>

                            `

                            :

                            `

                            <button
                                class="btn-bloqueado"
                                disabled>

                                Bloqueado

                            </button>

                            `

                        }

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

                `${API}/api/registros/${codigoEliminar}`,

                {

                    method:'DELETE'

                }

            );

            const data =
            await response.json();

            if(!response.ok){

                throw new Error(

                    data.error ||

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

            alert(
                error.message
            );

        }

    }

);

/* =========================
   AUTO REFRESH
========================= */

setInterval(

    cargarRegistros,

    30000

);

/* =========================
   INICIAR
========================= */

cargarRegistros();