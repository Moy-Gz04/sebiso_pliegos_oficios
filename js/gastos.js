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

            `${API}/api/registros/${area}`

        );

        const data =
        await respuesta.json();

        /* =========================
           SOLO ENVIADOS
        ========================= */

        const registrosPendientes =

            data.filter((registro) => {

                return (

                    registro.estatus === "Enviado"

                );

            });

        /* =========================
           PRESUPUESTOS
        ========================= */

        const presupuestoRespuesta =
        await fetch(

            `${API}/api/presupuestos/${areaPresupuesto}`

        );

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

            `$${saldo.toFixed(2)}`;

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
                            class="btn-link"
                        >

                            Ver Oficio

                        </a>

                    </td>

                    <td>

                        <a
                            href="${registro.pliego_pdf}"
                            target="_blank"
                            class="btn-link"
                        >

                            Ver Pliego

                        </a>

                    </td>

                    <!-- OBSERVACIONES ÁREA -->

                    <td>

                        <textarea
                            class="textarea-obs"
                            readonly>${registro.observaciones || ''}</textarea>

                    </td>

                    <!-- OBSERVACIONES ADMIN -->

                    <td>

                        <textarea
                            class="textarea-obs-admin"
                            id="obs-admin-${registro.codigo}"
                            placeholder="Motivo del rechazo...">${registro.observaciones_admin || ''}</textarea>

                    </td>

                    <!-- ESTATUS -->

                    <td>

                        ${obtenerBadgeAdmin(
                            registro.estatus
                        )}

                    </td>

                    <!-- CANTIDAD -->

                    <td>

                        <input
                            type="number"
                            class="input-cantidad"
                            id="cantidad-${registro.id}"
                            placeholder="$0.00"
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

        console.log(error);

        alert(
            "Error cargando registros"
        );

    }

}

/* =========================
   BADGE ESTATUS
========================= */

function obtenerBadgeAdmin(estatus){

    if(estatus === "Enviado"){

        return `

            <span
                class="badge-estatus badge-revision">

                A Revisar

            </span>

        `;

    }

    if(estatus === "Aceptado"){

        return `

            <span
                class="badge-estatus badge-aceptado">

                Aceptado

            </span>

        `;

    }

    if(estatus === "Rechazado"){

        return `

            <span
                class="badge-estatus badge-rechazado">

                Rechazado

            </span>

        `;

    }

}

/* =========================
   PAGAR
========================= */

async function pagarRegistro(

    id,
    codigo

){

    try{

        const cantidad =
        document.getElementById(

            `cantidad-${id}`

        ).value;

        if(

            !cantidad ||

            parseFloat(cantidad) <= 0

        ){

            alert(
                "Ingrese una cantidad válida"
            );

            return;

        }

        const confirmar =
        confirm(

            `¿Registrar pago de $${cantidad}?`

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

        if(!data.ok){

            alert(

                data.msg ||

                "Error registrando pago"

            );

            return;

        }

        /* =========================
           CAMBIAR ESTATUS
        ========================= */

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

        alert(
            "Pago registrado"
        );

        cargarRegistros();

    }

    catch(error){

        console.log(error);

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

        const observacionesAdmin =
        document.getElementById(

            `obs-admin-${codigo}`

        ).value;

        if(

            !observacionesAdmin.trim()

        ){

            alert(

                "Debes escribir una observación"

            );

            return;

        }

        /* =========================
           GUARDAR OBSERVACIÓN
        ========================= */

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

        /* =========================
           CAMBIAR ESTATUS
        ========================= */

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

        alert(

            'Registro rechazado'

        );

        cargarRegistros();

    }

    catch(error){

        console.log(error);

        alert(

            'Error rechazando registro'

        );

    }

}

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
   CAMBIO ÁREA
========================= */

selectArea.addEventListener(

    "change",

    cargarRegistros

);

/* =========================
   INIT
========================= */

cargarRegistros();