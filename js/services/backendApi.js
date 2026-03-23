// services/backendApi.js
// Frontend-safe entry point to all backend endpoints
// All API keys and secrets stay on the backend

const FIREBASE_TOKEN_URL    = "https://getsessiontoken-s727ay3xwq-uc.a.run.app";
const FIREBASE_GENERATE_URL = "https://generatewithclaude-s727ay3xwq-uc.a.run.app";

export async function getHeygenSessionToken() {
  const res = await fetch(FIREBASE_TOKEN_URL);
  const data = await res.json();
  const token = data.data?.session_token || data.session_token || null;
  if (!token) throw new Error("No HeyGen session token from backend.");
  return token;
}

export async function generateWithClaude(messages, majorKey) {
  const res = await fetch(FIREBASE_GENERATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, majorKey })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Generation failed");
  }

  const data = await res.json();
  return data.text;
}
