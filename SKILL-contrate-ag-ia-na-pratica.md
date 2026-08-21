---
name: contrate-ag-ia-na-pratica
description: >
  Instala de uma vez só o squad completo de marketing no projeto: o
  `Maestro` (orquestrador) e os três subagentes que ele coordena —
  `social-media`, `copywriter` e `designer`. Não gera conteúdo nem
  escreve nada — só prepara a infraestrutura pra Skills como
  `/maestro-ia-na-pratica` e `/entrevistador-ia-na-pratica` funcionarem.
  Use quando o usuário pedir "contrate sua agência de marketing",
  "agência de marketing IA na Prática", "monte meu time de marketing",
  "monte minha agência de IA", "criar squad", "instalar o maestro",
  "instalar os agentes", "preparar o time", ou quando outra Skill
  orientar o usuário a rodar esta primeiro por falta de algum
  subagente.
---

# Agência de Marketing IA na Prática — Instalador do Squad

Seu único trabalho é **instalar arquivos**, não decidir estratégia,
escrever copy nem desenhar nada. Isso é o ponto de entrada único pra
preparar toda a infraestrutura que o Maestro e o Entrevistador precisam
pra funcionar — nenhuma outra Skill deve duplicar essa lógica de
instalação; elas apontam pra cá quando falta alguma peça.

## O que instalar

Quatro arquivos, cada um copiado do material de apoio do curso (pasta
`scripts/templates/`) pra dentro de `.claude/`, **só se ainda não
existir** no destino:

| Peça | Origem (material de apoio) | Destino |
|------|------------------------------|---------|
| Maestro (orquestrador) | `scripts/templates/maestro-ia-na-pratica.md` | `.claude/skills/maestro-ia-na-pratica/SKILL.md` |
| Social Media | `scripts/templates/agents/social-media.md` | `.claude/agents/social-media.md` |
| Copywriter | `scripts/templates/agents/copywriter.md` | `.claude/agents/copywriter.md` |
| Designer | `scripts/templates/agents/designer.md` | `.claude/agents/designer.md` |

## Passo 1: Verificar o que já existe

Checar cada um dos 4 destinos da tabela acima. Não reinstalar o que já
existir — nunca sobrescrever um arquivo que o usuário (ou uma sessão
anterior) já tenha customizado.

## Passo 2: Instalar o que faltar

Para cada arquivo que faltar: ler o conteúdo do arquivo de origem
correspondente e escrever no destino, criando as pastas necessárias
(`.claude/skills/maestro-ia-na-pratica/` e/ou `.claude/agents/`) se não
existirem. Não perguntar antes — instalar é o comportamento padrão,
igual à auto-persistência das outras Skills do projeto.

**Se algum arquivo de origem não existir** em `scripts/templates/`
(projeto sem esse material de apoio — ex. copiado sem a pasta
completa), avisar o usuário exatamente qual peça faltou e parar. Nunca
inventar o conteúdo de um subagente ou do Maestro na hora — eles são
peças cuidadosamente calibradas, não algo pra gerar de improviso.

## Passo 3: Relatório final

Terminar sempre com um resumo direto, tipo:

```
Contratando sua Agência de Marketing...
✓ Maestro (já existia)
✓ Social Media — instalado agora
✓ Copywriter — instalado agora
✓ Designer — instalado agora

Sua agência está pronta. Quer já criar sua primeira peça
(/entrevistador-ia-na-pratica) ou planejar um período inteiro de
conteúdo (/maestro-ia-na-pratica)?
```

Se todos os 4 já existiam, encurtar pra uma frase: "Sua agência já
estava toda montada — nada pra instalar." Sem enrolação.
