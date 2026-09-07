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

## Automação de publicação — GitHub Actions é a fonte única de verdade

**Desde 07/09/2026, quem publica os posts agendados é o GitHub Actions**
(`.github/workflows/publish-instagram.yml`, cron `0 12 * * 1,4` = toda
segunda e quinta às 09h de Brasília), **não o computador local.** O
workflow roda `scripts/publish_scheduled.py`, que lê
`Instagram/calendario-set-2026.md`, acha a linha cuja data bate com hoje e
cujo Status ainda não começa com "Publicado", publica via
`scripts/publish_instagram.py` e reescreve o Status daquela linha no
próprio calendário (commit automático do workflow).

**Por que migrou do Windows Task Scheduler pra isso:** em 07/09/2026 o
post do dia (Feed/F02) não saiu no horário porque a tarefa local estava
desabilitada e ninguém percebeu — só foi notado porque o usuário
perguntou "qual horário está programado pra hoje". A causa raiz de fundo,
porém, é estrutural: automação via Task Scheduler só dispara com o PC
**ligado, logado e com internet** no minuto exato — o usuário pediu
explicitamente pra eliminar essa dependência ("preciso que não tenha essa
variável, depender 100% do GitHub"). GitHub Actions roda na nuvem da
GitHub, indiferente ao estado do computador pessoal.

**Pré-requisito único, manual, que só o dono do repositório pode fazer:**
os Secrets `INSTAGRAM_ACCESS_TOKEN` e `INSTAGRAM_BUSINESS_ID` precisam
estar cadastrados em GitHub → Settings → Secrets and variables → Actions
do repositório `novvasaudeintegrativa-cmyk/ianapratica` (mesmos valores
já salvos localmente em `.env` — Claude Code não tem como ler `.env` e
subir isso sozinho por segurança, então esse passo depende do humano
fazer uma vez).

**Regra fixa:**
1. As 13 tarefas do Windows Task Scheduler (`IANaPratica-F0X`/`R0X`) foram
   **desativadas de propósito** em 07/09/2026 — viraram redundantes e, se
   reativadas, publicariam a mesma peça em dobro (uma vez pelo Actions,
   outra pelo PC). **Nunca reativar essas tarefas locais** enquanto o
   workflow do GitHub Actions for a automação vigente.
2. Toda peça publicada fora do fluxo automático (manualmente, por pedido
   direto no chat) **precisa ter o Status daquela linha do calendário
   atualizado pra "Publicado (...)"** — o script `publish_scheduled.py`
   confia nesse campo pra decidir o que ainda falta postar; uma linha
   esquecida em "Agendado" é publicada de novo quando a data dela chegar.
3. Se algum dia o projeto quiser voltar a depender do computador local
   (ex. Actions ficou caro, ou o repositório virou privado — o workflow
   exige o repo **público**, mesma exigência que já existia pro Meta
   buscar a imagem), isso exige decisão explícita do usuário, não uma
   suposição do Claude.
4. Isso é adicional à checagem de validade do token (ver memória
   `instagram_token_expiry.md`), não substitui ela — token vencido
   quebra a publicação nos dois modelos (local ou GitHub Actions) do
   mesmo jeito.

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
