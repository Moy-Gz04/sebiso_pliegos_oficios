const express = require("express");
const router = express.Router();

const pool = require("../database/db");

/*=====================================================
OBTENER UNIDADES PRESUPUESTALES
=====================================================*/

router.get("/unidades", async (req, res) => {

    try {

        const resultado = await pool.query(`

            SELECT

                id,
                clave,
                nombre

            FROM unidades_presupuestales

            ORDER BY clave

        `);

        res.json(resultado.rows);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            ok:false,

            mensaje:"Error al obtener las unidades."

        });

    }

});

/*=====================================================
REGISTRAR MANUALMENTE
=====================================================*/

router.post("/", async (req, res) => {

    try {

        const {

            unidad_id,
            nombre_servidor,
            rfc,
            mes,
            municipio,
            importe

        } = req.body;

        if(

            !unidad_id ||

            !nombre_servidor ||

            !rfc ||

            !mes ||

            !municipio ||

            !importe

        ){

            return res.status(400).json({

                ok:false,

                mensaje:"Todos los campos son obligatorios."

            });

        }

        const resultado = await pool.query(

            `

            INSERT INTO viaticos
            (

                unidad_id,
                nombre_servidor,
                rfc,
                mes,
                municipio,
                importe

            )

            VALUES

            ($1,$2,$3,$4,$5,$6)

            RETURNING *

            `,

            [

                unidad_id,
                nombre_servidor,
                rfc,
                mes,
                municipio,
                importe

            ]

        );

        res.json({

            ok:true,

            registro:resultado.rows[0]

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            ok:false,

            mensaje:"Error al guardar."

        });

    }

});

/*=====================================================
CONSULTAR VIÁTICOS POR UNIDAD
=====================================================*/

router.get("/", async(req,res)=>{

    try{

        const { unidad_id } = req.query;

        if(!unidad_id){

            return res.status(400).json({

                ok:false,

                mensaje:"Seleccione una Unidad."

            });

        }

        const resultado=await pool.query(

            `

            SELECT *

            FROM viaticos

            WHERE unidad_id=$1

            ORDER BY fecha_registro DESC

            `,

            [

                unidad_id

            ]

        );

        res.json({

            ok:true,

            registros:resultado.rows

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            ok:false,

            mensaje:"Error al consultar."

        });

    }

});

/*=====================================================
IMPORTAR EXCEL
=====================================================*/

router.post("/importar", async (req, res) => {

    const client = await pool.connect();

    try {

        const { unidad_id, registros } = req.body;

        if (!unidad_id) {

            return res.status(400).json({

                ok: false,

                mensaje: "Seleccione una Unidad Presupuestal."

            });

        }

        if (!Array.isArray(registros) || registros.length === 0) {

            return res.status(400).json({

                ok: false,

                mensaje: "El archivo no contiene registros."

            });

        }

        await client.query("BEGIN");

        const sql = `

            INSERT INTO viaticos
            (

                unidad_id,
                nombre_servidor,
                rfc,
                mes,
                municipio,
                importe

            )

            VALUES

            ($1,$2,$3,$4,$5,$6)

        `;

        for (const fila of registros) {

            await client.query(

                sql,

                [

                    unidad_id,

                    fila.nombre_servidor,

                    fila.rfc,

                    fila.mes,

                    fila.municipio,

                    fila.importe

                ]

            );

        }

        await client.query("COMMIT");

        res.json({

            ok: true,

            mensaje: `${registros.length} registros importados correctamente.`,

            total: registros.length

        });

    }

    catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({

            ok: false,

            mensaje: "Error al importar el archivo."

        });

    }

    finally {

        client.release();

    }

});

module.exports = router;