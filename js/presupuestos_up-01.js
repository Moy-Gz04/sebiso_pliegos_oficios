const API =

"https://sebiso-pliegos-oficios-1.onrender.com";

/* =========================
   ELEMENTOS
========================= */

const btnGuardar =
document.getElementById(
    "btnGuardarPresupuesto"
);

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
   MAPA ÁREAS
========================= */

const mapaAreas = {

    "UP-01-DESPACHO":1,

    "UP-01-C_A":2,

    "UP-01-S-DRM":3,

    "UP-04-DGFA":4,

    "UP-05-Subse_I_D":5,

    "UP-06-DGOLP":6,

    "UP-07-MIGRANTES":7,

    "UP-08-ASISTENCIA":8,

    "UP-13-SSPSyFA":9,

    "UP-14-DISCAPACIDAD":10,

    "UP-15-SSDSyH":11,

    "UP-16":12

};

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
   GUARDAR PRESUPUESTO
========================= */

btnGuardar.addEventListener(

    "click",

    async () => {

        try{

            const area =
            document.getElementById(
                "selectArea"
            ).value.trim();

            const mes =
            document.getElementById(
                "mesPresupuesto"
            ).value;

            const anio =
            document.getElementById(
                "anioPresupuesto"
            ).value;

            const saldo =
            document.getElementById(
                "saldoMensual"
            ).value;

            const oficio =
            document.getElementById(
                "oficioPDF"
            ).files[0];

            if(!saldo){

                alert(
                    "Ingrese saldo mensual"
                );

                return;

            }

            if(!mapaAreas[area]){

                alert(
                    "Área inválida"
                );

                return;

            }

            const formData =
            new FormData();

            formData.append(
                "area_id",
                mapaAreas[area]
            );

            formData.append(
                "mes",
                mes
            );

            formData.append(
                "anio",
                anio
            );

            formData.append(
                "saldo_mensual",
                saldo
            );

            if(oficio){

                formData.append(
                    "oficio",
                    oficio
                );

            }

            const respuesta =
            await fetch(

                `${API}/api/presupuestos/crear`,

                {

                    method:"POST",

                    body:formData

                }

            );

            const data =
            await respuesta.json();

            if(!data.ok){

                alert(

                    data.msg ||
                    "Error al guardar"

                );

                return;

            }

            alert(
                "Registro guardado"
            );

            document.getElementById(
                "saldoMensual"
            ).value = "";

            document.getElementById(
                "oficioPDF"
            ).value = "";

            cargarHistorial();

        }

        catch(error){

            console.log(error);

            alert(
                "Error servidor"
            );

        }

    }

);

/* =========================
   CARGAR HISTORIAL
========================= */

