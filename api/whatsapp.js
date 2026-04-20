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
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        error: { message: "Falta el campo: to" }
      });
    }

    // 📱 Formato Perú
    let phone = to.replace(/\D/g, "");
    if (phone.length === 9) phone = "51" + phone;

    console.log("📤 Enviando a:", phone);

    // 🔥 NUEVA PRUEBA (endpoint + formato tipo WhatsApp Cloud)
    const response = await fetch("https://api.zernio.com/v1/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ZERNIO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body: "Hola prueba real 🚀"
        }
      })
    });

    // 🔥 LEER RESPUESTA REAL
    const text = await response.text();
    console.log("🧾 ZERNIO RAW:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: {
          message: "Zernio devolvió HTML → endpoint incorrecto",
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
