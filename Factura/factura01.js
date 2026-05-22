/* =========================
   URL APPS SCRIPT FACTURA
========================= */

const API_FACTURA =

"https://script.google.com/macros/s/AKfycbzQgaTKRcjb5czQ2hecPl-YA6MF3hCEMqB9Nvv7VcjvjfXR2J9qEqBEJcArK63ZpMIJ/exec";

/* =========================
   NUMERO A LETRAS
========================= */

function numeroALetras(numero){

    numero = Number(numero);

    if(isNaN(numero)){

        return "";

    }

    return `${numero.toFixed(2)} PESOS 00/100 M.N.`;

}

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

        /* =========================
           LIMPIAR ERRORES
        ========================= */

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
           DATOS CALCULADOS
        ========================= */

        const dias =
        desglosarDias(

            registro.dia_inicio,

            registro.dia_fin

        ) || "";

        const localidad =
        registro.localidades_visitadas || "";

        const mes =
        registro.mes || "";

        const total =
        Number(
            registro.spg_total || 0
        );

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
            "facturaLocalidad"
        ).value =
        localidad;

        document.getElementById(
            "facturaDias"
        ).value =
        dias;

        document.getElementById(
            "facturaMes"
        ).value =
        mes;

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
        formatearMoneda(total);

        document.getElementById(
            "facturaTotalLetra"
        ).value =
        numeroALetras(total);

        /* =========================
           DATOS FACTURA
        ========================= */

        document.getElementById(
            "facturaProyecto"
        ).value =
        registro.proyecto || "AI005";

        document.getElementById(
            "facturaNombreProyecto"
        ).value =
        "Atención Integral 005";

        document.getElementById(
            "facturaOficio"
        ).value =
        registro.codigo || "";

        document.getElementById(
            "facturaAdecuacion"
        ).value =
        registro.cuenta || "ADEC-001";

        document.getElementById(
            "facturaFecha"
        ).value =

        new Date(
            registro.fecha || Date.now()
        )
        .toLocaleDateString(

            "es-MX",

            {

                day:"numeric",
                month:"long",
                year:"numeric"

            }

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

                "<<LOCALIDAD>>":

                document.getElementById(
                    "facturaLocalidad"
                ).value,

                "<<DIAS>>":

                document.getElementById(
                    "facturaDias"
                ).value,

                "<<MES>>":

                document.getElementById(
                    "facturaMes"
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
                ).value,

                "<<TOTALLETRA>>":

                document.getElementById(
                    "facturaTotalLetra"
                ).value,

                "<<PROY>>":

                document.getElementById(
                    "facturaProyecto"
                ).value,

                "<<NOMPROY>>":

                document.getElementById(
                    "facturaNombreProyecto"
                ).value,

                "<<OFAUT>>":

                document.getElementById(
                    "facturaOficio"
                ).value,

                "<<ADEC>>":

                document.getElementById(
                    "facturaAdecuacion"
                ).value,

                "<<FECHA>>":

                document.getElementById(
                    "facturaFecha"
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