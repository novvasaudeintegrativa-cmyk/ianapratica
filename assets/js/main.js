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
})();
