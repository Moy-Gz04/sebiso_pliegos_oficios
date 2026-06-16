const express = require('express');

const router = express.Router();

const pool = require('../database/db');

/* =========================
   GET /api/reportes
   Query params:
     - area  (requerido)
     - anio  (requerido)
     - mes   (opcional)
========================= */

router.get('/', async (req, res) => {

    try {

        const { area, anio, mes } = req.query;

        if (!area || !anio) {

            return res.status(400).json({

                ok: false,
                msg: 'El área y el año son requeridos'

            });

        }

        /* =========================
           QUERY BASE
        ========================= */

        let query = `
            SELECT
                g.id,
                g.persona,
                g.cantidad,
                g.fecha,
                pm.mes,
                pm.anio
            FROM gastos g

            INNER JOIN presupuestos_mensuales pm
            ON pm.id = g.presupuesto_id

            INNER JOIN areas_presupuestales ap
            ON ap.id = pm.area_id

            WHERE ap.clave_area = $1
            AND pm.anio = $2
        `;

        const params = [area, anio];

        /* =========================
           FILTRO MES (OPCIONAL)
        ========================= */

        if (mes) {

            query += ` AND pm.mes = $3`;

            params.push(mes);

        }

        query += ` ORDER BY g.fecha DESC NULLS LAST`;

        const data = await pool.query(query, params);

        res.json(data.rows);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            ok: false,
            msg: 'Error obteniendo reporte'

        });

    }

});

module.exports = router;