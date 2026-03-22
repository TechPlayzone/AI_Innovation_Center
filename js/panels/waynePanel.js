// panels/waynePanel.js
// Owns all Wayne avatar UI — video, loading overlay, status

export function initWaynePanel() {
  // Panel is initialized via HTML — nothing to bootstrap yet
}

export function showWayneLoading(text = "Starting Wayne...") {
  const overlay = document.getElementById("loading-overlay");
  const loadingText = document.getElementById("loading-text");
  if (overlay) overlay.classList.add("visible");
  if (loadingText) loadingText.textContent = text;
}

export function setLoadingText(text) {
  const loadingText = document.getElementById("loading-text");
  if (loadingText) loadingText.textContent = text;
}

export function hideWayneLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.classList.remove("visible");
}

export function clearAvatarMedia() {
  const container = document.getElementById("avatar-container");
  if (container) container.querySelectorAll("video").forEach(el => el.remove());
}

export function resetWaynePanel() {
  clearAvatarMedia();
  hideWayneLoading();
  document.querySelectorAll("audio").forEach(a => a.remove());
}

export function attachWayneMedia(room) {
  const container = document.getElementById("avatar-container");

  function attachTrack(track) {
    if (track.kind === "video") {
      clearAvatarMedia();
      const el = track.attach();
      hideWayneLoading();
      container.appendChild(el);
      console.log("[Wayne Panel] Video attached");
    }
    if (track.kind === "audio") {
      const audioEl = track.attach();
      audioEl.style.display = "none";
      document.body.appendChild(audioEl);
      console.log("[Wayne Panel] Audio attached");
    }
  }

  room.remoteParticipants.forEach((p) => {
    p.trackPublications.forEach((pub) => {
      if (pub.track) attachTrack(pub.track);
    });
  });

  room.on("trackSubscribed", (track) => attachTrack(track));
}

export function setWayneStatus(text) {
  const statusEl = document.getElementById("status");
  if (statusEl) statusEl.textContent = text;
}
