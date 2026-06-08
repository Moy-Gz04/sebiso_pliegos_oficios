const paginaActual =
window.location.pathname
.split("/")
.pop();

/* =========================
   ARCHIVOS
========================= */

const PAGINA_INICIO =
'Administracion.html';

const PAGINA_REGISTROS =
'G-U-P.html';

const PAGINA_PAGOS =
'G.html';

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
                class="logo-sidebar">

        </div>

        <!-- MENÚ -->

        <nav class="sidebar-menu">

            <!-- PRESUPUESTOS -->

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

                Presupuestos

            </button>

            <!-- PLIEGOS -->

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

                Pliegos

            </button>

            <!-- PAGOS REALIZADOS -->

            <button
                type="button"
                class="menu-btn ${
                    paginaActual === PAGINA_PAGOS
                    ? "activo"
                    : ""
                }"

                onclick="
                    window.location.href='${PAGINA_PAGOS}'
                ">

                Pagos Realizados

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

        const overlay =
        document.getElementById("overlay");

        if(overlay){
            overlay.style.display = "block";
        }
    }
}

function cerrarModal(id){

    const modal =
    document.getElementById(id);

    if(modal){

        modal.style.display = "none";

        const overlay =
        document.getElementById("overlay");

        if(overlay){
            overlay.style.display = "none";
        }
    }
}

/* =========================
   LOGOUT
========================= */

function logout(){

    abrirModal('modalLogout');
}

/* =========================
   CONFIRMAR LOGOUT
   Se usa setTimeout para esperar a que
   el sidebar termine de inyectarse en el DOM
   antes de buscar el botón confirmarLogout
========================= */

setTimeout(() => {

    const btnConfirmarLogout =
    document.getElementById('confirmarLogout');

    if(btnConfirmarLogout){

        btnConfirmarLogout.addEventListener(

            'click',

            function(){

                localStorage.removeItem('token');
                localStorage.removeItem('area');

                window.location.href = 'index.html';
            }
        );
    }

}, 0);