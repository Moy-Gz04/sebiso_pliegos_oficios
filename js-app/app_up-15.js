
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


/* ============================================================
   MODALES
   Funciones reutilizables para abrir y cerrar cualquier
   modal del documento por su ID.
   ============================================================ */

/* Muestra el modal con el ID indicado */
function abrirModal(id){

    const modal =
    document.getElementById(id);

    if(modal){
        modal.style.display = "flex";
    }

}

/* Oculta el modal con el ID indicado */
function cerrarModal(id){

    const modal =
    document.getElementById(id);

    if(modal){
        modal.style.display = "none";
    }

}


/* ============================================================
   MODAL ADVERTENCIA
   Función auxiliar para mostrar el modal de advertencia
   con un mensaje personalizado. Reemplaza el alert() nativo
   del navegador en todos los casos.
   @param {string} mensaje - Texto a mostrar en el modal.
   ============================================================ */

function mostrarAdvertencia(mensaje){

    document.getElementById("mensajeAdvertencia")
    .innerText = mensaje;

    abrirModal("modalAdvertencia");

}


/* ============================================================
   BOTÓN GENERAR PLIEGOS
   Ejecuta dos validaciones antes de abrir el modal de
   confirmación:
     1. Que haya al menos una persona seleccionada
     2. Que los tres campos de texto estén completos
   Los selects no se validan porque siempre tienen valor
   por defecto al llenarse automáticamente desde el catálogo.
   ============================================================ */

boton.addEventListener(

    "click",

    function(){

        /* --- Validación 1: personas seleccionadas --- */

        const seleccionados =
        document.querySelectorAll(
            'input[name="seleccionados"]:checked'
        );

        if(seleccionados.length === 0){

            mostrarAdvertencia(
                "Selecciona al menos una persona."
            );

            return;

        }

        /* --- Validación 2: campos de texto obligatorios --- */

        const motivo =
        document.querySelector(
            'textarea[name="motivo"]'
        ).value.trim();

        const actividades =
        document.querySelector(
            'textarea[name="actividades"]'
        ).value.trim();

        const localidades =
        document.querySelector(
            'textarea[name="localidades"]'
        ).value.trim();

        if(!motivo){

            mostrarAdvertencia(
                "El campo MOTIVO DE LA COMISIÓN es obligatorio."
            );

            return;

        }

        if(!actividades){

            mostrarAdvertencia(
                "El campo REPORTE DE ACTIVIDADES es obligatorio."
            );

            return;

        }

        if(!localidades){

            mostrarAdvertencia(
                "El campo LOCALIDADES VISITADAS es obligatorio."
            );

            return;

        }

        /* --- Todo válido: abrir confirmación --- */

        abrirModal("modalConfirmacion");

    }

);


/* ============================================================
   CONFIRMAR GENERACIÓN
   Se ejecuta al aceptar el modal de confirmación.
   Flujo:
     1. Cierra confirmación y abre modal de carga
     2. Envía el formulario al Google Apps Script (POST)
     3. Por cada resultado, guarda el registro en PostgreSQL
     4. Renderiza los resultados en la tabla
     5. Muestra modal de éxito o modal de advertencia con error
   ============================================================ */

const btnConfirmar =
document.getElementById("confirmarGeneracion");

