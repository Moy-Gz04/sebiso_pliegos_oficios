/* =========================
   GENERAR SPG
========================= */

async function generarSPG(){

    try{

        /* =========================
           BOTÓN
        ========================= */

        const btn =
        document.getElementById(
            "btnGenerarSPG"
        );

        btn.disabled = true;

        btn.textContent =
        "Generando...";

        /* =========================
           DATOS
        ========================= */

        const datos = {

            codigo:codigoSPG,

            persona:
            document.getElementById(
                "spgPersona"
            )?.value || "",

            anio:
            document.getElementById(
                "spgAnio"
            ).value,

            ur:
            document.getElementById(
                "spgUR"
            ).value,

            up:
            document.getElementById(
                "spgUP"
            ).value,

            rubro:
            document.getElementById(
                "spgR"
            ).value,

            og:
            document.getElementById(
                "spgOG"
            ).value,

            proyecto:
            document.getElementById(
                "spgPR"
            ).value,

            cuenta:
            document.getElementById(
                "spgCuenta"
            ).value,

            monto:
            document.getElementById(
                "spgMonto"
            ).value,

            retenciones:
            document.getElementById(
                "spgRet"
            ).value,

            total:
            document.getElementById(
                "spgTot"
            ).value

        };

        /* =========================
           VALIDAR
        ========================= */

        if(

            !datos.anio
            ||
            !datos.ur
            ||
            !datos.up
            ||
            !datos.rubro
            ||
            !datos.og
            ||
            !datos.proyecto
            ||
            !datos.cuenta

        ){

            throw new Error(

                "Completa todos los campos"

            );

        }

        /* =========================
           ENVIAR A APPS SCRIPT
        ========================= */

        const response =
        await fetch(

            "https://script.google.com/macros/s/AKfycbyRuZ4TI3wD5IRYMy2beCfjJe_XKuxgWcd7kidoPtBOEVo8B7jPdsH7r9qBtkfEvsIj2Q/exec",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:JSON.stringify({

                    templateId:

                    "12i3fS4Yl1iuNHvE4METg0N2-ThMjvhG-4FKiaGLYT1E",

                    folderId:

                    "174C_QuqWR0FqUSROY7yAhVRB2xKERiYt",

                    fileName:

                    `SPG_${datos.codigo}`,

                    variables:{

                        "<<PERSONA>>":
                        datos.persona,

                        "<<ANIO>>":
                        datos.anio,

                        "<<UR>>":
                        datos.ur,

                        "<<UP>>":
                        datos.up,

                        "<<R>>":
                        datos.rubro,

                        "<<OG>>":
                        datos.og,

                        "<<PR>>":
                        datos.proyecto,

                        "<<CUENTA>>":
                        datos.cuenta,

                        "<<MONT>>":
                        datos.monto,

                        "<<RET>>":
                        datos.retenciones,

                        "<<TOT>>":
                        datos.total

                    }

                })

            }

        );

        const data =
        await response.json();

        console.log(
            "RESPUESTA APPS SCRIPT:",
            data
        );

        if(

            !response.ok
            ||
            !data.url

        ){

            throw new Error(

                data.error ||

                "Error generando SPG"

            );

        }

        /* =========================
           GUARDAR URL PDF
        ========================= */

        const guardar =
        await fetch(

            `${API}/api/registros/spg/${codigoSPG}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:JSON.stringify({

                    spg_pdf:data.url

                })

            }

        );

        if(!guardar.ok){

            throw new Error(

                "Error guardando URL SPG"

            );

        }

        /* =========================
           CERRAR
        ========================= */

        cerrarModal(
            "modalSPG"
        );

        alert(
            "SPG generado correctamente"
        );

        cargarRegistros();

    }

    catch(error){

        console.error(
            "ERROR SPG:",
            error
        );

        alert(
            error.message
        );

    }

    finally{

        const btn =
        document.getElementById(
            "btnGenerarSPG"
        );

        btn.disabled = false;

        btn.textContent =
        "Generar SPG";

    }

}