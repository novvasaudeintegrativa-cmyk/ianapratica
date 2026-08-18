(function () {
  "use strict";

  /* Seletor de sistema operacional — Windows/Mac/Linux lado a lado.
     Detecta o SO automaticamente na primeira visita (navigator), depois
     lembra a escolha da pessoa (localStorage), e fica sempre clicável
     pra trocar de sistema a qualquer momento — nunca esconde os outros
     de vez, só troca qual painel de passos aparece. */
  var osButtons = document.querySelectorAll("[data-os-select]");
  var osPanels = document.querySelectorAll("[data-os-panel]");
  var osNote = document.querySelector("[data-os-note]");
  var OS_KEY = "ia-na-pratica-os-choice";
  var OS_NAMES = { windows: "Windows", mac: "Mac", linux: "Linux" };

  function detectOS() {
    var ua = (navigator.userAgent || "") + (navigator.platform || "");
    if (/Mac/i.test(ua)) return "mac";
    if (/Linux/i.test(ua) && !/Android/i.test(ua)) return "linux";
    return "windows";
  }

  function setOS(os) {
    if (!OS_NAMES[os]) return;
    osButtons.forEach(function (btn) {
      btn.setAttribute("data-os-active", String(btn.getAttribute("data-os-select") === os));
    });
    osPanels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-os-panel") !== os;
    });
    if (osNote) {
      osNote.innerHTML = "Mostrando o passo a passo para <strong>" + OS_NAMES[os] +
        "</strong>. Pode trocar a qualquer momento clicando em outro sistema acima.";
    }
    try { window.localStorage.setItem(OS_KEY, os); } catch (e) { /* segue sem persistir */ }
  }

  if (osButtons.length && osPanels.length) {
    osButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setOS(btn.getAttribute("data-os-select"));
      });
    });
    var storedOS = null;
    try { storedOS = window.localStorage.getItem(OS_KEY); } catch (e) { /* sem storage */ }
    setOS(storedOS && OS_NAMES[storedOS] ? storedOS : detectOS());
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

    var evoValue = document.querySelector("[data-evolution-value]");
    var evoMeter = document.querySelector("[data-evolution-meter]");
    var evoMessage = document.querySelector("[data-evolution-message]");
    if (evoValue) evoValue.textContent = percent + "%";
    if (evoMeter) evoMeter.style.width = percent + "%";
    if (evoMessage) {
      var remaining = total - doneCount;
      if (doneCount === 0) {
        evoMessage.textContent = "Comece agora — o primeiro passo leva só uns minutos.";
      } else if (remaining === 0) {
        evoMessage.textContent = "Trilha completa! Você terminou todos os " + total + " passos.";
      } else {
        evoMessage.textContent = "Você já concluiu " + doneCount + " de " + total +
          " passos — faltam só " + remaining + " pra terminar a trilha inteira.";
      }
    }

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

  /* Mini cards do hub (Dia 1 / Dia 2) — numeração "Passo N" sequencial
     (mesma ordem em que os itens aparecem no HTML) e um botão de
     Concluído/Não concluído por lição. Esse botão é só um registro
     pessoal: marca no mesmo localStorage que o resto do site usa, mas
     nunca trava o link de nenhuma lição — todas continuam clicáveis
     independente do estado. */
  function renderDayCards() {
    var items = document.querySelectorAll(".guide-days-grid .guide-day-item");
    if (!items.length) return;
    var completed = readCompleted();

    items.forEach(function (item, i) {
      var numEl = item.querySelector(".guide-day-item-num");
      if (numEl) {
        numEl.textContent = "Passo " + (i + 1);
      }

      var toggle = item.querySelector("[data-toggle-complete]");
      if (!toggle) return;
      var href = toggle.getAttribute("data-href");

      var applyState = function (isDone) {
        toggle.classList.toggle("done", isDone);
        toggle.classList.toggle("not-done", !isDone);
        toggle.textContent = isDone ? "Concluído" : "Não concluído";
      };
      applyState(completed.indexOf(href) !== -1);

      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var list = readCompleted();
        var idx = list.indexOf(href);
        var nowDone = idx === -1;
        if (nowDone) list.push(href);
        else list.splice(idx, 1);
        writeCompleted(list);
        applyState(nowDone);
        if (navItems.length) renderTrail();
        renderDayProgress();
      });
    });
  }
  renderDayCards();

  /* Mini-trilha por dia, no topo de cada card do hub — P1, P2... só dos
     passos daquele dia (a seção .guide-nav-section correspondente na
     sidebar já separa isso), com percentual concluído daquele dia
     específico. A cor muda pra laranja conforme avança. */
  function renderDayProgress() {
    var sections = document.querySelectorAll(".guide-nav-section");
    if (!sections.length) return;
    var completed = readCompleted();
    var dayTotals = [];

    sections.forEach(function (section, dayIndex) {
      var dayNum = dayIndex + 1;
      var track = document.querySelector('[data-day-progress-chips="' + dayNum + '"]');
      var percentLabel = document.querySelector('[data-day-progress-percent="' + dayNum + '"]');

      var items = section.querySelectorAll(".guide-nav-item");
      if (track) track.innerHTML = "";
      var doneCount = 0;

      items.forEach(function (item, i) {
        var href = item.getAttribute("href");
        var isDone = href && completed.indexOf(href) !== -1;
        if (isDone) doneCount++;

        if (!track) return;
        var chip = document.createElement(href ? "a" : "span");
        chip.className = "day-progress-chip";
        chip.textContent = "P" + (i + 1);
        chip.title = item.textContent.trim();
        if (href) {
          chip.href = href;
          if (isDone) chip.classList.add("is-done");
        } else {
          chip.classList.add("is-locked");
        }
        track.appendChild(chip);
      });

      dayTotals.push({ done: doneCount, total: items.length });

      var percent = items.length ? Math.round((doneCount / items.length) * 100) : 0;
      if (percentLabel) {
        percentLabel.textContent = percent + "% concluído (" + doneCount + " de " + items.length + ")";
      }

      /* Parabéns: só considera as lições que já existem de verdade (com
         link), ignorando os módulos "Em breve" — senão a mensagem nunca
         apareceria enquanto o curso continua crescendo. */
      var congrats = document.querySelector('[data-day-congrats="' + dayNum + '"]');
      if (congrats) {
        var realItems = section.querySelectorAll(".guide-nav-item[href]");
        var realDone = 0;
        realItems.forEach(function (item) {
          if (completed.indexOf(item.getAttribute("href")) !== -1) realDone++;
        });
        congrats.hidden = !(realItems.length > 0 && realDone === realItems.length);
      }
    });

    /* Uma trilha só: Dia 1 e Dia 2 não são metas separadas, são dois
       trechos do mesmo caminho sequencial. Uma única barra representa
       o curso inteiro; a única "separação" é um traço fino marcando
       onde o Dia 1 termina e o Dia 2 começa. */
    var daysFill = document.querySelector("[data-evolution-days-fill]");
    var daysSeam = document.querySelector("[data-evolution-days-seam]");
    if (daysFill && dayTotals.length >= 2) {
      var grandDone = dayTotals[0].done + dayTotals[1].done;
      var grandTotal = dayTotals[0].total + dayTotals[1].total;
      var grandPercent = grandTotal ? Math.round((grandDone / grandTotal) * 100) : 0;
      var seamPercent = grandTotal ? (dayTotals[0].total / grandTotal) * 100 : 50;

      daysFill.style.width = grandPercent + "%";
      if (daysSeam) daysSeam.style.left = seamPercent + "%";

      var day1Label = document.querySelector('[data-evolution-day-label="1"]');
      var day2Label = document.querySelector('[data-evolution-day-label="2"]');
      var day1Count = document.querySelector("[data-evolution-day1-count]");
      var day2Count = document.querySelector("[data-evolution-day2-count]");
      if (day1Count) day1Count.textContent = dayTotals[0].done + "/" + dayTotals[0].total;
      if (day2Count) day2Count.textContent = dayTotals[1].done + "/" + dayTotals[1].total;
      if (day2Label) day2Label.style.left = "calc(" + seamPercent + "% + 8px)";
      if (day1Label) day1Label.style.left = "0%";
    }
  }
  renderDayProgress();

  /* Zerar progresso — Dia 1, Dia 2 ou a trilha inteira, sempre com
     confirmação antes de mexer em qualquer coisa. Guarda o estado
     anterior (localStorage) pra pessoa poder "Desfazer" e voltar
     exatamente pra onde estava — inclusive depois de recarregar a
     página, já que o aviso de desfazer é restaurado a partir do que
     ficou salvo. */
  var RESET_UNDO_KEY = "ia-na-pratica-tutorial-progress-v2-undo";
  var resetButtons = document.querySelectorAll("[data-reset-scope]");
  var undoBar = document.querySelector("[data-reset-undo]");
  var undoMessage = document.querySelector("[data-reset-undo-message]");
  var undoBtn = document.querySelector("[data-reset-undo-btn]");

  function getDaySectionHrefs(dayNum) {
    var sections = document.querySelectorAll(".guide-nav-section");
    var section = sections[dayNum - 1];
    if (!section) return [];
    var hrefs = [];
    section.querySelectorAll(".guide-nav-item[href]").forEach(function (item) {
      hrefs.push(item.getAttribute("href").split("/").pop());
    });
    return hrefs;
  }

  function refreshAllViews() {
    if (navItems.length) renderTrail();
    renderDayCards();
    renderDayProgress();
  }

  function showUndo(label) {
    if (!undoBar) return;
    if (undoMessage) undoMessage.textContent = label + " zerado.";
    undoBar.hidden = false;
  }

  function hideUndo() {
    if (undoBar) undoBar.hidden = true;
    try { window.localStorage.removeItem(RESET_UNDO_KEY); } catch (e) { /* segue sem persistir */ }
  }

  if (resetButtons.length) {
    resetButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var scope = btn.getAttribute("data-reset-scope");
        var scopeLabel = scope === "all" ? "Trilha inteira" : "Dia " + scope;
        var confirmMsg = scope === "all"
          ? "Tem certeza que quer zerar a trilha inteira? Todas as lições concluídas do Dia 1 e do Dia 2 vão voltar a não concluídas."
          : "Tem certeza que quer zerar o " + scopeLabel + "? As lições concluídas desse dia vão voltar a não concluídas.";
        if (!window.confirm(confirmMsg)) return;

        var current = readCompleted();
        var snapshot = { list: current.slice(), label: scopeLabel };
        try { window.localStorage.setItem(RESET_UNDO_KEY, JSON.stringify(snapshot)); } catch (e) { /* segue */ }

        var next;
        if (scope === "all") {
          next = [];
        } else {
          var toRemove = getDaySectionHrefs(Number(scope));
          next = current.filter(function (href) { return toRemove.indexOf(href) === -1; });
        }
        writeCompleted(next);
        refreshAllViews();
        showUndo(scopeLabel);
      });
    });
  }

  if (undoBtn) {
    undoBtn.addEventListener("click", function () {
      var raw = null;
      try { raw = window.localStorage.getItem(RESET_UNDO_KEY); } catch (e) { /* sem storage */ }
      if (!raw) return;
      var snapshot;
      try { snapshot = JSON.parse(raw); } catch (e) { return; }
      writeCompleted(snapshot.list || []);
      hideUndo();
      refreshAllViews();
    });
  }

  if (undoBar) {
    var storedUndo = null;
    try { storedUndo = window.localStorage.getItem(RESET_UNDO_KEY); } catch (e) { /* sem storage */ }
    if (storedUndo) {
      try {
        showUndo(JSON.parse(storedUndo).label);
      } catch (e) {
        hideUndo();
      }
    }
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
