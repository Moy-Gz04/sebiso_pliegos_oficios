"use strict";

/* ============================================================
   1. CONSTANTES Y VARIABLES GLOBALES
   ============================================================ */

/** Elemento <tbody> donde se renderizan las tarjetas de registros */
const tbody = document.getElementById("tbodyResultados");

/** URL base del backend (Render) */
const API = "https://sebiso-pliegos-oficios-1.onrender.com";

/**
 * Código del registro activo en cada modal.
 * Se asignan justo antes de abrir el modal correspondiente.
 */
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
  // Para mostrar en pantalla — sin cambios
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

  // Para el PDF — con prefijo
  function desglosarDiasPDF(inicio, fin) {
    const texto = desglosarDias(inicio, fin);
    if (!texto) return "";
    const esSolo = parseInt(inicio) === parseInt(fin);
    return esSolo ? `al día ${texto}` : `a los días ${texto}`;
  }

/* ============================================================
   2B. CONVERSIÓN DE NÚMERO A LETRAS
   ============================================================ */

/**
 * Convierte un número entero (0-999) a palabras en español, mayúsculas.
 * Utilizado internamente por numeroALetras().
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
  const num = parseFloat(String(valor).replace(/[^0-9.-]/g, "")) || 0;

  const entero    = Math.floor(Math.abs(num));
  const decimales = Math.round((Math.abs(num) - entero) * 100);

  let texto = "";

  if (entero === 0) {
    texto = "CERO";
  } else {
    const millones = Math.floor(entero / 1_000_000);
    const miles    = Math.floor((entero % 1_000_000) / 1_000);
    const resto    = entero % 1_000;

    if (millones > 0) {
      texto += millones === 1 ? "UN MILLÓN" : convertirGrupo(millones) + " MILLONES";
    }
    if (miles > 0) {
      if (texto) texto += " ";
      texto += miles === 1 ? "MIL" : convertirGrupo(miles) + " MIL";
    }
    if (resto > 0) {
      if (texto) texto += " ";
      texto += convertirGrupo(resto);
    }
  }

  texto += "";

  if (decimales > 0) {
    texto += " CON " + convertirGrupo(decimales) + " CENTAVOS";
  }

  return texto.trim().toLowerCase();
  
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
    // Fallback si el modal aún no existe en el DOM
    alert(`${titulo}\n\n${mensaje}`);
    return;
  }

  elTitulo.innerHTML  = titulo;
  elMensaje.innerHTML = mensaje;
  elModal.classList.add("activo");
}

/**
 * Cierra el modal de alerta personalizada.
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
    { id: "spgMonto",  label: "Monto",        tipo: "money" },
    { id: "spgRet",    label: "Retenciones",  tipo: "money" },
    { id: "spgTot",    label: "Total",        tipo: "money" },
  ],

  RECIBO: [
    { id: "reciboFolio",       label: "Documento"   },
    { id: "reciboPersona",     label: "Persona"     },
    { id: "reciboMunicipio",   label: "Municipio"   },
    { id: "reciboMotivo",      label: "Motivo"      },
    { id: "reciboDias",        label: "Días"        },
    { id: "reciboMes",         label: "Mes"         },
    { id: "reciboAnio",        label: "Año"         },
    { id: "reciboUnidad",      label: "Unidad"      },
    { id: "reciboImporte",     label: "Importe"     },
    { id: "reciboRetenciones", label: "Retenciones" },
    { id: "reciboTotal",       label: "Total"       },
  ],

  FACTURA: [
      { id: "facturaFolio",          label: "Folio"           },
      { id: "facturaPersona",        label: "Persona"         },
      { id: "facturaMunicipio",      label: "Municipio"       },
      { id: "facturaMotivo",         label: "Motivo"          },
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
    { id: "oficio2Monto",          label: "Monto",        tipo: "money" },
    { id: "oficio2Retenciones",    label: "Retenciones",  tipo: "money" },
    { id: "oficio2Total",          label: "Total",        tipo: "money" },
    { id: "oficio2TotalLetra",     label: "Total en letra"     },
  ],

};
/**
 * Valida que todos los campos requeridos de un formulario estén completos.
 * Marca en rojo los campos vacíos y muestra una alerta personalizada.
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
      console.error(`validarFormulario: campo no encontrado → #${campo.id}`);
      return;
    }

    // Limpiar error previo
    el.classList.remove("input-error");

    const valor = el.value.trim();
    let vacio   = !valor;

    // Para campos de dinero: verificar que haya un número real (no solo "$" o espacios)
    if (!vacio && campo.tipo === "money") {
      const num = parseFloat(valor.replace(/[^0-9.-]+/g, ""));
      if (isNaN(num)) vacio = true;
    }

    if (vacio) {
      el.classList.add("input-error");
      errores.push(campo.label);

      // Enfocar y hacer scroll al primer campo con error
      if (errores.length === 1) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

  if (errores.length > 0) {
    mostrarAlerta(
      "⚠️ Campos incompletos",
      "Llena todos los datos solicitados antes de continuar."
    );
    return false;
  }

  return true;
}

/**
 * Elimina la clase "input-error" de todos los campos de un modal.
 * @param {string} idModal – ID del contenedor del modal
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
 * Guarda el código activo, limpia errores, pre-llena los campos
 * fijos y abre el modal SPG.
 *
 * Campos fijos (no editables por el usuario):
 *   - UR      → "13"
 *   - UP      → "01"
 *   - Cuenta  → "------"
 *
 * NOTA: nombre_proyecto NO se captura en el SPG.
 *       Se captura en la etapa de Factura.
 *
 * @param {string} codigo
 */
