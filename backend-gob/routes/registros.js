const express = require('express');

const pool = require('../database/db');

const router = express.Router();

/* =========================
   OBTENER REGISTROS
========================= */

router.get('/:area', async (req, res) => {

    try{

        const area =
        req.params.area;

        const result =
        await pool.query(

            `
            SELECT

                r.*,

                CASE

                    WHEN g.id IS NOT NULL
                    THEN true

                    ELSE false

                END AS pagado,

                COALESCE(
                    g.cantidad,
                    0
                ) AS cantidad_pagada

            FROM registros r

            LEFT JOIN gastos g

            ON g.registro_id = r.id

            WHERE TRIM(r.area) LIKE $1

            ORDER BY

                CASE r.estatus

                    WHEN 'Creado' THEN 1
                    WHEN 'Rechazado' THEN 2
                    WHEN 'Enviado' THEN 3
                    WHEN 'Aceptado' THEN 4
                    ELSE 5

                END,

                r.fecha DESC
            `,

            [

                `${area}%`

            ]

        );

        res.json(

            result.rows

        );

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
                pliego_pdf,
                estatus

            )

            VALUES($1,$2,$3,$4,$5,$6)
            `,

            [
                codigo,
                area,
                persona,
                oficio_pdf,
                pliego_pdf,
                'Creado'
            ]

        );

        res.json({

            ok:true,

            msg:'Registro guardado'

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

/* =========================
   ENVIAR REGISTRO
========================= */

router.put('/enviar/:codigo', async (req, res) => {

    try{

        const codigo =
        req.params.codigo;

        const validar =
        await pool.query(

            `
            SELECT *

            FROM registros

            WHERE codigo = $1
            `,

            [codigo]

        );

        if(
            validar.rows.length === 0
        ){

            return res.status(404)
            .json({

                error:'Registro no encontrado'

            });

        }

        const registro =
        validar.rows[0];

        if(
            registro.estatus === 'Aceptado'
        ){

            return res.status(400)
            .json({

                error:
                'El registro ya fue pagado'

            });

        }

        await pool.query(

            `
            UPDATE registros

            SET
                estatus = 'Enviado'

            WHERE codigo = $1
            `,

            [codigo]

        );

        res.json({

            ok:true,

            msg:'Registro enviado'

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            error:
            'Error enviando registro'

        });

    }

});

/* =========================
   REENVIAR REGISTRO
========================= */

router.put('/reenviar/:codigo', async (req, res) => {

    try{

        const codigo =
        req.params.codigo;

        const validar =
        await pool.query(

            `
            SELECT *

            FROM registros

            WHERE codigo = $1
            `,

            [codigo]

        );

        if(
            validar.rows.length === 0
        ){

            return res.status(404)
            .json({

                error:'Registro no encontrado'

            });

        }

        await pool.query(

            `
            UPDATE registros

            SET

                estatus = 'Enviado',

                observaciones_admin = ''

            WHERE codigo = $1
            `,

            [codigo]

        );

        res.json({

            ok:true,

            msg:'Registro reenviado'

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            error:
            'Error reenviando registro'

        });

    }

});

/* =========================
   GUARDAR OBSERVACIONES
========================= */

router.put('/observaciones/:codigo', async (req, res) => {

    try{

        const codigo =
        req.params.codigo;

        const {

            observaciones

        } = req.body;

        const validar =
        await pool.query(

            `
            SELECT estatus

            FROM registros

            WHERE codigo = $1
            `,

            [codigo]

        );

        if(
            validar.rows.length === 0
        ){

            return res.status(404)
            .json({

                error:'Registro no encontrado'

            });

        }

        const estatus =
        validar.rows[0].estatus;

        if(

            estatus === 'Enviado'
            ||
            estatus === 'Aceptado'

        ){

            return res.status(400)
            .json({

                error:
                'No se puede editar este registro'

            });

        }

        await pool.query(

            `
            UPDATE registros

            SET

                observaciones = $1

            WHERE codigo = $2
            `,

            [

                observaciones,
                codigo

            ]

        );

        res.json({

            ok:true,

            msg:'Observaciones guardadas'

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            error:
            'Error guardando observaciones'

        });

    }

});

/* =========================
   OBSERVACIONES ADMIN
========================= */

router.put('/observaciones-admin/:codigo', async (req, res) => {

    try{

        const codigo =
        req.params.codigo;

        const {

            observaciones_admin

        } = req.body;

        await pool.query(

            `
            UPDATE registros

            SET

                observaciones_admin = $1

            WHERE codigo = $2
            `,

            [

                observaciones_admin,
                codigo

            ]

        );

        res.json({

            ok:true,

            msg:'Observaciones admin guardadas'

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            error:
            'Error guardando observaciones admin'

        });

    }

});

/* =========================
   CAMBIAR ESTATUS
========================= */

router.put('/estatus/:codigo', async (req, res) => {

    try{

        const codigo =
        req.params.codigo;

        const {

            estatus

        } = req.body;

        const validar =
        await pool.query(

            `
            SELECT *

            FROM registros

            WHERE codigo = $1
            `,

            [codigo]

        );

        if(
            validar.rows.length === 0
        ){

            return res.status(404)
            .json({

                error:'Registro no encontrado'

            });

        }

        const actual =
        validar.rows[0];

        /* =========================
           NO MODIFICAR PAGADOS
        ========================= */

        if(
            actual.estatus === 'Aceptado'
        ){

            return res.status(400)
            .json({

                error:
                'Registro finalizado'

            });

        }

        /* =========================
           VALIDAR PAGADO
        ========================= */

        if(
            estatus === 'Aceptado'
        ){

            const gasto =
            await pool.query(

                `
                SELECT *

                FROM gastos

                WHERE registro_id = $1
                `,

                [actual.id]

            );

            if(
                gasto.rows.length === 0
            ){

                return res.status(400)
                .json({

                    error:
                    'No existe pago registrado'

                });

            }

        }

        await pool.query(

            `
            UPDATE registros

            SET

                estatus = $1

            WHERE codigo = $2
            `,

            [

                estatus,
                codigo

            ]

        );

        res.json({

            ok:true,

            msg:'Estatus actualizado'

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            error:
            'Error actualizando estatus'

        });

    }

});

/* =========================
   ELIMINAR REGISTRO
========================= */

router.delete('/:codigo', async (req, res) => {

    try{

        const codigo =
        req.params.codigo;

        const validar =
        await pool.query(

            `
            SELECT *

            FROM registros

            WHERE codigo = $1
            `,

            [codigo]

        );

        if(
            validar.rows.length === 0
        ){

            return res.status(404)
            .json({

                error:'Registro no encontrado'

            });

        }

        const registro =
        validar.rows[0];

        if(

            registro.estatus === 'Enviado'
            ||
            registro.estatus === 'Aceptado'

        ){

            return res.status(400)
            .json({

                error:
                'No se puede eliminar este registro'

            });

        }

        await pool.query(

            `
            DELETE FROM registros

            WHERE codigo = $1
            `,

            [codigo]

        );

        res.json({

            ok:true,

            msg:'Registro eliminado'

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

module.exports = router;