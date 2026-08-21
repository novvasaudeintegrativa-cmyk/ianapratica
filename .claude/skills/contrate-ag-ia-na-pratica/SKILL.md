---
name: contrate-ag-ia-na-pratica
description: >
  Instala o squad completo de marketing no projeto (o `Maestro` e os
  três subagentes que ele coordena — `social-media`, `copywriter` e
  `designer`) e, na sequência, conduz a entrevista rápida pra escrever
  UMA peça de copy pro Instagram (carrossel, post único, legenda
  avulsa, Stories ou Reels) a partir da Persona Profunda já salva no
  projeto (docs/persona.md ou CLAUDE.md) — gera um dashboard visual com
  prévias reais nos 5 frameworks de persuasão pra escolher, e aciona o
  subagente `copywriter` pra escrever de verdade. Use quando o usuário
  pedir "contrate sua agência de marketing", "agência de marketing IA
  na Prática", "agência", "monte meu time de marketing", "monte minha
  agência de IA", "criar squad", "instalar o maestro", "instalar os
  agentes", "preparar o time", copy, legenda, caption, texto do post,
  roteiro de carrossel, roteiro de reels, criativo, gancho, hook, ideia
  de post, briefing de post, "entrevista", "nova postagem", "criar
  post", ou "quero fazer uma entrevista" — sem
  precisar de calendário nem de visual, só o texto de uma peça. Pra
  planejar várias peças de uma vez ou já sair com o visual pronto, use
  `/maestro-ia-na-pratica` em vez desta.
---

# Agência de Marketing IA na Prática — Instala o Squad e Escreve sua Primeira Peça

Duas responsabilidades numa Skill só, nessa ordem: **instalar** a
infraestrutura (Maestro + os 3 subagentes) e, na sequência, **conduzir
a entrevista** que termina num dashboard visual com prévias reais nos 5
frameworks de persuasão, até a peça final ficar pronta. Você não
escreve copy nem decide estratégia — isso é do subagente `copywriter`,
acionado no fim do processo. As regras de como escrever (formatos de
saída, frameworks, como usar a linguagem da persona, regras de ouro)
moram só nele — não duplicar aqui. Se quiser revisar/ajustar como a
copy é escrita, o lugar certo é `.claude/agents/copywriter.md`, não
este arquivo.

---

# PARTE 1 — Instalar o Squad

## O que instalar

Quatro arquivos, cada um copiado do material de apoio do curso (pasta
`scripts/templates/`) pra dentro de `.claude/`, **só se ainda não
existir** no destino:

| Peça | Origem (material de apoio) | Destino |
|------|------------------------------|---------|
| Maestro (orquestrador) | `scripts/templates/maestro-ia-na-pratica.md` | `.claude/skills/maestro-ia-na-pratica/SKILL.md` |
| Social Media | `scripts/templates/agents/social-media.md` | `.claude/agents/social-media.md` |
| Copywriter | `scripts/templates/agents/copywriter.md` | `.claude/agents/copywriter.md` |
| Designer | `scripts/templates/agents/designer.md` | `.claude/agents/designer.md` |

## Passo 1: Verificar o que já existe

Checar cada um dos 4 destinos da tabela acima. Não reinstalar o que já
existir — nunca sobrescrever um arquivo que o usuário (ou uma sessão
anterior) já tenha customizado.

## Passo 2: Instalar o que faltar

Para cada arquivo que faltar: ler o conteúdo do arquivo de origem
correspondente e escrever no destino, criando as pastas necessárias
(`.claude/skills/maestro-ia-na-pratica/` e/ou `.claude/agents/`) se não
existirem. Não perguntar antes — instalar é o comportamento padrão,
igual à auto-persistência das outras Skills do projeto.

**Se algum arquivo de origem não existir** em `scripts/templates/`
(projeto sem esse material de apoio — ex. copiado sem a pasta
completa), avisar o usuário exatamente qual peça faltou e parar. Nunca
inventar o conteúdo de um subagente ou do Maestro na hora — eles são
peças cuidadosamente calibradas, não algo pra gerar de improviso.

