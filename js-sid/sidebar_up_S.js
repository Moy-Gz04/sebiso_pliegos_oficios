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
        ruta:"../p-up/UP-01-S-DRM.html"
    },

    {
        nombre:"Registros",
        ruta:"../h-up/R_S.html"
    },

    {
        nombre:"Presupuesto",
        ruta:"../vistas-p/vista_upS.html"
    },

    {
        nombre:"Viáticos",
        ruta:"../vistas-v/viaticos_upS.html"
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

    <!-- LOGOUT -->

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
   Autosuficiente: funciona en CUALQUIER página, sin
   depender de que exista el modal en el HTML ni de que
   estén cargadas las funciones abrirModal/cerrarModal
   (esas solo existen en registros_up_S.js, que no se
   carga en Presupuesto ni en Viáticos).
========================= */

/* --- Inyectar el modal (+ su propio CSS) si la página no lo trae ya --- */

if (!document.getElementById('modalLogout')) {

    document.head.insertAdjacentHTML(

        'beforeend',

        `
        <style>
            #modalLogout{
                display:none;
                position:fixed;
                top:0; left:0;
                width:100%; height:100%;
                background:rgba(0,0,0,.45);
                z-index:5000;
                align-items:center;
                justify-content:center;
            }
            #modalLogout.activo{
                display:flex;
            }
            #modalLogout .modal-contenido{
                background:white;
                border-radius:18px;
                padding:28px 30px;
                max-width:360px;
                width:90%;
                text-align:center;
                box-shadow:0 20px 50px rgba(0,0,0,.25);
            }
            #modalLogout h2{
                color:#691C32;
                margin-bottom:8px;
            }
            #modalLogout p{
                color:#555;
                font-size:13px;
                margin-bottom:18px;
            }
            #modalLogout .modal-botones{
                display:flex;
                gap:10px;
                justify-content:center;
            }
            #modalLogout button{
                width:auto;
                margin:0;
                padding:10px 20px;
                border:none;
                border-radius:999px;
                font-size:12.5px;
                font-weight:700;
                cursor:pointer;
            }
            #modalLogout .btn-secundario{
                background:#F1EFE9;
                color:#691C32;
            }
            #modalLogout .btn-principal{
                background:#691C32;
                color:white;
            }
        </style>
        `

    );

    document.body.insertAdjacentHTML(

        'beforeend',

        `
        <div class="modal" id="modalLogout">
            <div class="modal-contenido">
                <h2>¿Cerrar sesión?</h2>
                <p>Se cerrará tu sesión actual.</p>
                <div class="modal-botones">
                    <button
                        type="button"
                        class="btn-secundario"
                        id="cancelarLogoutSidebar"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        class="btn-principal"
                        id="confirmarLogout"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
        `

    );

}

function logout(){

    document
    .getElementById('modalLogout')
    ?.classList.add('activo');

}

document
.getElementById('cancelarLogoutSidebar')
?.addEventListener('click', () => {

    document
    .getElementById('modalLogout')
    ?.classList.remove('activo');

});

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