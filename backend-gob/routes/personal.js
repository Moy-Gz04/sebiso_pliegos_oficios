const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../database/db");
const router = express.Router();

const CAMPOS = ["consecutivo", "nombre", "adscripcion", "cargo", "nivel", "rfc", "nivel_aplicacion",
  "no_cuenta", "no_trabajador", "unidad", "departamento"];
const LARGO_MAX = 200;
const COLUMNAS = `id, up, ${CAMPOS.join(", ")}, validado`;

// RFC y cuentas bancarias: cada sesión solo alcanza el personal de su propia U.P.
router.use((req, res, next) => {
  try {
    const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ ok: false, mensaje: "Tu sesión venció. Vuelve a iniciar sesión." });
  }
});

router.get("/", async (req, res) => {
  if (req.query.up !== req.usuario.area) return res.status(403).json({ ok: false, mensaje: "Sin acceso a esta U.P." });
  try {
    const { rows } = await pool.query(
      `SELECT ${COLUMNAS} FROM personal_up WHERE up = $1
       ORDER BY NULLIF(consecutivo, '')::int NULLS LAST, nombre`, [req.usuario.area]);
    res.json({ ok: true, registros: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, mensaje: "No se pudo consultar el personal." });
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ ok: false, mensaje: "Registro no válido." });
  const v = CAMPOS.map(c => String(req.body?.[c] ?? "").trim().slice(0, LARGO_MAX));
  if (!v[1]) return res.status(400).json({ ok: false, mensaje: "El nombre es obligatorio." });
  if (v[0] && !/^\d{1,6}$/.test(v[0])) return res.status(400).json({ ok: false, mensaje: "El ID debe ser un número." });
  v[5] = v[5].toUpperCase().slice(0, 13);
  try {
    const sets = CAMPOS.map((c, i) => `${c} = $${i + 1}`).join(", ");
    const n = CAMPOS.length;
    const { rows } = await pool.query(
      `UPDATE personal_up SET ${sets}, actualizado_por = $${n + 1}, actualizado_en = NOW(), validado = FALSE, validado_por = NULL, validado_en = NULL
       WHERE id = $${n + 2} AND up = $${n + 3} RETURNING ${COLUMNAS}`,
      [...v, String(req.usuario.id), id, req.usuario.area]);
    if (!rows.length) return res.status(404).json({ ok: false, mensaje: "El registro no existe en tu U.P." });
    res.json({ ok: true, registro: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, mensaje: "No se pudo guardar el registro." });
  }
});

router.put("/:id/validar", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ ok: false, mensaje: "Registro no válido." });
  const validado = req.body?.validado === true;
  try {
    if (validado) {
      const { rows: [r] } = await pool.query(`SELECT ${CAMPOS.join(", ")} FROM personal_up WHERE id = $1 AND up = $2`, [id, req.usuario.area]);
      if (r && CAMPOS.some(c => !String(r[c] ?? "").trim())) {
        return res.status(400).json({ ok: false, mensaje: "No se puede confirmar un registro con campos vacíos." });
      }
    }
    const { rows } = await pool.query(
      `UPDATE personal_up SET validado = $1, validado_por = $2, validado_en = CASE WHEN $1 THEN NOW() END
       WHERE id = $3 AND up = $4 RETURNING ${COLUMNAS}`,
      [validado, validado ? String(req.usuario.id) : null, id, req.usuario.area]);
    if (!rows.length) return res.status(404).json({ ok: false, mensaje: "El registro no existe en tu U.P." });
    res.json({ ok: true, registro: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, mensaje: "No se pudo guardar la confirmación." });
  }
});

module.exports = router;
