// app.js
// Frontend orchestrator — wires everything together

import { getHeygenSessionToken } from "./services/backendApi.js";
import { startHeygenSession, stopHeygenSession, hgSend } from "./services/heygenClient.js";
import { connectElevenLabs, disconnectElevenLabs, startMicrophone, stopMicrophone, unmuteMic, clearReconnectTimer } from "./services/elevenLabsClient.js";
import { showWayneLoading, setLoadingText, hideWayneLoading, resetWaynePanel, setWayneStatus } from "./panels/waynePanel.js";
import { clearTranscript } from "./panels/transcriptPanel.js";
import { initWorkspacePanel, renderMajorWorkspace } from "./panels/workspacePanel.js";
import { state, resetAudioState } from "./state/sessionState.js";

const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");
const majorSelect = document.getElementById("majorSelect");

// ===== TOKEN PREFETCH =====
async function prefetchToken() {
  try {
    const token = await getHeygenSessionToken();
    state.prefetchedToken = token;
    console.log("[App] Token pre-fetched and ready");
  } catch (e) {
    console.log("[App] Prefetch failed (will retry on Start): " + e.message);
    state.prefetchedToken = null;
  }
}

prefetchToken();

// Initialize workspace panel with default major
initWorkspacePanel();

// Update workspace when major changes
majorSelect.addEventListener("change", () => {
  renderMajorWorkspace(majorSelect.value);
});

// ===== START SESSION =====
startBtn.addEventListener("click", async () => {
  if (state.isStarting || state.sessionActive) return;

  state.isStarting = true;
  startBtn.disabled = true;
  stopBtn.style.display = "none";
  majorSelect.disabled = true;

  clearTranscript();
  resetAudioState();
  clearReconnectTimer();

  state.shouldReconnectEl = true;
  state.majorKey = majorSelect.value;

  showWayneLoading("Starting Wayne...");
  setWayneStatus("Starting session...");

  try {
    let sessionToken = state.prefetchedToken;
    state.prefetchedToken = null;

    if (!sessionToken) {
      setLoadingText("Getting session token...");
      sessionToken = await getHeygenSessionToken();
    } else {
      console.log("[App] Using pre-fetched token");
    }

    setLoadingText("Connecting avatar...");
    await startHeygenSession(sessionToken, () => {
      // onSpeakEnded callback
      state.isSpeaking = false;
      unmuteMic();
      hgSend({ type: "agent.start_listening" });
      setWayneStatus("Listening...");
    });

    setLoadingText("Connecting voice...");
    await Promise.all([
      startMicrophone(),
      connectElevenLabs(state.majorKey)
    ]);

    state.sessionActive = true;
    stopBtn.style.display = "inline-block";
    prefetchToken();

  } catch (error) {
    console.error("[App] Startup error:", error);
    setWayneStatus("Error: " + error.message);
    await cleanupSession();
    startBtn.disabled = false;
  } finally {
    state.isStarting = false;
    if (state.sessionActive) startBtn.disabled = true;
  }
});

// ===== STOP SESSION =====
stopBtn.addEventListener("click", async () => {
  if (state.isStopping) return;
  state.isStopping = true;
  startBtn.disabled = true;
  stopBtn.disabled = true;
  setWayneStatus("Ending session...");

  try {
    await cleanupSession();
    setWayneStatus("Session ended.");
    startBtn.disabled = false;
    stopBtn.style.display = "none";
  } finally {
    stopBtn.disabled = false;
    state.isStopping = false;
    state.isStarting = false;
  }
});

// ===== CLEANUP =====
async function cleanupSession() {
  state.shouldReconnectEl = false;
  clearReconnectTimer();
  disconnectElevenLabs();
  resetAudioState();
  stopMicrophone();
  await stopHeygenSession();
  resetWaynePanel();
  majorSelect.disabled = false;
  state.sessionActive = false;
}
