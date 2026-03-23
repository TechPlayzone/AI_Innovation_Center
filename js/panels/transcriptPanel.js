// panels/transcriptPanel.js v6.0
// Transcript with toggle on/off and export

const MAX_MESSAGES = 100;
let transcriptVisible = false;
let transcriptData = []; // store for export

export function initTranscriptPanel() {
  const toggle = document.getElementById("transcript-toggle");
  const toggleLabel = document.getElementById("transcript-toggle-label");
  const transcriptEl = document.getElementById("transcript");
  const exportBtn = document.getElementById("export-transcript-btn");

  toggle?.addEventListener("click", () => {
    transcriptVisible = !transcriptVisible;
    toggle.className = transcriptVisible ? "toggle-on" : "toggle-off";
    toggleLabel.textContent = transcriptVisible ? "Hide" : "Show";
    transcriptEl.style.display = transcriptVisible ? "block" : "none";
  });

  exportBtn?.addEventListener("click", () => {
    if (transcriptData.length === 0) return;
    const text = transcriptData.map(m => {
      const prefix = m.role === "user" ? "You" : m.role === "agent" ? "Wayne" : "System";
      return `[${prefix}]: ${m.text}`;
    }).join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wayne-transcript-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

export function addTranscriptMessage(role, text, clicked = false) {
  const transcriptEl = document.getElementById("transcript");
  if (!transcriptEl) return;

  transcriptData.push({ role, text });

  const div = document.createElement("div");
  div.className = role === "user" ? "msg-user" : role === "agent" ? "msg-agent" : "msg-system";
  if (clicked) div.classList.add("msg-clicked");
  div.textContent = (role === "user" ? "You: " : role === "agent" ? "Wayne: " : "") + text;
  transcriptEl.appendChild(div);

  while (transcriptEl.children.length > MAX_MESSAGES) {
    transcriptEl.removeChild(transcriptEl.firstChild);
  }

  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

export function clearTranscript() {
  const transcriptEl = document.getElementById("transcript");
  if (transcriptEl) transcriptEl.innerHTML = "";
  transcriptData = [];
}

export function correctLastAgentMessage(text) {
  const transcriptEl = document.getElementById("transcript");
  if (!transcriptEl) return;
  const msgs = transcriptEl.querySelectorAll(".msg-agent");
  if (msgs.length > 0) msgs[msgs.length - 1].textContent = "Wayne: " + text;
  // Update export data too
  const lastAgent = [...transcriptData].reverse().find(m => m.role === "agent");
  if (lastAgent) lastAgent.text = text;
}
