// =========================================================
// asistente-pliegos.js
// La mascota de la esquina como asistente del generador de pliegos.
// Al entrar ofrece llenar el formulario por el usuario (el asistente
// de 4 preguntas de js-app/ia_<up>.js) y, al tocarla, pregunta
// «¿En qué puedo ayudarte?» con opciones que explican o guían.
// =========================================================
(function () {
  const M = window.MiniSEBISO;
  if (!M || !M.decir) return;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const $ = (id) => document.getElementById(id);
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const visible = (el) => !!el && el.getClientRects().length > 0;
  const puedeLlenar = () => typeof window.abrirLlenadoAsistido === 'function';
  function saludoHora() {
    const h = new Date().getHours();
    return h < 6 ? 'Buenas noches' : h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  }

  // Formularios anteriores (sin el asistente de 4 preguntas): solo redacta
  // motivo, actividades y localidades a partir de lo que le cuenten.
  const campoTexto = (n) => document.querySelector('textarea[name="' + n + '"]');
  const puedeRedactar = () => !puedeLlenar() && !!campoTexto('motivo') && !!$('municipio');
  const API_IA = (window.IA_API_BASE || 'https://sebiso-pliegos-oficios-1.onrender.com') + '/api/ia/redactar-up';

  // Regla del motivo según el formulario (viene en su placeholder)
  function reglaMotivo() {
    const ph = (campoTexto('motivo')?.placeholder || '').toUpperCase();
    return { minuscula: ph.includes('MINUSCULA') || ph.includes('MINÚSCULA'), punto: ph.includes('PUNTO AL FINAL') && !ph.includes('SIN PUNTO') };
  }
  function ajustarMotivo(txt) {
    let t = String(txt || '').trim().replace(/\.+$/, '');
    if (!t) return t;
    const r = reglaMotivo();
    t = (r.minuscula ? t.charAt(0).toLowerCase() : t.charAt(0).toUpperCase()) + t.slice(1);
    return r.punto ? t + '.' : t;
  }

  function periodoTexto() {
    const i = $('diaInicio')?.value, f = $('diaFin')?.value, m = $('mes')?.value;
    if (!i || !m) return '';
    return (!f || i === f) ? (i + ' de ' + m) : ('del ' + i + ' al ' + f + ' de ' + m);
  }

  function llenarPorMi() {
    if (puedeLlenar()) { window.abrirLlenadoAsistido(); return; }
    if (puedeRedactar()) abrirAyuda('redactar');
  }

  async function redactar(relato, boton, error) {
    boton.disabled = true; boton.textContent = 'Redactando…'; error.hidden = true;
    try {
      const resp = await fetch(API_IA, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ municipio: $('municipio').value, periodo: periodoTexto(), relato }),
      });
      const r = await resp.json().catch(() => ({}));
      if (!resp.ok || !r.ok) throw new Error(r.msg || 'No pude redactarlo.');
      ['motivo', 'actividades', 'localidades'].forEach(n => { const t = campoTexto(n); if (t && r[n] != null) t.value = n === 'motivo' ? ajustarMotivo(r[n]) : r[n]; });
      cerrarAyuda();
      await esperar(300);
      guiar(campoTexto('motivo'), '¡Listo! Llené motivo, actividades y localidades. Revísalos y, si todo está bien, genera los pliegos.');
    } catch (e) {
      error.textContent = e.message === 'Failed to fetch' ? 'No hay conexión con el servidor. Puedes capturarlo a mano.' : e.message;
      error.hidden = false;
      boton.disabled = false; boton.textContent = 'Redactar';
    }
  }

  // Salta junto a un elemento de la página y lo comenta; se retira al usarlo
  function guiar(el, texto) {
    if (!el || !M.presentar) return;
    M.presentar(el, texto);
    const soltar = () => { if (M.presentando && M.presentando() === el) M.retirar(); };
    el.addEventListener('click', soltar, { once: true });
    el.addEventListener('change', soltar, { once: true });
    setTimeout(soltar, 12000);
  }

  /* ─────────────── Guía de llenado completo ───────────────
     Recorre el formulario campo por campo, en orden. En listas, fechas y
     zonas avanza solo al elegir; en textos y personas, al tocar a la mascota. */
  let guiando = 0;
  function pasosGuia() {
    const nuevo = !!document.querySelector('.chip-zona');
    const q = (s) => document.querySelector(s);
    const valor = (el) => () => el ? el.value : '';
    const p = [
      { el: q('.tabla-personas'), texto: 'Paso 1: marca a las personas de la comisión. Cuando termines, tócame para seguir.', modo: 'tocar' },
    ];
    if (nuevo) {
      p.push(
        { el: q('.chips-zona') || q('.chip-zona'), texto: 'Paso 2: toca la zona y elige el municipio.', modo: 'cambio', valor: valor($('municipio')) },
        { el: $('fechaInicio'), texto: 'Paso 3: elige el día de inicio de la comisión.', modo: 'cambio', valor: valor($('fechaInicio')) },
        { el: $('fechaFin'), texto: 'Paso 4: elige el día de fin. La zona y la tarifa se calculan solas.', modo: 'cambio', valor: valor($('fechaFin')) },
      );
    } else {
      p.push(
        { el: $('zona'), texto: 'Paso 2: elige la zona y tarifa.', modo: 'cambio', valor: valor($('zona')) },
        { el: $('municipio'), texto: 'Paso 3: elige el municipio.', modo: 'cambio', valor: valor($('municipio')) },
        { el: $('diaInicio'), texto: 'Paso 4: elige el día de inicio.', modo: 'cambio', valor: valor($('diaInicio')) },
        { el: $('diaFin'), texto: 'Paso 5: elige el día de fin.', modo: 'cambio', valor: valor($('diaFin')) },
        { el: $('mes'), texto: 'Paso 6: elige el mes de la comisión.', modo: 'cambio', valor: valor($('mes')) },
      );
    }
    const n0 = p.length;
    const regla = reglaMotivo().minuscula ? 'empieza con minúscula y termina con punto' : 'empieza con mayúscula y sin punto final';
    p.push(
      { el: campoTexto('motivo'), texto: `Paso ${n0 + 1}: escribe el motivo de la comisión (${regla}). Tócame al terminar.`, modo: 'tocar' },
      { el: campoTexto('actividades'), texto: `Paso ${n0 + 2}: escribe las actividades, una por renglón con guion. Tócame al terminar.`, modo: 'tocar' },
      { el: campoTexto('localidades'), texto: `Paso ${n0 + 3}: escribe «Localidad» y el nombre de cada localidad visitada. Tócame al terminar.`, modo: 'tocar' },
      nuevo
        ? { el: $('fechaOficio'), texto: `Paso ${n0 + 4}: revisa la fecha del oficio. Tócame para seguir.`, modo: 'tocar' }
        : { el: $('diaF'), texto: `Paso ${n0 + 4}: elige la fecha del oficio (día, mes y año). Tócame para seguir.`, modo: 'tocar' },
    );
    return p.filter(x => x.el);
  }

  function esperarPaso(paso, turno) {
    return new Promise(resolve => {
      const inicial = paso.valor ? paso.valor() : null;
      const t0 = Date.now();
      const tic = setInterval(() => {
        if (turno !== guiando) { clearInterval(tic); resolve(false); return; }
        if (paso.modo === 'cambio' && paso.valor() !== inicial) { clearInterval(tic); setTimeout(() => { M.retirar(); resolve(true); }, 500); return; }
        // Tocar a la mascota la retira: eso es «seguir»
        if (Date.now() - t0 > 1600 && !M.presentando()) { clearInterval(tic); resolve(true); }
      }, 300);
    });
  }

  async function guiaCompleta() {
    const turno = ++guiando;
    const pasos = pasosGuia();
    for (const paso of pasos) {
      if (turno !== guiando) return;
      await M.retirar();
      M.presentar(paso.el, paso.texto);
      if (!(await esperarPaso(paso, turno))) return;
    }
    if (turno !== guiando) return;
    await M.retirar();
    guiaFin();
  }
  function guiaFin() {
    const boton = $('btnEnviar');
    if (boton) M.presentar(boton, '¡Todo listo! Revisa que los datos estén bien y toca «Generar pliegos».');
    guiando++;
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && guiando) { guiando++; M.retirar(); } });

  /* ─────────────── Preguntas del menú ─────────────── */
  function preguntas() {
    const lista = [{
      pregunta: 'Guíame paso a paso', icono: 'ti-route',
      texto: 'Te acompaño campo por campo, en orden, hasta generar los pliegos. En las listas y fechas avanzo solo cuando eliges; en los textos, tócame cuando termines. Puedes salir con Esc.',
      acciones: [{ texto: 'Empezar la guía', icono: 'ti-player-play', hacer: guiaCompleta }],
    }];
    if (puedeLlenar()) lista.push({
      pregunta: 'Llénalo por mí', icono: 'ti-wand',
      texto: 'Te hago 4 preguntas y yo lleno el formulario:',
      pasos: ['Quiénes fueron a la comisión.', 'A qué municipio (de ahí sale la zona).', 'Qué días y la fecha del oficio (la tarifa se calcula sola).', 'Qué hicieron, con tus palabras: yo redacto el motivo, las actividades y las localidades.'],
      acciones: [{ texto: 'Empezar', icono: 'ti-player-play', hacer: llenarPorMi }],
    });
    if (puedeRedactar()) lista.push({ pregunta: 'Redáctalo por mí', icono: 'ti-wand', redactar: true });
    lista.push(
      { pregunta: '¿Cómo genero los pliegos?', icono: 'ti-file-text',
        pasos: ['Marca a las personas de la comisión en la lista de la izquierda.', 'Elige la zona, el municipio y los días.', 'Escribe el motivo, las actividades y las localidades.', 'Toca «Generar pliegos» y confirma.'],
        acciones: [{ texto: 'Muéstrame', icono: 'ti-hand-finger', hacer: () => guiar(document.querySelector('.tabla-personas'), 'Empieza marcando aquí a las personas de la comisión.') }] },
      ...(document.querySelector('.chip-zona') ? [
      { pregunta: '¿Cómo elijo el municipio?', icono: 'ti-map-pin',
        texto: 'Toca la zona del municipio (Zona I, II o III) y elige el municipio en la lista que se abre. La zona define la tarifa, así que elígelo antes que los días.',
        acciones: [{ texto: 'Muéstrame', icono: 'ti-hand-finger', hacer: () => guiar(document.querySelector('.chip-zona'), 'Toca la zona y elige el municipio.') }] },
      { pregunta: '¿Cómo se calcula la tarifa?', icono: 'ti-calculator',
        texto: 'Sale sola de la zona del municipio y de cuántos días dura la comisión (del día de inicio al día de fin). Puede abarcar dos meses, por ejemplo del 30 de septiembre al 2 de octubre.',
        acciones: [{ texto: 'Muéstrame', icono: 'ti-hand-finger', hacer: () => guiar($('fechaInicio'), 'Pon aquí el día de inicio; la tarifa se ajusta sola.') }] },
      ] : [
      { pregunta: '¿Cómo elijo el municipio?', icono: 'ti-map-pin',
        texto: 'Primero elige la zona; la lista de municipios se ajusta a esa zona y ahí eliges el municipio.',
        acciones: [{ texto: 'Muéstrame', icono: 'ti-hand-finger', hacer: () => guiar($('zona'), 'Empieza eligiendo la zona.') }] },
      { pregunta: '¿Cómo pongo los días?', icono: 'ti-calendar',
        texto: 'Elige el día de inicio, el día de fin y el mes de la comisión en sus listas.',
        acciones: [{ texto: 'Muéstrame', icono: 'ti-hand-finger', hacer: () => guiar($('diaInicio'), 'Elige aquí el día de inicio.') }] },
      ]),
      { pregunta: '¿Cómo escribo el motivo y las actividades?', icono: 'ti-writing',
        pasos: [reglaMotivo().minuscula ? 'Motivo: empieza con minúscula y termina con punto.' : 'Motivo: empieza con mayúscula y sin punto final.', 'Actividades: una por renglón, cada una iniciando con guion.', 'Localidades: escribe «Localidad» seguido del nombre.'],
        acciones: (puedeLlenar() || puedeRedactar()) ? [{ texto: 'Mejor redáctalo tú', icono: 'ti-wand', hacer: llenarPorMi }] : [] },
    );
    return lista;
  }

  /* ─────────────── Panel «¿En qué puedo ayudarte?» ─────────────── */
  let panel = null;
  function cerrarAyuda() {
    if (!panel) return;
    panel.remove(); panel = null;
    M.despierto(false);
    document.removeEventListener('keydown', tecla);
    document.removeEventListener('pointerdown', fuera, true);
  }
  const tecla = (e) => { if (e.key === 'Escape') cerrarAyuda(); };
  const fuera = (e) => { if (panel && !panel.contains(e.target) && !M.esquina().contains(e.target)) cerrarAyuda(); };

  function abrirAyuda(directo) {
    if (panel) { cerrarAyuda(); if (directo !== 'redactar') return; }
    M.callar();
    M.despierto(true);
    panel = document.createElement('div');
    panel.className = 'ms-ayuda';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Ayuda');
    document.body.appendChild(panel);
    if (directo === 'redactar') pintarRedactar(); else pintarMenu();
    document.addEventListener('keydown', tecla);
    document.addEventListener('pointerdown', fuera, true);
  }

  function pintarMenu() {
    const lista = preguntas();
    panel.innerHTML = `
      <div class="ms-ayuda-cab">
        <span class="ms-ayuda-saludo">¡Hola!</span>
        <strong class="ms-ayuda-titulo">¿En qué puedo ayudarte?</strong>
      </div>
      <div class="ms-ayuda-lista">
        ${lista.map((q, i) => `<button type="button" class="ms-ayuda-op" data-i="${i}"><i class="ti ${q.icono}" aria-hidden="true"></i><span>${esc(q.pregunta)}</span><i class="ti ti-chevron-right ms-ayuda-flecha" aria-hidden="true"></i></button>`).join('')}
      </div>
      <button type="button" class="ms-ayuda-cerrar">Nada por ahora, gracias</button>`;
    panel.querySelectorAll('.ms-ayuda-op').forEach(b => { b.onclick = () => { const q = lista[Number(b.dataset.i)]; if (q.redactar) pintarRedactar(); else pintarRespuesta(q); }; });
    panel.querySelector('.ms-ayuda-cerrar').onclick = cerrarAyuda;
    panel.querySelector('.ms-ayuda-op')?.focus();
  }

  function pintarRespuesta(q) {
    const acciones = q.acciones || [];
    panel.innerHTML = `
      <div class="ms-ayuda-cab ms-ayuda-cab-resp">
        <button type="button" class="ms-ayuda-volver" aria-label="Volver a las preguntas"><i class="ti ti-arrow-left"></i></button>
        <strong class="ms-ayuda-titulo">${esc(q.pregunta)}</strong>
      </div>
      <div class="ms-ayuda-resp">
        ${q.texto ? `<p>${esc(q.texto)}</p>` : ''}
        ${q.pasos ? `<ol class="ms-ayuda-pasos">${q.pasos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>` : ''}
        <div class="ms-ayuda-acciones">
          ${acciones.map((a, i) => `<button type="button" class="ms-ayuda-accion" data-i="${i}"><i class="ti ${a.icono}" aria-hidden="true"></i> ${esc(a.texto)}</button>`).join('')}
          <button type="button" class="ms-ayuda-otra">Otra pregunta</button>
        </div>
      </div>`;
    panel.querySelector('.ms-ayuda-volver').onclick = pintarMenu;
    panel.querySelectorAll('.ms-ayuda-accion').forEach(b => { b.onclick = () => { const a = acciones[Number(b.dataset.i)]; cerrarAyuda(); a.hacer(); }; });
    panel.querySelector('.ms-ayuda-otra').onclick = pintarMenu;
    (panel.querySelector('.ms-ayuda-accion') || panel.querySelector('.ms-ayuda-otra')).focus();
  }

  function pintarRedactar() {
    const municipio = $('municipio')?.value || '';
    const periodo = periodoTexto();
    panel.innerHTML = `
      <div class="ms-ayuda-cab ms-ayuda-cab-resp">
        <button type="button" class="ms-ayuda-volver" aria-label="Volver a las preguntas"><i class="ti ti-arrow-left"></i></button>
        <strong class="ms-ayuda-titulo">Cuéntame qué hicieron</strong>
      </div>
      <div class="ms-ayuda-resp">
        <p>Con tus palabras: a qué fueron, qué actividades hicieron y qué localidades visitaron. Yo redacto el motivo, las actividades y las localidades.</p>
        ${municipio ? `<p class="ms-ayuda-dato"><i class="ti ti-map-pin"></i> ${esc(municipio)}${periodo ? ' · ' + esc(periodo) : ''}</p>` : ''}
        <textarea class="ms-ayuda-relato" rows="5" placeholder="Ej. Fuimos a supervisar la entrega de apoyos a adultos mayores y levantamos padrón en El Mezquital."></textarea>
        <p class="ms-ayuda-error" hidden></p>
        <div class="ms-ayuda-acciones">
          <button type="button" class="ms-ayuda-accion"><i class="ti ti-wand" aria-hidden="true"></i> Redactar</button>
          <button type="button" class="ms-ayuda-otra">Otra pregunta</button>
        </div>
      </div>`;
    const relato = panel.querySelector('.ms-ayuda-relato'), boton = panel.querySelector('.ms-ayuda-accion'), error = panel.querySelector('.ms-ayuda-error');
    panel.querySelector('.ms-ayuda-volver').onclick = pintarMenu;
    panel.querySelector('.ms-ayuda-otra').onclick = pintarMenu;
    boton.onclick = () => {
      if (relato.value.trim().length < 15) { error.textContent = 'Cuéntame un poco más de lo que hicieron.'; error.hidden = false; relato.focus(); return; }
      redactar(relato.value.trim(), boton, error);
    };
    relato.focus();
  }

  M.alTocarEsquina = abrirAyuda;

  /* ─────────────── Al entrar: ofrece llenarlo ─────────────── */
  function ofrecer() {
    let visto = false;
    try { visto = sessionStorage.getItem('ms_pliegos_' + location.pathname) === '1'; sessionStorage.setItem('ms_pliegos_' + location.pathname, '1'); } catch { /* sin storage */ }
    if (!puedeLlenar() && !puedeRedactar()) return;
    const oferta = puedeLlenar() ? 'lleno el pliego por ti: solo contesta 4 preguntas.' : 'redacto el motivo, las actividades y las localidades por ti: solo cuéntame qué hicieron.';
    const texto = visto ? `¿Te ayudo? Si quieres, ${oferta}` : `¡${saludoHora()}! Si quieres, ${oferta}`;
    M.decir(texto, { duracion: 12000, accion: 'Sí, ayúdame', alTocar: llenarPorMi });
  }

  /* ─────────────── Cuando termina de llenar ─────────────── */
  function vigilarRelleno() {
    const aviso = $('iaAviso');
    if (!aviso) return;
    new MutationObserver(async () => {
      if (aviso.hidden) return;
      await esperar(700);
      const motivo = document.querySelector('textarea[name="motivo"]');
      if (visible(motivo)) guiar(motivo, '¡Listo! Llené motivo, actividades y localidades. Revísalos y, si todo está bien, genera los pliegos.');
    }).observe(aviso, { attributes: true, attributeFilter: ['hidden'] });
  }

  function iniciar() {
    vigilarRelleno();
    setTimeout(ofrecer, 1200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
