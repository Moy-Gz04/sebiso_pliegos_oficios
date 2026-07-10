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

// Registrar un viático
router.post("/", async (req, res) => {

    try {

        const {
            unidad_id,
            nombre_servidor,
            rfc,
            mes,
            municipio,
            importe
        } = req.body;

        if (
            !unidad_id ||
            !nombre_servidor ||
            !rfc ||
            !mes ||
            !municipio ||
            !importe
        ) {

            return res.status(400).json({

                ok: false,

                mensaje: "Todos los campos son obligatorios."

            });

        }

        const resultado = await pool.query(

            `
            INSERT INTO viaticos
            (
                unidad_id,
                nombre_servidor,
                rfc,
                mes,
                municipio,
                importe
            )
            VALUES
            ($1,$2,$3,$4,$5,$6)
            RETURNING *
            `,

            [
                unidad_id,
                nombre_servidor,
                rfc,
                mes,
                municipio,
                importe
            ]

        );

        res.json({

            ok: true,

            registro: resultado.rows[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            ok: false,

            mensaje: "Error al guardar el registro."

        });

    }

});

// Obtener viáticos por unidad
router.get("/", async (req, res) => {

    try {

        const { unidad_id } = req.query;

        if (!unidad_id) {

            return res.status(400).json({

                ok: false,

                mensaje: "Debe indicar una unidad."

            });

        }

        const resultado = await pool.query(

            `
            SELECT *

            FROM viaticos

            WHERE unidad_id=$1

            ORDER BY fecha_registro DESC
            `,

            [unidad_id]

        );

        res.json({

            ok: true,

            registros: resultado.rows

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            ok: false,

            mensaje: "Error al consultar."

        });

    }

});

module.exports = router;