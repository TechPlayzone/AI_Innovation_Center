// services/heygenClient.js
// Frontend adapter for HeyGen LiveAvatar

import { LiveAvatarSession } from "https://cdn.jsdelivr.net/npm/@heygen/liveavatar-web-sdk/+esm";
import { attachWayneMedia } from "../panels/waynePanel.js";

let avatarSession = null;
let heygenWs = null;
let keepAliveInterval = null;

export function hgSend(data) {
  if (heygenWs && heygenWs.readyState === WebSocket.OPEN) {
    heygenWs.send(JSON.stringify(data));
  }
}

function findHeyGenWs(session) {
  if (session._sessionEventSocket instanceof WebSocket) return session._sessionEventSocket;
  for (const key of Object.keys(session)) {
    if (session[key] instanceof WebSocket) {
      console.log("[HeyGen Client] WS found at session." + key);
      return session[key];
    }
  }
  return null;
}

export async function startHeygenSession(sessionToken, onSpeakEnded) {
  avatarSession = new LiveAvatarSession(sessionToken, { voiceChat: false });
  await avatarSession.start();

  if (avatarSession.room) {
    attachWayneMedia(avatarSession.room);
  }

  heygenWs = findHeyGenWs(avatarSession);

  if (heygenWs) {
    heygenWs.addEventListener("message", (evt) => {
      try {
        const m = JSON.parse(evt.data);
        console.log("[HeyGen Client] event: " + m.type);
        if (m.type === "agent.speak_ended" && onSpeakEnded) {
          onSpeakEnded();
        }
      } catch (e) {}
    });
  } else {
    console.warn("[HeyGen Client] No WebSocket found — lip sync won't work");
  }

  keepAliveInterval = setInterval(() => hgSend({ type: "session.keep_alive" }), 20000);
  console.log("[HeyGen Client] Session started");
}

export async function stopHeygenSession() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
  if (avatarSession) {
    try { await avatarSession.stop(); } catch (e) {}
    avatarSession = null;
  }
  heygenWs = null;
}
