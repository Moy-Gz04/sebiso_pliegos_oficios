require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

/* =========================
   EXPRESS
========================= */

const app = express();

/* =========================
   RUTAS
========================= */

const authRoutes         = require('./routes/auth');
const registrosRoutes    = require('./routes/registros');
const presupuestosRoutes = require('./routes/presupuestos');
const gastosRoutes       = require('./routes/gastos.routes');
const reportesRoutes     = require('./routes/reportes.routes');
const spgRoutes          = require('./routes/spg');
const reciboRoutes       = require('./routes/recibo');
const facturaRoutes      = require('./routes/factura');
const oficio2Routes      = require('./routes/oficio2');
const reportesPdfRoutes  = require('./routes/reportesPdf.routes');
const viaticosRoutes = require("./routes/viaticos");
const viaticosGeneradosRoutes = require("./routes/viaticosGenerados");
const iaRoutes = require("./routes/ia");
const importePliegoRoutes = require("./routes/importePliego");


/* =========================
   MIDDLEWARES
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
// Render pasa cada petición por su proxy: sin esto, el límite contaba a TODOS
// los usuarios como una sola IP y bastaban 100 peticiones de cualquiera para
// bloquear a toda la oficina 15 minutos («No se pudo conectar al servidor»).
app.set('trust proxy', 1);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false }));
// El inicio de sesión conserva un límite propio, más estricto, contra intentos repetidos
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }));

/* =========================
   CARPETA PÚBLICA PDFs
========================= */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
/* =========================
   ENDPOINTS
========================= */
app.use('/api/auth',         authRoutes);
app.use('/api/registros',    registrosRoutes);
app.use('/api/presupuestos', presupuestosRoutes);
app.use('/api/gastos',       gastosRoutes);
app.use('/api/reportes',     reportesRoutes);
app.use('/api/spg',          spgRoutes);
app.use('/api/recibo',       reciboRoutes);
app.use('/api/factura',      facturaRoutes);
app.use('/api/oficio2',      oficio2Routes);
app.use('/api/reportes-pdf', reportesPdfRoutes);  // ← cambiado para evitar conflicto
app.use("/api/viaticos", viaticosRoutes);
app.use("/api/viaticos-generados", viaticosGeneradosRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/importe-pliego", importePliegoRoutes);

/* =========================
   ROOT
========================= */

app.get('/', (req, res) => {
    res.send('API funcionando');
});

/* =========================
   ERROR 404
========================= */

app.use((req, res) => {
    res.status(404).json({ ok: false, msg: 'Ruta no encontrada' });
});

/* =========================
   ERROR GENERAL
========================= */

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({ ok: false, msg: 'Error interno servidor' });
});

/* =========================
   SERVIDOR
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor funcionando en puerto ${PORT}`);
});