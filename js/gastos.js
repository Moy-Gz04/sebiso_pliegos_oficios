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
   CARGAR REGISTROS
========================= */

async function cargarRegistros(){

    try{

        const area =
        selectArea.value;

        /* =========================
           REGISTROS
        ========================= */

        const respuesta =
        await fetch(

            `${API}/api/gastos/${area}`

        );

        const data =
        await respuesta.json();

        /* =========================
           PRESUPUESTOS
        ========================= */

        const presupuestoRespuesta =
        await fetch(

            `${API}/api/presupuestos/${area}`

        );

        const presupuestos =
        await presupuestoRespuesta.json();

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

        tbody.innerHTML = "";

        data.forEach((registro) => {

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

                    <td>

                        <input
                            type="number"
                            class="input-cantidad"
                            id="cantidad-${registro.id}"
                            placeholder="$0.00"
                        >

                    </td>

                    <td>

                        <button
                            class="btn-pagar"
                            onclick="pagarRegistro(${registro.id})"
                        >

                            PAGAR

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
   PAGAR
========================= */

async function pagarRegistro(id){

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

        if(data.ok){

            alert(
                "Pago registrado"
            );

            cargarRegistros();

        }

        else{

            alert(

                data.msg ||

                "Error registrando pago"

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