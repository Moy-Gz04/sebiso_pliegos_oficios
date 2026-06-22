router.post("/generar-pdf", (req, res) => {
    return res.json({
        ok: true,
        mensaje: "Estoy en reportesPdf.routes.js"
    });
});