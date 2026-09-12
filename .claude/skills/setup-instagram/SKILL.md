---
name: setup-instagram
description: >
  Configura a integração completa entre Claude Code e Instagram para publicação
  automática de carrosséis e posts. Guia o usuário passo a passo para obter
  credenciais da Meta API, salva tudo no lugar certo e testa a conexão. Também
  funciona como diagnóstico/retomada: se já houver credenciais salvas, testa se
  ainda são válidas antes de sugerir refazer qualquer coisa. Use quando o usuário
  quiser conectar o Claude Code ao Instagram pela primeira vez, ou quando disser
  "quero publicar no Instagram", "configurar instagram", "setup instagram",
  "verificar conexão com o instagram", "testar conexão do instagram", "já estou
  conectado?", "conectar instagram".
---

# Setup Instagram — Integração Automática com Claude Code

Configura tudo que é necessário para publicar posts e carrosséis automaticamente
no Instagram direto pelo Claude Code, sem abrir o Canva, sem copiar e colar nada.

---

## O que essa skill faz

1. Verifica os pré-requisitos
2. Guia para obter o token da Meta API (passo a passo com prints)
3. Descobre automaticamente o Instagram Business ID
4. Salva as credenciais no lugar certo
5. Instala o script de publicação
6. Testa a conexão ao vivo
7. Confirma que tudo está funcionando

**Tempo estimado: 10 minutos**

---

## Diagnóstico automático (rodar sempre, antes da Etapa 0)

Toda vez que essa skill for chamada — mesmo que o usuário diga "configurar
instagram" como se fosse a primeira vez — comece checando em silêncio o que já
existe, antes de apresentar qualquer coisa. Isso evita fazer alguém repetir Página
→ Business Manager → App do zero só porque o token de 1h expirou.

1. **Existe `.env` na raiz do projeto com `INSTAGRAM_BUSINESS_ID` e
   `INSTAGRAM_ACCESS_TOKEN` preenchidos (não vazios)?**
   - **Não** → nada configurado ainda. Seguir direto pra **ETAPA 0** abaixo,
     do zero, normalmente.
   - **Sim** → ir pro passo 2.

2. **Testar se o token salvo ainda funciona** — mesma chamada da Etapa 8, só que
   rodando agora em vez de só no final:
   ```bash
   node -e "
   require('dotenv').config();
   const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
   const IG_ID = process.env.INSTAGRAM_BUSINESS_ID;
   fetch('https://graph.facebook.com/' + (process.env.META_API_VERSION || 'v19.0') + '/' + IG_ID + '?fields=id,name,username&access_token=' + TOKEN)
     .then(r => r.json()).then(d => console.log(JSON.stringify(d)));
   "
   ```
   - **Retornou `username`** → já está tudo conectado e funcionando. Avisar e
     parar aqui, sem repetir nenhuma etapa:
     > "Você já está conectado! Conta: @[username]. Não precisa configurar de
     > novo — pode ir direto pra `/contrate-ag-ia-na-pratica` criar uma peça e
     > publicar."
   - **Retornou erro** → consultar a tabela "Diagnóstico de erros comuns" (mais
     abaixo neste arquivo), identificar a causa mais provável e propor pular
     **direto pra etapa que resolve aquilo especificamente** — nunca refazer
     etapas que já deram certo antes. Exemplo, token expirado (o caso mais
     comum, já que dura só 1h):
     > "Achei suas credenciais salvas, mas o token expirou — isso é normal,
     > dura só 1 hora. Não precisa refazer Página, Gerenciador nem App: só
     > gerar um token novo. Posso te levar direto pra Etapa 2 (Graph API
     > Explorer)?"
     Se o usuário confirmar, pular direto pra etapa indicada.

## ETAPA 0 — Boas-vindas e pré-requisitos

**Só chega aqui se o Diagnóstico automático acima concluiu que nada está
configurado ainda.**

Ao ser invocada, apresente-se assim:

> Olá! Vou configurar tudo para você publicar no Instagram automaticamente pelo Claude Code.
> Preciso de uns 10 minutos do seu tempo e de algumas informações que só você tem acesso.
> Vamos juntos — eu te guio em cada passo.

Pergunte ao usuário:

**"Antes de começar, confirma pra mim:"**

1. Sua conta do Instagram é **Profissional** (Business ou Creator)?
   - Se não souber: Configurações → Conta → Tipo de conta
   - Se for pessoal: instrua a converter em Creator (gratuito, não perde seguidores)

2. Você tem uma **Página no Facebook** vinculada ao Instagram?
   - Se não tiver: instrua a criar uma página básica no Facebook

3. Você tem acesso ao **e-mail/senha do Facebook** que gerencia essa página?

Se tudo for sim → prosseguir para Etapa 1
Se algum não → resolver o item antes de continuar

---

## ETAPA 1 — Criar conta de desenvolvedor Meta (se necessário)

Instrua o usuário:

> "Vamos acessar o painel de desenvolvedores da Meta. É gratuito."

