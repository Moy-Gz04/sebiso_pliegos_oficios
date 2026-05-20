/* =========================
   VARIABLES
========================= */

let codigoRecibo = null;

/* =========================
   URL APPS SCRIPT
========================= */

const API_RECIBO =

"https://script.google.com/macros/s/AKfycbwLGOlf7EqP6OQEuFKrwCggNvSSM9hzaK6jk8nB83BvAs9Lbvhqv5ypzbw7TT84yoO_/exec";

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

            `${API}/api/registros/UP-01`

        );

        if(!response.ok){

            throw new Error(
                "Error obteniendo registros"
            );

        }

        const registros =
        await response.json();

        const registro =
        registros.find(

            r => r.codigo === codigo

        );

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
           LLENAR CAMPOS
        ========================= */

        document.getElementById(
            "reciboFolio"
        ).value =
        registro.codigo || "";

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
        registro.spg_monto || "";

        document.getElementById(
            "reciboRetenciones"
        ).value =
        registro.spg_retenciones || "";

        document.getElementById(
            "reciboTotal"
        ).value =
        registro.spg_total || "";

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

        const btn =
        document.getElementById(
            "btnGenerarRecibo"
        );

        btn.disabled = true;

        btn.textContent =
        "Generando...";

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

                document.getElementById(
                    "reciboUnidad"
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

        const response =
        await fetch(

            API_RECIBO,

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:JSON.stringify(
                    payload
                )

            }

        );

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

        catch{

            throw new Error(

                "Apps Script no devolvió JSON válido"

            );

        }

        console.log(
            "RESPUESTA JSON RECIBO:",
            data
        );

        if(

            !data.ok
            ||
            !data.url

        ){

            throw new Error(

                data.error ||

                "Error generando recibo"

            );

        }

        /* =========================
           GUARDAR URL
        ========================= */

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

        const respuestaGuardar =
        await guardar.json();

        console.log(
            "RESPUESTA GUARDAR RECIBO:",
            respuestaGuardar
        );

        if(!guardar.ok){

            throw new Error(

                respuestaGuardar.error ||

                "Error guardando recibo"

            );

        }

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
   EVENTO BOTÓN
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

    }

);