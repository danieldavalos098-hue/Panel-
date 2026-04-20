export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { to, mensaje } = req.body;

    if (!to || !mensaje) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const token = process.env.WHATSAPP_TOKEN;

    const phoneNumberId = "1063289196858980"; // 👈 tu ID de Meta (de la captura)

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: {
            body: mensaje,
          },
        }),
      }
    );

    const data = await response.json();

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error enviando mensaje",
      detalle: error.message,
    });
  }
}
