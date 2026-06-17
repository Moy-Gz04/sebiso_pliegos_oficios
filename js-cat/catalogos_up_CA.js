const personas = [

    "Rosa Leticia Muñoz Chávez",
    "Elizabeth Margarita Noguez Romero",
    "María Sara Ortiz González",
    "Roberto Carlos López Estrada",
    "Ariana Salas Lugo",
    "Ana Brisna Cervantes Hidalgo",
    "Martha Patricia Barragán García",
    "Laura Trinidad Hernández Díaz",
    "Erick Acosta Téllez",
    "Gabriela Hernández Bustos",
    "María Fernanda Guzmán Escamilla",
    "Oscar Adrián Escorza Arroyo",
    "María del Pilar Vega Reyes",
    "Alejandro Oswaldo Villegas Ortiz",
    "Víctor Hugo Pérez Guatirojo",
    "Carlos Rodrigo Rojas Ruiz",
    "Perla Aleli Barrera Godínez",
    "Ana Luisa Baños Castro",
    "Maythe Monserrat Escarela Pérez",
    "Cristhian Omar Cordero Estrada",
    "Juan Ángel Aguilar Mendoza",
    "Christian Fernando Valderrama Uribe",
    "Arely López Vargas",
    "Alfonso Gudiño Zamora",
    "Rubén Serrano Morales",
    "Mary Carmen López Hernández",
    "Diana Munguía Alarcón",
    "Lizeth Vidal Cano",
    "Carlos Chargoy Rodríguez",
    "Vianey Cristina Solares Moreno",
    "Francisco Reyes Vázquez",
    "Susana Jiménez Hernández",
    "Luz María Luque Gómez",
    "María Elena Tello Sánchez",
    "Ernesto Martínez Aguilar",
    "Ana María Rodríguez Rosales"

];


/* ============================================================
   CATÁLOGO : MESES
   Nombres de los meses en español para los selects de fecha.
   ============================================================ */

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


/* ============================================================
   CATÁLOGO : ZONAS Y TARIFAS
   Claves de zona/tarifa que determina el viático correspondiente.
   También controla qué catálogo de municipios se carga
   (ver función llenarMunicipios más abajo).

   Regla de municipios:
     "I-I"              → zona1
     "II-I","II-II",
     "II-I y II"        → zona2
     Cualquier otro     → zona3
   ============================================================ */

const zonasTarifa = [
    "I-I",
    "II-I",
    "II-II",
    "II-I y II",
    "III-I",
    "III-I y II",
    "III-II"
];


/* ============================================================
   CATÁLOGO : ZONA 1
   Municipios de Hidalgo correspondientes a la zona tarifaria I.
   Se despliegan cuando la zona seleccionada es "I-I".
   ============================================================ */

const zona1 = [
    "Acatlán, Hidalgo",
    "Acaxochitlán, Hidalgo",
    "Actopan, Hidalgo",
    "Ajacuba, Hidalgo",
    "Almoloya, Hidalgo",
    "Apan, Hidalgo",
    "Arenal, Hidalgo",
    "Atitalaquia, Hidalgo",
    "Atotonilco de Tula, Hidalgo",
    "Atotonilco el Grande, Hidalgo",
    "Chapulhuacán, Hidalgo",
    "Chicavasco, Hidalgo",
    "Emiliano Zapata, Hidalgo",
    "Epazoyucan, Hidalgo",
    "Francisco I. Madero, Hidalgo",
    "Huasca de Ocampo, Hidalgo",
    "Ixmiquilpan, Hidalgo",
    "Metepec, Hidalgo",
    "Metzquititlán, Hidalgo",
    "Metztitlán, Hidalgo",
    "Mineral de la Reforma, Hidalgo",
    "Mineral del Chico, Hidalgo",
    "Mineral del Monte, Hidalgo",
    "Mixquiahuala de Juárez, Hidalgo",
    "Omitlán de Juárez, Hidalgo",
    "Progreso de Obregón, Hidalgo",
    "San Agustín Tlaxiaca, Hidalgo",
    "San Salvador, Hidalgo",
    "Santiago de Anaya, Hidalgo",
    "Santiago Tulantepec de Lugo Guerrero, Hidalgo",
    "Singuilucan, Hidalgo",
    "Tepeapulco, Hidalgo",
    "Tetepango, Hidalgo",
    "Tezontepec de Aldama, Hidalgo",
    "Tizayuca, Hidalgo",
    "Tlahuelilpan, Hidalgo",
    "Tlanalapa, Hidalgo",
    "Tlaxcoapan, Hidalgo",
    "Tolcayuca, Hidalgo",
    "Tula de Allende, Hidalgo",
    "Tulancingo de Bravo, Hidalgo",
    "Villa de Tezontepec, Hidalgo",
    "Zapotlán de Juárez, Hidalgo",
    "Zempoala, Hidalgo"
];


