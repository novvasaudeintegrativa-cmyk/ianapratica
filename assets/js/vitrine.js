/* Tutorial IA na Prática — troca de abas da vitrine (sem dependências). */
(function () {
  var root = document.querySelector("[data-vt]");
  if (!root) return;
  var abas = Array.prototype.slice.call(root.querySelectorAll("[data-vt-aba]"));
  var conjs = Array.prototype.slice.call(root.querySelectorAll(".vt-conj"));
  var nos = Array.prototype.slice.call(root.querySelectorAll("[data-vt-go]"));
  var rotulo = root.querySelector(".vt-aba-atual");
  var mobile = window.matchMedia("(max-width: 720px)");
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)");
  var timer = null;
  root.classList.add("is-ready");

  function ir(chave, focar) {
    abas.forEach(function (a) {
      var on = a.getAttribute("data-vt-aba") === chave;
      a.setAttribute("aria-selected", String(on));
      a.setAttribute("tabindex", on ? "0" : "-1");
      if (on && rotulo) rotulo.textContent = a.getAttribute("aria-label") || "";
      if (on && focar) a.focus();
    });
    conjs.forEach(function (c) { c.classList.toggle("on", c.id === "vt-" + chave); });
    nos.forEach(function (n) { n.classList.toggle("ativo", n.getAttribute("data-vt-go") === chave); });
  }

  abas.forEach(function (a, i) {
    a.addEventListener("click", function () { ir(a.getAttribute("data-vt-aba")); });
    a.addEventListener("keydown", function (e) {
      var alvo = null;
      if (e.key === "ArrowRight") alvo = abas[(i + 1) % abas.length];
      else if (e.key === "ArrowLeft") alvo = abas[(i - 1 + abas.length) % abas.length];
      else if (e.key === "Home") alvo = abas[0];
      else if (e.key === "End") alvo = abas[abas.length - 1];
      if (alvo) { e.preventDefault(); ir(alvo.getAttribute("data-vt-aba"), true); }
    });
  });
  nos.forEach(function (n) {
    var go = function () { ir(n.getAttribute("data-vt-go")); };
    n.addEventListener("click", go);
    n.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
  ir(abas[0].getAttribute("data-vt-aba"));

  /* Mobile: as abas só têm ícone, então avançam sozinhas mostrando o nome de cada
     uma. Para de vez assim que a pessoa toca/navega por conta própria. */
  function atual() {
    for (var i = 0; i < abas.length; i++) if (abas[i].getAttribute("aria-selected") === "true") return i;
    return 0;
  }
  function parar() { if (timer) { clearInterval(timer); timer = null; } }
  if (!reduz.matches) {
    timer = setInterval(function () {
      if (!mobile.matches || document.hidden) return;
      ir(abas[(atual() + 1) % abas.length].getAttribute("data-vt-aba"));
    }, 3500);
    ["pointerdown", "keydown"].forEach(function (ev) { root.addEventListener(ev, parar, { once: true }); });
  }
})();
