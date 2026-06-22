console.log("REPORTES.JS CARGADO");
console.log(typeof generarReporte);
'use strict';

const API = 'https://sebiso-pliegos-oficios-1.onrender.com';

const MESES_ES = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

/* =========================
   AL CARGAR
========================= */

document.addEventListener('DOMContentLoaded', () => {
    cargarHistorial();
});

/* =========================
   GENERAR REPORTE
========================= */

async function generarReporte() {

    const area      = document.getElementById('selectArea').value;
    const mesInicio = document.getElementById('selectMesInicio').value;
    const mesFin    = document.getElementById('selectMesFin').value;
    const anio      = document.getElementById('selectAnio').value;

    if (!area) {
        alert('Por favor selecciona un área presupuestal.');
        return;
    }

    document.getElementById('btnExportarPDF').style.display = 'none';
    document.getElementById('msgPDF').style.display = 'none';

    mostrarLoading();

    try {

        const params = new URLSearchParams({ area, anio });
        if (mesInicio) params.append('mes', mesInicio);

        const res = await fetch(`${API}/api/reportes?${params}`);
        if (!res.ok) throw new Error('Error al obtener los datos');

        const data = await res.json();

        renderTabla(data);

        if (data && data.length > 0) {
            document.getElementById('btnExportarPDF').style.display = 'inline-block';
        }

    } catch (err) {
        console.error(err);
        mostrarError();
    }
}

/* =========================
   EXPORTAR PDF
========================= */

async function exportarPDF() {

    const area      = document.getElementById('selectArea').value;
    const mesInicio = document.getElementById('selectMesInicio').value;
    const mesFin    = document.getElementById('selectMesFin').value;
    const anio      = document.getElementById('selectAnio').value;

    if (!area || !mesInicio) {
        alert('Selecciona área y al menos un mes para exportar.');
        return;
    }

    const inicio = parseInt(mesInicio);
    const fin    = mesFin ? parseInt(mesFin) : inicio;

    if (fin < inicio) {
        alert('El mes final no puede ser menor al mes inicial.');
        return;
    }

    const meses = [];
    for (let m = inicio; m <= fin; m++) meses.push(m);

    const btn = document.getElementById('btnExportarPDF');
    const msg = document.getElementById('msgPDF');

    btn.disabled      = true;
    btn.textContent   = 'GENERANDO PDF...';
    msg.style.display = 'none';

    try {

        const res = await fetch(`${API}/api/reportes-pdf/generar-pdf`, {  // ← cambiado
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ area, anio: parseInt(anio), meses })
        });

        const data = await res.json();

        if (!data.ok) throw new Error(data.error || 'Error al generar PDF');

        msg.innerHTML     = `✅ PDF generado: <a href="${data.url}" target="_blank" style="color:#691C32;font-weight:700;">Abrir PDF</a>`;
        msg.style.display = 'block';

        cargarHistorial();

    } catch (err) {
        console.error(err);
        msg.innerHTML     = `❌ Error: ${err.message}`;
        msg.style.display = 'block';
    } finally {
        btn.disabled    = false;
        btn.textContent = 'EXPORTAR PDF';
    }
}

/* =========================
   HISTORIAL
========================= */

async function cargarHistorial() {

    const tbody = document.getElementById('tbodyHistorial');

    try {

        const res  = await fetch(`${API}/api/reportes-pdf/historial`);  // ← cambiado
        const data = await res.json();

        if (!data.ok || !data.data.length) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:16px;color:#999;">Sin reportes generados aún.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.data.map(r => `
            <tr>
                <td>${new Date(r.fecha).toLocaleDateString('es-MX')}</td>
                <td>${r.area}</td>
                <td>${r.periodo}</td>
                <td style="text-align:center;">${r.total_pagos}</td>
                <td>${formatMoneda(r.monto_total)}</td>
                <td style="text-align:center;">
                    <a href="${r.pdf_url}" target="_blank" style="color:#691C32;font-weight:700;">Descargar</a>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#B71C1C;">Error al cargar historial.</td></tr>`;
    }
}

/* =========================
   RENDER TABLA
========================= */

function renderTabla(registros) {

    const tbody  = document.getElementById('tbodyReporte');
    const tfoot  = document.getElementById('tfootReporte');
    const loader = document.getElementById('loader');

    loader.style.display = 'none';

    if (!registros || registros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:#999;">No se encontraron pagos para los filtros seleccionados.</td></tr>`;
        tfoot.style.display = 'none';
        return;
    }

    let html  = '';
    let total = 0;

    registros.forEach((r, i) => {
        total += parseFloat(r.cantidad) || 0;
        const mesMostrado = r.mes || obtenerMes(r.fecha);
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${mesMostrado || '—'}</td>
                <td>${r.persona   || '—'}</td>
                <td>${formatMoneda(r.cantidad)}</td>
            </tr>`;
    });

    tbody.innerHTML = html;
    document.getElementById('totalMonto').textContent = formatMoneda(total);
    tfoot.style.display = '';
}

/* =========================
   LOADING / ERROR
========================= */

function mostrarLoading() {
    document.getElementById('tbodyReporte').innerHTML = '';
    document.getElementById('tfootReporte').style.display = 'none';
    document.getElementById('loader').style.display = 'block';
}

function mostrarError() {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('tbodyReporte').innerHTML = `
        <tr><td colspan="4" style="text-align:center;padding:24px;color:#B71C1C;">
            Ocurrió un error al cargar los datos. Intenta de nuevo.
        </td></tr>`;
}

/* =========================
   UTILIDADES
========================= */

function formatMoneda(valor) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency', currency: 'MXN', minimumFractionDigits: 2
    }).format(parseFloat(valor) || 0);
}

function obtenerMes(timestamp) {
    if (!timestamp) return null;
    return MESES_ES[new Date(timestamp).getMonth()];
}