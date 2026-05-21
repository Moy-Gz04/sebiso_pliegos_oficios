/* =========================
   TBODY
========================= */

const tbody = document.getElementById("tbodyResultados");

/* =========================
   API
========================= */

const API = "https://sebiso-pliegos-oficios-1.onrender.com";

/* =========================
   VARIABLES
========================= */

let codigoEliminar = null;

let codigoSPG = null;

let codigoRecibo = null;

let codigoFactura = null;

/* =========================
   NORMALIZAR ESTATUS
========================= */

function normalizarEstatus(estatus) {
  return String(estatus || "")
    .trim()

    .toUpperCase();
}

/* =========================
   MODALES
========================= */

function abrirModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "flex";
  }
}

function cerrarModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "none";
  }
}

/* =========================
   MODAL SPG
========================= */

function abrirModalSPG(codigo) {
  codigoSPG = codigo;

  abrirModal("modalSPG");
}

/* =========================
   MODAL RECIBO
========================= */

async function abrirModalRecibo(codigo) {
  try {
    codigoRecibo = codigo;

    const response = await fetch(`${API}/api/registros/UP-01`);

    if (!response.ok) {
      throw new Error("Error obteniendo registros");
    }

    const registros = await response.json();

    const registro = registros.find((r) => r.codigo === codigo);

    if (!registro) {
      throw new Error("Registro no encontrado");
    }

    let diasTexto = "";

    const inicio = parseInt(registro.dia_inicio);

    const fin = parseInt(registro.dia_fin);

    if (!isNaN(inicio) && !isNaN(fin)) {
      const dias = [];

      for (let i = inicio; i <= fin; i++) {
        dias.push(i);
      }

      if (dias.length === 1) {
        diasTexto = `${dias[0]}`;
      } else if (dias.length === 2) {
        diasTexto = `${dias[0]} y ${dias[1]}`;
      } else {
        diasTexto =
          dias.slice(0, -1).join(", ") + " y " + dias[dias.length - 1];
      }
    }

    const formatearMoneda = (valor) => {
      return (
        "$ " +
        Number(valor || 0).toLocaleString(
          "en-US",

          {
            minimumFractionDigits: 2,

            maximumFractionDigits: 2,
          },
        )
      );
    };

    document.getElementById("reciboFolio").value = registro.codigo || "";

    document.getElementById("reciboPersona").value = registro.persona || "";

    document.getElementById("reciboMunicipio").value = registro.municipio || "";

    document.getElementById("reciboMotivo").value =
      registro.motivo_comision || "";

    document.getElementById("reciboLocalidades").value =
      registro.localidades_visitadas || "";

    document.getElementById("reciboDias").value = diasTexto || "";

    document.getElementById("reciboMes").value = registro.mes || "";

    document.getElementById("reciboAnio").value = registro.anio || "";

    document.getElementById("reciboUnidad").value = registro.up || "";

    document.getElementById("reciboImporte").value = formatearMoneda(
      registro.spg_monto || 0,
    );

    document.getElementById("reciboRetenciones").value = formatearMoneda(
      registro.spg_retenciones || 0,
    );

    document.getElementById("reciboTotal").value = formatearMoneda(
      registro.spg_total || 0,
    );

    abrirModal("modalRecibo");
  } catch (error) {
    console.error("ERROR MODAL RECIBO:", error);

    alert(error.message);
  }
}

/* =========================
   CALCULAR TOTAL SPG
========================= */

function calcularTotalSPG() {
  const montoInput = document.getElementById("spgMonto");

  const retInput = document.getElementById("spgRet");

  const totalInput = document.getElementById("spgTot");

  if (!montoInput || !retInput || !totalInput) {
    return;
  }

  const monto = parseFloat(montoInput.value.replace(/[^0-9.-]+/g, "")) || 0;

  const retenciones = parseFloat(retInput.value.replace(/[^0-9.-]+/g, "")) || 0;

  const total = monto + retenciones;

  totalInput.value =
    "$ " +
    total.toLocaleString(
      "en-US",

      {
        minimumFractionDigits: 2,

        maximumFractionDigits: 2,
      },
    );
}

/* =========================
   GENERAR SPG
========================= */

