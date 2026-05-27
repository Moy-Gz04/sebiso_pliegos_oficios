const express = require('express');

const router = express.Router();

const pool = require('../database/db');

const multer = require('multer');

const path = require('path');

const fs = require('fs');

/* =========================
   CREAR CARPETA SI NO EXISTE
========================= */

const uploadPath =
path.join(__dirname, '..', 'uploads', 'oficios');

if (!fs.existsSync(uploadPath)) {

    fs.mkdirSync(uploadPath, {

        recursive: true

    });

}

/* =========================
   CONFIG PDF
========================= */

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadPath);

    },

    filename: (req, file, cb) => {

        const extension =
        path.extname(file.originalname);

        const nombreBase =
        path.basename(file.originalname, extension);

        const nombreLimpio =

            nombreBase

            .normalize('NFD')

            .replace(/[\u0300-\u036f]/g, '')

            .replace(/\s+/g, '-')

            .replace(/[^a-zA-Z0-9-_]/g, '');

        const nombreFinal =

            `${nombreLimpio}${extension}`;

        cb(null, nombreFinal);

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

        if (file.mimetype !== 'application/pdf') {

            return cb(

                new Error('Solo se permiten PDFs')

            );

        }

        cb(null, true);

    }

});

/* =========================
   ÚLTIMO OFICIO POR ÁREA
========================= */

router.get(

    '/ultimo-oficio/:area_id',

    async(req, res) => {

        try{

            const { area_id } =
            req.params;

            console.log(
                'AREA ID:',
                area_id
            );

            const consulta =
            await pool.query(

                `
                SELECT
                oficio_autorizacion_nombre

                FROM ultimos_oficios_por_up

                WHERE area_id = $1

                LIMIT 1
                `,
                [area_id]

            );

            console.log(
                'CONSULTA OFICIO:',
                consulta.rows
            );

            if(
                consulta.rows.length === 0
            ){

                return res.json({

                    ok:true,

                    oficio:''

                });

            }

            res.json({

                ok:true,

                oficio:

                consulta.rows[0]
                .oficio_autorizacion_nombre || ''

            });

        }

        catch(error){

            console.log(
                'ERROR ÚLTIMO OFICIO:',
                error
            );

            res.status(500).json({

                ok:false,

                msg:'Error obteniendo oficio'

            });

        }

    }

);

/* =========================
   CREAR PRESUPUESTO
========================= */

