const express = require('express');

const router = express.Router();

const pool = require('../database/db');

/* =========================
   MAPA PRESUPUESTOS
========================= */

const mapaPresupuestos = {

    'UP-01':'UP-01-DESPACHO',

    'UP-04':'UP-04-DGFA',

    'UP-05':'UP-05-Subse_I_D',

    'UP-06':'UP-06-DGOLP',

    'UP-07':'UP-07-MIGRANTES',

    'UP-08':'UP-08-ASISTENCIA',

    'UP-13':'UP-13-SSPSyFA',

    'UP-14':'UP-14-DISCAPACIDAD',

    'UP-15':'UP-15-SSDSyH',

    'UP-16':'UP-16'

};

/* =========================
   OBTENER REGISTROS
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
                SELECT *

                FROM registros

                WHERE area LIKE $1

                ORDER BY fecha DESC
                `,
                [

                    `${area}%`

                ]

            );

            res.json(

                data.rows

            );

        }

        catch(error){

            console.log(error);

            res.status(500).json({

                ok:false,

                msg:'Error obteniendo registros'

            });

        }

    }

);

/* =========================
   REGISTRAR GASTO
========================= */

router.post(

    '/registrar',

    async(req, res) => {

        try{

            const {

                registro_id,
                cantidad

            } = req.body;

            if(

                !registro_id ||

                !cantidad

            ){

                return res.status(400)
                .json({

                    ok:false,

                    msg:'Campos incompletos'

                });

            }

            const monto =
            parseFloat(cantidad);

            if(monto <= 0){

                return res.status(400)
                .json({

                    ok:false,

                    msg:'Cantidad inválida'

                });

            }

            /* =========================
               BUSCAR REGISTRO
            ========================= */

            const existe =
            await pool.query(

                `
                SELECT *
                FROM registros
                WHERE id = $1
                `,
                [

                    registro_id

                ]

            );

            if(

                existe.rows.length === 0

            ){

                return res.status(404)
                .json({

                    ok:false,

                    msg:'Registro no encontrado'

                });

            }

            const registro =
            existe.rows[0];

            /* =========================
               ÁREA PRESUPUESTAL
            ========================= */

            const areaPresupuestal =
            mapaPresupuestos[
                registro.area
            ];

            if(!areaPresupuestal){

                return res.status(400)
                .json({

                    ok:false,

                    msg:'Área sin presupuesto relacionado'

                });

            }

            /* =========================
               BUSCAR PRESUPUESTO
            ========================= */

            const presupuestoQuery =
            await pool.query(

                `
                SELECT

                    pm.*

                FROM
                presupuestos_mensuales pm

                INNER JOIN
                areas_presupuestales ap

                ON ap.id = pm.area_id

                WHERE
                ap.clave_area = $1

                ORDER BY
                pm.anio DESC,

                CASE pm.mes

                    WHEN 'ENERO' THEN 1
                    WHEN 'FEBRERO' THEN 2
                    WHEN 'MARZO' THEN 3
                    WHEN 'ABRIL' THEN 4
                    WHEN 'MAYO' THEN 5
                    WHEN 'JUNIO' THEN 6
                    WHEN 'JULIO' THEN 7
                    WHEN 'AGOSTO' THEN 8
                    WHEN 'SEPTIEMBRE' THEN 9
                    WHEN 'OCTUBRE' THEN 10
                    WHEN 'NOVIEMBRE' THEN 11
                    WHEN 'DICIEMBRE' THEN 12

                END DESC

                LIMIT 1
                `,
                [

                    areaPresupuestal

                ]

            );

            if(

                presupuestoQuery.rows.length === 0

            ){

                return res.status(404)
                .json({

                    ok:false,

                    msg:'No existe presupuesto para esta área'

                });

            }

            const presupuesto =
            presupuestoQuery.rows[0];

            /* =========================
               VALIDAR SALDO
            ========================= */

            const saldoActual =
            parseFloat(
                presupuesto.saldo_restante
            );

            if(monto > saldoActual){

                return res.status(400)
                .json({

                    ok:false,

                    msg:'Saldo insuficiente'

                });

            }

            /* =========================
               NUEVOS TOTALES
            ========================= */

            const nuevoGastado =

                parseFloat(
                    presupuesto.gastado_mes || 0
                )

                +

                monto;

            const nuevoRestante =

                saldoActual

                -

                monto;

            /* =========================
               GUARDAR GASTO
            ========================= */

            await pool.query(

                `
                INSERT INTO gastos(

                    registro_id,
                    area,
                    persona,
                    cantidad

                )

                VALUES($1,$2,$3,$4)
                `,
                [

                    registro.id,

                    registro.area,

                    registro.persona,

                    monto

                ]

            );

            /* =========================
               ACTUALIZAR PRESUPUESTO
            ========================= */

            await pool.query(

                `
                UPDATE presupuestos_mensuales

                SET

                    gastado_mes = $1,

                    saldo_restante = $2

                WHERE id = $3
                `,
                [

                    nuevoGastado,

                    nuevoRestante,

                    presupuesto.id

                ]

            );

            res.json({

                ok:true,

                msg:'Gasto registrado correctamente',

                gasto:{

                    registro_id,

                    cantidad:monto,

                    saldo_restante:nuevoRestante,

                    gastado_mes:nuevoGastado

                }

            });

        }

        catch(error){

            console.log(error);

            res.status(500).json({

                ok:false,

                msg:'Error registrando gasto'

            });

        }

    }

);

module.exports = router;