async function generarSPG() {
  try {
    const datos = {
      codigo: codigoSPG,

      anio: document.getElementById("spgAnio").value,

      ur: document.getElementById("spgUR").value,

      up: document.getElementById("spgUP").value,

      rubro: document.getElementById("spgR").value,

      og: document.getElementById("spgOG").value,

      proyecto: document.getElementById("spgPR").value,

      cuenta: document.getElementById("spgCuenta").value,

      monto: document.getElementById("spgMonto").value,

      retenciones: document.getElementById("spgRet").value,

      total: document.getElementById("spgTot").value,
    };

    console.log("DATOS SPG:", datos);

    cerrarModal("modalSPG");

    abrirModal("modalExitoSPG");

    cargarRegistros();
  } catch (error) {
    console.error("ERROR SPG:", error);

    alert(error.message);
  }
}

/* =========================
   GENERAR RECIBO
========================= */

async function generarRecibo() {
  try {
    console.log("GENERANDO RECIBO:", codigoRecibo);

    cerrarModal("modalCargandoRecibo");

    cerrarModal("modalConfirmarRecibo");

    cerrarModal("modalRecibo");

    abrirModal("modalExitoRecibo");
  } catch (error) {
    console.error("ERROR RECIBO:", error);

    cerrarModal("modalCargandoRecibo");

    alert(error.message);
  }
}

/* =========================
   FORMATEAR MONEDA
========================= */

function formatearMoneda(valor){

    return '$ ' + Number(valor)
    .toLocaleString('en-US', {

        minimumFractionDigits: 2,
        maximumFractionDigits: 2

    });

}

/* =========================
   DESGLOSAR DÍAS
========================= */

function desglosarDias(inicio, fin){

    inicio = parseInt(inicio);

    fin = parseInt(fin);

    if(isNaN(inicio) || isNaN(fin)){

        return "";

    }

    if(inicio === fin){

        return `${inicio}`;

    }

    const dias = [];

    for(let i = inicio; i <= fin; i++){

        dias.push(i);

    }

    if(dias.length === 2){

        return `${dias[0]} y ${dias[1]}`;

    }

    return `

        ${dias.slice(0,-1).join(', ')}
        y
        ${dias[dias.length - 1]}

    `

    .replace(/\s+/g,' ')
    .trim();

}

/* =========================
   MODAL FACTURA
========================= */

async function abrirModalFactura(codigo){

    try{

        codigoFactura = codigo;

        const response =
        await fetch(

            `${API}/api/registros/UP-01`

        );

        if(!response.ok){

            throw new Error(
                "Error obteniendo registros"
            );

        }

        const registros =
        await response.json();

        const registro =
        registros.find(

            r => r.codigo === codigo

        );

        if(!registro){

            throw new Error(
                "Registro no encontrado"
            );

        }

        document.getElementById(
            "facturaPersona"
        ).value =
        registro.persona || "";

        document.getElementById(
            "facturaMunicipio"
        ).value =
        registro.municipio || "";

        document.getElementById(
            "facturaMotivo"
        ).value =
        registro.motivo_comision || "";

        document.getElementById(
            "facturaLocalidad"
        ).value =
        registro.localidades_visitadas || "";

        document.getElementById(
            "facturaDias"
        ).value =
        desglosarDias(

            registro.dia_inicio,

            registro.dia_fin

        );

        document.getElementById(
            "facturaMes"
        ).value =
        registro.mes || "";

        document.getElementById(
            "facturaTotal"
        ).value =
        formatearMoneda(

            registro.spg_total || 0

        );

        abrirModal(
            "modalFactura"
        );

    }

    catch(error){

        console.error(
            "ERROR FACTURA:",
            error
        );

        alert(
            error.message
        );

    }

}

/* =========================
   DESGLOSAR DÍAS
========================= */

function desglosarDias(inicio, fin){

    inicio = parseInt(inicio);

    fin = parseInt(fin);

    if(isNaN(inicio) || isNaN(fin)){

        return "";

    }

    if(inicio === fin){

        return `${inicio}`;

    }

    const dias = [];

    for(let i = inicio; i <= fin; i++){

        dias.push(i);

    }

    if(dias.length === 2){

        return `${dias[0]} y ${dias[1]}`;

    }

    return `

        ${dias.slice(0,-1).join(', ')}
        y
        ${dias[dias.length - 1]}

    `

    .replace(/\s+/g,' ')
    .trim();

}

