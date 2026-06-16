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
           "UP-16" de "UP-16"
           "UP-15" de "UP-15-SSDSyH"
        ========================= */

        const clave = area
            .split('-')
            .slice(0, 2)
            .join('-')
            .trim();

        /* =========================
           QUERY BASE
        ========================= */

        let query = `
            SELECT
                id,
                codigo,
                persona,
                mes,
                anio,
                spg_total  AS cantidad,
                fecha
            FROM registros
            WHERE TRIM(area) LIKE $1
            AND anio = $2
            AND LOWER(estatus) = 'pagado'
        `;

        const params = [`${clave}%`, anio];

        /* =========================
           FILTRO MES (OPCIONAL)
        ========================= */

        if (mes) {

            query += ` AND UPPER(mes) = $3`;

            params.push(mes.toUpperCase());

        }

        query += ` ORDER BY fecha DESC NULLS LAST`;

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