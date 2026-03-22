// utils/audioUtils.js
// Reusable audio conversion helpers

export function resamplePCM(int16Array, srcRate, dstRate) {
  if (srcRate === dstRate) return int16Array;
  const ratio = srcRate / dstRate;
  const newLen = Math.round(int16Array.length / ratio);
  const output = new Int16Array(newLen);
  for (let i = 0; i < newLen; i++) {
    const srcIdx = i * ratio;
    const idx = Math.floor(srcIdx);
    const frac = srcIdx - idx;
    const s0 = int16Array[idx] || 0;
    const s1 = int16Array[Math.min(idx + 1, int16Array.length - 1)] || 0;
    output[i] = Math.round(s0 + (s1 - s0) * frac);
  }
  return output;
}

export function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function bytesToBase64(uint8) {
  let binary = "";
  for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
  return btoa(binary);
}

export function base64ToInt16(b64) {
  return new Int16Array(base64ToBytes(b64).buffer);
}

export function int16ToBase64(int16) {
  return bytesToBase64(new Uint8Array(int16.buffer));
}
