/* ================================================
   CONFIGURACIÓN GLOBAL
   URL base del servidor API
================================================ */

const API = "https://sebiso-pliegos-oficios-1.onrender.com";


/* ================================================
   MAPA DE ÁREAS
   Relaciona el nombre del área con su ID numérico
   en la base de datos
================================================ */

const mapaAreas = {
    "UP-01-DESPACHO"    : 1,
    "UP-CA"             : 2,
    "UP-01-S-DRM"       : 3,
    "UP-04-DGFA"        : 4,
    "UP-05-Subse_I_D"   : 5,
    "UP-06-DGOLP"       : 6,
    "UP-07-MIGRANTES"   : 7,
    "UP-08-ASISTENCIA"  : 8,
    "UP-13-SSPSyFA"     : 9,
    "UP-14-DISCAPACIDAD": 10,
    "UP-15-SSDSyH"      : 11,
    "UP-16"             : 12
};


/* ================================================
   ORDEN DE MESES
   Se usa para ordenar el historial cronológicamente
================================================ */

const ordenMeses = {
    "ENERO"     : 1,
    "FEBRERO"   : 2,
    "MARZO"     : 3,
    "ABRIL"     : 4,
    "MAYO"      : 5,
    "JUNIO"     : 6,
    "JULIO"     : 7,
    "AGOSTO"    : 8,
    "SEPTIEMBRE": 9,
    "OCTUBRE"   : 10,
    "NOVIEMBRE" : 11,
    "DICIEMBRE" : 12
};


/* ================================================
   REFERENCIAS A ELEMENTOS DEL DOM
================================================ */

const btnGuardar      = document.getElementById("btnGuardarPresupuesto");
const tbodyIngresos   = document.getElementById("tbodyIngresos");
const tbodyGastos     = document.getElementById("tbodyGastos");
const saldoDisponible = document.getElementById("saldoDisponible");


/* ================================================
   CONTROL DE CARGA ACTIVA
   Evita que peticiones antiguas sobreescriban
   resultados de peticiones más recientes
================================================ */

let cargaHistorialId = 0;
let cargaGastosId = 0;


/* ================================================
   TRANSFORMAR NOMBRE DE ARCHIVO
   Reemplaza los espacios del nombre del archivo
   por "/" para estandarizar su visualización.

   Ejemplos:
     "SH 3033 2025.pdf"    → "SH/3033/2025"
     "SH-CPF-518 2025.pdf" → "SH-CPF-518/2025"

   - Los guiones "-" se conservan tal cual.
   - La extensión (.pdf, .docx, etc.) se elimina.
   - Los espacios se convierten en "/".
================================================ */

function transformarNombreArchivo(nombreArchivo) {

    if (!nombreArchivo) return "";

    // Tomar solo el nombre del archivo, ignorar la subcarpeta
    const soloNombre = nombreArchivo.split('/').pop();

    // Eliminar extensión
    const sinExtension = soloNombre.replace(/\.[^/.]+$/, "");

    // Reemplazar espacios por "/"
    const transformado = sinExtension.replace(/ /g, "/");

    return transformado;
}

/* ================================================
   VALIDAR ÁREA
   Verifica que el área seleccionada exista
   en el mapa de áreas definido
================================================ */

function validarArea(area) {

    console.log("AREA recibida:", area);
    console.log("MAPA de áreas:", mapaAreas);

    return Object.prototype.hasOwnProperty.call(mapaAreas, area);
}


/* ================================================
   FORMATEAR FECHA
   Convierte una fecha ISO a formato legible
   en español México
================================================ */

function formatearFecha(fecha) {

    return new Date(fecha).toLocaleString("es-MX");
}


/* ================================================
   MODAL MENSAJES
   Muestra un modal reutilizable para:
     - Mensajes informativos (tipo "ok")
     - Confirmaciones con callback (tipo "confirmar")
================================================ */

