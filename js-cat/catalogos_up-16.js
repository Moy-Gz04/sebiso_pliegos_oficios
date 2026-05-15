/* =========================
   CATÁLOGO DE PERSONAS
========================= */

const personas = [

    "L.A.P. Jorge Miguel García Vázquez",
    "Maribel Molina Hernández",
    "José Luis González Martínez",
    "Alelí Gutiérrez García",
    "Francisca Hernández Monroy",
    "Erick Espinosa Lorenzo",
    "Luis Eumir Pérez Juárez",
    "Rosa María Pérez García"

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
   CATÁLOGO DE ZONA Y TARIFA 
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
   GENERAR PERSONAS
========================= */

function cargarPersonas(){

    const tbody = document.getElementById("listaPersonas");

    personas.forEach(persona => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
        
            <td>${persona}</td>

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
   GENERAR DÍAS
========================= */

function llenarDias(idSelect){

    const select = document.getElementById(idSelect);

    for(let i = 1; i <= 31; i++){

        const option = document.createElement("option");

        option.value = i;
        option.textContent = i;

        select.appendChild(option);

    }

}

/* =========================
   GENERAR MESES
========================= */

function llenarMeses(idSelect){

    const select = document.getElementById(idSelect);

    meses.forEach(mes => {

        const option = document.createElement("option");

        option.value = mes;
        option.textContent = mes;

        select.appendChild(option);

    });

}

/* =========================
   GENERAR AÑOS
========================= */

function llenarAnios(idSelect){

    const select = document.getElementById(idSelect);

    for(let i = 2025; i <= 2035; i++){

        const option = document.createElement("option");

        option.value = i;
        option.textContent = i;

        select.appendChild(option);

    }

}

/* =========================
   GENERAR ZONA Y TARIFA
========================= */
function llenarZonas(){

    const select = document.getElementById("zona");

    zonasTarifa.forEach(zona => {

        const option = document.createElement("option");

        option.value = zona;
        option.textContent = zona;

        select.appendChild(option);

    });

}
/* =========================
   INICIALIZAR
========================= */

cargarPersonas();
llenarZonas();

/* DÍAS */

llenarDias("diaInicio");
llenarDias("diaFin");
llenarDias("diaF");

/* MESES */

llenarMeses("mes");
llenarMeses("mesF");

/* AÑOS */

llenarAnios("anoF");