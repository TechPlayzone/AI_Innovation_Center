// panels/workspacePanel.js
// Owns the workspace panel — AI tools, use cases, suggested questions, generative input

import { WORKSPACE_CONTENT } from "../config/workspaceContent.js";
import { sendTextToWayne } from "../services/elevenLabsClient.js";
import { addTranscriptMessage } from "./transcriptPanel.js";
import { renderGenerativePanel } from "./generativePanel.js";
import { state } from "../state/sessionState.js";

export function initWorkspacePanel() {
  const panel = document.getElementById("workspace-panel");
  if (!panel) return;

  panel.innerHTML = `
    <div class="workspace-welcome">
      <div class="welcome-icon">🎓</div>
      <div class="welcome-title">Your AI Field Guide Workspace</div>
      <div class="welcome-body">
        <p>This panel is your personalized AI learning space. Here's what you'll find once you select your major:</p>
        <ul class="welcome-list">
          <li>🛠️ <strong>Key AI Tools</strong> — the top AI tools professionals in your field are using right now</li>
          <li>💡 <strong>Real-World Use Cases</strong> — how AI is actually being applied in your industry today</li>
          <li>🎤 <strong>Suggested Questions</strong> — click any question to have Wayne answer it out loud</li>
          <li>✨ <strong>Generative AI</strong> — type a question or upload a file and get an instant written response</li>
        </ul>
        <p class="welcome-hint">👆 Select your major from the dropdown above, then click <strong>Start Session</strong> to begin talking with Wayne.</p>
      </div>
    </div>
  `;
}

export function renderMajorWorkspace(majorKey) {
  const content = WORKSPACE_CONTENT[majorKey] || WORKSPACE_CONTENT.general;
  const panel = document.getElementById("workspace-panel");
  if (!panel) return;

  panel.innerHTML = `
    <div class="workspace-header">
      <span class="workspace-badge">${content.label}</span>
      <span class="workspace-title">AI in Your Field</span>
    </div>

    <div class="workspace-section">
      <div class="workspace-section-title">🛠️ Key AI Tools</div>
      <div class="tools-list">
        ${content.tools.map(t => `
          <div class="tool-card">
            <div class="tool-name">${t.name}</div>
            <div class="tool-desc">${t.desc}</div>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="workspace-section">
      <div class="workspace-section-title">💡 Real-World Use Cases</div>
      <ul class="use-cases-list">
        ${content.useCases.map(u => `<li>${u}</li>`).join("")}
      </ul>
    </div>

    <div class="workspace-section">
      <div class="workspace-section-title">🎤 Suggested Questions</div>
      <p class="ask-wayne-hint" id="ask-wayne-hint">Start a session to ask Wayne these questions out loud.</p>
      <div class="suggested-questions">
        ${content.suggestedQuestions.map(q => `
          <div class="suggested-question disabled" data-question="${q}">${q}</div>
        `).join("")}
      </div>
    </div>
  `;

  // Wire up suggested question clicks
  panel.querySelectorAll(".suggested-question").forEach(el => {
    el.addEventListener("click", () => {
      if (!state.sessionActive) return;
      sendTextToWayne(el.dataset.question);
      addTranscriptMessage("user", el.dataset.question, true);
      const statusEl = document.getElementById("status");
      if (statusEl) statusEl.textContent = `You asked: "${el.dataset.question}"`;
    });
  });

  // Add generative panel below
  renderGenerativePanel(panel);
}

export function enableSuggestedQuestions() {
  const hint = document.getElementById("ask-wayne-hint");
  if (hint) hint.textContent = "Click any question and Wayne will answer it out loud.";
  document.querySelectorAll(".suggested-question").forEach(el => {
    el.classList.remove("disabled");
  });
}

export function disableSuggestedQuestions() {
  const hint = document.getElementById("ask-wayne-hint");
  if (hint) hint.textContent = "Start a session to ask Wayne these questions out loud.";
  document.querySelectorAll(".suggested-question").forEach(el => {
    el.classList.add("disabled");
  });
}

export function clearWorkspace() {
  const panel = document.getElementById("workspace-panel");
  if (panel) panel.innerHTML = "";
}
