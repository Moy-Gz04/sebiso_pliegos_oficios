const personas = [

    "Víctor Hugo Pérez Guati Rojo",
    "Carlos Rodrigo Rojas Ruiz",
    "Cristhian Omar Cordero Estrada",
    "Christian Fernando Valderrama Uribe",
    "Perla Aleli Barrera González",
    "Ana Luisa Baños Castro",
    "Maythe Monserrat Escarela Pérez",
    "Alfonso Gudiño Zamora"

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
   Claves válidas de zona/tarifa (zona-tarifa) que reconoce el
   Apps Script para calcular el viático. Ya NO se elige a mano:
   se calcula sola con el municipio y los días
   (ver calcularZonaTarifa más abajo).
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
    "Acatlán, Hgo.",
    "Acaxochitlán, Hgo.",
    "Actopan, Hgo.",
    "Ajacuba, Hgo.",
    "Almoloya, Hgo.",
    "Apan, Hgo.",
    "Arenal, Hgo.",
    "Atitalaquia, Hgo.",
    "Atotonilco de Tula, Hgo.",
    "Atotonilco el Grande, Hgo.",
    "Chapulhuacán, Hgo.",
    "Chicavasco, Hgo.",
    "Emiliano Zapata, Hgo.",
    "Epazoyucan, Hgo.",
    "Francisco I. Madero, Hgo.",
    "Huasca de Ocampo, Hgo.",
    "Ixmiquilpan, Hgo.",
    "Metepec, Hgo.",
    "Metzquititlán, Hgo.",
    "Metztitlán, Hgo.",
    "Mineral de la Reforma, Hgo.",
    "Mineral del Chico, Hgo.",
    "Mineral del Monte, Hgo.",
    "Mixquiahuala de Juárez, Hgo.",
    "Omitlán de Juárez, Hgo.",
    "Progreso de Obregón, Hgo.",
    "San Agustín Tlaxiaca, Hgo.",
    "San Salvador, Hgo.",
    "Santiago de Anaya, Hgo.",
    "Santiago Tulantepec de Lugo Guerrero, Hgo.",
    "Singuilucan, Hgo.",
    "Tepeapulco, Hgo.",
    "Tetepango, Hgo.",
    "Tezontepec de Aldama, Hgo.",
    "Tizayuca, Hgo.",
    "Tlahuelilpan, Hgo.",
    "Tlanalapa, Hgo.",
    "Tlaxcoapan, Hgo.",
    "Tolcayuca, Hgo.",
    "Tula de Allende, Hgo.",
    "Tulancingo de Bravo, Hgo.",
    "Villa de Tezontepec, Hgo.",
    "Zapotlán de Juárez, Hgo.",
    "Zempoala, Hgo."
];


/* ============================================================
   CATÁLOGO : ZONA 2
   Municipios de Hidalgo correspondientes a la zona tarifaria II.
   Se despliegan cuando la zona es "II-I", "II-II" o "II-I y II".
   ============================================================ */

const zona2 = [
    "Agua Blanca de Iturbide, Hgo.",
    "Alfajayucan, Hgo.",
    "Cardonal, Hgo.",
    "Chapantongo, Hgo.",
    "Eloxochitlán, Hgo.",
    "Juárez Hidalgo, Hgo.",
    "Tasquillo, Hgo.",
    "Tenango de Doria, Hgo.",
    "Tepeji del Río de Ocampo, Hgo.",
    "Tepetitlán, Hgo.",
    "Tianguistengo, Hgo.",
    "Zacualtipán de Ángeles, Hgo."
];

/* ============================================================
   CATÁLOGO : ZONA 3
   Municipios de Hidalgo correspondientes a la zona tarifaria III.
   Se despliegan cuando la zona es "III-I", "III-I y II" o "III-II".
   ============================================================ */

