const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

/* ============================================================
   LLENADO INTELIGENTE (UP S)
   Recibe las respuestas del usuario a unas preguntas cortas y usa
   Gemini para redactar MOTIVO, ACTIVIDADES y LOCALIDADES con el
   formato que exige el formulario. Solo redacta: el usuario revisa
   y envía. La llave (GEMINI_API_KEY) vive solo en el servidor.
   ============================================================ */

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, msg: "Demasiadas solicitudes de redacción. Intenta de nuevo en unos minutos." },
});

const MODELO = "gemini-3.1-flash-lite";
const limpiar = (v, max = 1200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function construirPrompt(d) {
  return `Eres un asistente que redacta comisiones oficiales para oficios de gobierno en México (Secretaría de Bienestar e Inclusión Social del Estado de Hidalgo). Redacta en español formal, claro y conciso.

DATOS DE LA COMISIÓN
- Municipio: ${d.municipio}
- Periodo: ${d.periodo}

RELATO DE LA PERSONA, con sus propias palabras (única fuente de verdad; no inventes nombres, cifras, cargos ni hechos que no estén aquí; corrige ortografía y redacción):
"""${d.relato}"""

Del relato extrae el objetivo de la comisión, las actividades realizadas y las localidades visitadas.

Devuelve un JSON con exactamente tres campos de texto:

"motivo": UNA sola oración que completa la idea "El motivo de la comisión es...", en infinitivo o sustantivo (ej. "realizar la supervisión de ...", "llevar a cabo la entrega de ..."). REGLAS ESTRICTAS: la primera letra va en MINÚSCULA y termina con un PUNTO final. No repitas el municipio ni las fechas.

"actividades": arreglo de 2 a 6 actividades (un elemento por actividad, SIN guion al inicio), redactadas como frases nominales uniformes y gramaticalmente correctas (ej. "Reunión con el delegado municipal.", "Entrega de apoyos alimentarios.", "Levantamiento de padrón."), cada una con mayúscula inicial y terminada en punto. Basadas solo en el relato.

"localidades": arreglo con un elemento por localidad, con el formato "Localidad NOMBRE" (la palabra Localidad seguida del nombre, tal cual lo escribió la persona con ortografía corregida). Solo localidades que el relato mencione EXPRESAMENTE. El municipio de los datos de la comisión NO es una localidad: nunca lo uses como localidad ni lo deduzcas. Si el relato no nombra ninguna localidad, devuelve un arreglo vacío [].

Devuelve SOLO el JSON.`;
}

router.post("/redactar-up", limitador, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ ok: false, msg: "El llenado inteligente no está configurado en el servidor." });
    }
    const b = req.body || {};
    const d = {
      municipio:   limpiar(b.municipio, 120),
      periodo:     limpiar(b.periodo, 120),
      relato:      limpiar(b.relato, 3000),
    };
    if (d.relato.length < 15) {
      return res.status(400).json({ ok: false, msg: "Cuéntanos un poco más de lo que hicieron." });
    }

    /* Gemini a veces responde 503 "alta demanda": hasta 4 intentos, rotando
       entre las llaves disponibles (GEMINI_API_KEY, _3, _5) y con pausa corta. */
    const llaves = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_3, process.env.GEMINI_API_KEY_5].filter(Boolean);
    const cuerpo = JSON.stringify({
      contents: [{ parts: [{ text: construirPrompt(d) }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            motivo:      { type: "STRING" },
            actividades: { type: "ARRAY", items: { type: "STRING" } },
            localidades: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["motivo", "actividades", "localidades"],
        },
      },
    });

    let data = null;
    for (let intento = 0; intento < 4; intento++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${llaves[intento % llaves.length]}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: cuerpo, signal: controller.signal }
        );
        data = await resp.json();
        if (data?.candidates?.[0]?.content?.parts?.length) break;
        console.warn(`⚠️  redactar-up intento ${intento + 1}/4: ${JSON.stringify(data).slice(0, 160)}`);
      } catch (e) {
        console.warn(`⚠️  redactar-up intento ${intento + 1}/4: ${e.message}`);
      } finally {
        clearTimeout(timeout);
      }
      await new Promise(r => setTimeout(r, 700 * (intento + 1)));
    }

    const texto = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!texto) throw new Error("Gemini sin texto: " + JSON.stringify(data).slice(0, 200));
    const r = JSON.parse(texto);

    /* Reglas del formulario, garantizadas aunque la IA se equivoque */
    let motivo = String(r.motivo || "").trim();
    motivo = motivo.charAt(0).toLowerCase() + motivo.slice(1);
    if (!/[.]$/.test(motivo)) motivo = motivo.replace(/[,;:!?]+$/, "") + ".";

    const lista = v => (Array.isArray(v) ? v : String(v || "").split(/\r?\n/));
    const actividades = lista(r.actividades).map(String)
      .map(l => l.trim().replace(/^[-•*]\s*/, "")).filter(Boolean)
      .map(l => "- " + l).join("\n");

    /* Red de seguridad: el municipio no cuenta como localidad aunque la IA lo devuelva */
    const norm = s => String(s || "").normalize("NFD").replace(/[^\x00-\x7F]/g, "").toLowerCase()
      .replace(/^localidad\s+/, "").replace(/,?\s*hgo\.?$/, "").replace(/[^a-z0-9]+/g, " ").trim();
    const muni = norm(d.municipio);
    const localidades = lista(r.localidades).map(String)
      .filter(l => norm(l) !== muni)
      .map(l => l.trim()).filter(Boolean)
      .map(l => /^localidad\b/i.test(l) ? l : "Localidad " + l).join("\n");

    /* Las localidades son opcionales: si el relato no menciona ninguna, queda vacío */
    if (!motivo || !actividades) throw new Error("Respuesta incompleta de Gemini");
    res.json({ ok: true, motivo, actividades, localidades });
  } catch (err) {
    console.error("⚠️  redactar-up:", err.message);
    res.status(502).json({ ok: false, msg: "No se pudo redactar en este momento. Puedes capturar manualmente." });
  }
});

module.exports = router;
