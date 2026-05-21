const express = require("express");

const router = express.Router();

/* =========================
   APPS SCRIPT URL
========================= */

const APPS_SCRIPT_FACTURA =

"https://script.google.com/macros/s/AKfycbzQgaTKRcjb5czQ2hecPl-YA6MF3hCEMqB9Nvv7VcjvjfXR2J9qEqBEJcArK63ZpMIJ/exec";

/* =========================
   GENERAR FACTURA
========================= */

router.post(

    "/generar",

    async(req,res)=>{

        try{

            const response =
            await fetch(

                APPS_SCRIPT_FACTURA,

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

            const data =
            await response.json();

            console.log(
                "RESPUESTA FACTURA:",
                data
            );

            if(

                !response.ok
                ||
                data.ok === false

            ){

                throw new Error(

                    data.error ||

                    "Error Apps Script Factura"

                );

            }

            res.json({

                ok:true,

                url:data.url,

                fileId:data.fileId || null

            });

        }

        catch(error){

            console.error(
                "ERROR FACTURA:",
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