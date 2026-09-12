"""
publish_scheduled.py — Publica automaticamente a(s) peça(s) agendada(s)
pra hoje, lendo todo arquivo `Instagram/calendario-*.md` do projeto.

Feito pra rodar via GitHub Actions (cron) em vez de depender do computador
local estar ligado (Windows Task Scheduler) — a nuvem roda o horário
independente do PC pessoal ligado, dormindo ou desligado.

Genérico de propósito: não assume nome de repositório nem nome de arquivo
de calendário fixos -- funciona em qualquer projeto que siga a mesma
convenção (`Instagram/calendario-[periodo].md`, ver skill `social-media`),
não só neste. O repositório é sempre descoberto via `git remote get-url
origin` (mesma técnica de host_media() em publish_instagram.py); o(s)
calendário(s) via glob em `Instagram/calendario-*.md` -- pode haver mais
de um ativo ao mesmo tempo (ex. campanhas em paralelo).

Uso:
  python scripts/publish_scheduled.py                     # publica o que estiver agendado pra hoje
  python scripts/publish_scheduled.py --date 14/09/2026    # simula outra data (teste manual)
  python scripts/publish_scheduled.py --dry-run            # não publica de verdade, só mostra o que faria

Modo pontual/urgente (fora do calendário, disparado via workflow_dispatch):
  python scripts/publish_scheduled.py --code Feed/F04
  python scripts/publish_scheduled.py --code Feed/F04 --wait-until-utc 14:30
    (--code publica essa peça específica na hora, ignorando a checagem de
    data do calendário; --wait-until-utc espera até esse horário, HOJE, em
    UTC, DENTRO do runner do GitHub Actions -- não depende da sessão do
    Claude nem do computador local ficarem ligados. Bom pra "publica isso
    daqui a X horas", limitado pelo teto de execução do runner, ~6h.)

Exige as mesmas variáveis de ambiente que publish_instagram.py
(INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ID) — no GitHub Actions elas
vêm de Secrets do repositório, não de um .env.

Formatos suportados (lidos da coluna Tipo do calendário): Feed, Reels,
Carrossel e Stories. Stories publica cada quadro (Instagram/Stories/SXX/
slides/slide-N.*) como uma Story independente em sequência, sem legenda
(a API não aceita legenda pra Stories).
"""
import argparse, re, sys, time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import publish_instagram as pub

REPO_ROOT = Path(__file__).parent.parent

# Linha de tabela markdown: | Dia, DD/MM/AAAA | Tipo | Conteúdo | Código | Status |
ROW_RE = re.compile(
    r"^\|\s*[^|]*?(\d{2}/\d{2}/\d{4})\s*\|\s*(Feed|Reels|Carrossel|Stories)\s*\|\s*(.*?)\s*\|\s*([\w/]+)\s*\|\s*(.*?)\s*\|\s*$"
)


def find_calendar_files() -> list[Path]:
    """Descobre todos os calendários ativos -- o nome exato varia por
    projeto/período (ex. calendario-set-2026.md, calendario-outubro.md),
    então nunca é fixo. Pode haver mais de um arquivo se houver campanhas
    paralelas."""
    return sorted((REPO_ROOT / "Instagram").glob("calendario-*.md"))


