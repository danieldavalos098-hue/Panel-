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

      // Formato Perú
      let phone = to.replace(/\D/g, "");
      if (phone.length === 9) phone = "51" + phone;

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
            name: "entrada_academia", // 👈 plantilla
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

      const data = await response.json();

      console.log("ZERNIO:", data);

      if (response.ok) {
        return res.status(200).json({
          messages: [{ id: data.id || "ok" }]
        });
      } else {
        return res.status(200).json({
          error: { message: data.message || "Error Zernio" }
        });
      }

    } catch (e) {
      return res.status(500).json({
        error: { message: e.message }
      });
    }
  }

  return res.status(405).json({
    error: { message: "Metodo no permitido" }
  });
}
