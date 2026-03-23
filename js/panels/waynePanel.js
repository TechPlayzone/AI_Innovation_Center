// panels/waynePanel.js
// Owns all Wayne avatar UI — video, loading overlay, splash screen, status

export function initWaynePanel() {
  // Panel initialized via HTML
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

export function hideSplash() {
  const splash = document.getElementById("wayne-splash");
  if (splash) splash.classList.add("hidden");
}

export function showSplash() {
  const splash = document.getElementById("wayne-splash");
  if (splash) splash.classList.remove("hidden");
}

export function clearAvatarMedia() {
  const container = document.getElementById("avatar-container");
  if (container) container.querySelectorAll("video").forEach(el => el.remove());
}

export function resetWaynePanel() {
  clearAvatarMedia();
  hideWayneLoading();
  showSplash();
  document.querySelectorAll("audio").forEach(a => a.remove());
}

export function attachWayneMedia(room) {
  const container = document.getElementById("avatar-container");

  function attachTrack(track) {
    if (track.kind === "video") {
      clearAvatarMedia();
      const el = track.attach();
      hideWayneLoading();
      hideSplash();  // Hide splash when live video starts
      container.appendChild(el);
      console.log("[Wayne Panel] Video attached — splash hidden");
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
