'use strict';

/* =========================
   CONFIGURACIÓN
========================= */

const API =
'https://sebiso-pliegos-oficios-1.onrender.com';

/* =========================
   GENERAR REPORTE
========================= */

async function generarReporte() {

    const area = document
        .getElementById('selectArea').value;

    const mes = document
        .getElementById('selectMes').value;

    const anio = document
        .getElementById('selectAnio').value;

    if (!area) {
        alert('Por favor selecciona un área presupuestal.');
        return;
    }

    mostrarLoading();

    try {

        const params =
            new URLSearchParams({ area, anio });

        if (mes) params.append('mes', mes);

        const res = await fetch(
            `${API}/api/reportes?${params}`
        );

        if (!res.ok) throw new Error(
            'Error al obtener los datos'
        );

        const data = await res.json();

        renderTabla(data, area, mes, anio);

    }

    catch (err) {

        console.error(err);

        mostrarError();

    }

}

/* =========================
   RENDER TABLA
========================= */

function renderTabla(registros, area, mes, anio) {

    const tbody =
        document.getElementById('tbodyReporte');

    const tfoot =
        document.getElementById('tfootReporte');

    const loader =
        document.getElementById('loader');

    loader.style.display = 'none';

    if (!registros || registros.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    style="text-align:center;padding:24px;color:#999;"
                >
                    No se encontraron pagos
                    para los filtros seleccionados.
                </td>
            </tr>`;

        tfoot.style.display = 'none';

        return;

    }

    let html  = '';
    let total = 0;

    registros.forEach((r, i) => {

        total += parseFloat(r.cantidad) || 0;

        const mesMostrado =
            r.mes || obtenerMes(r.fecha);

        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${mesMostrado  || '—'}</td>
                <td>${r.persona    || '—'}</td>
                <td>${formatMoneda(r.cantidad)}</td>
            </tr>`;

    });

    tbody.innerHTML = html;

    document.getElementById('totalMonto')
        .textContent = formatMoneda(total);

    tfoot.style.display = '';

}

/* =========================
   LOADING
========================= */

function mostrarLoading() {

    const tbody =
        document.getElementById('tbodyReporte');

    const tfoot =
        document.getElementById('tfootReporte');

    const loader =
        document.getElementById('loader');

    tbody.innerHTML = '';

    tfoot.style.display = 'none';

    loader.style.display = 'block';

}

/* =========================
   ERROR
========================= */

function mostrarError() {

    const tbody =
        document.getElementById('tbodyReporte');

    const loader =
        document.getElementById('loader');

    loader.style.display = 'none';

    tbody.innerHTML = `
        <tr>
            <td
                colspan="4"
                style="text-align:center;padding:24px;color:#B71C1C;"
            >
                Ocurrió un error al cargar los datos.
                Intenta de nuevo.
            </td>
        </tr>`;

}

/* =========================
   UTILIDADES
========================= */

function formatMoneda(valor) {

    return new Intl.NumberFormat('es-MX', {

        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2

    }).format(parseFloat(valor) || 0);

}

function obtenerMes(timestamp) {

    if (!timestamp) return null;

    const meses = [
        'ENERO','FEBRERO','MARZO','ABRIL',
        'MAYO','JUNIO','JULIO','AGOSTO',
        'SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'
    ];

    return meses[new Date(timestamp).getMonth()];

}