btnConfirmar.addEventListener(

    "click",

    async function(){

        /* --- UI: abrir carga, deshabilitar botón --- */

        cerrarModal("modalConfirmacion");
        abrirModal("modalCarga");

        boton.disabled = true;
        loader.style.display = "block";
        estado.innerText = "Generando PDFs...";
        tbody.innerHTML = "";

        try{

            const formData =
            new FormData(formulario);

            /* =========================
               DEBUG: log de datos enviados
            ========================= */

            console.log({
                municipio:             formData.get('municipio'),
                dia_inicio:            formData.get('diaInicio'),
                dia_fin:               formData.get('diaFin'),
                mes:                   formData.get('mes'),
                motivo_comision:       formData.get('motivo'),
                localidades_visitadas: formData.get('localidades')
            });

            /* =========================
               PASO 1: Envío a Google Apps Script
            ========================= */

            const response =
            await fetch(

                formulario.action,

                {
                    method: "POST",
                    body:   formData
                }

            );

            const data =
            await response.json();

            console.log('RESPUESTA APPS SCRIPT:', data);

            if(!data.success){
                throw new Error(data.error);
            }

            /* Mostrar tabla de resultados */
            tabla.style.display = "table";

            /* =========================
               PASO 2: Recorrer resultados y guardar en DB
            ========================= */

            for(const item of data.resultados){

                /* Generar ID único basado en timestamp */
                const consecutivo =
                String(Date.now()).slice(-4);

                const idGenerado =
                `UP-15_R-${consecutivo}`;

                const nuevoRegistro = {
                    id:     idGenerado,
                    nombre: item.nombre,
                    oficio: item.oficio,
                    pliego: item.pliego,
                    fecha:  new Date().toLocaleString()
                };

                console.log('ENVIANDO A POSTGRESQL:', nuevoRegistro);

                /* =========================
                   INSERT en PostgreSQL
                ========================= */

                const respuestaDB =
                await fetch(

                    'https://sebiso-pliegos-oficios-1.onrender.com/api/registros',

                    {
                        method: 'POST',

                        headers:{
                            'Content-Type': 'application/json'
                        },

                        body: JSON.stringify({
                            codigo:                nuevoRegistro.id,
                            area:                  'UP-15',
                            persona:               item.nombre,
                            oficio_pdf:            item.oficio,
                            pliego_pdf:            item.pliego,
                            municipio:             formData.get('municipio'),
                            dia_inicio:            formData.get('diaInicio'),
                            dia_fin:               formData.get('diaFin'),
                            mes:                   formData.get('mes'),
                            motivo_comision:       formData.get('motivo'),
                            localidades_visitadas: formData.get('localidades')
                        })
                    }

                );

                console.log('RESPUESTA DB:', respuestaDB.status);

                if(!respuestaDB.ok){

                    const errorDB =
                    await respuestaDB.text();

                    console.error(errorDB);

                    throw new Error(
                        'Error guardando en PostgreSQL'
                    );

                }

                /* =========================
                   PASO 3: Renderizar fila en tabla
                ========================= */

                tbody.innerHTML += `
                    <tr>
                        <td>${nuevoRegistro.id}</td>
                        <td>${item.nombre}</td>
                        <td>${nuevoRegistro.fecha}</td>
                        <td>
                            <a href="${item.oficio}" target="_blank">
                                Ver Oficio
                            </a>
                        </td>
                        <td>
                            <a href="${item.pliego}" target="_blank">
                                Ver Pliego
                            </a>
                        </td>
                    </tr>
                `;

            }

            /* --- UI: cerrar carga, abrir éxito --- */

            cerrarModal("modalCarga");
            abrirModal("modalExito");

            estado.innerText = "PDFs generados correctamente";

        }

        catch(error){

            console.error('ERROR GENERAL:', error);

            cerrarModal("modalCarga");

            /* Mostrar error en modal en lugar de alert nativo */
            mostrarAdvertencia(error.message);

        }

        /* --- UI: restaurar botón y ocultar loader --- */

        loader.style.display = "none";
        boton.disabled = false;

    }

);


/* ============================================================
   RESTRICCIÓN : TEXTAREA ACTIVIDADES
   Impide que el usuario escriba números o puntos en el
   campo "Reporte de Actividades".

   Se usan dos eventos complementarios:
     - keydown : bloquea la tecla antes de que se registre
     - input   : limpia cualquier caracter no permitido que
                 llegue por pegado (Ctrl+V) u otros métodos
   ============================================================ */

const textareaActividades =
document.querySelector('textarea[name="actividades"]');

/* Bloquear tecla al presionar */
textareaActividades.addEventListener("keydown", function(e){

    if(/[0-9.]/.test(e.key)){
        e.preventDefault();
    }

});

/* Limpiar si el contenido llega por pegado u otro método */
textareaActividades.addEventListener("input", function(){

    this.value =
    this.value.replace(/[0-9.]/g, "");

});