const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // TEST
  if (req.method === "GET" && req.query.action === "test") {
    return res.status(200).json({
      status: "Zernio funcionando"
    });
  }

  // ENVIAR MENSAJE
  if (req.method === "POST") {
    try {
      const { to, nombre, hora, fecha } = req.body;

      if (!to || !nombre || !hora || !fecha) {
        return res.status(400).json({
          error: { message: "Faltan campos: to, nombre, hora, fecha" }
        });
      }

      // 📱 Formato Perú
      let phone = to.replace(/\D/g, "");
      if (phone.length === 9) phone = "51" + phone;

      console.log("📤 Enviando a:", phone);

      // 🔥 DEBUG IMPORTANTE (AQUÍ ESTÁ LA CLAVE)
      console.log("🔑 API KEY:", ZERNIO_API_KEY);

      if (!ZERNIO_API_KEY) {
        return res.status(500).json({
          error: { message: "API KEY no configurada en Vercel" }
        });
      }

      const response = await fetch("https://api.zernio.com/v1/whatsapp/messages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ZERNIO_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: "entrada_academia",
            language: {
              code: "es"
            },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: nombre },
                  { type: "text", text: hora },
                  { type: "text", text: fecha }
                ]
              }
            ]
          }
        })
      });

      // 🔥 RESPUESTA REAL
      const text = await response.text();
      console.log("🧾 ZERNIO RAW:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return res.status(500).json({
          error: {
            message: "Zernio no devolvió JSON",
            tip: "Probablemente API KEY inválida o acceso denegado",
            raw: text
          }
        });
      }

      console.log("✅ ZERNIO PARSED:", data);

      if (response.ok) {
        return res.status(200).json({
          success: true,
          data
        });
      } else {
        return res.status(400).json({
          success: false,
          error: data
        });
      }

    } catch (e) {
      console.error("❌ ERROR SERVER:", e);
      return res.status(500).json({
        error: { message: e.message }
      });
    }
  }

  return res.status(405).json({
    error: { message: "Metodo no permitido" }
  });
}
