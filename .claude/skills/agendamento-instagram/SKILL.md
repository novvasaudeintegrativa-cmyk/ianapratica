---
name: agendamento-instagram
description: >
  Regras e procedimento completo pra qualquer publicação ou agendamento de
  post no Instagram deste projeto — tanto o calendário regular (segunda/
  quinta, GitHub Actions) quanto pedidos pontuais/urgentes fora dele
  ("publica isso agora", "publica às 15h hoje", "adianta essa peça",
  "publica amanhã de manhã"). Cobre por que o Windows Task Scheduler local
  foi desativado, por que GitHub Actions é a fonte única de verdade, e —
  crítico — por que NUNCA usar ScheduleWakeup/CronCreate (timers de sessão)
  pra garantir um horário de publicação, com a alternativa real
  (workflow_dispatch com --code/--wait-until-utc, rodando 100% na nuvem do
  GitHub, sem depender da sessão do Claude nem do computador local ligados).
  Use sempre que a tarefa envolver publicar, (re)agendar, adiantar ou
  verificar o status de uma peça do Instagram — mesmo que pareça um pedido
  simples de "publica isso agora".
---

# Agendamento e Publicação no Instagram — Regras Permanentes

Este projeto publica no Instagram via `scripts/publish_instagram.py`
(fala com a Content Publishing API da Meta) e `scripts/publish_scheduled.py`
(decide O QUE publicar e QUANDO). Este documento cobre as duas situações:
o calendário regular e pedidos pontuais/urgentes.

---

## 1. Calendário regular — GitHub Actions é a fonte única de verdade

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
do repositório `novvasaudeintegrativa-cmyk/ianapratica` (já feito em
07/09/2026 — só refazer se o token for rotacionado).

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
5. Formatos suportados: Feed, Reels, Carrossel e Stories (Stories publica
   cada quadro como uma Story independente, em sequência, sem legenda —
   a API não aceita legenda pra Stories).

---

## 2. Agendamento pontual/urgente (fora do calendário) — nunca usar timer de sessão

**Regra fixa, vale pra QUALQUER pedido de agendamento, dentro ou fora do
calendário regular:** nunca usar `ScheduleWakeup` nem `CronCreate` (ou
qualquer mecanismo equivalente) como forma de garantir que uma publicação
saia sozinha num horário específico. Os dois são **"session-only"** — só
existem enquanto esta conversa do Claude Code estiver aberta e o
computador ligado, e desaparecem sem aviso se a sessão cair. É a mesma
fragilidade que a migração pro GitHub Actions (seção 1) já tinha
eliminado da automação principal — usar um desses timers pra um pedido
pontual reintroduz exatamente essa dependência pela porta dos fundos.

**Por que isso está escrito aqui:** em 07/09/2026 o usuário pediu pra
publicar o Feed/F03 adiantado, hoje às 11h15. O Claude usou
`ScheduleWakeup` pra "acordar" às 11h15 sozinho — o PC estava desligado
nesse horário, o disparo nunca aconteceu, e a publicação só saiu quando o
usuário perguntou "postou?" às 11h30 e o Claude publicou na hora, manual.
O usuário então pediu uma regra permanente cobrindo isso, avisando que
vão surgir outros pedidos urgentes fora do calendário normal.

### O que fazer em vez disso

**Caso 1 — horário é agora ou daqui a poucos minutos, dentro da mesma
conversa:** não usar timer nenhum — só publicar direto
(`scripts/publish_instagram.py --images ... --caption-file ...`) quando o
usuário confirmar, ou esperar ele avisar "pode publicar agora".

**Caso 2 — horário é mais distante (horas, ainda hoje) e precisa
acontecer sem ninguém lembrar/confirmar na hora:** usar o
`workflow_dispatch` do workflow do GitHub Actions, que já tem os campos
pra isso (adicionado em 07/09/2026):

1. Ir em **Actions → "Publicar Instagram agendado" → Run workflow**.
2. Preencher **`code`** com a peça (ex. `Feed/F04`).
3. Preencher **`wait_until_utc`** com o horário em UTC, formato `HH:MM`
   (ex. pedido "15h de Brasília" → `18:00` UTC, já que BRT é UTC-3 fixo,
   sem horário de verão desde 2019). Deixar em branco publica assim que
   o workflow disparar.
4. Clicar **Run workflow**.

Isso roda inteiramente no runner do GitHub — o `sleep` até o horário
acontece **lá**, não na sessão do Claude nem no PC do usuário. Testado
localmente (matemática de espera, com e sem virada de dia) em 07/09/2026.

**Teto real:** um job do GitHub Actions tem limite de execução (`timeout-
minutes: 360` = 6h, configurado no workflow). Serve bem pra "ainda hoje"
ou "daqui a algumas horas". Pra "daqui a 2 dias" ou mais, não dá pra usar
`wait_until_utc` — nesse caso, ou espera aparecer mais perto da hora e
dispara então, ou (only se for algo recorrente de verdade) considera virar
uma linha nova no calendário regular.

**Quem pode disparar o `workflow_dispatch`:** hoje, só o usuário via
interface web do GitHub (o Claude não tem um token com escopo suficiente
pra disparar isso via API — mesma limitação que já existia pra editar
arquivos em `.github/workflows/`). Se isso mudar no futuro (ex. o usuário
configurar um token com escopo `actions:write` em algum lugar acessível),
atualizar esta nota.

### Depois de qualquer publicação pontual

1. Sempre atualizar o Status da linha correspondente em
   `Instagram/calendario-set-2026.md` (o `--code` do
   `publish_scheduled.py` já faz isso sozinho, se achar a peça no
   calendário — só confirmar/checar se ela não estava lá).
2. Ser transparente com o usuário sobre qual caminho (Caso 1 ou Caso 2)
   foi usado — nunca deixar implícito que "já está agendado" se na
   prática for só um timer de sessão torcendo pra sessão continuar viva.
