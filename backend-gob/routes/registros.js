const express = require("express");

const pool = require("../database/db");

const router = express.Router();

/* =========================
   ESTATUS VÁLIDOS
========================= */

const ESTATUS = ["Creado", "Enviado", "Rechazado", "Pagado"];

/* =========================
   OBTENER REGISTROS
========================= */

router.get("/:area", async (req, res) => {
  try {
    const area = req.params.area.trim();

    const result = await pool.query(
      `
            SELECT

                r.*,

                CASE

                    WHEN gp.registro_id IS NOT NULL
                    THEN true

                    ELSE false

                END AS pagado,

                COALESCE(

                    gp.total_pagado,

                    0

                ) AS cantidad_pagada

            FROM registros r

            LEFT JOIN (

                SELECT

                    registro_id,

                    SUM(cantidad) AS total_pagado

                FROM gastos

                GROUP BY registro_id

            ) gp

            ON gp.registro_id = r.id

            WHERE TRIM(r.area) = $1

            ORDER BY

                CASE r.estatus

                    WHEN 'Creado' THEN 1
                    WHEN 'Rechazado' THEN 2
                    WHEN 'Enviado' THEN 3
                    WHEN 'Pagado' THEN 4
                    ELSE 5

                END,

                r.fecha DESC NULLS LAST
            `,

      [area],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,

      error: "Error obteniendo registros",
    });
  }
});

/* =========================
   GUARDAR REGISTRO
========================= */

router.post("/", async (req, res) => {
  try {
    const { codigo, area, persona, oficio_pdf, pliego_pdf } = req.body;

    /* =========================
           VALIDAR CAMPOS
        ========================= */

    if (!codigo || !area || !persona) {
      return res.status(400).json({
        ok: false,

        error: "Campos obligatorios incompletos",
      });
    }

    /* =========================
           VALIDAR DUPLICADO
        ========================= */

    const existe = await pool.query(
      `
            SELECT id

            FROM registros

            WHERE codigo = $1
            `,

      [codigo.trim()],
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({
        ok: false,

        error: "El código ya existe",
      });
    }

    /* =========================
           INSERTAR
        ========================= */

    await pool.query(
      `
            INSERT INTO registros(

                codigo,
                area,
                persona,
                oficio_pdf,
                pliego_pdf,
                estatus

            )

            VALUES($1,$2,$3,$4,$5,$6)
            `,

      [
        codigo.trim(),

        area.trim(),

        persona.trim(),

        oficio_pdf || "",

        pliego_pdf || "",

        "Creado",
      ],
    );

    res.json({
      ok: true,

      msg: "Registro guardado",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,

      error: "Error guardando registro",
    });
  }
});

/* =========================
   ENVIAR REGISTRO
========================= */

router.put("/enviar/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo.trim();

    const validar = await pool.query(
      `
            SELECT *

            FROM registros

            WHERE codigo = $1
            `,

      [codigo],
    );

    if (validar.rows.length === 0) {
      return res.status(404).json({
        ok: false,

        error: "Registro no encontrado",
      });
    }

    const registro = validar.rows[0];

    /* =========================
           VALIDAR PAGADO
        ========================= */

    if (registro.estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "El registro ya fue pagado",
      });
    }

    /* =========================
           VALIDAR YA ENVIADO
        ========================= */

    if (registro.estatus === "Enviado") {
      return res.status(400).json({
        ok: false,

        error: "El registro ya fue enviado",
      });
    }

    /* =========================
           ACTUALIZAR
        ========================= */

    await pool.query(
      `
            UPDATE registros

            SET

                estatus = 'Enviado'

            WHERE codigo = $1
            `,

      [codigo],
    );

    res.json({
      ok: true,

      msg: "Registro enviado",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,

      error: "Error enviando registro",
    });
  }
});

/* =========================
   REENVIAR REGISTRO
========================= */

router.put("/reenviar/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo.trim();

    const validar = await pool.query(
      `
            SELECT *

            FROM registros

            WHERE codigo = $1
            `,

      [codigo],
    );

    if (validar.rows.length === 0) {
      return res.status(404).json({
        ok: false,

        error: "Registro no encontrado",
      });
    }

    const registro = validar.rows[0];

    /* =========================
           VALIDAR PAGADO
        ========================= */

    if (registro.estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "No se puede reenviar un registro pagado",
      });
    }

    /* =========================
           ACTUALIZAR
        ========================= */

    await pool.query(
      `
            UPDATE registros

            SET

                estatus = 'Enviado',

                observaciones_admin = ''

            WHERE codigo = $1
            `,

      [codigo],
    );

    res.json({
      ok: true,

      msg: "Registro reenviado",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,

      error: "Error reenviando registro",
    });
  }
});

