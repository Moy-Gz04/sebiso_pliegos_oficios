/* =========================
   CATÁLOGO DE PERSONAS
========================= */
const personas = [

    {
        nombre: "Mtro. Juan Roberto Lazcano Trejo",
        categoria: "Subsecretario de Inclusión y Desarrollo",
        rfc: "LATJ960504559"
    },

    {
        nombre: "Mtro. Edgar Missael Montoya Rubio",
        categoria: "Director de Área B",
        rfc: "MORE950222M54"
    },

    {
        nombre: "Mtra. Lizeth Vargas Juárez",
        categoria: "Directora de Área",
        rfc: "VAJL780803JX9"
    },

    {
        nombre: "Lic. Elizabeth Martínez Hernández",
        categoria: "Subdirector de Área C",
        rfc: "MAHE870912JH4"
    },

    {
        nombre: "Lic. Alfonso Fernandez Moreno",
        categoria: "Subdirector de Área C",
        rfc: "FEMA820530D89"
    },

    {
        nombre: "Ing. Isauro Márquez Trejo",
        categoria: "Subdirector de Área C",
        rfc: "MATI9509035X2"
    },

    {
        nombre: "Lic. Tania Yeraldin Lara Hernández",
        categoria: "Subdirector de Área A",
        rfc: "LAHT000830L22"
    },

    {
        nombre: "Ing. Marlene Jiménez Ramírez",
        categoria: "Jefe de Departamento C",
        rfc: "JIRM840919DX1"
    },

    {
        nombre: "Lic. Ariadna Ramírez Hernández",
        categoria: "Jefe de Unidad de Proyectos",
        rfc: "RAHA791230MQ7"
    },

    {
        nombre: "Lic. Daena Gaudalupe Acosta Hernández",
        categoria: "Jefe de Área A",
        rfc: "AOHD011206GZ6"
    },

    {
        nombre: "Lic. Reyna Bautista Granados",
        categoria: "Jefe de Área B",
        rfc: "BAGR760130R94"
    },

    {
        nombre: "L.A.S.C. Julio Cesar Granados Colmenares",
        categoria: "Supervisor/Analista",
        rfc: "GACJ800412KT1"
    },

    {
        nombre: "C. Viridiana Barraza Cortez",
        categoria: "Asesor Técnico/Gestor",
        rfc: "BACV901211PP3"
    },

    {
        nombre: "Ing. Ana Gabriela Gutiérrez Gamero",
        categoria: "Asesor Técnico/Gestor",
        rfc: "GUGA980227471"
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

    "05"

];

const catalogoRubro = [

    "8402050"
];


const catalogoProyecto = [

    "AI005"

];


const catalogoObjetoGasto = [

    "375001"

];

/* =========================
   CATÁLOGO NOMBRE PROYECTO
========================= */

const catalogoNombreProyecto = [

    "Acciones para Fortalecer el Sector Desarrollo Social para el Bienestar"
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