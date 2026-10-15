// Vercel Cron Job -- dispara o workflow do GitHub Actions
// (publish-instagram.yml) no horário exato, em vez de depender só do
// gatilho `schedule` nativo do GitHub, que mostrou atrasar de 4h a 7h
// mesmo com um cron de alta frequência (ver Instagram/calendario-set-2026.md,
// ajuste de 14/10 e 15/10 -- o schedule do GitHub só rodou 2x em ~9h de
// janela configurada com tentativas a cada 10 min, sugerindo throttling
// da plataforma que não depende da frequência configurada).
//
// O `schedule` do GitHub continua ativo como rede de segurança (se esse
// cron da Vercel falhar por algum motivo, o do GitHub ainda tenta,
// só que mais devagar) -- os dois são seguros de rodar juntos porque
// publish_scheduled.py já é idempotente (só publica o que ainda não foi
// publicado hoje).
//
// Configurar na Vercel: Project Settings > Environment Variables
//   GITHUB_TOKEN  = Personal Access Token (fine-grained) com permissão
//                   "Actions: Read and write" no repositório, além da
//                   permissão que já tinha pra ler logs/editar arquivos.
//   CRON_SECRET   = qualquer valor secreto -- a Vercel manda ele sozinha
//                   como "Authorization: Bearer <valor>" quando o PRÓPRIO
//                   cron da Vercel chama essa função (não precisa colar
//                   em lugar nenhum além da variável de ambiente); isso
//                   impede que qualquer pessoa na internet chame essa URL
//                   e force um disparo do workflow fora de hora.

const OWNER_REPO = "novvasaudeintegrativa-cmyk/ianapratica";
const WORKFLOW_FILE = "publish-instagram.yml";

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization || "";
    if (auth !== "Bearer " + cronSecret) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return res.status(500).json({ ok: false, error: "github_token_not_configured" });
  }

  try {
    const ghRes = await fetch(
      `https://api.github.com/repos/${OWNER_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + githubToken,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: "main" }),
      }
    );

    if (ghRes.status === 204) {
      return res.status(200).json({ ok: true, message: "workflow_dispatch enviado" });
    }

    const detail = await ghRes.text();
    return res.status(502).json({ ok: false, error: "github_error", status: ghRes.status, detail });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "unexpected_error", message: err.message });
  }
}
