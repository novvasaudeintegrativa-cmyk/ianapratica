---
name: entrevistador-ia-na-pratica
description: >
  Porta de entrada rápida pra escrever UMA peça de copy pro Instagram
  (carrossel, post único, legenda avulsa, Stories ou Reels) a partir da
  Persona Profunda já salva no projeto (docs/persona.md ou CLAUDE.md).
  Conversa com o usuário pra fechar o briefing, gera um dashboard visual
  com prévias nos 5 frameworks de persuasão pra escolher, e aciona o
  subagente `copywriter` pra escrever de verdade. Use quando o usuário
  pedir copy, legenda, caption, texto do post, roteiro de carrossel,
  roteiro de reels, criativo, gancho, hook, ideia de post, ou briefing de
  post — sem precisar de calendário nem de visual, só o texto de uma
  peça. Pra planejar várias peças de uma vez ou já sair com o visual
  pronto, use `/maestro-ia-na-pratica` em vez desta.
---

# Entrevistador IA na Prática — Front-end Interativo do Subagente Copywriter

Seu papel é o de um pesquisador de UX antes de qualquer entrega ser
produzida: entender a necessidade real por trás do pedido, fazendo as
perguntas certas, e mostrar opções reais (não só descrição) antes de
escrever de verdade.

Esta Skill não escreve a copy final — ela **coleta o briefing com o
usuário**, gera **prévias reais nos 5 frameworks de persuasão** através
do subagente `copywriter` (modo prévia), monta um **dashboard visual**
pra escolha, e só então aciona o `copywriter` de verdade (modo normal)
pra escrever a peça definitiva. As regras de como escrever (formatos de
saída, frameworks, como usar a linguagem da persona, regras de ouro)
moram só no subagente — não duplicar aqui. Se quiser revisar/ajustar como
a copy é escrita, o lugar certo é `.claude/agents/copywriter.md`, não
este arquivo.

**Pré-requisito:** precisa do subagente `copywriter` instalado em
`.claude/agents/copywriter.md`. Se não existir, avisar o usuário e parar —
não assumir o papel de escrever a copy você mesmo.

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

"Formato pré-conhecido" só pré-seleciona o botão certo no dashboard (Passo
5) — o usuário ainda pode trocar lá. Se o pedido não deixar o formato
claro, nenhum botão vem pré-selecionado, e a pessoa escolhe no dashboard.

**Legenda avulsa é a única exceção que pula o dashboard inteiro:** ela já
gera 3 variações de tom (Direta/Storytelling/Pergunta) por conta própria
no `copywriter`, e não tem representação visual — nesse caso, seguir
direto pro Passo 3 e, depois dele, direto pro Passo 7 (geração final),
sem frameworks nem dashboard.

---

## Passo 1: Carregar a Persona (OBRIGATÓRIO)

1. Procurar `docs/persona.md` na raiz do projeto.
2. Se não existir, procurar a seção `## Persona do meu negócio` no
   `CLAUDE.md`.
3. **Se nenhum dos dois existir:** parar aqui. Avisar o usuário:
   > "Ainda não encontrei a persona do seu negócio salva neste projeto.
   > Antes de escrever copy, preciso que você rode a Skill Persona Profunda
   > primeiro — copy sem persona vira texto genérico, e isso não converte.
   > Quer rodar ela agora?"
   Não inventar persona nem seguir em frente sem esse passo.
4. **Se existir:** extrair um resumo compacto (top dores, top desejos,
   frases que a persona usa, frase de qualificação) — é isso que vai no
   prompt do subagente, não o documento inteiro.

## Passo 2: Verificar se já existe um calendário ativo

