// ============================================================
//  CONFIGURACIÓN GLOBAL
// ============================================================

/** ID de la plantilla de Google Docs para el oficio */
const TEMPLATE_DOC_ID = "1Eh3K39QqjqhYnaaTt3nwuWg2u49pouUvsQGgvpwewNQ";

/** ID de la carpeta de Drive donde se guardan los PDFs generados */
const FOLDER_ID = "18c3tJSecNZWdSGmy9XX6upVydQ7KCYwJ";

/**
 * Mapa de nombres → número de hoja (D_n / F_n).
 * Cada persona tiene sus propias hojas de datos y formato.
 */

const MAPA_PERSONAS = {
  "Víctor Hugo Pérez Guati Rojo": 1,
  "Carlos Rodrigo Rojas Ruiz": 2,
  "Cristhian Omar Cordero Estrada": 3,
  "Christian Fernando Valderrama Uribe": 4,
  "Perla Aleli Barrera González": 5,
  "Ana Luisa Baños Castro": 6,
  "Maythe Monserrat Escarela Pérez": 7,
  "Alfonso Gudiño Zamora": 8
};

/** Nombres de los meses, en el mismo formato que manda la web */
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];


// ============================================================
//  BOTÓN PRINCIPAL — SELECCIÓN MÚLTIPLE
// ============================================================

/**
 * Lee las casillas marcadas en SELECCION_II (F3:F100) y
 * genera un pliego + oficio por cada persona seleccionada.
 * Al terminar desmarca cada casilla y muestra un resumen.
 */
function enviarSeleccionAD1() {

  const ss  = SpreadsheetApp.getActive();
  const ui  = SpreadsheetApp.getUi();

  const shSel = ss.getSheetByName("SELECCION_II");
  const shRep = ss.getSheetByName("REPORTES");

  if (!shSel || !shRep) {
    ui.alert("Faltan hojas necesarias (SELECCION_II o REPORTES).");
    return;
  }

  const nombres = shSel.getRange("A3:A100").getValues();
  const checks  = shSel.getRange("F3:F100").getValues();

  let procesados = 0;

  for (let i = 0; i < checks.length; i++) {

    if (checks[i][0] === true) {

      const numero = i + 1;
      const nombre = nombres[i][0];

      procesarPliego_(numero, nombre);

      shSel.getRange(i + 3, 6).setValue(false);
      Utilities.sleep(400);

      procesados++;
    }
  }

  if (procesados === 0) {
    ui.alert("No hay ninguna casilla marcada.");
    return;
  }

  ui.alert(procesados + " pliego(s) generado(s) correctamente.");
}


// ============================================================
//  PROCESADOR DE PLIEGO
// ============================================================

/**
 * Orquesta la generación de un pliego para una persona.
 *
 * @param {number} numero  - Número de hoja (D_n / F_n).
 * @param {string} nombre  - Nombre completo del trabajador.
 * @param {Object} [data]  - Datos provenientes del doPost (web).
 *                           Si se llama desde el botón, este param llega undefined.
 * @returns {{ oficio: string, pliego: string }} URLs de los PDFs generados.
 */
