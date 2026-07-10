document.addEventListener("DOMContentLoaded", () => {

    cargarUnidades();

});

async function cargarUnidades(){

    const select=document.getElementById("unidad");

    const respuesta=await fetch("/api/viaticos/unidades");

    const datos=await respuesta.json();

    select.innerHTML="<option value=''>Seleccione...</option>";

    datos.forEach(u=>{

        select.innerHTML+=`

            <option value="${u.id}">

                ${u.clave} - ${u.nombre}

            </option>

        `;

    });

}