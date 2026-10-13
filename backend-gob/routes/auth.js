const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const pool = require("../database/db");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;
    console.log("BODY:", req.body);

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE usuario = $1",
      [usuario],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Usuario no encontrado",
      });
    }

    const user = result.rows[0];

    console.log("USUARIO DB:", user.usuario);

    console.log("PASSWORD ESCRITA:", password);

    console.log("HASH DB:", user.password_hash);

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        error: "Contraseña incorrecta",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        area: user.area,
        rol: user.rol,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "8h",
      },
    );

    res.json({
      token,
      area: user.area,
    });
  } catch (error) {
    console.error("ERROR LOGIN:", error);

    res.status(500).json({
      error: "Error servidor",
    });
  }
});

// Preferencias del usuario en sesión (apariencia del asistente: color, estrella,
// ropa, lentes y encendido). PUT recibe { asistente: { ...solo lo que cambió } }.
function conSesion(req, res, next) {
  try {
    req.user = jwt.verify(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''), process.env.JWT_SECRET);
    next();
  } catch (e) { res.status(401).json({ error: 'Sesión no válida' }); }
}
router.get("/preferencias", conSesion, async (req, res) => {
  try {
    const r = await pool.query("SELECT preferencias FROM usuarios WHERE id = $1", [req.user.id]);
    res.json(r.rows[0]?.preferencias || {});
  } catch (e) { res.status(500).json({ error: "No se pudieron leer las preferencias" }); }
});
router.put("/preferencias", conSesion, async (req, res) => {
  const cambios = req.body && typeof req.body.asistente === "object" ? req.body.asistente : null;
  if (!cambios) return res.status(400).json({ error: "Sin cambios que guardar" });
  try {
    const r = await pool.query(
      `UPDATE usuarios SET preferencias = jsonb_set(COALESCE(preferencias, '{}'::jsonb), '{asistente}',
         COALESCE(preferencias->'asistente', '{}'::jsonb) || $2::jsonb)
       WHERE id = $1 RETURNING preferencias`, [req.user.id, JSON.stringify(cambios)]);
    res.json(r.rows[0]?.preferencias || {});
  } catch (e) { res.status(500).json({ error: "No se pudieron guardar las preferencias" }); }
});

module.exports = router;