## Passo 3: Relatório rápido

Mostrar um resumo curto do que foi instalado, tipo:

```
Contratando sua Agência de Marketing...
✓ Maestro (já existia)
✓ Social Media — instalado agora
✓ Copywriter — instalado agora
✓ Designer — instalado agora
```

Se todos os 4 já existiam, encurtar pra uma frase: "Sua agência já
estava toda montada — nada pra instalar." Sem enrolação.

**Não perguntar se a pessoa quer continuar — só seguir direto pra Parte
2.** O objetivo desta Skill é chegar ao dashboard de verdade, não só
deixar arquivos instalados e parar.

---

# PARTE 2 — Entrevista e Dashboard de Escolha

**Pré-requisito:** precisa do subagente `copywriter`, que a Parte 1
acabou de garantir que existe em `.claude/agents/copywriter.md`. Se por
algum motivo ainda não existir (ex. faltou o material de apoio), parar
aqui — não assumir o papel de escrever a copy você mesmo.

## Árvore de Decisão

```
Pedido do Usuário
|
|-- "carrossel" / "roteiro de carrossel" / "slides"
|   --> formato pré-conhecido = carrossel
|
|-- "post" / "post único" / "post de imagem" / "feed"
|   --> formato pré-conhecido = post único (Feed)
|
|-- "legenda" / "caption" (sem imagem associada)
|   --> formato = legenda avulsa (pula o dashboard — ver nota abaixo)
|
|-- "stories" / "sequência de stories"
|   --> formato pré-conhecido = Stories
|
|-- "reels" / "vídeo curto" / "roteiro de vídeo"
|   --> formato pré-conhecido = Reels
|
|-- "semana" / "pacote" / "calendário" / "vários posts" / "quero o visual também"
|   --> isso é campanha, não peça única — redirecionar pro `/maestro-ia-na-pratica`
```

"Formato pré-conhecido" só pré-seleciona o botão certo no dashboard
(Passo B) — o usuário ainda pode trocar lá. Se o pedido não deixar o
formato claro, nenhum botão vem pré-selecionado, e a pessoa escolhe no
dashboard.

**Legenda avulsa é a única exceção que pula o dashboard inteiro:** ela
já gera 3 variações de tom (Direta/Storytelling/Pergunta) por conta
própria no `copywriter`, e não tem representação visual — nesse caso,
seguir direto pro Passo Z (geração final), sem frameworks nem
dashboard.

---

## Passo A1: Carregar a Persona (OBRIGATÓRIO)

1. Procurar `docs/persona.md` na raiz do projeto.
2. Se não existir, procurar a seção `## Persona do meu negócio` no
   `CLAUDE.md`.
3. **Se nenhum dos dois existir:** parar aqui. Avisar o usuário:
   > "Ainda não encontrei a persona do seu negócio salva neste projeto.
   > Antes de escrever copy, preciso que você rode o `/persona`
   > primeiro — copy sem persona vira texto genérico, e isso não converte.
   > Quer rodar ela agora?"
   Não inventar persona nem seguir em frente sem esse passo.
4. **Se existir:** extrair um resumo compacto (top dores, top desejos,
   frases que a persona usa, frase de qualificação) — é isso que vai no
   prompt do subagente, não o documento inteiro.

## Passo A2: Verificar se já existe um calendário ativo

Antes de perguntar tudo do zero, procurar `Instagram/calendario-*.md`.
Se existir e alguma linha ainda `Planejado` bater com o pedido do
usuário (mesmo tema/formato), usar objetivo, tema/gancho e CTA já
definidos ali em vez de perguntar de novo — só confirmar com o usuário
em uma frase ("Achei isso no calendário de [período]: [resumo da
linha]. É essa peça?"). Guardar a referência (arquivo + identificador
da linha) pra repassar ao `copywriter` no Passo Z.

Se não existir calendário, ou nada bater com o pedido, seguir pro Passo
A3 normalmente — isso é uma peça avulsa, sem referência de calendário.

## Passo A3: Fechar objetivo, tema e CTA com o usuário

Perguntar apenas o que **não** estiver claro no pedido (ou não veio do
calendário no Passo A2):

