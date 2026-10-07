// Vercel Function (Node.js) — envia o diagnóstico do quiz por e-mail de
// verdade via Resend. A API key fica só aqui (variável de ambiente do
// projeto na Vercel, nunca no código nem no .env local que não chega
// no servidor) -- é por isso que esse envio não pode acontecer direto
// no JS do navegador.
//
// Configurar na Vercel: Project Settings > Environment Variables
//   RESEND_API_KEY   = chave gerada em resend.com (Dashboard > API Keys)
//   RESEND_FROM      = remetente verificado, ex. "IA na Prática <naoresponda@imersaoianapratica.com.br>"
//                       (opcional -- sem isso, usa o remetente de teste
//                       onboarding@resend.dev, que só entrega pro e-mail
//                       dono da conta Resend, não pra qualquer pessoa)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Falha honesta -- nunca finge sucesso quando a chave não está configurada.
    return res.status(500).json({ ok: false, error: "resend_not_configured" });
  }

  const { to, subject, text } = req.body || {};

  if (!to || typeof to !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ ok: false, error: "invalid_recipient" });
  }
  if (!subject || !text) {
    return res.status(400).json({ ok: false, error: "missing_content" });
  }

  const from = process.env.RESEND_FROM || "IA na Prática <onboarding@resend.dev>";

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from,
        to: [to],
        subject: subject,
        text: text,
      }),
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      return res.status(502).json({ ok: false, error: "resend_error", detail: data });
    }

    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "unexpected_error" });
  }
}
