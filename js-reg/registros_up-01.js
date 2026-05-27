/* ============================================================
   RESULTADOS.JS  –  SEBISO · Sistema de Pliegos y Oficios
   Módulo : Vista de resultados por Unidad Presupuestal (UP)
   Versión: 3.2
   Autor  : Juan Moisés Gómez Aispuro
   Cambios v3.2:
     - Se agrega función numeroALetras() completa para convertir
       cantidades numéricas a texto en español (mayúsculas).
       Ej: 2060 → "DOS MIL SESENTA PESOS"
     - Se corrige el registro de facturaTotalLetra en el payload
       de generarFactura() para que <<TOTLETRA>> llegue al backend.
   ============================================================ */

"use strict";

/* ============================================================
   1. CONSTANTES Y VARIABLES GLOBALES
   ============================================================ */

/** Elemento <tbody> donde se renderizan las tarjetas de registros */
const tbody = document.getElementById("tbodyResultados");

/** URL base del backend (Render) */
const API = "https://sebiso-pliegos-oficios-1.onrender.com";

/** Código del registro activo en cada modal.
 *  Se asignan justo antes de abrir el modal correspondiente. */
let codigoEliminar = null;
let codigoSPG      = null;
let codigoRecibo   = null;
let codigoFactura  = null;
let codigoOficio2  = null;

/* ============================================================
   2. UTILIDADES GENERALES
   ============================================================ */

/**
 * Normaliza un valor de estatus: string, sin espacios, mayúsculas.
 * @param {*} estatus
 * @returns {string}
 */
function normalizarEstatus(estatus) {
  return String(estatus || "").trim().toUpperCase();
}

/**
 * Escapa caracteres especiales HTML para evitar XSS al inyectar
 * datos del servidor directamente en innerHTML.
 * @param {*} valor
 * @returns {string}
 */