/* =========================
   GUARDAR OBSERVACIONES
========================= */

router.put("/observaciones/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo.trim();

    const { observaciones } = req.body;

    const validar = await pool.query(
      `
            SELECT estatus

            FROM registros

            WHERE codigo = $1
            `,

      [codigo],
    );

    if (validar.rows.length === 0) {
      return res.status(404).json({
        ok: false,

        error: "Registro no encontrado",
      });
    }

    const estatus = validar.rows[0].estatus;

    /* =========================
           VALIDAR BLOQUEO
        ========================= */

    if (estatus === "Enviado" || estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "No se puede editar este registro",
      });
    }

    /* =========================
           ACTUALIZAR
        ========================= */

    await pool.query(
      `
            UPDATE registros

            SET

                observaciones = $1

            WHERE codigo = $2
            `,

      [observaciones || "", codigo],
    );

    res.json({
      ok: true,

      msg: "Observaciones guardadas",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,

      error: "Error guardando observaciones",
    });
  }
});

/* =========================
   OBSERVACIONES ADMIN
========================= */

router.put("/observaciones-admin/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo.trim();

    const { observaciones_admin } = req.body;

    const validar = await pool.query(
      `
            SELECT id

            FROM registros

            WHERE codigo = $1
            `,

      [codigo],
    );

    if (validar.rows.length === 0) {
      return res.status(404).json({
        ok: false,

        error: "Registro no encontrado",
      });
    }

    await pool.query(
      `
            UPDATE registros

            SET

                observaciones_admin = $1

            WHERE codigo = $2
            `,

      [observaciones_admin || "", codigo],
    );

    res.json({
      ok: true,

      msg: "Observaciones admin guardadas",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,

      error: "Error guardando observaciones admin",
    });
  }
});

/* =========================
   CAMBIAR ESTATUS
========================= */

router.put("/estatus/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo.trim();

    const { estatus } = req.body;

    /* =========================
           VALIDAR ESTATUS
        ========================= */

    if (!ESTATUS.includes(estatus)) {
      return res.status(400).json({
        ok: false,

        error: "Estatus inválido",
      });
    }

    const validar = await pool.query(
      `
            SELECT *

            FROM registros

            WHERE codigo = $1
            `,

      [codigo],
    );

    if (validar.rows.length === 0) {
      return res.status(404).json({
        ok: false,

        error: "Registro no encontrado",
      });
    }

    const actual = validar.rows[0];

    /* =========================
           NO MODIFICAR PAGADOS
        ========================= */

    if (actual.estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "Registro finalizado",
      });
    }

    /* =========================
           PAGADO SOLO DESDE GASTOS
        ========================= */

    if (estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "El estatus Pagado solo puede asignarse desde gastos",
      });
    }

    /* =========================
           ACTUALIZAR
        ========================= */

    await pool.query(
      `
            UPDATE registros

            SET

                estatus = $1

            WHERE codigo = $2
            `,

      [estatus, codigo],
    );

    res.json({
      ok: true,

      msg: "Estatus actualizado",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,

      error: "Error actualizando estatus",
    });
  }
});

/* =========================
   ELIMINAR REGISTRO
========================= */

router.delete("/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo.trim();

    const validar = await pool.query(
      `
            SELECT *

            FROM registros

            WHERE codigo = $1
            `,

      [codigo],
    );

    if (validar.rows.length === 0) {
      return res.status(404).json({
        ok: false,

        error: "Registro no encontrado",
      });
    }

    const registro = validar.rows[0];

    /* =========================
           VALIDAR BLOQUEO
        ========================= */

    if (registro.estatus === "Enviado" || registro.estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "No se puede eliminar este registro",
      });
    }

    /* =========================
           ELIMINAR
        ========================= */

    await pool.query(
      `
            DELETE FROM registros

            WHERE codigo = $1
            `,

      [codigo],
    );

    res.json({
      ok: true,

      msg: "Registro eliminado",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,

      error: "Error eliminando registro",
    });
  }
});

module.exports = router;
