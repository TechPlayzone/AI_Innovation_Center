// panels/transcriptPanel.js
// Owns transcript rendering and display

const MAX_TRANSCRIPT_MESSAGES = 100;

export function addTranscriptMessage(role, text) {
  const transcriptEl = document.getElementById("transcript");
  if (!transcriptEl) return;

  transcriptEl.style.display = "block";
  const div = document.createElement("div");
  div.className = role === "user" ? "msg-user" : role === "agent" ? "msg-agent" : "msg-system";
  div.textContent = (role === "user" ? "You: " : role === "agent" ? "Wayne: " : "") + text;
  transcriptEl.appendChild(div);

  while (transcriptEl.children.length > MAX_TRANSCRIPT_MESSAGES) {
    transcriptEl.removeChild(transcriptEl.firstChild);
  }

  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

export function clearTranscript() {
  const transcriptEl = document.getElementById("transcript");
  if (transcriptEl) {
    transcriptEl.innerHTML = "";
    transcriptEl.style.display = "none";
  }
}

export function correctLastAgentMessage(text) {
  const transcriptEl = document.getElementById("transcript");
  if (!transcriptEl) return;
  const msgs = transcriptEl.querySelectorAll(".msg-agent");
  if (msgs.length > 0) msgs[msgs.length - 1].textContent = "Wayne: " + text;
}
