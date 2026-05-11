const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const pool = require("../database/db");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

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
    console.log(error);

    res.status(500).json({
      error: "Error servidor",
    });
  }
});

module.exports = router;
