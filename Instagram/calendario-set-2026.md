## Calendário de Conteúdo — 27/08/2026 a 19/10/2026
Meta do período: aquecer audiência e gerar interesse pela próxima turma da Imersão "IA na Prática", preparando terreno pra venda de vaga.

Cadência: **quinta = Reels, segunda = Feed**. Reels reaproveita os vídeos já
criados em `TikTok/V01`–`V07` (mesma peça, republicada como Reels do
Instagram). 7 Feed + 7 Reels, alternando semana a semana até 19/10.

**Ajuste de 03/09 (hoje é quinta):** não existe agendador automático
rodando — toda publicação depende de pedido explícito (por isso F02 tinha
ficado parado). Decidido começar hoje pelo Reels (R01) em vez do Feed.
Cadência inicial era terça+quinta, ajustada em seguida pra segunda+quinta.

**Automação real:** 13 tarefas foram criadas no Windows Task Scheduler
(`IANaPratica-F02` a `IANaPratica-R07`, ver `scripts/setup-tasks-instagram.ps1`)
em 03/09/2026, mas **migradas pro GitHub Actions em 07/09/2026** (ver
`.github/workflows/publish-instagram.yml` e skill `agendamento-instagram`)
— as tarefas locais foram desativadas de propósito e não devem ser
reativadas. Quem dispara `publish_instagram.py` sozinho na data/hora certa,
sem precisar de pedido, agora é o GitHub Actions, rodando na nuvem,
indiferente ao computador local. F08 teve o placeholder de prova social
removido da legenda (sem dado real disponível).

| Dia/Data | Tipo | Conteúdo | Código | Status |
|----------|------|----------|--------|--------|
| Qui, 27/08/2026 | Feed | Refs/1.jpeg — já publicado | Feed/F01 | Publicado |
| Qui, 03/09/2026 | Reels | TikTok/V01 — "O que é o Claude Code?" | Reels/R01 | Publicado (Post ID 18134542465621128) |
| Seg, 07/09/2026 | Feed | Refs/2.jpeg — "Segredo: o Claude conserta seu Instagram inteiro" | Feed/F02 | Publicado (manual, 07/09/2026, Post ID 17894348835672052) |
| Qui, 10/09/2026 | Reels | TikTok/V02 — "O Claude consegue gerenciar meu Instagram?" | Reels/R02 | Agendado (GitHub Actions, 10/09 09h) |
| Seg, 14/09/2026 | Feed | Refs/3.jpeg — "Tenha um time de agentes de IA trabalhando 24/7" | Feed/F03 | Publicado (manual, adiantado, 07/09/2026 11:30, Post ID 17880522810687521) |
| Qui, 17/09/2026 | Reels | TikTok/V03 — "Vale a pena usar o Claude Code?" | Reels/R03 | Agendado (GitHub Actions, 17/09 09h) |
| Seg, 21/09/2026 | Feed | Refs/4.jpeg — "Por trás do Claude tem a Anthropic" | Feed/F04 | Agendado (GitHub Actions, 21/09 09h) |
| Qui, 24/09/2026 | Reels | TikTok/V04 — "Dá pra conectar o Claude no Instagram?" | Reels/R04 | Agendado (GitHub Actions, 24/09 09h) |
| Seg, 28/09/2026 | Feed | Refs/6.jpeg — "Você confiaria a rotina do seu Instagram a uma IA?" | Feed/F05 | Agendado (GitHub Actions, 28/09 09h) |
| Qui, 01/10/2026 | Reels | TikTok/V05 — "O Claude consegue criar post pro Instagram sozinho?" | Reels/R05 | Agendado (GitHub Actions, 01/10 09h) |
| Seg, 05/10/2026 | Feed | Refs/7.jpeg — "Quantas vezes você já tentou IA e não virou rotina?" | Feed/F06 | Agendado (GitHub Actions, 05/10 09h) |
| Qui, 08/10/2026 | Reels | TikTok/V06 — "Dá pra fazer Reels com IA?" | Reels/R06 | Agendado (GitHub Actions, 08/10 09h) |
| Seg, 12/10/2026 | Feed | Refs/8.jpeg — "A próxima turma da Imersão IA na Prática está chegando" | Feed/F07 | Agendado (GitHub Actions, 12/10 09h) |
| Qui, 15/10/2026 | Reels | TikTok/V07 — "Claude Code + Instagram = Automação" | Reels/R07 | Agendado (GitHub Actions, 15/10 09h) |
| Seg, 19/10/2026 | Feed | Refs/9.jpeg — "Time de agentes de IA 24/7 — vagas abertas" | Feed/F08 | Publicado (manual, 07/09/2026, Post ID 17944980234300070) |

Vídeos copiados de `TikTok/V0X/video.mp4` pra `Instagram/Reels/R0X/reels.mp4`
(cópia, não link — cada plataforma fica com seu próprio arquivo).

Publicação: `scripts/publish_instagram.py` — agora suporta Reels
(`media_type=REELS`, detecção automática por extensão `.mp4`/`.mov`, espera
de até 6min pro processamento de vídeo, `--caption-file` pra evitar
problema de emoji/acento em tarefa agendada). Testado publicando de
verdade com o R01.
