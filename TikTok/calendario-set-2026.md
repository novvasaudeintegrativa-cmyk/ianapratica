## Calendário de Conteúdo — TikTok — 31/08/2026 a 14/09/2026

Cadência: 3 posts por semana (segunda, quarta e sexta), sempre às **9h da
manhã**. Cada post é um vídeo próprio (5 slides: pergunta → desenvolvimento
→ CTA), a partir das perguntas reais de busca em
`RAG/termos_pesquisa_claude.md`. Uma pergunta = um vídeo.

Padrão visual fixo (ver `TikTok/V05/build.js`): fundo alterna dark/claro por
slide, cor de destaque sempre `#E94F00`, elementos de poster (pontos +
listras + raios) só no fundo escuro, CTA final sempre "Segue esse perfil e
deixe seu comentário", vídeo com no mínimo 20s, áudio de `TikTok/Audio/AudioIA.mp3`.

| Data | Hora | Headline (pergunta de busca) | Código | Status |
|------|------|-------------------------------|--------|--------|
| Seg, 31/08/2026 | 09h | O que é o Claude Code? | TikTok/V05 | **Já publicado (teste Sandbox) — não republicar dia 31/08** |
| Seg, 07/09/2026 | 09h | Vale a pena usar o Claude Code? | TikTok/V08 | Pronto |
| Qua, 09/09/2026 | 09h | Dá pra conectar o Claude no Instagram? | TikTok/V09 | Pronto |
| Sex, 11/09/2026 | 09h | O Claude consegue criar post pro Instagram sozinho? | TikTok/V10 | Pronto |
| Seg, 14/09/2026 | 09h | Dá pra fazer Reels com IA? | TikTok/V11 | Pronto |

Fonte das perguntas: `RAG/termos_pesquisa_claude.md`, seções "Claude Code" e
"Claude Code Instagram" (perguntas reais de busca, mesma lógica de gancho
que já funciona por serem dúvidas que as pessoas já digitam).

Publicação: `scripts/publish_tiktok.py` — usa Sandbox (`SELF_ONLY`, restrito
a teste) até o app passar por auditoria; depois disso, `--production`.
