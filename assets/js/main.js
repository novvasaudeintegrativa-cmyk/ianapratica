(function () {
  "use strict";

  /* Menu mobile */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* FAQ accordion — acessível por teclado, um item por vez */
  var faqItems = document.querySelectorAll("[data-faq-item]");
  faqItems.forEach(function (item) {
    var button = item.querySelector("[data-faq-question]");
    if (!button) return;
    button.addEventListener("click", function () {
      var isOpen = item.getAttribute("data-open") === "true";
      faqItems.forEach(function (other) {
        other.setAttribute("data-open", "false");
        var otherButton = other.querySelector("[data-faq-question]");
        if (otherButton) otherButton.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.setAttribute("data-open", "true");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Alternância de tema — botão único que cicla sistema → claro → escuro,
     forçando data-theme no <html> (ou removendo, para voltar a seguir o SO) */
  var themeCycleBtn = document.querySelector("[data-theme-cycle]");
  var root = document.documentElement;
  var themeSequence = ["system", "light", "dark"];
  var themeLabels = { system: "sistema", light: "claro", dark: "escuro" };

  function applyTheme(theme) {
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    if (themeCycleBtn) {
      themeCycleBtn.setAttribute("data-active", theme);
      var next = themeSequence[(themeSequence.indexOf(theme) + 1) % themeSequence.length];
      themeCycleBtn.setAttribute(
        "aria-label",
        "Tema: " + themeLabels[theme] + ". Clique para mudar para " + themeLabels[next] + "."
      );
    }
    try {
      window.localStorage.setItem("ia-na-pratica-theme", theme);
    } catch (e) {
      /* localStorage indisponível — segue sem persistir */
    }
  }

  var storedTheme = "system";
  try {
    storedTheme = window.localStorage.getItem("ia-na-pratica-theme") || "system";
  } catch (e) {
    /* localStorage indisponível — usa padrão do sistema */
  }
  applyTheme(storedTheme);

  if (themeCycleBtn) {
    themeCycleBtn.addEventListener("click", function () {
      var current = themeCycleBtn.getAttribute("data-active") || "system";
      var next = themeSequence[(themeSequence.indexOf(current) + 1) % themeSequence.length];
      applyTheme(next);
    });
  }

  /* Sombra sutil no header ao rolar */
  var header = document.querySelector("[data-site-header]");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Timeline da Programação — cada bloco/intervalo revela e a bolinha acende
     conforme entra na tela, uma única vez (não some de novo ao rolar pra cima) */
  var timelineItems = document.querySelectorAll("[data-timeline] .timeline-item");
  if (timelineItems.length) {
    if ("IntersectionObserver" in window) {
      var timelineObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              timelineObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
      );
      timelineItems.forEach(function (item) { timelineObserver.observe(item); });
    } else {
      timelineItems.forEach(function (item) { item.classList.add("is-visible"); });
    }
  }

  /* Revelação genérica ao rolar — cabeçalhos de seção e cards pelo resto do
     site (a Programação já tem seu próprio sistema acima). A classe que
     esconde o elemento (.reveal-pending) só é adicionada aqui: se o JS não
     rodar, o CSS nunca chega a escondê-los — fica tudo visível normalmente. */
  var revealTargets = document.querySelectorAll(
    ".section-header, .simple-item, .card-hover, .price-card, .testimonial-card, .instructor-card, .faq-item"
  );
  if (revealTargets.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach(function (el) {
      el.classList.add("reveal-pending");
      revealObserver.observe(el);
    });
  }

  /* Toggle Dia 1 / Dia 2 na Programação (teste de copy) — filtra os itens da
     timeline existente por [data-day] em vez de duplicar a marcação; só roda
     se os botões existirem na página, então não afeta quem não tem essa UI. */
  var dayToggleBtns = document.querySelectorAll("[data-day-toggle]");
  if (dayToggleBtns.length) {
    var dayItems = document.querySelectorAll(".schedule-list [data-day]");
    var setDay = function (day) {
      dayItems.forEach(function (item) {
        item.classList.toggle("is-day-hidden", item.getAttribute("data-day") !== day);
      });
      dayToggleBtns.forEach(function (btn) {
        var isActive = btn.getAttribute("data-day-toggle") === day;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
      });
    };
    dayToggleBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setDay(btn.getAttribute("data-day-toggle"));
      });
    });
    setDay("1");
  }

  /* "Chuva de código" -- efeito estilo Matrix, só nas cores da marca
     (laranja sobre preto), bem suave e discreto. Só 0 e 1 (binário,
     ocidental -- sem katakana) pra combinar com o resto do site, que é
     todo em português do Brasil. Limpa o canvas inteiro a cada frame (em
     vez de acumular um rastro semi-opaco) pra imagem atrás nunca escurecer
     até sumir. Só anima enquanto o elemento está visível na tela, e nem
     começa se a pessoa pediu menos movimento no sistema. */
  var matrixCanvas = document.querySelector("[data-matrix-rain]");
  if (
    matrixCanvas &&
    matrixCanvas.getContext &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    var mCtx = matrixCanvas.getContext("2d");
    var glyphs = "01";
    var fontSize = 16;
    var trailLength = 9;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var columns = 0;
    var drops = [];
    var speeds = [];

    var resizeMatrix = function () {
      var rect = matrixCanvas.parentElement.getBoundingClientRect();
      matrixCanvas.width = rect.width * dpr;
      matrixCanvas.height = rect.height * dpr;
      matrixCanvas.style.width = rect.width + "px";
      matrixCanvas.style.height = rect.height + "px";
      mCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(rect.width / fontSize);
      drops = [];
      speeds = [];
      for (var c = 0; c < columns; c++) {
        drops.push(Math.random() * -40);
        speeds.push(0.12 + Math.random() * 0.16);
      }
    };

    var drawMatrix = function () {
      var rect = matrixCanvas.getBoundingClientRect();
      mCtx.clearRect(0, 0, rect.width, rect.height);
      mCtx.font = fontSize + "px monospace";
      mCtx.textBaseline = "top";
      for (var i = 0; i < columns; i++) {
        var headY = drops[i] * fontSize;
        for (var t = 0; t < trailLength; t++) {
          var y = headY - t * fontSize;
          if (y < -fontSize || y > rect.height) continue;
          var alpha = Math.max(0, 1 - t / trailLength);
          var glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
          mCtx.fillStyle = t === 0
            ? "rgba(255, 226, 199, " + (alpha * 0.95) + ")"
            : "rgba(255, 90, 31, " + (alpha * 0.8) + ")";
          mCtx.fillText(glyph, i * fontSize, y);
        }
        drops[i] += speeds[i];
        if (headY - trailLength * fontSize > rect.height && Math.random() > 0.985) {
          drops[i] = Math.random() * -20;
        }
      }
    };

    var matrixVisible = false;
    var matrixRafId = null;
    var lastFrameTime = 0;
    var frameInterval = 90; /* ~11fps -- "filme bem suave", não 60fps nervoso */

    var matrixLoop = function (time) {
      if (!matrixVisible) return;
      if (time - lastFrameTime >= frameInterval) {
        lastFrameTime = time;
        drawMatrix();
      }
      matrixRafId = requestAnimationFrame(matrixLoop);
    };

    resizeMatrix();
    window.addEventListener("resize", resizeMatrix);

    /* Se o canvas estiver sobre uma <img> (ex: a cena da Orquestração), o
       pai ainda não tem altura real na primeira medição -- a imagem carrega
       de forma assíncrona. Remede assim que ela terminar de carregar. */
    var matrixSiblingImg = matrixCanvas.parentElement.querySelector("img");
    if (matrixSiblingImg) {
      if (matrixSiblingImg.complete) {
        resizeMatrix();
      } else {
        matrixSiblingImg.addEventListener("load", resizeMatrix, { once: true });
      }
    }

    if ("IntersectionObserver" in window) {
      var matrixObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            matrixVisible = entry.isIntersecting;
            if (matrixVisible && matrixRafId === null) {
              matrixRafId = requestAnimationFrame(matrixLoop);
            } else if (!matrixVisible && matrixRafId !== null) {
              cancelAnimationFrame(matrixRafId);
              matrixRafId = null;
            }
          });
        },
        { threshold: 0.1 }
      );
      matrixObserver.observe(matrixCanvas);
    } else {
      matrixVisible = true;
      matrixRafId = requestAnimationFrame(matrixLoop);
    }
  }
})();
