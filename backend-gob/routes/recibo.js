const express = require("express");

const router = express.Router();

/* =========================
   APPS SCRIPT URL
========================= */

const APPS_SCRIPT_URL =

"https://script.google.com/macros/s/AKfycbwSPur5nDeMdOHEyvDO08utsOTaQb-BdVQKxZK1fYvNVJ2lBSnqDQA-7lSpF4uAbmKi/exec";

/* =========================
   GENERAR RECIBO
========================= */

router.post(

    "/generar",

    async(req,res)=>{

        try{

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

            const data =
            await response.json();

            console.log(
                "RESPUESTA RECIBO:",
                data
            );

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

            res.json({

                ok:true,

                url:data.url,

                fileId:data.fileId || null

            });

        }

        catch(error){

            console.error(
                "ERROR RECIBO:",
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