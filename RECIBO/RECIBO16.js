/* =============================================================
   FACTURA.JS
   Módulo para generación de facturas en PDF
   mediante Google Apps Script.

   Funciones principales:
     - numeroALetras(numero)         → Número a texto "X.XX PESOS 00/100 M.N."
     - transformarNombreArchivo(n)   → Espacios → "/" (ej. oficios, noRecibo)
     - validarCamposFactura()        → Valida campos del modal
     - abrirModalFactura(codigo)     → Carga datos y abre el modal
     - generarFactura()              → Envía payload a Apps Script
============================================================= */

/* =============================================================
   CONFIGURACIÓN — URL del Apps Script de generación de PDF
============================================================= */

const API_FACTURA =
    "https://script.google.com/macros/s/AKfycbxeuOf2qIXsqUk6letwUAcFTmNDu3-MU-FibocD_H0AGgVM6E1S3qsa38BpMKNz6nQE/exec";


/* =============================================================
   NUMERO A LETRAS
   Convierte un número a su representación como importe
   en texto para documentos fiscales.

   @param {number|string} numero - Cantidad numérica
   @returns {string} Ej: "1250.00 PESOS 00/100 M.N."
============================================================= */

/* =============================================================
   TRANSFORMAR NOMBRE DE ARCHIVO / FOLIO
   Elimina la extensión del archivo (si existe) y reemplaza
   los espacios por "/" para construir un folio con formato
   de ruta.

   @param {string} nombreArchivo - Nombre original
   @returns {string} Ej: "SH 3033 2025"          → "SH/3033/2025"
                         "SH-CPF-5182 2025"       → "SH-CPF-5182/2025"
                         "oficio autorización.pdf" → "oficio/autorización"
============================================================= */

function transformarNombreArchivo(nombreArchivo) {
    if (!nombreArchivo) return "";
    const sinExtension = nombreArchivo.replace(/\.[^/.]+$/, "");
    return sinExtension.replace(/ /g, "/");
}


/* =============================================================
   OBTENER VALOR DE CAMPO
   Utilidad interna para leer el valor de un input por ID
   y aplicar una transformación opcional.

   @param {string}   id          - ID del elemento HTML
   @param {Function} [transform] - Función de transformación
   @returns {string}
============================================================= */

function obtenerValorCampoFactura(id, transform) {
    const el = document.getElementById(id);
    if (!el) return "";
    return transform ? transform(el.value) : el.value;
}


/* =============================================================
   VALIDAR CAMPOS DEL MODAL FACTURA
   Recorre todos los inputs/textarea del modal y marca con
   la clase "input-error" los que estén vacíos, ignorando
   los campos con atributo readonly.

   @returns {boolean} true si todos los campos son válidos
============================================================= */

function validarCamposFactura() {
    let valido = true;

    document
        .querySelectorAll("#modalFactura input, #modalFactura textarea")
        .forEach(campo => {

            /* Ignorar campos de solo lectura */
            if (campo.hasAttribute("readonly")) {
                campo.classList.remove("input-error");
                return;
            }

            if (!campo.value.trim()) {
                campo.classList.add("input-error");
                valido = false;
            } else {
                campo.classList.remove("input-error");
            }
        });

    return valido;
}


/* =============================================================
   ABRIR MODAL FACTURA
   Consulta el registro y el último oficio por código,
   rellena todos los campos del modal y lo abre.

   @param {string} codigo - Código único del registro
============================================================= */

