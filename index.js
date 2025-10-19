import express from "express";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`
    <h2>✅ WhatsApp Pair Bot Server Running!</h2>
    <p>👉 Go to <a href="/pair">/pair</a> to generate your QR code.</p>
  `);
});

app.get("/pair", async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
    const sock = makeWASocket({
      printQRInTerminal: true,
      auth: state
    });

    sock.ev.on("connection.update", ({ qr }) => {
      if (qr) {
        qrcode.toDataURL(qr, (err, url) => {
          if (err) {
            return res.status(500).send("❌ Error generating QR");
          }
          res.send(`
            <h2>📱 Scan this QR in WhatsApp</h2>
            <img src="${url}" style="width:300px; height:300px;" />
            <p>Open WhatsApp → Linked Devices → Scan QR</p>
          `);
        });
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Server error: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
