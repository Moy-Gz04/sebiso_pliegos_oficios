/* =========================
   CATÁLOGO DE PERSONAS
========================= */
const personas = [

    {
        nombre: "L.A.P. Jorge Miguel García Vázquez",
        categoria: "Director General de Servidores del Pueblo",
        rfc: "GAVJ7209293L0"
    },

    {
        nombre: "Maribel Molina Hernández",
        categoria: "Director de Área",
        rfc: "MOHM730206472"
    },

    {
        nombre: "José Luis González Martínez",
        categoria: "Director de Área",
        rfc: "GOML731201BVA"
    },

    {
        nombre: "Alelí Gutiérrez García",
        categoria: "Jefe de Departamento",
        rfc: "GUGA8604122W4"
    },

    {
        nombre: "Francisca Hernández Monroy",
        categoria: "Jefe de Departamento",
        rfc: "HEMF71012967A"
    },

    {
        nombre: "Erick Espinosa Lorenzo",
        categoria: "Jefe de Departamento",
        rfc: "EILE890901FH6"
    },

    {
        nombre: "Luis Eumir Pérez Juárez",
        categoria: "Jefe de Departamento",
        rfc: "PEJL770623KJA"
    },

    {
        nombre: "Rosa María Pérez García",
        categoria: "Jefe de Departamento",
        rfc: "PEGR800119V78"
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

    "16"

];

const catalogoRubro = [

    "8402050"
];


const catalogoProyecto = [

    "AI017"
];


const catalogoObjetoGasto = [

    "375001"

];

/* =========================
   CATÁLOGO NOMBRE PROYECTO
========================= */

const catalogoNombreProyecto = [

    "Gastos Operativos de Servidores del Pueblo"

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