function abrirModalSPG(codigo) {
  codigoSPG = codigo;
  limpiarErroresModal("modalSPG");

  // Valores fijos pre-cargados
  document.getElementById("spgUR").value     = "13";
  document.getElementById("spgUP").value     = "01";
  document.getElementById("spgCuenta").value = "------";

  // Bloquear edición de campos fijos
  document.getElementById("spgUR").readOnly     = true;
  document.getElementById("spgUP").readOnly     = true;
  document.getElementById("spgCuenta").readOnly = true;
  document.getElementById("spgTot").readOnly    = true;

  abrirModal("modalSPG");
}

/* ---- 6.2 MODAL RECIBO ------------------------------------ */

/**
 * Carga los datos del registro desde el backend y rellena
 * el modal de Recibo.
 * @param {string} codigo
 */
async function abrirModalRecibo(codigo) {
  try {
    codigoRecibo = codigo;
    limpiarErroresModal("modalRecibo");

    const registro  = await fetchRegistro(codigo);
    const diasTexto = desglosarDias(registro.dia_inicio, registro.dia_fin);

    document.getElementById("reciboFolio").value       = registro.codigo                || "";
    document.getElementById("reciboPersona").value     = registro.persona               || "";
    document.getElementById("reciboMunicipio").value   = registro.municipio             || "";
    document.getElementById("reciboMotivo").value      = registro.motivo_comision        || "";
    document.getElementById("reciboLocalidades").value = registro.localidades_visitadas  || "";
    document.getElementById("reciboDias").value        = diasTexto;
    document.getElementById("reciboMes").value         = registro.mes                   || "";
    document.getElementById("reciboAnio").value        = registro.anio                  || "";
    document.getElementById("reciboUnidad").value      = registro.up                    || "";
    document.getElementById("reciboImporte").value     = formatearMoneda(registro.spg_monto       || 0);
    document.getElementById("reciboRetenciones").value = formatearMoneda(registro.spg_retenciones || 0);
    document.getElementById("reciboTotal").value       = formatearMoneda(registro.spg_total       || 0);

    abrirModal("modalRecibo");
  } catch (error) {
    console.error("ERROR MODAL RECIBO:", error);
    mostrarAlerta("❌ Error", error.message);
  }
}

/* ---- 6.3 MODAL FACTURA ----------------------------------- */

/**
 * Carga los datos del registro desde el backend y rellena
 * el modal de Factura.
 *
 * NOTA: nombre_proyecto se captura aquí por primera vez.
 * El campo facturaTotalLetra se pre-carga con numeroALetras(total).
 *
 * @param {string} codigo
 */
