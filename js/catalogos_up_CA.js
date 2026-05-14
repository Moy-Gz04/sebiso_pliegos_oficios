/* =========================
   CATÁLOGO DE PERSONAS
========================= */

const personas = [

    "ROSA LETICIA MUÑOZ CHÁVEZ",
    "ELIZABETH MARGARITA NOGUEZ ROMERO",
    "MARÍA SARA ORTIZ GONZÁLEZ",
    "ROBERTO CARLOS LÓPEZ ESTRADA",
    "ARIANA SALAS LUGO",
    "ANA BRISNA CERVANTES HIDALGO",
    "MARTHA PATRICIA BARRAGÁN GARCÍA",
    "LAURA TRINIDAD HERNÁNDEZ DÍAZ",
    "ERICK ACOSTA TÉLLEZ",
    "GABRIELA HERNÁNDEZ BUSTOS",
    "MARÍA FERNANDA GUZMÁN ESCAMILLA",
    "OSCAR ADRIÁN ESCORZA ARROYO",
    "MARÍA DEL PILAR VEGA REYES",
    "ALEJANDRO OSWALDO VILLEGAS ORTIZ",
    "VÍCTOR HUGO PÉREZ GUATI ROJO",
    "CARLOS RODRIGO ROJAS RUIZ",
    "PERLA ALELÍ BARRERA GODÍNEZ",
    "ANA LUISA BAÑOS CASTRO",
    "MAYTHE MONSERRAT ESCARELA PÉREZ",
    "CRISTHIAN OMAR CORDERO ESTRADA",
    "JUAN ÁNGEL AGUILAR MENDOZA",
    "CHRISTIAN FERNANDO VALDERRAMA URIBE",
    "ARELY LÓPEZ VARGAS",
    "ALFONSO GUDIÑO ZAMORA",
    "RUBÉN SERRANO MORALES",
    "MARY CARMEN LÓPEZ HERNÁNDEZ",
    "DIANA MUNGUÍA ALARCÓN",
    "LIZETH VIDAL CANO",
    "CARLOS CHARGOY RODRÍGUEZ",
    "VIANEY CRISTINA SOLARES MORENO",
    "FRANCISCO REYES VÁZQUEZ",
    "SUSANA JIMÉNEZ HERNÁNDEZ",
    "LUZ MARÍA LUQUE GÓMEZ",
    "MARÍA ELENA TELLO SÁNCHEZ",
    "ERNESTO MARTÍNEZ AGUILAR",
    "ANA MARÍA RODRÍGUEZ ROSALES"

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