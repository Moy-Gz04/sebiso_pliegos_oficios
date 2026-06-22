const express = require("express");
const router  = require("express").Router();
const pool    = require('../database/db');
const fetch   = require("node-fetch");

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbySpfcdRU5TweY4v3Az5tZ2hTFJkFlMB63DKfz2osTYiNEmFsrD0mWUUG7AiUW0kS6i/exec";

const CARPETA_REPORTES_ID = "1FedukQX9YavoRev7BgTfJU-9qqQArDQc";  // ← agregado aquí

/* =========================
   POST /api/reportes-pdf/generar-pdf
========================= */

router.post("/generar-pdf", async (req, res) => {

    console.log("=== ENTRE A /generar-pdf ===");
    console.log(req.body);

    try {

        const { area, anio, meses } = req.body;

        const mesesArray = Array.isArray(meses) ? meses : [meses];

        const placeholders = mesesArray
            .map((_, i) => `$${i + 3}`)
            .join(", ");

        const sql = `
            SELECT
                TO_CHAR(g.fecha, 'Month') AS mes,
                r.persona AS persona,
                g.cantidad
            FROM gastos g
            JOIN registros r ON r.id = g.registro_id
            WHERE r.area         = $1
                AND EXTRACT(YEAR  FROM g.fecha) = $2
                AND EXTRACT(MONTH FROM g.fecha) IN (${placeholders})
                AND r.estatus = 'Pagado'
            ORDER BY g.fecha
        `;

        const params = [area, anio, ...mesesArray];

        console.log("SQL:");
        console.log(sql);

        console.log("PARAMS:");
        console.log(params);

        const { rows } = await pool.query(sql, params);

        const MESES_ES = [
            "Enero","Febrero","Marzo","Abril","Mayo","Junio",
            "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
        ];

        const periodo = mesesArray.length === 1
            ? `${MESES_ES[mesesArray[0] - 1]} ${anio}`
            : `${MESES_ES[mesesArray[0] - 1]} - ${MESES_ES[mesesArray[mesesArray.length - 1] - 1]} ${anio}`;

        const fechaGeneracion = new Date().toLocaleDateString("es-MX", {
            day: "2-digit", month: "long", year: "numeric"
        });

        const totalPagos = rows.length;
        const montoTotal = rows
            .reduce((sum, r) => sum + parseFloat(r.cantidad || 0), 0)
            .toLocaleString("es-MX", { style: "currency", currency: "MXN" });

        const fileName = `Reporte_${area.replace(/\s+/g, "_")}_${periodo.replace(/\s+/g, "_")}`;

        const payload = {
            tipo:             "REPORTE",
            folderId:         CARPETA_REPORTES_ID,  // ← agregado
            area,
            periodo,
            fechaGeneracion,
            registros: rows.map(r => ({
                mes:      r.mes.trim(),
                persona:  r.persona,
                cantidad: parseFloat(r.cantidad).toLocaleString("es-MX", {
                    style: "currency", currency: "MXN"
                })
            })),
            totalPagos,
            montoTotal,
            fileName
        };

        console.log("=== ANTES DE LLAMAR APPS SCRIPT ===");
        console.log(payload);

        const respAS = await fetch(APPS_SCRIPT_URL, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(payload)
        });

        const texto = await respAS.text();

        console.log("STATUS:", respAS.status);
        console.log("RESPUESTA:", texto);

        const resultAS = JSON.parse(texto);

        if (!resultAS.ok) {
            return res.status(500).json({ ok: false, error: resultAS.error });
        }

        await pool.query(
            `INSERT INTO reportes_generados
               (area, periodo, anio, total_pagos, monto_total, pdf_url)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                area, periodo, anio, totalPagos,
                rows.reduce((s, r) => s + parseFloat(r.cantidad || 0), 0),
                resultAS.url
            ]
        );

        return res.json({ ok: true, url: resultAS.url });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: err.message });
    }

});

/* =========================
   GET /api/reportes-pdf/historial
========================= */

router.get("/historial", async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, area, periodo, anio, total_pagos, monto_total, pdf_url, fecha
             FROM reportes_generados
             ORDER BY fecha DESC
             LIMIT 50`
        );
        return res.json({ ok: true, data: rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;