async function abrirModalFactura(codigo) {
    try {
        codigoFactura = codigo;

        /* ── Obtener registro desde la API ─────────────────── */
        const response = await fetch(`${API}/api/registros/codigo/${codigo}`);

        if (!response.ok) throw new Error("Error obteniendo registro");

        const registro = await response.json();

        if (!registro) throw new Error("Registro no encontrado");

        console.log("REGISTRO FACTURA:", registro);

        /* ── Limpiar errores de validación previos ──────────── */
        document
            .querySelectorAll("#modalFactura input, #modalFactura textarea")
            .forEach(campo => campo.classList.remove("input-error"));

        /* ── Datos calculados ───────────────────────────────── */
        const dias      = desglosarDias(registro.dia_inicio, registro.dia_fin) || "";
        const localidad = registro.localidades_visitadas || "";
        const mes       = registro.mes || "";
        const total     = Number(registro.spg_total || 0);

        /* ── Obtener último oficio de autorización ──────────── */
        let oficioLimpio     = "";
        let adecuacionLimpia = "";

        try {
            const responseOficio = await fetch(`${API}/api/presupuestos/ultimo-oficio/12`);

            if (!responseOficio.ok) throw new Error("Error obteniendo oficio");

            const dataOficio = await responseOficio.json();

            console.log("ÚLTIMO OFICIO:", dataOficio);

            if (dataOficio.ok) {
                /*
                 * NOTA: transformarNombreArchivo elimina la extensión y
                 * convierte espacios en "/", de modo que:
                 *   "SH 3033 2025.pdf"     → "SH/3033/2025"
                 *   "SH-CPF-5182 2025.pdf" → "SH-CPF-5182/2025"
                 */
                oficioLimpio     = transformarNombreArchivo(dataOficio.oficio_autorizacion_nombre || "");
                adecuacionLimpia = transformarNombreArchivo(dataOficio.oficio_adecuacion_nombre  || "");
            }

        } catch (errorOficio) {
            console.error("ERROR CARGANDO OFICIO:", errorOficio);
            /* No interrumpir el flujo; los campos quedarán vacíos */
        }

        /* ── Rellenar campos del modal ──────────────────────── */
        document.getElementById("facturaNoRecibo").value       = "";
        document.getElementById("facturaPersona").value        = registro.persona || "";

        /* ── RFC y Cargo según la persona ───────────────────── */
        const datosPersona = personas.find(p => p.nombre === registro.persona);

        if (datosPersona) {
            document.getElementById("facturaRFC").value       = datosPersona.rfc      || "";
            document.getElementById("facturaCategoria").value = datosPersona.categoria || "";
        } else {
            document.getElementById("facturaRFC").value       = "";
            document.getElementById("facturaCategoria").value = "";
        }

        document.getElementById("facturaMunicipio").value      = registro.municipio         || "";
        document.getElementById("facturaMotivo").value         = registro.motivo_comision   || "";
        document.getElementById("facturaLocalidad").value      = localidad;
        document.getElementById("facturaDias").value           = dias;
        document.getElementById("facturaMes").value            = mes;

        /* ── Montos SPG ─────────────────────────────────────── */
        document.getElementById("facturaImporte").value        = formatearMoneda(registro.spg_monto       || 0);
        document.getElementById("facturaRetenciones").value    = formatearMoneda(registro.spg_retenciones || 0);
        document.getElementById("facturaTotal").value          = formatearMoneda(total);
        document.getElementById("facturaTotalLetra").value     = numeroALetras(total);

        /* ── Proyecto ───────────────────────────────────────── */
        document.getElementById("facturaProyecto").value       = registro.proyecto       || "AI005";
        document.getElementById("facturaNombreProyecto").value = registro.nombre_proyecto || "Atención Integral 005";

        /* ── Oficios (ya transformados con espacios → "/") ───── */
        const inputOficio = document.getElementById("facturaOficio");
        if (inputOficio) inputOficio.value = oficioLimpio;

        const inputAdecuacion = document.getElementById("facturaAdecuacion");
        if (inputAdecuacion) inputAdecuacion.value = adecuacionLimpia;

        /* ── Fecha formateada en español ────────────────────── */
        document.getElementById("facturaFecha").value =
            new Date(registro.fecha || Date.now())
                .toLocaleDateString("es-MX", {
                    day:   "numeric",
                    month: "long",
                    year:  "numeric"
                });

        abrirModal("modalFactura");

    } catch (error) {
        console.error("ERROR ABRIENDO FACTURA:", error);
        alert(error.message);
    }
}


/* =============================================================
   GENERAR FACTURA
   Valida campos, construye el payload con las variables para
   el template, lo envía al Apps Script y guarda la URL del
   PDF resultante en la base de datos.
============================================================= */

