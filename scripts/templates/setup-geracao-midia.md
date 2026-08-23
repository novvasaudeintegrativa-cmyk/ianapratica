---
name: setup-geracao-midia
description: >
  Configura a geração de mídia por IA do squad, sempre deixando claro que
  é 100% opcional — o Designer já funciona de graça sem nada disso (card
  de HTML/CSS ou imagem própria pra Feed/Carrossel/Stories, vídeo via
  ffmpeg pro Reels). Quem quiser a opção paga conecta o fal.ai (Flux pra
  imagem, Kling pra vídeo) com uma chave só. Mostra o preço aproximado
  antes de configurar, salva a chave em `.env`, testa de verdade e
  registra um resumo no `CLAUDE.md`. Também funciona como diagnóstico: se
  já houver algo configurado, testa antes de sugerir refazer. Use quando o
  usuário disser "configurar geração de imagem", "conectar fal.ai",
  "contratar ia pra gerar imagem", "contratar ia pra gerar vídeo", "gerar
  imagem com ia", "gerar vídeo do reels com ia", "geração de mídia", ou
  "configurar ffmpeg".
---

# Setup Geração de Mídia — Grátis por padrão, IA paga opcional

**Regra de ouro: o caminho grátis é o padrão e já funciona sem esta skill.**
Esta skill só existe pra quem quiser a opção paga (mais realista/variada) —
nunca é pré-requisito pra usar `/contrate-ag-ia-na-pratica`.

| Capacidade | Grátis (padrão, sempre disponível) | Paga (opcional, via fal.ai) |
|---|---|---|
| **Imagem de fundo** | Sua própria imagem (print, foto) ou o card de HTML/CSS — zero configuração. | **Flux** gera uma imagem nova por prompt. ~$0,003–$0,01/imagem. |
| **Vídeo de Reels** | HTML/CSS (mesma técnica do resto) + `ffmpeg` juntam os frames do roteiro num vídeo real, sem gerar conteúdo novo por IA. | **Kling** gera um vídeo novo por prompt, em blocos de **5 ou 10 segundos** (não faz 15/30/60s direto — pra esses, o caminho grátis é o mais flexível). ~$0,07/s (Kling 2.5 Turbo Pro, `https://fal.ai/pricing` — confira o tier exato, preços variam entre versões do Kling). |

Exemplo real de custo mensal (calendário de 16 peças — 4 Carrossel, 4 Feed, 4
Stories, 4 Reels de 15s), **se usar a opção paga em tudo**: entre **$4,20 e
$4,35/mês** com Reels curtos, até ~$17/mês com Reels de 60s. Preço confere
com a Etapa 3. É barato, mas segue sendo opcional — o caminho grátis chega a
$0.

---

## Diagnóstico automático (rodar sempre, antes de perguntar qualquer coisa)

1. **fal.ai:** existe `.env` com `FAL_API_KEY` preenchido?
   - **Não** → nada pago configurado. Não perguntar nada de cara — só
     mencionar rapidamente que a opção paga existe, caso o usuário mostre
     interesse (ver ETAPA 1).
   - **Sim** → testar com uma chamada real e barata (ver ETAPA 2). Se
     funcionar, avisar "fal.ai já está conectado" e parar. Se falhar
     (chave inválida/revogada, sem crédito), mostrar o erro exato e
     perguntar se quer resolver.
2. **ffmpeg (vídeo grátis):** existe `node_modules/ffmpeg-static` (ou
   `node_modules/@ffmpeg-installer/ffmpeg`) na raiz do projeto?
   - **Sim** → avisar "ffmpeg já está pronto" e pular a ETAPA 4.
   - **Não** → seguir pra ETAPA 4 se o usuário quiser vídeo de Reels (é
     rápido, só um `npm install`).

---

## ETAPA 1 — Perguntar antes de configurar qualquer coisa paga

Só chega aqui se o usuário pediu explicitamente ("contratar IA", "conectar
fal.ai", etc.) — nunca oferecer isso de forma proativa/insistente durante
outro fluxo.

> "A geração por IA é opcional — o Designer já funciona de graça (imagem
> própria ou card padrão; vídeo do Reels via ffmpeg). Se quiser a opção
> paga mesmo assim, uso o **fal.ai**: uma chave só dá acesso a Flux
> (imagem, ~$0,003–$0,01 cada) e Kling (vídeo, ~$0,07/s). Um mês inteiro
> de calendário fica entre ~$4 e ~$17, dependendo de quanto vídeo você usar.
> Quer configurar?"

Se não quiser, parar aqui, sem insistir.

## ETAPA 2 — Criar, salvar e testar a chave do fal.ai

