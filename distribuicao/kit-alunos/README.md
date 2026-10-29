# Sua Agência de Marketing IA na Prática — Projeto-base

Este é o kit inicial pra você montar seu squad de marketing (Maestro, Social
Media, Copywriter, Designer e QA Visual) dentro do seu próprio projeto, com o Claude Code.

## Como usar

0. **Descompacte o `kit-alunos-ia-na-pratica.zip` na RAIZ da pasta do seu
   projeto** — não é uma pasta nova e separada, é pra entrar junto com o
   que você já tem. **Raiz** quer dizer o nível mais de fora da pasta do
   projeto — o mesmo nível onde já está sua pasta `docs/` (onde fica a
   persona), não dentro dela. Depois de extrair, sua pasta de projeto
   deve ficar parecida com isto (pastas lado a lado, uma não entra dentro
   da outra):
   ```
   minha-pasta-do-projeto/
   ├── docs/              ← já existia (sua persona, etc.)
   ├── .claude/           ← veio do kit agora
   ├── scripts/           ← veio do kit agora
   └── package.json       ← veio do kit agora
   ```
   - **Windows:** clique com o botão direito no arquivo `.zip` →
     "Extrair tudo..." → no campo de destino, apague o que estiver escrito
     e cole (ou navegue até) o caminho da pasta do seu projeto → "Extrair".
     Se o Windows perguntar se quer substituir algum arquivo (só deve
     acontecer com o `package.json`, se você já tiver um), veja a nota
     abaixo antes de responder.
   - **Mac:** abra o `.zip` (extrai do lado, numa pasta nova) e depois
     **arraste o conteúdo de dentro dela** (as pastas `.claude` e
     `scripts`, e o arquivo `package.json`) pra dentro da pasta do seu
     projeto, confirmando "mesclar" se ele perguntar.

   **Se seu projeto já tem um `package.json`:** não deixe substituir o seu
   sem mais nem menos — melhor manter o seu e, depois de abrir o projeto
   no VSCode (Passo 1), pedir pro Claude Code: *"tenho um
   `package.json` novo em [caminho do arquivo], mescla as dependências
   dele no meu sem perder o que já tinha"*. Ele resolve isso em segundos.

   **Se você ainda não tem uma pasta de projeto** (é a primeira coisa que
   está montando no curso): aí sim, extraia numa pasta nova e fácil de
   achar — Área de Trabalho ou "Documentos" — e essa pasta vai ser o seu
   projeto daqui pra frente.
1. **Abra a pasta do seu projeto no VS Code**, com a **extensão do Claude
   Code pro VS Code** instalada e logada com sua conta (se você já usa o
   Claude Code no VS Code em outras aulas do curso, já está tudo pronto
   aqui — pode pular esse detalhe). Se ainda não tiver a extensão: no VS
   Code, vá em **Extensões** (ícone de blocos na barra lateral, ou
   `Ctrl+Shift+X`), busque por "Claude Code", instale, e faça login com
   sua conta Anthropic/Claude quando ela pedir. Depois, vá em **Arquivo →
   Abrir Pasta...** (ou "File → Open Folder...") e selecione a pasta do
   projeto (a mesma de sempre, agora com os arquivos do kit dentro dela).
2. Digite no chat do Claude Code:
   ```
   /instalador-ag-ia-na-pratica
   ```
   ou simplesmente escreva "contrate sua agência de marketing".

**É só isso — 1 comando.** O Claude Code cuida do resto sozinho: instala as
dependências base (`npm install` — Playwright, dotenv, SDKs do Gemini e da
OpenAI, sharp e ffmpeg),
monta o resto do squad (copiando de `scripts/templates/` pra
`.claude/agents/` e `.claude/skills/`) e já te conduz numa entrevista
rápida pra escrever sua primeira peça de Instagram.

## Antes de começar, você precisa ter

- **Sua persona/avatar do negócio salva** em `docs/persona.md` (ou na seção
  `## Persona do meu negócio` do seu `CLAUDE.md`). Se ainda não tiver, use a
  skill `skill-persona-profunda` primeiro — sem persona, o `contrate` para e
  avisa.
- (Opcional) Sua paleta de marca em `assets/css/tokens.css` — se não
  existir, o Designer usa uma paleta neutra até você configurar a sua.

## O que NÃO vem neste kit (de propósito)

- **Conexão com o Instagram** (`setup-instagram`) — é ensinada como lição
  própria no curso, você mesmo(a) instala naquele momento, pra aprender o
  que é uma Skill na prática.
- **Geração de imagem/vídeo por IA** (Gemini/GPT) — é 100% opcional; o
  Designer já funciona de graça (card de HTML/CSS ou imagem própria). Se
  quiser a opção paga depois, use a skill `setup-geracao-midia`, que já
  vem instalada junto com o squad.
- **Sua persona e a identidade visual da sua marca** — são suas, específicas
  do seu negócio, você monta na hora.

## Estrutura deste kit

```
.claude/skills/instalador-ag-ia-na-pratica/SKILL.md   ← o gatilho, já pronto
scripts/templates/                                   ← material de instalação do squad
scripts/export-png.js                                 ← usado pelo Designer pra exportar as peças
package.json                                           ← dependências base
```