async function abrirModalFactura(codigo) {
  try {
    codigoFactura = codigo;
    limpiarErroresModal("modalFactura");

    const registro  = await fetchRegistro(codigo);
    const diasTexto = desglosarDias(registro.dia_inicio, registro.dia_fin);
    const total     = Number(registro.spg_total || 0);

    document.getElementById("facturaFolio").value          = "";
    document.getElementById("facturaPersona").value        = registro.persona               || "";
    document.getElementById("facturaMunicipio").value      = registro.municipio             || "";
    document.getElementById("facturaMotivo").value         = registro.motivo_comision        || "";
    document.getElementById("facturaLocalidad").value      = registro.localidades_visitadas  || "";
    document.getElementById("facturaDias").value           = diasTexto;
    document.getElementById("facturaMes").value            = registro.mes                   || "";
    document.getElementById("facturaImporte").value        = formatearMoneda(registro.spg_monto       || 0);
    document.getElementById("facturaRetenciones").value    = formatearMoneda(registro.spg_retenciones || 0);
    document.getElementById("facturaTotal").value          = formatearMoneda(total);
    document.getElementById("facturaTotalLetra").value     = numeroALetras(total);
    document.getElementById("facturaProyecto").value       = registro.proyecto  || "AI005";
    document.getElementById("facturaNombreProyecto").value = registro.nombre_proyecto || "Atención Integral 005";
    document.getElementById("facturaOficio").value         = registro.codigo    || "";
    document.getElementById("facturaAdecuacion").value     = registro.cuenta    || "ADEC-001";
    document.getElementById("facturaFecha").value          = new Date(registro.fecha || Date.now())
      .toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

    abrirModal("modalFactura");
  } catch (error) {
    console.error("ERROR MODAL FACTURA:", error);
    mostrarAlerta("❌ Error", error.message);
  }
}

/* ---- 6.4 MODAL OFICIO 2 ---------------------------------- */

function transformarNombreArchivo(nombreArchivo) {
    if (!nombreArchivo) return "";
    const sinExtension = nombreArchivo.replace(/\.[^/.]+$/, "");
    return sinExtension.replace(/ /g, "/");
}
/**
 * Carga los datos del registro desde el backend, consulta los últimos
 * oficios y rellena el modal de Oficio 2.
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

    // Obtener los últimos oficios de autorización y adecuación
    let oficioAutorizacion = "";
    let oficioAdecuacion   = "";

    try {
      const responseOficios = await fetch(`${API}/api/presupuestos/ultimo-oficio/3`);

      if (!responseOficios.ok) throw new Error("Error obteniendo oficios");

      const dataOficios = await responseOficios.json();
      console.log("ÚLTIMOS OFICIOS:", dataOficios);

      if (dataOficios.ok) {
        oficioAutorizacion = (dataOficios.oficio_autorizacion_nombre || "").replace(/\.pdf$/i, "");
        oficioAdecuacion   = (dataOficios.oficio_adecuacion_nombre   || "").replace(/\.pdf$/i, "");
      }
    } catch (errorOficios) {
      console.error("ERROR CARGANDO OFICIOS:", errorOficios);
      // No se interrumpe el flujo; los campos quedan vacíos para llenado manual
    }

    // Llenar campos del modal
    document.getElementById("oficio2Persona").value        = registro.persona         || "";
    document.getElementById("oficio2Municipio").value      = registro.municipio       || "";
    document.getElementById("oficio2Dias").value           = diasTexto;
    document.getElementById("oficio2Mes").value            = registro.mes             || "";
    document.getElementById("oficio2Anio").value           = registro.anio            || "";
    llenarSelectAutomatico(
    "oficio2Proyecto",
    catalogoProyecto
);

llenarSelectAutomatico(
    "oficio2NombreProyecto",
    catalogoNombreProyecto
);

document.getElementById(
    "oficio2Proyecto"
).value =
catalogoProyecto[0] || "AI005";

document.getElementById(
    "oficio2NombreProyecto"
).value =
catalogoNombreProyecto[0] || "Atención Integral 005";
    document.getElementById("oficio2Ofaut").value      = transformarNombreArchivo(oficioAutorizacion);
    document.getElementById("oficio2OficioAdec").value  = transformarNombreArchivo(oficioAdecuacion);
    document.getElementById("oficio2Adec").value           = registro.cuenta          || "";
    document.getElementById("oficio2Monto").value          = formatearMoneda(registro.spg_monto       || 0);
    document.getElementById("oficio2Retenciones").value    = formatearMoneda(registro.spg_retenciones || 0);
    document.getElementById("oficio2Total").value          = formatearMoneda(total);
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
 * la API de la unidad presupuestal activa.
 *
 * ─────────────────────────────────────────────────────────────
 * CAMBIO DE ACUERDO A AREA:
 *   Reemplaza "UP-01" por el código correspondiente.
 * ─────────────────────────────────────────────────────────────
 *
 * @param {string} codigo
 * @returns {Promise<Object>}
 * @throws {Error}
 */