/* ============================================================
   CATÁLOGO : ZONA 2
   Municipios de Hidalgo correspondientes a la zona tarifaria II.
   Se despliegan cuando la zona es "II-I", "II-II" o "II-I y II".
   ============================================================ */

const zona2 = [
    "Agua Blanca de Iturbide, Hidalgo",
    "Alfajayucan, Hidalgo",
    "Cardonal, Hidalgo",
    "Chapantongo, Hidalgo",
    "Eloxochitlán, Hidalgo",
    "Juárez Hidalgo, Hidalgo",
    "Tasquillo, Hidalgo",
    "Tenango de Doria, Hidalgo",
    "Tepeji del Río de Ocampo, Hidalgo",
    "Tepetitlán, Hidalgo",
    "Tianguistengo, Hidalgo",
    "Zacualtipán de Ángeles, Hidalgo"
];


/* ============================================================
   CATÁLOGO : ZONA 3
   Municipios de Hidalgo correspondientes a la zona tarifaria III.
   Se despliegan cuando la zona es "III-I", "III-I y II" o "III-II".
   ============================================================ */

const zona3 = [
    "Atlapexco, Hidalgo",
    "Calnali, Hidalgo",
    "Chapulhuacán, Hidalgo",
    "Huautla, Hidalgo",
    "Huazalingo, Hidalgo",
    "Huejutla de Reyes, Hidalgo",
    "Huehuetla, Hidalgo",
    "Huichapan, Hidalgo",
    "Jacala de Ledezma, Hidalgo",
    "Jaltocán, Hidalgo",
    "Lolotla, Hidalgo",
    "La Misión, Hidalgo",
    "Molango de Escamilla, Hidalgo",
    "Nicolás Flores, Hidalgo",
    "Nopala de Villagrán, Hidalgo",
    "San Felipe Orizatlán, Hidalgo",
    "Pacula, Hidalgo",
    "Pisaflores, Hidalgo",
    "San Bartolo Tutotepec, Hidalgo",
    "Tecozautla, Hidalgo",
    "Tepehuacán de Guerrero, Hidalgo",
    "Tlahuiltepa, Hidalgo",
    "Tlanchinol, Hidalgo",
    "Xochiatipan, Hidalgo",
    "Xochicoatlán, Hidalgo",
    "Yahualica, Hidalgo",
    "Zimapán, Hidalgo"
];


/* ============================================================
   FUNCIÓN : cargarPersonas
   Renderiza la tabla de personas con un checkbox por fila.
   Cada checkbox lleva el nombre completo como value para
   que el FormData lo envíe correctamente al Apps Script.
   ============================================================ */

