"""
publish_instagram.py — Publicação automática no Instagram via Meta Graph API
Gerado pelo setup-instagram skill do Claude Code

Uso:
  python scripts/publish_instagram.py --images Instagram/Feed/F01/slides/slide-1.png --caption "..."
  python scripts/publish_instagram.py --images Instagram/Carrossel/C01/slides/*.png --caption "..."
  python scripts/publish_instagram.py --images Instagram/Reels/R01/reels.mp4 --caption "..."

Sobre limites de publicação:
  A Meta limita quantos posts uma conta pode publicar via API numa janela
  rolante de 24h (o número exato varia — checar
  https://developers.facebook.com/docs/instagram-platform/content-publishing
  antes de assumir um valor fixo). Por isso este script nunca dispara
  chamadas em rajada: espera o processamento real de cada container
  (wait_ready) e, se a API responder com erro de limite/throttling, espera
  com backoff exponencial em vez de tentar de novo na mesma hora. Publicar
  dezenas de posts de teste na mesma hora é o jeito mais rápido de bater
  nesse limite ou ser sinalizado como comportamento automatizado abusivo.

Sobre hospedagem da imagem:
  O Meta exige uma URL pública pra buscar a imagem (não aceita upload
  binário direto no container). Este script hospeda via GitHub — dá
  commit + push na imagem e monta a URL raw.githubusercontent.com
  correspondente. **Isso exige que o repositório do GitHub esteja
  PÚBLICO** — se estiver privado, a URL não responde pro Meta e a
  publicação falha (com uma mensagem de erro clara nesse caso, não
  silenciosa). Trocado de um host anônimo (catbox.moe) depois de ele ser
  bloqueado de forma inconsistente por antivírus de terceiros (Avast, no
  caso original) — GitHub é mais estável e menos propenso a esse tipo de
  bloqueio.
"""
import argparse, os, subprocess, sys, time, requests
from pathlib import Path
from dotenv import load_dotenv

# .env sempre na raiz do projeto (um nível acima de scripts/)
load_dotenv(Path(__file__).parent.parent / ".env")

IG_ID      = os.getenv("INSTAGRAM_BUSINESS_ID")
PAGE_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN")
BASE_URL   = f"https://graph.facebook.com/{os.getenv('META_API_VERSION', 'v19.0')}"

# Códigos de erro da Graph API que indicam throttling/limite de chamadas
# (não confundir com erro de token inválido, imagem inválida, etc. — esses
# nunca devem ser tentados de novo automaticamente).
THROTTLE_ERROR_CODES = {4, 17, 32, 80004}


def _is_throttle_error(result: dict) -> bool:
    error = result.get("error", {}) if isinstance(result, dict) else {}
    if error.get("code") in THROTTLE_ERROR_CODES:
        return True
    message = (error.get("message") or "").lower()
    return "limit" in message or "reduzid" in message or "reduce the rate" in message


def _request_with_backoff(method: str, url: str, max_tries: int = 3, **kwargs) -> dict:
    """Chama a API com espera exponencial só quando o erro for de throttling.
    Qualquer outro erro (token inválido, imagem ruim, etc.) falha na hora —
    tentar de novo não resolve esse tipo de problema."""
    wait = 30
    for attempt in range(1, max_tries + 1):
        resp = requests.request(method, url, timeout=60, **kwargs)
        result = resp.json()
        if not _is_throttle_error(result):
            return result
        if attempt == max_tries:
            raise RuntimeError(
                f"Limite de chamadas da Meta atingido {max_tries}x seguidas. "
                f"Pare e tente de novo mais tarde (não insista na mesma hora): {result}"
            )
        print(f"  Limite de chamadas da Meta — aguardando {wait}s antes de tentar de novo "
              f"(tentativa {attempt}/{max_tries})...")
        time.sleep(wait)
        wait = min(wait * 2, 300)
    return {}


def _run_git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git", *args], cwd=Path(__file__).parent.parent,
        capture_output=True, text=True,
    )


