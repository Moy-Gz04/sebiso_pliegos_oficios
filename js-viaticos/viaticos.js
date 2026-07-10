document.addEventListener("DOMContentLoaded", () => {

    cargarUnidades();

});

const API = "https://sebiso-pliegos-oficios-1.onrender.com";

async function cargarUnidades(){

    const select=document.getElementById("unidad");

    const respuesta=await fetch(`${API}/api/viaticos/unidades`);

    const datos=await respuesta.json();

    select.innerHTML="<option value=''>Seleccione un área...</option>";

    datos.forEach(u=>{

        select.innerHTML+=`
            <option value="${u.id}">
                ${u.clave} - ${u.nombre}
            </option>
        `;

    });

}

document
.getElementById("unidad")
.addEventListener("change",(e)=>{

    sessionStorage.setItem("unidad_id",e.target.value);

});