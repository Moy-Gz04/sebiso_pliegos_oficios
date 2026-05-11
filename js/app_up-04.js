const formulario =
document.getElementById("formulario");

const boton =
document.getElementById("btnEnviar");

const estado =
document.getElementById("estado");

const loader =
document.getElementById("loader");

const tabla =
document.getElementById("tablaResultados");

const tbody =
document.getElementById("tbodyResultados");

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
   BOTÓN GENERAR
========================= */

boton.addEventListener(

    "click",

    function(){

        const seleccionados =
        document.querySelectorAll(
            'input[name="seleccionados"]:checked'
        );

        if(seleccionados.length === 0){

            alert(
                "Selecciona al menos una persona"
            );

            return;

        }

        abrirModal(
            "modalConfirmacion"
        );

    }

);

/* =========================
   CONFIRMAR GENERACIÓN
========================= */

const btnConfirmar =
document.getElementById(
    "confirmarGeneracion"
);

btnConfirmar.addEventListener(

    "click",

    async function(){

        cerrarModal(
            "modalConfirmacion"
        );

        abrirModal(
            "modalCarga"
        );

        boton.disabled = true;

        loader.style.display = "block";

        estado.innerText =
        "Generando PDFs...";

        tbody.innerHTML = "";

        try{

            const formData =
            new FormData(formulario);

            /* =========================
               APPS SCRIPT
            ========================= */

            const response =
            await fetch(

                formulario.action,

                {

                    method:"POST",

                    body:formData

                }

            );

            const data =
            await response.json();

            console.log(
                'RESPUESTA APPS SCRIPT:',
                data
            );

            if(!data.success){

                throw new Error(
                    data.error
                );

            }

            tabla.style.display =
            "table";

            /* =========================
               RECORRER RESULTADOS
            ========================= */

            for(const item of data.resultados){

                const consecutivo =
                String(Date.now())
                .slice(-4);

                const idGenerado =
                `UP-04_R-${consecutivo}`;

                const nuevoRegistro = {

                    id:idGenerado,

                    nombre:item.nombre,

                    oficio:item.oficio,

                    pliego:item.pliego,

                    fecha:new Date()
                    .toLocaleString()

                };

                console.log(
                    'ENVIANDO A POSTGRESQL:',
                    nuevoRegistro
                );

                /* =========================
                   INSERT POSTGRESQL
                ========================= */

                const respuestaDB =
                await fetch(

                    'http://localhost:3000/api/registros',

                    {

                        method:'POST',

                        headers:{
                            'Content-Type':
                            'application/json'
                        },

                        body:JSON.stringify({

                            codigo:
                            nuevoRegistro.id,

                            area:'UP-04',

                            persona:
                            item.nombre,

                            oficio_pdf:
                            item.oficio,

                            pliego_pdf:
                            item.pliego

                        })

                    }

                );

                console.log(
                    'RESPUESTA DB:',
                    respuestaDB.status
                );

                if(!respuestaDB.ok){

                    throw new Error(
                        'Error guardando en PostgreSQL'
                    );

                }

                /* =========================
                   TABLA
                ========================= */

                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${nuevoRegistro.id}
                        </td>

                        <td>
                            ${item.nombre}
                        </td>

                        <td>
                            ${nuevoRegistro.fecha}
                        </td>

                        <td>

                            <a
                                href="${item.oficio}"
                                target="_blank">

                                Ver Oficio

                            </a>

                        </td>

                        <td>

                            <a
                                href="${item.pliego}"
                                target="_blank">

                                Ver Pliego

                            </a>

                        </td>

                    </tr>

                `;

            }

            cerrarModal(
                "modalCarga"
            );

            abrirModal(
                "modalExito"
            );

            estado.innerText =
            "PDFs generados correctamente";

        }

        catch(error){

            console.error(
                'ERROR GENERAL:',
                error
            );

            cerrarModal(
                "modalCarga"
            );

            alert(
                error.message
            );

        }

        loader.style.display =
        "none";

        boton.disabled = false;

    }

);