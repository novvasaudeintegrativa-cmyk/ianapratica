(function () {
  "use strict";

  /* Cards Dia 1 / Dia 2 no hub — só um fica laranja por vez. Dia 1 é o
     padrão; passar o mouse no outro card transfere o estado pra ele, e
     tirar o mouse dos dois volta pro padrão (Dia 1 laranja). */
  var dayGrid = document.querySelector(".guide-days-grid");
  var dayCards = document.querySelectorAll(".guide-days-grid .guide-day-card");
  if (dayGrid && dayCards.length) {
    dayCards.forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        dayCards.forEach(function (c) { c.classList.remove("is-active-day"); });
        card.classList.add("is-active-day");
      });
    });
    dayGrid.addEventListener("mouseleave", function () {
      dayCards.forEach(function (c) { c.classList.remove("is-active-day"); });
      dayCards[0].classList.add("is-active-day");
    });
  }

  /* Copiar comando — cada bloco de código tem seu próprio botão e seu
     próprio <code>-fonte; nada de estado global. */
  var copyButtons = document.querySelectorAll("[data-copy-target]");
  copyButtons.forEach(function (btn) {
    var targetId = btn.getAttribute("data-copy-target");
    var codeEl = document.getElementById(targetId);
    if (!codeEl) return;

    btn.addEventListener("click", function () {
      var text = codeEl.textContent.replace(/\n$/, "");
      var done = function () {
        var label = btn.querySelector("[data-copy-label]");
        var original = label ? label.textContent : "";
        btn.setAttribute("data-copied", "true");
        if (label) label.textContent = "Copiado!";
        window.setTimeout(function () {
          btn.setAttribute("data-copied", "false");
          if (label) label.textContent = original;
        }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand("copy"); } catch (e) { /* silencioso */ }
        document.body.removeChild(textarea);
        done();
      }
    });
  });

  /* Chips de navegação rápida entre passos — marca o chip do passo visível */
  var stepNavLinks = document.querySelectorAll("[data-step-nav] a");
  var steps = document.querySelectorAll(".guide-step[id]");
  if (stepNavLinks.length && steps.length && "IntersectionObserver" in window) {
    var linkByStep = {};
    stepNavLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      linkByStep[href.replace("#", "")] = link;
    });

    var stepObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = linkByStep[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            stepNavLinks.forEach(function (l) { l.removeAttribute("data-step-nav-active"); });
            link.setAttribute("data-step-nav-active", "true");
          }
        });
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );
    steps.forEach(function (step) { stepObserver.observe(step); });
  }

  /* Sidebar + progresso — trilha sequencial de verdade.
     Abrir uma página NUNCA conta como concluída: só o botão "Marcar como
     concluída" (data-mark-complete) grava progresso. Uma lição só fica
     clicável na sidebar quando a lição anterior da trilha foi marcada —
     ninguém pula etapa. A ordem da trilha é a própria ordem dos links
     .guide-nav-item[href] no DOM, então crescer a trilha (novas lições)
     nunca precisa de ajuste manual aqui.
     PROGRESS_KEY tem sufixo de versão: qualquer mudança no formato dos
     dados salvos deve trocar esse sufixo, pra não herdar progresso de um
     formato antigo (ex.: da época em que só visitar já marcava concluído). */
  var currentFile = window.location.pathname.split("/").pop() || "index.html";
  var navItems = document.querySelectorAll(".guide-nav-item[href]");
  var PROGRESS_KEY = "ia-na-pratica-tutorial-progress-v2";

  function readCompleted() {
    try {
      return JSON.parse(window.localStorage.getItem(PROGRESS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function writeCompleted(list) {
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(list));
    } catch (e) {
      /* localStorage indisponível — segue sem persistir */
    }
  }

  function renderTrail() {
    var completed = readCompleted();
    var trailHrefs = [];
    navItems.forEach(function (link) {
      trailHrefs.push(link.getAttribute("href").split("/").pop());
    });

    navItems.forEach(function (link, index) {
      var href = trailHrefs[index];
      var isCompleted = completed.indexOf(href) !== -1;
      var isUnlocked = index === 0 || completed.indexOf(trailHrefs[index - 1]) !== -1;

      link.classList.remove("is-active", "is-done", "is-locked");
      var parentCategory = link.closest(".guide-nav-category");
      if (parentCategory) parentCategory.classList.remove("is-active-category");

      if (href === currentFile) {
        link.classList.add("is-active");
        if (parentCategory) parentCategory.classList.add("is-active-category");
      } else if (isCompleted) {
        link.classList.add("is-done");
      } else if (!isUnlocked) {
        link.classList.add("is-locked");
      }
    });

    var doneCount = trailHrefs.filter(function (href) {
      return completed.indexOf(href) !== -1;
    }).length;
    var total = trailHrefs.length;
    var percent = total ? Math.round((doneCount / total) * 100) : 0;

    var barFill = document.querySelector("[data-progress-bar]");
    var percentLabel = document.querySelector("[data-progress-percent]");
    var stepsLabel = document.querySelector("[data-progress-label]");

    if (barFill) {
      barFill.style.width = percent + "%";
      barFill.parentElement.setAttribute("role", "progressbar");
      barFill.parentElement.setAttribute("aria-valuenow", String(percent));
      barFill.parentElement.setAttribute("aria-valuemin", "0");
      barFill.parentElement.setAttribute("aria-valuemax", "100");
    }
    if (percentLabel) percentLabel.textContent = percent + "%";
    if (stepsLabel) stepsLabel.textContent = doneCount + " de " + total + " lições concluídas";

    renderRail();

    return completed;
  }

  /* Barra fixa "Passo N de M" — numeração única por toda a trilha (não
     mais por categoria). Montada a partir de TODOS os .guide-nav-item da
     sidebar, na ordem em que aparecem — inclusive os "Em breve" sem
     link, que contam pro total mas nunca ficam clicáveis. Lê o estado
     (ativo/concluído/travado) que o loop acima já calculou pros itens
     com link, então não duplica lógica de desbloqueio aqui. */
  function renderRail() {
    var track = document.querySelector("[data-progress-rail-track]");
    var railLabel = document.querySelector("[data-progress-rail-label]");
    if (!track) return;

    var allItems = document.querySelectorAll(".guide-nav-item");
    track.innerHTML = "";

    var currentPosition = 0;
    allItems.forEach(function (item, i) {
      var position = i + 1;
      var label = item.textContent.trim();
      var href = item.getAttribute("href");
      var isCurrent = item.classList.contains("is-active");
      if (isCurrent) currentPosition = position;

      var chip = document.createElement(href ? "a" : "span");
      chip.className = "rail-step";
      chip.textContent = "P" + position;
      chip.title = label;
      if (href) {
        chip.href = href;
        if (item.classList.contains("is-locked")) chip.classList.add("is-locked");
      } else {
        chip.classList.add("is-locked");
      }
      if (isCurrent) chip.classList.add("is-current");
      else if (item.classList.contains("is-done")) chip.classList.add("is-done");

      track.appendChild(chip);
    });

    if (railLabel) {
      railLabel.innerHTML = currentPosition
        ? "Você está no <strong>Passo " + currentPosition + "</strong> de " + allItems.length
        : "<strong>" + allItems.length + " passos</strong> na trilha completa";
    }

    var activeChip = track.querySelector(".rail-step.is-current");
    if (activeChip) {
      var trackRect = track.getBoundingClientRect();
      var chipRect = activeChip.getBoundingClientRect();
      track.scrollLeft += (chipRect.left - trackRect.left) - trackRect.width / 2 + chipRect.width / 2;
    }
  }

  if (navItems.length) {
    renderTrail();
  }

  /* Botão "Marcar como concluída" — único jeito de avançar na trilha.
     Também libera o link "Próxima" da paginação, que começa travado
     sempre que a lição atual ainda não foi marcada. */
  var markBtn = document.querySelector("[data-mark-complete]");
  var nextLink = document.querySelector(".guide-pagination-next");
  var nextHasRealHref = nextLink && nextLink.getAttribute("href") && nextLink.getAttribute("href") !== "#";

  function setButtonState(isDone) {
    if (!markBtn) return;
    var label = markBtn.querySelector("[data-complete-label]");
    markBtn.setAttribute("data-completed", isDone ? "true" : "false");
    markBtn.disabled = isDone;
    if (label) label.textContent = isDone ? "Lição concluída" : "Marcar esta lição como concluída";
  }

  function setNextLinkLocked(isLocked) {
    if (!nextLink || !nextHasRealHref) return;
    nextLink.classList.toggle("is-disabled", isLocked);
    if (isLocked) {
      nextLink.setAttribute("aria-disabled", "true");
    } else {
      nextLink.removeAttribute("aria-disabled");
    }
  }

  if (markBtn) {
    var alreadyDone = readCompleted().indexOf(currentFile) !== -1;
    setButtonState(alreadyDone);
    setNextLinkLocked(nextHasRealHref && !alreadyDone);

    markBtn.addEventListener("click", function () {
      if (markBtn.getAttribute("data-completed") === "true") return;
      var completed = readCompleted();
      if (completed.indexOf(currentFile) === -1) {
        completed.push(currentFile);
        writeCompleted(completed);
      }
      setButtonState(true);
      setNextLinkLocked(false);
      if (navItems.length) renderTrail();
    });
  } else if (nextHasRealHref) {
    /* Página sem botão de conclusão (ex.: hub) — não trava a paginação. */
    setNextLinkLocked(false);
  }
})();
