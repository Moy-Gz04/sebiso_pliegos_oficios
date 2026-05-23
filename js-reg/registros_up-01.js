//TBODY
const tbody = document.getElementById("tbodyResultados");

//API PLIEGOS OFICIO
const API = "https://sebiso-pliegos-oficios-1.onrender.com";

/* ======= VARIABLES GLOBALES ============================ */
let codigoEliminar = null;
let codigoSPG = null;
let codigoRecibo = null;
let codigoFactura = null;

/* ======= NORMALIZAR ESTATUS ============================ */

function normalizarEstatus(estatus) {
  return String(estatus || "")
    .trim()
    .toUpperCase();
}

/* ======= MODALES ======================================= */
function abrirModal(id)
{
    const modal =
    document.getElementById(id);

    if(modal)
    {
        modal.classList.add(
            "activo"
        );
    }
}

function cerrarModal(id)
{
    const modal =
    document.getElementById(id);

    if(modal)
    {
        modal.classList.remove(
            "activo"
        );
    }
}
/* ======= END MODALES =================================== */

/* ======= FUNCIONES PARA ABRIR MODALES ================== */

//SPG
function abrirModalSPG(codigo) {
  codigoSPG = codigo;

  abrirModal("modalSPG");
}

//RECIBO
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

/* ======CALCULAR TOTAL SPG ============================ */
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
/* ====== END CALCULAR TOTAL SPG ========================= */

/* ====== GENERAR SPG ==================================== */
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
  } 
  
  catch (error) {
    console.error("ERROR SPG:", error);
    alert(error.message);
  }
}
/* ====== END GENERAR SPG ==================================== */

/* ====== GENERAR RECIBO ===================================== */
async function generarRecibo() 
{
  try
  {
    console.log("GENERANDO RECIBO:", codigoRecibo);
    cerrarModal("modalCargandoRecibo");
    cerrarModal("modalConfirmarRecibo");
    cerrarModal("modalRecibo");
    abrirModal("modalExitoRecibo");
  } 
  catch (error) 
  {
    console.error("ERROR RECIBO:", error);
    cerrarModal("modalCargandoRecibo");
    alert(error.message);
  }
}
/* ====== END GENERAR RECIBO ================================ */

