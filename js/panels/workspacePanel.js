// panels/workspacePanel.js
// Owns the workspace panel — AI tools, use cases, suggested questions for each major

import { WORKSPACE_CONTENT } from "../config/workspaceContent.js";

export function initWorkspacePanel() {
  // Show general content by default
  renderMajorWorkspace("general");
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