| Campo | Pergunta | Exemplo |
|-------|----------|---------|
| **Objetivo** | Esse conteúdo é pra educar, vender, gerar identificação ou só engajar? | "Vender vaga da próxima turma" |
| **Tema/gancho** (opcional) | Sobre o que é esse post especificamente? Se não tiver algo em mente, tudo bem — a persona já tem dores e desejos mapeados, posso partir de um deles. | "A objeção de que 'IA é complicado'" |
| **CTA desejado** | O que a pessoa deve fazer ao final? | "Comentar QUERO" |

**Se o usuário não der um tema:** não insistir nem forçar escolha de
uma lista — seguir sem tema definido. É o `copywriter` (Passo B) quem
escolhe a dor/desejo/gatilho mais relevante da persona pra esse
objetivo, já que ele recebe a persona inteira de qualquer forma — pedir
a pessoa escolher antes disso seria repetir um trabalho que a Persona
Profunda já fez.

**Regra:** um post = um objetivo só. Se o pedido misturar vender +
educar + engajar na mesma peça, avisar que isso dilui a mensagem e
sugerir separar em peças distintas (o que já significa que virou
campanha — redirecionar pro `/maestro-ia-na-pratica`).

**Se o objetivo for "educar" ou o formato for "legenda avulsa":** pular
os Passos B-D (frameworks e dashboard não se aplicam — ver regra em
`copywriter.md`) e ir direto pro Passo Z.

## Passo B: Gerar prévia só do framework recomendado

Só chega aqui se o objetivo for vender, gerar identificação ou engajar.
Gerar todos os 5 de uma vez é caro (5 chamadas) e a maioria fica sem
uso — só gerar sob demanda quando o aluno pedir.

1. Definir a recomendação por objetivo: `vender` → **PAS**, `engajar` →
   **AIDA**, `identificação` → **BAB**. PASTOR e 4 Ps nunca vêm
   pré-recomendados (são mais situacionais).
