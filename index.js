import express from "express";
import cors from "cors";
import { RtcTokenBuilder, RtcRole } from "agora-token";

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERT = process.env.AGORA_APP_CERTIFICATE;

app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/rtc-token", (req, res) => {
  try {
    const { channelName, uid, expireSeconds = 3600, role = "publisher" } = req.body;

    if (!APP_ID || !APP_CERT) {
      return res.status(500).json({ error: "Server missing AGORA_APP_ID or AGORA_APP_CERTIFICATE" });
    }
    if (!channelName || typeof uid !== "number") {
      return res.status(400).json({ error: "channelName (string) and uid (number) are required" });
    }

    const agoraRole = role === "subscriber" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
    const now = Math.floor(Date.now() / 1000);
    const privilegeExpire = now + expireSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERT,
      channelName,
      uid,
      agoraRole,
      privilegeExpire
    );

    return res.json({ token, appId: APP_ID, expireAt: privilegeExpire });
  } catch (e) {
    return res.status(500).json({ error: e?.message ?? "token_error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Token server running on :${port}`));
