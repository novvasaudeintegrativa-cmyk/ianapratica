# PRD — Landing Page: Imersão "IA na Prática" (Zoom, ao vivo)

- **Status:** Draft
- **Versão:** 0.2
- **Data:** 2026-07-14
- **Owner:** IA na Prática
- **Tipo de entrega:** Landing page estática (HTML/CSS/JS) de vendas para um evento ao vivo via Zoom

---

## 1. Contexto

O projeto consiste em criar uma landing page de vendas para uma **imersão ao vivo via Zoom**, no formato de curso curto/intensivo, seguindo o padrão de mercado observado na página de referência [`cursos.m2br.academy/online-ao-vivo/claude-na-pratica`](https://cursos.m2br.academy/online-ao-vivo/claude-na-pratica) — um curso de "Claude IA na Prática" com 4 aulas ao vivo, formato prático, prova social forte e oferta de lançamento.

**Diferença deliberada em relação à referência:** o produto da referência é distribuído em 4 aulas ao vivo, em dias diferentes. Este produto, a princípio, é uma **imersão de um único dia**, das **9h às 16h** (7h de carga horária) — formato mais compacto, que cabe numa única data da agenda do aluno em vez de se estender por semanas.

O tema definido até o momento é **"IA na prática"** (escopo exato do conteúdo programático ainda em aberto — ver seção 10, Pendências). A estrutura, as seções e a lógica de conversão da página seguem o modelo de referência, mas todo o conteúdo textual, numérico e visual específico do negócio (data, preço, instrutores, depoimentos, logos de empresas) precisa ser substituído pelos dados reais antes da publicação.

## 2. Objetivo

Converter visitantes (tráfego pago e orgânico) em inscritos pagantes para a turma da imersão, comunicando com clareza:
- o que o aluno vai aprender e conseguir fazer ao final;
- por que aprender ao vivo, num formato prático, é superior a consumir conteúdo fragmentado;
- por que confiar nos instrutores/na marca;
- a urgência de garantir vaga numa turma com capacidade limitada.

## 3. Público-alvo

Perfis de comprador (a validar/ajustar com o dono do negócio antes da redação final da copy):

1. **Empreendedores** que buscam velocidade operacional usando IA no dia a dia do negócio.
2. **Profissionais de marketing digital / tráfego / social media** que precisam produzir mais, mais rápido.
3. **Gestores e autônomos** interessados em automatizar tarefas repetitivas.
4. **Usuários de outras IAs (ChatGPT, Gemini, etc.)** que querem uma base estruturada em vez de aprendizado fragmentado por vídeos soltos.
5. **Curiosos/iniciantes** que quiseram aprender IA na prática mas nunca tiveram um caminho guiado.

> **[A DEFINIR]** Confirmar se esses 5 segmentos se aplicam ao produto real ou se o público é mais específico (ex.: só empreendedores, só um nicho vertical).

## 4. Proposta de valor

- Formato **ao vivo, via Zoom**, com interação em tempo real — "você não assiste, você faz junto".
- **Um único dia**, das **9h às 16h** — cabe numa data da agenda, sem se estender por semanas.
- Turmas **reduzidas** (gera escassez genuína, não artificial).
- Ingresso com **preço de lançamento** (de R$ 247,00 por R$ 147,00), reduzindo a fricção de decisão.
- Progressão estruturada dentro do próprio dia: do uso básico ao uso avançado/autônomo de IA.
- Prova de expertise dos instrutores ("a gente faz o que ensina").

> **Diferença deliberada em relação à referência:** na página da M2BR, o acesso às gravações vem incluso no ingresso. Neste produto, a gravação **não** é inclusa por padrão — ela é vendida como order bump no checkout (ver seção 9). Isso significa que a copy da página **não pode** prometer "acesso às gravações" como benefício do ingresso principal; a gravação deve ser comunicada apenas na etapa de oferta complementar.

> **[A DEFINIR]** Validar cada um destes pontos contra a oferta real antes de publicar — não afirmar benefício (ex.: acesso a assinatura de IA incluída) que não exista de fato na oferta.

### 4.1 Oferta e preço (definido)

| Item | Descrição | Preço |
|------|-----------|-------|
| **Produto principal** | Imersão "IA na Prática" — ao vivo via Zoom, 1 dia (9h–16h) | De **R$ 247,00** por **R$ 147,00** |
| **Order bump** | Gravação da Imersão — acesso à gravação completa do dia | De **R$ 247,00** por **R$ 147,00** |

- O ingresso principal e o order bump usam a **mesma âncora e o mesmo preço promocional** (R$ 247 → R$ 147).
- O order bump é oferecido **no checkout**, como complemento opcional ao ingresso principal — não é um upsell pós-compra nem um item incluso. Na landing page ele aparece só como prévia informativa (sem botão de ação próprio — ver seção 6, linha "Investimento").
- **[A DEFINIR]** Condições de parcelamento (se haverá cartão parcelado) para o ingresso principal e/ou para o order bump.
- **[A DEFINIR]** Prazo de validade do acesso à gravação (ex.: 30 dias, 6 meses, vitalício) — necessário para a copy do order bump.
- **[A DEFINIR]** Gateway de checkout (Kiwify) — isso é pré-requisito técnico do RF07 (seção 7).

## 5. Escopo do produto (site)

**Dentro do escopo:**
- Uma landing page estática, single-page, com âncoras internas por seção.
- Totalmente responsiva (mobile-first, já que boa parte do tráfego pago chega via mobile).
- Integração com um link/botão de checkout externo (ex.: plataforma de pagamento tipo Hotmart/Eduzz/pagar.link — **[A DEFINIR]** qual gateway).
- FAQ com comportamento accordion (expandir/colapsar).
- Formulário ou botão de captura de lead (se houver etapa de captura antes do checkout — **[A DEFINIR]**).
- SEO básico (meta tags, Open Graph para compartilhamento em redes/anúncios).

**Fora do escopo (nesta fase):**
- Backend, área de membros/aluno, emissão de certificado.
- Processamento de pagamento próprio (usaremos link externo de checkout).
- CMS ou painel administrativo — conteúdo é hardcoded no HTML.
- Automação de e-mail marketing / CRM (pode ser tratada em projeto futuro).

## 6. Estrutura de seções da página

Ordem e função de cada seção (baseada no padrão de conversão da página de referência):

| # | Seção | Função | Conteúdo necessário |
|---|-------|--------|----------------------|
| 1 | **Hero** | Fixar a promessa central e capturar atenção imediata | Headline, sub-headline, imagem/foto de aula ao vivo, CTA primário |
| 2 | **Sobre a imersão** | Explicar o formato e detalhar os blocos do dia | Data da turma, horário do dia (09h–16h, confirmado), estrutura de blocos e intervalos |
| 3 | **Para quem é** | Fazer o visitante se identificar | Lista de perfis de público-alvo (seção 3) |
| 4 | **O que muda depois** | Vender a transformação, não o conteúdo | Lista de resultados/capacidades pós-curso |
| 5 | **Diferenciais** | Justificar por que este curso e não outro | Pilares competitivos + estatísticas de credibilidade |
| 6 | **Instrutores** | Gerar confiança/autoridade | Nome, foto, bio curta, bio expandida por instrutor |
| 7 | **Prova social (empresas)** | Reforçar credibilidade institucional | Logos de empresas/clientes atendidos (se houver) |
| 8 | **Depoimentos** | Prova social de alunos | Foto, nome, profissão, citação — mínimo 4–6 |
| 9 | **Investimento** | Apresentar oferta e remover objeção de preço | Preço do ingresso (de R$ 247 por R$ 147), prévia do order bump de gravação (de R$ 247 por R$ 147, só disponível no checkout, sem CTA próprio na página), parcelamento, formas de pagamento, o que está incluso no ingresso principal |
| 10 | **CTA final** | Última chamada antes de sair da página | Reforço de urgência/escassez + botão |
| 11 | **FAQ** | Eliminar objeções remanescentes | Mínimo 8–9 perguntas frequentes |
| 12 | **Footer** | Dados legais e institucionais | Endereço, telefone, e-mail, CNPJ, links legais |

> Todas as seções acima replicam a lógica de copy da referência. Nenhum texto de exemplo (nomes de aula, depoimentos, números de credibilidade) deve ir para produção sem confirmação — ver Pendências (seção 10).

## 7. Requisitos funcionais

- **RF01** — A página deve ter no mínimo 3 CTAs primários distribuídos ao longo do scroll (hero, investimento, CTA final), todos apontando para o mesmo link de checkout/captura.
- **RF02** — O FAQ deve funcionar como accordion acessível por teclado (`aria-expanded`, foco visível).
- **RF03** — Todas as seções devem ter âncoras (`id`) navegáveis a partir de um menu fixo/sticky no topo.
- **RF04** — A página deve carregar corretamente em conexões móveis 4G (performance — ver seção 8).
- **RF05** — Botões de CTA devem ter texto orientado à ação e ao benefício (ex.: "Garantir minha vaga"), nunca genérico ("Clique aqui").
- **RF06** — Placeholders de conteúdo pendente devem ser marcados visualmente no código-fonte (comentário `<!-- TODO: -->`) para facilitar a substituição posterior pelo time de conteúdo.
- **RF07** — A seção de Investimento deve apresentar o ingresso principal (de R$ 247 por R$ 147) e a prévia do order bump da gravação (de R$ 247 por R$ 147) como itens distintos, sendo que o order bump **não tem CTA próprio na página** (só aparece de fato dentro do checkout); o link/botão de checkout deve levar a um fluxo de pagamento que ofereça o order bump antes da confirmação da compra (gateway: Kiwify — ver seção 4.1).

## 8. Requisitos não funcionais

- **Performance:** Core Web Vitals dentro da faixa "boa" (LCP < 2.5s, CLS < 0.1) — página estática sem frameworks pesados favorece isso.
- **Acessibilidade:** WCAG AA como gate de publicação — contraste, foco visível em todo elemento interativo, navegação por teclado, textos alternativos em imagens.
- **Responsividade:** Breakpoints para mobile (< 640px), tablet (640–1024px) e desktop (> 1024px), sem quebra de layout.
- **SEO:** Title, meta description, Open Graph e Twitter Card configurados; estrutura semântica de headings (um único `<h1>`).
- **Compatibilidade:** Últimas 2 versões de Chrome, Safari, Firefox e Edge; sem dependência de recursos experimentais.
- **Sem dependências externas bloqueadas por CSP restritivo** (fontes, ícones e scripts devem poder ser hospedados junto ao projeto, sem exigir CDN externo).

## 9. Identidade visual

**Decisão:** reaproveitar o design system Anthropic já especificado no projeto (arquivo de tokens em `DESIGN.md`/spec fornecida), aplicado integralmente à landing page.

Resumo dos tokens que regem a UI (fonte: spec Anthropic v2.2):

- **Paleta:** canvas ivory (`#faf9f5`), tinta slate-dark (`#141413`) como CTA primário no modo claro, clay (`#d97757`) como acento de marca/foco, cards brancos (`#ffffff`), bordas alpha (`rgba(20,20,19,0.10)`).
- **Tipografia:** Anthropic Serif (fallback Georgia) para corpo de texto e headline de hero; Anthropic Sans (fallback Arial) para headings, labels, navegação e botões. Sem uppercase em nenhum papel tipográfico.
- **Raio:** 4px em botões/inputs, 8px em cards, 16px reservado para blocos de destaque (ex.: bloco de investimento/oferta), pill em badges.
- **Sombra de botão primário:** realce interno característico (`inset 0 6px 12px rgba(255,255,255,0.12)`), sem `scale()` no hover.
- **Modo escuro:** suportado; seção de fechamento (CTA final) pode usar o padrão "inverse section" (fundo slate-dark, CTA clay) para dar peso visual ao encerramento da página, independentemente do tema ativo do visitante.

Ajustes específicos deste projeto sobre a base Anthropic:
- Depoimentos e cards de instrutor usam o componente `card` padrão (branco, 8px, hover com tint `rgba(20,20,19,0.10)`).
- Seção de FAQ usa tipografia Sans para pergunta (label/subtitle) e Serif para resposta (body), mantendo o contraste dual-voice do sistema.
- Selo/badge "vagas limitadas" usa `badge-default` (pill, ivory-medium, texto slate-light) — **não** usar clay como cor de urgência para não confundir com o acento de marca.
- A seção CTA final (`inverse-section`) usa um gradiente radial com o clay vívido do hero (ver abaixo) em vez de cor chapada — a página abre e fecha com a mesma energia; o restante do site permanece na leitura calma/editorial original entre as duas pontas.

**Pivot do hero (decisão registrada nesta rodada):** a pedido explícito do usuário, o hero deixou de seguir o `editorial-hero` calmo (canvas ivory, Serif grande) e passou a ser um **hero de alto impacto**, propositalmente fora do tom editorial do resto do sistema:
- Fundo escuro (gradiente `#0c0b0a → #1b120c → #2a1409`) com um glow radial em laranja vívido (novo token `--clay-vivid: #ff5a1f`, mais intenso que o `--swatch-clay` padrão) e uma marca d'água decorativa (spark) em baixa opacidade.
- Imagem de mockup (laptop + celular + segundo dispositivo, gerada por IA) mostrando uma chamada de vídeo genérica em andamento, com pessoas — ver nota abaixo.
- Botão primário do hero e da `inverse-section` usa gradiente `--clay-vivid-bright → --clay-vivid` em vez do clay sólido padrão, para reforçar a energia nesses dois blocos específicos.
- **Escopo do "modo impacto":** aplicado só ao hero e à `inverse-section` (abertura e fechamento). O restante do site (Programação, Para quem é, Diferenciais, Instrutores, Depoimentos, Investimento, FAQ) manteve a leitura calma original do sistema Anthropic — a energia forte fica concentrada nas duas pontas, não espalhada pela página inteira.

**Sobre imagens (decisão registrada):**
- A imagem do hero é **gerada por IA (Gemini)** e está em `assets/img/hero-device-mockup.jpg`. Mostra um mockup de dispositivos com uma interface de chamada de vídeo **genérica** (pessoas de banco de imagens fictícias/anônimas, layout inspirado em apps de videochamada, mas sem reproduzir literalmente a marca/UI/logo do Zoom nem qualquer outra marca real).
- **Não foi usada a logo real do Claude/Anthropic** — não há afiliação com a Anthropic, e usar a marca deles implicaria endosso falso do produto.
- Fotos de **instrutores e depoimentos continuam NÃO sendo geradas por IA** — gerar rostos falsos para representar pessoas reais ainda não confirmadas seria enganoso (diferente da imagem do hero, que é claramente atmosférica/genérica, não uma alegação de prova social específica). Esses espaços permanecem com ícone-placeholder honesto até haver gente de verdade.

## 10. Pendências / dados a coletar antes da implementação final

Estes itens **bloqueiam** a publicação em produção (podem seguir como rascunho/placeholder em ambiente de staging — ver seção 13, Riscos) e devem ser preenchidos pelo dono do negócio:

**Resolvidos nesta rodada:**
- [x] Nome da marca/empresa organizadora — **"IA na Prática"** (já aplicado no site e no rodapé)
- [x] Formato do dia — imersão única, **09h às 16h** (7h de carga horária) (ver seção 1)
- [x] Preço — ingresso de **R$ 247 por R$ 147** à vista; order bump (gravação) com a **mesma âncora e o mesmo preço promocional** (de R$ 247 por R$ 147) (ver seção 4.1)
- [x] Gateway de checkout — **Kiwify** (confirmado; falta só o link real de checkout, ver abaixo)
- [x] Order bump não tem CTA próprio na landing page — aparece apenas dentro do checkout (já implementado)
- [x] Imagem do hero — gerada via Gemini e aplicada (`assets/img/hero-visual.png`); ver nota em "Sobre imagens" na seção 9

**Ainda pendentes:**
- [ ] Tema/ementa definitivo em nível de conteúdo — "IA na prática" está confirmado como tema guarda-chuva, mas a divisão em 4 blocos e os títulos de cada bloco (ver Programação, seção 6) ainda são uma **sugestão de rascunho**, não validada pelo conteudista
- [ ] Data (dia do mês) da próxima turma — o horário do dia (09h–16h) já está confirmado, falta só a data no calendário
- [ ] Horários intermediários exatos dos blocos/intervalos — o site já sugere uma divisão de 7h em 4 blocos + intervalos + almoço; validar se esse recorte é o desejado
- [ ] Condições de parcelamento (cartão) para ingresso e order bump
- [ ] Prazo de validade do acesso à gravação vendida como order bump
- [ ] Link real de checkout no Kiwify (o botão "Garantir minha vaga" ainda aponta para `#`)
- [ ] Nome(s), bio e foto real dos instrutores (fotos **não** serão geradas por IA — ver seção 9)
- [ ] Depoimentos reais de alunos, com autorização de uso de nome/foto (também não geradas por IA)
- [ ] Logos de empresas/clientes, se aplicável, com autorização de uso de marca
- [ ] Estatísticas de credibilidade reais (nº de alunos, anos de mercado, taxa de aprovação, etc.)
- [ ] Certificado de participação — incluso ou não no ingresso
- [ ] Política de garantia/reembolso (a referência não apresenta garantia explícita — decidir se este produto terá uma)
- [ ] Dados legais para o rodapé (endereço, telefone, e-mail, CNPJ)
- [ ] Validação item a item das perguntas e respostas do FAQ (rascunho genérico já publicado no site, adaptado ao formato de 1 dia, mas não revisado pelo dono do negócio)

## 11. Stack técnica

- **Formato:** HTML5 + CSS3 + JavaScript vanilla, sem framework de build.
- **Estrutura de arquivos proposta:**
  ```
  /index.html
  /assets/css/styles.css
  /assets/js/main.js        (accordion do FAQ, menu sticky, scroll suave)
  /assets/img/               (fotos, logos)
  /assets/fonts/              (se aplicável — fallback do sistema é aceitável)
  ```
- **Hospedagem:** compatível com qualquer hosting estático (Vercel, Netlify, GitHub Pages, ou upload direto).
- **Sem dependência de backend** nesta fase — captura de lead e pagamento delegados a serviços externos via link.

## 12. Métricas de sucesso

- Taxa de conversão da página (visitas → cliques em CTA de checkout).
- Taxa de conversão do checkout (cliques → matrículas pagas).
- Tempo médio na página e taxa de scroll até a seção de Investimento.
- Origem de tráfego com melhor conversão (para otimizar mídia paga).

> **[A DEFINIR]** Definir metas numéricas junto ao dono do negócio (ex.: X% de conversão, Y vagas vendidas na primeira turma).

## 13. Riscos e dependências

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Conteúdo real (datas, preço, instrutores) não definido a tempo | Bloqueia publicação | Página pode ir ao ar com placeholders claramente sinalizados só em ambiente de staging, nunca em produção |
| Falta de depoimentos reais na primeira turma | Reduz prova social | Para o lançamento da primeira turma, considerar seção de prova social alternativa (ex.: autoridade dos instrutores, não de alunos) |
| Ausência de gateway de pagamento definido | Bloqueia RF01/CTAs | Definir fornecedor antes do início do desenvolvimento |

## 14. Próximos passos

1. Preencher as pendências da seção 10 (dono do negócio).
2. Validar esta estrutura de seções e a proposta de valor (seção 4).
3. Redigir a copy definitiva de cada seção com os dados reais.
4. Implementar o HTML/CSS/JS aplicando os tokens do design system Anthropic (seção 9).
5. Revisão de acessibilidade e performance antes do lançamento.
6. QA cross-browser e cross-device.
7. Publicação e conexão com tráfego pago.

---

*Este PRD é um documento vivo — deve ser atualizado à medida que as pendências da seção 10 forem resolvidas.*
