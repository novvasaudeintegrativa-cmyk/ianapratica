"""
publish_scheduled.py — Publica automaticamente a(s) peça(s) agendada(s)
pra hoje, lendo Instagram/calendario-set-2026.md.

Feito pra rodar via GitHub Actions (cron) em vez de depender do computador
local estar ligado (Windows Task Scheduler) — a nuvem roda o horário
independente do PC pessoal ligado, dormindo ou desligado.

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
CALENDAR_PATH = REPO_ROOT / "Instagram" / "calendario-set-2026.md"

# Linha de tabela markdown: | Dia, DD/MM/AAAA | Tipo | Conteúdo | Código | Status |
ROW_RE = re.compile(
    r"^\|\s*[^|]*?(\d{2}/\d{2}/\d{4})\s*\|\s*(Feed|Reels|Carrossel|Stories)\s*\|\s*(.*?)\s*\|\s*([\w/]+)\s*\|\s*(.*?)\s*\|\s*$"
)


def parse_calendar(text: str) -> list[dict]:
    rows = []
    for line in text.splitlines():
        m = ROW_RE.match(line.strip())
        if m:
            data, tipo, conteudo, codigo, status = m.groups()
            rows.append({
                "line": line, "data": data, "tipo": tipo,
                "conteudo": conteudo, "codigo": codigo, "status": status,
            })
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


def update_calendar_status(text: str, row: dict, post_id: str, when: str) -> str:
    """Troca só a última célula (Status) da linha, preservando o resto."""
    novo_status = f"Publicado (GitHub Actions, {when}, Post ID {post_id})"
    cells = row["line"].strip().strip("|").split("|")
    cells[-1] = f" {novo_status} "
    new_line = "|" + "|".join(cells) + "|"
    return text.replace(row["line"], new_line, 1)


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

    text = CALENDAR_PATH.read_text(encoding="utf-8")
    rows = parse_calendar(text)

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
        post_id = pub.run(images, caption, dry_run=False, story=is_story)
        when = datetime.now().strftime("%d/%m/%Y %H:%M")
        row = find_by_codigo(rows, args.code)
        if row:
            text = update_calendar_status(text, row, post_id, when)
            CALENDAR_PATH.write_text(text, encoding="utf-8")
            print("\nCalendário atualizado.")
        else:
            print(f"\nAviso: {args.code} não encontrado no calendário -- Status não "
                  f"atualizado automaticamente (confira/atualize manualmente se precisar).")
        return

    today = args.date or date.today().strftime("%d/%m/%Y")
    due = [r for r in rows if r["data"] == today and not r["status"].startswith("Publicado")]
    if not due:
        print(f"Nada agendado pra publicar hoje ({today}). Nenhuma ação.")
        return

    for row in due:
        print(f"\n=== Publicando {row['codigo']} — {row['conteudo']} ===")
        is_story = row["tipo"] == "Stories"
        images, caption = media_and_caption(row["tipo"], row["codigo"])
        if args.dry_run:
            legenda_info = "sem legenda (Stories)" if is_story else f"legenda de {len(caption)} chars"
            print(f"[DRY RUN] publicaria {images} com {legenda_info}.")
            continue
        post_id = pub.run(images, caption, dry_run=False, story=is_story)
        when = datetime.now().strftime("%d/%m/%Y %H:%M")
        text = update_calendar_status(text, row, post_id, when)

    if not args.dry_run:
        CALENDAR_PATH.write_text(text, encoding="utf-8")
        print("\nCalendário atualizado com o(s) status novo(s).")


if __name__ == "__main__":
    main()
