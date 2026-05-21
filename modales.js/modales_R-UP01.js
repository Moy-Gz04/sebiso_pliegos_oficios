/* =========================
   INYECTAR MODALES
========================= */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        document.body.insertAdjacentHTML(

            "beforeend",

            `

            <!-- =========================
                 MODAL GLOBAL
            ========================= -->

            <div
                class="modal"
                id="modalGlobal"
            >

                <div class="modal-contenido">

                    <h2 id="modalTitulo">

                        Confirmar acción

                    </h2>

                    <p id="modalTexto">

                        ¿Deseas continuar?

                    </p>

                    <div class="modal-botones">

                        <button
                            type="button"
                            class="btn-secundario"
                            onclick="cerrarModal('modalGlobal')"
                        >

                            Cancelar

                        </button>

                        <button
                            type="button"
                            class="btn-principal"
                            id="btnAceptarModal"
                        >

                            Continuar

                        </button>

                    </div>

                </div>

            </div>

            <!-- =========================
                 MODAL CARGANDO
            ========================= -->

            <div
                class="modal modal-cargando"
                id="modalCargando"
            >

                <div class="modal-contenido">

                    <div class="loader"></div>

                    <h2 id="textoCarga">

                        Procesando...

                    </h2>

                    <p>

                        Espera un momento mientras se procesa la información.

                    </p>

                </div>

            </div>

            `

        );

    }

);

/* =========================
   ABRIR MODAL
========================= */

function abrirModal(id){

    const modal =
    document.getElementById(id);

    if(modal){

        modal.style.display =
        "flex";

    }

}

/* =========================
   CERRAR MODAL
========================= */

function cerrarModal(id){

    const modal =
    document.getElementById(id);

    if(modal){

        modal.style.display =
        "none";

    }

}

/* =========================
   ABRIR CONFIRMACIÓN
========================= */

function abrirConfirmacion({

    titulo = "Confirmar acción",

    texto = "¿Deseas continuar?",

    textoBoton = "Continuar",

    onAceptar = ()=>{}

}){

    document.getElementById(
        "modalTitulo"
    ).textContent =
    titulo;

    document.getElementById(
        "modalTexto"
    ).textContent =
    texto;

    document.getElementById(
        "btnAceptarModal"
    ).textContent =
    textoBoton;

    document.getElementById(
        "btnAceptarModal"
    ).onclick = async ()=>{

        cerrarModal(
            "modalGlobal"
        );

        await onAceptar();

    };

    abrirModal(
        "modalGlobal"
    );

}

/* =========================
   MOSTRAR CARGA
========================= */

function mostrarCarga(

    texto = "Procesando..."

){

    document.getElementById(
        "textoCarga"
    ).textContent =
    texto;

    abrirModal(
        "modalCargando"
    );

}

/* =========================
   OCULTAR CARGA
========================= */

function ocultarCarga(){

    cerrarModal(
        "modalCargando"
    );

}