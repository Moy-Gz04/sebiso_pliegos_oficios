const express = require("express");

const router = express.Router();

/* =========================
   APPS SCRIPT URL
========================= */

const APPS_SCRIPT_OFICIO2 =

"https://script.google.com/macros/s/AKfycbyIat6ZY_-OANmzObONC05-5mhbqQVympYcD4-XGr8wWtcJXCz5DEwOPKqTVicSm2LQ/exec";

/* =========================
   GENERAR OFICIO 2
========================= */

router.post(

    "/generar",

    async(req,res)=>{

        try{

            const response =
            await fetch(

                APPS_SCRIPT_OFICIO2,

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
                "RESPUESTA OFICIO2:",
                data
            );

            if(

                !response.ok
                ||
                data.ok === false

            ){

                throw new Error(

                    data.error ||

                    "Error Apps Script Oficio2"

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
                "ERROR OFICIO2:",
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