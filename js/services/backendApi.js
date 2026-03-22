// services/backendApi.js
// Frontend-safe entry point to all backend endpoints
// All API keys and secrets stay on the backend

const FIREBASE_TOKEN_URL = "https://getsessiontoken-s727ay3xwq-uc.a.run.app";

export async function getHeygenSessionToken() {
  const res = await fetch(FIREBASE_TOKEN_URL);
  const data = await res.json();
  const token = data.data?.session_token || data.session_token || null;
  if (!token) throw new Error("No HeyGen session token from backend.");
  return token;
}