def host_media(image_path: str) -> str:
    """Hospeda a imagem via GitHub (raw.githubusercontent.com) — commita e
    dá push do arquivo no repositório do projeto, depois monta a URL pública
    correspondente. Exige que o repositório do GitHub esteja PÚBLICO (o
    Meta busca a URL sem autenticação nenhuma; se o repo for privado, essa
    URL devolve 404 pro Meta e a publicação falha nessa etapa — deixar
    público de propósito é pré-requisito, não acidente)."""
    repo_root = Path(__file__).parent.parent
    rel_path = Path(image_path).resolve().relative_to(repo_root.resolve()).as_posix()

    remote = _run_git("remote", "get-url", "origin").stdout.strip()
    if not remote:
        raise RuntimeError(
            "Sem remote 'origin' configurado neste repositório Git — não dá "
            "pra hospedar a imagem via GitHub sem um repositório remoto."
        )
    # aceita tanto https://github.com/dono/repo.git quanto git@github.com:dono/repo.git
    owner_repo = remote.split("github.com")[-1].lstrip(":/").removesuffix(".git")

    branch = _run_git("rev-parse", "--abbrev-ref", "HEAD").stdout.strip() or "main"

    _run_git("add", rel_path)
    commit = _run_git("commit", "-m", f"chore: publica imagem {rel_path} no Instagram")
    # Nenhuma mudança pra commitar não é erro — a imagem já pode estar
    # commitada (sem alteração) de uma tentativa anterior. O git varia a
    # mensagem conforme haver ou não OUTRAS mudanças soltas no repo: quando
    # o repo está todo limpo, diz "nothing to commit"; quando há outras
    # mudanças não-staged em outros arquivos (comuns aqui, fora do escopo
    # desta publicação), diz "no changes added to commit" — as duas contam
    # como no-op, só uma falha de commit de verdade (ex. hook, permissão)
    # é que deve interromper a publicação.
    _NOOP_COMMIT_MARKERS = ("nothing to commit", "no changes added to commit")
    if commit.returncode != 0 and not any(marker in commit.stdout for marker in _NOOP_COMMIT_MARKERS):
        raise RuntimeError(f"Falha ao commitar a imagem: {commit.stdout}\n{commit.stderr}")

    push = _run_git("push", "origin", branch)
    if push.returncode != 0:
        raise RuntimeError(f"Falha ao dar push da imagem pro GitHub: {push.stderr}")

    url = f"https://raw.githubusercontent.com/{owner_repo}/{branch}/{rel_path}"

    # confirmar de verdade que a URL ficou pública antes de devolver pro Meta
    check = requests.get(url, timeout=30)
    if check.status_code != 200:
        raise RuntimeError(
            f"A imagem foi commitada e enviada, mas a URL pública não respondeu "
            f"(status {check.status_code}) — confirme se o repositório do GitHub "
            f"está com visibilidade PÚBLICA em Settings > Danger Zone."
        )
    print(f"  Hospedada: {url}")
    return url


def create_media_container(image_path: str, as_carousel_item: bool) -> str:
    data = {
        "access_token": PAGE_TOKEN,
        "image_url": host_media(image_path),
    }
    if as_carousel_item:
        data["is_carousel_item"] = "true"
    result = _request_with_backoff("POST", f"{BASE_URL}/{IG_ID}/media", data=data)
    if "id" not in result:
        raise RuntimeError(f"Erro container: {result}")
    print(f"  Container: {result['id']}")
    return result["id"]


def create_reels_container(video_path: str, caption: str) -> str:
    """Reels usa media_type=REELS + video_url (em vez de image_url).
    Processamento de vídeo é mais lento que imagem — wait_ready precisa de
    mais tempo/tentativas do que o padrão usado pra Feed/Carrossel."""
    result = _request_with_backoff("POST", f"{BASE_URL}/{IG_ID}/media", data={
        "access_token": PAGE_TOKEN,
        "media_type": "REELS",
        "video_url": host_media(video_path),
        "caption": caption,
        "share_to_feed": "true",
    })
    if "id" not in result:
        raise RuntimeError(f"Erro container Reels: {result}")
    print(f"  Container Reels: {result['id']}")
    return result["id"]


def create_carousel(media_ids: list, caption: str) -> str:
    result = _request_with_backoff("POST", f"{BASE_URL}/{IG_ID}/media", data={
        "access_token": PAGE_TOKEN,
        "media_type": "CAROUSEL",
        "children": ",".join(media_ids),
        "caption": caption,
    })
    if "id" not in result:
        raise RuntimeError(f"Erro carrossel: {result}")
    print(f"  Carrossel: {result['id']}")
    return result["id"]


