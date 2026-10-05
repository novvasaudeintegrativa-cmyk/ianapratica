---
name: setup-geracao-midia
description: >
  Configura a geração de mídia por IA do squad, sempre deixando claro que
  é 100% opcional — o Designer já funciona de graça sem nada disso (card
  de HTML/CSS ou imagem própria pra Feed/Carrossel/Stories, vídeo via
  ffmpeg pro Reels). Quem quiser a opção paga escolhe entre dois
  provedores de imagem — Gemini (Nano Banana/gemini-2.5-flash-image)
  ou GPT (GPT Image 2/gpt-image-2) — podendo configurar um ou os dois; o
  Gemini também cobre vídeo (Veo 3.1). Mostra o preço aproximado antes de
  configurar, salva as chaves em `.env`, testa de verdade e registra um
  resumo no `CLAUDE.md`. Também funciona como diagnóstico: se já houver
  algo configurado, testa antes de sugerir refazer. Use quando o usuário
  disser "configurar geração de imagem", "conectar gemini", "conectar
  gpt", "conectar API do Gemini", "conectar API da OpenAI", "contratar ia
  pra gerar imagem", "contratar ia pra gerar vídeo", "gerar imagem com
  ia", "gerar vídeo do reels com ia", "geração de mídia", ou "configurar
  ffmpeg".
---

# Setup Geração de Mídia — Grátis por padrão, IA paga opcional

**Regra de ouro: o caminho grátis é o padrão e já funciona sem esta skill.**
Esta skill só existe pra quem quiser a opção paga (mais realista/variada) —
nunca é pré-requisito pra usar `/instalador-ag-ia-na-pratica`.

| Capacidade | Grátis (padrão, sempre disponível) | Paga (opcional, dois provedores possíveis) |
|---|---|---|
| **Imagem de fundo** | Sua própria imagem (print, foto) ou o card de HTML/CSS — zero configuração. | **Nano Banana** (Gemini 2.5 Flash Image) ~$0,039/imagem **ou GPT Image 2** (OpenAI) ~$0,03–0,05/imagem — os dois geram do zero ou editam uma referência real. No modo denso do Designer a imagem por IA é só textura de fundo, então o modelo mais em conta já basta. Pode configurar um ou os dois; se tiver os dois, escolhe qual usar a cada peça. |
| **Vídeo de Reels** | HTML/CSS (mesma técnica do resto) + `ffmpeg` juntam os frames do roteiro num vídeo real, sem gerar conteúdo novo por IA. | **Veo 3.1** (Gemini) gera um vídeo novo por prompt, em blocos de **4, 6 ou 8 segundos** (não faz 15/30/60s direto — pra esses, o caminho grátis é o mais flexível, ou combine clipes com `ffmpeg`). Tier Fast: ~$0,10/s (720p) a ~$0,12/s (1080p) — confira o tier exato em `https://ai.google.dev/gemini-api/docs/pricing`, preços mudam rápido. Só via Gemini — GPT não tem API de vídeo acessível ainda. |

Exemplo real de custo mensal (calendário de 16 peças — 4 Carrossel, 4 Feed, 4
Stories, 4 Reels de 15s, tier Fast, imagem via Nano Banana), **se usar a
opção paga em tudo**: entre **$6 e $7/mês** com Reels curtos (2 clipes de
Veo combinados via `ffmpeg` por Reels), até ~$26/mês com Reels de 60s. Com
GPT Image 2 em vez de Nano Banana pras imagens, o custo de imagem fica
ainda mais baixo (~$0,40–0,65/mês nas 12 peças, contra ~$0,47/mês do
Nano Banana). Preço confere com a Etapa 3. É barato, mas segue sendo
opcional — o caminho grátis chega a $0.

---

## Diagnóstico automático (rodar sempre, antes de perguntar qualquer coisa)

1. **Gemini:** existe `.env` com `GEMINI_API_KEY` preenchido?
   - **Não** → nada configurado nesse provedor.
   - **Sim** → testar com uma chamada real e barata (ver ETAPA 2A). Se
     funcionar, avisar "Gemini já está conectado". Se falhar (chave
     inválida/revogada, sem billing), mostrar o erro exato e perguntar se
     quer resolver.
2. **OpenAI/GPT:** existe `.env` com `OPENAI_API_KEY` preenchido?
   - **Não** → nada configurado nesse provedor.
   - **Sim** → testar com uma chamada real e barata (ver ETAPA 2B). Se
     funcionar, avisar "GPT já está conectado". Se falhar (chave
     inválida/revogada, sem billing), mostrar o erro exato e perguntar se
     quer resolver.
   Se nenhum dos dois estiver configurado, não perguntar nada de cara —
   só mencionar rapidamente que a opção paga existe, caso o usuário
   mostre interesse (ver ETAPA 1). Se pelo menos um já estiver conectado
   e funcionando, não é preciso insistir no outro — só mencionar que
   existe a opção de configurar os dois, se o usuário quiser comparar.
