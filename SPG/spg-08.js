/* ============================================================
   SPG.JS  –  SEBISO · Sistema de Pliegos y Oficios
   Módulo : Generación de SPG vía Google Apps Script
   Versión: 2.1
   Autor  : Juan Moisés Gómez Aispuro

   Historial de cambios:
   ─────────────────────────────────────────────────────────────
   v2.1 (correcciones de flujo):

     - CORRECCIÓN CRÍTICA DE FLUJO: El listener de #btnGenerarSPG
       ahora llama a solicitarConfirmacion("SPG") en lugar de abrir
       directamente modalConfirmarSPG. Antes, este archivo ignoraba
       la validación de resultados.js y abría el modal de confirmación
       sin importar si los campos estaban vacíos, causando que el
       usuario viera el modal de confirmación incluso después de la
       alerta de "campos incompletos".

     - CORRECCIÓN DEL ERROR DE LOCALHOST: Se reemplazó alert()
       nativo del navegador (el "error de localhost") por la función
       mostrarAlerta() del sistema. El alert() nativo generaba el
       diálogo del sistema operativo que aparecía dos veces.

     - ELIMINACIÓN DE LISTENER DUPLICADO: Se eliminó el listener de
       #confirmarGenerarSPG de este archivo porque ya está registrado
       en resultados.js. Tenerlo en ambos archivos causaba que
       generarSPG() se ejecutara dos veces por cada confirmación.

     - DOCUMENTACIÓN: Se añadieron comentarios en todos los bloques
       relevantes explicando el flujo y las dependencias entre archivos.

   ─────────────────────────────────────────────────────────────
   DEPENDENCIAS (deben cargarse antes que este archivo):
     - resultados.js  → define: API, codigoSPG, abrirModal(),
                        cerrarModal(), mostrarAlerta(),
                        solicitarConfirmacion(), cargarRegistros()
   ─────────────────────────────────────────────────────────────
   FLUJO CORRECTO de generación de SPG:

     [#btnGenerarSPG] click
             │
             ▼
     solicitarConfirmacion("SPG")   ← definida en resultados.js
             │
             ├─ campos vacíos → alerta + campos en rojo → FIN
             │
             └─ campos OK → abre #modalConfirmarSPG
                                     │
                                     ▼
                         [#confirmarGenerarSPG] click
                         (listener en resultados.js)
                                     │
                                     ▼
                             generarSPG()  ← definida AQUÍ
                             (usa Google Apps Script)
   ============================================================ */

"use strict";

/* ============================================================
   GENERAR SPG
   ─────────────────────────────────────────────────────────────
   Esta función es llamada exclusivamente desde el listener de
   #confirmarGenerarSPG registrado en resultados.js, nunca
   directamente desde un botón.

   Proceso:
     1. Deshabilita el botón para evitar doble envío.
     2. Lee y valida los campos del formulario SPG.
     3. Construye el payload con variables de plantilla (<<VAR>>).
     4. Envía el payload a Google Apps Script para generar el PDF.
     5. Guarda la URL del PDF y los datos SPG en el backend.
     6. Cierra modales y muestra modal de éxito.
   ============================================================ */

