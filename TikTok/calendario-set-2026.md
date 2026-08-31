## Calendário de Conteúdo — TikTok — 29/08/2026 a 17/09/2026

Cadência: 2x por semana, sempre às **13h**, a partir de 01/09/2026 (V01 foi
avulso, publicado como teste em 29/08). Cada post é um vídeo próprio de 5
slides (gancho → desenvolvimento → CTA).

**Numeração das pastas segue a ordem de postagem** (V01 = primeiro a ir ao
ar, V02 = segundo, e assim por diante) — não é mais a ordem de criação.

Padrão visual fixo pra V01/V03-V06 (ver `TikTok/V01/build.js`): fundo
alterna dark/claro por slide, cor de destaque sempre `#E94F00`, elementos de
poster (pontos + listras + raios) só no fundo escuro, CTA final sempre
"Segue esse perfil e deixe seu comentário", vídeo com no mínimo 20s, áudio
de `TikTok/Audio/AudioIA.mp3`.

**V02 e V07 vieram de outra sessão** (mesma conta), com direção visual
própria (fundo laranja vivo, tipografia preto/branco, arte/logo fornecida
pelo usuário) — mesmo CTA final, mas layout diferente dos demais. Mantidos
como estão, só encaixados na sequência do calendário.

| Data | Hora | Headline | Código | Status |
|------|------|----------|--------|--------|
| Sáb, 29/08/2026 | 09h | O que é o Claude Code? | TikTok/V01 | **Já publicado (teste Sandbox) — não republicar** |
| Ter, 01/09/2026 | 13h | O Claude consegue gerenciar meu Instagram? | TikTok/V02 | Pronto |
| Qui, 03/09/2026 | 13h | Vale a pena usar o Claude Code? | TikTok/V03 | Pronto |
| Seg, 07/09/2026 | 13h | Dá pra conectar o Claude no Instagram? | TikTok/V04 | Pronto |
| Qui, 10/09/2026 | 13h | O Claude consegue criar post pro Instagram sozinho? | TikTok/V05 | Pronto |
| Seg, 14/09/2026 | 13h | Dá pra fazer Reels com IA? | TikTok/V06 | Pronto |
| Qui, 17/09/2026 | 13h | Claude Code + Instagram = Automação | TikTok/V07 | Pronto |

Fonte das headlines V01/V03-V06: `RAG/termos_pesquisa_claude.md` (perguntas
reais de busca). V02/V07: roteiro próprio da outra sessão.

Publicação: `scripts/publish_tiktok.py` — usa Sandbox (`SELF_ONLY`, restrito
a teste) até o app passar por auditoria; depois disso, `--production`.