async function fetchRegistro(codigo) {
  // CAMBIO DE ACUERDO A AREA → cambiar "UP-01" por el código de la nueva área
  const response = await fetch(`${API}/api/registros/UP-01-S-DRM`);
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
 * en el campo de solo lectura #spgTot.
 */
function calcularTotalSPG() {
  const montoInput = document.getElementById("spgMonto");
  const retInput   = document.getElementById("spgRet");
  const totalInput = document.getElementById("spgTot");
  if (!montoInput || !retInput || !totalInput) return;

  const monto       = parseFloat(montoInput.value.replace(/[^0-9.-]+/g, "")) || 0;
  const retenciones = parseFloat(retInput.value.replace(/[^0-9.-]+/g, ""))   || 0;
  totalInput.value = formatearMoneda(monto - retenciones);
}

/* ============================================================
   9. SOLICITAR CONFIRMACIÓN
   ============================================================ */

/**
 * Punto de entrada desde los botones principales de cada formulario.
 * Solo avanza al modal de confirmación si TODOS los campos son válidos.
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

  const idModalConfirmar = modalesConfirmacion[tipo];
  if (idModalConfirmar) abrirModal(idModalConfirmar);
}

/* ============================================================
   10. GENERACIÓN DE DOCUMENTOS
   ============================================================ */

/* ---- 10.1 GENERAR SPG ------------------------------------ */

/**
 * Envía los datos del SPG al backend.
 * NOTA: nombre_proyecto NO se envía aquí; se captura hasta Factura.
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
      nota:        document.getElementById("reciboNota").value.trim() || " ",
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
 * Envía los datos de la Factura al backend y guarda nombre_proyecto.
 *
 * CORRECCIÓN: el bloque try/catch estaba fragmentado con saltos de línea
 * que dejaban cerrarModal(), abrirModal() y cargarRegistros() fuera del try,
 * impidiendo que se ejecutaran correctamente tras guardar la factura.
 * Ahora todo el flujo está dentro del mismo bloque try.
 */
async function generarFactura() {
  try {
    const nombreProyecto = document.getElementById("facturaNombreProyecto").value;

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
      totalLetra:     document.getElementById("facturaTotalLetra").value,
      proyecto:       document.getElementById("facturaProyecto").value,
      oficio:         document.getElementById("facturaOficio").value,
      adecuacion:     document.getElementById("facturaAdecuacion").value,
      fecha:          document.getElementById("facturaFecha").value,
      nombreProyecto: nombreProyecto,
    };

    console.log("PAYLOAD FACTURA:", payload);
    console.log("NOMBRE PROYECTO A GUARDAR:", nombreProyecto);

    // 1. Generar el PDF de la factura
    const response = await fetch(`${API}/api/factura/generar`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Error generando Factura");

    // 2. Guardar la URL del PDF y nombre_proyecto en el registro
    const guardar = await fetch(`${API}/api/registros/factura/${codigoFactura}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        factura_pdf:     data.url,
        proyecto:        document.getElementById("facturaProyecto").value,
        nombre_proyecto: nombreProyecto,
      }),
    });

    if (!guardar.ok) throw new Error("Error guardando Factura en el registro");

    // 3. Cerrar modales y mostrar éxito
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
 * Envía los datos del Oficio 2 al backend usando variables de plantilla.
 * nombre_proyecto se toma del campo oficio2NombreProyecto, que fue
 * pre-cargado con el valor ya guardado en Factura.
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
 * Retorna el HTML del badge de estatus según el valor normalizado.
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
 * Obtiene todos los registros de la unidad presupuestal activa
 * y los renderiza como tarjetas en el tbody.
 *
 * ─────────────────────────────────────────────────────────────
 * CAMBIO DE ACUERDO A AREA:
 *   Reemplaza "UP-01" por el código correspondiente.
 * ─────────────────────────────────────────────────────────────
 */
async function cargarRegistros() {
  tbody.innerHTML = `
    <tr>
      <td colspan="12" style="text-align:center; padding:20px;">
        Cargando registros...
      </td>
    </tr>`;

  try {
    // CAMBIO DE ACUERDO A AREA → cambiar "UP-01" por el código de la nueva área
    const response = await fetch(`${API}/api/registros/UP-01-S-DRM`);
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

    // Orden de visualización: CREADO → RECHAZADO → ENVIADO → PAGADO/ACEPTADO
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
 * Construye el HTML de una tarjeta de registro.
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

  // Botón de trámite: avanza secuencialmente por los documentos pendientes
  const btnTerminar = !registro.spg_pdf
    ? `<button class="btn-enviar" onclick="abrirModalSPG('${codigo}')">Generar SPG</button>`
    : !registro.recibo_pdf
    ? `<button class="btn-enviar" onclick="abrirModalRecibo('${codigo}')">Generar LAG</button>`
    : !registro.factura_pdf
    ? `<button class="btn-enviar" onclick="abrirModalFactura('${codigo}')">Generar Recibo</button>`
    : !registro.oficio2_pdf
    ? `<button class="btn-enviar" onclick="abrirModalOficio2('${codigo}')">Generar Anexo C</button>`
    : `<button class="btn-aceptado" disabled>Finalizado</button>`;

  // Helper: enlace a PDF existente o botón deshabilitado
  const linkPDF = (url, textoSi, textoNo) =>
    url
      ? `<a href="${escaparHTML(url)}" target="_blank" class="link-pdf">${textoSi}</a>`
      : `<button class="btn-bloqueado" disabled>${textoNo}</button>`;

  return `
    <tr>
      <td colspan="12">
        <div class="card-registro">

          <!-- FILA SUPERIOR: identificación y estatus -->
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

          <!-- FILA PDFs: accesos a documentos generados -->
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
              <span class="info-label">Solicitud Programática del Gasto PDF</span>
              ${linkPDF(registro.spg_pdf,     "Ver SPG",      "Sin SPG")}
            </div>
            <div class="info-item">
              <span class="info-label">Leyenda Alusiva al Gasto PDF</span>
              ${linkPDF(registro.recibo_pdf,  "Ver LAG",   "Sin LAG")}
            </div>
            <div class="info-item">
              <span class="info-label"> Recibo PDF</span>
              ${linkPDF(registro.factura_pdf, "Ver Recibo",  "Sin Recibo")}
            </div>
            <div class="info-item">
              <span class="info-label">Anexo C PDF</span>
              ${linkPDF(registro.oficio2_pdf, "Ver Anexo C", "Sin Anexo C")}
            </div>
          </div>

          <!-- FILA INFERIOR: observaciones y acciones -->
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

function eliminarRegistro(codigo) {
  codigoEliminar = codigo;
  abrirModal("modalEliminar");
}

/* ---- 12.5 GUARDAR OBSERVACIONES -------------------------- */

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

  /* ── 13.1  Campos read-only del SPG ─────────────────────── */
  const elSpgUR     = document.getElementById("spgUR");
  const elSpgUP     = document.getElementById("spgUP");
  const elSpgCuenta = document.getElementById("spgCuenta");
  const elSpgTot    = document.getElementById("spgTot");

  if (elSpgUR)     elSpgUR.readOnly     = true;
  if (elSpgUP)     elSpgUP.readOnly     = true;
  if (elSpgCuenta) elSpgCuenta.readOnly = true;
  if (elSpgTot)    elSpgTot.readOnly    = true;

  /* ── 13.2  Catálogos ─────────────────────────────────────── */
  if (typeof llenarAnios       === "function") llenarAnios("spgAnio");
  if (typeof llenarUP          === "function") llenarUP();
  if (typeof llenarRubros      === "function") llenarRubros();
  if (typeof llenarProyectos   === "function") llenarProyectos();
  if (typeof llenarObjetoGasto === "function") llenarObjetoGasto();

  /* ── 13.3  Cálculo en tiempo real del total SPG ─────────── */
  document.getElementById("spgMonto")?.addEventListener("input", calcularTotalSPG);
  document.getElementById("spgRet")  ?.addEventListener("input", calcularTotalSPG);

  /* ── 13.4  Limpiar error al editar un campo ─────────────── */
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input",  () => el.classList.remove("input-error"));
    el.addEventListener("change", () => el.classList.remove("input-error"));
  });

  /* ── 13.5  Botones "Generar" de cada formulario ─────────── */
  document.getElementById("btnGenerarSPG")    ?.addEventListener("click", () => solicitarConfirmacion("SPG"));
  document.getElementById("btnGenerarRecibo") ?.addEventListener("click", () => solicitarConfirmacion("RECIBO"));
  document.getElementById("btnGenerarFactura")?.addEventListener("click", () => solicitarConfirmacion("FACTURA"));
  // Oficio 2: su botón usa onclick="solicitarConfirmacion('OFICIO2')" en el HTML

  /* ── 13.6  Confirmaciones de generación ─────────────────── */
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

  /* ── 13.7  Confirmar eliminación ────────────────────────── */
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

  /* ── 13.8  Modal de alerta personalizada ────────────────── */
  document.getElementById("btnCerrarAlerta")?.addEventListener("click", cerrarAlerta);
  document.getElementById("modalAlerta")?.addEventListener("click", (e) => {
    if (e.target.id === "modalAlerta") cerrarAlerta();
  });

  /* ── 13.9  Carga inicial + refresco automático ───────────── */
  cargarRegistros();
  setInterval(cargarRegistros, 30_000);
});