function procesarPliego_(numero, nombre, data) {

  const ss    = SpreadsheetApp.getActive();
  const shRep = ss.getSheetByName("REPORTES");
  const shDB  = ss.getSheetByName("D_" + numero);
  const shF   = ss.getSheetByName("F_" + numero);

  if (!shDB || !shF) {
    throw new Error("No existen hojas D_" + numero + " o F_" + numero);
  }

  // ── Generar ID consecutivo ─────────────────────────────────
  let consecutivo = 1;
  const lastRow   = shRep.getLastRow();

  if (lastRow >= 3) {
    const lastID = shRep.getRange(lastRow, 1).getValue();
    if (lastID) {
      const partes = lastID.split("-");
      consecutivo  = parseInt(partes[2]) + 1;
    }
  }

  const nuevoID       = "UP-01-DE-" + ("0" + consecutivo).slice(-2);
  const nombreArchivo = nuevoID + "_" + nombre;

  // ── Guardar datos en D_n ───────────────────────────────────
  const municipio   = data.municipio;
  const zona        = data.zona;
  const diaInicio   = data.diaInicio;
  const diaFin      = data.diaFin;
  const mes         = data.mes;
  const mesFin      = data.mesFin || "";   // vacío = la comisión es de un solo mes
  const motivo      = data.motivo;
  const actividades = data.actividades;
  const diaF        = data.diaF;
  const mesF        = data.mesF;
  const anoF        = data.anoF;
  const localidades = data.localidades;

  const fechaOficio = "Pachuca de Soto; a " + diaF + " de " + mesF + " de " + anoF;

  // Columnas A-P igual que antes; Q = mes fin, R = número de días
  shDB.getRange(2, 1, 1, 18).setValues([[
    nuevoID,
    nombreArchivo,
    nombre,
    municipio,
    zona,
    diaInicio,
    diaFin,
    mes,
    motivo,
    actividades,
    mesF,
    diaF,
    anoF,
    fechaOficio,
    localidades,
    new Date(),
    mesFin,
    contarDias_(diaInicio, diaFin, mes, mesFin, anoF)
  ]]);

  SpreadsheetApp.flush();

  // ── Pintar hoja de formato y generar PDFs ─────────────────
  pintarDatosEnF_(numero);
  return generarPDF_(numero, nuevoID, nombre);
}


// ============================================================
//  PINTAR DATOS EN F_n
// ============================================================

/**
 * Toma los datos guardados en D_n y en ENCARGADOS y los
 * escribe en las celdas correspondientes de la hoja F_n.
 *
 * @param {number} numero - Número de hoja (D_n / F_n).
 */
function pintarDatosEnF_(numero) {

  const ss  = SpreadsheetApp.getActive();
  const shD = ss.getSheetByName("D_" + numero);
  const shE = ss.getSheetByName("ENCARGADOS");
  const shF = ss.getSheetByName("F_" + numero);

  // ── Leer datos de D_n ──────────────────────────────────────
  const datosD = shD.getRange("A2:R2").getValues()[0];
  const nombre = datosD[2];

  // ── Buscar al trabajador en ENCARGADOS ─────────────────────
  const lastRow  = shE.getLastRow();
  const dataEnc  = shE.getRange(2, 1, lastRow - 1, 13).getValues();
  let filaPersona = null;

  for (let i = 0; i < dataEnc.length; i++) {
    if (dataEnc[i][1] === nombre) {
      filaPersona = dataEnc[i];
      break;
    }
  }

  if (!filaPersona) {
    throw new Error("No se encontró en ENCARGADOS: " + nombre);
  }

  // ── Extraer columnas de ENCARGADOS ────────────────────────
  const adscripcion = filaPersona[2];
  const categoria   = filaPersona[3];
  const nivel       = filaPersona[4];
  const rfc         = filaPersona[5];
  const nivelAplic  = filaPersona[6];
  const cuenta      = filaPersona[7];
  const e_firma     = filaPersona[8];
  const e_puesto    = filaPersona[9];
  const no_trab     = filaPersona[10];

  // ── Extraer columnas de D_n ───────────────────────────────
  const municipio   = datosD[3];
  const zona        = datosD[4];
  const diaInicio   = datosD[5];
  const diaFin      = datosD[6];
  const mes         = datosD[7];
  const motivo      = datosD[8];
  const actividades = datosD[9];
  const fecha_f     = datosD[13];
  const localidad   = datosD[14];
  const mesFin      = datosD[16];
  const numDias     = Number(datosD[17]);
  const munilocal   = municipio + "-" + localidad;

  const cruzaMes = !!mesFin && mesFin !== mes;

  // Si la comisión cruza de mes, en la celda del mes van los dos
  // (ej. "septiembre-octubre"); si no, queda igual que antes.
  const mesPliego = (mesFin && mesFin !== mes) ? mes + "-" + mesFin : mes;

  // ── Escribir en F_n ───────────────────────────────────────
  shF.getRange("F10").setValue(nombre);
  shF.getRange("F11").setValue(adscripcion);
  shF.getRange("F13").setValue(categoria);
  shF.getRange("F14").setValue(nivel);
  shF.getRange("R10").setValue(rfc);
  shF.getRange("T14").setValue(nivelAplic);
  shF.getRange("S18").setValue(cuenta);

  shF.getRange("F31").setValue(zona);
  shF.getRange("C34").setValue(munilocal);
  shF.getRange("C26").setValue(motivo);
  shF.getRange("C42").setValue(actividades);
  // Las fórmulas de la tabla (Días / Importe) cuentan con O31 - M31 + 1.
  // Si la comisión cruza de mes (30 al 2), esa resta no sirve; se les da
  // 1 y el número real de días para que calculen igual que una comisión
  // normal. La frase del periodo se escribe aparte en el PDF.
  shF.getRange("M31").setValue(cruzaMes ? 1 : diaInicio);
  shF.getRange("O31").setValue(cruzaMes ? numDias : diaFin);
  shF.getRange("S31").setValue(mesPliego);
  shF.getRange("D52").setValue(e_firma);
  shF.getRange("D53").setValue(e_puesto);
}


