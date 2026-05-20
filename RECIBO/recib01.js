/* =========================
   VARIABLES
========================= */

let codigoRecibo = null;

/* =========================
   URL APPS SCRIPT
========================= */

const API_RECIBO =

"https://script.google.com/macros/s/AKfycbwSPur5nDeMdOHEyvDO08utsOTaQb-BdVQKxZK1fYvNVJ2lBSnqDQA-7lSpF4uAbmKi/exec";

/* =========================
   DESGLOSAR DÍAS
========================= */

function desglosarDias(inicio, fin){

    inicio = parseInt(inicio);

    fin = parseInt(fin);

    if(isNaN(inicio) || isNaN(fin)){

        return "";

    }

    if(inicio === fin){

        return `${inicio}`;

    }

    const dias = [];

    for(let i = inicio; i <= fin; i++){

        dias.push(i);

    }

    if(dias.length === 2){

        return `${dias[0]} y ${dias[1]}`;

    }

    return `

        ${dias.slice(0,-1).join(', ')}
        y
        ${dias[dias.length - 1]}

    `

    .replace(/\s+/g,' ')
    .trim();

}

/* =========================
   VALIDAR CAMPOS
========================= */

function validarCamposRecibo(){

    let error = false;

    document
    .querySelectorAll(

        "#modalRecibo input, #modalRecibo select"

    )
    .forEach(campo=>{

        /* =========================
           IGNORAR READONLY
        ========================= */

        if(

            campo.hasAttribute("readonly")

        ){

            campo.classList.remove(
                "input-error"
            );

            return;

        }

        /* =========================
           VALIDAR VACÍOS
        ========================= */

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
   ABRIR MODAL RECIBO
========================= */

async function abrirModalRecibo(codigo){

    try{

        codigoRecibo = codigo;

        /* =========================
           OBTENER REGISTRO
        ========================= */

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
            "REGISTRO RECIBO:",
            registro
        );

        /* =========================
           LIMPIAR ERRORES
        ========================= */

        document
        .querySelectorAll(
            "#modalRecibo input, #modalRecibo select"
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
            "reciboFolio"
        ).value =
        "";

        document.getElementById(
            "reciboTipo"
        ).value =
        "RECIBO";

        document.getElementById(
            "reciboPersona"
        ).value =
        registro.persona || "";

        document.getElementById(
            "reciboMunicipio"
        ).value =
        registro.municipio || "";

        document.getElementById(
            "reciboMotivo"
        ).value =
        registro.motivo_comision || "";

        document.getElementById(
            "reciboLocalidades"
        ).value =
        registro.localidades_visitadas || "";

        document.getElementById(
            "reciboDias"
        ).value =
        desglosarDias(

            registro.dia_inicio,

            registro.dia_fin

        );

        document.getElementById(
            "reciboMes"
        ).value =
        registro.mes || "";

        document.getElementById(
            "reciboAnio"
        ).value =
        registro.anio || "";

        document.getElementById(
            "reciboUnidad"
        ).value =
        registro.up || "";

        /* =========================
           SPG
        ========================= */

        document.getElementById(
            "reciboImporte"
        ).value =
        registro.spg_monto || "0";

        document.getElementById(
            "reciboRetenciones"
        ).value =
        registro.spg_retenciones || "0";

        document.getElementById(
            "reciboTotal"
        ).value =
        registro.spg_total || "0";

        abrirModal(
            "modalRecibo"
        );

    }

    catch(error){

        console.error(
            "ERROR ABRIENDO RECIBO:",
            error
        );

        alert(
            error.message
        );

    }

}

/* =========================
   GENERAR RECIBO
========================= */

async function generarRecibo(){

    try{

        /* =========================
           BOTÓN
        ========================= */

        const btn =
        document.getElementById(
            "btnGenerarRecibo"
        );

        btn.disabled = true;

        btn.textContent =
        "Generando...";

        /* =========================
           VALIDAR
        ========================= */

        const valido =
        validarCamposRecibo();

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
            codigoRecibo,

            fileName:
            `RECIBO_${codigoRecibo}`,

            variables:{

                "<<UNIDADP>>":

                "01",

                "<<R/F>>":

                document.getElementById(
                    "reciboTipo"
                ).value,

                "<<FOLIO>>":

                document.getElementById(
                    "reciboFolio"
                ).value,

                "<<MONTO>>":

                document.getElementById(
                    "reciboImporte"
                ).value,

                "<<RET>>":

                document.getElementById(
                    "reciboRetenciones"
                ).value,

                "<<TOTAL>>":

                document.getElementById(
                    "reciboTotal"
                ).value,

                "<<NOMBRE>>":

                document.getElementById(
                    "reciboPersona"
                ).value,

                "<<MOTIVO>>":

                document.getElementById(
                    "reciboMotivo"
                ).value,

                "<<LOCALIDAD>>":

                document.getElementById(
                    "reciboLocalidades"
                ).value,

                "<<MUNICIPIO>>":

                document.getElementById(
                    "reciboMunicipio"
                ).value,

                "<<DIAS>>":

                document.getElementById(
                    "reciboDias"
                ).value,

                "<<MES>>":

                document.getElementById(
                    "reciboMes"
                ).value,

                "<<ANIO>>":

                document.getElementById(
                    "reciboAnio"
                ).value

            }

        };

        console.log(
            "PAYLOAD RECIBO:",
            payload
        );

        /* =========================
           FETCH APPS SCRIPT
        ========================= */

        console.log(
            "ENVIANDO A APPS SCRIPT..."
        );

        const response =
        await fetch(

            API_RECIBO,

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

        /* =========================
           RESPUESTA RAW
        ========================= */

        const text =
        await response.text();

        console.log(
            "RESPUESTA RAW RECIBO:",
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
            "RESPUESTA JSON RECIBO:",
            data
        );

        /* =========================
           VALIDAR RESPUESTA
        ========================= */

        if(

            !data.ok
            ||
            !data.url

        ){

            throw new Error(

                data.error ||

                "No se pudo generar el PDF"

            );

        }

        /* =========================
           GUARDAR URL
        ========================= */

        console.log(
            "GUARDANDO RECIBO..."
        );

        const guardar =
        await fetch(

            `${API}/api/registros/recibo/${codigoRecibo}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:JSON.stringify({

                    recibo_pdf:
                    data.url

                })

            }

        );

        const guardarText =
        await guardar.text();

        console.log(
            "RESPUESTA GUARDAR:",
            guardarText
        );

        if(!guardar.ok){

            throw new Error(
                "Error guardando recibo"
            );

        }

        /* =========================
           FINAL
        ========================= */

        cerrarModal(
            "modalRecibo"
        );

        alert(
            "Recibo generado correctamente"
        );

        cargarRegistros();

    }

    catch(error){

        console.error(
            "ERROR RECIBO:",
            error
        );

        alert(
            error.message
        );

    }

    finally{

        const btn =
        document.getElementById(
            "btnGenerarRecibo"
        );

        btn.disabled = false;

        btn.textContent =
        "Generar Recibo";

    }

}

/* =========================
   LIMPIAR ERROR INPUT
========================= */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        const btn =
        document.getElementById(
            "btnGenerarRecibo"
        );

        if(btn){

            btn.addEventListener(

                "click",

                generarRecibo

            );

        }

        document
        .querySelectorAll(

            "#modalRecibo input, #modalRecibo select"

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