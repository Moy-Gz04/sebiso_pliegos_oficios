const paginaActual =
window.location.pathname
.split("/")
.pop();

/* =========================
   PAGINAS
========================= */

const PAGINAS = [

    {
        nombre:"Inicio",
        ruta:"../p-up/UP-04.html"
    },

    {
        nombre:"Registros",
        ruta:"../h-up/R_UP-04.html"
    },

    {
        nombre:"Presupuesto",
        ruta:"../vistas-p/vista_up04.html"
    },

    {
        nombre:"Viáticos",
        ruta:"../vistas-v/viaticos_up04.html"
    },
];

/* =========================
   ÍCONOS DEL MENÚ
========================= */

const ICONOS_MENU = {

    "Inicio": `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9.5 12 3l9 6.5"/>
            <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>
        </svg>
    `,

    "Registros": `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="2"/>
            <path d="M9 3v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3"/>
            <line x1="8" y1="11" x2="16" y2="11"/>
            <line x1="8" y1="15" x2="16" y2="15"/>
        </svg>
    `,

    "Presupuesto": `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="6" width="18" height="13" rx="2"/>
            <path d="M3 10h18"/>
            <circle cx="16.5" cy="14.5" r="1.5"/>
        </svg>
    `,

    "Viáticos": `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="7" width="18" height="13" rx="2"/>
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
        </svg>
    `

};

/* =========================
   GENERAR BOTONES
========================= */

const botonesMenu =

PAGINAS.map((pagina) => {

    const nombreArchivo =

    pagina.ruta
    .split("/")
    .pop();

    return `

        <button
            type="button"

            title="${pagina.nombre}"

            class="menu-btn ${

                paginaActual === nombreArchivo

                ?

                "activo"

                :

                ""

            }"

            onclick="
                window.location.href='${pagina.ruta}'
            "
        >

            <span class="menu-btn-icono">
                ${ICONOS_MENU[pagina.nombre] || ""}
            </span>

            <span class="menu-btn-texto">
                ${pagina.nombre}
            </span>

        </button>

    `;

}).join("");

/* =========================
   SIDEBAR
========================= */

document.getElementById(
    "sidebar-container"
).innerHTML = `

<aside class="sidebar">

    <div class="sidebar-top">

        <!-- LOGO -->

        <div class="sidebar-logo">

            <img
                src="../img/logo.png"
                alt="Logo"
                class="logo-sidebar"
            >

        </div>

        <!-- MENU -->

        <nav class="sidebar-menu">

            ${botonesMenu}

        </nav>

    </div>

    <!-- FOOTER -->

    <div class="sidebar-footer">

        <button
            type="button"
            class="logout-btn"
            onclick="logout()"
        >

            <span class="logout-icon">

                ↩

            </span>

            <span>

                Cerrar Sesión

            </span>

        </button>

    </div>

</aside>

`;

/* =========================
   MODALES
========================= */

function abrirModal(id){

    const modal =

    document.getElementById(id);

    if(modal){

        modal.style.display = "flex";

    }

}

function cerrarModal(id){

    const modal =

    document.getElementById(id);

    if(modal){

        modal.style.display = "none";

    }

}

/* =========================
   LOGOUT
========================= */

function logout(){

    abrirModal(
        'modalLogout'
    );

}

/* =========================
   CONFIRMAR LOGOUT
========================= */

const btnConfirmarLogout =

document.getElementById(
    'confirmarLogout'
);

if(btnConfirmarLogout){

    btnConfirmarLogout.addEventListener(

        'click',

        function(){

            localStorage.removeItem(
                'token'
            );

            localStorage.removeItem(
                'area'
            );

            window.location.href =
            '../index.html';

        }

    );

}