const zona3 = [
    "Atlapexco, Hgo.",
    "Calnali, Hgo.",
    "Chapulhuacán, Hgo.",
    "Huautla, Hgo.",
    "Huazalingo, Hgo.",
    "Huejutla de Reyes, Hgo.",
    "Huehuetla, Hgo.",
    "Huichapan, Hgo.",
    "Jacala de Ledezma, Hgo.",
    "Jaltocán, Hgo.",
    "Lolotla, Hgo.",
    "La Misión, Hgo.",
    "Molango de Escamilla, Hgo.",
    "Nicolás Flores, Hgo.",
    "Nopala de Villagrán, Hgo.",
    "San Felipe Orizatlán, Hgo.",
    "Pacula, Hgo.",
    "Pisaflores, Hgo.",
    "San Bartolo Tutotepec, Hgo.",
    "Tecozautla, Hgo.",
    "Tepehuacán de Guerrero, Hgo.",
    "Tlahuiltepa, Hgo.",
    "Tlanchinol, Hgo.",
    "Xochiatipan, Hgo.",
    "Xochicoatlán, Hgo.",
    "Yahualica, Hgo.",
    "Zimapán, Hgo."
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
   MUNICIPIOS CON SU ZONA
   Une los tres catálogos (zona1, zona2, zona3) en UNA sola lista
   ordenada alfabéticamente. Cada municipio conserva su zona (I, II
   o III), que es la que se usa para calcular "Zona y Tarifa".

   Si un mismo municipio aparece en más de un catálogo (hoy pasa con
   Chapulhuacán), se lista una vez por zona con la zona entre
   paréntesis, para que se elija la correcta; el valor que se envía
   sigue siendo solo el nombre del municipio.
   ============================================================ */

const municipiosConZona = (function(){

    const entradas = [];

    [["I", zona1], ["II", zona2], ["III", zona3]].forEach(par => {
        par[1].forEach(nombre => entradas.push({ nombre: nombre, zona: par[0] }));
    });

    const veces = {};
    entradas.forEach(e => { veces[e.nombre] = (veces[e.nombre] || 0) + 1; });

    return entradas
        .map(e => ({ nombre: e.nombre, zona: e.zona, repetido: veces[e.nombre] > 1 }))
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre, "es") ||
            a.zona.localeCompare(b.zona)
        );

})();


/* ============================================================
   FUNCIÓN : llenarMunicipios
   Llena el <select id="municipio"> (oculto) con TODOS los municipios,
   una <option> por municipio y zona (Chapulhuacán aparece en dos
   zonas). Cada <option> guarda su zona en data-zona. Es el campo que
   viaja en el formulario; la pantalla lo maneja con los botones de
   zona (ver seleccionarMunicipio).
   ============================================================ */

function llenarMunicipios(){

    const select =
    document.getElementById("municipio");

    select.innerHTML = "";

    municipiosConZona.forEach(m => {

        const option =
        document.createElement("option");

        option.value = m.nombre;
        option.dataset.zona = m.zona;
        option.textContent = m.nombre + " (zona " + m.zona + ")";

        select.appendChild(option);

    });

}


/* ============================================================
   MUNICIPIO POR ZONA (botones que se despliegan)
   Cada botón "Zona I / II / III" abre una lista con SUS municipios;
   solo se puede elegir uno (el elegido reemplaza al anterior).

   La lista es un panel único con position:fixed (no se corta con el
   overflow de la tarjeta) que se coloca debajo del botón pulsado.
   ============================================================ */

let panelZona = null;
let zonaAbierta = null;

function crearPanelZona(){

    panelZona = document.createElement("div");
    panelZona.className = "panel-zona";
    panelZona.setAttribute("role", "listbox");
    panelZona.hidden = true;
    document.body.appendChild(panelZona);

}

function cerrarPanelZona(){

    if(!panelZona || panelZona.hidden) return;

    panelZona.hidden = true;

    document.querySelectorAll(".chip-zona").forEach(btn => {
        btn.setAttribute("aria-expanded", "false");
    });

    zonaAbierta = null;

}

