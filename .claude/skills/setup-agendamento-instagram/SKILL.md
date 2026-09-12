---
name: setup-agendamento-instagram
description: >
  Configura a publicação AUTOMÁTICA e agendada no Instagram via GitHub
  Actions — depois disso, os posts do calendário saem sozinhos no horário
  certo, sem precisar abrir o Claude Code nem o computador estar ligado.
  Pré-requisito: `setup-instagram` já feito (conexão manual funcionando).
  Também funciona como diagnóstico: se já estiver configurado, testa antes
  de sugerir refazer qualquer coisa. Use quando o usuário disser "quero
  que meus posts saiam sozinhos", "configurar agendamento automático",
  "publicar sem precisar pedir toda vez", "automação do Instagram",
  "publicação agendada", "não quero depender do computador ligado",
  "setup agendamento".
---

# Setup Agendamento Automático — GitHub Actions

Liga o "piloto automático" de verdade: depois de configurado, o calendário
de conteúdo (`Instagram/calendario-*.md`) publica sozinho nos dias/
horários certos, rodando na nuvem do GitHub — não depende do seu
computador estar ligado, nem de você pedir pro Claude Code toda vez.

**Pré-requisito: `setup-instagram` já concluído** (você já publica manual
com sucesso). Se ainda não fez isso, pare e rode `/setup-instagram`
primeiro — esta skill não funciona sem aquela já configurada.

**Tempo estimado: 15 minutos.**

---

## O que essa skill faz

1. Confirma os pré-requisitos (setup-instagram feito, repositório público)
2. Instala o script que decide o que publicar em cada dia
3. Cria o workflow do GitHub Actions (você cola um arquivo, uma vez só)
4. Cadastra as credenciais como Secrets do GitHub (mesmos valores do `.env`)
5. Testa de verdade, sem publicar nada por engano
6. Instala as skills de referência (regras de agendamento + diagnóstico
   de falha), pra qualquer sessão futura do Claude Code já saber lidar
   com isso

---

## Diagnóstico automático (rodar sempre, antes da Etapa 0)

1. **`scripts/publish_scheduled.py` já existe?** E **`.github/workflows/
   publish-instagram.yml` já existe no repositório remoto** (não só
   localmente)?
   - Testar o remoto assim:
     ```bash
     REMOTE=$(git remote get-url origin)
     OWNER_REPO=$(echo "$REMOTE" | sed -E 's#.*github\.com[:/]##; s#\.git$##')
     curl -s -o /dev/null -w "%{http_code}\n" \
       "https://api.github.com/repos/$OWNER_REPO/contents/.github/workflows/publish-instagram.yml"
     ```
   - **200** → workflow já existe no GitHub. Pular pra Etapa 4 (Secrets) só
     pra confirmar que estão cadastrados, depois Etapa 5 (teste).
   - **404** ou script local ausente → nada configurado ainda, seguir do
     zero pela Etapa 0.

## Etapa 0 — Confirmar pré-requisitos

1. `.env` tem `INSTAGRAM_ACCESS_TOKEN` e `INSTAGRAM_BUSINESS_ID`
   preenchidos? Se não, parar e mandar rodar `/setup-instagram` primeiro.
2. O repositório do GitHub está **público**? (Settings → Danger Zone → o
   workflow só funciona assim, mesma exigência que a publicação manual já
   tinha pra hospedar imagem/vídeo.) Se privado, explicar e ajudar a
   trocar antes de continuar.
3. Existe pelo menos um calendário (`Instagram/calendario-*.md`, gerado
   pelo subagente `social-media`)? Se não, a automação não vai ter nada
   pra publicar ainda — pode seguir mesmo assim (fica pronta, esperando o
   calendário existir), mas avisar isso ao usuário.

## Etapa 1 — Instalar o script de decisão

Copiar `scripts/templates/publish_scheduled.py` pra
`scripts/publish_scheduled.py` (mesmo diretório, sem alterar o
conteúdo). Não reescrever — esse arquivo já lê todos os
`Instagram/calendario-*.md` do projeto sozinho, decide o que publicar
hoje, e tenta de novo automaticamente se der uma falha passageira.

