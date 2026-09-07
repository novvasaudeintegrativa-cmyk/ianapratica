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

Exige as mesmas variáveis de ambiente que publish_instagram.py
(INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ID) — no GitHub Actions elas
vêm de Secrets do repositório, não de um .env.
"""
import argparse, re, sys
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import publish_instagram as pub

REPO_ROOT = Path(__file__).parent.parent
CALENDAR_PATH = REPO_ROOT / "Instagram" / "calendario-set-2026.md"

# Linha de tabela markdown: | Dia, DD/MM/AAAA | Tipo | Conteúdo | Código | Status |
ROW_RE = re.compile(
    r"^\|\s*[^|]*?(\d{2}/\d{2}/\d{4})\s*\|\s*(Feed|Reels)\s*\|\s*(.*?)\s*\|\s*([\w/]+)\s*\|\s*(.*?)\s*\|\s*$"
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
    # codigo já vem como "Feed/F02" ou "Reels/R02" (inclui o tipo) — não duplicar.
    base = REPO_ROOT / "Instagram" / codigo
    if tipo == "Feed":
        slides = sorted((base / "slides").glob("slide-*.*"))
        if not slides:
            raise RuntimeError(f"Nenhuma imagem encontrada em {base / 'slides'}")
        images = [str(slides[0])]
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
    args = parser.parse_args()

    today = args.date or date.today().strftime("%d/%m/%Y")
    text = CALENDAR_PATH.read_text(encoding="utf-8")
    rows = parse_calendar(text)

    due = [r for r in rows if r["data"] == today and not r["status"].startswith("Publicado")]
    if not due:
        print(f"Nada agendado pra publicar hoje ({today}). Nenhuma ação.")
        return

    for row in due:
        print(f"\n=== Publicando {row['codigo']} — {row['conteudo']} ===")
        images, caption = media_and_caption(row["tipo"], row["codigo"])
        if args.dry_run:
            print(f"[DRY RUN] publicaria {images} com legenda de {len(caption)} chars.")
            continue
        post_id = pub.run(images, caption, dry_run=False)
        when = datetime.now().strftime("%d/%m/%Y %H:%M")
        text = update_calendar_status(text, row, post_id, when)

    if not args.dry_run:
        CALENDAR_PATH.write_text(text, encoding="utf-8")
        print("\nCalendário atualizado com o(s) status novo(s).")


if __name__ == "__main__":
    main()