/* =========================
   MODAL FACTURA
========================= */

async function abrirModalFactura(codigo){

    try{

        codigoFactura = codigo;

        const response =
        await fetch(

            `${API}/api/registros/UP-01`

        );

        if(!response.ok){

            throw new Error(
                "Error obteniendo registros"
            );

        }

        const registros =
        await response.json();

        const registro =
        registros.find(

            r => r.codigo === codigo

        );

        if(!registro){

            throw new Error(
                "Registro no encontrado"
            );

        }

        document.getElementById(
            "facturaPersona"
        ).value =
        registro.persona || "";

        document.getElementById(
            "facturaMunicipio"
        ).value =
        registro.municipio || "";

        document.getElementById(
            "facturaMotivo"
        ).value =
        registro.motivo_comision || "";

        document.getElementById(
            "facturaLocalidad"
        ).value =
        registro.localidades_visitadas || "";

        document.getElementById(
            "facturaDias"
        ).value =
        desglosarDias(

            registro.dia_inicio,

            registro.dia_fin

        );

        document.getElementById(
            "facturaMes"
        ).value =
        registro.mes || "";

        document.getElementById(
            "facturaTotal"
        ).value =
        formatearMoneda(

            registro.spg_total || 0

        );

        abrirModal(
            "modalFactura"
        );

    }

    catch(error){

        console.error(
            "ERROR FACTURA:",
            error
        );

        alert(
            error.message
        );

    }

}

/* =========================
   GENERAR FACTURA
========================= */

async function generarFactura() {

  try {

    console.log(
      "GENERANDO FACTURA:",
      codigoFactura
    );

    cerrarModal(
      "modalCargandoFactura"
    );

    cerrarModal(
      "modalConfirmarFactura"
    );

    cerrarModal(
      "modalFactura"
    );

    abrirModal(
      "modalExitoFactura"
    );

    cargarRegistros();

  } catch (error) {

    console.error(
      "ERROR FACTURA:",
      error
    );

    cerrarModal(
      "modalCargandoFactura"
    );

    alert(error.message);

  }

}

/* =========================
   CONFIRMAR FACTURA
========================= */

const confirmarFactura =
document.getElementById(
  "confirmarGenerarFactura"
);

if (confirmarFactura) {

  confirmarFactura.addEventListener(

    "click",

    async () => {

      cerrarModal(
        "modalConfirmarFactura"
      );

      abrirModal(
        "modalCargandoFactura"
      );

      await generarFactura();

    }

  );

}

/* =========================
   BADGES ESTATUS
========================= */

function obtenerBadgeEstatus(estatus) {
  const estado = normalizarEstatus(estatus);

  switch (estado) {
    case "ENVIADO":
      return `

                <span
                    class="badge-estatus badge-enviado">

                    Enviado

                </span>

            `;

    case "PAGADO":

    case "ACEPTADO":
      return `

                <span
                    class="badge-estatus badge-aceptado">

                    Pagado

                </span>

            `;

    case "RECHAZADO":
      return `

                <span
                    class="badge-estatus badge-rechazado">

                    Rechazado

                </span>

            `;

    default:
      return `

                <span
                    class="badge-estatus badge-creado">

                    Creado

                </span>

            `;
  }
}

/* =========================
   BOTÓN ENVIAR
========================= */

function obtenerBotonEnviar(registro) {
  const estatus = normalizarEstatus(registro.estatus);

  if (estatus === "CREADO" || !estatus) {
    return `

            <button
                class="btn-enviar"
                onclick="enviarRegistro('${registro.codigo}')">

                Enviar

            </button>

        `;
  }

  if (estatus === "ENVIADO") {
    return `

            <button
                class="btn-enviado"
                disabled>

                Enviado

            </button>

        `;
  }

  if (estatus === "PAGADO" || estatus === "ACEPTADO") {
    return `

            <button
                class="btn-aceptado"
                disabled>

                Pagado

            </button>

        `;
  }

  if (estatus === "RECHAZADO") {
    return `

            <button
                class="btn-rechazado"
                onclick="reenviarRegistro('${registro.codigo}')">

                Reenviar

            </button>

        `;
  }

  return `

        <button
            class="btn-bloqueado"
            disabled>

            Bloqueado

        </button>

    `;
}