function cargarPersonas(){

    const tbody =
    document.getElementById("listaPersonas");

    personas.forEach(persona => {

        const tr =
        document.createElement("tr");

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


/* ============================================================
   FUNCIÓN : llenarDias
   Llena un <select> con los días del 1 al 31.
   @param {string} idSelect - ID del elemento <select> a llenar.
   ============================================================ */

function llenarDias(idSelect){

    const select =
    document.getElementById(idSelect);

    for(let i = 1; i <= 31; i++){

        const option =
        document.createElement("option");

        option.value = i;
        option.textContent = i;

        select.appendChild(option);

    }

}


/* ============================================================
   FUNCIÓN : llenarMeses
   Llena un <select> con los 12 meses en español.
   @param {string} idSelect - ID del elemento <select> a llenar.
   ============================================================ */

function llenarMeses(idSelect){

    const select =
    document.getElementById(idSelect);

    meses.forEach(mes => {

        const option =
        document.createElement("option");

        option.value = mes;
        option.textContent = mes;

        select.appendChild(option);

    });

}


/* ============================================================
   FUNCIÓN : llenarAnios
   Llena un <select> con años del 2025 al 2035.
   @param {string} idSelect - ID del elemento <select> a llenar.
   ============================================================ */

function llenarAnios(idSelect){

    const select =
    document.getElementById(idSelect);

    for(let i = 2025; i <= 2035; i++){

        const option =
        document.createElement("option");

        option.value = i;
        option.textContent = i;

        select.appendChild(option);

    }

}


/* ============================================================
   FUNCIÓN : llenarZonas
   Llena el <select id="zona"> con las claves de zonasTarifa.
   ============================================================ */

function llenarZonas(){

    const select =
    document.getElementById("zona");

    zonasTarifa.forEach(zona => {

        const option =
        document.createElement("option");

        option.value = zona;
        option.textContent = zona;

        select.appendChild(option);

    });

}


/* ============================================================
   FUNCIÓN : llenarMunicipios
   Llena el <select id="municipio"> según la zona tarifaria
   actualmente seleccionada, aplicando la siguiente regla:

     "I-I"              → zona1 (44 municipios)
     "II-I","II-II",
     "II-I y II"        → zona2 (12 municipios)
     Cualquier otro     → zona3 (27 municipios)

   Limpia el select antes de cada llenado para evitar
   duplicados al cambiar de zona.

   @param {string} zonaSeleccionada - Value del select de zona.
   ============================================================ */

function llenarMunicipios(zonaSeleccionada){

    const select =
    document.getElementById("municipio");

    /* Limpiar opciones previas */
    select.innerHTML = "";

    /* Seleccionar catálogo según zona */
    let catalogo = [];

    if(zonaSeleccionada === "I-I"){

        catalogo = zona1;

    } else if(
        zonaSeleccionada === "II-I"    ||
        zonaSeleccionada === "II-II"   ||
        zonaSeleccionada === "II-I y II"
    ){

        catalogo = zona2;

    } else {

        /* III-I, III-I y II, III-II */
        catalogo = zona3;

    }

    /* Renderizar opciones */
    catalogo.forEach(municipio => {

        const option =
        document.createElement("option");

        option.value = municipio;
        option.textContent = municipio;

        select.appendChild(option);

    });

}


/* ============================================================
   INICIALIZACIÓN
   Se ejecuta al cargar el script. Llena todos los selects
   del formulario con sus catálogos correspondientes.
   El select de municipios se llena con la zona por defecto
   y se suscribe al evento change del select de zona para
   actualizarse automáticamente al cambiar de zona.
   ============================================================ */

/* Tabla de personas con checkboxes */
cargarPersonas();

/* Select de zona y tarifa */
llenarZonas();

/* Selects de días (comisión e inicio) */
llenarDias("diaInicio");
llenarDias("diaFin");
llenarDias("diaF");

/* Selects de meses (comisión y oficio) */
llenarMeses("mes");
llenarMeses("mesF");

/* Select de año del oficio */
llenarAnios("anoF");

/* Select de municipio — carga inicial con zona por defecto */
llenarMunicipios(
    document.getElementById("zona").value
);

/* Actualizar municipios cada vez que cambie la zona */
document.getElementById("zona")
.addEventListener("change", function(){

    llenarMunicipios(this.value);

});
