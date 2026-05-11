const express = require('express');

const pool = require('../database/db');

const router = express.Router();

/* =========================
   OBTENER REGISTROS
========================= */

router.get('/:area', async (req, res) => {

    try{

        const area = req.params.area;

        const result = await pool.query(

            `
            SELECT *
            FROM registros
            WHERE area = $1
            ORDER BY fecha DESC
            `,

            [area]

        );

        res.json(result.rows);

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            error:
            'Error obteniendo registros'

        });

    }

});

/* =========================
   GUARDAR REGISTRO
========================= */

router.post('/', async (req, res) => {

    try{

        const {

            codigo,
            area,
            persona,
            oficio_pdf,
            pliego_pdf

        } = req.body;

        await pool.query(

            `
            INSERT INTO registros(

                codigo,
                area,
                persona,
                oficio_pdf,
                pliego_pdf

            )

            VALUES($1,$2,$3,$4,$5)
            `,

            [
                codigo,
                area,
                persona,
                oficio_pdf,
                pliego_pdf
            ]

        );

        res.json({

            success:true

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            error:
            'Error guardando registro'

        });

    }

});

module.exports = router;

/* =========================
   ELIMINAR REGISTRO
========================= */

router.delete('/:id', async (req, res) => {

    try{

        const id =
        req.params.id;

        await pool.query(

            `
            DELETE FROM registros
            WHERE codigo = $1
            `,

            [id]

        );

        res.json({

            success:true

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            error:
            'Error eliminando registro'

        });

    }

});