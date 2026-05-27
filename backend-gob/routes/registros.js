const express = require("express");

const pool = require("../database/db");

const router = express.Router();

/* =========================
   ESTATUS VÁLIDOS
========================= */

const ESTATUS = ["Creado", "Enviado", "Rechazado", "Pagado"];

/* =========================
   OBTENER REGISTRO POR CÓDIGO
========================= */
router.get("/codigo/:codigo", async (req, res) => {

  try {

    const codigo =
    req.params.codigo.trim();

    const result =
    await pool.query(

      `
      SELECT

          r.*,

          ap.id AS area_id

      FROM registros r

      LEFT JOIN areas_presupuestales ap
      ON TRIM(ap.clave_area) = TRIM(r.area)

      WHERE r.codigo = $1
      `,
      [codigo]

    );

    if (result.rows.length === 0) {

      return res.status(404).json({

        ok: false,

        error: "Registro no encontrado",

      });

    }

    res.json(
      result.rows[0]
    );

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      ok: false,

      error: error.message,

    });

  }

});
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
    const {
      codigo,
      area,
      persona,
      oficio_pdf,
      pliego_pdf,

      municipio,
      dia_inicio,
      dia_fin,
      mes,

      motivo_comision,

      localidades_visitadas,
    } = req.body;

    if (!codigo || !area || !persona) {
      return res.status(400).json({
        ok: false,

        error: "Campos obligatorios incompletos",
      });
    }

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

    await pool.query(
      `
      INSERT INTO registros(

          codigo,
          area,
          persona,

          oficio_pdf,
          pliego_pdf,

          municipio,
          dia_inicio,
          dia_fin,
          mes,

          motivo_comision,

          localidades_visitadas,

          estatus

      )

      VALUES(

          $1,
          $2,
          $3,

          $4,
          $5,

          $6,
          $7,
          $8,
          $9,

          $10,

          $11,

          $12

      )
      `,
      [
        codigo.trim(),
        area.trim(),
        persona.trim(),
        oficio_pdf || "",
        pliego_pdf || "",
        municipio || "",
        dia_inicio || "",
        dia_fin || "",
        mes || "",
        motivo_comision || "",
        localidades_visitadas || "",
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

    if (registro.estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "El registro ya fue pagado",
      });
    }

    if (registro.estatus === "Enviado") {
      return res.status(400).json({
        ok: false,

        error: "El registro ya fue enviado",
      });
    }

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

    if (registro.estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "No se puede reenviar un registro pagado",
      });
    }

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

    if (estatus === "Enviado" || estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "No se puede editar este registro",
      });
    }

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

    if (actual.estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "Registro finalizado",
      });
    }

    if (estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "El estatus Pagado solo puede asignarse desde gastos",
      });
    }

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

    if (registro.estatus === "Enviado" || registro.estatus === "Pagado") {
      return res.status(400).json({
        ok: false,

        error: "No se puede eliminar este registro",
      });
    }

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

/* =========================
   GUARDAR SPG PDF
========================= */

router.put("/spg/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo.trim();

    const {
      spg_pdf,
      ur,
      up,
      rubro,
      og,
      proyecto,
      cuenta,
      monto,
      retenciones,
      total,
      anio,
    } = req.body;

    if (!spg_pdf) {
      return res.status(400).json({
        ok: false,

        error: "URL SPG requerida",
      });
    }

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

          spg_pdf = $1,

          ur = $2,
          up = $3,
          rubro = $4,
          og = $5,
          proyecto = $6,
          cuenta = $7,

          spg_monto = $8,
          spg_retenciones = $9,
          spg_total = $10,

          anio = $11

      WHERE codigo = $12
      `,
      [
        spg_pdf,
        ur,
        up,
        rubro,
        og,
        proyecto,
        cuenta,
        parseFloat(String(monto).replace(/[$,\s]/g, "")),
        parseFloat(String(retenciones).replace(/[$,\s]/g, "")),
        parseFloat(String(total).replace(/[$,\s]/g, "")),
        Number(anio),
        codigo,
      ],
    );

    res.json({
      ok: true,

      msg: "SPG guardado",
    });
  } catch (error) {
    console.log("ERROR REAL SPG:");
    console.log(error);

    res.status(500).json({
      ok: false,

      error: error.message,

      detail: error.detail || null,

      stack: error.stack,
    });
  }
});

/* =========================
   GUARDAR RECIBO PDF
========================= */

router.put("/recibo/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo.trim();

    const { recibo_pdf } = req.body;

    if (!recibo_pdf) {
      return res.status(400).json({
        ok: false,

        error: "URL recibo requerida",
      });
    }

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

          recibo_pdf = $1

      WHERE codigo = $2
      `,
      [recibo_pdf, codigo],
    );

    res.json({
      ok: true,

      msg: "Recibo guardado",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,

      error: "Error guardando recibo",
    });
  }
});

/* =========================
   GUARDAR FACTURA PDF
========================= */

router.put("/factura/:codigo", async (req, res) => {

  try {

    const codigo =
    req.params.codigo.trim();

    const {
      factura_pdf
    } = req.body;

    if (!factura_pdf) {

      return res.status(400).json({

        ok: false,

        error: "URL factura requerida",

      });

    }

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

          factura_pdf = $1

      WHERE codigo = $2
      `,
      [
        factura_pdf,
        codigo
      ],
    );

    res.json({

      ok: true,

      msg: "Factura guardada",

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      ok: false,

      error: "Error guardando factura",

    });

  }

});

/* =========================
   GUARDAR OFICIO2 PDF
========================= */

router.put(

    '/oficio2/:codigo',

    async(req,res)=>{

        try{

            const { codigo } =
            req.params;

            const {

                oficio2_pdf

            } = req.body;

            const result =
            await pool.query(

                `
                UPDATE registros
                SET oficio2_pdf = $1
                WHERE codigo = $2
                RETURNING *
                `,

                [

                    oficio2_pdf,

                    codigo

                ]

            );

            if(result.rows.length === 0)
            {
                return res.status(404).json({

                    ok:false,

                    error:'Registro no encontrado'

                });
            }

            res.json({

                ok:true,

                registro:
                result.rows[0]

            });

        }

        catch(error){

            console.error(
                'ERROR OFICIO2 PDF:',
                error
            );

            res.status(500).json({

                ok:false,

                error:error.message

            });

        }

    }

);
module.exports = router;