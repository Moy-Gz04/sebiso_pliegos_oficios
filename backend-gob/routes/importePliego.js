const express = require("express");
const rateLimit = require("express-rate-limit");
const pool = require("../database/db");
const router = express.Router();

/* ============================================================
   IMPORTE DESDE EL PLIEGO
   Para el documento de viáticos: en lugar de escribir el importe a
   mano, se lee del PDF del pliego. El Apps Script del área (dueño de
   la carpeta de Drive) entrega el PDF solo con la contraseña
   PLIEGOS_SECRETO, Gemini lee el importe total y se guarda en
   registros.importe_viaticos.
   ============================================================ */

/* Apps Script que generó los pliegos de cada área (mismo que usa el formulario) */
const SCRIPT_PLIEGOS = {
  "UP-08": "https://script.google.com/macros/s/AKfycbzkKPjRkiQOc1F_kfXQCP8smmCSQ3uk9v6UODmHj6g1dDvM150zBxuAT8CRSYUCP0qN/exec",
};

const MODELO = "gemini-3.1-flash-lite";

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, msg: "Demasiadas lecturas de pliegos. Intenta de nuevo en unos minutos." },
});

const idDeDrive = (url) => {
  const m = String(url || "").match(/\/d\/([A-Za-z0-9_-]{20,})|[?&]id=([A-Za-z0-9_-]{20,})/);
  return m ? (m[1] || m[2]) : null;
};

async function pdfDelPliego(scriptUrl, fileId) {
  const r = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "pliegoBase64", secreto: process.env.PLIEGOS_SECRETO, fileId }),
    redirect: "follow",
  });
  const texto = await r.text();
  let j;
  try { j = JSON.parse(texto); } catch (e) {
    throw new Error("El Apps Script no respondió JSON (¿falta actualizarlo?)");
  }
  if (!j.success) throw new Error("Apps Script: " + (j.error || "sin archivo"));
  return j.base64;
}

async function leerImporteConGemini(base64) {
  const llaves = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_3, process.env.GEMINI_API_KEY_5].filter(Boolean);
  if (!llaves.length) throw new Error("GEMINI_API_KEY no configurada");
  const cuerpo = JSON.stringify({
    contents: [{
      parts: [
        { inlineData: { mimeType: "application/pdf", data: base64 } },
        { text: "Este PDF es un pliego de comisión (viáticos) del Gobierno del Estado de Hidalgo. " +
                "Devuelve el IMPORTE TOTAL de viáticos que se le pagará a la persona (el total final del pliego, " +
                "en pesos, con centavos). No devuelvas tarifas unitarias ni subtotales: solo el total. " +
                "En 'evidencia' copia literalmente la etiqueta y la cifra tal como aparecen en el documento." },
      ],
    }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 256,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: { importe: { type: "NUMBER" }, evidencia: { type: "STRING" } },
        required: ["importe", "evidencia"],
      },
    },
  });

  let data = null;
  for (let intento = 0; intento < 4; intento++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${llaves[intento % llaves.length]}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: cuerpo, signal: controller.signal }
      );
      data = await resp.json();
      if (data?.candidates?.[0]?.content?.parts?.length) break;
      console.warn(`⚠️  importe-pliego intento ${intento + 1}/4: ${JSON.stringify(data).slice(0, 160)}`);
    } catch (e) {
      console.warn(`⚠️  importe-pliego intento ${intento + 1}/4: ${e.message}`);
    } finally {
      clearTimeout(timeout);
    }
    await new Promise(r => setTimeout(r, 700 * (intento + 1)));
  }
  const texto = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
  if (!texto) throw new Error("Gemini no devolvió respuesta");
  const r = JSON.parse(texto);
  const importe = Math.round(Number(r.importe) * 100) / 100;
  if (!(importe > 0) || importe > 1000000) throw new Error("Importe no válido leído del pliego: " + r.importe);
  return { importe, evidencia: String(r.evidencia || "").slice(0, 200) };
}

/* POST /api/importe-pliego/:codigo  → lee el importe del pliego y lo guarda */
router.post("/:codigo", limitador, async (req, res) => {
  const codigo = String(req.params.codigo || "").trim();
  try {
    if (!process.env.PLIEGOS_SECRETO) {
      return res.status(503).json({ ok: false, msg: "La lectura de pliegos no está configurada en el servidor." });
    }
    const { rows } = await pool.query(
      `SELECT codigo, area, up, pliego_pdf, estatus FROM registros WHERE codigo = $1`, [codigo]
    );
    if (!rows.length) return res.status(404).json({ ok: false, msg: "Registro no encontrado" });
    const reg = rows[0];
    const area = String(reg.area || reg.up || codigo.split("_")[0]).toUpperCase();
    const scriptUrl = SCRIPT_PLIEGOS[area] || SCRIPT_PLIEGOS[codigo.split("_")[0]];
    if (!scriptUrl) return res.status(400).json({ ok: false, msg: "Esta área todavía no tiene lectura automática del pliego." });
    const fileId = idDeDrive(reg.pliego_pdf);
    if (!fileId) return res.status(400).json({ ok: false, msg: "Este registro no tiene pliego generado." });
    const soloLeer = req.query.soloLeer === "1";   // prueba: lee el importe sin guardarlo
    if (!soloLeer && (reg.estatus === "Enviado" || reg.estatus === "Pagado")) {
      return res.status(400).json({ ok: false, msg: "No se puede editar este registro" });
    }

    const base64 = await pdfDelPliego(scriptUrl, fileId);
    const { importe, evidencia } = await leerImporteConGemini(base64);

    if (!soloLeer) await pool.query(`UPDATE registros SET importe_viaticos = $1 WHERE codigo = $2`, [importe.toFixed(2), codigo]);
    res.json({ ok: true, codigo, importe, evidencia, guardado: !soloLeer });
  } catch (err) {
    console.error("⚠️  importe-pliego", codigo, err.message);
    res.status(502).json({ ok: false, msg: "No se pudo leer el importe del pliego: " + err.message });
  }
});

module.exports = router;