async function cargarHistorial(){

    try{

        const area =
        document.getElementById(
            "selectArea"
        ).value.trim();

        /* =========================
           INGRESOS
        ========================= */

        const respuesta =
        await fetch(

            `${API}/api/presupuestos/${area}`

        );

        const data =
        await respuesta.json();

        data.sort((a, b) => {

            if(b.anio !== a.anio){

                return b.anio - a.anio;

            }

            return ordenMeses[b.mes]
            - ordenMeses[a.mes];

        });

        tbodyIngresos.innerHTML = "";

        let ultimoSaldo = data.length

            ? data[0].saldo_restante

            : 0;

        data.forEach((registro) => {

            tbodyIngresos.innerHTML += `

                <tr>

                    <td>

                        ${registro.mes} ${registro.anio}

                    </td>

                    <td>

                        $${parseFloat(
                            registro.saldo_disponible || 0
                        ).toFixed(2)}

                    </td>

                    <td>

                        $${parseFloat(
                            registro.gastado_mes || 0
                        ).toFixed(2)}

                    </td>

                    <td>

                        $${parseFloat(
                            registro.saldo_restante || 0
                        ).toFixed(2)}

                    </td>

                    <td>

                        ${
                            registro.oficio_pdf

                            ?

                            `<a
                                href="${API}/uploads/oficios/${registro.oficio_pdf}"
                                target="_blank"
                                class="btn-pdf"
                            >

                                Ver PDF

                            </a>`

                            :

                            'Sin PDF'
                        }

                    </td>

                    <td class="acciones">

                        <button
                            class="btn-editar"
                            onclick="editarRegistro(${registro.id})"
                        >

                            Editar

                        </button>

                        <button
                            class="btn-eliminar"
                            onclick="eliminarRegistro(${registro.id})"
                        >

                            Eliminar

                        </button>

                    </td>

                </tr>

            `;

        });

        saldoDisponible.innerHTML =

            `$${parseFloat(
                ultimoSaldo || 0
            ).toFixed(2)}`;

        /* =========================
           GASTOS
        ========================= */

        tbodyGastos.innerHTML = "";

        const gastosRespuesta =
        await fetch(

            `${API}/api/gastos/${area}`

        );

        const gastos =
        await gastosRespuesta.json();

        console.log(gastos);

        if(Array.isArray(gastos)){

            gastos.forEach((gasto) => {

                tbodyGastos.innerHTML += `

                    <tr>

                        <td>

                            ${formatearFecha(
                                gasto.fecha
                            )}

                        </td>

                        <td>

                            ${gasto.persona}

                        </td>

                        <td>

                            $${parseFloat(
                                gasto.cantidad || 0
                            ).toFixed(2)}

                        </td>

                        <td>

                            ${
                                gasto.observacion ||

                                'Sin observación'
                            }

                        </td>

                    </tr>

                `;

            });

        }

    }

    catch(error){

        console.log(error);

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
   TABS HISTORIAL
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
   ELIMINAR
========================= */

async function eliminarRegistro(id){

    const confirmar =
    confirm(
        "¿Eliminar registro?"
    );

    if(!confirmar){

        return;

    }

    try{

        const respuesta =
        await fetch(

            `${API}/api/presupuestos/${id}`,

            {

                method:"DELETE"

            }

        );

        const data =
        await respuesta.json();

        if(data.ok){

            alert(
                "Registro eliminado"
            );

            cargarHistorial();

        }

        else{

            alert(
                data.msg ||
                "Error eliminando"
            );

        }

    }

    catch(error){

        console.log(error);

        alert(
            "Error servidor"
        );

    }

}

/* =========================
   EDITAR
========================= */

async function editarRegistro(id){

    try{

        const area =
        document.getElementById(
            "selectArea"
        ).value.trim();

        const respuesta =
        await fetch(

            `${API}/api/presupuestos/${area}`

        );

        const data =
        await respuesta.json();

        const registro =
        data.find(

            item => item.id === id

        );

        if(!registro){

            alert(
                "Registro no encontrado"
            );

            return;

        }

        document.getElementById(
            "editId"
        ).value = registro.id;

        document.getElementById(
            "editMes"
        ).value = registro.mes;

        document.getElementById(
            "editAnio"
        ).value = registro.anio;

        document.getElementById(
            "editSaldo"
        ).value =
        registro.saldo_mensual;

        document.getElementById(
            "editDisponible"
        ).innerHTML =
        `$${parseFloat(
            registro.saldo_disponible || 0
        ).toFixed(2)}`;

        document.getElementById(
            "editGastado"
        ).innerHTML =
        `$${parseFloat(
            registro.gastado_mes || 0
        ).toFixed(2)}`;

        document.getElementById(
            "editRestante"
        ).innerHTML =
        `$${parseFloat(
            registro.saldo_restante || 0
        ).toFixed(2)}`;

        document.getElementById(
            "editPDFActual"
        ).innerHTML =

            registro.oficio_pdf

            ?

            `
            <a
                href="${API}/uploads/oficios/${registro.oficio_pdf}"
                target="_blank"
                class="btn-pdf"
            >

                Ver PDF Actual

            </a>
            `

            :

            'Sin PDF';

        document.getElementById(
            "modalEditar"
        ).style.display = "flex";

        document.getElementById(
            "overlay"
        ).style.display = "block";

    }

    catch(error){

        console.log(error);

        alert(
            "Error cargando registro"
        );

    }

}

/* =========================
   CERRAR MODAL
========================= */

function cerrarModalEditar(){

    document.getElementById(
        "modalEditar"
    ).style.display = "none";

    document.getElementById(
        "overlay"
    ).style.display = "none";

}

/* =========================
   ACTUALIZAR
========================= */

document.getElementById(

    "btnActualizar"

).addEventListener(

    "click",

    async () => {

        try{

            const id =
            document.getElementById(
                "editId"
            ).value;

            const saldo =
            document.getElementById(
                "editSaldo"
            ).value;

            const mes =
            document.getElementById(
                "editMes"
            ).value;

            const anio =
            document.getElementById(
                "editAnio"
            ).value;

            const pdf =
            document.getElementById(
                "editPDF"
            ).files[0];

            const formData =
            new FormData();

            formData.append(
                "saldo_mensual",
                saldo
            );

            formData.append(
                "mes",
                mes
            );

            formData.append(
                "anio",
                anio
            );

            if(pdf){

                formData.append(
                    "oficio",
                    pdf
                );

            }

            const respuesta =
            await fetch(

                `${API}/api/presupuestos/editar/${id}`,

                {

                    method:"PUT",

                    body:formData

                }

            );

            const data =
            await respuesta.json();

            if(data.ok){

                alert(
                    "Registro actualizado"
                );

                cerrarModalEditar();

                cargarHistorial();

            }

            else{

                alert(
                    data.msg ||
                    "Error actualizando"
                );

            }

        }

        catch(error){

            console.log(error);

            alert(
                "Error servidor"
            );

        }

    }

);

/* =========================
   CAMBIO ÁREA
========================= */

document.getElementById(

    "selectArea"

).addEventListener(

    "change",

    cargarHistorial

);

/* =========================
   INIT
========================= */

cargarHistorial();