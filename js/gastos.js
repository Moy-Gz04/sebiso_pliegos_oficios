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

        if(!area){

            tbody.innerHTML = "";

            return;
        }

        const areaPresupuesto =
        mapaAreas[area];

        /* =========================
           OBTENER REGISTROS
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
           OBTENER PRESUPUESTO
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
           LIMPIAR CONTENEDOR
        ========================= */

        tbody.innerHTML = "";

        /* =========================
           SIN REGISTROS
        ========================= */

        if(registrosPendientes.length === 0){

            tbody.innerHTML = `

                <div class="registro-card">

                    <div class="texto-vacio">

                        No hay registros pendientes de revisión

                    </div>

                </div>

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

            /* =========================
               PAGADO
            ========================= */

            const yaPagado =

                registro.pagado === true ||

                estatusNormalizado === 'PAGADO' ||

                estatusNormalizado === 'ACEPTADO';

            /* =========================
               BOTÓN PAGAR
            ========================= */

            const botonPagar = yaPagado

            ? `

                <button
                    class="btn-pagado"
                    disabled
                >

                    PAGADO

                </button>

            `

            : `

                <button
                    class="btn-pagar"
                    onclick="pagarRegistro(
                        ${registro.id},
                        '${registro.codigo}'
                    )"
                >

                    PAGAR

                </button>

            `;

            /* =========================
               BOTÓN RECHAZAR
            ========================= */

            const botonRechazar = yaPagado

            ? `

                <button
                    class="btn-deshabilitado"
                    disabled
                >

                    BLOQUEADO

                </button>

            `

            : `

                <button
                    class="btn-rechazar"
                    onclick="rechazarRegistro(
                        '${registro.codigo}'
                    )"
                >

                    RECHAZAR

                </button>

            `;

            /* =========================
               ESTATUS VISUAL
            ========================= */

            let estatusVisual =
            estatusNormalizado;

            if(yaPagado){

                estatusVisual =
                'PAGADO';
            }

            tbody.innerHTML += `

                <div class="registro-card">

                    <!-- =========================
                         FILA SUPERIOR
                    ========================= -->

                    <div class="registro-top">

                        <!-- ID -->

                        <div class="campo-mini">

                            <span>

                                ID

                            </span>

                            <strong>

                                ${registro.codigo || '-'}

                            </strong>

                        </div>

                        <!-- FECHA -->

                        <div class="campo-mini">

                            <span>

                                FECHA

                            </span>

                            <strong>

                                ${formatearFecha(
                                    registro.fecha
                                )}

                            </strong>

                        </div>

                        <!-- PERSONA -->

                        <div class="campo-mini campo-persona">

                            <span>

                                PERSONA

                            </span>

                            <strong>

                                ${registro.persona || '-'}

                            </strong>

                        </div>

                        <!-- OFICIO -->

                        <div class="campo-mini">

                            <span>

                                OFICIO

                            </span>

                            <a
                                href="${registro.oficio_pdf || '#'}"
                                target="_blank"
                                class="btn-link"
                            >

                                Oficio

                            </a>

                        </div>

                        <!-- PLIEGO -->

                        <div class="campo-mini">

                            <span>

                                PLIEGO

                            </span>

                            <a
                                href="${registro.pliego_pdf || '#'}"
                                target="_blank"
                                class="btn-link"
                            >

                                Pliego

                            </a>

                        </div>

                        <!-- ESTATUS -->

                        <div class="campo-mini">

                            <span>

                                ESTATUS

                            </span>

                            ${obtenerBadgeAdmin(
                                estatusVisual
                            )}

                        </div>

                    </div>

                    <!-- =========================
                         FILA INFERIOR
                    ========================= -->

                    <div class="registro-bottom">

                        <!-- OBS ÁREA -->

                        <div class="campo-observacion">

                            <span>

                                OBSERVACIONES ÁREA

                            </span>

                            <textarea
                                class="textarea-obs"
                                readonly
                            >${registro.observaciones || ''}</textarea>

                        </div>

                        <!-- OBS ADMIN -->

                        <div class="campo-observacion">

                            <span>

                                OBSERVACIONES ADMIN

                            </span>

                            <textarea
                                class="textarea-obs-admin"
                                id="obs-admin-${registro.codigo}"
                                placeholder="Motivo del rechazo..."
                                ${yaPagado ? 'disabled' : ''}
                            >${registro.observaciones_admin || ''}</textarea>

                        </div>

                        <!-- CANTIDAD -->

                        <div class="campo-mini">

                            <span>

                                CANTIDAD

                            </span>

                            ${

                                yaPagado

                                ?

                                `

                                <div class="texto-simple">

                                    $${parseFloat(

                                        registro.cantidad_pagada || 0

                                    ).toLocaleString(

                                        'es-MX',

                                        {

                                            minimumFractionDigits:2

                                        }

                                    )}

                                </div>

                                `

                                :

                                `

                                <input
                                    type="number"
                                    class="input-cantidad"
                                    id="cantidad-${registro.id}"
                                    placeholder="$0.00"
                                    min="1"
                                    step="0.01"
                                >

                                `
                            }

                        </div>

                        <!-- PAGAR -->

                        <div class="campo-mini">

                            <span>

                                PAGAR

                            </span>

                            ${botonPagar}

                        </div>

                        <!-- RECHAZAR -->

                        <div class="campo-mini">

                            <span>

                                RECHAZAR

                            </span>

                            ${botonRechazar}

                        </div>

                    </div>

                </div>

            `;

        });

    }

    catch(error){

        console.log(
            "ERROR CARGANDO:",
            error
        );

        tbody.innerHTML = `

            <div class="registro-card">

                <div class="texto-vacio">

                    Error cargando registros

                </div>

            </div>

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

    if(

        estatus === "PAGADO"

        ||

        estatus === "ACEPTADO"

    ){

        return `

            <span
                class="badge-estatus badge-aceptado">

                Pagado

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

        if(!input){

            alert(
                "No se encontró el campo de cantidad"
            );

            return;
        }

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

        alert(
            "Pago registrado correctamente"
        );

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