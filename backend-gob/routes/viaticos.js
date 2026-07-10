const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {

    res.json({
        ok: true,
        mensaje: "Ruta de viáticos funcionando."
    });

});

module.exports = router;