3. **ffmpeg (vídeo grátis):** existe `node_modules/ffmpeg-static` (ou
   `node_modules/@ffmpeg-installer/ffmpeg`) na raiz do projeto?
   - **Sim** → avisar "ffmpeg já está pronto" e pular a ETAPA 4.
   - **Não** → seguir pra ETAPA 4 se o usuário quiser vídeo de Reels (é
     rápido, só um `npm install`).

---

## ETAPA 1 — Perguntar antes de configurar qualquer coisa paga

Só chega aqui se o usuário pediu explicitamente ("contratar IA", "conectar
Gemini", "conectar GPT", etc.) — nunca oferecer isso de forma
proativa/insistente durante outro fluxo.

> "A geração por IA é opcional — o Designer já funciona de graça (imagem
> própria ou card padrão; vídeo do Reels via ffmpeg). Se quiser a opção
> paga mesmo assim, tem dois provedores de imagem pra escolher (pode
> configurar um só ou os dois):
> 1. **Gemini** — Nano Banana (imagem, ~$0,039 cada) + Veo 3.1
>    (vídeo, tier Fast ~$0,10–0,12/s). É o único que também gera vídeo.
> 2. **GPT (OpenAI)** — GPT Image 2 (imagem, ~$0,03–0,05 cada). Mais
>    barato, só imagem, sem vídeo.
>
> Um mês inteiro de calendário com tudo pago fica entre ~$6 e ~$26
> (Gemini) ou mais barato só de imagem (GPT). Qual você quer configurar?"

Se não quiser nenhum, parar aqui, sem insistir.

## ETAPA 2A — Criar, salvar e testar a chave do Gemini

Só rodar se o usuário escolheu configurar Gemini (imagem e/ou vídeo).

1. Envie o link: `https://aistudio.google.com/apikey`
2. Instrua: "Entre com sua conta Google, clique em 'Create API key',
   escolha ou crie um projeto do Google Cloud. A chave aparece na hora —
   copie."
3. Avise: **"Essa chave dá acesso à sua conta/billing do Google —
   trate como senha. Nunca compartilhe, nunca cole em arquivo que vai pro
   GitHub."**
4. Instrua: "Geração de imagem e vídeo (diferente de só texto) exige
   billing ativado no projeto vinculado à chave — o próprio Google AI
   Studio avisa e te leva pro fluxo de ativar quando faltar. Sem billing,
   as chamadas de imagem/vídeo falham."
5. Colar a chave e salvar no `.env` (sem apagar outras variáveis):
   ```
   # Geração de mídia por IA (Gemini) — Gerado pelo setup-geracao-midia
   GEMINI_API_KEY=[chave colada pelo usuário]
   ```
6. Instalar o SDK oficial, se ainda não existir:
   ```bash
   npm install --save @google/genai
   ```