function abrirPanelZona(boton){

    const zona = boton.dataset.zona;

    /* Pulsar otra vez el mismo botón lo cierra */
    if(zonaAbierta === zona){
        cerrarPanelZona();
        return;
    }

    cerrarPanelZona();

    const select = document.getElementById("municipio");
    const actual = select.selectedOptions[0];

    panelZona.innerHTML = "";

    const cabecera = document.createElement("div");
    cabecera.className = "cabecera-panel";
    cabecera.textContent = "Zona " + zona + " · municipios";
    panelZona.appendChild(cabecera);

    municipiosConZona
    .filter(m => m.zona === zona)
    .forEach(m => {

        const item = document.createElement("button");

        item.type = "button";
        item.className = "item-municipio";
        item.setAttribute("role", "option");
        item.textContent = m.nombre;

        const esActual =
            actual && actual.value === m.nombre && actual.dataset.zona === m.zona;

        if(esActual) item.classList.add("seleccionado");

        item.addEventListener("click", function(){

            seleccionarMunicipio(m.nombre, m.zona);
            cerrarPanelZona();

        });

        panelZona.appendChild(item);

    });

    /* Colocar el panel justo debajo del botón, sin salirse de la pantalla */
    const r = boton.getBoundingClientRect();

    panelZona.hidden = false;
    panelZona.style.top  = Math.round(r.bottom + 6) + "px";
    panelZona.style.left = Math.round(
        Math.max(8, Math.min(r.left, window.innerWidth - panelZona.offsetWidth - 8))
    ) + "px";

    boton.setAttribute("aria-expanded", "true");
    zonaAbierta = zona;

    /* Llevar la vista al municipio actual si está en esta zona */
    const sel = panelZona.querySelector(".seleccionado");
    if(sel) sel.scrollIntoView({ block: "nearest" });

}


/* ============================================================
   FUNCIÓN : seleccionarMunicipio
   Fija el municipio (y con él su zona): actualiza el <select>
   oculto que viaja en el formulario, el texto "Municipio elegido",
   marca el botón de la zona a la que pertenece y recalcula
   Zona y Tarifa.
   ============================================================ */

function seleccionarMunicipio(nombre, zona){

    const select = document.getElementById("municipio");

    const indice = [...select.options].findIndex(o =>
        o.value === nombre && o.dataset.zona === zona
    );

    if(indice < 0) return;

    select.selectedIndex = indice;

    document.getElementById("municipioElegido").textContent = nombre;

    document.querySelectorAll(".chip-zona").forEach(btn => {
        btn.classList.toggle("activo", btn.dataset.zona === zona);
    });

    calcularZonaTarifa();

}


/* ============================================================
   FUNCIÓN : calcularZonaTarifa
   Calcula el campo bloqueado "Zona y Tarifa" (id="zona"):

     ZONA   → depende del MUNICIPIO (I, II o III, según su catálogo).
     TARIFA → depende de los DÍAS de la comisión
              (días = día fin - día inicio + 1):
                1 día        → tarifa "I"        (ej. del 4 al 4)
                2 días o más → tarifa "I y II"   (ej. del 4 al 5)

   La clave resultante es "zona-tarifa" (ej. "II-I", "III-I y II"),
   la misma que antes se elegía a mano y que recibe el Apps Script.

   Si la combinación no existe entre las claves válidas
   (zonasTarifa) —hoy la zona I solo tiene "I-I"— se usa la clave
   válida "I-I" y se avisa en el texto de ayuda.
   ============================================================ */

function calcularZonaTarifa(){

    const campo   = document.getElementById("zona");
    const detalle = document.getElementById("detalleZona");
    const opcion  = document.getElementById("municipio").selectedOptions[0];

    const inicio = Number(document.getElementById("diaInicio").value);
    const fin    = Number(document.getElementById("diaFin").value);
    const dias   = fin - inicio + 1;

    detalle.classList.remove("aviso");

    if(dias < 1 || !inicio || !fin){

        campo.value = "";
        detalle.textContent =
        "Revisa los días: el día fin no puede ser menor que el día inicio.";
        detalle.classList.add("aviso");
        return;

    }

    if(!opcion){

        campo.value = "";
        detalle.textContent = "Elige un municipio.";
        return;

    }

    const zona   = opcion.dataset.zona;
    const tarifa = (dias === 1) ? "I" : "I y II";

    let clave = zona + "-" + tarifa;
    let nota  = "Zona " + zona + " · tarifa " + tarifa +
                " (" + dias + (dias === 1 ? " día" : " días") + ")";

    if(!zonasTarifa.includes(clave)){

        /* Combinación sin clave válida (zona I con 2 o más días) */
        clave = zona + "-I";
        nota  = "Zona " + zona + " · solo aplica tarifa I (" + dias + " días)";

    }

    campo.value = clave;
    detalle.textContent = nota;

}


/* ============================================================
   CALENDARIOS DE LA COMISIÓN
   "Día inicio" y "Día fin" son calendarios (input date). De ellos
   se llenan solos los campos que usa el resto del sistema:
     diaInicio / diaFin → número de día (1-31), como antes
     mes                → nombre del mes de la fecha de inicio

   Una comisión es de un solo mes (el sistema maneja un solo "mes"),
   así que el calendario de fin solo permite del inicio al último día
   de ese mismo mes. Si el inicio se mueve y el fin queda fuera de
   rango, el fin se iguala al inicio.
   ============================================================ */