router.post(

    '/crear',

    upload.fields([

        {

            name: 'oficio_autorizacion',

            maxCount: 1

        },

        {

            name: 'oficio_adecuacion',

            maxCount: 1

        }

    ]),

    async (req, res) => {

        try {

            console.log('BODY:', req.body);

            console.log('FILES:', req.files);

            const {

                area_id,
                anio,
                mes,

                saldo_autorizado,
                saldo_modificado

            } = req.body;

            if (

                !area_id ||
                !anio ||
                !mes ||
                saldo_autorizado === undefined

            ) {

                return res.status(400).json({

                    ok: false,

                    msg: 'Campos incompletos'

                });

            }

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

            if (existe.rows.length > 0) {

                return res.status(400).json({

                    ok: false,

                    msg: 'Ya existe registro para ese periodo'

                });

            }

            const autorizado =
            parseFloat(saldo_autorizado || 0);

            const modificado =
            parseFloat(saldo_modificado || 0);

            const disponible =
            autorizado + modificado;

            let oficio_autorizacion = null;
            let oficio_autorizacion_nombre = null;

            let oficio_adecuacion = null;
            let oficio_adecuacion_nombre = null;

            if (

                req.files &&
                req.files.oficio_autorizacion &&
                req.files.oficio_autorizacion[0]

            ) {

                oficio_autorizacion =

                    req.files
                    .oficio_autorizacion[0]
                    .filename;

                oficio_autorizacion_nombre =

                    req.files
                    .oficio_autorizacion[0]
                    .originalname;

            }

            if (

                req.files &&
                req.files.oficio_adecuacion &&
                req.files.oficio_adecuacion[0]

            ) {

                oficio_adecuacion =

                    req.files
                    .oficio_adecuacion[0]
                    .filename;

                oficio_adecuacion_nombre =

                    req.files
                    .oficio_adecuacion[0]
                    .originalname;

            }

            const nuevo =
            await pool.query(

                `
                INSERT INTO
                presupuestos_mensuales(

                    area_id,
                    anio,
                    mes,

                    saldo_autorizado,
                    saldo_modificado,

                    saldo_disponible,

                    gastado_mes,
                    saldo_restante,

                    oficio_autorizacion,
                    oficio_autorizacion_nombre,

                    oficio_adecuacion,
                    oficio_adecuacion_nombre

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

                    $7,
                    $8,

                    $9,
                    $10

                )

                RETURNING *
                `,
                [

                    area_id,
                    anio,
                    mes,

                    autorizado,
                    modificado,

                    disponible,

                    oficio_autorizacion,
                    oficio_autorizacion_nombre,

                    oficio_adecuacion,
                    oficio_adecuacion_nombre

                ]

            );

            /* =========================
               ACTUALIZAR ÚLTIMOS OFICIOS
            ========================= */

            await pool.query(

                `
                INSERT INTO ultimos_oficios_por_up(

                    area_id,

                    oficio_autorizacion,
                    oficio_autorizacion_nombre,

                    oficio_adecuacion,
                    oficio_adecuacion_nombre,

                    fecha_actualizacion

                )

                VALUES(

                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    NOW()

                )

                ON CONFLICT(area_id)

                DO UPDATE SET

                    oficio_autorizacion =
                    EXCLUDED.oficio_autorizacion,

                    oficio_autorizacion_nombre =
                    EXCLUDED.oficio_autorizacion_nombre,

                    oficio_adecuacion =
                    EXCLUDED.oficio_adecuacion,

                    oficio_adecuacion_nombre =
                    EXCLUDED.oficio_adecuacion_nombre,

                    fecha_actualizacion = NOW()
                `,
                [

                    area_id,

                    oficio_autorizacion,
                    oficio_autorizacion_nombre,

                    oficio_adecuacion,
                    oficio_adecuacion_nombre

                ]

            );

            res.json({

                ok: true,

                msg: 'Presupuesto registrado',

                presupuesto:
                nuevo.rows[0]

            });

        }

        catch (error) {

            console.log('ERROR CREAR PRESUPUESTO:');

            console.log(error);

            res.status(500).json({

                ok: false,

                msg: 'Error servidor',

                error: error.message

            });

        }

    }

);

/* =========================
   HISTORIAL + GASTOS
========================= */

router.get(

    '/:area',

    async (req, res) => {

        try {

            const { area } =
            req.params;

            const presupuestos =
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

            const claveCorta =
            area
            .split('-')
            .slice(0, 2)
            .join('-')
            .trim();

            const gastos =
            await pool.query(

                `
                SELECT *

                FROM gastos

                WHERE TRIM(area) LIKE $1

                ORDER BY fecha DESC
                `,
                [

                    `${claveCorta}%`

                ]

            );

            res.json({

                ok: true,

                presupuestos:
                presupuestos.rows,

                gastos:
                gastos.rows

            });

        }

        catch (error) {

            console.log(error);

            res.status(500).json({

                ok: false,

                msg: 'Error obteniendo historial'

            });

        }

    }

);

/* =========================
   EDITAR PRESUPUESTO
========================= */