7. Testar de verdade, gerando 1 imagem barata pra confirmar que a chave e
   o billing funcionam (avisar antes: "isso gera 1 imagem de teste real,
   poucos centavos") — usa o mesmo modelo que o Designer usa de verdade
   (`gemini-2.5-flash-image`, Nano Banana):
   ```bash
   node -e "
   require('dotenv').config();
   const fs = require('fs');
   const { GoogleGenAI } = require('@google/genai');
   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
   ai.models.generateContent({
     model: 'gemini-2.5-flash-image',
     contents: 'Um círculo laranja simples sobre fundo branco, minimalista.',
     config: { responseModalities: ['Image'] }
   }).then(res => {
     const parte = res.candidates[0].content.parts.find(p => p.inlineData);
     if (!parte) throw new Error('Nenhuma imagem retornada');
     fs.writeFileSync('teste-gemini.png', Buffer.from(parte.inlineData.data, 'base64'));
     console.log('OK: teste-gemini.png');
   }).catch(e => {
     console.log('ERRO:', e.message);
     process.exit(1);
   });
   "
   ```
8. **Se der `OK`** → confirmar: "Gemini conectado! Quando o Designer for
   montar uma peça, ele vai te lembrar do preço antes de oferecer a opção
   paga."
9. **Se der erro** → diagnosticar pela mensagem: chave inválida → pedir
   pra colar de novo; erro de billing/quota → apontar pro passo 4; qualquer
   outro → mostrar a mensagem literal, nunca abafar.

## ETAPA 2B — Criar, salvar e testar a chave da OpenAI (GPT)

Só rodar se o usuário escolheu configurar GPT.

1. Envie o link: `https://platform.openai.com/api-keys`
2. Instrua: "Entre com sua conta OpenAI (crie uma se não tiver), clique
   em 'Create new secret key', dê um nome, confirme. A chave só aparece
   uma vez — copie na hora."
3. Avise: **"Essa chave dá acesso à sua conta/billing da OpenAI — trate
   como senha. Nunca compartilhe, nunca cole em arquivo que vai pro
   GitHub."**
4. Instrua: "Geração de imagem exige um método de pagamento cadastrado
   na conta — adicione em `https://platform.openai.com/settings/organization/billing`
   antes de gerar de verdade. Sem isso, as chamadas de imagem falham com
   erro de billing."
5. Colar a chave e salvar no `.env` (sem apagar outras variáveis):
   ```
   # Geração de mídia por IA (OpenAI/GPT) — Gerado pelo setup-geracao-midia
   OPENAI_API_KEY=[chave colada pelo usuário]
   ```
6. Instalar o SDK oficial, se ainda não existir:
   ```bash
   npm install --save openai
   ```
7. Testar de verdade, gerando 1 imagem barata (avisar antes: "isso gera 1
   imagem de teste real, poucos centavos"):
   ```bash
   node -e "
   require('dotenv').config();
   const fs = require('fs');
   const OpenAI = require('openai').default;
   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
   client.images.generate({
     model: 'gpt-image-2',
     prompt: 'Um círculo laranja simples sobre fundo branco, minimalista.',
     size: '1024x1024'
   }).then(res => {
     const b64 = res.data[0].b64_json;
     if (!b64) throw new Error('Nenhuma imagem retornada');
     fs.writeFileSync('teste-gpt.png', Buffer.from(b64, 'base64'));
     console.log('OK: teste-gpt.png');
   }).catch(e => {
     console.log('ERRO:', e.message);
     process.exit(1);
   });
   "
   ```
8. **Se der `OK`** → confirmar: "GPT conectado! Quando o Designer for
   montar uma peça, ele vai te lembrar do preço antes de oferecer a opção
   paga."
9. **Se der erro** → diagnosticar pela mensagem: chave inválida → pedir
   pra colar de novo; erro de billing/quota → apontar pro passo 4; qualquer
   outro → mostrar a mensagem literal, nunca abafar.

## ETAPA 3 — Exemplo de custo mensal (mostrar sempre, mesmo se o usuário não perguntar)

Depois de conectar, sempre mostrar este exemplo pra calibrar expectativa
(baseado num calendário de 16 peças/mês — 4 Carrossel, 4 Feed, 4 Stories, 4
Reels, tier Fast do Veo — confira o preço atual antes de repetir esse
número em outra sessão, preço de IA muda rápido):

```
Exemplo de custo mensal (16 peças, se usar a IA paga em tudo, tier Fast do
Veo pro vídeo):

Imagem (12 peças de Feed/Carrossel/Stories):
- Nano Banana (Gemini): ~$0,47/mês
- GPT Image 2 (OpenAI): ~$0,40 – $0,65/mês

Vídeo (4 Reels, só via Gemini/Veo 3.1):
- Reels de 15s cada (2 clipes combinados via ffmpeg): ~$5,60 – $6,72/mês
- Reels de 30s cada (~4 clipes):                       ~$12,80/mês
- Reels de 60s cada (~8 clipes):                       ~$25,60/mês

Veo 3.1 só gera em blocos de 4, 6 ou 8 segundos por chamada — Reels mais
longos precisam de vários clipes concatenados com ffmpeg, o que soma o
custo por segundo várias vezes. Pra Reels de 30s/60s, vale considerar o
caminho grátis (ffmpeg com frames HTML/CSS) em vez da IA paga.
```

## ETAPA 4 — Instalar o ffmpeg (vídeo de Reels, grátis)

> "Quer deixar o motor de vídeo grátis pronto também? Usa a mesma técnica
> HTML/CSS + Playwright que o resto do projeto já usa — sem custo, sem
> conta em lugar nenhum, e aceita qualquer duração de Reels (o Veo pago só
> faz 4, 6 ou 8 segundos por chamada)."

Se topar:
```bash
npm install --save-dev ffmpeg-static fluent-ffmpeg
```
Confirmar instalação sem erro. Não precisa configurar mais nada — o
`designer` usa isso sozinho quando montar um Reels.

## ETAPA 5 — Registrar no CLAUDE.md

Só incluir a linha de cada capacidade que ficou pronta nesta sessão:

```markdown
## Geração de mídia
- Imagem por IA: [Gemini Nano Banana configurado (chave em `.env` →
  `GEMINI_API_KEY`, ~$0,039/imagem)] [e/ou] [GPT Image 2
  configurado (chave em `.env` → `OPENAI_API_KEY`, ~$0,03–0,05/imagem)]
  — se nenhum dos dois estiver aqui, o Designer usa imagem própria ou o
  card padrão, ambos grátis. Se os dois estiverem configurados, a pessoa
  escolhe o provedor a cada peça.
- Vídeo de Reels: [ffmpeg instalado, grátis / Gemini/Veo 3.1 configurado,
  tier Fast ~$0,10–0,12/s, blocos de 4-8s] — se não estiver aqui, Reels
  sai só com roteiro em texto.
```

## ETAPA 6 — Confirmação final

```
Geração de mídia configurada!

Imagem por IA — Gemini (Nano Banana): [Conectado / Não configurado]
Imagem por IA — GPT (GPT Image 2):         [Conectado / Não configurado]
Vídeo de Reels:                             [ffmpeg instalado / Gemini/Veo 3.1 conectado / Não configurado]

Lembrete: a opção paga sempre mostra o preço (e, se os dois provedores de
imagem estiverem configurados, pergunta qual usar) antes de gerar
qualquer coisa numa peça específica — nunca gera sem confirmação naquele
momento.

Já pode rodar /instalador-ag-ia-na-pratica normalmente.
```
