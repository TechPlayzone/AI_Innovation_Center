// panels/workspacePanel.js
// Owns the workspace panel — AI tools, use cases, suggested questions for each major

import { WORKSPACE_CONTENT } from "../config/workspaceContent.js";

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
          <li>🎤 <strong>Ask Wayne</strong> — suggested questions to get the most out of your conversation</li>
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
      <div class="workspace-section-title">🎤 Ask Wayne</div>
      <div class="suggested-questions">
        ${content.suggestedQuestions.map(q => `
          <div class="suggested-question" data-question="${q}">${q}</div>
        `).join("")}
      </div>
    </div>
  `;

  // Wire up suggested question clicks to status bar hint
  panel.querySelectorAll(".suggested-question").forEach(el => {
    el.addEventListener("click", () => {
      const statusEl = document.getElementById("status");
      if (statusEl) statusEl.textContent = `Try asking: "${el.dataset.question}"`;
    });
  });
}

export function clearWorkspace() {
  const panel = document.getElementById("workspace-panel");
  if (panel) panel.innerHTML = "";
}