router.put(

    '/editar/:id',

    upload.fields([

        {

            name: 'oficio_autorizacion',

            maxCount: 1

        },

        {

            name: 'oficio_adecuacion',

            maxCount: 1

        }

    ]),

    async (req, res) => {

        try {

            const { id } =
            req.params;

            const {

                saldo_autorizado,
                saldo_modificado,

                mes,
                anio

            } = req.body;

            if (

                saldo_autorizado === undefined ||
                !mes ||
                !anio

            ) {

                return res.status(400).json({

                    ok: false,

                    msg: 'Campos incompletos'

                });

            }

            const existe =
            await pool.query(

                `
                SELECT *
                FROM presupuestos_mensuales
                WHERE id = $1
                `,
                [id]

            );

            if (existe.rows.length === 0) {

                return res.status(404).json({

                    ok: false,

                    msg: 'Registro no encontrado'

                });

            }

            const registro =
            existe.rows[0];

            const duplicado =
            await pool.query(

                `
                SELECT id
                FROM presupuestos_mensuales
                WHERE

                area_id = $1

                AND mes = $2

                AND anio = $3

                AND id != $4
                `,
                [

                    registro.area_id,

                    mes,

                    anio,

                    id

                ]

            );

            if (duplicado.rows.length > 0) {

                return res.status(400).json({

                    ok: false,

                    msg: 'Ya existe otro registro para ese periodo'

                });

            }

            const disponible =

                parseFloat(saldo_autorizado || 0)

                +

                parseFloat(saldo_modificado || 0);

            const restante =

                disponible

                -

                parseFloat(registro.gastado_mes || 0);

            let nuevoPDFAutorizacion =
            registro.oficio_autorizacion;

            let nuevoNombreAutorizacion =
            registro.oficio_autorizacion_nombre;

            let nuevoPDFAdecuacion =
            registro.oficio_adecuacion;

            let nuevoNombreAdecuacion =
            registro.oficio_adecuacion_nombre;

            if (

                req.files &&
                req.files.oficio_autorizacion &&
                req.files.oficio_autorizacion[0]

            ) {

                if (registro.oficio_autorizacion) {

                    const rutaVieja =

                        path.join(

                            uploadPath,

                            registro.oficio_autorizacion

                        );

                    if (fs.existsSync(rutaVieja)) {

                        fs.unlinkSync(rutaVieja);

                    }

                }

                nuevoPDFAutorizacion =

                    req.files
                    .oficio_autorizacion[0]
                    .filename;

                nuevoNombreAutorizacion =

                    req.files
                    .oficio_autorizacion[0]
                    .originalname;

            }

            if (

                req.files &&
                req.files.oficio_adecuacion &&
                req.files.oficio_adecuacion[0]

            ) {

                if (registro.oficio_adecuacion) {

                    const rutaVieja =

                        path.join(

                            uploadPath,

                            registro.oficio_adecuacion

                        );

                    if (fs.existsSync(rutaVieja)) {

                        fs.unlinkSync(rutaVieja);

                    }

                }

                nuevoPDFAdecuacion =

                    req.files
                    .oficio_adecuacion[0]
                    .filename;

                nuevoNombreAdecuacion =

                    req.files
                    .oficio_adecuacion[0]
                    .originalname;

            }

            const actualizado =
            await pool.query(

                `
                UPDATE presupuestos_mensuales

                SET

                    mes = $1,

                    anio = $2,

                    saldo_autorizado = $3,

                    saldo_modificado = $4,

                    saldo_disponible = $5,

                    saldo_restante = $6,

                    oficio_autorizacion = $7,

                    oficio_autorizacion_nombre = $8,

                    oficio_adecuacion = $9,

                    oficio_adecuacion_nombre = $10

                WHERE id = $11

                RETURNING *
                `,
                [

                    mes,
                    anio,

                    saldo_autorizado,
                    saldo_modificado,

                    disponible,
                    restante,

                    nuevoPDFAutorizacion,
                    nuevoNombreAutorizacion,

                    nuevoPDFAdecuacion,
                    nuevoNombreAdecuacion,

                    id

                ]

            );

            res.json({

                ok: true,

                msg: 'Registro actualizado',

                registro:
                actualizado.rows[0]

            });

        }

        catch (error) {

            console.log(error);

            res.status(500).json({

                ok: false,

                msg: 'Error editando',

                error: error.message

            });

        }

    }

);

/* =========================
   ELIMINAR PRESUPUESTO
========================= */

router.delete(

    '/:id',

    async (req, res) => {

        try {

            const { id } =
            req.params;

            const existe =
            await pool.query(

                `
                SELECT *
                FROM presupuestos_mensuales
                WHERE id = $1
                `,
                [id]

            );

            if (existe.rows.length === 0) {

                return res.status(404).json({

                    ok: false,

                    msg: 'No encontrado'

                });

            }

            const registro =
            existe.rows[0];

            const eliminarArchivo = (archivo) => {

                if (!archivo) return;

                const ruta =
                path.join(uploadPath, archivo);

                if (fs.existsSync(ruta)) {

                    fs.unlinkSync(ruta);

                }

            };

            eliminarArchivo(
                registro.oficio_autorizacion
            );

            eliminarArchivo(
                registro.oficio_adecuacion
            );

            await pool.query(

                `
                DELETE FROM
                presupuestos_mensuales
                WHERE id = $1
                `,
                [id]

            );

            res.json({

                ok: true,

                msg: 'Registro eliminado'

            });

        }

        catch (error) {

            console.log(error);

            res.status(500).json({

                ok: false,

                msg: 'Error eliminando',

                error: error.message

            });

        }

    }

);

module.exports = router;