## Etapa 2 — Criar o workflow do GitHub Actions

**Isso precisa ser colado manualmente pelo usuário na interface do
GitHub — o Claude Code não consegue dar `git push` em arquivos dentro de
`.github/workflows/` (o GitHub exige uma permissão especial, `workflow`
scope, que a credencial local normalmente não tem).**

1. Ler o conteúdo de `scripts/templates/github-workflows/publish-instagram.yml`
   e mostrar pro usuário (não alterar nada nele).
2. Explicar o passo a passo:
   - Ir no repositório no GitHub → botão **"Add file" → "Create new file"**.
   - No campo de nome, digitar exatamente `.github/workflows/publish-instagram.yml`
     (o GitHub cria as pastas sozinho).
   - Colar o conteúdo no editor.
   - Descer até o fim e clicar **"Commit changes..."**.
3. Se o usuário tiver dificuldade de selecionar/apagar texto no editor do
   GitHub (acontece), sugerir a alternativa: apagar o arquivo (se já
   existir uma versão errada) e recriar do zero com "Create new file" —
   o campo de criação é uma caixa de texto simples, mais fácil de colar.
4. **Perguntar em qual(is) dia(s) da semana e horário o usuário já
   decidiu postar** (isso deveria ter vindo do `maestro`/`social-media` ao
   planejar o calendário — ver skill `agendamento-instagram`). Ajustar a
   linha `cron:` do workflow pra bater com isso ANTES de mandar colar —
   não deixar no valor de exemplo do template sem confirmar. Cron do
   GitHub Actions é sempre em **UTC**; lembrar de converter o horário
   local do usuário (ex. Brasília = UTC-3, sem horário de verão desde
   2019).

## Etapa 3 — Cadastrar os Secrets

1. No repositório do GitHub → **Settings → Secrets and variables →
   Actions → New repository secret**.
2. Criar dois, um de cada vez, com os MESMOS valores que já estão no
   `.env` local (nunca inventar nem gerar novo token aqui):
   - `INSTAGRAM_ACCESS_TOKEN`
   - `INSTAGRAM_BUSINESS_ID`
3. Oferecer mostrar os valores exatos do `.env` pro usuário copiar (avisar
   que aparecem na tela, cuidado com quem está por perto).

## Etapa 4 — Testar sem publicar nada por engano

1. Confirmar que hoje não há nada "due" no calendário (senão o teste
   publicaria de verdade) — ou usar isso a favor: se não houver nada
   agendado pra hoje, o teste é seguro por natureza.
2. Pedir pro usuário ir em **Actions → "Publicar Instagram agendado" →
   Run workflow** (sem preencher `code`/`wait_until_utc`) e rodar.
3. Confirmar que o resultado foi **Success**, e que o log mostra
   "Credenciais carregadas: OK" — isso confirma que os Secrets estão
   certos, mesmo sem nada pra publicar hoje.

## Etapa 5 — Instalar as skills de referência

Copiar (se ainda não existirem em `.claude/skills/`):
- `scripts/templates/skills/agendamento-instagram/SKILL.md` →
  `.claude/skills/agendamento-instagram/SKILL.md`
- `scripts/templates/skills/diagnostico-instagram/SKILL.md` →
  `.claude/skills/diagnostico-instagram/SKILL.md`

Essas duas passam a carregar sozinhas sempre que o assunto for
publicar/agendar/diagnosticar falha no Instagram — não precisa fazer
nada além de copiar os arquivos.

## Relatório final

Resumir: workflow criado e testado, Secrets cadastrados, script instalado,
skills de referência prontas. Deixar claro pro usuário: **a partir de
agora, os posts do calendário saem sozinhos nos dias configurados — não
precisa pedir pro Claude Code, nem deixar o computador ligado.** Se algo
não sair no horário esperado, a skill `diagnostico-instagram` já sabe
investigar.
