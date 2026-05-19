const express = require('express');

const router = express.Router();

const pool = require('../database/db');

/* =========================
   MAPA PRESUPUESTOS
========================= */

const mapaPresupuestos = {

    'UP-01':'UP-01-DESPACHO',

    'UP-CA':'UP-CA',

    'UP-01-S-DRM':'UP-01-S-DRM',

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
   OBTENER GASTOS
========================= */

router.get('/:area', async (req, res) => {

    try {

        const { area } = req.params;

        const clave = area
            .split('-')
            .slice(0, 2)
            .join('-')
            .trim();

        const data = await pool.query(

            `
            SELECT
                g.*,
                r.estatus,
                r.concepto,
                r.fecha AS fecha_registro
            FROM gastos g

            LEFT JOIN registros r
            ON r.id = g.registro_id

            WHERE TRIM(g.area) LIKE $1

            ORDER BY g.fecha DESC NULLS LAST
            `,

            [`${clave}%`]

        );

        res.json(data.rows);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            ok: false,
            msg: 'Error obteniendo gastos'

        });

    }

});

/* =========================
   REGISTRAR GASTO
========================= */

router.post('/registrar', async (req, res) => {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        const {
            registro_id,
            cantidad
        } = req.body;

        /* =========================
           VALIDAR CAMPOS
        ========================= */

        if (!registro_id || cantidad === undefined) {

            await client.query('ROLLBACK');

            return res.status(400).json({

                ok: false,
                msg: 'Campos incompletos'

            });

        }

        const monto = parseFloat(cantidad);

        /* =========================
           VALIDAR MONTO
        ========================= */

        if (isNaN(monto) || monto <= 0) {

            await client.query('ROLLBACK');

            return res.status(400).json({

                ok: false,
                msg: 'Cantidad inválida'

            });

        }

        /* =========================
           BUSCAR REGISTRO
        ========================= */

        const existe = await client.query(

            `
            SELECT *
            FROM registros
            WHERE id = $1
            FOR UPDATE
            `,

            [registro_id]

        );

        if (existe.rows.length === 0) {

            await client.query('ROLLBACK');

            return res.status(404).json({

                ok: false,
                msg: 'Registro no encontrado'

            });

        }

        const registro = existe.rows[0];

        /* =========================
           VALIDAR ESTATUS
        ========================= */

        const estatusValidos = [

            'Enviado',
            'A Revisar',
            'Pendiente'

        ];

        if (!estatusValidos.includes(registro.estatus)) {

            await client.query('ROLLBACK');

            return res.status(400).json({

                ok: false,
                msg: `No se puede pagar un registro con estatus "${registro.estatus}"`

            });

        }

        /* =========================
           VALIDAR DOBLE PAGO
        ========================= */

        const yaPagado = await client.query(

            `
            SELECT id
            FROM gastos
            WHERE registro_id = $1
            LIMIT 1
            `,

            [registro_id]

        );

        if (yaPagado.rows.length > 0) {

            await client.query('ROLLBACK');

            return res.status(400).json({

                ok: false,
                msg: 'Este registro ya fue pagado'

            });

        }

        /* =========================
           OBTENER ÁREA PRESUPUESTAL
        ========================= */

        const areaPresupuestal =
            mapaPresupuestos[registro.area];

        if (!areaPresupuestal) {

            await client.query('ROLLBACK');

            return res.status(400).json({

                ok: false,
                msg: 'Área sin presupuesto relacionado'

            });

        }

        /* =========================
           BUSCAR PRESUPUESTO
        ========================= */

        const presupuestoQuery = await client.query(

            `
            SELECT
                pm.*
            FROM presupuestos_mensuales pm

            INNER JOIN areas_presupuestales ap
            ON ap.id = pm.area_id

            WHERE ap.clave_area = $1

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

            FOR UPDATE
            `,

            [areaPresupuestal]

        );

        if (presupuestoQuery.rows.length === 0) {

            await client.query('ROLLBACK');

            return res.status(404).json({

                ok: false,
                msg: 'No existe presupuesto para esta área'

            });

        }

        const presupuesto = presupuestoQuery.rows[0];

        /* =========================
           VALIDAR SALDO
        ========================= */

        const saldoActual =
            parseFloat(presupuesto.saldo_restante || 0);

        if (monto > saldoActual) {

            await client.query('ROLLBACK');

            return res.status(400).json({

                ok: false,
                msg: 'Saldo insuficiente'

            });

        }

        /* =========================
           NUEVOS TOTALES
        ========================= */

        const nuevoGastado =
            parseFloat(presupuesto.gastado_mes || 0)
            + monto;

        const nuevoRestante =
            saldoActual - monto;

        /* =========================
           INSERTAR GASTO
        ========================= */

        const gastoInsertado = await client.query(

            `
            INSERT INTO gastos (

                presupuesto_id,
                registro_id,
                area,
                persona,
                cantidad

            )

            VALUES ($1,$2,$3,$4,$5)

            RETURNING *
            `,

            [

                presupuesto.id,
                registro.id,
                registro.area,
                registro.persona,
                monto

            ]

        );

        /* =========================
           ACTUALIZAR PRESUPUESTO
        ========================= */

        await client.query(

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

        /* =========================
           ACTUALIZAR REGISTRO
        ========================= */

        await client.query(

            `
            UPDATE registros

            SET
                estatus = 'Pagado',
                fecha_revision = NOW()

            WHERE id = $1
            `,

            [registro.id]

        );

        await client.query('COMMIT');

        res.json({

            ok: true,

            msg: 'Gasto registrado correctamente',

            gasto: gastoInsertado.rows[0],

            presupuesto: {

                gastado_mes: nuevoGastado,
                saldo_restante: nuevoRestante

            }

        });

    }

    catch (error) {

        await client.query('ROLLBACK');

        console.log(error);

        res.status(500).json({

            ok: false,
            msg: 'Error registrando gasto',
            error: error.message

        });

    }

    finally {

        client.release();

    }

});

module.exports = router;