function escaparHTML(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Formatea un número como moneda: "$ 1,234.56"
 * @param {number|string} valor
 * @returns {string}
 */
function formatearMoneda(valor) {
  return (
    "$ " +
    Number(valor || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Convierte un rango de días (inicio–fin) en texto legible.
 * Ej: 1,3 → "1, 2 y 3" | 5,5 → "5" | 3,4 → "3 y 4"
 * @param {number|string} inicio
 * @param {number|string} fin
 * @returns {string}
 */
function desglosarDias(inicio, fin) {
  inicio = parseInt(inicio);
  fin    = parseInt(fin);
  if (isNaN(inicio) || isNaN(fin)) return "";
  if (inicio === fin) return `${inicio}`;
  const dias = [];
  for (let i = inicio; i <= fin; i++) dias.push(i);
  if (dias.length === 2) return `${dias[0]} y ${dias[1]}`;
  return `${dias.slice(0, -1).join(", ")} y ${dias[dias.length - 1]}`;
}

/* ============================================================
   2B. CONVERSIÓN DE NÚMERO A LETRAS
   ============================================================ */

/**
 * Convierte un número entero (sin decimales) a palabras en español,
 * en mayúsculas. Soporta hasta 999,999,999.
 *
 * Ejemplos:
 *   convertirGrupo(60)   → "SESENTA"
 *   convertirGrupo(115)  → "CIENTO QUINCE"
 *   convertirGrupo(1000) → ⚠ usar solo para grupos de 3 dígitos (0-999)
 *
 * @param {number} n  Entero entre 0 y 999
 * @returns {string}
 */
function convertirGrupo(n) {
  const unidades = [
    "", "UN", "DOS", "TRES", "CUATRO", "CINCO",
    "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ",
    "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE",
    "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE",
    "VEINTIÚN", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO",
    "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE",
  ];

  const decenas = [
    "", "", "VEINTI", "TREINTA", "CUARENTA", "CINCUENTA",
    "SESENTA", "SETENTA", "OCHENTA", "NOVENTA",
  ];

  const centenas = [
    "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
    "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS",
  ];

  if (n === 0)   return "";
  if (n === 100) return "CIEN";

  let resultado = "";

  const c = Math.floor(n / 100);
  const r = n % 100;

  if (c > 0) resultado += centenas[c];

  if (r > 0) {
    if (resultado) resultado += " ";

    if (r < 30) {
      /* Las unidades del 1-29 tienen forma propia en el arreglo */
      resultado += unidades[r];
    } else {
      const d = Math.floor(r / 10);
      const u = r % 10;
      resultado += decenas[d];
      if (u > 0) resultado += " Y " + unidades[u];
    }
  }

  return resultado.trim();
}

/**
 * Convierte un número (entero o decimal) a su representación en letras
 * en español, en MAYÚSCULAS, añadiendo "PESOS" al final.
 * Soporta hasta 999,999,999.99.
 *
 * Ejemplos:
 *   numeroALetras(2060)    → "DOS MIL SESENTA PESOS"
 *   numeroALetras(1500.50) → "UN MIL QUINIENTOS PESOS CON CINCUENTA CENTAVOS"
 *   numeroALetras(100)     → "CIEN PESOS"
 *   numeroALetras(1000000) → "UN MILLÓN PESOS"
 *
 * @param {number|string} valor  Cantidad numérica a convertir
 * @returns {string}             Texto en MAYÚSCULAS con "PESOS"
 */
function numeroALetras(valor) {
  /* ── Sanear entrada ── */
  const num = parseFloat(String(valor).replace(/[^0-9.-]/g, "")) || 0;

  const entero    = Math.floor(Math.abs(num));
  const decimales = Math.round((Math.abs(num) - entero) * 100);

  /* ── Parte entera ── */
  let texto = "";

  if (entero === 0) {
    texto = "CERO";
  } else {
    const millones = Math.floor(entero / 1_000_000);
    const miles    = Math.floor((entero % 1_000_000) / 1_000);
    const resto    = entero % 1_000;

    /* Millones */
    if (millones > 0) {
      if (millones === 1) {
        texto += "UN MILLÓN";
      } else {
        texto += convertirGrupo(millones) + " MILLONES";
      }
    }

    /* Miles */
    if (miles > 0) {
      if (texto) texto += " ";
      if (miles === 1) {
        texto += "MIL";
      } else {
        texto += convertirGrupo(miles) + " MIL";
      }
    }

    /* Unidades / centenas finales */
    if (resto > 0) {
      if (texto) texto += " ";
      texto += convertirGrupo(resto);
    }
  }

  /* ── Agregar "PESOS" ── */
  texto += " PESOS";

  /* ── Parte decimal (centavos) ── */
  if (decimales > 0) {
    texto += " CON " + convertirGrupo(decimales) + " CENTAVOS";
  }

  return texto.trim();
}

/* ============================================================
   3. ALERTAS PERSONALIZADAS
   ============================================================ */

/**
 * Muestra el modal de alerta con título y mensaje personalizados.
 * @param {string} titulo  – Texto del encabezado
 * @param {string} mensaje – Cuerpo del mensaje (acepta HTML)
 */
function mostrarAlerta(titulo, mensaje) {
  const elTitulo  = document.getElementById("modalAlertaTitulo");
  const elMensaje = document.getElementById("modalAlertaMensaje");
  const elModal   = document.getElementById("modalAlerta");

  if (!elTitulo || !elMensaje || !elModal) {
    /* Fallback por si el HTML aún no tiene el modal */
    alert(`${titulo}\n\n${mensaje}`);
    return;
  }

  elTitulo.innerHTML  = titulo;
  elMensaje.innerHTML = mensaje;
  elModal.classList.add("activo");
}

/**
 * Cierra el modal de alerta.
 */
function cerrarAlerta() {
  document.getElementById("modalAlerta")?.classList.remove("activo");
}

/* ============================================================
   4. VALIDACIÓN DE FORMULARIOS
   ============================================================ */

/**
 * Definición de campos requeridos por formulario.
 * Cada entrada tiene: id del campo, label para el mensaje de error,
 * y tipo ("text" | "select" | "money") para la validación específica.
 */
const CAMPOS_REQUERIDOS = {

  SPG: [
    { id: "spgAnio",   label: "Año"             },
    { id: "spgUR",     label: "UR"              },
    { id: "spgUP",     label: "UP"              },
    { id: "spgR",      label: "Rubro"           },
    { id: "spgOG",     label: "Objeto de Gasto" },
    { id: "spgPR",     label: "Proyecto"        },
    { id: "spgCuenta", label: "Cuenta"          },
    { id: "spgMonto",  label: "Monto",       tipo: "money" },
    { id: "spgRet",    label: "Retenciones", tipo: "money" },
    { id: "spgTot",    label: "Total",       tipo: "money" },
  ],

  RECIBO: [
    { id: "reciboFolio",        label: "Documento"   },
    { id: "reciboPersona",      label: "Persona"     },
    { id: "reciboMunicipio",    label: "Municipio"   },
    { id: "reciboMotivo",       label: "Motivo"      },
    { id: "reciboLocalidades",  label: "Localidades" },
    { id: "reciboDias",         label: "Días"        },
    { id: "reciboMes",          label: "Mes"         },
    { id: "reciboAnio",         label: "Año"         },
    { id: "reciboUnidad",       label: "Unidad"      },
    { id: "reciboImporte",      label: "Importe"     },
    { id: "reciboRetenciones",  label: "Retenciones" },
    { id: "reciboTotal",        label: "Total"       },
  ],

  FACTURA: [
    { id: "facturaFolio",          label: "Folio"           },
    { id: "facturaPersona",        label: "Persona"         },
    { id: "facturaMunicipio",      label: "Municipio"       },
    { id: "facturaMotivo",         label: "Motivo"          },
    { id: "facturaLocalidad",      label: "Localidad"       },
    { id: "facturaDias",           label: "Días"            },
    { id: "facturaMes",            label: "Mes"             },
    { id: "facturaImporte",        label: "Importe",        tipo: "money" },
    { id: "facturaRetenciones",    label: "Retenciones",    tipo: "money" },
    { id: "facturaTotal",          label: "Total",          tipo: "money" },
    { id: "facturaTotalLetra",     label: "Total en letra"  },
    { id: "facturaProyecto",       label: "Proyecto"        },
    { id: "facturaNombreProyecto", label: "Nombre proyecto" },
    { id: "facturaOficio",         label: "Oficio"          },
    { id: "facturaAdecuacion",     label: "Adecuación"      },
    { id: "facturaFecha",          label: "Fecha"           },
  ],

  OFICIO2: [
    { id: "oficio2Numc",           label: "Número de control"  },
    { id: "oficio2Persona",        label: "Persona"            },
    { id: "oficio2Municipio",      label: "Municipio"          },
    { id: "oficio2Dias",           label: "Días"               },
    { id: "oficio2Mes",            label: "Mes"                },
    { id: "oficio2Anio",           label: "Año"                },
    { id: "oficio2Proyecto",       label: "Proyecto"           },
    { id: "oficio2NombreProyecto", label: "Nombre proyecto"    },
    { id: "oficio2Ofaut",          label: "Oficio autorizador" },
    { id: "oficio2OficioAdec",     label: "Oficio adecuación"  },
    { id: "oficio2Adec",           label: "Adecuación"         },
    { id: "oficio2Monto",          label: "Monto",       tipo: "money" },
    { id: "oficio2Retenciones",    label: "Retenciones", tipo: "money" },
    { id: "oficio2Total",          label: "Total",       tipo: "money" },
    { id: "oficio2TotalLetra",     label: "Total en letra"     },
  ],
};

/**
 * Valida que todos los campos requeridos de un formulario estén completos.
 * Marca en rojo los campos vacíos y muestra una alerta personalizada.
 *
 * Flujo:
 *  1. Recorre los campos del formulario indicado.
 *  2. Limpia errores previos.
 *  3. Si un campo está vacío → agrega clase "input-error" y registra el label.
 *  4. Si hay errores → muestra alerta personalizada y retorna false.
 *  5. Si todo OK → retorna true.
 *
 * @param {"SPG"|"RECIBO"|"FACTURA"|"OFICIO2"} formulario
 * @returns {boolean}  true = todos los campos completos
 */
function validarFormulario(formulario) {
  const campos  = CAMPOS_REQUERIDOS[formulario];
  const errores = [];

  campos.forEach((campo) => {
    const el = document.getElementById(campo.id);
    if (!el) {
      console.error(`Campo no encontrado: ${campo.id}`);
      return;
    }

    /* Limpiar error previo */
    el.classList.remove("input-error");

    const valor = el.value.trim();
    let vacio   = !valor;

    /* Para campos de dinero: verificar que haya un número real */
    if (!vacio && campo.tipo === "money") {
      const num = parseFloat(valor.replace(/[^0-9.-]+/g, ""));
      if (isNaN(num)) vacio = true;
    }

    if (vacio) {
      el.classList.add("input-error");
      errores.push(campo.label);

      /* Enfocar el primer campo con error */
      if (errores.length === 1) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

  if (errores.length > 0) {
    const lista = errores.map((e) => `• ${e}`).join("<br>");
    mostrarAlerta(
      "⚠️ Campos incompletos",
      `Por favor completa los siguientes campos antes de continuar:<br><br>${lista}`
    );
    return false;
  }

  return true;
}

/**
 * Elimina la clase "input-error" de todos los campos de un modal.
 * Se llama al abrir el modal para limpiar errores de la sesión anterior.
 * @param {string} idModal – ID del contenedor modal
 */
function limpiarErroresModal(idModal) {
  document
    .querySelectorAll(`#${idModal} input, #${idModal} select, #${idModal} textarea`)
    .forEach((el) => el.classList.remove("input-error"));
}

/* ============================================================
   5. CONTROL DE MODALES
   ============================================================ */

/**
 * Abre un modal añadiendo la clase "activo".
 * @param {string} id
 */
function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("activo");
}

/**
 * Cierra un modal removiendo la clase "activo".
 * @param {string} id
 */
function cerrarModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("activo");
}

/* ============================================================
   6. APERTURA DE MODALES CON PRECARGA DE DATOS
   ============================================================ */

/* ---- 6.1 MODAL SPG --------------------------------------- */

/**
 * Guarda el código activo, limpia errores y abre el modal SPG.
 * @param {string} codigo
 */
function abrirModalSPG(codigo) {
  codigoSPG = codigo;
  limpiarErroresModal("modalSPG");
  abrirModal("modalSPG");
}

/* ---- 6.2 MODAL RECIBO ------------------------------------ */

/**
 * Carga los datos del registro y rellena el modal de Recibo.
 * @param {string} codigo
 */
async function abrirModalRecibo(codigo) {
  try {
    codigoRecibo = codigo;
    limpiarErroresModal("modalRecibo");

    const registro  = await fetchRegistro(codigo);
    const diasTexto = desglosarDias(registro.dia_inicio, registro.dia_fin);

    document.getElementById("reciboFolio").value       = registro.codigo                 || "";
    document.getElementById("reciboPersona").value     = registro.persona                || "";
    document.getElementById("reciboMunicipio").value   = registro.municipio              || "";
    document.getElementById("reciboMotivo").value      = registro.motivo_comision         || "";
    document.getElementById("reciboLocalidades").value = registro.localidades_visitadas   || "";
    document.getElementById("reciboDias").value        = diasTexto;
    document.getElementById("reciboMes").value         = registro.mes                    || "";
    document.getElementById("reciboAnio").value        = registro.anio                   || "";
    document.getElementById("reciboUnidad").value      = registro.up                     || "";
    document.getElementById("reciboImporte").value     = formatearMoneda(registro.spg_monto        || 0);
    document.getElementById("reciboRetenciones").value = formatearMoneda(registro.spg_retenciones  || 0);
    document.getElementById("reciboTotal").value       = formatearMoneda(registro.spg_total        || 0);

    abrirModal("modalRecibo");
  } catch (error) {
    console.error("ERROR MODAL RECIBO:", error);
    mostrarAlerta("❌ Error", error.message);
  }
}

/* ---- 6.3 MODAL FACTURA ----------------------------------- */

/**
 * Carga los datos del registro y rellena el modal de Factura.
 *
 * CORRECCIÓN v3.2: el campo facturaTotalLetra ahora se precarga
 * con numeroALetras(total) para que <<TOTLETRA>> llegue correctamente
 * al backend al momento de enviar el formulario.
 *
 * @param {string} codigo
 */
async function abrirModalFactura(codigo) {
  try {
    codigoFactura = codigo;
    limpiarErroresModal("modalFactura");

    const registro  = await fetchRegistro(codigo);
    const diasTexto = desglosarDias(registro.dia_inicio, registro.dia_fin);

    /* Se extrae el total numérico del registro para reutilizarlo
       tanto en el campo formateado como en la conversión a letras */
    const total = Number(registro.spg_total || 0);

    document.getElementById("facturaFolio").value          = "";
    document.getElementById("facturaPersona").value        = registro.persona                || "";
    document.getElementById("facturaMunicipio").value      = registro.municipio              || "";
    document.getElementById("facturaMotivo").value         = registro.motivo_comision         || "";
    document.getElementById("facturaLocalidad").value      = registro.localidades_visitadas   || "";
    document.getElementById("facturaDias").value           = diasTexto;
    document.getElementById("facturaMes").value            = registro.mes                    || "";
    document.getElementById("facturaImporte").value        = formatearMoneda(registro.spg_monto        || 0);
    document.getElementById("facturaRetenciones").value    = formatearMoneda(registro.spg_retenciones  || 0);
    document.getElementById("facturaTotal").value          = formatearMoneda(total);

    /* ✅ CORRECCIÓN: se usa numeroALetras() para generar el texto
       correcto. Ej: 2060 → "DOS MIL SESENTA PESOS" */
    document.getElementById("facturaTotalLetra").value     = numeroALetras(total);
    document.getElementById("facturaProyecto").value       = registro.proyecto || "AI005";
    document.getElementById("facturaNombreProyecto").value = "Atención Integral 005";
    const responseOficio = await fetch(`${API}/api/presupuestos/ultimo-oficio/${registro.area_id}`);
    const dataOficio = await responseOficio.json();
    const oficioLimpio = (dataOficio.oficio || "").replace(/\.pdf$/i, "");
    document.getElementById("facturaOficio").value         = oficioLimpio;
    document.getElementById("facturaAdecuacion").value     = registro.cuenta || "ADEC-001";
    document.getElementById("facturaFecha").value          = new Date(registro.fecha || Date.now())
    .toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

    abrirModal("modalFactura");
  } catch (error) {
    console.error("ERROR MODAL FACTURA:", error);
    mostrarAlerta("❌ Error", error.message);
  }
}

/* ---- 6.4 MODAL OFICIO 2 ---------------------------------- */

/**
 * Carga los datos del registro y rellena el modal de Oficio 2.
 *
 * CORRECCIÓN v3.2: el campo oficio2TotalLetra ahora se precarga
 * con numeroALetras(total) para consistencia con el modal de Factura.
 *
 * @param {string} codigo
 */
async function abrirModalOficio2(codigo) {
  try {
    codigoOficio2 = codigo;
    limpiarErroresModal("modalOficio2");

    const registro  = await fetchRegistro(codigo);
    const diasTexto = desglosarDias(registro.dia_inicio, registro.dia_fin);
    const total     = Number(registro.spg_total || 0);

    document.getElementById("oficio2Persona").value        = registro.persona   || "";
    document.getElementById("oficio2Municipio").value      = registro.municipio || "";
    document.getElementById("oficio2Dias").value           = diasTexto;
    document.getElementById("oficio2Mes").value            = registro.mes       || "";
    document.getElementById("oficio2Anio").value           = registro.anio      || "";
    document.getElementById("oficio2Proyecto").value       = registro.proyecto  || "";
    document.getElementById("oficio2NombreProyecto").value = "Atención Integral 005";
    document.getElementById("oficio2Ofaut").value          = registro.codigo    || "";
    document.getElementById("oficio2Adec").value           = registro.cuenta    || "";
    document.getElementById("oficio2Monto").value          = formatearMoneda(registro.spg_monto        || 0);
    document.getElementById("oficio2Retenciones").value    = formatearMoneda(registro.spg_retenciones  || 0);
    document.getElementById("oficio2Total").value          = formatearMoneda(total);

    /* ✅ CORRECCIÓN: mismo criterio que Factura */
    document.getElementById("oficio2TotalLetra").value     = numeroALetras(total);

    abrirModal("modalOficio2");
  } catch (error) {
    console.error("ERROR MODAL OFICIO2:", error);
    mostrarAlerta("❌ Error", error.message);
  }
}

/* ============================================================
   7. HELPERS DE FETCH
   ============================================================ */

/**
 * Obtiene el registro que coincide con el código recibido desde
 * la API de UP-01. Centraliza la lógica repetida en los modales.
 * @param {string} codigo
 * @returns {Promise<Object>}
 * @throws {Error}
 */
async function fetchRegistro(codigo) {
  const response = await fetch(`${API}/api/registros/UP-01`);
  if (!response.ok) throw new Error("Error obteniendo registros");

  const registros = await response.json();
  const registro  = registros.find((r) => r.codigo === codigo);
  if (!registro) throw new Error(`Registro "${codigo}" no encontrado`);

  return registro;
}

/* ============================================================
   8. CÁLCULO EN TIEMPO REAL
   ============================================================ */

/**
 * Recalcula el total del SPG (monto + retenciones) y lo muestra
 * en el campo de solo lectura.
 */
function calcularTotalSPG() {
  const montoInput = document.getElementById("spgMonto");
  const retInput   = document.getElementById("spgRet");
  const totalInput = document.getElementById("spgTot");
  if (!montoInput || !retInput || !totalInput) return;

  const monto       = parseFloat(montoInput.value.replace(/[^0-9.-]+/g, "")) || 0;
  const retenciones = parseFloat(retInput.value.replace(/[^0-9.-]+/g, ""))   || 0;
  totalInput.value  = formatearMoneda(monto + retenciones);
}

/* ============================================================
   9. SOLICITAR CONFIRMACIÓN (validar → confirmar → generar)
   ============================================================ */

/**
 * Punto de entrada desde los botones principales de cada formulario.
 * Ejecuta el flujo completo:
 *   1. Valida todos los campos requeridos.
 *   2. Si hay vacíos  → marca en rojo, muestra alerta personalizada, detiene.
 *   3. Si todo OK     → abre el modal de confirmación.
 *
 * La generación real ocurre solo después de que el usuario
 * confirme en el modal de confirmación correspondiente.
 *
 * @param {"SPG"|"RECIBO"|"FACTURA"|"OFICIO2"} tipo
 */
function solicitarConfirmacion(tipo) {
  if (!validarFormulario(tipo)) return;

  const modalesConfirmacion = {
    SPG:     "modalConfirmarSPG",
    RECIBO:  "modalConfirmarRecibo",
    FACTURA: "modalConfirmarFactura",
    OFICIO2: "modalConfirmarOficio2",
  };

  const modalConfirmacion = modalesConfirmacion[tipo];
  if (modalConfirmacion) abrirModal(modalConfirmacion);
}

/* ============================================================
   10. GENERACIÓN DE DOCUMENTOS
   ============================================================ */

/* ---- 10.1 GENERAR SPG ------------------------------------ */

/**
 * Envía los datos del SPG al backend, guarda la URL del PDF
 * resultante en el registro y muestra el modal de éxito.
 */
async function generarSPG() {
  try {
    const payload = {
      codigo:      codigoSPG,
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

    console.log("PAYLOAD SPG:", payload);

    const response = await fetch(`${API}/api/spg/generar`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Error generando SPG");

    const guardar = await fetch(`${API}/api/registros/spg/${codigoSPG}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ spg_pdf: data.url }),
    });
    if (!guardar.ok) throw new Error("Error guardando SPG en el registro");

    cerrarModal("modalCargando");
    cerrarModal("modalSPG");
    abrirModal("modalExitoSPG");
    cargarRegistros();
  } catch (error) {
    console.error("ERROR SPG:", error);
    cerrarModal("modalCargando");
    mostrarAlerta("❌ Error al generar SPG", error.message);
  }
}

/* ---- 10.2 GENERAR RECIBO --------------------------------- */

/**
 * Envía los datos del Recibo al backend, guarda la URL del PDF
 * resultante en el registro y muestra el modal de éxito.
 */
async function generarRecibo() {
  try {
    const payload = {
      codigo:      codigoRecibo,
      folio:       document.getElementById("reciboFolio").value,
      persona:     document.getElementById("reciboPersona").value,
      municipio:   document.getElementById("reciboMunicipio").value,
      motivo:      document.getElementById("reciboMotivo").value,
      localidades: document.getElementById("reciboLocalidades").value,
      dias:        document.getElementById("reciboDias").value,
      mes:         document.getElementById("reciboMes").value,
      anio:        document.getElementById("reciboAnio").value,
      unidad:      document.getElementById("reciboUnidad").value,
      importe:     document.getElementById("reciboImporte").value,
      retenciones: document.getElementById("reciboRetenciones").value,
      total:       document.getElementById("reciboTotal").value,
    };

    console.log("PAYLOAD RECIBO:", payload);

    const response = await fetch(`${API}/api/recibo/generar`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Error generando Recibo");

    const guardar = await fetch(`${API}/api/registros/recibo/${codigoRecibo}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ recibo_pdf: data.url }),
    });
    if (!guardar.ok) throw new Error("Error guardando Recibo en el registro");

    cerrarModal("modalCargandoRecibo");
    cerrarModal("modalRecibo");
    abrirModal("modalExitoRecibo");
    cargarRegistros();
  } catch (error) {
    console.error("ERROR RECIBO:", error);
    cerrarModal("modalCargandoRecibo");
    mostrarAlerta("❌ Error al generar Recibo", error.message);
  }
}

/* ---- 10.3 GENERAR FACTURA -------------------------------- */

/**
 * Envía los datos de la Factura al backend, guarda la URL del PDF
 * resultante en el registro y muestra el modal de éxito.
 *
 * CORRECCIÓN v3.2: la clave del payload ahora es "totalLetra"
 * (antes estaba como "totalLetra" pero el campo se leía de un input
 * que no se pre-llenaba; ahora sí se pre-llena en abrirModalFactura).
 */
async function generarFactura() {
  try {
    const payload = {
      codigo:         codigoFactura,
      folio:          document.getElementById("facturaFolio").value,
      persona:        document.getElementById("facturaPersona").value,
      municipio:      document.getElementById("facturaMunicipio").value,
      motivo:         document.getElementById("facturaMotivo").value,
      localidad:      document.getElementById("facturaLocalidad").value,
      dias:           document.getElementById("facturaDias").value,
      mes:            document.getElementById("facturaMes").value,
      importe:        document.getElementById("facturaImporte").value,
      retenciones:    document.getElementById("facturaRetenciones").value,
      total:          document.getElementById("facturaTotal").value,

      /* ✅ CORRECCIÓN: se lee el campo que ahora sí está pre-llenado
         con la conversión a letras correcta, p. ej.:
         "DOS MIL SESENTA PESOS"  en lugar de "2060.00 PESOS 00/100 M.N." */
      totalLetra:     document.getElementById("facturaTotalLetra").value,

      proyecto:       document.getElementById("facturaProyecto").value,
      nombreProyecto: document.getElementById("facturaNombreProyecto").value,
      oficio:         document.getElementById("facturaOficio").value,
      adecuacion:     document.getElementById("facturaAdecuacion").value,
      fecha:          document.getElementById("facturaFecha").value,
    };

    console.log("PAYLOAD FACTURA:", payload);

    const response = await fetch(`${API}/api/factura/generar`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Error generando Factura");

    const guardar = await fetch(`${API}/api/registros/factura/${codigoFactura}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ factura_pdf: data.url }),
    });
    if (!guardar.ok) throw new Error("Error guardando Factura en el registro");

    cerrarModal("modalCargandoFactura");
    cerrarModal("modalFactura");
    abrirModal("modalExitoFactura");
    cargarRegistros();
  } catch (error) {
    console.error("ERROR FACTURA:", error);
    cerrarModal("modalCargandoFactura");
    mostrarAlerta("❌ Error al generar Factura", error.message);
  }
}

/* ---- 10.4 GENERAR OFICIO 2 ------------------------------- */

/**
 * Envía los datos del Oficio 2 al backend, guarda la URL del PDF
 * resultante en el registro y muestra el modal de éxito.
 */
async function generarOficio2() {
  try {
    const payload = {
      codigo:   codigoOficio2,
      fileName: `OFICIO2_${codigoOficio2}`,
      variables: {
        "<<NUMC>>":      document.getElementById("oficio2Numc").value,
        "<<NOMBRE>>":    document.getElementById("oficio2Persona").value,
        "<<MUNICIPIO>>": document.getElementById("oficio2Municipio").value,
        "<<DIAS>>":      document.getElementById("oficio2Dias").value,
        "<<MES>>":       document.getElementById("oficio2Mes").value,
        "<<ANIO>>":      document.getElementById("oficio2Anio").value,
        "<<PROY>>":      document.getElementById("oficio2Proyecto").value,
        "<<NOMPROY>>":   document.getElementById("oficio2NombreProyecto").value,
        "<<OFAUT>>":     document.getElementById("oficio2Ofaut").value,
        "<<OFADEC>>":    document.getElementById("oficio2OficioAdec").value,
        "<<ADEC>>":      document.getElementById("oficio2Adec").value,
        "<<MONT>>":      document.getElementById("oficio2Monto").value,
        "<<RET>>":       document.getElementById("oficio2Retenciones").value,
        "<<TOT>>":       document.getElementById("oficio2Total").value,

        /* ✅ CORRECCIÓN: se usa el campo pre-llenado con numeroALetras() */
        "<<TOTAL>>":     document.getElementById("oficio2TotalLetra").value,
      },
    };

    console.log("PAYLOAD OFICIO2:", payload);

    const response = await fetch(`${API}/api/oficio2/generar`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Error generando Oficio 2");

    const guardar = await fetch(`${API}/api/registros/oficio2/${codigoOficio2}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ oficio2_pdf: data.url }),
    });
    if (!guardar.ok) throw new Error("Error guardando Oficio 2 en el registro");

    cerrarModal("modalCargandoOficio2");
    cerrarModal("modalOficio2");
    abrirModal("modalExitoOficio2");
    cargarRegistros();
  } catch (error) {
    console.error("ERROR OFICIO2:", error);
    cerrarModal("modalCargandoOficio2");
    mostrarAlerta("❌ Error al generar Oficio 2", error.message);
  }
}

/* ============================================================
   11. BADGES Y BOTONES DINÁMICOS
   ============================================================ */

/**
 * Retorna el HTML del badge de estatus.
 * @param {string} estatus
 * @returns {string}
 */
function obtenerBadgeEstatus(estatus) {
  switch (normalizarEstatus(estatus)) {
    case "ENVIADO":
      return `<span class="badge-estatus badge-enviado">Enviado</span>`;
    case "PAGADO":
    case "ACEPTADO":
      return `<span class="badge-estatus badge-aceptado">Pagado</span>`;
    case "RECHAZADO":
      return `<span class="badge-estatus badge-rechazado">Rechazado</span>`;
    default:
      return `<span class="badge-estatus badge-creado">Creado</span>`;
  }
}

/**
 * Retorna el HTML del botón de envío según el estatus del registro.
 * @param {Object} registro
 * @returns {string}
 */
function obtenerBotonEnviar(registro) {
  const estatus = normalizarEstatus(registro.estatus);
  const codigo  = escaparHTML(registro.codigo);

  switch (estatus) {
    case "CREADO":
    case "":
      return `<button class="btn-enviar" onclick="enviarRegistro('${codigo}')">Enviar</button>`;
    case "ENVIADO":
      return `<button class="btn-enviado" disabled>Enviado</button>`;
    case "PAGADO":
    case "ACEPTADO":
      return `<button class="btn-aceptado" disabled>Pagado</button>`;
    case "RECHAZADO":
      return `<button class="btn-rechazado" onclick="reenviarRegistro('${codigo}')">Reenviar</button>`;
    default:
      return `<button class="btn-bloqueado" disabled>Bloqueado</button>`;
  }
}

/* ============================================================
   12. CRUD DE REGISTROS
   ============================================================ */

/* ---- 12.1 CARGAR REGISTROS ------------------------------- */

/**
 * Obtiene todos los registros de UP-01 y los renderiza como tarjetas.
 * Muestra indicador de carga y maneja errores de red.
 */
async function cargarRegistros() {
  tbody.innerHTML = `
    <tr>
      <td colspan="12" style="text-align:center; padding:20px;">
        Cargando registros...
      </td>
    </tr>`;

  try {
    const response = await fetch(`${API}/api/registros/UP-01`);
    if (!response.ok) throw new Error("Error obteniendo registros");

    const registros = await response.json();
    tbody.innerHTML = "";

    if (registros.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="12" style="text-align:center; padding:20px;">
            No hay registros
          </td>
        </tr>`;
      return;
    }

    /* Orden: CREADO → RECHAZADO → ENVIADO → PAGADO/ACEPTADO */
    const orden = { CREADO: 1, RECHAZADO: 2, ENVIADO: 3, PAGADO: 4, ACEPTADO: 4 };
    registros.sort(
      (a, b) =>
        (orden[normalizarEstatus(a.estatus)] || 99) -
        (orden[normalizarEstatus(b.estatus)] || 99)
    );

    for (const registro of registros) {
      tbody.innerHTML += construirTarjeta(registro);
    }
  } catch (error) {
    console.error("ERROR CARGANDO REGISTROS:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align:center; padding:20px; color:red;">
          Error al cargar registros: ${escaparHTML(error.message)}
        </td>
      </tr>`;
  }
}

/**
 * Construye el HTML de una tarjeta de registro escapando todos
 * los valores del servidor para evitar XSS.
 * @param {Object} registro
 * @returns {string}
 */
function construirTarjeta(registro) {
  const estatus          = normalizarEstatus(registro.estatus);
  const bloqueado        = ["PAGADO", "ACEPTADO", "ENVIADO"].includes(estatus);
  const permitirEliminar = ["CREADO", "RECHAZADO", ""].includes(estatus);

  const codigo   = escaparHTML(registro.codigo  || "-");
  const persona  = escaparHTML(registro.persona || "-");
  const fecha    = registro.fecha
    ? escaparHTML(new Date(registro.fecha).toLocaleString("es-MX"))
    : "-";
  const obsArea  = escaparHTML(registro.observaciones       || "");
  const obsAdmin = escaparHTML(registro.observaciones_admin || "");

  const btnEliminar = permitirEliminar
    ? `<button class="btn-eliminar" onclick="eliminarRegistro('${codigo}')">Eliminar</button>`
    : `<button class="btn-bloqueado" disabled>Bloqueado</button>`;

  const btnTerminar = !registro.spg_pdf
    ? `<button class="btn-enviar" onclick="abrirModalSPG('${codigo}')">Generar SPG</button>`
    : !registro.recibo_pdf
    ? `<button class="btn-enviar" onclick="abrirModalRecibo('${codigo}')">Generar Recibo</button>`
    : !registro.factura_pdf
    ? `<button class="btn-enviar" onclick="abrirModalFactura('${codigo}')">Generar Factura</button>`
    : !registro.oficio2_pdf
    ? `<button class="btn-enviar" onclick="abrirModalOficio2('${codigo}')">Generar Oficio 2</button>`
    : `<button class="btn-aceptado" disabled>Finalizado</button>`;

  const linkPDF = (url, texto, labelSin) =>
    url
      ? `<a href="${escaparHTML(url)}" target="_blank" class="link-pdf">${texto}</a>`
      : `<button class="btn-bloqueado" disabled>${labelSin}</button>`;

  return `
    <tr>
      <td colspan="12">
        <div class="card-registro">

          <!-- FILA SUPERIOR -->
          <div class="fila-superior">
            <div class="info-item">
              <span class="info-label">ID</span>
              <span class="info-valor">${codigo}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Persona</span>
              <span class="info-valor">${persona}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha y Hora</span>
              <span class="info-valor">${fecha}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estatus</span>
              ${obtenerBadgeEstatus(registro.estatus)}
            </div>
            <div class="info-item">
              <span class="info-label">Eliminar</span>
              ${btnEliminar}
            </div>
          </div>

          <!-- FILA PDFs -->
          <div class="fila-pdfs">
            <div class="info-item">
              <span class="info-label">Oficio PDF</span>
              ${linkPDF(registro.oficio_pdf,  "Ver Oficio",   "Sin Oficio")}
            </div>
            <div class="info-item">
              <span class="info-label">Pliego PDF</span>
              ${linkPDF(registro.pliego_pdf,  "Ver Pliego",   "Sin Pliego")}
            </div>
            <div class="info-item">
              <span class="info-label">SPG PDF</span>
              ${linkPDF(registro.spg_pdf,     "Ver SPG",      "Sin SPG")}
            </div>
            <div class="info-item">
              <span class="info-label">Recibo PDF</span>
              ${linkPDF(registro.recibo_pdf,  "Ver Recibo",   "Sin Recibo")}
            </div>
            <div class="info-item">
              <span class="info-label">Factura PDF</span>
              ${linkPDF(registro.factura_pdf, "Ver Factura",  "Sin Factura")}
            </div>
            <div class="info-item">
              <span class="info-label">Oficio 2 PDF</span>
              ${linkPDF(registro.oficio2_pdf, "Ver Oficio 2", "Sin Oficio 2")}
            </div>
          </div>

          <!-- FILA INFERIOR -->
          <div class="fila-inferior">
            <div class="info-item">
              <span class="info-label">Observaciones Área</span>
              <textarea
                class="textarea-observaciones"
                placeholder="Observaciones del área..."
                onchange="guardarObservaciones('${codigo}', this.value)"
                ${bloqueado ? "readonly" : ""}
              >${obsArea}</textarea>
            </div>
            <div class="info-item">
              <span class="info-label">Observaciones Administración</span>
              <textarea
                class="textarea-observaciones-admin"
                readonly
                placeholder="Observaciones administración..."
              >${obsAdmin}</textarea>
            </div>
            <div class="acciones-laterales">
              <div class="info-item">
                <span class="info-label">Terminar Trámite</span>
                ${btnTerminar}
              </div>
              <div class="info-item">
                <span class="info-label">Enviar</span>
                ${obtenerBotonEnviar(registro)}
              </div>
            </div>
          </div>

        </div>
      </td>
    </tr>`;
}

/* ---- 12.2 ENVIAR REGISTRO -------------------------------- */

/**
 * Cambia el estatus del registro a "ENVIADO" en el backend.
 * @param {string} codigo
 */
async function enviarRegistro(codigo) {
  try {
    const response = await fetch(`${API}/api/registros/enviar/${codigo}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error enviando registro");
    cargarRegistros();
  } catch (error) {
    console.error("ERROR ENVIANDO:", error);
    mostrarAlerta("❌ Error al enviar", error.message);
  }
}

/* ---- 12.3 REENVIAR REGISTRO ------------------------------ */

/**
 * Permite reenviar un registro rechazado, previa confirmación.
 * @param {string} codigo
 */
async function reenviarRegistro(codigo) {
  try {
    if (!confirm("¿Deseas reenviar este registro?")) return;

    const response = await fetch(`${API}/api/registros/reenviar/${codigo}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error reenviando registro");
    cargarRegistros();
  } catch (error) {
    console.error("ERROR REENVIANDO:", error);
    mostrarAlerta("❌ Error al reenviar", error.message);
  }
}

/* ---- 12.4 ELIMINAR REGISTRO ------------------------------ */

/**
 * Guarda el código a eliminar y abre el modal de confirmación.
 * @param {string} codigo
 */
function eliminarRegistro(codigo) {
  codigoEliminar = codigo;
  abrirModal("modalEliminar");
}

/* ---- 12.5 GUARDAR OBSERVACIONES -------------------------- */

/**
 * Persiste las observaciones del área en el backend.
 * @param {string} codigo
 * @param {string} observaciones
 */
async function guardarObservaciones(codigo, observaciones) {
  try {
    const response = await fetch(`${API}/api/registros/observaciones/${codigo}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ observaciones }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error guardando observaciones");
  } catch (error) {
    console.error("ERROR OBSERVACIONES:", error);
    mostrarAlerta("❌ Error al guardar", error.message);
  }
}

/* ============================================================
   13. INICIALIZACIÓN (DOMContentLoaded)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ---- 13.1 Catálogos ------------------------------------ */
  if (typeof llenarAnios       === "function") llenarAnios("spgAnio");
  if (typeof llenarUP          === "function") llenarUP();
  if (typeof llenarRubros      === "function") llenarRubros();
  if (typeof llenarProyectos   === "function") llenarProyectos();
  if (typeof llenarObjetoGasto === "function") llenarObjetoGasto();

  /* ---- 13.2 Cálculo en tiempo real del total SPG --------- */
  document.getElementById("spgMonto")?.addEventListener("input", calcularTotalSPG);
  document.getElementById("spgRet")  ?.addEventListener("input", calcularTotalSPG);

  /* ---- 13.3 Limpiar error al editar un campo ------------- */
  /*
   * Cuando el usuario corrige un campo marcado en rojo,
   * se quita el estilo de error inmediatamente para dar
   * retroalimentación positiva sin necesidad de reenviar.
   */
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input",  () => el.classList.remove("input-error"));
    el.addEventListener("change", () => el.classList.remove("input-error"));
  });

  /* ---- 13.4 Botones "Generar" de cada formulario ---------
   *
   * FLUJO:
   *   Botón Generar → solicitarConfirmacion(tipo)
   *                      ↓ campos incompletos → alerta personalizada + campos en rojo
   *                      ↓ campos OK          → modal de confirmación
   *                                               ↓ usuario confirma → generar...()
   */
  document.getElementById("btnGenerarSPG")    ?.addEventListener("click", () => solicitarConfirmacion("SPG"));
  document.getElementById("btnGenerarRecibo") ?.addEventListener("click", () => solicitarConfirmacion("RECIBO"));
  document.getElementById("btnGenerarFactura")?.addEventListener("click", () => solicitarConfirmacion("FACTURA"));
  /* Oficio 2 no tiene botón propio; su flujo lo inicia construirTarjeta → abrirModalOficio2,
     y el botón dentro del modal llama a solicitarConfirmacion directamente desde el HTML:
     onclick="solicitarConfirmacion('OFICIO2')"                                            */

  /* ---- 13.5 Confirmaciones de generación ----------------- */
  document.getElementById("confirmarGenerarSPG")?.addEventListener("click", async () => {
    cerrarModal("modalConfirmarSPG");
    abrirModal("modalCargando");
    await generarSPG();
  });

  document.getElementById("confirmarGenerarRecibo")?.addEventListener("click", async () => {
    cerrarModal("modalConfirmarRecibo");
    abrirModal("modalCargandoRecibo");
    await generarRecibo();
  });

  document.getElementById("confirmarGenerarFactura")?.addEventListener("click", async () => {
    cerrarModal("modalConfirmarFactura");
    abrirModal("modalCargandoFactura");
    await generarFactura();
  });

  document.getElementById("confirmarGenerarOficio2")?.addEventListener("click", async () => {
    cerrarModal("modalConfirmarOficio2");
    abrirModal("modalCargandoOficio2");
    await generarOficio2();
  });

  /* ---- 13.6 Confirmar eliminación ------------------------ */
  document.getElementById("confirmarEliminar")?.addEventListener("click", async () => {
    try {
      const response = await fetch(`${API}/api/registros/${codigoEliminar}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error eliminando");

      cerrarModal("modalEliminar");
      abrirModal("modalExito");
      cargarRegistros();
    } catch (error) {
      console.error("ERROR ELIMINANDO:", error);
      mostrarAlerta("❌ Error al eliminar", error.message);
    }
  });

  /* ---- 13.7 Modal de alerta personalizada ---------------- */

  /* Botón cerrar */
  document.getElementById("btnCerrarAlerta")?.addEventListener("click", cerrarAlerta);

  /* Cerrar al hacer clic en el fondo oscuro */
  document.getElementById("modalAlerta")?.addEventListener("click", (e) => {
    if (e.target.id === "modalAlerta") cerrarAlerta();
  });

  /* ---- 13.8 Carga inicial + refresco automático ---------- */
  cargarRegistros();
  setInterval(cargarRegistros, 30_000);
});