// ============================================================
//  GENERADOR DE PDFs (OFICIO + PLIEGO)
// ============================================================

/**
 * Genera dos PDFs:
 *  1. Oficio — a partir de la plantilla de Google Docs.
 *  2. Pliego — exportando la hoja F_n como PDF.
 * Ambos se guardan en Drive y se registran en REPORTES.
 *
 * @param {number} numero - Número de hoja.
 * @param {string} id     - ID consecutivo (ej. UP-04-01).
 * @param {string} nombre - Nombre del trabajador.
 * @returns {{ oficio: string, pliego: string }} URLs de Drive.
 */
function generarPDF_(numero, id, nombre) {

  const ss    = SpreadsheetApp.getActive();
  const shF   = ss.getSheetByName("F_" + numero);
  const shD   = ss.getSheetByName("D_" + numero);
  const shRep = ss.getSheetByName("REPORTES");
  const shE   = ss.getSheetByName("ENCARGADOS");

  // ── Datos de D_n ──────────────────────────────────────────
  const datos     = shD.getRange("A2:S2").getValues()[0];
  const municipio   = datos[3];
  const mes         = datos[7];
  const motivo      = datos[8];
  const actividades = datos[9];
  const mesF        = datos[10];
  const diaF        = datos[11];
  const anoF        = datos[12];
  const fechaOf     = datos[13];
  const localidad   = datos[14];
  const mesFin      = datos[16];
  const diain       = Number(datos[5]);
  const diafin      = Number(datos[6]);

  const cruzaMes = !!mesFin && mesFin !== mes;

  // ── Datos de ENCARGADOS ────────────────────────────────────
  const dataEnc = shE.getDataRange().getValues();
  let filaPersona = null;

  for (let i = 1; i < dataEnc.length; i++) {
    if (dataEnc[i][1] === nombre) {
      filaPersona = dataEnc[i];
      break;
    }
  }

  if (!filaPersona) throw new Error("No encontrado en ENCARGADOS: " + nombre);

  const categoria = filaPersona[3];
  const rfc       = filaPersona[5];
  const e_firma   = filaPersona[8];
  const e_puesto  = filaPersona[9];
  const no_trab   = filaPersona[10];
  const unidad    = filaPersona[11];
  const depto     = filaPersona[12];

  // ── Texto de días ─────────────────────────────────────────
  // Un mes:   "los días 3, 4 y 5"                          (igual que antes)
  // Dos meses: "los días 30 de septiembre, 1 y 2 de octubre"
  const diasTexto = generarListaDias_(diain, diafin, mes, cruzaMes ? mesFin : "", anoF);

  // ==========================================================
  // 1. OFICIO — copia de plantilla Google Docs
  // ==========================================================

  const copia = DriveApp.getFileById(TEMPLATE_DOC_ID)
    .makeCopy(id + "_" + nombre + "_OFICIO_TMP");

  const doc  = DocumentApp.openById(copia.getId());
  const body = doc.getBody();

  body.replaceText("<<NOMBRE>>",     safe_(nombre));
  body.replaceText("<<CAT>>",        safe_(categoria));
  body.replaceText("<<NOEMPLEADO>>", safe_(no_trab));
  body.replaceText("<<RFC>>",        safe_(rfc));
  body.replaceText("<<FECHAOF>>",    safe_(fechaOf));

  if (cruzaMes) {
    // Con dos meses, el texto de días ya trae cada mes. En la plantilla
    // "<<DIAS>> de <<MESOF>>" se sustituye COMPLETO por ese texto, para
    // que no quede "…2 de octubre de octubre". Lo que sigue después de
    // <<MESOF>> (ej. " de <<ANOOF>>") se conserva igual.
    if (body.findText("<<DIAS>>.*<<MESOF>>")) {
      body.replaceText("<<DIAS>>.*<<MESOF>>", safe_(diasTexto));
    } else {
      body.replaceText("<<DIAS>>", safe_(diasTexto));
    }
  } else {
    body.replaceText("<<DIAS>>",     safe_(diasTexto));
  }

  body.replaceText("<<MESOF>>",      safe_(mesF));
  body.replaceText("<<ANOOF>>",      safe_(anoF));
  body.replaceText("<<MUNICIPIO>>",  safe_(municipio + " - " + localidad));
  body.replaceText("<<ACTIVIDADES>>",safe_(motivo));
  body.replaceText("<<E_FIRMAR>>",   safe_(e_firma));
  body.replaceText("<<E_PUESTO>>",   safe_(e_puesto));
  body.replaceText("<<UNIDAD>>",     safe_(unidad));
  body.replaceText("<<DEPT>>",       safe_(depto));

  doc.saveAndClose();

  const nombreOficio = id + "_" + nombre + "_OFICIO.pdf";
  const blobOficio   = copia.getAs("application/pdf").setName(nombreOficio);
  const fileOficio   = DriveApp.getFolderById(FOLDER_ID).createFile(blobOficio);

  // ==========================================================
  // 2. PLIEGO — exportar hoja F_n como PDF
  // ==========================================================

  const tmpSS  = SpreadsheetApp.create("TMP_EXPORT_" + Date.now());
  const tmpId  = tmpSS.getId();
  const tmpF   = shF.copyTo(tmpSS).setName("PLIEGO");

  tmpSS.deleteSheet(tmpSS.getSheets()[0]);

  // Comisión que cruza de mes: la fila del periodo se redacta completa
  // en una sola celda (ver redactarPeriodoPliego_)
  if (cruzaMes) {
    // Primero se congelan los resultados (Días, Importe, Total) para que
    // borrar M31 / O31 al escribir la frase no los recalcule en blanco.
    SpreadsheetApp.flush();
    convertirAValores_(tmpF);
    redactarPeriodoPliego_(tmpF, diain, mes, diafin, mesFin, anoF);
  }

  recortarHoja_(tmpF, "C1:V64");
  normalizarNumerosEnFN_(tmpF);
  convertirAValores_(tmpF);
  quitarBotones_(tmpF);

  SpreadsheetApp.flush();
  Utilities.sleep(500);

  const gid = tmpF.getSheetId();

  const urlExport =
    "https://docs.google.com/spreadsheets/d/" + tmpId + "/export" +
    "?exportFormat=pdf&format=pdf" +
    "&gid="                  + gid +
    "&size=letter"           +
    "&portrait=true"         +
    "&scale=4"               +
    "&horizontal_alignment=CENTER" +
    "&vertical_alignment=MIDDLE"   +
    "&sheetnames=false"      +
    "&printtitle=false"      +
    "&pagenumbers=false"     +
    "&gridlines=false"       +
    "&fzr=false"             +
    "&top_margin=0.10"       +
    "&bottom_margin=0.10"    +
    "&left_margin=0.10"      +
    "&right_margin=0.10";

  const response = UrlFetchApp.fetch(urlExport, {
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() }
  });

  const nombrePliego = id + "_" + nombre + "_PLIEGO.pdf";
  const blobPliego   = response.getBlob().setName(nombrePliego);
  const filePliego   = DriveApp.getFolderById(FOLDER_ID).createFile(blobPliego);

  // ==========================================================
  // 3. REGISTRAR EN REPORTES
  // ==========================================================

  const linkOficio = "https://drive.google.com/file/d/" + fileOficio.getId() + "/view";
  const linkPliego = "https://drive.google.com/file/d/" + filePliego.getId() + "/view";
  const row        = Math.max(shRep.getLastRow() + 1, 3);

  shRep.getRange(row, 1).setValue(id);
  shRep.getRange(row, 2).setValue(nombreOficio);
  shRep.getRange(row, 3).setRichTextValue(
    SpreadsheetApp.newRichTextValue().setText("VER PDF").setLinkUrl(linkOficio).build()
  );
  shRep.getRange(row, 4).setValue(nombrePliego);
  shRep.getRange(row, 5).setRichTextValue(
    SpreadsheetApp.newRichTextValue().setText("VER PDF").setLinkUrl(linkPliego).build()
  );
  shRep.getRange(row, 6).setValue(new Date());

  // ==========================================================
  // 4. LIMPIEZA — eliminar archivos temporales
  // ==========================================================

  DriveApp.getFileById(tmpId).setTrashed(true);
  DriveApp.getFileById(copia.getId()).setTrashed(true);

  return { oficio: linkOficio, pliego: linkPliego };
}


