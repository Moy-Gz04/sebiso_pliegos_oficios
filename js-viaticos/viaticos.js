/**********************************************************************
 *
 * CONTROL DE VIÁTICOS
 * Secretaría de Bienestar e Inclusión Social
 *
 **********************************************************************/

const API = "https://sebiso-pliegos-oficios-1.onrender.com";

let modal;
let tabla;

let registrosExcel = [];

/**********************************************************************
 *
 * INICIO
 *
 **********************************************************************/

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar(){

    modal = document.getElementById("modalRegistro");

    iniciarTabla();

    iniciarEventos();

    await cargarUnidades();

}

/**********************************************************************
 *
 * TABLA
 *
 **********************************************************************/

function iniciarTabla(){

    tabla = new DataTable("#tablaViaticos",{

        responsive:true,

        pageLength:10,

        language:{

            url:"https://cdn.datatables.net/plug-ins/2.3.2/i18n/es-MX.json"

        }

    });

}

/**********************************************************************
 *
 * EVENTOS
 *
 **********************************************************************/

function iniciarEventos(){

    document
    .getElementById("unidad")
    .addEventListener("change",cambiarUnidad);

    document
    .getElementById("nuevo")
    .addEventListener("click",abrirModal);

    document
    .getElementById("cerrarModal")
    .addEventListener("click",cerrarModal);

    document
    .getElementById("cancelarModal")
    .addEventListener("click",cerrarModal);

    document
    .getElementById("guardarRegistro")
    .addEventListener("click",guardarRegistro);

    document
    .getElementById("importarExcel")
    .addEventListener("click",importarExcel);

    window.onclick=(e)=>{

        if(e.target===modal){

            cerrarModal();

        }

    };

    document
    .querySelectorAll(".tab")
    .forEach(tab=>{

        tab.onclick=()=>{

            document
            .querySelectorAll(".tab")
            .forEach(t=>t.classList.remove("activa"));

            document
            .querySelectorAll(".tab-content")
            .forEach(c=>c.classList.remove("activo"));

            tab.classList.add("activa");

            document
            .getElementById(tab.dataset.tab)
            .classList.add("activo");

        };

    });

}

/**********************************************************************
 *
 * ÁREAS PRESUPUESTALES
 *
 **********************************************************************/

async function cargarUnidades(){

    try{

        const respuesta=await fetch(

            `${API}/api/viaticos/unidades`

        );

        const datos=await respuesta.json();

        const select=document.getElementById("unidad");

        select.innerHTML=`
            <option value="">
                Seleccione un Área...
            </option>
        `;

        datos.forEach(area=>{

            select.innerHTML+=`

                <option value="${area.id}">

                    ${area.clave} - ${area.nombre}

                </option>

            `;

        });

    }

    catch(error){

        console.error(error);

        alert("No fue posible cargar las Áreas Presupuestales.");

    }

}

/**********************************************************************
 *
 * CAMBIO DE ÁREA
 *
 **********************************************************************/

function cambiarUnidad(e){

    const opcion=e.target.options[e.target.selectedIndex];

    sessionStorage.setItem(

        "unidad_id",

        opcion.value

    );

    sessionStorage.setItem(

        "unidad_nombre",

        opcion.text

    );

    document.getElementById(

        "unidadActual"

    ).textContent=opcion.text;

    cargarViaticos();

}

/**********************************************************************
 *
 * CARGAR TABLA
 *
 **********************************************************************/

async function cargarViaticos(){

    const unidad=sessionStorage.getItem("unidad_id");

    if(!unidad){

        return;

    }

    try{

        const respuesta=await fetch(

            `${API}/api/viaticos?unidad_id=${unidad}`

        );

        const datos=await respuesta.json();

        if(!datos.ok){

            alert(datos.mensaje);

            return;

        }

        tabla.clear();

        let totalImporte=0;

        const personas=new Set();

        datos.registros.forEach(registro=>{

            totalImporte+=Number(registro.importe);

            personas.add(registro.rfc);

            tabla.row.add([

                registro.nombre_servidor,

                registro.rfc,

                registro.mes,

                registro.municipio,

                Number(registro.importe).toLocaleString(

                    "es-MX",

                    {

                        style:"currency",

                        currency:"MXN"

                    }

                ),

                `

                <button

                    class="btnEditar"

                    data-id="${registro.id}">

                    <i class="bi bi-pencil-square"></i>

                </button>

                <button

                    class="btnEliminar"

                    data-id="${registro.id}">

                    <i class="bi bi-trash"></i>

                </button>

                `

            ]);

        });

        tabla.draw();

        actualizarDashboard(

            totalImporte,

            datos.registros.length,

            personas.size

        );

    }

    catch(error){

        console.error(error);

        alert("Error al consultar los registros.");

    }

}

