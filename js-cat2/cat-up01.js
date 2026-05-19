/* =========================
   CATÁLOGO DE PERSONAS
========================= */

const personas = [

    "Ricardo Gomez Moreno",
    "Marlen Elva Arista Amador",
    "Dariana Olvera Mendoza",
    "Juan Alexis Garcia Garcia",
    "Mahali Vázquez Vega",
    "Emmanuel Huerta Monzalvo",
    "Sergio Eduardo Ruiz Arriaga",
    "Paul Giovanni Sanchez Nieto",
    "Susana Ruiz Reyes",
    "Jorge Alberto Vargas Romero",
    "Misael Lopez Macario",
    "Josue Raymundo Sanchez Avalos",
    "Diana Laura Fernández Monroy",
    "Esperanza Quezada Xaxni"

];

/* =========================
   CATÁLOGO DE MESES
========================= */

const meses = [

    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"

];

/* =========================
   CATÁLOGO ZONAS
========================= */

const zonasTarifa = [

    "I-I",
    "II-I",
    "II-II",
    "II-I y II",
    "III-I",
    "III-I y II",
    "III-II"

];

/* =========================
   CATÁLOGOS SPG
========================= */

const catalogoUP = [

    "01"

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

                ${persona}

            </td>

            <td style="text-align:center;">
            
                <input 
                    type="checkbox"
                    name="seleccionados"
                    value="${persona}"
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

    /* limpiar opciones repetidas */

    select.innerHTML = "";

    /* si solo hay 1 valor */

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

    /* placeholder */

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

    /* opciones */

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

    }

);