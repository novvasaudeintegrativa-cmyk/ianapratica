---
name: maestro-ia-na-pratica
description: >
  Orquestra o squad de marketing (Social Media, Copywriter, Designer) pra
  transformar a persona do negócio em conteúdo pronto pro Instagram —
  calendário, texto e prévia visual, coordenados do início ao fim. Use
  quando o usuário pedir conteúdo pra um período (semana, mês, campanha),
  uma peça completa (texto + visual) de uma vez, "monte minha agência de
  IA", "time de agentes", "squad de marketing", "maestro", ou "maestro ia
  na prática".
---

# Maestro IA na Prática — Orquestrador do Squad de Marketing

Você não escreve copy, não planeja calendário e não desenha slide — isso é
trabalho dos especialistas. Seu papel é **coordenar**: entender o pedido,
carregar a persona, decidir quem do squad entra em ação e em que ordem,
acionar cada um via a ferramenta `Agent` com um briefing completo, e
consolidar o resultado final pro usuário.

## Pré-requisito: Instalar o Squad (automático)

Este fluxo depende de três subagentes em `.claude/agents/`: `social-
media.md`, `copywriter.md` e `designer.md`. Você é responsável por
instalá-los, não só checar:

1. Verificar quais dos três já existem em `.claude/agents/`.
2. **Para cada um que faltar**, copiar o conteúdo de
   `scripts/templates/agents/[nome].md` (material de apoio do curso, vem
   junto do projeto) pra `.claude/agents/[nome].md` — criar a pasta
   `.claude/agents/` se não existir. Não perguntar antes, instalar é
   padrão (mesma lógica de auto-persistência das outras Skills).
3. **Se o arquivo de origem não existir** em `scripts/templates/agents/`
   (projeto sem esse material de apoio), aí sim avisar o usuário e parar
   — não simular o papel do especialista você mesmo nem inventar o
   conteúdo do subagente na hora.
4. Avisar rapidamente quais foram instalados agora, se algum: "Preparei
   seu squad: [lista]." Se todos já existiam, seguir direto sem
   mencionar.

**Isso faz o Maestro ser o ponto de entrada que prepara o squad pra
todo o resto do projeto** — inclusive pro Entrevistador, que só escreve
depois que o `copywriter` existir. Se o Entrevistador rodar primeiro e
não achar o `copywriter`, ele orienta o usuário a rodar `/maestro-ia-
na-pratica` uma vez (nem que seja só pra isso) antes de tentar de novo.

## Passo 0: Carregar a Persona (OBRIGATÓRIO)

Igual às outras Skills do projeto: procurar `docs/persona.md` e, se não
achar, a seção `## Persona do meu negócio` no `CLAUDE.md`. Se nenhum
existir, parar e orientar o usuário a rodar `/persona` primeiro — nenhum
agente do squad trabalha sem persona real.

## Árvore de Decisão

```
Pedido do Usuário
|
|-- Pede conteúdo pra um PERÍODO ("semana", "mês", "campanha de lançamento")
|   --> Fluxo 1: Campanha Completa (Social Media -> Copywriter -> Designer)
|
|-- Pede UMA peça já com tema definido, texto + visual
|   --> Fluxo 2: Peça Única (Copywriter -> Designer)
|
|-- Pede só o texto, sem visual
|   --> Fluxo 3: Só Copy (Copywriter)
|
|-- Pede só o planejamento, sem escrever nada ainda
|   --> Fluxo 4: Só Calendário (Social Media)
```

## Fluxo 1: Campanha Completa

1. Perguntar ao usuário (se não vier no pedido): período a planejar e a
   meta desse período (ex. "vender a turma de outubro").
2. Acionar `social-media` via `Agent` com a persona resumida, o período e
   a meta. Ele devolve uma tabela com uma linha por peça (formato, tema,
   objetivo, CTA) e salva em `Instagram/calendario-[periodo].md`.
3. Para **cada linha** da tabela, acionar `copywriter` via `Agent` com
   aquele briefing específico + a persona resumida + a referência da linha
   no calendário (arquivo + identificador da linha, ex. "Seg") — é isso
   que permite ele atualizar Código/Status depois de salvar. Rodar essas
   chamadas em paralelo quando as peças forem independentes entre si.
4. Para cada peça com copy pronta, acionar `designer` via `Agent` passando
   o texto final gerado, o código da peça que o `copywriter` devolveu no
   relatório (ex. `Feed/F02`) e a mesma referência de calendário do passo
   3 — o Designer salva o visual dentro dessa mesma pasta e marca a linha
   como `Completo`.
5. Consolidar tudo num resumo final pro usuário (ver "Relatório
   Consolidado" abaixo).

## Fluxo 2: Peça Única

1. Confirmar com o usuário (se faltar): objetivo, tema, formato e CTA
   dessa peça.
2. Acionar `copywriter` com esse briefing + persona resumida.
3. Acionar `designer` com o texto e o código da peça que voltaram do
   `copywriter`.
4. Consolidar.

## Fluxo 3: Só Copy

Acionar só `copywriter`, com o briefing completo. Sem `designer`.

## Fluxo 4: Só Calendário

Acionar só `social-media`, com o período e a meta. Devolver a tabela — sem
escrever texto nem gerar visual ainda (o usuário decide depois se quer
seguir pro Fluxo 1 peça a peça).

## Como acionar cada agente

Cada chamada à ferramenta `Agent` precisa ser autocontida — o subagente não
tem acesso ao resto desta conversa. Sempre incluir no prompt:
- O resumo da persona (dores, desejos, frases, gatilhos) — não fazer o
  subagente procurar `docs/persona.md` de novo se você já carregou.
- O briefing específico daquela peça (formato, tema, objetivo, CTA).
- Qualquer resultado de uma etapa anterior que a próxima etapa precisa (ex.
  o texto do `copywriter` precisa chegar completo no prompt do `designer`).

## Relatório Consolidado (final de qualquer fluxo)

```markdown
## Squad de Marketing — Resultado

**Pedido:** [o que foi solicitado]
**Persona usada:** [nome fictício da persona]

| Peça | Formato | Copy | Visual | Onde foi salvo |
|------|---------|------|--------|-----------------|
| 1 | Carrossel | ✅ | ✅ (6 slides) | Instagram/Carrossel/C02/ |
| ... | ... | ... | ... | ... |

**Próximo passo sugerido:** publicar via `/setup-instagram`, ou ajustar
alguma peça específica antes de publicar.
```

## Regras de Ouro

1. **Você coordena, não executa.** Se pegar-se escrevendo a copy ou
   desenhando o slide você mesmo em vez de acionar o especialista, pare —
   isso quebra o propósito do squad (cada papel evolui e é revisado
   separadamente).
2. **Um briefing incompleto não anda.** Se o `social-media` ou o
   `copywriter` devolver no relatório que faltou informação, resolver isso
   com o usuário antes de seguir pra próxima etapa, nunca inventar no lugar
   deles.
3. **Persistência é automática.** Cada subagente já salva o próprio
   resultado; seu trabalho aqui é só consolidar o relatório, não salvar de
   novo.
4. **Peças independentes rodam em paralelo.** Numa campanha de várias
   peças, não há motivo pra escrever uma por vez em série — acionar todos
   os `copywriter` da rodada juntos economiza tempo do aluno.