async function generarFactura() {
    /* ── Validar antes de continuar ────────────────────────── */
    if (!validarCamposFactura()) {
        alert("Por favor completa todos los campos requeridos.");
        return;
    }

    const btn = document.getElementById("btnGenerarFactura");

    try {
        btn.disabled    = true;
        btn.textContent = "Generando...";

        /* ── Construir payload ──────────────────────────────── */

        /*
         * NOTA: transformarNombreArchivo se aplica a los campos que
         * representan folios de oficios y número de recibo, convirtiendo
         * los espacios en "/":
         *   "SH 3033 2025"     → "SH/3033/2025"
         *   "SH-CPF-5182 2025" → "SH-CPF-5182/2025"
         */
        const payload = {
            codigo:   codigoFactura,
            fileName: `FACTURA_${codigoFactura}`,
            variables: {
                "<<NOMBRE>>":   obtenerValorCampoFactura("facturaPersona"),
                "<<RFC>>":      obtenerValorCampoFactura("facturaRFC"),
                "<<CARGO>>":    obtenerValorCampoFactura("facturaCategoria"),
                "<<MUNICIPIO>>": obtenerValorCampoFactura("facturaMunicipio"),
                "<<MOTIVO>>":   obtenerValorCampoFactura("facturaMotivo"),
                "<<LOCALIDAD>>": obtenerValorCampoFactura("facturaLocalidad"),
                "<<DIAS>>":     obtenerValorCampoFactura("facturaDias"),
                "<<MES>>":      obtenerValorCampoFactura("facturaMes"),
                "<<MONTO>>":    obtenerValorCampoFactura("facturaImporte"),
                "<<RET>>":      obtenerValorCampoFactura("facturaRetenciones"),
                "<<TOTAL>>":    obtenerValorCampoFactura("facturaTotal"),
                "<<NOREC>>":    transformarNombreArchivo(obtenerValorCampoFactura("facturaNoRecibo")),   // ← espacios → "/"
                "<<TOTLETRA>>": obtenerValorCampoFactura("facturaTotalLetra"),
                "<<PROY>>":     obtenerValorCampoFactura("facturaProyecto"),
                "<<NOMPROY>>":  obtenerValorCampoFactura("facturaNombreProyecto"),
                "<<OFAUT>>":    transformarNombreArchivo(obtenerValorCampoFactura("facturaOficio")),     // ← espacios → "/"
                "<<ADEC>>":     transformarNombreArchivo(obtenerValorCampoFactura("facturaAdecuacion")), // ← espacios → "/"
                "<<FECHA>>":    obtenerValorCampoFactura("facturaFecha")
            }
        };

        console.log("PAYLOAD FACTURA:", payload);

        /* ── Enviar al Apps Script ───────────────────────────── */
        const response = await fetch(API_FACTURA, {
            method:  "POST",
            headers: { "Content-Type": "text/plain" },
            body:    JSON.stringify(payload)
        });

        const text = await response.text();
        console.log("RESPUESTA RAW FACTURA:", text);

        /* ── Parsear respuesta JSON ──────────────────────────── */
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error("ERROR PARSE JSON:", parseError);
            throw new Error("Apps Script no devolvió JSON válido");
        }

        console.log("RESPUESTA JSON FACTURA:", data);

        if (!data.ok || !data.url) {
            throw new Error(data.error || "No se pudo generar la factura");
        }

        /* ── Guardar URL del PDF en la base de datos ─────────── */
        const guardar = await fetch(`${API}/api/registros/factura/${codigoFactura}`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ factura_pdf: data.url })
        });

        if (!guardar.ok) throw new Error("Error guardando factura");

        /* ── Flujo de éxito ──────────────────────────────────── */
        cerrarModal("modalCargandoFactura");
        cerrarModal("modalConfirmarFactura");
        cerrarModal("modalFactura");
        abrirModal("modalExitoFactura");

        cargarRegistros();

    } catch (error) {
        console.error("ERROR FACTURA:", error);
        cerrarModal("modalCargandoFactura");
        alert(error.message);

    } finally {
        /* Siempre restaurar el botón, haya error o no */
        if (btn) {
            btn.disabled    = false;
            btn.textContent = "Generar Factura";
        }
    }
}


/* =============================================================
   LIMPIAR ERROR AL ESCRIBIR
   Al cargar el DOM, agrega listeners a todos los campos del
   modal para quitar la clase "input-error" en cuanto el
   usuario escriba o seleccione un valor.
============================================================= */

document.addEventListener("DOMContentLoaded", () => {
    document
        .querySelectorAll("#modalFactura input, #modalFactura textarea")
        .forEach(campo => {
            ["input", "change"].forEach(evento => {
                campo.addEventListener(evento, () => {
                    if (campo.value.trim()) {
                        campo.classList.remove("input-error");
                    }
                });
            });
        });
});