/**********************************************************************
 *
 * DASHBOARD
 *
 **********************************************************************/

function actualizarDashboard(

    total,

    comisiones,

    personas

){

    document.getElementById(

        "totalPresupuesto"

    ).textContent=

        total.toLocaleString(

            "es-MX",

            {

                style:"currency",

                currency:"MXN"

            }

        );

    document.getElementById(

        "totalComisiones"

    ).textContent=comisiones;

    document.getElementById(

        "totalPersonas"

    ).textContent=personas;

    let promedio=0;

    if(comisiones>0){

        promedio=total/comisiones;

    }

    document.getElementById(

        "promedio"

    ).textContent=

        promedio.toLocaleString(

            "es-MX",

            {

                style:"currency",

                currency:"MXN"

            }

        );

}

/**********************************************************************
 *
 * MODAL
 *
 **********************************************************************/

function abrirModal(){

    const unidad=document.getElementById("unidad").value;

    if(!unidad){

        alert("Seleccione primero un Área Presupuestal.");

        return;

    }

    limpiarFormulario();

    modal.style.display="flex";

}

function cerrarModal(){

    modal.style.display="none";

}

/**********************************************************************
 *
 * LIMPIAR FORMULARIO
 *
 **********************************************************************/

function limpiarFormulario(){

    document.getElementById(

        "nombreRegistro"

    ).value="";

    document.getElementById(

        "rfcRegistro"

    ).value="";

    document.getElementById(

        "municipioRegistro"

    ).value="";

    document.getElementById(

        "importeRegistro"

    ).value="";

    document.getElementById(

        "mesRegistro"

    ).selectedIndex=0;

}

/**********************************************************************
 *
 * REGISTRO MANUAL
 *
 **********************************************************************/

async function guardarRegistro(){

    const unidad=sessionStorage.getItem("unidad_id");

    if(!unidad){

        alert("Seleccione un Área Presupuestal.");

        return;

    }

    const body={

        unidad_id:unidad,

        nombre_servidor:

            document.getElementById(

                "nombreRegistro"

            ).value.trim(),

        rfc:

            document.getElementById(

                "rfcRegistro"

            ).value.trim().toUpperCase(),

        mes:

            document.getElementById(

                "mesRegistro"

            ).value,

        municipio:

            document.getElementById(

                "municipioRegistro"

            ).value.trim().toUpperCase(),

        importe:

            Number(

                document.getElementById(

                    "importeRegistro"

                ).value

            )

    };

    if(

        !body.nombre_servidor ||

        !body.rfc ||

        !body.municipio ||

        !body.importe

    ){

        alert("Complete todos los campos.");

        return;

    }

    try{

        const respuesta=await fetch(

            `${API}/api/viaticos`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify(body)

            }

        );

        const datos=await respuesta.json();

        if(!datos.ok){

            alert(datos.mensaje);

            return;

        }

        cerrarModal();

        cargarViaticos();

    }

    catch(error){

        console.error(error);

        alert("Error al guardar.");

    }

}

/**********************************************************************
 *
 * IMPORTAR EXCEL
 *
 **********************************************************************/

async function importarExcel(){

    const archivo=document.getElementById("archivoExcel").files[0];

    if(!archivo){

        alert("Seleccione un archivo Excel.");

        return;

    }

    const unidad=sessionStorage.getItem("unidad_id");

    if(!unidad){

        alert("Seleccione un Área Presupuestal.");

        return;

    }

    const reader=new FileReader();

    reader.onload=function(e){

        leerExcel(e.target.result);

    };

    reader.readAsArrayBuffer(archivo);

}

/**********************************************************************
 *
 * LEER EXCEL
 *
 **********************************************************************/

function leerExcel(buffer){

    registrosExcel=[];

    const workbook=XLSX.read(buffer,{

        type:"array"

    });

    const hoja=workbook.Sheets[workbook.SheetNames[0]];

    const datos=XLSX.utils.sheet_to_json(

        hoja,

        {

            defval:""

        }

    );

    if(datos.length===0){

        alert("El archivo está vacío.");

        return;

    }

    procesarExcel(datos);

}

/**********************************************************************
 *
 * PROCESAR EXCEL
 *
 **********************************************************************/

