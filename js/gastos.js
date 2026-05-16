const API =

"https://sebiso-pliegos-oficios-1.onrender.com";

/* =========================
   ELEMENTOS
========================= */

const tbody =
document.getElementById(
    "tbodyRegistros"
);

const selectArea =
document.getElementById(
    "selectArea"
);

const saldoDisponible =
document.getElementById(
    "saldoDisponible"
);

/* =========================
   MAPA ÁREAS
========================= */

const mapaAreas = {

    "UP-01":"UP-01-DESPACHO",

    "UP-04":"UP-04-DGFA",

    "UP-05":"UP-05-Subse_I_D",

    "UP-06":"UP-06-DGOLP",

    "UP-07":"UP-07-MIGRANTES",

    "UP-08":"UP-08-ASISTENCIA",

    "UP-13":"UP-13-SSPSyFA",

    "UP-14":"UP-14-DISCAPACIDAD",

    "UP-15":"UP-15-SSDSyH",

    "UP-16":"UP-16"

};

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
   CARGAR REGISTROS
========================= */

async function cargarRegistros(){

    try{

        const area =
        selectArea.value;

        const areaPresupuesto =
        mapaAreas[area];

        /* =========================
           REGISTROS
        ========================= */

        const respuesta =
        await fetch(

            `${API}/api/registros/${area}`,

            {

                cache:"no-store"

            }

        );

        if(!respuesta.ok){

            throw new Error(
                "Error obteniendo registros"
            );

        }

        const data =
        await respuesta.json();

        /* =========================
           SOLO ENVIADOS
        ========================= */

        const registrosPendientes =

            data.filter((registro) => {

                const estatus =

                    normalizarEstatus(
                        registro.estatus
                    );

                return (

                    estatus === "ENVIADO"

                );

            });

        /* =========================
           PRESUPUESTOS
        ========================= */

        const presupuestoRespuesta =
        await fetch(

            `${API}/api/presupuestos/${areaPresupuesto}`,

            {

                cache:"no-store"

            }

        );

        if(!presupuestoRespuesta.ok){

            throw new Error(
                "Error obteniendo presupuesto"
            );

        }

        const presupuestoData =
        await presupuestoRespuesta.json();

        const presupuestos =

            presupuestoData.presupuestos || [];

        let saldo = 0;

        if(
            presupuestos.length > 0
        ){

            saldo =
            parseFloat(

                presupuestos[0]
                .saldo_restante || 0

            );

        }

        saldoDisponible.innerHTML =

            `$${saldo.toLocaleString(

                "es-MX",

                {

                    minimumFractionDigits:2

                }

            )}`;

        /* =========================
           LIMPIAR TABLA
        ========================= */

        tbody.innerHTML = "";

        /* =========================
           SIN REGISTROS
        ========================= */

        if(registrosPendientes.length === 0){

            tbody.innerHTML = `

                <tr>

                    <td colspan="11">

                        No hay registros pendientes de revisión

                    </td>

                </tr>

            `;

            return;

        }

        /* =========================
           INSERTAR REGISTROS
        ========================= */

        registrosPendientes.forEach((registro) => {

            const estatusNormalizado =

                normalizarEstatus(
                    registro.estatus
                );

            tbody.innerHTML += `

                <tr>

                    <!-- CODIGO -->

                    <td>

                        ${registro.codigo || '-'}

                    </td>

                    <!-- PERSONA -->

                    <td>

                        ${registro.persona || '-'}

                    </td>

                    <!-- FECHA -->

                    <td>

                        ${formatearFecha(
                            registro.fecha
                        )}

                    </td>

                    <!-- OFICIO -->

                    <td>

                        <a
                            href="${registro.oficio_pdf}"
                            target="_blank"
                            class="btn-link"
                        >

                            Ver Oficio

                        </a>

                    </td>

                    <!-- PLIEGO -->

                    <td>

                        <a
                            href="${registro.pliego_pdf}"
                            target="_blank"
                            class="btn-link"
                        >

                            Ver Pliego

                        </a>

                    </td>

                    <!-- OBS AREA -->

                    <td>

                        <textarea
                            class="textarea-obs"
                            readonly>${registro.observaciones || ''}</textarea>

                    </td>

                    <!-- OBS ADMIN -->

                    <td>

                        <textarea
                            class="textarea-obs-admin"
                            id="obs-admin-${registro.codigo}"
                            placeholder="Motivo del rechazo...">${registro.observaciones_admin || ''}</textarea>

                    </td>

                    <!-- ESTATUS -->

                    <td>

                        ${obtenerBadgeAdmin(
                            estatusNormalizado
                        )}

                    </td>

                    <!-- CANTIDAD -->

                    <td>

                        <input
                            type="number"
                            class="input-cantidad"
                            id="cantidad-${registro.id}"
                            placeholder="$0.00"
                            min="1"
                            step="0.01"
                        >

                    </td>

                    <!-- PAGAR -->

                    <td>

                        <button
                            class="btn-pagar"
                            onclick="pagarRegistro(
                                ${registro.id},
                                '${registro.codigo}'
                            )"
                        >

                            PAGAR

                        </button>

                    </td>

                    <!-- RECHAZAR -->

                    <td>

                        <button
                            class="btn-rechazar"
                            onclick="rechazarRegistro(
                                '${registro.codigo}'
                            )"
                        >

                            RECHAZAR

                        </button>

                    </td>

                </tr>

            `;

        });

    }

    catch(error){

        console.log(
            "ERROR CARGANDO:",
            error
        );

        tbody.innerHTML = `

            <tr>

                <td colspan="11">

                    Error cargando registros

                </td>

            </tr>

        `;

    }

}

