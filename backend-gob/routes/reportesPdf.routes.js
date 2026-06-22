const express = require("express");
const router = express.Router();

/* =========================
   POST /api/reportes/generar-pdf
========================= */

router.post("/generar-pdf", (req, res) => {

    console.log("=== ENTRÓ A reportesPdf.routes.js ===");

    return res.json({
        ok: true,
        mensaje: "Estoy en reportesPdf.routes.js"
    });

});

/* =========================
   GET /api/reportes/historial
========================= */

router.get("/historial", (req, res) => {

    return res.json({
        ok: true,
        data: []
    });

});

module.exports = router;