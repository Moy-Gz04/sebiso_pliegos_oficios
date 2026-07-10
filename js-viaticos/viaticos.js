const API = "https://sebiso-pliegos-oficios-1.onrender.com";

let modal;
let tabla;

document.addEventListener("DOMContentLoaded", () => {

    modal = document.getElementById("modalRegistro");

    tabla = new DataTable("#tablaViaticos",{

    language:{

        url:"https://cdn.datatables.net/plug-ins/2.3.2/i18n/es-MX.json"

    },

    pageLength:10,

    responsive:true

});

    cargarUnidades();

    // =============================
    // CAMBIO DE ÁREA PRESUPUESTAL
    // =============================

    document
        .getElementById("unidad")
        .addEventListener("change", cambiarUnidad);

    // =============================
    // ABRIR MODAL
    // =============================

    document
        .getElementById("nuevo")
        .addEventListener("click", () => {

            const unidad = document.getElementById("unidad").value;

            if (!unidad) {

                alert("Primero seleccione un Área Presupuestal.");

                return;

            }

            modal.style.display = "flex";

        });

    // =============================
    // CERRAR MODAL
    // =============================

    document
        .getElementById("cerrarModal")
        .addEventListener("click", cerrarModal);

    window.addEventListener("click", (e) => {

        if (e.target === modal) {

            cerrarModal();

        }

    });

    // =============================
    // CAMBIO DE PESTAÑAS
    // =============================

    document
        .querySelectorAll(".tab")
        .forEach(tab => {

            tab.addEventListener("click", () => {

                document
                    .querySelectorAll(".tab")
                    .forEach(t => t.classList.remove("activa"));

                document
                    .querySelectorAll(".tab-content")
                    .forEach(c => c.classList.remove("activo"));

                tab.classList.add("activa");

                document
                    .getElementById(tab.dataset.tab)
                    .classList.add("activo");

            });

        });

    // =============================
    // GUARDAR REGISTRO
    // =============================

    document
        .getElementById("guardarRegistro")
        .addEventListener("click", guardarRegistro);

});


//====================================================
// CARGAR UNIDADES
//====================================================

async function cargarUnidades() {

    try {

        const respuesta = await fetch(`${API}/api/viaticos/unidades`);

        const datos = await respuesta.json();

        const select = document.getElementById("unidad");

        select.innerHTML = `
            <option value="">
                Seleccione un área...
            </option>
        `;

        datos.forEach(u => {

            select.innerHTML += `

                <option value="${u.id}">

                    ${u.clave} - ${u.nombre}

                </option>

            `;

        });

    } catch (error) {

        console.error(error);

        alert("No fue posible cargar las áreas.");

    }

}


//====================================================
// CAMBIAR ÁREA
//====================================================

function cambiarUnidad(e) {

    const opcion = e.target.options[e.target.selectedIndex];

    sessionStorage.setItem(

        "unidad_id",

        opcion.value

    );

    sessionStorage.setItem(

        "unidad_nombre",

        opcion.text

    );

    document.getElementById("unidadActual").textContent = opcion.text;

    // Más adelante aquí cargaremos:
    //
    // cargarTabla();
    // cargarDashboard();
    cargarViaticos();

}


//====================================================
// CERRAR MODAL
//====================================================

function cerrarModal() {

    modal.style.display = "none";

}


//====================================================
// LIMPIAR FORMULARIO
//====================================================

function limpiarFormulario() {

    document.getElementById("nombreRegistro").value = "";

    document.getElementById("rfcRegistro").value = "";

    document.getElementById("municipioRegistro").value = "";

    document.getElementById("importeRegistro").value = "";

    document.getElementById("mesRegistro").selectedIndex = 0;

}


//====================================================
// GUARDAR REGISTRO
//====================================================

async function guardarRegistro() {

    const unidad = sessionStorage.getItem("unidad_id");

    if (!unidad) {

        alert("Seleccione un Área Presupuestal.");

        return;

    }

    const body = {

        unidad_id: unidad,

        nombre_servidor: document
            .getElementById("nombreRegistro")
            .value
            .trim(),

        rfc: document
            .getElementById("rfcRegistro")
            .value
            .trim(),

        mes: document
            .getElementById("mesRegistro")
            .value,

        municipio: document
            .getElementById("municipioRegistro")
            .value
            .trim(),

        importe: document
            .getElementById("importeRegistro")
            .value

    };

    if (

        !body.nombre_servidor ||

        !body.rfc ||

        !body.municipio ||

        !body.importe

    ) {

        alert("Complete todos los campos.");

        return;

    }

    try {

        const respuesta = await fetch(

            `${API}/api/viaticos`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(body)

            }

        );

        const datos = await respuesta.json();

        if (datos.ok) {

            alert("Registro guardado correctamente.");

            limpiarFormulario();

            cerrarModal();

            cargarViaticos();

            // Más adelante
            //
            // cargarTabla();
            // cargarDashboard();

        } else {

            alert(datos.mensaje);

        }

    } catch (error) {

        console.error(error);

        alert("Error al guardar el registro.");

    }

}

async function cargarViaticos() {

    const unidad = sessionStorage.getItem("unidad_id");

    if (!unidad) return;

    const respuesta = await fetch(

        `${API}/api/viaticos?unidad_id=${unidad}`

    );

    const datos = await respuesta.json();

    console.log(datos);

}