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

/* =========================
   MIDDLEWARES
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

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