const API =

"https://sebiso-pliegos-oficios-1.onrender.com";

/* =========================
   ELEMENTOS
========================= */

const btnGuardar =
document.getElementById(
    "btnGuardarPresupuesto"
);

const tbodyHistorial =
document.getElementById(
    "tbodyHistorial"
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

            /* =========================
               DEBUG
            ========================= */

            console.log(area);

            console.log(
                mapaAreas[area]
            );

            /* =========================
               VALIDACIONES
            ========================= */

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

            /* =========================
               FORM DATA
            ========================= */

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

            /* =========================
               FETCH
            ========================= */

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

            console.log(data);

            /* =========================
               RESPUESTA
            ========================= */

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

            /* =========================
               LIMPIAR
            ========================= */

            document.getElementById(
                "saldoMensual"
            ).value = "";

            document.getElementById(
                "oficioPDF"
            ).value = "";

            /* =========================
               RECARGAR HISTORIAL
            ========================= */

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

        const respuesta =
        await fetch(

            `${API}/api/presupuestos/${area}`

        );

        const data =
        await respuesta.json();

        console.log(data);

        tbodyHistorial.innerHTML = "";

        let ultimoSaldo = 0;

        data.forEach((registro) => {

            ultimoSaldo =
            registro.saldo_restante;

            tbodyHistorial.innerHTML += `

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

    }

    catch(error){

        console.log(error);

    }

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

function editarRegistro(id){

    alert(

        `Editar registro ID: ${id}`

    );

}

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