**Passos:**
1. Abra no navegador: `https://developers.facebook.com`
2. Clique em **"Começar"** ou **"Entrar"** (use o Facebook que tem a Página)
3. Se pedir para verificar identidade, confirme pelo celular
4. Quando entrar no painel, pergunte: **"Chegou no painel? Me fala o que está vendo na tela."**

---

## ETAPA 2 — Acessar o Graph API Explorer

Instrua o usuário:

> "Agora vamos usar uma ferramenta da Meta chamada Graph API Explorer. É aqui que a gente pega o token."

**Passos:**
1. Acesse: `https://developers.facebook.com/tools/explorer`
2. No canto superior direito, em **"Meta App"**, selecione um app existente
   - Se não tiver nenhum: clique em "Criar App" → tipo **Business** → preencha nome qualquer (ex: "MeuBot") → confirmar
3. Logo abaixo, em **"User or Page"**, clique e selecione **sua Página do Facebook** (não "Usuário")
4. Pergunte: **"Já selecionou a Página? Qual nome apareceu?"**

---

## ETAPA 3 — Adicionar permissões obrigatórias

Instrua o usuário:

> "Agora vamos adicionar as permissões para publicar no Instagram. Tem 3 que precisamos."

**No Graph API Explorer:**
1. Clique em **"Add a Permission"** (ou "Adicionar Permissão")
2. Busque e adicione uma por uma:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
3. Clique em **"Generate Access Token"** (Gerar Token de Acesso)
4. Uma janela do Facebook vai abrir pedindo autorização — clique em **Continuar** e **OK** em tudo
5. O token vai aparecer no campo de texto (começa com `EAAU...`)
6. Instrua: **"Copie esse token inteiro e cole aqui pra mim"**

> ⚠️ Avise: "Não compartilhe esse token com ninguém. Ele dá acesso à sua conta."

---

## ETAPA 4 — Receber e validar o token

Quando o usuário colar o token:

1. Verifique se começa com `EAA` e tem mais de 100 caracteres
2. Teste imediatamente com uma chamada de API:

```bash
node -e "
const TOKEN = 'TOKEN_DO_USUARIO_AQUI';
fetch('https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account&access_token=' + TOKEN)
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)));
"
```

3. Se retornar dados → token válido, identificar qual conta é o Instagram do usuário
4. Se retornar erro → diagnose o problema:
   - `OAuthException` → token inválido, peça para gerar novamente
   - `permissions` → alguma permissão não foi adicionada, volte à Etapa 3

---

## ETAPA 5 — Identificar o Instagram Business ID

Após validar o token, do resultado da API:

1. Mostre as páginas encontradas em formato amigável:

```
Encontrei essas páginas vinculadas à sua conta:

1. [Nome da Página] → Instagram ID: XXXXXXXXX
2. [Outra Página]   → sem Instagram vinculado

Qual delas é a que você quer usar para publicar?
```

2. Confirme com o usuário qual conta usar
3. Guarde: `PAGE_TOKEN` e `INSTAGRAM_BUSINESS_ID`

---

## ETAPA 6 — Salvar as credenciais

Salvar direto na raiz **deste projeto** (mesma pasta de `package.json` e
`CLAUDE.md`) — nada de procurar outro projeto ou pasta externa, o squad
inteiro (Maestro, subagentes, conteúdo gerado em `Instagram/`) já vive
aqui, as credenciais ficam junto.

**Se já existir um `.env` na raiz**, adicionar/atualizar só as linhas
abaixo, sem apagar outras variáveis que já estejam lá.

**Conteúdo do `.env`:**
```
# Instagram / Meta — Gerado pelo setup-instagram
INSTAGRAM_BUSINESS_ID=[ID encontrado]
FACEBOOK_PAGE_ID=[Page ID encontrado]
INSTAGRAM_ACCESS_TOKEN=[token do usuário]
META_API_VERSION=v19.0
```

Confirme: **"Credenciais salvas em `.env`, na raiz do projeto."** (Já
está no `.gitignore` — nunca vai parar no GitHub.)

---

## ETAPA 7 — Instalar o script de publicação

**Antes de tudo, checar se o Python está instalado** (via `Bash`:
`python --version`). Se não estiver (no Windows costuma devolver algo
como "Python não foi encontrado" apontando pra Microsoft Store, mesmo
sem Python de verdade instalado), **parar aqui e avisar**, sem tentar
criar o script ou instalar dependência nenhuma ainda:

> "Antes de continuar, preciso que você instale o Python — o script que
> publica no Instagram roda nele, não em JavaScript. Baixe em
> `python.org/downloads` (botão amarelo 'Download Python') e, na
> instalação, **marque a caixinha 'Add python.exe to PATH'** antes de
> clicar em instalar — é o passo que mais gente esquece. Me avisa quando
> terminar que eu sigo exatamente daqui, sem precisar refazer nada
> anterior."

Quando o usuário confirmar, checar `python --version` de novo antes de
prosseguir — só seguir pro resto desta etapa depois de confirmar que
funciona.

Verifique se já existe em `scripts/publish_instagram.py`, na raiz deste
projeto (mesma pasta de `scripts/export-png.js`).

