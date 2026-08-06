const express = require('express');

const router = express.Router();

const pool = require('../database/db');

/* =========================
   GUARDAR VIÁTICOS GENERADOS
   Se llama después de que el Apps Script
   devuelve la URL del PDF ya creado.
========================= */

router.post(

    '/',

    async (req, res) => {

        try {

            const {

                area,
                pdf_url,
                detalle

            } = req.body;

            if (

                !area ||
                !pdf_url ||
                !Array.isArray(detalle) ||
                detalle.length === 0

            ) {

                return res.status(400).json({

                    ok: false,

                    msg: 'Faltan datos (area, pdf_url, detalle)'

                });

            }

            const resultado = await pool.query(

                `
                INSERT INTO viaticos_generados(

                    area,
                    pdf_url,
                    total_personas,
                    detalle

                )

                VALUES(

                    $1,
                    $2,
                    $3,
                    $4

                )

                RETURNING *
                `,
                [

                    area,
                    pdf_url,
                    detalle.length,
                    JSON.stringify(detalle)

                ]

            );

            res.json({

                ok: true,

                registro: resultado.rows[0]

            });

        }

        catch (error) {

            console.error('ERROR GUARDANDO VIÁTICOS:', error);

            res.status(500).json({

                ok: false,

                msg: 'Error guardando viáticos generados',

                error: error.message

            });

        }

    }

);

/* =========================
   LISTAR VIÁTICOS GENERADOS POR ÁREA
========================= */

router.get(

    '/:area',

    async (req, res) => {

        try {

            const { area } = req.params;

            const resultado = await pool.query(

                `
                SELECT *
                FROM viaticos_generados
                WHERE area = $1
                ORDER BY fecha_generacion DESC
                `,
                [area]

            );

            res.json({

                ok: true,

                registros: resultado.rows

            });

        }

        catch (error) {

            console.error('ERROR LISTANDO VIÁTICOS:', error);

            res.status(500).json({

                ok: false,

                msg: 'Error obteniendo viáticos generados'

            });

        }

    }

);

module.exports = router;