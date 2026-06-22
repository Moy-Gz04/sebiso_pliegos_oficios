const express  = require("express");
const router   = express.Router();
const { Pool } = require("pg");
const fetch    = require("node-fetch");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzI48HUnb8JQdR8eSj15lXlI63lPMajFomPU-oqdWJbzvVc_aO31o9Bw8QZqa3oRQYVjg/exec";

/* =========================
   POST /api/reportes/generar-pdf
========================= */

router.post("/generar-pdf", async (req, res) => {

  try {

    const { area, anio, meses } = req.body;
    // meses: número único (6) o array ([1,2,3,4,5,6])

    const mesesArray = Array.isArray(meses) ? meses : [meses];

    /* --- Consultar filas --- */

    const placeholders = mesesArray
      .map((_, i) => `$${i + 3}`)
      .join(", ");

    const sql = `
      SELECT
        TO_CHAR(g.fecha, 'Month') AS mes,
        r.persona_nombre           AS persona,
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
    const { rows } = await pool.query(sql, params);

    console.log("SQL:");
    console.log(sql);

    console.log("PARAMS:");
    console.log(params);

    /* --- Construir periodo legible --- */

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

    /* --- Llamar Apps Script --- */

    const payload = {
      tipo: "REPORTE",
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

    const respAS = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
    });

    const texto = await respAS.text();

    console.log("STATUS:", respAS.status);
    console.log("RESPUESTA:");
    console.log(texto);

    const resultAS = JSON.parse(texto);

    if (!resultAS.ok) {
      return res.status(500).json({ ok: false, error: resultAS.error });
    }

    /* --- Guardar en historial --- */
    console.log("SQL:");
console.log(sql);

console.log("PARAMS:");
console.log(params);

    await pool.query(
      `INSERT INTO reportes_generados
         (area, periodo, anio, total_pagos, monto_total, pdf_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [area, periodo, anio, totalPagos, rows.reduce((s, r) => s + parseFloat(r.cantidad || 0), 0), resultAS.url]
    );

    return res.json({ ok: true, url: resultAS.url });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }

});

/* =========================
   GET /api/reportes/historial
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