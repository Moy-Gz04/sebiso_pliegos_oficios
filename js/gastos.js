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
   MODALES
========================= */

function abrirModal(id){

    document.getElementById(
        id
    ).style.display = "flex";

}

function cerrarModal(id){

    document.getElementById(
        id
    ).style.display = "none";

}

/* =========================
   MODAL ERROR
========================= */

function mostrarError(mensaje){

    document.getElementById(
        "mensajeModalError"
    ).innerText = mensaje;

    abrirModal("modalError");

}

/* =========================
   MODAL ÉXITO
========================= */

function mostrarExito(mensaje){

    document.getElementById(
        "mensajeModalExito"
    ).innerText = mensaje;

    abrirModal("modalExito");

}

/* =========================
   MAPA ÁREAS
========================= */

const mapaAreas = {

    "UP-01":"UP-01-DESPACHO",

    "UP-CA":"UP-CA",

    "UP-01-S-DRM":"UP-01-S-DRM",

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

            saldoDisponible.innerHTML =
            "$0.00";

            return;
        }

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
           PRESUPUESTO
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
           LIMPIAR
        ========================= */

        tbody.innerHTML = "";

        /* =========================
           VACÍO
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
           RECORRER
        ========================= */

        registrosPendientes.forEach((registro) => {

            const estatusNormalizado =

                normalizarEstatus(
                    registro.estatus
                );

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
                    onclick="confirmarRechazo(
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

                    <!-- TOP -->

                    <div class="registro-top">

                        <div class="campo-mini">

                            <span>

                                ID

                            </span>

                            <strong>

                                ${registro.codigo || '-'}

                            </strong>

                        </div>

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

                        <div class="campo-mini campo-persona">

                            <span>

                                PERSONA

                            </span>

                            <strong>

                                ${registro.persona || '-'}

                            </strong>

                        </div>

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

                        <div class="campo-mini">

                            <span>

                                ESTATUS

                            </span>

                            ${obtenerBadgeAdmin(
                                estatusVisual
                            )}

                        </div>

                    </div>

                    <!-- BOTTOM -->

                    <div class="registro-bottom">

                        <div class="campo-observacion">

                            <span>

                                OBSERVACIONES ÁREA

                            </span>

                            <textarea
                                class="textarea-obs"
                                readonly
                            >${registro.observaciones || ''}</textarea>

                        </div>

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

                        <div class="campo-mini">

                            <span>

                                PAGAR

                            </span>

                            ${botonPagar}

                        </div>

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

            mostrarError(
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

            mostrarError(
                "Ingrese una cantidad válida"
            );

            return;

        }

        document.getElementById(
            "mensajeModalPago"
        ).innerText =

        `¿Registrar pago de $${cantidad.toFixed(2)}?`;

        abrirModal(
            "modalConfirmarPago"
        );

        document.getElementById(

            "btnConfirmarPago"

        ).onclick = async () => {

            cerrarModal(
                "modalConfirmarPago"
            );

            try{

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

                    mostrarError(

                        data.msg ||

                        data.error ||

                        "Error registrando pago"

                    );

                    return;

                }

                mostrarExito(
                    "Pago registrado correctamente"
                );

                await cargarRegistros();

            }

            catch(error){

                console.log(
                    "ERROR PAGAR:",
                    error
                );

                mostrarError(
                    "Error servidor"
                );

            }

        };

    }

    catch(error){

        console.log(
            "ERROR PAGAR:",
            error
        );

        mostrarError(
            "Error servidor"
        );

    }

}

/* =========================
   CONFIRMAR RECHAZO
========================= */

function confirmarRechazo(codigo){

    document.getElementById(

        "mensajeModalRechazo"

    ).innerText =

    "¿Desea rechazar este registro?";

    abrirModal(
        "modalConfirmarRechazo"
    );

    document.getElementById(

        "btnConfirmarRechazo"

    ).onclick = async () => {

        cerrarModal(
            "modalConfirmarRechazo"
        );

        await rechazarRegistro(codigo);

    };

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

            mostrarError(

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

            mostrarError(

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

            mostrarError(

                rechazoData.error ||

                "Error rechazando"

            );

            return;

        }

        mostrarExito(
            "Registro rechazado"
        );

        await cargarRegistros();

    }

    catch(error){

        console.log(
            "ERROR RECHAZAR:",
            error
        );

        mostrarError(
            "Error rechazando registro"
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