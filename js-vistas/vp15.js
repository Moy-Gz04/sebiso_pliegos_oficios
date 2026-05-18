const API =

"https://sebiso-pliegos-oficios-1.onrender.com";

/* =========================
   AREA FIJA
========================= */

const AREA =

"UP-15-SSDSyH";

/* =========================
   ELEMENTOS
========================= */

const tbodyIngresos =

document.getElementById(
    "tbodyIngresos"
);

const tbodyGastos =

document.getElementById(
    "tbodyGastos"
);

const saldoDisponible =

document.getElementById(
    "saldoDisponible"
);

/* =========================
   VARIABLES
========================= */

let ingresosGlobal = [];

/* =========================
   ORDEN MESES
========================= */

const ordenMeses = {

    "ENERO":1,
    "FEBRERO":2,
    "MARZO":3,
    "ABRIL":4,
    "MAYO":5,
    "JUNIO":6,
    "JULIO":7,
    "AGOSTO":8,
    "SEPTIEMBRE":9,
    "OCTUBRE":10,
    "NOVIEMBRE":11,
    "DICIEMBRE":12

};

/* =========================
   CARGAR INGRESOS
========================= */

async function cargarIngresos(){

    try{

        const respuesta =

        await fetch(

            `${API}/api/presupuestos/${AREA}`

        );

        if(!respuesta.ok){

            throw new Error(

                `HTTP ${respuesta.status}`

            );
        }

        const response =

        await respuesta.json();

        const data =

        response.presupuestos;

        console.log(
            "INGRESOS:",
            data
        );

        tbodyIngresos.innerHTML = "";

        if(!Array.isArray(data)){

            tbodyIngresos.innerHTML = `

                <tr>

                    <td colspan="6">

                        Error de formato

                    </td>

                </tr>

            `;

            return;
        }

        data.sort((a, b) => {

            if(
                Number(b.anio)
                !==
                Number(a.anio)
            ){

                return (
                    Number(b.anio)
                    -
                    Number(a.anio)
                );
            }

            return (

                ordenMeses[b.mes]
                -
                ordenMeses[a.mes]

            );

        });

        ingresosGlobal = data;

        renderizarIngresos();

    }

    catch(error){

        console.log(

            "ERROR INGRESOS:",
            error

        );

        tbodyIngresos.innerHTML = `

            <tr>

                <td colspan="6">

                    Error al cargar ingresos

                </td>

            </tr>

        `;
    }

}

/* =========================
   RENDERIZAR INGRESOS
========================= */

function renderizarIngresos(){

    tbodyIngresos.innerHTML = "";

    if(ingresosGlobal.length === 0){

        tbodyIngresos.innerHTML = `

            <tr>

                <td colspan="6">

                    No hay registros

                </td>

            </tr>

        `;

        saldoDisponible.innerHTML =
        "$0.00";

        return;
    }

    const ultimoRegistro =

    ingresosGlobal[0];

    const saldoBase =

    parseFloat(
        ultimoRegistro.saldo_restante || 0
    );

    saldoDisponible.innerHTML =

        `$${saldoBase.toLocaleString(

            "es-MX",

            {

                minimumFractionDigits:2

            }

        )}`;

    ingresosGlobal.forEach((registro) => {

        const disponibleReal =

        parseFloat(
            registro.saldo_restante || 0
        );

        tbodyIngresos.innerHTML += `

            <tr>

                <td>

                    ${registro.mes}
                    ${registro.anio}

                </td>

                <td>

                    $${parseFloat(

                        registro.saldo_autorizado || 0

                    ).toLocaleString(

                        "es-MX",

                        {

                            minimumFractionDigits:2

                        }

                    )}

                </td>

                <td>

                    $${parseFloat(

                        registro.saldo_modificado || 0

                    ).toLocaleString(

                        "es-MX",

                        {

                            minimumFractionDigits:2

                        }

                    )}

                </td>

                <td>

                    $${disponibleReal.toLocaleString(

                        "es-MX",

                        {

                            minimumFractionDigits:2

                        }

                    )}

                </td>

                <td>

                    ${
                        registro.oficio_autorizacion

                        ?

                        `<a
                            href="${API}/uploads/oficios/${registro.oficio_autorizacion}"
                            target="_blank"
                            class="btn-pdf"
                        >

                            VER PDF

                        </a>`

                        :

                        'Sin PDF'
                    }

                </td>

                <td>

                    ${
                        registro.oficio_adecuacion

                        ?

                        `<a
                            href="${API}/uploads/oficios/${registro.oficio_adecuacion}"
                            target="_blank"
                            class="btn-pdf"
                        >

                            VER PDF

                        </a>`

                        :

                        'Sin PDF'
                    }

                </td>

            </tr>

        `;
    });

}

/* =========================
   CARGAR GASTOS
========================= */

async function cargarGastos(){

    try{

        const respuesta =

        await fetch(

            `${API}/api/presupuestos/${AREA}`

        );

        if(!respuesta.ok){

            throw new Error(

                `HTTP ${respuesta.status}`

            );
        }

        const response =

        await respuesta.json();

        const gastos =

        response.gastos;

        console.log(
            "GASTOS:",
            gastos
        );

        tbodyGastos.innerHTML = "";

        if(!Array.isArray(gastos)){

            tbodyGastos.innerHTML = `

                <tr>

                    <td colspan="4">

                        Error de formato

                    </td>

                </tr>

            `;

            return;
        }

        if(gastos.length === 0){

            tbodyGastos.innerHTML = `

                <tr>

                    <td colspan="4">

                        No hay gastos registrados

                    </td>

                </tr>

            `;

            return;
        }

        gastos.forEach((gasto) => {

            tbodyGastos.innerHTML += `

                <tr>

                    <td>

                        ${formatearFecha(
                            gasto.fecha
                        )}

                    </td>

                    <td>

                        ${gasto.persona || "-"}

                    </td>

                    <td>

                        $${parseFloat(
                            gasto.cantidad || 0
                        ).toLocaleString(

                            "es-MX",

                            {

                                minimumFractionDigits:2

                            }

                        )}

                    </td>

                    <td>

                        ${gasto.observacion || "-"}

                    </td>

                </tr>

            `;
        });

    }

    catch(error){

        console.log(

            "ERROR GASTOS:",
            error

        );

        tbodyGastos.innerHTML = `

            <tr>

                <td colspan="4">

                    Error al cargar gastos

                </td>

            </tr>

        `;
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

    .toLocaleDateString(

        "es-MX",

        {

            year:"numeric",
            month:"2-digit",
            day:"2-digit"

        }

    );

}

/* =========================
   TABS
========================= */

function mostrarIngresos(){

    document.getElementById(
        "contenedorIngresos"
    ).style.display = "block";

    document.getElementById(
        "contenedorGastos"
    ).style.display = "none";

    document.getElementById(
        "btnIngresos"
    ).classList.add("activo");

    document.getElementById(
        "btnGastos"
    ).classList.remove("activo");

}

function mostrarGastos(){

    document.getElementById(
        "contenedorIngresos"
    ).style.display = "none";

    document.getElementById(
        "contenedorGastos"
    ).style.display = "block";

    document.getElementById(
        "btnGastos"
    ).classList.add("activo");

    document.getElementById(
        "btnIngresos"
    ).classList.remove("activo");

}

/* =========================
   INICIO
========================= */

cargarIngresos();
cargarGastos();