const TEMPLATE_DOC_ID = "1qbrP_cX_vr8vos-QG3JLp8ZsRjuxAFe-Vg4vNuiVcSY";
const MAPA_PERSONAS = {

    "Mtro. Juan Roberto Lazcano Trejo": 1,
    "Mtro. Edgar Missael Montoya Rubio": 2,
    "Mtra. Lizeth Vargas Juárez": 3,
    "Lic. Elizabeth Martínez Hernández": 4,
    "Lic. Alfonso Fernandez Moreno": 5,
    "Ing. Isauro Márquez Trejo": 6,
    "Lic. Tania Yeraldin Lara Hernández": 7,
    "Ing. Marlene Jiménez Ramírez": 8,
    "Lic. Ariadna Ramírez Hernández": 9,
    "Lic. Daena Gaudalupe Acosta Hernández": 10,
    "Lic. Reyna Bautista Granados": 11,
    "L.A.S.C. Julio Cesar Granados Colmenares": 12,
    "C. Viridiana Barraza Cortez": 13,
    "Ing. Ana Gabriela Gutiérrez Gamero": 14

};

/************************************************************
 * BOTÓN PRINCIPAL (MULTIPLE SELECCIÓN)
 ************************************************************/
function enviarSeleccionAD1() {

  const ss = SpreadsheetApp.getActive();
  const ui = SpreadsheetApp.getUi();

  const shSel = ss.getSheetByName("SELECCION_II");
  const shRep = ss.getSheetByName("REPORTES");

  if (!shSel || !shRep) {
    ui.alert("Faltan hojas necesarias.");
    return;
  }

  const nombres = shSel.getRange("A3:A100").getValues();
  const checks  = shSel.getRange("F3:F100").getValues();

  let procesados = 0;

  for (let i = 0; i < checks.length; i++) {

    if (checks[i][0] === true) {

      const numero = i + 1; // F3=1, F4=2, F5=3...
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


/************************************************************
 * PROCESAR PLIEGO DINÁMICO
 ************************************************************/
function procesarPliego_(numero, nombre, data) {

  const ss = SpreadsheetApp.getActive();
  const shRep = ss.getSheetByName("REPORTES");

  const shDB = ss.getSheetByName("D_" + numero);
  const shF  = ss.getSheetByName("F_" + numero);

  if (!shDB || !shF) {
    throw new Error("No existen hojas D_" + numero + " o F_" + numero);
  }

  // ===== ID =====
  let consecutivo = 1;
  const lastRow = shRep.getLastRow();

  if (lastRow >= 3) {
    const lastID = shRep.getRange(lastRow, 1).getValue();
    if (lastID) {
      const partes = lastID.split("-");
      consecutivo = parseInt(partes[2]) + 1;
    }
  }

  const nuevoID = "UP-05-" + ("0" + consecutivo).slice(-2);
  const nombreArchivo = nuevoID + "_" + nombre;

  // ===== DATOS DESDE WEB (AQUÍ ESTÁ LA CLAVE) =====
  const municipio   = data.municipio;
  const zona        = data.zona;
  const diaInicio   = data.diaInicio;
  const diaFin      = data.diaFin;
  const mes         = data.mes;
  const motivo      = data.motivo;
  const actividades = data.actividades;

  const diaF  = data.diaF;
  const mesF  = data.mesF;
  const anoF  = data.anoF;

  const fechaOficio = "Pachuca de Soto; a " + diaF +
                      " de " + mesF +
                      " de " + anoF;

  const localidades = data.localidades;

  // ===== GUARDAR =====
  shDB.getRange(2,1,1,16).setValues([[
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
    new Date()
  ]]);

  SpreadsheetApp.flush();

  pintarDatosEnF_(numero);
  return generarPDF_(numero, nuevoID, nombre); 
}

/************************************************************
 * PINTAR DATOS EN F_n
 ************************************************************/
function pintarDatosEnF_(numero) {

  const ss = SpreadsheetApp.getActive();

  const shD = ss.getSheetByName("D_" + numero);
  const shE = ss.getSheetByName("ENCARGADOS");
  const shF = ss.getSheetByName("F_" + numero);

  const datosD = shD.getRange("A2:O2").getValues()[0];
  const nombre = datosD[2];

  // Traer toda la base ENCARGADOS
  const lastRow = shE.getLastRow();
  const dataEnc = shE.getRange(2,1,lastRow-1,11).getValues();

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

  // Columnas según tu base:
  const adscripcion = filaPersona[2];
  const categoria   = filaPersona[3];
  const nivel       = filaPersona[4];
  const rfc         = filaPersona[5];
  const nivelAplic  = filaPersona[6];
  const cuenta      = filaPersona[7];
  const e_firma     = filaPersona[8];
  const e_puesto    = filaPersona[9];
  const no_trab     = filaPersona[10];

  const municipio   = datosD[3];
  const zona        = datosD[4];
  const diaInicio   = datosD[5];
  const diaFin      = datosD[6];
  const mes         = datosD[7];
  const motivo      = datosD[8];
  const actividades = datosD[9];
  const mes_f       = datosD[10];
  const ano_f       = datosD[11];
  const fecha_f     = datosD[13];
  const localidad   = datosD[14];
  const munilocal= municipio+"-"+localidad;
  
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
  shF.getRange("M31").setValue(diaInicio);
  shF.getRange("O31").setValue(diaFin);
  shF.getRange("S31").setValue(mes);
  shF.getRange("D52").setValue(e_firma);
  shF.getRange("D53").setValue(e_puesto);
}

/************************************************************
 * GENERADOR PDF DINÁMICO
 ************************************************************/
function generarPDF_(numero, id, nombre) {

  const ss = SpreadsheetApp.getActive();
  const shF = ss.getSheetByName("F_" + numero);
  const shO = ss.getSheetByName("O_" + numero);
  const shD = ss.getSheetByName("D_" + numero);
  const shRep = ss.getSheetByName("REPORTES");

  const folderId = "1tleCw5286KGM-oR8T_iUCX_oWgvfo6Cn";

  // ======================================================
  // 1️⃣ GENERAR OFICIO DESDE GOOGLE DOCS
  // ======================================================

function generarListaDias(diaInicio, diaFin) {

  diaInicio = Number(diaInicio);
  diaFin = Number(diaFin);

  if (!diaInicio || !diaFin || diaFin < diaInicio) {
    return "";
  }

  let dias = [];

  for (let d = diaInicio; d <= diaFin; d++) {
    dias.push(d);
  }

  if (dias.length === 1) return String(dias[0]);

  if (dias.length === 2) return dias[0] + " y " + dias[1];

  return dias.slice(0, -1).join(", ") + " y " + dias[dias.length - 1];
}

  const datos = shD.getRange("A2:S2").getValues()[0];

  const municipio   = datos[3];
  const actividades = datos[9];
  const mesF        = datos[10];
  const diaF        = datos[11];
  const anoF        = datos[12];
  const fechaOf     = datos[13];
  const localidad   = datos[14];

  const shE = ss.getSheetByName("ENCARGADOS");
  const dataEnc = shE.getDataRange().getValues();

  let filaPersona = null;
  for (let i = 1; i < dataEnc.length; i++) {
    if (dataEnc[i][1] === nombre) {
      filaPersona = dataEnc[i];
      break;
    }
  }

  if (!filaPersona) throw new Error("No encontrado en ENCARGADOS");

  const categoria = filaPersona[3];
const rfc       = filaPersona[5];
const e_firma   = filaPersona[8];
const e_puesto  = filaPersona[9];
const no_trab   = filaPersona[10];

const motivo = datos[8];

const diain  = Number(datos[5]);   // día inicio
const diafin = Number(datos[6]);   // día fin

// Generar texto dinámico de días
const diasTexto = generarListaDias(diain, diafin);

  const copia = DriveApp.getFileById(TEMPLATE_DOC_ID)
    .makeCopy(id + "_" + nombre + "_OFICIO_TMP");

  const doc = DocumentApp.openById(copia.getId());
  const body = doc.getBody();

  // Función segura para evitar undefined o null
function safe(value) {
  return value !== null && value !== undefined ? String(value) : "";
}

// Reemplazos seguros
body.replaceText("<<NOMBRE>>", safe(nombre));
body.replaceText("<<CAT>>", safe(categoria));
body.replaceText("<<NOEMPLEADO>>", safe(no_trab));
body.replaceText("<<RFC>>", safe(rfc));
body.replaceText("<<FECHAOF>>", safe(fechaOf));

// 👇 ESTE es el importante
body.replaceText("<<DIAS>>", safe(diasTexto));

body.replaceText("<<MESOF>>", safe(mesF));
body.replaceText("<<ANOOF>>", safe(anoF));
body.replaceText("<<MUNICIPIO>>", safe(municipio + " - " + localidad));
body.replaceText("<<ACTIVIDADES>>", safe(motivo));

body.replaceText("<<E_FIRMAR>>", safe(e_firma));
body.replaceText("<<E_PUESTO>>", safe(e_puesto));

doc.saveAndClose();

const nombreOficio = id + "_" + nombre + "_OFICIO.pdf";

const blobOficio = copia.getAs("application/pdf")
  .setName(nombreOficio);

  const fileOficio = DriveApp.getFolderById(folderId)
    .createFile(blobOficio);

  // ======================================================
  // 2️⃣ GENERAR PLIEGO DESDE SHEETS
  // ======================================================

  const tmpSS = SpreadsheetApp.create("TMP_EXPORT_" + Date.now());
  const tmpId = tmpSS.getId();

 const tmpF = shF.copyTo(tmpSS).setName("PLIEGO");
tmpSS.deleteSheet(tmpSS.getSheets()[0]);

recortarHoja_(tmpF, "C1:V64");
normalizarNumerosEnFN_(tmpF);
convertirAValores_(tmpF);
quitarBotones_(tmpF);

  SpreadsheetApp.flush();
  Utilities.sleep(500);

  const gid = tmpF.getSheetId();

 const urlExport = "https://docs.google.com/spreadsheets/d/" + tmpId + "/export" +
    "?exportFormat=pdf&format=pdf" +
    "&gid=" + gid + 
    "&size=letter" +
    "&portrait=true" +
    "&scale=4" +
    "&horizontal_alignment=CENTER" +
    "&vertical_alignment=MIDDLE" +
    "&sheetnames=false" +
    "&printtitle=false" +
    "&pagenumbers=false" +
    "&gridlines=false" +
    "&fzr=false" +
    "&top_margin=0.10" +
    "&bottom_margin=0.10" +
    "&left_margin=0.10" +
    "&right_margin=0.10";

  const response = UrlFetchApp.fetch(urlExport, {
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() }
  });

  const nombrePliego = id + "_" + nombre + "_PLIEGO.pdf";

const blobPliego = response.getBlob()
  .setName(nombrePliego);

  const filePliego = DriveApp.getFolderById(folderId).createFile(blobPliego);
  // ======================================================
  // 4️⃣ REGISTRAR EN REPORTES
  // ======================================================

  const row = Math.max(shRep.getLastRow() + 1, 3);

// OFICIO
const linkOficio = "https://drive.google.com/file/d/" + fileOficio.getId() + "/view";

// PLIEGO
const linkPliego = "https://drive.google.com/file/d/" + filePliego.getId() + "/view";

// ID
shRep.getRange(row,1).setValue(id);

// NOMBRE OFICIO
shRep.getRange(row,2).setValue(nombreOficio);

// LINK OFICIO
shRep.getRange(row,3).setRichTextValue(
  SpreadsheetApp.newRichTextValue()
    .setText("VER PDF")
    .setLinkUrl(linkOficio)
    .build()
);

// NOMBRE PLIEGO
shRep.getRange(row,4).setValue(nombrePliego);

// LINK PLIEGO
shRep.getRange(row,5).setRichTextValue(
  SpreadsheetApp.newRichTextValue()
    .setText("VER PDF")
    .setLinkUrl(linkPliego)
    .build()
);

// FECHA (si quieres mantenerla)
shRep.getRange(row,6).setValue(new Date());

  // ======================================================
  // 5️⃣ LIMPIEZA
  // ======================================================
 DriveApp.getFileById(tmpId).setTrashed(true);
DriveApp.getFileById(copia.getId()).setTrashed(true);
return {
  oficio: linkOficio,
  pliego: linkPliego


}
}
/************************************************************
 * UTILIDADES
 ************************************************************/
function convertirAValores_(sheet) {
  const range = sheet.getDataRange();
  const values = range.getDisplayValues();
  range.setValues(values);
}

function quitarBotones_(sheet) {
  try { sheet.getDrawings().forEach(d => d.remove()); } catch (e) {}
  try { sheet.getCharts().forEach(ch => sheet.removeChart(ch)); } catch (e) {}
}

function recortarHoja_(sheet, rangoStr) {

  const range = sheet.getRange(rangoStr);

  const startCol = range.getColumn();
  const startRow = range.getRow();
  const numCols = range.getNumColumns();
  const numRows = range.getNumRows();

  if (startCol > 1) sheet.deleteColumns(1, startCol - 1);
  if (startRow > 1) sheet.deleteRows(1, startRow - 1);

  const extraCols = sheet.getMaxColumns() - numCols;
  const extraRows = sheet.getMaxRows() - numRows;

  if (extraCols > 0) sheet.deleteColumns(numCols + 1, extraCols);
  if (extraRows > 0) sheet.deleteRows(numRows + 1, extraRows);
}
function normalizarNumerosEnFN_(sheet) {

  const range = sheet.getDataRange();

  const values = range.getValues();

  for (let i = 0; i < values.length; i++) {

    for (let j = 0; j < values[i].length; j++) {

      let valor = values[i][j];

      // SOLO NÚMEROS
      if (typeof valor === "number") {

        values[i][j] = valor.toFixed(2);

      }

      // TEXTO NUMÉRICO
      else if (typeof valor === "string") {

        valor = valor.trim();

        let numero = Number(
          valor
            .replace(/\./g, "")
            .replace(",", ".")
        );

        if (!isNaN(numero)) {

          values[i][j] = numero.toFixed(2);

        }

      }

    }

  }

  range.setValues(values);

}

function doPost(e) {

  try {

    const data = e.parameter;

    let lista = e.parameters.seleccionados;

    if (!lista || lista.length === 0) {
      throw new Error("No seleccionaste ninguna persona");
    }

    if (!Array.isArray(lista)) {
      lista = [lista];
    }

    const resultados = [];

    for (let i = 0; i < lista.length; i++) {

      const nombre = lista[i];

      const numero = MAPA_PERSONAS[nombre];

      const pdfs = procesarPliego_(numero, nombre, data);

      resultados.push({
        nombre: nombre,
        oficio: pdfs.oficio,
        pliego: pdfs.pliego
      });
    }

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: true,
          resultados: resultados
        })
      )
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err){

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: false,
          error: err.message
        })
      )
      .setMimeType(ContentService.MimeType.JSON);
  }
}