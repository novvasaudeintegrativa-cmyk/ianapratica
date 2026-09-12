---
name: diagnostico-instagram
description: >
  Playbook de diagnóstico pra quando uma publicação do Instagram não saiu
  no horário esperado, falhou, ou o usuário pergunta "por que não
  publicou?"/"o que deu errado?"/"consegue ver o erro?". Cobre como
  investigar o GitHub Actions (histórico de execuções, status de cada
  step, logs completos se houver token com permissão), como distinguir
  falha transitória (rede/API da Meta instável — o retry automático já
  resolve sozinho) de falha persistente (config errada, precisa de ajuste
  manual), e como testar a API da Meta diretamente sem publicar de
  verdade. Use sempre que o assunto for "não postou", "deu erro",
  "verificar o que aconteceu com a publicação", ou qualquer investigação
  de falha na automação do Instagram. Complementa a skill
  `agendamento-instagram` (que cobre as regras de quando/como publicar,
  não como diagnosticar uma falha já acontecida).
---

# Diagnóstico de Falha de Publicação no Instagram

Playbook criado em 12/09/2026, depois de investigar por que o Reels/R02
não saiu na quinta (10/09/2026) — o workflow rodou (atrasado ~4h) e
falhou com "exit code 1", sem detalhe visível na API sem permissão de
admin do repositório. Retestando manualmente a mesma chamada, funcionou
de primeira — indicando falha transitória, não bug de configuração.
Duas correções permanentes saíram dessa investigação (ver `scripts/
publish_scheduled.py`): retry automático com backoff pra falha
transitória, e um bug separado onde a atualização do calendário nunca
era commitada de volta ao repositório quando rodando via GitHub Actions.

## Passo 1 — Confirmar que realmente falhou

Checar `Instagram/calendario-set-2026.md`: a linha da peça esperada
ainda está "Agendado" na data que já passou? Se já virou "Publicado",
não é uma falha — pode ser só demora normal, ou o usuário não viu ainda.

## Passo 2 — Achar a execução no GitHub Actions

```bash
curl -s "https://api.github.com/repos/novvasaudeintegrativa-cmyk/ianapratica/actions/workflows/publish-instagram.yml/runs?per_page=20" \
  -o runs.json -w "HTTP %{http_code}\n"
python -c "
import json
data = json.load(open('runs.json', encoding='utf-8'))
for r in data.get('workflow_runs', []):
    print(r['id'], r['created_at'], r['event'], r['status'], r['conclusion'])
"
```

Procurar a execução com `created_at` próximo do horário esperado (lembrar
que `schedule` pode atrasar horas em runners compartilhados — isso por si
só não é a causa da falha, só um detalhe a não confundir com o problema
real) e `conclusion: failure`.

## Passo 3 — Ver o status de cada step do job

```bash
curl -s "https://api.github.com/repos/novvasaudeintegrativa-cmyk/ianapratica/actions/runs/<RUN_ID>/jobs" \
  -o jobs.json -w "HTTP %{http_code}\n"
python -c "
import json
data = json.load(open('jobs.json', encoding='utf-8'))
for j in data.get('jobs', []):
    print('job:', j['id'], j['status'], j['conclusion'])
    for s in j.get('steps', []):
        print('  -', s['name'], '|', s['status'], '|', s['conclusion'])
"
```

Isso mostra QUAL step falhou (ex. "Publicar..."), mas não o texto do
erro em si.

## Passo 4 — Tentar o log completo

**Sem token com permissão (`Actions: Read`):** a API de download de log
(`/actions/jobs/<JOB_ID>/logs`) retorna 403 "Must have admin rights to
Repository" mesmo em repositório público. As `annotations`
(`/repos/.../check-runs/<JOB_ID>/annotations`) às vezes dão uma pista
genérica (ex. "Process completed with exit code 1"), raramente o
suficiente.

**Com `GITHUB_TOKEN` configurado em `.env`** (Personal Access Token
fine-grained, escopo `Actions: Read` no mínimo — ver CLAUDE.md pra como
foi pedido/gerado): usar `Authorization: Bearer $GITHUB_TOKEN` no header
do `curl` pra baixar o log completo de verdade:

```bash
curl -sL -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/novvasaudeintegrativa-cmyk/ianapratica/actions/jobs/<JOB_ID>/logs" \
  -o job_log.txt
```

**Sem token e sem conseguir o log:** dar ao usuário o link direto pra ele
abrir no navegador (a interface web mostra o log completo pra qualquer
pessoa em repositório público, sem precisar ser admin):
`https://github.com/novvasaudeintegrativa-cmyk/ianapratica/actions/runs/<RUN_ID>`

## Passo 5 — Testar a API da Meta direto, sem publicar de verdade

Reproduzir a chamada que falhou, isoladamente, pra separar "transitório"
de "persistente". Seguro fazer isso (criar um container não publica nada
sozinho — só o passo seguinte, `media_publish`, torna público):

```python
import os, requests
from dotenv import load_dotenv
load_dotenv()
token = os.getenv('INSTAGRAM_ACCESS_TOKEN')
ig_id = os.getenv('INSTAGRAM_BUSINESS_ID')

# 1. Token ainda válido?
r = requests.get(f'https://graph.facebook.com/v19.0/{ig_id}',
    params={'fields': 'id,username', 'access_token': token}, timeout=15)
print(r.status_code, r.json())

# 2. Mídia acessível publicamente?
# curl -s -o /dev/null -w "%{http_code}" "https://raw.githubusercontent.com/.../slide-1.jpeg"

# 3. Reproduzir a criação do container (Feed/Reels/Carrossel conforme o caso)
# — ver scripts/publish_instagram.py pra montar o payload certo.
```

Se tudo isso funcionar normalmente agora, é forte indício de falha
transitória — o retry automático (`publish_with_retry`, `scripts/
publish_scheduled.py`) já cobre isso daqui pra frente sem precisar de
intervenção manual. Se algo falhar de novo (token inválido, mídia
rejeitada, erro de permissão), é persistente — precisa investigar/
corrigir a causa específica antes de tentar publicar de novo.

## Passo 6 — Reportar e agir

1. Resumir pro usuário: o que aconteceu, se é transitório ou persistente,
   e o que already foi corrigido (retry automático já reduz recorrência
   de falha transitória).
2. **Nunca publicar de verdade sem confirmação explícita do usuário** —
   mesmo numa investigação de "por que falhou", publicar é uma ação
   pública, difícil de reverter, e continua exigindo autorização
   pontual, igual a qualquer outra publicação.
3. Se a peça ainda precisa sair (atrasada), oferecer publicar agora
   (`--code <Formato/Código>`) só com autorização explícita.
