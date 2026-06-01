/* =========================
   CATÁLOGO DE PERSONAS
========================= */
const personas = [

    {
        nombre: "Manuel Enrique Aranda Montero",
        categoria: "Director General B",
        rfc: "AAMM6805233P3"
    },

    {
        nombre: "Noé Chávez Salinas",
        categoria: "Director de área B",
        rfc: "CASN780706HD5"
    },

    {
        nombre: "Patricia Hernández Lopez",
        categoria: "Director de área B",
        rfc: "HELP670306J43"
    },

    {
        nombre: "Víctor Hugo Guerrero Hernández",
        categoria: "Subdirector de área C",
        rfc: "GUHV760904GB4"
    },

    {
        nombre: "María Guadalupe Portillo Garnica",
        categoria: "Subdirectora de área C",
        rfc: "POGG741212E79"
    },

    {
        nombre: "Alejandro Ordaz Herréra",
        categoria: "Subdirector Adjunto A",
        rfc: "OAHA690413682"
    },

    {
        nombre: "Ma. Judith Ramírez Valtierra",
        categoria: "Subdirector Adjunto A",
        rfc: "RAVJ690811R21"
    },

    {
        nombre: "Raymundo Iván Govea Villanueva",
        categoria: "Subdirector Adjunto A",
        rfc: "GOVR791109CH3"
    },

    {
        nombre: "Miguel Esneyder Hernández Lugo",
        categoria: "Subdirector Adjunto A",
        rfc: "HELM860521GJA"
    },

    {
        nombre: "Valentín Cerón Pacheco",
        categoria: "Subdirector Adjunto A",
        rfc: "CEPV850214FZ7"
    },

    {
        nombre: "Oscar Hernández Jiménez",
        categoria: "Subdirector Adjunto A",
        rfc: "HEJO7610146I4"
    },

    {
        nombre: "Cecilia Araceli Destunis",
        categoria: "Jefa de Departamento C",
        rfc: "DECE810206FN9"
    },

    {
        nombre: "Grindelia Espinosa Figueroa",
        categoria: "Jefa de Área B",
        rfc: "EIFG860109782"
    },

    {
        nombre: "José Ivan Manzano Tapia",
        categoria: "Jefe de Área A",
        rfc: "MATI010210DD6"
    },

    {
        nombre: "Asucena Vergara Téllez",
        categoria: "H06 Asesor Técnico/Gestor",
        rfc: "VETA7410119G4"
    },

    {
        nombre: "Wendy Nayeli Espinosa Hernández",
        categoria: "H06 Asesor Técnico/Gestor",
        rfc: "EIHW010210MUA"
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

    "07"

];

const catalogoRubro = [

    "8402050"
];


const catalogoProyecto = [

    "AI007",
    "AI008",
    "AI009",
    "AI010"
];


const catalogoObjetoGasto = [

    "375001"

];

/* =========================
   CATÁLOGO NOMBRE PROYECTO
========================= */

const catalogoNombreProyecto = [

    "ASESORIA A PERSONAS MIGRANTES HIDALGUENSE Y SUS FAMILIAS, REALIZADAS",
    "REPRESENTACIONES DEL GOBIERNO DEL ESTADO CON ORGANIZACIONES MIGRANTES DE HIDALGUENSES EN EL EXTERIOR Y SUS FAMILIAS, ASISTIDAS",
    "APOYOS DE INVERSIÓN A PERSONAS MIGRANTES HIDALGUENSES EN EL EXTERIOR, EN RETORNO Y SUS FAMILIAS ENTREGADOS",
    "DOCUMENTACIÓN QUE COMPRUEBA LA IDENTIDD JURÍDICA A PERSONAS MIGRANTES HIDALGUENSES Y SUS FAMILIAS ENTREGADA"
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