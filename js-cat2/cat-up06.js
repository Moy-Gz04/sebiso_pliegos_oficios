/* =========================
   CATÁLOGO DE PERSONAS
========================= */

/* =========================
   CATÁLOGO DE MESES
========================= */

const personas = [

    {
        nombre: "Mtro. Alejandro Salinas Ayotitla",
        categoria: "Director General B",
        rfc: "SAAA860325S81"
    },

    {
        nombre: "Ing. Cesar Lozano López",
        categoria: "Subdirector de área C",
        rfc: "LOLC7304019L3"
    },

    {
        nombre: "Lic. Agustin Misael Velazquez Monroy",
        categoria: "Jefe de unidad de proyectos",
        rfc: "VEMA820217DU6"
    },

    {
        nombre: "Lic. Nestor Martin Castillo Ventura",
        categoria: "Subdirector de área C",
        rfc: "CAVN9201107E8"
    },

    {
        nombre: "C. Juan Espinoza Islas",
        categoria: "Subdirector Adjunto",
        rfc: "EIIJ5911125P5"
    },

    {
        nombre: "C. Guillermo Ayala Parra",
        categoria: "Subdirector Adjunto",
        rfc: "AAPG681005N62"
    },

    {
        nombre: "M.C.C. Carlos Abundio Contreras González",
        categoria: "Jefe de unidad de proyectos",
        rfc: "COGC7709151X2"
    },

    {
        nombre: "Ing. Javier Ortiz Nochebuena",
        categoria: "Subdirector de area A",
        rfc: "OINJ950706952"
    },

    {
        nombre: "Lic. Maricela Martínez Hernández",
        categoria: "Supervisor/Analista",
        rfc: "MAHM6103262A4"
    },

    {
        nombre: "Ing. Leopoldo Lagarde González",
        categoria: "Jefe de área B",
        rfc: "LAGL750504DV3"
    },

    {
        nombre: "C. Emma Sharai Mejia Garcia",
        categoria: "Jefe de área B",
        rfc: "MEGE850109U22"
    },

    {
        nombre: "C. María de La Luz Téllez Sánchez",
        categoria: "Jefe de Área A",
        rfc: "TESL8205266U1"
    },

    {
        nombre: "C. Luz Juliana Bautista Duran",
        categoria: "Jefe de Área A",
        rfc: "BADL830905P80"
    },

    {
        nombre: "L.P.Griselda Yareli Gutierrez Cano",
        categoria: "Tecnico especializado",
        rfc: "GUCG921018Q22"
    },

    {
        nombre: "LIC. Ema Roza Roa Jiménez",
        categoria: "Asesor Técnico/Gestor A",
        rfc: "ROJE680829M74"
    },

    {
        nombre: "Ing. Antonio de Jesus Cruz Romero",
        categoria: "Supervisor/Analista",
        rfc: "CURA9703288P1"
    },

    {
        nombre: "Lic. Axel Armando Huerta Guarneros",
        categoria: "Supervisor/Analista",
        rfc: "HUGA040531CH3"
    },

    {
        nombre: "Tec. Ana Maria Martinez Rubio",
        categoria: "Tecnico especializado",
        rfc: "MARA8305208R4"
    },

    {
        nombre: "Lic.Danna Odemaris Fuentes Olguin",
        categoria: "Tecnico especializado",
        rfc: "FUOD010531Q28"
    }

];

/* =========================
   CATÁLOGOS SPG
========================= */

const catalogoUP = [

    "06"

];

const catalogoRubro = [

    "8402050"
];


const catalogoProyecto = [

    "AI006"

];


const catalogoObjetoGasto = [

    "375001"

];

/* =========================
   CATÁLOGO NOMBRE PROYECTO
========================= */

const catalogoNombreProyecto = [

    "Actividades en el proceso administrativo en las acciones de operación y logiística de programas"
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