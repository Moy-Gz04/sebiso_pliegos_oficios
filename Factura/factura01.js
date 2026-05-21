/* =========================
   URL APPS SCRIPT FACTURA
========================= */

const API_FACTURA =

"https://script.google.com/macros/s/AKfycbzQgaTKRcjb5czQ2hecPl-YA6MF3hCEMqB9Nvv7VcjvjfXR2J9qEqBEJcArK63ZpMIJ/exec";

/* =========================
   VALIDAR CAMPOS FACTURA
========================= */

function validarCamposFactura(){

    let error = false;

    document
    .querySelectorAll(

        "#modalFactura input, #modalFactura select"

    )
    .forEach(campo=>{

        if(

            campo.hasAttribute("readonly")

        ){

            campo.classList.remove(
                "input-error"
            );

            return;

        }

        if(

            !campo.value.trim()

        ){

            campo.classList.add(
                "input-error"
            );

            error = true;

        }

        else{

            campo.classList.remove(
                "input-error"
            );

        }

    });

    return !error;

}

/* =========================
   ABRIR MODAL FACTURA
========================= */

async function abrirModalFactura(codigo){

    try{

        codigoFactura = codigo;

        const response =
        await fetch(

            `${API}/api/registros/codigo/${codigo}`

        );

        if(!response.ok){

            throw new Error(
                "Error obteniendo registro"
            );

        }

        const registro =
        await response.json();

        if(!registro){

            throw new Error(
                "Registro no encontrado"
            );

        }

        console.log(
            "REGISTRO FACTURA:",
            registro
        );

        document
        .querySelectorAll(
            "#modalFactura input, #modalFactura select"
        )
        .forEach(campo=>{

            campo.classList.remove(
                "input-error"
            );

        });

        /* =========================
           LLENAR CAMPOS
        ========================= */

        document.getElementById(
            "facturaFolio"
        ).value =
        "";

        document.getElementById(
            "facturaPersona"
        ).value =
        registro.persona || "";

        document.getElementById(
            "facturaMunicipio"
        ).value =
        registro.municipio || "";

        document.getElementById(
            "facturaMotivo"
        ).value =
        registro.motivo_comision || "";

        document.getElementById(
            "facturaImporte"
        ).value =
        formatearMoneda(
            registro.spg_monto || 0
        );

        document.getElementById(
            "facturaRetenciones"
        ).value =
        formatearMoneda(
            registro.spg_retenciones || 0
        );

        document.getElementById(
            "facturaTotal"
        ).value =
        formatearMoneda(
            registro.spg_total || 0
        );

        abrirModal(
            "modalFactura"
        );

    }

    catch(error){

        console.error(
            "ERROR ABRIENDO FACTURA:",
            error
        );

        alert(
            error.message
        );

    }

}

/* =========================
   GENERAR FACTURA
========================= */

async function generarFactura(){

    try{

        const btn =
        document.getElementById(
            "btnGenerarFactura"
        );

        btn.disabled = true;

        btn.textContent =
        "Generando...";

        const valido =
        validarCamposFactura();

        if(!valido){

            throw new Error(
                "Completa los campos requeridos"
            );

        }

        /* =========================
           PAYLOAD
        ========================= */

        const payload = {

            codigo:
            codigoFactura,

            fileName:
            `FACTURA_${codigoFactura}`,

            variables:{

                "<<FOLIO>>":

                document.getElementById(
                    "facturaFolio"
                ).value,

                "<<NOMBRE>>":

                document.getElementById(
                    "facturaPersona"
                ).value,

                "<<MUNICIPIO>>":

                document.getElementById(
                    "facturaMunicipio"
                ).value,

                "<<MOTIVO>>":

                document.getElementById(
                    "facturaMotivo"
                ).value,

                "<<MONTO>>":

                document.getElementById(
                    "facturaImporte"
                ).value,

                "<<RET>>":

                document.getElementById(
                    "facturaRetenciones"
                ).value,

                "<<TOTAL>>":

                document.getElementById(
                    "facturaTotal"
                ).value

            }

        };

        console.log(
            "PAYLOAD FACTURA:",
            payload
        );

        /* =========================
           FETCH APPS SCRIPT
        ========================= */

        const response =
        await fetch(

            API_FACTURA,

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "text/plain"

                },

                body:JSON.stringify(
                    payload
                )

            }

        );

        const text =
        await response.text();

        console.log(
            "RESPUESTA RAW FACTURA:",
            text
        );

        let data;

        try{

            data =
            JSON.parse(text);

        }

        catch(error){

            console.error(
                "ERROR PARSE JSON:",
                error
            );

            throw new Error(

                "Apps Script no devolvió JSON válido"

            );

        }

        console.log(
            "RESPUESTA JSON FACTURA:",
            data
        );

        if(

            !data.ok
            ||
            !data.url

        ){

            throw new Error(

                data.error ||

                "No se pudo generar la factura"

            );

        }

        /* =========================
           GUARDAR URL
        ========================= */

        const guardar =
        await fetch(

            `${API}/api/registros/factura/${codigoFactura}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:JSON.stringify({

                    factura_pdf:
                    data.url

                })

            }

        );

        if(!guardar.ok){

            throw new Error(
                "Error guardando factura"
            );

        }

        cerrarModal(
            "modalCargandoFactura"
        );

        cerrarModal(
            "modalConfirmarFactura"
        );

        cerrarModal(
            "modalFactura"
        );

        abrirModal(
            "modalExitoFactura"
        );

        cargarRegistros();

    }

    catch(error){

        console.error(
            "ERROR FACTURA:",
            error
        );

        alert(
            error.message
        );

    }

    finally{

        const btn =
        document.getElementById(
            "btnGenerarFactura"
        );

        btn.disabled = false;

        btn.textContent =
        "Generar Factura";

    }

}

/* =========================
   INIT FACTURA
========================= */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        const btn =
        document.getElementById(
            "btnGenerarFactura"
        );

        if(btn){

            btn.addEventListener(

                "click",

                generarFactura

            );

        }

        document
        .querySelectorAll(

            "#modalFactura input, #modalFactura select"

        )
        .forEach(campo=>{

            campo.addEventListener(

                "input",

                ()=>{

                    if(

                        campo.value.trim()

                    ){

                        campo.classList.remove(
                            "input-error"
                        );

                    }

                }

            );

            campo.addEventListener(

                "change",

                ()=>{

                    if(

                        campo.value.trim()

                    ){

                        campo.classList.remove(
                            "input-error"
                        );

                    }

                }

            );

        });

    }

);