function procesarExcel(datos){

    datos.forEach(fila=>{

        registrosExcel.push({

            nombre_servidor:

                obtenerCampo(

                    fila,

                    [

                        "Nombre del Servidor Público",

                        "NOMBRE DEL SERVIDOR PUBLICO",

                        "SERVIDOR PUBLICO",

                        "NOMBRE"

                    ]

                ),

            rfc:

                obtenerCampo(

                    fila,

                    [

                        "RFC"

                    ]

                ),

            mes:

                obtenerCampo(

                    fila,

                    [

                        "MES"

                    ]

                ).toUpperCase(),

            municipio:

                obtenerCampo(

                    fila,

                    [

                        "MUNICIPIO VISITADO",

                        "MUNICIPIO"

                    ]

                ).toUpperCase(),

            importe:

                limpiarImporte(

                    obtenerCampo(

                        fila,

                        [

                            "IMPORTE"

                        ]

                    )

                )

        });

    });

    validarExcel();

}

/**********************************************************************
 *
 * OBTENER CAMPO DEL EXCEL
 *
 **********************************************************************/

function obtenerCampo(fila, posiblesCampos){

    const llaves = Object.keys(fila);

    for(const posible of posiblesCampos){

        const encontrada = llaves.find(k =>
            limpiarTexto(k) === limpiarTexto(posible)
        );

        if(encontrada){

            return String(fila[encontrada]).trim();

        }

    }

    return "";

}

/**********************************************************************
 *
 * LIMPIAR TEXTO
 *
 **********************************************************************/

function limpiarTexto(texto){

    return String(texto)

        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g,"")

        .replace(/\s+/g," ")

        .trim()

        .toUpperCase();

}

/**********************************************************************
 *
 * LIMPIAR IMPORTE
 *
 **********************************************************************/

function limpiarImporte(valor){

    if(valor===null || valor===undefined){

        return 0;

    }

    if(typeof valor==="number"){

        return Number(valor);

    }

    let limpio=String(valor);

    limpio=limpio.replace(/\$/g,"");

    limpio=limpio.replace(/,/g,"");

    limpio=limpio.trim();

    if(limpio===""){

        return 0;

    }

    return Number(limpio);

}

/**********************************************************************
 *
 * RFC
 *
 **********************************************************************/

function validarRFC(rfc){

    if(!rfc){

        return false;

    }

    rfc=rfc.trim().toUpperCase();

    return /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(rfc);

}

/**********************************************************************
 *
 * FORMATEAR DINERO
 *
 **********************************************************************/

function formatoMoneda(numero){

    return Number(numero).toLocaleString(

        "es-MX",

        {

            style:"currency",

            currency:"MXN"

        }

    );

}

/**********************************************************************
 *
 * LIMPIAR EXCEL
 *
 **********************************************************************/

function limpiarImportacion(){

    registrosExcel=[];

    document.getElementById("archivoExcel").value="";

}

/**********************************************************************
 *
 * EDITAR REGISTRO
 *
 **********************************************************************/

async function editarRegistro(id){

    alert("Próximamente se habilitará la edición del registro.");

}

/**********************************************************************
 *
 * ELIMINAR REGISTRO
 *
 **********************************************************************/

async function eliminarRegistro(id){

    if(!confirm("¿Desea eliminar este registro?")){

        return;

    }

    try{

        const respuesta=await fetch(

            `${API}/api/viaticos/${id}`,

            {

                method:"DELETE"

            }

        );

        const datos=await respuesta.json();

        if(!datos.ok){

            alert(datos.mensaje);

            return;

        }

        cargarViaticos();

    }

    catch(error){

        console.error(error);

        alert("Error al eliminar.");

    }

}

/**********************************************************************
 *
 * EVENTOS DE LA TABLA
 *
 **********************************************************************/

document.addEventListener("click",function(e){

    const btnEditar=e.target.closest(".btnEditar");

    if(btnEditar){

        editarRegistro(

            btnEditar.dataset.id

        );

    }

    const btnEliminar=e.target.closest(".btnEliminar");

    if(btnEliminar){

        eliminarRegistro(

            btnEliminar.dataset.id

        );

    }

});

/**********************************************************************
 *
 * BUSCAR
 *
 **********************************************************************/

document.getElementById("buscar").addEventListener(

    "click",

    function(){

        cargarViaticos();

    }

);

/**********************************************************************
 *
 * LIMPIAR FILTROS
 *
 **********************************************************************/

document.getElementById("limpiar").addEventListener(

    "click",

    ()=>{

        document.getElementById("mes").selectedIndex=0;

        document.getElementById("municipio").value="";

        document.getElementById("servidor").value="";

        cargarViaticos();

    }

);

/**********************************************************************
 *
 * FIN DEL ARCHIVO
 *
 **********************************************************************/