/* =========================
   REENVIAR
========================= */

async function reenviarRegistro(codigo) {
  try {
    const confirmar = confirm("¿Deseas reenviar este registro?");

    if (!confirmar) {
      return;
    }

    const response = await fetch(
      `${API}/api/registros/reenviar/${codigo}`,

      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error reenviando registro");
    }

    cargarRegistros();
  } catch (error) {
    console.error("ERROR REENVIANDO:", error);

    alert(error.message);
  }
}

/* =========================
   ENVIAR REGISTRO
========================= */

async function enviarRegistro(codigo) {
  try {
    const response = await fetch(
      `${API}/api/registros/enviar/${codigo}`,

      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error enviando registro");
    }

    cargarRegistros();
  } catch (error) {
    console.error("ERROR ENVIANDO:", error);

    alert(error.message);
  }
}

/* =========================
   OBSERVACIONES
========================= */

async function guardarObservaciones(codigo, observaciones) {
  try {
    const response = await fetch(
      `${API}/api/registros/observaciones/${codigo}`,

      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          observaciones,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error guardando observaciones");
    }
  } catch (error) {
    console.error("ERROR OBSERVACIONES:", error);

    alert(error.message);
  }
}

/* =========================
   CARGAR REGISTROS
========================= */

async function cargarRegistros() {
  try {
    const response = await fetch(`${API}/api/registros/UP-01`);

    if (!response.ok) {
      throw new Error("Error obteniendo registros");
    }

    const registros = await response.json();

    tbody.innerHTML = "";

    if (registros.length === 0) {
      tbody.innerHTML = `

                <tr>

                    <td colspan="12">

                        No hay registros

                    </td>

                </tr>

            `;

      return;
    }

    registros.sort((a, b) => {
      const orden = {
        CREADO: 1,
        RECHAZADO: 2,
        ENVIADO: 3,
        PAGADO: 4,
        ACEPTADO: 4,
      };

      return (
        (orden[normalizarEstatus(a.estatus)] || 99) -
        (orden[normalizarEstatus(b.estatus)] || 99)
      );
    });

    for (const registro of registros) {
      const estatus = normalizarEstatus(registro.estatus);

      const bloqueado =
        estatus === "PAGADO" || estatus === "ACEPTADO" || estatus === "ENVIADO";

      const permitirEliminar =
        estatus === "CREADO" || estatus === "RECHAZADO" || !estatus;

      tbody.innerHTML += `

            <tr>

            <td colspan="12">

            <div class="card-registro">

                <!-- SUPERIOR -->

                <div class="fila-superior">

                    <div class="info-item">

                        <span class="info-label">
                            ID
                        </span>

                        <span class="info-valor">
                            ${registro.codigo || "-"}
                        </span>

                    </div>

                    <div class="info-item">

                        <span class="info-label">
                            Persona
                        </span>

                        <span class="info-valor">
                            ${registro.persona || "-"}
                        </span>

                    </div>

                    <div class="info-item">

                        <span class="info-label">
                            Fecha y Hora
                        </span>

                        <span class="info-valor">

                            ${
                              registro.fecha
                                ? new Date(registro.fecha).toLocaleString(
                                    "es-MX",
                                  )
                                : "-"
                            }

                        </span>

                    </div>

                    <div class="info-item">

                        <span class="info-label">
                            Estatus
                        </span>

                        ${obtenerBadgeEstatus(registro.estatus)}

                    </div>

                    <div class="info-item">

                        <span class="info-label">
                            Eliminar
                        </span>

                        ${
                          permitirEliminar
                            ? `

                            <button
                                class="btn-eliminar"
                                onclick="eliminarRegistro('${registro.codigo}')">

                                Eliminar

                            </button>

                            `
                            : `

                            <button
                                class="btn-bloqueado"
                                disabled>

                                Bloqueado

                            </button>

                            `
                        }

                    </div>

                </div>

                <!-- PDFS -->

                <div
                    class="fila-pdfs"
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        gap:30px;
                        flex-wrap:wrap;
                    "
                >

                    <!-- OFICIO -->

                    <div
                        class="info-item"
                        style="
                            flex:1;
                            text-align:center;
                        "
                    >

                        <span class="info-label">
                            Oficio PDF
                        </span>

                        <a
                            href="${registro.oficio_pdf || "#"}"
                            target="_blank"
                            class="link-pdf">

                            Ver Oficio

                        </a>

                    </div>

                    <!-- PLIEGO -->

                    <div
                        class="info-item"
                        style="
                            flex:1;
                            text-align:center;
                        "
                    >

                        <span class="info-label">
                            Pliego PDF
                        </span>

                        <a
                            href="${registro.pliego_pdf || "#"}"
                            target="_blank"
                            class="link-pdf">

                            Ver Pliego

                        </a>

                    </div>

                    <!-- SPG -->

                    <div
                        class="info-item"
                        style="
                            flex:1;
                            text-align:center;
                        "
                    >

                        <span class="info-label">
                            SPG PDF
                        </span>

                        ${
                          registro.spg_pdf
                            ? `

                            <a
                                href="${registro.spg_pdf}"
                                target="_blank"
                                class="link-pdf">

                                Ver SPG

                            </a>

                            `
                            : `

                            <button
                                class="btn-bloqueado"
                                disabled>

                                Sin SPG

                            </button>

                            `
                        }

                    </div>

                    <!-- RECIBO -->

<div
    class="info-item"
    style="
        flex:1;
        text-align:center;
    "
>

    <span class="info-label">
        Recibo PDF
    </span>

    ${
      registro.recibo_pdf
        ? `

        <a
            href="${registro.recibo_pdf}"
            target="_blank"
            class="link-pdf">

            Ver Recibo

        </a>

        `
        : `

        <button
            class="btn-bloqueado"
            disabled>

            Sin Recibo

        </button>

        `
    }

</div>

<!-- FACTURA -->

<div
    class="info-item"
    style="
        flex:1;
        text-align:center;
    "
>

    <span class="info-label">
        Factura PDF
    </span>

    ${
      registro.factura_pdf
        ? `

        <a
            href="${registro.factura_pdf}"
            target="_blank"
            class="link-pdf">

            Ver Factura

        </a>

        `
        : `

        <button
            class="btn-bloqueado"
            disabled>

            Sin Factura

        </button>

        `
    }

</div>

</div>


                <!-- INFERIOR -->

                <div class="fila-inferior">

                    <div class="info-item">

                        <span class="info-label">
                            Observaciones Área
                        </span>

                        <textarea
                            class="textarea-observaciones"
                            placeholder="Observaciones del área..."
                            onchange="guardarObservaciones(
                                '${registro.codigo}',
                                this.value
                            )"
                            ${bloqueado ? "readonly" : ""}
                        >${registro.observaciones || ""}</textarea>

                    </div>

                    <div class="info-item">

                        <span class="info-label">
                            Observaciones Administración
                        </span>

                        <textarea
                            class="textarea-observaciones-admin"
                            readonly
                            placeholder="Observaciones administración..."
                        >${registro.observaciones_admin || ""}</textarea>

                    </div>

                    <!-- ACCIONES -->

                    <div class="acciones-laterales">

                        <!-- TERMINAR -->

<div class="info-item">

    <span class="info-label">
        Terminar Trámite
    </span>

    ${
    !registro.spg_pdf

    ? `

    <button
        class="btn-enviar"
        onclick="abrirModalSPG('${registro.codigo}')">

        Generar SPG

    </button>

    `

    : !registro.recibo_pdf

    ? `

    <button
        class="btn-enviar"
        onclick="abrirModalRecibo('${registro.codigo}')">

        Generar Recibo

    </button>

    `

    : !registro.factura_pdf

    ? `

    <button
        class="btn-enviar"
        onclick="abrirModalFactura('${registro.codigo}')">

        Generar Factura

    </button>

    `

    : `

    <button
        class="btn-aceptado"
        disabled>

        Finalizado

    </button>

    `
}
</div>

                        <!-- ENVIAR -->

                        <div class="info-item">

                            <span class="info-label">
                                Enviar
                            </span>

                            ${obtenerBotonEnviar(registro)}

                        </div>

                    </div>

                </div>

            </div>

            </td>

            </tr>

            `;
    }
  } catch (error) {
    console.error("ERROR REGISTROS:", error);
  }
}

