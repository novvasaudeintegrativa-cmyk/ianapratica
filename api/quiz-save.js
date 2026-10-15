// Vercel Function -- grava/atualiza progressivamente o lead do quiz no
// Supabase (tabela "leads", tenant "IA na Prática", canal "site").
// Chamada a cada passo do quiz a partir do momento em que já existe
// whatsapp (ele é a chave de identificação do lead -- id_canal) -- assim
// quem abandona o quiz no meio (depois de responder nome e telefone) já
// deixa um lead parcial salvo, e cada passo seguinte (email, objetivo,
// desafio...) atualiza a mesma linha em vez de criar uma nova.
//
// Usa a chave service_role do Supabase (bypassa RLS) porque isso é um
// upsert (insert OU update na mesma linha) -- update exige uma política
// de RLS pro papel "anon" que não existe de propósito: dar UPDATE direto
// pro navegador deixaria qualquer visitante sobrescrever o lead de outra
// pessoa, já que não tem como amarrar uma sessão anônima a "essa é a
// mesma pessoa que criou esse registro". Rodando aqui, no servidor, com a
// service_role key (que NUNCA pode ir pro JS do navegador), o upsert é
// seguro porque é esta função -- não o visitante -- quem decide o que
// pode ser escrito.

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
  if (!whatsappDigits) {
    return res.status(400).json({ ok: false, error: "whatsapp_required" });
  }

  const nota = [
    "Empresa: " + (data.empresa || "-"),
    "Objetivo: " + (data.objetivo === "Outro" ? data.objetivo_outro : data.objetivo || "-"),
    "Desafio: " + (data.desafio === "Outro" ? data.desafio_outro : data.desafio || "-"),
    "Tamanho: " + (data.tamanho || "-"),
    "Investimento: " + (data.investimento || "-"),
    "Prazo: " + (data.prazo || "-"),
    "WhatsApp: " + (data.whatsapp || "-"),
  ].join(" | ");

  const payload = {
    tenant_id: SUPABASE_TENANT_ID,
    canal: "site",
    id_canal: whatsappDigits,
    nome: data.nome || null,
    email: data.email || null,
    profissao: data.cargo || null,
    origem: "quiz-ia-na-pratica",
    ia_ativa: false,
    nota: nota,
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

    if (sbRes.ok) {
      return res.status(200).json({ ok: true });
    }

    const detail = await sbRes.text();
    return res.status(502).json({ ok: false, error: "supabase_error", status: sbRes.status, detail });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "unexpected_error", message: err.message });
  }
}
