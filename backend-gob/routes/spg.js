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
                        "application/json"

                    },

                    body:JSON.stringify(

                        req.body

                    )

                }

            );

            /* =========================
               RESPUESTA
            ========================= */

            const data =
            await response.json();

            console.log(
                "RESPUESTA APPS SCRIPT:",
                data
            );

            /* =========================
               ERROR
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

                fileId:data.fileId || null

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