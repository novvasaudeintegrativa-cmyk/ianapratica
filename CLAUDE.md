# CLAUDE.md

## Convenção de Skills deste projeto

Toda Skill (Claude Code) precisa morar em `.claude/skills/[nome]/SKILL.md`
— é o único lugar que o Claude Code reconhece pra virar comando `/nome`.
Nunca criar ou deixar cópias soltas de Skill na raiz do projeto (ex.
`SKILL-alguma-coisa.md`) — isso já causou trabalho duplicado de
sincronizar edição em dois lugares. Se precisar criar uma Skill nova,
criar direto em `.claude/skills/[nome]/SKILL.md` desde o início.

Exceção: os arquivos em `scripts/templates/` (ex.
`scripts/templates/maestro-ia-na-pratica.md`,
`scripts/templates/agents/*.md`) não são Skills em si — são material de
apoio/origem que a Skill `contrate-ag-ia-na-pratica` copia pra
`.claude/` quando instala o squad. Esses continuam fora de
`.claude/skills/` de propósito.

## Escopo: só postagem orgânica (por enquanto)

O squad de marketing (Maestro, Social Media, Copywriter, Designer) e as
integrações (`setup-instagram`, `setup-geracao-midia`) cobrem só
**postagem orgânica** no Instagram — publicar post, carrossel, Stories e
Reels direto na conta, sem impulsionar nem pagar por alcance.

**Fora de escopo, de propósito:** Meta Ads / Marketing API — criar
campanha, conjunto de anúncios, anúncio, gerenciar orçamento de
impulsionamento. É uma API da Meta completamente diferente da que o
projeto usa (o projeto fala com a **Content Publishing API**, não com a
**Marketing API**), com permissões, riscos e estrutura de custo próprios.

**Por que isso está escrito aqui:** já rolou confusão nesse projeto entre
as duas coisas — um material de segurança sobre rate limiting do Marketing
API (`X-Ad-Account-Usage`, criação de campanha/conjunto de anúncios/
anúncio) tinha sido colado achando que valia pra cá. Não vale — foi
adaptado e incorporado ao `setup-instagram` (que fala com a Content
Publishing API de verdade) e o material antigo foi removido. As
permissões que o `setup-instagram` pede (`instagram_basic`,
`instagram_content_publish`, `pages_read_engagement`) são só de
publicação orgânica; nenhuma delas dá acesso a Ads.

**Se um dia Ads entrar no projeto:** vai exigir um app/token com
permissão `ads_management` própria, uma revisão de segurança própria (os
princípios de rate limiting do material antigo — nunca rajada de
chamadas, backoff exponencial em erro de throttling, escalar erro
persistente pra um humano — continuam válidos e podem ser reaproveitados),
e provavelmente um subagente novo — não é uma extensão natural do squad
atual, é uma capacidade nova, com escopo e riscos diferentes.

## TikTok fica fora da Imersão, de propósito

Existe uma pasta `TikTok/` na raiz do projeto (ver
[TikTok/README.md](TikTok/README.md)) — é conteúdo avulso meu, gerado e
publicado manualmente. **Nenhum agente/skill do squad da Imersão** (Maestro,
Social Media, Copywriter, Designer, `setup-instagram`,
`setup-geracao-midia`, `contrate-ag-ia-na-pratica`) deve ler, escrever ou
fazer referência a essa pasta — o produto ensinado continua sendo só
Instagram. Se TikTok entrar oficialmente na Imersão algum dia, é decisão
própria meu, tomada à parte — não estender o squad atual pra cobrir isso
sem esse combinado.

## Publicação e agendamento no Instagram — ver skill `agendamento-instagram`

Toda regra sobre publicar ou agendar posts no Instagram (calendário
regular via GitHub Actions, Task Scheduler local desativado de propósito,
e sobretudo pedidos pontuais/urgentes fora do calendário) vive em
`.claude/skills/agendamento-instagram/SKILL.md` — invocar essa skill
sempre que a tarefa envolver publicar, (re)agendar, adiantar ou checar o
status de uma peça, mesmo que pareça um pedido simples de "publica isso
agora".

**Resumo de 1 linha, sempre válido mesmo sem abrir a skill:** GitHub
Actions é a fonte única de verdade pro calendário regular; **nunca**
reativar o Task Scheduler local; **nunca** usar `ScheduleWakeup`/
`CronCreate` pra garantir um horário de publicação (são timers de sessão,
somem se o PC/sessão cair — causaram uma falha real em 07/09/2026) — pra
pedido pontual/urgente, usar o `workflow_dispatch` do workflow
(`--code`/`--wait-until-utc`, roda 100% no runner do GitHub).

## Persona do meu negócio

**Produto:** Imersão "IA na Prática" — 2 dias ao vivo via Zoom, ensina a configurar o Claude Code conectado ao Instagram para criar, gerar imagem e agendar posts sozinho, sem programar.

**Nome fictício:** Renata Duarte — dona de pequeno negócio de serviço (ou profissional de marketing/social media) gerindo o Instagram sozinha.

**Top 3 dores mais profundas:**
1. Instagram parado/inconsistente por falta de tempo e energia para criar conteúdo todo dia.
2. Depender de agência cara ou freelancer que falha, ou fazer tudo manualmente (legenda, imagem, agendamento).
3. Já tentou ChatGPT/IA várias vezes e nunca virou um sistema de verdade publicando sozinho.

**Top 3 desejos mais intensos:**
1. Ver o Instagram do negócio postando sozinho, com qualidade, sem precisar lembrar todo dia.
2. Ter um "time de IAs" fazendo o trabalho que uma agência cobraria caro por muito menos.
3. Aprender de forma guiada e prática — sair sabendo aplicar, não só assistindo.

**Frase de qualificação rápida:**
> "Meu cliente ideal é dono(a) de negócio ou profissional de marketing que sente o Instagram como um peso constante e sabe que ele deveria estar gerando resultado, quer resolver isso nos próximos 30 dias, e está disposto(a) a investir R$ 147–294 e 2 dias inteiros para sair com o sistema funcionando."

Documento completo em [docs/persona.md](docs/persona.md).

## Geração de mídia
- Imagem por IA: Gemini Nano Banana configurado (chave em `.env` →
  `GEMINI_API_KEY`, ~$0,039/imagem) e testado com sucesso — se não
  estiver aqui, o Designer usa imagem própria ou o card padrão, ambos
  grátis.
- Vídeo de Reels: [ffmpeg instalado, grátis / Gemini/Veo 3.1 configurado,
  tier Fast ~$0,10–0,12/s, blocos de 4-8s] — ainda não testado nesta
  sessão.
