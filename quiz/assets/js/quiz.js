(function () {
  "use strict";

  var form = document.getElementById("quiz-form");
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll("[data-quiz-step]"));
  // Passos numerados (exclui "done" da contagem de progresso)
  var numberedSteps = steps.filter(function (s) {
    return /^\d+$/.test(s.getAttribute("data-quiz-step"));
  });
  var TOTAL = numberedSteps.length;

  var progressRail = document.querySelector("[data-quiz-progress-rail]");
  var progressBar = document.querySelector("[data-quiz-progress-bar]");
  var progressLabel = document.querySelector("[data-quiz-progress-label]");
  var progressPercent = document.querySelector("[data-quiz-progress-percent]");

  var answers = {};
  var currentKey = "1"; // "1".."10" | "done"

  function stepByKey(key) {
    return steps.find(function (s) {
      return s.getAttribute("data-quiz-step") === key;
    });
  }

  function showStep(key) {
    steps.forEach(function (s) {
      s.hidden = s.getAttribute("data-quiz-step") !== key;
    });
    currentKey = key;

    var isNumbered = /^\d+$/.test(key);
    if (progressRail) progressRail.hidden = !isNumbered;
    if (isNumbered) {
      var n = parseInt(key, 10);
      var pct = Math.round((n / TOTAL) * 100);
      if (progressBar) progressBar.style.width = pct + "%";
      if (progressLabel) progressLabel.textContent = "Pergunta " + n + " de " + TOTAL;
      if (progressPercent) progressPercent.textContent = pct + "%";
    }

    var active = stepByKey(key);
    if (active) {
      var backBtn = active.querySelector("[data-quiz-back]");
      if (backBtn) backBtn.classList.toggle("is-visible", key !== "1" && isNumbered);
      var firstField = active.querySelector("input:not([hidden])");
      if (firstField) {
        window.setTimeout(function () {
          firstField.focus();
        }, 50);
      }
    }
    window.scrollTo({ top: active ? active.closest(".quiz-shell").offsetTop - 80 : 0, behavior: "smooth" });
  }

  function nextKey(key) {
    var n = parseInt(key, 10);
    return n >= TOTAL ? "done" : String(n + 1);
  }

  function prevKey(key) {
    var n = parseInt(key, 10);
    return n <= 1 ? "1" : String(n - 1);
  }

  /* ---------- Campos de texto (1-5) ---------- */
  /* Telefone BR: (DD) DDDD-DDDD ou (DD) DDDDD-DDDD, formatado enquanto
     digita. Só dígitos contam pra validação -- 10 (fixo) ou 11 (celular,
     com o 9) dígitos é o único formato aceito. */
  function maskPhoneBR(value) {
    var digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.length ? "(" + digits : "";
    var splitAt = digits.length > 10 ? 7 : 6;
    var head = "(" + digits.slice(0, 2) + ") " + digits.slice(2, splitAt);
    var tail = digits.slice(splitAt);
    return tail ? head + "-" + tail : head;
  }

  var whatsappInput = form.querySelector('[data-quiz-field="whatsapp"]');
  var whatsappError = form.querySelector('[data-quiz-error="whatsapp"]');

  form.querySelectorAll("[data-quiz-field]").forEach(function (input) {
    input.addEventListener("input", function () {
      if (input === whatsappInput) {
        var caretWasAtEnd = input.selectionStart === input.value.length;
        input.value = maskPhoneBR(input.value);
        if (caretWasAtEnd) input.setSelectionRange(input.value.length, input.value.length);
        input.classList.remove("is-invalid");
        if (whatsappError) whatsappError.hidden = true;
      }
      answers[input.getAttribute("data-quiz-field")] = input.value.trim();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        var step = input.closest("[data-quiz-step]");
        var nextBtn = step.querySelector("[data-quiz-next], [data-quiz-submit]");
        if (nextBtn) nextBtn.click();
      }
    });
  });

  /* ---------- Opções de múltipla escolha ---------- */
  form.querySelectorAll("[data-quiz-options]").forEach(function (group) {
    var field = group.getAttribute("data-quiz-options");
    var otherField = group.getAttribute("data-quiz-other");
    var otherInput = otherField
      ? form.querySelector('[data-quiz-field="' + otherField + '"]')
      : null;

    group.querySelectorAll(".quiz-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        group.querySelectorAll(".quiz-option").forEach(function (b) {
          b.removeAttribute("data-selected");
        });
        btn.setAttribute("data-selected", "true");
        answers[field] = btn.getAttribute("data-value");

        if (otherInput) {
          var isOther = btn.hasAttribute("data-is-other");
          otherInput.hidden = !isOther;
          if (isOther) {
            otherInput.focus();
          } else {
            otherInput.value = "";
            answers[otherField] = "";
          }
        }
      });
    });

    if (otherInput) {
      otherInput.addEventListener("input", function () {
        answers[otherField] = otherInput.value.trim();
      });
    }
  });

  /* ---------- Validação do passo atual ---------- */
  function currentStepValid() {
    var step = stepByKey(currentKey);
    if (!step) return true;

    var textField = step.querySelector("input[data-quiz-field]:not(.quiz-other-input)");
    if (textField && textField.required) {
      if (!textField.value.trim()) {
        textField.focus();
        textField.reportValidity();
        return false;
      }
      if (textField.type === "email" && !textField.checkValidity()) {
        textField.reportValidity();
        return false;
      }
      if (textField === whatsappInput) {
        var digits = textField.value.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 11) {
          textField.classList.add("is-invalid");
          if (whatsappError) whatsappError.hidden = false;
          textField.focus();
          return false;
        }
      }
    }

    var optionsGroup = step.querySelector("[data-quiz-options]");
    if (optionsGroup) {
      var field = optionsGroup.getAttribute("data-quiz-options");
      if (!answers[field]) {
        return false;
      }
      var otherField = optionsGroup.getAttribute("data-quiz-other");
      if (otherField && answers[field] === "Outro" && !answers[otherField]) {
        var otherInput = form.querySelector('[data-quiz-field="' + otherField + '"]');
        if (otherInput) otherInput.focus();
        return false;
      }
    }

    return true;
  }

  /* ---------- Navegação ---------- */
  form.querySelectorAll("[data-quiz-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!currentStepValid()) return;
      showStep(nextKey(currentKey));
    });
  });

  form.querySelectorAll("[data-quiz-back]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showStep(prevKey(currentKey));
    });
  });

  /* ---------- Envio final ----------
     TODO(Supabase): trocar esse bloco pela chamada real assim que
     tivermos a Project URL + anon key do projeto Supabase já usado
     no CRM. Formato sugerido da tabela "clientes_qualificados":
       nome, empresa, cargo, whatsapp, email, objetivo, objetivo_outro,
       desafio, desafio_outro, tamanho, investimento, prazo,
       criado_em (default now()).
     Por enquanto, salva local (localStorage) pra não perder a resposta
     enquanto a conexão não existe, e sempre mostra a tela de
     confirmação pro usuário (igual ficaria com o Supabase ligado). */
  function submitQuiz(data) {
    try {
      var key = "quiz_submissions";
      var existing = JSON.parse(window.localStorage.getItem(key) || "[]");
      existing.push(Object.assign({}, data, { criado_em: new Date().toISOString() }));
      window.localStorage.setItem(key, JSON.stringify(existing));
    } catch (err) {
      /* localStorage indisponível (modo privado etc.) -- não bloqueia o fluxo */
    }
    return Promise.resolve();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!currentStepValid()) return;
    submitQuiz(answers).then(function () {
      showStep("done");
    });
  });

  showStep("1");
})();
