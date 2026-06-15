/* =========================
   CATÁLOGO DE PERSONAS
========================= */
const personas = [

    {
        nombre: "Nora Aidhe Luciano Martinez",
        categoria: "Directora General B",
        rfc: "LUMN851122JA5"
    },

    {
        nombre: "Flor Nochebuena Manuel Gutierrez",
        categoria: "Directora De Área B",
        rfc: "MAGF791205QU7"
    },

    {
        nombre: "Pedro Fernando Martinez Chong",
        categoria: "Subdirector De Area C",
        rfc: "MACP630824G38"
    },

    {
        nombre: "Adriana Labra Gomez",
        categoria: "Subdirectora Adjunto A",
        rfc: "LAGA681026Q71"
    },

    {
        nombre: "Arturo Aguilar Martinez",
        categoria: "Subdirector Adjunto A",
        rfc: "AUMA710725QWA"
    },

    {
        nombre: "Itzia Hernández Ureña",
        categoria: "Subdirectora Adjunto A",
        rfc: "HEUI6908205X0"
    },

    {
        nombre: "Rosa Hernández Rodriguez",
        categoria: "Subdirectora Adjunto A",
        rfc: "HERR840304AP2"
    },

    {
        nombre: "Iván Cruz Segura",
        categoria: "Jefe De Departamento C",
        rfc: "CUSI950421819"
    }

];
/* =========================
   CATÁLOGO DE MESES
========================= */

const meses = [

    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"

];

/* =========================
   CATÁLOGOS SPG
========================= */

const catalogoUP = [

    "04"

];

const catalogoRubro = [

    "8402050"
];


const catalogoProyecto = [

    "AI003",
    "AI004"

];


const catalogoObjetoGasto = [

    "375001"

];

/* =========================
   CATÁLOGO NOMBRE PROYECTO
========================= */

const catalogoNombreProyecto = [

    "Asignación de Espacios para Comercialización de Artesanias",
    "Asignación de Espacios"
];

/* =========================
   CATÁLOGO ADECUACIÓN
========================= */

const catalogoAdecuacion = [

    "ADEC-001"

];
/* =========================
   PERSONAS
========================= */

function cargarPersonas(){

    const tbody =
    document.getElementById(
        "listaPersonas"
    );

    if(!tbody){

        return;

    }

    tbody.innerHTML = "";

    personas.forEach(persona => {

        const tr =
        document.createElement(
            "tr"
        );

        tr.innerHTML = `
        
            <td>

                ${persona.nombre}

            </td>

            <td style="text-align:center;">
            
                <input 
                    type="checkbox"
                    name="seleccionados"
                    value="${persona.nombre}"
                >

            </td>
        
        `;

        tbody.appendChild(tr);

    });

}

/* =========================
   DÍAS
========================= */

function llenarDias(idSelect){

    const select =
    document.getElementById(
        idSelect
    );

    if(!select){

        return;

    }

    for(let i = 1; i <= 31; i++){

        const option =
        document.createElement(
            "option"
        );

        option.value = i;

        option.textContent = i;

        select.appendChild(option);

    }

}

/* =========================
   MESES
========================= */

function llenarMeses(idSelect){

    const select =
    document.getElementById(
        idSelect
    );

    if(!select){

        return;

    }

    meses.forEach(mes => {

        const option =
        document.createElement(
            "option"
        );

        option.value = mes;

        option.textContent = mes;

        select.appendChild(option);

    });

}

/* =========================
   AÑOS
========================= */

function llenarAnios(idSelect){

    const select =
    document.getElementById(
        idSelect
    );

    if(!select){

        return;

    }

    for(let i = 2025; i <= 2035; i++){

        const option =
        document.createElement(
            "option"
        );

        option.value = i;

        option.textContent =
        String(i).slice(2);

        select.appendChild(option);

    }

}

/* =========================
   ZONAS
========================= */

function llenarZonas(){

    const select =
    document.getElementById(
        "zona"
    );

    if(!select){

        return;

    }

    zonasTarifa.forEach(zona => {

        const option =
        document.createElement(
            "option"
        );

        option.value = zona;

        option.textContent = zona;

        select.appendChild(option);

    });

}

