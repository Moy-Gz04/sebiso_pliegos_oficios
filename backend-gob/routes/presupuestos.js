const express = require('express');

const router = express.Router();

const pool = require('../database/db');

const multer = require('multer');

const path = require('path');

const fs = require('fs');

/* =========================
   CREAR CARPETA SI NO EXISTE
========================= */

const uploadPath = 'uploads/oficios';

if(!fs.existsSync(uploadPath)){

    fs.mkdirSync(uploadPath, {

        recursive:true

    });

}

/* =========================
   CONFIG PDF
========================= */

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(

            null,

            uploadPath

        );

    },

    filename: (req, file, cb) => {

        const nombre =

            Date.now() +

            path.extname(

                file.originalname

            );

        cb(null, nombre);

    }

});

/* =========================
   MULTER
========================= */

const upload = multer({

    storage,

    limits: {

        fileSize: 10 * 1024 * 1024

    },

    fileFilter: (req, file, cb) => {

        if(
            file.mimetype !==
            'application/pdf'
        ){

            return cb(

                new Error(
                    'Solo PDFs'
                )

            );

        }

        cb(null, true);

    }

});

/* =========================
   CREAR PRESUPUESTO
========================= */

router.post(

    '/crear',

    upload.single('oficio'),

    async (req, res) => {

        try{

            const {

                area_id,
                anio,
                mes,
                saldo_mensual

            } = req.body;

            /* =========================
               VALIDACIONES
            ========================= */

            if(

                !area_id ||
                !anio ||
                !mes ||
                !saldo_mensual

            ){

                return res.status(400)
                .json({

                    ok:false,

                    msg:'Campos incompletos'

                });

            }

            /* =========================
               VALIDAR DUPLICADO
            ========================= */

            const existe =
            await pool.query(

                `
                SELECT id
                FROM presupuestos_mensuales
                WHERE
                area_id = $1
                AND anio = $2
                AND mes = $3
                `,
                [

                    area_id,
                    anio,
                    mes

                ]

            );

            if(
                existe.rows.length > 0
            ){

                return res.status(400)
                .json({

                    ok:false,

                    msg:
                    'Ya existe registro para ese periodo'

                });

            }

            /* =========================
               BUSCAR SALDO ANTERIOR
            ========================= */

            const saldoAnterior =
            await pool.query(

                `
                SELECT saldo_restante

                FROM presupuestos_mensuales

                WHERE area_id = $1

                ORDER BY id DESC

                LIMIT 1
                `,
                [area_id]

            );

            let saldo_arrastrado = 0;

            if(
                saldoAnterior.rows.length > 0
            ){

                saldo_arrastrado =
                parseFloat(

                    saldoAnterior
                    .rows[0]
                    .saldo_restante

                );

            }

            /* =========================
               CALCULAR
            ========================= */

            const saldo_disponible =

                parseFloat(
                    saldo_mensual
                )

                +

                saldo_arrastrado;

            /* =========================
               PDF
            ========================= */

            let oficio_pdf = null;

            if(req.file){

                oficio_pdf =
                req.file.filename;

            }

            /* =========================
               INSERT
            ========================= */

            const nuevo =
            await pool.query(

                `
                INSERT INTO
                presupuestos_mensuales(

                    area_id,
                    anio,
                    mes,

                    saldo_mensual,
                    saldo_arrastrado,
                    saldo_disponible,

                    gastado_mes,
                    saldo_restante,

                    oficio_pdf

                )

                VALUES(

                    $1,
                    $2,
                    $3,

                    $4,
                    $5,
                    $6,

                    0,
                    $6,

                    $7

                )

                RETURNING *
                `,
                [

                    area_id,
                    anio,
                    mes,

                    saldo_mensual,

                    saldo_arrastrado,

                    saldo_disponible,

                    oficio_pdf

                ]

            );

            res.json({

                ok:true,

                msg:
                'Presupuesto registrado',

                presupuesto:
                nuevo.rows[0]

            });

        }

        catch(error){

            console.log(error);

            res.status(500).json({

                ok:false,

                msg:'Error servidor'

            });

        }

    }

);

/* =========================
   HISTORIAL
========================= */

router.get(

    '/:area',

    async(req, res) => {

        try{

            const { area } =
            req.params;

            const data =
            await pool.query(

                `
                SELECT

                    pm.*,

                    ap.clave_area

                FROM
                presupuestos_mensuales pm

                INNER JOIN
                areas_presupuestales ap

                ON ap.id = pm.area_id

                WHERE
                ap.clave_area = $1

                ORDER BY
                pm.id DESC
                `,
                [area]

            );

            res.json(data.rows);

        }

        catch(error){

            console.log(error);

            res.status(500).json({

                ok:false,

                msg:'Error obteniendo historial'

            });

        }

    }

);

module.exports = router;