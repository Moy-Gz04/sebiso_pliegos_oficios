/**********************************************************************
 *
 * VIÁTICOS POR U.P. — Generar reporte (PDF en hoja membretada)
 * Mismo formato que los reportes de Programas: logo Bienestar + escudo
 * arriba a la derecha, domicilio abajo, campana de fondo, fecha, título,
 * subtítulos, redacción justificada y tablas. Se elige la U.P. (una,
 * varias o todas), el periodo y las secciones. Usa los datos ya cargados
 * en la tabla (REGISTROS y UNIDADES de tabla-viaticos.js).
 *
 **********************************************************************/

(() => {
    const HOJA = { w: 215.9, h: 279.4, izq: 25, der: 23.4, sup: 38, inf: 34, logo: { x: 107.1, y: 12.4, w: 92.9, h: 16.4 } };
    const GUINDA = [95, 33, 50], DORADO = [169, 130, 76], GRIS = [107, 85, 99], TINTA = [32, 16, 23];
    const DOMICILIO = ["Calle 16 de enero #309 Col. Revolución", "Lt. y Mza.: casa de Gobierno", "Pachuca de Soto, Hgo. C.P.: 42060", "Tel. (771) 71.7.60.00 Ext. 4356", "www.hidalgo.gob.mx"];
    const MESES_MIN = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const hoyISO = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
    const fechaLarga = (iso) => { const [a, m, d] = iso.split("-").map(Number); return `${d} de ${MESES_MIN[m - 1]} de ${a}`; };
    const pesos = (n) => Number(n || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
    const pct = (v, t) => (t > 0 ? v / t * 100 : 0).toFixed(1) + "%";
    const capital = (m) => m.charAt(0) + m.slice(1).toLowerCase();
    // «SUBSECRETARÍA DE INCLUSIÓN Y DESARROLLO» -> «Subsecretaría de Inclusión y Desarrollo»
    const MENORES = new Set(["de", "del", "la", "las", "los", "y", "e", "para", "a", "al", "en", "el", "con"]);
    const nombrePropio = (t) => String(t || "").toLowerCase().split(/\s+/).map((w, i) => (i && MENORES.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    let urlPdf = null, nombrePdf = "Reporte_Viaticos.pdf", LOGO = null, CAMPANA = null;

    const $ = (id) => document.getElementById(id);

    /* ---------- ventana ---------- */
    document.addEventListener("DOMContentLoaded", () => {
        $("tvReporte").addEventListener("click", abrir);
        $("trCancelar").addEventListener("click", () => $("trDialogo").close());
        $("trForm").addEventListener("submit", generar);
        $("trTodas").addEventListener("change", (e) => document.querySelectorAll("#trUnidades input").forEach(c => { c.checked = e.target.checked; }));
        $("trDescargar").addEventListener("click", () => { if (!urlPdf) return; const a = document.createElement("a"); a.href = urlPdf; a.download = nombrePdf; document.body.appendChild(a); a.click(); a.remove(); });
        $("trImprimir").addEventListener("click", () => { const f = $("trFrame"); try { f.contentWindow.focus(); f.contentWindow.print(); } catch { window.open(urlPdf, "_blank"); } });
        $("trVolver").addEventListener("click", () => { $("trVista").hidden = true; $("trForm").hidden = false; });
    });

    function abrir(){
        const claves = [...new Set(REGISTROS.map(r => r.up_clave))].sort();
        const nombre = (c) => (REGISTROS.find(r => r.up_clave === c) || {}).up_nombre || "";
        $("trUnidades").innerHTML = claves.map(c => `
            <label class="tr-up"><input type="checkbox" value="${c}" ${estado.up ? (estado.up === c ? "checked" : "") : "checked"}>
                <span><b>U.P. ${c}</b> ${esc(nombre(c))}</span><em>${REGISTROS.filter(r => r.up_clave === c).length}</em></label>`).join("");
        $("trTodas").checked = !estado.up;
        const opciones = MESES.map((m, i) => `<option value="${i}">${capital(m)}</option>`).join("");
        $("trDesde").innerHTML = opciones; $("trHasta").innerHTML = opciones;
        const conDatos = REGISTROS.map(r => MESES.indexOf(r.mes)).filter(i => i >= 0);
        $("trDesde").value = String(conDatos.length ? Math.min(...conDatos) : 0);
        $("trHasta").value = String(conDatos.length ? Math.max(...conDatos) : 11);
        $("trFecha").value = hoyISO();
        $("trAviso").textContent = "";
        $("trForm").hidden = false; $("trVista").hidden = true;
        $("trDialogo").showModal();
    }

    async function generar(e){
        e.preventDefault();
        const ups = [...document.querySelectorAll("#trUnidades input:checked")].map(c => c.value);
        const desde = Number($("trDesde").value), hasta = Number($("trHasta").value);
        if (!ups.length) { $("trAviso").textContent = "Elige al menos una U.P."; return; }
        if (desde > hasta) { $("trAviso").textContent = "El mes inicial no puede ser posterior al final."; return; }
        const datos = REGISTROS.filter(r => ups.includes(r.up_clave) && MESES.indexOf(r.mes) >= desde && MESES.indexOf(r.mes) <= hasta);
        if (!datos.length) { $("trAviso").textContent = "No hay viáticos de esas U.P. en ese periodo."; return; }
        if (!window.jspdf || !window.jspdf.jsPDF) { $("trAviso").textContent = "No se pudo cargar el generador de PDF. Revisa tu conexión y recarga la página."; return; }
        const btn = $("trGenerar"); btn.disabled = true; btn.textContent = "Generando…";
        try {
            const [logo, campana] = await Promise.all([cargarLogo(), cargarCampana()]);
            const op = {
                ups, desde, hasta, fecha: $("trFecha").value || hoyISO(),
                secciones: { resumen: $("trSecResumen").checked, mes: $("trSecMes").checked, persona: $("trSecPersona").checked, municipio: $("trSecMunicipio").checked, detalle: $("trSecDetalle").checked },
            };
            const doc = construir(datos, op, logo, campana);
            if (urlPdf) URL.revokeObjectURL(urlPdf);
            urlPdf = URL.createObjectURL(doc.output("blob"));
            nombrePdf = `Reporte_Viaticos_${ups.length === 1 ? "UP" + ups[0] : "UP_varias"}_${op.fecha}.pdf`;
            $("trFrame").src = urlPdf + "#toolbar=0&navpanes=0&view=FitH";
            $("trForm").hidden = true; $("trVista").hidden = false;
        } catch (err) {
            console.error(err);
            $("trAviso").textContent = "No se pudo generar el reporte: " + err.message;
        } finally { btn.disabled = false; btn.textContent = "Generar reporte"; }
    }

    async function cargarLogo(){
        if (LOGO) return LOGO;
        const b = await (await fetch("../img/membrete-bienestar.png")).blob();
        LOGO = await new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = mal; r.readAsDataURL(b); });
        return LOGO;
    }
    async function cargarCampana(){
        if (CAMPANA) return CAMPANA;
        const img = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = "../img/campana-fondo.png"; });
        const k = 4, c = document.createElement("canvas"); c.width = img.naturalWidth * k; c.height = img.naturalHeight * k;
        const g = c.getContext("2d"); g.drawImage(img, 0, 0, c.width, c.height);
        g.globalCompositeOperation = "source-in"; g.fillStyle = "rgba(95, 33, 50, 0.08)"; g.fillRect(0, 0, c.width, c.height);
        CAMPANA = c.toDataURL("image/png");
        return CAMPANA;
    }

    /* ---------- PDF ---------- */
    function construir(datos, op, logo, campana){
        const doc = new window.jspdf.jsPDF({ unit: "mm", format: "letter" });
        const ancho = HOJA.w - HOJA.izq - HOJA.der, limite = HOJA.h - HOJA.inf;
        let y = HOJA.sup;
        const conMembrete = new Set();
        const membrete = () => {
            const pg = doc.getCurrentPageInfo().pageNumber;
            if (conMembrete.has(pg)) return; conMembrete.add(pg);
            const altoC = 175; doc.addImage(campana, "PNG", 0, HOJA.h - altoC, altoC * 213 / 384, altoC);
            doc.addImage(logo, "PNG", HOJA.logo.x, HOJA.logo.y, HOJA.logo.w, HOJA.logo.h);
            doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(60, 60, 60);
            DOMICILIO.forEach((l, i) => doc.text(l, HOJA.w - HOJA.der, HOJA.h - 22 + i * 3.4, { align: "right" }));
        };
        const nuevaPagina = () => { doc.addPage(); membrete(); y = HOJA.sup; };
        const espacio = (mm) => { if (y + mm > limite) nuevaPagina(); };
        const justificada = (l, x, yy) => {
            const p = l.trim().split(/\s+/);
            if (p.length < 2) { doc.text(l, x, yy); return; }
            const hueco = (ancho - p.reduce((t, w) => t + doc.getTextWidth(w), 0)) / (p.length - 1);
            let cx = x; p.forEach(w => { doc.text(w, cx, yy); cx += doc.getTextWidth(w) + hueco; });
        };
        const parrafo = (texto, o = {}) => {
            doc.setFont("helvetica", "normal"); doc.setFontSize(o.tam || 10); doc.setTextColor(...(o.color || TINTA));
            const lineas = doc.splitTextToSize(texto, ancho), alto = (o.tam || 10) * 0.42;
            lineas.forEach((l, i) => { espacio(alto); if (i < lineas.length - 1) justificada(l, HOJA.izq, y); else doc.text(l, HOJA.izq, y); y += alto; });
            y += o.despues ?? 2.5;
        };
        const subtitulo = (t) => {
            espacio(16); y += 2;
            doc.setFont("helvetica", "bold"); doc.setFontSize(11.5); doc.setTextColor(...GUINDA); doc.text(t, HOJA.izq, y);
            doc.setDrawColor(...DORADO); doc.setLineWidth(0.4); doc.line(HOJA.izq, y + 1.8, HOJA.izq + 22, y + 1.8);
            y += 7;
        };
        const der = { halign: "right" };
        const tabla = (cabeza, filas, o = {}) => {
            doc.autoTable({
                startY: y, head: [cabeza], body: filas, foot: o.pie ? [o.pie] : undefined, showFoot: "lastPage",
                margin: { left: HOJA.izq, right: HOJA.der, top: HOJA.sup, bottom: HOJA.inf },
                theme: "grid", rowPageBreak: "avoid",
                styles: { font: "helvetica", fontSize: o.chica ? 7.8 : 8.8, cellPadding: 1.8, textColor: TINTA, lineColor: [228, 214, 200], lineWidth: 0.2, valign: "middle" },
                headStyles: { fillColor: GUINDA, textColor: 255, fontStyle: "bold", halign: "center" },
                footStyles: { fillColor: [246, 238, 221], textColor: GUINDA, fontStyle: "bold" },
                alternateRowStyles: { fillColor: [251, 247, 242] },
                columnStyles: o.columnas || {},
                willDrawPage: () => membrete(),
                // los totales se alinean igual que su columna (las cifras a la derecha)
                didParseCell: (d) => { if (d.section === "foot") { const cs = (o.columnas || {})[d.column.index]; if (cs && cs.halign) d.cell.styles.halign = cs.halign; } },
            });
            y = doc.lastAutoTable.finalY + 6;
        };
        const agrupar = (clave) => {
            const m = new Map();
            datos.forEach(r => { const k = clave(r); const g = m.get(k) || { n: 0, total: 0, filas: [] }; g.n++; g.total += r.importe; g.filas.push(r); m.set(k, g); });
            return m;
        };

        const total = datos.reduce((s, r) => s + r.importe, 0);
        const personas = new Set(datos.map(r => r.rfc || r.nombre_servidor)).size;
        const municipios = new Set(datos.map(r => r.municipio)).size;
        const periodo = op.desde === op.hasta ? capital(MESES[op.desde]) : `${capital(MESES[op.desde])} a ${capital(MESES[op.hasta])}`;
        const unidades = op.ups.map(c => ({ clave: c, nombre: nombrePropio((datos.find(r => r.up_clave === c) || REGISTROS.find(r => r.up_clave === c) || {}).up_nombre || "") }));
        const una = unidades.length === 1;

        // ---- fecha, título y subtítulo ----
        membrete();
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...TINTA);
        doc.text(`Pachuca de Soto, Hgo., a ${fechaLarga(op.fecha)}`, HOJA.w - HOJA.der, y, { align: "right" });
        y += 11;
        doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(...GUINDA);
        doc.splitTextToSize(una ? `Reporte de viáticos · ${unidades[0].nombre}` : "Reporte de viáticos por Unidad Presupuestal", ancho).forEach(l => { doc.text(l, HOJA.izq, y); y += 6.4; });
        doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...GRIS);
        const alcance = una ? `U.P. ${unidades[0].clave}` : `${unidades.length} unidades presupuestales`;
        doc.text(doc.splitTextToSize(`Secretaría de Bienestar e Inclusión Social · ${alcance} · Periodo: ${periodo} ${op.fecha.slice(0, 4)}`, ancho), HOJA.izq, y);
        y += 4.5;
        doc.setDrawColor(...DORADO); doc.setLineWidth(0.6); doc.line(HOJA.izq, y, HOJA.w - HOJA.der, y);
        y += 8;

        let n = 0;
        const porMes = agrupar(r => r.mes);
        const mesesOrden = [...porMes.keys()].sort((a, b) => MESES.indexOf(a) - MESES.indexOf(b));

        if (op.secciones.resumen) {
            subtitulo(`${++n}. Resumen`);
            const mesMayor = mesesOrden.slice().sort((a, b) => porMes.get(b).total - porMes.get(a).total)[0];
            const porPersona = agrupar(r => r.rfc || r.nombre_servidor);
            const top = [...porPersona.values()].sort((a, b) => b.total - a.total)[0];
            const porMun = agrupar(r => r.municipio);
            const munMayor = [...porMun.entries()].sort((a, b) => b[1].n - a[1].n)[0];
            parrafo(`En el periodo de ${periodo.toLowerCase()} de ${op.fecha.slice(0, 4)}, ${una ? `la ${unidades[0].nombre} (U.P. ${unidades[0].clave}) registró` : `las ${unidades.length} unidades presupuestales seleccionadas registraron`} ${datos.length} comisiones con viáticos, por un importe total de ${pesos(total)}, a cargo de ${personas} servidores públicos y con visitas a ${municipios} municipios. El promedio por comisión fue de ${pesos(total / datos.length)}.`);
            parrafo(`El mes con mayor importe fue ${mesMayor.toLowerCase()}, con ${pesos(porMes.get(mesMayor).total)} (${pct(porMes.get(mesMayor).total, total)} del total). El municipio más visitado fue ${munMayor[0]}, con ${munMayor[1].n} comisiones, y el servidor público con mayor importe acumulado fue ${top.filas[0].nombre_servidor}, con ${pesos(top.total)} en ${top.n} comisiones.`);
            if (!una) {
                const porUp = agrupar(r => r.up_clave);
                tabla(["U.P.", "Unidad presupuestal", "Comisiones", "Importe", "% del total"],
                    unidades.filter(u => porUp.has(u.clave)).map(u => { const g = porUp.get(u.clave); return [`U.P. ${u.clave}`, u.nombre, String(g.n), pesos(g.total), pct(g.total, total)]; }),
                    { pie: ["", "Total", String(datos.length), pesos(total), "100.0%"], columnas: { 0: { cellWidth: 18, fontStyle: "bold", textColor: GUINDA }, 2: { ...der, cellWidth: 22 }, 3: { ...der, cellWidth: 30 }, 4: { ...der, cellWidth: 20 } } });
            } else {
                tabla(["Concepto", "Valor"], [
                    ["Comisiones registradas", String(datos.length)], ["Servidores públicos", String(personas)], ["Municipios visitados", String(municipios)],
                    ["Importe total", pesos(total)], ["Promedio por comisión", pesos(total / datos.length)],
                ], { columnas: { 0: { fontStyle: "bold", cellWidth: 70 }, 1: der } });
            }
        }

        if (op.secciones.mes) {
            subtitulo(`${++n}. Importe por mes`);
            tabla(["Mes", "Comisiones", "Importe", "% del total"], mesesOrden.map(m => [capital(m), String(porMes.get(m).n), pesos(porMes.get(m).total), pct(porMes.get(m).total, total)]),
                { pie: ["Total", String(datos.length), pesos(total), "100.0%"], columnas: { 1: der, 2: der, 3: der } });
        }

        if (op.secciones.persona) {
            subtitulo(`${++n}. Importe por servidor público`);
            const porP = [...agrupar(r => r.rfc || r.nombre_servidor).values()].sort((a, b) => b.total - a.total);
            tabla(una ? ["Servidor público", "RFC", "Comisiones", "Importe"] : ["Servidor público", "RFC", "U.P.", "Comisiones", "Importe"],
                porP.map(g => una ? [g.filas[0].nombre_servidor, g.filas[0].rfc, String(g.n), pesos(g.total)] : [g.filas[0].nombre_servidor, g.filas[0].rfc, [...new Set(g.filas.map(r => r.up_clave))].join(", "), String(g.n), pesos(g.total)]),
                { chica: true, pie: una ? ["Total", "", String(datos.length), pesos(total)] : ["Total", "", "", String(datos.length), pesos(total)],
                  columnas: una ? { 1: { cellWidth: 30 }, 2: { ...der, cellWidth: 22 }, 3: { ...der, cellWidth: 28 } } : { 1: { cellWidth: 30 }, 2: { cellWidth: 14 }, 3: { ...der, cellWidth: 22 }, 4: { ...der, cellWidth: 28 } } });
        }

        if (op.secciones.municipio) {
            subtitulo(`${++n}. Municipios visitados`);
            const porM = [...agrupar(r => r.municipio).entries()].sort((a, b) => b[1].total - a[1].total);
            tabla(["Municipio", "Comisiones", "Importe", "% del total"], porM.map(([m, g]) => [m, String(g.n), pesos(g.total), pct(g.total, total)]),
                { pie: ["Total", String(datos.length), pesos(total), "100.0%"], columnas: { 1: der, 2: der, 3: der } });
        }

        if (op.secciones.detalle) {
            subtitulo(`${++n}. Detalle de comisiones`);
            const filas = datos.slice().sort((a, b) => a.up_clave.localeCompare(b.up_clave) || MESES.indexOf(a.mes) - MESES.indexOf(b.mes) || a.nombre_servidor.localeCompare(b.nombre_servidor, "es"));
            tabla(una ? ["No.", "Servidor público", "RFC", "Mes", "Municipio", "Importe"] : ["No.", "U.P.", "Servidor público", "RFC", "Mes", "Municipio", "Importe"],
                filas.map((r, i) => una ? [String(i + 1), r.nombre_servidor, r.rfc, capital(r.mes), r.municipio, pesos(r.importe)] : [String(i + 1), r.up_clave, r.nombre_servidor, r.rfc, capital(r.mes), r.municipio, pesos(r.importe)]),
                { chica: true, pie: una ? ["", "Total", "", "", "", pesos(total)] : ["", "", "Total", "", "", "", pesos(total)],
                  columnas: una ? { 0: { cellWidth: 9, halign: "center" }, 2: { cellWidth: 27 }, 3: { cellWidth: 18 }, 5: { ...der, cellWidth: 24 } } : { 0: { cellWidth: 9, halign: "center" }, 1: { cellWidth: 10, halign: "center" }, 3: { cellWidth: 27 }, 4: { cellWidth: 17 }, 6: { ...der, cellWidth: 23 } } });
        }

        espacio(14); y += 4;
        doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(...GRIS);
        doc.splitTextToSize(`Reporte generado en el Sistema de Pliegos y Oficios de la Secretaría de Bienestar e Inclusión Social el ${fechaLarga(hoyISO())}, con la información de viáticos registrada a esa fecha.`, ancho)
            .forEach((l, i, a) => { if (i < a.length - 1) justificada(l, HOJA.izq, y); else doc.text(l, HOJA.izq, y); y += 3.6; });
        const tp = doc.getNumberOfPages();
        for (let i = 1; i <= tp; i++) { doc.setPage(i); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRIS); doc.text(`Página ${i} de ${tp}`, HOJA.izq, HOJA.h - 22 + 4 * 3.4); }
        return doc;
    }
})();
