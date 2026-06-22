require('dotenv').config();

const express = require('express');

const cors = require('cors');

const helmet = require('helmet');

const rateLimit =
require('express-rate-limit');

const path = require('path');

/* =========================
   EXPRESS
========================= */

const app = express();

/* =========================
   RUTAS
========================= */

const authRoutes =
require('./routes/auth');

const registrosRoutes =
require('./routes/registros');

const presupuestosRoutes =
require('./routes/presupuestos');

const gastosRoutes =
require('./routes/gastos.routes');

const reportesRoutes =
require('./routes/reportes.routes');

/* =========================
   RUTA SPG
========================= */

const spgRoutes =
require('./routes/spg');

/* =========================
   RUTA RECIBO
========================= */

const reciboRoutes =
require('./routes/recibo');

/* =========================
   RUTA FACTURA
========================= */

const facturaRoutes =
require('./routes/factura');

/* =========================
   RUTA OFICIO 2
========================= */

const oficio2Routes =
require('./routes/oficio2');

/* =========================
   RUTA REPORTES
========================= */
const reportesPdfRoutes = 
require("./routes/reportesPdf.routes");

/* =========================
   MIDDLEWARES
========================= */

app.use(express.json());

app.use(express.urlencoded({

    extended:true

}));

app.use(cors());

app.use(helmet());

app.use(rateLimit({

    windowMs: 15 * 60 * 1000,

    max:100

}));

/* =========================
   CARPETA PÚBLICA PDFs
========================= */

app.use(

    '/uploads',

    express.static(

        path.join(__dirname, 'uploads')

    )

);

/* =========================
   LOGIN / AUTH
========================= */

app.use(

    '/api/auth',

    authRoutes

);

/* =========================
   REGISTROS
========================= */

app.use(

    '/api/registros',

    registrosRoutes

);

/* =========================
   PRESUPUESTOS
========================= */

app.use(

    '/api/presupuestos',

    presupuestosRoutes

);

/* =========================
   GASTOS
========================= */

app.use(

    '/api/gastos',

    gastosRoutes

);

/* =========================
   REPORTES
========================= */

app.use(

    '/api/reportes',

    reportesRoutes

);

/* =========================
   SPG
========================= */

app.use(

    '/api/spg',

    spgRoutes

);

/* =========================
   RECIBO
========================= */

app.use(

    '/api/recibo',

    reciboRoutes

);

/* =========================
   FACTURA
========================= */

app.use(

    '/api/factura',

    facturaRoutes

);

/* =========================
   OFICIO 2
========================= */

app.use(

    '/api/oficio2',

    oficio2Routes

);

app.use(

    "/api/reportes", 

    reportesPdfRoutes)

;

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {

    res.send(

        "API funcionando"

    );

});

/* =========================
   ERROR 404
========================= */

app.use((req, res) => {

    res.status(404).json({

        ok:false,

        msg:'Ruta no encontrada'

    });

});

/* =========================
   ERROR GENERAL
========================= */

app.use((err, req, res, next) => {

    console.log(err);

    res.status(500).json({

        ok:false,

        msg:'Error interno servidor'

    });

});

/* =========================
   SERVIDOR
========================= */

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(

        `Servidor funcionando en puerto ${PORT}`

    );

});