function dosDigitos(n){ return String(n).padStart(2, "0"); }

function hoyISO(){

    const d = new Date();
    return d.getFullYear() + "-" + dosDigitos(d.getMonth() + 1) + "-" + dosDigitos(d.getDate());

}

function actualizarFechasComision(){

    const iniEl = document.getElementById("fechaInicio");
    const finEl = document.getElementById("fechaFin");

    if(!iniEl.value) iniEl.value = hoyISO();

    const partes = iniEl.value.split("-").map(Number);
    const anio = partes[0], mes = partes[1], dia = partes[2];

    const ultimoDia = new Date(anio, mes, 0).getDate();
    const maximo = anio + "-" + dosDigitos(mes) + "-" + dosDigitos(ultimoDia);

    finEl.min = iniEl.value;
    finEl.max = maximo;

    if(!finEl.value || finEl.value < iniEl.value || finEl.value > maximo){
        finEl.value = iniEl.value;
    }

    document.getElementById("diaInicio").value = dia;
    document.getElementById("diaFin").value    = Number(finEl.value.split("-")[2]);
    document.getElementById("mes").value       = meses[mes - 1];

    calcularZonaTarifa();

}


/* ============================================================
   INICIALIZACIÓN
   Se ejecuta al cargar el script. Orden de captura:
     1. Municipio  → define la zona (botones de zona desplegables)
     2. Días       → definen la tarifa (calendarios); el mes sale solo
     3. Zona y Tarifa se calcula sola (campo bloqueado)
   ============================================================ */

/* Tabla de personas con checkboxes */
cargarPersonas();

/* Municipios (campo oculto que viaja en el formulario) */
llenarMunicipios();

/* Fecha del oficio (sigue siendo con selects) */
const fechaOficioEl = document.getElementById("fechaOficio");
fechaOficioEl.value = hoyISO();

function actualizarFechaOficio(){
    if(!fechaOficioEl.value) fechaOficioEl.value = hoyISO();
    const p = fechaOficioEl.value.split("-").map(Number);
    document.getElementById("diaF").value = p[2];
    document.getElementById("mesF").value = meses[p[1] - 1];
    document.getElementById("anoF").value = p[0];
}
fechaOficioEl.addEventListener("change", actualizarFechaOficio);
actualizarFechaOficio();

/* Panel desplegable de municipios y sus botones de zona */
crearPanelZona();

document.querySelectorAll(".chip-zona").forEach(btn => {

    btn.addEventListener("click", function(e){

        e.stopPropagation();
        abrirPanelZona(this);

    });

});

/* Cerrar el panel al pulsar fuera, con Escape, al hacer scroll o al cambiar el tamaño */
document.addEventListener("click", function(e){

    if(panelZona && !panelZona.hidden && !panelZona.contains(e.target)){
        cerrarPanelZona();
    }

});

document.addEventListener("keydown", function(e){

    if(e.key === "Escape") cerrarPanelZona();

});

/* En móvil, al deslizar la lista la barra del navegador cambia el alto y dispara "resize": solo se cierra si cambió el ancho */
let anchoPrevio = window.innerWidth;
window.addEventListener("resize", function(){
    if(window.innerWidth !== anchoPrevio){ anchoPrevio = window.innerWidth; cerrarPanelZona(); }
});
/* El scroll DENTRO de la lista no debe cerrarla; solo el de la página */
window.addEventListener("scroll", function(e){
    if(panelZona && panelZona.contains(e.target)) return;
    cerrarPanelZona();
}, true);

/* Calendarios de la comisión: por defecto, hoy */
const fechaInicioEl = document.getElementById("fechaInicio");
const fechaFinEl    = document.getElementById("fechaFin");

fechaInicioEl.value = hoyISO();
fechaFinEl.value    = hoyISO();

fechaInicioEl.addEventListener("change", actualizarFechasComision);
fechaFinEl.addEventListener("change", actualizarFechasComision);

/* Municipio inicial (el primero de la lista) y cálculo inicial */
seleccionarMunicipio(
    municipiosConZona[0].nombre,
    municipiosConZona[0].zona
);

actualizarFechasComision();