def parse_calendar(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    rows = []
    for line in text.splitlines():
        m = ROW_RE.match(line.strip())
        if m:
            data, tipo, conteudo, codigo, status = m.groups()
            rows.append({
                "file": path, "line": line, "data": data, "tipo": tipo,
                "conteudo": conteudo, "codigo": codigo, "status": status,
            })
    return rows


def parse_all_calendars() -> list[dict]:
    rows = []
    for path in find_calendar_files():
        rows.extend(parse_calendar(path))
    return rows


def media_and_caption(tipo: str, codigo: str) -> tuple[list[str], str]:
    # codigo já vem como "Feed/F02", "Reels/R02", "Carrossel/C02" ou
    # "Stories/S02" (inclui o tipo) — não duplicar.
    base = REPO_ROOT / "Instagram" / codigo
    if tipo == "Feed":
        slides = sorted((base / "slides").glob("slide-*.*"))
        if not slides:
            raise RuntimeError(f"Nenhuma imagem encontrada em {base / 'slides'}")
        images = [str(slides[0])]
    elif tipo == "Carrossel":
        # Carrossel de verdade: TODOS os slides, não só o primeiro —
        # publish_instagram.py detecta carrossel automaticamente quando
        # recebe mais de uma imagem (media_type=CAROUSEL).
        slides = sorted((base / "slides").glob("slide-*.*"))
        if len(slides) < 2:
            raise RuntimeError(
                f"Carrossel {codigo} precisa de pelo menos 2 imagens em "
                f"{base / 'slides'}, achei {len(slides)}."
            )
        images = [str(s) for s in slides]
    elif tipo == "Stories":
        # Todos os quadros — cada um vira uma Story independente, publicada
        # em sequência. Stories não usa legenda (a API não aceita), então
        # não exige caption.txt como os outros tipos.
        slides = sorted((base / "slides").glob("slide-*.*"))
        if not slides:
            raise RuntimeError(f"Nenhum quadro encontrado em {base / 'slides'}")
        return [str(s) for s in slides], ""
    else:  # Reels
        video = base / "reels.mp4"
        if not video.exists():
            raise RuntimeError(f"Vídeo não encontrado: {video}")
        images = [str(video)]

    caption_path = base / "caption.txt"
    if not caption_path.exists():
        raise RuntimeError(f"caption.txt não encontrado em {base}")
    caption = caption_path.read_text(encoding="utf-8").strip()
    return images, caption


def find_by_codigo(rows: list[dict], codigo: str) -> dict | None:
    for r in rows:
        if r["codigo"] == codigo:
            return r
    return None


def wait_until_utc(hhmm: str) -> None:
    """Dorme (dentro do próprio runner do GitHub Actions, não na sessão do
    Claude) até o relógio UTC bater HH:MM hoje. Usado pra pedido pontual tipo
    'publica isso daqui a 3 horas' sem depender de nenhum timer de sessão."""
    try:
        target_h, target_m = (int(x) for x in hhmm.split(":", 1))
    except ValueError:
        raise SystemExit(f"ERRO: --wait-until-utc precisa ser HH:MM (24h), recebi {hhmm!r}.")
    now = datetime.now(timezone.utc)
    target = now.replace(hour=target_h, minute=target_m, second=0, microsecond=0)
    if target <= now:
        target += timedelta(days=1)
    delta = (target - now).total_seconds()
    print(f"Aguardando até {hhmm} UTC (~{int(delta // 60)} min)...")
    time.sleep(delta)


def commit_calendar(calendar_path: Path, when: str) -> None:
    """Commita e dá push da atualização de UM calendário específico.
    Necessário porque, rodando em GitHub Actions, o working directory do
    runner é descartado ao fim do job -- sem isso, escrever no arquivo
    local atualiza só a cópia do runner, que nunca volta pro repositório
    de verdade. (host_media() em publish_instagram.py já faz o mesmo pra
    imagem/vídeo, mas isso não cobre o calendário -- são commits
    separados de propósito, cada um só com o arquivo que realmente
    mudou.)"""
    rel_path = calendar_path.resolve().relative_to(REPO_ROOT.resolve()).as_posix()
    branch = pub._run_git("rev-parse", "--abbrev-ref", "HEAD").stdout.strip() or "main"
    pub._run_git("add", rel_path)
    commit = pub._run_git("commit", "-m", f"chore: atualiza status do calendário ({when})")
    _NOOP_MARKERS = ("nothing to commit", "no changes added to commit")
    if commit.returncode != 0 and not any(m in commit.stdout for m in _NOOP_MARKERS):
        print(f"AVISO: falha ao commitar {rel_path}: {commit.stdout}\n{commit.stderr}")
        return
    push = pub._run_git("push", "origin", branch)
    if push.returncode != 0:
        print(f"AVISO: falha ao dar push de {rel_path}: {push.stderr}")
    else:
        print(f"{rel_path} commitado e enviado pro GitHub.")


def mark_published(row: dict, post_id: str, when: str) -> None:
    """Reescreve o Status da linha (só na cópia local) -- ver
    apply_and_commit() pra também persistir isso no repositório."""
    novo_status = f"Publicado (GitHub Actions, {when}, Post ID {post_id})"
    text = row["file"].read_text(encoding="utf-8")
    cells = row["line"].strip().strip("|").split("|")
    cells[-1] = f" {novo_status} "
    new_line = "|" + "|".join(cells) + "|"
    row["file"].write_text(text.replace(row["line"], new_line, 1), encoding="utf-8")


def publish_with_retry(images: list[str], caption: str, story: bool,
                        max_tries: int = 3, backoff_seconds=(60, 180)) -> str:
    """Tenta publicar até max_tries vezes, com espera crescente entre
    tentativas -- cobre falha transitória (rede, hiccup pontual da API da
    Meta) sem exigir ninguém observando em tempo real. Uma falha
    persistente (token inválido, mídia rejeitada) ainda propaga depois de
    esgotar as tentativas -- não deve ficar tentando pra sempre.

    Seguro contra duplicar post: só o container criado ANTES do
    media_publish (a etapa final) pode falhar e ser tentado de novo -- uma
    vez que pub.run() retorna post_id com sucesso, ele já saiu da função,
    não tem como isso re-executar por engano."""
    last_error = None
    for attempt in range(1, max_tries + 1):
        try:
            return pub.run(images, caption, dry_run=False, story=story)
        except Exception as e:
            last_error = e
            print(f"  Tentativa {attempt}/{max_tries} falhou: {e}")
            if attempt < max_tries:
                wait = backoff_seconds[min(attempt - 1, len(backoff_seconds) - 1)]
                print(f"  Aguardando {wait}s antes de tentar de novo (pode ser falha "
                      f"transitória da rede/API da Meta)...")
                time.sleep(wait)
    raise RuntimeError(
        f"Falhou {max_tries}x seguidas, mesmo com espera entre tentativas -- "
        f"provavelmente não é falha transitória. Último erro: {last_error}"
    ) from last_error


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="Data a simular, formato DD/MM/AAAA (default: hoje)")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--code",
                         help="Publica uma peça específica agora (ex. Feed/F04), ignorando a "
                              "checagem de data do calendário -- pedido pontual/urgente, fora "
                              "do fluxo normal.")
    parser.add_argument("--wait-until-utc",
                         help="HH:MM (24h, UTC, hoje) -- espera até esse horário antes de "
                              "publicar. Só faz sentido junto com --code. A espera roda dentro "
                              "do runner do GitHub Actions, não depende de nenhuma sessão local.")
    args = parser.parse_args()

    # Diagnóstico sempre impresso (mesmo sem nada agendado hoje) — confirma
    # nos logs que as credenciais (Secrets no GitHub Actions, .env local)
    # carregaram, sem revelar o valor.
    cred_ok = bool(pub.IG_ID) and bool(pub.PAGE_TOKEN)
    print(f"Credenciais carregadas: {'OK' if cred_ok else 'FALTANDO'} "
          f"(INSTAGRAM_BUSINESS_ID {'presente' if pub.IG_ID else 'AUSENTE'}, "
          f"INSTAGRAM_ACCESS_TOKEN {'presente' if pub.PAGE_TOKEN else 'AUSENTE'})")

    calendar_files = find_calendar_files()
    if not calendar_files:
        print("Nenhum arquivo Instagram/calendario-*.md encontrado. Nada a fazer "
              "(crie um calendário primeiro, ex. via subagente social-media).")
        return
    rows = []
    for p in calendar_files:
        rows.extend(parse_calendar(p))

    if args.code:
        # Modo pontual/urgente: publica uma peça específica, sem olhar a data.
        tipo = args.code.split("/", 1)[0]
        if tipo not in ("Feed", "Reels", "Carrossel", "Stories"):
            raise SystemExit(f"ERRO: tipo '{tipo}' não reconhecido em --code {args.code!r} "
                              f"(esperado Feed/Reels/Carrossel/Stories).")
        if args.wait_until_utc:
            wait_until_utc(args.wait_until_utc)
        print(f"\n=== Publicando {args.code} (pedido pontual/urgente) ===")
        is_story = tipo == "Stories"
        images, caption = media_and_caption(tipo, args.code)
        if args.dry_run:
            legenda_info = "sem legenda (Stories)" if is_story else f"legenda de {len(caption)} chars"
            print(f"[DRY RUN] publicaria {images} com {legenda_info}.")
            return
        post_id = publish_with_retry(images, caption, is_story)
        when = datetime.now().strftime("%d/%m/%Y %H:%M")
        row = find_by_codigo(rows, args.code)
        if row:
            mark_published(row, post_id, when)
            commit_calendar(row["file"], when)
        else:
            print(f"\nAviso: {args.code} não encontrado em nenhum calendário -- Status não "
                  f"atualizado automaticamente (confira/atualize manualmente se precisar).")
        return

    today = args.date or date.today().strftime("%d/%m/%Y")
    due = [r for r in rows if r["data"] == today and not r["status"].startswith("Publicado")]
    if not due:
        print(f"Nada agendado pra publicar hoje ({today}). Nenhuma ação.")
        return

    changed_files = set()
    for row in due:
        print(f"\n=== Publicando {row['codigo']} — {row['conteudo']} ===")
        is_story = row["tipo"] == "Stories"
        images, caption = media_and_caption(row["tipo"], row["codigo"])
        if args.dry_run:
            legenda_info = "sem legenda (Stories)" if is_story else f"legenda de {len(caption)} chars"
            print(f"[DRY RUN] publicaria {images} com {legenda_info}.")
            continue
        post_id = publish_with_retry(images, caption, is_story)
        when = datetime.now().strftime("%d/%m/%Y %H:%M")
        mark_published(row, post_id, when)
        changed_files.add(row["file"])

    if not args.dry_run:
        when = datetime.now().strftime("%d/%m/%Y %H:%M")
        for f in changed_files:
            commit_calendar(f, when)


if __name__ == "__main__":
    main()