**Se não existir**, copiar de `scripts/templates/publish_instagram.py`
pra `scripts/publish_instagram.py` (mesmo diretório, sem alterar o
conteúdo). Esse arquivo-fonte já cobre Feed, Carrossel, Reels e Stories,
com retry em erro de limite de chamadas (throttling) e hospedagem da
mídia via GitHub — não reescrever nem resumir o conteúdo, copiar como
está.

**Instalar dependências:**
```bash
pip install requests python-dotenv -q
```

**Se der erro de SSL (`CERTIFICATE_VERIFY_FAILED`) numa chamada do
script:** é comum em máquinas com antivírus que intercepta conexões HTTPS
(ex. Avast) — o Windows já confia nesse certificado, mas o Python (via
`certifi`) não. Resolve instalando:
```bash
pip install pip-system-certs -q
```
Isso faz o Python passar a usar o mesmo repositório de certificados
confiáveis do sistema operacional, sem precisar desativar nada do
antivírus.

### Segurança e limites de publicação (por que o script é assim)

A Meta não pune automação em si — pune **comportamento robótico**: rajadas
de chamadas, publicar dezenas de posts de uma vez, tentar de novo
instantaneamente quando dá erro. O `publish_instagram.py` já nasce com
isso em mente:

- **Nunca insiste imediatamente num erro de limite/throttling** — espera
  com backoff exponencial (30s, 60s, 120s...) e desiste depois de 3
  tentativas, em vez de martelar a mesma chamada.
- **Erro de token/imagem/conta nunca é tentado de novo automaticamente** —
  só erro de limite de chamadas justifica esperar e repetir; o resto é
  problema que precisa de ação humana (token expirado, imagem inválida,
  etc.), então falha na hora com a mensagem exata da API.
- **Publicar várias peças de um calendário?** Não rode o script em loop
  apertado pra todas de uma vez — espace as publicações (o roteiro do
  Maestro já distribui por dia; publicar seguindo esse mesmo espaçamento é
  o comportamento mais parecido com o de uma pessoa de verdade postando).
- O limite exato de posts por 24h que a Meta permite varia entre fontes e
  não é bem documentado — não assuma um número fixo. Se o script começar a
  falhar com erro de limite mesmo espaçando as publicações, é sinal de
  aproximar desse teto: pare e espere algumas horas antes de continuar.

---

## ETAPA 8 — Teste de conexão ao vivo

Execute o teste final:

```bash
node -e "
const TOKEN = 'TOKEN_SALVO';
const IG_ID = 'IG_ID_SALVO';
fetch('https://graph.facebook.com/v19.0/' + IG_ID + '?fields=id,name,username&access_token=' + TOKEN)
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)));
"
```

Se retornar `username`, mostre para o usuário:

```
Conexao testada com sucesso!

Conta conectada: @[username]
Nome: [name]
ID: [id]

Tudo pronto para publicar automaticamente.
```

---

## ETAPA 9 — Confirmação final e próximos passos

Mostre o resumo completo:

```
Setup concluido!

O que foi configurado:
  Credenciais salvas em: [caminho do .env]
  Script de publicacao:  [caminho do publish_instagram.py]
  Conta conectada:       @[username]

Como usar agora:

1. Criar a peça (texto + visual):
   /contrate-ag-ia-na-pratica

2. Exportar os slides pra PNG (o Designer já faz isso sozinho, mas se
   precisar rodar de novo):
   node scripts/export-png.js "Instagram/[Formato]/[Código]/slides"

3. Publicar no Instagram:
   python scripts/publish_instagram.py --images Instagram/[Formato]/[Código]/slides/*.png --caption "sua legenda"

Ou peça tudo de uma vez:
   "Crie um carrossel sobre [tema] e publique no meu Instagram"
```

---

## Diagnóstico de erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `OAuthException #200` | Permissões faltando | Voltar ao Graph API Explorer e adicionar as 3 permissões |
| `OAuthException #100 image_url required` | API não aceita arquivo local | O script já resolve hospedando via GitHub (`raw.githubusercontent.com`) |
| Imagem commitada mas URL pública não responde (status ≠ 200) | Repositório do GitHub está privado | Deixar o repositório público em Settings > Danger Zone > Change visibility, ou trocar de mecanismo de hospedagem |
| `CERTIFICATE_VERIFY_FAILED` ao rodar o script | Antivírus (ex. Avast) intercepta HTTPS e o Python não confia nesse certificado | `pip install pip-system-certs -q` |
| `Invalid OAuth access token` | Token expirado | Gerar novo token no Graph API Explorer |
| `Instagram account not found` | Conta não é Business/Creator | Converter conta em Configurações → Conta |
| `Pages not found` | Página não vinculada ao Instagram | Vincular em Configurações do Instagram → Conta → Página vinculada |

---

## Importante sobre o token

O token gerado no Graph API Explorer **expira em 1 hora**.

Para uso em produção, instrua o usuário a gerar um **token de longa duração**:

```bash
# Troque pelos seus dados
curl "https://graph.facebook.com/v19.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={APP_ID}
  &client_secret={APP_SECRET}
  &fb_exchange_token={TOKEN_ATUAL}"
```

Ou instrua: "Me fala quando o token expirar que eu gero um novo pra você em 1 minuto."