1. Envie o link: `https://fal.ai/dashboard/keys`
2. Instrua: "Crie uma conta (e-mail ou Google, sem cartão pra só se
   cadastrar). Clique em 'Create new key', dê um nome, confirme. A chave
   só aparece uma vez — copie na hora."
3. Avise: **"Essa chave dá acesso à sua conta de billing no fal.ai —
   trate como senha. Já teve caso relatado de chave vazada gerando
   cobrança indevida e o fal.ai recusando reembolso (segurança da chave é
   responsabilidade de quem a gerou). Nunca compartilhe, nunca cole em
   arquivo que vai pro GitHub."**
4. Instrua: "Antes de gerar de verdade, adicione um método de pagamento ou
   um top-up pequeno em `https://fal.ai/dashboard/usage-billing` — sem
   saldo, as chamadas falham."
5. Colar a chave e salvar no `.env` (sem apagar outras variáveis):
   ```
   # Geração de mídia por IA (fal.ai) — Gerado pelo setup-geracao-midia
   FAL_API_KEY=[chave colada pelo usuário]
   ```
6. Instalar o SDK oficial, se ainda não existir:
   ```bash
   npm install --save @fal-ai/client
   ```
7. Testar de verdade, gerando 1 imagem barata (avisar antes: "isso gera 1
   imagem de teste real, poucos centavos"):
   ```bash
   node -e "
   require('dotenv').config();
   const { fal } = require('@fal-ai/client');
   fal.config({ credentials: process.env.FAL_API_KEY });
   fal.subscribe('fal-ai/flux/schnell', {
     input: { prompt: 'Um círculo laranja simples sobre fundo branco, minimalista.', image_size: 'square_hd' }
   }).then(result => {
     console.log('OK:', result.data.images[0].url);
   }).catch(e => {
     console.log('ERRO:', e.message);
     process.exit(1);
   });
   "
   ```
8. **Se der `OK`** → confirmar: "Conectado! Quando o Designer for montar
   uma peça, ele vai te lembrar do preço antes de oferecer a opção paga."
9. **Se der erro** → diagnosticar pela mensagem: chave inválida → pedir
   pra colar de novo; erro de saldo/billing → apontar pro passo 4; qualquer
   outro → mostrar a mensagem literal, nunca abafar.

## ETAPA 3 — Exemplo de custo mensal (mostrar sempre, mesmo se o usuário não perguntar)

Depois de conectar, sempre mostrar este exemplo pra calibrar expectativa
(baseado num calendário de 16 peças/mês — 4 Carrossel, 4 Feed, 4 Stories, 4
Reels — confira o preço atual antes de repetir esse número em outra sessão,
preço de IA muda rápido):

```
Exemplo de custo mensal (16 peças, se usar a IA paga em tudo):
- Reels de 15s cada:  ~$4,24 – $4,32/mês
- Reels de 30s cada:  ~$8,44 – $8,52/mês
- Reels de 60s cada:  ~$16,84 – $16,92/mês

Pra referência: o cenário de Reels de 15s (mês inteiro) ainda fica mais
barato que gerar um ÚNICO Reels de 15s no Veo 3 padrão (Google), que
sozinho já custa $6–$11. Nos cenários de 30s/60s, vale comparar direito
antes de decidir — a vantagem sobre o Veo 3 diminui.
```

## ETAPA 4 — Instalar o ffmpeg (vídeo de Reels, grátis)

> "Quer deixar o motor de vídeo grátis pronto também? Usa a mesma técnica
> HTML/CSS + Playwright que o resto do projeto já usa — sem custo, sem
> conta em lugar nenhum, e aceita qualquer duração de Reels (o Kling pago
> só faz 5 ou 10 segundos por vez)."

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
- Imagem por IA: fal.ai/Flux configurado (chave em `.env` → `FAL_API_KEY`,
  ~$0,003–$0,01/imagem) — se não estiver aqui, o Designer usa imagem
  própria ou o card padrão, ambos grátis.
- Vídeo de Reels: [ffmpeg instalado, grátis / fal.ai/Kling configurado,
  ~$0,07/s, blocos de 5-10s] — se não estiver aqui, Reels sai só com
  roteiro em texto.
```

## ETAPA 6 — Confirmação final

```
Geração de mídia configurada!

Imagem por IA (fal.ai/Flux): [Conectado / Não configurado]
Vídeo de Reels:              [ffmpeg instalado / fal.ai/Kling conectado / Não configurado]

Lembrete: a opção paga sempre mostra o preço antes de gerar qualquer coisa
numa peça específica — nunca gera sem confirmação naquele momento.

Já pode rodar /contrate-ag-ia-na-pratica normalmente.
```