/* ====== FORMATEAR MONEDA ================================== */
function formatearMoneda(valor)
{
    return '$ ' + Number(valor)
    .toLocaleString
    ('en-US', 
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
}
/* ====== END FORMATEAR MONEDA ================================== */

/* =======DESGLOSAR DÍAS ======================================== */
function desglosarDias(inicio, fin)
{
    inicio = parseInt(inicio);
    fin = parseInt(fin);
    if(isNaN(inicio) || isNaN(fin))
      {
        return "";
      }

    if(inicio === fin)
    {
        return `${inicio}`;
    }
    const dias = [];

    for(let i = inicio; i <= fin; i++)
      {
        dias.push(i);
      }

    if(dias.length === 2)
      {
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
/* ====== END DESGLOSAR DÍAS ==================================== */

/* ====== MODAL FACTURA ========================================= */
async function abrirModalFactura(codigo)
{
    try
    {
        codigoFactura = codigo;

        const response =
        await fetch(
            `${API}/api/registros/UP-01`
        );

        if(!response.ok)
        {
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

        if(!registro)
        {
            throw new Error(
                "Registro no encontrado"
            );
        }

        console.log(
            "REGISTRO FACTURA:",
            registro
        );

        /* ===== LIMPIAR ERRORES ===================== */

        document
        .querySelectorAll(
            "#modalFactura input, #modalFactura select"
        )
        .forEach(campo =>
        {
            campo.classList.remove(
                "input-error"
            );
        });

        /* ===== DATOS CALCULADOS ==================== */

        const dias =
        desglosarDias(
            registro.dia_inicio,
            registro.dia_fin
        ) || "";

        const localidad =
        registro.localidades_visitadas || "";

        const mes =
        registro.mes || "";

        const total =
        Number(
            registro.spg_total || 0
        );

        console.log(
            "DIAS:",
            dias
        );

        console.log(
            "LOCALIDAD:",
            localidad
        );

        console.log(
            "MES:",
            mes
        );

        /* ===== LLENAR CAMPOS ======================= */

        document.getElementById(
            "facturaFolio"
        ).value = "";

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
        String(localidad);

        document.getElementById(
            "facturaDias"
        ).value =
        String(dias);

        document.getElementById(
            "facturaMes"
        ).value =
        String(mes);

        document.getElementById(
            "facturaImporte"
        ).value =
        formatearMoneda(
            registro.spg_monto || 0
        );

        document.getElementById(
            "facturaRetenciones"
        ).value =
        formatearMoneda(
            registro.spg_retenciones || 0
        );

        document.getElementById(
            "facturaTotal"
        ).value =
        formatearMoneda(total);

        document.getElementById(
            "facturaTotalLetra"
        ).value =
        numeroALetras(total);

        /* ===== DATOS FACTURA ======================= */

        document.getElementById(
            "facturaProyecto"
        ).value =
        registro.proyecto || "AI005";

        document.getElementById(
            "facturaNombreProyecto"
        ).value =
        "Atención Integral 005";

        document.getElementById(
            "facturaOficio"
        ).value =
        registro.codigo || "";

        document.getElementById(
            "facturaAdecuacion"
        ).value =
        registro.cuenta || "ADEC-001";

        document.getElementById(
            "facturaFecha"
        ).value =

        new Date(
            registro.fecha || Date.now()
        )
        .toLocaleDateString(
            "es-MX",
            {
                day:"numeric",
                month:"long",
                year:"numeric"
            }
        );

        abrirModal(
            "modalFactura"
        );
    }

    catch(error)
    {
        console.error(
            "ERROR FACTURA:",
            error
        );

        alert(
            error.message
        );
    }
}

/* ==== MODAL OFICIO 2 ========================= */
async function abrirModalOficio2(codigo)
{
    try
    {
        codigoOficio2 = codigo;

        const response =
        await fetch(
            `${API}/api/registros/UP-01`
        );

        if(!response.ok)
        {
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

        if(!registro)
        {
            throw new Error(
                "Registro no encontrado"
            );
        }

        console.log(
            "REGISTRO OFICIO2:",
            registro
        );

        /* ===== DATOS CALCULADOS ================= */

        const dias =
        desglosarDias(
            registro.dia_inicio,
            registro.dia_fin
        ) || "";

        const total =
        Number(
            registro.spg_total || 0
        );

        /* ===== LLENAR CAMPOS ==================== */

        document.getElementById(
            "oficio2Persona"
        ).value =
        registro.persona || "";

        document.getElementById(
            "oficio2Municipio"
        ).value =
        registro.municipio || "";

        document.getElementById(
            "oficio2Dias"
        ).value =
        dias;

        document.getElementById(
            "oficio2Mes"
        ).value =
        registro.mes || "";

        document.getElementById(
            "oficio2Anio"
        ).value =
        registro.anio || "";

        document.getElementById(
            "oficio2Proyecto"
        ).value =
        registro.proyecto || "";

        document.getElementById(
            "oficio2NombreProyecto"
        ).value =
        "Atención Integral 005";

        document.getElementById(
            "oficio2Ofaut"
        ).value =
        registro.codigo || "";

        document.getElementById(
            "oficio2Adec"
        ).value =
        registro.cuenta || "";

        document.getElementById(
            "oficio2Monto"
        ).value =
        formatearMoneda(
            registro.spg_monto || 0
        );

        document.getElementById(
            "oficio2Retenciones"
        ).value =
        formatearMoneda(
            registro.spg_retenciones || 0
        );

        document.getElementById(
            "oficio2Total"
        ).value =
        formatearMoneda(total);

        document.getElementById(
            "oficio2TotalLetra"
        ).value =
        numeroALetras(total);

        abrirModal(
            "modalOficio2"
        );
    }

    catch(error)
    {
        console.error(
            "ERROR OFICIO2:",
            error
        );

        alert(
            error.message
        );
    }
}

/* ==== GENERAR FACTURA ========================= */
async function generarFactura() 
{
    try 
    {
        console.log
        (
            "GENERANDO FACTURA:",
            codigoFactura
        );

        cerrarModal
        (
            "modalCargandoFactura"
        );

        cerrarModal
        (
            "modalConfirmarFactura"
        );

        cerrarModal
        (
            "modalFactura"
        );

        abrirModal
        (
            "modalExitoFactura"
        );

        cargarRegistros();

    } 
    
    catch (error) 
    {
        console.error
        (
            "ERROR FACTURA:",
            error
        );

        cerrarModal
        (
            "modalCargandoFactura"
        );

        alert(error.message);
    }
}

/* ==== GENERAR OFICIO 2 ========================= */
async function generarOficio2()
{
    try
    {
        console.log(
            "GENERANDO OFICIO2:",
            codigoOficio2
        );

        cerrarModal(
            "modalConfirmarOficio2"
        );

        abrirModal(
            "modalCargandoOficio2"
        );

        /* =========================
           PAYLOAD
        ========================= */

        const payload = {

            codigo:
            codigoOficio2,

            fileName:
            `OFICIO2_${codigoOficio2}`,

            variables:{

                "<<NUMC>>":

                document.getElementById(
                    "oficio2Numc"
                ).value,

                "<<NOMBRE>>":

                document.getElementById(
                    "oficio2Persona"
                ).value,

                "<<MUNICIPIO>>":

                document.getElementById(
                    "oficio2Municipio"
                ).value,

                "<<DIAS>>":

                document.getElementById(
                    "oficio2Dias"
                ).value,

                "<<MES>>":

                document.getElementById(
                    "oficio2Mes"
                ).value,

                "<<ANIO>>":

                document.getElementById(
                    "oficio2Anio"
                ).value,

                "<<PROY>>":

                document.getElementById(
                    "oficio2Proyecto"
                ).value,

                "<<NOMPROY>>":

                document.getElementById(
                    "oficio2NombreProyecto"
                ).value,

                "<<OFAUT>>":

                document.getElementById(
                    "oficio2Ofaut"
                ).value,

                "<<OFADEC>>":

                document.getElementById(
                    "oficio2OficioAdec"
                ).value,

                "<<ADEC>>":

                document.getElementById(
                    "oficio2Adec"
                ).value,

                "<<MONT>>":

                document.getElementById(
                    "oficio2Monto"
                ).value,

                "<<RET>>":

                document.getElementById(
                    "oficio2Retenciones"
                ).value,

                "<<TOT>>":

                document.getElementById(
                    "oficio2Total"
                ).value,

                "<<TOTAL>>":

                document.getElementById(
                    "oficio2TotalLetra"
                ).value

            }

        };

        console.log(
            "PAYLOAD OFICIO2:",
            payload
        );

        /* =========================
           FETCH BACKEND
        ========================= */

        const response =
        await fetch(

            `${API}/api/oficio2/generar`,

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:JSON.stringify(
                    payload
                )

            }

        );

        const data =
        await response.json();

        console.log(
            "RESPUESTA OFICIO2:",
            data
        );

        if(
            !response.ok
            ||
            !data.ok
        ){
            throw new Error(

                data.error ||

                "Error generando Oficio 2"

            );
        }

        /* =========================
           GUARDAR URL PDF
        ========================= */

        const guardar =
        await fetch(

            `${API}/api/registros/oficio2/${codigoOficio2}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:JSON.stringify({

                    oficio2_pdf:
                    data.url

                })

            }

        );

        if(!guardar.ok)
        {
            throw new Error(
                "Error guardando Oficio 2"
            );
        }

        cerrarModal(
            "modalCargandoOficio2"
        );

        cerrarModal(
            "modalOficio2"
        );

        abrirModal(
            "modalExitoOficio2"
        );

        cargarRegistros();

    }

    catch(error)
    {
        console.error(
            "ERROR OFICIO2:",
            error
        );

        cerrarModal(
            "modalCargandoOficio2"
        );

        alert(
            error.message
        );
    }
}
/* ==== END GENERAR FACTURA ========================= */

/* ==== CONFIRMAR FACTURA =========================== */
const confirmarFactura =
document.getElementById
(
  "confirmarGenerarFactura"
);

if (confirmarFactura) 
  {
  confirmarFactura.addEventListener
  (
    "click",
    async () => {
      cerrarModal
      (
        "modalConfirmarFactura"
      );

      abrirModal
      (
        "modalCargandoFactura"
      );
      await generarFactura();
    }
  );
}
/* ==== CONFIRMAR FACTURA =========================== */

/* ==== CONFIRMAR OFICIO ============================ */
const confirmarOficio2 =
document.getElementById
(
  "confirmarGenerarOficio2"
);

if (confirmarOficio2) 
{
  confirmarOficio2.addEventListener
  (
    "click",

    async () =>
    {
      cerrarModal
      (
        "modalConfirmarOficio2"
      );

      abrirModal
      (
        "modalCargandoOficio2"
      );

      await generarOficio2();
    }
  );
}
/* ==== ENDCONFIRMAR OFICIO ============================ */

/* ==== ESTATUS ===================================== */
function obtenerBadgeEstatus(estatus) 
{
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
/* ==== END ESTATUS ================================= */


/* ==== BOTÓN ENVIAR A REVISION================================ */
function obtenerBotonEnviar(registro) {
  const estatus = normalizarEstatus(registro.estatus);
  if (estatus === "CREADO" || !estatus) 
    {
    return `
            <button
                class="btn-enviar"
                onclick="enviarRegistro('${registro.codigo}')">
                Enviar
            </button>
        `;
  }

  if (estatus === "ENVIADO") 
    {
    return `
            <button
                class="btn-enviado"
                disabled>
                Enviado
            </button>
        `;
    }

  if (estatus === "PAGADO" || estatus === "ACEPTADO") 
    {
    return `
            <button
                class="btn-aceptado"
                disabled>
                Pagado
            </button>
        `;
    }

  if (estatus === "RECHAZADO") 
    {
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
/* ==== END BOTÓN ENVIAR A REVISION================================ */

/* ==== REENVIAR ================================================== */
async function reenviarRegistro(codigo) 
{
  try 
  {
    const confirmar = confirm("¿Deseas reenviar este registro?");
    if (!confirmar) 
      {
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
    if (!response.ok) 
    {
      throw new Error(data.error || "Error reenviando registro");
    }

    cargarRegistros();
  } catch (error) 
  {
    console.error("ERROR REENVIANDO:", error);
    alert(error.message);
  }
}
/* ==== END REENVIAR ============================================== */

/* ==== ENVIAR REGISTRO =========================================== */
async function enviarRegistro(codigo) 
{
  try 
  {
    const response = await fetch(
      `${API}/api/registros/enviar/${codigo}`,

      {
        method: "PUT",
        headers: 
        {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    if (!response.ok) 
    {
      throw new Error(data.error || "Error enviando registro");
    }

    cargarRegistros();
  } catch (error) 
    {
      console.error("ERROR ENVIANDO:", error);
      alert(error.message);
    }
}

/* =========OBSERVACIONES========================= */
async function guardarObservaciones(codigo, observaciones) 
{
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
    if (!response.ok) 
    {
      throw new Error(data.error || "Error guardando observaciones");
    }
  } catch (error) 
    {
      console.error("ERROR OBSERVACIONES:", error);
      alert(error.message);
    }
}

/* ==== CARGAR REGISTROS ========================= */
async function cargarRegistros() 
{
  try {
    const response = await fetch(`${API}/api/registros/UP-01`); //CAMBIO DE ACUERDO A LA UP REGISTRO

    if (!response.ok) 
    {
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
                        class="link-pdf"
                    >
                        Ver Factura
                    </a>
                    `
                    : `
                    <button
                        class="btn-bloqueado"
                        disabled
                    >
                        Sin Factura
                    </button>
                    `
                    }
                </div>

                <!-- OFICIO 2 -->
                <div
                    class="info-item"
                    style="
                        flex:1;
                        text-align:center;
                    "
                >
                    <span class="info-label">
                        Oficio 2 PDF
                    </span>

                    ${
                    registro.oficio2_pdf
                    ? `
                    <a
                        href="${registro.oficio2_pdf}"
                        target="_blank"
                        class="link-pdf"
                    >
                        Ver Oficio 2
                    </a>
                    `
                    : `
                    <button
                        class="btn-bloqueado"
                        disabled
                    >
                        Sin Oficio 2
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
                            : !registro.oficio2_pdf
                                ? `
                            <button
                                class="btn-enviar"
                                onclick="abrirModalOficio2('${registro.codigo}')">
                                Generar Oficio 2
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