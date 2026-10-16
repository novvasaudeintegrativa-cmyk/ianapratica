// Vercel Function -- grava o lead da lp-whatsapp.html (nome, e-mail e
// WhatsApp) no Supabase do CRM (tabela "leads", tenant "IA na Prática",
// canal "site", origem "lp-whatsapp"). A página chama esta função antes de
// mandar a pessoa pro grupo do WhatsApp. Mesmo padrão do quiz-save.js: usa
// a service_role key só aqui no servidor, nunca no JS do navegador.
//
// Configurar na Vercel: SUPABASE_SERVICE_ROLE_KEY (já usada pelo quiz).

const SUPABASE_URL = "https://kufydscarokfppyobdjy.supabase.co";
const SUPABASE_TENANT_ID = "4dbf2fe9-db81-4528-b0c6-0c2b11e2c42e";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return res.status(500).json({ ok: false, error: "service_role_key_not_configured" });
  }

  const data = req.body || {};
  const whatsappDigits = String(data.whatsapp || "").replace(/\D/g, "");
  if (whatsappDigits.length < 10 || whatsappDigits.length > 15) {
    return res.status(400).json({ ok: false, error: "whatsapp_invalid" });
  }

  const utms = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
    .map(function (k) { return data[k] ? k + ": " + String(data[k]).slice(0, 100) : null; })
    .filter(Boolean)
    .join(" | ");

  const payload = {
    tenant_id: SUPABASE_TENANT_ID,
    canal: "site",
    id_canal: whatsappDigits,
    nome: String(data.nome || "").slice(0, 120) || null,
    email: String(data.email || "").slice(0, 160) || null,
    origem: "lp-whatsapp",
    ia_ativa: false,
    nota: "Live gratuita 17/10 | WhatsApp: " + whatsappDigits + (utms ? " | " + utms : ""),
  };

  try {
    const sbRes = await fetch(
      SUPABASE_URL + "/rest/v1/leads?on_conflict=tenant_id,canal,id_canal",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: "Bearer " + serviceKey,
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(payload),
      }
    );
    if (sbRes.ok) return res.status(200).json({ ok: true });
    return res.status(502).json({ ok: false, error: "supabase_error", status: sbRes.status });
  } catch (err) {
    return res.status(502).json({ ok: false, error: "network_error" });
  }
}
