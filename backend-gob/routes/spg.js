const express = require("express");

const router = express.Router();

const fetch = require("node-fetch");

/* =========================
   APPS SCRIPT URL
========================= */

const APPS_SCRIPT_URL =

"https://script.google.com/macros/s/XXXXXXXX/exec";

/* =========================
   GENERAR SPG
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

            if(!response.ok){

                throw new Error(

                    data.error ||

                    "Error Apps Script"

                );

            }

            res.json(data);

        }

        catch(error){

            console.error(
                "ERROR SPG:",
                error
            );

            res.status(500).json({

                error:error.message

            });

        }

    }

);

module.exports = router;