## Calendário de Conteúdo — 27/08/2026 a 20/10/2026
Meta do período: aquecer audiência e gerar interesse pela próxima turma da Imersão "IA na Prática", preparando terreno pra venda de vaga.

Cadência: **quinta = Reels, terça = Feed**. Reels reaproveita os vídeos já
criados em `TikTok/V01`–`V07` (mesma peça, republicada como Reels do
Instagram). 7 Feed + 7 Reels, alternando semana a semana até 20/10.

**Ajuste de 03/09 (hoje é quinta):** não existe agendador automático
rodando — toda publicação depende de pedido explícito. F02 estava
atrasado; decidido começar hoje pelo Reels (R01) em vez do Feed, e o Feed
(F02) passa pra próxima terça. A partir daqui a cadência é sempre
quinta=Reels / terça=Feed.

| Dia/Data | Tipo | Conteúdo | Código | Status |
|----------|------|----------|--------|--------|
| Qui, 27/08/2026 | Feed | Refs/1.jpeg — já publicado | Feed/F01 | Publicado |
| Qui, 03/09/2026 | Reels | TikTok/V01 — "O que é o Claude Code?" | Reels/R01 | Pronto — a publicar hoje |
| Ter, 08/09/2026 | Feed | Refs/2.jpeg — "Segredo: o Claude conserta seu Instagram inteiro" | Feed/F02 | Copy pronta |
| Qui, 10/09/2026 | Reels | TikTok/V02 — "O Claude consegue gerenciar meu Instagram?" | Reels/R02 | Vídeo pronto — legenda pendente |
| Ter, 15/09/2026 | Feed | Refs/3.jpeg — "Tenha um time de agentes de IA trabalhando 24/7" | Feed/F03 | Copy pronta |
| Qui, 17/09/2026 | Reels | TikTok/V03 — "Vale a pena usar o Claude Code?" | Reels/R03 | Vídeo pronto — legenda pendente |
| Ter, 22/09/2026 | Feed | Refs/4.jpeg — "Por trás do Claude tem a Anthropic" | Feed/F04 | Copy pronta |
| Qui, 24/09/2026 | Reels | TikTok/V04 — "Dá pra conectar o Claude no Instagram?" | Reels/R04 | Vídeo pronto — legenda pendente |
| Ter, 29/09/2026 | Feed | Refs/6.jpeg — "Você confiaria a rotina do seu Instagram a uma IA?" | Feed/F05 | Copy pronta |
| Qui, 01/10/2026 | Reels | TikTok/V05 — "O Claude consegue criar post pro Instagram sozinho?" | Reels/R05 | Vídeo pronto — legenda pendente |
| Ter, 06/10/2026 | Feed | Refs/7.jpeg — "Quantas vezes você já tentou IA e não virou rotina?" | Feed/F06 | Copy pronta |
| Qui, 08/10/2026 | Reels | TikTok/V06 — "Dá pra fazer Reels com IA?" | Reels/R06 | Vídeo pronto — legenda pendente |
| Ter, 13/10/2026 | Feed | Refs/8.jpeg — "A próxima turma da Imersão IA na Prática está chegando" | Feed/F07 | Copy pronta |
| Qui, 15/10/2026 | Reels | TikTok/V07 — "Claude Code + Instagram = Automação" | Reels/R07 | Vídeo pronto — legenda pendente |
| Ter, 20/10/2026 | Feed | Refs/9.jpeg — "Time de agentes de IA 24/7 — vagas abertas" | Feed/F08 | Copy pronta (tem placeholder de prova social a preencher) |

Vídeos copiados de `TikTok/V0X/video.mp4` pra `Instagram/Reels/R0X/reels.mp4`
(cópia, não link — cada plataforma fica com seu próprio arquivo).

Publicação: `scripts/publish_instagram.py` — agora suporta Reels
(`media_type=REELS`, detecção automática por extensão `.mp4`/`.mov`, espera
de até 6min pro processamento de vídeo). Testado pela primeira vez hoje com
o R01.
