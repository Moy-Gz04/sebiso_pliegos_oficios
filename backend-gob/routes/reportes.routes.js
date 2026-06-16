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
           EXTRAER CLAVE CORTA
        ========================= */

        const clave = area
            .split('-')
            .slice(0, 2)
            .join('-')
            .trim();

        /* =========================
           QUERY BASE
           - monto viene de gastos
           - mes viene de registros
           - filtramos por año de la fecha
        ========================= */

        let query = `
            SELECT
                g.id,
                r.persona,
                g.cantidad,
                g.fecha,
                UPPER(r.mes) AS mes,
                EXTRACT(YEAR FROM g.fecha)::text AS anio
            FROM gastos g
            INNER JOIN registros r
                ON r.id = g.registro_id
            WHERE TRIM(g.area) LIKE $1
            AND EXTRACT(YEAR FROM g.fecha) = $2
        `;

        const params = [`${clave}%`, parseInt(anio)];

        /* =========================
           FILTRO MES (OPCIONAL)
        ========================= */

        if (mes) {

            query += ` AND UPPER(r.mes) = $3`;

            params.push(mes.toUpperCase());

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