/* =========================
   LLENAR SELECT GENÉRICO
========================= */

function llenarSelectAutomatico(

    id,
    catalogo

){

    const select =
    document.getElementById(id);

    if(!select){

        return;

    }

    select.innerHTML = "";

    if(catalogo.length === 1){

        const option =
        document.createElement(
            "option"
        );

        option.value =
        catalogo[0];

        option.textContent =
        catalogo[0];

        option.selected = true;

        select.appendChild(option);

        return;

    }

    const placeholder =
    document.createElement(
        "option"
    );

    placeholder.value = "";

    placeholder.textContent =
    "Selecciona opción";

    select.appendChild(
        placeholder
    );

    catalogo.forEach(item => {

        const option =
        document.createElement(
            "option"
        );

        option.value = item;

        option.textContent = item;

        select.appendChild(option);

    });

}

/* =========================
   SPG
========================= */

function llenarUP(){

    llenarSelectAutomatico(

        "spgUP",
        catalogoUP

    );

}

function llenarRubros(){

    llenarSelectAutomatico(

        "spgR",
        catalogoRubro

    );

}

function llenarProyectos(){

    llenarSelectAutomatico(

        "spgPR",
        catalogoProyecto

    );

}

function llenarObjetoGasto(){

    llenarSelectAutomatico(

        "spgOG",
        catalogoObjetoGasto

    );

}

/* =========================
   FACTURA
========================= */

function llenarProyectoFactura(){

    llenarSelectAutomatico(

        "facturaProyecto",
        catalogoProyecto

    );

}

function llenarNombreProyectoFactura(){

    llenarSelectAutomatico(

        "facturaNombreProyecto",
        catalogoNombreProyecto

    );

}

function llenarAdecuacionFactura(){

    llenarSelectAutomatico(

        "facturaAdecuacion",
        catalogoAdecuacion

    );

}

/* =========================
   OFICIO 2
========================= */

function llenarProyectoOficio2(){

    llenarSelectAutomatico(

        "oficio2Proyecto",
        catalogoProyecto

    );

}

function llenarNombreProyectoOficio2(){

    llenarSelectAutomatico(

        "oficio2NombreProyecto",
        catalogoNombreProyecto

    );

}

/* =========================
   ASIGNAR OFICIO DESDE API
========================= */

function asignarOficioFactura(registro){

    const select =
    document.getElementById(
        "facturaOficio"
    );

    if(!select){

        return;

    }

    select.innerHTML = "";

    const option =
    document.createElement(
        "option"
    );

    option.value =
    registro.oficio_autorizacion_nombre || "";

    option.textContent =
    registro.oficio_autorizacion_nombre || "";

    option.selected = true;

    select.appendChild(option);

}

/* =========================
   INICIALIZAR
========================= */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        /* PERSONAS */

        if(document.getElementById("listaPersonas")){

            cargarPersonas();

        }

        /* ZONAS */

        if(document.getElementById("zona")){

            llenarZonas();

        }

        /* DÍAS */

        if(document.getElementById("diaInicio")){

            llenarDias("diaInicio");

        }

        if(document.getElementById("diaFin")){

            llenarDias("diaFin");

        }

        if(document.getElementById("diaF")){

            llenarDias("diaF");

        }

        /* MESES */

        if(document.getElementById("mes")){

            llenarMeses("mes");

        }

        if(document.getElementById("mesF")){

            llenarMeses("mesF");

        }

        /* AÑOS */

        if(document.getElementById("anoF")){

            llenarAnios("anoF");

        }

        if(document.getElementById("spgAnio")){

            llenarAnios("spgAnio");

        }

        /* SPG */

        llenarUP();

        llenarRubros();

        llenarProyectos();

        llenarObjetoGasto();

       /* FACTURA */

        llenarProyectoFactura();

        llenarNombreProyectoFactura();

        llenarAdecuacionFactura();

        /* OFICIO 2 */

        llenarProyectoOficio2();

        llenarNombreProyectoOficio2();

    }

);