async function generarSPG() {

  try {

    /* ──────────────────────────────────────
       PASO 1: Deshabilitar botón
       Previene doble clic durante el proceso
    ────────────────────────────────────── */
    const btn = document.getElementById("btnGenerarSPG");
    if (btn) {
      btn.disabled    = true;
      btn.textContent = "Generando...";
    }

    /* ──────────────────────────────────────
       PASO 2: Leer campos del formulario
    ────────────────────────────────────── */
    const datos = {
      codigo:      codigoSPG,
      persona:     document.getElementById("spgPersona")?.value || "",
      anio:        document.getElementById("spgAnio").value,
      ur:          document.getElementById("spgUR").value,
      up:          document.getElementById("spgUP").value,
      rubro:       document.getElementById("spgR").value,
      og:          document.getElementById("spgOG").value,
      proyecto:    document.getElementById("spgPR").value,
      cuenta:      document.getElementById("spgCuenta").value,
      monto:       document.getElementById("spgMonto").value,
      retenciones: document.getElementById("spgRet").value,
      total:       document.getElementById("spgTot").value,
    };

    console.log("DATOS SPG:", datos);

    /* ──────────────────────────────────────
       PASO 3: Validación de seguridad
       La validación principal ya ocurrió en solicitarConfirmacion()
       antes de llegar aquí. Esta es una verificación de respaldo
       para los campos estrictamente necesarios para el PDF.
    ────────────────────────────────────── */
    if (!datos.anio || !datos.ur || !datos.up ||
        !datos.rubro || !datos.og || !datos.proyecto || !datos.cuenta) {

      // CORRECCIÓN v2.1: usar mostrarAlerta() en lugar de alert() nativo
      throw new Error("Completa todos los campos antes de generar el SPG.");
    }

    /* ──────────────────────────────────────
       PASO 4: Construir payload para Apps Script
       Las variables <<VAR>> son marcadores de plantilla que
       Google Apps Script reemplaza en el documento de Drive.
    ────────────────────────────────────── */
    const payload = {
      codigo:   datos.codigo,
      folderId: "1dXwxYBkYAlD6uBWAf14U1WENxsylE7eo",
      fileName: `SPG_${datos.codigo}`,
      variables: {
        "<<PERSONA>>": datos.persona,
        "<<ANIO>>":    datos.anio,
        "<<UR>>":      datos.ur,
        "<<UP>>":      datos.up,
        "<<R>>":       datos.rubro,
        "<<OG>>":      datos.og,
        "<<PR>>":      datos.proyecto,
        "<<CUENTA>>":  datos.cuenta,
        "<<MONT>>":    datos.monto,
        "<<RET>>":     datos.retenciones,
        "<<TOT>>":     datos.total,
      },
    };

    console.log("PAYLOAD SPG:", payload);

    /* ──────────────────────────────────────
       PASO 5: Enviar a Google Apps Script
       Se usa "text/plain" porque Apps Script no acepta
       "application/json" en peticiones cross-origin sin CORS.
    ────────────────────────────────────── */
    console.log("ENVIANDO A APPS SCRIPT...");

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyUlWF1mnf6pY6TDTmPWQFYTwM95rr9vdSNLhT-I24UNIf-Pxjs-Q_btAgcOZkzYbyg/exec",
      {
        method:  "POST",
        headers: { "Content-Type": "text/plain" },
        body:    JSON.stringify(payload),
      }
    );

    /* ──────────────────────────────────────
       PASO 6: Parsear respuesta de Apps Script
       Apps Script puede devolver texto plano antes del JSON;
       por eso se lee como texto primero y luego se parsea.
    ────────────────────────────────────── */
    const text = await response.text();
    console.log("RESPUESTA RAW:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("ERROR PARSE JSON:", parseError);
      throw new Error("Apps Script no devolvió JSON válido. Intenta de nuevo.");
    }

    console.log("RESPUESTA JSON:", data);

    if (!data.ok || !data.url) {
      throw new Error(data.error || "No se pudo generar el PDF. Revisa Apps Script.");
    }

    /* ──────────────────────────────────────
       PASO 7: Guardar URL del PDF y datos SPG en el backend
       Se persiste tanto la URL del PDF como los campos del SPG
       para que queden disponibles en la tarjeta del registro.
    ────────────────────────────────────── */
    console.log("GUARDANDO DATOS SPG EN BACKEND...");

    const guardar = await fetch(`${API}/api/registros/spg/${codigoSPG}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spg_pdf:     data.url,
        ur:          datos.ur,
        up:          datos.up,
        rubro:       datos.rubro,
        og:          datos.og,
        proyecto:    datos.proyecto,
        cuenta:      datos.cuenta,
        monto:       datos.monto,
        retenciones: datos.retenciones,
        total:       datos.total,
        anio:        datos.anio,
      }),
    });

    const guardarText = await guardar.text();
    console.log("RESPUESTA GUARDAR:", guardarText);

    if (!guardar.ok) {
      throw new Error("El PDF se generó pero hubo un error al guardar en el registro.");
    }

    /* ──────────────────────────────────────
       PASO 8: Cerrar modales y mostrar éxito
    ────────────────────────────────────── */
    cerrarModal("modalCargando");
    cerrarModal("modalConfirmarSPG");
    cerrarModal("modalSPG");
    abrirModal("modalExitoSPG");

    cargarRegistros();

  } catch (error) {

    console.error("ERROR SPG:", error);
    cerrarModal("modalCargando");

    // CORRECCIÓN v2.1: reemplaza alert() nativo (el "error de localhost")
    // por el modal de alerta personalizado del sistema.
    mostrarAlerta("❌ Error al generar SPG", error.message);

  } finally {

    /* ──────────────────────────────────────
       SIEMPRE: restaurar el botón al terminar,
       sin importar si hubo error o éxito.
    ────────────────────────────────────── */
    const btn = document.getElementById("btnGenerarSPG");
    if (btn) {
      btn.disabled    = false;
      btn.textContent = "Generar SPG";
    }

  }
}

/* ============================================================
   EVENTOS SPG (DOMContentLoaded)
   ─────────────────────────────────────────────────────────────
   IMPORTANTE — qué va aquí y qué va en resultados.js:

   ✅ AQUÍ (spg.js):
      - Listener de #btnGenerarSPG → llama a solicitarConfirmacion()
        para que la validación ocurra antes de abrir el modal.

   ❌ NO AQUÍ (está en resultados.js):
      - Listener de #confirmarGenerarSPG
        (si lo pones aquí también, generarSPG() se ejecutará dos veces)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ──────────────────────────────────────
     BOTÓN "Generar SPG"
     ─────────────────────────────────────
     CORRECCIÓN v2.1: antes abría directamente #modalConfirmarSPG,
     ignorando la validación. Ahora llama a solicitarConfirmacion()
     que valida primero y solo abre el modal si todo está correcto.

     Flujo resultante:
       click → solicitarConfirmacion("SPG")
                 ├─ inválido → alerta + campos en rojo → FIN
                 └─ válido   → abre #modalConfirmarSPG
  ────────────────────────────────────── */
  const btnGenerar = document.getElementById("btnGenerarSPG");
  if (btnGenerar) {
    btnGenerar.addEventListener("click", () => {
      // solicitarConfirmacion está definida en resultados.js
      solicitarConfirmacion("SPG");
    });
  }

  /*
   * ── Listener de #confirmarGenerarSPG ──────────────────────
   * NO se registra aquí. Ya está en resultados.js (sección 13.6).
   * Agregarlo aquí causaría que generarSPG() se llame dos veces
   * por cada confirmación del usuario.
   * ──────────────────────────────────────────────────────────
   */

});