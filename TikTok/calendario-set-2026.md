## Calendário de Conteúdo — TikTok — 29/08/2026 a 17/09/2026

Cadência: 2x por semana, sempre às **13h**, a partir de 01/09/2026 (V05 foi
avulso, publicado como teste em 29/08). Cada post é um vídeo próprio de 5
slides (gancho → desenvolvimento → CTA).

Padrão visual fixo pra V05/V08-V11 (ver `TikTok/V05/build.js`): fundo
alterna dark/claro por slide, cor de destaque sempre `#E94F00`, elementos de
poster (pontos + listras + raios) só no fundo escuro, CTA final sempre
"Segue esse perfil e deixe seu comentário", vídeo com no mínimo 20s, áudio
de `TikTok/Audio/AudioIA.mp3`.

**V12 e V13 vieram de outra sessão** (mesma conta), com direção visual
própria (fundo laranja vivo, tipografia preto/branco, arte/logo fornecida
pelo usuário) — mesmo CTA final, mas layout diferente do V05-V11. Mantidos
como estão, só encaixados na sequência do calendário.

| Data | Hora | Headline | Código | Status |
|------|------|----------|--------|--------|
| Sáb, 29/08/2026 | 09h | O que é o Claude Code? | TikTok/V05 | **Já publicado (teste Sandbox) — não republicar** |
| Ter, 01/09/2026 | 13h | O Claude consegue gerenciar meu Instagram? | TikTok/V12 | Pronto |
| Qui, 03/09/2026 | 13h | Vale a pena usar o Claude Code? | TikTok/V08 | Pronto |
| Seg, 07/09/2026 | 13h | Dá pra conectar o Claude no Instagram? | TikTok/V09 | Pronto |
| Qui, 10/09/2026 | 13h | O Claude consegue criar post pro Instagram sozinho? | TikTok/V10 | Pronto |
| Seg, 14/09/2026 | 13h | Dá pra fazer Reels com IA? | TikTok/V11 | Pronto |
| Qui, 17/09/2026 | 13h | Claude Code + Instagram = Automação | TikTok/V13 | Pronto |

Fonte das headlines V05/V08-V11: `RAG/termos_pesquisa_claude.md` (perguntas
reais de busca). V12/V13: roteiro próprio da outra sessão.

Publicação: `scripts/publish_tiktok.py` — usa Sandbox (`SELF_ONLY`, restrito
a teste) até o app passar por auditoria; depois disso, `--production`.
