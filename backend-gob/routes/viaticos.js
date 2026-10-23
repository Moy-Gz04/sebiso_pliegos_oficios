const express = require("express");
const router = express.Router();

const pool = require("../database/db");

/*=====================================================
OBTENER UNIDADES PRESUPUESTALES
=====================================================*/

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

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            ok:false,

            mensaje:"Error al obtener las unidades."

        });

    }

});

/*=====================================================
REGISTRAR MANUALMENTE
=====================================================*/

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

        if(

            !unidad_id ||

            !nombre_servidor ||

            !rfc ||

            !mes ||

            !municipio ||

            !importe

        ){

            return res.status(400).json({

                ok:false,

                mensaje:"Todos los campos son obligatorios."

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

            ok:true,

            registro:resultado.rows[0]

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            ok:false,

            mensaje:"Error al guardar."

        });

    }

});

/*=====================================================
CONSULTAR VIÁTICOS POR UNIDAD
=====================================================*/

router.get("/", async(req,res)=>{

    try{

        const { unidad_id } = req.query;

        if(!unidad_id){

            return res.status(400).json({

                ok:false,

                mensaje:"Seleccione una Unidad."

            });

        }

        const resultado=await pool.query(

            `

            SELECT *

            FROM viaticos

            WHERE unidad_id=$1

            ORDER BY fecha_registro DESC

            `,

            [

                unidad_id

            ]

        );

        res.json({

            ok:true,

            registros:resultado.rows

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            ok:false,

            mensaje:"Error al consultar."

        });

    }

});

/*=====================================================
IMPORTAR EXCEL
=====================================================*/

router.post("/importar", async (req, res) => {

    const client = await pool.connect();

    try {

        const { unidad_id, registros } = req.body;

        if (!unidad_id) {

            return res.status(400).json({

                ok: false,

                mensaje: "Seleccione una Unidad Presupuestal."

            });

        }

        if (!Array.isArray(registros) || registros.length === 0) {

            return res.status(400).json({

                ok: false,

                mensaje: "El archivo no contiene registros."

            });

        }

        await client.query("BEGIN");

        const sql = `

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

        `;

        /* Sin duplicados: si el mismo Excel se vuelve a subir (por ejemplo con renglones
           nuevos al final), solo se agrega lo que todavía no está. Se cuenta cuántas veces
           existe cada renglón (nombre, RFC, mes, municipio, importe), para respetar los
           renglones que se repiten a propósito dentro del archivo. */
        const clave = (f) => [f.nombre_servidor, f.rfc, f.mes, f.municipio, Number(f.importe || 0).toFixed(2)]
            .map(v => String(v ?? '').trim().toUpperCase()).join('|');
        const existentes = new Map();
        const previos = await client.query(
            'SELECT nombre_servidor, rfc, mes, municipio, importe FROM viaticos WHERE unidad_id = $1',
            [unidad_id]
        );
        previos.rows.forEach(f => existentes.set(clave(f), (existentes.get(clave(f)) || 0) + 1));

        let insertados = 0, omitidos = 0;
        for (const fila of registros) {
            const k = clave(fila);
            if ((existentes.get(k) || 0) > 0) { existentes.set(k, existentes.get(k) - 1); omitidos++; continue; }
            await client.query(sql, [
                unidad_id,
                String(fila.nombre_servidor || '').trim(),
                String(fila.rfc || '').trim().toUpperCase(),
                String(fila.mes || '').trim().toUpperCase(),
                String(fila.municipio || '').trim().toUpperCase(),
                Number(fila.importe || 0)
            ]);
            insertados++;
        }

        await client.query("COMMIT");

        res.json({
            ok: true,
            mensaje: `${insertados} registro(s) agregado(s)` + (omitidos ? `; ${omitidos} ya existían.` : '.'),
            insertados,
            omitidos,
            total: registros.length
        });

    }

    catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({

            ok: false,

            mensaje: "Error al importar el archivo."

        });

    }

    finally {

        client.release();

    }

});


/*=====================================================
TODOS LOS VIÁTICOS (tabla dinámica: todas las U.P.)
=====================================================*/
router.get("/todos", async (req, res) => {
    try {
        const r = await pool.query(`
            SELECT v.id, v.nombre_servidor, v.rfc, v.mes, v.municipio, v.importe, v.fecha_registro,
                   v.unidad_id, u.clave AS up_clave, u.nombre AS up_nombre
            FROM viaticos v
            JOIN unidades_presupuestales u ON u.id = v.unidad_id
            ORDER BY u.clave, v.id`);
        res.json({ ok: true, registros: r.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al consultar." });
    }
});

/*=====================================================
ELIMINAR UN REGISTRO
=====================================================*/
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, mensaje: "Registro inválido." });
        const r = await pool.query("DELETE FROM viaticos WHERE id = $1 RETURNING id", [id]);
        if (!r.rowCount) return res.status(404).json({ ok: false, mensaje: "El registro ya no existe." });
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar." });
    }
});

module.exports = router;
