const express = require("express");
const router = express.Router();

const pool = require("../database/db");

// Obtener todas las unidades presupuestales
router.get("/unidades", async (req, res) => {

    try {

        const resultado = await pool.query(`
            SELECT
                id,
                clave,
                nombre
            FROM unidades_presupuestales
            ORDER BY clave
        `);

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener las unidades."
        });

    }

});

module.exports = router;