// ============================================================
//  ENDPOINT WEB (doPost)
// ============================================================

/**
 * Recibe una petición POST desde la web app con los datos
 * del formulario y genera los PDFs de los seleccionados.
 *
 * @param {Object} e - Evento de Apps Script (e.parameter / e.parameters).
 * @returns {ContentService.TextOutput} JSON con resultados o error.
 */
function doPost(e) {

  try {

    const data = e.parameter;
    let lista  = e.parameters.seleccionados;

    if (!lista || lista.length === 0) {
      throw new Error("No seleccionaste ninguna persona.");
    }

    if (!Array.isArray(lista)) lista = [lista];

    const resultados = [];

    for (let i = 0; i < lista.length; i++) {

      const nombre = lista[i];
      const numero = MAPA_PERSONAS[nombre];

      if (!numero) throw new Error("Persona no reconocida: " + nombre);

      const pdfs = procesarPliego_(numero, nombre, data);

      resultados.push({
        nombre : nombre,
        oficio : pdfs.oficio,
        pliego : pdfs.pliego
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, resultados: resultados }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// ============================================================
//  UTILIDADES PRIVADAS
// ============================================================

/**
 * Une una lista de días al estilo del oficio:
 * [5] → "5" · [2, 3] → "2 y 3" · [3, 4, 5] → "3, 4 y 5"
 *
 * @param {number[]} dias
 * @returns {string}
 */
function unirDias_(dias) {
  if (dias.length === 1) return String(dias[0]);
  if (dias.length === 2) return dias[0] + " y " + dias[1];
  return dias.slice(0, -1).join(", ") + " y " + dias[dias.length - 1];
}

/**
 * Genera un texto legible con el rango de días, incluyendo
 * la leyenda "el día" (singular) o "los días" (plural).
 *
 * Un solo mes (mesFin vacío) — igual que antes:
 *   (5, 5)  → "el día 5"
 *   (2, 3)  → "los días 2 y 3"
 *   (3, 6)  → "los días 3, 4, 5 y 6"
 *
 * Dos meses (la comisión cruza al mes siguiente):
 *   (30, 2, "septiembre", "octubre") → "los días 30 de septiembre, 1 y 2 de octubre"
 *   (29, 1, "septiembre", "octubre") → "los días 29 y 30 de septiembre y 1 de octubre"
 *
 * @param {number} diaInicio
 * @param {number} diaFin
 * @param {string} [mes]     - Mes de inicio (solo se usa si cruza de mes).
 * @param {string} [mesFin]  - Mes de fin; vacío si es un solo mes.
 * @param {number} [anio]    - Año, para saber cuántos días tiene febrero.
 * @returns {string}
 */
function generarListaDias_(diaInicio, diaFin, mes, mesFin, anio) {

  diaInicio = Number(diaInicio);
  diaFin    = Number(diaFin);

  if (!diaInicio || !diaFin) return "";

  // ── Un solo mes: exactamente como siempre ────────────────
  if (!mesFin || mesFin === mes) {

    if (diaFin < diaInicio) return "";

    const dias = [];
    for (let d = diaInicio; d <= diaFin; d++) dias.push(d);

    if (dias.length === 1) return "el día " + dias[0];
    return "los días " + unirDias_(dias);
  }

  // ── Dos meses: días del primer mes + días del segundo ────
  const iMes = MESES.indexOf(String(mes).toLowerCase().trim());
  if (iMes < 0) return "";

  const ultimoDia = new Date(Number(anio) || new Date().getFullYear(), iMes + 1, 0).getDate();

  const diasMes1 = [];
  for (let d = diaInicio; d <= ultimoDia; d++) diasMes1.push(d);

  const diasMes2 = [];
  for (let d = 1; d <= diaFin; d++) diasMes2.push(d);

  if (diasMes1.length === 0 || diasMes2.length === 0) return "";

  // Si el segundo tramo es un solo día se une con "y"; si son varios, con coma
  const separador = diasMes2.length === 1 ? " y " : ", ";

  return "los días " +
    unirDias_(diasMes1) + " de " + mes +
    separador +
    unirDias_(diasMes2) + " de " + mesFin;
}

/**
 * Cuenta los días de la comisión (también si cruza de mes).
 * (3, 5) → 3 · (30, 2, "septiembre", "octubre") → 3
 *
 * @returns {number}
 */
function contarDias_(diaInicio, diaFin, mes, mesFin, anio) {

  diaInicio = Number(diaInicio);
  diaFin    = Number(diaFin);

  if (!mesFin || mesFin === mes) return diaFin - diaInicio + 1;

  const iMes = MESES.indexOf(String(mes).toLowerCase().trim());
  const ultimoDia = new Date(Number(anio) || new Date().getFullYear(), iMes + 1, 0).getDate();

  return (ultimoDia - diaInicio + 1) + diaFin;
}

/**
 * Cuando la comisión cruza de mes, la fila "Periodo de comisión del __ al __
 * del mes de __ de ____" del pliego no alcanza para dos meses. Esta función
 * combina I31:V31 y escribe ahí el periodo ya redactado, ej.:
 *   "30 de septiembre al 2 de octubre de 2026"
 * Si a la izquierda (C31:H31) no está la etiqueta "Periodo de comisión",
 * escribe la frase completa. Solo se aplica a la copia temporal que se
 * exporta a PDF; la hoja F_n original no se toca.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Copia temporal del pliego.
 * @param {number} diaIni
 * @param {string} mesIni
 * @param {number} diaFin
 * @param {string} mesFin
 * @param {number|string} anio
 */
function redactarPeriodoPliego_(sheet, diaIni, mesIni, diaFin, mesFin, anio) {

  const RANGO = "I31:V31";

  // Lo que dice la etiqueta a la izquierda, para no repetir palabras
  const etiqueta = sheet.getRange("C31:H31").getDisplayValues()[0]
    .join(" ").replace(/\s+/g, " ").trim().toLowerCase();

  const periodo = diaIni + " de " + mesIni + " al " + diaFin + " de " + mesFin + " de " + anio;

  let texto;
  if (/periodo de comisi/.test(etiqueta)) {
    texto = /\bdel$/.test(etiqueta) ? periodo : "del " + periodo;
  } else {
    texto = "Periodo de comisión del " + periodo;
  }

  // Mismo tipo y tamaño de letra que la celda del día (M31)
  const base   = sheet.getRange("M31");
  const fuente = base.getFontFamily();
  const tamano = base.getFontSize();
  const color  = base.getFontColor();

  const celda = sheet.getRange(RANGO);
  celda.breakApart();
  celda.clearContent();
  // Quitar las rayitas de los huecos (día inicio, día fin y mes)
  celda.setBorder(null, null, false, null, false, null);
  celda.merge();

  celda.setValue(texto)
    .setFontFamily(fuente)
    .setFontSize(tamano)
    .setFontColor(color)
    .setFontWeight("normal")
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle")
    .setWrap(true);
}

/**
 * Convierte null / undefined a cadena vacía para evitar
 * que replaceText escriba "null" en el documento.
 *
 * @param {*} value
 * @returns {string}
 */
function safe_(value) {
  return value !== null && value !== undefined ? String(value) : "";
}

/**
 * Reemplaza todas las fórmulas de una hoja por sus valores
 * mostrados, para que el PDF sea estático.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function convertirAValores_(sheet) {
  const range  = sheet.getDataRange();
  const values = range.getDisplayValues();
  range.setValues(values);
}

/**
 * Elimina dibujos y gráficas de una hoja (útil antes de exportar).
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function quitarBotones_(sheet) {
  try { sheet.getDrawings().forEach(d => d.remove()); }  catch (e) {}
  try { sheet.getCharts().forEach(ch => sheet.removeChart(ch)); } catch (e) {}
}

/**
 * Recorta la hoja para que sólo quede el rango indicado,
 * eliminando filas y columnas sobrantes.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} rangoStr - Ej. "C1:V64"
 */
function recortarHoja_(sheet, rangoStr) {

  const range    = sheet.getRange(rangoStr);
  const startCol = range.getColumn();
  const startRow = range.getRow();
  const numCols  = range.getNumColumns();
  const numRows  = range.getNumRows();

  if (startCol > 1) sheet.deleteColumns(1, startCol - 1);
  if (startRow > 1) sheet.deleteRows(1, startRow - 1);

  const extraCols = sheet.getMaxColumns() - numCols;
  const extraRows = sheet.getMaxRows()    - numRows;

  if (extraCols > 0) sheet.deleteColumns(numCols + 1, extraCols);
  if (extraRows > 0) sheet.deleteRows(numRows  + 1, extraRows);
}

/**
 * Normaliza números con comas/puntos en la hoja para que
 * el PDF muestre el formato correcto (dos decimales).
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function normalizarNumerosEnFN_(sheet) {

  const range  = sheet.getDataRange();
  const values = range.getDisplayValues();

  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {

      let valor = values[i][j];

      if (typeof valor === "string" && /[.,]/.test(valor)) {

        valor = valor.trim();

        if (valor.indexOf(".") > -1 && valor.indexOf(",") > -1) {
          if (valor.lastIndexOf(",") > valor.lastIndexOf(".")) {
            // Formato europeo: 1.900,00 → 1900.00
            valor = valor.replace(/\./g, "");
            valor = valor.replace(",", ".");
          } else {
            // CORREGIDO: formato US: 1,900.00 → 1900.00 (antes se leía como 1)
            valor = valor.replace(/,/g, "");
          }
        } else if (valor.indexOf(",") > -1 && valor.indexOf(".") === -1) {
          if (/^\d{1,3}(,\d{3})+$/.test(valor)) {
            // CORREGIDO: miles sin decimales: 1,900 → 1900
            valor = valor.replace(/,/g, "");
          } else {
            // Coma decimal: 12,5 → 12.5
            valor = valor.replace(",", ".");
          }
        }

        const numero = parseFloat(valor);

        if (!isNaN(numero) && /^-?\d+(\.\d+)?$/.test(valor)) {
          values[i][j] = numero.toLocaleString("en-US", {
            minimumFractionDigits : 2,
            maximumFractionDigits : 2
          });
        }
      }
    }
  }

  range.setValues(values);

  // Fuerza el formato de dos decimales en las celdas de importe,
  // para que Sheets no vuelva a mostrar "990" en lugar de "990.00".
  const esImporte = /^\d{1,3}(,\d{3})*\.\d{2}$/;
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      if (esImporte.test(String(values[i][j]))) {
        sheet.getRange(i + 1, j + 1).setNumberFormat("#,##0.00");
      }
    }
  }
}
