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
];

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

            ${pagina.nombre}

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