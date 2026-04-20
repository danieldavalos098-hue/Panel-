const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: { message: "Metodo no permitido" }
    });
  }

  try {
    const { to, nombre, hora, fecha } = req.body;

    if (!to || !nombre || !hora || !fecha) {
      return res.status(400).json({
        error: { message: "Faltan campos" }
      });
    }

    // 📱 Formato Perú
    let phone = to.replace(/\D/g, "");
    if (phone.length === 9) phone = "51" + phone;

    console.log("📤 Enviando a:", phone);

    const response = await fetch("https://api.zernio.com/v1/messages/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ZERNIO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: phone,
        type: "template",
        template: {
          name: "entrada_academia",
          language: { code: "es" },
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

    const text = await response.text();
    console.log("🧾 ZERNIO RAW:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: {
          message: "Zernio devolvió HTML (endpoint incorrecto o API key mal)",
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

  } catch (error) {
    console.error("❌ ERROR:", error);
    return res.status(500).json({
      error: { message: error.message }
    });
  }
}
