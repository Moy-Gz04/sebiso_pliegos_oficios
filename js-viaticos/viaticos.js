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
let UNIDADES = [];   // [{ id, clave, nombre }] para reconocer la UP de cada hoja del Excel

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
        UNIDADES = datos;
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

    const reader=new FileReader();
    reader.onload=function(e){ leerExcel(e.target.result); };
    reader.readAsArrayBuffer(archivo);

}

/**********************************************************************
 *
 * LEER EXCEL
 * Lee TODAS las hojas. Cada hoja puede ser de una UP distinta: la UP se
 * reconoce por el nombre de la hoja («UP 01», «UP04», «UP-13»…). Si la
 * hoja no dice su UP, se usa el Área Presupuestal elegida arriba.
 * La fila de encabezados se busca sola (la que trae «RFC»), así que el
 * archivo puede tener un título arriba; los renglones vacíos se omiten.
 *
 **********************************************************************/

function leerExcel(buffer){

    registrosExcel=[];

    const workbook=XLSX.read(buffer,{ type:"array" });
    const elegida=sessionStorage.getItem("unidad_id");
    const avisos=[];

    workbook.SheetNames.forEach(nombreHoja=>{

        const filas=XLSX.utils.sheet_to_json(workbook.Sheets[nombreHoja],{ header:1, defval:"" });
        const iEnc=filas.findIndex(f=>f.some(c=>String(c).trim().toUpperCase()==="RFC"));
        if(iEnc<0) return;   // hoja sin tabla de viáticos

        const encabezados=filas[iEnc].map(c=>String(c).trim());
        const datos=filas.slice(iEnc+1).map(f=>{
            const o={};
            encabezados.forEach((h,i)=>{ if(h) o[h]=f[i]; });
            return o;
        });

        // UP de la hoja: los dígitos de su nombre («UP 01» → «01»)
        const m=nombreHoja.match(/(\d{1,2})/);
        let unidad=null;
        if(m){
            const clave=m[1].padStart(2,"0");
            unidad=UNIDADES.find(u=>String(u.clave).padStart(2,"0")===clave) || null;
            if(!unidad) avisos.push(`La hoja «${nombreHoja}» es de la UP ${clave}, que no existe en el sistema; se omitió.`);
        }
        else if(elegida){
            unidad=UNIDADES.find(u=>String(u.id)===String(elegida)) || null;
        }
        else{
            avisos.push(`La hoja «${nombreHoja}» no indica su UP; elija un Área Presupuestal arriba para importarla.`);
        }
        if(!unidad) return;

        procesarExcel(datos, unidad);

    });

    if(registrosExcel.length===0){
        alert(["El archivo no tiene renglones de viáticos para importar.", ...avisos].join("\n\n"));
        return;
    }

    validarExcel(avisos);

}

/**********************************************************************
 *
 * PROCESAR EXCEL
 *
 **********************************************************************/

function procesarExcel(datos, unidad){

    datos.forEach(fila=>{

        const nombre=obtenerCampo(fila,[ "Nombre del Servidor Público", "NOMBRE DEL SERVIDOR PUBLICO", "SERVIDOR PUBLICO", "NOMBRE" ]);
        if(!String(nombre).trim()) return;   // renglón vacío (solo trae el número)

        registrosExcel.push({
            unidad_id: unidad.id,
            unidad_clave: unidad.clave,
            nombre_servidor: String(nombre).trim(),
            rfc: String(obtenerCampo(fila,[ "RFC" ])).trim().toUpperCase(),
            mes: String(obtenerCampo(fila,[ "MES" ])).trim().toUpperCase(),
            municipio: String(obtenerCampo(fila,[ "MUNICIPIO VISITADO", "MUNICIPIO" ])).trim().toUpperCase(),
            importe: limpiarImporte(obtenerCampo(fila,[ "IMPORTE" ]))
        });

    });

}

/**********************************************************************
 *
 * VALIDAR Y ENVIAR
 * Muestra un resumen por UP, pide confirmación y manda cada UP a
 * /api/viaticos/importar (el servidor omite lo que ya estaba guardado).
 *
 **********************************************************************/

const MESES_VALIDOS=["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];

async function validarExcel(avisos=[]){

    const problemas=[];
    registrosExcel.forEach((r,i)=>{
        if(!(Number(r.importe)>0)) problemas.push(`UP ${r.unidad_clave} · ${r.nombre_servidor}: importe inválido.`);
        if(!MESES_VALIDOS.includes(r.mes)) problemas.push(`UP ${r.unidad_clave} · ${r.nombre_servidor}: mes «${r.mes}» no reconocido.`);
        if(r.rfc && typeof validarRFC==="function" && !validarRFC(r.rfc)) problemas.push(`UP ${r.unidad_clave} · ${r.nombre_servidor}: RFC «${r.rfc}» con formato raro (se importa igual).`);
    });
    const bloqueantes=problemas.filter(p=>!p.includes("se importa igual"));
    if(bloqueantes.length){
        alert("Corrija estos renglones del Excel y vuelva a intentarlo:\n\n"+bloqueantes.slice(0,15).join("\n")+(bloqueantes.length>15?`\n… y ${bloqueantes.length-15} más`:""));
        return;
    }

    // resumen por UP
    const porUnidad=new Map();
    registrosExcel.forEach(r=>{
        const g=porUnidad.get(r.unidad_id)||{ clave:r.unidad_clave, registros:[], total:0 };
        g.registros.push(r); g.total+=Number(r.importe); porUnidad.set(r.unidad_id,g);
    });
    const resumen=[...porUnidad.values()].map(g=>`UP ${g.clave}: ${g.registros.length} registro(s) · ${formatoMoneda(g.total)}`).join("\n");
    const advertencias=[...avisos, ...problemas].join("\n");
    if(!confirm(`Se importarán ${registrosExcel.length} registro(s):\n\n${resumen}`+(advertencias?`\n\nAvisos:\n${advertencias}`:"")+"\n\nLo que ya esté guardado no se duplica. ¿Continuar?")) return;

    const boton=document.getElementById("importarExcel");
    boton.disabled=true;
    let insertados=0, omitidos=0;
    const errores=[];
    for(const [unidad_id,g] of porUnidad){
        try{
            const respuesta=await fetch(`${API}/api/viaticos/importar`,{
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body:JSON.stringify({ unidad_id, registros:g.registros })
            });
            const datos=await respuesta.json();
            if(!respuesta.ok || datos.ok===false) throw new Error(datos.mensaje||"Error al importar");
            insertados+=datos.insertados ?? g.registros.length;
            omitidos+=datos.omitidos ?? 0;
        }
        catch(error){
            console.error(error);
            errores.push(`UP ${g.clave}: ${error.message}`);
        }
    }
    boton.disabled=false;

    alert(`Importación terminada.\n\nAgregados: ${insertados}\nYa existían: ${omitidos}`+(errores.length?`\n\nNo se pudo importar:\n${errores.join("\n")}`:""));
    limpiarImportacion();
    if(typeof cerrarModal==="function") cerrarModal();
    cargarViaticos();

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

    if(!(await (window.confirmarConAsistente ? confirmarConAsistente("¿Desea eliminar este registro?") : Promise.resolve(confirm("¿Desea eliminar este registro?"))))){

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