2. Acionar a ferramenta `Agent` com `subagent_type: copywriter`, **uma
   única vez**, só pro framework recomendado: "modo prévia" + esse
   framework + tema (**ou "sem tema — escolha a dor/desejo mais
   relevante da persona pra esse objetivo" se o usuário não deu um**) +
   objetivo + CTA + persona resumida.
3. Guardar as 3 variações devolvidas, e **se o tema veio em branco,
   guardar também qual dor/desejo o `copywriter` escolheu** (ele
   informa isso no relatório — ver `copywriter.md` → "Modo Prévia") —
   é esse texto que vai substituir `{{TEMA}}` no dashboard (Passo C),
   não deixar em branco lá. Os outros 4 frameworks ficam sem prévia
   gerada — o dashboard mostra eles como "ainda não gerado", com botão
   pro aluno pedir quando quiser (ver Passo D).

## Passo C: Montar e abrir o Dashboard de Escolha

1. Ler o template em `scripts/templates/dashboard-escolha.html`.
2. Substituir os placeholders de topo:
   - `{{TEMA}}`, `{{OBJETIVO}}`
   - `{{NEGOCIO}}` — nome do produto/negócio. Ler a primeira linha
     (`# Persona Master — [Nome]`) de `docs/persona.md` e usar o que vem
     depois do "—". Se não conseguir extrair, usar "Sua Marca".
   - **Badge de recomendado e motivo:** o template já nasce com os 5
     badges (`data-fw-badge="[Framework]"`) e os 5 parágrafos de motivo
     (`data-fw-reason="[Framework]"`, já com o texto persuasivo pronto,
     ex. o card do PAS cita o Alex Hormozi) escondidos com `class="...
     hidden"` — proposital, pra nunca aparecer mais de um "Recomendado"
     por engano. Achar o framework recomendado no Passo B e remover a
     palavra `hidden` de **ambos** elementos daquele framework (o badge
     E o motivo) — os outros quatro ficam como estão, com os dois
     escondidos.
   - `{{SEL_FEED}}`, `{{SEL_CARROSSEL}}`, `{{SEL_STORYREELS}}` — se a
     árvore de decisão já sabia o formato, esse recebe `"selected"` e os
     outros dois `""`; se não sabia nenhum, todos `""`. Quando um deles
     receber `"selected"`, também remover `hidden` do `<span
     class="fmt-rec hidden" data-fmt-rec="[Formato]">` correspondente
     (mesmo padrão do badge de framework — mostra "(Recomendado)" só
     nesse botão).
   - `{{FMT_PRESELECT}}` **e a nota de pré-seleção:** só quando um
     formato veio pré-conhecido da árvore de decisão. Substituir
     `{{FMT_PRESELECT}}` pelo nome do formato (ex. "Carrossel") e
     remover `hidden` de `<p class="preselect-note hidden"
     id="preselectNote">` — isso deixa explícito PRA PESSOA por que
     aquele botão já veio marcado (evita o impacto de "por que já
     escolheram por mim?"). **Se nenhum formato veio pré-conhecido**,
     deixar a nota escondida e não se preocupar em substituir
     `{{FMT_PRESELECT}}` (ela nunca vai aparecer de qualquer forma).
   - `{{META_SETUP_LINK}}` — caminho relativo (ou `file://` absoluto) pra
     `tutorial/setup-instagram-skill.html`.
   - `{{RESULT_LINKS}}` — deixar vazio na primeira geração (é preenchido
     só no Passo F, depois da peça final existir).
   - `{{PAS_PIECES}}`, `{{AIDA_PIECES}}`, `{{BAB_PIECES}}`,
     `{{PASTOR_PIECES}}`, `{{4PS_PIECES}}` — a lista de peças finais já
     criadas com cada framework (ver "Contar peças por framework"
     abaixo). Numa entrevista nova, quase sempre vazio (`""`) — só vem
     preenchido se já existirem peças de entrevistas anteriores.

**Contar peças por framework (usado aqui e nos Passos D e Z):** procurar
todos os arquivos `Instagram/*/*/legenda.md` e `Instagram/*/*/roteiro.md`,
ler a primeira linha de cada um (`Framework: [X]`) e agrupar por
framework. Limite: **3 peças por framework**. Pra cada peça encontrada,
renderizar um chip:
```html
<div class="piece-chip">
  <a href="[Formato]/[Código]/[arquivo].md">📄 [Formato] [Número]</a>
  <button class="piece-del" data-piece="[Formato]/[Código]">🗑️</button>
</div>
```
("[Formato] [Número]" = ex. "Feed 01", tirado do código `Feed/F01`.) Se o
formato tiver visual já gerado, o link pode apontar pro PNG em vez do
`.md`. Antes dos chips, uma linha de contagem:
`<p class="pieces-count">📦 Peças criadas: [N]/3</p>`. Se `N` for 3,
trocar por `<p class="pieces-full">⚠️ Limite atingido — apague uma pra
criar outra.</p>` antes dos chips.

3. Substituir o corpo de cada card (`{{PAS_BODY}}`, `{{AIDA_BODY}}`,
   `{{BAB_BODY}}`, `{{PASTOR_BODY}}`, `{{4PS_BODY}}`) por um dos dois
   blocos:

   **Framework já gerado** (só o recomendado, na primeira vez):
   ```html
   <div class="variations">
     <div class="variation" data-text="[variação 1, aspas escapadas como &quot;]">[variação 1]</div>
     <div class="variation" data-text="[variação 2]">[variação 2]</div>
     <div class="variation" data-text="[variação 3]">[variação 3]</div>
   </div>
   <button class="regen" data-fw-name="[Framework]">🔄 Gerar de novo esse card</button>
   ```

   **Framework ainda não gerado** (os outros 4, na primeira vez):
   ```html
   <p class="placeholder">Ainda não gerado — clique abaixo pra ver 3 prévias reais nesse framework.</p>
   <button class="regen primary" data-fw-name="[Framework]">✨ Gerar prévia desse framework</button>
   ```
4. Salvar o resultado em `Instagram/dashboard-escolha.html`.
5. **Abrir automaticamente no navegador padrão**, via `Bash` ou
   `PowerShell`:
   ```
   powershell -Command "Start-Process 'Instagram/dashboard-escolha.html'"
   ```
6. **Mostrar um popup nativo do Windows** avisando que o dashboard está
   pronto — a aba do navegador pode abrir sem chamar atenção (atrás de
   outras janelas), então esse popup é o aviso que a pessoa realmente vê.
   Via `PowerShell`:
   ```powershell
   Add-Type -AssemblyName System.Windows.Forms
   [System.Windows.Forms.MessageBox]::Show("Seu dashboard está pronto! Já abri no navegador.", "IA na Prática", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
   ```
   Isso é bloqueante (a pessoa precisa clicar OK) — de propósito, é o que
   garante que ela realmente viu o aviso antes de continuar.
7. Avisar o usuário no chat também: "Abri o dashboard com uma prévia
   real no framework recomendado ([Framework]). Quer ver os outros?
   Clique em 'Gerar prévia desse framework' no card que quiser. Quando
   escolher uma variação + um formato, copie a escolha (botão no final
   da página) e cole aqui pra eu gerar a peça de verdade."

## Passo D: Interpretar o retorno do usuário

Quatro respostas possíveis (o usuário cola o que copiou do dashboard, ou
escreve em português livre — interpretar a intenção, não exigir o texto
exato):

**(a) Pedido de gerar/regenerar um card específico** (ex. "Gerar prévia
do card PASTOR", "Regenerar o card PAS" — é a mesma ação nos dois casos):
acionar `copywriter` em modo prévia só pra esse framework, e atualizar
`Instagram/dashboard-escolha.html`: reler o arquivo, achar o card daquele
framework e trocar o corpo dele pelo bloco "Framework já gerado" (ver
Passo C.3) com as 3 variações novas — não importa se ele já tinha
variações antes (regenerar) ou não (primeira vez), o resultado é o
mesmo bloco. Salvar e avisar: "Atualizei o card [Framework] — dá um
refresh (F5) na aba do dashboard pra ver." Não precisa reabrir o
navegador.

**(b) Confirmação de escolha** (formato + framework + texto-base,
mesmo que em palavras soltas): seguir pro Passo Z com essas informações.

**(c) Pedido de apagar uma peça** (ex. "Apagar a peça Feed/F01"):

1. Confirmar rapidinho se o pedido não veio com o código exato ("Apagar
   qual? Feed 01 ou Feed 02?").
2. Apagar a pasta `Instagram/[Formato]/[Código]/` inteira.
3. Se essa peça tinha referência de calendário (procurar a linha em
   `Instagram/calendario-*.md` com esse Código), limpar a coluna Código
   de volta pra `—` e Status pra `Planejado` — a linha volta a ficar
   disponível pro `social-media`/`copywriter` reaproveitarem.
4. Atualizar `Instagram/dashboard-escolha.html`: reler o arquivo, achar
   `{{X_PIECES}}` (a lista já renderizada) do framework daquela peça,
   remover o chip correspondente, e atualizar a contagem (`N/3`) — se
   estava em "Limite atingido" (3/3), volta a mostrar o botão normal de
   gerar mais uma.
5. Avisar: "Apaguei [Formato] [Número]. Já pode criar outra peça com
   [Framework] se quiser — é só voltar no dashboard (F5) e usar a mesma
   escolha de antes, ou pedir uma prévia nova."

**(d) Pedido de calendário** (ex. "Quero um calendário semanal de
conteúdo", "Quero um calendário mensal de conteúdo"): isso não é mais
peça única, é campanha — não seguir pro Passo Z. Perguntar só a meta do
período ("Qual a meta desse período? Ex: 'vender a turma de outubro',
'aquecer lançamento', 'crescer seguidores'") e então acionar `Maestro`
(Fluxo 4: Só Calendário) com a persona resumida (Passo A1), o período
(semanal/mensal, conforme o botão clicado) e essa meta.

## Passo Z: Acionar o subagente pra escrita final

0. **Checar o limite de 3 por framework** (ver "Contar peças por
   framework" no Passo C): se o framework escolhido já tem 3 peças
   ativas, **não gerar** — avisar: "Você já tem 3 peças com [Framework]
   ([Formato] 01, 02, 03). Apague uma antes de criar outra — é só clicar
   no 🗑️ ao lado dela no dashboard." e parar aqui.
1. **Se o formato escolhido for Reels** e ainda não souber duração/áudio,
   perguntar agora (não antes — só faz sentido perguntar depois que o
   formato foi confirmado):

   | Campo | Pergunta | Exemplo |
   |-------|----------|---------|
   | **Duração** | 15, 30 ou 60 segundos? | "30 segundos" |
   | **Áudio** | Áudio/trend em alta, narração original, ou só texto na tela sem fala? | "Trend em alta" |

2. Chamar a ferramenta `Agent` com `subagent_type: copywriter` (modo
   normal, não prévia), passando: o resumo da persona (Passo A1) + o
   briefing fechado (Passo A3: objetivo, CTA, e o **tema já resolvido** —
   o que o usuário deu, ou a dor/desejo que o `copywriter` escolheu
   sozinho no Passo B se ficou em branco; nunca deixar escolher de novo
   aqui, senão diverge do que a pessoa já aprovou no dashboard) +
   formato + framework escolhidos (Passo D) + o texto-base aprovado no
   dashboard como direção/inspiração (o Copywriter não precisa
   reescrever do zero — pode refinar essa variação já validada) + a
   referência de calendário, se achou uma no Passo A2. O subagente
   escreve a peça completa, salva dentro de
   `Instagram/[Formato]/[Código]/legenda.md` (ou `roteiro.md` pra
   Carrossel/Stories/Reels), atualiza a linha do calendário se
   aplicável, e devolve o resultado — apresentar esse resultado ao
   usuário como veio, sem reescrever por cima.

## Passo E: Visual (se o formato tiver)

Ao final, sempre oferecer (exceto pra Reels e legenda avulsa, que não têm
representação visual estática — o Designer não cobre nenhum dos dois):

> "Copy pronta! Quer que eu já monte a prévia visual dessa peça (aciono o
> Designer) ou prefere revisar o texto primeiro?"

Se o usuário quiser o visual, é o momento de sugerir rodar
`/maestro-ia-na-pratica` com essa mesma peça (ele coordena Copywriter →
Designer) em vez de tentar acionar o Designer direto por aqui —
repassando o código da peça (ex. `Feed/F02`) e a referência de
calendário, se houver.

## Passo F: Atualizar o dashboard com os links do resultado

Depois que a peça final (e o visual, se houver) estiverem prontos:

1. Reabrir `Instagram/dashboard-escolha.html`.
2. Preencher a seção `{{RESULT_LINKS}}` (dentro de `<div class="links">`)
   com links reais pro que foi gerado — remover a classe `hidden` dessa
   div. Exemplos de link, conforme o que existir:
   - `<a href="Feed/F02/slides/slide-1.png">Ver a imagem do Feed</a>`
   - `<a href="Carrossel/C02/slides/">Ver as imagens do Carrossel</a>`
   - `<a href="Reels/R01/roteiro.md">Ver o roteiro do Reels</a>` (sem
     vídeo ainda — Remotion entra numa etapa futura)
3. **Adicionar o novo chip** na lista `{{[Framework]_PIECES}}` do
   framework que acabou de ser usado (ver o formato do chip no Passo C)
   e atualizar a contagem `N/3` — sem apagar os chips que já estavam lá.
4. Salvar e avisar o usuário que o dashboard foi atualizado com os links
   e a peça já aparece na lista do card daquele framework (não precisa
   reabrir o navegador de novo — se a aba já estava aberta, um refresh
   mostra tudo novo).
5. **Mostrar o mesmo popup nativo do Windows** do Passo C.6, agora
   avisando que a peça final está pronta:
   ```powershell
   Add-Type -AssemblyName System.Windows.Forms
   [System.Windows.Forms.MessageBox]::Show("Sua peça está pronta! [Formato] [Número] — dá um refresh no dashboard pra ver.", "IA na Prática", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
   ```
