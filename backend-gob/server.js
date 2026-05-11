require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/* =========================
   RUTAS
========================= */

const authRoutes =
require('./routes/auth');

/* =========================
   NUEVA RUTA REGISTROS
========================= */

const registrosRoutes =
require('./routes/registros');

const app = express();

/* =========================
   MIDDLEWARES
========================= */

app.use(express.json());

app.use(cors());

app.use(helmet());

app.use(rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 100

}));

/* =========================
   LOGIN / AUTH
========================= */

app.use('/api/auth', authRoutes);

/* =========================
   CONSULTA REGISTROS
========================= */

app.use(
    '/api/registros',
    registrosRoutes
);

const PORT =
process.env.PORT || 3000;

app.get("/", (req, res) => {

    res.send("API funcionando");

});

/* =========================
   SERVIDOR
========================= */

app.listen(PORT, () => {

    console.log(
        `Servidor funcionando en puerto ${PORT}`
    );

});