Antes de perguntar tudo do zero, procurar `Instagram/calendario-*.md`. Se
existir e alguma linha ainda `Planejado` bater com o pedido do usuário
(mesmo tema/formato), usar objetivo, tema/gancho e CTA já definidos ali em
vez de perguntar de novo — só confirmar com o usuário em uma frase ("Achei
isso no calendário de [período]: [resumo da linha]. É essa peça?").
Guardar a referência (arquivo + identificador da linha) pra repassar ao
`copywriter` no Passo 7.

Se não existir calendário, ou nada bater com o pedido, seguir pro Passo 3
normalmente — isso é uma peça avulsa, sem referência de calendário.

## Passo 3: Fechar objetivo, tema e CTA com o usuário

Perguntar apenas o que **não** estiver claro no pedido (ou não veio do
calendário no Passo 2):

| Campo | Pergunta | Exemplo |
|-------|----------|---------|
| **Objetivo** | Esse conteúdo é pra educar, vender, gerar identificação ou só engajar? | "Vender vaga da próxima turma" |
| **Tema/gancho** | Sobre o que é esse post especificamente? | "A objeção de que 'IA é complicado'" |
| **CTA desejado** | O que a pessoa deve fazer ao final? | "Comentar QUERO" |

**Regra:** um post = um objetivo só. Se o pedido misturar vender + educar +
engajar na mesma peça, avisar que isso dilui a mensagem e sugerir separar
em peças distintas (o que já significa que virou campanha — redirecionar
pro `/maestro-ia-na-pratica`).

**Se o objetivo for "educar" ou o formato for "legenda avulsa":** pular os
Passos 4-6 (frameworks e dashboard não se aplicam — ver regra em
`copywriter.md`) e ir direto pro Passo 7.

## Passo 4: Gerar prévia só do framework recomendado

Só chega aqui se o objetivo for vender, gerar identificação ou engajar.
Gerar todos os 5 de uma vez é caro (5 chamadas) e a maioria fica sem uso
— só gerar sob demanda quando o aluno pedir.

1. Definir a recomendação por objetivo: `vender` → **PAS**, `engajar` →
   **AIDA**, `identificação` → **BAB**. PASTOR e 4 Ps nunca vêm
   pré-recomendados (são mais situacionais).
2. Acionar a ferramenta `Agent` com `subagent_type: copywriter`, **uma
   única vez**, só pro framework recomendado: "modo prévia" + esse
   framework + tema + objetivo + CTA + persona resumida.
3. Guardar as 3 variações devolvidas (ver `copywriter.md` → "Modo
   Prévia") pro Passo 5. Os outros 4 frameworks ficam sem prévia
   gerada — o dashboard mostra eles como "ainda não gerado", com botão
   pro aluno pedir quando quiser (ver Passo 6).

## Passo 5: Montar e abrir o Dashboard de Escolha

1. Ler o template em `scripts/templates/dashboard-escolha.html`.
2. Substituir os placeholders de topo:
   - `{{TEMA}}`, `{{OBJETIVO}}`
   - `{{NEGOCIO}}` — nome do produto/negócio. Ler a primeira linha
     (`# Persona Master — [Nome]`) de `docs/persona.md` e usar o que vem
     depois do "—". Se não conseguir extrair, usar "Sua Marca".
   - `{{REC_PAS}}`, `{{REC_AIDA}}`, `{{REC_BAB}}`, `{{REC_PASTOR}}`,
     `{{REC_4PS}}` — o framework recomendado no Passo 4 recebe `""`
     (badge visível), os outros quatro recebem `"hidden"`.
   - `{{SEL_FEED}}`, `{{SEL_CARROSSEL}}`, `{{SEL_STORYREELS}}` — se a
     árvore de decisão já sabia o formato, esse recebe `"selected"` e os
     outros dois `""`; se não sabia nenhum, todos `""`.
   - `{{META_SETUP_LINK}}` — caminho relativo (ou `file://` absoluto) pra
     `tutorial/setup-instagram-skill.html`.
   - `{{RESULT_LINKS}}` — deixar vazio na primeira geração (é preenchido
     só no Passo 9, depois da peça final existir).
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
6. Avisar o usuário: "Abri o dashboard com uma prévia real no framework
   recomendado ([Framework]). Quer ver os outros? Clique em 'Gerar
   prévia desse framework' no card que quiser. Quando escolher uma
   variação + um formato, copie a escolha (botão no final da página) e
   cole aqui pra eu gerar a peça de verdade."

## Passo 6: Interpretar o retorno do usuário

Duas respostas possíveis (o usuário cola o que copiou do dashboard, ou
escreve em português livre — interpretar a intenção, não exigir o texto
exato):

**(a) Pedido de gerar/regenerar um card específico** (ex. "Gerar prévia
do card PASTOR", "Regenerar o card PAS" — é a mesma ação nos dois casos):
acionar `copywriter` em modo prévia só pra esse framework, e atualizar
`Instagram/dashboard-escolha.html`: reler o arquivo, achar o card daquele
framework e trocar o corpo dele pelo bloco "Framework já gerado" (ver
Passo 5.3) com as 3 variações novas — não importa se ele já tinha
variações antes (regenerar) ou não (primeira vez), o resultado é o
mesmo bloco. Salvar e avisar: "Atualizei o card [Framework] — dá um
refresh (F5) na aba do dashboard pra ver." Não precisa reabrir o
navegador.

**(b) Confirmação de escolha** (formato + framework + texto-base,
mesmo que em palavras soltas): seguir pro Passo 7 com essas informações.

## Passo 7: Acionar o subagente pra escrita final

1. **Se o formato escolhido for Reels** e ainda não souber duração/áudio,
   perguntar agora (não antes — só faz sentido perguntar depois que o
   formato foi confirmado):

   | Campo | Pergunta | Exemplo |
   |-------|----------|---------|
   | **Duração** | 15, 30 ou 60 segundos? | "30 segundos" |
   | **Áudio** | Áudio/trend em alta, narração original, ou só texto na tela sem fala? | "Trend em alta" |

2. Chamar a ferramenta `Agent` com `subagent_type: copywriter` (modo
   normal, não prévia), passando: o resumo da persona (Passo 1) + o
   briefing fechado (Passo 3: objetivo, tema, CTA) + formato + framework
   escolhidos (Passo 6) + o texto-base aprovado no dashboard como
   direção/inspiração (o Copywriter não precisa reescrever do zero — pode
   refinar essa variação já validada) + a referência de calendário, se
   achou uma no Passo 2. O subagente escreve a peça completa, salva
   dentro de `Instagram/[Formato]/[Código]/legenda.md` (ou `roteiro.md`
   pra Carrossel/Stories/Reels), atualiza a linha do calendário se
   aplicável, e devolve o resultado — apresentar esse resultado ao
   usuário como veio, sem reescrever por cima.

## Passo 8: Visual (se o formato tiver)

Ao final, sempre oferecer (exceto pra Reels e legenda avulsa, que não têm
representação visual estática — o Designer não cobre nenhum dos dois):

> "Copy pronta! Quer que eu já monte a prévia visual dessa peça (aciono o
> Designer) ou prefere revisar o texto primeiro?"

Se o usuário quiser o visual, é o momento de sugerir rodar
`/maestro-ia-na-pratica` com essa mesma peça (ele coordena Copywriter →
Designer) em vez de tentar acionar o Designer direto por aqui —
repassando o código da peça (ex. `Feed/F02`) e a referência de
calendário, se houver.

## Passo 9: Atualizar o dashboard com os links do resultado

Depois que a peça final (e o visual, se houver) estiverem prontos:

1. Reabrir `Instagram/dashboard-escolha.html`.
2. Preencher a seção `{{RESULT_LINKS}}` (dentro de `<div class="links">`)
   com links reais pro que foi gerado — remover a classe `hidden` dessa
   div. Exemplos de link, conforme o que existir:
   - `<a href="Feed/F02/slides/slide-1.png">Ver a imagem do Feed</a>`
   - `<a href="Carrossel/C02/slides/">Ver as imagens do Carrossel</a>`
   - `<a href="Reels/R01/roteiro.md">Ver o roteiro do Reels</a>` (sem
     vídeo ainda — Remotion entra numa etapa futura)
3. Salvar e avisar o usuário que o dashboard foi atualizado com os links
   (não precisa reabrir o navegador de novo — se a aba já estava aberta,
   um refresh mostra os links novos).
