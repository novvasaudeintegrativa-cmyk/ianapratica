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

  /* ---------- Diagnóstico (baseado em regras, sem IA) ----------
     TODO(IA real): se um dia trocarmos isso por análise de verdade via
     Claude, essa função vira o fallback caso a chamada à Vercel
     Function falhe -- a API key da Anthropic NUNCA pode ir direto pro
     JS do navegador (vazaria pra qualquer um que ver o código-fonte);
     precisa de uma função server-side guardando a chave. */
  var OBJETIVO_FOCO = {
    "Aumentar vendas e faturamento": "aumentar vendas e faturamento",
    "Gerar mais clientes através da internet": "gerar mais clientes pela internet",
    "Melhorar posicionamento da marca": "fortalecer o posicionamento da marca",
    "Automatizar processos internos": "automatizar processos internos",
    "Reduzir custos operacionais": "reduzir custos operacionais"
  };

  var DESAFIO_DIAGNOSTICO = {
    "Poucos clientes chegando": "o gargalo está na geração de demanda — pouca gente nova conhecendo o que você faz",
    "Baixa conversão de vendas": "o gargalo está na conversão — as pessoas chegam, mas não fecham",
    "Marketing sem resultados claros": "falta clareza sobre o que está (ou não) trazendo retorno no marketing",
    "Equipe comercial sem previsibilidade": "o processo comercial ainda não é previsível — o resultado varia demais de mês pra mês",
    "Falta de estratégia digital": "falta uma estratégia digital clara amarrando as ações"
  };

  var DESAFIO_ACOES = {
    "Poucos clientes chegando": [
      "Mapear os canais de aquisição com melhor custo-benefício pro seu segmento",
      "Criar um fluxo de conteúdo consistente pra atrair audiência qualificada"
    ],
    "Baixa conversão de vendas": [
      "Revisar a jornada do cliente até o fechamento, ponto a ponto",
      "Automatizar o acompanhamento (follow-up) dos leads que não convertem de primeira"
    ],
    "Marketing sem resultados claros": [
      "Definir métricas simples pra medir o que importa, não vaidade",
      "Organizar um painel único com os números que realmente guiam decisão"
    ],
    "Equipe comercial sem previsibilidade": [
      "Estruturar um processo comercial repetível, com etapas claras",
      "Usar IA pra qualificar leads antes de chegar no time comercial — igual esse quiz faz"
    ],
    "Falta de estratégia digital": [
      "Fechar um plano de 90 dias com prioridades claras",
      "Conectar marketing e automação num fluxo só, em vez de ferramentas soltas"
    ]
  };

  var TAMANHO_NOTA = {
    "Apenas eu": "Como você toca o negócio sozinho(a), o ganho mais rápido tende a vir de automação — tirar trabalho repetitivo das suas mãos antes de qualquer coisa.",
    "2 a 10 funcionários": "Com um time pequeno, o ganho mais rápido costuma vir de padronizar processos pra não depender de uma pessoa só.",
    "11 a 50 funcionários": "Nesse porte, geralmente já dá pra estruturar um processo e uma ferramenta dedicados a isso.",
    "51 a 200 funcionários": "Nesse porte, o desafio normalmente é mais de integração entre áreas do que de execução isolada.",
    "Mais de 200 funcionários": "Nesse porte, a prioridade costuma ser padronizar e escalar o que já funciona em partes da operação."
  };

  var PRAZO_CTA = {
    "Quero começar imediatamente": "Como você quer começar já, o próximo passo é marcar uma conversa ainda essa semana.",
    "Nos próximos 30 dias": "Dá tempo de planejar direito — vamos te chamar pra uma conversa ainda esse mês.",
    "Nos próximos 3 meses": "Com esse prazo, vale a pena já ir se organizando — fica de olho no WhatsApp que vamos trazer um direcionamento.",
    "Apenas pesquisando": "Sem pressa nenhuma — fica à vontade pra nos chamar quando fizer sentido pra você."
  };

  function buildDiagnosis(a) {
    var primeiroNome = (a.nome || "").trim().split(/\s+/)[0] || "";

    var objetivoTexto =
      a.objetivo === "Outro" && a.objetivo_outro
        ? a.objetivo_outro
        : OBJETIVO_FOCO[a.objetivo] || "crescer de forma mais estruturada";

    var desafioDiag =
      a.desafio === "Outro" && a.desafio_outro
        ? 'o principal ponto que você trouxe foi: "' + a.desafio_outro + '"'
        : DESAFIO_DIAGNOSTICO[a.desafio] || "ainda falta clareza sobre o próximo passo";

    var acoes = DESAFIO_ACOES[a.desafio] || [
      "Mapear onde está o maior ponto de perda hoje",
      "Definir um próximo passo concreto pra essa semana"
    ];

    var tamanhoNota = TAMANHO_NOTA[a.tamanho] || "";
    var prazoCta = PRAZO_CTA[a.prazo] || "Vamos entrar em contato pelo WhatsApp em breve.";

    var titulo = primeiroNome
      ? primeiroNome + ", aqui está seu direcionamento inicial:"
      : "Aqui está seu direcionamento inicial:";

    var texto = (
      "Seu objetivo agora é " + objetivoTexto + ", e pelo que você descreveu, " + desafioDiag + ". " + tamanhoNota
    ).trim();

    return { titulo: titulo, texto: texto, acoes: acoes, cta: prazoCta };
  }

  function renderDiagnosis(a) {
    var diag = buildDiagnosis(a);
    var titleEl = document.querySelector("[data-quiz-diagnosis-title]");
    var textEl = document.querySelector("[data-quiz-diagnosis-text]");
    var listEl = document.querySelector("[data-quiz-diagnosis-list]");
    var ctaEl = document.querySelector("[data-quiz-diagnosis-cta]");
    var emailBtn = document.querySelector("[data-quiz-email-btn]");

    if (titleEl) titleEl.textContent = diag.titulo;
    if (textEl) textEl.textContent = diag.texto;
    if (listEl) {
      listEl.innerHTML = "";
      diag.acoes.forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item;
        listEl.appendChild(li);
      });
    }
    if (ctaEl) ctaEl.textContent = diag.cta;

    /* "Enviar pro e-mail" via mailto: -- funciona de verdade hoje (abre
       o cliente de e-mail da própria pessoa, já escrito), sem precisar
       de nenhum serviço de envio automático configurado. */
    if (emailBtn) {
      var subject = "Seu diagnóstico gratuito — IA na Prática";
      var bodyLines = [diag.titulo, "", diag.texto, "", "Próximos passos:"]
        .concat(diag.acoes.map(function (x) { return "- " + x; }))
        .concat(["", diag.cta]);
      var mailto =
        "mailto:" + encodeURIComponent(a.email || "") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));
      emailBtn.href = mailto;
    }
  }

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
      renderDiagnosis(answers);
      showStep("done");
    });
  });

  showStep("1");
})();
