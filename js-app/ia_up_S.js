/* ============================================================
   LLENADO INTELIGENTE (UP S)
   Asistente de 4 pasos, uno por pantalla:
     1. Quiénes fueron   (personas)
     2. A qué municipio  (uno solo; de aquí sale la zona)
     3. Cuándo           (calendarios; de aquí salen tarifa y mes,
                          más la fecha del oficio)
     4. Qué hicieron     (un solo cuadro de texto libre)
   Los pasos 1-3 mueven los controles REALES del formulario (que ya
   calculan Zona y Tarifa y el mes). El paso 4 se manda al servidor
   (Gemini), que redacta motivo, actividades y localidades. El usuario
   revisa todo antes de "Generar pliegos".
   ============================================================ */

(function(){

    const API_IA = (window.IA_API_BASE || "https://sebiso-pliegos-oficios-1.onrender.com") + "/api/ia/redactar-up";

    const $ = id => document.getElementById(id);
    const TOTAL = 4;
    let paso = 1;
    let eligioMunicipio = false;

    /* ---------- Paso 1: personas como fichas que espejan las casillas reales ---------- */

    function construirPersonas(){

        const cont = $("iaPersonas");
        cont.innerHTML = "";

        document.querySelectorAll('input[name="seleccionados"]').forEach(real => {

            const b = document.createElement("button");

            b.type = "button";
            b.textContent = real.value;
            b.setAttribute("aria-pressed", real.checked ? "true" : "false");

            b.addEventListener("click", () => {
                real.checked = !real.checked;
                b.setAttribute("aria-pressed", real.checked ? "true" : "false");
                $("iaError").hidden = true;
            });

            cont.appendChild(b);

        });

    }

    /* ---------- Paso 2: los mismos botones de zona (los maneja catalogos_up_S.js) ---------- */

    function refrescarMunicipio(){

        const op = $("municipio").selectedOptions[0];
        const caja = $("iaMunicipioElegido");

        caja.textContent = (op && eligioMunicipio) ? ("Zona " + op.dataset.zona + " · " + op.value) : "Aún no eliges municipio";
        caja.classList.toggle("vacio", !(op && eligioMunicipio));

        document.querySelectorAll(".ia-zona").forEach(b => {
            b.classList.toggle("activo", eligioMunicipio && !!op && b.dataset.zona === op.dataset.zona);
        });

        refrescarZonaTarifa();

    }

    const seleccionOriginal = window.seleccionarMunicipio;

    window.seleccionarMunicipio = function(nombre, zona){
        seleccionOriginal(nombre, zona);
        eligioMunicipio = true;
        refrescarMunicipio();
        $("iaError").hidden = true;
    };

    /* ---------- Paso 3: calendarios que mueven los reales ---------- */

    function refrescarFechas(){

        $("iaFechaInicio").value = $("fechaInicio").value;
        $("iaFechaFin").value    = $("fechaFin").value;
        $("iaFechaFin").min      = $("fechaFin").min;
        $("iaFechaFin").max      = $("fechaFin").max;
        $("iaFechaOficio").value = $("fechaOficio").value;

        refrescarZonaTarifa();

    }

    function refrescarZonaTarifa(){

        const z = $("zona").value;

        $("iaZonaTarifa").textContent = z
            ? ("Zona y tarifa: " + z + " · " + $("detalleZona").textContent)
            : $("detalleZona").textContent;

        $("iaZonaTarifa").classList.toggle("vacio", !z);

    }

    function enlazarFecha(idModal, idReal, despues){

        $(idModal).addEventListener("change", function(){
            if(!this.value) return;
            $(idReal).value = this.value;
            despues();
        });

    }

    enlazarFecha("iaFechaInicio", "fechaInicio", () => { actualizarFechasComision(); refrescarFechas(); });
    enlazarFecha("iaFechaFin",    "fechaFin",    () => { actualizarFechasComision(); refrescarFechas(); });
    enlazarFecha("iaFechaOficio", "fechaOficio", () => { actualizarFechaOficio(); });

    /* ---------- Navegación entre pasos ---------- */

    function mostrarPaso(n){

        paso = n;

        document.querySelectorAll(".ia-paso").forEach(s => {
            s.hidden = Number(s.dataset.paso) !== n;
        });

        document.querySelectorAll(".ia-progreso i").forEach((barra, i) => {
            barra.classList.toggle("hecho", i < n);
        });

        $("iaAtras").hidden = (n === 1);
        $("iaSiguiente").textContent = (n === TOTAL) ? "✦ Llenar formulario" : "Siguiente";
        $("iaError").hidden = true;

        if(typeof cerrarPanelZona === "function") cerrarPanelZona();
        if(n === TOTAL) $("iaRelato").focus();

    }

    function error(msg){
        $("iaError").textContent = msg;
        $("iaError").hidden = false;
    }

    /* Devuelve un mensaje si el paso actual no está completo */
    function validarPaso(n){

        if(n === 1 && !document.querySelector('input[name="seleccionados"]:checked'))
            return "Elige al menos una persona.";

        if(n === 2 && !eligioMunicipio)
            return "Elige un municipio.";

        if(n === 3 && !$("zona").value)
            return "Revisa los días: el final no puede ser antes del inicio.";

        if(n === 4 && $("iaRelato").value.trim().length < 15)
            return "Cuéntanos un poco más: qué hicieron y en qué localidades.";

        return "";

    }

    function siguiente(){

        const msg = validarPaso(paso);

        if(msg){ error(msg); return; }

        if(paso < TOTAL) mostrarPaso(paso + 1);
        else redactar();

    }

    /* ---------- Abrir / cerrar ---------- */

    function abrir(){

        eligioMunicipio = false;
        construirPersonas();
        refrescarFechas();

        /* El formulario arranca con el primer municipio de la lista; aquí se pide
           que el usuario lo elija a propósito, así que el paso 2 lo muestra tal cual. */
        refrescarMunicipio();

        mostrarPaso(1);
        $("iaFondo").hidden = false;
        document.body.classList.add("ia-abierto");

    }

    function cerrar(){

        if($("iaSiguiente").disabled) return;

        if(typeof cerrarPanelZona === "function") cerrarPanelZona();
        $("iaFondo").hidden = true;
        document.body.classList.remove("ia-abierto");

    }

    function periodoTexto(){
        const i = $("diaInicio").value, f = $("diaFin").value, m = $("mes").value;
        return i === f ? (i + " de " + m) : ("del " + i + " al " + f + " de " + m);
    }

    /* ---------- Redactar y llenar ---------- */

    async function redactar(){

        const boton = $("iaSiguiente");

        boton.disabled = true;
        $("iaAtras").disabled = true;
        boton.textContent = "Redactando…";
        $("iaError").hidden = true;

        try{

            const resp = await fetch(API_IA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    municipio: $("municipio").value,
                    periodo:   periodoTexto(),
                    relato:    $("iaRelato").value.trim()
                })
            });

            const r = await resp.json().catch(() => ({}));

            if(!resp.ok || !r.ok) throw new Error(r.msg || "No se pudo redactar.");

            const campos = {
                motivo:      r.motivo,
                actividades: r.actividades,
                localidades: r.localidades
            };

            Object.keys(campos).forEach(nombre => {
                const t = document.querySelector('textarea[name="' + nombre + '"]');
                t.value = campos[nombre];
                t.classList.remove("ia-relleno");
                void t.offsetWidth;
                t.classList.add("ia-relleno");
            });

            boton.disabled = false;
            $("iaAtras").disabled = false;
            cerrar();
            $("iaAviso").hidden = false;
            document.querySelector('textarea[name="motivo"]').scrollIntoView({ behavior: "smooth", block: "center" });

        }catch(e){
            error(e.message === "Failed to fetch"
                ? "No hay conexión con el servidor. Puedes capturar manualmente."
                : e.message);
        }finally{
            boton.disabled = false;
            $("iaAtras").disabled = false;
            boton.textContent = (paso === TOTAL) ? "✦ Llenar formulario" : "Siguiente";
        }
    }

    $("btnIA").addEventListener("click", abrir);
    $("iaCerrar").addEventListener("click", cerrar);
    $("iaAtras").addEventListener("click", () => { if(paso > 1) mostrarPaso(paso - 1); });
    $("iaSiguiente").addEventListener("click", siguiente);
    $("iaFondo").addEventListener("click", e => { if(e.target === $("iaFondo")) cerrar(); });
    document.addEventListener("keydown", e => { if(e.key === "Escape" && !$("iaFondo").hidden) cerrar(); });

    /* Al editar a mano un campo redactado, el aviso deja de hacer falta */
    document.querySelectorAll('textarea[name="motivo"], textarea[name="actividades"], textarea[name="localidades"]')
    .forEach(t => t.addEventListener("input", () => { $("iaAviso").hidden = true; }));

})();
