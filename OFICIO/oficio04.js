/* =========================
   URL APPS SCRIPT OFICIO 2
========================= */

const API_OFICIO2 =

"https://script.google.com/macros/s/AKfycbwZiIRW6THEl-i6zoN2ZZsSOZ1YO4El0IFMoZUsjKHM3vYefvrFvlKcYWnOmL5uUHvl/exec";

/* =========================
   VALIDAR CAMPOS OFICIO 2
========================= */
function transformarNombreArchivo(nombreArchivo) {
    if (!nombreArchivo) return "";
    const sinExtension = nombreArchivo.replace(/\.[^/.]+$/, "");
    return sinExtension.replace(/ /g, "/");
}

function validarCamposOficio2(){

    let error = false;

    const camposRequeridos = [

        "oficio2Numc"

    ];

    camposRequeridos.forEach(id=>{

        const campo =
        document.getElementById(id);

        if(!campo){

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
   ABRIR MODAL OFICIO 2
========================= */

async function abrirModalOficio2(codigo){

    try{

        codigoOficio2 = codigo;

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
            "REGISTRO OFICIO2:",
            registro
        );

        /* =========================
           LIMPIAR ERRORES
        ========================= */

        document
        .querySelectorAll(
            "#modalOficio2 input, #modalOficio2 select"
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

        const total =
        Number(
            registro.spg_total || 0
        );

        /* =========================
           OBTENER OFICIOS
        ========================= */

        let oficioAutorizacion = "";
        let oficioAdecuacion = "";

        try{

            const responseOficio =
            await fetch(

                `${API}/api/presupuestos/ultimo-oficio/4`

            );

            if(!responseOficio.ok){

                throw new Error(
                    "Error obteniendo oficios"
                );

            }

            const dataOficio =
            await responseOficio.json();

            console.log(
                "ÚLTIMO OFICIO:",
                dataOficio
            );

            if(dataOficio.ok){

                oficioAutorizacion =

                (
                    dataOficio
                    .oficio_autorizacion_nombre || ""
                )
                .replace(/\.pdf$/i, "");

                oficioAdecuacion =

                (
                    dataOficio
                    .oficio_adecuacion_nombre || ""
                )
                .replace(/\.pdf$/i, "");

            }

        }

        catch(error){

            console.error(
                "ERROR CARGANDO OFICIOS:",
                error
            );

        }
        /* =========================
           LLENAR CAMPOS
        ========================= */

        document.getElementById(
            "oficio2Numc"
        ).value =
        "";

        document.getElementById(
            "oficio2Persona"
        ).value =
        registro.persona || "";

        document.getElementById(
            "oficio2Municipio"
        ).value =
        registro.municipio || "";

        document.getElementById(
            "oficio2Dias"
        ).value =
        dias;

        document.getElementById(
            "oficio2Mes"
        ).value =
        registro.mes || "";

        document.getElementById(
            "oficio2Anio"
        ).value =
        new Date(
            registro.fecha || Date.now()
        ).getFullYear();

        /* =========================
           CARGAR CATÁLOGOS
        ========================= */

        if(
            document.getElementById(
                "oficio2Proyecto"
            )
        ){
            llenarSelectAutomatico(
                "oficio2Proyecto",
                catalogoProyecto
            );
        }

        if(
            document.getElementById(
                "oficio2NombreProyecto"
            )
        ){
            llenarSelectAutomatico(
                "oficio2NombreProyecto",
                catalogoNombreProyecto
            );
        }

        /* =========================
           ASIGNAR VALORES
        ========================= */

        document.getElementById(
            "oficio2Proyecto"
        ).value =
        registro.proyecto ||
        catalogoProyecto[0] ||
        "";

        document.getElementById(
            "oficio2NombreProyecto"
        ).value =
        registro.nombre_proyecto ||
        catalogoNombreProyecto[0] ||
        "";

        const campoFecha =
        document.getElementById(
            "oficio2Fecha"
        );

        if(campoFecha){

            campoFecha.value =
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

        }

        document.getElementById("oficio2Ofaut").value      = transformarNombreArchivo(oficioAutorizacion);
        document.getElementById("oficio2OficioAdec").value  = transformarNombreArchivo(oficioAdecuacion);

        document.getElementById(
            "oficio2Adec"
        ).value =
        registro.cuenta || "0";

        document.getElementById(
            "oficio2Monto"
        ).value =
        formatearMoneda(
            registro.spg_monto || 0
        );

        document.getElementById(
            "oficio2Retenciones"
        ).value =
        formatearMoneda(
            registro.spg_retenciones || 0
        );

        document.getElementById(
            "oficio2Total"
        ).value =
        formatearMoneda(total);

        document.getElementById(
            "oficio2TotalLetra"
        ).value =
        numeroALetras(total);

        /* =========================
           BLOQUEAR CAMPOS
        ========================= */

        const camposBloqueados = [

            "oficio2Persona",
            "oficio2Municipio",
            "oficio2Dias",
            "oficio2Mes",
            "oficio2Anio",
            "oficio2Ofaut",
            "oficio2OficioAdec",
            "oficio2Adec",
            "oficio2Monto",
            "oficio2Retenciones",
            "oficio2Total",
            "oficio2TotalLetra"

        ];

        camposBloqueados.forEach(id=>{

            const campo =
            document.getElementById(id);

            if(campo){

                campo.readOnly = true;

            }

        });

        abrirModal(
            "modalOficio2"
        );

    }

    catch(error){

        console.error(
            "ERROR ABRIENDO OFICIO2:",
            error
        );

        alert(
            error.message
        );

    }

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

                "<<NUMC>>":

                document.getElementById(
                    "oficio2Numc"
                ).value,

                "<<NOMBRE>>":

                document.getElementById(
                    "oficio2Persona"
                ).value,

                "<<MUNICIPIO>>":

                document.getElementById(
                    "oficio2Municipio"
                ).value,

                "<<DIAS>>":
                desglosarDiasPDF(

                    document.getElementById(
                        "reciboDias"
                    ).value.split(/,?\s+y\s+|,\s*/)[0],

                    document.getElementById(
                        "reciboDias"
                    ).value.split(/,?\s+y\s+|,\s*/).pop()

                ),

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

                "<<FECHA>>":

                document.getElementById(
                    "oficio2Fecha"
                ).value,

                "<<OFAUT>>":

                document.getElementById(
                    "oficio2Ofaut"
                ).value,

                "<<OFADEC>>":

                document.getElementById(
                    "oficio2OficioAdec"
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

        /* =========================
           CARGAR CATÁLOGOS
        ========================= */

        const proyectoSelect =
        document.getElementById(
            "oficio2Proyecto"
        );

        const nombreProyectoSelect =
        document.getElementById(
            "oficio2NombreProyecto"
        );

        if(proyectoSelect){

            llenarSelectAutomatico(

                "oficio2Proyecto",
                catalogoProyecto

            );

            proyectoSelect.value =
            catalogoProyecto[0] || "";

        }

        if(nombreProyectoSelect){

            llenarSelectAutomatico(

                "oficio2NombreProyecto",
                catalogoNombreProyecto

            );

            nombreProyectoSelect.value =
            catalogoNombreProyecto[0] || "";

        }

        console.log(
            "PROYECTO CARGADO:",
            proyectoSelect?.value
        );

        console.log(
            "NOMBRE PROYECTO CARGADO:",
            nombreProyectoSelect?.value
        );

        /* =========================
           BOTÓN GENERAR
        ========================= */

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

        /* =========================
           LIMPIAR ERRORES
        ========================= */

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