function abrirModalMensaje(titulo, mensaje, tipo = "ok", callback = null) {

    const modal       = document.getElementById("modalMensaje");
    const overlay     = document.getElementById("overlay");
    const tituloModal = document.getElementById("tituloModalMensaje");
    const textoModal  = document.getElementById("textoModalMensaje");
    const botones     = document.getElementById("botonesModalMensaje");

    // Cambiar ícono según el tipo de modal
    const icono = document.getElementById("modalConfirmIcon");

    if (tipo === "confirmar") {

        icono.style.background = "#e53e3e";
        icono.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
        </svg>`;

    } else if (tipo === "error") {

        icono.style.background = "#e53e3e";
        icono.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>`;

    } else {

        icono.style.background = "#38a169";
        icono.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>`;
    }

    tituloModal.innerText = titulo;
    textoModal.innerText  = mensaje;

    // Botones según el tipo de modal
    if (tipo === "confirmar") {

        botones.innerHTML = `
            <button type="button" class="btn-secundario" onclick="cerrarModalMensaje()">
                Cancelar
            </button>
            <button type="button" class="btn-principal" id="btnConfirmarModal">
                Aceptar
            </button>
        `;

    } else {

        botones.innerHTML = `
            <button type="button" class="btn-principal" onclick="cerrarModalMensaje()">
                Aceptar
            </button>
        `;
    }

    modal.style.display   = "flex";
    overlay.style.display = "block";

    // Asignar callback al botón confirmar si aplica
    if (tipo === "confirmar") {

        document.getElementById("btnConfirmarModal").onclick = () => {

            cerrarModalMensaje();

            if (callback) callback();
        };
    }
}


/* ================================================
   CERRAR MODAL MENSAJES
================================================ */

function cerrarModalMensaje() {

    document.getElementById("modalMensaje").style.display = "none";
    document.getElementById("overlay").style.display      = "none";
}


/* ================================================
   CERRAR MODAL EDITAR
================================================ */

function cerrarModalEditar() {

    document.getElementById("modalEditar").style.display = "none";
    document.getElementById("overlay").style.display     = "none";
}


/* ================================================
   GUARDAR PRESUPUESTO
   Lee los campos del formulario principal,
   valida los datos, arma el FormData y envía
   la petición POST al servidor.
   Los archivos PDF se adjuntan si fueron seleccionados.
================================================ */

btnGuardar.addEventListener("click", async () => {

    try {

        const area             = document.getElementById("selectArea").value.trim();
        const mes              = document.getElementById("mesPresupuesto").value;
        const anio             = document.getElementById("anioPresupuesto").value;
        const saldoAutorizado  = document.getElementById("saldoAutorizado").value;
        const saldoModificado  = document.getElementById("saldoModificado").value || 0;
        const oficioAutorizacion = document.getElementById("oficioAutorizacionPDF").files[0];
        const oficioAdecuacion   = document.getElementById("oficioAdecuacionPDF").files[0];

        // Validar saldo autorizado
        if (!saldoAutorizado) {

            abrirModalMensaje("Campos incompletos", "Ingrese saldo autorizado", "error");
            return;
        }

        // Validar que el área exista en el mapa
        if (!validarArea(area)) {

            abrirModalMensaje("Área inválida", `Área recibida: ${area}`, "error");
            return;
        }

        const formData = new FormData();

        formData.append("area_id",         mapaAreas[area]);
        formData.append("mes",             mes);
        formData.append("anio",            anio);
        formData.append("saldo_autorizado", saldoAutorizado);
        formData.append("saldo_modificado", saldoModificado);

        // Adjuntar PDFs solo si fueron seleccionados
        if (oficioAutorizacion) formData.append("oficio_autorizacion", oficioAutorizacion);
        if (oficioAdecuacion)   formData.append("oficio_adecuacion",   oficioAdecuacion);

        const respuesta = await fetch(`${API}/api/presupuestos/crear`, {
            method: "POST",
            body:   formData
        });

        const data = await respuesta.json();

        if (!data.ok) {

            abrirModalMensaje("Error", data.msg || "Error al guardar", "error");
            return;
        }

        abrirModalMensaje("Registro guardado", "El registro fue guardado correctamente.");

        // Limpiar campos del formulario
        document.getElementById("saldoAutorizado").value      = "";
        document.getElementById("saldoModificado").value      = "";
        document.getElementById("oficioAutorizacionPDF").value = "";
        document.getElementById("oficioAdecuacionPDF").value   = "";

        // Recargar tablas
        cargarHistorial();
        cargarGastos();

    } catch (error) {

        console.error("Error al guardar presupuesto:", error);
        abrirModalMensaje("Error servidor", "Ocurrió un error inesperado", "error");
    }
});


/* ================================================
   CARGAR HISTORIAL
   Obtiene los presupuestos del área seleccionada,
   los ordena por año y mes descendente,
   y los pinta en la tabla de ingresos.
   También muestra el saldo disponible más reciente.
================================================ */

async function cargarHistorial() {

    const miCarga = ++cargaHistorialId;

    try {

        const area = document.getElementById("selectArea").value.trim();

        const respuesta = await fetch(`${API}/api/presupuestos/${area}`);
        const resultado = await respuesta.json();

        if (miCarga !== cargaHistorialId) return;

        const data = resultado.presupuestos || [];

        // Ordenar por año DESC, luego por mes DESC
        data.sort((a, b) => {

            if (b.anio !== a.anio) return b.anio - a.anio;

            return ordenMeses[b.mes] - ordenMeses[a.mes];
        });

        tbodyIngresos.innerHTML = "";

        if (data.length === 0) {

            tbodyIngresos.innerHTML = `
                <tr>
                    <td colspan="7">No hay registros</td>
                </tr>
            `;

            saldoDisponible.innerHTML = "$0.00";
            return;
        }

        // El saldo disponible es el del registro más reciente
        const ultimoSaldo = data[0].saldo_restante || 0;

        data.forEach((registro) => {

            // Transformar nombres de archivos: espacios → "/"
            const nombreAutorizacion = transformarNombreArchivo(registro.oficio_autorizacion);
            const nombreAdecuacion   = transformarNombreArchivo(registro.oficio_adecuacion);

            tbodyIngresos.innerHTML += `
                <tr>
                    <td>${registro.mes} ${registro.anio}</td>

                    <td>$${parseFloat(registro.saldo_autorizado || 0)
                        .toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>

                    <td>$${parseFloat(registro.saldo_modificado || 0)
                        .toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>

                    <td>$${parseFloat(registro.saldo_restante || 0)
                        .toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>

                    <td>
                        ${registro.oficio_autorizacion
                            ? `<a
                                href="${API}/uploads/oficios/${registro.oficio_autorizacion}"
                                target="_blank"
                                class="btn-pdf"
                                title="${registro.oficio_autorizacion}"
                               >
                                   ${nombreAutorizacion}
                               </a>`
                            : "Sin PDF"
                        }
                    </td>

                    <td>
                        ${registro.oficio_adecuacion
                            ? `<a
                                href="${API}/uploads/oficios/${registro.oficio_adecuacion}"
                                target="_blank"
                                class="btn-pdf"
                                title="${registro.oficio_adecuacion}"
                               >
                                   ${nombreAdecuacion}
                               </a>`
                            : "Sin PDF"
                        }
                    </td>

                    <td class="acciones">
                        <button class="btn-editar"   onclick="editarRegistro(${registro.id})">Editar</button>
                        <button class="btn-eliminar" onclick="eliminarRegistro(${registro.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        saldoDisponible.innerHTML =
            `$${parseFloat(ultimoSaldo).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

    } catch (error) {

        console.error("Error al cargar historial:", error);
    }
}


/* ================================================
   CARGAR GASTOS
   Obtiene los gastos del área seleccionada
   y los pinta en la tabla de gastos
================================================ */

async function cargarGastos() {

    const miCarga = ++cargaGastosId;

    try {

        const area = document.getElementById("selectArea").value.trim();

        const respuesta = await fetch(`${API}/api/presupuestos/${area}`);
        const resultado = await respuesta.json();

        if (miCarga !== cargaGastosId) return;

        const gastos = resultado.gastos || [];

        tbodyGastos.innerHTML = "";

        if (gastos.length === 0) {

            tbodyGastos.innerHTML = `
                <tr>
                    <td colspan="4">No hay gastos registrados</td>
                </tr>
            `;

            return;
        }

        gastos.forEach((gasto) => {

            tbodyGastos.innerHTML += `
                <tr>
                    <td>${formatearFecha(gasto.fecha)}</td>
                    <td>${gasto.persona      || "-"}</td>
                    <td>$${parseFloat(gasto.cantidad || 0)
                        .toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                    <td>${gasto.observacion  || "-"}</td>
                </tr>
            `;
        });

    } catch (error) {

        console.error("Error al cargar gastos:", error);
    }
}


/* ================================================
   EDITAR REGISTRO
   Busca el registro por ID en el historial
   y rellena el modal de edición con sus datos
================================================ */

async function editarRegistro(id) {

    try {

        const area = document.getElementById("selectArea").value.trim();

        const respuesta = await fetch(`${API}/api/presupuestos/${area}`);
        const resultado = await respuesta.json();
        const data      = resultado.presupuestos || [];

        const registro = data.find((item) => item.id === id);

        if (!registro) {

            abrirModalMensaje("Error", "Registro no encontrado", "error");
            return;
        }

        // Rellenar campos del modal
        document.getElementById("editId").value             = registro.id;
        document.getElementById("editMes").value            = registro.mes;
        document.getElementById("editAnio").value           = registro.anio;
        document.getElementById("editSaldoAutorizado").value = registro.saldo_autorizado;
        document.getElementById("editSaldoModificado").value = registro.saldo_modificado;

        document.getElementById("editDisponible").innerHTML =
            `$${parseFloat(registro.saldo_disponible || 0)
                .toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

        document.getElementById("editGastado").innerHTML =
            `$${parseFloat(registro.gastado_mes || 0)
                .toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

        document.getElementById("editRestante").innerHTML =
            `$${parseFloat(registro.saldo_restante || 0)
                .toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

        document.getElementById("modalEditar").style.display = "flex";
        document.getElementById("overlay").style.display     = "block";

    } catch (error) {

        console.error("Error al editar registro:", error);
        abrirModalMensaje("Error", "Error cargando registro", "error");
    }
}


/* ================================================
   ACTUALIZAR REGISTRO
   Lee los campos del modal de edición
   y envía la petición PUT al servidor
================================================ */

document.getElementById("btnActualizar").addEventListener("click", async () => {

    try {

        const id              = document.getElementById("editId").value;
        const saldoAutorizado = document.getElementById("editSaldoAutorizado").value;
        const saldoModificado = document.getElementById("editSaldoModificado").value;
        const mes             = document.getElementById("editMes").value;
        const anio            = document.getElementById("editAnio").value;

        const formData = new FormData();

        formData.append("saldo_autorizado", saldoAutorizado);
        formData.append("saldo_modificado", saldoModificado);
        formData.append("mes",              mes);
        formData.append("anio",             anio);

        const respuesta = await fetch(`${API}/api/presupuestos/editar/${id}`, {
            method: "PUT",
            body:   formData
        });

        const data = await respuesta.json();

        if (data.ok) {

            abrirModalMensaje("Registro actualizado", "Los cambios fueron guardados correctamente.");

            cerrarModalEditar();
            cargarHistorial();
            cargarGastos();

        } else {

            abrirModalMensaje("Error", data.msg || "Error actualizando", "error");
        }

    } catch (error) {

        console.error("Error al actualizar registro:", error);
        abrirModalMensaje("Error servidor", "Ocurrió un error inesperado", "error");
    }
});


/* ================================================
   ELIMINAR REGISTRO
   Muestra confirmación y, si se acepta,
   envía la petición DELETE al servidor
================================================ */

async function eliminarRegistro(id) {

    abrirModalMensaje(

        "Eliminar registro",
        "¿Desea eliminar este registro?",
        "confirmar",

        async () => {

            try {

                const respuesta = await fetch(`${API}/api/presupuestos/${id}`, {
                    method: "DELETE"
                });

                const data = await respuesta.json();

                if (data.ok) {

                    abrirModalMensaje("Registro eliminado", "El registro fue eliminado correctamente.");

                    cargarHistorial();
                    cargarGastos();

                } else {

                    abrirModalMensaje("Error", data.msg || "Error eliminando", "error");
                }

            } catch (error) {

                console.error("Error al eliminar registro:", error);
                abrirModalMensaje("Error servidor", "Ocurrió un error inesperado", "error");
            }
        }
    );
}


/* ================================================
   TABS — INGRESOS / GASTOS
   Alterna la visibilidad entre las dos tablas
================================================ */

function mostrarIngresos() {

    document.getElementById("contenedorIngresos").style.display = "block";
    document.getElementById("contenedorGastos").style.display   = "none";

    document.getElementById("btnIngresos").classList.add("activo");
    document.getElementById("btnGastos").classList.remove("activo");
}

function mostrarGastos() {

    document.getElementById("contenedorIngresos").style.display = "none";
    document.getElementById("contenedorGastos").style.display   = "block";

    document.getElementById("btnGastos").classList.add("activo");
    document.getElementById("btnIngresos").classList.remove("activo");
}


/* ================================================
   EVENTO — CAMBIO DE ÁREA
   Al cambiar el área seleccionada se recargan
   automáticamente el historial y los gastos
================================================ */

document.getElementById("selectArea").addEventListener("change", () => {

    cargarHistorial();
    cargarGastos();
});


/* ================================================
   INICIALIZACIÓN
   Carga los datos al abrir la página
================================================ */

cargarHistorial();
cargarGastos();