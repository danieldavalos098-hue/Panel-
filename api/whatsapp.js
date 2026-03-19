// ============================================================
// Vercel Serverless Function — Proxy WhatsApp Business API
// Ruta: /api/whatsapp
// ============================================================

const WA_TOKEN   = process.env.WA_TOKEN   || "EAAJlZBajwjp4BQym6U3kbRu8l5ZCgPp16NSf28IlErmF6S133zC4AGnSRZAcpoDix46ZBMFtq3BUKpFprpeb5lz6j0PxAiNQHSKVvjIf8bhKH054KU9RxOgX0Eju2DtDAwNbgDu4PysAnnZBbDNgVjSaTxysT6KEn3YICBCXnMrQVZCBcZAfedsa6s3Rum6OaDadAZDZD";
const WA_PHONE_ID = process.env.WA_PHONE_ID || "1092212570634676";
const WA_API_VER  = "v20.0";

export default async function handler(req, res) {
  // CORS — permite llamadas desde cualquier origen (tu frontend)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ── GET /api/whatsapp?action=test ──────────────────────────
  if (req.method === "GET") {
    const action = req.query.action;
    if (action === "test") {
      try {
        const phoneId = req.query.phoneId || WA_PHONE_ID;
        const token   = req.query.token   || WA_TOKEN;
        const url = `https://graph.facebook.com/${WA_API_VER}/${phoneId}?fields=display_phone_number,verified_name,quality_rating&access_token=${token}`;
        const r    = await fetch(url);
        const data = await r.json();
        return res.status(200).json(data);
      } catch (e) {
        return res.status(500).json({ error: { message: e.message } });
      }
    }
    return res.status(400).json({ error: { message: "Acción no válida" } });
  }

  // ── POST /api/whatsapp ─────────────────────────────────────
  if (req.method === "POST") {
    try {
      const { to, message, phoneId, token } = req.body;

      if (!to || !message) {
        return res.status(400).json({ error: { message: "Faltan campos: to, message" } });
      }

      const usedPhoneId = phoneId || WA_PHONE_ID;
      const usedToken   = token   || WA_TOKEN;

      const url = `https://graph.facebook.com/${WA_API_VER}/${usedPhoneId}/messages`;

      const r = await fetch(url, {
        method:  "POST",
        headers: {
          "Authorization": `Bearer ${usedToken}`,
          "Content-Type":  "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to:      to,
          type:    "text",
          text:    { body: message },
        }),
      });

      const data = await r.json();
      return res.status(r.status).json(data);

    } catch (e) {
      return res.status(500).json({ error: { message: e.message } });
    }
  }

  return res.status(405).json({ error: { message: "Método no permitido" } });
}
