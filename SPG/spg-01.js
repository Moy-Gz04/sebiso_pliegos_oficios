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

        console.log(
            "DATOS SPG:",
            datos
        );

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
           PAYLOAD
        ========================= */

        const payload = {

            codigo:
            datos.codigo,

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

        };

        console.log(
            "PAYLOAD:",
            payload
        );

        /* =========================
           FETCH
        ========================= */

        const response =
        await fetch(

            "https://script.google.com/macros/s/AKfycbwiS2bqwgWwbmInO50XHmFVIbmfTIdsygBN_xRqiIhzdlW3-c0OXfLKwQ9RJA45qMtsWA/exec",

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

        /* =========================
           RESPUESTA TEXTO
        ========================= */

        const text =
        await response.text();

        console.log(
            "RESPUESTA RAW:",
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
            "RESPUESTA JSON:",
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

                    spg_pdf:
                    data.url

                })

            }

        );

        if(!guardar.ok){

            throw new Error(

                "Error guardando URL SPG"

            );

        }

        /* =========================
           FINAL
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