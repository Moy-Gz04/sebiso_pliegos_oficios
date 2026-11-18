// ============================================================
//  UP-07 — Crear hojas D_33…D_36 y F_33…F_36 duplicando D_2 y F_2
//  Ejecutar UNA vez: función crearHojasFaltantes
//  - Si la hoja ya existe, la salta (no la sobrescribe).
//  - Las fórmulas de F_n que apuntaban a D_2 se cambian a D_n.
//  - Limpia la fila 2 de D_n (los datos de la persona 2).
// ============================================================

function crearHojasFaltantes() {
  const DESDE = 33, HASTA = 36;
  const ss = SpreadsheetApp.getActive();
  const baseD = ss.getSheetByName("D_2");
  const baseF = ss.getSheetByName("F_2");
  if (!baseD || !baseF) throw new Error("No existen D_2 o F_2");

  const creadas = [], saltadas = [];

  for (let n = DESDE; n <= HASTA; n++) {
    // ── D_n ──
    if (ss.getSheetByName("D_" + n)) {
      saltadas.push("D_" + n);
    } else {
      const d = baseD.copyTo(ss).setName("D_" + n);
      d.getRange("A2:R2").clearContent();
      creadas.push("D_" + n);
    }

    // ── F_n ──
    if (ss.getSheetByName("F_" + n)) {
      saltadas.push("F_" + n);
    } else {
      const f = baseF.copyTo(ss).setName("F_" + n);
      repuntarFormulas_(f, n);
      creadas.push("F_" + n);
    }
  }

  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert(
    "Creadas (" + creadas.length + "): " + (creadas.join(", ") || "ninguna") +
    "\n\nYa existían (" + saltadas.length + "): " + (saltadas.join(", ") || "ninguna")
  );
}

/** Cambia referencias D_2! / 'D_2'! por D_n en las fórmulas de la hoja. */
function repuntarFormulas_(sh, n) {
  const rango = sh.getDataRange();
  const formulas = rango.getFormulas();
  const re = /(^|[^A-Za-z0-9_])('?)D_2('?)!/g;
  for (let r = 0; r < formulas.length; r++) {
    for (let c = 0; c < formulas[r].length; c++) {
      const fx = formulas[r][c];
      if (fx && re.test(fx)) {
        re.lastIndex = 0;
        sh.getRange(r + 1, c + 1).setFormula(fx.replace(re, "$1$2D_" + n + "$3!"));
      }
      re.lastIndex = 0;
    }
  }
}
