const express = require("express");

const router = express.Router();

/* =========================
   APPS SCRIPT URL
========================= */

const APPS_SCRIPT_URL =

"https://script.google.com/macros/s/AKfycbyIGrkWxfZBlwCeZIUuFBkmFPUYse8rxz14OVpRyH4KT2ljevxDG9gKSn7lMDO8iqLRfQ/exec";

/* =========================
   GENERAR SPG
========================= */

router.post(

    "/generar",

    async(req,res)=>{

        try{

            console.log(
                "BODY RECIBIDO:",
                req.body
            );

            /* =========================
               VALIDAR BODY
            ========================= */

            if(!req.body){

                return res.status(400).json({

                    ok:false,

                    error:"Body vacío"

                });

            }

            /* =========================
               ENVIAR A APPS SCRIPT
            ========================= */

            const response =
            await fetch(

                APPS_SCRIPT_URL,

                {

                    method:"POST",

                    headers:{

                        "Content-Type":
                        "text/plain"

                    },

                    body:JSON.stringify(

                        req.body

                    )

                }

            );

            /* =========================
               RESPUESTA RAW
            ========================= */

            const text =
            await response.text();

            console.log(
                "RESPUESTA RAW APPS SCRIPT:",
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

                return res.status(500).json({

                    ok:false,

                    error:
                    "Apps Script no devolvió JSON válido"

                });

            }

            console.log(
                "RESPUESTA JSON:",
                data
            );

            /* =========================
               VALIDAR ERROR
            ========================= */

            if(

                !response.ok
                ||
                data.ok === false

            ){

                throw new Error(

                    data.error ||

                    "Error Apps Script"

                );

            }

            /* =========================
               RESPONDER FRONTEND
            ========================= */

            res.json({

                ok:true,

                url:data.url,

                fileId:
                data.fileId || null

            });

        }

        catch(error){

            console.error(
                "ERROR SPG:",
                error
            );

            res.status(500).json({

                ok:false,

                error:error.message

            });

        }

    }

);

module.exports = router;