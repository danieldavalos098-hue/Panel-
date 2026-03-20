// ============================================================
// Vercel Serverless Function — Proxy UltraMsg WhatsApp
// Ruta: /api/whatsapp
// ============================================================

const ULTRA_INSTANCE = process.env.ULTRA_INSTANCE || "instance166408";
const ULTRA_TOKEN    = process.env.ULTRA_TOKEN    || "6ml3yb542porbaon";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET /api/whatsapp?action=test
  if (req.method === "GET" && req.query.action === "test") {
    try {
      const url = `https://api.ultramsg.com/${ULTRA_INSTANCE}/instance/status?token=${ULTRA_TOKEN}`;
      const r = await fetch(url);
      const data = await r.json();
      if (data.status && data.status.accountStatus) {
        const status = data.status.accountStatus.substatus;
        if (status === "authenticated") {
          return res.status(200).json({
            display_phone_number: data.status.accountStatus.number || "Conectado",
            verified_name: "UltraMsg — San Marcos Asistencia"
          });
        } else {
          return res.status(200).json({ error: { message: "Estado: " + status } });
        }
      }
      return res.status(200).json({ error: { message: "No conectado" } });
    } catch (e) {
      return res.status(500).json({ error: { message: e.message } });
    }
  }

  // POST /api/whatsapp
  if (req.method === "POST") {
    try {
      const { to, message } = req.body;
      if (!to || !message) {
        return res.status(400).json({ error: { message: "Faltan campos: to, message" } });
      }

      // Formato internacional peruano
      let phone = to.replace(/\D/g, "");
      if (phone.length === 9) phone = "51" + phone;
      phone = "+" + phone;

      const params = new URLSearchParams();
      params.append("token",    ULTRA_TOKEN);
      params.append("to",       phone);
      params.append("body",     message);
      params.append("priority", "10");

      const url = `https://api.ultramsg.com/${ULTRA_INSTANCE}/messages/chat`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      });

      const data = await r.json();

      if (data.sent === "true" || data.sent === true || data.id) {
        return res.status(200).json({ messages: [{ id: data.id || "ok" }] });
      } else {
        return res.status(200).json({ error: { message: data.error || data.message || "Error UltraMsg" } });
      }
    } catch (e) {
      return res.status(500).json({ error: { message: e.message } });
    }
  }

  return res.status(405).json({ error: { message: "Metodo no permitido" } });
}