def wait_ready(container_id: str, max_tries: int = 12, interval: int = 5) -> bool:
    for i in range(max_tries):
        resp = requests.get(f"{BASE_URL}/{container_id}",
            params={"fields": "status_code", "access_token": PAGE_TOKEN}, timeout=15)
        status = resp.json().get("status_code", "")
        if status == "FINISHED":
            return True
        if status == "ERROR":
            raise RuntimeError(f"Container com erro: {resp.json()}")
        print(f"  Processando... {i*interval}s")
        time.sleep(interval)
    return False


def publish(container_id: str) -> str:
    result = _request_with_backoff("POST", f"{BASE_URL}/{IG_ID}/media_publish", data={
        "access_token": PAGE_TOKEN,
        "creation_id": container_id,
    })
    if "id" not in result:
        raise RuntimeError(f"Erro publicar: {result}")
    return result["id"]


def run(images: list, caption: str, dry_run: bool = False):
    if not IG_ID or not PAGE_TOKEN:
        print("ERRO: Credenciais nao encontradas. Rode /setup-instagram primeiro.")
        sys.exit(1)
    if len(images) > 10:
        print("ERRO: Maximo 10 imagens.")
        sys.exit(1)

    is_video = len(images) == 1 and images[0].lower().endswith((".mp4", ".mov"))
    is_feed = len(images) == 1 and not is_video
    kind = "Reels" if is_video else ("post único (Feed)" if is_feed else f"{len(images)} slides")
    print(f"\nPublicando {kind} no Instagram...")
    if dry_run:
        print("[DRY RUN] Tudo OK. Remova --dry-run para publicar.")
        return

    if is_video:
        # Reels: processamento de vídeo é mais lento que imagem — até 6min
        # de espera (36 tentativas x 10s) em vez do padrão de imagem.
        print("\nPasso 1/2 - Criando o Reels...")
        container_id = create_reels_container(images[0], caption)
        print("\nPasso 2/2 - Publicando (processamento de vídeo pode levar alguns minutos)...")
        if not wait_ready(container_id, max_tries=36, interval=10):
            print("ERRO: Timeout no processamento do vídeo.")
            sys.exit(1)
        post_id = publish(container_id)
    elif is_feed:
        # Post único: um container só, já com a legenda, sem passar por carrossel
        print("\nPasso 1/2 - Criando o post...")
        result = _request_with_backoff("POST", f"{BASE_URL}/{IG_ID}/media", data={
            "access_token": PAGE_TOKEN,
            "image_url": host_media(images[0]),
            "caption": caption,
        })
        if "id" not in result:
            raise RuntimeError(f"Erro container: {result}")
        container_id = result["id"]
        print("\nPasso 2/2 - Publicando...")
        if not wait_ready(container_id):
            print("ERRO: Timeout no processamento.")
            sys.exit(1)
        post_id = publish(container_id)
    else:
        # Carrossel: um container por imagem, depois agrupa
        print("\nPasso 1/3 - Criando containers...")
        ids = [create_media_container(img, as_carousel_item=True) for img in images]

        print("\nPasso 2/3 - Montando carrossel...")
        carousel_id = create_carousel(ids, caption)

        print("\nPasso 3/3 - Publicando...")
        if not wait_ready(carousel_id):
            print("ERRO: Timeout no processamento.")
            sys.exit(1)
        post_id = publish(carousel_id)

    print(f"\nPublicado com sucesso!")
    print(f"Post ID: {post_id}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--images", nargs="+", required=True)
    parser.add_argument("--caption")
    parser.add_argument("--caption-file",
                         help="Le a legenda de um arquivo .txt (UTF-8) em vez de passar direto na "
                              "linha de comando -- mais seguro pra emoji/acento/aspas em tarefas "
                              "agendadas (Task Scheduler), onde escapar tudo na CLI e' fragil.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.caption_file:
        caption_text = Path(args.caption_file).read_text(encoding="utf-8").strip()
    elif args.caption:
        caption_text = args.caption
    else:
        print("ERRO: passe --caption ou --caption-file.")
        sys.exit(1)

    run(args.images, caption_text, args.dry_run)
