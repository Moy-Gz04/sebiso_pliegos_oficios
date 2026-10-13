// =========================================================
// asistente-ventanas.js
// Todas las ventanas de acciones de WEB-GOB con el asistente, como en los
// demás sistemas. Las páginas siguen abriendo sus ventanas (.modal) igual
// que siempre; este script las toma al aparecer:
//   - Confirmaciones (cerrar sesión, eliminar, generar, enviar…): las
//     pregunta la mascota con los mismos textos y botones; al responder se
//     aprieta el botón original, así que todo hace exactamente lo de antes.
//   - Avisos de un solo botón (éxito, error, atención): los dice la mascota.
//   - Ventanas «cargando…»: la mascota aparece trabajando arriba.
//   - Ventanas con formulario o tablas: la mascota se asoma arriba.
//   - alert() también lo dice la mascota, y confirmarConAsistente() sustituye
//     a confirm() (devuelve una promesa con true/false).
// Con el asistente apagado todo vuelve a las ventanas normales.
// Cárguese después de minisebiso-flotante.js y asistente-extra.js.
// =========================================================
(function () {
  const M = window.MiniSEBISO;
  if (!M || !M.preguntar || window.__asistenteVentanas) return;
  window.__asistenteVentanas = true;

  const apagado = () => !!M.apagado;
  // Quita emojis y espacios de más de los textos de las ventanas
  const limpio = (t) => String(t || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu, '').replace(/\s+/g, ' ').trim();
  const visible = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const mascota = (extra = '') => `<div class="minisebiso ms-ventana-mascota ${extra}" aria-hidden="true"><div class="ms-cuerpo"><span class="ms-ojo-mov izq"><span class="ms-ojo"></span></span><span class="ms-ojo-mov der"><span class="ms-ojo"></span></span></div><div class="ms-estrella"></div></div>`;

  const css = document.createElement('style');
  css.textContent = `
    .ms-ventana-mascota{ width:78px; margin:-58px auto 4px; position:relative; z-index:2; pointer-events:none; }
    .ms-ventana-mascota.ms-trabajando-v{ animation:msvTrabajo 1.1s ease-in-out infinite; }
    .ms-ventana-mascota.ms-trabajando-v .ms-ojo-mov{ --dx:4px; --dy:3px; }
    .ms-ventana-con-mascota{ padding-top:44px !important; overflow:visible !important; }
    @keyframes msvTrabajo{ 0%,100%{ transform:translateY(0) rotate(-3deg);} 50%{ transform:translateY(-6px) rotate(3deg);} }
    /* Los estilos globales de botones de estas páginas (style.css) no deben pintar los de la mascota */
    .ms-dlg-overlay .ms-dlg-btn{ margin-top:0; }
    .ms-dlg-overlay button:not(.ms-dlg-btn), .ms-ayuda button, .ms-flotante button{ width:auto; margin-top:0; }
    .ms-dlg-overlay .ms-perso-op:not([aria-checked="true"]):hover{ background:#F6EEDD; color:#4A0A1D; }
    .ms-dlg-overlay .ms-perso-color:hover, .ms-dlg-overlay .ms-perso-cerrar:hover{ background:transparent; }
    .ms-dlg-overlay .ms-dlg-cancelar, .ms-dlg-overlay .ms-dlg-cancelar:hover{ background:#F4EFEA; color:#4A0A1D; }
    .ms-dlg-overlay .ms-dlg-cancelar:hover{ background:#EDE4DB; }
    .ms-dlg-overlay .ms-dlg-ok, .ms-dlg-overlay .ms-dlg-ok:hover{ background:linear-gradient(135deg, #C0262D, #94141E); color:#fff; }
    .ms-dlg-overlay .ms-dlg-ok.ms-dlg-ok-dorado, .ms-dlg-overlay .ms-dlg-ok.ms-dlg-ok-dorado:hover{ background:linear-gradient(135deg, #D8B866, #9C7A2E); color:#3A0818; }
    .ms-dlg-overlay .ms-dlg-ok.ms-dlg-ok-verde, .ms-dlg-overlay .ms-dlg-ok.ms-dlg-ok-verde:hover{ background:linear-gradient(135deg, #3E9B47, #22692A); color:#fff; }
    .ms-dlg-overlay .ms-dlg-ok:hover{ filter:brightness(1.06); }
    @media (prefers-reduced-motion:reduce){ .ms-ventana-mascota{ animation:none !important; } }`;
  document.head.appendChild(css);

  const tonoDe = (t) => /error|no se pudo|fall|inv[aá]lid|incorrect/i.test(t) ? 'error'
    : /atenci[oó]n|advertencia|selecciona|falta|requerid|obligatori/i.test(t) ? 'aviso'
    : /[eé]xito|correct|listo|generad|guardad|enviad|registrad|actualizad|eliminad/i.test(t) ? 'exito' : '';
  const esCancelar = (b) => /cancelar|^no\b|regresar|volver|cerrar$/i.test(limpio(b.textContent)) || b.classList.contains('btn-secundario');

  /* ---------- Ventanas de la página (.modal) ---------- */
  const enCurso = new WeakSet();
  async function tomar(modal) {
    if (enCurso.has(modal) || apagado()) return;
    const caja = modal.querySelector('.modal-contenido, .modal-content, .modal-box') || modal.firstElementChild || modal;
    const campos = [...caja.querySelectorAll('input:not([type=hidden]), select, textarea, table, iframe, canvas, img:not(.ms-ventana-mascota img)')].filter(visible);
    const botones = [...caja.querySelectorAll('button, .btn, a.btn')].filter(b => visible(b) && !b.closest('.ms-ventana-mascota'));

    // Con formulario/tablas, o «cargando» sin botones: la mascota se queda en la ventana
    if (campos.length || !botones.length) {
      if (!caja.querySelector('.ms-ventana-mascota')) {
        caja.insertAdjacentHTML('afterbegin', mascota(botones.length ? '' : 'ms-trabajando-v'));
        caja.classList.add('ms-ventana-con-mascota');
      }
      return;
    }

    // Confirmación o aviso: lo pregunta/dice la mascota y luego se aprieta el botón original
    const titulo = limpio(caja.querySelector('h1, h2, h3, h4')?.textContent);
    const textos = [...caja.querySelectorAll('p')].filter(visible).map(p => limpio(p.textContent)).filter(Boolean);
    const cancelar = botones.find(esCancelar);
    const ok = [...botones].reverse().find(b => b !== cancelar) || botones[botones.length - 1];
    const textoOk = limpio(ok.textContent) || 'Aceptar';
    const todo = titulo + ' ' + textos.join(' ') + ' ' + textoOk;
    const soloOk = botones.length === 1 || !cancelar;

    enCurso.add(modal);
    modal.style.setProperty('display', 'none', 'important');
    try {
      const peligro = /elimin|borrar|cerrar sesi/i.test(todo);
      const si = await M.preguntar({
        titulo: soloOk ? ({ exito: '¡Listo!', error: '¡Ups!', aviso: '¡Atención!' }[tonoDe(todo)] || '¡Hola!') : '¡Hola!',
        pregunta: titulo || textos.shift() || '',
        detalle: textos.join(' '),
        btnOk: textoOk,
        btnCancel: cancelar ? limpio(cancelar.textContent) : 'Cancelar',
        iconoOk: /elimin|borrar/i.test(todo) ? 'ti-trash' : /cerrar sesi/i.test(todo) ? 'ti-logout' : soloOk ? 'ti-check' : 'ti-arrow-right',
        soloOk,
        tono: soloOk ? tonoDe(todo) : (peligro ? 'error' : ''),
        estiloOk: !soloOk && !peligro ? 'dorado' : '',
        saludoOk: soloOk ? '¡Va!' : '¡Va!', textoOk: soloOk ? '' : (/cerrar sesi/i.test(todo) ? '¡Hasta pronto!' : 'En eso estoy…'),
      });
      // La ventana original se queda oculta (si la página la vuelve a abrir, se toma otra vez)
      modal.style.removeProperty('display');
      modal.style.display = 'none';
      if (si) ok.click();
      else if (cancelar) cancelar.click();
    } finally {
      enCurso.delete(modal);
    }
  }
  const abierta = (m) => getComputedStyle(m).display !== 'none' && !enCurso.has(m);
  function revisar(m) { if (m.classList && m.classList.contains('modal') && abierta(m)) tomar(m); }
  new MutationObserver(ms => ms.forEach(r => {
    if (r.type === 'attributes') revisar(r.target);
    else r.addedNodes.forEach(n => { if (n.nodeType === 1) { revisar(n); n.querySelectorAll && n.querySelectorAll('.modal').forEach(revisar); } });
  })).observe(document.body, { attributes: true, attributeFilter: ['style', 'class'], subtree: true, childList: true });

  /* ---------- alert() y confirm() ---------- */
  const alertaOriginal = window.alert.bind(window);
  window.alert = function (msg) {
    if (apagado()) return alertaOriginal(msg);
    const t = limpio(msg);
    M.preguntar({ titulo: ({ exito: '¡Listo!', error: '¡Ups!', aviso: '¡Atención!' }[tonoDe(t)] || '¡Hola!'), pregunta: t, soloOk: true, btnOk: 'Entendido', iconoOk: 'ti-check', tono: tonoDe(t), saludoOk: '¡Va!', textoOk: '' });
  };
  window.confirmarConAsistente = function (msg, { btnOk = 'Sí', iconoOk = 'ti-check' } = {}) {
    if (apagado()) return Promise.resolve(window.confirm(msg));
    const peligro = /elimin|borrar/i.test(msg);
    return M.preguntar({
      titulo: '¡Hola!', pregunta: limpio(msg), btnOk: peligro ? 'Sí, eliminar' : btnOk, btnCancel: 'Cancelar',
      iconoOk: peligro ? 'ti-trash' : iconoOk, tono: peligro ? 'error' : '', estiloOk: peligro ? '' : 'dorado',
      saludoOk: '¡Va!', textoOk: 'En eso estoy…',
    });
  };

  // Ventanas que ya estaban abiertas al cargar
  document.querySelectorAll('.modal').forEach(revisar);
})();