/* =========================
   ELIMINAR
========================= */

function eliminarRegistro(codigo) {
  codigoEliminar = codigo;

  abrirModal("modalEliminar");
}

/* =========================
   CONFIRMAR ELIMINAR
========================= */

const btnConfirmarEliminar = document.getElementById("confirmarEliminar");

btnConfirmarEliminar.addEventListener(
  "click",

  async function () {
    try {
      const response = await fetch(
        `${API}/api/registros/${codigoEliminar}`,

        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error eliminando");
      }

      cerrarModal("modalEliminar");

      abrirModal("modalExito");

      cargarRegistros();
    } catch (error) {
      console.error("ERROR ELIMINANDO:", error);

      alert(error.message);
    }
  },
);

/* =========================
   INICIALIZAR TODO
========================= */

document.addEventListener(
  "DOMContentLoaded",

  () => {

    /* =========================
       CATÁLOGOS
    ========================= */

    if (typeof llenarAnios === "function") {
      llenarAnios("spgAnio");
    }

    if (typeof llenarUP === "function") {
      llenarUP();
    }

    if (typeof llenarRubros === "function") {
      llenarRubros();
    }

    if (typeof llenarProyectos === "function") {
      llenarProyectos();
    }

    if (typeof llenarObjetoGasto === "function") {
      llenarObjetoGasto();
    }

    /* =========================
       TOTAL SPG
    ========================= */

    const spgMonto =
    document.getElementById(
      "spgMonto"
    );

    const spgRet =
    document.getElementById(
      "spgRet"
    );

    if (spgMonto) {

      spgMonto.addEventListener(

        "input",

        calcularTotalSPG,

      );

    }

    if (spgRet) {

      spgRet.addEventListener(

        "input",

        calcularTotalSPG,

      );

    }

    /* =========================
       BOTÓN GENERAR SPG
    ========================= */

    const btnGenerarSPG =
    document.getElementById(
      "btnGenerarSPG"
    );

    if (btnGenerarSPG) {

      btnGenerarSPG.addEventListener(

        "click",

        () => {

          abrirModal(
            "modalConfirmarSPG"
          );

        },

      );

    }

    /* =========================
       CONFIRMAR SPG
    ========================= */

    const confirmarSPG =
    document.getElementById(
      "confirmarGenerarSPG"
    );

    if (confirmarSPG) {

      confirmarSPG.addEventListener(

        "click",

        async () => {

          cerrarModal(
            "modalConfirmarSPG"
          );

          abrirModal(
            "modalCargando"
          );

          await generarSPG();

        },

      );

    }

    /* =========================
       BOTÓN RECIBO
    ========================= */

    const btnGenerarRecibo =
    document.getElementById(
      "btnGenerarRecibo"
    );

    if (btnGenerarRecibo) {

      btnGenerarRecibo.addEventListener(

        "click",

        () => {

          abrirModal(
            "modalConfirmarRecibo"
          );

        },

      );

    }

    /* =========================
       CONFIRMAR RECIBO
    ========================= */

    const confirmarRecibo =
    document.getElementById(
      "confirmarGenerarRecibo"
    );

    if (confirmarRecibo) {

      confirmarRecibo.addEventListener(

        "click",

        async () => {

          cerrarModal(
            "modalConfirmarRecibo"
          );

          abrirModal(
            "modalCargandoRecibo"
          );

          await generarRecibo();

        },

      );

    }

    /* =========================
       BOTÓN FACTURA
    ========================= */

    const btnGenerarFactura =
    document.getElementById(
      "btnGenerarFactura"
    );

    if (btnGenerarFactura) {

      btnGenerarFactura.addEventListener(

        "click",

        () => {

          abrirModal(
            "modalConfirmarFactura"
          );

        }

      );

    }

    /* =========================
       CONFIRMAR FACTURA
    ========================= */

    const confirmarFactura =
    document.getElementById(
      "confirmarGenerarFactura"
    );

    if (confirmarFactura) {

      confirmarFactura.addEventListener(

        "click",

        async () => {

          cerrarModal(
            "modalConfirmarFactura"
          );

          abrirModal(
            "modalCargandoFactura"
          );

          await generarFactura();

        }

      );

    }

    /* =========================
       CARGAR
    ========================= */

    cargarRegistros();

    setInterval(

      cargarRegistros,

      30000,

    );

  },

);