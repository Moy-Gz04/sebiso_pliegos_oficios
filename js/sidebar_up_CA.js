const paginaActual =
window.location.pathname
.split("/")
.pop();

/* =========================
   ARCHIVOS UP-01
========================= */

const PAGINA_INICIO =
'UP-CA.html';

const PAGINA_REGISTROS =
'R_CA.html';

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
                src="img/logo.png"
                alt="Logo"
                class="logo-sidebar">

        </div>

        <!-- MENÚ -->

        <nav class="sidebar-menu">

            <button
                type="button"
                class="menu-btn ${
                    paginaActual === PAGINA_INICIO
                    ? "activo"
                    : ""
                }"

                onclick="
                    window.location.href='${PAGINA_INICIO}'
                ">

                Inicio

            </button>

            <button
                type="button"
                class="menu-btn ${
                    paginaActual === PAGINA_REGISTROS
                    ? "activo"
                    : ""
                }"

                onclick="
                    window.location.href='${PAGINA_REGISTROS}'
                ">

                Registros

            </button>

        </nav>

    </div>

    <!-- FOOTER -->

    <div class="sidebar-footer">

        <button
            type="button"
            class="logout-btn"
            onclick="logout()">

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
            'index.html';

        }

    );

}