// Vercel Function (Node.js) — lista os leads do quiz (tabela "leads" do
// Supabase do CRM, tenant "IA na Prática", canal "site") pra conferência
// manual de quem está se cadastrando. Usa a chave service_role do
// Supabase (bypassa RLS de propósito, só pra isso) -- por isso fica só
// aqui, nunca no JS do navegador, e exige um token simples na URL pra não
// ficar aberto pra qualquer um.
//
// Configurar na Vercel: Project Settings > Environment Variables
//   SUPABASE_SERVICE_ROLE_KEY = chave service_role do projeto "New CRM"
//   QUIZ_LEADS_TOKEN          = uma senha qualquer, só sua, pra acessar essa página

const SUPABASE_URL = "https://kufydscarokfppyobdjy.supabase.co";
const TENANT_ID = "4dbf2fe9-db81-4528-b0c6-0c2b11e2c42e";

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function handler(req, res) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const expectedToken = process.env.QUIZ_LEADS_TOKEN;

  if (!expectedToken) {
    return res.status(500).send("QUIZ_LEADS_TOKEN não configurado no servidor.");
  }
  if (!serviceKey) {
    return res.status(500).send("SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.");
  }
  if (req.query.token !== expectedToken) {
    return res.status(403).send("Acesso negado — token ausente ou incorreto (?token=...).");
  }

  let leads = [];
  let fetchError = null;
  try {
    const url =
      SUPABASE_URL +
      "/rest/v1/leads?tenant_id=eq." +
      TENANT_ID +
      "&canal=eq.site&select=nome,email,profissao,nota,criado_em&order=criado_em.desc&limit=200";
    const supaRes = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: "Bearer " + serviceKey,
      },
    });
    if (!supaRes.ok) {
      fetchError = "Supabase respondeu " + supaRes.status + ": " + (await supaRes.text());
    } else {
      leads = await supaRes.json();
    }
  } catch (err) {
    fetchError = "Erro de rede: " + err.message;
  }

  const rows = leads
    .map(function (lead) {
      var criadoEm = lead.criado_em
        ? new Date(lead.criado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
        : "-";
      return (
        "<tr>" +
        "<td>" + escapeHtml(criadoEm) + "</td>" +
        "<td>" + escapeHtml(lead.nome) + "</td>" +
        "<td>" + escapeHtml(lead.email) + "</td>" +
        "<td>" + escapeHtml(lead.profissao) + "</td>" +
        "<td class=\"nota\">" + escapeHtml(lead.nota) + "</td>" +
        "</tr>"
      );
    })
    .join("\n");

  const html =
    "<!DOCTYPE html><html lang=\"pt-BR\"><head><meta charset=\"UTF-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>Leads do Quiz — IA na Prática</title>" +
    "<style>" +
    "body{font-family:system-ui,sans-serif;background:#141413;color:#faf9f5;margin:0;padding:24px;}" +
    "h1{font-size:1.25rem;margin:0 0 4px;}" +
    "p.sub{color:rgba(250,249,245,.6);margin:0 0 20px;font-size:.875rem;}" +
    "table{width:100%;border-collapse:collapse;font-size:.8125rem;}" +
    "th,td{text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.1);vertical-align:top;}" +
    "th{color:rgba(250,249,245,.5);font-weight:600;text-transform:uppercase;font-size:.6875rem;letter-spacing:.03em;}" +
    "td.nota{white-space:pre-wrap;color:rgba(250,249,245,.75);}" +
    "tr:hover{background:rgba(255,255,255,.03);}" +
    ".erro{background:rgba(180,50,50,.15);border:1px solid rgba(180,50,50,.4);padding:12px 16px;border-radius:8px;margin-bottom:16px;}" +
    ".vazio{color:rgba(250,249,245,.5);padding:24px 0;}" +
    "</style></head><body>" +
    "<h1>Leads do Quiz — IA na Prática</h1>" +
    "<p class=\"sub\">" + leads.length + " lead(s), mais recente primeiro. Atualiza recarregando a página.</p>" +
    (fetchError ? "<div class=\"erro\">" + escapeHtml(fetchError) + "</div>" : "") +
    (leads.length === 0 && !fetchError
      ? "<p class=\"vazio\">Nenhum lead ainda.</p>"
      : leads.length
      ? "<table><thead><tr><th>Quando</th><th>Nome</th><th>E-mail</th><th>Cargo</th><th>Detalhes</th></tr></thead><tbody>" +
        rows +
        "</tbody></table>"
      : "") +
    "</body></html>";

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(html);
}
