import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("? WhatsApp Pair Code Bot Server Running!");
});

app.get("/pair", async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    sock.ev.on("connection.update", (update) => {
      const { qr } = update;
      if (qr) {
        qrcode.toDataURL(qr, (err, url) => {
          if (err) return res.send("? QR Error");
          res.send(`
            <html>
              <body style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#0f172a;color:white;">
                <h2>?? Scan This QR in your WhatsApp</h2>
                <img src="${url}" style="border:5px solid white; border-radius:10px;"/>
              </body>
            </html>
          `);
        });
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (e) {
    res.send("? Something went wrong: " + e.message);
  }
});

app.listen(PORT, () => console.log(`? Server started on port ${PORT}`));