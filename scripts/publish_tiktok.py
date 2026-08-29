"""
publish_tiktok.py — Publicação automática de vídeo no TikTok via Content
Posting API (Direct Post). Gerado manualmente (fora do squad da Imersão —
ver a nota de escopo no CLAUDE.md, TikTok não faz parte do que é ensinado).

Uso:
  python scripts/publish_tiktok.py --video TikTok/V05/video.mp4 --caption "..."
  python scripts/publish_tiktok.py --video TikTok/V05/video.mp4 --caption "..." --privacy PUBLIC_TO_EVERYONE
  python scripts/publish_tiktok.py --video TikTok/V05/video.mp4 --caption "..." --production

Sobre Sandbox vs Production:
  Por padrão usa as credenciais do Sandbox (TIKTOK_SANDBOX_*) — funciona só
  pros "Target Users" cadastrados no app do TikTok for Developers, mesmo
  com privacy_level PUBLIC_TO_EVERYONE (fica restrito ao ambiente de teste,
  não sai pro TikTok de verdade). Passe --production pra usar as credenciais
  reais (TIKTOK_*), que só publicam de verdade em modo SELF_ONLY (privado)
  até o app passar pela auditoria oficial do TikTok.

Sobre o upload do vídeo:
  Usa FILE_UPLOAD (push_by_file) — manda o arquivo direto do computador em
  chunks pro TikTok, sem precisar de nenhuma URL pública nem verificação de
  domínio (diferente do Instagram, que exige image_url pública).
"""
import argparse, os, sys, time, requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

BASE_URL = "https://open.tiktokapis.com/v2"
CHUNK_SIZE = 10 * 1024 * 1024  # 10MB — dentro do limite aceito pelo TikTok

THROTTLE_ERROR_CODES = {"rate_limit_exceeded", "too_many_requests"}


def _creds(production: bool):
    prefix = "TIKTOK_" if production else "TIKTOK_SANDBOX_"
    token = os.getenv(f"{prefix}ACCESS_TOKEN")
    if not token:
        raise RuntimeError(
            f"Faltando {prefix}ACCESS_TOKEN no .env. Rode o fluxo de "
            f"autorização (Etapa de OAuth) primeiro."
        )
    return token


def _request_with_backoff(method: str, url: str, max_tries: int = 3, **kwargs) -> dict:
    wait = 20
    for attempt in range(1, max_tries + 1):
        resp = requests.request(method, url, timeout=60, **kwargs)
        result = resp.json() if resp.content else {}
        error_code = (result.get("error") or {}).get("code", "")
        if error_code not in THROTTLE_ERROR_CODES:
            return result
        if attempt == max_tries:
            raise RuntimeError(f"Limite de chamadas do TikTok atingido {max_tries}x seguidas: {result}")
        print(f"  Limite de chamadas — aguardando {wait}s (tentativa {attempt}/{max_tries})...")
        time.sleep(wait)
        wait = min(wait * 2, 300)
    return {}


def init_post(token: str, video_size: int, caption: str, privacy: str) -> dict:
    chunk_size = min(CHUNK_SIZE, video_size)
    total_chunks = max(1, (video_size + chunk_size - 1) // chunk_size)
    # Se coube tudo num chunk só, o chunk_size final tem que bater exatamente
    # com o tamanho do vídeo (regra da API pra upload de chunk único).
    if total_chunks == 1:
        chunk_size = video_size

    body = {
        "post_info": {
            "title": caption,
            "privacy_level": privacy,
            "disable_duet": False,
            "disable_comment": False,
            "disable_stitch": False,
            "video_cover_timestamp_ms": 1000,
        },
        "source_info": {
            "source": "FILE_UPLOAD",
            "video_size": video_size,
            "chunk_size": chunk_size,
            "total_chunk_count": total_chunks,
        },
    }
    result = _request_with_backoff(
        "POST", f"{BASE_URL}/post/publish/video/init/",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=UTF-8"},
        json=body,
    )
    data = result.get("data") or {}
    if not data.get("publish_id"):
        raise RuntimeError(f"Erro ao iniciar publicação: {result}")
    print(f"  Publish ID: {data['publish_id']}")
    return {**data, "chunk_size": chunk_size, "total_chunks": total_chunks}


def upload_video(upload_url: str, video_path: Path, video_size: int, chunk_size: int, total_chunks: int):
    with open(video_path, "rb") as f:
        for i in range(total_chunks):
            start = i * chunk_size
            end = min(start + chunk_size, video_size) - 1
            f.seek(start)
            chunk = f.read(end - start + 1)
            resp = requests.put(
                upload_url,
                data=chunk,
                headers={
                    "Content-Type": "video/mp4",
                    "Content-Range": f"bytes {start}-{end}/{video_size}",
                },
                timeout=120,
            )
            if resp.status_code not in (200, 201, 206):
                raise RuntimeError(f"Falha no upload do chunk {i+1}/{total_chunks}: {resp.status_code} {resp.text}")
            print(f"  Upload: chunk {i+1}/{total_chunks} OK")


def wait_ready(token: str, publish_id: str) -> str:
    for i in range(24):
        result = _request_with_backoff(
            "POST", f"{BASE_URL}/post/publish/status/fetch/",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=UTF-8"},
            json={"publish_id": publish_id},
        )
        status = (result.get("data") or {}).get("status", "")
        if status == "PUBLISH_COMPLETE":
            return status
        if status == "FAILED":
            raise RuntimeError(f"Publicação falhou: {result}")
        print(f"  Processando... ({status or 'aguardando'}) {i*5}s")
        time.sleep(5)
    raise RuntimeError("Timeout esperando o TikTok processar o vídeo.")


def run(video_path: str, caption: str, privacy: str, production: bool):
    token = _creds(production)
    path = Path(video_path)
    if not path.exists():
        print(f"ERRO: vídeo não encontrado em {video_path}")
        sys.exit(1)
    video_size = path.stat().st_size

    modo = "PRODUCTION" if production else "SANDBOX"
    print(f"\nPublicando no TikTok [{modo}] — privacidade: {privacy}")
    print(f"Vídeo: {video_path} ({video_size / 1024 / 1024:.1f} MB)")

    print("\nPasso 1/3 - Iniciando publicação...")
    info = init_post(token, video_size, caption, privacy)

    print("\nPasso 2/3 - Enviando vídeo...")
    upload_video(info["upload_url"], path, video_size, info["chunk_size"], info["total_chunks"])

    print("\nPasso 3/3 - Aguardando processamento...")
    wait_ready(token, info["publish_id"])

    print(f"\nPublicado com sucesso!")
    print(f"Publish ID: {info['publish_id']}")
    if privacy == "SELF_ONLY":
        print("(privacy_level SELF_ONLY — só aparece pra você, dentro do próprio app do TikTok)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", required=True)
    parser.add_argument("--caption", required=True)
    parser.add_argument("--privacy", default="SELF_ONLY",
                         choices=["SELF_ONLY", "MUTUAL_FOLLOW_FRIENDS", "PUBLIC_TO_EVERYONE"])
    parser.add_argument("--production", action="store_true",
                         help="Usa credenciais de Production em vez de Sandbox")
    args = parser.parse_args()
    run(args.video, args.caption, args.privacy, args.production)
