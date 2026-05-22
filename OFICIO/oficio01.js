/* =========================
   URL APPS SCRIPT OFICIO 2
========================= */

const API_OFICIO2 =

"https://script.google.com/macros/s/AKfycbyIat6ZY_-OANmzObONC05-5mhbqQVympYcD4-XGr8wWtcJXCz5DEwOPKqTVicSm2LQ/exec";

/* =========================
   VALIDAR CAMPOS OFICIO 2
========================= */

function validarCamposOficio2(){

    let error = false;

    document
    .querySelectorAll(

        "#modalOficio2 input, #modalOficio2 select"

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
   GENERAR OFICIO 2
========================= */

async function generarOficio2(){

    try{

        const btn =
        document.getElementById(
            "btnGenerarOficio2"
        );

        if(btn){

            btn.disabled = true;

            btn.textContent =
            "Generando...";

        }

        const valido =
        validarCamposOficio2();

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
            codigoOficio2,

            fileName:
            `OFICIO2_${codigoOficio2}`,

            folderId:
            "1u3x753D7ICw8P2_k40vp9-IrJMfzzj8d",

            variables:{

                "<<NOMBRE>>":

                document.getElementById(
                    "oficio2Persona"
                ).value,

                "<<MUNICIPIO>>":

                document.getElementById(
                    "oficio2Municipio"
                ).value,

                "<<DIAS>>":

                document.getElementById(
                    "oficio2Dias"
                ).value,

                "<<MES>>":

                document.getElementById(
                    "oficio2Mes"
                ).value,

                "<<ANIO>>":

                document.getElementById(
                    "oficio2Anio"
                ).value,

                "<<PROY>>":

                document.getElementById(
                    "oficio2Proyecto"
                ).value,

                "<<NOMPROY>>":

                document.getElementById(
                    "oficio2NombreProyecto"
                ).value,

                "<<OFAUT>>":

                document.getElementById(
                    "oficio2Ofaut"
                ).value,

                "<<ADEC>>":

                document.getElementById(
                    "oficio2Adec"
                ).value,

                "<<MONT>>":

                document.getElementById(
                    "oficio2Monto"
                ).value,

                "<<RET>>":

                document.getElementById(
                    "oficio2Retenciones"
                ).value,

                "<<TOT>>":

                document.getElementById(
                    "oficio2Total"
                ).value,

                "<<TOTAL>>":

                document.getElementById(
                    "oficio2TotalLetra"
                ).value

            }

        };

        console.log(
            "PAYLOAD OFICIO2:",
            payload
        );

        /* =========================
           FETCH APPS SCRIPT
        ========================= */

        const response =
        await fetch(

            API_OFICIO2,

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
            "RESPUESTA RAW OFICIO2:",
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
            "RESPUESTA JSON OFICIO2:",
            data
        );

        if(

            !data.ok
            ||
            !data.url

        ){

            throw new Error(

                data.error ||

                "No se pudo generar Oficio 2"

            );

        }

        /* =========================
           GUARDAR URL
        ========================= */

        const guardar =
        await fetch(

            `${API}/api/registros/oficio2/${codigoOficio2}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:JSON.stringify({

                    oficio2_pdf:
                    data.url

                })

            }

        );

        if(!guardar.ok){

            throw new Error(
                "Error guardando Oficio 2"
            );

        }

        cerrarModal(
            "modalCargandoOficio2"
        );

        cerrarModal(
            "modalConfirmarOficio2"
        );

        cerrarModal(
            "modalOficio2"
        );

        abrirModal(
            "modalExitoOficio2"
        );

        cargarRegistros();

    }

    catch(error){

        console.error(
            "ERROR OFICIO2:",
            error
        );

        alert(
            error.message
        );

    }

    finally{

        const btn =
        document.getElementById(
            "btnGenerarOficio2"
        );

        if(btn){

            btn.disabled = false;

            btn.textContent =
            "Generar Oficio 2";

        }

    }

}

/* =========================
   INIT OFICIO 2
========================= */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        const btn =
        document.getElementById(
            "btnGenerarOficio2"
        );

        if(btn){

            btn.addEventListener(

                "click",

                generarOficio2

            );

        }

        document
        .querySelectorAll(

            "#modalOficio2 input, #modalOficio2 select"

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