/* =========================
   BADGE ESTATUS
========================= */

function obtenerBadgeAdmin(estatus){

    if(estatus === "ENVIADO"){

        return `

            <span
                class="badge-estatus badge-revision">

                A Revisar

            </span>

        `;

    }

    if(estatus === "ACEPTADO"){

        return `

            <span
                class="badge-estatus badge-aceptado">

                Aceptado

            </span>

        `;

    }

    if(estatus === "RECHAZADO"){

        return `

            <span
                class="badge-estatus badge-rechazado">

                Rechazado

            </span>

        `;

    }

    return `

        <span
            class="badge-estatus">

            Desconocido

        </span>

    `;

}

/* =========================
   PAGAR
========================= */

async function pagarRegistro(

    id,
    codigo

){

    try{

        const input =
        document.getElementById(

            `cantidad-${id}`

        );

        const cantidad =
        parseFloat(
            input.value
        );

        if(

            !cantidad ||

            cantidad <= 0

        ){

            alert(
                "Ingrese una cantidad válida"
            );

            return;

        }

        const confirmar =
        confirm(

            `¿Registrar pago de $${cantidad.toFixed(2)}?`

        );

        if(!confirmar){

            return;

        }

        /* =========================
           REGISTRAR GASTO
        ========================= */

        const respuesta =
        await fetch(

            `${API}/api/gastos/registrar`,

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:JSON.stringify({

                    registro_id:id,

                    cantidad

                })

            }

        );

        const data =
        await respuesta.json();

        if(!respuesta.ok || !data.ok){

            alert(

                data.msg ||

                data.error ||

                "Error registrando pago"

            );

            return;

        }

        /* =========================
           CAMBIAR ESTATUS
        ========================= */

        const actualizar =
        await fetch(

            `${API}/api/registros/estatus/${codigo}`,

            {

                method:'PUT',

                headers:{

                    'Content-Type':
                    'application/json'

                },

                body:JSON.stringify({

                    estatus:'Aceptado'

                })

            }

        );

        const actualizarData =
        await actualizar.json();

        if(!actualizar.ok){

            alert(

                actualizarData.error ||

                "Error actualizando estatus"

            );

            return;

        }

        alert(
            "Pago registrado correctamente"
        );

        /* =========================
           RECARGAR
        ========================= */

        await cargarRegistros();

    }

    catch(error){

        console.log(
            "ERROR PAGAR:",
            error
        );

        alert(
            "Error servidor"
        );

    }

}

/* =========================
   RECHAZAR
========================= */

async function rechazarRegistro(codigo){

    try{

        const textarea =
        document.getElementById(

            `obs-admin-${codigo}`

        );

        const observacionesAdmin =
        textarea.value.trim();

        if(!observacionesAdmin){

            alert(

                "Debes escribir una observación"

            );

            return;

        }

        /* =========================
           GUARDAR OBS
        ========================= */

        const observacionResponse =
        await fetch(

            `${API}/api/registros/observaciones-admin/${codigo}`,

            {

                method:'PUT',

                headers:{

                    'Content-Type':
                    'application/json'

                },

                body:JSON.stringify({

                    observaciones_admin:
                    observacionesAdmin

                })

            }

        );

        const observacionData =
        await observacionResponse.json();

        if(!observacionResponse.ok){

            alert(

                observacionData.error ||

                "Error guardando observación"

            );

            return;

        }

        /* =========================
           CAMBIAR ESTATUS
        ========================= */

        const rechazoResponse =
        await fetch(

            `${API}/api/registros/estatus/${codigo}`,

            {

                method:'PUT',

                headers:{

                    'Content-Type':
                    'application/json'

                },

                body:JSON.stringify({

                    estatus:'Rechazado'

                })

            }

        );

        const rechazoData =
        await rechazoResponse.json();

        if(!rechazoResponse.ok){

            alert(

                rechazoData.error ||

                "Error rechazando"

            );

            return;

        }

        alert(

            'Registro rechazado'

        );

        await cargarRegistros();

    }

    catch(error){

        console.log(
            "ERROR RECHAZAR:",
            error
        );

        alert(

            'Error rechazando registro'

        );

    }

}

/* =========================
   FORMATEAR FECHA
========================= */

function formatearFecha(fecha){

    if(!fecha){

        return "-";
    }

    return new Date(fecha)

    .toLocaleString(
        "es-MX"
    );

}

/* =========================
   CAMBIO ÁREA
========================= */

selectArea.addEventListener(

    "change",

    async () => {

        await cargarRegistros();

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
   INIT
========================= */

cargarRegistros();